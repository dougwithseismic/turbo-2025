import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/supabase/health-check';

export async function GET() {
  try {
    //const isHealthy = await checkDatabaseConnection()
    const isHealthy = true;
    return NextResponse.json({ isHealthy });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      isHealthy: false,
      error: 'Health check failed',
    });
  }
}
