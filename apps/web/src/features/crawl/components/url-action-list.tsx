'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { InfoTooltip, TooltipProvider } from '@/components/ui/tooltip'
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table'
import { UrlAction } from '../context/action-points-context'
import { ALL_ACTION_CHECKS } from '../config/action-checks'

interface UrlActionListProps {
  urls: string[]
  actionType: string
  actionColor: string
  onAddToActions: (selectedUrls: string[]) => void
  existingActions: UrlAction[]
}

export function UrlActionList({
  urls,
  actionType,
  actionColor,
  onAddToActions,
  existingActions,
}: UrlActionListProps) {
  const [rowSelection, setRowSelection] = useState({})

  const getActionInfo = (type: string) => {
    const [category, actionName] = type.split(': ')
    return ALL_ACTION_CHECKS.find(
      (check) => check.category === category && check.type === actionName,
    )
  }

  const columns: ColumnDef<string>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
    },
    {
      accessorFn: (url) => url,
      id: 'url',
      header: 'URL',
      cell: ({ row }) => {
        const url = row.original
        const existingActions = getExistingActions(url)
        return (
          <div className="space-y-1">
            <div className="font-mono text-sm">{url}</div>
            {existingActions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {existingActions.map((action) => {
                  const actionInfo = getActionInfo(action.type)
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
            )}
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: urls,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  })

  function getExistingActions(url: string) {
    const urlAction = existingActions.find((a) => a.url === url)
    return urlAction?.actions || []
  }

  function handleAddToActions() {
    const selectedUrls = Object.keys(rowSelection)
      .map((index) => urls[parseInt(index)])
      .filter((url): url is string => url !== undefined)
    onAddToActions(selectedUrls)
    setRowSelection({})
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-x-2">
            <span className="text-sm text-muted-foreground">
              {Object.keys(rowSelection).length} selected
            </span>
            <Badge variant="outline" className={actionColor}>
              Will add: {actionType}
            </Badge>
          </div>
          <Button
            onClick={handleAddToActions}
            disabled={Object.keys(rowSelection).length === 0}
          >
            Add to Action Points
          </Button>
        </div>
        <ScrollArea className="h-[400px]">
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
      </div>
    </TooltipProvider>
  )
}
