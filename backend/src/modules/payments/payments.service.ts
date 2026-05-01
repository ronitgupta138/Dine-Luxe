/**
 * Payments Service
 *
 * TODO markers indicate where real payment gateway integration goes.
 * Currently implements stub logic for development & testing.
 *
 * Gateway candidates: Razorpay (recommended for INR), Stripe (international)
 * See: src/config/payment.ts for SDK initialisation.
 */

import QRCode from 'qrcode';
import { supabaseAdmin } from '../../config/supabase';
import { redis } from '../../config/redis';
import type { InitiateInput, VerifyInput, SplitInput, UPIQRInput } from './payments.schema';

// ─── Initiate Payment ─────────────────────────────────────────────────────────

export async function initiatePayment(
  input: InitiateInput,
  branchId: string,
  restaurantId: string
) {
  const { order_id, payment_method } = input;

  // Fetch order to get amount
  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .select('id, total_amount, status, branch_id')
    .eq('id', order_id)
    .eq('branch_id', branchId)
    .single();

  if (orderErr || !order) {
    throw Object.assign(new Error('Order not found'), { status: 404 });
  }

  if (order.status === 'paid') {
    throw Object.assign(new Error('Order is already paid'), { status: 422 });
  }

  if (order.status === 'cancelled') {
    throw Object.assign(new Error('Cannot pay for a cancelled order'), { status: 422 });
  }

  // TODO: Call payment gateway to create order/session
  // Example (Razorpay):
  //   const razorpayOrder = await razorpay.orders.create({
  //     amount: Math.round(order.total_amount * 100), // paise
  //     currency: 'INR',
  //     receipt: order_id,
  //   });
  //   const gatewayOrderId = razorpayOrder.id;

  const gatewayOrderId: string | null = null; // TODO: replace with real gateway order ID

  // Create payment record in DB
  const { data: payment, error: payErr } = await supabaseAdmin
    .from('payments')
    .insert({
      order_id,
      branch_id: branchId,
      restaurant_id: restaurantId,
      amount: order.total_amount,
      payment_method,
      status: 'pending',
      gateway_order_id: gatewayOrderId,
    })
    .select()
    .single();

  if (payErr || !payment) throw payErr ?? new Error('Failed to create payment record');

  return {
    payment_id: payment.id,
    amount: payment.amount,
    status: 'pending',
    gateway_order_id: gatewayOrderId,
    // TODO: include gateway-specific fields (e.g. razorpay_key_id, checkout_url)
  };
}

// ─── Verify Payment ───────────────────────────────────────────────────────────

export async function verifyPayment(input: VerifyInput, branchId: string) {
  const { payment_id, status, gateway_payment_id, gateway_signature } = input;

  // TODO: Verify gateway signature before trusting status
  // Example (Razorpay):
  //   const expectedSig = crypto
  //     .createHmac('sha256', process.env.RAZORPAY_SECRET!)
  //     .update(`${gatewayOrderId}|${gatewayPaymentId}`)
  //     .digest('hex');
  //   if (expectedSig !== gateway_signature) throw new Error('Invalid signature');

  const { data: payment, error: fetchErr } = await supabaseAdmin
    .from('payments')
    .select('*, orders(branch_id)')
    .eq('id', payment_id)
    .single();

  if (fetchErr || !payment) {
    throw Object.assign(new Error('Payment not found'), { status: 404 });
  }

  if ((payment.orders as { branch_id: string }).branch_id !== branchId) {
    throw Object.assign(new Error('Forbidden'), { status: 403 });
  }

  const { data: updated, error: updateErr } = await supabaseAdmin
    .from('payments')
    .update({
      status,
      gateway_payment_id: gateway_payment_id ?? null,
      gateway_signature: gateway_signature ?? null,
      verified_at: status === 'success' ? new Date().toISOString() : null,
    })
    .eq('id', payment_id)
    .select()
    .single();

  if (updateErr) throw updateErr;

  if (status === 'success') {
    await onPaymentComplete(payment.order_id, branchId, payment.restaurant_id);
  }

  return updated;
}

// ─── Generate UPI QR ──────────────────────────────────────────────────────────

export async function generateUPIQR(input: UPIQRInput, branchId: string) {
  const { order_id, amount: overrideAmount } = input;

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('id, total_amount, branch_id, restaurants(upi_id, name)')
    .eq('id', order_id)
    .eq('branch_id', branchId)
    .single();

  if (error || !order) throw Object.assign(new Error('Order not found'), { status: 404 });

  const restaurant = order.restaurants as { upi_id: string; name: string } | null;
  if (!restaurant?.upi_id) {
    throw Object.assign(new Error('Restaurant UPI ID not configured'), { status: 422 });
  }

  const amount = overrideAmount ?? order.total_amount;
  const transactionRef = `ROS-${order_id.split('-')[0].toUpperCase()}`;
  const description = `Payment for order ${transactionRef}`;

  // UPI deep link format
  const upiLink = `upi://pay?pa=${restaurant.upi_id}&pn=${encodeURIComponent(restaurant.name)}&am=${amount}&tr=${transactionRef}&tn=${encodeURIComponent(description)}&cu=INR`;

  // Generate QR as base64 PNG using 'qrcode' package
  const qrBase64 = await QRCode.toDataURL(upiLink, {
    type: 'image/png',
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  });

  return {
    upi_link: upiLink,
    qr_base64: qrBase64,
    amount,
    transaction_ref: transactionRef,
    upi_id: restaurant.upi_id,
  };
}

// ─── Poll UPI Status ──────────────────────────────────────────────────────────

export async function pollUPIStatus(transactionRef: string, branchId: string) {
  // TODO: Poll real payment gateway for status
  // Example (Razorpay): await razorpay.payments.fetch(gatewayPaymentId)

  // Development stub: check Redis for manual test confirmation
  const redisKey = `upi_payment:${transactionRef}`;
  const testStatus = await redis.get(redisKey);

  if (testStatus) {
    return { status: testStatus, ref: transactionRef, source: 'manual_test' };
  }

  return { status: 'pending', ref: transactionRef, source: 'poll' };
}

// ─── Split Bill ───────────────────────────────────────────────────────────────

export async function splitBill(input: SplitInput, branchId: string, restaurantId: string) {
  const { order_id, splits } = input;

  const totalSplit = splits.reduce((acc, s) => acc + s.amount, 0);

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('id, total_amount')
    .eq('id', order_id)
    .eq('branch_id', branchId)
    .single();

  if (error || !order) throw Object.assign(new Error('Order not found'), { status: 404 });

  // Allow ±1 rupee rounding tolerance
  if (Math.abs(totalSplit - order.total_amount) > 1) {
    throw Object.assign(
      new Error(`Split amounts (${totalSplit}) do not match order total (${order.total_amount})`),
      { status: 422 }
    );
  }

  // Create individual payment stubs for each split
  const paymentInserts = splits.map((s) => ({
    order_id,
    branch_id: branchId,
    restaurant_id: restaurantId,
    amount: s.amount,
    payment_method: s.payment_method,
    status: 'pending',
    meta: { label: s.label, is_split: true },
  }));

  const { data: payments, error: insertErr } = await supabaseAdmin
    .from('payments')
    .insert(paymentInserts)
    .select();

  if (insertErr) throw insertErr;
  return payments;
}

// ─── Get Receipt ─────────────────────────────────────────────────────────────

export async function getReceipt(orderId: string, branchId: string) {
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select(
      `*, order_items(*, menu_items(name, price)), payments(id, amount, payment_method, status, verified_at), tables(table_number), branches(name, address), restaurants(name, logo_url)`
    )
    .eq('id', orderId)
    .eq('branch_id', branchId)
    .single();

  if (error || !order) throw Object.assign(new Error('Order not found'), { status: 404 });

  // TODO: generate PDF receipt using PDFKit or similar and upload to Supabase Storage
  // For now: return structured receipt data
  return {
    receipt_type: 'json',
    order_id: orderId,
    data: order,
    // pdf_url: 'https://...' // TODO: real PDF URL
  };
}

// ─── On Payment Complete (internal) ──────────────────────────────────────────

export async function onPaymentComplete(
  orderId: string,
  branchId: string,
  restaurantId: string
) {
  // 1. Mark order as paid
  await supabaseAdmin
    .from('orders')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', orderId);

  // 2. Update table status to 'cleaning'
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('table_id')
    .eq('id', orderId)
    .single();

  if (order?.table_id) {
    await supabaseAdmin
      .from('tables')
      .update({ status: 'cleaning' })
      .eq('id', order.table_id);
  }

  // 3. TODO: Trigger async receipt PDF generation
  // await generateAndUploadReceiptPDF(orderId);

  // 4. Emit 'payment_confirmed' Realtime event
  const payload = {
    event: 'payment_confirmed',
    order_id: orderId,
    branch_id: branchId,
    restaurant_id: restaurantId,
    paid_at: new Date().toISOString(),
  };

  await supabaseAdmin.channel(`branch:${branchId}:cashier`).send({
    type: 'broadcast',
    event: 'payment_confirmed',
    payload,
  });

  await supabaseAdmin.channel(`branch:${branchId}:manager`).send({
    type: 'broadcast',
    event: 'payment_confirmed',
    payload,
  });
}

// ─── Webhook Handler ──────────────────────────────────────────────────────────

export async function handleGatewayWebhook(body: Record<string, unknown>) {
  // TODO: Implement real webhook signature verification
  // Razorpay: verify X-Razorpay-Signature header
  // Stripe: stripe.webhooks.constructEvent(rawBody, sig, endpointSecret)

  console.log('[webhook] Received gateway event:', body.event);

  // TODO: parse gateway-specific payload and call onPaymentComplete / verifyPayment
  return { received: true };
}
