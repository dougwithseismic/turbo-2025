import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { ArticleMetadata } from './types'

const articlesDirectory = path.join(process.cwd(), '_articles')

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

export const getAllArticles = async (): Promise<ArticleMetadata[]> => {
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

  return articles.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA
  })
}
