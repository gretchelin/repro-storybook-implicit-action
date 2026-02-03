import js from "@eslint/js";
import {FlatCompat} from "@eslint/eslintrc";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import { defineConfig } from "eslint/config";

const compat = new FlatCompat();

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"], languageOptions: { globals: {...globals.browser, ...globals.node} } },
  tseslint.configs.recommended,
  pluginVue.configs["flat/essential"],
  { files: ["**/*.vue"], languageOptions: { parserOptions: { parser: tseslint.parser } } },

  // Override rules
  ...compat.extends('./.eslintrc-auto-import.json'),
  {
    // languageOptions: autoImports,
    rules: {
      // semi: ["error", "always"],

      '@typescript-eslint/no-explicit-any': 'off',
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "args": "all",
          "argsIgnorePattern": "^_",
          "caughtErrors": "all",
          "caughtErrorsIgnorePattern": "^_",
          "destructuredArrayIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "ignoreRestSiblings": true
        }
      ],

      'vue/valid-v-slot': 'off',
      'vue/max-attributes-per-line': ['error', {
        singleline: {
          max: 1,
        },
        multiline: {
          max: 1,
        },
      }],
      'vue/multi-word-component-names': 'off', // turning this off because nuxt pages may have single-word "component"
      'vue/first-attribute-linebreak': ['error', {
        singleline: 'ignore',
        multiline: 'below',
      }],
      'vue/block-order': ['error', {
        order: [['script', 'template'], 'style'],
      }],
    }
  }
]);
