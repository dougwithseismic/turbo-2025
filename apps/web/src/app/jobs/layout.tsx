const JobsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="jobs-layout">
      <aside className="jobs-sidebar">{/* Job search filters */}</aside>
      <main className="jobs-content">{children}</main>
    </div>
  )
}

export default JobsLayout
