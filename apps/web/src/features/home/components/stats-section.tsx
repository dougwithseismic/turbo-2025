export const StatsSection = () => {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">
            Trusted by leading brands worldwide
          </h2>
          <p className="mt-6 text-base/7 text-muted-foreground">
            Join thousands of successful companies using Onsite to improve their
            technical SEO and drive sustainable organic growth.
          </p>
        </div>
        <div className="mx-auto mt-16 flex max-w-2xl flex-col gap-8 lg:mx-0 lg:mt-20 lg:max-w-none lg:flex-row lg:items-end">
          <div className="flex flex-col-reverse justify-between gap-x-16 gap-y-8 rounded-2xl bg-muted/50 p-8 sm:w-3/4 sm:max-w-md sm:flex-row-reverse sm:items-end lg:w-72 lg:max-w-none lg:flex-none lg:flex-col lg:items-start">
            <p className="flex-none text-3xl font-bold tracking-tight">
              50,000+
            </p>
            <div className="sm:w-80 sm:shrink lg:w-auto lg:flex-none">
              <p className="text-lg font-semibold tracking-tight">
                Active users
              </p>
              <p className="mt-2 text-base/7 text-muted-foreground">
                From startups to enterprise teams, improving their SEO daily.
              </p>
            </div>
          </div>
          <div className="flex flex-col-reverse justify-between gap-x-16 gap-y-8 rounded-2xl bg-foreground p-8 sm:flex-row-reverse sm:items-end lg:w-full lg:max-w-sm lg:flex-auto lg:flex-col lg:items-start lg:gap-y-44">
            <p className="flex-none text-3xl font-bold tracking-tight text-background">
              2.8M+
            </p>
            <div className="sm:w-80 sm:shrink lg:w-auto lg:flex-none">
              <p className="text-lg font-semibold tracking-tight text-background">
                Technical issues identified and resolved across our platform.
              </p>
              <p className="mt-2 text-base/7 text-background/80">
                Helping teams catch and fix problems before they impact
                rankings.
              </p>
            </div>
          </div>
          <div className="flex flex-col-reverse justify-between gap-x-16 gap-y-8 rounded-2xl bg-primary p-8 sm:w-11/12 sm:max-w-xl sm:flex-row-reverse sm:items-end lg:w-full lg:max-w-none lg:flex-auto lg:flex-col lg:items-start lg:gap-y-28">
            <p className="flex-none text-3xl font-bold tracking-tight text-primary-foreground">
              93%
            </p>
            <div className="sm:w-80 sm:shrink lg:w-auto lg:flex-none">
              <p className="text-lg font-semibold tracking-tight text-primary-foreground">
                Success rate in improving rankings
              </p>
              <p className="mt-2 text-base/7 text-primary-foreground/80">
                Our users see measurable improvements within 30 days.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Trust Elements */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-muted/50 p-8">
            <p className="text-3xl font-bold tracking-tight">150%</p>
            <p className="mt-2 text-base/7 text-muted-foreground">
              Average increase in organic traffic within 90 days
            </p>
          </div>
          <div className="rounded-2xl bg-muted/50 p-8">
            <p className="text-3xl font-bold tracking-tight">4.9/5</p>
            <p className="mt-2 text-base/7 text-muted-foreground">
              Customer satisfaction rating from over 10,000 reviews
            </p>
          </div>
          <div className="rounded-2xl bg-muted/50 p-8">
            <p className="text-3xl font-bold tracking-tight">24/7</p>
            <p className="mt-2 text-base/7 text-muted-foreground">
              Continuous monitoring and real-time alerts
            </p>
          </div>
          <div className="rounded-2xl bg-muted/50 p-8">
            <p className="text-3xl font-bold tracking-tight">5min</p>
            <p className="mt-2 text-base/7 text-muted-foreground">
              Average setup time to start seeing insights
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
