import { RouteProgressBar } from '@/features/navigation/components/route-progress-bar'

const Template = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <RouteProgressBar />
      {children}
    </>
  )
}

export default Template
