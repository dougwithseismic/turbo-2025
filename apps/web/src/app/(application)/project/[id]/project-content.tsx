'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/features/page-layout/components/page-header'
import { Card } from '@/components/ui/card'
import { supabaseClient } from '@/lib/supabase/client'
import { useGetProjectSites } from '@repo/supabase'
import { Plus, Settings } from 'lucide-react'
import Link from 'next/link'
import { CrawlForm } from '@/features/crawl/components/crawl-form'
import { CrawlJobList } from '@/features/crawl/components/crawl-job-list'
import { CrawlJobDetails } from '@/features/crawl/components/crawl-job-details'
import { SiteList } from '@/features/crawl/components/site-list'
import { SiteForm } from '@/features/crawl/components/site-form'

interface ProjectContentProps {
  projectId: string
  jobId?: string
  projectName: string
}

export function ProjectContent({
  projectId,
  jobId,
  projectName,
}: ProjectContentProps) {
  const [selectedSiteId, setSelectedSiteId] = useState<string>()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSiteFormOpen, setIsSiteFormOpen] = useState(false)

  const { data: sites = [], isLoading: isLoadingSites } = useGetProjectSites({
    supabase: supabaseClient,
    projectId,
  })

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: projectName, href: `/project/${projectId}` },
  ]

  const pageActions = [
    <Button key="add-site" onClick={() => setIsSiteFormOpen(true)}>
      <Plus className="mr-2 h-4 w-4" />
      Add Site
    </Button>,
    <Button key="settings" variant="outline" asChild>
      <Link href={`/project/${projectId}/settings`}>
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </Link>
    </Button>,
  ]

  return (
    <>
      <PageHeader items={breadcrumbItems} actions={pageActions} />
      <div className="space-y-6 p-4">
        {isLoadingSites ? (
          <Card className="p-6">
            <div className="h-24 animate-pulse bg-muted rounded-lg" />
          </Card>
        ) : !sites.length ? (
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <h2 className="text-lg font-semibold">No Sites Found</h2>
              <p className="text-sm text-muted-foreground">
                Add your first site to start crawling and monitoring.
              </p>
              <Button onClick={() => setIsSiteFormOpen(true)}>Add Site</Button>
            </div>
          </Card>
        ) : (
          <>
            <Card className="p-6">
              <div className="space-y-6">
                <SiteList
                  projectId={projectId}
                  selectedSiteId={selectedSiteId}
                  onSiteSelect={setSelectedSiteId}
                />
              </div>
            </Card>

            {selectedSiteId && (
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Crawl Jobs</h2>
                    <Button onClick={() => setIsFormOpen(true)}>
                      Start New Crawl
                    </Button>
                  </div>

                  {jobId ? (
                    <CrawlJobDetails jobId={jobId} siteId={selectedSiteId} />
                  ) : (
                    <CrawlJobList siteId={selectedSiteId} />
                  )}
                </div>
              </Card>
            )}
          </>
        )}

        {selectedSiteId && (
          <CrawlForm
            siteId={selectedSiteId}
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
          />
        )}
        <SiteForm
          projectId={projectId}
          open={isSiteFormOpen}
          onOpenChange={setIsSiteFormOpen}
        />
      </div>
    </>
  )
}
