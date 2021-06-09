module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
  ],

  parser: 'babel-eslint',

  env: {
    browser: true,
    commonjs: true,
    es6: true,
    mocha: true,
    webextensions: true,
  },

  plugins: [
    'babel',
    'react',
  ],

  globals: {
    'process': true,
    'gaBGAT': false
  },

  settings: {
    react: {
      version: '16.6.0',
    },
  },

  rules: {
    'semi': ['error', 'never'],
    'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
    'no-unused-vars': ['error', { vars: 'all', args: 'none' }],
    'comma-dangle': ['error', 'always-multiline'],
    'no-multiple-empty-lines': ['error', { max: 1 }],
    'space-before-function-paren': ['error', { anonymous: 'always', named: 'never', asyncArrow: 'always' }],
    'object-curly-spacing': ['error', 'always'],
    'react/no-children-prop': 'off',
    'react/no-deprecated': 'off',
    'keyword-spacing': 'error',
    'quotes': ['error', 'single', { allowTemplateLiterals: true }],
    'curly': ['error', 'all'],
    'no-multi-spaces': 'error',
    'indent': ['error', 2, { 'SwitchCase': 1 }],
  },
}
