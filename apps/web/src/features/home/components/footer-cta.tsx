import { env } from '@/config/app-config'
import { cn } from '@/lib/utils'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const benefits = [
  'Start improving rankings in 5 minutes',
  'Join 50,000+ successful teams',
  'ROI tracking built-in',
]

const userAvatars = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9',
  'https://images.unsplash.com/photo-1519345182560-3f2917c472ef',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
  'https://images.unsplash.com/photo-1550525811-e5869dd03032',
]

export const FooterCTA = () => (
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

    <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
      <div className="flex flex-col items-center text-center">
        {/* Content */}
        <div className="max-w-2xl">
          <h2 className="text-balance text-3xl font-medium text-foreground sm:text-4xl">
            Ready to transform your SEO strategy?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of successful teams already using Onsite to improve
            their rankings and drive more organic traffic.
          </p>
        </div>

        {/* Benefits */}
        <div className="mt-8 flex flex-wrap justify-center gap-6">
          {benefits.map((benefit) => (
            <div key={benefit} className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary" />
              <span className="text-base text-muted-foreground">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Trust Elements */}
        <div className="mt-8 flex items-center gap-6">
          <div className="flex -space-x-2">
            {userAvatars.map((avatar, i) => (
              <Image
                key={i}
                src={`${avatar}?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`}
                alt={`User avatar ${i + 1}`}
                width={32}
                height={32}
                className="inline-block h-8 w-8 rounded-full ring-2 ring-background object-cover"
              />
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-primary">93%</span> of users
            report ranking improvements within 30 days
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/register"
            className={cn(
              'flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8',
              'text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90',
              'w-full sm:w-auto',
            )}
          >
            Start free trial
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={`${env.NEXT_PUBLIC_BASE_URL}/slack`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex h-12 items-center justify-center gap-2 rounded-full border border-border/10',
              'bg-background px-8 text-base font-semibold text-foreground transition-colors hover:border-border/20',
              'w-full sm:w-auto',
            )}
          >
            <Image
              src="/icons/slack.svg"
              alt="Slack"
              width={20}
              height={20}
              className="h-5 w-5"
            />
            Join our community
          </a>
        </div>
      </div>
    </div>
  </section>
)
