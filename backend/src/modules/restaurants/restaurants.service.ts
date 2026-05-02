import { supabaseAdmin } from '../../config/supabase';
import { RegisterInput, UpdateRestaurantInput, UpdateStatusInput } from './restaurants.schema';
import { sendEmail } from '../../email/send';
import { insertAuditLog } from '../../utils/audit-log';

// ─── Register Restaurant (multi-step, transactional) ────────────────────────
export async function register(input: RegisterInput, ipAddress: string) {
  // 1. Create Supabase Auth user for owner
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: input.owner.email,
    password: input.owner.password,
    email_confirm: false,
  });
  if (authError) throw new Error(`Auth creation failed: ${authError.message}`);

  const ownerId = authData.user.id;

  try {
    // 2. Create restaurant record
    const { data: restaurant, error: restError } = await supabaseAdmin
      .from('restaurants')
      .insert({
        name: input.restaurant.name,
        cuisine_types: input.restaurant.cuisine_types,
        description: input.restaurant.description,
        gst_number: input.restaurant.gst_number,
        contact_email: input.restaurant.contact_email ?? input.owner.email,
        contact_phone: input.restaurant.contact_phone,
        website: input.restaurant.website,
        owner_id: ownerId,
        status: 'pending',
      })
      .select()
      .single();

    if (restError) throw new Error(`Restaurant creation failed: ${restError.message}`);

    // 3. Create first branch
    const { data: branch, error: branchError } = await supabaseAdmin
      .from('branches')
      .insert({
        restaurant_id: restaurant.id,
        name: input.branch.name,
        address_line1: input.branch.address_line1,
        address_line2: input.branch.address_line2,
        city: input.branch.city,
        state: input.branch.state,
        pincode: input.branch.pincode,
        phone: input.branch.phone,
        seating_capacity: input.branch.seating_capacity,
        is_primary: true,
        status: 'active',
      })
      .select()
      .single();

    if (branchError) throw new Error(`Branch creation failed: ${branchError.message}`);

    // 4. Create owner profile
    const now = new Date().toISOString();
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: ownerId,
        name: `${input.owner.first_name} ${input.owner.last_name}`.trim(),
        email: input.owner.email,
        phone: input.owner.phone,
        dob: input.owner.dob,
        role: 'owner',
        restaurant_id: restaurant.id,
        branch_id: branch.id,
        is_active: true,
        force_password_change: false,
        created_by_restaurant: true,
        created_at: now,
        updated_at: now,
      });

    if (userError) throw new Error(`User creation failed: ${userError.message}`);

    // 5. Create default branding entry
    await supabaseAdmin.from('restaurant_branding').insert({
      restaurant_id: restaurant.id,
      primary_color: '#E85D04',
      secondary_color: '#FAA307',
      font_family: 'Inter',
      app_name: input.restaurant.name,
    });

    // 6. Send welcome email (fire and forget)
    sendEmail({
      to: input.owner.email,
      templateName: 'welcome',
      data: {
        name: input.owner.first_name,
        restaurantName: input.restaurant.name,
        loginUrl: `${process.env.FRONTEND_URL}/login`,
      },
    }).catch(console.error);

    // 7. Audit log
    await insertAuditLog({
      actorId: ownerId,
      action: 'RESTAURANT_REGISTERED',
      targetType: 'restaurant',
      targetId: restaurant.id,
      ipAddress,
    });

    return { restaurant, branch };
  } catch (err) {
    // Rollback: delete auth user if anything fails
    await supabaseAdmin.auth.admin.deleteUser(ownerId).catch(() => {});
    throw err;
  }
}

// ─── Get All Restaurants (admin) ─────────────────────────────────────────────
export async function getAll(page = 1, limit = 20, status?: string) {
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('restaurants')
    .select(`
      id, name, cuisine_types, status, contact_email, contact_phone,
      created_at,
      users!owner_id ( name, email ),
      branches ( count )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return { restaurants: data, total: count, page, limit };
}

// ─── Get Nearby Restaurants (customer discovery) ──────────────────────────────
export async function getNearby(lat: number, lon: number, radiusKm = 10) {
  // PostGIS query via Supabase RPC
  const { data, error } = await supabaseAdmin.rpc('get_nearby_restaurants', {
    user_lat: lat,
    user_lon: lon,
    radius_km: radiusKm,
  });

  if (error) throw new Error(`Nearby query failed: ${error.message}`);
  return data;
}

// ─── Get Single Restaurant (public) ──────────────────────────────────────────
export async function getById(restaurantId: string) {
  const { data, error } = await supabaseAdmin
    .from('restaurants')
    .select(`
      id, name, cuisine_types, description, contact_email,
      contact_phone, website, status,
      restaurant_branding ( primary_color, secondary_color, logo_url, banner_url, app_name ),
      branches ( id, name, city, state, address_line1, phone, seating_capacity, status )
    `)
    .eq('id', restaurantId)
    .eq('status', 'active')
    .single();

  if (error) throw new Error(`Restaurant not found: ${error.message}`);
  return data;
}

// ─── Get Live Status (real-time for customer) ─────────────────────────────────
export async function getLiveStatus(restaurantId: string) {
  const [tablesResult, queueResult] = await Promise.all([
    supabaseAdmin
      .from('tables')
      .select('status')
      .eq('restaurant_id', restaurantId),
    supabaseAdmin
      .from('queue_entries')
      .select('estimated_wait_minutes')
      .eq('restaurant_id', restaurantId)
      .eq('status', 'waiting'),
  ]);

  const tables = tablesResult.data ?? [];
  const queue = queueResult.data ?? [];

  const available = tables.filter((t) => t.status === 'free').length;
  const avgWait =
    queue.length > 0
      ? Math.round(queue.reduce((s, q) => s + (q.estimated_wait_minutes ?? 0), 0) / queue.length)
      : 0;

  return {
    available_tables: available,
    total_tables: tables.length,
    queue_length: queue.length,
    avg_wait_minutes: avgWait,
    is_accepting_orders: true, // expand with operating hours check
  };
}

// ─── Update Restaurant (owner) ────────────────────────────────────────────────
export async function update(restaurantId: string, input: UpdateRestaurantInput) {
  const { data, error } = await supabaseAdmin
    .from('restaurants')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', restaurantId)
    .select()
    .single();

  if (error) throw new Error(`Update failed: ${error.message}`);
  return data;
}

// ─── Update Status (admin only) ───────────────────────────────────────────────
export async function updateStatus(
  restaurantId: string,
  input: UpdateStatusInput,
  actorId: string,
  ipAddress: string
) {
  // Fetch old status for audit log
  const { data: old } = await supabaseAdmin
    .from('restaurants')
    .select('status, contact_email, name')
    .eq('id', restaurantId)
    .single();

  const { data, error } = await supabaseAdmin
    .from('restaurants')
    .update({ status: input.status, updated_at: new Date().toISOString() })
    .eq('id', restaurantId)
    .select()
    .single();

  if (error) throw new Error(`Status update failed: ${error.message}`);

  // Notify owner via email (fire and forget)
  if (old?.contact_email) {
    sendEmail({
      to: old.contact_email,
      templateName: 'welcome', // reuse with status update context
      data: {
        name: old.name,
        restaurantName: old.name,
        loginUrl: `${process.env.FRONTEND_URL}/login`,
      },
    }).catch(console.error);
  }

  await insertAuditLog({
    actorId,
    action: 'RESTAURANT_STATUS_CHANGED',
    targetType: 'restaurant',
    targetId: restaurantId,
    oldValue: { status: old?.status },
    newValue: { status: input.status, reason: input.reason },
    ipAddress,
  });

  return data;
}
