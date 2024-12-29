'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createOrganization as createOrganizationDb } from '@repo/supabase'

interface CreateOrganizationParams {
  name: string
}

export async function createOrganization({ name }: CreateOrganizationParams) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    throw new Error('You must be logged in to create an organization')
  }

  // Check if organization with same name exists
  const { data: existingOrg } = await supabase
    .from('organizations')
    .select('id')
    .eq('name', name)
    .single()

  if (existingOrg) {
    throw new Error('An organization with this name already exists')
  }

  const organization = await createOrganizationDb({
    supabase,
    name,
    ownerId: session.user.id,
    settings: {},
  })

  revalidatePath('/org')
  return organization
}
