'use client'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
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
    <header className="flex flex-col gap-4 border-b border-border h-14 justify-center px-4">
      {(title || actions) && (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-4 items-center min-w-0 flex-1">
            {title && (
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                {title}
              </h2>
            )}
            <div>
              {items.length > 0 && (
                <Breadcrumb>
                  <BreadcrumbList>
                    {items.map((item, index) => (
                      <div className="flex items-center gap-2" key={item.label}>
                        <BreadcrumbItem>
                          {item.current ? (
                            <BreadcrumbPage>{item.label}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink asChild>
                              <Link href={item.href || '#'}>{item.label}</Link>
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {index < items.length - 1 && <BreadcrumbSeparator />}
                      </div>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              )}
            </div>
          </div>

          {actions && (
            <div className="flex items-center shrink-0 gap-3">{actions}</div>
          )}
        </div>
      )}
    </header>
  )
}
