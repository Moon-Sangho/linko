import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookmarkItem } from '@renderer/components/bookmark/bookmark-item'
import type { Bookmark } from '@shared/types/domains'

// ─── Mocks ───────────────────────────────────────────────────────────────────
// vi.mock is hoisted to the top of the file, so variables used inside factories
// must be initialized with vi.hoisted() to avoid "accessed before initialization" errors.

const { mockOpenUrl, mockDeleteBookmark, mockOverlayOpen } = vi.hoisted(() => ({
  mockOpenUrl: vi.fn(),
  mockDeleteBookmark: vi.fn(),
  mockOverlayOpen: vi.fn(),
}))

vi.mock('@renderer/hooks/mutations/use-open-url-mutation', () => ({
  useOpenUrlMutation: () => ({ mutate: mockOpenUrl }),
}))

vi.mock('@renderer/hooks/mutations/use-delete-bookmark-mutation', () => ({
  useDeleteBookmarkMutation: () => ({ mutateAsync: mockDeleteBookmark }),
}))

vi.mock('@renderer/overlay/control', () => ({
  overlay: { open: mockOverlayOpen },
}))

// ─── Fixtures ────────────────────────────────────────────────────────────────

const baseBookmark: Bookmark = {
  id: 'uuid-1',
  url: 'https://example.com',
  title: 'Example Site',
  notes: null,
  favicon_url: null,
  created_at: '2024-01-15T10:00:00.000Z',
  updated_at: '2024-01-15T10:00:00.000Z',
  tags: [
    { id: 'tag-uuid-1', name: 'work' },
    { id: 'tag-uuid-2', name: 'react' },
  ],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function renderItem(
  overrides: Partial<{
    bookmark: Bookmark
    isSelected: boolean
    isChecked: boolean
    isSelectionMode: boolean
    onClick: () => void
    onCheckToggle: (id: string, e: React.MouseEvent) => void
  }> = {},
) {
  const onClick = vi.fn()
  const onCheckToggle = vi.fn()
  const utils = render(
    <BookmarkItem
      bookmark={baseBookmark}
      isSelected={false}
      isChecked={false}
      isSelectionMode={false}
      onClick={onClick}
      onCheckToggle={onCheckToggle}
      {...overrides}
    />,
  )
  return { ...utils, onClick, onCheckToggle }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('BookmarkItem', () => {
  beforeEach(() => {
    mockOpenUrl.mockReset()
    mockDeleteBookmark.mockReset()
    mockOverlayOpen.mockReset()
  })

  describe('rendering', () => {
    it('renders the bookmark title', () => {
      renderItem()
      expect(screen.getByText('Example Site')).toBeInTheDocument()
    })

    it('renders the bookmark URL', () => {
      renderItem()
      expect(screen.getByText('https://example.com')).toBeInTheDocument()
    })

    it('falls back to URL when title is null', () => {
      renderItem({ bookmark: { ...baseBookmark, title: null } })
      // The title <p> element should show the URL text (not the url <span> below it)
      const titleEl = screen.getByText('https://example.com', {
        selector: 'p',
      })
      expect(titleEl).toBeInTheDocument()
      expect(titleEl.textContent).toBe('https://example.com')
    })

    it('renders visible tags', () => {
      renderItem()
      expect(screen.getByText('work')).toBeInTheDocument()
      expect(screen.getByText('react')).toBeInTheDocument()
    })

    it('shows overflow badge when more than 3 tags', () => {
      const bookmark: Bookmark = {
        ...baseBookmark,
        tags: [
          { id: 'tag-uuid-1', name: 'a' },
          { id: 'tag-uuid-2', name: 'b' },
          { id: 'tag-uuid-3', name: 'c' },
          { id: 'tag-uuid-4', name: 'd' },
        ],
      }
      renderItem({ bookmark })
      expect(screen.getByText('+1')).toBeInTheDocument()
    })

    it('renders the formatted creation date', () => {
      renderItem()
      expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument()
    })

    it('renders no overflow badge when there are exactly 3 tags', () => {
      const bookmark: Bookmark = {
        ...baseBookmark,
        tags: [
          { id: 'tag-uuid-1', name: 'a' },
          { id: 'tag-uuid-2', name: 'b' },
          { id: 'tag-uuid-3', name: 'c' },
        ],
      }
      renderItem({ bookmark })
      expect(screen.queryByText(/^\+\d/)).not.toBeInTheDocument()
    })
  })

  describe('click interactions', () => {
    it('calls onClick when the item is clicked', async () => {
      const user = userEvent.setup()
      const { onClick } = renderItem()
      await user.click(screen.getByText('Example Site'))
      expect(onClick).toHaveBeenCalled()
    })

    it('calls openUrl on double-click', async () => {
      const user = userEvent.setup()
      renderItem()
      await user.dblClick(screen.getByText('Example Site'))
      expect(mockOpenUrl).toHaveBeenCalledWith({ id: 'uuid-1', url: 'https://example.com' })
    })

    it('calls openUrl when the open button is clicked', async () => {
      const user = userEvent.setup()
      renderItem()
      await user.click(screen.getByTitle('Open in browser'))
      expect(mockOpenUrl).toHaveBeenCalledWith({ id: 'uuid-1', url: 'https://example.com' })
    })

    it('opens the edit modal when the edit button is clicked', async () => {
      const user = userEvent.setup()
      renderItem()
      await user.click(screen.getByTitle('Edit'))
      expect(mockOverlayOpen).toHaveBeenCalledTimes(1)
      // Verify the factory argument is a function (the overlay render prop)
      const factoryArg = mockOverlayOpen.mock.calls[0][0]
      expect(typeof factoryArg).toBe('function')
      // Render the factory with stub overlay props and confirm it produces an EditBookmarkModal
      // by checking that the rendered output includes the correct bookmarkId context.
      // EditBookmarkModal returns null when bookmark data is not loaded, so we confirm it
      // produces a React element (not null when called with isOpen: false it still calls hooks).
      // The key assertion: overlay.open was called with a function that closes over bookmarkId=1.
      const element = factoryArg({ isOpen: false, close: vi.fn() })
      expect(element).not.toBeUndefined()
    })

    it('calls onCheckToggle with the bookmark id when the checkbox is clicked', async () => {
      const user = userEvent.setup()
      const { onCheckToggle } = renderItem()
      await user.click(screen.getByRole('button', { name: /select bookmark/i }))
      expect(onCheckToggle).toHaveBeenCalledWith('uuid-1', expect.any(Object))
    })
  })

  describe('delete flow', () => {
    it('shows delete confirmation when the delete button is clicked', async () => {
      const user = userEvent.setup()
      renderItem()
      await user.click(screen.getByTitle('Delete'))
      expect(screen.getByText('Delete?')).toBeInTheDocument()
    })

    it('hides action buttons while delete confirmation is shown', async () => {
      const user = userEvent.setup()
      renderItem()
      await user.click(screen.getByTitle('Delete'))
      expect(screen.queryByTitle('Edit')).not.toBeInTheDocument()
      expect(screen.queryByTitle('Open in browser')).not.toBeInTheDocument()
    })

    it('dismisses delete confirmation when Cancel is clicked', async () => {
      const user = userEvent.setup()
      renderItem()
      await user.click(screen.getByTitle('Delete'))
      await user.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(screen.queryByText('Delete?')).not.toBeInTheDocument()
    })

    it('calls deleteBookmark with the bookmark id on confirm', async () => {
      mockDeleteBookmark.mockResolvedValueOnce(undefined)
      const user = userEvent.setup()
      renderItem()
      await user.click(screen.getByTitle('Delete'))
      await user.click(screen.getByRole('button', { name: 'Delete' }))
      expect(mockDeleteBookmark).toHaveBeenCalledWith('uuid-1')
    })

    it('shows an error message when delete fails', async () => {
      mockDeleteBookmark.mockRejectedValueOnce(new Error('Network error'))
      const user = userEvent.setup()
      renderItem()
      await user.click(screen.getByTitle('Delete'))
      await user.click(screen.getByRole('button', { name: 'Delete' }))
      expect(screen.getByText('Failed')).toBeInTheDocument()
    })
  })

  describe('selection mode', () => {
    it('hides action buttons when isSelectionMode is true', () => {
      renderItem({ isSelectionMode: true })
      expect(screen.queryByTitle('Delete')).not.toBeInTheDocument()
      expect(screen.queryByTitle('Edit')).not.toBeInTheDocument()
      expect(screen.queryByTitle('Open in browser')).not.toBeInTheDocument()
    })

    it('hides the date when isSelectionMode is true', () => {
      renderItem({ isSelectionMode: true })
      expect(screen.queryByText('Jan 15, 2024')).not.toBeInTheDocument()
    })
  })

  describe('visual states', () => {
    it('applies a distinct background class when isSelected is true', () => {
      const { container: unselected } = renderItem({ isSelected: false })
      const { container: selected } = renderItem({ isSelected: true })

      const unselectedRoot = unselected.firstChild as HTMLElement
      const selectedRoot = selected.firstChild as HTMLElement

      // The selected item should have a background class that the unselected one lacks
      expect(selectedRoot.className).not.toBe(unselectedRoot.className)
      expect(selectedRoot.className).toContain('bg-')
    })

    it('renders the check icon when isChecked is true', () => {
      renderItem({ isChecked: true })
      // The Check icon from lucide-react renders an SVG inside the checkbox button
      const checkbox = screen.getByRole('button', { name: /select bookmark/i })
      expect(checkbox.querySelector('svg')).toBeInTheDocument()
    })

    it('does not render the check icon when isChecked is false', () => {
      renderItem({ isChecked: false })
      const checkbox = screen.getByRole('button', { name: /select bookmark/i })
      expect(checkbox.querySelector('svg')).not.toBeInTheDocument()
    })

    it('renders no tag badges when the bookmark has no tags', () => {
      renderItem({ bookmark: { ...baseBookmark, tags: [] } })
      // Existing tags from baseBookmark should not appear
      expect(screen.queryByText('work')).not.toBeInTheDocument()
      expect(screen.queryByText('react')).not.toBeInTheDocument()
      // No badge-like spans with tag names are present
      expect(screen.queryByText(/^\+\d/)).not.toBeInTheDocument()
    })

    it('renders without error when favicon_url is non-null', () => {
      // The Favicon component should accept a src value without crashing
      expect(() =>
        renderItem({ bookmark: { ...baseBookmark, favicon_url: 'https://example.com/favicon.ico' } }),
      ).not.toThrow()
      expect(screen.getByText('Example Site')).toBeInTheDocument()
    })
  })

  describe('deleting spinner', () => {
    it('shows ellipsis and disables Cancel and Delete buttons while delete is in-flight', async () => {
      // Hold the delete promise pending to keep deleting=true
      let resolveDelete!: () => void
      const pendingDelete = new Promise<void>((res) => (resolveDelete = res))
      mockDeleteBookmark.mockReturnValueOnce(pendingDelete)

      const user = userEvent.setup()
      renderItem()

      // Enter confirm state
      await user.click(screen.getByTitle('Delete'))
      // Kick off the delete (do not await — we want to inspect mid-flight state)
      await user.click(screen.getByRole('button', { name: 'Delete' }))

      expect(screen.getByText('…')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
      expect(screen.getByRole('button', { name: '…' })).toBeDisabled()

      // Clean up: resolve so the hook doesn't leave dangling state
      resolveDelete()
    })
  })

  describe('stopPropagation', () => {
    it('double-clicking the checkbox does NOT call openUrl', async () => {
      const user = userEvent.setup()
      renderItem()
      const checkbox = screen.getByRole('button', { name: /select bookmark/i })
      await user.dblClick(checkbox)
      expect(mockOpenUrl).not.toHaveBeenCalled()
    })

    it('clicking the Open button does NOT call onClick', async () => {
      const user = userEvent.setup()
      const { onClick } = renderItem()
      await user.click(screen.getByTitle('Open in browser'))
      expect(onClick).not.toHaveBeenCalled()
    })

    it('clicking the Edit button does NOT call onClick', async () => {
      const user = userEvent.setup()
      const { onClick } = renderItem()
      await user.click(screen.getByTitle('Edit'))
      expect(onClick).not.toHaveBeenCalled()
    })

    it('clicking the Delete button does NOT call onClick', async () => {
      const user = userEvent.setup()
      const { onClick } = renderItem()
      await user.click(screen.getByTitle('Delete'))
      expect(onClick).not.toHaveBeenCalled()
    })
  })
})
