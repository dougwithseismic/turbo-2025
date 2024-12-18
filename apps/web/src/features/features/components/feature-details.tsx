'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { motion, Variants } from 'framer-motion'
import { ArrowRight, ArrowUpRight, CheckCircle2, Sparkles } from 'lucide-react'
import { Article, ArticleCard } from '../../article/components/article-card'

type FeatureDetailsProps = {
  feature: {
    name: string
    description: string
    benefits?: {
      name: string
      description: string
    }[]
    features?: {
      name: string
      description: string
    }[]
    metrics?: {
      value: string
      label: string
    }[]
    integrations?: {
      name: string
      description: string
    }[]
    faqs?: {
      question: string
      answer: string
    }[]
    relatedFeatures?: {
      previous?: {
        name: string
        description: string
        href: string
      }
      next?: {
        name: string
        description: string
        href: string
      }
    }
  }
}

const animations = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  } as Variants,
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  } as Variants,
}

const featuredTestimonial = {
  body: 'Within 2 weeks of using this feature, we saw a 150% increase in our conversion rate. The automated workflows and insights helped us identify opportunities we were completely missing.',
  author: {
    name: 'Sarah Chen',
    role: 'Head of SEO at TechCorp',
    imageUrl:
      'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
}

const articles: Article[] = [
  {
    title: 'Maximizing ROI with SEO Automation',
    description:
      'Learn how to leverage automation to scale your SEO efforts and achieve better results with less manual work.',
    author: {
      name: 'Michael Torres',
      role: 'SEO Strategist',
      avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5',
    },
    date: 'Mar 16, 2024',
    readingTime: '8 min read',
    href: '/blog/seo-automation-roi',
    category: 'Technical SEO',
  },
  {
    title: 'The Future of Technical SEO',
    description:
      'Discover emerging trends and technologies that will shape the future of technical SEO and how to prepare for them.',
    author: {
      name: 'Emma Watson',
      role: 'Technical SEO Lead',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9',
    },
    date: 'Mar 14, 2024',
    readingTime: '10 min read',
    href: '/blog/future-of-technical-seo',
    category: 'Strategy',
  },
  {
    title: 'Building an SEO-First Content Strategy',
    description:
      'A comprehensive guide to creating content that ranks well and drives meaningful organic traffic to your site.',
    author: {
      name: 'James Liu',
      role: 'Content Strategist',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    },
    date: 'Mar 12, 2024',
    readingTime: '12 min read',
    href: '/blog/seo-first-content-strategy',
    category: 'Content',
  },
]

export const FeatureDetails = ({ feature }: FeatureDetailsProps) => {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative isolate min-h-[80vh] flex items-center">
        <div className="relative w-full pt-24 sm:pt-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              initial="initial"
              animate="animate"
              variants={animations.stagger}
              className="flex flex-col items-center text-center gap-8 py-12 md:py-20"
            >
              <motion.div
                variants={animations.fadeInUp}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary"
              >
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">{feature.name}</span>
              </motion.div>

              <motion.h1
                variants={animations.fadeInUp}
                className="max-w-3xl text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
              >
                {feature.description}
              </motion.h1>

              <motion.p
                variants={animations.fadeInUp}
                className="max-w-2xl text-lg sm:text-xl text-muted-foreground"
              >
                Here's how Onsite SEO can help you with {feature.name}.
              </motion.p>

              <motion.div
                variants={animations.fadeInUp}
                className="flex flex-wrap justify-center gap-6"
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm">
                    5-minute setup • No credit card
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50">
                  <span className="text-primary font-bold">50,000+</span>
                  <span className="text-sm">sites monitored</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50">
                  <span className="text-primary font-bold">93%</span>
                  <span className="text-sm">report ranking improvements</span>
                </div>
              </motion.div>

              <motion.div variants={animations.fadeInUp} className="flex gap-4">
                <Button size="lg" asChild>
                  <a href="/register" className="group">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
                <Button size="lg" variant="outline">
                  View Demo
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      {feature.metrics && feature.metrics.length > 0 && (
        <section className="relative py-24 sm:py-32">
          <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={animations.stagger}
              className="flex flex-col items-center gap-16"
            >
              <motion.h2
                variants={animations.fadeInUp}
                className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
              >
                Key Metrics & Results
              </motion.h2>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {feature.metrics.map((metric, index) => (
                  <Card key={metric.label} className="p-6">
                    <div className="relative">
                      <span className="absolute -top-1 right-0 text-sm font-medium text-muted-foreground opacity-50">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>

                      <motion.dd
                        className="text-4xl font-bold tracking-tight"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                      >
                        {metric.value}
                      </motion.dd>

                      <dt className="text-sm font-medium text-muted-foreground">
                        {metric.label}
                      </dt>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Benefits Section */}
      {feature.benefits && feature.benefits.length > 0 && (
        <section className="relative py-24 sm:py-32">
          <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={animations.stagger}
              className="flex flex-col items-center gap-16"
            >
              <motion.h2
                variants={animations.fadeInUp}
                className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
              >
                Key Benefits
              </motion.h2>
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {feature.benefits.map((benefit) => (
                  <Card key={benefit.name} className="p-6">
                    <div className="flex flex-col gap-4">
                      <h3 className="flex items-center gap-3 text-lg font-semibold">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        </div>
                        {benefit.name}
                      </h3>
                      <p className="text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Features Section */}
      {feature.features && feature.features.length > 0 && (
        <section className="py-24 sm:py-32" id="features">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={animations.stagger}
              className="flex flex-col items-center gap-16"
            >
              <motion.h2
                variants={animations.fadeInUp}
                className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
              >
                Features & Capabilities
              </motion.h2>
              <dl className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
                {feature.features.map((item, index) => (
                  <Card
                    key={item.name}
                    className="group relative overflow-hidden p-8"
                  >
                    <div className="flex flex-col gap-4">
                      <dt className="flex items-center gap-4 text-lg font-semibold">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          {(index + 1).toString().padStart(2, '0')}
                        </span>
                        {item.name}
                      </dt>
                      <dd className="text-muted-foreground">
                        {item.description}
                      </dd>
                    </div>
                  </Card>
                ))}
              </dl>
            </motion.div>
          </div>
        </section>
      )}

      {/* Integrations Section */}
      {feature.integrations && feature.integrations.length > 0 && (
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={animations.stagger}
              className="flex flex-col items-center gap-16"
            >
              <motion.h2
                variants={animations.fadeInUp}
                className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
              >
                Integrations
              </motion.h2>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {feature.integrations.map((integration) => (
                  <Card
                    key={integration.name}
                    className="group relative overflow-hidden p-8"
                  >
                    <div className="flex flex-col gap-4">
                      <h3 className="text-lg font-semibold">
                        {integration.name}
                      </h3>
                      <p className="text-muted-foreground">
                        {integration.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* FAQs Section */}
      {feature.faqs && feature.faqs.length > 0 && (
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={animations.stagger}
              className="mx-auto max-w-4xl flex flex-col items-center gap-16"
            >
              <motion.h2
                variants={animations.fadeInUp}
                className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
              >
                Frequently asked questions
              </motion.h2>
              <dl className="flex flex-col gap-8 w-full">
                {feature.faqs.map((faq) => (
                  <Card
                    key={faq.question}
                    className="group relative overflow-hidden p-8"
                  >
                    <div className="flex flex-col gap-4">
                      <dt className="text-lg font-semibold">{faq.question}</dt>
                      <dd className="text-muted-foreground">{faq.answer}</dd>
                    </div>
                  </Card>
                ))}
              </dl>
            </motion.div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <section className="relative py-24 sm:py-32">
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={animations.stagger}
            className="flex flex-col items-center gap-16"
          >
            <motion.div
              variants={animations.fadeInUp}
              className="mx-auto max-w-2xl text-center flex flex-col gap-2"
            >
              <h2 className="text-base/7 font-semibold text-primary">
                Success Stories
              </h2>
              <p className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Real results with {feature.name}
              </p>
            </motion.div>

            <Card className="mx-auto max-w-2xl p-6 sm:p-8">
              <div className="flex flex-col gap-6">
                <blockquote className="text-lg/7 font-semibold tracking-tight sm:text-xl/8">
                  <p>"{featuredTestimonial.body}"</p>
                </blockquote>
                <figcaption className="flex items-center gap-x-6 border-t border-muted-foreground/10 pt-6">
                  <img
                    className="size-12 rounded-full bg-muted"
                    src={featuredTestimonial.author.imageUrl}
                    alt=""
                  />
                  <div className="flex flex-col">
                    <div className="font-semibold">
                      {featuredTestimonial.author.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {featuredTestimonial.author.role}
                    </div>
                  </div>
                </figcaption>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="relative py-24 sm:py-32">
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={animations.stagger}
            className="flex flex-col items-center gap-16"
          >
            <motion.div
              variants={animations.fadeInUp}
              className="mx-auto max-w-2xl text-center flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-base/7 font-semibold text-primary">
                  Learn More
                </h2>
                <p className="text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">
                  Expert insights about {feature.name}
                </p>
              </div>
              <p className="text-lg text-muted-foreground">
                Stay ahead of the curve with our latest articles, guides, and
                case studies.
              </p>
            </motion.div>

            <motion.div
              variants={animations.fadeInUp}
              className="mx-auto grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3"
            >
              {articles.slice(0, 3).map((article) => (
                <ArticleCard key={article.title} article={article} />
              ))}
            </motion.div>

            <motion.div variants={animations.fadeInUp}>
              <a
                href="/blog"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90"
              >
                View all articles
                <ArrowUpRight className="h-5 w-5" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Related Features */}
      <section className="relative py-24 sm:py-32">
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={animations.stagger}
            className="flex flex-col items-center gap-16"
          >
            <motion.div
              variants={animations.fadeInUp}
              className="mx-auto max-w-2xl text-center flex flex-col gap-2"
            >
              <h2 className="text-base/7 font-semibold text-primary">
                Explore More
              </h2>
              <p className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Complete your SEO toolkit
              </p>
            </motion.div>

            <motion.div
              variants={animations.fadeInUp}
              className="mx-auto grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2"
            >
              {feature.relatedFeatures?.previous && (
                <Card className="p-6">
                  <a
                    href={feature.relatedFeatures.previous.href}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      <ArrowUpRight className="h-4 w-4" />
                      <span>Previous Feature</span>
                    </div>
                    <h3 className="text-lg font-semibold">
                      {feature.relatedFeatures.previous.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.relatedFeatures.previous.description}
                    </p>
                  </a>
                </Card>
              )}

              {feature.relatedFeatures?.next && (
                <Card className="p-6">
                  <a
                    href={feature.relatedFeatures.next.href}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      <span>Next Feature</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                    <h3 className="text-lg font-semibold">
                      {feature.relatedFeatures.next.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.relatedFeatures.next.description}
                    </p>
                  </a>
                </Card>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
