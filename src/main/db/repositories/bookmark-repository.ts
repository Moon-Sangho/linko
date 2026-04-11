import { randomUUID } from 'crypto';
import type Database from 'better-sqlite3';
import type {
  Bookmark,
  BookmarkPage,
  Tag,
  CreateBookmarkInput,
  UpdateBookmarkInput,
  SearchBookmarksInput,
  GetBookmarksPageInput,
} from '@shared/types/domains';

// ─── Repository Interface ─────────────────────────────────────────────────────

export interface BookmarkRepository {
  getAll(): Bookmark[];
  getPage(input: GetBookmarksPageInput): BookmarkPage;
  getById(id: string): Bookmark | null;
  create(input: CreateBookmarkInput): Bookmark;
  createWithId(id: string, input: CreateBookmarkInput): Bookmark;
  update(id: string, input: UpdateBookmarkInput): Bookmark;
  delete(id: string): void;
  deleteAll(): void;
  search(input: SearchBookmarksInput): Bookmark[];
  isDuplicate(url: string, excludeId?: string): boolean;
}

// ─── Row Types (raw SQLite rows) ──────────────────────────────────────────────

interface BookmarkRow {
  id: string;
  url: string;
  title: string | null;
  notes: string | null;
  favicon_url: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Local Repository ─────────────────────────────────────────────────────────

export class LocalBookmarkRepository implements BookmarkRepository {
  constructor(private readonly db: Database.Database) {}

  getAll(): Bookmark[] {
    const rows = this.db
      .prepare<[], BookmarkRow>(
        `SELECT id, url, title, notes, favicon_url, created_at, updated_at
         FROM bookmarks
         ORDER BY created_at DESC`,
      )
      .all();

    return this.bulkAttachTags(rows);
  }

  getPage(input: GetBookmarksPageInput): BookmarkPage {
    const { query, tagIds, limit, offset } = input;
    const hasQuery = query && query.trim().length > 0;
    const hasTags = tagIds && tagIds.length > 0;

    let rows: BookmarkRow[];

    if (hasQuery) {
      const ftsQuery = query!
        .trim()
        .split(/\s+/)
        .map((term) => `"${term.replace(/"/g, '""')}"*`)
        .join(' OR ');

      rows = this.db
        .prepare<[string], BookmarkRow>(
          `SELECT b.id, b.url, b.title, b.notes, b.favicon_url, b.created_at, b.updated_at
           FROM bookmarks b
           JOIN bookmarks_fts fts ON fts.rowid = b.rowid
           WHERE bookmarks_fts MATCH ?
           ORDER BY rank`,
        )
        .all(ftsQuery);
    } else {
      rows = this.db
        .prepare<[], BookmarkRow>(
          `SELECT id, url, title, notes, favicon_url, created_at, updated_at
           FROM bookmarks ORDER BY created_at DESC`,
        )
        .all();
    }

    if (hasTags) {
      const placeholders = tagIds!.map(() => '?').join(', ');
      const taggedIds = new Set(
        this.db
          .prepare<string[], { bookmark_id: string }>(
            `SELECT DISTINCT bookmark_id FROM bookmark_tags WHERE tag_id IN (${placeholders})`,
          )
          .all(...tagIds!)
          .map((r) => r.bookmark_id),
      );
      rows = rows.filter((r) => taggedIds.has(r.id));
    }

    const page = rows.slice(offset, offset + limit);
    return {
      results: this.bulkAttachTags(page),
      hasMore: offset + limit < rows.length,
    };
  }

  getById(id: string): Bookmark | null {
    const row = this.db
      .prepare<[string], BookmarkRow>(
        `SELECT id, url, title, notes, favicon_url, created_at, updated_at
         FROM bookmarks WHERE id = ?`,
      )
      .get(id);

    if (!row) return null;
    return this.attachTags(row);
  }

  create(input: CreateBookmarkInput): Bookmark {
    return this.createWithId(randomUUID(), input);
  }

  createWithId(id: string, input: CreateBookmarkInput): Bookmark {
    const now = new Date().toISOString();

    this.db
      .prepare(
        `INSERT INTO bookmarks (id, url, title, notes, favicon_url, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        id,
        input.url,
        input.title ?? null,
        input.notes ?? null,
        input.favicon_url ?? null,
        now,
        now,
      );

    if (input.tagIds && input.tagIds.length > 0) {
      this.setTags(id, input.tagIds);
    }

    return this.getById(id)!;
  }

  update(id: string, input: UpdateBookmarkInput): Bookmark {
    const existing = this.getById(id);
    if (!existing) throw new Error(`Bookmark ${id} not found`);

    const now = new Date().toISOString();

    this.db
      .prepare(
        `UPDATE bookmarks SET
           url         = COALESCE(?, url),
           title       = ?,
           notes       = ?,
           favicon_url = COALESCE(?, favicon_url),
           updated_at  = ?
         WHERE id = ?`,
      )
      .run(
        input.url ?? null,
        input.title !== undefined ? input.title : existing.title,
        input.notes !== undefined ? input.notes : existing.notes,
        input.favicon_url ?? null,
        now,
        id,
      );

    if (input.tagIds !== undefined) {
      this.setTags(id, input.tagIds);
    }

    return this.getById(id)!;
  }

  delete(id: string): void {
    this.db.prepare(`DELETE FROM bookmark_tags WHERE bookmark_id = ?`).run(id);
    this.db.prepare(`DELETE FROM bookmarks WHERE id = ?`).run(id);
    this.db
      .prepare(`DELETE FROM tags WHERE id NOT IN (SELECT DISTINCT tag_id FROM bookmark_tags)`)
      .run();
  }

  deleteAll(): void {
    this.db.prepare(`DELETE FROM bookmark_tags`).run();
    this.db.prepare(`DELETE FROM bookmarks`).run();
    this.db.prepare(`DELETE FROM tags`).run();
  }

  search(input: SearchBookmarksInput): Bookmark[] {
    const { query, tagIds } = input;
    const hasQuery = query && query.trim().length > 0;
    const hasTags = tagIds && tagIds.length > 0;

    if (!hasQuery && !hasTags) return this.getAll();

    let rows: BookmarkRow[];

    if (hasQuery) {
      const ftsQuery = query!
        .trim()
        .split(/\s+/)
        .map((term) => `"${term.replace(/"/g, '""')}"*`)
        .join(' OR ');

      rows = this.db
        .prepare<[string], BookmarkRow>(
          `SELECT b.id, b.url, b.title, b.notes, b.favicon_url, b.created_at, b.updated_at
           FROM bookmarks b
           JOIN bookmarks_fts fts ON fts.rowid = b.rowid
           WHERE bookmarks_fts MATCH ?
           ORDER BY rank`,
        )
        .all(ftsQuery);
    } else {
      rows = this.db
        .prepare<[], BookmarkRow>(
          `SELECT id, url, title, notes, favicon_url, created_at, updated_at
           FROM bookmarks ORDER BY created_at DESC`,
        )
        .all();
    }

    if (hasTags) {
      const placeholders = tagIds!.map(() => '?').join(', ');
      const taggedIds = new Set(
        this.db
          .prepare<string[], { bookmark_id: string }>(
            `SELECT DISTINCT bookmark_id FROM bookmark_tags WHERE tag_id IN (${placeholders})`,
          )
          .all(...tagIds!)
          .map((r) => r.bookmark_id),
      );
      rows = rows.filter((r) => taggedIds.has(r.id));
    }

    return this.bulkAttachTags(rows);
  }

  isDuplicate(url: string, excludeId?: string): boolean {
    const row = this.db
      .prepare<[string], { id: string }>(`SELECT id FROM bookmarks WHERE url = ? LIMIT 1`)
      .get(url);

    if (!row) return false;
    if (excludeId !== undefined && row.id === excludeId) return false;
    return true;
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  private attachTags(row: BookmarkRow): Bookmark {
    const tags = this.db
      .prepare<[string], Tag>(
        `SELECT t.id, t.name
         FROM tags t
         JOIN bookmark_tags bt ON bt.tag_id = t.id
         WHERE bt.bookmark_id = ?
         ORDER BY t.name`,
      )
      .all(row.id);

    return { ...row, tags };
  }

  private bulkAttachTags(rows: BookmarkRow[]): Bookmark[] {
    if (rows.length === 0) return [];

    const ids = rows.map((r) => r.id);
    const placeholders = ids.map(() => '?').join(', ');

    const tagRows = this.db
      .prepare<string[], { bookmark_id: string; id: string; name: string }>(
        `SELECT bt.bookmark_id, t.id, t.name
         FROM tags t
         JOIN bookmark_tags bt ON bt.tag_id = t.id
         WHERE bt.bookmark_id IN (${placeholders})
         ORDER BY t.name`,
      )
      .all(...ids);

    const tagMap = new Map<string, Tag[]>();
    for (const { bookmark_id, id, name } of tagRows) {
      const list = tagMap.get(bookmark_id) ?? [];
      list.push({ id, name });
      tagMap.set(bookmark_id, list);
    }

    return rows.map((row) => ({ ...row, tags: tagMap.get(row.id) ?? [] }));
  }

  private setTags(bookmarkId: string, tagIds: string[]): void {
    this.db.prepare(`DELETE FROM bookmark_tags WHERE bookmark_id = ?`).run(bookmarkId);

    const insert = this.db.prepare(
      `INSERT OR IGNORE INTO bookmark_tags (bookmark_id, tag_id) VALUES (?, ?)`,
    );

    for (const tagId of tagIds) {
      insert.run(bookmarkId, tagId);
    }

    this.db
      .prepare(`DELETE FROM tags WHERE id NOT IN (SELECT DISTINCT tag_id FROM bookmark_tags)`)
      .run();
  }
}
