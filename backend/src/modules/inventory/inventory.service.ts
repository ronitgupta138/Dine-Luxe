import { supabaseAdmin } from '../../config/supabase';
import { redis } from '../../config/redis';
import { paginate } from '../../utils/pagination';
import { insertAuditLog } from '../../utils/audit-log';

export interface DeductItem {
  menu_item_id: string;
  quantity: number;
}

// ─── Get inventory for a branch ───────────────────────────────────────────────
export async function getInventoryByBranch(branchId: string, page: number, limit: number) {
  const { from, to } = paginate(page, limit);
  const { data, error, count } = await supabaseAdmin
    .from('inventory_items')
    .select('*, ingredient:ingredients(name, unit)', { count: 'exact' })
    .eq('branch_id', branchId)
    .order('ingredient(name)')
    .range(from, to);

  if (error) throw error;
  return { data, count };
}

// ─── Update quantity or threshold ─────────────────────────────────────────────
export async function updateInventoryItem(
  id: string,
  payload: { current_quantity?: number; reorder_threshold?: number; unit?: string },
  userId: string
) {
  const { data, error } = await supabaseAdmin
    .from('inventory_items')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  await insertAuditLog({ action: 'inventory.update', targetType: 'inventory_item', targetId: id, actorId: userId, metadata: payload });
  return data;
}

// ─── Deduct inventory after order ─────────────────────────────────────────────
export async function deduct(branchId: string, items: DeductItem[]) {
  for (const item of items) {
    // Look up recipe_ingredients for the menu item
    const { data: recipe, error: recipeErr } = await supabaseAdmin
      .from('recipe_ingredients')
      .select('ingredient_id, quantity_per_unit')
      .eq('menu_item_id', item.menu_item_id);

    if (recipeErr) throw recipeErr;
    if (!recipe || recipe.length === 0) continue;

    for (const ingredient of recipe) {
      const deductQty = ingredient.quantity_per_unit * item.quantity;

      const { error } = await supabaseAdmin.rpc('deduct_inventory', {
        p_branch_id: branchId,
        p_ingredient_id: ingredient.ingredient_id,
        p_quantity: deductQty,
      });

      if (error) throw error;
    }
  }

  // Check for low stock after batch deduction
  await checkAndEmitLowStock(branchId);
}

async function checkAndEmitLowStock(branchId: string) {
  const { data: lowItems, error } = await supabaseAdmin
    .from('inventory_items')
    .select('id, ingredient:ingredients(name), current_quantity, reorder_threshold')
    .eq('branch_id', branchId)
    .lte('current_quantity', supabaseAdmin.rpc('get_reorder_threshold'));

  if (error || !lowItems?.length) return;

  // Emit Supabase Realtime event to manager channel
  await supabaseAdmin.channel(`manager:${branchId}`).send({
    type: 'broadcast',
    event: 'inventory_low',
    payload: { branch_id: branchId, items: lowItems },
  });
}

// ─── Get low-stock alerts ──────────────────────────────────────────────────────
export async function getAlerts(branchId: string) {
  const { data, error } = await supabaseAdmin
    .from('inventory_items')
    .select('*, ingredient:ingredients(name, unit)')
    .eq('branch_id', branchId)
    .filter('current_quantity', 'lte', supabaseAdmin.rpc('get_reorder_threshold'))
    // Sort by ratio ASC (most critical first)
    .order('current_quantity');

  if (error) throw error;

  // Calculate ratio and sort
  const withRatio = (data ?? []).map((item: any) => ({
    ...item,
    stock_ratio: item.reorder_threshold > 0
      ? item.current_quantity / item.reorder_threshold
      : 0,
  })).sort((a: any, b: any) => a.stock_ratio - b.stock_ratio);

  return withRatio;
}

// ─── Log waste ────────────────────────────────────────────────────────────────
export async function logWaste(
  ingredientId: string,
  quantity: number,
  reason: string,
  userId: string,
  branchId: string
) {
  const { data, error } = await supabaseAdmin
    .from('waste_logs')
    .insert({
      ingredient_id: ingredientId,
      branch_id: branchId,
      quantity,
      reason,
      logged_by: userId,
      timestamp: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
