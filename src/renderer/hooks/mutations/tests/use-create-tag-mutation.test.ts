import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useCreateTagMutation } from '@renderer/hooks/mutations/use-create-tag-mutation'
import { IpcChannels } from '@shared/ipc-channels'
import type { CreateTagInput, IpcResult, Tag } from '@shared/types/domains'
import { createWrapper } from '@renderer/hooks/queries/tests/test-utils'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const { mockInvoke } = vi.hoisted(() => ({ mockInvoke: vi.fn() }))

Object.defineProperty(window, 'electron', {
  value: { invoke: mockInvoke },
  writable: true,
})

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const createInput: CreateTagInput = { name: 'typescript' }

const tagFixture: Tag = { id: 'tag-uuid-1', name: 'typescript', count: 0 }

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useCreateTagMutation', () => {
  beforeEach(() => {
    mockInvoke.mockReset()
  })

  it('calls TAG_CREATE with the provided input', async () => {
    const ipcResult: IpcResult<Tag> = { success: true, data: tagFixture }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useCreateTagMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(createInput)
    })

    expect(mockInvoke).toHaveBeenCalledWith(IpcChannels.TAG_CREATE, createInput)
    expect(mockInvoke).toHaveBeenCalledTimes(1)
  })

  it('returns the created tag on success', async () => {
    const ipcResult: IpcResult<Tag> = { success: true, data: tagFixture }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useCreateTagMutation(), { wrapper })

    let data: Tag | undefined
    await act(async () => {
      data = await result.current.mutateAsync(createInput)
    })

    expect(data).toEqual(tagFixture)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('throws with the IPC error message when success is false', async () => {
    const ipcResult: IpcResult<Tag> = { success: false, error: 'Tag already exists' }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useCreateTagMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync(createInput)).rejects.toThrow('Tag already exists')
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('throws with fallback message when error is not provided', async () => {
    const ipcResult: IpcResult<Tag> = { success: false }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useCreateTagMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync(createInput)).rejects.toThrow('Failed to create tag')
    })
  })

  it('throws when success is true but data is undefined', async () => {
    const ipcResult: IpcResult<Tag> = { success: true, data: undefined }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useCreateTagMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync(createInput)).rejects.toThrow('Failed to create tag')
    })
  })

  it('invalidates tag.all on success', async () => {
    const ipcResult: IpcResult<Tag> = { success: true, data: tagFixture }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateTagMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(createInput)
    })

    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['tags'] }),
      ),
    )
  })

  it('does not invalidate bookmark.all on success', async () => {
    const ipcResult: IpcResult<Tag> = { success: true, data: tagFixture }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateTagMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(createInput)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(invalidateSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: expect.arrayContaining(['bookmarks']) }),
    )
  })

  it('throws when IPC rejects at the transport level', async () => {
    mockInvoke.mockRejectedValue(new Error('IPC channel unavailable'))
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useCreateTagMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync(createInput)).rejects.toThrow('IPC channel unavailable')
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
