import { createSupabaseClient, SupabaseClient } from '@repo/supabase';
import { config } from '../config/app-config';

const supabaseClient: SupabaseClient = createSupabaseClient({
  supabaseUrl: config.SUPABASE.URL,
  supabaseAnonKey: config.SUPABASE.ANON_KEY,
});

const supabaseAdmin: SupabaseClient = createSupabaseClient({
  supabaseUrl: config.SUPABASE.URL,
  supabaseServiceRoleKey: config.SUPABASE.SERVICE_ROLE_KEY,
});

export { supabaseClient, supabaseAdmin };
