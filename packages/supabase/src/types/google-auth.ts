export interface GoogleTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scopes: string[];
}

// For token updates where refresh token is optional
export interface GoogleTokensUpdate {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  scopes?: string[];
}

export type PropertyType = 'SITE' | 'DOMAIN';
export type PermissionLevel = 'FULL' | 'RESTRICTED' | 'OWNER';

export interface GscProperty {
  id: string;
  googleAccountId: string;
  propertyUrl: string;
  propertyType: PropertyType;
  permissionLevel: PermissionLevel;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoogleAccount {
  id: string;
  userId: string | null;
  googleEmail: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: string;
  scopes: string[];
  createdAt: string;
  updatedAt: string;
}

// Database row types (what we get from Supabase)
export interface GoogleAccountRow {
  id: string;
  user_id: string | null;
  google_email: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  scopes: string[];
  created_at: string;
  updated_at: string;
}

export interface GscPropertyRow {
  id: string;
  google_account_id: string;
  property_url: string;
  property_type: PropertyType;
  permission_level: PermissionLevel;
  created_at: string;
  updated_at: string;
}
