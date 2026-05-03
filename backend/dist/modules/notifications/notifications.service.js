"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPush = sendPush;
exports.sendEmailNotification = sendEmailNotification;
exports.createInApp = createInApp;
exports.getForUser = getForUser;
exports.markRead = markRead;
exports.markAllRead = markAllRead;
exports.registerDevice = registerDevice;
exports.removeDevice = removeDevice;
const supabase_1 = require("../../config/supabase");
const send_1 = require("../../email/send");
const pagination_1 = require("../../utils/pagination");
// ─── Send push notification ────────────────────────────────────────────────────
async function sendPush(userId, title, body, data) {
    console.warn('[Notifications] Push notifications disabled (Firebase removed). Request ignored.');
    void userId;
    void title;
    void body;
    void data;
    return;
}
// ─── Send email notification ───────────────────────────────────────────────────
async function sendEmailNotification(userId, templateName, templateData) {
    const { data: user, error } = await supabase_1.supabaseAdmin
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();
    if (error || !user?.email)
        return;
    await (0, send_1.sendEmail)({
        to: user.email,
        templateName,
        data: templateData,
    });
}
// ─── Create in-app notification ───────────────────────────────────────────────
async function createInApp(userId, type, title, body, referenceId, referenceType) {
    const { data, error } = await supabase_1.supabaseAdmin
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
    if (error)
        throw error;
    // Emit Supabase Realtime event to user's channel
    await supabase_1.supabaseAdmin.channel(`user:${userId}`).send({
        type: 'broadcast',
        event: 'new_notification',
        payload: data,
    });
}
// ─── Get notifications for user ───────────────────────────────────────────────
async function getForUser(userId, page, limit) {
    const { from, to } = (0, pagination_1.paginate)(page, limit);
    const { data, error, count } = await supabase_1.supabaseAdmin
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);
    if (error)
        throw error;
    return { data, count };
}
// ─── Mark single notification read ────────────────────────────────────────────
async function markRead(id, userId) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
    if (error)
        throw error;
    return data;
}
// ─── Mark all notifications read ──────────────────────────────────────────────
async function markAllRead(userId) {
    const { error } = await supabase_1.supabaseAdmin
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_read', false);
    if (error)
        throw error;
}
// ─── Register device token ────────────────────────────────────────────────────
async function registerDevice(userId, token, platform) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from('device_tokens')
        .upsert({ user_id: userId, token, platform: platform ?? null, updated_at: new Date().toISOString() }, { onConflict: 'token' })
        .select()
        .single();
    if (error)
        throw error;
    return data;
}
// ─── Remove device token ──────────────────────────────────────────────────────
async function removeDevice(userId, token) {
    const { error } = await supabase_1.supabaseAdmin
        .from('device_tokens')
        .delete()
        .eq('token', token)
        .eq('user_id', userId);
    if (error)
        throw error;
}
//# sourceMappingURL=notifications.service.js.map