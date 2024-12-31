import { protectedRoute } from '@/lib/auth'
import { OnboardingFlow } from '@/features/onboarding/components/onboarding-flow'

const OnboardingPage = async (): Promise<React.ReactNode> => {
  const user = await protectedRoute()

  return <OnboardingFlow userId={user.id} />
}

export default OnboardingPage
