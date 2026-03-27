import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useDeleteBookmarkMutation } from '@renderer/hooks/mutations/use-delete-bookmark-mutation'
import { IpcChannels } from '@shared/ipc-channels'
import type { IpcResult } from '@shared/types/domains'
import { createWrapper } from '@renderer/hooks/queries/tests/test-utils'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const { mockInvoke } = vi.hoisted(() => ({ mockInvoke: vi.fn() }))

Object.defineProperty(window, 'electron', {
  value: { invoke: mockInvoke },
  writable: true,
})

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useDeleteBookmarkMutation', () => {
  beforeEach(() => {
    mockInvoke.mockReset()
  })

  it('calls BOOKMARK_DELETE with the bookmark id', async () => {
    const ipcResult: IpcResult = { success: true }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useDeleteBookmarkMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(42)
    })

    expect(mockInvoke).toHaveBeenCalledWith(IpcChannels.BOOKMARK_DELETE, 42)
    expect(mockInvoke).toHaveBeenCalledTimes(1)
  })

  it('resolves without a return value on success', async () => {
    const ipcResult: IpcResult = { success: true }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useDeleteBookmarkMutation(), { wrapper })

    let returnValue: unknown = 'sentinel'
    await act(async () => {
      returnValue = await result.current.mutateAsync(42)
    })

    expect(returnValue).toBeUndefined()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('throws with the IPC error message when success is false', async () => {
    const ipcResult: IpcResult = { success: false, error: 'Bookmark not found' }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useDeleteBookmarkMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync(99)).rejects.toThrow('Bookmark not found')
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('throws with fallback message when error is not provided', async () => {
    const ipcResult: IpcResult = { success: false }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useDeleteBookmarkMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync(1)).rejects.toThrow('Failed to delete bookmark')
    })
  })

  it('invalidates bookmark.all on success', async () => {
    const ipcResult: IpcResult = { success: true }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeleteBookmarkMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(42)
    })

    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['bookmarks'] }),
      ),
    )
  })

  it('removes the specific bookmark from cache by id on success', async () => {
    const ipcResult: IpcResult = { success: true }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper, queryClient } = createWrapper()
    const removeSpy = vi.spyOn(queryClient, 'removeQueries')

    const { result } = renderHook(() => useDeleteBookmarkMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(42)
    })

    await waitFor(() =>
      expect(removeSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['bookmarks', 'by-id', 42] }),
      ),
    )
  })

  it('invalidates tag.all on success', async () => {
    const ipcResult: IpcResult = { success: true }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeleteBookmarkMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(42)
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

    const { result } = renderHook(() => useDeleteBookmarkMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync(42)).rejects.toThrow('IPC channel unavailable')
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
