import path from 'path';
import fs from 'fs';
import { safeStorage } from 'electron';
import type { SyncConfig } from '@shared/types/domains';
import type { SyncJsonData } from './sync-json-service';

const LAST_SYNC_FILE = 'last-sync.json';
const SYNC_CONFIG_FILE = 'sync-config.json';
const TOKEN_FILE = 'sync-token.enc';

export class SyncStateService {
  constructor(private readonly userDataPath: string) {}

  // ─── Snapshot ─────────────────────────────────────────────────────────────

  getLastSyncSnapshot(): SyncJsonData | null {
    const filePath = path.join(this.userDataPath, LAST_SYNC_FILE);
    if (!fs.existsSync(filePath)) return null;
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as SyncJsonData;
    } catch {
      return null;
    }
  }

  saveLastSyncSnapshot(data: SyncJsonData): void {
    const filePath = path.join(this.userDataPath, LAST_SYNC_FILE);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  clearLastSyncSnapshot(): void {
    const filePath = path.join(this.userDataPath, LAST_SYNC_FILE);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  // ─── Sync Config ──────────────────────────────────────────────────────────

  getSyncConfig(): SyncConfig | null {
    const filePath = path.join(this.userDataPath, SYNC_CONFIG_FILE);
    if (!fs.existsSync(filePath)) return null;
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as SyncConfig;
    } catch {
      return null;
    }
  }

  saveSyncConfig(config: SyncConfig): void {
    const filePath = path.join(this.userDataPath, SYNC_CONFIG_FILE);
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf-8');
  }

  clearSyncConfig(): void {
    const filePath = path.join(this.userDataPath, SYNC_CONFIG_FILE);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  // ─── Token (encrypted via safeStorage) ────────────────────────────────────

  getToken(): string | null {
    const filePath = path.join(this.userDataPath, TOKEN_FILE);
    if (!fs.existsSync(filePath)) return null;
    try {
      if (!safeStorage.isEncryptionAvailable()) {
        return fs.readFileSync(filePath, 'utf-8');
      }
      const encrypted = fs.readFileSync(filePath);
      return safeStorage.decryptString(encrypted);
    } catch {
      return null;
    }
  }

  saveToken(token: string): void {
    const filePath = path.join(this.userDataPath, TOKEN_FILE);
    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(token);
      fs.writeFileSync(filePath, encrypted);
    } else {
      // Fallback: store as plain text (not ideal, but better than breaking)
      fs.writeFileSync(filePath, token, 'utf-8');
    }
  }

  clearToken(): void {
    const filePath = path.join(this.userDataPath, TOKEN_FILE);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}
