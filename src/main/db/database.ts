import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import { CREATE_TABLES_SQL, SCHEMA_VERSION } from './schema';

let _db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (_db) return _db;

  const dbPath = path.join(app.getPath('userData'), 'linko.db');
  _db = new Database(dbPath);

  // Enable WAL mode and foreign keys, then apply schema
  _db.exec(CREATE_TABLES_SQL);

  // Track schema version for future migrations
  const currentVersion = (_db.pragma('user_version', { simple: true }) as number) ?? 0;
  if (currentVersion < SCHEMA_VERSION) {
    _db.pragma(`user_version = ${SCHEMA_VERSION}`);
  }

  return _db;
}

export function closeDatabase(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}
