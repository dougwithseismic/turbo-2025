import { NextRequest, NextResponse } from 'next/server'

export const GET = async (req: NextRequest): Promise<NextResponse> => {
  const searchParams = req.nextUrl.searchParams
  const paramsObject: Record<string, string> = {}

  searchParams.forEach((value, key) => {
    paramsObject[key] = value
  })

  console.log('Query parameters:', paramsObject)

  return NextResponse.json({
    params: paramsObject,
    message: 'Parameters logged successfully',
  })
}
