type CategoryPageParams = {
  params: {
    category: 'getting-started' | 'daily-life' | 'about'
  }
}

const CategoryPage = async ({ params }: CategoryPageParams) => {
  // Fetch all articles for this category
  return (
    <div className="container mx-auto">
      <h1>
        {params.category
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase())}
      </h1>
      {/* List of articles in this category */}
    </div>
  )
}

export default CategoryPage
