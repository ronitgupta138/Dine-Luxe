"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDefaultPassword = generateDefaultPassword;
/**
 * Generates a default password from a date-of-birth.
 * Format: DDMMYYYY
 * Example: DOB 1998-05-15  →  "15051998"
 */
function generateDefaultPassword(dob) {
    const day = String(dob.getUTCDate()).padStart(2, '0');
    const month = String(dob.getUTCMonth() + 1).padStart(2, '0');
    const year = String(dob.getUTCFullYear());
    return `${day}${month}${year}`;
}
//# sourceMappingURL=password.js.map