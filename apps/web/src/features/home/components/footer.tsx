import {
  TwitterIcon,
  LinkedInIcon,
  GithubIcon,
  YoutubeIcon,
  SlackIcon,
  DiscordIcon,
} from '@/components/icons/social-icons';

export const MarketingFooter = () => {
  return (
    <footer className="w-full bg-black border-t border-border/40 z-50">
      <div className="mx-auto flex max-w-7xl flex-col items-center space-y-6 px-6 py-8 md:flex-row md:items-center md:justify-between md:space-y-0 md:py-4">
        {/* Copyright - Left */}
        <div className="text-center text-sm text-gray-400 md:text-left">
          Copyright © {new Date().getFullYear()} Seismic Labs. All rights
          reserved.
        </div>

        {/* Terms and Privacy - Center */}
        <div className="flex space-x-6">
          <a
            href="/legal/terms"
            className="text-sm text-gray-400 hover:text-white"
          >
            Terms of Service
          </a>
          <a
            href="/legal/privacy"
            className="text-sm text-gray-400 hover:text-white"
          >
            Privacy Policy
          </a>
        </div>

        {/* Social Icons - Center */}
        <div className="flex items-center space-x-4">
          <a
            href="https://twitter.com/seismic_io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white"
            aria-label="Twitter"
          >
            <TwitterIcon className="h-4 w-4" />
          </a>
          <a
            href="https://www.linkedin.com/company/withseismic/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white"
            aria-label="LinkedIn"
          >
            <LinkedInIcon className="h-4 w-4" />
          </a>
          <a
            href="https://github.com/dougwithseismic"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white"
            aria-label="GitHub"
          >
            <GithubIcon className="h-4 w-4" />
          </a>
          <a
            href="https://www.youtube.com/@dougsilkstone"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white"
            aria-label="YouTube"
          >
            <YoutubeIcon className="h-4 w-4" />
          </a>
          <a
            href="https://seismic.link/slack"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white"
            aria-label="Slack"
          >
            <SlackIcon className="h-4 w-4" />
          </a>
          <a
            href="https://discord.gg/seismic"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white"
            aria-label="Discord"
          >
            <DiscordIcon className="h-4 w-4" />
          </a>
        </div>

        {/* Made with passion - Right */}
        <div className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-sm text-transparent">
            Made with passion, and Seismic
          </span>
        </div>
      </div>
    </footer>
  );
};
