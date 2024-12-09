import globals from "globals";
import {config} from "@repo/config-eslint/base";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    ignores: ["dist/**/*"]
  },
  {languageOptions: { globals: globals.browser }},
  ...config
];