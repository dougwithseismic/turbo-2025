'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useActionPoints } from '../context/action-points-context'
import { X, ArrowUpDown, Download } from 'lucide-react'
import { InfoTooltip, TooltipProvider } from '@/components/ui/tooltip'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'
import { UrlAction } from '../context/action-points-context'
import { ALL_ACTION_CHECKS } from '../config/action-checks'
import { RealMockData } from '../utils/real-data'

interface ExtendedUrlAction extends UrlAction {
  pageData: RealMockData['pages'][0]
}

type MetricFunction = (
  data: ExtendedUrlAction,
) => string | number | boolean | undefined | null

function generateCsv(urlActions: ExtendedUrlAction[]): string {
  // Define all the metrics we want to export
  const metrics: Record<string, MetricFunction> = {
    url: (data) => data.pageData.url,
    status: (data) => data.pageData.status,
    // SEO Metrics
    title: (data) => data.pageData.seo.title,
    description: (data) => data.pageData.seo.description,
    h1_count: (data) => data.pageData.seo.headings.h1.length,
    h2_count: (data) => data.pageData.seo.headings.h2.length,
    h3_count: (data) => data.pageData.seo.headings.h3.length,
    meta_tags_count: (data) => data.pageData.seo.metaTags.length,
    // Content Metrics
    word_count: (data) => data.pageData.content.wordCount,
    reading_time: (data) => data.pageData.content.readingTime,
    content_length: (data) => data.pageData.content.contentLength,
    has_lists: (data) => data.pageData.content.contentQuality.hasLists,
    has_images: (data) => data.pageData.content.contentQuality.hasImages,
    list_count: (data) => data.pageData.content.contentQuality.listCount,
    image_count: (data) => data.pageData.content.contentQuality.imageCount,
    paragraph_count: (data) =>
      data.pageData.content.contentQuality.paragraphCount,
    text_html_ratio: (data) =>
      data.pageData.content.contentQuality.textToHtmlRatio,
    avg_paragraph_length: (data) =>
      data.pageData.content.contentQuality.averageParagraphLength,
    // Performance Metrics
    load_time: (data) => data.pageData.performance.loadTime,
    cls: (data) => data.pageData.performance.coreWebVitals.cls,
    fcp: (data) => data.pageData.performance.coreWebVitals.fcp,
    fid: (data) => data.pageData.performance.coreWebVitals.fid,
    lcp: (data) => data.pageData.performance.coreWebVitals.lcp,
    ttfb: (data) => data.pageData.performance.coreWebVitals.ttfb,
    // Resource Sizes
    css_size: (data) => data.pageData.performance.resourceSizes.css,
    html_size: (data) => data.pageData.performance.resourceSizes.html,
    fonts_size: (data) => data.pageData.performance.resourceSizes.fonts,
    images_size: (data) => data.pageData.performance.resourceSizes.images,
    js_size: (data) => data.pageData.performance.resourceSizes.javascript,
    // Link Metrics
    total_links: (data) => data.pageData.links.linkAnalysis.total,
    internal_links: (data) => data.pageData.links.linkAnalysis.internal.count,
    external_links: (data) => data.pageData.links.linkAnalysis.external.count,
    navigation_links: (data) =>
      data.pageData.links.linkAnalysis.internal.navigation,
    social_links: (data) => data.pageData.links.linkAnalysis.external.social,
    ugc_links: (data) => data.pageData.links.linkAnalysis.external.ugc,
    sponsored_links: (data) =>
      data.pageData.links.linkAnalysis.external.sponsored,
    nofollow_links: (data) =>
      data.pageData.links.linkAnalysis.external.nofollow,
    // Mobile Metrics
    font_size: (data) => data.pageData.mobileFriendliness.fontSize.base,
    is_font_readable: (data) =>
      data.pageData.mobileFriendliness.fontSize.readable,
    is_responsive: (data) => data.pageData.mobileFriendliness.isResponsive,
    touch_targets: (data) =>
      data.pageData.mobileFriendliness.touchTargets.total,
    small_touch_targets: (data) =>
      data.pageData.mobileFriendliness.touchTargets.tooSmall,
    has_viewport_meta: (data) => data.pageData.mobileFriendliness.viewportMeta,
    // Search Console Metrics
    search_ctr: (data) => data.pageData.searchConsole.metrics.ctr,
    search_clicks: (data) => data.pageData.searchConsole.metrics.clicks,
    search_position: (data) => data.pageData.searchConsole.metrics.position,
    search_impressions: (data) =>
      data.pageData.searchConsole.metrics.impressions,
    // Action Points
    action_count: (data) => data.actions.length,
    actions: (data) => data.actions.map((a) => a.type).join('; '),
  }

  // Create CSV header
  const header = Object.keys(metrics)

  // Create CSV rows
  const rows = urlActions.map((urlAction) => {
    return Object.values(metrics).map((metric) => {
      const value = metric(urlAction)
      // Handle special cases like arrays, objects, or null values
      if (value === null || value === undefined) return ''
      if (typeof value === 'boolean') return value ? 'true' : 'false'
      if (Array.isArray(value)) return `"${value.join(', ')}"`
      if (typeof value === 'string' && value.includes(',')) return `"${value}"`
      return value
    })
  })

  // Combine header and rows
  const csvContent = [header, ...rows].map((row) => row.join(',')).join('\n')

  return csvContent
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

interface ActionPointsSummaryProps {
  data: RealMockData
}

export function ActionPointsSummary({ data }: ActionPointsSummaryProps) {
  const { state, dispatch } = useActionPoints()
  const [sorting, setSorting] = useState<SortingState>([])

  const getActionInfo = (type: string) => {
    const [category, actionName] = type.split(': ')
    return ALL_ACTION_CHECKS.find(
      (check) => check.category === category && check.type === actionName,
    )
  }

  const handleExportCsv = () => {
    // Combine URL actions with page data
    const extendedUrlActions: ExtendedUrlAction[] = state.urlActions.map(
      (urlAction) => {
        const pageData = data.pages.find((page) => page.url === urlAction.url)
        if (!pageData) {
          throw new Error(`No page data found for URL: ${urlAction.url}`)
        }
        return {
          ...urlAction,
          pageData,
        }
      },
    )

    const csvContent = generateCsv(extendedUrlActions)
    downloadCsv(csvContent, 'action-points.csv')
  }

  const columns: ColumnDef<UrlAction>[] = [
    {
      accessorKey: 'url',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="pl-0"
        >
          URL
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.original.url}</div>
      ),
    },
    {
      accessorKey: 'actions',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="pl-0"
        >
          Actions
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          {row.original.actions.map((action) => {
            const actionInfo = getActionInfo(action.type)
            return (
              <div key={action.type} className="flex items-center gap-1">
                <Badge
                  variant="outline"
                  className={`flex items-center gap-1 ${action.color}`}
                >
                  {action.type}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveAction(row.original.url, action.type)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
                {actionInfo && (
                  <InfoTooltip
                    content={
                      <div className="space-y-2">
                        <p>{actionInfo.description}</p>
                        <p className="text-muted-foreground">
                          {actionInfo.reasoning}
                        </p>
                      </div>
                    }
                  />
                )}
              </div>
            )
          })}
        </div>
      ),
      sortingFn: (rowA, rowB) => {
        // Sort by number of actions first, then by first action text
        const countDiff =
          rowB.original.actions.length - rowA.original.actions.length
        if (countDiff !== 0) return countDiff
        return (rowA.original.actions[0]?.type || '').localeCompare(
          rowB.original.actions[0]?.type || '',
        )
      },
    },
  ]

  const table = useReactTable({
    data: state.urlActions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  const handleRemoveAction = (url: string, action: string) => {
    dispatch({
      type: 'REMOVE_ACTION',
      payload: { url, action },
    })
  }

  const handleClearAll = () => {
    dispatch({ type: 'CLEAR_ALL' })
  }

  if (state.urlActions.length === 0) {
    return null
  }

  return (
    <TooltipProvider>
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Action Points</h3>
            <p className="text-sm text-muted-foreground">
              {state.urlActions.length} URLs with actions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              Clear All
            </Button>
          </div>
        </div>
        <ScrollArea className="h-[300px]">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </TooltipProvider>
  )
}
