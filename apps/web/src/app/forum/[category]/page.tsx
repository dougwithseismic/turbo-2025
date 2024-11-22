import { type ForumCategory } from '@/app/types/routes'

type ForumCategoryParams = {
  params: {
    category: ForumCategory
  }
}

const ForumCategoryPage = ({ params }: ForumCategoryParams) => {
  return (
    <div className="container mx-auto">
      <h1>
        {params.category
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (letter: string) => letter.toUpperCase())}
      </h1>
      <div className="threads-list">
        {/* List of threads in this category */}
      </div>
    </div>
  )
}

export default ForumCategoryPage
