import Database from 'better-sqlite3';
import type {
  Bookmark,
  Tag,
  CreateBookmarkInput,
  UpdateBookmarkInput,
  SearchBookmarksInput,
} from '../../../shared/types';

// ─── Repository Interface ─────────────────────────────────────────────────────

export interface BookmarkRepository {
  getAll(): Bookmark[];
  getById(id: number): Bookmark | null;
  create(input: CreateBookmarkInput): Bookmark;
  update(id: number, input: UpdateBookmarkInput): Bookmark;
  delete(id: number): void;
  search(input: SearchBookmarksInput): Bookmark[];
  isDuplicate(url: string, excludeId?: number): boolean;
}

// ─── Row Types (raw SQLite rows) ──────────────────────────────────────────────

interface BookmarkRow {
  id: number;
  url: string;
  title: string | null;
  notes: string | null;
  favicon_url: string | null;
  created_at: string;
  updated_at: string;
}

// Tag row shape is identical to the shared Tag type

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

  getById(id: number): Bookmark | null {
    const row = this.db
      .prepare<[number], BookmarkRow>(
        `SELECT id, url, title, notes, favicon_url, created_at, updated_at
         FROM bookmarks WHERE id = ?`,
      )
      .get(id);

    if (!row) return null;
    return this.attachTags(row);
  }

  create(input: CreateBookmarkInput): Bookmark {
    const now = new Date().toISOString();

    const result = this.db
      .prepare(
        `INSERT INTO bookmarks (url, title, notes, favicon_url, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(input.url, input.title ?? null, input.notes ?? null, input.favicon_url ?? null, now, now);

    const id = result.lastInsertRowid as number;

    if (input.tagIds && input.tagIds.length > 0) {
      this.setTags(id, input.tagIds);
    }

    return this.getById(id)!;
  }

  update(id: number, input: UpdateBookmarkInput): Bookmark {
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

  delete(id: number): void {
    this.db.prepare(`DELETE FROM bookmark_tags WHERE bookmark_id = ?`).run(id);
    this.db.prepare(`DELETE FROM bookmarks WHERE id = ?`).run(id);
    this.db
      .prepare(`DELETE FROM tags WHERE id NOT IN (SELECT DISTINCT tag_id FROM bookmark_tags)`)
      .run();
  }

  search(input: SearchBookmarksInput): Bookmark[] {
    const { query, tagIds } = input;
    const hasQuery = query && query.trim().length > 0;
    const hasTags = tagIds && tagIds.length > 0;

    if (!hasQuery && !hasTags) return this.getAll();

    let rows: BookmarkRow[];

    if (hasQuery) {
      // FTS5 search — sanitize query to avoid FTS syntax errors
      const ftsQuery = query!
        .trim()
        .split(/\s+/)
        .map((term) => `"${term.replace(/"/g, '""')}"`)
        .join(' OR ');

      rows = this.db
        .prepare<[string], BookmarkRow>(
          `SELECT b.id, b.url, b.title, b.notes, b.favicon_url, b.created_at, b.updated_at
           FROM bookmarks b
           JOIN bookmarks_fts fts ON fts.rowid = b.id
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

    // Filter by tags (OR logic: bookmark must have at least one of the given tags)
    if (hasTags) {
      const placeholders = tagIds!.map(() => '?').join(', ');
      const taggedIds = new Set(
        this.db
          .prepare<number[], { bookmark_id: number }>(
            `SELECT DISTINCT bookmark_id FROM bookmark_tags WHERE tag_id IN (${placeholders})`,
          )
          .all(...tagIds!)
          .map((r) => r.bookmark_id),
      );
      rows = rows.filter((r) => taggedIds.has(r.id));
    }

    return this.bulkAttachTags(rows);
  }

  isDuplicate(url: string, excludeId?: number): boolean {
    const row = this.db
      .prepare<[string], { id: number }>(
        `SELECT id FROM bookmarks WHERE url = ? LIMIT 1`,
      )
      .get(url);

    if (!row) return false;
    if (excludeId !== undefined && row.id === excludeId) return false;
    return true;
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  private attachTags(row: BookmarkRow): Bookmark {
    const tags = this.db
      .prepare<[number], Tag>(
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
      .prepare<number[], { bookmark_id: number; id: number; name: string }>(
        `SELECT bt.bookmark_id, t.id, t.name
         FROM tags t
         JOIN bookmark_tags bt ON bt.tag_id = t.id
         WHERE bt.bookmark_id IN (${placeholders})
         ORDER BY t.name`,
      )
      .all(...ids);

    const tagMap = new Map<number, Tag[]>();
    for (const { bookmark_id, id, name } of tagRows) {
      const list = tagMap.get(bookmark_id) ?? [];
      list.push({ id, name });
      tagMap.set(bookmark_id, list);
    }

    return rows.map((row) => ({ ...row, tags: tagMap.get(row.id) ?? [] }));
  }

  private setTags(bookmarkId: number, tagIds: number[]): void {
    this.db.prepare(`DELETE FROM bookmark_tags WHERE bookmark_id = ?`).run(bookmarkId);

    const insert = this.db.prepare(
      `INSERT OR IGNORE INTO bookmark_tags (bookmark_id, tag_id) VALUES (?, ?)`,
    );

    for (const tagId of tagIds) {
      insert.run(bookmarkId, tagId);
    }

    // Remove tags that are no longer associated with any bookmark
    this.db
      .prepare(`DELETE FROM tags WHERE id NOT IN (SELECT DISTINCT tag_id FROM bookmark_tags)`)
      .run();
  }
}
