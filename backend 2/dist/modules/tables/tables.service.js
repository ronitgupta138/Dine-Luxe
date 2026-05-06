"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTablesByBranch = getTablesByBranch;
exports.createTable = createTable;
exports.updateTableStatus = updateTableStatus;
exports.mergeTables = mergeTables;
exports.deleteTable = deleteTable;
const supabase_1 = require("../../config/supabase");
const redis_1 = require("../../config/redis");
const tables_schema_1 = require("./tables.schema");
// ─── List tables ────────────────────────────────────────────────────────────
async function getTablesByBranch(branchId) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from('tables')
        .select('*')
        .eq('branch_id', branchId)
        .order('floor_number', { ascending: true })
        .order('label', { ascending: true });
    if (error)
        throw error;
    return data;
}
// ─── Create table ────────────────────────────────────────────────────────────
async function createTable(input) {
    // Ensure label is unique within branch
    const { data: existing } = await supabase_1.supabaseAdmin
        .from('tables')
        .select('id')
        .eq('branch_id', input.branch_id)
        .eq('label', input.label)
        .maybeSingle();
    if (existing) {
        throw Object.assign(new Error(`Label "${input.label}" already exists in this branch`), { statusCode: 409 });
    }
    const { data, error } = await supabase_1.supabaseAdmin
        .from('tables')
        .insert(input)
        .select()
        .single();
    if (error)
        throw error;
    return data;
}
// ─── Update table status (state machine) ─────────────────────────────────────
async function updateTableStatus(tableId, input, actorId) {
    const { data: table, error: fetchError } = await supabase_1.supabaseAdmin
        .from('tables')
        .select('id, status, branch_id')
        .eq('id', tableId)
        .single();
    if (fetchError || !table)
        throw Object.assign(new Error('Table not found'), { statusCode: 404 });
    const current = table.status;
    const allowed = tables_schema_1.VALID_TRANSITIONS[current];
    if (!allowed || !allowed.includes(input.new_status)) {
        throw Object.assign(new Error(`Invalid transition: ${current} → ${input.new_status}`), {
            statusCode: 422,
            meta: { current_status: current, allowed_transitions: allowed ?? [] },
        });
    }
    const { data, error } = await supabase_1.supabaseAdmin
        .from('tables')
        .update({ status: input.new_status, updated_at: new Date().toISOString() })
        .eq('id', tableId)
        .select()
        .single();
    if (error)
        throw error;
    // Emit realtime event
    try {
        await supabase_1.supabaseAdmin.channel(`branch:${table.branch_id}`).send({
            type: 'broadcast',
            event: 'table_status_changed',
            payload: {
                table_id: tableId,
                status: input.new_status,
                reason: input.reason,
            },
        });
    }
    catch (broadcastErr) {
        console.warn('[tables] broadcast failed:', broadcastErr.message);
    }
    // Invalidate live layout cache
    await redis_1.redis.del(`live_layout:${table.branch_id}`);
    return data;
}
// ─── Merge two tables ────────────────────────────────────────────────────────
async function mergeTables(input, actorId) {
    const { data: tables, error: fetchError } = await supabase_1.supabaseAdmin
        .from('tables')
        .select('id, status, branch_id, label')
        .in('id', [input.table_id_1, input.table_id_2]);
    if (fetchError || !tables || tables.length !== 2) {
        throw Object.assign(new Error('One or both tables not found'), { statusCode: 404 });
    }
    const [t1, t2] = tables;
    if (t1.branch_id !== t2.branch_id) {
        throw Object.assign(new Error('Tables must belong to the same branch'), { statusCode: 422 });
    }
    // Both tables must be free or reserved to be mergeable
    const allowedForMerge = ['free', 'reserved'];
    for (const t of [t1, t2]) {
        if (!allowedForMerge.includes(t.status)) {
            throw Object.assign(new Error(`Table ${t.label} is ${t.status} — only free/reserved tables can be merged`), { statusCode: 422 });
        }
    }
    // Insert merged record first
    const { data: merged, error: mergeError } = await supabase_1.supabaseAdmin
        .from('merged_tables')
        .insert({
        table_id_1: input.table_id_1,
        table_id_2: input.table_id_2,
        merged_by: actorId,
        branch_id: t1.branch_id,
    })
        .select()
        .single();
    if (mergeError)
        throw mergeError;
    // FIX: merged tables are effectively 'occupied' by the merge — setting them
    // to 'reserved' allowed them to be booked again or transition back to free
    // without going through unmerge logic first. Use 'occupied' to block that.
    const { error: updateError } = await supabase_1.supabaseAdmin
        .from('tables')
        .update({ status: 'occupied', merged_table_id: merged.id })
        .in('id', [input.table_id_1, input.table_id_2]);
    if (updateError) {
        // Rollback: delete the merged record we just created
        await supabase_1.supabaseAdmin.from('merged_tables').delete().eq('id', merged.id);
        throw updateError;
    }
    try {
        await supabase_1.supabaseAdmin.channel(`branch:${t1.branch_id}`).send({
            type: 'broadcast',
            event: 'tables_merged',
            payload: { merged_id: merged.id, table_ids: [input.table_id_1, input.table_id_2] },
        });
    }
    catch {
        // non-fatal
    }
    // Invalidate layout cache after merge
    await redis_1.redis.del(`live_layout:${t1.branch_id}`);
    return merged;
}
// ─── Delete table ────────────────────────────────────────────────────────────
async function deleteTable(tableId) {
    const { data: table } = await supabase_1.supabaseAdmin
        .from('tables')
        .select('status, branch_id')
        .eq('id', tableId)
        .single();
    if (!table)
        throw Object.assign(new Error('Table not found'), { statusCode: 404 });
    if (table.status === 'occupied') {
        throw Object.assign(new Error('Cannot delete an occupied table'), { statusCode: 422 });
    }
    // FIX: also block deleting tables that are part of an active merge
    const { data: activeMerge } = await supabase_1.supabaseAdmin
        .from('merged_tables')
        .select('id')
        .or(`table_id_1.eq.${tableId},table_id_2.eq.${tableId}`)
        .is('unmerged_at', null)
        .maybeSingle();
    if (activeMerge) {
        throw Object.assign(new Error('Cannot delete a table that is part of an active merge'), { statusCode: 422 });
    }
    const { error } = await supabase_1.supabaseAdmin.from('tables').delete().eq('id', tableId);
    if (error)
        throw error;
    // FIX: invalidate layout cache after deletion
    await redis_1.redis.del(`live_layout:${table.branch_id}`);
    // FIX: return confirmation object so controller can respond meaningfully
    return { deleted: true };
}
//# sourceMappingURL=tables.service.js.map