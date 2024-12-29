'use server'

interface BirthdateResponse {
  data: { birthdate: Date } | null
  error: Error | null
}

/**
 * Update user's birthdate in the database.
 * Currently returns mock data, but marked as async for future database integration.
 * TODO: Implement actual database update
 */
export const executeUpdateBirthdate = async ({
  birthdate,
}: {
  birthdate: Date
}): Promise<BirthdateResponse> => {
  // This will be replaced with an actual database call that requires await
  console.log('executeUpdateBirthdate', birthdate)
  return { data: { birthdate }, error: null }
}

/**
 * Fetch user's birthdate from the database.
 * Currently returns mock data, but marked as async for future database integration.
 * TODO: Implement actual database query
 */
export const executeGetBirthdate = async (): Promise<BirthdateResponse> => {
  // This will be replaced with an actual database call that requires await
  const mockBirthdate = new Date('1990-01-01')
  console.log('executeGetBirthdate', mockBirthdate)
  return { data: { birthdate: mockBirthdate }, error: null }
}
