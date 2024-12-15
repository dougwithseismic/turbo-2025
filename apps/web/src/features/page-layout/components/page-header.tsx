'use client'

import { ChevronLeft } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface PageHeaderProps {
  items: BreadcrumbItem[]
  title?: string
  actions?: React.ReactNode
}

export const PageHeader = ({ items, title, actions }: PageHeaderProps) => {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <nav aria-label="Back" className="sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link href={items[items.length - 2]?.href ?? '#'}>
                <ChevronLeft className="-ml-1 mr-1 size-4 shrink-0" />
                Back
              </Link>
            </Button>
          </nav>
          <Breadcrumb className="hidden sm:flex">
            <BreadcrumbList>
              {items.map((item, index) => (
                <BreadcrumbItem key={item.label}>
                  {item.current ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.href ?? '#'}>{item.label}</Link>
                    </BreadcrumbLink>
                  )}
                  {index < items.length - 1 && <BreadcrumbSeparator />}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
      {(title || actions) && (
        <div className="flex flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between">
          {title && (
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h2>
            </div>
          )}
          {actions && (
            <div className="flex shrink-0 gap-3 md:ml-4 md:mt-0">{actions}</div>
          )}
        </div>
      )}
    </header>
  )
}
