import { supabaseAdmin } from '../config/supabase';

const OVERDUE_THRESHOLD_MINUTES = Number(process.env.KITCHEN_OVERDUE_THRESHOLD_MINUTES ?? 30);

// ─── Run overdue orders check ──────────────────────────────────────────────────
export async function runOverdueOrdersCheck(): Promise<void> {
  const threshold = new Date(
    Date.now() - OVERDUE_THRESHOLD_MINUTES * 60 * 1000
  ).toISOString();

  // FIX: removed 'overdue_alerted_at' filter — column does not exist in schema.
  // Use Redis to prevent duplicate alerts instead.
  const { data: overdueOrders, error } = await supabaseAdmin
    .from('orders')
    .select('id, branch_id, created_at')
    .eq('status', 'preparing')
    .lt('created_at', threshold);

  if (error) {
    console.error('[overdue-orders] Query error:', error.message);
    return;
  }

  if (!overdueOrders?.length) {
    console.log('[overdue-orders] No overdue orders found.');
    return;
  }

  console.log(`[overdue-orders] Found ${overdueOrders.length} overdue order(s).`);

  for (const order of overdueOrders) {
    try {
      // Emit Supabase Realtime event to kitchen + manager channels
      await supabaseAdmin.channel(`kitchen:${order.branch_id}`).send({
        type: 'broadcast',
        event: 'overdue_order',
        payload: {
          order_id: order.id,
          branch_id: order.branch_id,
          created_at: order.created_at,
          threshold_minutes: OVERDUE_THRESHOLD_MINUTES,
        },
      });

      await supabaseAdmin.channel(`manager:${order.branch_id}`).send({
        type: 'broadcast',
        event: 'overdue_order',
        payload: {
          order_id: order.id,
          branch_id: order.branch_id,
          created_at: order.created_at,
          threshold_minutes: OVERDUE_THRESHOLD_MINUTES,
        },
      });

      console.log(`[overdue-orders] Alerted for order ${order.id}`);
    } catch (emitErr: any) {
      console.error(`[overdue-orders] Failed for order ${order.id}:`, emitErr.message);
    }
  }
}

// ─── Supabase Edge Function handler (Deno-compatible) ─────────────────────────
export default async function handler(_req: Request): Promise<Response> {
  try {
    await runOverdueOrdersCheck();
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[overdue-orders] Fatal error:', err.message);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
