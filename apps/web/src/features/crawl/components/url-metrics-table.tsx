'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { InfoTooltip, TooltipProvider } from '@/components/ui/tooltip'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
  Row,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ArrowUpDown, Check, ChevronDown, Copy } from 'lucide-react'
import { useRef, useState, useMemo } from 'react'
import { ALL_ACTION_CHECKS } from '../config/action-checks'
import { useActionPoints } from '../context/action-points-context'
import { useUrlIssues } from '../context/url-issues-context'
import { UrlIssuesSelect } from './url-issues-select'

export type UrlMetric = {
  url: string
  status_code: number
  title: string | null
  meta_description: string | null
  h1: string[] | null
  load_time_ms: number | null
  word_count: number | null
  internal_links: number | null
  external_links: number | null
  images_count: number | null
  images_without_alt: number | null
}

const columnDescriptions = {
  url: {
    description: 'The URL of the crawled page',
    reasoning: 'Unique identifier for each page in your site',
  },
  status_code: {
    description: 'HTTP status code returned by the page',
    reasoning:
      '2xx = success, 3xx = redirect, 4xx = client error, 5xx = server error',
  },
  title: {
    description: 'Page title tag content',
    reasoning: 'Critical for SEO and user experience in search results',
  },
  h1: {
    description: 'Main heading of the page',
    reasoning:
      'Should clearly describe the page content and contain relevant keywords',
  },
  load_time_ms: {
    description: 'Time taken to load the page in milliseconds',
    reasoning: 'Affects user experience and search rankings - faster is better',
  },
  word_count: {
    description: 'Total number of words on the page',
    reasoning: 'Indicates content depth and potential value to users',
  },
  internal_links: {
    description: 'Number of links to other pages on your site',
    reasoning: 'Important for site structure and spreading link equity',
  },
  external_links: {
    description: 'Number of links to other websites',
    reasoning: 'Can add value through citations but should be used judiciously',
  },
  images_count: {
    description: 'Number of images on the page',
    reasoning: 'Images engage users but need proper optimization and alt text',
  },
}

const columns: ColumnDef<UrlMetric>[] = [
  {
    accessorKey: 'url',
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            URL
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
          <InfoTooltip
            content={
              <div className="space-y-2">
                <p>{columnDescriptions.url.description}</p>
                <p className="text-muted-foreground">
                  {columnDescriptions.url.reasoning}
                </p>
              </div>
            }
          />
        </div>
      )
    },
    cell: ({ row }) => (
      <div className="w-[200px] truncate font-medium">
        {row.getValue('url')}
      </div>
    ),
  },
  {
    accessorKey: 'status_code',
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
          <InfoTooltip
            content={
              <div className="space-y-2">
                <p>{columnDescriptions.status_code.description}</p>
                <p className="text-muted-foreground">
                  {columnDescriptions.status_code.reasoning}
                </p>
              </div>
            }
          />
        </div>
      )
    },
    cell: ({ row }) => {
      const status: number = row.getValue('status_code')
      return (
        <div className="w-[80px]">
          <Badge
            variant={
              status >= 400
                ? 'destructive'
                : status >= 300
                  ? 'secondary'
                  : 'outline'
            }
          >
            {status}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: 'title',
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
          <InfoTooltip
            content={
              <div className="space-y-2">
                <p>{columnDescriptions.title.description}</p>
                <p className="text-muted-foreground">
                  {columnDescriptions.title.reasoning}
                </p>
              </div>
            }
          />
        </div>
      )
    },
    cell: ({ row }) => (
      <div className="w-[200px] truncate">{row.getValue('title') || '-'}</div>
    ),
  },
  {
    accessorKey: 'h1',
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            H1
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
          <InfoTooltip
            content={
              <div className="space-y-2">
                <p>{columnDescriptions.h1.description}</p>
                <p className="text-muted-foreground">
                  {columnDescriptions.h1.reasoning}
                </p>
              </div>
            }
          />
        </div>
      )
    },
    cell: ({ row }) => {
      const h1s: string[] | null = row.getValue('h1')
      return (
        <div className="w-[200px] truncate">{h1s?.length ? h1s[0] : '-'}</div>
      )
    },
  },
  {
    accessorKey: 'load_time_ms',
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Load Time
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
          <InfoTooltip
            content={
              <div className="space-y-2">
                <p>{columnDescriptions.load_time_ms.description}</p>
                <p className="text-muted-foreground">
                  {columnDescriptions.load_time_ms.reasoning}
                </p>
              </div>
            }
          />
        </div>
      )
    },
    cell: ({ row }) => {
      const loadTime: number | null = row.getValue('load_time_ms')
      return (
        <div className="w-[100px] text-right">
          {loadTime ? `${(loadTime / 1000).toFixed(2)}s` : '-'}
        </div>
      )
    },
  },
  {
    accessorKey: 'word_count',
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Words
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
          <InfoTooltip
            content={
              <div className="space-y-2">
                <p>{columnDescriptions.word_count.description}</p>
                <p className="text-muted-foreground">
                  {columnDescriptions.word_count.reasoning}
                </p>
              </div>
            }
          />
        </div>
      )
    },
    cell: ({ row }) => (
      <div className="w-[80px] text-right">
        {row.getValue('word_count') || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'internal_links',
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Internal Links
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
          <InfoTooltip
            content={
              <div className="space-y-2">
                <p>{columnDescriptions.internal_links.description}</p>
                <p className="text-muted-foreground">
                  {columnDescriptions.internal_links.reasoning}
                </p>
              </div>
            }
          />
        </div>
      )
    },
    cell: ({ row }) => (
      <div className="w-[80px] text-right">
        {row.getValue('internal_links') || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'external_links',
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            External Links
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
          <InfoTooltip
            content={
              <div className="space-y-2">
                <p>{columnDescriptions.external_links.description}</p>
                <p className="text-muted-foreground">
                  {columnDescriptions.external_links.reasoning}
                </p>
              </div>
            }
          />
        </div>
      )
    },
    cell: ({ row }) => (
      <div className="w-[80px] text-right">
        {row.getValue('external_links') || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'images_count',
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Images
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
          <InfoTooltip
            content={
              <div className="space-y-2">
                <p>{columnDescriptions.images_count.description}</p>
                <p className="text-muted-foreground">
                  {columnDescriptions.images_count.reasoning}
                </p>
              </div>
            }
          />
        </div>
      )
    },
    cell: ({ row }) => {
      const totalImages: number | null = row.getValue('images_count')
      const missing = row.original.images_without_alt
      if (!totalImages) return '-'
      return (
        <div className="w-[100px] text-right">
          {`${totalImages} (${missing ?? 0} no alt)`}
        </div>
      )
    },
  },
]

interface UrlMetricsTableProps {
  data: UrlMetric[]
  jobDetails?: {
    id: string
    created_at: string
    status: string
  }
}

export function UrlMetricsTable({ data, jobDetails }: UrlMetricsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () =>
      columns.reduce((acc, column) => {
        if ('accessorKey' in column) {
          acc[column.accessorKey as string] = true
        }
        return acc
      }, {} as VisibilityState),
  )
  const [rowSelection, setRowSelection] = useState({})
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const { state } = useActionPoints()
  const urlIssuesContext = useUrlIssues()

  const handleCopy = async () => {
    if (jobDetails) {
      const url = `${window.location.origin}/project/${jobDetails.id}/crawls/${jobDetails.id}`
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Failed to copy URL:', error)
      }
    }
  }

  const ActionCell = ({ row }: { row: Row<UrlMetric> }) => {
    const url = row.original
    const urlAction = state.urlActions.find((a) => a.url === url.url)

    if (!urlAction?.actions.length) return null

    return (
      <div className="flex flex-wrap gap-2">
        {urlAction.actions.map((action) => {
          const [category, actionName] = action.type.split(': ')
          const actionInfo = ALL_ACTION_CHECKS.find(
            (check) => check.category === category && check.type === actionName,
          )
          return (
            <div key={action.type} className="flex items-center gap-1">
              <Badge
                variant="outline"
                className={`flex items-center gap-1 ${action.color}`}
              >
                {action.type}
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
    )
  }

  const tableColumns = useMemo(
    () => [
      ...columns.filter((col) => col.id !== 'issues'),
      {
        id: 'issues',
        header: 'Issues',
        cell: ({ row }) => {
          const url = row.original.url
          const urlIssues =
            urlIssuesContext.state.urlIssues.find((ui) => ui.url === url)
              ?.issues ?? []

          return (
            <div className="w-[300px]">
              <UrlIssuesSelect
                issues={urlIssuesContext.state.predefinedIssues ?? []}
                selectedIssues={urlIssues}
                onSelect={({ issues }) =>
                  urlIssuesContext.addIssue({ url, issues })
                }
                onCreateIssue={urlIssuesContext.createPredefinedIssue}
              />
            </div>
          )
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <ActionCell row={row} />,
      },
    ],
    [urlIssuesContext, state.urlActions],
  )

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    getSortedRowModel: getSortedRowModel(),
  })

  const { rows } = table.getRowModel()
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 45, // Approximate row height
    overscan: 10,
  })

  const availableColumns = table
    .getAllColumns()
    .filter((column) => column.getCanHide())

  return (
    <TooltipProvider>
      <Card className="p-6">
        {jobDetails && (
          <div className="mb-6 pb-6 border-b">
            <div className="flex justify-between items-start">
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">
                    Job #{jobDetails.id}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Started at {new Date(jobDetails.created_at).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Status:{' '}
                  <span className="capitalize">{jobDetails.status}</span>
                </div>
              </div>
              <div className="flex justify-end mb-4">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[200px] justify-between"
                    >
                      Columns (
                      {Object.values(columnVisibility).filter(Boolean).length})
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0" align="end">
                    <ScrollArea className="h-[300px]">
                      <div className="p-2 grid gap-1">
                        {availableColumns.map((column) => {
                          const id = `column-${column.id}`
                          return (
                            <Label
                              key={column.id}
                              htmlFor={id}
                              className="flex items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent cursor-pointer"
                            >
                              <Checkbox
                                id={id}
                                checked={column.getIsVisible()}
                                onCheckedChange={(value) => {
                                  column.toggleVisibility(!!value)
                                }}
                              />
                              <span className="flex-grow text-sm capitalize">
                                {column.id.replace(/_/g, ' ')}
                              </span>
                            </Label>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-md border">
          <div
            ref={tableContainerRef}
            className="relative w-full overflow-auto"
            style={{ height: '600px' }}
          >
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
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
                {/* Add padding to account for virtual rows */}
                <tr>
                  <td
                    style={{
                      height: `${rowVirtualizer.getVirtualItems()[0]?.start ?? 0}px`,
                    }}
                  />
                </tr>
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const row = rows[virtualRow.index]
                  if (!row) return null
                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      data-index={virtualRow.index}
                      ref={(el) => {
                        if (el) {
                          rowVirtualizer.measureElement(el)
                        }
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })}
                {/* Add padding to account for virtual rows */}
                <tr>
                  <td
                    style={{
                      height: `${
                        rowVirtualizer.getTotalSize() -
                        (rowVirtualizer.getVirtualItems()[
                          rowVirtualizer.getVirtualItems().length - 1
                        ]?.end ?? 0)
                      }px`,
                    }}
                  />
                </tr>
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
        </div>
      </Card>
    </TooltipProvider>
  )
}
