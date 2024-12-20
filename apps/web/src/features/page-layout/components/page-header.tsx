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
      {(title || actions) && (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {title && (
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h2>
            </div>
          )}
          {actions && <div className="flex shrink-0 gap-3">{actions}</div>}
        </div>
      )}
    </header>
  )
}
