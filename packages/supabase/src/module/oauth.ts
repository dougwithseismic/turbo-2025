import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';

type OAuthState = Database['public']['Tables']['oauth_states']['Row'];

const createOAuthState = async ({
  supabase,
  userId,
  redirectTo,
  expiresIn = 3600, // 1 hour
}: {
  supabase: SupabaseClient<Database>;
  userId: string;
  redirectTo?: string;
  expiresIn?: number;
}): Promise<OAuthState> => {
  const state = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  const { data, error } = await supabase
    .from('oauth_states')
    .insert({
      user_id: userId,
      state,
      redirect_to: redirectTo,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

const verifyOAuthState = async ({
  supabase,
  state,
}: {
  supabase: SupabaseClient<Database>;
  state: string;
}): Promise<OAuthState> => {
  const { data, error } = await supabase
    .from('oauth_states')
    .select()
    .eq('state', state)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error) throw error;
  return data;
};

const cleanupExpiredStates = async ({
  supabase,
}: {
  supabase: SupabaseClient<Database>;
}): Promise<void> => {
  const { error } = await supabase
    .from('oauth_states')
    .delete()
    .lt('expires_at', new Date().toISOString());

  if (error) throw error;
};

const deleteOAuthState = async ({
  supabase,
  state,
}: {
  supabase: SupabaseClient<Database>;
  state: string;
}): Promise<void> => {
  const { error } = await supabase
    .from('oauth_states')
    .delete()
    .eq('state', state);

  if (error) throw error;
};

export {
  createOAuthState,
  verifyOAuthState,
  cleanupExpiredStates,
  deleteOAuthState,
};

export type { OAuthState };
