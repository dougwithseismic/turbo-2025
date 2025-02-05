/**
 * Conditionally loads environment variables from a local .env file in development.
 * In production, environment variables are injected by the platform (Railway).
 */
import dotenv from 'dotenv'

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '../../.env' })
}
