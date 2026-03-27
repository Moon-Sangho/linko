import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useImportBookmarksMutation, IMPORT_CANCELLED_SENTINEL } from '@renderer/hooks/mutations/use-import-bookmarks-mutation'
import { IpcChannels } from '@shared/ipc-channels'
import type { ImportSummary, IpcResult } from '@shared/types/domains'
import { createWrapper } from '@renderer/hooks/queries/tests/test-utils'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const { mockInvoke } = vi.hoisted(() => ({ mockInvoke: vi.fn() }))

Object.defineProperty(window, 'electron', {
  value: { invoke: mockInvoke },
  writable: true,
})

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const importSummaryFixture: ImportSummary = { added: 10, skipped: 2, errors: 0 }

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useImportBookmarksMutation', () => {
  beforeEach(() => {
    mockInvoke.mockReset()
  })

  it('calls FS_IMPORT_BOOKMARKS with no arguments', async () => {
    const ipcResult: IpcResult<ImportSummary> = { success: true, data: importSummaryFixture }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useImportBookmarksMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync()
    })

    expect(mockInvoke).toHaveBeenCalledWith(IpcChannels.FS_IMPORT_BOOKMARKS)
    expect(mockInvoke).toHaveBeenCalledTimes(1)
  })

  it('returns ImportSummary on successful import', async () => {
    const ipcResult: IpcResult<ImportSummary> = { success: true, data: importSummaryFixture }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useImportBookmarksMutation(), { wrapper })

    let data: ImportSummary | null | undefined
    await act(async () => {
      data = await result.current.mutateAsync()
    })

    expect(data).toEqual(importSummaryFixture)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('returns null when user cancels the file dialog', async () => {
    const ipcResult: IpcResult<ImportSummary> = { success: false, error: IMPORT_CANCELLED_SENTINEL }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useImportBookmarksMutation(), { wrapper })

    let data: ImportSummary | null | undefined = undefined
    await act(async () => {
      data = await result.current.mutateAsync()
    })

    expect(data).toBeNull()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('throws for non-cancellation errors', async () => {
    const ipcResult: IpcResult<ImportSummary> = { success: false, error: 'Parse error' }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useImportBookmarksMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync()).rejects.toThrow('Parse error')
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('throws with fallback message when success is false and no error is provided', async () => {
    const ipcResult: IpcResult<ImportSummary> = { success: false }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useImportBookmarksMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync()).rejects.toThrow('Import failed')
    })
  })

  it('invalidates bookmark.all on successful import with data', async () => {
    const ipcResult: IpcResult<ImportSummary> = { success: true, data: importSummaryFixture }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useImportBookmarksMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync()
    })

    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['bookmarks'] }),
      ),
    )
  })

  it('invalidates tag.all on successful import with data', async () => {
    const ipcResult: IpcResult<ImportSummary> = { success: true, data: importSummaryFixture }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useImportBookmarksMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync()
    })

    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['tags'] }),
      ),
    )
  })

  it('does not invalidate queries when user cancels', async () => {
    const ipcResult: IpcResult<ImportSummary> = { success: false, error: IMPORT_CANCELLED_SENTINEL }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useImportBookmarksMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).not.toHaveBeenCalled()
  })

  it('throws when IPC rejects at the transport level', async () => {
    mockInvoke.mockRejectedValue(new Error('IPC channel unavailable'))
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useImportBookmarksMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync()).rejects.toThrow('IPC channel unavailable')
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('returns null (not undefined) when success data is unexpectedly undefined', async () => {
    const ipcResult: IpcResult<ImportSummary> = { success: true, data: undefined }
    mockInvoke.mockResolvedValue(ipcResult)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useImportBookmarksMutation(), { wrapper })

    let data: ImportSummary | null | undefined = undefined
    await act(async () => {
      data = await result.current.mutateAsync()
    })

    expect(data).toBeNull()
  })
})
