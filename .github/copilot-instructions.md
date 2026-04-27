# GitHub Copilot Custom Instructions - EU Parliament Monitor

## 📋 Required Reading on Session Start

**ALWAYS read these files at the start of every session:**

1. **`.github/workflows/copilot-setup-steps.yml`** - Workflow configuration and permissions
2. **`.github/copilot-mcp.json`** - MCP server configuration and available tools
3. **`README.md`** - Project overview, features, and documentation links
4. **`.github/skills/`** - Skills library (security, architecture, compliance, testing, gh-aw)
5. **`.github/agents/`** - Specialized agents for delegation

## 🎯 Project Overview

**EU Parliament Monitor** is a European Parliament Intelligence Platform generating multi-language news articles (14 languages) using EP open data via MCP server integration, powered by GitHub Agentic Workflows.

- **Stack**: Node.js 25, TypeScript 6, HTML5/CSS3, Vitest, Playwright, ESLint
- **License**: Apache-2.0 | **Deployment**: AWS S3/CloudFront (primary) with GitHub Pages as fallback/runbook
- **Data**: European Parliament MCP Server (`european-parliament-mcp-server@1.2.15`)
- **Languages**: EN, SV, DA, NO, FI, DE, FR, ES, NL, AR, HE, JA, KO, ZH
- **Agentic Workflows**: 9 gh-aw markdown workflows for automated news generation — 8 unified `news-<type>.md` workflows (run Stages A → E in one 45-min session, single PR) plus the `news-translate.md` 14-language helper (manual, multi-call flush, exempt from single-PR rule)
- **Security**: ISO 27001, NIST CSF 2.0, CIS Controls v8.1, GDPR, NIS2, EU CRA

## 🤖 Available Agents

| Agent | Purpose |
|-------|---------|
| **news-journalist** | The Economist-style EU Parliament reporting in 14 languages |
| **data-pipeline-specialist** | European Parliament MCP server integration and data pipelines |
| **frontend-specialist** | HTML5/CSS3, WCAG 2.1 AA accessibility, responsive design |
| **quality-engineer** | Testing, HTML validation, accessibility testing, performance |
| **devops-engineer** | GitHub Actions, CI/CD, gh-aw workflow compilation |
| **documentation-architect** | C4 models, Mermaid diagrams, API documentation |
| **product-task-agent** | Issue creation, product management, ISMS tracking |
| **agentic-workflows** | gh-aw workflow creation, debugging, and upgrades |

**Delegate specialized tasks to the appropriate agent.**

## 🏗️ Build & Test Commands

```bash
npm run lint          # ESLint (lint TypeScript in src/)
npm run htmlhint      # HTMLHint validation (HTML files)
npm run test          # Run unit tests (Vitest)
npm run test:coverage # Tests with coverage reporting
npm run test:e2e      # Playwright E2E tests
npm run generate-news # Generate multi-language news articles
npm run docs:generate # Generate TypeDoc API docs
npm run format        # Prettier formatting
npm run build         # TypeScript compilation
```

## 🔄 GitHub Agentic Workflows (gh-aw)

This project uses **gh-aw markdown workflows** in `.github/workflows/*.md` for automated news generation. These are compiled to `.lock.yml` files and run AI agents (Copilot/Claude/Codex) in sandboxed GitHub Actions with safe outputs.

**Workflow files** (8 unified article workflows + 1 translation helper = 9 files): for each news type / canonical `ARTICLE_TYPE_SLUG` (`breaking`, `week-in-review`, `month-in-review`, `week-ahead`, `month-ahead`, `committee-reports`, `motions`, `propositions`) there is a single unified `news-<type>.md` (`timeout-minutes: 45`) that runs Stages A → E in one session and produces exactly one PR containing both analysis artifacts and the rendered article HTML. The PR call (`safeoutputs___create_pull_request`) must land by minute ≤ 28 to stay inside the safeoutputs MCP session TTL (~28–30 min). Helper workflow: `news-translate.md` (14-language translation, `workflow_dispatch:` only, exempt from single-PR rule). The earlier split-pair `news-<type>-analysis.md` + `news-<type>-article.md` layout and the manual `news-article-generator.md` helper were removed in the April-2026 aggregator-pipeline migration — see [`.github/workflows/README.md`](./workflows/README.md).

**Key concepts**: Safe outputs (create-pull-request with constraints), AWF firewall (Squid proxy allowlist), 5-layer security model, JSONL artifacts, lock file compilation.

**Prompt library**: Workflow bodies are thin shells that import ten focused prompt files under [`.github/prompts/`](./prompts/README.md) (`00-scope-and-ground-rules.md` → `09-troubleshooting.md`). Every article-generating workflow follows the fixed stage order **Data → Analysis (2 pass) → Completeness Gate → Article (2 pass) → Single PR** and calls `safeoutputs___create_pull_request` **exactly once** at end of run. `scripts/lint-prompts.js` (wired into `compile-agentic-workflows.yml`, also `npm run lint:prompts`) fails CI on violations — banned patterns: `checkpoint pr`, `keep-alive`, `heartbeat`, `progressive safe output`, `push_repo_memory`. `news-translate.md` is the sole exemption (legitimate multi-call flush).

**MCP Gateway**: All workflows use `source scripts/mcp-setup.sh` to configure `EP_MCP_GATEWAY_URL`, which defaults to `http://host.docker.internal:8080/mcp/european-parliament` (port/domain can be overridden dynamically from `/home/runner/.copilot/mcp-config.json`), and to extract auth tokens (no `jq` dependency). The EP MCP TypeScript client is in `src/mcp/ep-mcp-client.ts` (compiled to `scripts/mcp/ep-mcp-client.js`) and reads these env vars automatically.

**gh-aw docs**: https://github.github.com/gh-aw/ | [Abridged](https://github.github.com/gh-aw/llms-small.txt) | [Full](https://github.github.com/gh-aw/llms-full.txt) | [Blog series](https://github.github.com/gh-aw/_llms-txt/agentic-workflows.txt) | [Repo](https://github.com/github/gh-aw)

## 📊 Analysis Artifacts (Deep Political Analysis)

Every article-generating workflow produces a **39-template analysis artifact set** under `analysis/daily/<YYYY-MM-DD>/<article-type-slug>/` **before** drafting any prose. The chain is: **Data → Analysis Artifacts → Completeness Gate → Article → PR**.

**Canonical references** (read by every agent on the news critical path):
- [`analysis/methodologies/ai-driven-analysis-guide.md`](./../analysis/methodologies/ai-driven-analysis-guide.md) — the **10-step protocol** (Rules 1–22, Step 10.5 = `methodology-reflection.md` as final artifact)
- [`analysis/methodologies/artifact-catalog.md`](./../analysis/methodologies/artifact-catalog.md) — master map: every artifact → methodology + template + depth floor + Mermaid type
- [`analysis/methodologies/per-artifact-methodologies.md`](./../analysis/methodologies/per-artifact-methodologies.md) — 34 `### sections`, one per artifact type, construction rules + quality signals
- [`analysis/templates/README.md`](./../analysis/templates/README.md) — index of the **39 templates** (6 framework + 14 agentic-workflow + 25 per-artifact)
- [`analysis/methodologies/reference-quality-thresholds.json`](./../analysis/methodologies/reference-quality-thresholds.json) — per-artifact line floors enforced at Stage C by `npm run validate-analysis`

**Read-Before-Write rule**: The article agent MUST read every artifact produced in Stage B **before** writing any prose. Article sections must cite specific `analysis/daily/<date>/<slug>/…` files per the map in [`.github/prompts/04-article-generation.md`](./prompts/04-article-generation.md) § 7.1. An article that doesn't cite per-section artifacts fails Stage C and is blocked from PR creation.

## 🧠 AI-FIRST QUALITY PRINCIPLE (NON-NEGOTIABLE)

> **Every agent, every workflow, every content output** must follow this principle. See `.github/skills/ai-first-quality.md` for the full skill specification.

**Core Rule**: AI writes ALL analysis and article content. TypeScript code only handles HTML output structure. The AI MUST produce **Economist-quality political intelligence** — not shallow code-generated summaries.

**Mandatory 2-Pass Iterative Improvement**:
- **Pass 1** (~60% of phase time): Write initial content — analysis, prose, SWOT, stakeholders, risk assessments
- **Pass 2** (~40% of phase time): Read ENTIRE output word-by-word. Identify shallow sections, missing evidence, placeholder text. Rewrite and extend every section that doesn't meet quality gates.
- **One pass is NEVER sufficient.** Pass 2 is where quality is achieved.

**Time Budget Enforcement**:
- 45-minute unified `news-<type>.md` workflows → active work continues until the safe-outputs PR call (target minute ≤ 25, hard deadline minute ≤ 28); do NOT exit early
- `news-translate.md` (45 min, multi-call flush) → first productive flush at ~minute 14, periodic flushes every +3 translated files, final flush by minute ≤ 28
- If you finish early, go back and improve. There is ALWAYS more depth to add.

**Quality Gates**: ≥80 words/SWOT item, ≥150 words/stakeholder perspective, ≥60% prose ratio, ≥1 Chart.js visualization, zero `[AI_ANALYSIS_REQUIRED]` markers, World Bank **or** IMF economic context data for policy articles (Wave-2 OR-gate — see `.github/skills/imf-data-integration.md`).

## 🚨 Critical Rules

### MUST Follow
1. **AI-First Quality** - Follow the AI-First Quality Principle: mandatory 2-pass iterative improvement for ALL content. See `.github/skills/ai-first-quality.md`
2. **Security First** - Follow Secure Development Policy, no secrets in code
3. **WCAG 2.1 AA** - All content must be accessible
4. **Test Before Commit** - Run `npm run lint && npm run test` before committing
5. **Multi-Language** - Changes affecting content must consider all 14 languages
6. **ISMS Compliance** - Follow ISO 27001, NIST CSF, CIS Controls frameworks
7. **Architecture Docs** - Update ARCHITECTURE.md, SECURITY_ARCHITECTURE.md when relevant
8. **Minimal Changes** - Make surgical, focused changes only
9. **gh-aw Workflows** - Compile with `gh aw compile --validate` after editing .md workflows

### MUST NOT Do
1. **Never** hard-code secrets, credentials, or API keys
2. **Never** break WCAG 2.1 AA compliance
3. **Never** skip testing before committing
4. **Never** use deprecated crypto (MD5, SHA-1, DES, 3DES)
5. **Never** merge Dependabot PRs that modify compiled `.lock.yml` files directly — recompile with `gh aw compile` instead
6. **Never** use dangerous shell expansion patterns in agentic workflows, prompts, or `scripts/**.sh` (see **Shell-Safety** section below — the sandbox shell-safety filter blocks them and the run fails, sometimes after wasting the 60-min budget)

## 🛡️ Shell-Safety for Agentic Workflows, Prompts, and Scripts

The sandbox shell-safety filter **blocks** commands that contain certain bash expansion patterns on the grounds that they can enable arbitrary code execution. When a block hits mid-run, the agent spends the remaining budget on workarounds and often times out (see failed run #24773038606).

Apply these rules to **every** executable bash block — inside `.github/workflows/*.md` agentic workflows, the prompts they import (`.github/prompts/*.md`), `.github/agents/*.md`, and `scripts/**.sh`.

### ❌ Forbidden patterns (the filter blocks these)

| Pattern | Example (DO NOT USE) | Why it's blocked |
|---------|----------------------|------------------|
| **Nested parameter expansion** | `${var#${other}}`, `${A:-${B:-}}`, `${var:+...${#other}...}` | Inner expansion result becomes part of the outer pattern — classic prompt-injection vector |
| **Indirect expansion** | `${!var}`, `${!prefix*}`, `${!prefix@}` | Reads arbitrary variables by name |
| **Parameter transformation** | `${var@P}`, `${var@Q}`, `${var@E}`, `${var@A}`, `${var@K}`, `${var@a}` | `@P` re-evaluates the string as a prompt; the others leak state |
| **Nested command substitution** | `$(cmd $(inner))`, `$(wc -l < "$(...)")` | Inner `$()` executes under the outer |
| **Default-with-command-substitution** | `${VAR:-$(cmd)}`, `${VAR:+$(cmd)}` | Same as nested `$()` — the default expression is a live command |
| **Input redirection inside `$()`** | `$(cmd < file)`, `$(cmd 2< file)` | Redirection inside substitution — often used to smuggle arbitrary reads |
| **`eval`** | `eval "$str"`, `eval $cmd` | Explicit arbitrary-code execution |
| **Adjacent `${RANDOM}${RANDOM}`** | `suffix="${RANDOM}${RANDOM}"` | Adjacency heuristic trips nested-expansion detection |

### ✅ Safe replacements

The following code blocks can be copy-pasted verbatim. Pipes and redirections in table cells cause markdown-escaping ambiguity, so multi-token commands are shown as fenced code blocks below each rule.

**1. Nested default expansion — `${A:-${B:-}}`**

```bash
if [ -n "${A:-}" ]; then
  X="$A"
elif [ -n "${B:-}" ]; then
  X="$B"
else
  X=""
fi
```

**2. Whitespace-trim idiom — `${var#"${var%%[![:space:]]*}"}`**

```bash
var=$(printf '%s' "$var" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
```

**3. Default-with-command-substitution — `${VAR:-$(date +%s)}`**

```bash
if [ -z "${VAR:-}" ]; then
  VAR=$(date +%s)
fi
```

**4. Nested command substitution — `$(wc -l < "$(find … | head -1)")`**

```bash
first=$(find … | head -1)
lines=$(wc -l < "$first" | awk '{print $1}')
```

**5. Prefix strip with non-literal inner — `${f#${ANALYSIS_DIR}/}`**

```bash
rel=$(printf '%s\n' "$f" | awk -v p="$ANALYSIS_DIR/" '
  { if (index($0, p) == 1) print substr($0, length(p) + 1); else print $0 }
')
```

**6. `eval "$cmd"`** — replace with explicit `case` or `if` dispatch. Never construct commands from variables.

**7. Input redirection inside `$()` — `$(cmd < file)`**

```bash
cmd "$file"              # PREFERRED — most tools accept a path argument
# Only if cmd truly only reads stdin, use a pipe (no redirection inside $()).
# `cat | cmd` is technically UUOC, but correctness beats optimization here:
# `$(cmd <"$file")` is blocked by the sandbox filter even though the `<` is
# outside the substitution token visually, because the filter scans the full
# `$(...)` span for redirection operators.
result=$(cat "$file" | cmd)
```

### Allowed patterns (safe, idiomatic bash)

- Single-level `$(cmd)` with no inner `$()` and no `<` redirection
- Simple parameter expansion: `${var}`, `${var:-default}`, `${var:=default}`, `${var:?err}`, `${var:+alt}`, `${#var}`, `${var:offset:length}`, `${var/pat/sub}`, `${var%suffix}`, `${var#prefix}` — as long as the inner operand is a **literal**, not another expansion or substitution
- `if`/`elif`/`else`/`case` dispatch — the preferred way to express defaults and fall-backs
- Shell arrays: `arr=("$a" "$b")`, `"${arr[@]}"`, `"${arr[0]}"`
- Process substitution `<(cmd)` / `>(cmd)` — **not** a substitution target for expansion, safe
- `heredoc` input: `cmd <<EOF … EOF` or `cmd <<'EOF'` (quoted form disables expansion)

### Enforcement

- `test/unit/shell-safety.test.js` — drift-guard that greps every `scripts/**.sh` against the forbidden patterns above. Fails the build on a match.
- `.github/prompts/00-scope-and-ground-rules.md` §47 — authoritative short-form list (linked from every news workflow via the shared prompt import).
- `.github/prompts/08-infrastructure.md` §177-181 — long-form explanations with examples.
- `.github/prompts/02-analysis-protocol.md` §10 — mandates that bash in agentic workflows delegates to `scripts/checkpoint-analysis-to-memory.sh` (repo-hosted, pre-audited) rather than inlining expansion-heavy commands.

### When writing a **new** agentic workflow or prompt

1. Prefer calling a repo-hosted `scripts/*.sh` helper over inlining bash in the workflow body. Helpers are audited once and reused 10× by the news workflows.
2. If you must inline bash, keep expansions single-level and use `if`/`case` for defaults.
3. Never write a bash construct inside a prompt that an agent would copy-paste verbatim. The agent is the one that hits the filter.
4. Run `npm run test -- test/unit/shell-safety.test.js` after adding any new `scripts/*.sh` file.

## 📐 Architecture Documentation (C4 Model)

**Current**: ARCHITECTURE.md, DATA_MODEL.md, FLOWCHART.md, STATEDIAGRAM.md, MINDMAP.md, SWOT.md, SECURITY_ARCHITECTURE.md, THREAT_MODEL.md

**Future**: FUTURE_ARCHITECTURE.md, FUTURE_DATA_MODEL.md, FUTURE_FLOWCHART.md, FUTURE_STATEDIAGRAM.md, FUTURE_MINDMAP.md, FUTURE_SWOT.md, FUTURE_SECURITY_ARCHITECTURE.md

**Reference**: [Hack23 Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)

## 🔒 ISMS Compliance

All work MUST align with [Hack23 ISMS-PUBLIC](https://github.com/Hack23/ISMS-PUBLIC):

| Framework | Version | Scope |
|-----------|---------|-------|
| ISO 27001 | 2022 | Information security management |
| NIST CSF | 2.0 | Cybersecurity framework |
| CIS Controls | v8.1 | Security best practices |
| GDPR | - | Privacy and data protection |
| NIS2 | - | Network and information security |
| EU CRA | - | Cyber resilience |

**Key policies**: [Information Security](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md), [Secure Development](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md), [Open Source](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md), [AI Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md), [Access Control](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Access_Control_Policy.md), [Cryptography](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Cryptography_Policy.md)

## 🤖 Copilot Coding Agent Tools

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `assign_copilot_to_issue` | Assign Copilot to implement an issue | `owner`, `repo`, `issue_number`, `base_ref`, `custom_instructions` |
| `create_pull_request_with_copilot` | Create PR with Copilot | `owner`, `repo`, `title`, `body`, `base_ref`, `custom_agent` |
| `get_copilot_job_status` | Monitor Copilot progress | `owner`, `repo`, `job_id` |

### Assignment Patterns

**Basic assignment:**
```javascript
assign_copilot_to_issue({
  owner: "Hack23", repo: "euparliamentmonitor",
  issue_number: ISSUE_NUMBER
})
```

**Feature branch with custom instructions:**
```javascript
assign_copilot_to_issue({
  owner: "Hack23", repo: "euparliamentmonitor",
  issue_number: ISSUE_NUMBER,
  base_ref: "feature/branch-name",
  custom_instructions: "Follow patterns in scripts/, include tests, ensure ISMS compliance"
})
```

**PR creation with specific agent:**
```javascript
create_pull_request_with_copilot({
  owner: "Hack23", repo: "euparliamentmonitor",
  title: "PR Title", body: "Implementation details",
  base_ref: "main",
  custom_agent: "security-architect"
})
```

**Stacked PRs:**
```javascript
const pr1 = create_pull_request_with_copilot({
  owner: "Hack23", repo: "euparliamentmonitor",
  title: "Step 1: Data models", body: "Create data layer",
  base_ref: "main"
});
const pr2 = create_pull_request_with_copilot({
  owner: "Hack23", repo: "euparliamentmonitor",
  title: "Step 2: Business logic", body: "Implement services",
  base_ref: pr1.branch
});
```

## 📚 Skills Library

| Category | Skills |
|----------|--------|
| Agentic | `github-agentic-workflows`, `gh-aw-architecture`, `gh-aw-firewall`, `gh-aw-sandbox` |
| Architecture | `c4-architecture-documentation` |
| Compliance | `compliance-frameworks`, `isms-compliance` |
| Security | `security-by-design`, `threat-modeling` |
| Testing | `testing-strategy` |
| Quality | `code-quality-excellence`, `accessibility-excellence`, `ai-first-quality` |
| Data | `european-parliament-data`, `mcp-server-integration`, `imf-data-integration` |
| Integration | `mcp-gateway-configuration`, `mcp-gateway-security`, `mcp-gateway-troubleshooting` |

## 🔗 Hack23 Organization

| Repository | Purpose |
|-----------|---------|
| [European-Parliament-MCP-Server](https://github.com/Hack23/European-Parliament-MCP-Server) | EP data MCP server (TypeScript) |
| [cia](https://github.com/Hack23/cia) | Swedish Parliament intelligence (Java/Spring) |
| [ISMS-PUBLIC](https://github.com/Hack23/ISMS-PUBLIC) | ISMS policies & documentation |
| [riksdagsmonitor](https://github.com/Hack23/riksdagsmonitor) | Swedish Parliament monitor (HTML/CSS) |
| [blacktrigram](https://github.com/Hack23/blacktrigram) | Korean martial arts game (TypeScript) |
| [cia-compliance-manager](https://github.com/Hack23/cia-compliance-manager) | CIA compliance dashboard (TypeScript) |
| [homepage](https://github.com/Hack23/homepage) | Hack23.com website (HTML/CSS) |

## 💡 Decision Framework

1. Check relevant skill in `.github/skills/`
2. Review similar patterns in the codebase
3. Consult architecture docs (ARCHITECTURE.md, SECURITY_ARCHITECTURE.md)
4. Apply security-by-design principles
5. Follow ISMS requirements
6. Only then ask for clarification

**Complete work. Ask fewer questions. Validate before committing.**
