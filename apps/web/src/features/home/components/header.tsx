'use client'

import { cn } from '@/lib/utils'
import { Menu, X, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const navigation = [
  { name: 'Features', href: '/features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Blog', href: '/blog' },
  { name: 'Resources', href: '/resources' },
]

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Onsite</span>
            <img className="size-8" src="/logo.svg" alt="Onsite logo" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-muted-foreground"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="size-6" aria-hidden="true" />
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm/6 font-semibold text-foreground hover:text-muted-foreground"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop CTA buttons */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <Link
            href="/login"
            className="text-sm/6 font-semibold text-foreground hover:text-muted-foreground"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className={cn(
              'flex items-center gap-2 rounded-full bg-primary px-4 py-2',
              'text-sm/6 font-semibold text-primary-foreground transition-colors hover:bg-primary/90',
            )}
          >
            Start free trial
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          'lg:hidden',
          mobileMenuOpen
            ? 'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm'
            : 'hidden',
        )}
      >
        <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-border/10">
          {/* Mobile menu header */}
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Onsite</span>
              <img className="size-8" src="/logo.svg" alt="Onsite logo" />
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-muted-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <X className="size-6" aria-hidden="true" />
            </button>
          </div>

          {/* Mobile menu content */}
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-border/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-foreground hover:bg-muted"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="py-6">
                <Link
                  href="/login"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-foreground hover:bg-muted"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className={cn(
                    'mt-4 flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5',
                    'text-base/7 font-semibold text-primary-foreground transition-colors hover:bg-primary/90',
                  )}
                >
                  Start free trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
