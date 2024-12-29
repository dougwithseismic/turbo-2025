import { protectedRoute } from '@/lib/auth'
import { OnboardingFlow } from '@/features/onboarding/components/onboarding-flow'

const OnboardingPage = async (): Promise<React.ReactNode> => {
  await protectedRoute()

  return <OnboardingFlow />
}

export default OnboardingPage
