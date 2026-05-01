import { supabaseAdmin } from '../../config/supabase';
import { parsePagination } from '../../utils/pagination';

// ─── Types ───────────────────────────────────────────────────────────────────

interface JoinQueueInput {
  branch_id: string;
  people_count: number;
  customer_name?: string;
  customer_phone?: string;
  user_id?: string;
}

// ─── Join queue ───────────────────────────────────────────────────────────────

export async function joinQueue(input: JoinQueueInput) {
  // Get current max position for this branch
  const { data: lastEntry } = await supabaseAdmin
    .from('queue')
    .select('position')
    .eq('branch_id', input.branch_id)
    .in('status', ['waiting', 'arrived'])
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = (lastEntry?.position ?? 0) + 1;

  const { data, error } = await supabaseAdmin
    .from('queue')
    .insert({
      branch_id: input.branch_id,
      user_id: input.user_id ?? null,
      people_count: input.people_count,
      customer_name: input.customer_name ?? null,
      customer_phone: input.customer_phone ?? null,
      position: nextPosition,
      status: 'waiting',
      joined_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  // Broadcast queue update to staff
  await supabaseAdmin.channel(`branch:${input.branch_id}`)
    .send({ type: 'broadcast', event: 'queue_updated', payload: { action: 'joined', queue_id: data.id, position: nextPosition } });

  return data;
}

// ─── Get full queue for branch ────────────────────────────────────────────────

export async function getBranchQueue(branchId: string, query: Record<string, string>) {
  const { page, limit, offset } = parsePagination(query);

  const { data, error, count } = await supabaseAdmin
    .from('queue')
    .select('*, users(name, phone)', { count: 'exact' })
    .eq('branch_id', branchId)
    .in('status', ['waiting', 'arrived'])
    .order('position', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { data, total: count ?? 0, page, limit };
}

// ─── Get position + ETA ───────────────────────────────────────────────────────

export async function getQueuePosition(queueId: string) {
  const { data: entry } = await supabaseAdmin
    .from('queue')
    .select('*')
    .eq('id', queueId)
    .single();

  if (!entry) throw Object.assign(new Error('Queue entry not found'), { statusCode: 404 });

  // Count entries ahead in queue
  const { count: entriesAhead } = await supabaseAdmin
    .from('queue')
    .select('id', { count: 'exact', head: true })
    .eq('branch_id', entry.branch_id)
    .in('status', ['waiting', 'arrived'])
    .lt('position', entry.position);

  // Count free tables
  const { count: freeTables } = await supabaseAdmin
    .from('tables')
    .select('id', { count: 'exact', head: true })
    .eq('branch_id', entry.branch_id)
    .eq('status', 'free');

  // Avg table turn time from last 10 completed bookings (seconds)
  const { data: recentBookings } = await supabaseAdmin
    .from('bookings')
    .select('seated_at, completed_at')
    .eq('branch_id', entry.branch_id)
    .eq('status', 'completed')
    .not('seated_at', 'is', null)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(10);

  let avgTurnTimeMinutes = 45; // default
  if (recentBookings && recentBookings.length > 0) {
    const totalMs = recentBookings.reduce((acc, b) => {
      return acc + (new Date(b.completed_at).getTime() - new Date(b.seated_at).getTime());
    }, 0);
    avgTurnTimeMinutes = Math.round(totalMs / recentBookings.length / 60000);
  }

  const positionAhead = (entriesAhead ?? 0) - (freeTables ?? 0);
  const estimatedWaitMinutes = Math.max(0, positionAhead) * avgTurnTimeMinutes;

  return {
    queue_id: queueId,
    position: entry.position,
    status: entry.status,
    people_count: entry.people_count,
    entries_ahead: entriesAhead ?? 0,
    free_tables: freeTables ?? 0,
    estimated_wait_minutes: estimatedWaitMinutes,
    avg_turn_time_minutes: avgTurnTimeMinutes,
  };
}

// ─── Mark arrived ─────────────────────────────────────────────────────────────

export async function markQueueArrived(queueId: string) {
  const { data, error } = await supabaseAdmin
    .from('queue')
    .update({ status: 'arrived', arrived_at: new Date().toISOString() })
    .eq('id', queueId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Assign table ─────────────────────────────────────────────────────────────

export async function assignTable(queueId: string, tableId: string, hostId: string) {
  // Fetch queue entry
  const { data: entry } = await supabaseAdmin
    .from('queue')
    .select('*')
    .eq('id', queueId)
    .single();

  if (!entry) throw Object.assign(new Error('Queue entry not found'), { statusCode: 404 });
  if (entry.status === 'seated') throw Object.assign(new Error('Customer already seated'), { statusCode: 409 });

  // Check table is free
  const { data: table } = await supabaseAdmin
    .from('tables')
    .select('id, status, capacity')
    .eq('id', tableId)
    .single();

  if (!table) throw Object.assign(new Error('Table not found'), { statusCode: 404 });
  if (table.status !== 'free') throw Object.assign(new Error(`Table is currently ${table.status}`), { statusCode: 409 });
  if (table.capacity < entry.people_count) throw Object.assign(new Error('Table capacity too small'), { statusCode: 422 });

  // Use RPC for atomic: update queue + table + create booking
  const { data: result, error: rpcErr } = await supabaseAdmin.rpc('assign_queue_to_table', {
    p_queue_id: queueId,
    p_table_id: tableId,
    p_host_id: hostId,
  });

  if (rpcErr) throw rpcErr;

  // Recalculate queue positions after seating
  await recalculatePositions(entry.branch_id);

  await supabaseAdmin.channel(`branch:${entry.branch_id}`)
    .send({ type: 'broadcast', event: 'queue_updated', payload: { action: 'seated', queue_id: queueId, table_id: tableId } });

  return result;
}

// ─── Mark no-show ─────────────────────────────────────────────────────────────

export async function markQueueNoShow(queueId: string) {
  const { data: entry } = await supabaseAdmin
    .from('queue')
    .select('*')
    .eq('id', queueId)
    .single();

  if (!entry) throw Object.assign(new Error('Queue entry not found'), { statusCode: 404 });

  const { error } = await supabaseAdmin
    .from('queue')
    .update({ status: 'no_show', no_show_at: new Date().toISOString() })
    .eq('id', queueId);

  if (error) throw error;

  // Recalculate positions (no gaps)
  await recalculatePositions(entry.branch_id);

  await supabaseAdmin.channel(`branch:${entry.branch_id}`)
    .send({ type: 'broadcast', event: 'queue_updated', payload: { action: 'no_show', queue_id: queueId } });

  return { removed: true };
}

// ─── Remove from queue ────────────────────────────────────────────────────────

export async function removeFromQueue(queueId: string) {
  const { data: entry } = await supabaseAdmin
    .from('queue')
    .select('branch_id')
    .eq('id', queueId)
    .single();

  if (!entry) throw Object.assign(new Error('Queue entry not found'), { statusCode: 404 });

  const { error } = await supabaseAdmin
    .from('queue')
    .update({ status: 'removed' })
    .eq('id', queueId);

  if (error) throw error;

  await recalculatePositions(entry.branch_id);
  return { removed: true };
}

// ─── Recalculate queue positions (no gaps) ────────────────────────────────────

async function recalculatePositions(branchId: string) {
  const { data: activeQueue } = await supabaseAdmin
    .from('queue')
    .select('id')
    .eq('branch_id', branchId)
    .in('status', ['waiting', 'arrived'])
    .order('position', { ascending: true });

  if (!activeQueue || activeQueue.length === 0) return;

  // Batch update positions to 1, 2, 3...
  const updates = activeQueue.map((entry, idx) =>
    supabaseAdmin.from('queue').update({ position: idx + 1 }).eq('id', entry.id)
  );

  await Promise.all(updates);
}
