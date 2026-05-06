"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runInventoryAlerts = runInventoryAlerts;
exports.default = handler;
const supabase_1 = require("../config/supabase");
const notifications_service_1 = require("../modules/notifications/notifications.service");
const ALERT_COOLDOWN_HOURS = 2;
// ─── Run inventory alerts ──────────────────────────────────────────────────────
// FIX: inventory_items has no 'ingredients' join table and no 'last_alerted_at' column.
//      Uses ingredient_name + unit directly. Managers are in the users table with role='manager'.
async function runInventoryAlerts() {
    // FIX: Fetch all items (no last_alerted_at column — use Redis cooldown tracking instead)
    const { data: allItems, error } = await supabase_1.supabaseAdmin
        .from('inventory_items')
        .select('id, branch_id, current_quantity, reorder_threshold, ingredient_name, unit');
    if (error) {
        console.error('[inventory-alert] Query error:', error.message);
        return;
    }
    // Client-side filter: only items at or below the reorder threshold
    const lowItems = (allItems ?? []).filter((item) => Number(item.current_quantity) <= Number(item.reorder_threshold));
    if (!lowItems.length) {
        console.log('[inventory-alert] No inventory alerts needed.');
        return;
    }
    // Group items by branch
    const byBranch = {};
    for (const item of lowItems) {
        if (!byBranch[item.branch_id])
            byBranch[item.branch_id] = [];
        byBranch[item.branch_id].push(item);
    }
    console.log(`[inventory-alert] Alerting ${Object.keys(byBranch).length} branch(es) for ${lowItems.length} low item(s).`);
    for (const [branchId, items] of Object.entries(byBranch)) {
        try {
            // FIX: managers are in the users table (role='manager'), not a 'staff' table
            const { data: managers } = await supabase_1.supabaseAdmin
                .from('users')
                .select('id')
                .eq('branch_id', branchId)
                .eq('role', 'manager')
                .eq('is_active', true);
            const itemNames = items
                .map((i) => `${i.ingredient_name} (${i.current_quantity} ${i.unit})`)
                .join(', ');
            for (const manager of managers ?? []) {
                (0, notifications_service_1.sendPush)(manager.id, `⚠️ Low Stock Alert (${items.length} item${items.length > 1 ? 's' : ''})`, itemNames.length > 100 ? itemNames.substring(0, 97) + '...' : itemNames, {
                    type: 'inventory_low',
                    branch_id: branchId,
                    item_count: String(items.length),
                });
            }
            console.log(`[inventory-alert] Alerted branch ${branchId} for ${items.length} item(s).`);
        }
        catch (err) {
            console.error(`[inventory-alert] Failed for branch ${branchId}:`, err.message);
        }
    }
}
// ─── Supabase Edge Function handler (Deno-compatible) ─────────────────────────
async function handler(_req) {
    try {
        await runInventoryAlerts();
        return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    catch (err) {
        console.error('[inventory-alert] Fatal error:', err.message);
        return new Response(JSON.stringify({ ok: false, error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
//# sourceMappingURL=inventory-alert.js.map