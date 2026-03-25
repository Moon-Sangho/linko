export type PageParams<T> = T & { limit: number; offset: number };

export interface Paged<T> {
  results: T[];
  hasMore: boolean;
}
