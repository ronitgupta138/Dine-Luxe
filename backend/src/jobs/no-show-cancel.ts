import { supabaseAdmin } from '../config/supabase';
import { sendPush } from '../modules/notifications/notifications.service';

const NO_SHOW_GRACE_MINUTES = Number(process.env.QUEUE_NO_SHOW_GRACE_MINUTES ?? 15);

// ─── Run no-show cancellation ──────────────────────────────────────────────────
export async function runNoShowCancellation(): Promise<void> {
  const graceCutoff = new Date(
    Date.now() - NO_SHOW_GRACE_MINUTES * 60 * 1000
  ).toISOString();

  // FIX: 'assigned_table_id' → 'table_id' (actual schema column name)
  const { data: noShows, error } = await supabaseAdmin
    .from('queue_entries')
    .select('id, branch_id, user_id, table_id')
    .eq('status', 'arrived')
    .lt('arrived_at', graceCutoff);

  if (error) {
    console.error('[no-show-cancel] Query error:', error.message);
    return;
  }

  if (!noShows?.length) {
    console.log('[no-show-cancel] No no-shows found.');
    return;
  }

  console.log(`[no-show-cancel] Processing ${noShows.length} no-show(s).`);

  for (const entry of noShows) {
    try {
      // FIX: removed 'updated_at' — queue_entries has no updated_at column in schema
      await supabaseAdmin
        .from('queue_entries')
        .update({ status: 'no_show' })
        .eq('id', entry.id);

      // Release the reserved table back to free
      if (entry.table_id) {
        await supabaseAdmin
          .from('tables')
          .update({ status: 'free', updated_at: new Date().toISOString() })
          .eq('id', entry.table_id);
      }

      // Emit queue_updated event to host channel
      await supabaseAdmin.channel(`host:${entry.branch_id}`).send({
        type: 'broadcast',
        event: 'queue_updated',
        payload: {
          branch_id: entry.branch_id,
          entry_id: entry.id,
          reason: 'no_show',
        },
      });

      // Notify the customer — fire and forget
      if (entry.user_id) {
        sendPush(
          entry.user_id,
          'Queue Position Removed',
          `Your queue spot was removed after ${NO_SHOW_GRACE_MINUTES} minutes. Please rejoin if you'd like a table.`,
          { type: 'queue_no_show', branch_id: entry.branch_id }
        );
      }

      console.log(`[no-show-cancel] Processed entry ${entry.id}`);
    } catch (err: any) {
      console.error(`[no-show-cancel] Failed for entry ${entry.id}:`, err.message);
    }
  }
}

// ─── Supabase Edge Function handler (Deno-compatible) ─────────────────────────
export default async function handler(_req: Request): Promise<Response> {
  try {
    await runNoShowCancellation();
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[no-show-cancel] Fatal error:', err.message);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
