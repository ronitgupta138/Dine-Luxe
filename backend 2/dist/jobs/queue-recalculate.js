"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recalculateQueuePositions = recalculateQueuePositions;
exports.runQueueRecalculate = runQueueRecalculate;
exports.default = handler;
const supabase_1 = require("../config/supabase");
// ─── Recalculate queue positions for a branch ──────────────────────────────────
async function recalculateQueuePositions(branchId) {
    // Fetch all active queue entries ordered by created_at (FIFO)
    const { data: entries, error } = await supabase_1.supabaseAdmin
        .from('queue_entries')
        .select('id, user_id')
        .eq('branch_id', branchId)
        .in('status', ['waiting', 'arrived'])
        .order('created_at', { ascending: true });
    if (error) {
        console.error(`[queue-recalculate] Query error for branch ${branchId}:`, error.message);
        return;
    }
    if (!entries?.length)
        return;
    // Batch update with sequential positions 1, 2, 3...
    const updates = entries.map((entry, index) => ({
        id: entry.id,
        position: index + 1,
        updated_at: new Date().toISOString(),
    }));
    // Upsert all positions in a single query
    const { error: updateError } = await supabase_1.supabaseAdmin
        .from('queue_entries')
        .upsert(updates, { onConflict: 'id' });
    if (updateError) {
        console.error(`[queue-recalculate] Update error for branch ${branchId}:`, updateError.message);
        return;
    }
    // Notify each affected customer of their new position
    for (const entry of entries) {
        const position = updates.find((u) => u.id === entry.id)?.position;
        await supabase_1.supabaseAdmin.channel(`user:${entry.user_id}`).send({
            type: 'broadcast',
            event: 'queue_updated',
            payload: {
                branch_id: branchId,
                entry_id: entry.id,
                new_position: position,
            },
        });
    }
    console.log(`[queue-recalculate] Recalculated ${entries.length} positions for branch ${branchId}`);
}
// ─── Run for all active branches ──────────────────────────────────────────────
async function runQueueRecalculate() {
    // Find all branches with active queue entries
    const { data: activeBranches, error } = await supabase_1.supabaseAdmin
        .from('queue_entries')
        .select('branch_id')
        .in('status', ['waiting', 'arrived']);
    if (error) {
        console.error('[queue-recalculate] Failed to fetch active branches:', error.message);
        return;
    }
    const uniqueBranches = [...new Set((activeBranches ?? []).map((e) => e.branch_id))];
    await Promise.all(uniqueBranches.map((branchId) => recalculateQueuePositions(branchId)));
}
// ─── Supabase Edge Function handler (Deno-compatible) ─────────────────────────
async function handler(req) {
    try {
        const url = new URL(req.url);
        const branchId = url.searchParams.get('branch_id');
        if (branchId) {
            await recalculateQueuePositions(branchId);
        }
        else {
            await runQueueRecalculate();
        }
        return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    catch (err) {
        console.error('[queue-recalculate] Fatal error:', err.message);
        return new Response(JSON.stringify({ ok: false, error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
//# sourceMappingURL=queue-recalculate.js.map