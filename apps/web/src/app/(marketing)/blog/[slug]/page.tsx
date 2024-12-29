import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { notFound } from 'next/navigation'
import { getArticleBySlug } from '@/features/article/utility/get-article-by-slug'
import type { Metadata } from 'next'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  try {
    const slug = (await params).slug
    const { data: article, error } = await getArticleBySlug({ slug })

    if (error || !article) {
      throw new Error('Article not found')
    }

    return {
      title: article.title,
      description: article.description,
      openGraph: {
        title: article.title,
        description: article.description,
        images: [article.featuredImage],
      },
    }
  } catch (err: unknown) {
    console.error(err)
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.',
    }
  }
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function Page({ params }: PageProps) {
  const slug = (await params).slug
  const { data: article, error } = await getArticleBySlug({ slug })

  if (error || !article) {
    notFound()
  }

  return (
    <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 sm:mt-24 lg:mt-32">
      <div className="max-w-3xl mx-auto">
        <header className="flex flex-col gap-6 sm:gap-8">
          <div className="flex flex-col gap-4 sm:gap-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              {article.title}
            </h1>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                  <AvatarImage
                    src={article.authorAvatar}
                    alt={article.author}
                  />
                  <AvatarFallback>{article.author[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{article.author}</span>
                  <span className="text-sm text-muted-foreground">
                    {article.authorRole}
                  </span>
                </div>
              </div>

              <Separator
                orientation="vertical"
                className="hidden sm:block h-8"
              />
              <Separator
                orientation="horizontal"
                className="sm:hidden w-full"
              />

              <div className="flex flex-col gap-2">
                <div className="row">
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="row">
                  <time
                    className="text-sm text-muted-foreground"
                    dateTime={article.date}
                  >
                    {new Date(article.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <span className="hidden sm:inline text-muted-foreground">
                    •
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {article.readingTime}
                  </span>{' '}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="mt-8 sm:mt-12 prose prose-invert prose-lg max-w-none">
          {article.content}
        </div>
      </div>
    </article>
  )
}
