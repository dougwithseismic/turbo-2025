import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type PricingTier = {
  name: string;
  id: string;
  href: string;
  price: {
    monthly: string;
    annually: string;
  };
  description: string;
  features: string[];
};

const tiers: PricingTier[] = [
  {
    name: 'Basic',
    id: 'tier-basic',
    href: '#',
    price: { monthly: '$19', annually: '$15' },
    description: 'Everything necessary to get started.',
    features: [
      '5 products',
      'Up to 1,000 subscribers',
      'Basic analytics',
      '48-hour support response time',
    ],
  },
  {
    name: 'Essential',
    id: 'tier-essential',
    href: '#',
    price: { monthly: '$49', annually: '$39' },
    description:
      'Everything in Basic, plus essential tools for growing your business.',
    features: [
      '25 products',
      'Up to 10,000 subscribers',
      'Advanced analytics',
      '24-hour support response time',
      'Marketing automations',
    ],
  },
  {
    name: 'Growth',
    id: 'tier-growth',
    href: '#',
    price: { monthly: '$99', annually: '$79' },
    description:
      'Everything in Essential, plus collaboration tools and deeper insights.',
    features: [
      'Unlimited products',
      'Unlimited subscribers',
      'Advanced analytics',
      '1-hour, dedicated support response time',
      'Marketing automations',
      'Custom reporting tools',
    ],
  },
];

export const PricingSection = () => {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl sm:text-center">
          <h2 className="text-base/7 font-semibold text-primary">Pricing</h2>
          <p className="mt-2 text-pretty text-5xl font-semibold tracking-tight sm:text-balance sm:text-6xl">
            Pricing that grows with you
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg font-medium text-muted-foreground sm:text-center sm:text-xl/8">
          Choose an affordable plan that's packed with the best features for
          engaging your audience, creating customer loyalty, and driving sales.
        </p>
        <div className="mt-20 flow-root">
          <div
            className={cn(
              'isolate -mt-16 grid max-w-sm grid-cols-1 gap-y-16 divide-y divide-border sm:mx-auto',
              'lg:-mx-8 lg:mt-0 lg:max-w-none lg:grid-cols-3 lg:divide-x lg:divide-y-0 xl:-mx-4',
            )}
          >
            {tiers.map((tier) => (
              <div key={tier.id} className="pt-16 lg:px-8 lg:pt-0 xl:px-14">
                <h3 id={tier.id} className="text-base/7 font-semibold">
                  {tier.name}
                </h3>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-5xl font-semibold tracking-tight">
                    {tier.price.monthly}
                  </span>
                  <span className="text-sm/6 font-semibold text-muted-foreground">
                    /month
                  </span>
                </p>
                <p className="mt-3 text-sm/6 text-muted-foreground">
                  {tier.price.annually} per month if paid annually
                </p>
                <a
                  href={tier.href}
                  aria-describedby={tier.id}
                  className={cn(
                    'mt-10 block rounded-md bg-primary px-3 py-2 text-center text-sm/6 font-semibold',
                    'text-primary-foreground shadow-sm hover:bg-primary/90',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                  )}
                >
                  Buy plan
                </a>
                <p className="mt-10 text-sm/6 font-semibold">
                  {tier.description}
                </p>
                <ul
                  role="list"
                  className="mt-6 space-y-3 text-sm/6 text-muted-foreground"
                >
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckCircle2
                        aria-hidden="true"
                        className="h-5 w-5 flex-none text-primary"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
