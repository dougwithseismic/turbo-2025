import type { PlopTypes } from '@turbo/gen'
import * as fs from 'fs'
import * as path from 'path'

const getTemplatesFromDir = (templateDir: string): string[] => {
  const templatesPath = path.resolve(
    `turbo/generators/templates/${templateDir}`,
  )

  try {
    return fs.readdirSync(templatesPath)
  } catch (error) {
    console.error(`Error reading ${templateDir} templates:`, error)
    return []
  }
}

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  // Generator for packages
  plop.setGenerator('create-package', {
    description: 'Create a new package from template',
    prompts: [
      {
        type: 'list',
        name: 'template',
        message: 'Which package template would you like to use?',
        choices: () => getTemplatesFromDir('packages'),
      },
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of the new package?',
        validate: (input: string) => {
          if (input.includes('.')) {
            return 'package name cannot include an extension'
          }
          if (input.includes(' ')) {
            return 'package name cannot include spaces'
          }
          if (!input) {
            return 'package name is required'
          }
          return true
        },
      },
    ],
    actions: [
      {
        type: 'addMany',
        templateFiles: 'templates/packages/{{ template }}/**/*',
        destination: '{{ turbo.paths.root }}/packages/{{ dashCase name }}',
        base: 'templates/packages/{{ template }}',
        transform: (content, data) => {
          // Replace package name in package.json
          if (content.includes('"@repo/example"')) {
            return content.replace('"@repo/example"', `"@repo/${data.name}"`)
          }
          return content
        },
      },
    ],
  })

  // Generator for apps
  plop.setGenerator('create-app', {
    description: 'Create a new app from template',
    prompts: [
      {
        type: 'list',
        name: 'template',
        message: 'Which app template would you like to use?',
        choices: () => getTemplatesFromDir('apps'),
      },
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of the new app?',
        validate: (input: string) => {
          if (input.includes('.')) {
            return 'app name cannot include an extension'
          }
          if (input.includes(' ')) {
            return 'app name cannot include spaces'
          }
          if (!input) {
            return 'app name is required'
          }
          return true
        },
      },
    ],
    actions: [
      {
        type: 'addMany',
        templateFiles: 'templates/apps/{{ template }}/**/*',
        destination: '{{ turbo.paths.root }}/apps/{{ dashCase name }}',
        base: 'templates/apps/{{ template }}',
        transform: (content, data) => {
          // Replace app name in package.json if it exists
          if (content.includes('"name":')) {
            return content.replace(/"name": ".*"/, `"name": "${data.name}"`)
          }
          return content
        },
      },
      {
        type: 'add',
        templateFile: 'templates/apps/{{ template }}/.env.example',
        path: '{{ turbo.paths.root }}/apps/{{ dashCase name }}/.env',
        skipIfExists: true,
      },
    ],
  })
}
