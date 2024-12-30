import type { Page } from 'playwright'
import type { CrawlerPlugin } from '../types/plugin'
import type { CrawlJob } from '../types.improved'

// Plugin-specific types
type LinkInfo = {
  href: string
  text: string
  isInternal: boolean
  rel?: string[]
  onClick?: boolean
  target?: string
  nofollow?: boolean
  sponsored?: boolean
  ugc?: boolean
}

type LinkAnalysis = {
  total: number
  internal: {
    count: number
    navigation: number
  }
  external: {
    count: number
    social: number
    nofollow: number
    sponsored: number
    ugc: number
  }
}

// Define the plugin's metric type
type LinksMetric = {
  links: LinkInfo[]
  linkAnalysis: LinkAnalysis
}

// Define the plugin's summary type
type LinksSummary = {
  totalLinks: number
  uniqueLinks: number
  internalLinks: {
    total: number
    unique: number
    navigation: number
    averagePerPage: number
  }
  externalLinks: {
    total: number
    unique: number
    social: number
    nofollow: number
    sponsored: number
    ugc: number
    averagePerPage: number
  }
  commonNavigationPaths: Array<{
    path: string
    count: number
  }>
  topExternalDomains: Array<{
    domain: string
    count: number
  }>
}

export class LinksPlugin
  implements CrawlerPlugin<'links', LinksMetric, LinksSummary>
{
  readonly name = 'links' as const
  enabled: boolean

  constructor(options: { enabled?: boolean } = {}) {
    this.enabled = options.enabled ?? true
  }

  async initialize(): Promise<void> {
    if (!this.enabled) return
    console.log('[Crawler] Links plugin initialized')
  }

  async beforeCrawl(job: CrawlJob): Promise<void> {
    if (!this.enabled) return
    console.log(`[Crawler] Starting links analysis for job ${job.id}`)
  }

  async afterCrawl(job: CrawlJob): Promise<void> {
    if (!this.enabled) return
    console.log(`[Crawler] Completed links analysis for job ${job.id}`)
  }

  async evaluatePageMetrics(
    page: Page,
    loadTime: number,
  ): Promise<{ links: LinksMetric }> {
    if (!this.enabled)
      return {
        links: {
          links: [],
          linkAnalysis: {
            total: 0,
            internal: { count: 0, navigation: 0 },
            external: {
              count: 0,
              social: 0,
              nofollow: 0,
              sponsored: 0,
              ugc: 0,
            },
          },
        },
      }

    const results = await page.evaluate(() => {
      const baseUrl = window.location.origin
      const links = Array.from(document.querySelectorAll('a')).map((link) => {
        const href = link.href
        const rel = link.rel ? link.rel.split(' ') : undefined
        return {
          href,
          text: link.textContent?.trim() || '',
          isInternal: href.startsWith(baseUrl),
          rel,
          onClick: !!link.onclick,
          target: link.target || undefined,
          nofollow: rel?.includes('nofollow') || undefined,
          sponsored: rel?.includes('sponsored') || undefined,
          ugc: rel?.includes('ugc') || undefined,
        }
      })

      const internalLinks = links.filter((link) => link.isInternal)
      const externalLinks = links.filter((link) => !link.isInternal)
      const socialLinks = externalLinks.filter((link) =>
        /facebook|twitter|linkedin|instagram|youtube|github/i.test(link.href),
      )
      const navigationLinks = internalLinks.filter(
        (link) =>
          link.href === '/' ||
          /about|contact|services|products|blog/i.test(link.href),
      )

      return {
        links,
        linkAnalysis: {
          total: links.length,
          internal: {
            count: internalLinks.length,
            navigation: navigationLinks.length,
          },
          external: {
            count: externalLinks.length,
            social: socialLinks.length,
            nofollow: externalLinks.filter((link) => link.nofollow).length,
            sponsored: externalLinks.filter((link) => link.sponsored).length,
            ugc: externalLinks.filter((link) => link.ugc).length,
          },
        },
      }
    })

    return { links: results }
  }

  async summarizeResults(
    pages: Array<{ links: LinksMetric }>,
  ): Promise<{ links: LinksSummary }> {
    if (!this.enabled || pages.length === 0)
      return {
        links: {
          totalLinks: 0,
          uniqueLinks: 0,
          internalLinks: {
            total: 0,
            unique: 0,
            navigation: 0,
            averagePerPage: 0,
          },
          externalLinks: {
            total: 0,
            unique: 0,
            social: 0,
            nofollow: 0,
            sponsored: 0,
            ugc: 0,
            averagePerPage: 0,
          },
          commonNavigationPaths: [],
          topExternalDomains: [],
        },
      }

    const totalPages = pages.length

    // Collect all links
    const allLinks = pages.flatMap((p) => p.links.links)
    const uniqueLinks = new Set(allLinks.map((link) => link.href))

    // Separate internal and external links
    const internalLinks = allLinks.filter((link) => link.isInternal)
    const externalLinks = allLinks.filter((link) => !link.isInternal)

    // Count unique internal and external links
    const uniqueInternalLinks = new Set(internalLinks.map((link) => link.href))
    const uniqueExternalLinks = new Set(externalLinks.map((link) => link.href))

    // Count navigation links
    const navigationLinks = internalLinks.filter(
      (link) =>
        link.href === '/' ||
        /about|contact|services|products|blog/i.test(link.href),
    )

    // Analyze navigation paths
    const navigationPaths = internalLinks
      .map((link) => {
        try {
          return new URL(link.href).pathname
        } catch {
          return link.href
        }
      })
      .reduce(
        (acc, path) => {
          acc[path] = (acc[path] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

    const commonNavigationPaths = Object.entries(navigationPaths)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }))

    // Analyze external domains
    const externalDomains = externalLinks
      .map((link) => {
        try {
          return new URL(link.href).hostname
        } catch {
          return link.href
        }
      })
      .reduce(
        (acc, domain) => {
          acc[domain] = (acc[domain] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

    const topExternalDomains = Object.entries(externalDomains)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([domain, count]) => ({ domain, count }))

    return {
      links: {
        totalLinks: allLinks.length,
        uniqueLinks: uniqueLinks.size,
        internalLinks: {
          total: internalLinks.length,
          unique: uniqueInternalLinks.size,
          navigation: navigationLinks.length,
          averagePerPage: internalLinks.length / totalPages,
        },
        externalLinks: {
          total: externalLinks.length,
          unique: uniqueExternalLinks.size,
          social: externalLinks.filter((link) =>
            /facebook|twitter|linkedin|instagram|youtube|github/i.test(
              link.href,
            ),
          ).length,
          nofollow: externalLinks.filter((link) => link.nofollow).length,
          sponsored: externalLinks.filter((link) => link.sponsored).length,
          ugc: externalLinks.filter((link) => link.ugc).length,
          averagePerPage: externalLinks.length / totalPages,
        },
        commonNavigationPaths,
        topExternalDomains,
      },
    }
  }

  async destroy(): Promise<void> {
    if (!this.enabled) return
    console.log('[Crawler] Links plugin destroyed')
  }
}
