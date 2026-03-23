import type { UrlMetadata } from '../../shared/types';

const FETCH_TIMEOUT_MS = 5000;

/**
 * Fetch page title and favicon from a URL.
 * Returns nulls on any failure — callers should treat metadata as optional.
 */
export async function fetchUrlMetadata(url: string): Promise<UrlMetadata> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Linko/0.1 (bookmark manager)' },
    });

    clearTimeout(timer);

    if (!response.ok) return { title: null, favicon_url: null };

    const html = await response.text();
    const origin = new URL(url).origin;

    return {
      title: extractTitle(html),
      favicon_url: extractFaviconUrl(html, origin),
    };
  } catch {
    return { title: null, favicon_url: null };
  }
}

function extractTitle(html: string): string | null {
  // Try <title> tag first, then og:title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch?.[1]) return decodeHtmlEntities(titleMatch[1].trim());

  const ogTitleMatch = html.match(
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
  );
  if (ogTitleMatch?.[1]) return decodeHtmlEntities(ogTitleMatch[1].trim());

  return null;
}

function extractFaviconUrl(html: string, origin: string): string | null {
  // Look for explicit favicon links (prefer 32px+ sizes, fall back to any)
  const patterns = [
    /<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["']/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*icon[^"']*["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return resolveUrl(match[1], origin);
    }
  }

  // Fall back to the standard /favicon.ico path
  return `${origin}/favicon.ico`;
}

function resolveUrl(href: string, origin: string): string {
  try {
    return new URL(href, origin).href;
  } catch {
    return `${origin}/favicon.ico`;
  }
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'");
}
