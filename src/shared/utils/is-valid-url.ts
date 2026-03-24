/**
 * Returns true when `url` is a well-formed http: or https: URL.
 * Rejects bare domains, javascript:, file:, data:, and any other scheme.
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
