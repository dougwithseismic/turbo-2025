import { cn } from '@/lib/utils'
import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'

const featuredTestimonial = {
  body: 'Within 2 weeks of using Onsite, we identified and fixed critical indexing issues that were hurting our rankings. Our organic traffic increased by 150% in the following month.',
  author: {
    name: 'Sarah Chen',
    handle: 'sarahchen_seo',
    role: 'Head of SEO at TechCorp',
    imageUrl:
      'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=1024&h=1024&q=80',
    companyLogo:
      'https://tailwindui.com/plus/img/logos/savvycal-logo-gray-900.svg',
    metrics: {
      traffic: '+150%',
      rankings: '32 keywords to top 3',
      timeframe: '30 days',
    },
  },
}

const testimonials = [
  [
    [
      {
        body: 'The automated technical audits saved us countless hours. We identified and fixed mobile usability issues that boosted our mobile rankings by 45%.',
        author: {
          name: 'Marcus Rodriguez',
          role: 'SEO Manager at E-commerce Plus',
          handle: 'marcusrodriguez',
          imageUrl:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          metrics: {
            improvement: '+45%',
            type: 'mobile rankings',
          },
        },
      },
    ],
    [
      {
        body: 'The keyword research tools helped us identify opportunities we were completely missing. Our organic traffic increased by 150% in 3 months.',
        author: {
          name: 'Emma Watson',
          role: 'Digital Marketing Director',
          handle: 'emmawatson_seo',
          imageUrl:
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          metrics: {
            improvement: '+150%',
            type: 'organic traffic',
          },
        },
      },
    ],
  ],
  [
    [
      {
        body: 'The site crawling feature caught critical indexing issues that were hurting our rankings. Within weeks of fixing them, we saw significant improvements.',
        author: {
          name: 'James Liu',
          role: 'Technical SEO Lead',
          handle: 'jamesliu',
          imageUrl:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          metrics: {
            improvement: '85%',
            type: 'indexing issues resolved',
          },
        },
      },
    ],
    [
      {
        body: 'The backlink analysis helped us identify and disavow toxic links. Our domain authority improved by 12 points in just two months.',
        author: {
          name: 'Rachel Park',
          role: 'SEO Consultant',
          handle: 'rachelpark_seo',
          imageUrl:
            'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          metrics: {
            improvement: '+12',
            type: 'domain authority',
          },
        },
      },
    ],
  ],
]

export const TestimonialsSection = () => {
  return (
    <div className="relative isolate pb-32 pt-24 sm:pt-32">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 transform-gpu overflow-hidden opacity-30 blur-3xl"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="relative left-[calc(50%-20rem)] aspect-[1313/771] w-[82.0625rem] bg-gradient-to-tr from-primary to-primary/60 lg:left-[calc(50%-38rem)]"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 flex transform-gpu overflow-hidden pt-32 opacity-25 blur-3xl sm:pt-40 xl:justify-end"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="ml-[-22rem] aspect-[1313/771] w-[82.0625rem] flex-none origin-top-right rotate-[30deg] bg-gradient-to-tr from-primary to-primary/60 xl:ml-0 xl:mr-[calc(50%-12rem)]"
        />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base/7 font-semibold text-primary">
            Proven Results
          </h2>
          <p className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            See how teams are transforming their SEO with Onsite
          </p>
        </div>
        <div className="mx-auto mt-8 flex flex-col gap-4 text-sm/6 sm:mt-12 lg:mt-16 lg:max-w-none lg:grid lg:grid-flow-col lg:grid-cols-4 lg:grid-rows-1">
          <figure className="rounded-2xl bg-muted p-6 shadow-lg ring-1 ring-muted sm:p-8 lg:col-span-2 lg:col-start-2 lg:row-end-1">
            <blockquote className="text-base font-semibold tracking-tight sm:text-lg lg:text-xl">
              <p>{`"${featuredTestimonial.body}"`}</p>
            </blockquote>
            <figcaption className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-4 border-t border-muted-foreground/10 pt-6">
              <Image
                alt={`${featuredTestimonial.author.name}'s profile picture`}
                src={featuredTestimonial.author.imageUrl}
                width={40}
                height={40}
                className="rounded-full bg-muted object-cover"
              />
              <div className="flex-auto">
                <div className="font-semibold">
                  {featuredTestimonial.author.name}
                </div>
                <div className="text-muted-foreground">
                  {featuredTestimonial.author.role}
                </div>
              </div>
              {featuredTestimonial.author.companyLogo && (
                <Image
                  alt={`${featuredTestimonial.author.name}'s company logo`}
                  src={featuredTestimonial.author.companyLogo}
                  width={158}
                  height={48}
                  className="h-8 w-auto sm:h-10"
                />
              )}
            </figcaption>
            <div className="mt-4 grid grid-cols-3 gap-4 border-t border-muted-foreground/10 pt-4">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {featuredTestimonial.author.metrics.traffic}
                </div>
                <div className="text-sm text-muted-foreground">
                  Organic Traffic
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {featuredTestimonial.author.metrics.rankings}
                </div>
                <div className="text-sm text-muted-foreground">
                  Rankings Improved
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {featuredTestimonial.author.metrics.timeframe}
                </div>
                <div className="text-sm text-muted-foreground">Timeframe</div>
              </div>
            </div>
          </figure>
          {testimonials.map((columnGroup, columnGroupIdx) => (
            <div
              key={columnGroupIdx}
              className="flex flex-col gap-4 lg:contents"
            >
              {columnGroup.map((column, columnIdx) => (
                <div
                  key={columnIdx}
                  className={cn(
                    'flex flex-col gap-4',
                    (columnGroupIdx === 0 && columnIdx === 0) ||
                      (columnGroupIdx === testimonials.length - 1 &&
                        columnIdx === columnGroup.length - 1)
                      ? 'lg:row-span-2'
                      : 'lg:row-start-1',
                  )}
                >
                  {column.map((testimonial) => (
                    <figure
                      key={testimonial.author.handle}
                      className="rounded-2xl bg-muted p-6 shadow-lg ring-1 ring-muted"
                    >
                      <blockquote>
                        <p className="text-sm sm:text-base">{`"${testimonial.body}"`}</p>
                      </blockquote>
                      <figcaption className="mt-6 flex items-center gap-x-4">
                        <Image
                          alt={`${testimonial.author.name}'s profile picture`}
                          src={testimonial.author.imageUrl}
                          width={40}
                          height={40}
                          className="size-8 rounded-full bg-muted object-cover sm:size-10"
                        />
                        <div>
                          <div className="text-sm font-semibold sm:text-base">
                            {testimonial.author.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {testimonial.author.role}
                          </div>
                        </div>
                      </figcaption>
                      <div className="mt-4 flex items-center justify-between border-t border-muted-foreground/10 pt-4">
                        <div>
                          <div className="text-xl font-bold text-primary">
                            {testimonial.author.metrics.improvement}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {testimonial.author.metrics.type}
                          </div>
                        </div>
                        <a
                          href="#case-studies"
                          className="text-primary hover:text-primary/90"
                        >
                          <ArrowUpRight className="h-5 w-5" />
                        </a>
                      </div>
                    </figure>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
