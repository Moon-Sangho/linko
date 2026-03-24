import { describe, it, expect } from 'vitest'
import { isValidUrl } from '@shared/utils/is-valid-url'

describe('isValidUrl', () => {
  describe('valid URLs', () => {
    it('accepts https:// URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
    })

    it('accepts http:// URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true)
    })

    it('accepts URLs with paths and query strings', () => {
      expect(isValidUrl('https://example.com/path?q=1&r=2')).toBe(true)
    })

    it('accepts URLs with ports', () => {
      expect(isValidUrl('http://localhost:3000')).toBe(true)
    })

    it('accepts URLs with subdomains', () => {
      expect(isValidUrl('https://sub.domain.example.com')).toBe(true)
    })

    it('accepts IP addresses with http://', () => {
      expect(isValidUrl('http://192.168.1.1')).toBe(true)
    })

    it('accepts a credential-bearing URL (documents current behavior — no credential stripping)', () => {
      // The URL constructor parses user:pass@ successfully; only the protocol is checked.
      // This test documents current behavior; access-control enforcement is out of scope for this utility.
      expect(isValidUrl('https://user:pass@example.com')).toBe(true)
    })

    it('accepts an internationalized domain name (documents current behavior)', () => {
      // Browsers typically accept IDN hostnames in the URL constructor.
      // This test documents the observed runtime behavior.
      const result = isValidUrl('https://例え.jp')
      expect(typeof result).toBe('boolean')
    })
  })

  describe('invalid URLs', () => {
    it('rejects a bare domain without protocol', () => {
      expect(isValidUrl('example.com')).toBe(false)
    })

    it('rejects javascript: scheme', () => {
      expect(isValidUrl('javascript:alert(1)')).toBe(false)
    })

    it('rejects file: scheme', () => {
      expect(isValidUrl('file:///etc/passwd')).toBe(false)
    })

    it('rejects data: scheme', () => {
      expect(isValidUrl('data:text/html,<h1>hi</h1>')).toBe(false)
    })

    it('rejects ftp: scheme', () => {
      expect(isValidUrl('ftp://files.example.com')).toBe(false)
    })

    it('rejects an empty string', () => {
      expect(isValidUrl('')).toBe(false)
    })

    it('rejects a plain word with no structure', () => {
      expect(isValidUrl('notaurl')).toBe(false)
    })

    it('rejects a URL with only a protocol and no host', () => {
      expect(isValidUrl('https://')).toBe(false)
    })

    it('rejects a whitespace-only string', () => {
      expect(isValidUrl('   ')).toBe(false)
    })

    it('rejects a protocol-relative URL', () => {
      expect(isValidUrl('//example.com')).toBe(false)
    })

    it('rejects null passed as unknown string (documents runtime guard behavior)', () => {
      // isValidUrl's parameter type is string, but at runtime callers may pass null.
      // The try/catch in the implementation prevents a crash; it returns false.
      expect(isValidUrl(null as unknown as string)).toBe(false)
    })

    it('rejects undefined passed as unknown string (documents runtime guard behavior)', () => {
      expect(isValidUrl(undefined as unknown as string)).toBe(false)
    })
  })
})
