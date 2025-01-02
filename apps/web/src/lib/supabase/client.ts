'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@repo/supabase'
import { clientConfig } from '@/config/env.client'

export const supabaseClient = createBrowserClient<Database>(
  clientConfig.SUPABASE.URL,
  clientConfig.SUPABASE.ANON_KEY,
)
