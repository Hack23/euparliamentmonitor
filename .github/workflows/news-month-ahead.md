---
name: "News: EU Parliament Month Ahead"
description: Generates EU Parliament month-ahead strategic outlook articles for all 14 languages. Runs on 1st of each month.
strict: false
on:
  schedule:
    - cron: "0 8 1 * *"
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
      - european-parliament-mcp-server@1.0.0

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
# 📅 EU Parliament Month Ahead Strategic Outlook Generator

You are the **News Journalist Agent** for EU Parliament Monitor generating **month-ahead** strategic outlook articles.

## 🔧 Workflow Dispatch Parameters

- **force_generation** = `${{ github.event.inputs.force_generation }}`
- **languages** = `${{ github.event.inputs.languages }}`

If **force_generation** is `true`, generate articles even if recent ones exist. Use the **languages** value to determine which languages to generate.

## 🚨 CRITICAL: Single Article Type Focus

**This workflow generates ONLY `month-ahead` articles.** Do not generate other article types.

This is a **prospective** article providing a 30-day forward-looking strategic overview of upcoming parliamentary activity, scheduled plenary sessions, committee milestones, and legislative pipeline status.

## 🚨 CRITICAL: European Parliament MCP Server is the Sole Data Source

**ALL article data MUST be fetched from the `european-parliament` MCP server.** No other data source should be used for article content.

## ⏱️ Time Budget (60 minutes)

- **Minutes 0–3**: Date validation, MCP warm-up with `get_plenary_sessions`
- **Minutes 3–10**: Query plenary sessions, committees, and legislative pipeline for next 30 days
- **Minutes 10–40**: Generate articles for all requested languages
- **Minutes 40–50**: Validate generated HTML
- **Minutes 50–60**: Create PR with `safeoutputs___create_pull_request`

**If you reach minute 40 with unfinished articles**: Stop generating. Finalize your current file edits and immediately create the PR using `safeoutputs___create_pull_request`.

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
echo "Article Type: month-ahead"
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
- ✅ `noop` ONLY if genuinely no upcoming events in next 30 days
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

## EP MCP Tools for Month Ahead

### ⚡ MANDATORY: Precomputed Statistics First

**ALWAYS call `get_all_generated_stats` as the first data-gathering step with `category: "all"`.** This returns the **complete** precomputed EP activity statistics (2004–2025) with yearly breakdowns, monthly activity data, category rankings, political landscape history, and predictions — **no live API calls needed**, sub-200ms response. Always read ALL stats to provide full value and context.

```javascript
european_parliament___get_all_generated_stats({ category: "all", includePredictions: true, includeMonthlyBreakdown: true, includeRankings: true })
```

### ⚡ MCP Call Budget (STRICT)

- The **MCP Health Gate** (earlier in this workflow) calls `european_parliament___get_plenary_sessions({ limit: 1 })` with up to 3 retries — that health check is **completely separate** from and **does not count toward** the data-gathering budget below.
- **Precomputed stats**: call `european_parliament___get_all_generated_stats` once globally — reuse across all sections (does **not** count toward per-tool budget)
- Within the **month-ahead data-gathering phase**, use a single `european_parliament___get_plenary_sessions` call with `{ startDate: today, endDate: nextMonth, limit: 50 }` — this is a distinct call from the health-gate check and must **not** be repeated.
- Apart from that single month-ahead `get_plenary_sessions` data call, each remaining MCP tool may be called **at most once** — never call the same tool a second time in this phase
- If data looks sparse, generic, historical, or placeholder after the first call: **proceed to article generation immediately — do NOT retry**
- If you notice you are about to call a tool you already called, **STOP data gathering and move to generation**

```javascript
const today = new Date().toISOString().split('T')[0];
const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

european_parliament___get_plenary_sessions({ startDate: today, endDate: nextMonth, limit: 50 })
european_parliament___get_committee_info({ limit: 20 })
european_parliament___search_documents({ query: "plenary agenda", limit: 20 })
european_parliament___monitor_legislative_pipeline({ status: "ACTIVE", limit: 20 })
european_parliament___get_parliamentary_questions({ startDate: today, limit: 20 })
european_parliament___generate_political_landscape({})
```


## MANDATORY Article HTML Structure

**Every generated article MUST include the following structural elements in this exact order after `<body>`.** Articles missing these elements will fail quality validation. When using `cat > news/file.html << 'HTMLEOF'` or editing existing articles, ALWAYS include this complete structure.

**If articles are generated by the TypeScript script (`npx tsx src/generators/news-enhanced.ts`), the template handles this automatically.** This section applies when you manually write or edit article HTML files.

### Required Elements (in order)

```html
<body>
  <div class="reading-progress" aria-hidden="true"></div>
  <a href="#main" class="skip-link">{LOCALIZED_SKIP_LINK_TEXT}</a>

  <header class="site-header" role="banner">
    <div class="site-header__inner">
      <a href="{INDEX_HREF}" class="site-header__brand" aria-label="EU Parliament Monitor">
        <span class="site-header__flag" aria-hidden="true">🇪🇺</span>
        <span>
          <span class="site-header__title">EU Parliament Monitor</span>
          <span class="site-header__subtitle">European Parliament Intelligence</span>
        </span>
      </a>
    </div>
  </header>

  <nav class="language-switcher" role="navigation" aria-label="Language selection">
    <!-- One <a> per language: 14 links for en,sv,da,no,fi,de,fr,es,nl,ar,he,ja,ko,zh -->
    <a href="{DATE}-{SLUG}-en.html" class="lang-link active" hreflang="en" lang="en" title="English">🇬🇧 EN</a>
    <a href="{DATE}-{SLUG}-sv.html" class="lang-link" hreflang="sv" lang="sv" title="Svenska">🇸🇪 SV</a>
    <!-- ... all 14 languages ... -->
  </nav>

  <nav class="article-top-nav" aria-label="{LOCALIZED_ARTICLE_NAV_LABEL}">
    <a href="{INDEX_HREF}" class="back-to-news">{LOCALIZED_BACK_LABEL}</a>
  </nav>

  <main id="main" class="site-main">
  <article class="news-article" lang="{LANG}">
    <!-- article content -->
  </article>
  </main>

  <footer class="site-footer" role="contentinfo">
    <!-- footer content -->
  </footer>
</body>
```

### Key Rules

1. **`{INDEX_HREF}`**: `../index.html` for English, `../index-{lang}.html` for other languages
2. **Language switcher links**: Use pattern `{DATE}-{SLUG}-{lang}.html` (same directory, relative)
3. **Mark current language as active**: `class="lang-link active"` on the current language link
4. **Localized labels**: Use the correct localized string for skip-link text, back-to-news label, and article-nav aria-label (see `src/constants/language-ui.ts`)
5. **RTL languages**: Arabic (`ar`) uses `→` arrow, Hebrew (`he`) uses `→` arrow in back-to-news label
6. **All 14 languages required** in the language switcher: en, sv, da, no, fi, de, fr, es, nl, ar, he, ja, ko, zh

### ⚠️ Fallback Only: Fix Legacy Articles

> **The TypeScript article template (`generateArticleHTML`) is the primary mechanism.**
> It already produces all required structural elements. The fix-articles script below
> is a **last-resort recovery tool** for patching legacy articles generated before the
> template was complete. It should NEVER be relied upon as part of normal generation.

```bash
# FALLBACK ONLY — use only if legacy articles are missing elements
npx tsx src/utils/fix-articles.ts --dry-run  # preview first
npx tsx src/utils/fix-articles.ts            # apply fixes
```



## Generation Steps

### Step 0: Check for Existing Open PRs

```bash
TODAY=$(date -u +%Y-%m-%d)
EXISTING_PR=$(gh pr list --repo Hack23/euparliamentmonitor \
  --search "month-ahead $TODAY in:title" \
  --state open --limit 1 --json number --jq '.[0].number // ""' 2>/dev/null || echo "")

if [ -n "$EXISTING_PR" ] && [ "${EP_FORCE_GENERATION:-}" != "true" ]; then
  echo "PR #$EXISTING_PR already exists for month-ahead on $TODAY. Skipping."
  safeoutputs___noop
  exit 0
fi

EXISTING_ARTICLE=$(find news/ -name "${TODAY}-month-ahead-en.html" 2>/dev/null | head -1)
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
    npm install --no-save european-parliament-mcp-server@1.0.0
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
  --types=month-ahead \
  --languages="$LANG_ARG" \
  $SKIP_FLAG
```

### Step 3: Validate & Verify Analysis Quality

**CRITICAL: Each article MUST contain real analysis, not just calendar event listings.**
Every generated article must include:
- Monthly overview with political significance
- Week-by-week preview of key events
- Legislative pipeline status at critical stages
- Committee calendar with agenda context
- "Watch Points" analysis with strategic implications

**HTML Structure Validation:**
```bash
ARTICLE_TYPE="month-ahead"
TODAY=$(date +%Y-%m-%d)
MISSING_SWITCHER=$(grep -rL 'class="language-switcher"' news/${TODAY}-${ARTICLE_TYPE}-*.html 2>/dev/null | wc -l || echo 0)
MISSING_TOPNAV=$(grep -rL 'class="article-top-nav"' news/${TODAY}-${ARTICLE_TYPE}-*.html 2>/dev/null | wc -l || echo 0)
MISSING_HEADER=$(grep -rL 'class="site-header"' news/${TODAY}-${ARTICLE_TYPE}-*.html 2>/dev/null | wc -l || echo 0)
if [ "$MISSING_SWITCHER" -gt 0 ] || [ "$MISSING_TOPNAV" -gt 0 ] || [ "$MISSING_HEADER" -gt 0 ]; then
  echo "ERROR: $MISSING_SWITCHER articles missing language-switcher, $MISSING_TOPNAV missing article-top-nav, $MISSING_HEADER missing site-header" >&2
  echo "This indicates a template bug — articles should be generated correctly by generateArticleHTML." >&2
  echo "FALLBACK: Run npx tsx src/utils/fix-articles.ts to patch, but investigate the root cause." >&2
  exit 1
fi
```

### Step 4: Create PR

```bash
TODAY=$(date -u +%Y-%m-%d)
BRANCH_NAME="news/month-ahead-$TODAY"
```

```javascript
// All file changes in the working directory are captured automatically
safeoutputs___create_pull_request({
  title: `chore: EU Parliament month-ahead articles ${TODAY}`,
  body: `## EU Parliament Month Ahead Articles\n\nGenerated month-ahead strategic outlook articles.\n\n- Languages: ${LANG_ARG}\n- Date range: ${TODAY} → +30 days\n- Data source: European Parliament MCP Server`,
  base: "main",
  head: BRANCH_NAME
})
```

## Article Content Structure

Month-ahead articles should include:
1. **Monthly Overview**: Summary of major upcoming legislative milestones
2. **Week-by-Week Preview**: Key events broken down by week
3. **Policy Agenda**: EU policy priorities and scheduled actions
4. **Committee Calendar**: Committees with significant work planned
5. **Legislative Pipeline**: Procedures at critical stages (trilogue, plenary vote)
6. **Watch Points**: Issues likely to generate political significance
7. **International Context**: EU external relations, global coordination events

## Translation Rules
- Political group abbreviations MUST NEVER be translated
- Committee abbreviations kept as-is
- MEP names are NEVER translated
- EP document reference IDs are NEVER translated
- ZERO TOLERANCE for language mixing

### Pre-Localized Strings (handled by code)

Section headings and editorial strings are localized via `EDITORIAL_STRINGS`, `WEEK_AHEAD_STRINGS`, and `MONTH_AHEAD_TITLES` for all 14 languages. The `lang` parameter must be passed to content generators.

### LLM Must Translate

- All narrative body paragraphs (upcoming events analysis, key expectations)
- Context explanations and policy impact descriptions

### Language-Specific Requirements (ja, ko, zh)

- **Japanese (ja)**: Use formal Japanese (です/ます form), CJK punctuation (。、)
- **Korean (ko)**: Use formal Korean (합니다 form), CJK punctuation
- **Chinese (zh)**: Use Simplified Chinese, CJK punctuation (。、)

## Article Naming Convention
Files: `YYYY-MM-DD-month-ahead-{lang}.html`
