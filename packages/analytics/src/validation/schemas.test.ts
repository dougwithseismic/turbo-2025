import { describe, expect, it } from 'vitest'
import {
  basePropertiesSchema,
  buttonClickPropertiesSchema,
  formSubmitPropertiesSchema,
  signupPropertiesSchema,
  loginPropertiesSchema,
  purchasePropertiesSchema,
  errorPropertiesSchema,
  customEventPropertiesSchema,
  eventNameSchema,
  analyticsEventSchema,
  pageViewSchema,
  userTraitsSchema,
  userIdentitySchema,
} from './schemas'

describe('validation schemas', () => {
  const timestamp = Date.now()

  describe('basePropertiesSchema', () => {
    it('should validate valid base properties', () => {
      const validProps = {
        timestamp,
        path: '/test',
        url: 'https://example.com/test',
        referrer: 'https://example.com',
        title: 'Test Page',
        search: '?q=test',
      }
      expect(() => basePropertiesSchema.parse(validProps)).not.toThrow()
    })

    it('should allow empty object', () => {
      expect(() => basePropertiesSchema.parse({})).not.toThrow()
    })

    it('should reject invalid types', () => {
      const invalidProps = {
        timestamp: 'not-a-number',
        path: 123,
      }
      expect(() => basePropertiesSchema.parse(invalidProps)).toThrow()
    })
  })

  describe('buttonClickPropertiesSchema', () => {
    it('should validate valid button click properties', () => {
      const validProps = {
        button_id: 'submit-btn',
        button_text: 'Submit',
        button_type: 'submit' as const,
        button_location: 'header',
        timestamp,
      }
      expect(() => buttonClickPropertiesSchema.parse(validProps)).not.toThrow()
    })

    it('should require button_id', () => {
      const invalidProps = {
        button_text: 'Submit',
      }
      expect(() => buttonClickPropertiesSchema.parse(invalidProps)).toThrow()
    })

    it('should validate button_type enum', () => {
      const invalidProps = {
        button_id: 'test',
        button_type: 'invalid-type',
      }
      expect(() => buttonClickPropertiesSchema.parse(invalidProps)).toThrow()
    })
  })

  describe('formSubmitPropertiesSchema', () => {
    it('should validate valid form submit properties', () => {
      const validProps = {
        form_id: 'contact-form',
        form_name: 'Contact Form',
        form_type: 'contact',
        success: true,
        timestamp,
      }
      expect(() => formSubmitPropertiesSchema.parse(validProps)).not.toThrow()
    })

    it('should require form_id and success', () => {
      const invalidProps = {
        form_name: 'Contact Form',
      }
      expect(() => formSubmitPropertiesSchema.parse(invalidProps)).toThrow()
    })
  })

  describe('signupPropertiesSchema', () => {
    it('should validate valid signup properties', () => {
      const validProps = {
        method: 'email' as const,
        timestamp,
      }
      expect(() => signupPropertiesSchema.parse(validProps)).not.toThrow()
    })

    it('should validate all allowed methods', () => {
      const methods = ['email', 'google', 'github'] as const
      methods.forEach((method) => {
        expect(() => signupPropertiesSchema.parse({ method })).not.toThrow()
      })
    })

    it('should reject invalid methods', () => {
      const invalidProps = {
        method: 'invalid-method',
      }
      expect(() => signupPropertiesSchema.parse(invalidProps)).toThrow()
    })
  })

  describe('loginPropertiesSchema', () => {
    it('should validate valid login properties', () => {
      const validProps = {
        method: 'email' as const,
        success: true,
        timestamp,
      }
      expect(() => loginPropertiesSchema.parse(validProps)).not.toThrow()
    })

    it('should require method and success', () => {
      const invalidProps = {
        error_message: 'Failed to login',
      }
      expect(() => loginPropertiesSchema.parse(invalidProps)).toThrow()
    })
  })

  describe('purchasePropertiesSchema', () => {
    it('should validate valid purchase properties', () => {
      const validProps = {
        product_id: 'prod123',
        product_name: 'Test Product',
        price: 99.99,
        currency: 'USD',
        quantity: 1,
        timestamp,
      }
      expect(() => purchasePropertiesSchema.parse(validProps)).not.toThrow()
    })

    it('should allow all fields to be optional', () => {
      expect(() => purchasePropertiesSchema.parse({})).not.toThrow()
    })

    it('should validate field types', () => {
      const invalidProps = {
        price: 'not-a-number',
        quantity: 'not-a-number',
      }
      expect(() => purchasePropertiesSchema.parse(invalidProps)).toThrow()
    })
  })

  describe('errorPropertiesSchema', () => {
    it('should validate valid error properties', () => {
      const validProps = {
        error_message: 'Something went wrong',
        error_type: 'ValidationError',
        error_code: 'ERR001',
        stack_trace: 'Error: Something went wrong\n    at line 1',
        timestamp,
      }
      expect(() => errorPropertiesSchema.parse(validProps)).not.toThrow()
    })

    it('should require error_message', () => {
      const invalidProps = {
        error_type: 'ValidationError',
      }
      expect(() => errorPropertiesSchema.parse(invalidProps)).toThrow()
    })
  })

  describe('customEventPropertiesSchema', () => {
    it('should validate with any additional properties', () => {
      const validProps = {
        custom_field: 'value',
        nested: { prop: 'value' },
        array: [1, 2, 3],
        timestamp,
      }
      expect(() => customEventPropertiesSchema.parse(validProps)).not.toThrow()
    })

    it('should validate base properties', () => {
      const validProps = {
        path: '/test',
        title: 'Test',
        custom_field: 'value',
      }
      expect(() => customEventPropertiesSchema.parse(validProps)).not.toThrow()
    })
  })

  describe('eventNameSchema', () => {
    it('should validate predefined event names', () => {
      const validNames = [
        'page_view',
        'button_click',
        'form_submit',
        'signup',
        'login',
        'logout',
        'purchase',
        'error',
        'checkout_begin',
        'checkout_fail',
        'scraper_submit',
        'scraper_success',
      ] as const

      validNames.forEach((name) => {
        expect(() => eventNameSchema.parse(name)).not.toThrow()
      })
    })
  })

  describe('analyticsEventSchema', () => {
    it('should validate button click event', () => {
      const validEvent = {
        name: 'button_click' as const,
        properties: {
          button_id: 'test-button',
          timestamp,
        },
        timestamp,
      }
      expect(() => analyticsEventSchema.parse(validEvent)).not.toThrow()
    })
  })

  describe('pageViewSchema', () => {
    it('should validate valid page view', () => {
      const validPageView = {
        path: '/test',
        title: 'Test Page',
        referrer: 'https://example.com',
        timestamp,
      }
      expect(() => pageViewSchema.parse(validPageView)).not.toThrow()
    })

    it('should require path and title', () => {
      const invalidPageView = {
        referrer: 'https://example.com',
        timestamp,
      }
      expect(() => pageViewSchema.parse(invalidPageView)).toThrow()
    })
  })

  describe('userIdentitySchema', () => {
    it('should validate valid user identity', () => {
      const validIdentity = {
        userId: 'user123',
        traits: {
          name: 'Test User',
          email: 'test@example.com',
          plan: 'premium',
        },
        timestamp,
      }
      expect(() => userIdentitySchema.parse(validIdentity)).not.toThrow()
    })

    it('should allow identity without traits', () => {
      const validIdentity = {
        userId: 'user123',
        timestamp,
      }
      expect(() => userIdentitySchema.parse(validIdentity)).not.toThrow()
    })

    it('should require userId and timestamp', () => {
      const invalidIdentity = {
        traits: {
          name: 'Test User',
        },
      }
      expect(() => userIdentitySchema.parse(invalidIdentity)).toThrow()
    })
  })

  describe('userTraitsSchema', () => {
    it('should validate any record of values', () => {
      const validTraits = {
        string: 'value',
        number: 123,
        boolean: true,
        object: { nested: 'value' },
        array: [1, 2, 3],
      }
      expect(() => userTraitsSchema.parse(validTraits)).not.toThrow()
    })
  })
})
