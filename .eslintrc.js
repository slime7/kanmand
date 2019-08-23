module.exports = {
  root: true,

  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },

  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],

  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-param-reassign': [
      'error',
      {
        'props': true,
        'ignorePropertyModificationsFor': [
          'state',
          'acc',
          'e',
        ],
      },
    ],
    'import/no-extraneous-dependencies': [2, {
      'ignore':
        [
          'electron',
          'vue-cli-plugin-electron-builder/lib'
        ]
    }],
  },

  parserOptions: {
    parser: 'babel-eslint',
  },
};
