module.exports = {
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:@next/next/recommended'],

  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },

  env: {
    browser: true,
    es6: true,
    node: true,
  },

  plugins: ['react'],

  settings: {
    react: {
      version: '17.0.2',
    },
  },

  rules: {
    'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
    'no-unused-vars': ['warn', { vars: 'all', args: 'none' }],
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
}
