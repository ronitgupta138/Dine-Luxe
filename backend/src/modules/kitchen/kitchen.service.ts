import { supabaseAdmin } from '../../config/supabase';

// Kitchen status transitions — chef can ONLY go forward
const CHEF_TRANSITIONS: Record<string, string> = {
  confirmed: 'preparing',
  preparing: 'ready',
};

// ─── Get KDS tickets ─────────────────────────────────────────────────────────

export async function getKitchenTickets(branchId: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      id,
      status,
      created_at,
      preparation_started_at,
      table_id,
      tables(label, floor_number),
      order_items(
        id,
        quantity,
        status,
        special_notes,
        menu_items(name, prep_time_minutes, photo_url)
      )
    `)
    .eq('branch_id', branchId)
    .in('status', ['confirmed', 'preparing'])
    .order('created_at', { ascending: true }); // oldest first (FIFO)

  if (error) throw error;

  // FIX: enrich each ticket with elapsed time so KDS can show urgency indicators
  const now = Date.now();
  return (data ?? []).map((order) => ({
    ...order,
    elapsed_minutes: Math.round(
      (now - new Date(order.preparation_started_at ?? order.created_at).getTime()) / 60000,
    ),
  }));
}

// ─── Update order status (chef role only) ────────────────────────────────────

export async function updateKitchenStatus(orderId: string, newStatus: string) {
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, status, branch_id, preparation_started_at')
    .eq('id', orderId)
    .single();

  if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });

  const currentStatus = order.status;
  const allowedNext = CHEF_TRANSITIONS[currentStatus];

  if (!allowedNext) {
    throw Object.assign(
      new Error(`Chef cannot transition order from "${currentStatus}"`),
      {
        statusCode: 422,
        meta: {
          current_status: currentStatus,
          allowed: Object.keys(CHEF_TRANSITIONS),
        },
      },
    );
  }

  if (newStatus !== allowedNext) {
    throw Object.assign(
      new Error(`Invalid transition: ${currentStatus} → ${newStatus}. Expected: ${allowedNext}`),
      {
        statusCode: 422,
        meta: { current_status: currentStatus, allowed_next: allowedNext },
      },
    );
  }

  const updates: Record<string, any> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (newStatus === 'preparing' && !order.preparation_started_at) {
    updates.preparation_started_at = new Date().toISOString();
  }
  if (newStatus === 'ready') {
    updates.preparation_completed_at = new Date().toISOString();
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;

  // FIX: broadcast is non-fatal — wrap in try/catch so a failed WS publish
  // never causes the status update to roll back from the chef's perspective
  if (newStatus === 'ready') {
    try {
      await supabaseAdmin.channel(`branch:${order.branch_id}`).send({
        type: 'broadcast',
        event: 'food_ready',
        payload: { order_id: orderId, branch_id: order.branch_id },
      });
    } catch (broadcastErr: any) {
      console.warn('[kitchen] broadcast failed:', broadcastErr.message);
    }
  }

  // FIX: also broadcast preparing so front-of-house knows order is being worked on
  if (newStatus === 'preparing') {
    try {
      await supabaseAdmin.channel(`branch:${order.branch_id}`).send({
        type: 'broadcast',
        event: 'order_preparing',
        payload: { order_id: orderId, branch_id: order.branch_id },
      });
    } catch {
      // non-fatal
    }
  }

  return data;
}

// ─── Get overdue orders ───────────────────────────────────────────────────────

export async function getOverdueOrders(branchId: string) {
  const thresholdMinutes = Number(process.env['KITCHEN_OVERDUE_THRESHOLD_MINUTES'] ?? 30);
  const cutoff = new Date(Date.now() - thresholdMinutes * 60 * 1000).toISOString();

  // FIX: original used `created_at` as the overdue cutoff, but the prep clock
  // starts when the chef presses "Start" (preparation_started_at). Orders that
  // were confirmed but not yet started should NOT appear as overdue — they are
  // simply queued. Only orders actively in 'preparing' state that started > threshold
  // minutes ago are truly overdue.
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      id,
      status,
      created_at,
      preparation_started_at,
      table_id,
      tables(label),
      order_items(id, quantity, menu_items(name, prep_time_minutes))
    `)
    .eq('branch_id', branchId)
    .eq('status', 'preparing')
    .not('preparation_started_at', 'is', null)       // FIX: only started orders
    .lt('preparation_started_at', cutoff)             // FIX: use prep start time
    .order('preparation_started_at', { ascending: true });

  if (error) throw error;

  // Enrich with elapsed time since prep started
  return (data ?? []).map((order) => ({
    ...order,
    elapsed_minutes: Math.round(
      (Date.now() - new Date(order.preparation_started_at!).getTime()) / 60000,
    ),
  }));
}