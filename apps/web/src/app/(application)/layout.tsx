import { ApplicationShell } from '@/features/application-shell'
import { protectedRoute } from '@/lib/auth'
import * as React from 'react'

interface ApplicationLayoutProps {
  children: React.ReactNode
}

const ApplicationLayout = async ({ children }: ApplicationLayoutProps) => {
  await protectedRoute()

  return <ApplicationShell>{children}</ApplicationShell>
}

export default ApplicationLayout
