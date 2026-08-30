import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    files: ['src/scripts/**/*.js', 'src/contact/**/*.js'],
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  {
    files: ['functions/**/*.js'],
    languageOptions: {
      globals: globals.serviceworker,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  {
    files: [
      'vite.config.js',
      'eslint.config.js',
      'scripts/**/*.mjs',
      'tests/**/*.mjs',
      'src/config/**/*.js',
      'src/content/**/*.js',
      'src/components/**/*.js',
      'src/pages/**/*.js',
    ],
    languageOptions: {
      globals: globals.node,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  { ignores: ['dist/**', 'node_modules/**'] },
  eslintConfigPrettier,
];
