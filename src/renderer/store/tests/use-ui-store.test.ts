import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from '@renderer/store/use-ui-store'

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({ searchQuery: '', selectedTagIds: [] })
  })

  describe('initial state', () => {
    it('has empty searchQuery by default', () => {
      expect(useUIStore.getState().searchQuery).toBe('')
    })

    it('has empty selectedTagIds by default', () => {
      expect(useUIStore.getState().selectedTagIds).toEqual([])
    })
  })

  describe('setSearchQuery', () => {
    it('updates searchQuery', () => {
      useUIStore.getState().setSearchQuery('react')
      expect(useUIStore.getState().searchQuery).toBe('react')
    })

    it('sets searchQuery to empty string', () => {
      useUIStore.setState({ searchQuery: 'previous' })
      useUIStore.getState().setSearchQuery('')
      expect(useUIStore.getState().searchQuery).toBe('')
    })

    it('replaces an existing query', () => {
      useUIStore.getState().setSearchQuery('first')
      useUIStore.getState().setSearchQuery('second')
      expect(useUIStore.getState().searchQuery).toBe('second')
    })

    it('stores a whitespace-only string as-is without trimming', () => {
      // The store does not trim; callers are responsible for validation
      useUIStore.getState().setSearchQuery('   ')
      expect(useUIStore.getState().searchQuery).toBe('   ')
    })
  })

  describe('toggleTag', () => {
    it('selects a tag when none is selected', () => {
      useUIStore.getState().toggleTag('tag-uuid-1')
      expect(useUIStore.getState().selectedTagIds).toEqual(['tag-uuid-1'])
    })

    it('deselects a tag when it is already selected', () => {
      useUIStore.setState({ selectedTagIds: ['tag-uuid-1'] })
      useUIStore.getState().toggleTag('tag-uuid-1')
      expect(useUIStore.getState().selectedTagIds).toEqual([])
    })

    it('replaces the selected tag when a different tag is toggled', () => {
      useUIStore.setState({ selectedTagIds: ['tag-uuid-1'] })
      useUIStore.getState().toggleTag('tag-uuid-2')
      expect(useUIStore.getState().selectedTagIds).toEqual(['tag-uuid-2'])
    })

    it('only allows one tag to be active at a time', () => {
      useUIStore.getState().toggleTag('tag-uuid-1')
      useUIStore.getState().toggleTag('tag-uuid-3')
      expect(useUIStore.getState().selectedTagIds).toHaveLength(1)
      expect(useUIStore.getState().selectedTagIds).toContain('tag-uuid-3')
    })
  })

  describe('clearTags', () => {
    it('removes all selected tags', () => {
      useUIStore.setState({ selectedTagIds: ['tag-uuid-1'] })
      useUIStore.getState().clearTags()
      expect(useUIStore.getState().selectedTagIds).toEqual([])
    })

    it('is a no-op when no tags are selected', () => {
      useUIStore.getState().clearTags()
      expect(useUIStore.getState().selectedTagIds).toEqual([])
    })

    it('does not affect searchQuery when a query is set', () => {
      useUIStore.setState({ searchQuery: 'typescript', selectedTagIds: ['tag-uuid-2'] })
      useUIStore.getState().clearTags()
      expect(useUIStore.getState().searchQuery).toBe('typescript')
      expect(useUIStore.getState().selectedTagIds).toEqual([])
    })
  })
})
