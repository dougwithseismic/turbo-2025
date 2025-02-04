import { RealMockData } from '../utils/real-data'

export interface ActionCheck {
  type: string
  category: 'SEO' | 'Performance' | 'Content' | 'Mobile' | 'Security'
  description: string
  reasoning: string
  check: (page: RealMockData['pages'][0]) => boolean
}

export const SEO_CHECKS: ActionCheck[] = [
  {
    type: 'Missing Title',
    category: 'SEO',
    description: 'Page is missing a title tag or has an empty title',
    reasoning:
      'Title tags are crucial for search engines to understand page content and are often displayed in search results',
    check: (page) => !page.seo.title,
  },
  {
    type: 'Title Too Long',
    category: 'SEO',
    description: 'Page title exceeds 60 characters',
    reasoning:
      'Search engines typically display only the first 50-60 characters of a title in search results, making longer titles less effective',
    check: (page) =>
      typeof page.seo.title === 'string' && page.seo.title.length > 60,
  },
  {
    type: 'Title Too Short',
    category: 'SEO',
    description: 'Page title is shorter than 30 characters',
    reasoning:
      'Short titles may not provide enough context about the page content and miss opportunities to target relevant keywords',
    check: (page) =>
      typeof page.seo.title === 'string' && page.seo.title.length < 30,
  },
  {
    type: 'Missing H1',
    category: 'SEO',
    description: 'Page does not contain any H1 heading',
    reasoning:
      'H1 headings help search engines understand the main topic of a page and are important for content hierarchy',
    check: (page) => !page.seo.headings.h1.length,
  },
  {
    type: 'Multiple H1s',
    category: 'SEO',
    description: 'Page contains more than one H1 heading',
    reasoning:
      'Multiple H1s can confuse search engines about the main topic of the page and may impact content hierarchy',
    check: (page) => page.seo.headings.h1.length > 1,
  },
  {
    type: 'Missing Meta Description',
    category: 'SEO',
    description: 'Page is missing a meta description',
    reasoning:
      'Meta descriptions often appear in search results and help users understand page content before clicking',
    check: (page) =>
      !page.seo.metaTags.some((tag) => tag.name === 'description'),
  },
]

export const PERFORMANCE_CHECKS: ActionCheck[] = [
  {
    type: 'Poor FCP',
    category: 'Performance',
    description: 'First Contentful Paint (FCP) is above 2000ms',
    reasoning:
      'FCP measures how long it takes for the first content to appear, affecting user perception of page speed',
    check: (page) => page.performance.coreWebVitals.fcp > 2000,
  },
  {
    type: 'Poor LCP',
    category: 'Performance',
    description: 'Largest Contentful Paint (LCP) is above 2500ms',
    reasoning:
      'LCP measures loading performance and should occur within 2.5 seconds for a good user experience',
    check: (page) => page.performance.coreWebVitals.lcp > 2500,
  },
  {
    type: 'Poor CLS',
    category: 'Performance',
    description: 'Cumulative Layout Shift (CLS) is above 0.1',
    reasoning:
      'High CLS values indicate visual instability, which can frustrate users and lead to accidental clicks',
    check: (page) => page.performance.coreWebVitals.cls > 0.1,
  },
  {
    type: 'Slow TTFB',
    category: 'Performance',
    description: 'Time to First Byte (TTFB) is above 600ms',
    reasoning:
      'TTFB indicates server response time and backend performance, affecting overall page load speed',
    check: (page) => page.performance.coreWebVitals.ttfb > 600,
  },
  {
    type: 'Large Page Size',
    category: 'Performance',
    description: 'Page size exceeds 500KB',
    reasoning:
      'Large page sizes can lead to slower load times, especially on mobile devices or slow connections',
    check: (page) => page.content.contentLength > 500000,
  },
]

export const CONTENT_CHECKS: ActionCheck[] = [
  {
    type: 'Low Word Count',
    category: 'Content',
    description: 'Page contains fewer than 300 words',
    reasoning:
      'Pages with thin content may provide less value to users and may not rank well in search results',
    check: (page) => page.content.wordCount < 300,
  },
  {
    type: 'Missing Images',
    category: 'Content',
    description: 'Page does not contain any images',
    reasoning:
      'Images can enhance user engagement and help explain complex concepts more effectively',
    check: (page) => !page.content.contentQuality.hasImages,
  },
  {
    type: 'Poor Text/HTML Ratio',
    category: 'Content',
    description: 'Text to HTML ratio is below 10%',
    reasoning:
      'A low text-to-HTML ratio may indicate content that is too thin or heavily markup-based',
    check: (page) => page.content.contentQuality.textToHtmlRatio < 0.1,
  },
]

export const MOBILE_CHECKS: ActionCheck[] = [
  {
    type: 'Small Touch Targets',
    category: 'Mobile',
    description: 'More than 30% of touch targets are too small',
    reasoning:
      'Small touch targets can make it difficult for mobile users to interact with the page accurately',
    check: (page) =>
      (page.mobileFriendliness.touchTargets.tooSmall /
        page.mobileFriendliness.touchTargets.total) *
        100 >
      30,
  },
  {
    type: 'Not Responsive',
    category: 'Mobile',
    description: 'Page is not responsive to different screen sizes',
    reasoning:
      'Non-responsive pages provide poor user experience on mobile devices and may be penalized in mobile search results',
    check: (page) => !page.mobileFriendliness.isResponsive,
  },
]

export const SECURITY_CHECKS: ActionCheck[] = [
  {
    type: 'Missing HTTPS',
    category: 'Security',
    description: 'Page is not served over HTTPS',
    reasoning:
      'HTTPS is essential for security and is a ranking factor in search engines',
    check: (page) => !page.security.https,
  },
  {
    type: 'Missing HSTS',
    category: 'Security',
    description: 'HTTP Strict Transport Security (HSTS) header is not set',
    reasoning:
      'HSTS helps protect against protocol downgrade attacks and cookie hijacking',
    check: (page) => !page.security.headers.hsts,
  },
]

export const ALL_ACTION_CHECKS: ActionCheck[] = [
  ...SEO_CHECKS,
  ...PERFORMANCE_CHECKS,
  ...CONTENT_CHECKS,
  ...MOBILE_CHECKS,
  ...SECURITY_CHECKS,
]
