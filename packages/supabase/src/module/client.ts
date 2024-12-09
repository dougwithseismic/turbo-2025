import { createClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';

const createSupabaseClient = ({
  supabaseUrl,
  supabaseKey,
}: {
  supabaseUrl: string;
  supabaseKey: string;
}) => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }
  return createClient<Database>(supabaseUrl, supabaseKey);
};

export { createSupabaseClient };
