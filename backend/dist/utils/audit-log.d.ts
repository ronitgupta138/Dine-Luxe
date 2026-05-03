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
export declare function insertAuditLog(params: AuditLogParams): Promise<void>;
export {};
//# sourceMappingURL=audit-log.d.ts.map