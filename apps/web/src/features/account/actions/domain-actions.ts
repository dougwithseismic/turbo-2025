'use server'

interface DomainResponse {
  data: { domain: string } | null
  error: Error | null
}

export const executeUpdateDomain = async ({
  domain,
}: {
  domain: string
}): Promise<DomainResponse> => {
  console.log('executeUpdateDomain', domain)
  // placeholder
  return { data: { domain }, error: null }
}

export const executeGetDomain = async (): Promise<DomainResponse> => {
  const mockDomain = 'username.domain.com'
  console.log('executeGetDomain', mockDomain)
  return { data: { domain: mockDomain }, error: null }
}
