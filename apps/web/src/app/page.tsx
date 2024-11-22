import type { Metadata } from 'next'
import Banner from '@/components/banner/banner'
import FeaturedCompanies from '@/components/featured-companies/featured-companies'

export const metadata: Metadata = {
  title: 'Find Your Next Job | Job Board',
  description:
    'Discover your next career opportunity. Browse the latest jobs from top companies and apply today.',
  openGraph: {
    title: 'Find Your Next Job | Job Board',
    description:
      'Discover your next career opportunity. Browse the latest jobs from top companies and apply today.',
    type: 'website',
    url: 'https://your-domain.com',
    siteName: 'Job Board',
    images: [
      {
        url: '/og-image.png', // You'll need to add this image to your public folder
        width: 1200,
        height: 630,
        alt: 'Job Board - Find Your Next Opportunity',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Your Next Job | Job Board',
    description:
      'Discover your next career opportunity. Browse the latest jobs from top companies and apply today.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

interface Job {
  id: string | number
  // Add other job properties as needed
}

export const revalidate = 3600 // Revalidate every hour

export const generateStaticProps = async () => {
  // Fetch any data you need at build time
  const initialJobs = await getLatestJobs()
  const initialCompanies = await getFeaturedCompanies()

  return {
    props: {
      initialJobs,
      initialCompanies,
    },
  }
}

const getLatestJobs = async (): Promise<Job[]> => {
  // TODO: Implement API call to fetch latest jobs
  return []
}

const getFeaturedCompanies = async () => {
  // TODO: Implement API call to fetch featured companies
  return []
}

const HomePage = async () => {
  const latestJobs = await getLatestJobs()
  const featuredCompanies = await getFeaturedCompanies()

  return (
    <main className="min-h-screen">
      <Banner className="mb-8">
        <div className="container mx-auto">
          {/* Add your advertising content here */}
          <p>Advertisement Space</p>
        </div>
      </Banner>

      <div className="container mx-auto px-4">
        <section className="mb-8">
          <h1 className="text-4xl font-bold mb-6">
            Find Your Next Opportunity
          </h1>

          <div className="mb-8">
            <input
              type="search"
              placeholder="Search jobs..."
              className="w-full max-w-2xl px-4 py-2 border rounded-lg"
            />
          </div>

          <div className="flex gap-4 mb-6">
            {/* Add filter buttons/dropdowns here */}
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-100">
              Location
            </button>
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-100">
              Job Type
            </button>
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-100">
              Experience Level
            </button>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Latest Jobs</h2>
          <div className="grid gap-4">
            {latestJobs.map((job) => (
              // Add JobCard component here
              <div key={job.id}>Job listing</div>
            ))}
          </div>
        </section>

        <FeaturedCompanies companies={featuredCompanies} />
      </div>
    </main>
  )
}

export default HomePage
