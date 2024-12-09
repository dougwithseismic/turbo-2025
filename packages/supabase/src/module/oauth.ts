import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';

type OAuthState = Database['public']['Tables']['oauth_states']['Row'];

/**
 * Creates a new OAuth state for secure authentication flow.
 *
 * @example
 * ```typescript
 * const oauthState = await createOAuthState({
 *   supabase,
 *   userId: 'user_123',
 *   redirectTo: '/dashboard',
 *   expiresIn: 3600 // 1 hour
 * });
 * console.log(oauthState.state); // Random UUID for verification
 * ```
 */
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

/**
 * Verifies an OAuth state token and ensures it hasn't expired.
 *
 * @example
 * ```typescript
 * try {
 *   const verifiedState = await verifyOAuthState({
 *     supabase,
 *     state: 'state_token_from_oauth_callback'
 *   });
 *   console.log(verifiedState.redirect_to); // Original redirect URL
 * } catch (error) {
 *   console.error('Invalid or expired state');
 * }
 * ```
 *
 * @throws {Error} If state is invalid or expired
 */
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

/**
 * Removes expired OAuth states from the database.
 *
 * @example
 * ```typescript
 * // Run periodically to clean up expired states
 * await cleanupExpiredStates({ supabase });
 * ```
 */
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

/**
 * Deletes a specific OAuth state after successful verification.
 *
 * @example
 * ```typescript
 * // After successful OAuth callback and verification
 * await deleteOAuthState({
 *   supabase,
 *   state: 'verified_state_token'
 * });
 * ```
 */
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
