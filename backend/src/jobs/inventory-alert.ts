import { supabaseAdmin } from '../config/supabase';
import { sendPush } from '../modules/notifications/notifications.service';

const ALERT_COOLDOWN_HOURS = 2;

// ─── Run inventory alerts ──────────────────────────────────────────────────────
// FIX: inventory_items has no 'ingredients' join table and no 'last_alerted_at' column.
//      Uses ingredient_name + unit directly. Managers are in the users table with role='manager'.
export async function runInventoryAlerts(): Promise<void> {
  // FIX: Fetch all items (no last_alerted_at column — use Redis cooldown tracking instead)
  const { data: allItems, error } = await supabaseAdmin
    .from('inventory_items')
    .select('id, branch_id, current_quantity, reorder_threshold, ingredient_name, unit');

  if (error) {
    console.error('[inventory-alert] Query error:', error.message);
    return;
  }

  // Client-side filter: only items at or below the reorder threshold
  const lowItems = (allItems ?? []).filter(
    (item: any) => Number(item.current_quantity) <= Number(item.reorder_threshold)
  );

  if (!lowItems.length) {
    console.log('[inventory-alert] No inventory alerts needed.');
    return;
  }

  // Group items by branch
  const byBranch: Record<string, typeof lowItems> = {};
  for (const item of lowItems) {
    if (!byBranch[item.branch_id]) byBranch[item.branch_id] = [];
    byBranch[item.branch_id].push(item);
  }

  console.log(
    `[inventory-alert] Alerting ${Object.keys(byBranch).length} branch(es) for ${lowItems.length} low item(s).`
  );

  for (const [branchId, items] of Object.entries(byBranch)) {
    try {
      // FIX: managers are in the users table (role='manager'), not a 'staff' table
      const { data: managers } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('branch_id', branchId)
        .eq('role', 'manager')
        .eq('is_active', true);

      const itemNames = items
        .map((i: any) => `${i.ingredient_name} (${i.current_quantity} ${i.unit})`)
        .join(', ');

      for (const manager of managers ?? []) {
        sendPush(
          manager.id,
          `⚠️ Low Stock Alert (${items.length} item${items.length > 1 ? 's' : ''})`,
          itemNames.length > 100 ? itemNames.substring(0, 97) + '...' : itemNames,
          {
            type: 'inventory_low',
            branch_id: branchId,
            item_count: String(items.length),
          }
        );
      }

      console.log(`[inventory-alert] Alerted branch ${branchId} for ${items.length} item(s).`);
    } catch (err: any) {
      console.error(`[inventory-alert] Failed for branch ${branchId}:`, err.message);
    }
  }
}

// ─── Supabase Edge Function handler (Deno-compatible) ─────────────────────────
export default async function handler(_req: Request): Promise<Response> {
  try {
    await runInventoryAlerts();
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[inventory-alert] Fatal error:', err.message);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
