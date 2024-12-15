import { describe, it, expect } from 'vitest'
import { capitalizeFirstLetter } from '../src/lib/string-utils'

describe('String Utilities', () => {
  describe('capitalizeFirstLetter', () => {
    it('should capitalize the first letter of a string', () => {
      expect(capitalizeFirstLetter({ text: 'hello' })).toBe('Hello')
    })

    it('should handle empty strings', () => {
      expect(capitalizeFirstLetter({ text: '' })).toBe('')
    })

    it('should convert rest of string to lowercase', () => {
      expect(capitalizeFirstLetter({ text: 'hELLo' })).toBe('Hello')
    })
  })
})
