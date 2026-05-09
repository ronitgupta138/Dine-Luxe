import { supabaseAdmin } from '../../config/supabase';
import { redis } from '../../config/redis';
import {
  CreateTableInput,
  UpdateStatusInput,
  MergeInput,
  TableStatusType,
  VALID_TRANSITIONS,
} from './tables.schema';

// ─── List tables ────────────────────────────────────────────────────────────

export async function getTablesByBranch(branchId: string) {
  const { data, error } = await supabaseAdmin
    .from('tables')
    .select('*')
    .eq('branch_id', branchId)
    .order('floor_number', { ascending: true })
    .order('label', { ascending: true });

  if (error) throw error;
  return data;
}

// ─── Create table ────────────────────────────────────────────────────────────

export async function createTable(input: CreateTableInput) {
  // Ensure label is unique within branch
  const { data: existing } = await supabaseAdmin
    .from('tables')
    .select('id')
    .eq('branch_id', input.branch_id)
    .eq('label', input.label)
    .maybeSingle();

  if (existing) {
    throw Object.assign(
      new Error(`Label "${input.label}" already exists in this branch`),
      { statusCode: 409 },
    );
  }

  // BUG FIX: inserting raw `input` omits created_at/updated_at which are
  // NOT NULL in the schema — add timestamps explicitly.
  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('tables')
    .insert({ ...input, created_at: now, updated_at: now })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Update table status (state machine) ─────────────────────────────────────

export async function updateTableStatus(
  tableId: string,
  input: UpdateStatusInput,
  actorId: string,
) {
  const { data: table, error: fetchError } = await supabaseAdmin
    .from('tables')
    .select('id, status, branch_id')
    .eq('id', tableId)
    .single();

  if (fetchError || !table) throw Object.assign(new Error('Table not found'), { statusCode: 404 });

  const current = table.status as TableStatusType;
  const allowed = VALID_TRANSITIONS[current];

  if (!allowed || !allowed.includes(input.new_status)) {
    throw Object.assign(
      new Error(`Invalid transition: ${current} → ${input.new_status}`),
      {
        statusCode: 422,
        meta: { current_status: current, allowed_transitions: allowed ?? [] },
      },
    );
  }

  const { data, error } = await supabaseAdmin
    .from('tables')
    .update({ status: input.new_status, updated_at: new Date().toISOString() })
    .eq('id', tableId)
    .select()
    .single();

  if (error) throw error;

  // Emit realtime event
  try {
    await supabaseAdmin.channel(`branch:${table.branch_id}`).send({
      type: 'broadcast',
      event: 'table_status_changed',
      payload: {
        table_id: tableId,
        status: input.new_status,
        reason: input.reason,
      },
    });
  } catch (broadcastErr: any) {
    console.warn('[tables] broadcast failed:', broadcastErr.message);
  }

  // Invalidate live layout cache
  await redis.del(`live_layout:${table.branch_id}`);

  return data;
}

// ─── Merge two tables ────────────────────────────────────────────────────────

export async function mergeTables(input: MergeInput, actorId: string) {
  const { data: tables, error: fetchError } = await supabaseAdmin
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
  const allowedForMerge: TableStatusType[] = ['free', 'reserved'];
  for (const t of [t1, t2]) {
    if (!allowedForMerge.includes(t.status as TableStatusType)) {
      throw Object.assign(
        new Error(`Table ${t.label} is ${t.status} — only free/reserved tables can be merged`),
        { statusCode: 422 },
      );
    }
  }

  // Insert merged record first
  const { data: merged, error: mergeError } = await supabaseAdmin
    .from('merged_tables')
    .insert({
      table_id_1: input.table_id_1,
      table_id_2: input.table_id_2,
      merged_by: actorId,
      branch_id: t1.branch_id,
    })
    .select()
    .single();

  if (mergeError) throw mergeError;

  // FIX: merged tables are effectively 'occupied' by the merge — setting them
  // to 'reserved' allowed them to be booked again or transition back to free
  // without going through unmerge logic first. Use 'occupied' to block that.
  const { error: updateError } = await supabaseAdmin
    .from('tables')
    .update({ status: 'occupied', merged_table_id: merged.id })
    .in('id', [input.table_id_1, input.table_id_2]);

  if (updateError) {
    // Rollback: delete the merged record we just created
    await supabaseAdmin.from('merged_tables').delete().eq('id', merged.id);
    throw updateError;
  }

  try {
    await supabaseAdmin.channel(`branch:${t1.branch_id}`).send({
      type: 'broadcast',
      event: 'tables_merged',
      payload: { merged_id: merged.id, table_ids: [input.table_id_1, input.table_id_2] },
    });
  } catch {
    // non-fatal
  }

  // Invalidate layout cache after merge
  await redis.del(`live_layout:${t1.branch_id}`);

  return merged;
}

// ─── Delete table ────────────────────────────────────────────────────────────

export async function deleteTable(tableId: string) {
  const { data: table } = await supabaseAdmin
    .from('tables')
    .select('status, branch_id')
    .eq('id', tableId)
    .single();

  if (!table) throw Object.assign(new Error('Table not found'), { statusCode: 404 });
  if (table.status === 'occupied') {
    throw Object.assign(new Error('Cannot delete an occupied table'), { statusCode: 422 });
  }

  // FIX: also block deleting tables that are part of an active merge
  const { data: activeMerge } = await supabaseAdmin
    .from('merged_tables')
    .select('id')
    .or(`table_id_1.eq.${tableId},table_id_2.eq.${tableId}`)
    .is('unmerged_at', null)
    .maybeSingle();

  if (activeMerge) {
    throw Object.assign(
      new Error('Cannot delete a table that is part of an active merge'),
      { statusCode: 422 },
    );
  }

  const { error } = await supabaseAdmin.from('tables').delete().eq('id', tableId);
  if (error) throw error;

  // FIX: invalidate layout cache after deletion
  await redis.del(`live_layout:${table.branch_id}`);

  // FIX: return confirmation object so controller can respond meaningfully
  return { deleted: true };
}