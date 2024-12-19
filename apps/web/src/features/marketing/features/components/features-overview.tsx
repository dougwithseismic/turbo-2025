import {
  Search,
  Link2,
  FileSearch,
  BarChart2,
  ScrollText,
  InfinityIcon,
  ArrowUpRight,
  Zap,
  LineChart,
  Globe2,
  Bell,
  Gauge,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Feature = {
  name: string
  description: string
  icon: typeof Search
  benefits: string[]
  href: string
  category: 'technical' | 'content' | 'monitoring' | 'research'
}

const features: Feature[] = [
  {
    name: 'Technical SEO Audits',
    description:
      'Comprehensive technical analysis of your site structure, performance, and crawlability. Identify and fix critical issues that are holding back your rankings.',
    icon: FileSearch,
    benefits: [
      'Core Web Vitals analysis',
      'Mobile optimization checks',
      'Site structure analysis',
      'Performance monitoring',
    ],
    href: '/features/technical-audits',
    category: 'technical',
  },
  {
    name: 'Site Crawling',
    description:
      'Advanced crawling engine that identifies technical issues, broken links, and crawlability problems before they impact your search rankings.',
    icon: InfinityIcon,
    benefits: [
      'JavaScript rendering',
      'Mobile-first checks',
      'Crawl optimization',
      'Error detection',
    ],
    href: '/features/site-crawling',
    category: 'technical',
  },
  {
    name: 'Performance Monitoring',
    description:
      'Real-time monitoring of your site performance metrics and Core Web Vitals. Get instant alerts when issues arise.',
    icon: Gauge,
    benefits: [
      'Real-time monitoring',
      'Custom alerts',
      'Trend analysis',
      'Issue prioritization',
    ],
    href: '/features/performance',
    category: 'technical',
  },
  {
    name: 'Keyword Research',
    description:
      'Discover high-impact keywords your audience is searching for, with detailed metrics on search volume, competition, and ranking potential.',
    icon: BarChart2,
    benefits: [
      'Search intent analysis',
      'Competition metrics',
      'ROI forecasting',
      'Trend tracking',
    ],
    href: '/features/keyword-research',
    category: 'research',
  },
  {
    name: 'Rank Tracking',
    description:
      'Track your search rankings across multiple locations and devices. Monitor your progress and identify opportunities for improvement.',
    icon: LineChart,
    benefits: [
      'Daily rank updates',
      'Local tracking',
      'Mobile rankings',
      'SERP features',
    ],
    href: '/features/rank-tracking',
    category: 'monitoring',
  },
  {
    name: 'Content Optimization',
    description:
      'AI-powered content analysis and optimization suggestions. Improve your content relevance and readability for better rankings.',
    icon: ScrollText,
    benefits: [
      'Topic clustering',
      'Content scoring',
      'Semantic analysis',
      'Readability checks',
    ],
    href: '/features/content-optimization',
    category: 'content',
  },
  {
    name: 'Backlink Analysis',
    description:
      'Monitor and analyze your backlink profile, identify toxic links, and find new link-building opportunities to boost your domain authority.',
    icon: Link2,
    benefits: [
      'Link quality scoring',
      'Toxic link detection',
      'Outreach suggestions',
      'Competitor analysis',
    ],
    href: '/features/backlink-analysis',
    category: 'research',
  },
  {
    name: 'SERP Analysis',
    description:
      'Analyze search results to understand what it takes to rank. Identify patterns and opportunities in top-ranking content.',
    icon: Search,
    benefits: [
      'SERP feature tracking',
      'Competitor analysis',
      'Content gaps',
      'Ranking factors',
    ],
    href: '/features/serp-analysis',
    category: 'research',
  },
  {
    name: 'International SEO',
    description:
      'Tools for managing multilingual and multi-regional SEO campaigns. Ensure your global presence is properly optimized.',
    icon: Globe2,
    benefits: [
      'Hreflang validation',
      'Market analysis',
      'Language targeting',
      'Regional tracking',
    ],
    href: '/features/international-seo',
    category: 'technical',
  },
  {
    name: 'Real-time Alerts',
    description:
      'Stay informed about critical changes and issues. Get instant notifications when something needs your attention.',
    icon: Bell,
    benefits: [
      'Ranking changes',
      'Technical issues',
      'Backlink updates',
      'Custom alerts',
    ],
    href: '/features/alerts',
    category: 'monitoring',
  },
  {
    name: 'Site Speed Optimization',
    description:
      'Identify and fix performance bottlenecks. Improve your Core Web Vitals and overall user experience.',
    icon: Zap,
    benefits: [
      'Performance scoring',
      'Optimization tips',
      'Resource analysis',
      'Speed monitoring',
    ],
    href: '/features/site-speed',
    category: 'technical',
  },
]

const categories = {
  technical: {
    name: 'Technical SEO',
    description: 'Tools for optimizing your site technical foundation',
  },
  content: {
    name: 'Content Optimization',
    description: 'Improve your content relevance and readability',
  },
  monitoring: {
    name: 'Monitoring & Alerts',
    description: 'Track your progress and stay informed',
  },
  research: {
    name: 'Research & Analysis',
    description: 'Discover opportunities and analyze competition',
  },
}

export const FeaturesOverview = () => {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Features Grid */}
        {Object.entries(categories).map(([key, category]) => (
          <div key={key} className="mb-24 last:mb-0">
            <div className="mx-auto max-w-2xl lg:mx-0">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {category.name}
              </h2>
              <p className="mt-2 text-lg text-muted-foreground">
                {category.description}
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
              {features
                .filter((feature) => feature.category === key)
                .map((feature) => (
                  <div
                    key={feature.name}
                    className="relative flex flex-col overflow-hidden rounded-2xl bg-muted/50 p-8"
                  >
                    {/* Icon */}
                    <div className="mb-6 flex size-12 items-center justify-center rounded-lg bg-primary">
                      <feature.icon
                        className="size-6 text-primary-foreground"
                        aria-hidden="true"
                      />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-medium tracking-tight">
                      {feature.name}
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
                        href={feature.href}
                        className={cn(
                          'inline-flex items-center gap-2 text-sm font-semibold',
                          'text-primary hover:text-primary/90',
                        )}
                      >
                        Learn more
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
