import baseConfig from '@repo/config-eslint/base'

export default {
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    '@typescript-eslint/unbound-method': 'off',
  },
}
