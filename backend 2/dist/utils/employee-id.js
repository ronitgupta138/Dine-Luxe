"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEmployeeId = generateEmployeeId;
const supabase_1 = require("../config/supabase");
const slugify_1 = require("./slugify");
/**
 * Generates a unique employee ID in format: EMP-{BRANCHCODE}-{SEQUENCE}
 * e.g. EMP-CP-001, EMP-MG-042
 *
 * @param branchName  - Human-readable branch name e.g. "Connaught Place"
 * @param branchId    - UUID of the branch (for sequence scoping)
 */
async function generateEmployeeId(branchName, branchId) {
    const branchCode = (0, slugify_1.slugify)(branchName).toUpperCase();
    // Get the current max sequence for this branch
    const { data, error } = await supabase_1.supabaseAdmin
        .from('users')
        .select('employee_id')
        .eq('branch_id', branchId)
        .like('employee_id', `EMP-${branchCode}-%`)
        .order('employee_id', { ascending: false })
        .limit(1);
    if (error)
        throw new Error(`Failed to query employee IDs: ${error.message}`);
    let nextSeq = 1;
    if (data && data.length > 0 && data[0].employee_id) {
        // Extract the sequence number from the last employee ID
        // Format: EMP-CP-042 → "042" → 42
        const parts = data[0].employee_id.split('-');
        const lastSeq = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastSeq))
            nextSeq = lastSeq + 1;
    }
    // Zero-pad to 3 digits: 1 → "001", 42 → "042"
    const paddedSeq = String(nextSeq).padStart(3, '0');
    return `EMP-${branchCode}-${paddedSeq}`;
}
//# sourceMappingURL=employee-id.js.map