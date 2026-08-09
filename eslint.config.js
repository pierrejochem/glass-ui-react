// Flat config. ESLint 9 dropped .eslintrc as the default and 10 removed it
// outright, so this file replaces .eslintrc.cjs one for one — same parser,
// same plugins, same four rules.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  // Flat config has no ignorePatterns: a config object with only `ignores`
  // is the global ignore list.
  { ignores: ['dist/**', 'coverage/**', '_site/**', 'node_modules/**'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },

  // The tests reach for globals the library itself never uses
  {
    files: ['test/**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.vitest } },
  }
);
