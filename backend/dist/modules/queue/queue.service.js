"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinQueue = joinQueue;
exports.getBranchQueue = getBranchQueue;
exports.getQueuePosition = getQueuePosition;
exports.markQueueArrived = markQueueArrived;
exports.assignTable = assignTable;
exports.markQueueNoShow = markQueueNoShow;
exports.removeFromQueue = removeFromQueue;
const supabase_1 = require("../../config/supabase");
const pagination_1 = require("../../utils/pagination");
// ─── Broadcast helper (REST-based, works without a persistent WS connection) ──
async function broadcastToChannel(channel, event, payload) {
    await supabase_1.supabaseAdmin
        .channel(channel)
        .send({ type: 'broadcast', event, payload })
        .catch((err) => {
        // Non-fatal: log but don't crash the request
        console.warn(`[queue] broadcast failed on ${channel}:`, err.message);
    });
}
// ─── Join queue ───────────────────────────────────────────────────────────────
async function joinQueue(input) {
    // FIX: validate people_count is a positive integer (guard against bad callers)
    if (!Number.isInteger(input.people_count) || input.people_count < 1) {
        throw Object.assign(new Error('people_count must be a positive integer'), { statusCode: 400 });
    }
    // Get current max position for this branch
    const { data: lastEntry } = await supabase_1.supabaseAdmin
        .from('queue')
        .select('position')
        .eq('branch_id', input.branch_id)
        .in('status', ['waiting', 'arrived'])
        .order('position', { ascending: false })
        .limit(1)
        .maybeSingle();
    const nextPosition = (lastEntry?.position ?? 0) + 1;
    const { data, error } = await supabase_1.supabaseAdmin
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
    if (error)
        throw error;
    // FIX: use helper so broadcast errors are non-fatal
    await broadcastToChannel(`branch:${input.branch_id}`, 'queue_updated', {
        action: 'joined',
        queue_id: data.id,
        position: nextPosition,
    });
    return data;
}
// ─── Get full queue for branch ────────────────────────────────────────────────
async function getBranchQueue(branchId, query) {
    const { page, limit, offset } = (0, pagination_1.parsePagination)(query);
    const { data, error, count } = await supabase_1.supabaseAdmin
        .from('queue')
        .select('*, users(name, phone)', { count: 'exact' })
        .eq('branch_id', branchId)
        .in('status', ['waiting', 'arrived'])
        .order('position', { ascending: true })
        .range(offset, offset + limit - 1);
    if (error)
        throw error;
    return { data, total: count ?? 0, page, limit };
}
// ─── Get position + ETA ───────────────────────────────────────────────────────
async function getQueuePosition(queueId) {
    const { data: entry } = await supabase_1.supabaseAdmin
        .from('queue')
        .select('*')
        .eq('id', queueId)
        .single();
    if (!entry)
        throw Object.assign(new Error('Queue entry not found'), { statusCode: 404 });
    // Count entries ahead in queue
    const { count: entriesAhead } = await supabase_1.supabaseAdmin
        .from('queue')
        .select('id', { count: 'exact', head: true })
        .eq('branch_id', entry.branch_id)
        .in('status', ['waiting', 'arrived'])
        .lt('position', entry.position);
    // Count free tables
    const { count: freeTables } = await supabase_1.supabaseAdmin
        .from('tables')
        .select('id', { count: 'exact', head: true })
        .eq('branch_id', entry.branch_id)
        .eq('status', 'free');
    // Avg table turn time from last 10 completed bookings (seconds → minutes)
    const { data: recentBookings } = await supabase_1.supabaseAdmin
        .from('bookings')
        .select('seated_at, completed_at')
        .eq('branch_id', entry.branch_id)
        .eq('status', 'completed')
        .not('seated_at', 'is', null)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(10);
    let avgTurnTimeMinutes = 45; // sensible default
    if (recentBookings && recentBookings.length > 0) {
        const totalMs = recentBookings.reduce((acc, b) => {
            const diff = new Date(b.completed_at).getTime() - new Date(b.seated_at).getTime();
            return acc + (diff > 0 ? diff : 0); // FIX: ignore negative diffs (data anomalies)
        }, 0);
        const computed = Math.round(totalMs / recentBookings.length / 60000);
        // FIX: guard against zero turn-time (divide-by-zero / nonsense ETA)
        if (computed > 0)
            avgTurnTimeMinutes = computed;
    }
    // FIX: net waiting groups = groups ahead minus immediately available tables
    const netAhead = Math.max(0, (entriesAhead ?? 0) - (freeTables ?? 0));
    const estimatedWaitMinutes = netAhead * avgTurnTimeMinutes;
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
async function markQueueArrived(queueId) {
    // FIX: fetch first so we can validate current status before update
    const { data: existing } = await supabase_1.supabaseAdmin
        .from('queue')
        .select('id, status')
        .eq('id', queueId)
        .single();
    if (!existing)
        throw Object.assign(new Error('Queue entry not found'), { statusCode: 404 });
    if (existing.status === 'arrived') {
        throw Object.assign(new Error('Customer already marked as arrived'), { statusCode: 409 });
    }
    if (!['waiting'].includes(existing.status)) {
        throw Object.assign(new Error(`Cannot mark arrived from status "${existing.status}"`), { statusCode: 422 });
    }
    const { data, error } = await supabase_1.supabaseAdmin
        .from('queue')
        .update({ status: 'arrived', arrived_at: new Date().toISOString() })
        .eq('id', queueId)
        .select()
        .single();
    if (error)
        throw error;
    return data;
}
// ─── Assign table ─────────────────────────────────────────────────────────────
async function assignTable(queueId, tableId, hostId) {
    // Fetch queue entry
    const { data: entry } = await supabase_1.supabaseAdmin
        .from('queue')
        .select('*')
        .eq('id', queueId)
        .single();
    if (!entry)
        throw Object.assign(new Error('Queue entry not found'), { statusCode: 404 });
    if (entry.status === 'seated')
        throw Object.assign(new Error('Customer already seated'), { statusCode: 409 });
    // FIX: also block assigning to a removed/no_show entry
    if (!['waiting', 'arrived'].includes(entry.status)) {
        throw Object.assign(new Error(`Cannot assign table to a queue entry with status "${entry.status}"`), { statusCode: 422 });
    }
    // Check table is free
    const { data: table } = await supabase_1.supabaseAdmin
        .from('tables')
        .select('id, status, capacity')
        .eq('id', tableId)
        .single();
    if (!table)
        throw Object.assign(new Error('Table not found'), { statusCode: 404 });
    if (table.status !== 'free')
        throw Object.assign(new Error(`Table is currently ${table.status}`), { statusCode: 409 });
    if (table.capacity < entry.people_count)
        throw Object.assign(new Error('Table capacity too small'), { statusCode: 422 });
    // Use RPC for atomic: update queue + table + create booking
    const { data: result, error: rpcErr } = await supabase_1.supabaseAdmin.rpc('assign_queue_to_table', {
        p_queue_id: queueId,
        p_table_id: tableId,
        p_host_id: hostId,
    });
    if (rpcErr)
        throw rpcErr;
    // Recalculate queue positions after seating
    await recalculatePositions(entry.branch_id);
    await broadcastToChannel(`branch:${entry.branch_id}`, 'queue_updated', {
        action: 'seated',
        queue_id: queueId,
        table_id: tableId,
    });
    return result;
}
// ─── Mark no-show ─────────────────────────────────────────────────────────────
async function markQueueNoShow(queueId) {
    const { data: entry } = await supabase_1.supabaseAdmin
        .from('queue')
        .select('*')
        .eq('id', queueId)
        .single();
    if (!entry)
        throw Object.assign(new Error('Queue entry not found'), { statusCode: 404 });
    // FIX: .update() was not chained with .select() so the original returned { removed:true }
    // but nothing confirmed the update happened. Now we return the updated row.
    const { data, error } = await supabase_1.supabaseAdmin
        .from('queue')
        .update({ status: 'no_show', no_show_at: new Date().toISOString() })
        .eq('id', queueId)
        .select()
        .single();
    if (error)
        throw error;
    // Recalculate positions (no gaps)
    await recalculatePositions(entry.branch_id);
    await broadcastToChannel(`branch:${entry.branch_id}`, 'queue_updated', {
        action: 'no_show',
        queue_id: queueId,
    });
    // FIX: return the updated record, not a plain {removed:true}
    return data;
}
// ─── Remove from queue ────────────────────────────────────────────────────────
async function removeFromQueue(queueId) {
    const { data: entry } = await supabase_1.supabaseAdmin
        .from('queue')
        .select('branch_id, status')
        .eq('id', queueId)
        .single();
    if (!entry)
        throw Object.assign(new Error('Queue entry not found'), { statusCode: 404 });
    // FIX: don't allow removing an already-seated/no_show/removed entry silently
    if (['seated', 'no_show', 'removed'].includes(entry.status)) {
        throw Object.assign(new Error(`Queue entry is already "${entry.status}" — cannot remove again`), { statusCode: 409 });
    }
    const { error } = await supabase_1.supabaseAdmin
        .from('queue')
        .update({ status: 'removed', removed_at: new Date().toISOString() })
        .eq('id', queueId);
    if (error)
        throw error;
    await recalculatePositions(entry.branch_id);
    // FIX: broadcast the removal so clients update live
    await broadcastToChannel(`branch:${entry.branch_id}`, 'queue_updated', {
        action: 'removed',
        queue_id: queueId,
    });
    return { removed: true };
}
// ─── Recalculate queue positions (no gaps) ────────────────────────────────────
async function recalculatePositions(branchId) {
    const { data: activeQueue } = await supabase_1.supabaseAdmin
        .from('queue')
        .select('id')
        .eq('branch_id', branchId)
        .in('status', ['waiting', 'arrived'])
        .order('position', { ascending: true });
    if (!activeQueue || activeQueue.length === 0)
        return;
    // FIX: N+1 individual updates replaced with a single upsert batch
    const upsertPayload = activeQueue.map((entry, idx) => ({
        id: entry.id,
        position: idx + 1,
    }));
    const { error } = await supabase_1.supabaseAdmin
        .from('queue')
        .upsert(upsertPayload, { onConflict: 'id' });
    if (error) {
        // Log but don't crash – positions are cosmetic; seating is already committed
        console.warn('[queue] recalculatePositions upsert failed:', error.message);
    }
}
//# sourceMappingURL=queue.service.js.map