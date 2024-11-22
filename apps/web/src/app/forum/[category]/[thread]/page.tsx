type ForumThreadParams = {
  params: {
    category: string
    thread: string
  }
}

const ForumThreadPage = async ({ params }: ForumThreadParams) => {
  return (
    <div className="container mx-auto">
      <h1>{params.thread.replace(/-/g, ' ')}</h1>
      {/* Thread content and replies */}
    </div>
  )
}

export default ForumThreadPage
