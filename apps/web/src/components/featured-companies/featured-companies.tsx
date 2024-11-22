type Company = {
  id: string
  name: string
  logo: string
  description: string
}

type FeaturedCompaniesProps = {
  companies: Company[]
}

const FeaturedCompanies = ({ companies }: FeaturedCompaniesProps) => {
  return (
    <section className="my-8">
      <h2 className="text-2xl font-bold mb-4">Featured Companies</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {companies.map((company) => (
          <div key={company.id} className="border rounded-lg p-4">
            <img
              src={company.logo}
              alt={company.name}
              className="w-24 h-24 object-contain mb-2"
            />
            <h3 className="font-semibold">{company.name}</h3>
            <p className="text-gray-600">{company.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default FeaturedCompanies
