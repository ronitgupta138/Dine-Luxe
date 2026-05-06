/**
 * Generates a default password from a date-of-birth.
 * Format: DDMMYYYY
 * Example: DOB 1998-05-15  →  "15051998"
 */
export function generateDefaultPassword(dob: Date): string {
  const day = String(dob.getUTCDate()).padStart(2, '0');
  const month = String(dob.getUTCMonth() + 1).padStart(2, '0');
  const year = String(dob.getUTCFullYear());
  return `${day}${month}${year}`;
}
