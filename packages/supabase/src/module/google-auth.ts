import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';

type GoogleAccount =
  Database['public']['Tables']['user_google_accounts']['Row'];
type GoogleProperty = Database['public']['Tables']['gsc_properties']['Row'];

interface GoogleTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scopes: string[];
}

/**
 * Stores Google OAuth credentials for a user.
 * Used after initial auth to enable server-side operations.
 */
export const storeGoogleCredentials = async ({
  supabase,
  userId,
  googleEmail,
  tokens,
}: {
  supabase: SupabaseClient<Database>;
  userId: string;
  googleEmail: string;
  tokens: GoogleTokens;
}) => {
  const { data, error } = await supabase
    .from('user_google_accounts')
    .upsert(
      {
        user_id: userId,
        google_email: googleEmail,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        token_expires_at: tokens.expiresAt.toISOString(),
        scopes: tokens.scopes,
      },
      {
        onConflict: 'user_id,google_email',
      },
    )
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Retrieves Google credentials for server-side operations.
 * Includes logic to check token expiry.
 */
export const getGoogleCredentials = async ({
  supabase,
  userId,
  googleEmail,
}: {
  supabase: SupabaseClient<Database>;
  userId: string;
  googleEmail: string;
}): Promise<GoogleAccount | null> => {
  const { data, error } = await supabase
    .from('user_google_accounts')
    .select()
    .eq('user_id', userId)
    .eq('google_email', googleEmail)
    .single();

  if (error) return null;
  return data;
};

/**
 * Updates tokens after a refresh operation.
 */
export const updateGoogleTokens = async ({
  supabase,
  accountId,
  tokens,
}: {
  supabase: SupabaseClient<Database>;
  accountId: string;
  tokens: Partial<GoogleTokens>;
}) => {
  const updates: Record<string, any> = {};

  if (tokens.accessToken) {
    updates.access_token = tokens.accessToken;
  }
  if (tokens.refreshToken) {
    updates.refresh_token = tokens.refreshToken;
  }
  if (tokens.expiresAt) {
    updates.token_expires_at = tokens.expiresAt.toISOString();
  }
  if (tokens.scopes) {
    updates.scopes = tokens.scopes;
  }

  const { data, error } = await supabase
    .from('user_google_accounts')
    .update(updates)
    .eq('id', accountId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Stores a GSC property with its permissions.
 */
export const addGscProperty = async ({
  supabase,
  googleAccountId,
  propertyUrl,
  propertyType,
  permissionLevel,
}: {
  supabase: SupabaseClient<Database>;
  googleAccountId: string;
  propertyUrl: string;
  propertyType: 'SITE' | 'DOMAIN';
  permissionLevel: 'FULL' | 'RESTRICTED' | 'OWNER';
}): Promise<GoogleProperty> => {
  const { data, error } = await supabase
    .from('gsc_properties')
    .insert({
      google_account_id: googleAccountId,
      property_url: propertyUrl,
      property_type: propertyType,
      permission_level: permissionLevel,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Lists all GSC properties for a Google account.
 */
export const getGscProperties = async ({
  supabase,
  googleAccountId,
}: {
  supabase: SupabaseClient<Database>;
  googleAccountId: string;
}): Promise<GoogleProperty[]> => {
  const { data, error } = await supabase
    .from('gsc_properties')
    .select()
    .eq('google_account_id', googleAccountId);

  if (error) throw error;
  return data;
};

/**
 * Utility to check if tokens need refresh
 */
export const needsTokenRefresh = (expiresAt: string | Date): boolean => {
  const expiry = new Date(expiresAt);
  const now = new Date();
  // Add 5 minute buffer
  return expiry.getTime() - now.getTime() <= 5 * 60 * 1000;
};

export type { GoogleAccount, GoogleProperty, GoogleTokens };
