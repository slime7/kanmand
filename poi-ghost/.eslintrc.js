module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
    browser: true
  },
  extends: ['airbnb', 'poi-plugin'],
  plugins: ['import', 'react'],
  rules: {
    semi: ['error', 'always'],
    'import/no-unresolved': [2, { ignore: ['views/.*'] }],
    'react/jsx-filename-extension': 'off',
    'no-underscore-dangle': ['error', { allowAfterThis: true }],
    'import/extensions': ['error', { es: 'never' }],
    'import/no-extraneous-dependencies': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'no-confusing-arrow': ['error', { allowParens: true }],
    'react/prefer-stateless-function': 'off',
    'no-console': ['warn', {allow: ['log', 'warn', 'error']}],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.es'],
      },
    },
  },
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
  },
};
