/**
 * Plural forms for Russian words
 * @param count - Quantity for word
 * @param words - Array of words. Example: ['депутат', 'депутата', 'депутатов']
 * @returns Plural form for word based on count
 */
export default function pluralize(count: number, words: [string, string, string]): string {
  const cases = [2, 0, 1, 1, 1, 2] as const
  return words[count % 100 > 4 && count % 100 < 20 ? 2 : cases[Math.min(count % 10, 5)]]
}
