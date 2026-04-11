import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useBookmarkQuery } from '@renderer/hooks/queries/use-bookmark-query'
import { IpcChannels } from '@shared/ipc-channels'
import type { Bookmark } from '@shared/types/domains'
import { createWrapper } from './test-utils'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const { mockInvoke } = vi.hoisted(() => ({ mockInvoke: vi.fn() }))

Object.defineProperty(window, 'electron', {
  value: { invoke: mockInvoke },
  writable: true,
})

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const bookmarkFixture: Bookmark = {
  id: 'uuid-42',
  url: 'https://example.com',
  title: 'Example Site',
  notes: null,
  favicon_url: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  tags: [],
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useBookmarkQuery', () => {
  beforeEach(() => {
    mockInvoke.mockReset()
  })

  it('returns a bookmark and calls the correct IPC channel with id', async () => {
    mockInvoke.mockResolvedValue(bookmarkFixture)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useBookmarkQuery('uuid-42'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(bookmarkFixture)
    expect(mockInvoke).toHaveBeenCalledWith(IpcChannels.BOOKMARK_GET_BY_ID, 'uuid-42')
    expect(mockInvoke).toHaveBeenCalledTimes(1)
  })

  it('is pending before IPC resolves', () => {
    mockInvoke.mockReturnValue(new Promise(() => {})) // never resolves
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useBookmarkQuery('uuid-1'), { wrapper })

    expect(result.current.isPending).toBe(true)
  })

  it('returns null when bookmark does not exist', async () => {
    mockInvoke.mockResolvedValue(null)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useBookmarkQuery('uuid-999'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeNull()
    expect(mockInvoke).toHaveBeenCalledWith(IpcChannels.BOOKMARK_GET_BY_ID, 'uuid-999')
  })

  it('does not call IPC when id is empty string (disabled by enabled: !!id)', () => {
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useBookmarkQuery(''), { wrapper })

    // enabled: !!id prevents the query from firing for empty string ids
    expect(result.current.isPending).toBe(true)
    expect(result.current.fetchStatus).toBe('idle')
    expect(mockInvoke).not.toHaveBeenCalled()
  })

  it('refetches with the new id when id changes', async () => {
    const bookmark1 = { ...bookmarkFixture, id: 'uuid-1' }
    const bookmark2 = { ...bookmarkFixture, id: 'uuid-2' }
    mockInvoke.mockResolvedValueOnce(bookmark1).mockResolvedValueOnce(bookmark2)
    const { wrapper } = createWrapper()

    const { result, rerender } = renderHook(
      ({ id }: { id: string }) => useBookmarkQuery(id),
      { wrapper, initialProps: { id: 'uuid-1' } },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockInvoke).toHaveBeenNthCalledWith(1, IpcChannels.BOOKMARK_GET_BY_ID, 'uuid-1')

    rerender({ id: 'uuid-2' })
    await waitFor(() => expect(result.current.data?.id).toBe('uuid-2'))

    expect(mockInvoke).toHaveBeenNthCalledWith(2, IpcChannels.BOOKMARK_GET_BY_ID, 'uuid-2')
    expect(mockInvoke).toHaveBeenCalledTimes(2)
  })

  it('does not refetch when rerendered with the same id', async () => {
    mockInvoke.mockResolvedValue(bookmarkFixture)
    const { wrapper } = createWrapper()

    const { result, rerender } = renderHook(
      ({ id }: { id: string }) => useBookmarkQuery(id),
      { wrapper, initialProps: { id: 'uuid-42' } },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockInvoke).toHaveBeenCalledTimes(1)

    rerender({ id: 'uuid-42' })

    // Same query key → served from cache, no additional IPC call
    expect(mockInvoke).toHaveBeenCalledTimes(1)
    expect(result.current.data).toEqual(bookmarkFixture)
  })

  it('enters error state when IPC rejects', async () => {
    mockInvoke.mockRejectedValue(new Error('Not found'))
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useBookmarkQuery('uuid-1'), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect((result.current.error as Error).message).toBe('Not found')
  })
})
