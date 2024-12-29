import Image from 'next/image'

export const LogoCloud = () => {
  return (
    <div className="mx-auto mt-8 max-w-7xl px-6 sm:mt-16 lg:px-8">
      <div className="text-center space-y-4">
        <h2 className="text-lg/8 font-semibold text-muted-foreground">
          Trusted by 50,000+ companies worldwide
        </h2>
        <p className="text-sm text-muted-foreground">
          From startups to enterprise, teams rely on Onsite to improve their
          technical SEO
        </p>
      </div>
      <div className="mx-auto mt-8 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-12 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
        <Image
          alt="Transistor"
          src="https://tailwindui.com/plus/img/logos/158x48/transistor-logo-white.svg"
          width={158}
          height={48}
          priority
          className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 dark:invert opacity-75 hover:opacity-100 transition-opacity"
        />
        <Image
          alt="Reform"
          src="https://tailwindui.com/plus/img/logos/158x48/reform-logo-white.svg"
          width={158}
          height={48}
          priority
          className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 dark:invert opacity-75 hover:opacity-100 transition-opacity"
        />
        <Image
          alt="Tuple"
          src="https://tailwindui.com/plus/img/logos/158x48/tuple-logo-white.svg"
          width={158}
          height={48}
          priority
          className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 dark:invert opacity-75 hover:opacity-100 transition-opacity"
        />
        <Image
          alt="SavvyCal"
          src="https://tailwindui.com/plus/img/logos/158x48/savvycal-logo-white.svg"
          width={158}
          height={48}
          priority
          className="col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1 dark:invert opacity-75 hover:opacity-100 transition-opacity"
        />
        <Image
          alt="Statamic"
          src="https://tailwindui.com/plus/img/logos/158x48/statamic-logo-white.svg"
          width={158}
          height={48}
          priority
          className="col-span-2 col-start-2 max-h-12 w-full object-contain sm:col-start-auto lg:col-span-1 dark:invert opacity-75 hover:opacity-100 transition-opacity"
        />
      </div>
      <div className="mt-8 flex justify-center gap-x-6 text-sm text-muted-foreground">
        <p>
          <span className="font-semibold text-primary">93%</span> report ranking
          improvements
        </p>
        <p>
          <span className="font-semibold text-primary">4.9/5</span> average
          rating
        </p>
      </div>
    </div>
  )
}
