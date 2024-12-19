import { MarketingFooter } from '@/features/home/components/footer'
import { FooterCTA } from '@/features/home/components/footer-cta'
import { Header } from '@/features/home/components/header'
import React from 'react'

const MarketingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto md:mb-16">
        <Header />
      </div>
      {children}
      <FooterCTA />
      <MarketingFooter />
    </div>
  )
}

export default MarketingLayout
