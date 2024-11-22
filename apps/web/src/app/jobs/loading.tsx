const JobsLoading = () => {
  return (
    <div className="container mx-auto animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded mb-4" />
      <div className="grid gap-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-32 bg-gray-200 rounded" />
        ))}
      </div>
    </div>
  )
}

export default JobsLoading
