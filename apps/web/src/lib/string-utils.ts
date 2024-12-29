/**
 * Convert a string to kebab-case
 */
export const kebabCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

/**
 * Convert a string to PascalCase
 */
export const pascalCase = (str: string): string => {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

/**
 * Convert a string to camelCase
 */
export const camelCase = (str: string): string => {
  const pascal = pascalCase(str)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

/**
 * Capitalize the first letter of a string and convert the rest to lowercase
 */
export const capitalizeFirstLetter = ({ text }: { text: string }): string => {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}
