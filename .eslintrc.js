module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
  ],

  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },

  env: {
    browser: true,
    es6: true,
    node: true,
  },

  plugins: [
    'react',
  ],

  settings: {
    react: {
      version: '17.0.2',
    },
  },

  rules: {
    'semi': ['warn', 'never'],
    'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
    'no-unused-vars': ['warn', { vars: 'all', args: 'none' }],
    'comma-dangle': ['warn', 'always-multiline'],
    'no-multiple-empty-lines': ['warn', { max: 1 }],
    'space-before-function-paren': ['warn', { anonymous: 'always', named: 'never', asyncArrow: 'always' }],
    'object-curly-spacing': ['warn', 'always'],
    'keyword-spacing': 'warn',
    'quotes': ['warn', 'single', { allowTemplateLiterals: true }],
    'curly': ['warn', 'all'],
    'indent': ['warn', 2, { 'SwitchCase': 1 }],
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
}
