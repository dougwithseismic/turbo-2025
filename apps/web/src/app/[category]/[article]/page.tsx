import { type ContentCategory } from '@/app/types/routes'

type CategoryParams = {
  params: {
    category: ContentCategory
    article: string
  }
}

const ArticlePage = async ({ params }: CategoryParams) => {
  return (
    <article className="container mx-auto">
      <h1>
        {params.article
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (letter: string) => letter.toUpperCase())}
      </h1>
      {/* Article content */}
    </article>
  )
}

export default ArticlePage
