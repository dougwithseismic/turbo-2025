/**
 * Validates and normalizes a website URL
 * @param url The URL to validate and normalize
 * @returns An object containing the validation result and normalized URL
 */
export const validateAndNormalizeUrl = ({
  url,
}: {
  url: string
}): {
  isValid: boolean
  normalizedUrl?: string
  error?: string
} => {
  try {
    // Trim whitespace
    let processedUrl = url.trim()

    // Add protocol if missing
    if (
      !processedUrl.startsWith('http://') &&
      !processedUrl.startsWith('https://')
    ) {
      processedUrl = `https://${processedUrl}`
    }

    // Try to create URL object to validate
    const urlObject = new URL(processedUrl)

    // Ensure the URL has a valid hostname with at least one dot
    if (
      !urlObject.hostname.includes('.') ||
      urlObject.hostname === 'localhost'
    ) {
      return {
        isValid: false,
        error: 'Invalid domain name',
      }
    }

    // Remove trailing slash if it's the only path component
    const normalizedUrl =
      urlObject.pathname === '/'
        ? urlObject.origin
        : urlObject.origin + urlObject.pathname.replace(/\/+$/, '')

    return {
      isValid: true,
      normalizedUrl,
    }
  } catch {
    // If URL creation fails, it's an invalid URL format
    return {
      isValid: false,
      error: 'Invalid URL format',
    }
  }
}

/**
 * Checks if a URL points to a potential sitemap
 * @param url The URL to check
 * @returns boolean indicating if the URL might be a sitemap
 */
export const isPotentialSitemapUrl = ({ url }: { url: string }): boolean => {
  const lowerUrl = url.toLowerCase()
  return (
    lowerUrl.includes('sitemap') &&
    (lowerUrl.endsWith('.xml') ||
      lowerUrl.endsWith('.gz') ||
      lowerUrl.endsWith('.txt'))
  )
}

/**
 * Constructs a potential sitemap URL from a base URL
 * @param baseUrl The base website URL
 * @returns The constructed sitemap URL
 */
export const constructSitemapUrl = ({
  baseUrl,
}: {
  baseUrl: string
}): string => {
  const url = new URL(baseUrl)
  return `${url.origin}/sitemap.xml`
}
