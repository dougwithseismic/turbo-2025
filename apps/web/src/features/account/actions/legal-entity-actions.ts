'use server'

type LegalEntityType = 'individual' | 'company' | 'non-profit'

interface LegalEntityResponse {
  data: { type: LegalEntityType } | null
  error: Error | null
}

/**
 * Update user's legal entity type in the database.
 * Currently returns mock data, but marked as async for future database integration.
 * TODO: Implement actual database update and legal verification
 */
export const executeUpdateLegalEntity = async ({
  type,
}: {
  type: LegalEntityType
}): Promise<LegalEntityResponse> => {
  // This will be replaced with actual database and verification calls that require await
  console.log('executeUpdateLegalEntity', type)
  return { data: { type }, error: null }
}

/**
 * Fetch user's legal entity type from the database.
 * Currently returns mock data, but marked as async for future database integration.
 * TODO: Implement actual database query
 */
export const executeGetLegalEntity = async (): Promise<LegalEntityResponse> => {
  // This will be replaced with an actual database call that requires await
  const mockType: LegalEntityType = 'individual'
  console.log('executeGetLegalEntity', mockType)
  return { data: { type: mockType }, error: null }
}
