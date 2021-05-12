module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    "@typescript-eslint/ban-ts-ignore": "off",
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    "@typescript-eslint/camelcase": ["error", {"allow": [
      "node_version",
      "_(contains)|(eq)|(not)|(lt)|(lte)|(gt)|(gte)|(in)|(startsWith)|(endsWith)$"
    ]}],
    '@typescript-eslint/no-unused-vars': ["error", { "argsIgnorePattern": "^_" }],
  },
};
