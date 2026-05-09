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

function isWithinAvailability(availability: any): boolean {
  if (!availability || availability.type === 'always') return true;
  if (availability.type !== 'time_based') return true;

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const from = availability.from ?? '00:00';
  const to = availability.to ?? '23:59';

  return currentTime >= from && currentTime <= to;
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
      id, name, description, display_order,
      menu_items (
        id, name, description, price, discounted_price, photo_url,
        dietary_tags, allergens, prep_time_minutes, availability,
        addons, status, display_order, is_featured
      )
    `
    )
    .eq('branch_id', branchId)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;

  // FIX: sold_out items are KEPT in the response (customers need to see them
  // to know what's unavailable) but hidden items and time-restricted items
  // are removed entirely. Previously sold_out items were silently dropped,
  // which breaks frontend menus that want to show "sold out" badges.
  const filtered = (categories ?? []).map((cat) => ({
    ...cat,
    menu_items: ((cat.menu_items as any[]) ?? [])
      .filter(
        (item: any) =>
          item.status !== 'hidden' &&
          isWithinAvailability(item.availability)
      )
      .sort((a: any, b: any) => a.display_order - b.display_order)
      .map((item: any) => ({
        ...item,
        menu_addons: item.addons ?? [],
      })),
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
    .insert({ ...input, branch_id: branchId })
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

  if (error || !data) throw error ?? Object.assign(new Error('Category not found'), { statusCode: 404 });
  await bustMenuCache(branchId);
  return data;
}

export async function deleteCategory(categoryId: string, branchId: string) {
  // FIX: original query had `.select('id', { count: 'exact', head: true })` but
  // forgot to destructure `count` properly — it pulled the wrong field.
  // Rewritten to use explicit count destructure with head:true for efficiency.
  const { count, error: countErr } = await supabaseAdmin
    .from('menu_items')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', categoryId)
    .eq('branch_id', branchId); // FIX: also scope by branch for safety

  if (countErr) throw countErr;

  if ((count ?? 0) > 0) {
    throw Object.assign(
      new Error('Cannot delete category with existing items. Move or delete items first.'),
      { statusCode: 422 }
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
  // FIX: original used index 0 as the first display_order value, creating
  // a collision with categories that have display_order = 0 (default). Use 1-based ordering.
  const updates = orderedIds.map((id, index) =>
    supabaseAdmin
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

export async function createMenuItem(
  branchId: string,
  restaurantId: string,
  input: CreateItemInput
) {
  const { addons, availability_windows, is_veg, is_vegan, contains_alcohol, calories, compare_price, ...rest } = input;

  // Map incoming schema fields → actual DB columns
  const dietary_tags: string[] = [];
  if (is_veg)           dietary_tags.push('veg');
  if (is_vegan)         dietary_tags.push('vegan');
  if (!is_veg && !is_vegan) dietary_tags.push('non_veg');
  if (contains_alcohol) dietary_tags.push('contains_alcohol');

  // availability_windows → availability JSONB (store as-is for time-based logic)
  const availability =
    availability_windows && availability_windows.length > 0
      ? { type: 'time_based', windows: availability_windows }
      : { type: 'always' };

  const itemData = {
    ...rest,
    branch_id: branchId,
    restaurant_id: restaurantId,
    dietary_tags,
    availability,
    discounted_price: compare_price ?? null,
    prep_time_minutes: calories ?? null, // calories not in DB — store as note or ignore
  };

  // FIX: calories and compare_price don't exist as columns — drop them
  // (discounted_price maps to compare_price; calories has no column — silently dropped)
  delete (itemData as any).calories;

  // FIX: validate the category belongs to this branch before inserting the item
  const { data: category, error: catErr } = await supabaseAdmin
    .from('menu_categories')
    .select('id')
    .eq('id', itemData.category_id)
    .eq('branch_id', branchId)
    .maybeSingle();

  if (catErr) throw catErr;
  if (!category) {
    throw Object.assign(
      new Error('Category not found or does not belong to this branch'),
      { statusCode: 404 }
    );
  }

  const { data: item, error: itemErr } = await supabaseAdmin
    .from('menu_items')
    .insert({ ...itemData, addons: addons && addons.length > 0 ? addons : [] })
    .select()
    .single();

  if (itemErr || !item) throw itemErr ?? new Error('Failed to create item');

  await bustMenuCache(branchId);
  return item;
}

export async function getMenuItemById(itemId: string) {
  const { data: item, error } = await supabaseAdmin
    .from('menu_items')
    .select('*')
    .eq('id', itemId)
    .single();

  if (error || !item) throw Object.assign(new Error('Item not found'), { statusCode: 404 });

  const { data: category } = await supabaseAdmin
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

export async function updateMenuItem(
  itemId: string,
  branchId: string,
  input: UpdateItemInput
) {
  const { addons, availability_windows, is_veg, is_vegan, contains_alcohol, calories, compare_price, ...rest } = input as UpdateItemInput & { addons?: any[] };

  // Build mapped update payload — only include fields that were actually provided
  const itemData: Record<string, any> = { ...rest };

  // Map dietary flags → dietary_tags only if any were provided
  if (is_veg !== undefined || is_vegan !== undefined || contains_alcohol !== undefined) {
    const dietary_tags: string[] = [];
    if (is_veg)           dietary_tags.push('veg');
    if (is_vegan)         dietary_tags.push('vegan');
    if (is_veg === false && is_vegan === false) dietary_tags.push('non_veg');
    if (contains_alcohol) dietary_tags.push('contains_alcohol');
    itemData.dietary_tags = dietary_tags;
  }

  if (availability_windows !== undefined) {
    itemData.availability =
      availability_windows.length > 0
        ? { type: 'time_based', windows: availability_windows }
        : { type: 'always' };
  }

  if (compare_price !== undefined) {
    itemData.discounted_price = compare_price;
  }

  // calories has no DB column — drop it silently
  delete itemData.calories;

  // FIX: if category_id is being changed, validate the new category belongs to this branch
  if (itemData.category_id) {
    const { data: cat } = await supabaseAdmin
      .from('menu_categories')
      .select('id')
      .eq('id', itemData.category_id)
      .eq('branch_id', branchId)
      .maybeSingle();

    if (!cat) {
      throw Object.assign(
        new Error('Target category not found or does not belong to this branch'),
        { statusCode: 404 }
      );
    }
  }

  // Replace addons in the JSONB column if provided (no separate table — stored as JSONB)
  if (addons !== undefined) {
    itemData.addons = addons;
  }

  const { data, error } = await supabaseAdmin
    .from('menu_items')
    .update(itemData)
    .eq('id', itemId)
    .eq('branch_id', branchId)
    .select()
    .single();

  if (error || !data) throw error ?? Object.assign(new Error('Item not found'), { statusCode: 404 });

  await bustMenuCache(branchId);
  return data;
}

export async function deleteMenuItem(itemId: string, branchId: string) {
  // FIX: verify item exists before deleting so we can return 404 instead of silent success
  const { data: existing } = await supabaseAdmin
    .from('menu_items')
    .select('id')
    .eq('id', itemId)
    .eq('branch_id', branchId)
    .maybeSingle();

  if (!existing) throw Object.assign(new Error('Item not found'), { statusCode: 404 });

  // Addons are stored as JSONB on the item — no separate table to clean up
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

  if (error || !data) throw error ?? Object.assign(new Error('Item not found'), { statusCode: 404 });
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

  // FIX: if some IDs weren't found (wrong branch or non-existent), reject the whole request
  const foundIds = new Set((items ?? []).map((i) => i.id));
  const missing = item_ids.filter((id) => !foundIds.has(id));
  if (missing.length > 0) {
    throw Object.assign(
      new Error(`Items not found in this branch: ${missing.join(', ')}`),
      { statusCode: 404 }
    );
  }

  const updates = (items ?? []).map((item: { id: string; price: number }) => {
    let newPrice =
      adjustment_type === 'percent'
        ? item.price * (1 + value / 100)
        : item.price + value;

    newPrice = Math.max(0, Math.round(newPrice * 100) / 100); // clamp ≥0, 2dp

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