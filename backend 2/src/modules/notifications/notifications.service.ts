import { supabaseAdmin } from '../../config/supabase';
import { sendEmail as sendEmailUtil } from '../../email/send';
import { paginate } from '../../utils/pagination';

// ─── Send push notification ────────────────────────────────────────────────────
export async function sendPush(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  console.warn(
    '[Notifications] Push notifications disabled (Firebase removed). Request ignored.'
  );
  void userId;
  void title;
  void body;
  void data;
  return;
}

// ─── Send email notification ───────────────────────────────────────────────────
export async function sendEmailNotification(
  userId: string,
  templateName: string,
  templateData: Record<string, unknown>
): Promise<void> {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('email')
    .eq('id', userId)
    .single();

  if (error || !user?.email) return;

  await sendEmailUtil({
    to: user.email,
    templateName,
    data: templateData as Record<string, any>,
  });
}

// ─── Create in-app notification ───────────────────────────────────────────────
export async function createInApp(
  userId: string,
  type: string,
  title: string,
  body: string,
  referenceId?: string,
  referenceType?: string
): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      body,
      reference_id: referenceId ?? null,
      reference_type: referenceType ?? null,
      is_read: false,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  // Emit Supabase Realtime event to user's channel
  await supabaseAdmin.channel(`user:${userId}`).send({
    type: 'broadcast',
    event: 'new_notification',
    payload: data,
  });
}

// ─── Get notifications for user ───────────────────────────────────────────────
export async function getForUser(userId: string, page: number, limit: number) {
  const { from, to } = paginate(page, limit);
  const { data, error, count } = await supabaseAdmin
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { data, count };
}

// ─── Mark single notification read ────────────────────────────────────────────
export async function markRead(id: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Mark all notifications read ──────────────────────────────────────────────
export async function markAllRead(userId: string) {
  const { error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
}

// ─── Register device token ────────────────────────────────────────────────────
export async function registerDevice(userId: string, token: string, platform?: string) {
  const { data, error } = await supabaseAdmin
    .from('device_tokens')
    .upsert(
      { user_id: userId, token, platform: platform ?? null, updated_at: new Date().toISOString() },
      { onConflict: 'token' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Remove device token ──────────────────────────────────────────────────────
export async function removeDevice(userId: string, token: string) {
  const { error } = await supabaseAdmin
    .from('device_tokens')
    .delete()
    .eq('token', token)
    .eq('user_id', userId);

  if (error) throw error;
}
