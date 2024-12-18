export interface ArticleMetadata {
  title: string
  description: string
  date: string
  author: string
  authorRole: string
  authorAvatar: string
  featuredImage: string
  tags: string[]
  readingTime: string
  slug: string
}

export interface Article extends ArticleMetadata {
  content: React.ReactNode
}
