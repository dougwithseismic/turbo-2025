import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (req: NextRequest): Promise<NextResponse> => {
  const searchParams = req.nextUrl.searchParams
  const token = searchParams.get('token')
  const type = searchParams.get('type')
  const email = searchParams.get('email')
  if (!token || !type) {
    return NextResponse.json(
      { error: 'Missing token or type parameter' },
      { status: 400 },
    )
  }

  const supabase = await createSupabaseServerClient()

  try {
    let result

    switch (type) {
      case 'signup':
      case 'email':
        result = await supabase.auth.verifyOtp({
          token,
          email: email ?? '',
          type: 'email',
        })
        break
      case 'recovery':
        result = await supabase.auth.verifyOtp({
          token,
          type: 'recovery',
          email: email ?? '',
        })
        break
      case 'invite':
        result = await supabase.auth.verifyOtp({
          token,
          email: email ?? '',
          type: 'invite',
        })
        break
      case 'magiclink':
        result = await supabase.auth.verifyOtp({
          token,
          email: email ?? '',
          type: 'magiclink',
        })
        break
      default:
        return NextResponse.json(
          { error: 'Invalid verification type' },
          { status: 400 },
        )
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    const redirectTo =
      type === 'recovery' ? '/account/update-password' : '/dashboard'

    return NextResponse.redirect(new URL(redirectTo, req.url))
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to verify token. ${JSON.stringify(error)}` },
      { status: 500 },
    )
  }
}
