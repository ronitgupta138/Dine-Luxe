import { supabaseAdmin } from '../../config/supabase';
import { paginate } from '../../utils/pagination';
import { insertAuditLog } from '../../utils/audit-log';

export interface DeductItem {
  inventory_id?: string;
  inventory_item_id?: string;
  menu_item_id?: string;
  quantity: number;
}

type InventoryRow = {
  id: string;
  branch_id: string;
  ingredient_name: string;
  unit: string;
  current_quantity: number | string;
  reorder_threshold: number | string;
  cost_per_unit?: number | string | null;
  last_updated?: string;
  updated_by?: string | null;
};

function httpError(status: number, code: string, message: string) {
  return Object.assign(new Error(message), { status, code });
}

function normalizeInventoryItem(item: InventoryRow) {
  return {
    ...item,
    name: item.ingredient_name,
    quantity: Number(item.current_quantity),
    min_threshold: Number(item.reorder_threshold),
    cost_per_unit: item.cost_per_unit == null ? null : Number(item.cost_per_unit),
  };
}

export async function getInventoryByBranch(branchId: string, page: number, limit: number) {
  const { from, to } = paginate(page, limit);
  const { data, error, count } = await supabaseAdmin
    .from('inventory_items')
    .select('id, branch_id, ingredient_name, unit, current_quantity, reorder_threshold, cost_per_unit, last_updated', { count: 'exact' })
    .eq('branch_id', branchId)
    .order('ingredient_name')
    .range(from, to);

  if (error) throw error;
  return { data: (data ?? []).map(normalizeInventoryItem), count };
}

export async function createInventoryItem(
  payload: {
    branch_id: string;
    name: string;
    unit: string;
    quantity: number;
    min_threshold: number;
    cost_per_unit?: number;
  },
  userId: string
) {
  const { data, error } = await supabaseAdmin
    .from('inventory_items')
    .insert({
      branch_id: payload.branch_id,
      ingredient_name: payload.name,
      unit: payload.unit,
      current_quantity: payload.quantity,
      reorder_threshold: payload.min_threshold,
      cost_per_unit: payload.cost_per_unit,
      last_updated: new Date().toISOString(),
      updated_by: userId,
    })
    .select('id, branch_id, ingredient_name, unit, current_quantity, reorder_threshold, cost_per_unit, last_updated, updated_by')
    .single();

  if (error) throw error;
  await insertAuditLog({ action: 'inventory.create', targetType: 'inventory_item', targetId: data.id, actorId: userId, metadata: payload });
  return normalizeInventoryItem(data);
}

export async function updateInventoryItem(
  id: string,
  payload: {
    quantity?: number;
    min_threshold?: number;
    cost_per_unit?: number;
    current_quantity?: number;
    reorder_threshold?: number;
    unit?: string;
    notes?: string;
  },
  userId: string
) {
  const updatePayload: Record<string, unknown> = {
    last_updated: new Date().toISOString(),
    updated_by: userId,
  };

  if (payload.quantity !== undefined) updatePayload.current_quantity = payload.quantity;
  if (payload.current_quantity !== undefined) updatePayload.current_quantity = payload.current_quantity;
  if (payload.min_threshold !== undefined) updatePayload.reorder_threshold = payload.min_threshold;
  if (payload.reorder_threshold !== undefined) updatePayload.reorder_threshold = payload.reorder_threshold;
  if (payload.cost_per_unit !== undefined) updatePayload.cost_per_unit = payload.cost_per_unit;
  if (payload.unit !== undefined) updatePayload.unit = payload.unit;

  const { data, error } = await supabaseAdmin
    .from('inventory_items')
    .update(updatePayload)
    .eq('id', id)
    .select('id, branch_id, ingredient_name, unit, current_quantity, reorder_threshold, cost_per_unit, last_updated, updated_by')
    .single();

  if (error?.code === 'PGRST116') {
    throw httpError(404, 'INVENTORY_NOT_FOUND', 'Inventory item not found');
  }
  if (error) throw error;
  await insertAuditLog({ action: 'inventory.update', targetType: 'inventory_item', targetId: id, actorId: userId, metadata: payload });
  return normalizeInventoryItem(data);
}

async function deductInventoryItem(inventoryItemId: string, quantity: number, userId?: string) {
  const { data: item, error: fetchError } = await supabaseAdmin
    .from('inventory_items')
    .select('id, branch_id, ingredient_name, unit, current_quantity, reorder_threshold, cost_per_unit, last_updated, updated_by')
    .eq('id', inventoryItemId)
    .single();

  if (fetchError?.code === 'PGRST116') {
    throw httpError(404, 'INVENTORY_NOT_FOUND', 'Inventory item not found');
  }
  if (fetchError) throw fetchError;

  const currentQuantity = Number(item.current_quantity);
  if (quantity > currentQuantity) {
    throw httpError(
      400,
      'INSUFFICIENT_INVENTORY',
      `Cannot deduct ${quantity} ${item.unit} from ${item.ingredient_name}; only ${currentQuantity} ${item.unit} available.`
    );
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('inventory_items')
    .update({
      current_quantity: currentQuantity - quantity,
      last_updated: new Date().toISOString(),
      ...(userId ? { updated_by: userId } : {}),
    })
    .eq('id', inventoryItemId)
    .select('id, branch_id, ingredient_name, unit, current_quantity, reorder_threshold, cost_per_unit, last_updated, updated_by')
    .single();

  if (updateError) throw updateError;
  return normalizeInventoryItem(updated);
}

export async function deduct(branchId: string | undefined, items: DeductItem[], userId?: string) {
  const updatedItems: ReturnType<typeof normalizeInventoryItem>[] = [];
  const affectedBranchIds = new Set<string>();

  for (const item of items) {
    const directInventoryId = item.inventory_id ?? item.inventory_item_id;

    if (directInventoryId) {
      const updated = await deductInventoryItem(directInventoryId, item.quantity, userId);
      updatedItems.push(updated);
      affectedBranchIds.add(updated.branch_id);
      continue;
    }

    if (!item.menu_item_id || !branchId) {
      throw httpError(400, 'INVALID_DEDUCTION', 'inventory_id is required for direct inventory deductions.');
    }

    const { data: recipe, error: recipeErr } = await supabaseAdmin
      .from('recipe_ingredients')
      .select('inventory_item_id, quantity_per_serving')
      .eq('menu_item_id', item.menu_item_id);

    if (recipeErr) throw recipeErr;
    if (!recipe || recipe.length === 0) continue;

    for (const ingredient of recipe) {
      const deductQty = ingredient.quantity_per_serving * item.quantity;
      const updated = await deductInventoryItem(ingredient.inventory_item_id, deductQty, userId);
      updatedItems.push(updated);
      affectedBranchIds.add(updated.branch_id);
    }
  }

  for (const affectedBranchId of affectedBranchIds) {
    checkAndEmitLowStock(affectedBranchId).catch(err =>
      console.error('[inventory] checkAndEmitLowStock failed:', err.message)
    );
  }

  return { items: updatedItems };
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

  return withRatio.map(normalizeInventoryItem);
}

export async function logWaste(
  inventoryItemId: string,
  quantity: number,
  reason: string,
  userId: string
) {
  const updatedItem = await deductInventoryItem(inventoryItemId, quantity, userId);

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

  checkAndEmitLowStock(updatedItem.branch_id).catch(err =>
    console.error('[inventory] checkAndEmitLowStock failed:', err.message)
  );

  return { ...data, inventory_item: updatedItem };
}
