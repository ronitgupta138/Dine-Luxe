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
export declare function findLeastBusyWaiter(branchId: string): Promise<string | null>;
//# sourceMappingURL=waiter-assign.d.ts.map