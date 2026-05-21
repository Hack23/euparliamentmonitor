import js from '@eslint/js';
import securityPlugin from 'eslint-plugin-security';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.ts'],
    plugins: {
      security: securityPlugin,
      sonarjs: sonarjsPlugin,
      jsdoc: jsdocPlugin,
      '@typescript-eslint': tseslint,
    },
    languageOptions: {
      ecmaVersion: 2025,
      sourceType: 'module',
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        NodeJS: 'readonly',
        fetch: 'readonly',
        AbortSignal: 'readonly',
      },
    },
    rules: {
      // Possible Errors
      'no-console': 'off',
      'no-unused-vars': 'off',
      // TypeScript handles undefined-variable checks better than ESLint's no-undef rule,
      // which false-positives on TypeScript-only types like BufferEncoding.
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // Best Practices
      eqeqeq: ['error', 'always'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-return-await': 'off',
      'prefer-const': 'error',
      'require-await': 'off',

      // TypeScript Type Safety
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'as', objectLiteralTypeAssertions: 'allow-as-parameter' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',

      // Security
      // detect-object-injection is disabled: it produces false positives on all
      // bracket-notation access in TypeScript where the type system already
      // prevents real object-injection vulnerabilities (well-known limitation).
      'security/detect-object-injection': 'off',
      // detect-non-literal-regexp is disabled: the flagged RegExp usages in this
      // codebase construct patterns from pre-validated internal constants (e.g.
      // ISO language codes), not from untrusted user input.
      'security/detect-non-literal-regexp': 'off',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-eval-with-expression': 'error',

      // Code Smell Detection. `sonarjs/cognitive-complexity` is a
      // superior gauge to the classic McCabe cyclomatic count (it
      // weights nesting and short-circuits), so we enforce that and
      // skip the duplicate `complexity` rule from core ESLint.
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/no-duplicate-string': ['error', { threshold: 3 }],
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-collapsible-if': 'error',
      'sonarjs/no-collection-size-mischeck': 'error',
      'sonarjs/no-redundant-boolean': 'error',
      'sonarjs/no-unused-collection': 'error',
      'sonarjs/prefer-immediate-return': 'error',

      // Async hygiene — every Promise must be awaited, returned, or
      // explicitly voided. Catches forgotten `await` on `fs.promises.*`,
      // unhandled rejections in CLI scripts, and missing `void` markers.
      '@typescript-eslint/no-floating-promises': 'error',

      // File-size ceiling — hard 600 **code-line** cap on every TypeScript
      // source file under src/ (blank lines and comment-only lines excluded
      // so that SPDX headers and JSDoc blocks don't eat into the budget).
      // A complementary drift-guard in test/unit/source-file-size.test.js
      // enforces the stricter 600 **raw-line** ceiling using `wc -l` semantics
      // (the canonical acceptance gate from the Refactor series #2029-#2036).
      // Per-area tighter 400-code-line ceilings are layered as separate
      // override blocks below. Together these prevent silent regression to
      // the >600 LOC anti-pattern (ISO 27001 A.8.28 / A.8.32, NIST CSF 2.0
      // PR.PS-01, CIS Controls v8.1 § 16).
      'max-lines': ['error', { max: 600, skipBlankLines: true, skipComments: true }],

      // Documentation
      'jsdoc/check-alignment': 'error',
      'jsdoc/check-param-names': 'error',
      'jsdoc/check-tag-names': 'error',
      'jsdoc/check-types': 'off',
      'jsdoc/require-description': 'error',
      'jsdoc/require-param': 'error',
      'jsdoc/require-param-description': 'error',
      'jsdoc/require-param-type': 'off',
      'jsdoc/require-returns': 'error',
      'jsdoc/require-returns-description': 'error',
      'jsdoc/require-returns-type': 'off',
    },
  },
  {
    files: ['test/**/*.js'],
    plugins: {
      security: securityPlugin,
      jsdoc: jsdocPlugin,
    },
    languageOptions: {
      ecmaVersion: 2025,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        NodeJS: 'readonly',
        fetch: 'readonly',
        AbortSignal: 'readonly',
        global: 'readonly',
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'always'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'prefer-const': 'error',

      // Security
      'security/detect-object-injection': 'off',
      'security/detect-unsafe-regex': 'error',
      'security/detect-eval-with-expression': 'error',

      // Documentation — encourage JSDoc in test helpers/fixtures
      'jsdoc/check-alignment': 'error',
      'jsdoc/check-param-names': 'error',
      'jsdoc/check-tag-names': 'error',
    },
  },
  // Per-area 400-line ceilings — tighter than the global 600-line cap for
  // modules whose post-refactor sizes are well below 400 code lines. Each
  // block covers one bounded-context directory whose responsibility is
  // narrow enough that a 400-line ceiling is a meaningful quality gate.
  // Areas with files currently between 400–600 code lines (e.g. src/utils,
  // src/aggregator/reader-guide) retain only the global 600-line guard until
  // those files are further split.
  {
    // Types & contracts — pure type modules should stay small and cohesive.
    files: ['src/types/**/*.ts'],
    rules: { 'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }] },
  },
  {
    // Configuration registry — horizon definitions and lookup tables.
    files: ['src/config/**/*.ts'],
    rules: { 'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }] },
  },
  {
    // Aggregator clean pipeline — each module handles one cleanup operation.
    files: ['src/aggregator/clean/**/*.ts'],
    rules: { 'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }] },
  },
  {
    // Aggregator run pipeline — per-phase rendering sub-modules.
    files: ['src/aggregator/run/**/*.ts'],
    rules: { 'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }] },
  },
  {
    // Aggregator HTML pipeline — per-concern HTML fragment builders.
    files: ['src/aggregator/html/**/*.ts'],
    rules: { 'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }] },
  },
  {
    // Aggregator generator pipeline — CLI, discovery, rendering entry points.
    files: ['src/aggregator/generator/**/*.ts'],
    rules: { 'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }] },
  },
  {
    // Template section builders — one builder per UI section.
    files: ['src/templates/sections/**/*.ts'],
    rules: { 'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }] },
  },
  {
    // MCP transport layer — shared JSON-RPC transport primitives.
    files: ['src/mcp/transport/**/*.ts'],
    rules: { 'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }] },
  },
];
