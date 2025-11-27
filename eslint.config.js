const globals = require('globals')
const react = require('eslint-plugin-react')
const reactHooks = require('eslint-plugin-react-hooks')
const { fixupPluginRules } = require('@eslint/compat')
const js = require('@eslint/js')
const { FlatCompat } = require('@eslint/eslintrc')
const nextPlugin = require('@next/eslint-plugin-next')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

module.exports = [
  js.configs.recommended,
  ...compat.extends('plugin:react/recommended'),
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
    },
  },
  {
    languageOptions: {
      ecmaVersion: 11,
      sourceType: 'module',
      parserOptions: {},

      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    plugins: {
      react,
      'react-hooks': fixupPluginRules(reactHooks),
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      'no-console': [
        'warn',
        {
          allow: ['info', 'warn', 'error'],
        },
      ],

      'no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'none',
        },
      ],

      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]
