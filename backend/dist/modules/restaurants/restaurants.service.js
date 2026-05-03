"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.getAll = getAll;
exports.getNearby = getNearby;
exports.getById = getById;
exports.getLiveStatus = getLiveStatus;
exports.update = update;
exports.updateStatus = updateStatus;
const supabase_1 = require("../../config/supabase");
const send_1 = require("../../email/send");
const audit_log_1 = require("../../utils/audit-log");
// ─── Register Restaurant (multi-step, transactional) ────────────────────────
// FIX: restaurants table only has: name, cuisine_type (singular), gst_number, status
//      branches table only has: restaurant_id, name, address (text), lat, lon, manager_id, operating_hours, is_active
async function register(input, ipAddress) {
    // 1. Create Supabase Auth user for owner
    const { data: authData, error: authError } = await supabase_1.supabaseAdmin.auth.admin.createUser({
        email: input.owner.email,
        password: input.owner.password,
        email_confirm: false,
    });
    if (authError)
        throw new Error(`Auth creation failed: ${authError.message}`);
    const ownerId = authData.user.id;
    try {
        // 2. Create restaurant record (only use columns that actually exist)
        const { data: restaurant, error: restError } = await supabase_1.supabaseAdmin
            .from('restaurants')
            .insert({
            name: input.restaurant.name,
            cuisine_type: Array.isArray(input.restaurant.cuisine_types)
                ? input.restaurant.cuisine_types.join(', ')
                : input.restaurant.cuisine_types,
            gst_number: input.restaurant.gst_number ?? null,
            status: 'pending',
        })
            .select()
            .single();
        if (restError)
            throw new Error(`Restaurant creation failed: ${restError.message}`);
        // 3. Create first branch — combine address fields into single 'address' column
        const branchAddress = [
            input.branch.address_line1,
            input.branch.address_line2,
            input.branch.city,
            input.branch.state,
            input.branch.pincode,
        ].filter(Boolean).join(', ');
        const { data: branch, error: branchError } = await supabase_1.supabaseAdmin
            .from('branches')
            .insert({
            restaurant_id: restaurant.id,
            name: input.branch.name,
            address: branchAddress,
            is_active: true,
        })
            .select()
            .single();
        if (branchError)
            throw new Error(`Branch creation failed: ${branchError.message}`);
        // 4. Create owner profile
        const now = new Date().toISOString();
        const { error: userError } = await supabase_1.supabaseAdmin
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
        if (userError)
            throw new Error(`User creation failed: ${userError.message}`);
        // 5. Create default branding entry (only valid columns)
        await supabase_1.supabaseAdmin.from('restaurant_branding').insert({
            restaurant_id: restaurant.id,
            primary_color: '#E85D04',
            secondary_color: '#FAA307',
            app_name_display: input.restaurant.name,
        });
        // 6. Send welcome email (fire and forget)
        (0, send_1.sendEmail)({
            to: input.owner.email,
            templateName: 'welcome',
            data: {
                name: input.owner.first_name,
                restaurantName: input.restaurant.name,
                loginUrl: `${process.env.FRONTEND_URL}/login`,
            },
        }).catch(console.error);
        // 7. Audit log
        await (0, audit_log_1.insertAuditLog)({
            actorId: ownerId,
            action: 'RESTAURANT_REGISTERED',
            targetType: 'restaurant',
            targetId: restaurant.id,
            ipAddress,
        });
        return { restaurant, branch };
    }
    catch (err) {
        // Rollback: delete auth user if anything fails
        await supabase_1.supabaseAdmin.auth.admin.deleteUser(ownerId).catch(() => { });
        throw err;
    }
}
// ─── Get All Restaurants (admin) ─────────────────────────────────────────────
async function getAll(page = 1, limit = 20, status) {
    const offset = (page - 1) * limit;
    let query = supabase_1.supabaseAdmin
        .from('restaurants')
        .select(`
      id, name, cuisine_type, status, gst_number, created_at
    `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    if (status)
        query = query.eq('status', status);
    const { data, error, count } = await query;
    if (error)
        throw new Error(error.message);
    return { restaurants: data, total: count, page, limit };
}
// ─── Get Nearby Restaurants (customer discovery) ──────────────────────────────
async function getNearby(lat, lon, radiusKm = 10) {
    const { data, error } = await supabase_1.supabaseAdmin.rpc('get_nearby_restaurants', {
        user_lat: lat,
        user_lon: lon,
        radius_km: radiusKm,
    });
    if (error)
        throw new Error(`Nearby query failed: ${error.message}`);
    return data;
}
// ─── Get Single Restaurant (public) ──────────────────────────────────────────
// FIX: use actual columns that exist in branches + restaurant_branding tables
async function getById(restaurantId) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from('restaurants')
        .select(`
      id, name, cuisine_type, gst_number, status,
      restaurant_branding ( primary_color, secondary_color, logo_url, banner_url, app_name_display, tagline ),
      branches ( id, name, address, lat, lon, is_active, operating_hours )
    `)
        .eq('id', restaurantId)
        .eq('status', 'active')
        .single();
    if (error)
        throw new Error(`Restaurant not found: ${error.message}`);
    return data;
}
// ─── Get Live Status (real-time for customer) ─────────────────────────────────
// FIX: queue_entries has no estimated_wait_minutes or restaurant_id
async function getLiveStatus(restaurantId, branchId) {
    const branchQuery = branchId
        ? supabase_1.supabaseAdmin.from('branches').select('id').eq('id', branchId).eq('restaurant_id', restaurantId)
        : supabase_1.supabaseAdmin.from('branches').select('id').eq('restaurant_id', restaurantId).eq('is_active', true);
    const { data: branches } = await branchQuery;
    const branchIds = (branches ?? []).map((b) => b.id);
    if (!branchIds.length) {
        return { available_tables: 0, total_tables: 0, queue_length: 0, avg_wait_minutes: 0, is_accepting_orders: false };
    }
    const [tablesResult, queueResult] = await Promise.all([
        supabase_1.supabaseAdmin.from('tables').select('status').in('branch_id', branchIds),
        supabase_1.supabaseAdmin.from('queue_entries').select('position').in('branch_id', branchIds).eq('status', 'waiting'),
    ]);
    const tables = tablesResult.data ?? [];
    const queue = queueResult.data ?? [];
    const available = tables.filter((t) => t.status === 'free').length;
    const avgWait = queue.length > 0 ? queue.length * 15 : 0; // estimate 15 min per party
    return {
        available_tables: available,
        total_tables: tables.length,
        queue_length: queue.length,
        avg_wait_minutes: avgWait,
        is_accepting_orders: available > 0 || queue.length < 20,
    };
}
// ─── Update Restaurant (owner) ────────────────────────────────────────────────
async function update(restaurantId, input) {
    // Only update columns that actually exist in schema
    const updateData = { updated_at: new Date().toISOString() };
    if (input.name)
        updateData.name = input.name;
    if (input.cuisine_types)
        updateData.cuisine_type = input.cuisine_types.join(', ');
    if (input.gst_number)
        updateData.gst_number = input.gst_number;
    const { data, error } = await supabase_1.supabaseAdmin
        .from('restaurants')
        .update(updateData)
        .eq('id', restaurantId)
        .select()
        .single();
    if (error)
        throw new Error(`Update failed: ${error.message}`);
    return data;
}
// ─── Update Status (admin only) ───────────────────────────────────────────────
async function updateStatus(restaurantId, input, actorId, ipAddress) {
    const { data: old } = await supabase_1.supabaseAdmin
        .from('restaurants')
        .select('status, name')
        .eq('id', restaurantId)
        .single();
    const { data, error } = await supabase_1.supabaseAdmin
        .from('restaurants')
        .update({ status: input.status, updated_at: new Date().toISOString() })
        .eq('id', restaurantId)
        .select()
        .single();
    if (error)
        throw new Error(`Status update failed: ${error.message}`);
    await (0, audit_log_1.insertAuditLog)({
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
//# sourceMappingURL=restaurants.service.js.map