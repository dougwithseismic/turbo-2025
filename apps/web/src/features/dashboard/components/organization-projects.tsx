'use client'

import { Card } from '@/components/ui/card'
import { useGetUserOrganizations, useGetUserProjects } from '@repo/supabase'
import { supabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { PlusIcon, BuildingIcon, FolderIcon } from 'lucide-react'

function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon: Icon,
}: {
  title: string
  description: string
  actionLabel: string
  actionHref: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card className="p-6">
      <div className="text-center">
        <Icon className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href={actionHref}>
            <PlusIcon className="mr-2 h-4 w-4" />
            {actionLabel}
          </Link>
        </Button>
      </div>
    </Card>
  )
}

function OrganizationProjectsContent() {
  const { data: organizations, isLoading: isLoadingOrgs } =
    useGetUserOrganizations({
      supabase: supabaseClient,
    })
  const { data: projects, isLoading: isLoadingProjects } = useGetUserProjects({
    supabase: supabaseClient,
  })

  const isLoading = isLoadingOrgs || isLoadingProjects

  if (isLoading) {
    return (
      <div className="grid gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse bg-muted/50">
            <div className="h-6 w-48 bg-muted rounded" />
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-32 bg-muted rounded" />
              ))}
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (!organizations?.length) {
    return (
      <EmptyState
        title="No Organizations"
        description="Create your first organization to get started"
        actionLabel="Create Organization"
        actionHref="/org/new"
        icon={BuildingIcon}
      />
    )
  }

  return (
    <div className="grid gap-6">
      {organizations.map((org) => {
        const orgProjects = projects?.filter(
          (project) => project.organization_id === org.id,
        )

        return (
          <Card key={org.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Link
                href={`/org/${org.id}`}
                className="text-lg font-semibold hover:text-primary transition-colors"
              >
                {org.name}
              </Link>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/project/new?org=${org.id}`}>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  New Project
                </Link>
              </Button>
            </div>
            {orgProjects?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orgProjects.map((project) => (
                  <Link key={project.id} href={`/project/${project.id}`}>
                    <Card className="p-4 hover:bg-muted/50 transition-colors">
                      <h3 className="font-medium">{project.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {project.client_name || 'No client'}
                      </p>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Projects"
                description="Create your first project in this organization"
                actionLabel="New Project"
                actionHref={`/project/new?org=${org.id}`}
                icon={FolderIcon}
              />
            )}
          </Card>
        )
      })}
    </div>
  )
}

export function OrganizationProjects() {
  return (
    <Suspense
      fallback={
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse bg-muted/50">
              <div className="h-6 w-48 bg-muted rounded" />
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-32 bg-muted rounded" />
                ))}
              </div>
            </Card>
          ))}
        </div>
      }
    >
      <OrganizationProjectsContent />
    </Suspense>
  )
}
