import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/features/theme/components/theme-toggle';
import { protectedRoute } from '@/lib/auth';

interface ApplicationLayoutProps {
  children: React.ReactNode;
}

const ApplicationLayout = async ({ children }: ApplicationLayoutProps) => {
  const user = await protectedRoute();

  return (
    <SidebarProvider>
      <ThemeToggle />
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
};

export default ApplicationLayout;
