import { cn } from '@/lib/utils';

const featuredTestimonial = {
  body: 'Onsite completely transformed how we handle technical SEO. We went from scattered spreadsheets and manual checks to a streamlined process that catches issues before they impact rankings.',
  author: {
    name: 'Sarah Chen',
    handle: 'sarahchen_seo',
    imageUrl:
      'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=1024&h=1024&q=80',
    logoUrl: 'https://tailwindui.com/plus/img/logos/savvycal-logo-gray-900.svg',
  },
};

const testimonials = [
  [
    [
      {
        body: 'The automated technical audits saved us countless hours. Issues that would have taken weeks to discover are now flagged instantly.',
        author: {
          name: 'Marcus Rodriguez',
          handle: 'marcusrodriguez',
          imageUrl:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
      },
    ],
    [
      {
        body: 'The keyword research tools helped us identify opportunities we were completely missing. Our organic traffic increased by 150% in 3 months.',
        author: {
          name: 'Emma Watson',
          handle: 'emmawatson_seo',
          imageUrl:
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
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
          handle: 'jamesliu',
          imageUrl:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
      },
    ],
    [
      {
        body: "The backlink analysis helped us identify and disavow toxic links we didn't even know existed. Our domain authority improved almost immediately.",
        author: {
          name: 'Rachel Park',
          handle: 'rachelpark_seo',
          imageUrl:
            'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
      },
    ],
  ],
];

export const TestimonialsSection = () => {
  return (
    <div className="relative isolate pb-16 pt-16 sm:pb-24 sm:pt-24 lg:pb-32 lg:pt-32">
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
        className="absolute inset-x-0 top-0 -z-10 flex transform-gpu overflow-hidden opacity-25 blur-3xl"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="relative left-[calc(50%-11rem)] aspect-[1313/771] w-[82.0625rem] rotate-[30deg] bg-gradient-to-tr from-primary to-primary/60 sm:left-[calc(50%-30rem)] lg:left-[calc(50%-38rem)]"
        />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base/7 font-semibold text-primary">
            Real Results
          </h2>
          <p className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            See how teams are improving their rankings with Onsite
          </p>
        </div>
        <div className="mx-auto mt-8 grid max-w-2xl gap-4 sm:mt-12 lg:mt-16 lg:max-w-none">
          <figure className="rounded-2xl bg-muted p-6 shadow-lg ring-1 ring-muted lg:p-8">
            <blockquote className="text-base font-semibold tracking-tight sm:text-lg lg:text-xl">
              <p>{`"${featuredTestimonial.body}"`}</p>
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-4 border-t border-muted-foreground/10 pt-6">
              <img
                alt=""
                src={featuredTestimonial.author.imageUrl}
                className="size-10 rounded-full bg-muted"
              />
              <div className="flex-auto">
                <div className="font-semibold">
                  {featuredTestimonial.author.name}
                </div>
                <div className="text-muted-foreground">{`@${featuredTestimonial.author.handle}`}</div>
              </div>
              {featuredTestimonial.author.logoUrl && (
                <img
                  alt=""
                  src={featuredTestimonial.author.logoUrl}
                  className="h-8 w-auto sm:h-10"
                />
              )}
            </figcaption>
          </figure>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((columnGroup, columnGroupIdx) => (
              <div key={columnGroupIdx} className="space-y-4">
                {columnGroup.map((column) =>
                  column.map((testimonial) => (
                    <figure
                      key={testimonial.author.handle}
                      className="rounded-2xl bg-muted p-6 shadow-lg ring-1 ring-muted"
                    >
                      <blockquote>
                        <p className="text-sm sm:text-base">{`"${testimonial.body}"`}</p>
                      </blockquote>
                      <figcaption className="mt-6 flex items-center gap-4">
                        <img
                          alt=""
                          src={testimonial.author.imageUrl}
                          className="size-8 rounded-full bg-muted sm:size-10"
                        />
                        <div>
                          <div className="text-sm font-semibold sm:text-base">
                            {testimonial.author.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {`@${testimonial.author.handle}`}
                          </div>
                        </div>
                      </figcaption>
                    </figure>
                  )),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
