import { Search, LineChart, Link2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type PrimaryFeature = {
  name: string
  description: string
  href: string
  icon: typeof Search
  metrics?: {
    value: string
    label: string
  }
  benefits: string[]
}

const primaryFeatures: PrimaryFeature[] = [
  {
    name: 'Technical SEO Audits',
    description:
      'Catch critical technical issues before they impact your rankings. Our automated audits scan your site every day, identifying problems that could hurt your SEO.',
    href: '/features/technical-audits',
    icon: Search,
    metrics: {
      value: '85%',
      label: 'of issues found in first scan',
    },
    benefits: [
      'Daily automated scans',
      'Real-time issue alerts',
      'Prioritized fixes',
      'Impact assessment',
    ],
  },
  {
    name: 'Keyword Intelligence',
    description:
      'Stop guessing which keywords matter. Our AI-powered research identifies high-ROI opportunities and tracks your progress to the top of search results.',
    href: '/features/keyword-research',
    icon: LineChart,
    metrics: {
      value: '2.5x',
      label: 'average traffic increase',
    },
    benefits: [
      'AI opportunity finder',
      'Competitor tracking',
      'Search intent analysis',
      'ROI forecasting',
    ],
  },
  {
    name: 'Backlink Analysis',
    description:
      'Build a stronger link profile with data-driven insights. Identify toxic links, find new opportunities, and monitor your domain authority growth.',
    href: '/features/backlink-analysis',
    icon: Link2,
    metrics: {
      value: '+12pts',
      label: 'avg. DA improvement',
    },
    benefits: [
      'Toxic link detection',
      'Outreach opportunities',
      'Authority tracking',
      'Competitor analysis',
    ],
  },
]

export const PrimaryFeatures = () => {
  return (
    <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
      <div className="mx-auto max-w-2xl lg:text-center">
        <h2 className="text-base/7 font-semibold text-primary">
          Powerful SEO Tools
        </h2>
        <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight sm:text-5xl lg:text-balance">
          Everything you need to dominate search rankings
        </p>
        <p className="mt-6 text-lg/8 text-muted-foreground">
          Stop struggling with technical SEO. Our platform automates the complex
          stuff, so you can focus on what matters - growing your organic traffic
          and revenue.
        </p>
      </div>
      <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
          {primaryFeatures.map((feature) => (
            <div key={feature.name} className="flex flex-col">
              <dt className="text-base/7 font-semibold">
                <div className="mb-6 flex size-10 items-center justify-center rounded-lg bg-primary">
                  <feature.icon
                    aria-hidden="true"
                    className="size-6 text-primary-foreground"
                  />
                </div>
                {feature.name}
              </dt>
              <dd className="mt-1 flex flex-auto flex-col text-base/7">
                <p className="flex-auto text-muted-foreground">
                  {feature.description}
                </p>

                {/* Feature Benefits */}
                <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                  {feature.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      {benefit}
                    </li>
                  ))}
                </ul>

                {/* Metrics */}
                {feature.metrics && (
                  <div className="mt-6 border-t border-border pt-6">
                    <div className="text-2xl font-bold text-primary">
                      {feature.metrics.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {feature.metrics.label}
                    </div>
                  </div>
                )}

                <p className="mt-6">
                  <a
                    href={feature.href}
                    className={cn(
                      'text-sm/6 font-semibold text-primary hover:text-primary/90',
                      'flex items-center gap-1',
                    )}
                  >
                    Learn more <span aria-hidden="true">→</span>
                  </a>
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
