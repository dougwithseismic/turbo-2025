import {
  Search,
  Link2,
  FileSearch,
  BarChart2,
  ScrollText,
  InfinityIcon,
} from 'lucide-react'

type SecondaryFeature = {
  name: string
  description: string
  icon: typeof Search
}

const secondaryFeatures: SecondaryFeature[] = [
  {
    name: 'Onsite Analysis',
    description:
      'Get comprehensive insights into your on-page SEO elements, from meta tags to content structure, ensuring your pages are fully optimized for search engines.',
    icon: Search,
  },
  {
    name: 'Keyword Research',
    description:
      'Discover high-impact keywords your audience is searching for, with detailed metrics on search volume, competition, and ranking potential.',
    icon: BarChart2,
  },
  {
    name: 'Backlink Analysis',
    description:
      'Monitor and analyze your backlink profile, identify toxic links, and find new link-building opportunities to boost your domain authority.',
    icon: Link2,
  },
  {
    name: 'Site Crawling',
    description:
      'Automatically detect technical issues, broken links, and crawlability problems before they impact your search rankings.',
    icon: InfinityIcon,
  },
  {
    name: 'Technical Audits',
    description:
      'Run deep technical SEO audits to identify and fix issues with site speed, mobile optimization, structured data, and more.',
    icon: FileSearch,
  },
  {
    name: 'Content Analysis',
    description:
      'Evaluate your content quality, readability, and topical relevance while getting actionable recommendations for improvement.',
    icon: ScrollText,
  },
]

export const SecondaryFeatures = () => {
  return (
    <div className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-5">
          <h2 className="col-span-2 text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">
            Everything you need to start ranking better
          </h2>
          <dl className="col-span-3 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2">
            {secondaryFeatures.map((feature) => (
              <div key={feature.name}>
                <dt className="text-base/7 font-semibold">
                  <div className="mb-6 flex size-10 items-center justify-center rounded-lg bg-primary">
                    <feature.icon
                      aria-hidden="true"
                      className="size-6 text-background"
                    />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-1 text-base/7 text-muted-foreground">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
