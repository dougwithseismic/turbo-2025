import { clientConfig } from '@/config/env.client'

export function getApiUrl(): string {
  if (!clientConfig.API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL environment variable is not set')
  }
  return clientConfig.API_URL
}
