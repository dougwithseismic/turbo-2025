import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'
import { z } from 'zod'
import { createEnv } from '@t3-oss/env-core'

const env = createEnv({
  server: {
    SUPABASE_URL: z.string().url(),
    SUPABASE_ANON_KEY: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null
/**
 * Supabase client singleton instance.
 * The client is lazily initialized when first accessed through getSupabaseClient().
 * Types are generated from the database schema using the Supabase CLI:
 * `npx supabase gen types --lang=typescript --local > database.types.ts`
 * @see https://supabase.com/docs/guides/api/rest/generating-types
 */
const createSupabaseClient = ({
  supabaseUrl = env.SUPABASE_URL,
  supabaseAnonKey = env.SUPABASE_ANON_KEY,
}: {
  supabaseUrl?: string
  supabaseAnonKey?: string
}) => {
  console.log('getSupabaseClient', env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

export { createSupabaseClient }
export type { Database }
