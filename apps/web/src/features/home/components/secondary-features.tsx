import {
  ArrowUpDown,
  Cloud,
  Cog,
  Fingerprint,
  Lock,
  Server,
} from 'lucide-react';

type SecondaryFeature = {
  name: string;
  description: string;
  icon: typeof Cloud;
};

const secondaryFeatures: SecondaryFeature[] = [
  {
    name: 'Push to deploy',
    description:
      'Autem reprehenderit aut debitis ut. Officiis harum omnis placeat blanditiis delectus sint vel et voluptatum.',
    icon: Cloud,
  },
  {
    name: 'SSL certificates',
    description:
      'Illum et aut inventore. Ut et dignissimos quasi. Omnis saepe dolorum. Hic autem fugiat. Voluptatem officiis necessitatibus.',
    icon: Lock,
  },
  {
    name: 'Simple queues',
    description:
      'Commodi quam quo. In quasi mollitia optio voluptate et est reiciendis. Ut et sunt id officiis vitae perspiciatis.',
    icon: ArrowUpDown,
  },
  {
    name: 'Advanced security',
    description:
      'Deserunt corrupti praesentium quo vel cupiditate est occaecati ad. Aperiam libero modi similique iure praesentium facilis.',
    icon: Fingerprint,
  },
  {
    name: 'Powerful API',
    description:
      'Autem reprehenderit aut debitis ut. Officiis harum omnis placeat blanditiis delectus sint vel et voluptatum.',
    icon: Cog,
  },
  {
    name: 'Database backups',
    description:
      'Illum et aut inventore. Ut et dignissimos quasi. Omnis saepe dolorum. Hic autem fugiat. Voluptatem officiis necessitatibus.',
    icon: Server,
  },
];

export const SecondaryFeatures = () => {
  return (
    <div className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-5">
          <h2 className="col-span-2 text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">
            Everything you need to deploy your app
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
  );
};
