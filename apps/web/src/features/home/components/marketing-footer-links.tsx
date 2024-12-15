'use client'

import { type FC } from 'react'
import { NewsletterForm } from '@/features/newsletter/components/newsletter-form'

type FooterLinkGroupProps = {
  title: string
  links: Array<{
    label: string
    href: string
  }>
}

const FooterLinkGroup: FC<FooterLinkGroupProps> = ({ title, links }) => (
  <div className="flex flex-col space-y-3">
    <h3 className="font-medium text-white">{title}</h3>
    <ul className="space-y-2">
      {links.map(({ label, href }) => (
        <li key={label}>
          <a
            href={href}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {label}
          </a>
        </li>
      ))}
    </ul>
  </div>
)

export const MarketingFooterLinks = () => {
  const productLinks = [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Documentation', href: '/docs' },
    { label: 'API Reference', href: '/api' },
  ]

  const companyLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ]

  const resourceLinks = [
    { label: 'Community', href: '/community' },
    { label: 'Support', href: '/support' },
    { label: 'Status', href: '/status' },
    { label: 'Partners', href: '/partners' },
  ]

  return (
    <div className="w-full bg-black border-t border-border/40 md:pb-32">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4">
          <FooterLinkGroup title="Product" links={productLinks} />
          <FooterLinkGroup title="Company" links={companyLinks} />
          <FooterLinkGroup title="Resources" links={resourceLinks} />

          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <NewsletterForm />
          </div>
        </div>
      </div>
    </div>
  )
}
