import { supabaseAdmin } from '../config/supabase';
import { slugify } from './slugify';

/**
 * Generates a unique employee ID in format: EMP-{BRANCHCODE}-{SEQUENCE}
 * e.g. EMP-CP-001, EMP-MG-042
 *
 * @param branchName  - Human-readable branch name e.g. "Connaught Place"
 * @param branchId    - UUID of the branch (for sequence scoping)
 */
export async function generateEmployeeId(
  branchName: string,
  branchId: string
): Promise<string> {
  const branchCode = slugify(branchName).toUpperCase();

  // Get the current max sequence for this branch
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('employee_id')
    .eq('branch_id', branchId)
    .like('employee_id', `EMP-${branchCode}-%`)
    .order('employee_id', { ascending: false })
    .limit(1);

  if (error) throw new Error(`Failed to query employee IDs: ${error.message}`);

  let nextSeq = 1;

  if (data && data.length > 0 && data[0].employee_id) {
    // Extract the sequence number from the last employee ID
    // Format: EMP-CP-042 → "042" → 42
    const parts = data[0].employee_id.split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
  }

  // Zero-pad to 3 digits: 1 → "001", 42 → "042"
  const paddedSeq = String(nextSeq).padStart(3, '0');

  return `EMP-${branchCode}-${paddedSeq}`;
}
