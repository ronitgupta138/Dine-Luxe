import { supabaseAdmin } from '../../config/supabase';
import { paginate } from '../../utils/pagination';
import { insertAuditLog } from '../../utils/audit-log';

export interface DeductItem {
  menu_item_id: string;
  quantity: number;
}

// ─── Get inventory for a branch ───────────────────────────────────────────────
// FIX: inventory_items has ingredient_name + unit directly — no 'ingredients' join table
export async function getInventoryByBranch(branchId: string, page: number, limit: number) {
  const { from, to } = paginate(page, limit);
  const { data, error, count } = await supabaseAdmin
    .from('inventory_items')
    .select('id, branch_id, ingredient_name, unit, current_quantity, reorder_threshold, cost_per_unit, last_updated', { count: 'exact' })
    .eq('branch_id', branchId)
    .order('ingredient_name')
    .range(from, to);

  if (error) throw error;
  return { data, count };
}

// ─── Update quantity or threshold ─────────────────────────────────────────────
// FIX: column is 'last_updated' not 'updated_at'
export async function updateInventoryItem(
  id: string,
  payload: { current_quantity?: number; reorder_threshold?: number; unit?: string },
  userId: string
) {
  const { data, error } = await supabaseAdmin
    .from('inventory_items')
    .update({ ...payload, last_updated: new Date().toISOString(), updated_by: userId })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  await insertAuditLog({ action: 'inventory.update', targetType: 'inventory_item', targetId: id, actorId: userId, metadata: payload });
  return data;
}

// ─── Deduct inventory after order ─────────────────────────────────────────────
// FIX: recipe_ingredients uses 'inventory_item_id' (not 'ingredient_id') and 'quantity_per_serving' (not 'quantity_per_unit')
export async function deduct(branchId: string, items: DeductItem[]) {
  for (const item of items) {
    const { data: recipe, error: recipeErr } = await supabaseAdmin
      .from('recipe_ingredients')
      .select('inventory_item_id, quantity_per_serving')
      .eq('menu_item_id', item.menu_item_id);

    if (recipeErr) throw recipeErr;
    if (!recipe || recipe.length === 0) continue;

    for (const ingredient of recipe) {
      const deductQty = ingredient.quantity_per_serving * item.quantity;

      const { error } = await supabaseAdmin.rpc('deduct_inventory', {
        p_branch_id: branchId,
        p_inventory_item_id: ingredient.inventory_item_id,
        p_quantity: deductQty,
      });

      if (error) {
        console.error(`[inventory] deduct_inventory RPC failed for item ${ingredient.inventory_item_id}:`, error.message);
        // Don't throw — inventory deduction failure should not block order creation
      }
    }
  }

  // Check for low stock after batch deduction (fire-and-forget)
  checkAndEmitLowStock(branchId).catch(err =>
    console.error('[inventory] checkAndEmitLowStock failed:', err.message)
  );
}

// FIX: Remove invalid RPC filter — compare columns client-side
async function checkAndEmitLowStock(branchId: string) {
  const { data: allItems, error } = await supabaseAdmin
    .from('inventory_items')
    .select('id, ingredient_name, current_quantity, reorder_threshold')
    .eq('branch_id', branchId);

  if (error || !allItems?.length) return;

  const lowItems = allItems.filter(
    (item: any) => Number(item.current_quantity) <= Number(item.reorder_threshold)
  );

  if (!lowItems.length) return;

  await supabaseAdmin.channel(`manager:${branchId}`).send({
    type: 'broadcast',
    event: 'inventory_low',
    payload: { branch_id: branchId, items: lowItems },
  });
}

// ─── Get low-stock alerts ──────────────────────────────────────────────────────
// FIX: Remove invalid RPC filter — filter client-side after fetching
export async function getAlerts(branchId: string) {
  const { data, error } = await supabaseAdmin
    .from('inventory_items')
    .select('id, ingredient_name, unit, current_quantity, reorder_threshold')
    .eq('branch_id', branchId)
    .order('current_quantity');

  if (error) throw error;

  // Client-side filter + ratio sort
  const withRatio = (data ?? [])
    .filter((item: any) => Number(item.current_quantity) <= Number(item.reorder_threshold))
    .map((item: any) => ({
      ...item,
      stock_ratio: Number(item.reorder_threshold) > 0
        ? Number(item.current_quantity) / Number(item.reorder_threshold)
        : 0,
    }))
    .sort((a: any, b: any) => a.stock_ratio - b.stock_ratio);

  return withRatio;
}

// ─── Log waste ────────────────────────────────────────────────────────────────
// FIX: table is 'inventory_waste_logs', columns are 'inventory_item_id' and 'quantity_wasted'
export async function logWaste(
  inventoryItemId: string,
  quantity: number,
  reason: string,
  userId: string,
  branchId: string
) {
  const { data, error } = await supabaseAdmin
    .from('inventory_waste_logs')
    .insert({
      inventory_item_id: inventoryItemId,
      quantity_wasted: quantity,
      reason,
      logged_by: userId,
    })
    .select()
    .single();

  if (error) throw error;

  // Also deduct from current stock
  await supabaseAdmin
    .from('inventory_items')
    .update({
      current_quantity: supabaseAdmin.rpc('subtract_quantity', {
        p_item_id: inventoryItemId,
        p_qty: quantity,
      }) as any,
      last_updated: new Date().toISOString(),
      updated_by: userId,
    })
    .eq('id', inventoryItemId)
    .eq('branch_id', branchId);

  return data;
}
