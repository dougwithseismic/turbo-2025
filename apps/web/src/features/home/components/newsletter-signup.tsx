import { cn } from '@/lib/utils';

export const NewsletterSignup = () => {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="relative isolate flex flex-col gap-10 overflow-hidden bg-primary px-6 py-24 shadow-2xl sm:rounded-3xl sm:px-24 xl:flex-row xl:items-center xl:py-32">
          <h2 className="max-w-xl text-balance text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl xl:flex-auto">
            Want product updates? Sign up for our newsletter.
          </h2>
          <form className="w-full max-w-md">
            <div className="flex gap-x-4">
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                placeholder="Enter your email"
                autoComplete="email"
                className={cn(
                  'min-w-0 flex-auto rounded-md bg-primary-foreground/5 px-3.5 py-2',
                  'text-base text-primary-foreground placeholder:text-primary-foreground/60 sm:text-sm/6',
                  'outline outline-1 -outline-offset-1 outline-primary-foreground/10',
                  'focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-primary-foreground',
                )}
              />
              <button
                type="submit"
                className={cn(
                  'flex-none rounded-md bg-primary-foreground px-3.5 py-2.5',
                  'text-sm font-semibold text-primary shadow-sm',
                  'hover:bg-primary-foreground/90',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground',
                )}
              >
                Notify me
              </button>
            </div>
            <p className="mt-4 text-sm/6 text-primary-foreground/80">
              We care about your data. Read our{' '}
              <a
                href="#"
                className="font-semibold text-primary-foreground hover:text-primary-foreground/90"
              >
                privacy&nbsp;policy
              </a>
              .
            </p>
          </form>
          <svg
            viewBox="0 0 1024 1024"
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -z-10 size-[64rem] -translate-x-1/2"
          >
            <circle
              cx={512}
              cy={512}
              r={512}
              fill="url(#newsletter-gradient)"
              fillOpacity="0.7"
            />
            <defs>
              <radialGradient
                id="newsletter-gradient"
                cx={0}
                cy={0}
                r={1}
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(512 512) rotate(90) scale(512)"
              >
                <stop
                  className="[--stop-color:theme(colors.primary.DEFAULT/0.7)]"
                  stopColor="var(--stop-color)"
                />
                <stop
                  offset={1}
                  className="[--stop-color:theme(colors.secondary.DEFAULT/0)]"
                  stopColor="var(--stop-color)"
                />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
};
