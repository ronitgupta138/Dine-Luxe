import { supabaseAdmin } from '../../config/supabase';
import { redis } from '../../config/redis';
import { findLeastBusyWaiter } from '../../utils/waiter-assign';
import type { CreateOrderInput } from './orders.schema';

// ─── Create Order ────────────────────────────────────────────────────────────
export async function createOrder(
  input: CreateOrderInput,
  restaurantId: string,
  branchId: string,
  createdBy: string
) {
  const { table_id, order_type, items, special_instructions } = input;

  // 1. Validate table belongs to this branch
  const { data: table, error: tableErr } = await supabaseAdmin
    .from('tables')
    .select('id, branch_id, status')
    .eq('id', table_id)
    .eq('branch_id', branchId)
    .single();

  if (tableErr || !table) {
    throw Object.assign(new Error('Table not found or does not belong to this branch'), { statusCode: 404 });
  }

  // 2. Validate all menu items belong to this branch and are available
  const menuItemIds = items.map((i) => i.menu_item_id);
  const { data: menuItems, error: menuErr } = await supabaseAdmin
    .from('menu_items')
    .select('id, name, price, status, branch_id')
    .in('id', menuItemIds)
    .eq('branch_id', branchId);

  if (menuErr) throw menuErr;

  if (!menuItems || menuItems.length !== menuItemIds.length) {
    throw Object.assign(new Error('One or more menu items not found in this branch'), { statusCode: 422 });
  }

  const unavailable = menuItems.filter((m) => m.status !== 'available');
  if (unavailable.length > 0) {
    throw Object.assign(
      new Error(`Items not available: ${unavailable.map((m) => m.name).join(', ')}`),
      { statusCode: 422 }
    );
  }

  // 3. Build price map and validate addons
  const priceMap = Object.fromEntries(menuItems.map((m) => [m.id, m.price]));
  const addonIds = items.flatMap((i) => (i.addons ?? []).map((a) => a.addon_id));
  let addonPriceMap: Record<string, number> = {};

  if (addonIds.length > 0) {
    const { data: addons, error: addonErr } = await supabaseAdmin
      .from('menu_addons')
      .select('id, price')
      .in('id', addonIds);
    if (addonErr) throw addonErr;
    addonPriceMap = Object.fromEntries((addons ?? []).map((a) => [a.id, a.price]));
  }

  // 4. Calculate total (stored per order_items, not on orders table)
  let total = 0;
  for (const item of items) {
    const unitPrice = Number(priceMap[item.menu_item_id]) || 0;
    let addonTotal = 0;
    for (const addon of item.addons ?? []) {
      addonTotal += (addonPriceMap[addon.addon_id] ?? 0) * addon.quantity;
    }
    total += (unitPrice + addonTotal) * item.quantity;
  }

  // 5. Auto-assign waiter
  const assignedWaiterId = await findLeastBusyWaiter(branchId);

  // 6. FIX: Insert only columns that exist in orders table
  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .insert({
      branch_id: branchId,
      table_id: table_id ?? null,
      customer_id: createdBy,
      waiter_id: assignedWaiterId ?? null,
      order_type,
      special_instructions: special_instructions ?? null,
      status: 'created',
    })
    .select()
    .single();

  if (orderErr || !order) throw orderErr ?? new Error('Failed to create order');

  // 7. Insert order items
  const orderItemsPayload = items.map((item) => {
    const unitPrice = Number(priceMap[item.menu_item_id]) || 0;
    return {
      order_id: order.id,
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      unit_price: unitPrice,
      notes: item.notes ?? null,
      status: 'pending',
      addons: item.addons?.length ? item.addons : null,
    };
  });

  const { error: itemsErr } = await supabaseAdmin.from('order_items').insert(orderItemsPayload);
  if (itemsErr) {
    // Rollback order on item insert failure
    await supabaseAdmin.from('orders').delete().eq('id', order.id);
    throw itemsErr;
  }

  // 8. Mark table as occupied
  await supabaseAdmin
    .from('tables')
    .update({ status: 'occupied', updated_at: new Date().toISOString() })
    .eq('id', table_id);

  // 9. Emit Realtime events to kitchen and cashier channels
  const realtimePayload = {
    event: 'order_created',
    order_id: order.id,
    branch_id: branchId,
    table_id,
    computed_total: total,
    status: 'created',
  };

  await supabaseAdmin.channel(`branch:${branchId}:kitchen`).send({
    type: 'broadcast',
    event: 'order_created',
    payload: realtimePayload,
  });

  await supabaseAdmin.channel(`branch:${branchId}:cashier`).send({
    type: 'broadcast',
    event: 'order_created',
    payload: realtimePayload,
  });

  // 10. Trigger inventory deduction (fire-and-forget)
  deductInventory(branchId, items).catch((err) =>
    console.error('[inventory] deduction failed:', err)
  );

  return { ...order, computed_total: total, items: orderItemsPayload };
}

// ─── Inventory Deduction (internal) ─────────────────────────────────────────
async function deductInventory(branchId: string, items: CreateOrderInput['items']) {
  for (const item of items) {
    await supabaseAdmin.rpc('deduct_inventory_for_item', {
      p_branch_id: branchId,
      p_menu_item_id: item.menu_item_id,
      p_quantity: item.quantity,
    });
  }
}

// ─── Get Order by ID ─────────────────────────────────────────────────────────
export async function getOrderById(orderId: string, branchId: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*, menu_items(name, price))')
    .eq('id', orderId)
    .eq('branch_id', branchId)
    .single();

  if (error || !data) {
    throw Object.assign(new Error('Order not found'), { statusCode: 404 });
  }
  return data;
}

// ─── Get Active Orders for Table ─────────────────────────────────────────────
export async function getOrdersByTable(tableId: string, branchId: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*, menu_items(name, price))')
    .eq('table_id', tableId)
    .eq('branch_id', branchId)
    .not('status', 'in', '("paid","closed")')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ─── Get Active Orders for Branch ────────────────────────────────────────────
export async function getActiveBranchOrders(branchId: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(id, status, menu_items(name)), tables(label)')
    .eq('branch_id', branchId)
    .not('status', 'in', '("paid","closed")')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// ─── Cancel Order ─────────────────────────────────────────────────────────────
export async function cancelOrder(orderId: string, branchId: string, reason?: string) {
  const { data: order, error: fetchErr } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(id, status)')
    .eq('id', orderId)
    .eq('branch_id', branchId)
    .single();

  if (fetchErr || !order) {
    throw Object.assign(new Error('Order not found'), { statusCode: 404 });
  }

  if (['paid', 'closed'].includes(order.status)) {
    throw Object.assign(new Error(`Cannot cancel order with status: ${order.status}`), { statusCode: 422 });
  }

  const servedItems = (order.order_items ?? []).filter(
    (i: { status: string }) => i.status === 'served'
  );
  if (servedItems.length > 0) {
    throw Object.assign(
      new Error('Cannot cancel order — some items have already been served'),
      { statusCode: 422 }
    );
  }

  // FIX: cancellation_reason and cancelled_at do not exist in schema — just update status
  const { data: updated, error: updateErr } = await supabaseAdmin
    .from('orders')
    .update({ status: 'closed', updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();

  if (updateErr) throw updateErr;

  // Cache cancellation reason in Redis for UI display (not persisted in DB)
  if (reason) {
    await redis.setex(`order_cancel_reason:${orderId}`, 60 * 60 * 24, reason);
  }

  return updated;
}
