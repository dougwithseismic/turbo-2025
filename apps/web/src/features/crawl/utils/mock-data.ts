import { faker } from '@faker-js/faker'

export interface UrlMetric {
  url: string
  status_code: number
  title: string | null
  meta_description: string | null
  h1: string[] | null
  load_time_ms: number | null
  word_count: number | null
  internal_links: number | null
  external_links: number | null
  images_count: number | null
  images_without_alt: number | null
}

// Example data for reference
export const exampleUrlMetrics: UrlMetric[] = [
  {
    url: 'https://example.com',
    status_code: 200,
    title: 'Example Domain',
    meta_description: 'This is an example website',
    h1: ['Welcome to Example'],
    load_time_ms: 450,
    word_count: 1200,
    internal_links: 15,
    external_links: 3,
    images_count: 8,
    images_without_alt: 2,
  },
  {
    url: 'https://example.com/about',
    status_code: 404,
    title: null,
    meta_description: null,
    h1: null,
    load_time_ms: null,
    word_count: null,
    internal_links: null,
    external_links: null,
    images_count: null,
    images_without_alt: null,
  },
  {
    url: 'https://example.com/blog',
    status_code: 301,
    title: 'Blog - Example',
    meta_description: 'Read our latest articles',
    h1: ['Latest Posts'],
    load_time_ms: 380,
    word_count: 2500,
    internal_links: 25,
    external_links: 8,
    images_count: 12,
    images_without_alt: 1,
  },
]

const generateValidUrl = () => {
  const domain = faker.internet.domainName()
  const paths = [
    '/blog',
    '/about',
    '/contact',
    '/products',
    '/services',
    '/pricing',
    '/team',
    '/careers',
    '/faq',
    '/support',
  ]
  const randomPath = faker.helpers.arrayElement(paths)
  const subPath =
    Math.random() > 0.5 ? `/${faker.helpers.slugify(faker.lorem.words(2))}` : ''
  return `https://${domain}${randomPath}${subPath}`
}

const generateStatusCode = () => {
  // Weight distribution for different status codes
  const weights = {
    200: 0.85, // 85% success
    301: 0.05, // 5% redirects
    404: 0.05, // 5% not found
    500: 0.05, // 5% server errors
  }

  const random = Math.random()
  if (random < weights[200]) return 200
  if (random < weights[200] + weights[301]) return 301
  if (random < weights[200] + weights[301] + weights[404]) return 404
  return 500
}

export const generateUrlMetric = (): UrlMetric => {
  const statusCode = generateStatusCode()
  const isSuccess = statusCode === 200

  // For non-200 status codes, return partial data
  if (!isSuccess) {
    return {
      url: generateValidUrl(),
      status_code: statusCode,
      title: null,
      meta_description: null,
      h1: null,
      load_time_ms: null,
      word_count: null,
      internal_links: null,
      external_links: null,
      images_count: null,
      images_without_alt: null,
    }
  }

  const imagesCount = faker.number.int({ min: 0, max: 30 })

  return {
    url: generateValidUrl(),
    status_code: statusCode,
    title: faker.lorem.words({ min: 3, max: 8 }),
    meta_description: faker.lorem.sentence(),
    h1: [faker.lorem.words({ min: 2, max: 6 })],
    load_time_ms: faker.number.int({ min: 100, max: 3000 }),
    word_count: faker.number.int({ min: 100, max: 5000 }),
    internal_links: faker.number.int({ min: 1, max: 50 }),
    external_links: faker.number.int({ min: 0, max: 20 }),
    images_count: imagesCount,
    images_without_alt: faker.number.int({ min: 0, max: imagesCount }),
  }
}

export const generateUrlMetrics = ({
  count,
}: {
  count: number
}): UrlMetric[] => {
  return Array.from({ length: count }, () => generateUrlMetric())
}
