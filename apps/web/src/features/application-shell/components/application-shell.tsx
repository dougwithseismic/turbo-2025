'use client'

import * as React from 'react'
import { Shell } from './shell'

interface ApplicationShellProps {
  children: React.ReactNode
}

export function ApplicationShell({ children }: ApplicationShellProps) {
  return (
    <Shell>
      <div className="flex h-full flex-col">
        {/* <SiteHeader /> */}
        <div className="flex-1 overflow-auto">
          <div className="container py-6">{children}</div>
        </div>
      </div>
    </Shell>
  )
}
