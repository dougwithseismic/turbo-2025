import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createRedirectUrl } from './utility/create-redirect-url';
import { handleOAuthTokens } from './utility/handle-auth-tokens';

/**
 * Handles OAuth callback after user authentication.
 * This route is called by the OAuth provider (e.g. Google) after successful authentication.
 *
 * Flow:
 * 1. Extracts auth code and next URL from callback params
 * 2. Exchanges auth code for Supabase session
 * 3. For Google sign-ins, stores OAuth tokens for future API access
 * 4. Redirects user to their intended destination
 */
export const GET = async (request: NextRequest) => {
  // Extract auth code and redirect URL from callback parameters
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';
  const scopes = requestUrl.searchParams.get('scopes')?.split(' ') ?? [];

  console.log('requestUrl', requestUrl);
  console.log('code', code);
  console.log('next', next);
  console.log('scopes', scopes);

  // If no auth code provided, redirect to destination
  if (!code) {
    console.log(
      '🚨 No auth code provided - redirecting to:',
      `${requestUrl.origin}${next}`,
    );
    return NextResponse.redirect(`${requestUrl.origin}${next}`);
  }

  const supabase = await createSupabaseServerClient();

  // Exchange the temporary code for a permanent session
  const { data: sessionData, error: sessionError } =
    await supabase.auth.exchangeCodeForSession(code);

  const handleAuthError = ({
    error,
    origin,
  }: {
    error: string;
    origin: string;
  }): NextResponse => {
    console.error('🚨 Authentication error:', error);
    return NextResponse.redirect(
      `${origin}/auth/auth-error?error=${encodeURIComponent(error)}`,
    );
  };

  // Then use it like:
  if (sessionError) {
    return handleAuthError({
      error: sessionError.message,
      origin: requestUrl.origin,
    });
  }

  // Ensure we have a valid user before proceeding
  if (!sessionData?.user) {
    console.log(
      '🚨 No user data - redirecting to:',
      `${requestUrl.origin}${next}`,
    );
    return NextResponse.redirect(`${requestUrl.origin}${next}`);
  }

  // Extract OAuth tokens from the session
  // These are only present for OAuth sign-ins
  const providerToken = sessionData.session?.provider_token;
  const refreshToken = sessionData.session?.provider_refresh_token;
  const userEmail = sessionData.user.email;
  const provider = sessionData.user.app_metadata.provider;

  if (
    sessionData.session &&
    providerToken &&
    refreshToken &&
    userEmail &&
    provider &&
    scopes.length > 0
  ) {
    console.log('🚨 Storing OAuth tokens for:', provider);
    try {
      await handleOAuthTokens({
        session: sessionData.session,
        user: sessionData.user,
        supabase,
        scopes,
      });
    } catch (error) {
      console.error(`Error storing ${provider} OAuth token:`, error);
    }
  }

  // Finally, redirect user to their intended destination
  console.log(
    '✅ Authentication successful - redirecting to:',
    `${requestUrl.origin}${next}`,
  );
  return NextResponse.redirect(
    createRedirectUrl({
      origin: requestUrl.origin,
      path: next,
    }),
  );
};
