import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

const getProfile = async ({
  supabase,
  userId,
}: {
  supabase: SupabaseClient<Database>;
  userId: string;
}) => {
  const { data, error } = await supabase
    .from('profiles')
    .select()
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

const updateProfile = async ({
  supabase,
  userId,
  profile,
}: {
  supabase: SupabaseClient<Database>;
  userId: string;
  profile: ProfileUpdate;
}) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export { getProfile, updateProfile };
export type { Profile, ProfileUpdate };
