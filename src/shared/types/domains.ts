import type { PageParams, Paged } from './paging';

// ─── Core Domain Types ────────────────────────────────────────────────────────

export interface Tag {
  id: number;
  name: string;
  count?: number;
}

export interface Bookmark {
  id: number;
  url: string;
  title: string | null;
  notes: string | null;
  favicon_url: string | null;
  created_at: string;
  updated_at: string;
  tags: Tag[];
}

// ─── Input Types ─────────────────────────────────────────────────────────────

export interface CreateBookmarkInput {
  url: string;
  title?: string | null;
  notes?: string | null;
  favicon_url?: string | null;
  tagIds?: number[];
}

export interface UpdateBookmarkInput {
  url?: string;
  title?: string | null;
  notes?: string | null;
  favicon_url?: string | null;
  tagIds?: number[];
}

export interface CreateTagInput {
  name: string;
}

export interface UpdateTagInput {
  name: string;
}

export interface TagsResult {
  tags: Tag[];
  total: number;
}

export interface SearchBookmarksInput {
  query?: string;
  tagIds?: number[];
}

export type GetBookmarksPageInput = PageParams<SearchBookmarksInput>;

export type BookmarkPage = Paged<Bookmark>;

// ─── URL Metadata ─────────────────────────────────────────────────────────────

export interface UrlMetadata {
  title: string | null;
  favicon_url: string | null;
}

// ─── Import / Export ──────────────────────────────────────────────────────────

export interface ImportSummary {
  added: number;
  skipped: number;
  errors: number;
}

// ─── IPC Result Wrapper ───────────────────────────────────────────────────────

export interface IpcResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Window State ─────────────────────────────────────────────────────────────

export interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
}
