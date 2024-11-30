import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

interface ApplicationLayoutProps {
  children: React.ReactNode
}

const ApplicationLayout = ({ children }: ApplicationLayoutProps) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}

export default ApplicationLayout
