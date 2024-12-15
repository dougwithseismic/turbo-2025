export const StatsSection = () => {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">
            We approach work as a place to make the world better
          </h2>
          <p className="mt-6 text-base/7 text-muted-foreground">
            Building the future of web development with modern tools and
            frameworks. Our platform enables developers to create amazing
            products faster than ever.
          </p>
        </div>
        <div className="mx-auto mt-16 flex max-w-2xl flex-col gap-8 lg:mx-0 lg:mt-20 lg:max-w-none lg:flex-row lg:items-end">
          <div className="flex flex-col-reverse justify-between gap-x-16 gap-y-8 rounded-2xl bg-muted/50 p-8 sm:w-3/4 sm:max-w-md sm:flex-row-reverse sm:items-end lg:w-72 lg:max-w-none lg:flex-none lg:flex-col lg:items-start">
            <p className="flex-none text-3xl font-bold tracking-tight">250k</p>
            <div className="sm:w-80 sm:shrink lg:w-auto lg:flex-none">
              <p className="text-lg font-semibold tracking-tight">
                Users on the platform
              </p>
              <p className="mt-2 text-base/7 text-muted-foreground">
                Trusted by developers and teams worldwide.
              </p>
            </div>
          </div>
          <div className="flex flex-col-reverse justify-between gap-x-16 gap-y-8 rounded-2xl bg-foreground p-8 sm:flex-row-reverse sm:items-end lg:w-full lg:max-w-sm lg:flex-auto lg:flex-col lg:items-start lg:gap-y-44">
            <p className="flex-none text-3xl font-bold tracking-tight text-background">
              $8.9 billion
            </p>
            <div className="sm:w-80 sm:shrink lg:w-auto lg:flex-none">
              <p className="text-lg font-semibold tracking-tight text-background">
                We're proud that our customers have made over $8 billion in
                total revenue.
              </p>
              <p className="mt-2 text-base/7 text-background/80">
                Empowering businesses to achieve their goals.
              </p>
            </div>
          </div>
          <div className="flex flex-col-reverse justify-between gap-x-16 gap-y-8 rounded-2xl bg-primary p-8 sm:w-11/12 sm:max-w-xl sm:flex-row-reverse sm:items-end lg:w-full lg:max-w-none lg:flex-auto lg:flex-col lg:items-start lg:gap-y-28">
            <p className="flex-none text-3xl font-bold tracking-tight text-primary-foreground">
              401,093
            </p>
            <div className="sm:w-80 sm:shrink lg:w-auto lg:flex-none">
              <p className="text-lg font-semibold tracking-tight text-primary-foreground">
                Transactions this year
              </p>
              <p className="mt-2 text-base/7 text-primary-foreground/80">
                Secure, fast, and reliable transactions processed through our
                platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
