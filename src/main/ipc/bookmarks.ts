import { ipcMain, shell } from 'electron';
import { IpcChannels } from '@shared/ipc-channels';
import { isValidUrl } from '@shared/utils/is-valid-url';
import { isValidId } from '@shared/utils/is-valid-id';
import type {
  CreateBookmarkInput,
  UpdateBookmarkInput,
  SearchBookmarksInput,
  GetBookmarksPageInput,
  BookmarkPage,
  IpcResult,
  Bookmark,
  UrlMetadata,
} from '@shared/types/domains';
import type { BookmarkRepository } from '@main/db/repositories/bookmark-repository';
import { fetchUrlMetadata } from '@main/services/url-fetcher';
import type { FaviconEnrichmentService } from '@main/services/favicon-enrichment-service';

export function registerBookmarkHandlers(
  repo: BookmarkRepository,
  enrichmentService: FaviconEnrichmentService,
): void {
  ipcMain.handle(IpcChannels.BOOKMARKS_GET_ALL, (): Bookmark[] => {
    return repo.getAll();
  });

  ipcMain.handle(
    IpcChannels.BOOKMARKS_GET_PAGE,
    (_, input: GetBookmarksPageInput): BookmarkPage => {
      return repo.getPage(input);
    },
  );

  ipcMain.handle(
    IpcChannels.BOOKMARKS_SEARCH,
    (_, input: SearchBookmarksInput): Bookmark[] => {
      return repo.search(input);
    },
  );

  ipcMain.handle(IpcChannels.BOOKMARK_GET_BY_ID, (_, id: number): Bookmark | null => {
    if (!isValidId(id)) throw new Error('Invalid id');
    return repo.getById(id);
  });

  ipcMain.handle(
    IpcChannels.BOOKMARK_CREATE,
    (_, input: CreateBookmarkInput): IpcResult<Bookmark> => {
      try {
        if (!input.url || !isValidUrl(input.url)) {
          return { success: false, error: 'Invalid URL' };
        }
        return { success: true, data: repo.create(input) };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    },
  );

  ipcMain.handle(
    IpcChannels.BOOKMARK_UPDATE,
    (_, id: number, input: UpdateBookmarkInput): IpcResult<Bookmark> => {
      try {
        if (!isValidId(id)) return { success: false, error: 'Invalid id' };
        if (input.url !== undefined && !isValidUrl(input.url)) {
          return { success: false, error: 'Invalid URL' };
        }
        return { success: true, data: repo.update(id, input) };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    },
  );

  ipcMain.handle(IpcChannels.BOOKMARK_DELETE, (_, id: number): IpcResult => {
    try {
      if (!isValidId(id)) return { success: false, error: 'Invalid id' };
      repo.delete(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(
    IpcChannels.BOOKMARK_OPEN,
    async (_, id: number, url: string): Promise<IpcResult> => {
      try {
        if (!isValidId(id)) return { success: false, error: 'Invalid id' };
        if (!isValidUrl(url)) return { success: false, error: 'Invalid URL' };
        await shell.openExternal(url);
        // Lazy favicon fetch: only fetch if not yet stored (e.g. bulk-imported bookmarks)
        const bookmark = repo.getById(id);
        if (bookmark && !bookmark.favicon_url) {
          enrichmentService.updateFaviconInBackground(id, url);
        }
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    },
  );

  ipcMain.handle(
    IpcChannels.BOOKMARK_FETCH_METADATA,
    async (_, url: string): Promise<IpcResult<UrlMetadata>> => {
      try {
        if (!isValidUrl(url)) return { success: false, error: 'Invalid URL' };
        const metadata = await fetchUrlMetadata(url);
        return { success: true, data: metadata };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    },
  );

  ipcMain.handle(
    IpcChannels.BOOKMARK_CHECK_DUPLICATE,
    (_, url: string, excludeId?: number): IpcResult<boolean> => {
      try {
        return { success: true, data: repo.isDuplicate(url, excludeId) };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    },
  );
}

