import { ContactForm } from '@/features/forms/contact-form';

export const ContactSection = () => {
  return (
    <div className="relative isolate px-6 py-24 sm:py-32 lg:px-8">
      <svg
        aria-hidden="true"
        className="absolute inset-0 -z-10 size-full stroke-muted [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
      >
        <defs>
          <pattern
            x="50%"
            y={-64}
            id="contact-grid"
            width={200}
            height={200}
            patternUnits="userSpaceOnUse"
          >
            <path d="M100 200V.5M.5 .5H200" fill="none" />
          </pattern>
        </defs>
        <svg x="50%" y={-64} className="overflow-visible fill-muted/50">
          <path
            d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M299.5 800h201v201h-201Z"
            strokeWidth={0}
          />
        </svg>
        <rect
          width="100%"
          height="100%"
          strokeWidth={0}
          fill="url(#contact-grid)"
        />
      </svg>
      <div className="mx-auto max-w-xl lg:max-w-4xl">
        <h2 className="text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">
          Let's talk about your project
        </h2>
        <p className="mt-2 text-lg/8 text-muted-foreground">
          We help companies and individuals build out their brand guidelines.
        </p>
        <div className="mt-16 flex flex-col gap-16 sm:gap-y-20 lg:flex-row">
          <ContactForm />
          <div className="lg:mt-6 lg:w-80 lg:flex-none">
            <img
              alt=""
              src="https://tailwindui.com/plus/img/logos/workcation-logo-indigo-600.svg"
              className="h-12 w-auto"
            />
            <figure className="mt-10">
              <blockquote className="text-lg/8 font-semibold">
                <p>
                  "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo
                  expedita voluptas culpa sapiente alias molestiae. Numquam
                  corrupti in laborum sed rerum et corporis."
                </p>
              </blockquote>
              <figcaption className="mt-10 flex gap-x-6">
                <img
                  alt=""
                  src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=96&h=96&q=80"
                  className="size-12 flex-none rounded-full bg-muted"
                />
                <div>
                  <div className="text-base font-semibold">Brenna Goyette</div>
                  <div className="text-sm/6 text-muted-foreground">
                    CEO of Workcation
                  </div>
                </div>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </div>
  );
};
