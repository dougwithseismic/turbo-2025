import { Router, Response, RequestHandler } from 'express';
import { google } from 'googleapis';
import { supabaseAdmin } from '../lib/supabase';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { getOauthToken } from '@repo/supabase';
import { config } from '../config/app-config';

/** Parameters for search analytics query */
interface SearchAnalyticsParams {
  readonly startDate: string;
  readonly endDate: string;
  readonly dimensions?: readonly string[];
  readonly siteUrl: string;
}

/** Parameters for creating Google client */
interface GoogleClientParams {
  readonly userId: string;
  readonly email: string;
}

/** Response structure from search analytics query */
interface SearchAnalyticsResponse {
  readonly rows?: ReadonlyArray<{
    readonly keys: readonly string[];
    readonly clicks: number;
    readonly impressions: number;
    readonly ctr: number;
    readonly position: number;
  }>;
}

/** Custom error class for Google Search Console related errors */
class GoogleSearchError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = 'GoogleSearchError';
  }
}

/**
 * Creates an authenticated Google Search Console client
 * @param params - Parameters containing user ID and email
 * @throws {GoogleSearchError} When OAuth tokens are not found
 * @returns Authenticated Google Search Console client
 */
const createGoogleSearchClient = async ({
  userId,
  email,
}: GoogleClientParams) => {
  const { data: tokenData, error } = await getOauthToken({
    userId,
    provider: 'google',
    email,
    supabase: supabaseAdmin,
  });

  if (error || !tokenData) {
    throw new GoogleSearchError('Google OAuth tokens not found', 401);
  }

  const { access_token, refresh_token } = tokenData;

  const oauth2Client = new google.auth.OAuth2({
    clientId: config.AUTH.GOOGLE.CLIENT_ID,
    clientSecret: config.AUTH.GOOGLE.SECRET,
  });

  oauth2Client.setCredentials({ access_token, refresh_token });
  return google.searchconsole({ version: 'v1', auth: oauth2Client });
};

/**
 * Handles API errors and sends appropriate response
 * @param error - The error to handle
 * @param res - Express response object
 */
const handleApiError = (error: unknown, res: Response): void => {
  if (error instanceof GoogleSearchError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error('Google Search Console API Error:', error);
  res.status(500).json({
    error: 'An unexpected error occurred while processing your request',
  });
};

/**
 * Retrieves list of sites from Google Search Console
 * @param req - Authenticated request object
 * @param res - Express response object
 */
const getSites: RequestHandler<unknown, unknown, unknown, unknown> = async (
  req,
  res,
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const searchConsole = await createGoogleSearchClient({
      userId: authReq.user.id,
      email: authReq.user.email,
    });
    const { data } = await searchConsole.sites.list();
    res.json(data);
  } catch (error) {
    handleApiError(error, res);
  }
};

const router: Router = Router();

router.get('/sites', requireAuth as RequestHandler, getSites);

export { router as googleSearchConsoleRouter };
