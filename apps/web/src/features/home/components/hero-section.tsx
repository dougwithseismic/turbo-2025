import { Button } from '@/components/ui/button';

export const HeroSection = () => {
  return (
    <div className="relative isolate pt-14">
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-primary/60 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
      <div className="py-24 sm:py-32 lg:pb-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Launch Your SaaS{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Faster Than Ever
              </span>
            </h1>
            <p className="mt-6 text-pretty text-lg text-muted-foreground sm:text-xl">
              A complete starter kit with everything you need to build modern
              web applications. Type-safe, scalable, and production-ready.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" asChild>
                <a href="#pricing">Get started</a>
              </Button>
              <Button variant="ghost" size="lg" asChild>
                <a href="#features">
                  Learn more <span aria-hidden="true">→</span>
                </a>
              </Button>
            </div>
          </div>
          <div className="mt-16 flow-root sm:mt-24">
            <div className="-m-2 rounded-xl bg-muted/10 p-2 ring-1 ring-inset ring-muted/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <img
                src="https://tailwindui.com/plus/img/component-images/dark-project-app-screenshot.png"
                alt="App screenshot"
                width={2432}
                height={1442}
                className="rounded-md shadow-2xl ring-1 ring-muted/10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
