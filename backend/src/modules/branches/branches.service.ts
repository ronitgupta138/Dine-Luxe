import { supabaseAdmin } from '../../config/supabase';
import {
  CreateBranchInput,
  UpdateBranchInput,
  UpdateBranchStatusInput,
} from './branches.schema';
import { insertAuditLog } from '../../utils/audit-log';

// ─── Geocode address via Nominatim (free, no API key) ───────────────────────
async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const q = encodeURIComponent(`${address}, India`);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, {
      headers: { 'User-Agent': 'RestaurantOS/1.0' },
    });
    const data = (await res.json()) as any[];
    if (data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

// FIX: Combine address fields into single 'address' column; use lat/lon (not latitude/longitude); use is_active (not status)
function buildAddress(input: CreateBranchInput): string {
  return [input.address_line1, input.address_line2, input.city, input.state, input.pincode]
    .filter(Boolean)
    .join(', ');
}

// ─── Get All Branches (owner) ────────────────────────────────────────────────
export async function getAll(restaurantId: string) {
  const { data, error } = await supabaseAdmin
    .from('branches')
    .select(`
      id, name, address, lat, lon,
      is_active, operating_hours, created_at, updated_at,
      manager:users!manager_id ( id, name )
    `)
    .eq('restaurant_id', restaurantId)
    .order('created_at');

  if (error) throw new Error(error.message);
  return data;
}

// ─── Create Branch ───────────────────────────────────────────────────────────
export async function create(
  restaurantId: string,
  input: CreateBranchInput,
  actorId: string,
  ipAddress: string
) {
  const fullAddress = buildAddress(input);
  const geo = await geocodeAddress(fullAddress);
  const now = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('branches')
    .insert({
      restaurant_id: restaurantId,
      name: input.name,
      address: fullAddress,
      lat: geo?.lat ?? null,
      lon: geo?.lon ?? null,
      manager_id: input.manager_id ?? null,
      operating_hours: input.operating_hours ?? null,
      is_active: true,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw new Error(`Branch creation failed: ${error.message}`);

  await insertAuditLog({
    actorId,
    action: 'BRANCH_CREATED',
    targetType: 'branch',
    targetId: data.id,
    newValue: input,
    ipAddress,
  });

  return data;
}

// ─── Get Single Branch ────────────────────────────────────────────────────────
export async function getById(branchId: string, restaurantId: string) {
  const { data, error } = await supabaseAdmin
    .from('branches')
    .select(`*, manager:users!manager_id ( id, name )`)
    .eq('id', branchId)
    .eq('restaurant_id', restaurantId)
    .single();

  if (error) throw new Error(`Branch not found: ${error.message}`);
  return data;
}

// ─── Update Branch ────────────────────────────────────────────────────────────
export async function update(
  branchId: string,
  restaurantId: string,
  input: UpdateBranchInput
) {
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

  // Rebuild address if any address fields changed
  if (input.address_line1 || input.city || input.state || input.pincode) {
    const existing = await getById(branchId, restaurantId);
    const merged: CreateBranchInput = {
      name: input.name ?? existing.name,
      address_line1: input.address_line1 ?? existing.address,
      city: input.city ?? '',
      state: input.state ?? '',
      pincode: input.pincode ?? '',
      seating_capacity: input.seating_capacity ?? 0,
      address_line2: input.address_line2,
      phone: input.phone,
    };
    updateData.address = buildAddress(merged);
    const geo = await geocodeAddress(updateData.address as string);
    if (geo) {
      updateData.lat = geo.lat;
      updateData.lon = geo.lon;
    }
  }

  if (input.name) updateData.name = input.name;
  if (input.manager_id !== undefined) updateData.manager_id = input.manager_id;
  if (input.operating_hours) updateData.operating_hours = input.operating_hours;

  const { data, error } = await supabaseAdmin
    .from('branches')
    .update(updateData)
    .eq('id', branchId)
    .eq('restaurant_id', restaurantId)
    .select()
    .single();

  if (error) throw new Error(`Branch update failed: ${error.message}`);
  return data;
}

// ─── Toggle Status (open/close) ───────────────────────────────────────────────
// FIX: branch uses 'is_active' boolean, not a 'status' string column
export async function toggleStatus(
  branchId: string,
  restaurantId: string,
  input: UpdateBranchStatusInput,
  actorId: string,
  ipAddress: string
) {
  const isActive = input.status === 'active';

  // Safety check: no active orders when closing
  if (!isActive) {
    const { count } = await supabaseAdmin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('branch_id', branchId)
      .in('status', ['created', 'confirmed', 'preparing', 'ready']);

    if ((count ?? 0) > 0) {
      throw new Error('Cannot close branch with active orders');
    }
  }

  const { data, error } = await supabaseAdmin
    .from('branches')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', branchId)
    .eq('restaurant_id', restaurantId)
    .select()
    .single();

  if (error) throw new Error(`Status toggle failed: ${error.message}`);

  await insertAuditLog({
    actorId,
    action: `BRANCH_${input.status.toUpperCase()}`,
    targetType: 'branch',
    targetId: branchId,
    newValue: { is_active: isActive, reason: input.reason },
    ipAddress,
  });

  return data;
}

// ─── Live Stats (real-time dashboard) ────────────────────────────────────────
// FIX: removed 'staff_shifts' reference (table doesn't exist) — use users table instead
// FIX: orders has no total_amount — compute revenue from order_items
export async function getLiveStats(branchId: string, restaurantId: string) {
  const today = new Date().toISOString().split('T')[0];

  const [tablesRes, ordersRes, staffRes, itemsRes] = await Promise.all([
    supabaseAdmin
      .from('tables')
      .select('status')
      .eq('branch_id', branchId),

    supabaseAdmin
      .from('orders')
      .select('id, status')
      .eq('branch_id', branchId)
      .in('status', ['created', 'confirmed', 'preparing', 'ready', 'served']),

    // Count active staff members for this branch
    supabaseAdmin
      .from('users')
      .select('id, role', { count: 'exact', head: false })
      .eq('branch_id', branchId)
      .eq('is_active', true)
      .in('role', ['manager', 'host', 'waiter', 'chef', 'cashier']),

    // Revenue: sum order_items for paid orders today
    supabaseAdmin
      .from('order_items')
      .select('unit_price, quantity, order:orders!order_id(branch_id, status, paid_at)')
      .eq('order.branch_id', branchId)
      .eq('order.status', 'paid')
      .gte('order.paid_at', `${today}T00:00:00`),
  ]);

  const tables = tablesRes.data ?? [];
  const orders = ordersRes.data ?? [];
  const staff = staffRes.data ?? [];

  const tablesByStatus = tables.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {});

  const revenueToday = (itemsRes.data ?? []).reduce(
    (sum: number, i: any) => sum + Number(i.unit_price) * Number(i.quantity),
    0
  );

  return {
    tables: tablesByStatus,
    total_tables: tables.length,
    active_orders: orders.length,
    staff_on_duty: staff.length,
    revenue_today: revenueToday,
  };
}
