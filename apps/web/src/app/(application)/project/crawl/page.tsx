interface CrawlPageProps {
  params: Promise<{
    projectId: string
  }>
  searchParams: Promise<{
    jobId?: string
  }>
}

export default async function CrawlPage({
  params,
  searchParams,
}: CrawlPageProps) {
  const { projectId } = await params
  const { jobId } = await searchParams

  return <div>CrawlPage</div>
}
