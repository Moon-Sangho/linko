import { randomUUID } from 'crypto';
import type Database from 'better-sqlite3';
import type { Tag, TagsResult, CreateTagInput, UpdateTagInput } from '@shared/types/domains';

// ─── Repository Interface ─────────────────────────────────────────────────────

export interface TagRepository {
  getAll(): TagsResult;
  getById(id: string): Tag | null;
  create(input: CreateTagInput): Tag;
  createWithId(id: string, input: CreateTagInput): Tag;
  update(id: string, input: UpdateTagInput): Tag;
  delete(id: string): void;
}

// ─── Local Repository ─────────────────────────────────────────────────────────

export class LocalTagRepository implements TagRepository {
  constructor(private readonly db: Database.Database) {}

  getAll(): TagsResult {
    const tags = this.db
      .prepare<[], Tag>(
        `SELECT t.id, t.name, COUNT(bt.bookmark_id) AS count
         FROM tags t
         LEFT JOIN bookmark_tags bt ON bt.tag_id = t.id
         GROUP BY t.id
         ORDER BY t.name COLLATE NOCASE`,
      )
      .all();

    const { total } = this.db
      .prepare<[], { total: number }>(`SELECT COUNT(*) AS total FROM bookmarks`)
      .get()!;

    return { tags, total };
  }

  getById(id: string): Tag | null {
    return this.db.prepare<[string], Tag>(`SELECT id, name FROM tags WHERE id = ?`).get(id) ?? null;
  }

  create(input: CreateTagInput): Tag {
    return this.createWithId(randomUUID(), input);
  }

  createWithId(id: string, input: CreateTagInput): Tag {
    const trimmed = input.name.trim();
    if (!trimmed) throw new Error('Tag name cannot be empty');

    this.db.prepare(`INSERT OR IGNORE INTO tags (id, name) VALUES (?, ?)`).run(id, trimmed);

    return this.getById(id)!;
  }

  update(id: string, input: UpdateTagInput): Tag {
    const trimmed = input.name.trim();
    if (!trimmed) throw new Error('Tag name cannot be empty');

    this.db.prepare(`UPDATE tags SET name = ? WHERE id = ?`).run(trimmed, id);

    const updated = this.db
      .prepare<[string], Tag>(
        `SELECT t.id, t.name, COUNT(bt.bookmark_id) AS count
         FROM tags t
         LEFT JOIN bookmark_tags bt ON bt.tag_id = t.id
         WHERE t.id = ?
         GROUP BY t.id`,
      )
      .get(id);

    if (!updated) throw new Error(`Tag with id ${id} not found`);
    return updated;
  }

  delete(id: string): void {
    // bookmark_tags rows are removed by CASCADE on DELETE
    this.db.prepare(`DELETE FROM tags WHERE id = ?`).run(id);
  }
}
