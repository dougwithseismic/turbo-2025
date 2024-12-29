import { getUserOrganizations } from '@repo/supabase'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const getOrganizations = async () => {
  const supabase = await createSupabaseServerClient()
  const { data: organizations, error } = await getUserOrganizations({
    supabase,
  })

  if (error) {
    throw error
  }

  return organizations
}
