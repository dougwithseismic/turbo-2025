import { createSupabaseClient, SupabaseClient } from '@repo/supabase'
console.log('supabaseClient', {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
})

const supabaseClient: SupabaseClient = createSupabaseClient({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
})

const supabaseAdmin: SupabaseClient = createSupabaseClient({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
})

export { supabaseClient, supabaseAdmin }
