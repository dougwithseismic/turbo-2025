import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { supabaseClient } from '@/lib/supabase/client'
import {
  useDeleteSite,
  useGetProjectSites,
  useUpdateSite,
  type Site,
  type Json,
} from '@repo/supabase'
import { formatDistanceToNow } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, Link2 } from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SiteEditForm } from './site-edit-form'
import { useToast } from '@/components/ui/use-toast'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { GoogleAnalyticsDialog } from './google-analytics-dialog'
import { GoogleSearchConsoleDialog } from './google-search-console-dialog'

type SiteListProps = {
  projectId: string
  selectedSiteId?: string
  onSiteSelect: (siteId: string) => void
}

type ConnectionType = 'gsc' | 'ga'

const TruncatedCell = ({ content }: { content: string }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="truncate max-w-[200px]">{content}</div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-mono text-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function SiteList({
  projectId,
  selectedSiteId,
  onSiteSelect,
}: SiteListProps) {
  const { data: sites, isLoading } = useGetProjectSites({
    supabase: supabaseClient,
    projectId,
  })
  const [siteToDelete, setSiteToDelete] = useState<string>()
  const [siteToEdit, setSiteToEdit] = useState<string>()
  const [siteToConnect, setSiteToConnect] = useState<{
    id: string
    type: ConnectionType
  }>()
  const { toast } = useToast()

  const { mutate: deleteSite } = useDeleteSite({
    supabase: supabaseClient,
  })

  const { mutate: updateSite } = useUpdateSite({
    supabase: supabaseClient,
  })

  const handleDelete = () => {
    if (siteToDelete) {
      deleteSite(
        {
          siteId: siteToDelete,
          projectId,
        },
        {
          onSuccess: () => {
            setSiteToDelete(undefined)
            if (selectedSiteId === siteToDelete) {
              onSiteSelect('')
            }
          },
        },
      )
    }
  }

  const handleConnect = (
    site: Site,
    propertyId: string,
    type: ConnectionType,
  ) => {
    const currentSettings = (site.settings as Record<string, unknown>) || {}
    const propertyKey = type === 'gsc' ? 'gsc_property_id' : 'ga_property_id'
    const propertyName =
      type === 'gsc' ? 'Google Search Console' : 'Google Analytics'

    updateSite(
      {
        siteId: site.id,
        updates: {
          settings: {
            ...currentSettings,
            [propertyKey]: propertyId,
          } as Json,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: `Successfully connected ${propertyName}`,
          })
          setSiteToConnect(undefined)
        },
        onError: () => {
          toast({
            title: 'Error',
            description: `Failed to connect ${propertyName}`,
            variant: 'destructive',
          })
        },
      },
    )
  }

  const renderConnectionCell = (site: Site, type: ConnectionType) => {
    const settings = site.settings as Record<string, unknown>
    const propertyId =
      type === 'gsc' ? settings?.gsc_property_id : settings?.ga_property_id
    const propertyName = type === 'gsc' ? 'GSC' : 'GA'

    if (propertyId) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className="font-mono text-xs max-w-[200px] truncate"
              >
                {propertyId as string}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-mono text-xs">{propertyId as string}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          setSiteToConnect({ id: site.id, type })
        }}
      >
        Connect {propertyName}
      </Button>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  if (!sites?.length) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        No sites found. Please add a site to your project first.
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Domain</TableHead>
            <TableHead>Last Crawl</TableHead>
            <TableHead>Crawl Frequency</TableHead>
            <TableHead>Sitemap</TableHead>
            <TableHead>GSC Connected</TableHead>
            <TableHead>GA Connected</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sites.map((site) => (
            <TableRow
              key={site.id}
              className={cn(
                'cursor-pointer whitespace-nowrap',
                selectedSiteId === site.id && 'bg-muted',
              )}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('.site-actions')) return
                onSiteSelect(site.id)
              }}
            >
              <TableCell className="font-medium">
                <TruncatedCell content={site.domain} />
              </TableCell>
              <TableCell>
                {site.last_crawl_at ? (
                  formatDistanceToNow(new Date(site.last_crawl_at), {
                    addSuffix: true,
                  })
                ) : (
                  <span className="text-muted-foreground">Never</span>
                )}
              </TableCell>
              <TableCell>
                {typeof site.crawl_frequency === 'string'
                  ? site.crawl_frequency
                  : '7 days'}
              </TableCell>
              <TableCell>
                {site.sitemap_url ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className="font-mono text-xs max-w-[200px] truncate"
                        >
                          {site.sitemap_url}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-mono text-xs">{site.sitemap_url}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Badge variant="secondary">Not Set</Badge>
                )}
              </TableCell>
              <TableCell>{renderConnectionCell(site, 'gsc')}</TableCell>
              <TableCell>{renderConnectionCell(site, 'ga')}</TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(site.created_at), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
                <div className="site-actions">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSiteToEdit(site.id)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit site
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setSiteToConnect({ id: site.id, type: 'gsc' })
                        }
                      >
                        <Link2 className="mr-2 h-4 w-4" />
                        Connect GSC
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setSiteToConnect({ id: site.id, type: 'ga' })
                        }
                      >
                        <Link2 className="mr-2 h-4 w-4" />
                        Connect GA
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setSiteToDelete(site.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete site
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={!!siteToDelete}
        onOpenChange={() => setSiteToDelete(undefined)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              site and all associated crawl data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSiteToDelete(undefined)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Site
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {siteToEdit && (
        <SiteEditForm
          siteId={siteToEdit}
          open={!!siteToEdit}
          onOpenChange={() => setSiteToEdit(undefined)}
        />
      )}

      {siteToConnect && (
        <>
          {siteToConnect.type === 'ga' ? (
            <GoogleAnalyticsDialog
              open={!!siteToConnect}
              onOpenChange={() => setSiteToConnect(undefined)}
              onConnect={(propertyId) => {
                const site = sites?.find((s) => s.id === siteToConnect.id)
                if (site) {
                  handleConnect(site, propertyId, 'ga')
                }
              }}
            />
          ) : (
            <GoogleSearchConsoleDialog
              open={!!siteToConnect}
              onOpenChange={() => setSiteToConnect(undefined)}
              onConnect={(propertyId) => {
                const site = sites?.find((s) => s.id === siteToConnect.id)
                if (site) {
                  handleConnect(site, propertyId, 'gsc')
                }
              }}
            />
          )}
        </>
      )}
    </>
  )
}
