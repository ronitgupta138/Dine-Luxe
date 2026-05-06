import { supabaseAdmin } from '../../config/supabase';
import { paginate } from '../../utils/pagination';
import { sendPush } from '../notifications/notifications.service';

const AUTO_ESCALATE_HOURS = 24;

// ─── Create ticket ─────────────────────────────────────────────────────────────
export async function createTicket(
  userId: string,
  payload: {
    subject: string;
    description: string;
    category: string;
    order_id?: string;
    priority: string;
  }
) {
  const { data: ticket, error } = await supabaseAdmin
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

  if (error) throw error;

  // Notify support agents — fire and forget
  notifySupportAgents(ticket.id, payload.subject, payload.priority);

  return ticket;
}

async function notifySupportAgents(ticketId: string, subject: string, priority: string) {
  const { data: agents } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('role', 'support');

  for (const agent of agents ?? []) {
    sendPush(
      agent.id,
      `New ${priority} priority ticket`,
      subject,
      { ticket_id: ticketId, type: 'new_ticket' }
    );
  }
}

// ─── Get tickets for user ─────────────────────────────────────────────────────
export async function getTickets(userId: string, role: string, page: number, limit: number) {
  const { from, to } = paginate(page, limit);

  let query = supabaseAdmin
    .from('support_tickets')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  // Agents see all tickets; customers see only their own
  if (role === 'customer') {
    query = query.eq('user_id', userId);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

// ─── Get ticket by ID ─────────────────────────────────────────────────────────
export async function getTicketById(ticketId: string, userId: string, role: string) {
  const { data, error } = await supabaseAdmin
    .from('support_tickets')
    .select('*, user:users(id, name, email)')
    .eq('id', ticketId)
    .single();

  if (error) throw error;

  // Customers can only view their own tickets
  if (role === 'customer' && data.user_id !== userId) {
    throw new Error('Forbidden');
  }

  return data;
}

// ─── Update ticket status ─────────────────────────────────────────────────────
export async function updateTicketStatus(
  ticketId: string,
  agentId: string,
  status: string,
  resolutionNote?: string
) {
  const { data, error } = await supabaseAdmin
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

  if (error) throw error;

  // Notify customer — fire and forget
  const statusMessages: Record<string, string> = {
    in_progress: 'Your ticket is being reviewed.',
    resolved: 'Your support ticket has been resolved.',
    closed: 'Your support ticket has been closed.',
    escalated: 'Your ticket has been escalated for priority review.',
  };

  if (statusMessages[status]) {
    sendPush(data.user_id, 'Ticket Update', statusMessages[status], {
      ticket_id: ticketId,
      type: 'ticket_update',
    });
  }

  return data;
}

// ─── Post message to ticket ───────────────────────────────────────────────────
export async function postMessage(
  ticketId: string,
  senderId: string,
  senderRole: string,
  message: string,
  attachments?: string[]
) {
  const { data, error } = await supabaseAdmin
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

  if (error) throw error;

  // Update ticket updated_at
  await supabaseAdmin
    .from('support_tickets')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', ticketId);

  return data;
}

// ─── Get messages for ticket ──────────────────────────────────────────────────
export async function getMessages(ticketId: string, userId: string, role: string) {
  // Verify access
  await getTicketById(ticketId, userId, role);

  const { data, error } = await supabaseAdmin
    .from('support_messages')
    .select('*, sender:users(id, name, profile_pic_url)')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

// ─── Auto-escalation check (called by cron) ───────────────────────────────────
export async function autoEscalateStaleTickets() {
  const threshold = new Date(Date.now() - AUTO_ESCALATE_HOURS * 60 * 60 * 1000).toISOString();

  const { data: staleTickets, error } = await supabaseAdmin
    .from('support_tickets')
    .select('id, user_id, subject')
    .eq('status', 'open')
    .lt('created_at', threshold);

  if (error) throw error;
  if (!staleTickets?.length) return;

  const ids = staleTickets.map((t: any) => t.id);

  await supabaseAdmin
    .from('support_tickets')
    .update({ status: 'escalated', updated_at: new Date().toISOString() })
    .in('id', ids);

  // Notify managers
  const { data: managers } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('role', 'admin');

  for (const manager of managers ?? []) {
    sendPush(
      manager.id,
      'Tickets Auto-Escalated',
      `${staleTickets.length} ticket(s) have been open for over ${AUTO_ESCALATE_HOURS} hours.`,
      { type: 'auto_escalation' }
    );
  }

  return staleTickets.length;
}
