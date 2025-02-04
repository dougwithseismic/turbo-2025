import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Client Type Definition
export type SupabaseClient = ReturnType<typeof createClient<Database>>

// Base Types
export type {
  Json,
  OwnerType,
  ResourceType,
  Role,
  SubscriberType,
} from './types'

// Database Types
export type { DbFunctions } from './database.functions'
export type { Database } from './database.types'

// API & Services
export * from './module/api-services'
export * from './module/api-services.react'
export * from './module/api-usage'
export * from './module/api-usage.react'

// Authentication & OAuth
export * from './module/oauth'

// Credits & Billing
export * from './module/subscriptions'

// Organizations & Projects
export * from './module/organizations'
export * from './module/organizations.react'
export * from './module/projects'
export * from './module/projects.react'

// User Management
export * from './module/invitations'
export * from './module/invitations.react'
export * from './module/memberships'
export * from './module/memberships.react'
export * from './module/onboarding'
export * from './module/onboarding.react'
export * from './module/profiles'
export * from './module/profiles.react'

// Payment Providers
export * from './module/payment-providers/stripe'

// Client Instance Management
let supabaseInstance: SupabaseClient | null = null

/**
 * Creates or returns an existing Supabase client instance
 *
 * @example
 * ```typescript
 * // Using environment variables
 * const supabase = createSupabaseClient({});
 *
 * // Using custom credentials
 * const supabase = createSupabaseClient({
 *   supabaseUrl: 'https://your-project.supabase.co',
 *   supabaseAnonKey: 'your-anon-key'
 * });
 * ```
 */
const createSupabaseClient = ({
  supabaseUrl = process.env.SUPABASE_URL,
  supabaseAnonKey = process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY,
}: {
  supabaseUrl?: string
  supabaseAnonKey?: string
  supabaseServiceRoleKey?: string
} = {}): SupabaseClient => {
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL is required')
  }

  if (!supabaseAnonKey) {
    throw new Error('SUPABASE_ANON_KEY is required')
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(
      supabaseUrl,
      supabaseServiceRoleKey ?? supabaseAnonKey,
    )
  }
  return supabaseInstance
}

export { createSupabaseClient }

// Core modules
export * from './module/crawl'
export * from './module/crawl.react'
export * from './module/sites'
export * from './module/sites.react'

// Types
export type * from './database.types'
