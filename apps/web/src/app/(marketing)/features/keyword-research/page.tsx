import { Metadata } from 'next'
import { FeatureDetails } from '@/features/marketing/features/components/feature-details'

export const metadata: Metadata = {
  title: 'Keyword Research - Complete SEO Platform',
  description:
    'Advanced keyword research tools to discover high-ROI ranking opportunities. Get detailed metrics on search volume, competition, and ranking potential.',
}

const feature = {
  name: 'Keyword Research',
  description:
    'Discover high-impact keywords your audience is searching for with our AI-powered research tools. Get detailed metrics on search volume, competition, and ranking potential to focus on the opportunities that matter most.',
  benefits: [
    {
      name: 'AI-Powered Suggestions',
      description:
        'Our AI analyzes millions of keywords to suggest the most relevant and valuable opportunities for your business.',
    },
    {
      name: 'Search Intent Analysis',
      description:
        'Understand user intent behind each keyword with SERP analysis and content type recommendations.',
    },
    {
      name: 'ROI Forecasting',
      description:
        'Predict potential traffic and conversions for each keyword to prioritize your SEO efforts effectively.',
    },
    {
      name: 'Competitor Insights',
      description:
        'See what keywords your competitors rank for and identify gaps in your keyword strategy.',
    },
  ],
  features: [
    {
      name: 'Keyword Discovery',
      description:
        'Find new keyword opportunities with advanced filters for search volume, difficulty, and intent.',
    },
    {
      name: 'SERP Analysis',
      description:
        'Analyze search results to understand what it takes to rank for each keyword.',
    },
    {
      name: 'Keyword Clustering',
      description:
        'Group related keywords to plan content and optimize for multiple terms.',
    },
    {
      name: 'Trend Analysis',
      description:
        'Track keyword popularity over time to identify seasonal trends and growing opportunities.',
    },
    {
      name: 'Question Analysis',
      description:
        'Find question-based keywords to target featured snippets and voice search.',
    },
    {
      name: 'Local Keyword Research',
      description:
        'Discover location-specific keywords and opportunities for local SEO.',
    },
  ],
  metrics: [
    {
      value: '20B+',
      label: 'keywords in database',
    },
    {
      value: '99.9%',
      label: 'data accuracy',
    },
    {
      value: '3.2x',
      label: 'faster keyword research',
    },
    {
      value: '200+',
      label: 'countries supported',
    },
  ],
  integrations: [
    {
      name: 'Google Search Console',
      description: 'Import your existing keyword performance data.',
    },
    {
      name: 'Google Analytics',
      description: 'Connect conversion data to keyword opportunities.',
    },
    {
      name: 'Content Tools',
      description: 'Export keywords to content optimization tools.',
    },
    {
      name: 'Rank Tracking',
      description: 'Monitor rankings for discovered keywords.',
    },
  ],
  faqs: [
    {
      question: 'How accurate is your keyword data?',
      answer:
        'Our keyword data is updated daily and cross-referenced with multiple sources including Google Search Console, clickstream data, and proprietary sources. We maintain a 99.9% accuracy rate for search volumes and trends.',
    },
    {
      question: 'How do you determine keyword difficulty?',
      answer:
        'Our keyword difficulty score considers multiple factors including domain authority of ranking sites, content quality, backlink profiles, and SERP features. This provides a more accurate prediction of ranking potential.',
    },
    {
      question: 'Can I research keywords in multiple languages?',
      answer:
        'Yes, we support keyword research in over 200 countries and all major languages. You can analyze keywords and search volumes specific to any location or language.',
    },
    {
      question: 'How often is keyword data updated?',
      answer:
        'Search volumes and metrics are updated daily. Trend data is updated monthly, and our AI continuously analyzes SERPs to provide the most current competition and difficulty scores.',
    },
  ],
}

export default function KeywordResearchPage() {
  return <FeatureDetails feature={feature} />
}
