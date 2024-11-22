import { type CommunitySection } from '@/app/types/routes'

type CommunitySectionParams = {
  params: {
    section: CommunitySection
  }
}

const CommunitySectionPage = ({ params }: CommunitySectionParams) => {
  return (
    <div className="container mx-auto">
      <h1>
        {params.section
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (letter: string) => letter.toUpperCase())}
      </h1>
      {/* Section specific content */}
    </div>
  )
}

export default CommunitySectionPage
