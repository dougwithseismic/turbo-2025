import path from 'path'
import fs from 'fs/promises'
import matter from 'gray-matter'
import { compileMDX } from 'next-mdx-remote/rsc'
import { mdxComponents } from '@/features/markdown/types/renderer'

type ArticleData = {
  slug: string
  title: string
  description: string
  date: string
  author: string
  authorRole: string
  authorAvatar: string
  featuredImage: string
  tags: string[]
  readingTime: string
  content: React.ReactElement
}

type GetArticleResult = {
  data: ArticleData | null
  error: Error | null
}

export const getArticleBySlug = async ({
  slug,
}: {
  slug: string
}): Promise<GetArticleResult> => {
  try {
    // Get the absolute path to the content directory
    const contentDir = path.join(process.cwd(), 'src', 'content', 'articles')
    const filePath = path.join(contentDir, `${slug}.mdx`)
    const fileContent = await fs.readFile(filePath, 'utf8')

    const { data, content } = matter(fileContent)

    const { content: mdxContent } = await compileMDX({
      source: content,
      components: mdxComponents,
      options: {
        parseFrontmatter: true,
      },
    })

    return {
      data: {
        slug,
        title: data.title,
        description: data.description,
        date: data.date,
        author: data.author,
        authorRole: data.authorRole,
        authorAvatar: data.authorAvatar,
        featuredImage: data.featuredImage,
        tags: data.tags,
        readingTime: data.readingTime,
        content: mdxContent,
      },
      error: null,
    }
  } catch (err: unknown) {
    return { data: null, error: err as Error }
  }
}
