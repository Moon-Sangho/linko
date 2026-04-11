import fs from 'fs';
import type { Bookmark, Tag } from '@shared/types/domains';

export interface SyncJsonBookmark {
  id: string;
  url: string;
  title: string | null;
  notes: string | null;
  favicon_url: string | null;
  created_at: string;
  updated_at: string;
  tags: string[]; // array of tag UUIDs
}

export interface SyncJsonTag {
  id: string;
  name: string;
}

export interface SyncJsonData {
  version: 1;
  exported_at: string;
  bookmarks: SyncJsonBookmark[];
  tags: SyncJsonTag[];
}

export class SyncJsonService {
  serialize(bookmarks: Bookmark[], tags: Tag[]): SyncJsonData {
    return {
      version: 1,
      exported_at: new Date().toISOString(),
      bookmarks: bookmarks.map((b) => ({
        id: b.id,
        url: b.url,
        title: b.title,
        notes: b.notes,
        favicon_url: b.favicon_url,
        created_at: b.created_at,
        updated_at: b.updated_at,
        tags: b.tags.map((t) => t.id),
      })),
      tags: tags.map((t) => ({ id: t.id, name: t.name })),
    };
  }

  deserialize(data: SyncJsonData): { bookmarks: Bookmark[]; tags: Tag[] } {
    const tagMap = new Map<string, Tag>(
      data.tags.map((t) => [t.id, { id: t.id, name: t.name }]),
    );

    const bookmarks: Bookmark[] = data.bookmarks.map((b) => ({
      id: b.id,
      url: b.url,
      title: b.title,
      notes: b.notes,
      favicon_url: b.favicon_url,
      created_at: b.created_at,
      updated_at: b.updated_at,
      tags: b.tags.map((tagId) => tagMap.get(tagId) ?? { id: tagId, name: tagId }),
    }));

    return { bookmarks, tags: data.tags.map((t) => ({ id: t.id, name: t.name })) };
  }

  writeToFile(data: SyncJsonData, filePath: string): void {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  readFromFile(filePath: string): SyncJsonData {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as SyncJsonData;
  }
}
