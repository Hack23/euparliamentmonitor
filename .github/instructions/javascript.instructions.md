---
applyTo: "src/**/*.ts"
---

## TypeScript Source Requirements

When writing or modifying TypeScript source files in `src/`, follow these conventions:

### File Header
Every file must start with SPDX headers:
```ts
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
```

### Module System
- Use ES modules (`import`/`export`) — the project has `"type": "module"` in `package.json`
- Never use `require()` or CommonJS
- TypeScript compiles from `src/` to `scripts/` via `tsconfig.json`

### Directory Structure (Bounded Contexts)
- `src/types/` — Shared TypeScript type definitions and interfaces
- `src/constants/` — Consolidated language data, configuration constants
- `src/templates/` — HTML template generation
- `src/generators/` — News, index, and sitemap generators
- `src/mcp/` — European Parliament MCP client
- `src/utils/` — Shared file utilities and news metadata

### TypeScript Strict Mode
- `strict: true` is enabled in tsconfig.json
- All parameters and return types must be explicitly typed
- Use `interface` for object shapes, `type` for unions/aliases
- Import types with `import type` when only used as types
- Use `readonly` arrays where mutation is not needed

### JSDoc Documentation
All exported functions require JSDoc descriptions:
```ts
/**
 * Brief description of what the function does.
 *
 * @param param1 - Description of param1
 * @param options - Configuration options
 * @returns Description of return value
 */
export function myFunction(param1: string, options: Options): Promise<Result> { ... }
```

### Code Quality Rules (enforced by ESLint)
- Use `const` by default; `let` only when reassignment is required
- Use `===` and `!==` (never `==` or `!=`)
- Never use `eval`, `new Function()`, or implied eval
- Cognitive complexity must stay ≤ 15 per function
- Avoid duplicate strings (threshold: 3 occurrences — extract to constants)

### Security
- Sanitize all user/external inputs before use
- Avoid dynamic `RegExp` construction with untrusted input
- Use `crypto.randomUUID()` or `crypto.randomBytes()` — never `Math.random()` for tokens
- Log errors without exposing internal stack traces to end users

### Build & Lint
Run before committing:
```bash
npm run build         # TypeScript compilation
npm run build:check   # Type checking without emit
npm run lint          # ESLint validation
npm run format:check  # Prettier formatting check
```
