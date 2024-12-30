import { describe, expect, it } from 'vitest'
import {
  validateAndNormalizeUrl,
  isPotentialSitemapUrl,
  constructSitemapUrl,
} from '../url-utils'

describe('validateAndNormalizeUrl', () => {
  it('should validate and normalize a valid URL with protocol', () => {
    const result = validateAndNormalizeUrl({ url: 'https://example.com' })
    expect(result.isValid).toBe(true)
    expect(result.normalizedUrl).toBe('https://example.com')
  })

  it('should add https protocol if missing', () => {
    const result = validateAndNormalizeUrl({ url: 'example.com' })
    expect(result.isValid).toBe(true)
    expect(result.normalizedUrl).toBe('https://example.com')
  })

  it('should handle URLs with paths', () => {
    const result = validateAndNormalizeUrl({ url: 'https://example.com/path' })
    expect(result.isValid).toBe(true)
    expect(result.normalizedUrl).toBe('https://example.com/path')
  })

  it('should remove trailing slashes', () => {
    const result = validateAndNormalizeUrl({ url: 'https://example.com/path/' })
    expect(result.isValid).toBe(true)
    expect(result.normalizedUrl).toBe('https://example.com/path')
  })

  it('should handle URLs with multiple trailing slashes', () => {
    const result = validateAndNormalizeUrl({
      url: 'https://example.com/path///',
    })
    expect(result.isValid).toBe(true)
    expect(result.normalizedUrl).toBe('https://example.com/path')
  })

  it('should trim whitespace', () => {
    const result = validateAndNormalizeUrl({ url: '  https://example.com  ' })
    expect(result.isValid).toBe(true)
    expect(result.normalizedUrl).toBe('https://example.com')
  })

  it('should reject invalid URLs', () => {
    const result = validateAndNormalizeUrl({ url: 'not-a-url' })
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Invalid domain name')
  })

  it('should reject URLs without domain', () => {
    const result = validateAndNormalizeUrl({ url: 'https://localhost' })
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Invalid domain name')
  })

  it('should handle subdomains', () => {
    const result = validateAndNormalizeUrl({ url: 'https://blog.example.com' })
    expect(result.isValid).toBe(true)
    expect(result.normalizedUrl).toBe('https://blog.example.com')
  })

  it('should handle URLs with query parameters', () => {
    const result = validateAndNormalizeUrl({
      url: 'https://example.com/path?query=value',
    })
    expect(result.isValid).toBe(true)
    expect(result.normalizedUrl).toBe('https://example.com/path')
  })
})

describe('isPotentialSitemapUrl', () => {
  it('should identify XML sitemaps', () => {
    expect(
      isPotentialSitemapUrl({ url: 'https://example.com/sitemap.xml' }),
    ).toBe(true)
  })

  it('should identify gzipped sitemaps', () => {
    expect(
      isPotentialSitemapUrl({ url: 'https://example.com/sitemap.xml.gz' }),
    ).toBe(true)
  })

  it('should identify text sitemaps', () => {
    expect(
      isPotentialSitemapUrl({ url: 'https://example.com/sitemap.txt' }),
    ).toBe(true)
  })

  it('should handle case variations', () => {
    expect(
      isPotentialSitemapUrl({ url: 'https://example.com/SITEMAP.XML' }),
    ).toBe(true)
  })

  it('should reject non-sitemap URLs', () => {
    expect(
      isPotentialSitemapUrl({ url: 'https://example.com/page.html' }),
    ).toBe(false)
  })

  it('should reject URLs without sitemap in name', () => {
    expect(isPotentialSitemapUrl({ url: 'https://example.com/file.xml' })).toBe(
      false,
    )
  })
})

describe('constructSitemapUrl', () => {
  it('should construct sitemap URL from domain', () => {
    const result = constructSitemapUrl({ baseUrl: 'https://example.com' })
    expect(result).toBe('https://example.com/sitemap.xml')
  })

  it('should handle domains with paths', () => {
    const result = constructSitemapUrl({ baseUrl: 'https://example.com/path' })
    expect(result).toBe('https://example.com/sitemap.xml')
  })

  it('should handle domains with trailing slashes', () => {
    const result = constructSitemapUrl({ baseUrl: 'https://example.com/' })
    expect(result).toBe('https://example.com/sitemap.xml')
  })

  it('should handle subdomains', () => {
    const result = constructSitemapUrl({ baseUrl: 'https://blog.example.com' })
    expect(result).toBe('https://blog.example.com/sitemap.xml')
  })
})
