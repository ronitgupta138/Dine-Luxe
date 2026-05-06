/**
 * Converts a branch name to a short uppercase code for employee IDs.
 *
 * Strategy:
 *   1. If all words are single chars (already initials) → join: "C P" → "CP"
 *   2. Multi-word name → take first letter of each word: "Connaught Place" → "CP"
 *   3. Single word → take first 2-3 chars: "Noida" → "NOI"
 *   4. Trailing numbers are preserved: "Branch 1" → "B1", "Sector 62" → "S62"
 *
 * Examples:
 *   "Connaught Place"  → "CP"
 *   "MG Road"          → "MGR"
 *   "Branch 1"         → "B1"
 *   "Sector 62"        → "S62"
 *   "Andheri East"     → "AE"
 *   "Downtown"         → "DOW"
 */
export declare function slugify(str: string): string;
//# sourceMappingURL=slugify.d.ts.map