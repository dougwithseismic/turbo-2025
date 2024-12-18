import { CheckCircle2, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type PricingTier = {
  name: string
  id: string
  href: string
  price: {
    monthly: string
    annually: string
    savings: string
  }
  description: string
  mostPopular: boolean
  features: Array<{
    text: string
    footnote?: string
  }>
}

const tiers: PricingTier[] = [
  {
    name: 'Starter',
    id: 'tier-starter',
    href: '/register?plan=starter',
    price: {
      monthly: '$49',
      annually: '$39',
      savings: 'Save $120/year',
    },
    description: 'Perfect for small sites and solo SEO consultants.',
    mostPopular: false,
    features: [
      { text: 'Weekly technical site audits' },
      {
        text: 'Track 100 keywords',
        footnote: 'Monitor rankings across multiple search engines',
      },
      { text: 'Core Web Vitals monitoring' },
      { text: 'Weekly crawl reports' },
      { text: 'Basic backlink analysis' },
      { text: 'Email support within 24h' },
      { text: 'Up to 10,000 pages crawled/month' },
      { text: '1 user included' },
    ],
  },
  {
    name: 'Professional',
    id: 'tier-professional',
    href: '/register?plan=professional',
    price: {
      monthly: '$149',
      annually: '$129',
      savings: 'Save $240/year',
    },
    description: 'Advanced features for growing sites and in-house SEO teams.',
    mostPopular: true,
    features: [
      { text: 'Daily technical site audits' },
      {
        text: 'Track 1,000 keywords',
        footnote: 'Including competitor rank tracking',
      },
      {
        text: 'Advanced Core Web Vitals',
        footnote: 'Including historical data and alerts',
      },
      { text: 'Daily crawl reports' },
      {
        text: 'Advanced backlink analysis',
        footnote: 'Including toxic link detection',
      },
      { text: 'Priority support within 4h' },
      { text: 'Up to 100,000 pages crawled/month' },
      { text: '5 users included' },
      { text: 'Content optimization suggestions' },
      { text: 'API access', footnote: '10,000 requests/month' },
    ],
  },
  {
    name: 'Enterprise',
    id: 'tier-enterprise',
    href: '/register?plan=enterprise',
    price: {
      monthly: '$499',
      annually: '$449',
      savings: 'Save $600/year',
    },
    description: 'Custom solutions for large sites and agencies.',
    mostPopular: false,
    features: [
      { text: 'Real-time technical audits' },
      { text: 'Unlimited keyword tracking' },
      {
        text: 'Enterprise Core Web Vitals',
        footnote: 'Including custom alerts and reporting',
      },
      { text: 'Custom crawl schedules' },
      {
        text: 'Enterprise backlink analysis',
        footnote: 'Including link building opportunities',
      },
      { text: '24/7 priority support' },
      { text: 'Unlimited pages crawled' },
      { text: 'Unlimited users' },
      { text: 'AI-powered content optimization' },
      { text: 'Advanced API access', footnote: 'Unlimited requests' },
      { text: 'Custom reporting' },
      { text: 'Dedicated account manager' },
    ],
  },
]

export const PricingSection = () => {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base/7 font-semibold text-primary">
            Transparent Pricing
          </h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            Choose the right plan for your growth
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-muted-foreground">
          All plans include a 14-day free trial. No credit card required. Cancel
          anytime.
        </p>

        {/* Annual/Monthly Toggle could go here */}

        <div className="mt-16 sm:mt-20">
          <div
            className={cn(
              'grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3',
              'mx-auto max-w-md md:max-w-4xl lg:max-w-none',
            )}
          >
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={cn(
                  'relative rounded-3xl p-8 ring-1',
                  tier.mostPopular
                    ? 'ring-primary bg-muted/50 scale-105'
                    : 'ring-border',
                  'flex flex-col justify-between',
                )}
              >
                {tier.mostPopular && (
                  <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground">
                    Most popular
                  </div>
                )}
                <div>
                  <h3
                    id={tier.id}
                    className={cn(
                      'text-xl font-semibold',
                      tier.mostPopular && 'text-primary',
                    )}
                  >
                    {tier.name}
                  </h3>
                  <p className="mt-4 flex items-baseline">
                    <span className="text-4xl font-bold tracking-tight">
                      {tier.price.monthly}
                    </span>
                    <span className="ml-1 text-sm text-muted-foreground">
                      /month
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {tier.price.annually} per month if paid annually
                    <span className="ml-1.5 text-primary font-medium">
                      ({tier.price.savings})
                    </span>
                  </p>
                  <p className="mt-6 text-sm text-muted-foreground">
                    {tier.description}
                  </p>
                  <ul role="list" className="mt-8 space-y-4">
                    {tier.features.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-3">
                        <CheckCircle2
                          aria-hidden="true"
                          className="h-5 w-5 flex-shrink-0 text-primary"
                        />
                        <span className="text-sm text-muted-foreground">
                          {feature.text}
                          {feature.footnote && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="ml-1 inline-block h-4 w-4 text-muted-foreground/50" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{feature.footnote}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href={tier.href}
                  aria-describedby={tier.id}
                  className={cn(
                    'mt-8 block rounded-full px-3.5 py-3.5',
                    'text-center text-sm font-semibold',
                    'shadow-sm focus-visible:outline focus-visible:outline-2',
                    'focus-visible:outline-offset-2 focus-visible:outline-primary',
                    tier.mostPopular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-foreground hover:bg-muted/90',
                  )}
                >
                  Start {tier.name} trial
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Elements */}
        <div className="mt-16 flex flex-col items-center gap-6">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                14-day free trial
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                No credit card required
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                Cancel anytime
              </span>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Questions?{' '}
            <a href="/contact" className="text-primary hover:text-primary/90">
              Contact our sales team
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
