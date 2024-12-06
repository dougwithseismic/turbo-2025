'use client';

import { ReactNode } from 'react';
import { NavMenu } from '@/features/home/components/nav-menu';
import { MarketingFooterLinks } from '@/features/home/components/marketing-footer-links';
import { FooterCTA } from '@/features/home/components/footer-cta';
import { MarketingFooter } from '@/features/home/components';

type MarketingLayoutProps = {
  children: ReactNode;
};

const MarketingLayout = ({ children }: MarketingLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="w-full flex items-center justify-center p-6 lg:px-8">
        <NavMenu />
      </nav>
      {children}
      <FooterCTA />
      <MarketingFooterLinks />
      <MarketingFooter />
    </div>
  );
};

export default MarketingLayout;
