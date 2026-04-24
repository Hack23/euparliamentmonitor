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
npm run lint           # ESLint (lint TypeScript in src/)
npm run htmlhint       # HTMLHint validation (HTML files)
npm run format         # Prettier formatting
npm run test           # Vitest unit tests
npm run test:coverage  # Tests with coverage
npm run test:e2e       # Playwright E2E tests
npm run generate-article -- --run analysis/daily/<date>/<slug>-run<NN>/  # Render article from committed analysis artifacts
npm run docs:generate  # Generate TypeDoc API docs
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

This repo's gh-aw workflows use the following format (see `news-breaking-analysis.md`):

```markdown
---
timeout-minutes: 60
on:
  schedule:
    - cron: "0 */6 * * *"
  workflow_dispatch: {}
permissions:
  contents: read
  issues: read

network:
  allowed:
    - node
    - github.com
    - api.github.com
    - data.europarl.europa.eu
    - "*.europa.eu"
    - defaults

tools:
  github:
    toolsets:
      - all
  bash: true

safe-outputs:
  allowed-domains:
    - data.europarl.europa.eu
    - www.europarl.europa.eu
    - github.com
  create-pull-request: {}
  add-comment: {}

engine:
  id: copilot
  model: claude-opus-4.7
---
```

### Safe Output Rules
- Agent produces JSONL artifacts, never writes to GitHub directly
- Guardrails are enforced via the compiled `.lock.yml` (e.g. `max_patch_size`, protected file lists, and network/output restrictions)
- Title prefixes and label allowlists are optional gh-aw capabilities and are not currently configured for this repo
- **Single-PR rule (lint-enforced)**: every article-generating `news-*.md` workflow calls `safeoutputs___create_pull_request` **exactly once**, at the end of the run, after all files are written. `news-translate.md` is exempt (uses `max-patch-size` flush). See `.github/prompts/06-pr-and-safe-outputs.md` and `scripts/lint-prompts.js`.

### Prompt Library (bounded contexts)

All behaviour shared across news workflows lives in [`.github/prompts/`](../prompts/README.md):

| File | Bounded context |
|------|-----------------|
| `00-scope-and-ground-rules.md` | Workspace scope, forbidden edits, neutrality |
| `01-data-collection.md` | EP MCP feeds + direct fallbacks, WB/IMF, deep-fetch |
| `02-analysis-protocol.md` | 2-pass analysis, methodologies/templates |
| `03-analysis-completeness-gate.md` | Blocking `validate-analysis` gate |
| `04-article-generation.md` | Prose/SWOT/stakeholder depth floors, charts |
| `05-analysis-to-article-contract.md` | Division of responsibility: agent owns Stage-B artifacts, aggregator owns HTML render, Stage-C reviews depth floors |
| `06-pr-and-safe-outputs.md` | **Single-PR rule**, noop diagnostics |
| `07-mcp-reference.md` | Canonical EP/WB/IMF tool tables |
| `08-infrastructure.md` | Frontmatter, `mcp-setup.sh`, client env vars |
| `09-troubleshooting.md` | AWF firewall diagnostic, error → root-cause |

Workflow `.md` files reference these by relative path — never duplicate. Running `npm run lint:prompts` validates the single-PR rule and banned-phrase list before `gh aw compile`.

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

## 🧠 AI-FIRST QUALITY PRINCIPLE

> **See `.github/skills/ai-first-quality.md`** for the full specification.

All AI-generated content (analysis, articles, documentation) MUST follow the **AI-First Quality Principle**:

1. **Mandatory 2-Pass Iterative Improvement** — Every content output requires at least 2 passes: Pass 1 writes initial content, Pass 2 reads the ENTIRE output and improves every section.
2. **No Early Completion** — Use the FULL allocated time. Rushing produces low-quality output.
3. **Quality Gates** — ≥80 words/SWOT item, ≥150 words/stakeholder perspective, ≥60% prose ratio, ≥1 Chart.js visualization per article, zero `[AI_ANALYSIS_REQUIRED]` markers.
4. **The Economist Test** — Every analytical paragraph must explain WHY (not just WHAT), name specific actors, and cite specific evidence.
