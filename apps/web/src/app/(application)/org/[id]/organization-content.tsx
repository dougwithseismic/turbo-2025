'use client'

import { Card } from '@/components/ui/card'
import { useGetOrganizationProjects } from '@repo/supabase'
import { supabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, FolderIcon } from 'lucide-react'

function EmptyState() {
  return (
    <Card className="p-6">
      <div className="text-center">
        <FolderIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No Projects</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first project to get started with monitoring and
          analytics.
        </p>
      </div>
    </Card>
  )
}

interface OrganizationContentProps {
  organizationId: string
}

export function OrganizationContent({
  organizationId,
}: OrganizationContentProps) {
  const { data: projects = [], isLoading } = useGetOrganizationProjects({
    supabase: supabaseClient,
    organizationId,
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse bg-muted/50">
            <div className="h-6 w-48 bg-muted rounded" />
            <div className="mt-2 h-4 w-32 bg-muted rounded" />
          </Card>
        ))}
      </div>
    )
  }

  if (!projects.length) {
    return <EmptyState />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <Link key={project.id} href={`/project/${project.id}`}>
          <Card className="p-6 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{project.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {project.client_name || 'No client'}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}
