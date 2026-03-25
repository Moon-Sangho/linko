import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAppVersionQuery } from '@renderer/hooks/queries/use-app-version-query'
import { IpcChannels } from '@shared/ipc-channels'
import { createWrapper } from './test-utils'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const { mockInvoke } = vi.hoisted(() => ({ mockInvoke: vi.fn() }))

Object.defineProperty(window, 'electron', {
  value: { invoke: mockInvoke },
  writable: true,
})

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useAppVersionQuery', () => {
  beforeEach(() => {
    mockInvoke.mockReset()
  })

  it('returns the app version string and calls the correct IPC channel', async () => {
    mockInvoke.mockResolvedValue('1.2.3')
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useAppVersionQuery(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBe('1.2.3')
    expect(mockInvoke).toHaveBeenCalledWith(IpcChannels.APP_GET_VERSION)
    expect(mockInvoke).toHaveBeenCalledTimes(1)
  })

  it('caches result under the correct query key', async () => {
    mockInvoke.mockResolvedValue('0.1.0')
    const { wrapper, queryClient } = createWrapper()

    const { result } = renderHook(() => useAppVersionQuery(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Verifies the hook uses queryKeys.app.version() = ['app', 'version']
    expect(queryClient.getQueryData(['app', 'version'])).toBe('0.1.0')
  })

  it('is pending before IPC resolves', () => {
    mockInvoke.mockReturnValue(new Promise(() => {})) // never resolves
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useAppVersionQuery(), { wrapper })

    expect(result.current.isPending).toBe(true)
  })

  it('surfaces null data when IPC returns null', async () => {
    mockInvoke.mockResolvedValue(null)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useAppVersionQuery(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeNull()
  })

  it('enters error state when IPC rejects', async () => {
    mockInvoke.mockRejectedValue(new Error('IPC failure'))
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useAppVersionQuery(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect((result.current.error as Error).message).toBe('IPC failure')
  })
})
