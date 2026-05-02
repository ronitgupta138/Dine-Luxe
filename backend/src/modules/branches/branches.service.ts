import { supabaseAdmin } from '../../config/supabase';
import {
  CreateBranchInput,
  UpdateBranchInput,
  UpdateBranchStatusInput,
} from './branches.schema';
import { insertAuditLog } from '../../utils/audit-log';

// ─── Geocode address via Nominatim (free, no API key) ───────────────────────
async function geocodeAddress(
  line1: string,
  city: string,
  state: string,
  pincode: string
): Promise<{ lat: number; lon: number } | null> {
  try {
    const q = encodeURIComponent(`${line1}, ${city}, ${state}, ${pincode}, India`);
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

// ─── Get All Branches (owner) ────────────────────────────────────────────────
export async function getAll(restaurantId: string) {
  const { data, error } = await supabaseAdmin
    .from('branches')
    .select(`
      id, name, city, state, address_line1, pincode, phone,
      seating_capacity, status, is_primary, operating_hours,
      latitude, longitude, created_at,
      users!manager_id ( id, name )
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
  // Geocode address
  const geo = await geocodeAddress(
    input.address_line1,
    input.city,
    input.state,
    input.pincode
  );

  const { data, error } = await supabaseAdmin
    .from('branches')
    .insert({
      restaurant_id: restaurantId,
      ...input,
      latitude: geo?.lat ?? null,
      longitude: geo?.lon ?? null,
      status: 'active',
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
    .select(`
      *, users!manager_id ( id, name, phone )
    `)
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
  // Re-geocode if address changed
  let geoUpdate = {};
  if (input.address_line1 || input.city || input.state || input.pincode) {
    const branch = await getById(branchId, restaurantId);
    const geo = await geocodeAddress(
      input.address_line1 ?? branch.address_line1,
      input.city ?? branch.city,
      input.state ?? branch.state,
      input.pincode ?? branch.pincode
    );
    if (geo) geoUpdate = { latitude: geo.lat, longitude: geo.lon };
  }

  const { data, error } = await supabaseAdmin
    .from('branches')
    .update({ ...input, ...geoUpdate, updated_at: new Date().toISOString() })
    .eq('id', branchId)
    .eq('restaurant_id', restaurantId)
    .select()
    .single();

  if (error) throw new Error(`Branch update failed: ${error.message}`);
  return data;
}

// ─── Toggle Status (open/close) ───────────────────────────────────────────────
export async function toggleStatus(
  branchId: string,
  restaurantId: string,
  input: UpdateBranchStatusInput,
  actorId: string,
  ipAddress: string
) {
  // Safety check: no active orders when closing
  if (input.status !== 'active') {
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
    .update({ status: input.status, updated_at: new Date().toISOString() })
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
    newValue: { status: input.status, reason: input.reason },
    ipAddress,
  });

  return data;
}

// ─── Live Stats (real-time dashboard) ────────────────────────────────────────
export async function getLiveStats(branchId: string, restaurantId: string) {
  const [tablesRes, ordersRes, staffRes] = await Promise.all([
    supabaseAdmin
      .from('tables')
      .select('status')
      .eq('branch_id', branchId)
      .eq('restaurant_id', restaurantId),

    supabaseAdmin
      .from('orders')
      .select('id, total_amount, status')
      .eq('branch_id', branchId)
      .eq('restaurant_id', restaurantId)
      .in('status', ['created', 'confirmed', 'preparing', 'ready', 'served']),

    supabaseAdmin
      .from('staff_shifts')
      .select('id, role')
      .eq('branch_id', branchId)
      .eq('restaurant_id', restaurantId)
      .is('clock_out', null),
  ]);

  const tables = tablesRes.data ?? [];
  const orders = ordersRes.data ?? [];
  const staff = staffRes.data ?? [];

  const tablesByStatus = tables.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {});

  const revenueToday = orders
    .filter((o) => o.status === 'served')
    .reduce((sum, o) => sum + (o.total_amount ?? 0), 0);

  return {
    tables: tablesByStatus,
    total_tables: tables.length,
    active_orders: orders.length,
    staff_on_duty: staff.length,
    revenue_today: revenueToday,
  };
}
