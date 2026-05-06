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
export function slugify(str: string): string {
  if (!str || str.trim().length === 0) return 'BR';

  const cleaned = str.trim().replace(/[^a-zA-Z0-9\s]/g, '');
  const words = cleaned.split(/\s+/).filter(Boolean);

  if (words.length === 0) return 'BR';

  if (words.length === 1) {
    const word = words[0];
    // If it's a number, prefix with "B"
    if (/^\d+$/.test(word)) return `B${word}`;
    // Single word → first 3 chars
    return word.substring(0, 3).toUpperCase();
  }

  // Multi-word: take first letter of each word, preserve digits
  const code = words
    .map((word) => {
      if (/^\d+$/.test(word)) return word;   // preserve numbers as-is
      return word[0].toUpperCase();           // first letter of word
    })
    .join('');

  return code.substring(0, 5); // max 5 chars
}
