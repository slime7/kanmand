module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
    browser: true
  },
  extends: [
    'airbnb-base',
  ],
  plugins: [
    'import',
  ],
  rules: {
    'import/no-unresolved':
      [2, {
        'ignore':
          [
            'views/utils/game-utils',
            'views/utils/selectors',
            'views/create-store',
            'views/components/etc/avatar',
            'views/components/etc/icon',
          ]
      }],
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
