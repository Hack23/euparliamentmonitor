---
applyTo: "scripts/**/*.js"
---

## JavaScript Script Requirements

When writing or modifying scripts in `scripts/`, follow these conventions:

### File Header
Every file must start with SPDX headers:
```js
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
```

### Module System
- Use ES modules (`import`/`export`) — the project has `"type": "module"` in `package.json`
- Never use `require()` or CommonJS

### JSDoc Documentation
All exported functions require full JSDoc:
```js
/**
 * Brief description of what the function does.
 *
 * @param {string} param1 - Description of param1
 * @param {Object} options - Configuration options
 * @param {boolean} options.flag - Description of flag
 * @returns {Promise<Object>} Description of return value
 */
export async function myFunction(param1, options) { ... }
```

### Code Quality Rules (enforced by ESLint)
- Use `const` by default; `let` only when reassignment is required
- Use `===` and `!==` (never `==` or `!=`)
- Never use `eval`, `new Function()`, or implied eval
- Cognitive complexity must stay ≤ 15 per function
- Avoid duplicate strings (threshold: 3 occurrences — extract to constants)
- All `async` functions must use `await`; no `return-await`

### Security
- Sanitize all user/external inputs before use
- Avoid dynamic `RegExp` construction with untrusted input
- Use `crypto.randomUUID()` or `crypto.randomBytes()` — never `Math.random()` for tokens
- Log errors without exposing internal stack traces to end users

### Build & Lint
Run before committing:
```bash
npm run lint          # ESLint validation
npm run format:check  # Prettier formatting check
```
