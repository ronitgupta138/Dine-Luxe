"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getByBranch = getByBranch;
exports.create = create;
exports.getById = getById;
exports.update = update;
exports.toggleAccess = toggleAccess;
exports.getPerformance = getPerformance;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const supabase_1 = require("../../config/supabase");
const redis_1 = require("../../config/redis");
const employee_id_1 = require("../../utils/employee-id");
const password_1 = require("../../utils/password");
const audit_log_1 = require("../../utils/audit-log");
const send_1 = require("../../email/send");
const env_1 = require("../../config/env");
// ─── Get All Staff for a Branch ───────────────────────────────────────────────
async function getByBranch(branchId, restaurantId) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from('users')
        .select(`
      id, name, email, phone, role,
      employee_id, is_active, profile_pic_url, created_at,
      branches!branch_id ( name )
    `)
        .eq('branch_id', branchId)
        .eq('restaurant_id', restaurantId)
        .order('created_at');
    if (error)
        throw new Error(error.message);
    return data;
}
// ─── Create Staff ─────────────────────────────────────────────────────────────
async function create(input, restaurantId, actorId, actorBranchId, actorRole, ipAddress) {
    // Normalise email once — used for both Supabase Auth and the DB row.
    const staffEmail = input.email.toLowerCase().trim();
    // Manager can only create staff for their OWN branch
    if (actorRole === 'manager' && input.branch_id !== actorBranchId) {
        throw new Error('Managers can only create staff for their own branch');
    }
    // Verify the branch belongs to this restaurant
    const { data: branch, error: branchErr } = await supabase_1.supabaseAdmin
        .from('branches')
        .select('id, name')
        .eq('id', input.branch_id)
        .eq('restaurant_id', restaurantId)
        .single();
    if (branchErr || !branch) {
        throw new Error(`Branch not found or unauthorized. Verify branch_id "${input.branch_id}" belongs to your restaurant.`);
    }
    // Generate default password from DOB (format: DDMMYYYY)
    const defaultPassword = (0, password_1.generateDefaultPassword)(new Date(input.dob));
    // BUG FIX: hash the default password so it is stored in users.password_hash.
    // Without this, login's bcrypt.compare(password, null) throws
    // "Illegal arguments: string, object" — same issue that affected restaurant owners.
    const hashedPassword = await bcryptjs_1.default.hash(defaultPassword, env_1.config.BCRYPT_SALT_ROUNDS);
    // Create Supabase Auth user
    const { data: authData, error: authError } = await supabase_1.supabaseAdmin.auth.admin.createUser({
        email: staffEmail,
        password: defaultPassword,
        email_confirm: true, // auto-confirm staff emails
    });
    if (authError)
        throw new Error(`Auth creation failed: ${authError.message}`);
    const staffId = authData.user.id;
    try {
        // Generate employee ID: EMP-{BRANCHCODE}-{SEQ}
        const employeeId = await (0, employee_id_1.generateEmployeeId)(branch.name, input.branch_id);
        // Create profile
        const now = new Date().toISOString();
        const { data: profile, error: profileError } = await supabase_1.supabaseAdmin
            .from('users')
            .insert({
            id: staffId,
            name: `${input.first_name} ${input.last_name}`.trim(),
            email: staffEmail,
            phone: input.phone,
            dob: input.dob,
            gender: input.gender,
            role: input.role,
            password_hash: hashedPassword,
            restaurant_id: restaurantId,
            branch_id: input.branch_id,
            employee_id: employeeId,
            is_active: true,
            force_password_change: true, // must change DOB password on first login
            created_by_restaurant: true,
            created_at: now,
            updated_at: now,
        })
            .select()
            .single();
        if (profileError)
            throw new Error(`Profile creation failed: ${profileError.message}`);
        // Send credentials email (fire and forget — never await in request handler)
        (0, send_1.sendEmail)({
            to: staffEmail,
            templateName: 'welcome',
            data: {
                name: input.first_name,
                restaurantName: '',
                loginUrl: `${process.env.FRONTEND_URL}/first-login`,
            },
        }).catch(console.error);
        await (0, audit_log_1.insertAuditLog)({
            actorId,
            action: 'STAFF_CREATED',
            targetType: 'staff',
            targetId: staffId,
            newValue: { role: input.role, branch_id: input.branch_id, employee_id: employeeId },
            ipAddress,
        });
        // Remove password from returned object
        const { ...safeProfile } = profile;
        return { ...safeProfile, temp_password: defaultPassword };
    }
    catch (err) {
        // Rollback auth user on failure
        await supabase_1.supabaseAdmin.auth.admin.deleteUser(staffId).catch(() => { });
        throw err;
    }
}
// ─── Get Staff by ID ──────────────────────────────────────────────────────────
async function getById(staffId, restaurantId) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from('users')
        .select(`
      id, name, email, phone, dob, gender, role,
      employee_id, is_active, profile_pic_url, force_password_change, created_at,
      branches!branch_id ( id, name )
    `)
        .eq('id', staffId)
        .eq('restaurant_id', restaurantId)
        .single();
    if (error)
        throw new Error(`Staff not found: ${error.message}`);
    return data;
}
// ─── Update Staff ─────────────────────────────────────────────────────────────
async function update(staffId, restaurantId, input) {
    const updateData = {
        updated_at: new Date().toISOString(),
    };
    if (input.first_name || input.last_name) {
        const { data: current, error: currentError } = await supabase_1.supabaseAdmin
            .from('users')
            .select('name')
            .eq('id', staffId)
            .single();
        if (currentError)
            throw new Error(`Failed to load current name: ${currentError.message}`);
        const currentParts = (current?.name ?? '').trim().split(' ').filter(Boolean);
        const currentFirst = currentParts[0] ?? '';
        const currentLast = currentParts.slice(1).join(' ');
        const first = input.first_name ?? currentFirst;
        const last = input.last_name ?? currentLast;
        updateData.name = `${first} ${last}`.trim();
    }
    if (input.phone)
        updateData.phone = input.phone;
    if (input.role)
        updateData.role = input.role;
    if (input.branch_id)
        updateData.branch_id = input.branch_id;
    if (input.avatar_url)
        updateData.profile_pic_url = input.avatar_url;
    const { data, error } = await supabase_1.supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', staffId)
        .eq('restaurant_id', restaurantId)
        .select()
        .single();
    if (error)
        throw new Error(`Update failed: ${error.message}`);
    return data;
}
// ─── Toggle Access (activate / deactivate) ────────────────────────────────────
async function toggleAccess(staffId, restaurantId, actorId, ipAddress) {
    // Get current status
    const { data: current } = await supabase_1.supabaseAdmin
        .from('users')
        .select('is_active, name, email')
        .eq('id', staffId)
        .eq('restaurant_id', restaurantId)
        .single();
    if (!current)
        throw new Error('Staff not found');
    const newStatus = !current.is_active;
    const { data, error } = await supabase_1.supabaseAdmin
        .from('users')
        .update({ is_active: newStatus, updated_at: new Date().toISOString() })
        .eq('id', staffId)
        .eq('restaurant_id', restaurantId)
        .select()
        .single();
    if (error)
        throw new Error(`Toggle failed: ${error.message}`);
    // If deactivating: invalidate all active sessions in Redis
    if (!newStatus) {
        try {
            // Store a blacklist key — auth middleware checks this
            await redis_1.redis.setex(`blacklisted_user:${staffId}`, 60 * 60 * 24 * 7, '1');
        }
        catch {
            // Non-fatal — user will still be blocked on next profile check
        }
    }
    else {
        // Re-activating — remove from blacklist
        try {
            await redis_1.redis.del(`blacklisted_user:${staffId}`);
        }
        catch { }
    }
    await (0, audit_log_1.insertAuditLog)({
        actorId,
        action: newStatus ? 'STAFF_ACTIVATED' : 'STAFF_DEACTIVATED',
        targetType: 'staff',
        targetId: staffId,
        newValue: { is_active: newStatus },
        ipAddress,
    });
    return data;
}
// ─── Get Performance Metrics ───────────────────────────────────────────────────
// FIX: orders has no restaurant_id (filter by branch_id); reviews has no waiter_id/waiter_rating
async function getPerformance(staffId, restaurantId) {
    const { data: staffProfile } = await supabase_1.supabaseAdmin
        .from('users')
        .select('branch_id')
        .eq('id', staffId)
        .eq('restaurant_id', restaurantId)
        .single();
    const branchId = staffProfile?.branch_id ?? '';
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    const [ordersToday, tablesThisWeek, ratingsRes] = await Promise.all([
        supabase_1.supabaseAdmin
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('waiter_id', staffId)
            .eq('branch_id', branchId)
            .gte('created_at', `${today}T00:00:00`)
            .in('status', ['served', 'paid', 'closed']),
        supabase_1.supabaseAdmin
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('waiter_id', staffId)
            .eq('branch_id', branchId)
            .gte('created_at', weekAgo),
        // Use overall_rating on branch-level reviews as a proxy
        supabase_1.supabaseAdmin
            .from('reviews')
            .select('overall_rating')
            .eq('branch_id', branchId)
            .gte('created_at', weekAgo),
    ]);
    const ratingValues = (ratingsRes.data ?? []).map((r) => r.overall_rating);
    const avgRating = ratingValues.length > 0
        ? ratingValues.reduce((s, v) => s + v, 0) / ratingValues.length
        : null;
    return {
        orders_today: ordersToday.count ?? 0,
        avg_branch_rating_this_week: avgRating ? Math.round(avgRating * 100) / 100 : null,
        rating_count: ratingValues.length,
        tables_served_this_week: tablesThisWeek.count ?? 0,
    };
}
//# sourceMappingURL=staff.service.js.map