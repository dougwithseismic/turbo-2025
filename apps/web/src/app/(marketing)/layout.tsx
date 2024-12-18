import { Header, MarketingFooter } from '@/features/home/components'
import { FooterCTA } from '@/features/home/components/footer-cta'
import React from 'react'

const MarketingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto">
        <Header />
      </div>
      {children}
      <FooterCTA />
      <MarketingFooter />
    </div>
  )
}

export default MarketingLayout
