'use client'

import { useGetCrawlJob } from '@repo/supabase'
import { supabaseClient } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { MetricCard, getUrlsByCondition } from './metric-card'
import { ActionPointsSummary } from './action-points-summary'
import { useAutoActionPoints } from '../hooks/use-auto-action-points'
import { RealMockData } from '../utils/real-data'

interface SiteMetricsDashboardProps {
  jobId: string
}

export function SiteMetricsDashboard({ jobId }: SiteMetricsDashboardProps) {
  const { data: crawlJob } = useGetCrawlJob({
    supabase: supabaseClient,
    jobId,
    enabled: Boolean(jobId),
  })

  // Early return if no data yet
  if (!crawlJob?.results) {
    return null
  }

  const data = crawlJob.results as unknown as RealMockData
  const { summary } = data

  return (
    <div className="space-y-6">
      <AutoActionPoints data={data} />
      <ActionPointsSummary data={data} />
      <Card className="p-6">
        <Tabs defaultValue="seo" className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="mobile">Mobile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
          </TabsList>

          <TabsContent value="seo" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <MetricCard
                title="Title Statistics"
                metrics={[
                  {
                    label: 'Missing',
                    value: summary.seo.titleStats.missing,
                    urls: getUrlsByCondition(data, (page) => !page.seo.title),
                  },
                  {
                    label: 'Too Long',
                    value: summary.seo.titleStats.tooLong,
                    urls: getUrlsByCondition(
                      data,
                      (page) =>
                        typeof page.seo.title === 'string' &&
                        page.seo.title.length > 60,
                    ),
                  },
                  {
                    label: 'Too Short',
                    value: summary.seo.titleStats.tooShort,
                    urls: getUrlsByCondition(
                      data,
                      (page) =>
                        typeof page.seo.title === 'string' &&
                        page.seo.title.length < 30,
                    ),
                  },
                  {
                    label: 'Duplicates',
                    value: summary.seo.titleStats.duplicates,
                    urls: getUrlsByCondition(data, (page) => {
                      const titleCount = data.pages.filter(
                        (p) => p.seo.title === page.seo.title,
                      ).length
                      return titleCount > 1
                    }),
                  },
                  {
                    label: 'Average Length',
                    value: summary.seo.titleStats.averageLength.toFixed(1),
                  },
                ]}
              />

              <MetricCard
                title="Heading Statistics"
                metrics={[
                  {
                    label: 'Missing H1',
                    value: summary.seo.headingStats.missingH1,
                    urls: getUrlsByCondition(
                      data,
                      (page) => !page.seo.headings.h1.length,
                    ),
                  },
                  {
                    label: 'Multiple H1',
                    value: summary.seo.headingStats.multipleH1,
                    urls: getUrlsByCondition(
                      data,
                      (page) => page.seo.headings.h1.length > 1,
                    ),
                  },
                  {
                    label: 'Average H2 Count',
                    value: summary.seo.headingStats.averageH2Count.toFixed(1),
                  },
                  {
                    label: 'Average H3 Count',
                    value: summary.seo.headingStats.averageH3Count.toFixed(1),
                  },
                  {
                    label: 'Average H1 Length',
                    value: summary.seo.headingStats.averageH1Length.toFixed(1),
                  },
                ]}
              />

              <MetricCard
                title="Meta Tags"
                metrics={[
                  {
                    label: 'Average Count',
                    value: summary.seo.metaTagStats.averageCount.toFixed(1),
                  },
                  {
                    label: 'Missing Required',
                    value: summary.seo.metaTagStats.missingRequired,
                    urls: getUrlsByCondition(data, (page) => {
                      const hasDescription = page.seo.metaTags.some(
                        (tag) => tag.name === 'description',
                      )
                      return !hasDescription
                    }),
                  },
                ]}
              />

              <MetricCard
                title="Common Meta Tags"
                metrics={summary.seo.metaTagStats.commonTags.map((tag) => ({
                  label: tag.name || 'unnamed',
                  value: tag.count,
                  urls: getUrlsByCondition(data, (page) =>
                    page.seo.metaTags.some((t) => t.name === tag.name),
                  ),
                }))}
              />
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <MetricCard
                title="Word Statistics"
                metrics={[
                  {
                    label: 'Total Words',
                    value: summary.content.wordStats.totalWords,
                  },
                  {
                    label: 'Average Words',
                    value: summary.content.wordStats.averageWords.toFixed(1),
                  },
                  {
                    label: 'Min Words',
                    value: summary.content.wordStats.minWords,
                    urls: getUrlsByCondition(
                      data,
                      (page) =>
                        page.content.wordCount ===
                        summary.content.wordStats.minWords,
                    ),
                  },
                  {
                    label: 'Max Words',
                    value: summary.content.wordStats.maxWords,
                    urls: getUrlsByCondition(
                      data,
                      (page) =>
                        page.content.wordCount ===
                        summary.content.wordStats.maxWords,
                    ),
                  },
                  {
                    label: 'Readability Score',
                    value:
                      summary.content.wordStats.readabilityScore.toFixed(1),
                  },
                ]}
              />

              <MetricCard
                title="Reading Time"
                metrics={[
                  {
                    label: 'Total Reading Time',
                    value: summary.content.readingTimeStats.totalReadingTime,
                    suffix: ' min',
                  },
                  {
                    label: 'Average Reading Time',
                    value:
                      summary.content.readingTimeStats.averageReadingTime.toFixed(
                        1,
                      ),
                    suffix: ' min',
                  },
                  {
                    label: 'Under 2 min',
                    value:
                      summary.content.readingTimeStats.readingTimeDistribution
                        .under2min,
                    urls: getUrlsByCondition(
                      data,
                      (page) => page.content.readingTime < 2,
                    ),
                  },
                  {
                    label: 'Under 5 min',
                    value:
                      summary.content.readingTimeStats.readingTimeDistribution
                        .under5min,
                    urls: getUrlsByCondition(
                      data,
                      (page) =>
                        page.content.readingTime >= 2 &&
                        page.content.readingTime < 5,
                    ),
                  },
                  {
                    label: 'Under 10 min',
                    value:
                      summary.content.readingTimeStats.readingTimeDistribution
                        .under10min,
                    urls: getUrlsByCondition(
                      data,
                      (page) =>
                        page.content.readingTime >= 5 &&
                        page.content.readingTime < 10,
                    ),
                  },
                ]}
              />

              <MetricCard
                title="Content Quality"
                metrics={[
                  {
                    label: 'Pages with Lists',
                    value: summary.content.contentQualityStats.pagesWithLists,
                    urls: getUrlsByCondition(
                      data,
                      (page) => page.content.contentQuality.hasLists,
                    ),
                  },
                  {
                    label: 'Pages with Images',
                    value: summary.content.contentQualityStats.pagesWithImages,
                    urls: getUrlsByCondition(
                      data,
                      (page) => page.content.contentQuality.hasImages,
                    ),
                  },
                  {
                    label: 'Average Images/Page',
                    value:
                      summary.content.contentQualityStats.averageImagesPerPage.toFixed(
                        1,
                      ),
                  },
                  {
                    label: 'Average Lists/Page',
                    value:
                      summary.content.contentQualityStats.averageListsPerPage.toFixed(
                        1,
                      ),
                  },
                  {
                    label: 'Text/HTML Ratio',
                    value: (
                      summary.content.contentQualityStats
                        .averageTextToHtmlRatio * 100
                    ).toFixed(1),
                    suffix: '%',
                  },
                ]}
              />
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <MetricCard
                title="Core Web Vitals"
                metrics={[
                  {
                    label: 'Overall Score',
                    value:
                      summary.performance.coreWebVitals.scores.overallScore.toFixed(
                        1,
                      ),
                  },
                  {
                    label: 'FCP Score',
                    value:
                      summary.performance.coreWebVitals.scores.fcpScore.toFixed(
                        1,
                      ),
                    urls: getUrlsByCondition(
                      data,
                      (page) => page.performance.coreWebVitals.fcp > 2000, // Poor FCP > 2s
                    ),
                  },
                  {
                    label: 'LCP Score',
                    value:
                      summary.performance.coreWebVitals.scores.lcpScore.toFixed(
                        1,
                      ),
                    urls: getUrlsByCondition(
                      data,
                      (page) => page.performance.coreWebVitals.lcp > 2500, // Poor LCP > 2.5s
                    ),
                  },
                  {
                    label: 'CLS Score',
                    value:
                      summary.performance.coreWebVitals.scores.clsScore.toFixed(
                        1,
                      ),
                    urls: getUrlsByCondition(
                      data,
                      (page) => page.performance.coreWebVitals.cls > 0.1, // Poor CLS > 0.1
                    ),
                  },
                  {
                    label: 'TTFB Score',
                    value:
                      summary.performance.coreWebVitals.scores.ttfbScore.toFixed(
                        1,
                      ),
                    urls: getUrlsByCondition(
                      data,
                      (page) => page.performance.coreWebVitals.ttfb > 600, // Poor TTFB > 600ms
                    ),
                  },
                ]}
              />

              <MetricCard
                title="Load Time Statistics"
                metrics={[
                  {
                    label: 'Average Load Time',
                    value: summary.performance.loadTimeStats.average.toFixed(0),
                    suffix: 'ms',
                  },
                  {
                    label: 'Median Load Time',
                    value: summary.performance.loadTimeStats.median,
                    suffix: 'ms',
                  },
                  {
                    label: '95th Percentile',
                    value: summary.performance.loadTimeStats.p95,
                    suffix: 'ms',
                    urls: getUrlsByCondition(
                      data,
                      (page) =>
                        page.performance.loadTime >=
                        summary.performance.loadTimeStats.p95,
                    ),
                  },
                  {
                    label: 'Min Load Time',
                    value: summary.performance.loadTimeStats.min,
                    suffix: 'ms',
                    urls: getUrlsByCondition(
                      data,
                      (page) =>
                        page.performance.loadTime ===
                        summary.performance.loadTimeStats.min,
                    ),
                  },
                  {
                    label: 'Max Load Time',
                    value: summary.performance.loadTimeStats.max,
                    suffix: 'ms',
                    urls: getUrlsByCondition(
                      data,
                      (page) =>
                        page.performance.loadTime ===
                        summary.performance.loadTimeStats.max,
                    ),
                  },
                ]}
              />

              <MetricCard
                title="Resource Sizes"
                metrics={Object.entries(
                  summary.performance.resourceStats.averageSizes,
                ).map(([key, value]) => ({
                  label: key.charAt(0).toUpperCase() + key.slice(1),
                  value: (value / 1024).toFixed(1),
                  suffix: ' KB',
                  urls: getUrlsByCondition(data, (page) => {
                    const resourceSize =
                      page.performance.resourceSizes[
                        key as keyof typeof page.performance.resourceSizes
                      ]
                    return resourceSize > value * 1.5 // 50% larger than average
                  }),
                }))}
              />
            </div>
          </TabsContent>

          <TabsContent value="links" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <MetricCard
                title="Link Overview"
                metrics={[
                  {
                    label: 'Total Links',
                    value: summary.links.totalLinks,
                  },
                  {
                    label: 'Unique Links',
                    value: summary.links.uniqueLinks,
                  },
                  {
                    label: 'Internal Links',
                    value: summary.links.internalLinks.total,
                    urls: getUrlsByCondition(
                      data,
                      (page) => page.links.linkAnalysis.internal.count > 0,
                    ),
                  },
                  {
                    label: 'External Links',
                    value: summary.links.externalLinks.total,
                    urls: getUrlsByCondition(
                      data,
                      (page) => page.links.linkAnalysis.external.count > 0,
                    ),
                  },
                  {
                    label: 'Navigation Links',
                    value: summary.links.internalLinks.navigation,
                    urls: getUrlsByCondition(
                      data,
                      (page) => page.links.linkAnalysis.internal.navigation > 0,
                    ),
                  },
                ]}
              />

              <MetricCard
                title="External Link Types"
                metrics={[
                  {
                    label: 'Social Links',
                    value: summary.links.externalLinks.social,
                    urls: getUrlsByCondition(
                      data,
                      (page) => page.links.linkAnalysis.external.social > 0,
                    ),
                  },
                  {
                    label: 'UGC Links',
                    value: summary.links.externalLinks.ugc,
                    urls: getUrlsByCondition(
                      data,
                      (page) => page.links.linkAnalysis.external.ugc > 0,
                    ),
                  },
                  {
                    label: 'Sponsored Links',
                    value: summary.links.externalLinks.sponsored,
                    urls: getUrlsByCondition(
                      data,
                      (page) => page.links.linkAnalysis.external.sponsored > 0,
                    ),
                  },
                  {
                    label: 'Nofollow Links',
                    value: summary.links.externalLinks.nofollow,
                    urls: getUrlsByCondition(
                      data,
                      (page) => page.links.linkAnalysis.external.nofollow > 0,
                    ),
                  },
                ]}
              />

              <MetricCard
                title="Top External Domains"
                metrics={summary.links.topExternalDomains.map((domain) => ({
                  label: domain.domain || 'unknown',
                  value: domain.count,
                  urls: getUrlsByCondition(data, (page) =>
                    page.links.links.some(
                      (link) =>
                        !link.isInternal &&
                        new URL(link.href).hostname === domain.domain,
                    ),
                  ),
                }))}
              />

              <MetricCard
                title="Common Navigation Paths"
                metrics={summary.links.commonNavigationPaths
                  .slice(0, 5)
                  .map((path) => {
                    return {
                      label: path.path,
                      value: path.count,
                      urls: getUrlsByCondition(data, (page) =>
                        page.links.links.some(
                          (link) =>
                            link.isInternal && link.href.includes(path.path),
                        ),
                      ),
                    }
                  })}
              />
            </div>
          </TabsContent>

          <TabsContent value="mobile" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="p-4">
                <h3 className="mb-4 text-lg font-semibold">Mobile Score</h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Overall Score</TableCell>
                      <TableCell className="text-right">
                        {summary.mobileFriendliness.mobileScore.overall.toFixed(
                          1,
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Font Score</TableCell>
                      <TableCell className="text-right">
                        {summary.mobileFriendliness.mobileScore.breakdown.fontScore.toFixed(
                          1,
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Responsive Score</TableCell>
                      <TableCell className="text-right">
                        {summary.mobileFriendliness.mobileScore.breakdown.responsiveScore.toFixed(
                          1,
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Touch Target Score</TableCell>
                      <TableCell className="text-right">
                        {summary.mobileFriendliness.mobileScore.breakdown.touchTargetScore.toFixed(
                          1,
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>

              <Card className="p-4">
                <h3 className="mb-4 text-lg font-semibold">Font Statistics</h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Readable Pages</TableCell>
                      <TableCell className="text-right">
                        {summary.mobileFriendliness.fontStats.readablePages}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Average Base Size</TableCell>
                      <TableCell className="text-right">
                        {summary.mobileFriendliness.fontStats.averageBaseSize}
                        px
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Percentage Readable</TableCell>
                      <TableCell className="text-right">
                        {
                          summary.mobileFriendliness.fontStats
                            .percentageReadable
                        }
                        %
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>

              <Card className="p-4">
                <h3 className="mb-4 text-lg font-semibold">Touch Targets</h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Average Targets/Page</TableCell>
                      <TableCell className="text-right">
                        {summary.mobileFriendliness.touchTargetStats.averageTargetsPerPage.toFixed(
                          1,
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Average Small Targets</TableCell>
                      <TableCell className="text-right">
                        {summary.mobileFriendliness.touchTargetStats.averageSmallTargets.toFixed(
                          1,
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Small Target %</TableCell>
                      <TableCell className="text-right">
                        {summary.mobileFriendliness.touchTargetStats.percentageSmallTargets.toFixed(
                          1,
                        )}
                        %
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="p-4">
                <h3 className="mb-4 text-lg font-semibold">Security Score</h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Overall Score</TableCell>
                      <TableCell className="text-right">
                        {summary.security.securityScore.overall}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>HTTPS Score</TableCell>
                      <TableCell className="text-right">
                        {summary.security.securityScore.https}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Headers Score</TableCell>
                      <TableCell className="text-right">
                        {summary.security.securityScore.headers}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>

              <Card className="p-4">
                <h3 className="mb-4 text-lg font-semibold">HTTPS Statistics</h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>HTTPS Pages</TableCell>
                      <TableCell className="text-right">
                        {summary.security.httpsStats.totalHttps}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>HTTP Pages</TableCell>
                      <TableCell className="text-right">
                        {summary.security.httpsStats.totalHttp}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Secure Percentage</TableCell>
                      <TableCell className="text-right">
                        {summary.security.httpsStats.percentageSecure}%
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>

              <Card className="p-4">
                <h3 className="mb-4 text-lg font-semibold">Security Headers</h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>HSTS Adoption</TableCell>
                      <TableCell className="text-right">
                        {summary.security.headerStats.hstsAdoption}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>CSP Adoption</TableCell>
                      <TableCell className="text-right">
                        {summary.security.headerStats.cspAdoption}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>X-Frame-Options</TableCell>
                      <TableCell className="text-right">
                        {summary.security.headerStats.xFrameOptionsAdoption}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Content-Type-Options</TableCell>
                      <TableCell className="text-right">
                        {
                          summary.security.headerStats
                            .xContentTypeOptionsAdoption
                        }
                        %
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <MetricCard
                title="Overall Search Performance"
                metrics={[
                  {
                    label: 'Total Clicks',
                    value: summary.searchConsole.totalMetrics.totalClicks,
                  },
                  {
                    label: 'Total Impressions',
                    value: summary.searchConsole.totalMetrics.totalImpressions,
                  },
                  {
                    label: 'Average CTR',
                    value: (
                      summary.searchConsole.totalMetrics.averageCtr * 100
                    ).toFixed(1),
                    suffix: '%',
                  },
                  {
                    label: 'Average Position',
                    value:
                      summary.searchConsole.totalMetrics.averagePosition.toFixed(
                        1,
                      ),
                  },
                ]}
              />

              <MetricCard
                title="Top Performing Pages"
                metrics={summary.searchConsole.pathAnalysis.mostClicked
                  .slice(0, 5)
                  .map((page) => ({
                    label: page.path || '/',
                    value: page.clicks,
                    urls: getUrlsByCondition(data, (p) => p.url === page.path),
                  }))}
              />

              <MetricCard
                title="Best Ranking Pages"
                metrics={summary.searchConsole.pathAnalysis.bestPosition
                  .filter((page) => page.position > 0)
                  .slice(0, 5)
                  .map((page) => ({
                    label: page.path || '/',
                    value: page.position.toFixed(1),
                    urls: getUrlsByCondition(data, (p) => p.url === page.path),
                  }))}
              />

              <MetricCard
                title="Most Visible Pages"
                metrics={summary.searchConsole.pathAnalysis.mostImpressed
                  .filter((page) => page.impressions > 0)
                  .slice(0, 5)
                  .map((page) => ({
                    label: page.path || '/',
                    value: page.impressions,
                    urls: getUrlsByCondition(data, (p) => p.url === page.path),
                  }))}
              />

              <MetricCard
                title="Top Queries"
                metrics={summary.searchConsole.queryAnalysis.topQueries
                  .slice(0, 5)
                  .map((query) => ({
                    label: query.query,
                    value: query.metrics.position.toFixed(1),
                    description: `${query.metrics.clicks} clicks, ${query.metrics.impressions} impressions`,
                    reasoning: `CTR: ${(query.metrics.ctr * 100).toFixed(1)}%`,
                  }))}
              />

              <MetricCard
                title="Long Tail Queries"
                metrics={summary.searchConsole.queryAnalysis.queryCategories.longTail
                  .slice(0, 5)
                  .map((query) => ({
                    label: query.query,
                    value: query.metrics.position.toFixed(1),
                    description: `${query.metrics.clicks} clicks, ${query.metrics.impressions} impressions`,
                    reasoning: `CTR: ${(query.metrics.ctr * 100).toFixed(1)}%`,
                  }))}
              />
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

function AutoActionPoints({ data }: { data: RealMockData }) {
  useAutoActionPoints(data)
  return null
}
