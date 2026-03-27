import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useFetchUrlMetadataMutation } from '@renderer/hooks/mutations/use-fetch-url-metadata-mutation'
import { IpcChannels } from '@shared/ipc-channels'
import type { IpcResult, UrlMetadata } from '@shared/types/domains'
import { createWrapper } from '@renderer/hooks/queries/tests/test-utils'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const { mockInvoke } = vi.hoisted(() => ({ mockInvoke: vi.fn() }))

Object.defineProperty(window, 'electron', {
  value: { invoke: mockInvoke },
  writable: true,
})

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const metadataFixture: UrlMetadata = {
  title: 'Example Site',
  favicon_url: 'https://example.com/favicon.ico',
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useFetchUrlMetadataMutation', () => {
  beforeEach(() => {
    mockInvoke.mockReset()
  })

  it('calls BOOKMARK_FETCH_METADATA with the provided URL', async () => {
    const ipcResult: IpcResult<UrlMetadata> = { success: true, data: metadataFixture }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useFetchUrlMetadataMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync('https://example.com')
    })

    expect(mockInvoke).toHaveBeenCalledWith(
      IpcChannels.BOOKMARK_FETCH_METADATA,
      'https://example.com',
    )
    expect(mockInvoke).toHaveBeenCalledTimes(1)
  })

  it('returns UrlMetadata on success', async () => {
    const ipcResult: IpcResult<UrlMetadata> = { success: true, data: metadataFixture }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useFetchUrlMetadataMutation(), { wrapper })

    let data: UrlMetadata | undefined
    await act(async () => {
      data = await result.current.mutateAsync('https://example.com')
    })

    expect(data).toEqual(metadataFixture)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('returns metadata with null fields when the page has no title or favicon', async () => {
    // data is a non-null object even though its fields are null — the !result.data guard does not throw
    const noMetadata: UrlMetadata = { title: null, favicon_url: null }
    const ipcResult: IpcResult<UrlMetadata> = { success: true, data: noMetadata }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useFetchUrlMetadataMutation(), { wrapper })

    let data: UrlMetadata | undefined
    await act(async () => {
      data = await result.current.mutateAsync('https://example.com/no-meta')
    })

    expect(data).toEqual(noMetadata)
  })

  it('throws with the IPC error message when success is false', async () => {
    const ipcResult: IpcResult<UrlMetadata> = { success: false, error: 'Fetch timeout' }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useFetchUrlMetadataMutation(), { wrapper })

    await act(async () => {
      await expect(
        result.current.mutateAsync('https://unreachable.example.com'),
      ).rejects.toThrow('Fetch timeout')
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('throws with fallback message when error is not provided', async () => {
    const ipcResult: IpcResult<UrlMetadata> = { success: false }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useFetchUrlMetadataMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync('https://example.com')).rejects.toThrow(
        'Failed to fetch metadata',
      )
    })
  })

  it('throws when success is true but data is undefined', async () => {
    const ipcResult: IpcResult<UrlMetadata> = { success: true, data: undefined }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useFetchUrlMetadataMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync('https://example.com')).rejects.toThrow(
        'Failed to fetch metadata',
      )
    })
  })

  it('throws when IPC rejects at the transport level', async () => {
    mockInvoke.mockRejectedValue(new Error('IPC channel unavailable'))
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useFetchUrlMetadataMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync('https://example.com')).rejects.toThrow(
        'IPC channel unavailable',
      )
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('does not invalidate any queries on success (metadata fetch has no cache side effects)', async () => {
    const ipcResult: IpcResult<UrlMetadata> = { success: true, data: metadataFixture }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useFetchUrlMetadataMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync('https://example.com')
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).not.toHaveBeenCalled()
  })
})
