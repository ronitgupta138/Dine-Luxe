import { supabaseAdmin } from '../config/supabase';

/**
 * Finds the least busy active waiter for a branch using a weighted workload score.
 *
 * Score formula:
 *   active_tables × 3  +  active_orders × 1  +  pending_serves × 0.5
 *
 * Lower score = less busy = best candidate.
 *
 * @param branchId - The branch to find a waiter for
 * @returns The staff_id of the least busy waiter, or null if no waiters are available
 */
export async function findLeastBusyWaiter(branchId: string): Promise<string | null> {
  // Use a raw SQL query via Supabase RPC for the weighted score calculation
  const { data, error } = await supabaseAdmin.rpc('get_least_busy_waiter', {
    p_branch_id: branchId,
  });

  // Fallback: if RPC doesn't exist yet, query waiter_workload view directly
  if (error) {
    console.warn('[waiter-assign] RPC not found, falling back to view query:', error.message);

    const { data: fallback, error: fallbackErr } = await supabaseAdmin
      .from('waiter_workload')
      .select('staff_id, active_tables, active_orders, pending_serves')
      .eq('branch_id', branchId)
      .eq('is_active', true);

    if (fallbackErr || !fallback || fallback.length === 0) return null;

    // Calculate score client-side as fallback
    const scored = fallback
      .map(w => ({
        staff_id: w.staff_id,
        score: w.active_tables * 3 + w.active_orders * 1 + w.pending_serves * 0.5,
      }))
      .sort((a, b) => a.score - b.score);

    return scored[0]?.staff_id ?? null;
  }

  if (!data || data.length === 0) return null;

  return (data[0] as { staff_id: string }).staff_id;
}
