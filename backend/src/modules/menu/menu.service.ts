import { supabaseAdmin } from '../../config/supabase';
import { redis } from '../../config/redis';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateItemInput,
  UpdateItemInput,
  BulkUpdateInput,
} from './menu.schema';

const MENU_CACHE_TTL = 60 * 10; // 10 minutes
const menuCacheKey = (branchId: string) => `menu:${branchId}`;

// ─── Cache helpers ────────────────────────────────────────────────────────────

async function bustMenuCache(branchId: string) {
  await redis.del(menuCacheKey(branchId));
}

function isWithinAvailabilityWindow(
  windows: { days: string[]; start_time: string; end_time: string }[]
): boolean {
  if (!windows || windows.length === 0) return true;

  const now = new Date();
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const currentDay = dayNames[now.getDay()];
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return windows.some(
    (w) =>
      w.days.includes(currentDay) &&
      currentTime >= w.start_time &&
      currentTime <= w.end_time
  );
}

// ─── Public Menu (cached, filtered) ──────────────────────────────────────────

export async function getPublicMenu(branchId: string) {
  const cacheKey = menuCacheKey(branchId);
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const { data: categories, error } = await supabaseAdmin
    .from('menu_categories')
    .select(
      `
      id, name, description, display_order, image_url,
      menu_items (
        id, name, description, price, compare_price, image_url,
        is_veg, is_vegan, contains_alcohol, allergens, calories,
        status, display_order, availability_windows,
        menu_addons ( id, name, price, is_required, max_quantity )
      )
    `
    )
    .eq('branch_id', branchId)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;

  // Filter hidden items and time-restricted items
  const filtered = (categories ?? []).map((cat) => ({
    ...cat,
    menu_items: ((cat.menu_items as any[]) ?? [])
      .filter(
        (item: any) =>
          item.status !== 'hidden' &&
          item.status !== 'sold_out' &&
          isWithinAvailabilityWindow(item.availability_windows ?? [])
      )
      .sort((a: any, b: any) => a.display_order - b.display_order),
  }));

  await redis.setex(cacheKey, MENU_CACHE_TTL, JSON.stringify(filtered));
  return filtered;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getBranchCategories(branchId: string) {
  const { data, error } = await supabaseAdmin
    .from('menu_categories')
    .select('*')
    .eq('branch_id', branchId)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createCategory(
  branchId: string,
  restaurantId: string,
  input: CreateCategoryInput
) {
  const { data, error } = await supabaseAdmin
    .from('menu_categories')
    .insert({ ...input, branch_id: branchId, restaurant_id: restaurantId })
    .select()
    .single();

  if (error) throw error;
  await bustMenuCache(branchId);
  return data;
}

export async function updateCategory(
  categoryId: string,
  branchId: string,
  input: UpdateCategoryInput
) {
  const { data, error } = await supabaseAdmin
    .from('menu_categories')
    .update(input)
    .eq('id', categoryId)
    .eq('branch_id', branchId)
    .select()
    .single();

  if (error || !data) throw error ?? Object.assign(new Error('Category not found'), { status: 404 });
  await bustMenuCache(branchId);
  return data;
}

export async function deleteCategory(categoryId: string, branchId: string) {
  // Check for items in this category
  const { count } = await supabaseAdmin
    .from('menu_items')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', categoryId);

  if (count && count > 0) {
    throw Object.assign(
      new Error('Cannot delete category with existing items. Move or delete items first.'),
      { status: 422 }
    );
  }

  const { error } = await supabaseAdmin
    .from('menu_categories')
    .delete()
    .eq('id', categoryId)
    .eq('branch_id', branchId);

  if (error) throw error;
  await bustMenuCache(branchId);
  return { deleted: true };
}

export async function reorderCategories(branchId: string, orderedIds: string[]) {
  const updates = orderedIds.map((id, index) =>
    supabaseAdmin
      .from('menu_categories')
      .update({ display_order: index })
      .eq('id', id)
      .eq('branch_id', branchId)
  );

  await Promise.all(updates);
  await bustMenuCache(branchId);
  return { reordered: orderedIds.length };
}

// ─── Items ────────────────────────────────────────────────────────────────────

export async function createMenuItem(
  branchId: string,
  restaurantId: string,
  input: CreateItemInput
) {
  const { addons, ...itemData } = input;

  const { data: item, error: itemErr } = await supabaseAdmin
    .from('menu_items')
    .insert({ ...itemData, branch_id: branchId, restaurant_id: restaurantId })
    .select()
    .single();

  if (itemErr || !item) throw itemErr ?? new Error('Failed to create item');

  if (addons && addons.length > 0) {
    const addonPayload = addons.map((a) => ({ ...a, menu_item_id: item.id }));
    const { error: addonErr } = await supabaseAdmin.from('menu_addons').insert(addonPayload);
    if (addonErr) throw addonErr;
  }

  await bustMenuCache(branchId);
  return item;
}

export async function getMenuItemById(itemId: string) {
  const { data, error } = await supabaseAdmin
    .from('menu_items')
    .select('*, menu_addons(*), menu_categories(name)')
    .eq('id', itemId)
    .single();

  if (error || !data) throw Object.assign(new Error('Item not found'), { status: 404 });
  return data;
}

export async function updateMenuItem(
  itemId: string,
  branchId: string,
  input: UpdateItemInput
) {
  const { addons, ...itemData } = input as UpdateItemInput & { addons?: any[] };

  const { data, error } = await supabaseAdmin
    .from('menu_items')
    .update(itemData)
    .eq('id', itemId)
    .eq('branch_id', branchId)
    .select()
    .single();

  if (error || !data) throw error ?? Object.assign(new Error('Item not found'), { status: 404 });

  // Replace addons if provided
  if (addons !== undefined) {
    await supabaseAdmin.from('menu_addons').delete().eq('menu_item_id', itemId);
    if (addons.length > 0) {
      await supabaseAdmin.from('menu_addons').insert(
        addons.map((a: any) => ({ ...a, menu_item_id: itemId }))
      );
    }
  }

  await bustMenuCache(branchId);
  return data;
}

export async function deleteMenuItem(itemId: string, branchId: string) {
  const { error } = await supabaseAdmin
    .from('menu_items')
    .delete()
    .eq('id', itemId)
    .eq('branch_id', branchId);

  if (error) throw error;
  await bustMenuCache(branchId);
  return { deleted: true };
}

export async function updateMenuItemStatus(
  itemId: string,
  branchId: string,
  status: 'available' | 'sold_out' | 'hidden'
) {
  const { data, error } = await supabaseAdmin
    .from('menu_items')
    .update({ status })
    .eq('id', itemId)
    .eq('branch_id', branchId)
    .select()
    .single();

  if (error || !data) throw error ?? Object.assign(new Error('Item not found'), { status: 404 });
  await bustMenuCache(branchId);
  return data;
}

export async function bulkPriceUpdate(branchId: string, input: BulkUpdateInput) {
  const { item_ids, adjustment_type, value } = input;

  // Fetch current prices
  const { data: items, error: fetchErr } = await supabaseAdmin
    .from('menu_items')
    .select('id, price')
    .in('id', item_ids)
    .eq('branch_id', branchId);

  if (fetchErr) throw fetchErr;

  const updates = (items ?? []).map((item: { id: string; price: number }) => {
    let newPrice =
      adjustment_type === 'percent'
        ? item.price * (1 + value / 100)
        : item.price + value;

    newPrice = Math.max(0, Math.round(newPrice * 100) / 100); // clamp to 0, 2 decimals

    return supabaseAdmin
      .from('menu_items')
      .update({ price: newPrice })
      .eq('id', item.id)
      .eq('branch_id', branchId);
  });

  await Promise.all(updates);
  await bustMenuCache(branchId);
  return { updated: updates.length };
}
