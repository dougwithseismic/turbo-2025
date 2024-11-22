const ServicesLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="services-layout">
      <aside>{/* Services sidebar navigation */}</aside>
      <div className="content">{children}</div>
    </div>
  )
}

export default ServicesLayout
