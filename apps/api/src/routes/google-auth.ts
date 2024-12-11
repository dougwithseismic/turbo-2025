import { Router, Response, RequestHandler } from 'express';
import type { Router as ExpressRouter } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import {
  storeGoogleCredentials,
  addGscProperty,
  getGscProperties,
  getGoogleCredentials,
  updateGoogleTokens,
  needsTokenRefresh,
  type GoogleTokens,
  type GscProperty,
  type GoogleAccount,
  type PropertyType,
  type PermissionLevel,
  type GoogleAccountRow,
} from '@repo/supabase';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { google } from 'googleapis';
import { z } from 'zod';
import { GOOGLE_SCOPES } from '@repo/consts';

export const googleAuthRouter: ExpressRouter = Router();

// Zod schemas for request validation
const tokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.string().or(z.date()),
  scopes: z.array(z.string()),
});

const gscPropertySchema = z.object({
  googleAccountId: z.string(),
  propertyUrl: z.string().url(),
  propertyType: z.enum(['SITE', 'DOMAIN']),
  permissionLevel: z.enum(['FULL', 'RESTRICTED', 'OWNER']),
  googleEmail: z.string().email(),
});

// Create OAuth2 client for server-side operations
const createOAuth2Client = () => {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  return client;
};

// Function to get auth URL with scopes
const getAuthUrl = (oauth2Client: google.auth.OAuth2) => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      GOOGLE_SCOPES.WEBMASTERS,
      GOOGLE_SCOPES.WEBMASTERS_READONLY,
      GOOGLE_SCOPES.EMAIL, // For getting user email
      GOOGLE_SCOPES.PROFILE, // Basic profile info
    ],
    prompt: 'consent', // Force consent screen to ensure we get refresh token
    include_granted_scopes: true,
  });
};

// Function to refresh Google OAuth token
const refreshGoogleToken = async (
  refreshToken: string,
): Promise<{ accessToken: string; expiresIn: number }> => {
  const oauth2Client = createOAuth2Client();

  // For token refresh, we only need to set the refresh token
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();

  return {
    accessToken: credentials.access_token!,
    expiresIn: credentials.expiry_date! - Date.now(),
  };
};

// Helper to type our route handlers
const createHandler = (
  handler: (req: AuthenticatedRequest, res: Response) => Promise<void>,
): RequestHandler => {
  return ((req, res, next) => {
    return handler(req as AuthenticatedRequest, res).catch(next);
  }) as RequestHandler;
};

// Initiate Google OAuth flow
googleAuthRouter.get(
  '/auth',
  requireAuth,
  createHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
        const oauth2Client = createOAuth2Client();
        const authUrl = getAuthUrl(oauth2Client);

        res.json({ authUrl });
      } catch (err) {
        console.error('Failed to generate auth URL:', err);
        res.status(500).json({ error: 'Failed to initiate Google auth' });
      }
    },
  ),
);

// Handle OAuth callback
googleAuthRouter.get(
  '/callback',
  requireAuth,
  createHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
        const { code } = req.query;

        if (!code || typeof code !== 'string') {
          res.status(400).json({ error: 'Authorization code is required' });
          return;
        }

        const oauth2Client = createOAuth2Client();
        const { tokens } = await oauth2Client.getToken(code);

        // Get user info from Google
        oauth2Client.setCredentials(tokens);
        const oauth2 = google.oauth2('v2');
        const { data: userInfo } = await oauth2.userinfo.get({
          auth: oauth2Client,
        });

        if (!userInfo.email) {
          res.status(400).json({ error: 'Could not get Google email' });
          return;
        }

        // Store tokens
        const account = await storeGoogleCredentials({
          supabase: supabaseAdmin,
          userId: req.user.id,
          googleEmail: userInfo.email,
          tokens: {
            accessToken: tokens.access_token!,
            refreshToken: tokens.refresh_token!,
            expiresAt: new Date(tokens.expiry_date!),
            scopes: tokens.scope!.split(' '),
          },
        });

        res.json({ account });
      } catch (err) {
        console.error('Failed to handle OAuth callback:', err);
        res.status(500).json({ error: 'Failed to complete Google auth' });
      }
    },
  ),
);

// Store Google OAuth credentials after successful auth
googleAuthRouter.post(
  '/store-credentials',
  requireAuth,
  createHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
        const { googleEmail, tokens } = await z
          .object({
            googleEmail: z.string().email(),
            tokens: tokenSchema,
          })
          .parseAsync(req.body);

        const account = await storeGoogleCredentials({
          supabase: supabaseAdmin,
          userId: req.user.id,
          googleEmail,
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresAt: new Date(tokens.expiresAt),
            scopes: tokens.scopes,
          },
        });

        res.json({ account });
      } catch (err) {
        if (err instanceof z.ZodError) {
          res
            .status(400)
            .json({ error: 'Invalid request data', details: err.errors });
          return;
        }
        console.error('Failed to store Google credentials:', err);
        res.status(500).json({ error: 'Failed to store Google credentials' });
      }
    },
  ),
);

// Add a new GSC property
googleAuthRouter.post(
  '/gsc-properties',
  requireAuth,
  createHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
        const data = await gscPropertySchema.parseAsync(req.body);

        // Verify the Google account belongs to the user
        const account = await getGoogleCredentials({
          supabase: supabaseAdmin,
          userId: req.user.id,
          googleEmail: data.googleEmail,
        });

        if (!account) {
          res.status(404).json({ error: 'Google account not found' });
          return;
        }

        const property = await addGscProperty({
          supabase: supabaseAdmin,
          googleAccountId: data.googleAccountId,
          propertyUrl: data.propertyUrl,
          propertyType: data.propertyType,
          permissionLevel: data.permissionLevel,
        });

        res.json({ property });
      } catch (err) {
        if (err instanceof z.ZodError) {
          res
            .status(400)
            .json({ error: 'Invalid request data', details: err.errors });
          return;
        }
        console.error('Failed to add GSC property:', err);
        res.status(500).json({ error: 'Failed to add GSC property' });
      }
    },
  ),
);

// List GSC properties for a Google account
googleAuthRouter.get(
  '/gsc-properties/:googleEmail',
  requireAuth,
  createHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
        const { googleEmail } = await z
          .object({
            googleEmail: z.string().email(),
          })
          .parseAsync(req.params);

        // Verify the Google account belongs to the user
        const account = await getGoogleCredentials({
          supabase: supabaseAdmin,
          userId: req.user.id,
          googleEmail,
        });

        if (!account) {
          res.status(404).json({ error: 'Google account not found' });
          return;
        }

        const properties = await getGscProperties({
          supabase: supabaseAdmin,
          googleAccountId: account.id,
        });

        res.json({ properties });
      } catch (err) {
        if (err instanceof z.ZodError) {
          res
            .status(400)
            .json({ error: 'Invalid email format', details: err.errors });
          return;
        }
        console.error('Failed to fetch GSC properties:', err);
        res.status(500).json({ error: 'Failed to fetch GSC properties' });
      }
    },
  ),
);

// Refresh Google OAuth tokens
googleAuthRouter.post(
  '/refresh-token',
  requireAuth,
  createHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
        const { googleEmail } = await z
          .object({
            googleEmail: z.string().email(),
          })
          .parseAsync(req.body);

        // Get the current tokens
        const account = (await getGoogleCredentials({
          supabase: supabaseAdmin,
          userId: req.user.id,
          googleEmail,
        })) as GoogleAccountRow;

        if (!account) {
          res.status(404).json({ error: 'Google account not found' });
          return;
        }

        // Check if we need to refresh
        if (!needsTokenRefresh(account.token_expires_at)) {
          res.json({
            message: 'Token still valid',
            expiresAt: account.token_expires_at,
          });
          return;
        }

        // Refresh the token using Google OAuth
        const newTokens = await refreshGoogleToken(account.refresh_token);

        // Update the stored tokens
        const updatedAccount = await updateGoogleTokens({
          supabase: supabaseAdmin,
          accountId: account.id,
          tokens: {
            accessToken: newTokens.accessToken,
            expiresAt: new Date(Date.now() + newTokens.expiresIn),
          },
        });

        res.json({
          message: 'Token refreshed',
          expiresAt: updatedAccount.token_expires_at,
        });
      } catch (err) {
        if (err instanceof z.ZodError) {
          res
            .status(400)
            .json({ error: 'Invalid email format', details: err.errors });
          return;
        }
        console.error('Failed to refresh token:', err);
        res.status(500).json({ error: 'Failed to refresh token' });
      }
    },
  ),
);
