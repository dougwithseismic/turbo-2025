import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'
import { z } from 'zod'
import { createEnv } from '@t3-oss/env-core'

// Client Type Definition
export type SupabaseClient = ReturnType<typeof createClient<Database>>

// Base Types
export type {
  Json,
  ResourceType,
  Role,
  SubscriberType,
  OwnerType,
} from './types'

// Database Types
export type { Database } from './database.types'
export type { DbFunctions } from './database.functions'

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
export * from './module/profiles'
export * from './module/profiles.react'
export * from './module/onboarding'
export * from './module/onboarding.react'
export * from './module/invitations'
export * from './module/invitations.react'

// Environment Configuration
const env = createEnv({
  server: {
    SUPABASE_URL: z.string().url(),
    SUPABASE_ANON_KEY: z.string().min(1).optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})

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
  supabaseUrl = env.SUPABASE_URL,
  supabaseAnonKey = env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY,
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
