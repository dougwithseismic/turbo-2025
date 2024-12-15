/**
 * Validates if all provided scopes are allowed
 */
export const validateScopes = ({
  scopes,
  allowedScopes,
}: {
  scopes: string[]
  allowedScopes: string[]
}): {
  isValid: boolean
  invalidScopes: string[]
} => {
  const invalidScopes = scopes.filter((scope) => !allowedScopes.includes(scope))
  return {
    isValid: invalidScopes.length === 0,
    invalidScopes,
  }
}
