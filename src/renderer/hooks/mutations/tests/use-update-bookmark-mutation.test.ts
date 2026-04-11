import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useUpdateBookmarkMutation } from '@renderer/hooks/mutations/use-update-bookmark-mutation'
import { IpcChannels } from '@shared/ipc-channels'
import type { Bookmark, IpcResult, UpdateBookmarkInput } from '@shared/types/domains'
import { createWrapper } from '@renderer/hooks/queries/tests/test-utils'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const { mockInvoke } = vi.hoisted(() => ({ mockInvoke: vi.fn() }))

Object.defineProperty(window, 'electron', {
  value: { invoke: mockInvoke },
  writable: true,
})

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const bookmarkFixture: Bookmark = {
  id: 'uuid-42',
  url: 'https://updated.example.com',
  title: 'Updated Title',
  notes: 'Some notes',
  favicon_url: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-06-01T00:00:00Z',
  tags: [],
}

const updateInput: UpdateBookmarkInput = {
  url: 'https://updated.example.com',
  title: 'Updated Title',
  notes: 'Some notes',
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useUpdateBookmarkMutation', () => {
  beforeEach(() => {
    mockInvoke.mockReset()
  })

  it('calls BOOKMARK_UPDATE with the id and update input', async () => {
    const ipcResult: IpcResult<Bookmark> = { success: true, data: bookmarkFixture }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useUpdateBookmarkMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ id: 'uuid-42', input: updateInput })
    })

    expect(mockInvoke).toHaveBeenCalledWith(IpcChannels.BOOKMARK_UPDATE, 'uuid-42', updateInput)
    expect(mockInvoke).toHaveBeenCalledTimes(1)
  })

  it('returns the updated bookmark on success', async () => {
    const ipcResult: IpcResult<Bookmark> = { success: true, data: bookmarkFixture }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useUpdateBookmarkMutation(), { wrapper })

    let data: Bookmark | undefined
    await act(async () => {
      data = await result.current.mutateAsync({ id: 'uuid-42', input: updateInput })
    })

    expect(data).toEqual(bookmarkFixture)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('throws with the IPC error message when success is false', async () => {
    const ipcResult: IpcResult<Bookmark> = { success: false, error: 'Bookmark not found' }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useUpdateBookmarkMutation(), { wrapper })

    await act(async () => {
      await expect(
        result.current.mutateAsync({ id: 'uuid-99', input: updateInput }),
      ).rejects.toThrow('Bookmark not found')
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('throws with fallback message when error is not provided', async () => {
    const ipcResult: IpcResult<Bookmark> = { success: false }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useUpdateBookmarkMutation(), { wrapper })

    await act(async () => {
      await expect(
        result.current.mutateAsync({ id: 'uuid-1', input: updateInput }),
      ).rejects.toThrow('Failed to update bookmark')
    })
  })

  it('throws when success is true but data is undefined', async () => {
    const ipcResult: IpcResult<Bookmark> = { success: true, data: undefined }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useUpdateBookmarkMutation(), { wrapper })

    await act(async () => {
      await expect(
        result.current.mutateAsync({ id: 'uuid-1', input: updateInput }),
      ).rejects.toThrow('Failed to update bookmark')
    })
  })

  it('invalidates bookmark.all on success', async () => {
    const ipcResult: IpcResult<Bookmark> = { success: true, data: bookmarkFixture }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateBookmarkMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ id: 'uuid-42', input: updateInput })
    })

    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['bookmarks'] }),
      ),
    )
  })

  it('invalidates the specific bookmark.byId on success', async () => {
    const ipcResult: IpcResult<Bookmark> = { success: true, data: bookmarkFixture }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateBookmarkMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ id: 'uuid-42', input: updateInput })
    })

    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['bookmarks', 'by-id', 'uuid-42'] }),
      ),
    )
  })

  it('invalidates tag.all on success (updating tags changes tag counts)', async () => {
    const ipcResult: IpcResult<Bookmark> = { success: true, data: bookmarkFixture }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateBookmarkMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ id: 'uuid-42', input: updateInput })
    })

    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['tags'] }),
      ),
    )
  })

  it('throws when IPC rejects at the transport level', async () => {
    mockInvoke.mockRejectedValue(new Error('IPC channel unavailable'))
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useUpdateBookmarkMutation(), { wrapper })

    await act(async () => {
      await expect(
        result.current.mutateAsync({ id: 'uuid-42', input: updateInput }),
      ).rejects.toThrow('IPC channel unavailable')
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('does not invalidate queries when mutation fails', async () => {
    const ipcResult: IpcResult<Bookmark> = { success: false, error: 'DB error' }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateBookmarkMutation(), { wrapper })

    await act(async () => {
      await expect(
        result.current.mutateAsync({ id: 'uuid-1', input: updateInput }),
      ).rejects.toThrow()
    })

    expect(invalidateSpy).not.toHaveBeenCalled()
  })
})
