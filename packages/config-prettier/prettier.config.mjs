/** @type {import("prettier").Config} */
export default {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  arrowParens: 'always',
  proseWrap: 'preserve',
  endOfLine: 'lf',
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 100,
      },
    },
  ],
};
