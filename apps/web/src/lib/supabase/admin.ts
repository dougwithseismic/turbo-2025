'use server'

import { serverConfig } from '@/config/env.server'
import { Database } from '@repo/supabase'
import { createClient } from '@supabase/supabase-js'

// Note: supabaseAdmin uses the SERVICE_ROLE_KEY which you must only use in a secure server-side context
// as it has admin privileges and overwrites RLS policies!
const supabaseAdmin = createClient<Database>(
  serverConfig.SUPABASE.URL,
  serverConfig.SUPABASE.SERVICE_ROLE_KEY,
)

export { supabaseAdmin }
