"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMenuSuggestions = getMenuSuggestions;
exports.getBundleOpportunities = getBundleOpportunities;
exports.getDemandForecast = getDemandForecast;
exports.getStaffingRecommendation = getStaffingRecommendation;
const supabase_1 = require("../../config/supabase");
// ─── Menu suggestions ─────────────────────────────────────────────────────────
// READ-ONLY: SELECT only
async function getMenuSuggestions(branchId) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    // Get all items with their 30-day order count
    const { data: items, error } = await supabase_1.supabaseAdmin.rpc('get_item_order_counts', {
        p_branch_id: branchId,
        p_since: thirtyDaysAgo,
    });
    if (error)
        throw error;
    if (!items?.length)
        return [];
    // BUG FIX: avgOrderCount would be NaN (division by zero) if items is somehow
    // empty after the length check — guard it. Also items.length is checked above
    // so this is an extra safety net for the divide.
    const totalOrders = items.reduce((sum, i) => sum + i.order_count, 0);
    const avgOrderCount = items.length > 0 ? totalOrders / items.length : 0;
    if (avgOrderCount === 0)
        return [];
    const slowSellers = items.filter((i) => i.order_count < avgOrderCount * 0.3);
    return slowSellers.map((item) => ({
        item_id: item.menu_item_id,
        item_name: item.item_name,
        order_count_30d: item.order_count,
        avg_order_count: Math.round(avgOrderCount),
        suggestion_type: 'promote_or_remove',
        suggestion_text: `"${item.item_name}" has only ${item.order_count} orders in 30 days (${Math.round((item.order_count / avgOrderCount) * 100)}% of average). Consider a promotion or removal.`,
        potential_revenue_impact: item.price * Math.round(avgOrderCount * 0.3),
    }));
}
// ─── Bundle opportunities ─────────────────────────────────────────────────────
// READ-ONLY: SELECT only
async function getBundleOpportunities(branchId) {
    // Co-order analysis: find items frequently ordered together
    const { data: pairs, error } = await supabase_1.supabaseAdmin.rpc('get_co_order_pairs', {
        p_branch_id: branchId,
        p_min_count: 10,
        p_limit: 5,
    });
    if (error)
        throw error;
    if (!pairs?.length)
        return [];
    return pairs.map((pair) => ({
        item_a_id: pair.item_a_id,
        item_a_name: pair.item_a_name,
        item_b_id: pair.item_b_id,
        item_b_name: pair.item_b_name,
        co_order_count: pair.co_orders,
        suggested_bundle_price: Math.round((pair.item_a_price + pair.item_b_price) * 0.9 * 100) / 100,
        discount_percent: 10,
    }));
}
// ─── Demand forecast ──────────────────────────────────────────────────────────
// READ-ONLY: SELECT only
async function getDemandForecast(branchId) {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    // GROUP orders by day_of_week + hour for last 90 days
    const { data: historical, error } = await supabase_1.supabaseAdmin.rpc('get_order_hourly_distribution', {
        p_branch_id: branchId,
        p_since: ninetyDaysAgo,
    });
    if (error)
        throw error;
    // Build day-of-week averages map: { 0: { 9: 12, 10: 15, ... }, ... }
    const avgByDayHour = {};
    for (const row of historical ?? []) {
        if (!avgByDayHour[row.day_of_week])
            avgByDayHour[row.day_of_week] = {};
        avgByDayHour[row.day_of_week][row.hour] = row.avg_orders;
    }
    // Project next 7 days
    const forecast = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
        const dayOfWeek = date.getDay();
        const dayData = avgByDayHour[dayOfWeek] ?? {};
        const predictedOrders = Math.round(Object.values(dayData).reduce((sum, v) => sum + v, 0));
        const dataPoints = historical?.filter((h) => h.day_of_week === dayOfWeek).length ?? 0;
        forecast.push({
            date: date.toISOString().split('T')[0],
            day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
            predicted_orders: predictedOrders,
            confidence: dataPoints >= 8 ? 'high' : dataPoints >= 4 ? 'medium' : 'low',
        });
    }
    return forecast;
}
// ─── Staffing recommendation ──────────────────────────────────────────────────
// READ-ONLY: SELECT only
async function getStaffingRecommendation(branchId) {
    const forecast = await getDemandForecast(branchId);
    // Get currently scheduled staff per day
    const { data: scheduled, error } = await supabase_1.supabaseAdmin.rpc('get_scheduled_staff', {
        p_branch_id: branchId,
    });
    if (error)
        throw error;
    const scheduledMap = {};
    for (const s of scheduled ?? []) {
        scheduledMap[s.date] = { waiters: s.waiter_count, chefs: s.chef_count };
    }
    return forecast.map((day) => {
        // BUG FIX: if predicted_orders is 0, Math.ceil(0/15) = 0 — that's correct,
        // but we should ensure we never recommend negative staffing. The original
        // code was fine here but adding explicit Math.max(1, ...) ensures at least
        // 1 of each is recommended even on very slow days.
        const recommendedWaiters = Math.max(1, Math.ceil(day.predicted_orders / 15));
        const recommendedChefs = Math.max(1, Math.ceil(day.predicted_orders / 20));
        const current = scheduledMap[day.date] ?? { waiters: 0, chefs: 0 };
        return {
            date: day.date,
            day: day.day,
            predicted_orders: day.predicted_orders,
            confidence: day.confidence,
            recommended_waiters: recommendedWaiters,
            recommended_chefs: recommendedChefs,
            scheduled_waiters: current.waiters,
            scheduled_chefs: current.chefs,
            waiter_gap: recommendedWaiters - current.waiters,
            chef_gap: recommendedChefs - current.chefs,
        };
    });
}
//# sourceMappingURL=analytics.service.js.map