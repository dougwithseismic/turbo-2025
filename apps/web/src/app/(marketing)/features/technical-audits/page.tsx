import { Metadata } from 'next'
import { FeatureDetails } from '@/features/features/components/feature-details'

export const metadata: Metadata = {
  title: 'Technical SEO Audits - Complete SEO Platform',
  description:
    'Comprehensive technical SEO audits to identify and fix critical issues affecting your search rankings. Get actionable insights and prioritized recommendations.',
}

const feature = {
  name: 'Technical SEO Audits',
  description:
    'Identify and fix critical issues that are holding back your rankings.',
  benefits: [
    {
      name: 'Automated Daily Scans',
      description:
        'Our crawler automatically scans your site every day to catch new issues before they impact your rankings.',
    },
    {
      name: 'Prioritized Recommendations',
      description:
        'Get actionable recommendations prioritized by their potential impact on your search performance.',
    },
    {
      name: 'Core Web Vitals Analysis',
      description:
        'Monitor and optimize your Core Web Vitals scores to improve user experience and rankings.',
    },
    {
      name: 'Mobile Optimization',
      description:
        'Ensure your site is fully optimized for mobile-first indexing with detailed mobile audits.',
    },
  ],
  features: [
    {
      name: 'Technical Issue Detection',
      description:
        'Automatically identify technical SEO issues like broken links, duplicate content, missing meta tags, and more.',
    },
    {
      name: 'Performance Monitoring',
      description:
        'Track your site performance metrics and get alerts when issues arise.',
    },
    {
      name: 'Crawl Budget Optimization',
      description:
        'Analyze how search engines crawl your site and optimize your crawl budget.',
    },
    {
      name: 'Schema Markup Validation',
      description:
        'Validate your structured data and get recommendations for improvement.',
    },
    {
      name: 'Security Analysis',
      description:
        'Check for common security issues that could affect your SEO performance.',
    },
    {
      name: 'Custom Audit Rules',
      description:
        'Create custom audit rules tailored to your specific needs and requirements.',
    },
  ],
  metrics: [
    {
      value: '85%',
      label: 'of critical issues found in first scan',
    },
    {
      value: '2.5x',
      label: 'faster issue resolution',
    },
    {
      value: '24/7',
      label: 'continuous monitoring',
    },
    {
      value: '100+',
      label: 'audit checkpoints',
    },
  ],
  integrations: [
    {
      name: 'Google Search Console',
      description: 'Import and analyze your search performance data.',
    },
    {
      name: 'Google Analytics',
      description: 'Connect user behavior data with technical issues.',
    },
    {
      name: 'Slack',
      description: 'Get real-time alerts when issues are detected.',
    },
    {
      name: 'Jira',
      description: 'Create tickets for development team automatically.',
    },
  ],
  faqs: [
    {
      question: 'How often are technical audits performed?',
      answer:
        'Our system performs automated audits daily, with the option to run on-demand audits whenever needed. Critical issues are flagged and reported immediately.',
    },
    {
      question: 'What types of issues can the audit detect?',
      answer:
        'Our technical audits can detect a wide range of issues including broken links, missing meta tags, duplicate content, slow loading pages, mobile usability issues, structured data errors, and much more.',
    },
    {
      question: 'How are issues prioritized?',
      answer:
        'Issues are prioritized based on their potential impact on search rankings, the number of affected pages, and the complexity of implementation. Each issue is assigned a severity level from critical to low.',
    },
    {
      question: 'Can I customize the audit settings?',
      answer:
        'Yes, you can customize various aspects of the audit including crawl frequency, specific areas to focus on, and custom rules based on your specific requirements.',
    },
  ],
}

export default function TechnicalAuditsPage() {
  return <FeatureDetails feature={feature} />
}
