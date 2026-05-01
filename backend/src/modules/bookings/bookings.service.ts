import { supabaseAdmin } from '../../config/supabase';
import { redis } from '../../config/redis';
import { CreateBookingInput, CancelBookingInput } from './bookings.schema';
import { parsePagination } from '../../utils/pagination';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isWithinOperatingHours(arrivalTime: Date, operatingHours: Record<string, { open: string; close: string }>): boolean {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const day = days[arrivalTime.getDay()];
  const hours = operatingHours[day];
  if (!hours) return false;

  const [openH, openM] = hours.open.split(':').map(Number);
  const [closeH, closeM] = hours.close.split(':').map(Number);
  const arrivalMinutes = arrivalTime.getHours() * 60 + arrivalTime.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  return arrivalMinutes >= openMinutes && arrivalMinutes <= closeMinutes;
}

// ─── Create booking ───────────────────────────────────────────────────────────

export async function createBooking(input: CreateBookingInput, userId: string) {
  const arrivalTime = new Date(input.arrival_time);
  const now = new Date();

  // Must be at least 30 minutes in the future
  if (arrivalTime.getTime() - now.getTime() < 30 * 60 * 1000) {
    throw Object.assign(new Error('Booking must be at least 30 minutes in the future'), { statusCode: 422 });
  }

  // Fetch branch + operating hours
  const { data: branch } = await supabaseAdmin
    .from('branches')
    .select('id, operating_hours, restaurant_id')
    .eq('id', input.branch_id)
    .single();

  if (!branch) throw Object.assign(new Error('Branch not found'), { statusCode: 404 });

  if (branch.operating_hours && !isWithinOperatingHours(arrivalTime, branch.operating_hours)) {
    throw Object.assign(new Error('Arrival time is outside operating hours'), { statusCode: 422 });
  }

  let tableId = input.table_id;

  // Use a Supabase RPC function that wraps everything in SELECT FOR UPDATE to prevent double-booking
  if (tableId) {
    // Verify specific table is available
    const { data: tbl } = await supabaseAdmin
      .from('tables')
      .select('id, status, capacity')
      .eq('id', tableId)
      .eq('branch_id', input.branch_id)
      .single();

    if (!tbl) throw Object.assign(new Error('Table not found in this branch'), { statusCode: 404 });
    if (tbl.status !== 'free') throw Object.assign(new Error(`Table is currently ${tbl.status}`), { statusCode: 409 });
    if (tbl.capacity < input.people_count) throw Object.assign(new Error('Table capacity too small for party size'), { statusCode: 422 });
  } else {
    // Auto-select smallest fitting table
    const { data: tables } = await supabaseAdmin
      .from('tables')
      .select('id, capacity')
      .eq('branch_id', input.branch_id)
      .eq('status', 'free')
      .gte('capacity', input.people_count)
      .order('capacity', { ascending: true })
      .limit(1);

    if (!tables || tables.length === 0) {
      throw Object.assign(new Error('No available tables for the requested party size'), { statusCode: 409 });
    }
    tableId = tables[0].id;
  }

  // Create booking and update table — use RPC for atomicity + row locking
  const { data: booking, error: bookingErr } = await supabaseAdmin.rpc('create_booking_with_lock', {
    p_user_id: userId,
    p_branch_id: input.branch_id,
    p_table_id: tableId,
    p_people_count: input.people_count,
    p_arrival_time: input.arrival_time,
    p_special_requests: input.special_requests ?? null,
  });

  if (bookingErr) {
    if (bookingErr.message?.includes('already_reserved')) {
      throw Object.assign(new Error('Table was just reserved by another booking'), { statusCode: 409 });
    }
    throw bookingErr;
  }

  // Schedule reminder in Redis sorted set (score = reminder epoch in ms)
  const reminderTime = arrivalTime.getTime() - 60 * 60 * 1000; // 1 hour before
  await redis.zadd('booking_reminders', reminderTime, booking.id);

  // Push notifications / email — fire and forget
  supabaseAdmin.from('notifications').insert({
    user_id: userId,
    type: 'booking_confirmed',
    title: 'Booking Confirmed',
    body: `Your table is reserved for ${arrivalTime.toLocaleString()}`,
    data: { booking_id: booking.id },
  }).then(() => {});

  return booking;
}

// ─── Get booking by ID ────────────────────────────────────────────────────────

export async function getBookingById(bookingId: string, userId: string, role: string) {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select('*, tables(label, capacity), branches(name)')
    .eq('id', bookingId)
    .single();

  if (error || !data) throw Object.assign(new Error('Booking not found'), { statusCode: 404 });

  // Customers can only view their own bookings
  if (role === 'customer' && data.user_id !== userId) {
    throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
  }

  return data;
}

// ─── Get my bookings ──────────────────────────────────────────────────────────

export async function getMyBookings(userId: string, query: Record<string, string>) {
  const { page, limit, offset } = parsePagination(query);

  const { data, error, count } = await supabaseAdmin
    .from('bookings')
    .select('*, tables(label, capacity), branches(name)', { count: 'exact' })
    .eq('user_id', userId)
    .order('arrival_time', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { data, total: count ?? 0, page, limit };
}

// ─── Get branch bookings (today) ──────────────────────────────────────────────

export async function getBranchBookings(branchId: string, query: Record<string, string>) {
  const { page, limit, offset } = parsePagination(query);
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  const { data, error, count } = await supabaseAdmin
    .from('bookings')
    .select('*, tables(label), users(name, phone)', { count: 'exact' })
    .eq('branch_id', branchId)
    .gte('arrival_time', startOfDay)
    .lte('arrival_time', endOfDay)
    .order('arrival_time', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { data, total: count ?? 0, page, limit };
}

// ─── Cancel booking ───────────────────────────────────────────────────────────

export async function cancelBooking(bookingId: string, input: CancelBookingInput, userId: string, role: string) {
  const { data: booking } = await supabaseAdmin
    .from('bookings')
    .select('*, branches(cancellation_hours_before)')
    .eq('id', bookingId)
    .single();

  if (!booking) throw Object.assign(new Error('Booking not found'), { statusCode: 404 });

  if (role === 'customer' && booking.user_id !== userId) {
    throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
  }

  if (['cancelled', 'completed', 'no_show'].includes(booking.status)) {
    throw Object.assign(new Error(`Cannot cancel a booking that is already ${booking.status}`), { statusCode: 422 });
  }

  // Cancellation policy check (customers only)
  if (role === 'customer') {
    const hoursRequired = booking.branches?.cancellation_hours_before ?? 1;
    const hoursUntilArrival = (new Date(booking.arrival_time).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilArrival < hoursRequired) {
      throw Object.assign(
        new Error(`Cancellations must be made at least ${hoursRequired} hours before arrival`),
        { statusCode: 422 },
      );
    }
  }

  const { error } = await supabaseAdmin
    .from('bookings')
    .update({ status: 'cancelled', cancellation_reason: input.reason ?? null, cancelled_at: new Date().toISOString() })
    .eq('id', bookingId);

  if (error) throw error;

  // Release table to free
  if (booking.table_id) {
    await supabaseAdmin.from('tables').update({ status: 'free' }).eq('id', booking.table_id);
  }

  // Remove from reminder queue
  await redis.zrem('booking_reminders', bookingId);

  return { cancelled: true };
}

// ─── Mark arrived ─────────────────────────────────────────────────────────────

export async function markArrived(bookingId: string) {
  const { data: booking } = await supabaseAdmin
    .from('bookings')
    .select('id, status, branch_id')
    .eq('id', bookingId)
    .single();

  if (!booking) throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
  if (booking.status === 'arrived') throw Object.assign(new Error('Already marked as arrived'), { statusCode: 409 });

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .update({ status: 'arrived', arrived_at: new Date().toISOString() })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;

  // Emit realtime event
  await supabaseAdmin.channel(`branch:${booking.branch_id}`)
    .send({ type: 'broadcast', event: 'customer_arrived', payload: { booking_id: bookingId } });

  return data;
}

// ─── Mark seated ──────────────────────────────────────────────────────────────

export async function markSeated(bookingId: string) {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .update({ status: 'seated', seated_at: new Date().toISOString() })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;

  // Update table to occupied
  if (data.table_id) {
    await supabaseAdmin.from('tables').update({ status: 'occupied' }).eq('id', data.table_id);
  }

  return data;
}

// ─── Mark no-show ─────────────────────────────────────────────────────────────

export async function markNoShow(bookingId: string) {
  const { data: booking } = await supabaseAdmin
    .from('bookings')
    .select('id, table_id, status')
    .eq('id', bookingId)
    .single();

  if (!booking) throw Object.assign(new Error('Booking not found'), { statusCode: 404 });

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .update({ status: 'no_show' })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;

  // Release table
  if (booking.table_id) {
    await supabaseAdmin.from('tables').update({ status: 'free' }).eq('id', booking.table_id);
  }

  return data;
}
