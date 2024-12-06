import { Search, LineChart, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type PrimaryFeature = {
  name: string;
  description: string;
  href: string;
  icon: typeof Search;
};

const primaryFeatures: PrimaryFeature[] = [
  {
    name: 'Technical SEO Audits',
    description:
      'Comprehensive technical analysis of your site structure, performance, and crawlability. Identify and fix critical issues that are holding back your rankings.',
    href: '#',
    icon: Search,
  },
  {
    name: 'Keyword Intelligence',
    description:
      'Advanced keyword research and tracking to identify high-value ranking opportunities. Monitor your positions and understand exactly what moves the needle.',
    href: '#',
    icon: LineChart,
  },
  {
    name: 'Backlink Analysis',
    description:
      'Deep insights into your backlink profile and competitor link strategies. Find and acquire quality backlinks that boost your domain authority and rankings.',
    href: '#',
    icon: Link2,
  },
];

export const PrimaryFeatures = () => {
  return (
    <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
      <div className="mx-auto max-w-2xl lg:text-center">
        <h2 className="text-base/7 font-semibold text-primary">
          Technical SEO Made Simple
        </h2>
        <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight sm:text-5xl lg:text-balance">
          Tick off your technical SEO checklist
        </p>
        <p className="mt-6 text-lg/8 text-muted-foreground">
          Onsite is a technical SEO platform built for modern SEM teams, by
          technical SEO experts who needed more. Stop guessing and start
          improving your rankings with data-driven insights.
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
              <dd className="mt-1 flex flex-auto flex-col text-base/7 text-muted-foreground">
                <p className="flex-auto">{feature.description}</p>
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
  );
};
