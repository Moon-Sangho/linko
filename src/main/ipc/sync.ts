import { ipcMain, app } from 'electron';
import path from 'path';
import fs from 'fs';
import { IpcChannels } from '@shared/ipc-channels';
import type {
  SyncStatus,
  SyncDiff,
  SyncDiffItem,
  SyncConfig,
  ConnectRepoInput,
  IpcResult,
} from '@shared/types/domains';
import type { BookmarkRepository } from '@main/db/repositories/bookmark-repository';
import type { TagRepository } from '@main/db/repositories/tag-repository';
import { SyncJsonService } from '@main/services/sync-json-service';
import { GitService } from '@main/services/git-service';
import { SyncStateService } from '@main/services/sync-state-service';

const BOOKMARKS_JSON_FILENAME = 'bookmarks.json';

function getRepoDir(userDataPath: string): string {
  return path.join(userDataPath, 'git-sync');
}

function computeDiff(
  snapshot: ReturnType<SyncJsonService['serialize']> | null,
  current: ReturnType<SyncJsonService['serialize']>,
): SyncDiff {
  if (!snapshot) {
    return {
      added: current.bookmarks.map((b) => ({ id: b.id, title: b.title, url: b.url })),
      modified: [],
      deleted: [],
    };
  }

  const snapshotMap = new Map(snapshot.bookmarks.map((b) => [b.id, b]));
  const currentMap = new Map(current.bookmarks.map((b) => [b.id, b]));

  const added: SyncDiffItem[] = [];
  const modified: SyncDiffItem[] = [];
  const deleted: SyncDiffItem[] = [];

  for (const [id, b] of currentMap) {
    const snap = snapshotMap.get(id);
    if (!snap) {
      added.push({ id, title: b.title, url: b.url });
    } else if (b.updated_at !== snap.updated_at || b.url !== snap.url || b.title !== snap.title) {
      modified.push({ id, title: b.title, url: b.url });
    }
  }

  for (const [id, b] of snapshotMap) {
    if (!currentMap.has(id)) {
      deleted.push({ id, title: b.title, url: b.url });
    }
  }

  return { added, modified, deleted };
}

export function registerSyncHandlers(
  bookmarkRepo: BookmarkRepository,
  tagRepo: TagRepository,
): void {
  const userDataPath = app.getPath('userData');
  const stateService = new SyncStateService(userDataPath);
  const jsonService = new SyncJsonService();

  ipcMain.handle(IpcChannels.SYNC_GET_STATUS, (): SyncStatus => {
    const config = stateService.getSyncConfig();
    if (!config) {
      return { isConnected: false, unsyncedCount: 0, lastSyncedAt: null, repoUrl: null };
    }

    const bookmarks = bookmarkRepo.getAll();
    const tags = tagRepo.getAll();
    const current = jsonService.serialize(bookmarks, tags.tags);
    const snapshot = stateService.getLastSyncSnapshot();
    const diff = computeDiff(snapshot, current);
    const unsyncedCount = diff.added.length + diff.modified.length + diff.deleted.length;

    const lastSyncedAt = config.lastPushedAt ?? config.lastPulledAt;

    return {
      isConnected: true,
      unsyncedCount,
      lastSyncedAt,
      repoUrl: config.repoUrl,
    };
  });

  ipcMain.handle(IpcChannels.SYNC_GET_DIFF, (): SyncDiff => {
    const bookmarks = bookmarkRepo.getAll();
    const tagsResult = tagRepo.getAll();
    const current = jsonService.serialize(bookmarks, tagsResult.tags);
    const snapshot = stateService.getLastSyncSnapshot();
    return computeDiff(snapshot, current);
  });

  ipcMain.handle(IpcChannels.SYNC_GET_CONFIG, (): SyncConfig | null => {
    return stateService.getSyncConfig();
  });

  ipcMain.handle(
    IpcChannels.SYNC_CONNECT,
    async (_, input: ConnectRepoInput): Promise<IpcResult<void>> => {
      try {
        const { repoUrl, token } = input;
        const repoDir = getRepoDir(userDataPath);

        if (!fs.existsSync(repoDir)) {
          fs.mkdirSync(repoDir, { recursive: true });
        }

        const gitService = new GitService(repoDir, repoUrl, token);

        // Try to clone; if repo has content, pull it in
        const alreadyCloned = await GitService.isRepoCloned(repoDir);
        if (!alreadyCloned) {
          try {
            await gitService.clone();
          } catch {
            // Repo may be empty — init locally and push
            const { init } = await import('isomorphic-git');
            const fsMod = await import('fs');
            await init({ fs: fsMod.default, dir: repoDir });
          }
        }

        stateService.saveToken(token);
        stateService.saveSyncConfig({
          repoUrl,
          lastPushedAt: null,
          lastPulledAt: null,
        });

        // Take initial snapshot from cloned data if it exists
        const jsonPath = path.join(repoDir, BOOKMARKS_JSON_FILENAME);
        if (fs.existsSync(jsonPath)) {
          const remoteData = jsonService.readFromFile(jsonPath);
          stateService.saveLastSyncSnapshot(remoteData);
        }

        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    },
  );

  ipcMain.handle(IpcChannels.SYNC_DISCONNECT, (): IpcResult<void> => {
    try {
      stateService.clearSyncConfig();
      stateService.clearToken();
      stateService.clearLastSyncSnapshot();
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IpcChannels.SYNC_PUSH, async (): Promise<IpcResult<void>> => {
    try {
      const config = stateService.getSyncConfig();
      if (!config) return { success: false, error: 'Not connected to a repository' };

      const token = stateService.getToken();
      if (!token) return { success: false, error: 'No authentication token found' };

      const repoDir = getRepoDir(userDataPath);
      const gitService = new GitService(repoDir, config.repoUrl, token);

      const bookmarks = bookmarkRepo.getAll();
      const tagsResult = tagRepo.getAll();
      const data = jsonService.serialize(bookmarks, tagsResult.tags);

      const jsonPath = path.join(repoDir, BOOKMARKS_JSON_FILENAME);
      jsonService.writeToFile(data, jsonPath);

      await gitService.addAndCommit(jsonPath, `sync: Update bookmarks ${data.exported_at}`);
      await gitService.push('');

      const now = new Date().toISOString();
      stateService.saveSyncConfig({ ...config, lastPushedAt: now });
      stateService.saveLastSyncSnapshot(data);

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IpcChannels.SYNC_PULL, async (): Promise<IpcResult<void>> => {
    try {
      const config = stateService.getSyncConfig();
      if (!config) return { success: false, error: 'Not connected to a repository' };

      const token = stateService.getToken();
      if (!token) return { success: false, error: 'No authentication token found' };

      const repoDir = getRepoDir(userDataPath);
      const gitService = new GitService(repoDir, config.repoUrl, token);

      await gitService.pull();

      const jsonPath = path.join(repoDir, BOOKMARKS_JSON_FILENAME);
      if (!fs.existsSync(jsonPath)) {
        return { success: false, error: 'No bookmarks.json found in remote repository' };
      }

      const remoteData = jsonService.readFromFile(jsonPath);
      const { bookmarks: remoteBookmarks, tags: remoteTags } = jsonService.deserialize(remoteData);

      // Full replace: wipe local data and re-insert with preserved remote UUIDs
      bookmarkRepo.deleteAll();

      // Insert tags first (bookmarks reference them), preserving remote UUIDs
      for (const tag of remoteTags) {
        tagRepo.createWithId(tag.id, { name: tag.name });
      }

      // Insert bookmarks with preserved remote UUIDs and tag references
      for (const bookmark of remoteBookmarks) {
        bookmarkRepo.createWithId(bookmark.id, {
          url: bookmark.url,
          title: bookmark.title,
          notes: bookmark.notes,
          favicon_url: bookmark.favicon_url,
          tagIds: bookmark.tags.map((t) => t.id),
        });
      }

      const now = new Date().toISOString();
      stateService.saveSyncConfig({ ...config, lastPulledAt: now });
      stateService.saveLastSyncSnapshot(remoteData);

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}
