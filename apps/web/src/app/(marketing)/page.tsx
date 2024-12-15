import { useAuth } from '@/features/auth/hooks/use-auth'
import {
  ArticleList,
  CTASection,
  FeaturesGrid,
  HeroSection,
  LogoCloud,
  PricingSection,
  SecondaryFeatures,
  TestimonialsSection,
} from '@/features/home/components'

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
