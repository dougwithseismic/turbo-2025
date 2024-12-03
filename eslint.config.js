import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"]},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["dist/**"]
  }
];