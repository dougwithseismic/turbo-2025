'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createProject as createProjectDb } from '@repo/supabase'

type CreateProjectParams = {
  name: string
  organizationId: string
}

export async function createProject({
  name,
  organizationId,
}: CreateProjectParams) {
  try {
    const supabase = await createSupabaseServerClient()

    // First check if project exists in this organization
    const { data: existingProjects } = await supabase
      .from('projects')
      .select('id, name')
      .eq('organization_id', organizationId)
      .eq('name', name)
      .single()

    if (existingProjects) {
      throw new Error(
        'A project with this name already exists in this organization',
      )
    }

    const project = await createProjectDb({
      supabase,
      name,
      organizationId,
    })

    revalidatePath('/project/[id]', 'layout')
    return project
  } catch (error) {
    console.error('Project creation error:', error)
    throw error instanceof Error ? error : new Error('Failed to create project')
  }
}
