import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useOpenUrlMutation } from '@renderer/hooks/mutations/use-open-url-mutation'
import { IpcChannels } from '@shared/ipc-channels'
import { createWrapper } from '@renderer/hooks/queries/tests/test-utils'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const { mockInvoke } = vi.hoisted(() => ({ mockInvoke: vi.fn() }))

Object.defineProperty(window, 'electron', {
  value: { invoke: mockInvoke },
  writable: true,
})

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useOpenUrlMutation', () => {
  beforeEach(() => {
    mockInvoke.mockReset()
  })

  it('calls BOOKMARK_OPEN with the bookmark id and url', async () => {
    mockInvoke.mockResolvedValue(undefined)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useOpenUrlMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ id: 42, url: 'https://example.com' })
    })

    expect(mockInvoke).toHaveBeenCalledWith(IpcChannels.BOOKMARK_OPEN, 42, 'https://example.com')
    expect(mockInvoke).toHaveBeenCalledTimes(1)
  })

  it('does not invalidate any queries (opening a URL has no cache side effects)', async () => {
    mockInvoke.mockResolvedValue(undefined)
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useOpenUrlMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ id: 1, url: 'https://example.com' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).not.toHaveBeenCalled()
  })

  it('enters error state when IPC rejects', async () => {
    mockInvoke.mockRejectedValue(new Error('Shell open failed'))
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useOpenUrlMutation(), { wrapper })

    await act(async () => {
      await expect(
        result.current.mutateAsync({ id: 1, url: 'https://example.com' }),
      ).rejects.toThrow('Shell open failed')
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
