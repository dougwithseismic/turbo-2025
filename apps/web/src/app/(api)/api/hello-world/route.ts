import { NextResponse } from 'next/server'

/**
 * Simple hello world endpoint that returns a greeting message
 */
export function GET() {
  return NextResponse.json({ message: 'Hello World!' })
}
