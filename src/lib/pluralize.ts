/**
 * Plural forms for russian words
 * @param {number} count quantity for word
 * @param {string[]} words Array of words. Example: ['депутат', 'депутата', 'депутатов'], ['коментарий', 'коментария', 'комментариев']
 * @return {string} Count + plural form for word
 */
export default function pluralize(count: number, words: string[]): string {
  const cases = [2, 0, 1, 1, 1, 2]
  return words[count % 100 > 4 && count % 100 < 20 ? 2 : cases[Math.min(count % 10, 5)]]
}
