"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrivalCheck = arrivalCheck;
const supabase_1 = require("../../config/supabase");
const redis_1 = require("../../config/redis");
const haversine_1 = require("../../utils/haversine");
const GEO_FENCE_RADIUS_METERS = Number(process.env.GEO_FENCE_RADIUS_METERS ?? 150);
const GEO_THROTTLE_TTL_SECONDS = 30;
async function arrivalCheck(params, userId) {
    const { lat, lon, bookingId } = params;
    // Throttle: skip if already checked this booking within 30s
    const throttleKey = `geo_check:${bookingId}`;
    const throttled = await redis_1.redis.get(throttleKey);
    if (throttled) {
        return { throttled: true, retryAfterSeconds: await redis_1.redis.ttl(throttleKey) };
    }
    // Set throttle
    await redis_1.redis.set(throttleKey, '1', 'EX', GEO_THROTTLE_TTL_SECONDS);
    // Fetch booking → branch lat/lon + restaurant name
    const { data: booking, error: bookingErr } = await supabase_1.supabaseAdmin
        .from('bookings')
        .select(`
      id,
      user_id,
      status,
      branches(
        id,
        name,
        lat,
        lon,
        restaurants(name)
      )
    `)
        .eq('id', bookingId)
        .single();
    if (bookingErr || !booking) {
        throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
    }
    // Only the booking owner can use this
    if (booking.user_id !== userId) {
        throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    }
    const branch = booking.branches;
    if (!branch?.lat || !branch?.lon) {
        throw Object.assign(new Error('Branch location data unavailable'), { statusCode: 422 });
    }
    const distance = (0, haversine_1.calculateDistance)(lat, lon, branch.lat, branch.lon);
    // Log proximity event for analytics
    supabase_1.supabaseAdmin.from('geo_proximity_events').insert({
        booking_id: bookingId,
        user_id: userId,
        branch_id: branch.id,
        customer_lat: lat,
        customer_lon: lon,
        distance_meters: Math.round(distance),
        within_fence: distance <= GEO_FENCE_RADIUS_METERS,
        recorded_at: new Date().toISOString(),
    }).then(() => { });
    if (distance > GEO_FENCE_RADIUS_METERS) {
        return {
            shouldPrompt: false,
            within_fence: false,
            distance_meters: Math.round(distance),
            fence_radius_meters: GEO_FENCE_RADIUS_METERS,
        };
    }
    // Within fence — should we prompt for check-in?
    const shouldPrompt = booking.status !== 'arrived';
    return {
        shouldPrompt,
        within_fence: true,
        distance_meters: Math.round(distance),
        fence_radius_meters: GEO_FENCE_RADIUS_METERS,
        restaurant_name: branch.restaurants?.name ?? branch.name,
        booking_status: booking.status,
    };
}
//# sourceMappingURL=geo.service.js.map