'use client'

import { ContentCard, ContentCardProvider } from '@/components/content-card'
import { ContentCardSearch } from '@/components/content-card/components/content-card-search'
import { Button } from '@/components/ui/button'
import { CardDescription, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import * as React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import {
  fetchSearchConsoleSites,
  GoogleSite,
} from '../actions/fetch-search-console-sites'
import { useQuery } from '@tanstack/react-query'

interface SiteMetrics {
  date: string
  clicks: number
  impressions: number
}

// Demo data - replace with real API data
const generateDemoMetrics = (days: number): SiteMetrics[] => {
  const data: SiteMetrics[] = []
  const endDate = new Date()

  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(endDate.getDate() - i)
    data.push({
      date: date.toISOString().slice(0, 10),
      clicks: Math.floor(Math.random() * 500),
      impressions: Math.floor(Math.random() * 2000 + 500),
    })
  }
  return data
}

const chartConfig = {
  metrics: {
    label: 'Metrics',
  },
  clicks: {
    label: 'Clicks',
    color: 'hsl(var(--chart-1))',
  },
  impressions: {
    label: 'Impressions',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

const SearchConsoleSettings = () => {
  const { data: sites } = useQuery({
    queryKey: ['searchConsoleSites'],
    queryFn: async () => {
      const sites = await fetchSearchConsoleSites()
      if (!sites) {
        throw new Error('Failed to fetch sites')
      }
      const siteArray = sites.data.siteEntry
      return siteArray ?? []
    },
  })

  const [timeRange, setTimeRange] = React.useState('30d')
  const [metrics, setMetrics] = React.useState<Record<string, SiteMetrics[]>>(
    {},
  )

  React.useEffect(() => {
    if (sites) {
      const newMetrics: Record<string, SiteMetrics[]> = {}
      sites.forEach((site) => {
        newMetrics[site.siteUrl] = generateDemoMetrics(90)
      })
      setMetrics(newMetrics)
    }
  }, [sites])

  const getFilteredData = (siteUrl: string) => {
    const days = timeRange === '90d' ? 90 : timeRange === '30d' ? 30 : 7
    return metrics[siteUrl]?.slice(-days) || []
  }

  return (
    <ContentCardProvider>
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-8 pt-0 container max-w-4xl mx-auto">
        <div className="row flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Google Search Console</h1>
            <span className="text-sm text-muted-foreground">
              Manage and monitor your websites search performance
            </span>
          </div>
          <ContentCardSearch placeholder="Search sites..." />
        </div>

        <div className="flex flex-col gap-8 md:gap-12">
          <ContentCard id="search-console-sites" headerPosition="INSIDE">
            <ContentCard.Header>
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col gap-2">
                  <CardTitle>Connected Sites</CardTitle>
                  <CardDescription>
                    Your verified websites in Google Search Console
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Last 30 days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </ContentCard.Header>
            <ContentCard.Body>
              {sites && sites.length > 0 ? (
                sites.map((site) => (
                  <ContentCard.Item key={site.siteUrl} id={site.siteUrl}>
                    <h3 className="font-semibold text-lg break-all">
                      {site.siteUrl}
                    </h3>
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            Total Clicks
                          </span>
                          <span className="text-2xl font-bold">
                            {getFilteredData(site.siteUrl)
                              .reduce((sum, day) => sum + day.clicks, 0)
                              .toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            Total Impressions
                          </span>
                          <span className="text-2xl font-bold">
                            {getFilteredData(site.siteUrl)
                              .reduce((sum, day) => sum + day.impressions, 0)
                              .toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="h-[200px] w-full mt-4">
                        <ChartContainer
                          config={chartConfig}
                          className="aspect-auto h-[200px] w-full"
                        >
                          <AreaChart
                            data={getFilteredData(site.siteUrl)}
                            margin={{
                              top: 10,
                              right: 10,
                              left: 0,
                              bottom: 0,
                            }}
                          >
                            <defs>
                              <linearGradient
                                id={`fillClicks-${site.siteUrl}`}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="var(--color-clicks)"
                                  stopOpacity={0.8}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="var(--color-clicks)"
                                  stopOpacity={0.1}
                                />
                              </linearGradient>
                              <linearGradient
                                id={`fillImpressions-${site.siteUrl}`}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="var(--color-impressions)"
                                  stopOpacity={0.8}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="var(--color-impressions)"
                                  stopOpacity={0.1}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="date"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              minTickGap={32}
                              tickFormatter={(value: string) => {
                                const date = new Date(value)
                                return date.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })
                              }}
                            />
                            <ChartTooltip
                              cursor={false}
                              content={
                                <ChartTooltipContent
                                  labelFormatter={(value: string) => {
                                    return new Date(value).toLocaleDateString(
                                      'en-US',
                                      {
                                        month: 'short',
                                        day: 'numeric',
                                      },
                                    )
                                  }}
                                  indicator="dot"
                                />
                              }
                            />
                            <Area
                              animationDuration={500}
                              animationEasing="ease-in-out"
                              type="natural"
                              dataKey="impressions"
                              stroke="var(--color-impressions)"
                              fill={`url(#fillImpressions-${site.siteUrl})`}
                              strokeWidth={1.5}
                              stackId="a"
                            />
                            <Area
                              animationDuration={500}
                              animationEasing="ease-in-out"
                              type="natural"
                              dataKey="clicks"
                              stroke="var(--color-clicks)"
                              fill={`url(#fillClicks-${site.siteUrl})`}
                              strokeWidth={1.5}
                              stackId="a"
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                          </AreaChart>
                        </ChartContainer>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          Permission: {site.permissionLevel}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Last Updated: {new Date().toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </ContentCard.Item>
                ))
              ) : (
                <ContentCard.Item id="no-sites">
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <p className="text-muted-foreground mb-4">
                      No sites found in your Google Search Console
                    </p>
                    <Button variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Site
                    </Button>
                  </div>
                </ContentCard.Item>
              )}
            </ContentCard.Body>
          </ContentCard>
        </div>
      </div>
    </ContentCardProvider>
  )
}

export default SearchConsoleSettings
