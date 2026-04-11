import Database from 'better-sqlite3';
import { app } from 'electron';
import { randomUUID } from 'crypto';
import path from 'path';
import { CREATE_TABLES_SQL, SCHEMA_VERSION } from './schema';

let _db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (_db) return _db;

  const dbPath = path.join(app.getPath('userData'), 'linko.db');
  _db = new Database(dbPath);

  // better-sqlite3 requires pragma() for connection-level settings
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  const currentVersion = (_db.pragma('user_version', { simple: true }) as number) ?? 0;

  if (currentVersion < 1) {
    // Fresh install — apply full schema
    _db.exec(CREATE_TABLES_SQL);
    _db.pragma(`user_version = ${SCHEMA_VERSION}`);
  } else if (currentVersion < 2) {
    // Migrate from integer IDs (v1) to UUID string IDs (v2)
    migrateV1ToV2(_db);
    _db.pragma(`user_version = ${SCHEMA_VERSION}`);
  } else {
    // user_version is already 2, but verify the schema actually has TEXT IDs.
    // During development, user_version may have been set to 2 before the migration
    // code existed, leaving the table with INTEGER PKs despite the version stamp.
    const idCol = _db
      .prepare<[], { type: string }>(
        `SELECT type FROM pragma_table_info('bookmarks') WHERE name = 'id'`,
      )
      .get();
    if (idCol && idCol.type.toUpperCase() !== 'TEXT') {
      migrateV1ToV2(_db);
    }
  }

  // Clean up orphaned tags left over from before cascade-delete was enforced
  _db.prepare(`DELETE FROM tags WHERE id NOT IN (SELECT DISTINCT tag_id FROM bookmark_tags)`).run();

  return _db;
}

/**
 * Migrate schema from v1 (INTEGER PKs) to v2 (TEXT UUID PKs).
 * Assigns new UUIDs to all existing bookmarks and tags, updates all cross-references.
 */
function migrateV1ToV2(db: Database.Database): void {
  db.transaction(() => {
    // Disable FK enforcement temporarily so we can restructure tables
    db.pragma('foreign_keys = OFF');

    // ── Collect existing data ────────────────────────────────────────────────
    const existingBookmarks = db
      .prepare<[], { id: number; url: string; title: string | null; notes: string | null; favicon_url: string | null; created_at: string; updated_at: string }>(
        `SELECT id, url, title, notes, favicon_url, created_at, updated_at FROM bookmarks`,
      )
      .all();

    const existingTags = db
      .prepare<[], { id: number; name: string }>(
        `SELECT id, name FROM tags`,
      )
      .all();

    const existingBookmarkTags = db
      .prepare<[], { bookmark_id: number; tag_id: number }>(
        `SELECT bookmark_id, tag_id FROM bookmark_tags`,
      )
      .all();

    // ── Build ID maps ────────────────────────────────────────────────────────
    const bookmarkIdMap = new Map<number, string>();
    const tagIdMap = new Map<number, string>();

    for (const b of existingBookmarks) bookmarkIdMap.set(b.id, randomUUID());
    for (const t of existingTags) tagIdMap.set(t.id, randomUUID());

    // ── Drop old tables (including FTS + triggers) ───────────────────────────
    db.exec(`
      DROP TRIGGER IF EXISTS bookmarks_ai;
      DROP TRIGGER IF EXISTS bookmarks_ad;
      DROP TRIGGER IF EXISTS bookmarks_au;
      DROP TABLE IF EXISTS bookmarks_fts;
      DROP TABLE IF EXISTS bookmark_tags;
      DROP TABLE IF EXISTS bookmarks;
      DROP TABLE IF EXISTS tags;
    `);

    // ── Create new tables with TEXT PKs ──────────────────────────────────────
    db.exec(`
      CREATE TABLE bookmarks (
        id          TEXT    PRIMARY KEY,
        url         TEXT    NOT NULL UNIQUE,
        title       TEXT,
        notes       TEXT,
        favicon_url TEXT,
        created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE tags (
        id   TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE COLLATE NOCASE
      );

      CREATE TABLE bookmark_tags (
        bookmark_id TEXT NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
        tag_id      TEXT NOT NULL REFERENCES tags(id)      ON DELETE CASCADE,
        PRIMARY KEY (bookmark_id, tag_id)
      );

      CREATE VIRTUAL TABLE bookmarks_fts USING fts5(
        url, title, notes,
        content=bookmarks
      );

      CREATE TRIGGER bookmarks_ai
        AFTER INSERT ON bookmarks BEGIN
          INSERT INTO bookmarks_fts(rowid, url, title, notes)
          VALUES (new.rowid, new.url, new.title, new.notes);
        END;

      CREATE TRIGGER bookmarks_ad
        AFTER DELETE ON bookmarks BEGIN
          INSERT INTO bookmarks_fts(bookmarks_fts, rowid, url, title, notes)
          VALUES ('delete', old.rowid, old.url, old.title, old.notes);
        END;

      CREATE TRIGGER bookmarks_au
        AFTER UPDATE ON bookmarks BEGIN
          INSERT INTO bookmarks_fts(bookmarks_fts, rowid, url, title, notes)
          VALUES ('delete', old.rowid, old.url, old.title, old.notes);
          INSERT INTO bookmarks_fts(rowid, url, title, notes)
          VALUES (new.rowid, new.url, new.title, new.notes);
        END;
    `);

    // ── Insert data with new UUIDs ───────────────────────────────────────────
    const insertBookmark = db.prepare(
      `INSERT INTO bookmarks (id, url, title, notes, favicon_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const b of existingBookmarks) {
      insertBookmark.run(bookmarkIdMap.get(b.id), b.url, b.title, b.notes, b.favicon_url, b.created_at, b.updated_at);
    }

    const insertTag = db.prepare(`INSERT INTO tags (id, name) VALUES (?, ?)`);
    for (const t of existingTags) {
      insertTag.run(tagIdMap.get(t.id), t.name);
    }

    const insertBookmarkTag = db.prepare(
      `INSERT OR IGNORE INTO bookmark_tags (bookmark_id, tag_id) VALUES (?, ?)`,
    );
    for (const bt of existingBookmarkTags) {
      const bId = bookmarkIdMap.get(bt.bookmark_id);
      const tId = tagIdMap.get(bt.tag_id);
      if (bId && tId) insertBookmarkTag.run(bId, tId);
    }

    // Re-enable FK enforcement
    db.pragma('foreign_keys = ON');
  })();
}

export function closeDatabase(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}
