import { ArticleList } from '@/features/home/components/article-list'
import { CTASection } from '@/features/home/components/cta-section'
import { FeaturesGrid } from '@/features/home/components/features-grid'
import { HeroSection } from '@/features/home/components/hero-section'
import { LogoCloud } from '@/features/home/components/logo-cloud'
import { PricingSection } from '@/features/home/components/pricing-section'
import { SecondaryFeatures } from '@/features/home/components/secondary-features'
import { TestimonialsSection } from '@/features/home/components/testimonials-section'

export default function Page() {
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
  )
}
