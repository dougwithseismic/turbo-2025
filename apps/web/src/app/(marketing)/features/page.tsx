import { Metadata } from 'next'
import { FeaturesOverview } from '@/features/features/components/features-overview'

export const metadata: Metadata = {
  title: 'Features - Complete SEO Platform',
  description:
    'Explore our comprehensive suite of SEO tools designed to help you improve your search rankings, analyze technical issues, and optimize your content.',
}

export default function FeaturesPage() {
  return (
    <main className="relative">
      {/* Page Header */}
      <div className="relative isolate overflow-hidden bg-background pt-24 lg:pt-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
              Everything you need for{' '}
              <span className="text-primary">complete SEO success</span>
            </h1>
            <p className="mt-6 text-lg/8 text-muted-foreground">
              Our comprehensive platform provides all the tools you need to
              improve your search rankings, from technical audits to content
              optimization and everything in between.
            </p>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <FeaturesOverview />
    </main>
  )
}
