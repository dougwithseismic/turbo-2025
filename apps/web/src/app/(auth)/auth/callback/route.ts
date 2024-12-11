import { createSupabaseServerClient } from '@/lib/supabase/server';
import { GOOGLE_SCOPES } from '@repo/consts/scopes/google';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

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

  // If no auth code provided, redirect to destination
  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}${next}`);
  }

  const supabase = await createSupabaseServerClient();

  // Exchange the temporary code for a permanent session
  const { data: sessionData, error: sessionError } =
    await supabase.auth.exchangeCodeForSession(code);

  // Handle authentication errors by redirecting to error page
  if (sessionError) {
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/auth-error?error=${sessionError.message}`,
    );
  }

  // Ensure we have a valid user before proceeding
  if (!sessionData?.user) {
    return NextResponse.redirect(`${requestUrl.origin}${next}`);
  }

  // Extract OAuth tokens from the session
  // These are only present for Google sign-ins
  const providerToken = sessionData.session?.provider_token;
  const refreshToken = sessionData.session?.provider_refresh_token;
  const userEmail = sessionData.user.email;

  // Store OAuth tokens for Google users to enable future API access
  if (
    providerToken &&
    refreshToken &&
    userEmail &&
    sessionData.user.app_metadata.provider === 'google'
  ) {
    // Upsert tokens - creates new record or updates existing one
    // based on user_id and google_email combination
    const { error: insertError } = await supabase
      .from('user_oauth_tokens')
      .upsert(
        {
          user_id: sessionData.user.id,
          google_email: userEmail,
          access_token: providerToken,
          refresh_token: refreshToken,
          scopes: [
            GOOGLE_SCOPES.WEBMASTERS_READONLY,
            GOOGLE_SCOPES.EMAIL,
            GOOGLE_SCOPES.PROFILE,
          ],
          token_expires_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,google_email',
        },
      )
      .select()
      .single();

    // Log any token storage errors but don't fail the auth flow
    if (insertError) {
      console.error('Error storing Google OAuth token:', insertError);
    }
  }

  // Finally, redirect user to their intended destination
  return NextResponse.redirect(`${requestUrl.origin}${next}`);
};
