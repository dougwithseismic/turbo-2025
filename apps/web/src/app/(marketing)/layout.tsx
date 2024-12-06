import { Header, MarketingFooter } from '@/features/home/components';
import { FooterCTA } from '@/features/home/components/footer-cta';
import { MarketingFooterLinks } from '@/features/home/components/marketing-footer-links';
import { ReactNode } from 'react';

type MarketingLayoutProps = {
  children: ReactNode;
};

const MarketingLayout = ({ children }: MarketingLayoutProps) => {
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
