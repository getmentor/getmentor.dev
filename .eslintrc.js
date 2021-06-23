module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',

  env: {
    browser: true,
    es6: true,
    node: true,
  },

  plugins: ['react', '@typescript-eslint'],

  settings: {
    react: {
      version: '17.0.2',
    },
  },

  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
  ],

  rules: {
    'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
    'no-unused-vars': ['warn', { vars: 'all', args: 'none' }],
    'prefer-const': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
}
