"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = getMe;
exports.updateMe = updateMe;
exports.getUserById = getUserById;
exports.checkEmail = checkEmail;
const supabase_1 = require("../../config/supabase");
function splitName(name) {
    const parts = (name ?? '').trim().split(' ').filter(Boolean);
    if (parts.length === 0)
        return { first_name: '', last_name: '' };
    if (parts.length === 1)
        return { first_name: parts[0], last_name: '' };
    return { first_name: parts[0], last_name: parts.slice(1).join(' ') };
}
function mapUserRow(row) {
    const { first_name, last_name } = splitName(row?.name);
    return {
        ...row,
        first_name,
        last_name,
        // BUG FIX: original set avatar_url: row?.profile_pic_url ?? null but then
        // returned both profile_pic_url AND avatar_url in the payload (noisy).
        // Keep profile_pic_url for DB fidelity and expose avatar_url as alias.
        avatar_url: row?.profile_pic_url ?? null,
    };
}
// ─── Get Full Profile ───────────────────────────────────────────────────────
async function getMe(userId) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from('users')
        .select(`
      id,
      name,
      email,
      phone,
      dob,
      gender,
      profile_pic_url,
      address,
      city,
      pin_code,
      role,
      employee_id,
      is_active,
      force_password_change,
      restaurant_id,
      branch_id,
      created_at
    `)
        .eq('id', userId)
        .single();
    if (error)
        throw new Error(`Failed to fetch profile: ${error.message}`);
    return mapUserRow(data);
}
// ─── Update Profile ─────────────────────────────────────────────────────────
async function updateMe(userId, updates) {
    const updateData = { updated_at: new Date().toISOString() };
    if (updates.first_name || updates.last_name) {
        const { data: current, error: currentError } = await supabase_1.supabaseAdmin
            .from('users')
            .select('name')
            .eq('id', userId)
            .single();
        if (currentError)
            throw new Error(`Failed to load current name: ${currentError.message}`);
        const currentSplit = splitName(current?.name);
        const first = updates.first_name ?? currentSplit.first_name;
        const last = updates.last_name ?? currentSplit.last_name;
        updateData.name = `${first} ${last}`.trim();
    }
    if (updates.phone)
        updateData.phone = updates.phone;
    if (updates.dob)
        updateData.dob = updates.dob;
    if (updates.gender)
        updateData.gender = updates.gender;
    if (updates.avatar_url)
        updateData.profile_pic_url = updates.avatar_url;
    if (updates.address) {
        const parts = [updates.address.line1, updates.address.line2, updates.address.state]
            .filter(Boolean)
            .join(', ');
        if (parts)
            updateData.address = parts;
        if (updates.address.city)
            updateData.city = updates.address.city;
        if (updates.address.pincode)
            updateData.pin_code = updates.address.pincode;
    }
    const { data, error } = await supabase_1.supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();
    if (error)
        throw new Error(`Failed to update profile: ${error.message}`);
    return mapUserRow(data);
}
// ─── Get User By ID (admin / manager) ──────────────────────────────────────
async function getUserById(userId, restaurantId) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from('users')
        .select(`
      id, name, email, phone, dob,
      gender, profile_pic_url, address, city, pin_code, role, employee_id,
      is_active, force_password_change, branch_id, created_at
    `)
        .eq('id', userId)
        .eq('restaurant_id', restaurantId) // tenant isolation
        .single();
    if (error)
        throw new Error(`User not found: ${error.message}`);
    return mapUserRow(data);
}
// ─── Check Email Availability ────────────────────────────────────────────────
async function checkEmail(email) {
    // BUG FIX: email should be normalised before the DB query — the original code
    // did normalise it (toLowerCase + trim) but only inside the query, meaning
    // the raw value was queried. Move normalisation before the call.
    const normalised = email.toLowerCase().trim();
    const { data, error } = await supabase_1.supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', normalised)
        .maybeSingle();
    if (error)
        throw new Error(`Email check failed: ${error.message}`);
    return { available: data === null };
}
//# sourceMappingURL=users.service.js.map