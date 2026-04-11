import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useTagsQuery } from '@renderer/hooks/queries/use-tags-query'
import { IpcChannels } from '@shared/ipc-channels'
import type { TagsResult } from '@shared/types/domains'
import { createWrapper } from './test-utils'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const { mockInvoke } = vi.hoisted(() => ({ mockInvoke: vi.fn() }))

Object.defineProperty(window, 'electron', {
  value: { invoke: mockInvoke },
  writable: true,
})

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const tagsFixture: TagsResult = {
  tags: [
    { id: 'tag-uuid-1', name: 'typescript', count: 3 },
    { id: 'tag-uuid-2', name: 'react', count: 5 },
  ],
  total: 2,
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useTagsQuery', () => {
  beforeEach(() => {
    mockInvoke.mockReset()
  })

  it('returns tags and total from IPC and calls the correct channel', async () => {
    mockInvoke.mockResolvedValue(tagsFixture)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useTagsQuery(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(tagsFixture)
    expect(mockInvoke).toHaveBeenCalledWith(IpcChannels.TAGS_GET_ALL)
    expect(mockInvoke).toHaveBeenCalledTimes(1)
  })

  it('is pending before IPC resolves', () => {
    mockInvoke.mockReturnValue(new Promise(() => {})) // never resolves
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useTagsQuery(), { wrapper })

    expect(result.current.isPending).toBe(true)
  })

  it('returns empty tags list and calls the correct channel', async () => {
    const emptyResult: TagsResult = { tags: [], total: 0 }
    mockInvoke.mockResolvedValue(emptyResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useTagsQuery(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.tags).toHaveLength(0)
    expect(result.current.data?.total).toBe(0)
    // IPC channel assertion is required even in the empty-list path
    expect(mockInvoke).toHaveBeenCalledWith(IpcChannels.TAGS_GET_ALL)
  })

  it('passes through IPC response verbatim when total mismatches tags length', async () => {
    // Confirms the hook does not normalize or drop data from the IPC response
    const mismatchResult: TagsResult = { tags: [{ id: 'tag-uuid-1', name: 'typescript' }], total: 99 }
    mockInvoke.mockResolvedValue(mismatchResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useTagsQuery(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mismatchResult)
    expect(result.current.data?.total).toBe(99)
    expect(result.current.data?.tags).toHaveLength(1)
  })

  it('enters error state when IPC rejects', async () => {
    mockInvoke.mockRejectedValue(new Error('DB error'))
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useTagsQuery(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect((result.current.error as Error).message).toBe('DB error')
  })
})
