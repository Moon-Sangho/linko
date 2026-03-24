/**
 * Returns true when `id` is a positive integer suitable for use as a database row ID.
 * Rejects floats, zero, negatives, strings, and null/undefined.
 */
export function isValidId(id: unknown): id is number {
  return typeof id === 'number' && Number.isInteger(id) && id > 0;
}
