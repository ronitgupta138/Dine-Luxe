import { supabaseAdmin } from '../config/supabase';
import { sendPush, sendEmailNotification } from '../modules/notifications/notifications.service';

// ─── Run booking reminder ──────────────────────────────────────────────────────
export async function runBookingReminder(): Promise<void> {
  const now = new Date();
  const windowStart = new Date(now.getTime() + 50 * 60 * 1000).toISOString(); // +50 min
  const windowEnd = new Date(now.getTime() + 70 * 60 * 1000).toISOString();   // +70 min

  // FIX: 'party_size' → 'people_count'; removed non-existent reminder_sent column
  const { data: bookings, error } = await supabaseAdmin
    .from('bookings')
    .select('id, user_id, branch_id, arrival_time, people_count, branch:branches(name)')
    .eq('status', 'confirmed')
    .gte('arrival_time', windowStart)
    .lte('arrival_time', windowEnd);

  if (error) {
    console.error('[booking-reminder] Query error:', error.message);
    return;
  }

  if (!bookings?.length) {
    console.log('[booking-reminder] No upcoming bookings to remind.');
    return;
  }

  console.log(`[booking-reminder] Sending reminders for ${bookings.length} booking(s).`);

  for (const booking of bookings) {
    try {
      const arrivalTime = new Date(booking.arrival_time).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const branchName = Array.isArray(booking.branch)
        ? (booking.branch[0] as any)?.name
        : (booking.branch as any)?.name;

      // Send push notification — fire and forget
      sendPush(
        booking.user_id,
        'Booking Reminder',
        `Your table is reserved at ${branchName ?? 'the restaurant'} at ${arrivalTime}. See you soon!`,
        {
          type: 'booking_reminder',
          booking_id: booking.id,
          branch_id: booking.branch_id,
        }
      );

      // Send email — fire and forget
      sendEmailNotification(booking.user_id, 'booking-reminder', {
        booking_id: booking.id,
        branch_name: branchName ?? 'Restaurant',
        arrival_time: arrivalTime,
        party_size: booking.people_count,
      });

      console.log(`[booking-reminder] Reminder sent for booking ${booking.id}`);
    } catch (err: any) {
      console.error(`[booking-reminder] Failed for booking ${booking.id}:`, err.message);
    }
  }
}

// ─── Supabase Edge Function handler (Deno-compatible) ─────────────────────────
export default async function handler(_req: Request): Promise<Response> {
  try {
    await runBookingReminder();
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[booking-reminder] Fatal error:', err.message);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
