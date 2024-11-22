const CategoryLoading = () => {
  return (
    <div className="container mx-auto animate-pulse">
      <div className="h-8 w-64 bg-gray-200 rounded mb-6" />
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-24 bg-gray-200 rounded" />
        ))}
      </div>
    </div>
  )
}

export default CategoryLoading
