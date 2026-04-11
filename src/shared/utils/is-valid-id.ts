/**
 * Returns true when `id` is a non-empty string suitable for use as a UUID row ID.
 */
export function isValidId(id: unknown): id is string {
  return typeof id === 'string' && id.trim().length > 0;
}
