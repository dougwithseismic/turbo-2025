import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { ArticleMetadata } from './types'

const articlesDirectory = path.join(process.cwd(), '_articles')
const DEFAULT_PAGE_SIZE = 10

interface ArticleFrontmatter {
  title: string
  description: string
  date: string
  author: string
  authorRole: string
  authorAvatar: string
  featuredImage: string
  tags: string[]
  readingTime: string
}

interface GetArticlesParams {
  page?: number
  pageSize?: number
}

interface PaginatedArticles {
  articles: ArticleMetadata[]
  pagination: {
    currentPage: number
    totalPages: number
    pageSize: number
    totalItems: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export const getAllArticles = async ({
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}: GetArticlesParams = {}): Promise<PaginatedArticles> => {
  const files = await fs.readdir(articlesDirectory)
  const articles = await Promise.all(
    files
      .filter((file) => file.endsWith('.mdx'))
      .map(async (file) => {
        const slug = file.replace(/\.mdx$/, '')
        const fullPath = path.join(articlesDirectory, file)
        const fileContents = await fs.readFile(fullPath, 'utf8')
        const matterResult = matter(fileContents)
        const data = matterResult.data as ArticleFrontmatter

        return {
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
        }
      }),
  )

  const sortedArticles = articles.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA
  })

  const totalItems = sortedArticles.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const normalizedPage = Math.max(1, Math.min(page, totalPages))
  const startIndex = (normalizedPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedArticles = sortedArticles.slice(startIndex, endIndex)

  return {
    articles: paginatedArticles,
    pagination: {
      currentPage: normalizedPage,
      totalPages,
      pageSize,
      totalItems,
      hasNextPage: normalizedPage < totalPages,
      hasPreviousPage: normalizedPage > 1,
    },
  }
}
