import { Metadata } from 'next'
import { FeatureDetails } from '@/features/marketing/features/components/feature-details'

export const metadata: Metadata = {
  title: 'Backlink Analysis - Complete SEO Platform',
  description:
    'Comprehensive backlink analysis tools to monitor your link profile, discover new opportunities, and track competitor backlinks. Get detailed metrics on link quality and authority.',
}

const feature = {
  name: 'Backlink Analysis',
  description:
    'Get a complete view of your backlink profile with our advanced analysis tools. Monitor new and lost links, analyze link quality, and discover opportunities to strengthen your link building strategy.',
  benefits: [
    {
      name: 'Complete Link Profile',
      description:
        'Track all your backlinks with detailed metrics on authority, relevance, and link attributes.',
    },
    {
      name: 'Competitor Analysis',
      description:
        'Analyze competitor backlink profiles to discover new link building opportunities and gaps in your strategy.',
    },
    {
      name: 'Link Quality Metrics',
      description:
        'Evaluate link quality with comprehensive metrics including domain authority, trust flow, and spam score.',
    },
    {
      name: 'Opportunity Discovery',
      description:
        'Find new link building opportunities through competitor analysis and industry research.',
    },
  ],
  features: [
    {
      name: 'Link Monitoring',
      description:
        'Track new and lost backlinks with instant notifications for important changes.',
    },
    {
      name: 'Link Gap Analysis',
      description: 'Identify domains linking to competitors but not to you.',
    },
    {
      name: 'Anchor Text Analysis',
      description:
        'Analyze anchor text distribution and optimize for natural link profiles.',
    },
    {
      name: 'Link Intersect',
      description:
        'Find domains linking to multiple competitors to identify high-value targets.',
    },
    {
      name: 'Toxic Link Detection',
      description:
        'Identify and monitor potentially harmful links with our risk assessment system.',
    },
    {
      name: 'Link Outreach',
      description:
        'Manage link building campaigns with integrated outreach and tracking tools.',
    },
  ],
  metrics: [
    {
      value: '15T+',
      label: 'backlinks indexed',
    },
    {
      value: '98%',
      label: 'link discovery rate',
    },
    {
      value: '24/7',
      label: 'link monitoring',
    },
    {
      value: '500M+',
      label: 'domains analyzed',
    },
  ],
  integrations: [
    {
      name: 'Google Search Console',
      description: 'Import links reported in GSC.',
    },
    {
      name: 'Disavow Tool',
      description: 'Generate and manage disavow files.',
    },
    {
      name: 'Email Platforms',
      description: 'Connect for outreach campaigns.',
    },
    {
      name: 'CRM Systems',
      description: 'Track link building relationships.',
    },
  ],
  faqs: [
    {
      question: 'How fresh is your backlink data?',
      answer:
        'Our backlink index is updated continuously, with new links typically discovered within 24 hours of creation. Historical data is preserved for trend analysis.',
    },
    {
      question: 'How do you measure link quality?',
      answer:
        'We analyze multiple factors including domain authority, relevance, traffic, trust metrics, and contextual placement to provide a comprehensive link quality score.',
    },
    {
      question: 'Can I track competitor backlinks?',
      answer:
        'Yes, you can track and analyze backlinks for any domain. Our competitor analysis tools help you identify valuable link opportunities and track their link building strategies.',
    },
    {
      question: 'How do you handle toxic links?',
      answer:
        'Our system automatically identifies potentially toxic links using machine learning and provides risk scores. You can easily export these links for disavow or conduct outreach for removal.',
    },
  ],
}

export default function BacklinkAnalysisPage() {
  return <FeatureDetails feature={feature} />
}
