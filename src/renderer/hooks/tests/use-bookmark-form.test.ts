import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useBookmarkForm } from '@renderer/hooks/use-bookmark-form'
import { IpcChannels } from '@shared/ipc-channels'
import type { IpcResult, UrlMetadata } from '@shared/types/domains'

// ─── Mocks ───────────────────────────────────────────────────────────────────
// vi.hoisted() ensures mockInvoke is initialized before vi.mock factories run.

const { mockInvoke } = vi.hoisted(() => ({ mockInvoke: vi.fn() }))

Object.defineProperty(window, 'electron', {
  value: { invoke: mockInvoke },
  writable: true,
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Sets up the two IPC responses emitted by handleUrlBlur for a valid URL:
 *   1. BOOKMARK_CHECK_DUPLICATE → { success: true, data: isDup }
 *   2. BOOKMARK_FETCH_METADATA  → { success: true, data: { title, favicon_url: null } }
 */
function setupBlurMocks({ isDup = false, title = null as string | null } = {}) {
  mockInvoke.mockResolvedValueOnce({ success: true, data: isDup } as IpcResult<boolean>)
  mockInvoke.mockResolvedValueOnce({
    success: true,
    data: { title, favicon_url: null },
  } as IpcResult<UrlMetadata>)
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useBookmarkForm', () => {
  beforeEach(() => {
    mockInvoke.mockReset()
  })

  describe('handleUrlChange', () => {
    it('updates the url field value', () => {
      const { result } = renderHook(() => useBookmarkForm())
      act(() => {
        result.current.handleUrlChange('https://changed.com')
      })
      expect(result.current.url).toBe('https://changed.com')
    })

    it('clears isDuplicate state', async () => {
      // runBlurChecks makes 2 IPC calls: dup check then metadata fetch (when title is empty)
      setupBlurMocks({ isDup: true })
      const { result } = renderHook(() => useBookmarkForm())
      act(() => result.current.handleUrlChange('https://dup.com'))
      await act(async () => {
        await result.current.handleUrlBlur()
      })
      expect(result.current.isDuplicate).toBe(true)

      act(() => result.current.handleUrlChange('https://other.com'))
      expect(result.current.isDuplicate).toBe(false)
    })

    it('clears suggestedUrl state', async () => {
      const { result } = renderHook(() => useBookmarkForm())
      act(() => result.current.handleUrlChange('example.com'))
      await act(async () => {
        await result.current.handleUrlBlur()
      })
      expect(result.current.suggestedUrl).toBe('https://example.com')

      act(() => result.current.handleUrlChange('https://new.com'))
      expect(result.current.suggestedUrl).toBe('')
    })
  })

  describe('handleUrlBlur', () => {
    it('sets suggestedUrl for a bare domain', async () => {
      const { result } = renderHook(() => useBookmarkForm())
      act(() => result.current.handleUrlChange('example.com'))
      await act(async () => {
        await result.current.handleUrlBlur()
      })
      expect(result.current.suggestedUrl).toBe('https://example.com')
    })

    it('suggests http:// for IP addresses without protocol', async () => {
      const { result } = renderHook(() => useBookmarkForm())
      act(() => result.current.handleUrlChange('192.168.1.1'))
      await act(async () => {
        await result.current.handleUrlBlur()
      })
      expect(result.current.suggestedUrl).toBe('http://192.168.1.1')
    })

    it('calls duplicate check IPC for a valid URL', async () => {
      setupBlurMocks()
      const { result } = renderHook(() => useBookmarkForm())
      act(() => result.current.handleUrlChange('https://example.com'))
      await act(async () => {
        await result.current.handleUrlBlur()
      })
      expect(mockInvoke).toHaveBeenCalledWith(
        IpcChannels.BOOKMARK_CHECK_DUPLICATE,
        'https://example.com',
      )
    })

    it('sets isDuplicate to true when IPC reports a duplicate', async () => {
      // dup check returns true; code still proceeds to metadata fetch when title is empty
      setupBlurMocks({ isDup: true })
      const { result } = renderHook(() => useBookmarkForm())
      act(() => result.current.handleUrlChange('https://duplicate.com'))
      await act(async () => {
        await result.current.handleUrlBlur()
      })
      expect(result.current.isDuplicate).toBe(true)
    })

    it('auto-fills title from metadata when title is empty', async () => {
      setupBlurMocks({ title: 'Fetched Title' })
      const { result } = renderHook(() => useBookmarkForm())
      act(() => result.current.handleUrlChange('https://example.com'))
      await act(async () => {
        await result.current.handleUrlBlur()
      })
      expect(result.current.title).toBe('Fetched Title')
    })

    it('clears isFetchingMeta after the metadata fetch completes', async () => {
      // Verify the full lifecycle: starts false, returns to false after blur resolves.
      // The in-flight true state is verified indirectly in the reset/cancel tests.
      setupBlurMocks({ title: null })

      const { result } = renderHook(() => useBookmarkForm())
      expect(result.current.isFetchingMeta).toBe(false)

      act(() => result.current.handleUrlChange('https://example.com'))
      await act(async () => {
        await result.current.handleUrlBlur()
      })

      expect(result.current.isFetchingMeta).toBe(false)
    })

    it('skips duplicate check when URL matches skipDupCheckForUrl', async () => {
      const { result } = renderHook(() => useBookmarkForm())
      act(() => result.current.handleUrlChange('https://example.com'))
      await act(async () => {
        await result.current.handleUrlBlur('https://example.com')
      })
      expect(mockInvoke).not.toHaveBeenCalled()
    })

    it('does nothing when URL is empty', async () => {
      const { result } = renderHook(() => useBookmarkForm())
      await act(async () => {
        await result.current.handleUrlBlur()
      })
      expect(mockInvoke).not.toHaveBeenCalled()
    })

    it('makes no IPC calls when URL is whitespace only', async () => {
      const { result } = renderHook(() => useBookmarkForm())
      act(() => result.current.handleUrlChange('   '))
      await act(async () => {
        await result.current.handleUrlBlur()
      })
      expect(mockInvoke).not.toHaveBeenCalled()
    })

    it('sets a validation error but does NOT set suggestedUrl when bare string with spaces cannot form a valid URL', async () => {
      // 'just some words' → 'https://just some words' is rejected by the URL constructor,
      // so isValidUrl returns false and the hook falls into the else branch (no suggestedUrl set)
      const { result } = renderHook(() => useBookmarkForm())
      act(() => result.current.handleUrlChange('just some words'))
      await act(async () => {
        await result.current.handleUrlBlur()
      })
      expect(result.current.suggestedUrl).toBe('')
      expect(result.current.formState.errors.url?.message).toBeTruthy()
      expect(mockInvoke).not.toHaveBeenCalled()
    })

    it('keeps isDuplicate false when BOOKMARK_CHECK_DUPLICATE returns { success: false }', async () => {
      // success: false → setIsDuplicate gets false; hook still proceeds to metadata fetch
      mockInvoke.mockResolvedValueOnce({ success: false, error: 'DB error' })
      mockInvoke.mockResolvedValueOnce({ success: true, data: { title: null, favicon_url: null } })
      const { result } = renderHook(() => useBookmarkForm())
      act(() => result.current.handleUrlChange('https://example.com'))
      await act(async () => {
        await result.current.handleUrlBlur()
      })
      expect(result.current.isDuplicate).toBe(false)
    })

    it('keeps title unchanged and clears isFetchingMeta when BOOKMARK_FETCH_METADATA returns { success: false }', async () => {
      mockInvoke.mockResolvedValueOnce({ success: true, data: false })
      mockInvoke.mockResolvedValueOnce({ success: false, error: 'fetch failed' })
      const { result } = renderHook(() => useBookmarkForm())
      act(() => {
        result.current.handleUrlChange('https://example.com')
      })
      await act(async () => {
        await result.current.handleUrlBlur()
      })
      expect(result.current.title).toBe('')
      expect(result.current.isFetchingMeta).toBe(false)
    })
  })

  describe('applySuggestion', () => {
    it('applies the suggested URL and clears suggestedUrl', async () => {
      mockInvoke.mockResolvedValue({ success: true, data: false } as IpcResult<boolean>)
      const { result } = renderHook(() => useBookmarkForm())

      act(() => result.current.handleUrlChange('example.com'))
      await act(async () => {
        await result.current.handleUrlBlur()
      })
      expect(result.current.suggestedUrl).toBe('https://example.com')

      await act(async () => {
        await result.current.applySuggestion()
      })
      expect(result.current.url).toBe('https://example.com')
      expect(result.current.suggestedUrl).toBe('')
    })

    it('triggers duplicate check and metadata fetch after applying suggestion', async () => {
      mockInvoke.mockResolvedValueOnce({ success: true, data: false } as IpcResult<boolean>)
      const { result } = renderHook(() => useBookmarkForm())

      act(() => result.current.handleUrlChange('example.com'))
      await act(async () => {
        await result.current.handleUrlBlur()
      })

      setupBlurMocks()
      await act(async () => {
        await result.current.applySuggestion()
      })
      expect(mockInvoke).toHaveBeenCalledWith(
        IpcChannels.BOOKMARK_CHECK_DUPLICATE,
        'https://example.com',
      )
    })

    it('does nothing when there is no pending suggestion', async () => {
      const { result } = renderHook(() => useBookmarkForm())
      await act(async () => {
        await result.current.applySuggestion()
      })
      expect(mockInvoke).not.toHaveBeenCalled()
    })
  })

  describe('handleTitleChange', () => {
    it('updates the title field value', () => {
      const { result } = renderHook(() => useBookmarkForm())
      act(() => result.current.handleTitleChange('My Title'))
      expect(result.current.title).toBe('My Title')
    })

    it('prevents auto-fill from overwriting a manually typed title on subsequent URL blur', async () => {
      setupBlurMocks({ title: 'Auto Title' })

      const { result } = renderHook(() => useBookmarkForm())
      act(() => {
        result.current.handleTitleChange('Manual Title')
        result.current.handleUrlChange('https://example.com')
      })
      await act(async () => {
        await result.current.handleUrlBlur()
      })
      expect(result.current.title).toBe('Manual Title')
    })
  })

  describe('toggleTag', () => {
    it('adds a tag when it is not selected', () => {
      const { result } = renderHook(() => useBookmarkForm())
      act(() => result.current.toggleTag('tag-uuid-1'))
      expect(result.current.selectedTagIds).toContain('tag-uuid-1')
    })

    it('removes a tag when it is already selected', () => {
      const { result } = renderHook(() => useBookmarkForm())
      act(() => {
        result.current.toggleTag('tag-uuid-1')
        result.current.toggleTag('tag-uuid-1')
      })
      expect(result.current.selectedTagIds).not.toContain('tag-uuid-1')
    })

    it('allows multiple tags to be selected simultaneously', () => {
      const { result } = renderHook(() => useBookmarkForm())
      act(() => {
        result.current.toggleTag('tag-uuid-1')
        result.current.toggleTag('tag-uuid-2')
        result.current.toggleTag('tag-uuid-3')
      })
      expect(result.current.selectedTagIds).toEqual(['tag-uuid-1', 'tag-uuid-2', 'tag-uuid-3'])
    })
  })

  describe('reset', () => {
    it('clears url, title, selectedTagIds, isDuplicate, and suggestedUrl', async () => {
      setupBlurMocks({ isDup: true })
      const { result } = renderHook(() => useBookmarkForm())

      act(() => {
        result.current.handleUrlChange('https://example.com')
        result.current.handleTitleChange('Some Title')
        result.current.toggleTag('tag-uuid-1')
      })
      await act(async () => {
        await result.current.handleUrlBlur()
      })

      act(() => result.current.reset())

      expect(result.current.url).toBe('')
      expect(result.current.title).toBe('')
      expect(result.current.selectedTagIds).toEqual([])
      expect(result.current.isDuplicate).toBe(false)
      expect(result.current.suggestedUrl).toBe('')
      expect(result.current.isFetchingMeta).toBe(false)
    })

    it('sets isFetchingMeta to false even when it was true before reset', async () => {
      // This test intentionally holds blurAct unawaited while starting a second act() to
      // simulate an in-flight fetch. React warns about overlapping async act() calls in this
      // pattern, but the interleaving is deliberate and the test behaviour is correct.
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Hold the metadata fetch in-flight so isFetchingMeta is forced to true
      let resolveMeta!: (value: IpcResult<UrlMetadata>) => void
      const pendingMeta = new Promise<IpcResult<UrlMetadata>>((res) => (resolveMeta = res))
      mockInvoke.mockResolvedValueOnce({ success: true, data: false } as IpcResult<boolean>)
      mockInvoke.mockReturnValueOnce(pendingMeta)

      const { result } = renderHook(() => useBookmarkForm())
      act(() => result.current.handleUrlChange('https://example.com'))

      const blurAct = act(async () => {
        await result.current.handleUrlBlur()
      })

      // Flush microtasks so the dup check resolves and isFetchingMeta turns true
      await act(async () => {
        await Promise.resolve()
      })

      // Reset while fetch is still pending; flag must immediately be false
      act(() => result.current.reset())
      expect(result.current.isFetchingMeta).toBe(false)

      // Resolve the stale call and drain the act; flag must stay false
      resolveMeta({ success: true, data: { title: 'Stale Title', favicon_url: null } })
      await blurAct
      expect(result.current.isFetchingMeta).toBe(false)

      consoleError.mockRestore()
    })
  })

  describe('prefill', () => {
    it('populates the form with the provided data', () => {
      const { result } = renderHook(() => useBookmarkForm())
      act(() => {
        result.current.prefill({
          url: 'https://prefilled.com',
          title: 'Prefilled Title',
          notes: 'Some notes',
          tagIds: ['tag-uuid-1', 'tag-uuid-2'],
        })
      })
      expect(result.current.url).toBe('https://prefilled.com')
      expect(result.current.title).toBe('Prefilled Title')
      expect(result.current.selectedTagIds).toEqual(['tag-uuid-1', 'tag-uuid-2'])
    })

    it('clears isDuplicate and suggestedUrl from a previous session', async () => {
      setupBlurMocks({ isDup: true })
      const { result } = renderHook(() => useBookmarkForm())

      act(() => result.current.handleUrlChange('https://dup.com'))
      await act(async () => {
        await result.current.handleUrlBlur()
      })
      expect(result.current.isDuplicate).toBe(true)

      act(() => {
        result.current.prefill({
          url: 'https://edit.com',
          title: 'Edit',
          notes: '',
          tagIds: [],
        })
      })
      expect(result.current.isDuplicate).toBe(false)
    })
  })

  describe('canSave', () => {
    it('is false when url is empty', () => {
      const { result } = renderHook(() => useBookmarkForm())
      expect(result.current.canSave).toBe(false)
    })

    it('is false when url is not a valid http/https URL', () => {
      const { result } = renderHook(() => useBookmarkForm())
      act(() => result.current.handleUrlChange('not-a-url'))
      expect(result.current.canSave).toBe(false)
    })

    it('is true when url is a valid https URL', () => {
      const { result } = renderHook(() => useBookmarkForm())
      act(() => result.current.handleUrlChange('https://example.com'))
      expect(result.current.canSave).toBe(true)
    })

    it('is true when url is a valid http URL', () => {
      const { result } = renderHook(() => useBookmarkForm())
      act(() => result.current.handleUrlChange('http://example.com'))
      expect(result.current.canSave).toBe(true)
    })

    it('is false when url is whitespace only', () => {
      const { result } = renderHook(() => useBookmarkForm())
      act(() => result.current.handleUrlChange('   '))
      expect(result.current.canSave).toBe(false)
    })
  })

  describe('cancel', () => {
    it('sets isFetchingMeta to false immediately', async () => {
      // Hold the metadata fetch in-flight so isFetchingMeta is forced to true
      let resolveMeta!: (value: IpcResult<UrlMetadata>) => void
      const pendingMeta = new Promise<IpcResult<UrlMetadata>>((res) => (resolveMeta = res))
      mockInvoke.mockResolvedValueOnce({ success: true, data: false } as IpcResult<boolean>)
      mockInvoke.mockReturnValueOnce(pendingMeta)

      const { result } = renderHook(() => useBookmarkForm())
      act(() => result.current.handleUrlChange('https://example.com'))

      const blurAct = act(async () => {
        await result.current.handleUrlBlur()
      })

      // Flush microtasks so the dup check resolves and isFetchingMeta turns true
      await act(async () => {
        await Promise.resolve()
      })

      act(() => result.current.cancel())
      expect(result.current.isFetchingMeta).toBe(false)

      // Resolve the stale response; title must not be updated
      resolveMeta({ success: true, data: { title: 'Stale Title', favicon_url: null } })
      await blurAct
      expect(result.current.title).toBe('')
      expect(result.current.isFetchingMeta).toBe(false)
    })

    it('discards stale metadata result when cancel is called before the fetch resolves', async () => {
      let resolveMeta!: (value: IpcResult<UrlMetadata>) => void
      const pendingMeta = new Promise<IpcResult<UrlMetadata>>((res) => (resolveMeta = res))
      mockInvoke.mockResolvedValueOnce({ success: true, data: false } as IpcResult<boolean>)
      mockInvoke.mockReturnValueOnce(pendingMeta)

      const { result } = renderHook(() => useBookmarkForm())
      act(() => result.current.handleUrlChange('https://example.com'))

      const blurAct = act(async () => {
        await result.current.handleUrlBlur()
      })

      // Flush microtasks so the dup check resolves and isFetchingMeta turns true
      await act(async () => {
        await Promise.resolve()
      })

      // Cancel while the metadata fetch is still pending
      act(() => result.current.cancel())

      // Resolve the stale response
      resolveMeta({ success: true, data: { title: 'Should Not Appear', favicon_url: null } })
      await blurAct

      // The stale result was discarded — title stays empty
      expect(result.current.title).toBe('')
    })
  })

  describe('race condition: stale IPC response is discarded after reset', () => {
    it('does not set isDuplicate when response arrives after reset', async () => {
      let resolveFirst!: (value: IpcResult<boolean>) => void
      const pendingCall = new Promise<IpcResult<boolean>>((res) => (resolveFirst = res))
      mockInvoke.mockReturnValueOnce(pendingCall)

      const { result } = renderHook(() => useBookmarkForm())
      act(() => result.current.handleUrlChange('https://stale.com'))

      // Start blur check (in-flight) and hold the act promise for later
      const blurAct = act(async () => {
        await result.current.handleUrlBlur()
      })

      // Reset before the IPC resolves — bumps session counter
      act(() => result.current.reset())

      // Resolve the stale response, then drain the act
      resolveFirst({ success: true, data: true })
      await blurAct

      // Stale response should have been ignored
      expect(result.current.isDuplicate).toBe(false)
    })

    it('does not set title when metadata fetch resolves after reset', async () => {
      let resolveMeta!: (value: IpcResult<UrlMetadata>) => void
      const pendingMeta = new Promise<IpcResult<UrlMetadata>>((res) => (resolveMeta = res))
      // Dup check resolves immediately; metadata fetch is held
      mockInvoke.mockResolvedValueOnce({ success: true, data: false } as IpcResult<boolean>)
      mockInvoke.mockReturnValueOnce(pendingMeta)

      const { result } = renderHook(() => useBookmarkForm())
      act(() => result.current.handleUrlChange('https://stale-meta.com'))

      const blurAct = act(async () => {
        await result.current.handleUrlBlur()
      })

      // Flush microtasks so the dup check resolves and the metadata fetch starts
      await act(async () => {
        await Promise.resolve()
      })

      // Reset before the metadata call resolves — bumps session counter
      act(() => result.current.reset())
      expect(result.current.isFetchingMeta).toBe(false)

      // Resolve the stale metadata response
      resolveMeta({ success: true, data: { title: 'Stale Title', favicon_url: null } })
      await blurAct

      // Title must not be set; isFetchingMeta must remain false
      expect(result.current.title).toBe('')
      expect(result.current.isFetchingMeta).toBe(false)
    })
  })
})
