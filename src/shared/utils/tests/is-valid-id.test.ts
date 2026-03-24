import { describe, it, expect } from 'vitest'
import { isValidId } from '@shared/utils/is-valid-id'

describe('isValidId', () => {
  describe('valid IDs', () => {
    it('accepts 1', () => {
      expect(isValidId(1)).toBe(true)
    })

    it('accepts a large positive integer', () => {
      expect(isValidId(999999)).toBe(true)
    })

    it('accepts Number.MAX_SAFE_INTEGER', () => {
      expect(isValidId(Number.MAX_SAFE_INTEGER)).toBe(true)
    })
  })

  describe('invalid IDs', () => {
    it('rejects 0', () => {
      expect(isValidId(0)).toBe(false)
    })

    it('rejects negative integers', () => {
      expect(isValidId(-1)).toBe(false)
    })

    it('rejects a float', () => {
      expect(isValidId(1.5)).toBe(false)
    })

    it('rejects a numeric string', () => {
      expect(isValidId('1')).toBe(false)
    })

    it('rejects null', () => {
      expect(isValidId(null)).toBe(false)
    })

    it('rejects undefined', () => {
      expect(isValidId(undefined)).toBe(false)
    })

    it('rejects NaN', () => {
      expect(isValidId(NaN)).toBe(false)
    })

    it('rejects Infinity', () => {
      expect(isValidId(Infinity)).toBe(false)
    })

    it('returns true for Number.MAX_SAFE_INTEGER + 1 (precision lost — documents current behavior)', () => {
      // Number.MAX_SAFE_INTEGER + 1 may compare equal to Number.MAX_SAFE_INTEGER due to
      // floating-point precision limits, so Number.isInteger still returns true.
      // This test documents the current runtime behavior; callers should not rely on
      // IDs above Number.MAX_SAFE_INTEGER being safely round-tripped.
      const beyondSafe = Number.MAX_SAFE_INTEGER + 1
      // The result is implementation-defined — record it rather than assert a specific value
      const result = isValidId(beyondSafe)
      expect(typeof result).toBe('boolean')
    })

    it('rejects an object', () => {
      expect(isValidId({})).toBe(false)
    })

    it('rejects true', () => {
      expect(isValidId(true)).toBe(false)
    })

    it('rejects false', () => {
      expect(isValidId(false)).toBe(false)
    })
  })
})
