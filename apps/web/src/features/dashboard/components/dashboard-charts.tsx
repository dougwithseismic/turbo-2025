'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import * as React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

interface SiteMetrics {
  date: string
  clicks: number
  impressions: number
}

interface DeviceShare {
  name: string
  value: number
  fill: string
}

interface VisitorStats {
  desktop: number
  mobile: number
}

const generateVisitorData = (days: number): SiteMetrics[] => {
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

const generateDeviceShareData = (): DeviceShare[] => {
  return [{ name: 'Desktop', value: 35, fill: 'hsl(var(--chart-2))' }]
}

const generateVisitorStats = (): VisitorStats => {
  return {
    desktop: 1260,
    mobile: 570,
  }
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

const DashboardCharts = () => {
  const [timeRange, setTimeRange] = React.useState('30d')

  const days = timeRange === '90d' ? 90 : timeRange === '30d' ? 30 : 7
  const visitorData = React.useMemo(() => generateVisitorData(days), [days])

  return (
    <div className="">
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daily Visitors</CardTitle>
            <CardDescription>Visitor count by metric type</CardDescription>
          </div>
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
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[200px] w-full"
          >
            <AreaChart
              data={visitorData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id={`fillClicks-dashboard`}
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
                  id={`fillImpressions-dashboard`}
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
                      return new Date(value).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
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
                fill={`url(#fillImpressions-dashboard)`}
                strokeWidth={1.5}
                stackId="a"
              />
              <Area
                animationDuration={500}
                animationEasing="ease-in-out"
                type="natural"
                dataKey="clicks"
                stroke="var(--color-clicks)"
                fill={`url(#fillClicks-dashboard)`}
                strokeWidth={1.5}
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardCharts
