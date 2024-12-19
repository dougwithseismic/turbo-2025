// @ts-check
/* eslint-env node, commonjs */

/** @param {import('plop').NodePlopAPI} plop */
const plopfile = (plop) => {
  // String utilities
  const kebabCase = (str) => {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase()
  }

  const pascalCase = (str) => {
    return str
      .split(/[-_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')
  }

  const camelCase = (str) => {
    const pascal = pascalCase(str)
    return pascal.charAt(0).toLowerCase() + pascal.slice(1)
  }

  // Helpers
  plop.setHelper('camelCase', (txt) => camelCase(txt))
  plop.setHelper('pascalCase', (txt) => pascalCase(txt))
  plop.setHelper('dashCase', (txt) => kebabCase(txt))

  // Feature generator
  plop.setGenerator('feature', {
    description: 'Create a new feature with standardized structure',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Feature name (use kebab-case):',
      },
      {
        type: 'confirm',
        name: 'needsContext',
        message: 'Does this feature need a React context?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'needsAnimations',
        message: 'Does this feature need animations?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'needsForms',
        message: 'Does this feature need form components?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'needsStore',
        message: 'Does this feature need a Zustand store?',
        default: false,
      },
    ],
    actions: (data) => {
      if (!data) return []

      const basePath = 'src/features/{{name}}'
      const actions = [
        // Core files
        {
          type: 'add',
          path: `${basePath}/actions/index.ts`,
          templateFile: 'src/plop/templates/feature/actions/index.hbs',
        },
        {
          type: 'add',
          path: `${basePath}/components/index.ts`,
          templateFile: 'src/plop/templates/feature/components/index.hbs',
        },
        {
          type: 'add',
          path: `${basePath}/hooks/index.ts`,
          templateFile: 'src/plop/templates/feature/hooks/index.hbs',
        },
        {
          type: 'add',
          path: `${basePath}/types/index.ts`,
          templateFile: 'src/plop/templates/feature/types/index.hbs',
        },
        {
          type: 'add',
          path: `${basePath}/utils/index.ts`,
          templateFile: 'src/plop/templates/feature/utils/index.hbs',
        },
        {
          type: 'add',
          path: `${basePath}/index.ts`,
          templateFile: 'src/plop/templates/feature/index.hbs',
        },
        // Main component and hook
        {
          type: 'add',
          path: `${basePath}/components/{{dashCase name}}.tsx`,
          templateFile: 'src/plop/templates/feature/components/component.hbs',
        },
        {
          type: 'add',
          path: `${basePath}/hooks/use-{{dashCase name}}.ts`,
          templateFile: 'src/plop/templates/feature/hooks/hook.hbs',
        },
        // Documentation and error handling
        {
          type: 'add',
          path: `${basePath}/README.md`,
          templateFile: 'src/plop/templates/feature/README.hbs',
        },
        {
          type: 'add',
          path: `${basePath}/errors.ts`,
          templateFile: 'src/plop/templates/feature/errors.hbs',
        },
        // Tests
        {
          type: 'add',
          path: `${basePath}/__tests__/{{dashCase name}}.test.tsx`,
          templateFile:
            'src/plop/templates/feature/__tests__/component.test.hbs',
        },
        {
          type: 'add',
          path: `${basePath}/__tests__/use-{{dashCase name}}.test.ts`,
          templateFile: 'src/plop/templates/feature/__tests__/hook.test.hbs',
        },
      ]

      if (data.needsContext) {
        actions.push({
          type: 'add',
          path: `${basePath}/context/index.ts`,
          templateFile: 'src/plop/templates/feature/context/index.hbs',
        })
      }

      if (data.needsAnimations) {
        actions.push({
          type: 'add',
          path: `${basePath}/animations/index.ts`,
          templateFile: 'src/plop/templates/feature/animations/index.hbs',
        })
      }

      if (data.needsForms) {
        actions.push({
          type: 'add',
          path: `${basePath}/forms/index.ts`,
          templateFile: 'src/plop/templates/feature/forms/index.hbs',
        })
      }

      if (data.needsStore) {
        actions.push(
          {
            type: 'add',
            path: `${basePath}/store.ts`,
            templateFile: 'src/plop/templates/feature/store.hbs',
          },
          {
            type: 'add',
            path: `${basePath}/__tests__/store.test.ts`,
            templateFile: 'src/plop/templates/feature/__tests__/store.test.hbs',
          },
        )
      }

      return actions
    },
  })

  // Page generator
  plop.setGenerator('page', {
    description: 'Create a new Next.js server-side page with TanStack Query',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Page name (use kebab-case):',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/app/(core)/{{dashCase name}}/page.tsx',
        templateFile: 'src/plop/templates/page/page.hbs',
      },
    ],
  })
}

module.exports = plopfile
