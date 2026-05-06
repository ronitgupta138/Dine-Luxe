import { supabaseAdmin } from '../../config/supabase';
import { redis } from '../../config/redis';
import { calculateDistance } from '../../utils/haversine';

const GEO_FENCE_RADIUS_METERS = Number(process.env.GEO_FENCE_RADIUS_METERS ?? 150);
const GEO_THROTTLE_TTL_SECONDS = 30;

export async function arrivalCheck(params: { lat: number; lon: number; bookingId: string }, userId: string) {
  const { lat, lon, bookingId } = params;

  // Throttle: skip if already checked this booking within 30s
  const throttleKey = `geo_check:${bookingId}`;
  const throttled = await redis.get(throttleKey);
  if (throttled) {
    return { throttled: true, retryAfterSeconds: await redis.ttl(throttleKey) };
  }

  // Set throttle
  await redis.set(throttleKey, '1', 'EX', GEO_THROTTLE_TTL_SECONDS);

  // Fetch booking → branch lat/lon + restaurant name
  const { data: booking, error: bookingErr } = await supabaseAdmin
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

  const branch = booking.branches as any;
  if (!branch?.lat || !branch?.lon) {
    throw Object.assign(new Error('Branch location data unavailable'), { statusCode: 422 });
  }

  const distance = calculateDistance(lat, lon, branch.lat, branch.lon);

  // Log proximity event for analytics
  supabaseAdmin.from('geo_proximity_events').insert({
    booking_id: bookingId,
    user_id: userId,
    branch_id: branch.id,
    customer_lat: lat,
    customer_lon: lon,
    distance_meters: Math.round(distance),
    within_fence: distance <= GEO_FENCE_RADIUS_METERS,
    recorded_at: new Date().toISOString(),
  }).then(() => {});

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
