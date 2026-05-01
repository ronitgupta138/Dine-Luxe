import { supabaseAdmin } from '../config/supabase';

interface AuditLogParams {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Inserts a record into the audit_logs table.
 *
 * NEVER throws — all errors are caught and logged silently.
 * Safe to fire-and-forget without await in hot paths.
 *
 * Usage:
 *   await insertAuditLog({ actorId, action: 'STAFF_CREATED', ... });
 *   insertAuditLog({ ... }).catch(() => {}); // fire-and-forget
 */
export async function insertAuditLog(params: AuditLogParams): Promise<void> {
  try {
    const { error } = await supabaseAdmin.from('audit_logs').insert({
      actor_id: params.actorId,
      action: params.action,
      target_type: params.targetType,
      target_id: params.targetId,
      old_value: params.oldValue ?? null,
      new_value: params.newValue ?? null,
      ip_address: params.ipAddress ?? null,
      metadata: params.metadata ?? null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      // Log silently — never propagate audit log failures to callers
      console.error(`[AuditLog] Failed to insert: ${error.message}`, {
        action: params.action,
        targetId: params.targetId,
      });
    }
  } catch (err) {
    // Catch any unexpected errors — audit log must never break the main flow
    console.error('[AuditLog] Unexpected error:', err);
  }
}
