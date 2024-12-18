import {
  TwitterIcon,
  LinkedInIcon,
  GithubIcon,
  YoutubeIcon,
  SlackIcon,
  DiscordIcon,
} from '@/components/icons/social-icons'

const footerSections = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Technical Audits', href: '/features/technical-audits' },
      { label: 'Keyword Research', href: '/features/keyword-research' },
      { label: 'Backlink Analysis', href: '/features/backlink-analysis' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'API Reference', href: '/api' },
      { label: 'SEO Guides', href: '/guides' },
      { label: 'Case Studies', href: '/case-studies' },
      { label: 'Blog', href: '/blog' },
      { label: 'Community', href: '/community' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press Kit', href: '/press' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/legal/privacy' },
      { label: 'Terms of Service', href: '/legal/terms' },
      { label: 'Cookie Policy', href: '/legal/cookies' },
      { label: 'DPA', href: '/legal/dpa' },
    ],
  },
]

const socialLinks = [
  {
    name: 'Twitter',
    href: 'https://twitter.com/seismic_io',
    icon: TwitterIcon,
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/withseismic/',
    icon: LinkedInIcon,
  },
  {
    name: 'GitHub',
    href: 'https://github.com/dougwithseismic',
    icon: GithubIcon,
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@dougsilkstone',
    icon: YoutubeIcon,
  },
  {
    name: 'Slack',
    href: 'https://seismic.link/slack',
    icon: SlackIcon,
  },
  {
    name: 'Discord',
    href: 'https://discord.gg/seismic',
    icon: DiscordIcon,
  },
]

export const MarketingFooter = () => {
  return (
    <footer className="w-full border-t border-border/40 bg-black">
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8">
        {/* Logo and Description */}
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <img src="/logo.svg" alt="Onsite" className="h-7 w-auto" />
            <p className="text-sm leading-6 text-gray-400">
              Empowering teams to improve their technical SEO and drive organic
              growth.
            </p>
            <div className="flex space-x-6">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                  aria-label={item.name}
                >
                  <item.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Sections */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {footerSections.slice(0, 2).map((section) => (
                <div key={section.title}>
                  <h3 className="text-sm font-semibold text-white">
                    {section.title}
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="text-sm text-gray-400 hover:text-white"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {footerSections.slice(2).map((section) => (
                <div key={section.title}>
                  <h3 className="text-sm font-semibold text-white">
                    {section.title}
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="text-sm text-gray-400 hover:text-white"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
          <div className="flex flex-col items-center justify-between gap-y-4 md:flex-row">
            <p className="text-xs leading-5 text-gray-400">
              &copy; {new Date().getFullYear()} Seismic Labs. All rights
              reserved.
            </p>
            <div className="flex items-center gap-x-4 text-xs text-gray-400">
              <span className="flex items-center gap-x-1">
                <span className="font-medium text-primary">50,000+</span> teams
              </span>
              <span className="h-4 w-px bg-gray-700" aria-hidden="true" />
              <span className="flex items-center gap-x-1">
                <span className="font-medium text-primary">93%</span> success
                rate
              </span>
              <span className="h-4 w-px bg-gray-700" aria-hidden="true" />
              <span className="flex items-center gap-x-1">
                Made with passion in SF
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
