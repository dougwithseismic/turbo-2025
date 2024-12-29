'use server'

interface EmailResponse {
  data: { email: string } | null
  error: Error | null
}

/**
 * Update user's email in the database.
 * Currently simulates a delay and returns mock data, but will be replaced with actual database integration.
 * TODO: Implement actual database update and email verification
 */
export const executeUpdateEmail = async ({
  email,
}: {
  email: string
}): Promise<EmailResponse> => {
  // Simulating a delay to mimic API latency
  console.log('executeUpdateEmail', email)
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { data: { email }, error: null }
}

/**
 * Fetch user's email from the database.
 * Currently returns mock data, but marked as async for future database integration.
 * TODO: Implement actual database query
 */
export const executeGetEmail = async (): Promise<EmailResponse> => {
  // This will be replaced with an actual database call that requires await
  const mockEmail = 'user@example.com'
  console.log('executeGetEmail', mockEmail)
  return { data: { email: mockEmail }, error: null }
}
