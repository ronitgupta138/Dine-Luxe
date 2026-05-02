import { supabaseAdmin } from '../../config/supabase';

// ─── Get Order Items ──────────────────────────────────────────────────────────

export async function getOrderItems(orderId: string, branchId: string) {
  // Verify the order belongs to this branch first
  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .select('id')
    .eq('id', orderId)
    .eq('branch_id', branchId)
    .single();

  if (orderErr || !order) {
    throw Object.assign(new Error('Order not found'), { status: 404 });
  }

  const { data, error } = await supabaseAdmin
    .from('order_items')
    .select('*, menu_items(id, name, price, category_id)')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// ─── Serve Item ───────────────────────────────────────────────────────────────

export async function serveItem(itemId: string, branchId: string) {
  // Fetch the item and its parent order
  const { data: item, error: itemErr } = await supabaseAdmin
    .from('order_items')
    .select('*, orders!inner(id, branch_id, status)')
    .eq('id', itemId)
    .single();

  if (itemErr || !item) {
    throw Object.assign(new Error('Order item not found'), { status: 404 });
  }

  // Verify branch ownership via the order
  if ((item.orders as { branch_id: string }).branch_id !== branchId) {
    throw Object.assign(new Error('Forbidden'), { status: 403 });
  }

  if (item.status === 'served') {
    throw Object.assign(new Error('Item already marked as served'), { status: 422 });
  }

  // Mark item as served
  const { data: updatedItem, error: updateErr } = await supabaseAdmin
    .from('order_items')
    .update({ status: 'served', served_at: new Date().toISOString() })
    .eq('id', itemId)
    .select()
    .single();

  if (updateErr) throw updateErr;

  const orderId = (item.orders as { id: string }).id;

  // Check if ALL items in the order are now served (partial serve support)
  const { data: remainingItems, error: remainErr } = await supabaseAdmin
    .from('order_items')
    .select('id, status')
    .eq('order_id', orderId)
    .neq('status', 'served');

  if (remainErr) throw remainErr;

  const allServed = !remainingItems || remainingItems.length === 0;

  if (allServed) {
    // Update entire order status to 'served'
    await supabaseAdmin
      .from('orders')
      .update({ status: 'served', served_at: new Date().toISOString() })
      .eq('id', orderId);
  }

  // Emit 'item_served' to branch cashier channel
  await supabaseAdmin.channel(`branch:${branchId}:cashier`).send({
    type: 'broadcast',
    event: 'item_served',
    payload: {
      order_item_id: itemId,
      order_id: orderId,
      branch_id: branchId,
      all_served: allServed,
      served_at: updatedItem.served_at,
    },
  });

  return { ...updatedItem, all_items_served: allServed };
}

// ─── Update Item Status (internal / kitchen use) ──────────────────────────────

export async function updateItemStatus(
  itemId: string,
  branchId: string,
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled'
) {
  const validTransitions: Record<string, string[]> = {
    pending: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['served'],
    served: [],
    cancelled: [],
  };

  const { data: item, error: fetchErr } = await supabaseAdmin
    .from('order_items')
    .select('id, status, orders!inner(branch_id)')
    .eq('id', itemId)
    .single();

  if (fetchErr || !item) {
    throw Object.assign(new Error('Order item not found'), { status: 404 });
  }

  const itemBranchId = (item.orders as any)?.branch_id as string;
  if (itemBranchId !== branchId) {
    throw Object.assign(new Error('Forbidden'), { status: 403 });
  }

  const allowed = validTransitions[item.status] ?? [];
  if (!allowed.includes(status)) {
    throw Object.assign(
      new Error(`Invalid transition: ${item.status} → ${status}`),
      { status: 422 }
    );
  }

  const updatePayload: Record<string, unknown> = { status };
  if (status === 'served') updatePayload.served_at = new Date().toISOString();

  const { data: updated, error: updateErr } = await supabaseAdmin
    .from('order_items')
    .update(updatePayload)
    .eq('id', itemId)
    .select()
    .single();

  if (updateErr) throw updateErr;
  return updated;
}
