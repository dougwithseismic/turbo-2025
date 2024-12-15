export const LogoCloud = () => {
  return (
    <div className="mx-auto mt-8 max-w-7xl px-6 sm:mt-16 lg:px-8">
      <h2 className="text-center text-lg/8 font-semibold">
        The world's most innovative companies use our app
      </h2>
      <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
        <img
          alt="Transistor"
          src="https://tailwindui.com/plus/img/logos/158x48/transistor-logo-white.svg"
          width={158}
          height={48}
          className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 dark:invert"
        />
        <img
          alt="Reform"
          src="https://tailwindui.com/plus/img/logos/158x48/reform-logo-white.svg"
          width={158}
          height={48}
          className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 dark:invert"
        />
        <img
          alt="Tuple"
          src="https://tailwindui.com/plus/img/logos/158x48/tuple-logo-white.svg"
          width={158}
          height={48}
          className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 dark:invert"
        />
        <img
          alt="SavvyCal"
          src="https://tailwindui.com/plus/img/logos/158x48/savvycal-logo-white.svg"
          width={158}
          height={48}
          className="col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1 dark:invert"
        />
        <img
          alt="Statamic"
          src="https://tailwindui.com/plus/img/logos/158x48/statamic-logo-white.svg"
          width={158}
          height={48}
          className="col-span-2 col-start-2 max-h-12 w-full object-contain sm:col-start-auto lg:col-span-1 dark:invert"
        />
      </div>
    </div>
  )
}
