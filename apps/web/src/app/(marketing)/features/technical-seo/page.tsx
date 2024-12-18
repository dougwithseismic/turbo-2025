import { Metadata } from 'next'
import { FeatureDetails } from '@/features/features/components/feature-details'

export const metadata: Metadata = {
  title: 'Technical SEO - Complete SEO Platform',
  description:
    'Comprehensive technical SEO tools to optimize your site structure, performance, and crawlability. Identify and fix issues before they impact your rankings.',
}

const feature = {
  name: 'Technical SEO',
  description:
    'Get a complete view of your technical SEO health with our comprehensive suite of tools. From site structure to performance optimization, we help you build a solid technical foundation for better rankings.',
  benefits: [
    {
      name: 'Complete Technical Overview',
      description:
        'Get a holistic view of your technical SEO health with comprehensive reports covering all critical aspects of your site.',
    },
    {
      name: 'Proactive Issue Prevention',
      description:
        'Catch and fix technical issues before they impact your rankings with continuous monitoring and early warning alerts.',
    },
    {
      name: 'Performance Optimization',
      description:
        'Improve user experience and rankings with detailed performance insights and optimization recommendations.',
    },
    {
      name: 'Mobile-First Validation',
      description:
        'Ensure your site meets all mobile-first indexing requirements with comprehensive mobile SEO analysis.',
    },
  ],
  features: [
    {
      name: 'Site Architecture Analysis',
      description:
        'Analyze and optimize your site structure, internal linking, and URL architecture for better crawling and indexing.',
    },
    {
      name: 'Schema Markup Validator',
      description:
        'Validate and optimize your structured data to enhance your search appearance with rich snippets.',
    },
    {
      name: 'Core Web Vitals Monitor',
      description:
        'Track and improve your Core Web Vitals scores with real-time monitoring and actionable recommendations.',
    },
    {
      name: 'Hreflang Validator',
      description:
        'Ensure proper implementation of international targeting with comprehensive hreflang validation.',
    },
    {
      name: 'Security Analysis',
      description:
        'Identify and fix security issues that could affect your SEO performance, including SSL and HTTPS configuration.',
    },
    {
      name: 'Mobile Optimization',
      description:
        'Comprehensive mobile SEO analysis including viewport configuration, tap target sizing, and content parity.',
    },
  ],
  metrics: [
    {
      value: '95%',
      label: 'average technical score improvement',
    },
    {
      value: '2x',
      label: 'faster issue resolution',
    },
    {
      value: '200+',
      label: 'technical checkpoints',
    },
    {
      value: '24/7',
      label: 'continuous monitoring',
    },
  ],
  integrations: [
    {
      name: 'Google Search Console',
      description: 'Import coverage and mobile usability data for analysis.',
    },
    {
      name: 'PageSpeed Insights',
      description: 'Detailed performance data and optimization suggestions.',
    },
    {
      name: 'Google Analytics',
      description: 'Connect user behavior with technical issues.',
    },
    {
      name: 'Git Providers',
      description: 'Integrate with your development workflow.',
    },
  ],
  faqs: [
    {
      question: 'What technical aspects do you analyze?',
      answer:
        'We analyze all critical technical SEO aspects including site structure, internal linking, mobile optimization, Core Web Vitals, structured data, international targeting, security configuration, and more. Our analysis covers over 200 technical checkpoints.',
    },
    {
      question: 'How do you handle different site technologies?',
      answer:
        'Our platform supports all major web technologies including JavaScript frameworks, static sites, and server-side rendering. We automatically detect your technology stack and provide relevant recommendations.',
    },
    {
      question: 'Do you provide implementation guidance?',
      answer:
        'Yes, for each issue we detect, we provide detailed implementation guides, code examples, and best practices. Our recommendations are tailored to your specific technology stack.',
    },
    {
      question: 'How often should I run technical audits?',
      answer:
        'We recommend continuous monitoring for critical issues and comprehensive technical audits at least monthly. For sites with frequent changes, weekly audits may be more appropriate.',
    },
  ],
}

export default function TechnicalSEOPage() {
  return <FeatureDetails feature={feature} />
}
