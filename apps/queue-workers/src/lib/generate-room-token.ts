import { randomBytes } from 'crypto'

/**
 * Generates a secure room token using random bytes.
 * @returns A hexadecimal string token.
 */
export const generateRoomToken = (): string => {
  return randomBytes(16).toString('hex')
}
