"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignDelivery = assignDelivery;
exports.getDelivery = getDelivery;
exports.updateDeliveryStatus = updateDeliveryStatus;
exports.updatePartnerLocation = updatePartnerLocation;
exports.getActiveDelivery = getActiveDelivery;
exports.getPartnerEarnings = getPartnerEarnings;
const supabase_1 = require("../../config/supabase");
const redis_1 = require("../../config/redis");
const ACCEPTANCE_TIMEOUT_SECONDS = 30;
const LOCATION_THROTTLE_SECONDS = 5;
// ─── Assign Delivery Partner ──────────────────────────────────────────────────
async function assignDelivery(orderId, branchId, restaurantId) {
    // Verify order exists and needs delivery
    const { data: order, error: orderErr } = await supabase_1.supabaseAdmin
        .from('orders')
        .select('id, status, order_type, branch_id')
        .eq('id', orderId)
        .eq('branch_id', branchId)
        .single();
    if (orderErr || !order)
        throw Object.assign(new Error('Order not found'), { status: 404 });
    if (order.order_type !== 'delivery') {
        throw Object.assign(new Error('Order is not a delivery order'), { status: 422 });
    }
    // Find nearest online partner without an active delivery using geo query
    // Partners must have last_location populated and status = 'online'
    // FIX: branches table uses 'lat'/'lon' columns, not 'current_lat'/'current_lon'
    const { data: branch } = await supabase_1.supabaseAdmin
        .from('branches')
        .select('lat, lon')
        .eq('id', branchId)
        .single();
    // TODO: Use PostGIS ST_Distance for accurate geo-based sorting
    // For now: pick first available online partner in the same area
    const { data: partners, error: partnerErr } = await supabase_1.supabaseAdmin
        .from('delivery_partners')
        .select('id, name')
        .eq('branch_id', branchId)
        .eq('is_online', true)
        .is('active_delivery_id', null)
        .limit(1);
    if (partnerErr)
        throw partnerErr;
    if (!partners || partners.length === 0) {
        throw Object.assign(new Error('No available delivery partners'), { status: 503 });
    }
    const partner = partners[0];
    // Create delivery record
    const { data: delivery, error: deliveryErr } = await supabase_1.supabaseAdmin
        .from('deliveries')
        .insert({
        order_id: orderId,
        branch_id: branchId,
        restaurant_id: restaurantId,
        partner_id: partner.id,
        status: 'assigned',
        assigned_at: new Date().toISOString(),
    })
        .select()
        .single();
    if (deliveryErr || !delivery)
        throw deliveryErr ?? new Error('Failed to create delivery');
    // Mark partner as having an active delivery
    await supabase_1.supabaseAdmin
        .from('delivery_partners')
        .update({ active_delivery_id: delivery.id })
        .eq('id', partner.id);
    // Start 30s acceptance timeout via Redis sorted set
    // Score = acceptance deadline (Unix timestamp)
    const deadline = Math.floor(Date.now() / 1000) + ACCEPTANCE_TIMEOUT_SECONDS;
    await redis_1.redis.zadd('delivery_acceptance_timeouts', deadline, delivery.id);
    return delivery;
}
// ─── Get Delivery ─────────────────────────────────────────────────────────────
async function getDelivery(deliveryId, partnerId) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from('deliveries')
        .select('*, orders(*, order_items(*, menu_items(name))), branches(name, address, lat, lon)')
        .eq('id', deliveryId)
        .eq('partner_id', partnerId)
        .single();
    if (error || !data)
        throw Object.assign(new Error('Delivery not found'), { status: 404 });
    return data;
}
// ─── Update Delivery Status ───────────────────────────────────────────────────
const VALID_TRANSITIONS = {
    assigned: ['accepted', 'rejected'],
    accepted: ['picked_up'],
    picked_up: ['delivered', 'failed'],
    delivered: [],
    failed: [],
    rejected: [],
};
async function updateDeliveryStatus(deliveryId, partnerId, newStatus) {
    const { data: delivery, error: fetchErr } = await supabase_1.supabaseAdmin
        .from('deliveries')
        .select('*, orders(id, branch_id, restaurant_id)')
        .eq('id', deliveryId)
        .eq('partner_id', partnerId)
        .single();
    if (fetchErr || !delivery)
        throw Object.assign(new Error('Delivery not found'), { status: 404 });
    const allowed = VALID_TRANSITIONS[delivery.status] ?? [];
    if (!allowed.includes(newStatus)) {
        throw Object.assign(new Error(`Invalid transition: ${delivery.status} → ${newStatus}`), { status: 422 });
    }
    const updatePayload = { status: newStatus };
    const now = new Date().toISOString();
    if (newStatus === 'accepted')
        updatePayload.accepted_at = now;
    if (newStatus === 'picked_up')
        updatePayload.picked_up_at = now;
    if (newStatus === 'delivered')
        updatePayload.delivered_at = now;
    const { data: updated, error: updateErr } = await supabase_1.supabaseAdmin
        .from('deliveries')
        .update(updatePayload)
        .eq('id', deliveryId)
        .select()
        .single();
    if (updateErr)
        throw updateErr;
    const order = delivery.orders;
    if (newStatus === 'delivered') {
        // Update order status to delivered
        await supabase_1.supabaseAdmin.from('orders').update({ status: 'delivered' }).eq('id', order.id);
        // Clear partner active delivery
        await supabase_1.supabaseAdmin
            .from('delivery_partners')
            .update({ active_delivery_id: null })
            .eq('id', partnerId);
        // TODO: trigger payment release if COD
        // TODO: queue rating request push notification (30min delay)
        console.log(`[delivery] TODO: trigger payment release and rating request for order ${order.id}`);
    }
    if (newStatus === 'rejected') {
        // Clear partner active delivery and re-assign
        await supabase_1.supabaseAdmin
            .from('delivery_partners')
            .update({ active_delivery_id: null })
            .eq('id', partnerId);
        // TODO: auto-reassign to next available partner
        console.log(`[delivery] TODO: reassign delivery ${deliveryId} after rejection`);
    }
    // Emit Realtime status update
    await supabase_1.supabaseAdmin.channel(`delivery:${deliveryId}`).send({
        type: 'broadcast',
        event: 'status_updated',
        payload: {
            delivery_id: deliveryId,
            status: newStatus,
            branch_id: order.branch_id,
            restaurant_id: order.restaurant_id,
            updated_at: now,
        },
    });
    return updated;
}
// ─── Update Partner Location ──────────────────────────────────────────────────
async function updatePartnerLocation(partnerId, lat, lon, deliveryId) {
    // Throttle to 1 update per 5s per partner
    const throttleKey = `loc_throttle:${partnerId}`;
    const isThrottled = await redis_1.redis.exists(throttleKey);
    if (isThrottled) {
        return { throttled: true, retry_after_seconds: LOCATION_THROTTLE_SECONDS };
    }
    // Set throttle key with TTL
    await redis_1.redis.setex(throttleKey, LOCATION_THROTTLE_SECONDS, '1');
    // Update partner location in DB
    const { error } = await supabase_1.supabaseAdmin
        .from('delivery_partners')
        .update({
        current_lat: lat, current_lon: lon,
    })
        .eq('id', partnerId);
    if (error)
        throw error;
    // Emit location update to delivery channel
    if (deliveryId) {
        await supabase_1.supabaseAdmin.channel(`delivery:${deliveryId}`).send({
            type: 'broadcast',
            event: 'location_update',
            payload: { partner_id: partnerId, lat, lon, delivery_id: deliveryId },
        });
    }
    return { updated: true, lat, lon };
}
// ─── Get Active Delivery for Partner ─────────────────────────────────────────
async function getActiveDelivery(partnerId) {
    // FIX: tables uses 'label' not 'table_number'
    const { data, error } = await supabase_1.supabaseAdmin
        .from('deliveries')
        .select('*, orders(*, tables(label)), branches(name, address)')
        .eq('partner_id', partnerId)
        .in('status', ['assigned', 'accepted', 'picked_up'])
        .order('assigned_at', { ascending: false })
        .limit(1)
        .maybeSingle();
    if (error)
        throw error;
    return data;
}
// ─── Get Partner Earnings ─────────────────────────────────────────────────────
async function getPartnerEarnings(partnerId) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from('deliveries')
        .select('id, delivered_at, earning')
        .eq('partner_id', partnerId)
        .eq('status', 'delivered')
        .order('delivered_at', { ascending: false });
    if (error)
        throw error;
    const total = (data ?? []).reduce((acc, d) => acc + (Number(d.earning) || 0), 0);
    return { deliveries: data ?? [], total_earnings: total };
}
//# sourceMappingURL=delivery.service.js.map