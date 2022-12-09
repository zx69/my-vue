module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'airbnb-base'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  }, 
  rules: {
    'no-unused-expressions': ['error', { allowShortCircuit: true }],
    'no-nested-ternary': ['warn'],
    'max-len': '150',
  },
};
