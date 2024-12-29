import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { vi } from 'vitest'

// Clean up after each test case
afterEach(() => {
  cleanup()
})

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000')
vi.stubEnv('NEXT_PUBLIC_AUTH_GOOGLE_ENABLED', 'true')
vi.stubEnv('NEXT_PUBLIC_AUTH_DISCORD_ENABLED', 'true')
vi.stubEnv('NEXT_PUBLIC_AUTH_EMAIL_ENABLED', 'true')
