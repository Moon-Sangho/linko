import fs from 'fs/promises';
import type { ImportSummary } from '@shared/types/domains';
import { isValidUrl } from '@shared/utils/is-valid-url';
import type { BookmarkRepository } from '@main/db/repositories/bookmark-repository';

interface ParsedBookmark {
  url: string;
  title: string | null;
}

/**
 * Import bookmarks from a Netscape Bookmark Format HTML file (exported by all major browsers).
 * Skips duplicates (by URL) and records a summary.
 */
export async function importFromHtmlFile(
  filePath: string,
  repo: BookmarkRepository,
): Promise<ImportSummary> {
  const html = await fs.readFile(filePath, 'utf-8');
  const parsed = parseBrowserBookmarks(html);

  const summary: ImportSummary = { added: 0, skipped: 0, errors: 0 };

  for (const item of parsed) {
    if (!isValidUrl(item.url)) {
      summary.errors++;
      continue;
    }

    if (repo.isDuplicate(item.url)) {
      summary.skipped++;
      continue;
    }

    try {
      repo.create({ url: item.url, title: item.title });
      summary.added++;
    } catch {
      summary.errors++;
    }
  }

  return summary;
}

function parseBrowserBookmarks(html: string): ParsedBookmark[] {
  const bookmarks: ParsedBookmark[] = [];
  // Netscape Bookmark Format: <A HREF="url" ...>title</A>
  const pattern = /<a\s[^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html)) !== null) {
    bookmarks.push({
      url: match[1].trim(),
      title: match[2].trim() || null,
    });
  }

  return bookmarks;
}
