import {
  Search,
  Link2,
  FileSearch,
  BarChart2,
  ScrollText,
  InfinityIcon,
  ArrowUpRight,
} from 'lucide-react'

type SecondaryFeature = {
  name: string
  description: string
  icon: typeof Search
  benefits: string[]
  learnMoreLink?: string
}

const secondaryFeatures: SecondaryFeature[] = [
  {
    name: 'Onsite Analysis',
    description:
      'Get instant insights into your on-page SEO elements. Our AI analyzes your content structure, meta tags, and internal linking to identify quick wins.',
    icon: Search,
    benefits: [
      'Schema markup validation',
      'Meta tag optimization',
      'Content structure analysis',
      'Internal linking suggestions',
    ],
    learnMoreLink: '/features/onsite-analysis',
  },
  {
    name: 'Keyword Research',
    description:
      'Uncover high-ROI keyword opportunities with our AI-powered research tool. Get detailed metrics on search volume, competition, and ranking potential.',
    icon: BarChart2,
    benefits: [
      'Search intent analysis',
      'Difficulty scoring',
      'ROI predictions',
      'Seasonal trends',
    ],
    learnMoreLink: '/features/keyword-research',
  },
  {
    name: 'Backlink Analysis',
    description:
      'Build a stronger link profile with our comprehensive backlink tools. Monitor your domain authority and find new link-building opportunities.',
    icon: Link2,
    benefits: [
      'Link quality scoring',
      'Competitor analysis',
      'Outreach suggestions',
      'Authority tracking',
    ],
    learnMoreLink: '/features/backlink-analysis',
  },
  {
    name: 'Site Crawling',
    description:
      'Catch technical issues before they impact your rankings. Our advanced crawler identifies problems with indexing, performance, and site structure.',
    icon: InfinityIcon,
    benefits: [
      'JavaScript rendering',
      'Mobile optimization',
      'Speed analysis',
      'Crawl budget optimization',
    ],
    learnMoreLink: '/features/site-crawling',
  },
  {
    name: 'Technical Audits',
    description:
      'Get actionable insights to improve your technical SEO. Our automated audits identify and prioritize issues based on their impact on rankings.',
    icon: FileSearch,
    benefits: [
      'Core Web Vitals',
      'Mobile-first checks',
      'Security analysis',
      'Performance scoring',
    ],
    learnMoreLink: '/features/technical-audits',
  },
  {
    name: 'Content Analysis',
    description:
      'Optimize your content for better rankings with AI-powered suggestions. Get recommendations for improving readability, relevance, and topical coverage.',
    icon: ScrollText,
    benefits: [
      'Topic clustering',
      'Content gaps',
      'Readability scores',
      'Semantic analysis',
    ],
    learnMoreLink: '/features/content-analysis',
  },
]

export const SecondaryFeatures = () => {
  return (
    <div className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">
              Every tool you need for complete SEO success
            </h2>
            <p className="mt-6 text-base/7 text-muted-foreground">
              Our comprehensive toolkit helps you optimize every aspect of your
              SEO strategy. From technical audits to content optimization, we've
              got you covered.
            </p>
            <div className="mt-8 flex gap-4">
              <a
                href="/features"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/90"
              >
                View all features
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
          <dl className="col-span-3 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2">
            {secondaryFeatures.map((feature) => (
              <div key={feature.name} className="relative">
                <dt className="text-base/7 font-semibold">
                  <div className="mb-6 flex size-10 items-center justify-center rounded-lg bg-primary">
                    <feature.icon
                      aria-hidden="true"
                      className="size-6 text-background"
                    />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-1 flex flex-col gap-6">
                  <p className="text-base/7 text-muted-foreground">
                    {feature.description}
                  </p>
                  <ul className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    {feature.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2">
                        <div className="size-1 rounded-full bg-primary" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  {feature.learnMoreLink && (
                    <a
                      href={feature.learnMoreLink}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/90"
                    >
                      Learn more
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
