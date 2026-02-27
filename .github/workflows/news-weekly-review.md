---
name: "News: EU Parliament Weekly Review"
description: Generates EU Parliament weekly review retrospective articles for all 14 languages. Runs Saturdays to review the past week.
strict: false
on:
  schedule:
    - cron: "0 9 * * 6"
  workflow_dispatch:
    inputs:
      force_generation:
        description: Force generation even if recent articles exist
        type: boolean
        required: false
        default: false
      languages:
        description: 'Languages to generate (en | eu-core | nordic | all)'
        required: false
        default: all

permissions:
  contents: read
  issues: read
  pull-requests: read
  actions: read
  discussions: read
  security-events: read

timeout-minutes: 60

network:
  allowed:
    - node
    - github.com
    - api.github.com
    - data.europarl.europa.eu
    - "*.europa.eu"
    - "*.com"
    - "*.org"
    - "*.io"
    - default

mcp-servers:
  european-parliament:
    command: npx
    args:
      - -y
      - european-parliament-mcp-server@0.8.2

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

steps:
  - name: Setup Node.js
    uses: actions/setup-node@6044e13b5dc448c55e2357c09f80417699197238 # v6.2.0
    with:
      node-version: '24'

  - name: Install dependencies
    run: |
      npm ci --prefer-offline --no-audit

  - name: Build TypeScript
    run: |
      npm run build

engine:
  id: copilot
  model: claude-opus-4.6
---
# 📊 EU Parliament Weekly Review Article Generator

You are the **News Journalist Agent** for EU Parliament Monitor generating **weekly review** retrospective articles.

## 🔧 Workflow Dispatch Parameters

- **force_generation** = `${{ github.event.inputs.force_generation }}`
- **languages** = `${{ github.event.inputs.languages }}`

If **force_generation** is `true`, generate articles even if recent ones exist. Use the **languages** value to determine which languages to generate.

## 🚨 CRITICAL: Single Article Type Focus

**This workflow generates ONLY `week-in-review` articles.** Do not generate other article types.

This is a **retrospective** article analyzing the past 7 days of parliamentary activity — votes completed, committee decisions made, legislative developments, and political dynamics during the week.

## 🚨 CRITICAL: European Parliament MCP Server is the Sole Data Source

**ALL article data MUST be fetched from the `european-parliament` MCP server.**

## ⏱️ Time Budget (60 minutes)

- **Minutes 0–3**: Date validation, MCP warm-up with `get_plenary_sessions`
- **Minutes 3–10**: Query voting records, documents, and questions from past 7 days
- **Minutes 10–40**: Generate articles for all requested languages
- **Minutes 40–50**: Validate generated HTML
- **Minutes 50–60**: Create PR with `safeoutputs___create_pull_request`

**If you reach minute 40 without having prepared the PR**: Stop generating. Finish your current file edits and immediately create the PR using `safeoutputs___create_pull_request` (do not run any git commands; the framework will capture your working-directory changes).

## Required Skills

1. **`.github/skills/european-political-system.md`** — EU Parliament terminology and political groups
2. **`.github/skills/legislative-monitoring.md`** — Legislative procedure tracking
3. **`.github/skills/european-parliament-data.md`** — EP MCP tool documentation
4. **`.github/skills/seo-best-practices.md`** — Article SEO and metadata
5. **`.github/skills/gh-aw-firewall.md`** — Safe outputs and network security

## MANDATORY Date Validation

```bash
echo "=== Date Validation Check ==="
date -u "+Current UTC: %A %Y-%m-%d %H:%M:%S"
echo "Article Type: week-in-review"
echo "============================"
```

**⚠️ DATE GUARD**: When passing `dateFrom`/`dateTo` to ANY MCP tool, ALWAYS derive dates from `$(date -u +%Y-%m-%d)`. NEVER hardcode a year (e.g. 2024). Use `TODAY=$(date -u +%Y-%m-%d)` and compute offsets with `date -u -d` commands.


## MANDATORY MCP Health Gate

Before generating ANY articles, verify MCP connectivity:

1. Call `european_parliament___get_plenary_sessions({ limit: 1 })` — if successful, proceed
2. If it fails, wait 30 seconds and retry (up to 3 total attempts)
3. If ALL 3 attempts fail:
   - Use `safeoutputs___noop` with message: "MCP server unavailable after 3 connection attempts. No articles generated."
   - DO NOT fabricate or recycle content
   - The workflow MUST end with noop

## MANDATORY PR Creation

- ✅ `safeoutputs___create_pull_request` when articles generated
- ✅ `noop` ONLY if genuinely no parliamentary activity in the past week
- ❌ NEVER use `noop` as fallback for PR creation failures

### 🔑 How Safe Pull Request Works (READ FIRST)

The gh-aw framework **automatically captures all file changes** you make in the working directory as a patch. You do NOT manage git operations yourself.

**The mechanism:**
1. You write/edit article files to `news/` using `bash` (e.g., `cat > news/file.html << 'HTMLEOF' ... HTMLEOF`)
2. You call `safeoutputs___create_pull_request` with `title`, `body`, `base`, and `head`
3. The framework diffs your working directory, creates a branch, applies the patch, and opens the PR

**MUST do:** Write files → Call `safeoutputs___create_pull_request` once. That's it.

**MUST NOT do (do not waste time on these — they will all fail):**
- ❌ `git add`, `git commit`, `git push` — the framework handles git
- ❌ `git checkout -b` — branch creation is automatic
- ❌ GitHub API calls to create PRs — use only the safe output tool
- ❌ Passing a `files` parameter — it does not exist; all working directory changes are captured automatically
- ❌ Trying multiple alternative approaches if PR creation fails — retry **once**, then let the workflow fail

**⚠️ NEVER use `git push` directly** — always use `safeoutputs___create_pull_request`

## EP MCP Tools for Weekly Review

### ⚡ MCP Call Budget (STRICT)

- **Total maximum 8 MCP tool calls**, including the mandatory health-gate `european_parliament___get_plenary_sessions` call
- **Health-gate connectivity check**: call `european_parliament___get_plenary_sessions` exactly once at the start of data gathering to verify MCP health; this single call **counts as 1** toward the 8-call budget and must **not** be retried or invoked again later in the run, even if it fails
- **Per-tool limit after the health gate (no retries)**: apart from the initial health-gate call, each remaining MCP tool may be called **at most once per workflow run**, even on failure — never call the same tool a second time or implement retry/backoff loops
- If data from a tool looks sparse, generic, historical, or placeholder after its first call, **proceed to article generation immediately — do NOT retry that tool**
- If you notice you are about to call a tool you already called, or you would exceed the 8-call budget, **STOP data gathering and move to generation**

**ALWAYS call `european_parliament___get_plenary_sessions` FIRST as the mandatory MCP Health Gate and connectivity check. Do not call it again or retry it later in the run.**

```javascript
const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
const today = new Date().toISOString().split('T')[0];

// Retrospective data — past 7 days
european_parliament___get_voting_records({ dateFrom: lastWeek, dateTo: today, limit: 20 })
european_parliament___analyze_voting_patterns({ dateFrom: lastWeek, dateTo: today })
european_parliament___detect_voting_anomalies({ dateFrom: lastWeek, dateTo: today })
european_parliament___get_parliamentary_questions({ startDate: lastWeek, limit: 20 })
european_parliament___search_documents({ query: "adopted text", limit: 20 })
european_parliament___generate_political_landscape({})
```

## Generation Steps

### Step 0: Check for Existing Open PRs

```bash
TODAY=$(date -u +%Y-%m-%d)
EXISTING_PR=$(gh pr list --repo Hack23/euparliamentmonitor \
  --search "week-in-review $TODAY in:title" \
  --state open --limit 1 --json number --jq '.[0].number // ""' 2>/dev/null || echo "")

if [ -n "$EXISTING_PR" ] && [ "${EP_FORCE_GENERATION:-}" != "true" ]; then
  echo "PR #$EXISTING_PR already exists for week-in-review on $TODAY. Skipping."
  safeoutputs___noop
  exit 0
fi

EXISTING_ARTICLE=$(find news/ -name "${TODAY}-week-in-review-en.html" 2>/dev/null | head -1)
if [ -n "$EXISTING_ARTICLE" ] && [ "${EP_FORCE_GENERATION:-}" != "true" ]; then
  echo "Article already exists. Skipping."
  safeoutputs___noop
  exit 0
fi
```

### Step 1: Setup MCP Gateway

```bash
MCP_CONFIG="${GH_AW_MCP_CONFIG:-/home/runner/.copilot/mcp-config.json}"

if [ -f "$MCP_CONFIG" ]; then
  if command -v jq >/dev/null 2>&1; then
    GATEWAY_PORT=$(jq -r '.gateway.port // empty' "$MCP_CONFIG")
    GATEWAY_DOMAIN=$(jq -r '.gateway.domain // empty' "$MCP_CONFIG")
    GATEWAY_API_KEY=$(jq -r '.gateway.apiKey // empty' "$MCP_CONFIG")
  else
    GATEWAY_PORT=$(cat "$MCP_CONFIG" | grep -o '"port":[^,}]*' | head -1 | grep -o '[0-9]*')
    GATEWAY_DOMAIN=$(cat "$MCP_CONFIG" | grep -o '"domain":"[^"]*"' | head -1 | sed 's/"domain":"//;s/"//')
    GATEWAY_API_KEY=$(cat "$MCP_CONFIG" | grep -o '"apiKey":"[^"]*"' | head -1 | sed 's/"apiKey":"//;s/"//')
  fi

  if [ -n "${GATEWAY_PORT:-}" ] && [ -n "${GATEWAY_DOMAIN:-}" ]; then
    case "$GATEWAY_DOMAIN" in
      localhost|127.0.0.1|::1|host.docker.internal)
        GATEWAY_SCHEME="http"
        ;;
      *)
        GATEWAY_SCHEME="https"
        ;;
    esac
    export EP_MCP_GATEWAY_URL="${GATEWAY_SCHEME}://${GATEWAY_DOMAIN}:${GATEWAY_PORT}/mcp/european-parliament"
    export EP_MCP_GATEWAY_API_KEY="${GATEWAY_API_KEY:-}"
  fi
fi

if [ -z "${EP_MCP_GATEWAY_URL:-}" ]; then
  if [ ! -f "node_modules/.bin/european-parliament-mcp-server" ]; then
    npm install --no-save european-parliament-mcp-server@0.8.2
  fi
fi
```

### Step 2: Generate Articles

```bash
LANGUAGES_INPUT="${EP_LANG_INPUT:-}"
[ -z "$LANGUAGES_INPUT" ] && LANGUAGES_INPUT="all"

if ! printf '%s' "$LANGUAGES_INPUT" | grep -Eq '^(all|eu-core|nordic|en|sv|da|no|fi|de|fr|es|nl|ar|he|ja|ko|zh)(,(en|sv|da|no|fi|de|fr|es|nl|ar|he|ja|ko|zh))*$'; then
  echo "❌ Invalid languages input: $LANGUAGES_INPUT" >&2
  exit 1
fi

case "$LANGUAGES_INPUT" in
  "eu-core") LANG_ARG="en,de,fr,es,nl" ;;
  "nordic")  LANG_ARG="en,sv,da,no,fi" ;;
  "all")     LANG_ARG="en,sv,da,no,fi,de,fr,es,nl,ar,he,ja,ko,zh" ;;
  *)         LANG_ARG="$LANGUAGES_INPUT" ;;
esac

SKIP_FLAG=""
if [ "${EP_FORCE_GENERATION:-}" != "true" ]; then
  SKIP_FLAG="--skip-existing"
fi

export USE_EP_MCP=true

npx tsx src/generators/news-enhanced.ts \
  --types=week-in-review \
  --languages="$LANG_ARG" \
  $SKIP_FLAG
```

### Step 3: Validate & Verify Analysis Quality

**CRITICAL: Each article MUST contain real analysis, not just a list of vote titles.**
Every generated article must include:
- **Week Summary**: Top 3–5 most significant developments
- **Voting Outcomes**: Bills passed, voting results with party breakdowns
- **Committee Activity**: Reports issued, hearings conducted
- **Political Dynamics**: Party cohesion trends, cross-party voting, anomalies detected
- **What Mattered Most**: Analysis of the week's most consequential development
- **Looking Ahead**: Brief preview of the coming week

### Step 4: Create PR

```bash
TODAY=$(date -u +%Y-%m-%d)
BRANCH_NAME="news/week-in-review-$TODAY"
```

```javascript
// All file changes in the working directory are captured automatically
safeoutputs___create_pull_request({
  title: `chore: EU Parliament week-in-review articles ${TODAY}`,
  body: `## EU Parliament Weekly Review Articles\n\nGenerated week-in-review retrospective articles.\n\n- Languages: ${LANG_ARG}\n- Review period: past 7 days\n- Data source: European Parliament MCP Server`,
  base: "main",
  head: BRANCH_NAME
})
```

## Translation Rules
- Political group abbreviations MUST NEVER be translated
- Committee abbreviations kept as-is
- MEP names are NEVER translated
- EP document reference IDs are NEVER translated
- ZERO TOLERANCE for language mixing

### Pre-Localized Strings (handled by code)

Section headings and editorial strings are localized via `EDITORIAL_STRINGS` and `WEEKLY_REVIEW_TITLES` for all 14 languages. The `lang` parameter must be passed to content generators.

### LLM Must Translate

- All narrative body paragraphs (weekly analysis, key takeaways, voting summaries)
- Context explanations and policy impact descriptions

### Language-Specific Requirements (ja, ko, zh)

- **Japanese (ja)**: Use formal Japanese (です/ます form), CJK punctuation (。、)
- **Korean (ko)**: Use formal Korean (합니다 form), CJK punctuation
- **Chinese (zh)**: Use Simplified Chinese, CJK punctuation (。、)

## Article Naming Convention
Files: `YYYY-MM-DD-week-in-review-{lang}.html`
