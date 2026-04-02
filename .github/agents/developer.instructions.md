---
description: Developer instructions for EU Parliament Monitor — TypeScript, gh-aw workflows, and contribution standards
applyTo: "**/*"
---

# Developer Instructions

Development guidelines and standards for the EU Parliament Monitor project.

## Code Organization

### Directory Structure

```
src/                    # TypeScript source (compiles to scripts/)
├── types/              # Shared type definitions and interfaces
├── constants/          # Language data, configuration constants
├── templates/          # HTML template generation
├── generators/         # News, index, and sitemap generators
│   └── pipeline/       # Multi-stage generation pipeline
├── mcp/                # European Parliament MCP client
└── utils/              # Shared file utilities and news metadata

test/                   # Vitest unit tests
e2e/                    # Playwright E2E tests
.github/workflows/      # gh-aw markdown workflows + GitHub Actions YAML
.github/skills/         # Copilot skills library
.github/agents/         # Copilot custom agents
news/                   # Generated HTML news articles (14 languages)
analysis/               # AI analysis artifacts per article
```

### Module System
- ES modules (`import`/`export`) — `"type": "module"` in package.json
- TypeScript compiles from `src/` to `scripts/` via `tsconfig.json`
- Target: ES2025, module: NodeNext

## Development Standards

### Code Quality
- `strict: true` TypeScript with explicit types
- `const` by default; `let` only when reassignment is required
- `===`/`!==` only (never `==`/`!=`)
- Cognitive complexity ≤ 15 per function
- Extract duplicate strings (threshold: 3 occurrences)

### Security
- Sanitize all user/external inputs
- No `eval`, `new Function()`, or dynamic RegExp with untrusted input
- Use `crypto.randomUUID()` — never `Math.random()` for tokens
- No hardcoded secrets; use GitHub Secrets

### JSDoc Documentation
All exported functions require JSDoc with `@param` and `@returns`.

## Build & Test Commands

```bash
npm run build          # TypeScript compilation
npm run build:check    # Type checking without emit
npm run lint           # ESLint + HTMLHint validation
npm run format         # Prettier formatting
npm run test           # Vitest unit tests
npm run test:coverage  # Tests with coverage
npm run test:e2e       # Playwright E2E tests
npm run generate-news  # Generate news articles
npm run docs:generate  # JSDoc API docs
```

## gh-aw Workflow Development

Workflow files live in `.github/workflows/*.md` and compile to `.lock.yml`:

```bash
gh aw compile [workflow]    # Compile .md to .lock.yml
gh aw compile --validate    # Validate without writing
gh aw logs [workflow]       # View run logs
gh aw audit <run-id>        # Audit a run
```

### Workflow Frontmatter

```markdown
---
timeout-minutes: 10
on:
  schedule: daily
permissions:
  contents: read
tools:
  github:
    toolsets: [issues, repos]
  european-parliament: {}
safe-outputs:
  create-pull-request:
    title-prefix: "[news] "
    labels: [automated, news]
---
```

### Safe Output Rules
- Agent produces JSONL artifacts, never writes to GitHub directly
- Write job validates against `safe-outputs` constraints
- Title prefixes, label allowlists, and max counts enforce guardrails

## Testing Strategy

| Type | Framework | Location | Command |
|------|-----------|----------|---------|
| Unit | Vitest | `test/` | `npm run test` |
| E2E | Playwright | `e2e/` | `npm run test:e2e` |
| Coverage | Vitest | `test/` | `npm run test:coverage` |

### Test Conventions
- Fixtures in `test/fixtures/ep-data.js`
- Helpers in `test/helpers/test-utils.js`
- Mock external deps with `vi.mock()` / `vi.spyOn()`
- Restore mocks in `afterEach` with `vi.restoreAllMocks()`

## Quick Reference

| Pattern | Example |
|---------|---------|
| New TypeScript module | Create in `src/`, export from index, add tests |
| New language strings | Add to `src/constants/language-ui.ts` |
| New article template | Update `src/templates/article-template.ts` |
| New MCP tool usage | Update `src/mcp/ep-mcp-client.ts` |
| New gh-aw workflow | Create `.md` file, compile with `gh aw compile` |
