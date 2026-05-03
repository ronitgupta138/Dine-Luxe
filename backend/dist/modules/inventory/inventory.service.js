"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInventoryByBranch = getInventoryByBranch;
exports.updateInventoryItem = updateInventoryItem;
exports.deduct = deduct;
exports.getAlerts = getAlerts;
exports.logWaste = logWaste;
const supabase_1 = require("../../config/supabase");
const pagination_1 = require("../../utils/pagination");
const audit_log_1 = require("../../utils/audit-log");
// ─── Get inventory for a branch ───────────────────────────────────────────────
// FIX: inventory_items has ingredient_name + unit directly — no 'ingredients' join table
async function getInventoryByBranch(branchId, page, limit) {
    const { from, to } = (0, pagination_1.paginate)(page, limit);
    const { data, error, count } = await supabase_1.supabaseAdmin
        .from('inventory_items')
        .select('id, branch_id, ingredient_name, unit, current_quantity, reorder_threshold, cost_per_unit, last_updated', { count: 'exact' })
        .eq('branch_id', branchId)
        .order('ingredient_name')
        .range(from, to);
    if (error)
        throw error;
    return { data, count };
}
// ─── Update quantity or threshold ─────────────────────────────────────────────
// FIX: column is 'last_updated' not 'updated_at'
async function updateInventoryItem(id, payload, userId) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from('inventory_items')
        .update({ ...payload, last_updated: new Date().toISOString(), updated_by: userId })
        .eq('id', id)
        .select()
        .single();
    if (error)
        throw error;
    await (0, audit_log_1.insertAuditLog)({ action: 'inventory.update', targetType: 'inventory_item', targetId: id, actorId: userId, metadata: payload });
    return data;
}
// ─── Deduct inventory after order ─────────────────────────────────────────────
// FIX: recipe_ingredients uses 'inventory_item_id' (not 'ingredient_id') and 'quantity_per_serving' (not 'quantity_per_unit')
async function deduct(branchId, items) {
    for (const item of items) {
        const { data: recipe, error: recipeErr } = await supabase_1.supabaseAdmin
            .from('recipe_ingredients')
            .select('inventory_item_id, quantity_per_serving')
            .eq('menu_item_id', item.menu_item_id);
        if (recipeErr)
            throw recipeErr;
        if (!recipe || recipe.length === 0)
            continue;
        for (const ingredient of recipe) {
            const deductQty = ingredient.quantity_per_serving * item.quantity;
            const { error } = await supabase_1.supabaseAdmin.rpc('deduct_inventory', {
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
    checkAndEmitLowStock(branchId).catch(err => console.error('[inventory] checkAndEmitLowStock failed:', err.message));
}
// FIX: Remove invalid RPC filter — compare columns client-side
async function checkAndEmitLowStock(branchId) {
    const { data: allItems, error } = await supabase_1.supabaseAdmin
        .from('inventory_items')
        .select('id, ingredient_name, current_quantity, reorder_threshold')
        .eq('branch_id', branchId);
    if (error || !allItems?.length)
        return;
    const lowItems = allItems.filter((item) => Number(item.current_quantity) <= Number(item.reorder_threshold));
    if (!lowItems.length)
        return;
    await supabase_1.supabaseAdmin.channel(`manager:${branchId}`).send({
        type: 'broadcast',
        event: 'inventory_low',
        payload: { branch_id: branchId, items: lowItems },
    });
}
// ─── Get low-stock alerts ──────────────────────────────────────────────────────
// FIX: Remove invalid RPC filter — filter client-side after fetching
async function getAlerts(branchId) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from('inventory_items')
        .select('id, ingredient_name, unit, current_quantity, reorder_threshold')
        .eq('branch_id', branchId)
        .order('current_quantity');
    if (error)
        throw error;
    // Client-side filter + ratio sort
    const withRatio = (data ?? [])
        .filter((item) => Number(item.current_quantity) <= Number(item.reorder_threshold))
        .map((item) => ({
        ...item,
        stock_ratio: Number(item.reorder_threshold) > 0
            ? Number(item.current_quantity) / Number(item.reorder_threshold)
            : 0,
    }))
        .sort((a, b) => a.stock_ratio - b.stock_ratio);
    return withRatio;
}
// ─── Log waste ────────────────────────────────────────────────────────────────
// FIX: table is 'inventory_waste_logs', columns are 'inventory_item_id' and 'quantity_wasted'
async function logWaste(inventoryItemId, quantity, reason, userId, branchId) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from('inventory_waste_logs')
        .insert({
        inventory_item_id: inventoryItemId,
        quantity_wasted: quantity,
        reason,
        logged_by: userId,
    })
        .select()
        .single();
    if (error)
        throw error;
    // Also deduct from current stock
    await supabase_1.supabaseAdmin
        .from('inventory_items')
        .update({
        current_quantity: supabase_1.supabaseAdmin.rpc('subtract_quantity', {
            p_item_id: inventoryItemId,
            p_qty: quantity,
        }),
        last_updated: new Date().toISOString(),
        updated_by: userId,
    })
        .eq('id', inventoryItemId)
        .eq('branch_id', branchId);
    return data;
}
//# sourceMappingURL=inventory.service.js.map