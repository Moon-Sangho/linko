import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useSidebarWidth,
  STORAGE_KEY,
  MIN_SIDEBAR_WIDTH,
  MAX_SIDEBAR_WIDTH,
  DEFAULT_SIDEBAR_WIDTH,
} from '@renderer/hooks/use-sidebar-width'

beforeEach(() => {
  localStorage.clear()
})

// ─── Exported constants ───────────────────────────────────────────────────────

describe('exported constants', () => {
  it('MIN_SIDEBAR_WIDTH is 180', () => {
    expect(MIN_SIDEBAR_WIDTH).toBe(180)
  })

  it('MAX_SIDEBAR_WIDTH is 360', () => {
    expect(MAX_SIDEBAR_WIDTH).toBe(360)
  })
})

// ─── Initial width ────────────────────────────────────────────────────────────

describe('initial sidebarWidth', () => {
  it('returns the default width when localStorage has no saved value', () => {
    const { result } = renderHook(() => useSidebarWidth())
    expect(result.current.sidebarWidth).toBe(DEFAULT_SIDEBAR_WIDTH)
  })

  it('returns the persisted value when a valid width is stored', () => {
    localStorage.setItem(STORAGE_KEY, '280')
    const { result } = renderHook(() => useSidebarWidth())
    expect(result.current.sidebarWidth).toBe(280)
  })

  it('clamps to MIN when the stored value is below the minimum', () => {
    localStorage.setItem(STORAGE_KEY, '100')
    const { result } = renderHook(() => useSidebarWidth())
    expect(result.current.sidebarWidth).toBe(MIN_SIDEBAR_WIDTH)
  })

  it('clamps to MAX when the stored value exceeds the maximum', () => {
    localStorage.setItem(STORAGE_KEY, '500')
    const { result } = renderHook(() => useSidebarWidth())
    expect(result.current.sidebarWidth).toBe(MAX_SIDEBAR_WIDTH)
  })

  it('returns the default width when the stored value is not a number', () => {
    localStorage.setItem(STORAGE_KEY, 'not-a-number')
    const { result } = renderHook(() => useSidebarWidth())
    expect(result.current.sidebarWidth).toBe(DEFAULT_SIDEBAR_WIDTH)
  })

  it('returns the default width when the stored value is an empty string', () => {
    localStorage.setItem(STORAGE_KEY, '')
    const { result } = renderHook(() => useSidebarWidth())
    expect(result.current.sidebarWidth).toBe(DEFAULT_SIDEBAR_WIDTH)
  })
})

// ─── updateWidth ──────────────────────────────────────────────────────────────

describe('updateWidth', () => {
  it('sets the width to the given in-range value', () => {
    const { result } = renderHook(() => useSidebarWidth())
    act(() => result.current.updateWidth(260))
    expect(result.current.sidebarWidth).toBe(260)
  })

  it('clamps to MIN when the given value is below the minimum', () => {
    const { result } = renderHook(() => useSidebarWidth())
    act(() => result.current.updateWidth(50))
    expect(result.current.sidebarWidth).toBe(MIN_SIDEBAR_WIDTH)
  })

  it('clamps to MAX when the given value exceeds the maximum', () => {
    const { result } = renderHook(() => useSidebarWidth())
    act(() => result.current.updateWidth(999))
    expect(result.current.sidebarWidth).toBe(MAX_SIDEBAR_WIDTH)
  })

  it('accepts the exact minimum boundary value', () => {
    const { result } = renderHook(() => useSidebarWidth())
    act(() => result.current.updateWidth(MIN_SIDEBAR_WIDTH))
    expect(result.current.sidebarWidth).toBe(MIN_SIDEBAR_WIDTH)
  })

  it('accepts the exact maximum boundary value', () => {
    const { result } = renderHook(() => useSidebarWidth())
    act(() => result.current.updateWidth(MAX_SIDEBAR_WIDTH))
    expect(result.current.sidebarWidth).toBe(MAX_SIDEBAR_WIDTH)
  })

  it('does not write to localStorage', () => {
    const { result } = renderHook(() => useSidebarWidth())
    act(() => result.current.updateWidth(260))
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})

// ─── persistWidth ─────────────────────────────────────────────────────────────

describe('persistWidth', () => {
  it('sets the width to the given in-range value', () => {
    const { result } = renderHook(() => useSidebarWidth())
    act(() => result.current.persistWidth(300))
    expect(result.current.sidebarWidth).toBe(300)
  })

  it('writes the value to localStorage', () => {
    const { result } = renderHook(() => useSidebarWidth())
    act(() => result.current.persistWidth(300))
    expect(localStorage.getItem(STORAGE_KEY)).toBe('300')
  })

  it('clamps to MIN and persists the clamped value when given a value below the minimum', () => {
    const { result } = renderHook(() => useSidebarWidth())
    act(() => result.current.persistWidth(50))
    expect(result.current.sidebarWidth).toBe(MIN_SIDEBAR_WIDTH)
    expect(localStorage.getItem(STORAGE_KEY)).toBe(String(MIN_SIDEBAR_WIDTH))
  })

  it('clamps to MAX and persists the clamped value when given a value above the maximum', () => {
    const { result } = renderHook(() => useSidebarWidth())
    act(() => result.current.persistWidth(999))
    expect(result.current.sidebarWidth).toBe(MAX_SIDEBAR_WIDTH)
    expect(localStorage.getItem(STORAGE_KEY)).toBe(String(MAX_SIDEBAR_WIDTH))
  })

  it('overwrites a previously persisted value', () => {
    localStorage.setItem(STORAGE_KEY, '220')
    const { result } = renderHook(() => useSidebarWidth())
    act(() => result.current.persistWidth(300))
    expect(localStorage.getItem(STORAGE_KEY)).toBe('300')
  })

  it('persisted value is read back correctly on the next mount', () => {
    const { result: first } = renderHook(() => useSidebarWidth())
    act(() => first.current.persistWidth(310))

    const { result: second } = renderHook(() => useSidebarWidth())
    expect(second.current.sidebarWidth).toBe(310)
  })
})
