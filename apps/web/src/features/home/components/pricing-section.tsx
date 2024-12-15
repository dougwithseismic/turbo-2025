import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type PricingTier = {
  name: string
  id: string
  href: string
  price: {
    monthly: string
    annually: string
  }
  description: string
  features: string[]
}

const tiers: PricingTier[] = [
  {
    name: 'Starter',
    id: 'tier-starter',
    href: '#',
    price: { monthly: '$49', annually: '$39' },
    description: 'Perfect for small sites and solo SEO consultants.',
    features: [
      'Full technical site audits',
      'Basic keyword tracking (100 keywords)',
      'Core Web Vitals monitoring',
      'Weekly crawl reports',
      'Basic backlink analysis',
      'Email support',
    ],
  },
  {
    name: 'Professional',
    id: 'tier-professional',
    href: '#',
    price: { monthly: '$149', annually: '$129' },
    description: 'Advanced features for growing sites and in-house SEO teams.',
    features: [
      'Everything in Starter, plus:',
      'Advanced keyword tracking (1,000 keywords)',
      'Competitor rank tracking',
      'Content optimization suggestions',
      'Advanced backlink analysis',
      'Priority support',
      'API access',
    ],
  },
  {
    name: 'Enterprise',
    id: 'tier-enterprise',
    href: '#',
    price: { monthly: '$499', annually: '$449' },
    description: 'Custom solutions for large sites and agencies.',
    features: [
      'Everything in Professional, plus:',
      'Unlimited keyword tracking',
      'Multi-site management',
      'Custom reporting',
      'Advanced API access',
      'Dedicated account manager',
      'Custom crawl schedules',
      '24/7 priority support',
    ],
  },
]

export const PricingSection = () => {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base/7 font-semibold text-primary">
            Simple Pricing
          </h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            Start improving your rankings today
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-muted-foreground">
          Choose the plan that fits your needs. From solo consultants to
          enterprise teams, we have you covered with all the tools you need to
          succeed in technical SEO.
        </p>
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
                  'rounded-3xl p-8 ring-1 ring-border',
                  'flex flex-col justify-between',
                )}
              >
                <div>
                  <h3 id={tier.id} className="text-xl font-semibold">
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
                  </p>
                  <p className="mt-6 text-sm text-muted-foreground">
                    {tier.description}
                  </p>
                  <ul role="list" className="mt-8 space-y-4">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <CheckCircle2
                          aria-hidden="true"
                          className="h-5 w-5 flex-shrink-0 text-primary"
                        />
                        <span className="ml-3 text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href={tier.href}
                  aria-describedby={tier.id}
                  className={cn(
                    'mt-8 block rounded-md bg-primary px-3.5 py-2.5',
                    'text-center text-sm font-semibold text-primary-foreground',
                    'shadow-sm hover:bg-primary/90',
                    'focus-visible:outline focus-visible:outline-2',
                    'focus-visible:outline-offset-2 focus-visible:outline-primary',
                  )}
                >
                  Start free trial
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
