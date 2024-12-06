'use client';

import { ReactNode } from 'react';
import { NavMenu } from '@/features/home/components/nav-menu';
import { MarketingFooterLinks } from '@/features/home/components/marketing-footer-links';
import { FooterCTA } from '@/features/home/components/footer-cta';
import { Header, MarketingFooter } from '@/features/home/components';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type NavigationButtonProps = {
  href: string;
  children: string;
};

const useNavigationState = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  const handleNavigation = (path: string) => {
    setIsNavigating(true);
    router.push(path);
  };

  return { isNavigating, handleNavigation };
};

const NavigationButton = ({ href, children }: NavigationButtonProps) => {
  const { isNavigating, handleNavigation } = useNavigationState();

  return (
    <Button
      onClick={() => handleNavigation(href)}
      className="w-full"
      variant="secondary"
      disabled={isNavigating}
    >
      {isNavigating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          On the way...
        </>
      ) : (
        children
      )}
    </Button>
  );
};

type MarketingLayoutProps = {
  children: ReactNode;
};

const MarketingLayout = ({ children }: MarketingLayoutProps) => {
  const { user, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto">
        <Header />
      </div>
      {children}
      <FooterCTA />
      <MarketingFooterLinks />
      <MarketingFooter />
    </div>
  );
};

export default MarketingLayout;
