const EventsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="events-layout">
      <aside className="events-sidebar">
        {/* Calendar widget and filters */}
      </aside>
      <main className="events-content">{children}</main>
    </div>
  )
}

export default EventsLayout
