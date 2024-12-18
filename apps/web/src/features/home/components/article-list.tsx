import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

type Article = {
  title: string
  description: string
  author: {
    name: string
    role: string
    avatar: string
  }
  readingTime: string
  category: string
  date: string
  href: string
}

const articles: Article[] = [
  {
    title: 'How to Improve Core Web Vitals for Better Rankings',
    description:
      'Learn how to optimize your Core Web Vitals to improve user experience and boost your search rankings. Step-by-step guide with real examples.',
    author: {
      name: 'Sarah Chen',
      role: 'Technical SEO Lead',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9',
    },
    readingTime: '8 min read',
    category: 'Technical SEO',
    date: 'Mar 16, 2024',
    href: '/blog/improve-core-web-vitals',
  },
  {
    title: 'The Complete Guide to JavaScript SEO',
    description:
      'Master JavaScript SEO with our comprehensive guide. Learn how to ensure your JavaScript-heavy site is fully crawlable and indexable by search engines.',
    author: {
      name: 'Michael Torres',
      role: 'Senior Developer',
      avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5',
    },
    readingTime: '12 min read',
    category: 'Development',
    date: 'Mar 14, 2024',
    href: '/blog/javascript-seo-guide',
  },
  {
    title: 'E-E-A-T: What It Means for Your SEO Strategy',
    description:
      'Understand how Experience, Expertise, Authoritativeness, and Trustworthiness impact your search rankings and learn how to improve your E-E-A-T signals.',
    author: {
      name: 'Emily Watson',
      role: 'Content Strategist',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    },
    readingTime: '10 min read',
    category: 'Strategy',
    date: 'Mar 12, 2024',
    href: '/blog/eeat-seo-strategy',
  },
]

export const ArticleList = () => {
  return (
    <div className="bg-muted/5 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base/7 font-semibold text-primary">
            Latest Insights
          </h2>
          <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">
            Expert SEO strategies and tips
          </p>
          <p className="mt-6 text-lg text-muted-foreground">
            Stay ahead of the curve with our latest articles, guides, and case
            studies on technical SEO, content optimization, and more.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {articles.map((article) => (
            <article
              key={article.title}
              className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-background px-8 pb-8 pt-80 sm:pt-48 lg:pt-80"
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background/50 via-background/25 to-background/0" />

              {/* Category Badge */}
              <div className="mb-2">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {article.category}
                </span>
              </div>

              {/* Article Title & Description */}
              <h3 className="mt-3 text-lg font-semibold leading-6">
                <a href={article.href}>
                  <span className="absolute inset-0" />
                  {article.title}
                </a>
              </h3>
              <p className="mt-2 text-sm/6 text-muted-foreground">
                {article.description}
              </p>

              {/* Article Metadata */}
              <div className="mt-6 flex items-center gap-x-4 text-xs">
                <time dateTime={article.date} className="text-muted-foreground">
                  {article.date}
                </time>
                <span className="text-muted-foreground">
                  {article.readingTime}
                </span>
              </div>

              {/* Author Info */}
              <div className="mt-6 flex items-center gap-x-4">
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="size-10 rounded-full bg-muted"
                />
                <div className="text-sm leading-6">
                  <p className="font-semibold">{article.author.name}</p>
                  <p className="text-muted-foreground">{article.author.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View All Articles Link */}
        <div className="mt-16 flex justify-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90"
          >
            View all articles
            <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
