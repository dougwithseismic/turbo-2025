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
    <header className="flex flex-col gap-4 border-b border-border min-h-[3.5rem] justify-center px-4 py-2 mt-8 sm:mt-0 sm:h-14">
      {(title || actions) && (
        <div className="flex gap-4 sm:flex-row items-end md:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 min-w-0 flex-1">
            {title && (
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                {title}
              </h2>
            )}
            <div className="overflow-x-auto">
              {items.length > 0 && (
                <Breadcrumb>
                  <BreadcrumbList>
                    {items.map((item, index) => (
                      <div
                        className={`flex items-center gap-2 ${index < items.length - 1 ? 'hidden sm:flex' : 'flex'}`}
                        key={item.label}
                      >
                        <BreadcrumbItem>
                          {item.current ? (
                            <BreadcrumbPage className="truncate max-w-[200px]">
                              {item.label}
                            </BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink asChild>
                              <Link
                                href={item.href || '#'}
                                className="truncate max-w-[200px]"
                              >
                                {item.label}
                              </Link>
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
            <div className="flex items-center shrink-0 gap-2 sm:gap-3">
              {actions}
            </div>
          )}
        </div>
      )}
    </header>
  )
}
