import { ArrowUpRight } from 'lucide-react'

type Feature = {
  title: string
  description: string
  benefits: string[]
  learnMoreLink: string
}

const features: Feature[] = [
  {
    title: 'Site Crawling & Analysis',
    description:
      'Deep crawl analysis to identify technical issues and opportunities for improvement across your entire site.',
    benefits: [
      'Daily automated crawls',
      'JavaScript rendering',
      'Mobile optimization',
      'Performance insights',
    ],
    learnMoreLink: '/features/site-crawling',
  },
  {
    title: 'Keyword Intelligence',
    description:
      'Advanced keyword research and tracking to identify high-value ranking opportunities.',
    benefits: [
      'Search intent analysis',
      'Competition scoring',
      'ROI forecasting',
      'Rank tracking',
    ],
    learnMoreLink: '/features/keyword-research',
  },
  {
    title: 'Content Analysis',
    description:
      'AI-powered content optimization and gap analysis to improve your content strategy.',
    benefits: [
      'Topic clustering',
      'Content scoring',
      'Semantic analysis',
      'Competitor insights',
    ],
    learnMoreLink: '/features/content-analysis',
  },
  {
    title: 'Technical Audits',
    description:
      'Comprehensive technical analysis to identify and fix critical issues affecting your search performance.',
    benefits: [
      'Core Web Vitals',
      'Mobile-first checks',
      'Security analysis',
      'Performance scoring',
    ],
    learnMoreLink: '/features/technical-audits',
  },
]

export const FeaturesGrid = () => {
  return (
    <div className="bg-muted/5 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base/7 font-semibold text-primary">
            Powerful Features
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-balance text-center text-4xl font-semibold tracking-tight sm:text-5xl">
            Everything you need to rank better
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Our comprehensive platform helps you identify and fix technical SEO
            issues, track your rankings, and optimize your content for better
            search performance.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="relative flex flex-col overflow-hidden rounded-2xl bg-background p-8"
            >
              <h3 className="text-lg font-medium tracking-tight">
                {feature.title}
              </h3>
              <p className="mt-2 text-base/7 text-muted-foreground">
                {feature.description}
              </p>

              {/* Benefits */}
              <ul className="mt-8 grid grid-cols-1 gap-4 text-sm text-muted-foreground sm:grid-cols-2">
                {feature.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <div className="size-1.5 rounded-full bg-primary" />
                    {benefit}
                  </li>
                ))}
              </ul>

              {/* Learn More Link */}
              <div className="mt-8">
                <a
                  href={feature.learnMoreLink}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/90"
                >
                  Learn more
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features Link */}
        <div className="mt-16 flex justify-center">
          <a
            href="/features"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90"
          >
            View all features
            <ArrowUpRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  )
}
