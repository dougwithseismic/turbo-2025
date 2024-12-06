import { env } from '@/config/app-config';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export const FooterCTA = () => {
  return (
    <section className="relative isolate bg-gradient-to-b from-transparent to-background overflow-clip">
      {/* Background Pattern */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 -z-10 size-full stroke-muted [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
      >
        <defs>
          <pattern
            id="footer-cta-grid"
            width={200}
            height={200}
            x="50%"
            y={0}
            patternUnits="userSpaceOnUse"
          >
            <path d="M.5 200V.5H200" fill="none" />
          </pattern>
        </defs>
        <svg x="50%" y={0} className="overflow-visible fill-muted/20">
          <path
            d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z"
            strokeWidth={0}
          />
        </svg>
        <rect
          width="100%"
          height="100%"
          strokeWidth={0}
          fill="url(#footer-cta-grid)"
        />
      </svg>

      {/* Gradient Blur */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-10 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl"
      >
        <div
          className="aspect-[1108/632] w-[69.25rem] flex-none bg-gradient-to-r from-primary to-secondary opacity-20"
          style={{
            clipPath:
              'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
          }}
        />
      </div>

      <div className="flex max-w-7xl mx-auto flex-col items-center gap-12 px-4 py-16 md:flex-row md:py-24">
        {/* Content */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <h2 className="text-4xl md:text-6xl font-medium text-foreground mb-4">
            Build the
            <br />
            Future
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-8">
            Create powerful tools and shape tomorrow with Seismic.
            <br />
            The future of development starts here.
          </p>
          <div className="flex flex-col gap-4 w-full sm:flex-row sm:w-auto">
            <Link
              href="/register"
              className={cn(
                'flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold uppercase',
                'text-primary-foreground transition-colors hover:bg-primary/90',
              )}
            >
              Start now
            </Link>
            <a
              href={`${env.NEXT_PUBLIC_BASE_URL}/slack`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex h-12 items-center justify-center gap-2 rounded-full border border-border/10',
                'bg-background px-8 text-sm font-bold uppercase text-foreground transition-colors hover:border-border/20',
              )}
            >
              <img src="/icons/slack.svg" alt="" className="h-5 w-5" />
              Join our Slack
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
