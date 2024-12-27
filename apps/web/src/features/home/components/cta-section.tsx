import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export const CTASection = () => {
  return (
    <div className="relative isolate mt-32 px-6 py-32 sm:mt-56 sm:py-40 lg:px-8">
      <svg
        aria-hidden="true"
        className="absolute inset-0 -z-10 size-full stroke-muted [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
      >
        <defs>
          <pattern
            id="cta-grid"
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
          fill="url(#cta-grid)"
        />
      </svg>
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
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Start catching SEO issues before they hurt your rankings
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg/8 text-muted-foreground">
          Join 50,000+ companies already using Onsite to improve their technical
          SEO. Set up in minutes, see results in hours.
        </p>

        {/* Trust Building Elements */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span>5-minute setup</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button
            className={cn(
              ' flex items-center justify-center rounded-full bg-primary px-8 py-3 text-base font-semibold',
              'text-primary-foreground shadow-sm hover:bg-primary/90',
              'focus-visible:outline focus-visible:outline-2',
              'focus-visible:outline-offset-2 focus-visible:outline-primary',
            )}
          >
            <Link href="/register">Start Free Trial</Link>
          </Button>
          <Button variant="ghost" className="text-base font-semibold" asChild>
            <Link href="#features" className="flex items-center gap-2">
              See live demo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Social Proof */}
        <div className="mt-10 flex justify-center gap-x-8 text-sm text-muted-foreground">
          <p>
            <span className="font-semibold text-primary">93%</span> report
            ranking improvements
          </p>
          <p>
            <span className="font-semibold text-primary">4.9/5</span> average
            rating
          </p>
        </div>
      </div>
    </div>
  )
}
