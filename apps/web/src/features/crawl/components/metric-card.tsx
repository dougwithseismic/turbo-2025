'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InfoTooltip, TooltipProvider } from '@/components/ui/tooltip'
import { RealMockData } from '../utils/real-data'
import { UrlActionList } from './url-action-list'
import { useActionPoints } from '../context/action-points-context'
import { ACTION_COLORS } from '../hooks/use-auto-action-points'

interface MetricCardProps {
  title: string
  metrics: Array<{
    label: string
    value: number | string
    urls?: string[]
    suffix?: string
    description?: string
    reasoning?: string
  }>
}

export function MetricCard({ title, metrics }: MetricCardProps) {
  const [selectedMetric, setSelectedMetric] = useState<{
    label: string
    value: number | string
    urls?: string[]
    suffix?: string
  } | null>(null)
  const { state, dispatch } = useActionPoints()

  const handleAddToActions = (urls: string[]) => {
    if (selectedMetric) {
      dispatch({
        type: 'ADD_ACTIONS',
        payload: {
          urls,
          actionType: `${title}: ${selectedMetric.label}`,
          color:
            ACTION_COLORS[title.split(':')[0] as keyof typeof ACTION_COLORS] ||
            ACTION_COLORS.SEO,
        },
      })
    }
  }

  return (
    <TooltipProvider>
      <Card className="p-4">
        <h3 className="mb-4 text-lg font-semibold">{title}</h3>
        <Table>
          <TableBody>
            {metrics.map((metric) => (
              <TableRow
                key={metric.label}
                className={
                  metric.urls && metric.urls.length > 0
                    ? 'cursor-pointer hover:bg-muted'
                    : ''
                }
                onClick={() =>
                  metric.urls &&
                  metric.urls.length > 0 &&
                  setSelectedMetric(metric)
                }
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {metric.label}
                    {(metric.description || metric.reasoning) && (
                      <InfoTooltip
                        content={
                          <div className="space-y-2">
                            {metric.description && <p>{metric.description}</p>}
                            {metric.reasoning && (
                              <p className="text-muted-foreground">
                                {metric.reasoning}
                              </p>
                            )}
                          </div>
                        }
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {metric.value}
                  {metric.suffix}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog
        open={!!selectedMetric}
        onOpenChange={() => setSelectedMetric(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedMetric?.label}: {selectedMetric?.value}
              {selectedMetric?.suffix}
            </DialogTitle>
          </DialogHeader>
          {selectedMetric?.urls && (
            <UrlActionList
              urls={selectedMetric.urls}
              actionType={`${title}: ${selectedMetric.label}`}
              actionColor={
                ACTION_COLORS[
                  title.split(':')[0] as keyof typeof ACTION_COLORS
                ] || ACTION_COLORS.SEO
              }
              onAddToActions={handleAddToActions}
              existingActions={state.urlActions}
            />
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}

// Helper function to extract URLs based on a condition
export function getUrlsByCondition(
  data: RealMockData,
  condition: (page: RealMockData['pages'][0]) => boolean,
): string[] {
  return data.pages.filter(condition).map((page) => page.url)
}
