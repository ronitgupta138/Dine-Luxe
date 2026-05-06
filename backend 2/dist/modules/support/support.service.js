"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTicket = createTicket;
exports.getTickets = getTickets;
exports.getTicketById = getTicketById;
exports.updateTicketStatus = updateTicketStatus;
exports.postMessage = postMessage;
exports.getMessages = getMessages;
exports.autoEscalateStaleTickets = autoEscalateStaleTickets;
const supabase_1 = require("../../config/supabase");
const pagination_1 = require("../../utils/pagination");
const notifications_service_1 = require("../notifications/notifications.service");
const AUTO_ESCALATE_HOURS = 24;
// ─── Create ticket ─────────────────────────────────────────────────────────────
async function createTicket(userId, payload) {
    const { data: ticket, error } = await supabase_1.supabaseAdmin
        .from('support_tickets')
        .insert({
        user_id: userId,
        subject: payload.subject,
        description: payload.description,
        category: payload.category,
        order_id: payload.order_id ?? null,
        priority: payload.priority,
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    })
        .select()
        .single();
    if (error)
        throw error;
    // Notify support agents — fire and forget
    notifySupportAgents(ticket.id, payload.subject, payload.priority);
    return ticket;
}
async function notifySupportAgents(ticketId, subject, priority) {
    const { data: agents } = await supabase_1.supabaseAdmin
        .from('users')
        .select('id')
        .eq('role', 'support');
    for (const agent of agents ?? []) {
        (0, notifications_service_1.sendPush)(agent.id, `New ${priority} priority ticket`, subject, { ticket_id: ticketId, type: 'new_ticket' });
    }
}
// ─── Get tickets for user ─────────────────────────────────────────────────────
async function getTickets(userId, role, page, limit) {
    const { from, to } = (0, pagination_1.paginate)(page, limit);
    let query = supabase_1.supabaseAdmin
        .from('support_tickets')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);
    // Agents see all tickets; customers see only their own
    if (role === 'customer') {
        query = query.eq('user_id', userId);
    }
    const { data, error, count } = await query;
    if (error)
        throw error;
    return { data, count };
}
// ─── Get ticket by ID ─────────────────────────────────────────────────────────
async function getTicketById(ticketId, userId, role) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from('support_tickets')
        .select('*, user:users(id, name, email)')
        .eq('id', ticketId)
        .single();
    if (error)
        throw error;
    // Customers can only view their own tickets
    if (role === 'customer' && data.user_id !== userId) {
        throw new Error('Forbidden');
    }
    return data;
}
// ─── Update ticket status ─────────────────────────────────────────────────────
async function updateTicketStatus(ticketId, agentId, status, resolutionNote) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from('support_tickets')
        .update({
        status,
        resolution_note: resolutionNote ?? null,
        resolved_by: agentId,
        resolved_at: ['resolved', 'closed'].includes(status) ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
    })
        .eq('id', ticketId)
        .select('*, user_id')
        .single();
    if (error)
        throw error;
    // Notify customer — fire and forget
    const statusMessages = {
        in_progress: 'Your ticket is being reviewed.',
        resolved: 'Your support ticket has been resolved.',
        closed: 'Your support ticket has been closed.',
        escalated: 'Your ticket has been escalated for priority review.',
    };
    if (statusMessages[status]) {
        (0, notifications_service_1.sendPush)(data.user_id, 'Ticket Update', statusMessages[status], {
            ticket_id: ticketId,
            type: 'ticket_update',
        });
    }
    return data;
}
// ─── Post message to ticket ───────────────────────────────────────────────────
async function postMessage(ticketId, senderId, senderRole, message, attachments) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from('support_messages')
        .insert({
        ticket_id: ticketId,
        sender_id: senderId,
        sender_role: senderRole,
        message,
        attachments: attachments ?? [],
        created_at: new Date().toISOString(),
    })
        .select()
        .single();
    if (error)
        throw error;
    // Update ticket updated_at
    await supabase_1.supabaseAdmin
        .from('support_tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', ticketId);
    return data;
}
// ─── Get messages for ticket ──────────────────────────────────────────────────
async function getMessages(ticketId, userId, role) {
    // Verify access
    await getTicketById(ticketId, userId, role);
    const { data, error } = await supabase_1.supabaseAdmin
        .from('support_messages')
        .select('*, sender:users(id, name, profile_pic_url)')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
    if (error)
        throw error;
    return data;
}
// ─── Auto-escalation check (called by cron) ───────────────────────────────────
async function autoEscalateStaleTickets() {
    const threshold = new Date(Date.now() - AUTO_ESCALATE_HOURS * 60 * 60 * 1000).toISOString();
    const { data: staleTickets, error } = await supabase_1.supabaseAdmin
        .from('support_tickets')
        .select('id, user_id, subject')
        .eq('status', 'open')
        .lt('created_at', threshold);
    if (error)
        throw error;
    if (!staleTickets?.length)
        return;
    const ids = staleTickets.map((t) => t.id);
    await supabase_1.supabaseAdmin
        .from('support_tickets')
        .update({ status: 'escalated', updated_at: new Date().toISOString() })
        .in('id', ids);
    // Notify managers
    const { data: managers } = await supabase_1.supabaseAdmin
        .from('users')
        .select('id')
        .eq('role', 'admin');
    for (const manager of managers ?? []) {
        (0, notifications_service_1.sendPush)(manager.id, 'Tickets Auto-Escalated', `${staleTickets.length} ticket(s) have been open for over ${AUTO_ESCALATE_HOURS} hours.`, { type: 'auto_escalation' });
    }
    return staleTickets.length;
}
//# sourceMappingURL=support.service.js.map