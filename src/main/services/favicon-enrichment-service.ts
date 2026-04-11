import type { BrowserWindow } from 'electron';
import { IpcEventChannels } from '@shared/ipc-channels';
import type { BookmarkRepository } from '@main/db/repositories/bookmark-repository';
import { fetchUrlMetadata } from './url-fetcher';

export class FaviconEnrichmentService {
  constructor(
    private readonly repo: BookmarkRepository,
    private readonly getWindow: () => BrowserWindow | null,
  ) {}

  /**
   * Fire-and-forget favicon fetch for a single bookmark.
   * DB is updated before the push event is sent to the renderer.
   */
  updateFaviconInBackground(id: string, url: string): void {
    void this.fetchAndUpdate(id, url);
  }

  private async fetchAndUpdate(id: string, url: string): Promise<void> {
    try {
      const metadata = await fetchUrlMetadata(url);
      if (!metadata.favicon_url) return;

      this.repo.update(id, { favicon_url: metadata.favicon_url });

      const win = this.getWindow();
      win?.webContents.send(IpcEventChannels.BOOKMARK_FAVICON_UPDATED, {
        id,
        favicon_url: metadata.favicon_url,
      });
    } catch {
      // Silently skip failures — favicon is non-critical
    }
  }
}
