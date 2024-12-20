import { protectedRoute } from '@/lib/auth'
import { OnboardingFlow } from '@/features/onboarding/components/onboarding-flow'

const OnboardingPage = async (): Promise<React.ReactNode> => {
  const { id: userId } = await protectedRoute()

  // TODO: Get organization ID from user's profile or context
  // For now, using a placeholder

  return <OnboardingFlow userId={userId} />
}

export default OnboardingPage
