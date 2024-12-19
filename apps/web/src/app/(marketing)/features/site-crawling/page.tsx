import { Metadata } from 'next'
import { FeatureDetails } from '@/features/marketing/features/components/feature-details'

export const metadata: Metadata = {
  title: 'Site Crawling - Complete SEO Platform',
  description:
    'Advanced site crawling engine that identifies technical issues, broken links, and crawlability problems before they impact your search rankings.',
}

const feature = {
  name: 'Site Crawling',
  description:
    'Our advanced crawling engine identifies technical issues, broken links, and crawlability problems before they impact your search rankings. Get deep insights into how search engines see your site.',
  benefits: [
    {
      name: 'JavaScript Rendering',
      description:
        'Our crawler fully renders JavaScript content, ensuring we catch issues that basic crawlers might miss in your dynamic content.',
    },
    {
      name: 'Mobile-First Analysis',
      description:
        'See your site exactly as mobile crawlers do, with detailed insights into mobile-specific issues and opportunities.',
    },
    {
      name: 'Crawl Budget Optimization',
      description:
        'Understand and optimize how search engines spend their crawl budget on your site for better indexing.',
    },
    {
      name: 'Real-Time Error Detection',
      description:
        'Catch critical issues like broken links, redirect chains, and server errors as soon as they appear.',
    },
  ],
  features: [
    {
      name: 'Custom Crawl Rules',
      description:
        'Define custom crawl patterns and rules to focus on the most important parts of your site.',
    },
    {
      name: 'Crawl Scheduling',
      description:
        'Schedule crawls during off-peak hours to minimize impact on your server resources.',
    },
    {
      name: 'Sitemap Generation',
      description:
        'Automatically generate and validate XML sitemaps based on crawl results.',
    },
    {
      name: 'Robots.txt Validation',
      description:
        'Verify your robots.txt configuration and test how it affects crawlability.',
    },
    {
      name: 'Internal Link Analysis',
      description:
        'Get detailed insights into your internal linking structure and opportunities for improvement.',
    },
    {
      name: 'Content Extraction',
      description:
        'Extract and analyze content from JavaScript-rendered pages for SEO optimization.',
    },
  ],
  metrics: [
    {
      value: '100%',
      label: 'JavaScript rendering accuracy',
    },
    {
      value: '10M+',
      label: 'pages crawled daily',
    },
    {
      value: '<0.1s',
      label: 'average response time',
    },
    {
      value: '99.9%',
      label: 'crawl completion rate',
    },
  ],
  integrations: [
    {
      name: 'Google Search Console',
      description:
        'Compare crawl data with Google Search Console index coverage.',
    },
    {
      name: 'Cloudflare',
      description: 'Optimize crawling through your CDN configuration.',
    },
    {
      name: 'Server Monitoring',
      description: 'Monitor server impact during crawls.',
    },
    {
      name: 'CI/CD Pipelines',
      description: 'Automate crawls in your deployment process.',
    },
  ],
  faqs: [
    {
      question: 'How does JavaScript rendering work?',
      answer:
        'Our crawler uses a headless browser to fully render JavaScript content, just like Google does. This ensures we catch all dynamic content and potential issues that might affect your SEO.',
    },
    {
      question: 'Will crawling affect my site performance?',
      answer:
        'No, our crawler is designed to be respectful of your server resources. You can set custom crawl rates and schedule crawls during off-peak hours. We also support IP whitelisting for better control.',
    },
    {
      question: 'How often should I crawl my site?',
      answer:
        'It depends on how frequently your site content changes. For most sites, we recommend daily crawls of critical pages and weekly full-site crawls. You can customize the frequency based on your needs.',
    },
    {
      question: 'What crawl limits are there?',
      answer:
        'Crawl limits depend on your plan. Enterprise plans include unlimited crawling, while other plans have monthly page limits. All plans include the ability to prioritize critical pages for more frequent crawling.',
    },
  ],
}

export default function SiteCrawlingPage() {
  return <FeatureDetails feature={feature} />
}
