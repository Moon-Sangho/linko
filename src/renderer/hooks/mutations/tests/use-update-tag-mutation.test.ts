import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useUpdateTagMutation } from '@renderer/hooks/mutations/use-update-tag-mutation'
import { IpcChannels } from '@shared/ipc-channels'
import type { IpcResult, Tag, UpdateTagInput } from '@shared/types/domains'
import { createWrapper } from '@renderer/hooks/queries/tests/test-utils'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const { mockInvoke } = vi.hoisted(() => ({ mockInvoke: vi.fn() }))

Object.defineProperty(window, 'electron', {
  value: { invoke: mockInvoke },
  writable: true,
})

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const updateInput: UpdateTagInput = { name: 'typescript' }

const tagFixture: Tag = { id: 7, name: 'typescript', count: 3 }

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useUpdateTagMutation', () => {
  beforeEach(() => {
    mockInvoke.mockReset()
  })

  it('calls TAG_UPDATE with the tag id and input', async () => {
    const ipcResult: IpcResult<Tag> = { success: true, data: tagFixture }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useUpdateTagMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ id: 7, input: updateInput })
    })

    expect(mockInvoke).toHaveBeenCalledWith(IpcChannels.TAG_UPDATE, 7, updateInput)
    expect(mockInvoke).toHaveBeenCalledTimes(1)
  })

  it('returns result.data on success', async () => {
    const ipcResult: IpcResult<Tag> = { success: true, data: tagFixture }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useUpdateTagMutation(), { wrapper })

    let data: Tag | undefined
    await act(async () => {
      data = await result.current.mutateAsync({ id: 7, input: updateInput })
    })

    expect(data).toEqual(tagFixture)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('throws with the IPC error message when success is false', async () => {
    const ipcResult: IpcResult<Tag> = { success: false, error: 'Tag not found' }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useUpdateTagMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync({ id: 99, input: updateInput })).rejects.toThrow(
        'Tag not found',
      )
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('throws with fallback message when error field is absent', async () => {
    const ipcResult: IpcResult<Tag> = { success: false }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useUpdateTagMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync({ id: 7, input: updateInput })).rejects.toThrow(
        'Failed to update tag',
      )
    })
  })

  it('invalidates tag.all on success', async () => {
    const ipcResult: IpcResult<Tag> = { success: true, data: tagFixture }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateTagMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ id: 7, input: updateInput })
    })

    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['tags'] }),
      ),
    )
  })

  it('invalidates bookmark.all on success (renaming a tag may change bookmark tag labels)', async () => {
    const ipcResult: IpcResult<Tag> = { success: true, data: tagFixture }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateTagMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ id: 7, input: updateInput })
    })

    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['bookmarks'] }),
      ),
    )
  })

  it('does not invalidate queries when mutation fails', async () => {
    const ipcResult: IpcResult<Tag> = { success: false, error: 'DB error' }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateTagMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync({ id: 7, input: updateInput })).rejects.toThrow()
    })

    expect(invalidateSpy).not.toHaveBeenCalled()
  })

  it('throws when IPC rejects at the transport level', async () => {
    mockInvoke.mockRejectedValue(new Error('IPC channel unavailable'))
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useUpdateTagMutation(), { wrapper })

    await act(async () => {
      await expect(
        result.current.mutateAsync({ id: 7, input: updateInput }),
      ).rejects.toThrow('IPC channel unavailable')
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
