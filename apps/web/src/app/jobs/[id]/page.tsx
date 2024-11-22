type JobParams = {
  params: {
    id: string
  }
}

const JobDetailPage = async ({ params }: JobParams) => {
  return (
    <div className="container mx-auto">
      <h1>Job Details - {params.id}</h1>
      {/* Job details */}
    </div>
  )
}

export default JobDetailPage
