import { supabaseAdmin } from '../../config/supabase';
import { UpdateProfileInput } from './users.schema';

// ─── Get Full Profile ───────────────────────────────────────────────────────
export async function getMe(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone,
      dob,
      gender,
      avatar_url,
      address,
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

  if (error) throw new Error(`Failed to fetch profile: ${error.message}`);
  return data;
}

// ─── Update Profile ─────────────────────────────────────────────────────────
export async function updateMe(userId: string, updates: UpdateProfileInput) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update profile: ${error.message}`);
  return data;
}

// ─── Get User By ID (admin / manager) ──────────────────────────────────────
export async function getUserById(userId: string, restaurantId: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      id, first_name, last_name, email, phone, dob,
      gender, avatar_url, address, role, employee_id,
      is_active, force_password_change, branch_id, created_at
    `)
    .eq('id', userId)
    .eq('restaurant_id', restaurantId)   // tenant isolation
    .single();

  if (error) throw new Error(`User not found: ${error.message}`);
  return data;
}

// ─── Check Email Availability ────────────────────────────────────────────────
export async function checkEmail(email: string): Promise<{ available: boolean }> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();

  if (error) throw new Error(`Email check failed: ${error.message}`);
  return { available: data === null };
}
