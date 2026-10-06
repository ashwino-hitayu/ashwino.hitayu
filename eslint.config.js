import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['dist/', '.visual/', 'node_modules/'] },
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: { globals: globals.browser }
  },
  {
    files: ['scripts/**/*.mjs', 'vite.config.js', 'eslint.config.js', 'src/**/*.test.js'],
    languageOptions: { globals: globals.node }
  },
  {
    // the visual check passes functions to page.evaluate(), which run in the browser
    files: ['scripts/visual-check.mjs'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } }
  },
  {
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }]
    }
  },
  prettier
];
