import { NextResponse } from 'next/server'

/**
 * Simple hello world endpoint that returns a greeting message
 */
export const GET = async (): Promise<NextResponse> => {
  return NextResponse.json({ message: 'Hello World!' })
}
