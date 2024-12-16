import { protectedRoute } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserOnboarding } from '@repo/supabase'

const OnboardingPage = async (): Promise<React.ReactNode> => {
  const { id: userId } = await protectedRoute()

  const supabase = await createSupabaseServerClient()
  const onboarding = await getUserOnboarding({
    supabase,
    userId,
  })

  console.log(onboarding)

  return <>wow</>
}

export default OnboardingPage
