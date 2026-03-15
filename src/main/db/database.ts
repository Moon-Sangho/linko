import Database from 'better-sqlite3';
import { app } from 'electron';
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

  // Apply schema
  _db.exec(CREATE_TABLES_SQL);

  // Track schema version for future migrations
  const currentVersion = (_db.pragma('user_version', { simple: true }) as number) ?? 0;
  if (currentVersion < SCHEMA_VERSION) {
    _db.pragma(`user_version = ${SCHEMA_VERSION}`);
  }

  // Clean up orphaned tags left over from before cascade-delete was enforced
  _db.prepare(`DELETE FROM tags WHERE id NOT IN (SELECT DISTINCT tag_id FROM bookmark_tags)`).run();

  return _db;
}

export function closeDatabase(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}
