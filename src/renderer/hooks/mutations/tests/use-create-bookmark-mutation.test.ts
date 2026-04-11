import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useCreateBookmarkMutation } from '@renderer/hooks/mutations/use-create-bookmark-mutation'
import { IpcChannels } from '@shared/ipc-channels'
import type { Bookmark, CreateBookmarkInput, IpcResult } from '@shared/types/domains'
import { createWrapper } from '@renderer/hooks/queries/tests/test-utils'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const { mockInvoke } = vi.hoisted(() => ({ mockInvoke: vi.fn() }))

Object.defineProperty(window, 'electron', {
  value: { invoke: mockInvoke },
  writable: true,
})

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const createInput: CreateBookmarkInput = {
  url: 'https://example.com',
  title: 'Example',
  notes: null,
  tagIds: [],
}

const bookmarkFixture: Bookmark = {
  id: 'uuid-1',
  url: 'https://example.com',
  title: 'Example',
  notes: null,
  favicon_url: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  tags: [],
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useCreateBookmarkMutation', () => {
  beforeEach(() => {
    mockInvoke.mockReset()
  })

  it('calls BOOKMARK_CREATE with the provided input', async () => {
    const ipcResult: IpcResult<Bookmark> = { success: true, data: bookmarkFixture }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useCreateBookmarkMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(createInput)
    })

    expect(mockInvoke).toHaveBeenCalledWith(IpcChannels.BOOKMARK_CREATE, createInput)
    expect(mockInvoke).toHaveBeenCalledTimes(1)
  })

  it('returns the created bookmark on success', async () => {
    const ipcResult: IpcResult<Bookmark> = { success: true, data: bookmarkFixture }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useCreateBookmarkMutation(), { wrapper })

    let data: Bookmark | undefined
    await act(async () => {
      data = await result.current.mutateAsync(createInput)
    })

    expect(data).toEqual(bookmarkFixture)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('throws with the IPC error message when success is false', async () => {
    const ipcResult: IpcResult<Bookmark> = { success: false, error: 'Duplicate URL' }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useCreateBookmarkMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync(createInput)).rejects.toThrow('Duplicate URL')
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('throws with fallback message when success is false and error is not provided', async () => {
    const ipcResult: IpcResult<Bookmark> = { success: false }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useCreateBookmarkMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync(createInput)).rejects.toThrow('Failed to create bookmark')
    })
  })

  it('throws when success is true but data is undefined', async () => {
    const ipcResult: IpcResult<Bookmark> = { success: true, data: undefined }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useCreateBookmarkMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync(createInput)).rejects.toThrow('Failed to create bookmark')
    })
  })

  it('invalidates bookmark.all and tag.all on success', async () => {
    const ipcResult: IpcResult<Bookmark> = { success: true, data: bookmarkFixture }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateBookmarkMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(createInput)
    })

    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledTimes(2))
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['bookmarks'] }),
    )
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['tags'] }),
    )
  })

  it('does not invalidate queries when mutation fails', async () => {
    const ipcResult: IpcResult<Bookmark> = { success: false, error: 'DB error' }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateBookmarkMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync(createInput)).rejects.toThrow()
    })

    expect(invalidateSpy).not.toHaveBeenCalled()
  })

  it('throws when IPC rejects at the transport level', async () => {
    mockInvoke.mockRejectedValue(new Error('IPC channel unavailable'))
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useCreateBookmarkMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync(createInput)).rejects.toThrow('IPC channel unavailable')
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('is idle before mutate is called', () => {
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useCreateBookmarkMutation(), { wrapper })

    expect(result.current.isIdle).toBe(true)
  })
})
