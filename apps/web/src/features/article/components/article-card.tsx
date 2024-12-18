import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Article, ArticleMetadata } from '../utility/types'

interface ArticleCardProps {
  article: ArticleMetadata
  isHero?: boolean
}

export function ArticleCard({ article, isHero = false }: ArticleCardProps) {
  return (
    <article
      className={cn(
        'flex flex-col items-start',
        isHero && 'lg:grid lg:grid-cols-2 lg:gap-x-8',
      )}
    >
      <div
        className={cn(
          'relative w-full',
          isHero && 'lg:aspect-[3/2]',
          !isHero && 'aspect-[16/9]',
        )}
      >
        <img
          src={article.featuredImage}
          alt={article.title}
          className={cn(
            'rounded-2xl bg-muted object-cover',
            isHero ? 'lg:aspect-[3/2]' : 'aspect-[16/9]',
          )}
        />
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-muted/10" />
      </div>

      <div className={cn('max-w-xl', isHero && 'lg:mt-0', !isHero && 'mt-8')}>
        {article.tags && article.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-x-4 text-xs">
          <time dateTime={article.date} className="text-muted-foreground">
            {new Date(article.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          <span className="text-muted-foreground">{article.readingTime}</span>
        </div>

        <div className="group relative">
          <h3
            className={cn(
              'mt-3 font-semibold leading-6',
              isHero ? 'text-2xl' : 'text-lg',
            )}
          >
            <Link href={`/blog/${article.slug}`}>
              <span className="absolute inset-0" />
              {article.title}
            </Link>
          </h3>
          <p
            className={cn(
              'mt-5 line-clamp-3 text-muted-foreground',
              isHero ? 'text-base' : 'text-sm',
            )}
          >
            {article.description}
          </p>
        </div>

        <div className="relative mt-8 flex items-center gap-x-4">
          <img
            src={article.authorAvatar}
            alt={article.author}
            className="h-10 w-10 rounded-full bg-muted"
          />
          <div className="text-sm leading-6">
            <p className="font-semibold">
              <span className="absolute inset-0" />
              {article.author}
            </p>
            <p className="text-muted-foreground">{article.authorRole}</p>
          </div>
        </div>
      </div>
    </article>
  )
}
