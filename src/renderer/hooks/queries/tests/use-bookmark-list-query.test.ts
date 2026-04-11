import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import {
  useBookmarkListQuery,
  BOOKMARK_PAGE_SIZE,
} from '@renderer/hooks/queries/use-bookmark-list-query'
import { IpcChannels } from '@shared/ipc-channels'
import type { BookmarkPage, Bookmark } from '@shared/types/domains'
import { createWrapper } from './test-utils'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const { mockInvoke } = vi.hoisted(() => ({ mockInvoke: vi.fn() }))

Object.defineProperty(window, 'electron', {
  value: { invoke: mockInvoke },
  writable: true,
})

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeBookmark(id: number): Bookmark {
  return {
    id: `uuid-${id}`,
    url: `https://example.com/${id}`,
    title: `Bookmark ${id}`,
    notes: null,
    favicon_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    tags: [],
  }
}

function makePage(count: number, hasMore: boolean): BookmarkPage {
  return {
    results: Array.from({ length: count }, (_, i) => makeBookmark(i + 1)),
    hasMore,
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Fetches two pages: first (full, hasMore: true), second (partial, hasMore: false).
 * Returns `result` ready for assertions on multi-page behavior.
 *
 * Call `hasNextPage` check before fetchNextPage to ensure TanStack Query's
 * internal state has fully settled — omitting it causes a timing race where
 * fetchNextPage fires before getNextPageParam has run.
 */
async function setupTwoPageFetch() {
  const SECOND_PAGE_COUNT = 3 // intentionally fewer than BOOKMARK_PAGE_SIZE — final page
  mockInvoke
    .mockResolvedValueOnce(makePage(BOOKMARK_PAGE_SIZE, true))
    .mockResolvedValueOnce(makePage(SECOND_PAGE_COUNT, false))

  const { wrapper } = createWrapper()
  const { result } = renderHook(() => useBookmarkListQuery({}), { wrapper })

  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(result.current.hasNextPage).toBe(true)

  await act(async () => {
    await result.current.fetchNextPage()
  })
  await waitFor(() => expect(result.current.data?.pages).toHaveLength(2))

  return { result, SECOND_PAGE_COUNT }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useBookmarkListQuery', () => {
  beforeEach(() => {
    mockInvoke.mockReset()
  })

  describe('initial fetch', () => {
    it('fetches the first page and calls the correct IPC channel with pagination params', async () => {
      mockInvoke.mockResolvedValue(makePage(3, false))
      const { wrapper } = createWrapper()

      const { result } = renderHook(() => useBookmarkListQuery({}), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data?.pages).toHaveLength(1)
      expect(result.current.data?.pages[0].results).toHaveLength(3)
      expect(mockInvoke).toHaveBeenCalledWith(IpcChannels.BOOKMARKS_GET_PAGE, {
        limit: BOOKMARK_PAGE_SIZE,
        offset: 0,
      })
    })

    it('is pending before IPC resolves', () => {
      mockInvoke.mockReturnValue(new Promise(() => {})) // never resolves
      const { wrapper } = createWrapper()

      const { result } = renderHook(() => useBookmarkListQuery({}), { wrapper })

      expect(result.current.isPending).toBe(true)
    })

    it('includes query and tagIds in IPC call when provided', async () => {
      mockInvoke.mockResolvedValue(makePage(1, false))
      const { wrapper } = createWrapper()

      const { result } = renderHook(
        () => useBookmarkListQuery({ query: 'react', tagIds: ['tag-uuid-1', 'tag-uuid-2'] }),
        { wrapper },
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(mockInvoke).toHaveBeenCalledWith(IpcChannels.BOOKMARKS_GET_PAGE, {
        query: 'react',
        tagIds: ['tag-uuid-1', 'tag-uuid-2'],
        limit: BOOKMARK_PAGE_SIZE,
        offset: 0,
      })
    })

    it('includes tagIds empty array explicitly when provided', async () => {
      // tagIds: [] and omitting tagIds are distinct inputs — the hook passes them
      // through directly via spread, so an explicit empty array appears in the payload
      mockInvoke.mockResolvedValue(makePage(0, false))
      const { wrapper } = createWrapper()

      const { result } = renderHook(
        () => useBookmarkListQuery({ tagIds: [] }),
        { wrapper },
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(mockInvoke).toHaveBeenCalledWith(
        IpcChannels.BOOKMARKS_GET_PAGE,
        expect.objectContaining({ tagIds: [] }),
      )
    })

    it('returns empty results when no bookmarks exist', async () => {
      mockInvoke.mockResolvedValue(makePage(0, false))
      const { wrapper } = createWrapper()

      const { result } = renderHook(() => useBookmarkListQuery({}), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data?.pages[0].results).toHaveLength(0)
      expect(result.current.hasNextPage).toBe(false)
    })

    it('enters error state when IPC rejects', async () => {
      mockInvoke.mockRejectedValue(new Error('DB unavailable'))
      const { wrapper } = createWrapper()

      const { result } = renderHook(() => useBookmarkListQuery({}), { wrapper })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect((result.current.error as Error).message).toBe('DB unavailable')
    })
  })

  describe('pagination', () => {
    it('hasNextPage is true when page reports hasMore and computes correct next offset', async () => {
      // Verifies both the boolean AND that getNextPageParam computes the right offset
      // (any non-undefined value makes hasNextPage true, so we must also test the offset)
      mockInvoke
        .mockResolvedValueOnce(makePage(BOOKMARK_PAGE_SIZE, true))
        .mockResolvedValueOnce(makePage(1, false))
      const { wrapper } = createWrapper()

      const { result } = renderHook(() => useBookmarkListQuery({}), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.hasNextPage).toBe(true)

      await act(async () => {
        await result.current.fetchNextPage()
      })
      await waitFor(() => expect(result.current.data?.pages).toHaveLength(2))

      expect(mockInvoke).toHaveBeenNthCalledWith(2, IpcChannels.BOOKMARKS_GET_PAGE, {
        limit: BOOKMARK_PAGE_SIZE,
        offset: BOOKMARK_PAGE_SIZE,
      })
    })

    it('hasNextPage is false when page reports hasMore as false', async () => {
      mockInvoke.mockResolvedValue(makePage(5, false))
      const { wrapper } = createWrapper()

      const { result } = renderHook(() => useBookmarkListQuery({}), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.hasNextPage).toBe(false)
    })

    it('isFetchingNextPage is false before fetching next page and false after it completes', async () => {
      // Note: observing isFetchingNextPage === true mid-flight is not reliable in jsdom
      // because TanStack Query may resolve microtasks before waitFor can poll.
      // We verify the stable states: false before triggering and false when settled.
      mockInvoke
        .mockResolvedValueOnce(makePage(BOOKMARK_PAGE_SIZE, true))
        .mockResolvedValueOnce(makePage(3, false))
      const { wrapper } = createWrapper()

      const { result } = renderHook(() => useBookmarkListQuery({}), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.hasNextPage).toBe(true)
      expect(result.current.isFetchingNextPage).toBe(false)

      await act(async () => {
        await result.current.fetchNextPage()
      })
      await waitFor(() => expect(result.current.data?.pages).toHaveLength(2))

      expect(result.current.isFetchingNextPage).toBe(false)
    })

    it('does not issue an extra IPC call when fetchNextPage is called with hasNextPage false', async () => {
      mockInvoke.mockResolvedValue(makePage(5, false))
      const { wrapper } = createWrapper()

      const { result } = renderHook(() => useBookmarkListQuery({}), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.hasNextPage).toBe(false)

      await act(async () => {
        await result.current.fetchNextPage()
      })

      expect(mockInvoke).toHaveBeenCalledTimes(1)
    })

    it('accumulates results across pages', async () => {
      const { result, SECOND_PAGE_COUNT } = await setupTwoPageFetch()

      const allResults = result.current.data?.pages.flatMap((p: BookmarkPage) => p.results) ?? []
      expect(allResults).toHaveLength(BOOKMARK_PAGE_SIZE + SECOND_PAGE_COUNT)
    })

    it('uses correct offset for the third page', async () => {
      // Use mockResolvedValueOnce for pages 1-3 and a fallback mockResolvedValue
      // for any unexpected extra calls (e.g. background consistency checks).
      mockInvoke
        .mockResolvedValueOnce(makePage(BOOKMARK_PAGE_SIZE, true))  // page 1
        .mockResolvedValueOnce(makePage(BOOKMARK_PAGE_SIZE, true))  // page 2
        .mockResolvedValueOnce(makePage(5, false))                  // page 3
        .mockResolvedValue(makePage(0, false))                      // fallback

      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useBookmarkListQuery({}), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.hasNextPage).toBe(true)

      // Do not await fetchNextPage — let waitFor poll for the result instead.
      // This avoids a timing issue where `await act(async () => { await fetchNextPage() })`
      // does not reliably flush the second page into state when hasMore is true.
      act(() => { result.current.fetchNextPage() })
      await waitFor(() => expect(result.current.data?.pages).toHaveLength(2))
      expect(result.current.hasNextPage).toBe(true)

      act(() => { result.current.fetchNextPage() })
      await waitFor(() => expect(result.current.data?.pages).toHaveLength(3))

      expect(mockInvoke).toHaveBeenNthCalledWith(3, IpcChannels.BOOKMARKS_GET_PAGE, {
        limit: BOOKMARK_PAGE_SIZE,
        offset: 2 * BOOKMARK_PAGE_SIZE,
      })
    })
  })

  describe('filter / search input', () => {
    it('resets to page 1 (offset 0) when filter input changes', async () => {
      mockInvoke.mockResolvedValue(makePage(BOOKMARK_PAGE_SIZE, false))
      const { wrapper } = createWrapper()

      const { result, rerender } = renderHook(
        ({ query }: { query: string }) => useBookmarkListQuery({ query }),
        { wrapper, initialProps: { query: 'react' } },
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockInvoke).toHaveBeenCalledWith(
        IpcChannels.BOOKMARKS_GET_PAGE,
        expect.objectContaining({ query: 'react', offset: 0 }),
      )

      mockInvoke.mockClear()
      mockInvoke.mockResolvedValue(makePage(5, false))
      rerender({ query: 'typescript' })

      await waitFor(() =>
        expect(mockInvoke).toHaveBeenCalledWith(
          IpcChannels.BOOKMARKS_GET_PAGE,
          expect.objectContaining({ query: 'typescript', offset: 0 }),
        ),
      )
    })
  })
})
