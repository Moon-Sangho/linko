import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSearchBookmark } from '@renderer/hooks/use-search-bookmark'
import { useUIStore } from '@renderer/store/use-ui-store'
import type { Bookmark, SearchBookmarksInput } from '@shared/types'

// ─── Mocks ───────────────────────────────────────────────────────────────────
// Mock useSearchQuery to isolate debounce + UIStore integration from the query layer.
// The query layer itself is tested by the IPC handler and repository tests.

const { mockUseSearchQuery } = vi.hoisted(() => ({
  mockUseSearchQuery: vi.fn(),
}))

vi.mock('@renderer/hooks/queries/use-search-bookmark-query', () => ({
  useSearchQuery: (input: SearchBookmarksInput) => mockUseSearchQuery(input),
}))

// ─── Fixtures ────────────────────────────────────────────────────────────────

const sampleBookmark: Bookmark = {
  id: 1,
  url: 'https://example.com',
  title: 'Example',
  notes: null,
  favicon_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  tags: [],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns the input argument from the most recent call to useSearchQuery. */
const lastQueryInput = () =>
  mockUseSearchQuery.mock.calls[mockUseSearchQuery.mock.calls.length - 1][0] as SearchBookmarksInput

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useSearchBookmark', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useUIStore.setState({ searchQuery: '', selectedTagIds: [] })
    mockUseSearchQuery.mockReturnValue({ data: undefined, isFetching: false, error: null })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('UIStore integration', () => {
    it('exposes searchQuery from UIStore', () => {
      useUIStore.setState({ searchQuery: 'react' })
      const { result } = renderHook(() => useSearchBookmark())
      expect(result.current.searchQuery).toBe('react')
    })

    it('exposes setSearchQuery that updates the UIStore', () => {
      const { result } = renderHook(() => useSearchBookmark())
      act(() => {
        result.current.setSearchQuery('typescript')
      })
      expect(useUIStore.getState().searchQuery).toBe('typescript')
    })
  })

  describe('return values', () => {
    it('returns empty array as default searchResults when query returns undefined', () => {
      const { result } = renderHook(() => useSearchBookmark())
      expect(result.current.searchResults).toEqual([])
    })

    it('returns data from useSearchQuery as searchResults', () => {
      mockUseSearchQuery.mockReturnValue({
        data: [sampleBookmark],
        isFetching: false,
        error: null,
      })
      const { result } = renderHook(() => useSearchBookmark())
      expect(result.current.searchResults).toEqual([sampleBookmark])
    })

    it('exposes isSearching from useSearchQuery isFetching', () => {
      mockUseSearchQuery.mockReturnValue({ data: undefined, isFetching: true, error: null })
      const { result } = renderHook(() => useSearchBookmark())
      expect(result.current.isSearching).toBe(true)
    })

    it('returns null error when no error has occurred', () => {
      const { result } = renderHook(() => useSearchBookmark())
      expect(result.current.error).toBeNull()
    })

    it('returns error message string when an error is present', () => {
      mockUseSearchQuery.mockReturnValue({
        data: undefined,
        isFetching: false,
        error: new Error('Search failed'),
      })
      const { result } = renderHook(() => useSearchBookmark())
      expect(result.current.error).toBe('Search failed')
    })

    it('returns null error when the error object has no message property', () => {
      // An error-like object without a .message property should not crash
      // and error??.message is undefined, so the ?? null falls through to null
      mockUseSearchQuery.mockReturnValue({
        data: undefined,
        isFetching: false,
        error: {} as Error,
      })
      const { result } = renderHook(() => useSearchBookmark())
      expect(result.current.error).toBeNull()
    })
  })

  describe('debounce behavior', () => {
    it('passes the initial query to useSearchQuery immediately on mount', () => {
      useUIStore.setState({ searchQuery: 'initial', selectedTagIds: [] })
      renderHook(() => useSearchBookmark())
      // Initial render passes the current state synchronously
      expect(mockUseSearchQuery).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'initial' }),
      )
    })

    it('does not update the query key before the debounce delay', () => {
      const { result } = renderHook(() => useSearchBookmark())

      act(() => {
        result.current.setSearchQuery('typed')
      })
      // Advance less than debounce delay (1000ms)
      act(() => {
        vi.advanceTimersByTime(500)
      })

      // Query should still be called with the initial (empty) input
      expect(lastQueryInput()).toMatchObject({ query: '' })
    })

    it('updates the query key after the debounce delay elapses', () => {
      const { result } = renderHook(() => useSearchBookmark())

      act(() => {
        result.current.setSearchQuery('react')
      })

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(lastQueryInput()).toMatchObject({ query: 'react' })
    })

    it('resets the debounce timer when query changes before the delay', () => {
      const { result } = renderHook(() => useSearchBookmark())

      act(() => {
        result.current.setSearchQuery('r')
      })
      act(() => {
        vi.advanceTimersByTime(500)
        result.current.setSearchQuery('react')
      })
      act(() => {
        vi.advanceTimersByTime(500)
      })

      // Only halfway through the second debounce window — still old input
      expect(lastQueryInput()).toMatchObject({ query: '' })

      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(lastQueryInput()).toMatchObject({ query: 'react' })
    })

    it('includes selectedTagIds from UIStore in the debounced input', () => {
      const { result } = renderHook(() => useSearchBookmark())

      act(() => {
        result.current.setSearchQuery('notes')
        useUIStore.getState().toggleTag(5)
      })

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(lastQueryInput()).toMatchObject({ query: 'notes', tagIds: [5] })
    })

    it('fires the debounce when only selectedTagIds changes with an empty searchQuery', () => {
      // Start with empty query and no tags
      useUIStore.setState({ searchQuery: '', selectedTagIds: [] })
      renderHook(() => useSearchBookmark())

      // Toggle a tag without changing the search text
      act(() => {
        useUIStore.getState().toggleTag(3)
      })

      // Before delay — still the initial state (empty tagIds)
      act(() => {
        vi.advanceTimersByTime(500)
      })
      expect(lastQueryInput()).toMatchObject({ query: '', tagIds: [] })

      // After full debounce delay — updated tagIds should propagate
      act(() => {
        vi.advanceTimersByTime(500)
      })
      expect(lastQueryInput()).toMatchObject({ query: '', tagIds: [3] })
    })

    it('fires debounce with tagIds: [] after clearTags is called', () => {
      // Start with a tag selected
      useUIStore.setState({ searchQuery: '', selectedTagIds: [7] })
      renderHook(() => useSearchBookmark())

      // Clear the tag
      act(() => {
        useUIStore.getState().clearTags()
      })

      // Before delay — still the previous state
      act(() => {
        vi.advanceTimersByTime(500)
      })
      expect(lastQueryInput()).toMatchObject({ query: '', tagIds: [7] })

      // After full debounce delay — empty tagIds should propagate
      act(() => {
        vi.advanceTimersByTime(500)
      })
      expect(lastQueryInput()).toMatchObject({ query: '', tagIds: [] })
    })
  })
})
