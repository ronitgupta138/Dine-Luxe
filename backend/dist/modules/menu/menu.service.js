"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicMenu = getPublicMenu;
exports.getBranchCategories = getBranchCategories;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
exports.reorderCategories = reorderCategories;
exports.createMenuItem = createMenuItem;
exports.getMenuItemById = getMenuItemById;
exports.updateMenuItem = updateMenuItem;
exports.deleteMenuItem = deleteMenuItem;
exports.updateMenuItemStatus = updateMenuItemStatus;
exports.bulkPriceUpdate = bulkPriceUpdate;
const supabase_1 = require("../../config/supabase");
const redis_1 = require("../../config/redis");
const MENU_CACHE_TTL = 60 * 10; // 10 minutes
const menuCacheKey = (branchId) => `menu:${branchId}`;
// ─── Cache helpers ────────────────────────────────────────────────────────────
async function bustMenuCache(branchId) {
    await redis_1.redis.del(menuCacheKey(branchId));
}
function isWithinAvailability(availability) {
    if (!availability || availability.type === 'always')
        return true;
    if (availability.type !== 'time_based')
        return true;
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const from = availability.from ?? '00:00';
    const to = availability.to ?? '23:59';
    return currentTime >= from && currentTime <= to;
}
// ─── Public Menu (cached, filtered) ──────────────────────────────────────────
async function getPublicMenu(branchId) {
    const cacheKey = menuCacheKey(branchId);
    const cached = await redis_1.redis.get(cacheKey);
    if (cached)
        return JSON.parse(cached);
    const { data: categories, error } = await supabase_1.supabaseAdmin
        .from('menu_categories')
        .select(`
      id, name, description, display_order,
      menu_items (
        id, name, description, price, discounted_price, photo_url,
        dietary_tags, allergens, prep_time_minutes, availability,
        addons, status, display_order, is_featured
      )
    `)
        .eq('branch_id', branchId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });
    if (error)
        throw error;
    // FIX: sold_out items are KEPT in the response (customers need to see them
    // to know what's unavailable) but hidden items and time-restricted items
    // are removed entirely. Previously sold_out items were silently dropped,
    // which breaks frontend menus that want to show "sold out" badges.
    const filtered = (categories ?? []).map((cat) => ({
        ...cat,
        menu_items: (cat.menu_items ?? [])
            .filter((item) => item.status !== 'hidden' &&
            isWithinAvailability(item.availability))
            .sort((a, b) => a.display_order - b.display_order)
            .map((item) => ({
            ...item,
            menu_addons: item.addons ?? [],
        })),
    }));
    await redis_1.redis.setex(cacheKey, MENU_CACHE_TTL, JSON.stringify(filtered));
    return filtered;
}
// ─── Categories ───────────────────────────────────────────────────────────────
async function getBranchCategories(branchId) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from('menu_categories')
        .select('*')
        .eq('branch_id', branchId)
        .order('display_order', { ascending: true });
    if (error)
        throw error;
    return data ?? [];
}
async function createCategory(branchId, restaurantId, input) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from('menu_categories')
        .insert({ ...input, branch_id: branchId, restaurant_id: restaurantId })
        .select()
        .single();
    if (error)
        throw error;
    await bustMenuCache(branchId);
    return data;
}
async function updateCategory(categoryId, branchId, input) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from('menu_categories')
        .update(input)
        .eq('id', categoryId)
        .eq('branch_id', branchId)
        .select()
        .single();
    if (error || !data)
        throw error ?? Object.assign(new Error('Category not found'), { statusCode: 404 });
    await bustMenuCache(branchId);
    return data;
}
async function deleteCategory(categoryId, branchId) {
    // FIX: original query had `.select('id', { count: 'exact', head: true })` but
    // forgot to destructure `count` properly — it pulled the wrong field.
    // Rewritten to use explicit count destructure with head:true for efficiency.
    const { count, error: countErr } = await supabase_1.supabaseAdmin
        .from('menu_items')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', categoryId)
        .eq('branch_id', branchId); // FIX: also scope by branch for safety
    if (countErr)
        throw countErr;
    if ((count ?? 0) > 0) {
        throw Object.assign(new Error('Cannot delete category with existing items. Move or delete items first.'), { statusCode: 422 });
    }
    const { error } = await supabase_1.supabaseAdmin
        .from('menu_categories')
        .delete()
        .eq('id', categoryId)
        .eq('branch_id', branchId);
    if (error)
        throw error;
    await bustMenuCache(branchId);
    return { deleted: true };
}
async function reorderCategories(branchId, orderedIds) {
    // FIX: original used index 0 as the first display_order value, creating
    // a collision with categories that have display_order = 0 (default). Use 1-based ordering.
    const updates = orderedIds.map((id, index) => supabase_1.supabaseAdmin
        .from('menu_categories')
        .update({ display_order: index + 1 })
        .eq('id', id)
        .eq('branch_id', branchId) // FIX: scope to branch to prevent cross-branch writes
    );
    await Promise.all(updates);
    await bustMenuCache(branchId);
    return { reordered: orderedIds.length };
}
// ─── Items ────────────────────────────────────────────────────────────────────
async function createMenuItem(branchId, restaurantId, input) {
    const { addons, ...itemData } = input;
    // FIX: validate the category belongs to this branch before inserting the item
    const { data: category, error: catErr } = await supabase_1.supabaseAdmin
        .from('menu_categories')
        .select('id')
        .eq('id', itemData.category_id)
        .eq('branch_id', branchId)
        .maybeSingle();
    if (catErr)
        throw catErr;
    if (!category) {
        throw Object.assign(new Error('Category not found or does not belong to this branch'), { statusCode: 404 });
    }
    const { data: item, error: itemErr } = await supabase_1.supabaseAdmin
        .from('menu_items')
        .insert({ ...itemData, branch_id: branchId, restaurant_id: restaurantId })
        .select()
        .single();
    if (itemErr || !item)
        throw itemErr ?? new Error('Failed to create item');
    if (addons && addons.length > 0) {
        const addonPayload = addons.map((a) => ({ ...a, menu_item_id: item.id }));
        const { error: addonErr } = await supabase_1.supabaseAdmin.from('menu_addons').insert(addonPayload);
        if (addonErr)
            throw addonErr;
    }
    await bustMenuCache(branchId);
    return item;
}
async function getMenuItemById(itemId) {
    const { data: item, error } = await supabase_1.supabaseAdmin
        .from('menu_items')
        .select('*')
        .eq('id', itemId)
        .single();
    if (error || !item)
        throw Object.assign(new Error('Item not found'), { statusCode: 404 });
    const { data: category } = await supabase_1.supabaseAdmin
        .from('menu_categories')
        .select('name')
        .eq('id', item.category_id)
        .maybeSingle();
    return {
        ...item,
        menu_addons: item.addons ?? [],
        menu_categories: category ? { name: category.name } : null,
    };
}
async function updateMenuItem(itemId, branchId, input) {
    const { addons, ...itemData } = input;
    // FIX: if category_id is being changed, validate the new category belongs to this branch
    if (itemData.category_id) {
        const { data: cat } = await supabase_1.supabaseAdmin
            .from('menu_categories')
            .select('id')
            .eq('id', itemData.category_id)
            .eq('branch_id', branchId)
            .maybeSingle();
        if (!cat) {
            throw Object.assign(new Error('Target category not found or does not belong to this branch'), { statusCode: 404 });
        }
    }
    const { data, error } = await supabase_1.supabaseAdmin
        .from('menu_items')
        .update(itemData)
        .eq('id', itemId)
        .eq('branch_id', branchId)
        .select()
        .single();
    if (error || !data)
        throw error ?? Object.assign(new Error('Item not found'), { statusCode: 404 });
    // Replace addons if provided
    if (addons !== undefined) {
        await supabase_1.supabaseAdmin.from('menu_addons').delete().eq('menu_item_id', itemId);
        if (addons.length > 0) {
            await supabase_1.supabaseAdmin.from('menu_addons').insert(addons.map((a) => ({ ...a, menu_item_id: itemId })));
        }
    }
    await bustMenuCache(branchId);
    return data;
}
async function deleteMenuItem(itemId, branchId) {
    // FIX: verify item exists before deleting so we can return 404 instead of silent success
    const { data: existing } = await supabase_1.supabaseAdmin
        .from('menu_items')
        .select('id')
        .eq('id', itemId)
        .eq('branch_id', branchId)
        .maybeSingle();
    if (!existing)
        throw Object.assign(new Error('Item not found'), { statusCode: 404 });
    // FIX: delete associated addons first to avoid FK constraint errors
    await supabase_1.supabaseAdmin.from('menu_addons').delete().eq('menu_item_id', itemId);
    const { error } = await supabase_1.supabaseAdmin
        .from('menu_items')
        .delete()
        .eq('id', itemId)
        .eq('branch_id', branchId);
    if (error)
        throw error;
    await bustMenuCache(branchId);
    return { deleted: true };
}
async function updateMenuItemStatus(itemId, branchId, status) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from('menu_items')
        .update({ status })
        .eq('id', itemId)
        .eq('branch_id', branchId)
        .select()
        .single();
    if (error || !data)
        throw error ?? Object.assign(new Error('Item not found'), { statusCode: 404 });
    await bustMenuCache(branchId);
    return data;
}
async function bulkPriceUpdate(branchId, input) {
    const { item_ids, adjustment_type, value } = input;
    // Fetch current prices
    const { data: items, error: fetchErr } = await supabase_1.supabaseAdmin
        .from('menu_items')
        .select('id, price')
        .in('id', item_ids)
        .eq('branch_id', branchId);
    if (fetchErr)
        throw fetchErr;
    // FIX: if some IDs weren't found (wrong branch or non-existent), reject the whole request
    const foundIds = new Set((items ?? []).map((i) => i.id));
    const missing = item_ids.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
        throw Object.assign(new Error(`Items not found in this branch: ${missing.join(', ')}`), { statusCode: 404 });
    }
    const updates = (items ?? []).map((item) => {
        let newPrice = adjustment_type === 'percent'
            ? item.price * (1 + value / 100)
            : item.price + value;
        newPrice = Math.max(0, Math.round(newPrice * 100) / 100); // clamp ≥0, 2dp
        return supabase_1.supabaseAdmin
            .from('menu_items')
            .update({ price: newPrice })
            .eq('id', item.id)
            .eq('branch_id', branchId);
    });
    await Promise.all(updates);
    await bustMenuCache(branchId);
    return { updated: updates.length };
}
//# sourceMappingURL=menu.service.js.map