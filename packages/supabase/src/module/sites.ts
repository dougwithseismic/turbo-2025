import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../database.types'
import type { Json } from '../types'

// Types
export type Site = Database['public']['Tables']['sites']['Row']
export type SiteInsert = Database['public']['Tables']['sites']['Insert']
export type SiteUpdate = Database['public']['Tables']['sites']['Update']

/**
 * Get all sites for a project
 */
export async function getProjectSites(
  supabase: SupabaseClient<Database>,
  { projectId }: { projectId: string },
): Promise<Site[]> {
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get a single site by ID
 */
export async function getSite(
  supabase: SupabaseClient<Database>,
  { siteId }: { siteId: string },
): Promise<Site | null> {
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('id', siteId)
    .single()

  if (error) throw error
  return data
}

/**
 * Create a new site
 */
export async function createSite(
  supabase: SupabaseClient<Database>,
  {
    projectId,
    domain,
    sitemapUrl,
    gscPropertyId,
    gaPropertyId,
    settings = {},
  }: {
    projectId: string
    domain: string
    sitemapUrl?: string
    gscPropertyId?: string
    gaPropertyId?: string
    settings?: Record<string, unknown>
  },
): Promise<Site> {
  const site: SiteInsert = {
    project_id: projectId,
    domain,
    sitemap_url: sitemapUrl,
    gsc_property_id: gscPropertyId,
    ga_property_id: gaPropertyId,
    settings: settings as Json,
  }

  const { data, error } = await supabase
    .from('sites')
    .insert(site)
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Update a site
 */
export async function updateSite(
  supabase: SupabaseClient<Database>,
  {
    siteId,
    updates,
  }: {
    siteId: string
    updates: SiteUpdate
  },
): Promise<Site> {
  const { data, error } = await supabase
    .from('sites')
    .update(updates)
    .eq('id', siteId)
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Update site property IDs
 */
export async function updateSitePropertyIds(
  supabase: SupabaseClient<Database>,
  {
    siteId,
    gscPropertyId,
    gaPropertyId,
  }: {
    siteId: string
    gscPropertyId?: string
    gaPropertyId?: string
  },
): Promise<Site> {
  const updates: SiteUpdate = {
    ...(gscPropertyId !== undefined && { gsc_property_id: gscPropertyId }),
    ...(gaPropertyId !== undefined && { ga_property_id: gaPropertyId }),
  }

  const { data, error } = await supabase
    .from('sites')
    .update(updates)
    .eq('id', siteId)
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a site
 */
export async function deleteSite(
  supabase: SupabaseClient<Database>,
  { siteId }: { siteId: string },
): Promise<void> {
  const { error } = await supabase.from('sites').delete().eq('id', siteId)

  if (error) throw error
}
