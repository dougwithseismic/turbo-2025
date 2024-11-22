type ServiceCategoryParams = {
  params: {
    category:
      | 'medical'
      | 'legal'
      | 'translation'
      | 'relocation'
      | 'real-estate'
      | 'language-schools'
  }
}

const ServiceCategoryPage = ({ params }: ServiceCategoryParams) => {
  return (
    <div className="container mx-auto">
      <h1>
        {params.category
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase())}{' '}
        Services
      </h1>
      {/* Service listings will go here */}
    </div>
  )
}

export default ServiceCategoryPage
