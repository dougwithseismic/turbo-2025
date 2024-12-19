import { Metadata } from 'next'
import { FeatureDetails } from '@/features/marketing/features/components/feature-details'

export const metadata: Metadata = {
  title: 'Rank Tracking - Complete SEO Platform',
  description:
    'Advanced rank tracking with real-time SERP monitoring, competitor analysis, and detailed performance insights. Track your rankings across all search engines and locations.',
}

const feature = {
  name: 'Rank Tracking',
  description:
    'Monitor your search rankings in real-time across all major search engines and locations. Get detailed insights into ranking changes, SERP features, and competitor movements to stay ahead of the competition.',
  benefits: [
    {
      name: 'Real-time Monitoring',
      description:
        'Track your rankings as they happen with instant notifications for significant changes and opportunities.',
    },
    {
      name: 'Universal Search Coverage',
      description:
        'Monitor rankings across web search, mobile, local pack, featured snippets, and other SERP features.',
    },
    {
      name: 'Competitor Tracking',
      description:
        "Track your competitors' rankings and analyze their performance to identify opportunities and threats.",
    },
    {
      name: 'Performance Analytics',
      description:
        'Get detailed performance insights with custom reports, trend analysis, and ranking distribution data.',
    },
  ],
  features: [
    {
      name: 'Daily Rank Updates',
      description:
        'Get fresh ranking data daily with on-demand updates for priority keywords.',
    },
    {
      name: 'SERP Feature Tracking',
      description:
        'Monitor your presence in featured snippets, knowledge panels, and other SERP features.',
    },
    {
      name: 'Local Rank Tracking',
      description:
        'Track rankings for specific locations down to the postal code level.',
    },
    {
      name: 'Custom Reports',
      description:
        'Create custom reports with the metrics and insights that matter to your business.',
    },
    {
      name: 'Share of Voice Analysis',
      description:
        'Measure your overall search visibility compared to competitors.',
    },
    {
      name: 'Historical Data',
      description:
        'Access complete ranking history with detailed trend analysis and seasonality insights.',
    },
  ],
  metrics: [
    {
      value: '100M+',
      label: 'daily rank checks',
    },
    {
      value: '99.9%',
      label: 'data accuracy',
    },
    {
      value: '50K+',
      label: 'locations tracked',
    },
    {
      value: '100%',
      label: 'SERP feature coverage',
    },
  ],
  integrations: [
    {
      name: 'Google Search Console',
      description: 'Import and verify ranking data with GSC.',
    },
    {
      name: 'Google Analytics',
      description: 'Connect traffic data to ranking positions.',
    },
    {
      name: 'Data Studio',
      description: 'Create custom ranking dashboards.',
    },
    {
      name: 'Slack & Teams',
      description: 'Get ranking alerts in your team chat.',
    },
  ],
  faqs: [
    {
      question: 'How often are rankings updated?',
      answer:
        'Rankings are updated daily by default, with the option for real-time tracking on priority keywords. You can also trigger manual updates whenever needed.',
    },
    {
      question: 'How accurate is the location-based tracking?',
      answer:
        'Our location-based tracking is accurate down to the postal code level, using a network of proxy servers to provide genuine local search results.',
    },
    {
      question: 'Can I track mobile vs desktop rankings?',
      answer:
        'Yes, we track rankings separately for mobile and desktop, allowing you to understand differences in performance across devices.',
    },
    {
      question: 'How many keywords can I track?',
      answer:
        'Our platform scales to track millions of keywords. Each plan includes a specific keyword quota, and you can add more as needed.',
    },
  ],
}

export default function RankTrackingPage() {
  return <FeatureDetails feature={feature} />
}
