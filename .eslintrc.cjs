module.exports = {
  root: true,
  env: {
    node: true
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  extends: ['airbnb-base', 'plugin:node/recommended'],
  rules: {
    'comma-dangle': ['error', 'never'],
    'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
    'arrow-parens': ['error', 'as-needed'],
    'no-plusplus': 'off',
    'no-await-in-loop': 'off',
    'no-empty': ['error', { allowEmptyCatch: true }],

    'no-param-reassign': ['error', {
      props: true,
      ignorePropertyModificationsFor: ['prev']
    }],

    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message: 'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.'
      },
      {
        selector: 'LabeledStatement',
        message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.'
      },
      {
        selector: 'WithStatement',
        message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.'
      }
    ],

    'import/extensions': ['error', 'ignorePackages']
  }
};
