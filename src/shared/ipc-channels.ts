export const IpcChannels = {
  // ─── Bookmarks ──────────────────────────────────────────────────────────────
  BOOKMARKS_GET_ALL: 'bookmarks:get-all',
  BOOKMARKS_GET_PAGE: 'bookmarks:get-page',
  BOOKMARKS_SEARCH: 'bookmarks:search',
  BOOKMARK_GET_BY_ID: 'bookmark:get-by-id',
  BOOKMARK_CREATE: 'bookmark:create',
  BOOKMARK_UPDATE: 'bookmark:update',
  BOOKMARK_DELETE: 'bookmark:delete',
  BOOKMARK_OPEN: 'bookmark:open',
  BOOKMARK_FETCH_METADATA: 'bookmark:fetch-metadata',
  BOOKMARK_CHECK_DUPLICATE: 'bookmark:check-duplicate',

  // ─── Tags ────────────────────────────────────────────────────────────────────
  TAGS_GET_ALL: 'tags:get-all',
  TAG_CREATE: 'tag:create',
  TAG_UPDATE: 'tag:update',
  TAG_DELETE: 'tag:delete',

  // ─── File System ─────────────────────────────────────────────────────────────
  FS_IMPORT_BOOKMARKS: 'fs:import-bookmarks',
  FS_EXPORT_BOOKMARKS: 'fs:export-bookmarks',

  // ─── Window Controls ─────────────────────────────────────────────────────────
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',

  // ─── App ─────────────────────────────────────────────────────────────────────
  APP_GET_VERSION: 'app:get-version',

  // ─── Sync ─────────────────────────────────────────────────────────────────────
  SYNC_GET_STATUS: 'sync:get-status',
  SYNC_GET_DIFF: 'sync:get-diff',
  SYNC_GET_CONFIG: 'sync:get-config',
  SYNC_PUSH: 'sync:push',
  SYNC_PULL: 'sync:pull',
  SYNC_CONNECT: 'sync:connect',
  SYNC_DISCONNECT: 'sync:disconnect',
} as const;

export type IpcChannel = (typeof IpcChannels)[keyof typeof IpcChannels];

/**
 * One-way push channels: main → renderer via webContents.send / ipcRenderer.on.
 * These are NOT request-response — do not use with ipcMain.handle / invoke.
 */
export const IpcEventChannels = {
  // ─── Bookmarks ──────────────────────────────────────────────────────────────
  BOOKMARK_FAVICON_UPDATED: 'bookmark:favicon-updated',
} as const;

export type IpcEventChannel = (typeof IpcEventChannels)[keyof typeof IpcEventChannels];

export interface IpcEventPayloadMap {
  [IpcEventChannels.BOOKMARK_FAVICON_UPDATED]: { id: string; favicon_url: string };
}
