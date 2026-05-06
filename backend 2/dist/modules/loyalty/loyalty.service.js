"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBalance = getBalance;
exports.earn = earn;
exports.redeem = redeem;
exports.getHistory = getHistory;
const supabase_1 = require("../../config/supabase");
const POINTS_PER_RUPEE = Number(process.env.LOYALTY_POINTS_PER_RUPEE ?? 0.1); // 1 pt per ₹10
const MIN_REDEEM_POINTS = Number(process.env.LOYALTY_MIN_REDEEM_POINTS ?? 100);
const RUPEES_PER_POINT = Number(process.env.LOYALTY_RUPEES_PER_POINT ?? 0.1); // ₹1 per 10 pts
// ─── Internal helper: get or create loyalty account ───────────────────────────
async function getOrCreateAccount(userId, restaurantId) {
    const { data: existing } = await supabase_1.supabaseAdmin
        .from('loyalty_accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId)
        .maybeSingle();
    if (existing)
        return existing;
    const { data: created, error } = await supabase_1.supabaseAdmin
        .from('loyalty_accounts')
        .insert({ user_id: userId, restaurant_id: restaurantId, points_balance: 0, total_earned: 0 })
        .select()
        .single();
    if (error)
        throw error;
    return created;
}
// ─── Get loyalty balance ───────────────────────────────────────────────────────
async function getBalance(userId) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from('loyalty_accounts')
        .select('restaurant_id, points_balance, total_earned')
        .eq('user_id', userId);
    if (error)
        throw error;
    const totalBalance = (data ?? []).reduce((sum, a) => sum + a.points_balance, 0);
    const totalEarned = (data ?? []).reduce((sum, a) => sum + a.total_earned, 0);
    return {
        user_id: userId,
        balance: totalBalance,
        total_earned: totalEarned,
        accounts: data ?? [],
    };
}
// ─── Earn points on order completion ──────────────────────────────────────────
async function earn(userId, orderId, amountPaid, restaurantId) {
    const pointsEarned = Math.floor(amountPaid * POINTS_PER_RUPEE);
    if (pointsEarned <= 0)
        return { points_earned: 0, new_balance: 0 };
    const account = await getOrCreateAccount(userId, restaurantId);
    // Insert transaction
    const { error: txErr } = await supabase_1.supabaseAdmin
        .from('loyalty_transactions')
        .insert({
        loyalty_account_id: account.id,
        points_change: pointsEarned,
        reason: 'order_purchase',
        reference_id: orderId,
    });
    if (txErr)
        throw txErr;
    // Update balance and total_earned
    const newBalance = account.points_balance + pointsEarned;
    const newTotalEarned = account.total_earned + pointsEarned;
    const { error: updateErr } = await supabase_1.supabaseAdmin
        .from('loyalty_accounts')
        .update({ points_balance: newBalance, total_earned: newTotalEarned })
        .eq('id', account.id);
    if (updateErr)
        throw updateErr;
    return { points_earned: pointsEarned, new_balance: newBalance };
}
// ─── Redeem points against an order ───────────────────────────────────────────
async function redeem(userId, orderId, pointsToRedeem, restaurantId) {
    if (!Number.isInteger(pointsToRedeem) || pointsToRedeem <= 0) {
        throw Object.assign(new Error('points_to_redeem must be a positive integer'), { statusCode: 400 });
    }
    if (pointsToRedeem < MIN_REDEEM_POINTS) {
        throw Object.assign(new Error(`Minimum redemption is ${MIN_REDEEM_POINTS} points`), { statusCode: 422 });
    }
    const account = await getOrCreateAccount(userId, restaurantId);
    if (account.points_balance < pointsToRedeem) {
        throw Object.assign(new Error(`Insufficient points. Balance: ${account.points_balance}, requested: ${pointsToRedeem}`), { statusCode: 422 });
    }
    const discountAmount = Math.round(pointsToRedeem * RUPEES_PER_POINT * 100) / 100;
    // Insert redemption transaction
    const { error: txErr } = await supabase_1.supabaseAdmin
        .from('loyalty_transactions')
        .insert({
        loyalty_account_id: account.id,
        points_change: -pointsToRedeem,
        reason: 'redeemed',
        reference_id: orderId,
    });
    if (txErr)
        throw txErr;
    // Decrement balance
    const newBalance = account.points_balance - pointsToRedeem;
    const { error: updateErr } = await supabase_1.supabaseAdmin
        .from('loyalty_accounts')
        .update({ points_balance: newBalance })
        .eq('id', account.id);
    if (updateErr)
        throw updateErr;
    // Apply discount to order
    const { error: orderErr } = await supabase_1.supabaseAdmin
        .from('orders')
        .update({ discount_amount: discountAmount })
        .eq('id', orderId)
        .eq('user_id', userId);
    if (orderErr)
        throw orderErr;
    return { discount_amount: discountAmount, new_balance: newBalance };
}
// ─── Get loyalty transaction history ──────────────────────────────────────────
async function getHistory(userId, page, limit) {
    // First get all account IDs for this user
    const { data: accounts, error: accErr } = await supabase_1.supabaseAdmin
        .from('loyalty_accounts')
        .select('id')
        .eq('user_id', userId);
    if (accErr)
        throw accErr;
    if (!accounts?.length)
        return { data: [], count: 0 };
    const accountIds = accounts.map((a) => a.id);
    const offset = (page - 1) * limit;
    const { data, error, count } = await supabase_1.supabaseAdmin
        .from('loyalty_transactions')
        .select('*', { count: 'exact' })
        .in('loyalty_account_id', accountIds)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    if (error)
        throw error;
    return { data: data ?? [], count: count ?? 0 };
}
//# sourceMappingURL=loyalty.service.js.map