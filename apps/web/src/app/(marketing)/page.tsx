'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  HeroSection,
  FeaturesGrid,
  StatsSection,
  TestimonialsSection,
  MarketingFooter,
  ArticleList,
  NewsletterSignup,
  MarketingFooterLinks,
  ContactSection,
  PricingSection,
  LogoCloud,
  SecondaryFeatures,
  CTASection,
  NavMenu,
  FooterCTA,
} from '@/features/home/components';
import { useAuth } from '@/features/auth/hooks/use-auth';
import Link from 'next/link';
import { navigation } from '@/features/home/components/nav-menu';

export default function Page() {
  const { user } = useAuth();

  return (
    <div className="bg-background">
      <main>
        <HeroSection />
        <LogoCloud />
        <FeaturesGrid />
        <SecondaryFeatures />
        <TestimonialsSection />
        <CTASection />
        <PricingSection />
        <ArticleList />
      </main>
    </div>
  );
}
