import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useDeleteBulkBookmarksMutation } from '@renderer/hooks/mutations/use-delete-bulk-bookmarks-mutation'
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

describe('useDeleteBulkBookmarksMutation', () => {
  beforeEach(() => {
    mockInvoke.mockReset()
  })

  it('calls BOOKMARK_DELETE for each id in the array', async () => {
    const ipcResult: IpcResult = { success: true }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useDeleteBulkBookmarksMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync([1, 2, 3])
    })

    expect(mockInvoke).toHaveBeenCalledTimes(3)
    expect(mockInvoke).toHaveBeenCalledWith(IpcChannels.BOOKMARK_DELETE, 1)
    expect(mockInvoke).toHaveBeenCalledWith(IpcChannels.BOOKMARK_DELETE, 2)
    expect(mockInvoke).toHaveBeenCalledWith(IpcChannels.BOOKMARK_DELETE, 3)
  })

  it('resolves without a return value when all deletions succeed', async () => {
    const ipcResult: IpcResult = { success: true }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useDeleteBulkBookmarksMutation(), { wrapper })

    let returnValue: unknown = 'sentinel'
    await act(async () => {
      returnValue = await result.current.mutateAsync([1, 2])
    })

    expect(returnValue).toBeUndefined()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('throws when any single deletion fails', async () => {
    // 3 IDs → all 3 must be dispatched in parallel before the failure is detected
    mockInvoke
      .mockResolvedValueOnce({ success: true } as IpcResult)
      .mockResolvedValueOnce({ success: false, error: 'Not found' } as IpcResult)
      .mockResolvedValueOnce({ success: true } as IpcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useDeleteBulkBookmarksMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync([1, 2, 3])).rejects.toThrow(
        'Failed to delete some bookmarks',
      )
    })

    expect(mockInvoke).toHaveBeenCalledTimes(3)
    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('invalidates bookmark.all via onSettled even when mutation fails', async () => {
    mockInvoke
      .mockResolvedValueOnce({ success: true } as IpcResult)
      .mockResolvedValueOnce({ success: false } as IpcResult)
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeleteBulkBookmarksMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync([1, 2])).rejects.toThrow()
    })

    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['bookmarks'] }),
      ),
    )
  })

  it('invalidates tag.all via onSettled even when mutation fails', async () => {
    mockInvoke
      .mockResolvedValueOnce({ success: true } as IpcResult)
      .mockResolvedValueOnce({ success: false } as IpcResult)
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeleteBulkBookmarksMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync([1, 2])).rejects.toThrow()
    })

    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['tags'] }),
      ),
    )
  })

  it('makes no IPC calls when given an empty array', async () => {
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useDeleteBulkBookmarksMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync([])
    })

    expect(mockInvoke).not.toHaveBeenCalled()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('invalidates tag.all via onSettled on successful bulk delete', async () => {
    const ipcResult: IpcResult = { success: true }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeleteBulkBookmarksMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync([10, 20])
    })

    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledTimes(2))
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['bookmarks'] }),
    )
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['tags'] }),
    )
  })

  it('throws when IPC rejects at the transport level', async () => {
    mockInvoke.mockRejectedValue(new Error('IPC channel unavailable'))
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useDeleteBulkBookmarksMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync([1, 2, 3])).rejects.toThrow('IPC channel unavailable')
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
