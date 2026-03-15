// SQL schema for Linko's SQLite database.
// Applied once on first launch; migrations handled via user_version pragma.

export const SCHEMA_VERSION = 1;

export const CREATE_TABLES_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS bookmarks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  url         TEXT    NOT NULL UNIQUE,
  title       TEXT,
  notes       TEXT,
  favicon_url TEXT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tags (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE
);

CREATE TABLE IF NOT EXISTS bookmark_tags (
  bookmark_id INTEGER NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
  tag_id      INTEGER NOT NULL REFERENCES tags(id)      ON DELETE CASCADE,
  PRIMARY KEY (bookmark_id, tag_id)
);

-- FTS5 virtual table for instant full-text search (url + title + notes)
CREATE VIRTUAL TABLE IF NOT EXISTS bookmarks_fts USING fts5(
  url,
  title,
  notes,
  content=bookmarks,
  content_rowid=id
);

-- Keep FTS index in sync with bookmarks table
CREATE TRIGGER IF NOT EXISTS bookmarks_ai
  AFTER INSERT ON bookmarks BEGIN
    INSERT INTO bookmarks_fts(rowid, url, title, notes)
    VALUES (new.id, new.url, new.title, new.notes);
  END;

CREATE TRIGGER IF NOT EXISTS bookmarks_ad
  AFTER DELETE ON bookmarks BEGIN
    INSERT INTO bookmarks_fts(bookmarks_fts, rowid, url, title, notes)
    VALUES ('delete', old.id, old.url, old.title, old.notes);
  END;

CREATE TRIGGER IF NOT EXISTS bookmarks_au
  AFTER UPDATE ON bookmarks BEGIN
    INSERT INTO bookmarks_fts(bookmarks_fts, rowid, url, title, notes)
    VALUES ('delete', old.id, old.url, old.title, old.notes);
    INSERT INTO bookmarks_fts(rowid, url, title, notes)
    VALUES (new.id, new.url, new.title, new.notes);
  END;
`;
