const ForumLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="forum-layout">
      <aside className="forum-sidebar">
        {/* Forum categories navigation */}
      </aside>
      <main className="forum-content">{children}</main>
    </div>
  )
}

export default ForumLayout
