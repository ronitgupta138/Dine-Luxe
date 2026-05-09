"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertAuditLog = insertAuditLog;
const supabase_1 = require("../config/supabase");
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
async function insertAuditLog(params) {
    try {
        const { error } = await supabase_1.supabaseAdmin.from('audit_logs').insert({
            actor_id: params.actorId,
            action: params.action,
            target_type: params.targetType,
            target_id: params.targetId,
            old_value: params.oldValue ?? null,
            new_value: params.newValue ?? null,
            ip_address: params.ipAddress ?? null,
            // BUG FIX: 'metadata' column does not exist in audit_logs table.
            // Extra fields from callers are merged into new_value instead.
            created_at: new Date().toISOString(),
        });
        if (error) {
            // Log silently — never propagate audit log failures to callers
            console.error(`[AuditLog] Failed to insert: ${error.message}`, {
                action: params.action,
                targetId: params.targetId,
            });
        }
    }
    catch (err) {
        // Catch any unexpected errors — audit log must never break the main flow
        console.error('[AuditLog] Unexpected error:', err);
    }
}
//# sourceMappingURL=audit-log.js.map