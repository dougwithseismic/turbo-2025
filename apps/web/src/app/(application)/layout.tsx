import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { ThemeToggle } from '@/features/theme/components/theme-toggle'

interface ApplicationLayoutProps {
  children: React.ReactNode
}

const ApplicationLayout = ({ children }: ApplicationLayoutProps) => {
  return (
    <SidebarProvider>
      <ThemeToggle />
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}

export default ApplicationLayout
