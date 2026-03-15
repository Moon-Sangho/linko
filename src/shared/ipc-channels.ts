export const IpcChannels = {
  // ─── Bookmarks ──────────────────────────────────────────────────────────────
  BOOKMARKS_GET_ALL: 'bookmarks:get-all',
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
} as const;

export type IpcChannel = (typeof IpcChannels)[keyof typeof IpcChannels];
