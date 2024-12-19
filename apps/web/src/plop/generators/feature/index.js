// @ts-check
/* eslint-env node, commonjs, es6 */
/* global module */

/** @type {import('plop').PlopGeneratorConfig} */
const featureGenerator = {
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
      {
        type: 'add',
        path: `${basePath}/components/{{pascalCase name}}.tsx`,
        templateFile: 'src/plop/templates/feature/components/component.hbs',
      },
      {
        type: 'add',
        path: `${basePath}/hooks/use-{{dashCase name}}.ts`,
        templateFile: 'src/plop/templates/feature/hooks/hook.hbs',
      },
      {
        type: 'add',
        path: `${basePath}/__tests__/{{pascalCase name}}.test.tsx`,
        templateFile: 'src/plop/templates/feature/__tests__/component.test.hbs',
      },
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
      actions.push({
        type: 'add',
        path: `${basePath}/store.ts`,
        templateFile: 'src/plop/templates/feature/store.hbs',
      })
    }

    return actions
  },
}

module.exports = { featureGenerator }
