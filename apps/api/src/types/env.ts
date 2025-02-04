export type Environment = {
  readonly PORT: number
  readonly NODE_ENV: 'development' | 'production' | 'test'
  readonly SUPABASE_URL: string
  readonly SUPABASE_ANON_KEY: string
  readonly SUPABASE_SERVICE_ROLE_KEY: string
}
