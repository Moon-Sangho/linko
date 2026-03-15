import Database from 'better-sqlite3';
import type { Tag, CreateTagInput } from '../../../shared/types';

// ─── Repository Interface ─────────────────────────────────────────────────────

export interface TagRepository {
  getAll(): Tag[];
  getById(id: number): Tag | null;
  create(input: CreateTagInput): Tag;
  delete(id: number): void;
}

// ─── Local Repository ─────────────────────────────────────────────────────────

export class LocalTagRepository implements TagRepository {
  constructor(private readonly db: Database.Database) {}

  getAll(): Tag[] {
    return this.db
      .prepare<[], Tag>(
        `SELECT id, name FROM tags ORDER BY name COLLATE NOCASE`,
      )
      .all();
  }

  getById(id: number): Tag | null {
    return (
      this.db
        .prepare<[number], Tag>(`SELECT id, name FROM tags WHERE id = ?`)
        .get(id) ?? null
    );
  }

  create(input: CreateTagInput): Tag {
    const trimmed = input.name.trim();
    if (!trimmed) throw new Error('Tag name cannot be empty');

    const result = this.db
      .prepare(`INSERT INTO tags (name) VALUES (?)`)
      .run(trimmed);

    return this.getById(result.lastInsertRowid as number)!;
  }

  delete(id: number): void {
    // bookmark_tags rows are removed by CASCADE on DELETE
    this.db.prepare(`DELETE FROM tags WHERE id = ?`).run(id);
  }
}
