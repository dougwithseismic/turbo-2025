import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@repo/supabase'
import { clientConfig } from '@/config/app-config'

export const supabaseClient = createBrowserClient<Database>(
  clientConfig.SUPABASE.URL,
  clientConfig.SUPABASE.ANON_KEY,
)
