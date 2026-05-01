import { supabaseAdmin } from '../config/supabase';
import { sendPush } from '../modules/notifications/notifications.service';

const ALERT_COOLDOWN_HOURS = 2;

// ─── Run inventory alerts ──────────────────────────────────────────────────────
export async function runInventoryAlerts(): Promise<void> {
  const cooldownCutoff = new Date(
    Date.now() - ALERT_COOLDOWN_HOURS * 60 * 60 * 1000
  ).toISOString();

  // Find items below reorder threshold that haven't been alerted recently
  const { data: lowItems, error } = await supabaseAdmin
    .from('inventory_items')
    .select(
      `
      id,
      branch_id,
      current_quantity,
      reorder_threshold,
      ingredient:ingredients(name, unit)
    `
    )
    .filter('current_quantity', 'lte', supabaseAdmin.rpc('get_reorder_threshold_col'))
    .or(`last_alerted_at.is.null,last_alerted_at.lt.${cooldownCutoff}`);

  if (error) {
    console.error('[inventory-alert] Query error:', error.message);
    return;
  }

  if (!lowItems?.length) {
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
      // Find branch managers
      const { data: managers } = await supabaseAdmin
        .from('staff')
        .select('user_id')
        .eq('branch_id', branchId)
        .eq('role', 'manager')
        .eq('is_active', true);

      const itemNames = items
        .map((i: any) => `${i.ingredient?.name ?? 'Unknown'} (${i.current_quantity} ${i.ingredient?.unit ?? ''})`)
        .join(', ');

      // Send one notification per manager for this branch
      for (const manager of managers ?? []) {
        sendPush(
          manager.user_id,
          `⚠️ Low Stock Alert (${items.length} item${items.length > 1 ? 's' : ''})`,
          itemNames.length > 100 ? itemNames.substring(0, 97) + '...' : itemNames,
          {
            type: 'inventory_low',
            branch_id: branchId,
            item_count: String(items.length),
          }
        );
      }

      // Update last_alerted_at for all alerted items in this batch
      const alertedIds = items.map((i: any) => i.id);
      await supabaseAdmin
        .from('inventory_items')
        .update({ last_alerted_at: new Date().toISOString() })
        .in('id', alertedIds);

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
