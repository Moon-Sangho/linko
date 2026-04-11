import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useDeleteTagMutation } from '@renderer/hooks/mutations/use-delete-tag-mutation'
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

describe('useDeleteTagMutation', () => {
  beforeEach(() => {
    mockInvoke.mockReset()
  })

  it('calls TAG_DELETE with the tag id', async () => {
    const ipcResult: IpcResult = { success: true }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useDeleteTagMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync('tag-uuid-5')
    })

    expect(mockInvoke).toHaveBeenCalledWith(IpcChannels.TAG_DELETE, 'tag-uuid-5')
    expect(mockInvoke).toHaveBeenCalledTimes(1)
  })

  it('resolves without a return value on success', async () => {
    const ipcResult: IpcResult = { success: true }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useDeleteTagMutation(), { wrapper })

    let returnValue: unknown = 'sentinel'
    await act(async () => {
      returnValue = await result.current.mutateAsync('tag-uuid-5')
    })

    expect(returnValue).toBeUndefined()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('throws with the IPC error message when success is false', async () => {
    const ipcResult: IpcResult = { success: false, error: 'Tag not found' }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useDeleteTagMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync('tag-uuid-99')).rejects.toThrow('Tag not found')
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('throws with fallback message when error is not provided', async () => {
    const ipcResult: IpcResult = { success: false }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useDeleteTagMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync('tag-uuid-1')).rejects.toThrow('Failed to delete tag')
    })
  })

  it('invalidates tag.all on success', async () => {
    const ipcResult: IpcResult = { success: true }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeleteTagMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync('tag-uuid-5')
    })

    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['tags'] }),
      ),
    )
  })

  it('invalidates bookmark.all on success (deleting a tag may change bookmark tag lists)', async () => {
    const ipcResult: IpcResult = { success: true }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeleteTagMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync('tag-uuid-5')
    })

    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['bookmarks'] }),
      ),
    )
  })

  it('does not invalidate queries when mutation fails', async () => {
    const ipcResult: IpcResult = { success: false, error: 'DB error' }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeleteTagMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync('tag-uuid-1')).rejects.toThrow()
    })

    expect(invalidateSpy).not.toHaveBeenCalled()
  })

  it('throws when IPC rejects at the transport level', async () => {
    mockInvoke.mockRejectedValue(new Error('IPC channel unavailable'))
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useDeleteTagMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync('tag-uuid-5')).rejects.toThrow('IPC channel unavailable')
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
