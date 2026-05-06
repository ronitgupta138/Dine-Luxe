"use strict";
/**
 * Payments Service
 *
 * TODO markers indicate where real payment gateway integration goes.
 * Currently implements stub logic for development & testing.
 *
 * Gateway candidates: Razorpay (recommended for INR), Stripe (international)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiatePayment = initiatePayment;
exports.verifyPayment = verifyPayment;
exports.generateUPIQR = generateUPIQR;
exports.pollUPIStatus = pollUPIStatus;
exports.splitBill = splitBill;
exports.getReceipt = getReceipt;
exports.onPaymentComplete = onPaymentComplete;
exports.handleGatewayWebhook = handleGatewayWebhook;
const qrcode_1 = __importDefault(require("qrcode"));
const supabase_1 = require("../../config/supabase");
const redis_1 = require("../../config/redis");
// ─── Compute order total from order_items (orders table has no total_amount) ──
async function computeOrderTotal(orderId) {
    const { data: items } = await supabase_1.supabaseAdmin
        .from('order_items')
        .select('unit_price, quantity')
        .eq('order_id', orderId);
    return (items ?? []).reduce((sum, i) => sum + Number(i.unit_price) * Number(i.quantity), 0);
}
// ─── Initiate Payment ─────────────────────────────────────────────────────────
// FIX: payments table columns: order_id, amount, tax_amount, service_charge, discount_amount,
//      method (not payment_method), status, transaction_ref, gateway_order_id, gateway_payment_id,
//      receipt_url, coupon_id, split_details.
//      NO branch_id, NO restaurant_id on payments table.
async function initiatePayment(input, branchId, restaurantId) {
    const { order_id, payment_method } = input;
    // FIX: orders has no total_amount - fetch status + compute total from items
    const { data: order, error: orderErr } = await supabase_1.supabaseAdmin
        .from('orders')
        .select('id, status, branch_id')
        .eq('id', order_id)
        .eq('branch_id', branchId)
        .single();
    if (orderErr || !order) {
        throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    }
    if (order.status === 'paid') {
        throw Object.assign(new Error('Order is already paid'), { statusCode: 422 });
    }
    if (order.status === 'cancelled') {
        throw Object.assign(new Error('Cannot pay for a cancelled order'), { statusCode: 422 });
    }
    const amount = await computeOrderTotal(order_id);
    const gatewayOrderId = null; // TODO: replace with real gateway order ID
    // FIX: use correct column name 'method' not 'payment_method'; no branch_id/restaurant_id
    const { data: payment, error: payErr } = await supabase_1.supabaseAdmin
        .from('payments')
        .insert({
        order_id,
        amount,
        method: payment_method,
        status: 'pending',
        gateway_order_id: gatewayOrderId,
    })
        .select()
        .single();
    if (payErr || !payment)
        throw payErr ?? new Error('Failed to create payment record');
    // Cache branch + restaurant context in Redis for webhook lookup
    await redis_1.redis.setex(`payment_ctx:${payment.id}`, 3600, JSON.stringify({ branchId, restaurantId }));
    return {
        payment_id: payment.id,
        amount: payment.amount,
        status: 'pending',
        gateway_order_id: gatewayOrderId,
    };
}
// ─── Verify Payment ───────────────────────────────────────────────────────────
async function verifyPayment(input, branchId) {
    const { payment_id, status, gateway_payment_id, gateway_signature } = input;
    const { data: payment, error: fetchErr } = await supabase_1.supabaseAdmin
        .from('payments')
        .select('*, orders(branch_id)')
        .eq('id', payment_id)
        .single();
    if (fetchErr || !payment) {
        throw Object.assign(new Error('Payment not found'), { statusCode: 404 });
    }
    if (payment.orders.branch_id !== branchId) {
        throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    }
    // FIX: payments table has no gateway_signature or verified_at — store in transaction_ref
    const { data: updated, error: updateErr } = await supabase_1.supabaseAdmin
        .from('payments')
        .update({
        status,
        gateway_payment_id: gateway_payment_id ?? null,
        transaction_ref: gateway_signature ?? null,
    })
        .eq('id', payment_id)
        .select()
        .single();
    if (updateErr)
        throw updateErr;
    if (status === 'success') {
        const ctxRaw = await redis_1.redis.get(`payment_ctx:${payment_id}`);
        const ctx = ctxRaw ? JSON.parse(ctxRaw) : { branchId, restaurantId: '' };
        await onPaymentComplete(payment.order_id, ctx.branchId, ctx.restaurantId);
    }
    return updated;
}
// ─── Generate UPI QR ──────────────────────────────────────────────────────────
// FIX: orders has no total_amount and no join to restaurants
async function generateUPIQR(input, branchId) {
    const { order_id, amount: overrideAmount } = input;
    const { data: order, error } = await supabase_1.supabaseAdmin
        .from('orders')
        .select('id, status, branch_id')
        .eq('id', order_id)
        .eq('branch_id', branchId)
        .single();
    if (error || !order)
        throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    // Get restaurant via branch
    const { data: branch } = await supabase_1.supabaseAdmin
        .from('branches')
        .select('restaurant_id, restaurant_branding:restaurant_branding(app_name_display)')
        .eq('id', branchId)
        .single();
    const restaurantName = branch?.restaurant_branding?.[0]?.app_name_display ?? 'Restaurant';
    const amount = overrideAmount ?? (await computeOrderTotal(order_id));
    const transactionRef = `ROS-${order_id.split('-')[0].toUpperCase()}`;
    const description = `Payment for order ${transactionRef}`;
    // TODO: get real UPI ID from restaurant settings
    const upiId = process.env.DEFAULT_UPI_ID ?? 'restaurant@upi';
    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(restaurantName)}&am=${amount}&tr=${transactionRef}&tn=${encodeURIComponent(description)}&cu=INR`;
    const qrBase64 = await qrcode_1.default.toDataURL(upiLink, {
        type: 'image/png',
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
    });
    return {
        upi_link: upiLink,
        qr_base64: qrBase64,
        amount,
        transaction_ref: transactionRef,
        upi_id: upiId,
    };
}
// ─── Poll UPI Status ──────────────────────────────────────────────────────────
async function pollUPIStatus(transactionRef, branchId) {
    const redisKey = `upi_payment:${transactionRef}`;
    const testStatus = await redis_1.redis.get(redisKey);
    if (testStatus) {
        return { status: testStatus, ref: transactionRef, source: 'manual_test' };
    }
    return { status: 'pending', ref: transactionRef, source: 'poll' };
}
// ─── Split Bill ───────────────────────────────────────────────────────────────
// FIX: payments table has no branch_id, restaurant_id, or meta; uses 'method' not 'payment_method'
async function splitBill(input, branchId, restaurantId) {
    const { order_id, splits } = input;
    const totalSplit = splits.reduce((acc, s) => acc + s.amount, 0);
    const orderTotal = await computeOrderTotal(order_id);
    // Allow ±1 rupee rounding tolerance
    if (Math.abs(totalSplit - orderTotal) > 1) {
        throw Object.assign(new Error(`Split amounts (${totalSplit}) do not match order total (${orderTotal})`), { statusCode: 422 });
    }
    // Create individual payment stubs for each split; store split details in split_details JSON
    const paymentInserts = splits.map((s) => ({
        order_id,
        amount: s.amount,
        method: s.payment_method,
        status: 'pending',
        split_details: { label: s.label, is_split: true, total_parts: splits.length },
    }));
    const { data: payments, error: insertErr } = await supabase_1.supabaseAdmin
        .from('payments')
        .insert(paymentInserts)
        .select();
    if (insertErr)
        throw insertErr;
    // Cache context for each payment
    for (const p of payments ?? []) {
        await redis_1.redis.setex(`payment_ctx:${p.id}`, 3600, JSON.stringify({ branchId, restaurantId }));
    }
    return payments;
}
// ─── Get Receipt ─────────────────────────────────────────────────────────────
// FIX: orders has no join to restaurants; branches are separate
async function getReceipt(orderId, branchId) {
    const [orderRes, paymentsRes] = await Promise.all([
        supabase_1.supabaseAdmin
            .from('orders')
            .select('*, order_items(*, menu_items(name, price)), tables(label), branches(name, address)')
            .eq('id', orderId)
            .eq('branch_id', branchId)
            .single(),
        supabase_1.supabaseAdmin
            .from('payments')
            .select('id, amount, method, status, transaction_ref, gateway_payment_id, created_at')
            .eq('order_id', orderId),
    ]);
    if (orderRes.error || !orderRes.data) {
        throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    }
    const computedTotal = await computeOrderTotal(orderId);
    return {
        receipt_type: 'json',
        order_id: orderId,
        computed_total: computedTotal,
        data: orderRes.data,
        payments: paymentsRes.data ?? [],
    };
}
// ─── On Payment Complete (internal) ──────────────────────────────────────────
async function onPaymentComplete(orderId, branchId, restaurantId) {
    // 1. Mark order as paid
    await supabase_1.supabaseAdmin
        .from('orders')
        .update({ status: 'paid', paid_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', orderId);
    // 2. Update table status to 'cleaning'
    const { data: order } = await supabase_1.supabaseAdmin
        .from('orders')
        .select('table_id')
        .eq('id', orderId)
        .single();
    if (order?.table_id) {
        await supabase_1.supabaseAdmin
            .from('tables')
            .update({ status: 'cleaning', updated_at: new Date().toISOString() })
            .eq('id', order.table_id);
    }
    // 3. Emit 'payment_confirmed' Realtime event
    const payload = {
        event: 'payment_confirmed',
        order_id: orderId,
        branch_id: branchId,
        paid_at: new Date().toISOString(),
    };
    await supabase_1.supabaseAdmin.channel(`branch:${branchId}:cashier`).send({
        type: 'broadcast',
        event: 'payment_confirmed',
        payload,
    });
    await supabase_1.supabaseAdmin.channel(`branch:${branchId}:manager`).send({
        type: 'broadcast',
        event: 'payment_confirmed',
        payload,
    });
}
// ─── Webhook Handler ──────────────────────────────────────────────────────────
async function handleGatewayWebhook(body) {
    // TODO: Implement real webhook signature verification
    console.log('[webhook] Received gateway event:', body.event);
    return { received: true };
}
//# sourceMappingURL=payments.service.js.map