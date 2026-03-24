import { ipcMain, shell } from 'electron';
import { IpcChannels } from '@shared/ipc-channels';
import type {
  CreateBookmarkInput,
  UpdateBookmarkInput,
  SearchBookmarksInput,
  IpcResult,
  Bookmark,
  UrlMetadata,
} from '@shared/types';
import type { BookmarkRepository } from '../db/repositories/bookmark-repository';
import { fetchUrlMetadata } from '../services/url-fetcher';

export function registerBookmarkHandlers(repo: BookmarkRepository): void {
  ipcMain.handle(IpcChannels.BOOKMARKS_GET_ALL, (): Bookmark[] => {
    return repo.getAll();
  });

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

  ipcMain.handle(IpcChannels.BOOKMARK_OPEN, async (_, url: string): Promise<IpcResult> => {
    try {
      if (!isValidUrl(url)) return { success: false, error: 'Invalid URL' };
      await shell.openExternal(url);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

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

function isValidId(id: unknown): id is number {
  return typeof id === 'number' && Number.isInteger(id) && id > 0;
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
