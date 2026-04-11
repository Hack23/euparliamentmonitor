---
name: "News: Translate Articles"
description: Translates English EU Parliament news articles to 13 other languages. Runs after content workflows generate English articles, ensuring high-quality translations with full linguistic fidelity.
strict: false
on:
  schedule:
    # Run 3x daily on weekdays to pick up new English articles
    # Offset from content workflows: committee-reports(04), propositions(05), motions(06), week-ahead(Fri 07)
    - cron: "0 9,12,15 * * 1-5"
    # Saturday for weekly review translations — offset to 15:00 to avoid conflict
    # with news-weekly-review (09:00 Sat, ~90min run + PR merge ~11:00-12:00)
    - cron: "0 15 * * 6"
    # 1st and 28th for monthly article translations — offset to 15:00 to avoid conflict
    # with news-monthly-review (10:00 on 28th, ~90min run + PR merge ~12:00-13:00)
    - cron: "0 15 1,28 * *"
  workflow_dispatch:
    inputs:
      article_types:
        description: 'Article types to translate (comma-separated: week-ahead,motions,propositions,committee-reports,breaking,week-in-review,month-in-review,month-ahead)'
        required: false
        default: ''
      article_date:
        description: 'Date of articles to translate (YYYY-MM-DD, default: today)'
        required: false
        default: ''
      languages:
        description: 'Target languages (all-non-en | eu-core | nordic | comma-separated)'
        required: false
        default: all-non-en
      force_translation:
        description: Force translation even if translations already exist
        type: boolean
        required: false
        default: true

permissions:
  contents: read
  issues: read
  pull-requests: read
  actions: read
  discussions: read
  security-events: read

timeout-minutes: 90

concurrency:
  job-discriminator: translate-${{ github.event.inputs.article_date || 'scheduled' }}

network:
  allowed:
    - node
    - github.com
    - api.github.com
    - data.europarl.europa.eu
    - api.worldbank.org
    - "*.europa.eu"
    - hack23.com
    - www.hack23.com
    - riksdagsmonitor.com
    - www.riksdagsmonitor.com
    - euparliamentmonitor.com
    - www.euparliamentmonitor.com
    - default

mcp-servers:
  european-parliament:
    command: npx
    args:
      - -y
      - european-parliament-mcp-server@1.2.1
      - --timeout
      - "90000"
    env:
      EP_REQUEST_TIMEOUT_MS: "90000"
  world-bank:
    command: npx
    args:
      - -y
      - worldbank-mcp@1.0.0
  memory:
    command: npx
    args:
      - -y
      - "@modelcontextprotocol/server-memory"
  sequential-thinking:
    command: npx
    args:
      - -y
      - "@modelcontextprotocol/server-sequential-thinking"

tools:
  repo-memory:
    branch-name: memory/news-generation
    description: "Cross-run editorial memory for EU Parliament news generation"
    file-glob: ["memory/news-generation/*.md", "memory/news-generation/*.json"]
    max-file-size: 51200
    max-file-count: 50
    max-patch-size: 51200
    allowed-extensions: [".md", ".json"]
  github:
    toolsets:
      - all
  bash: true

safe-outputs:
  allowed-domains:
    - data.europarl.europa.eu
    - www.europarl.europa.eu
    - github.com
    - hack23.com
    - www.hack23.com
    - riksdagsmonitor.com
    - www.riksdagsmonitor.com
    - euparliamentmonitor.com
    - www.euparliamentmonitor.com
  max-patch-size: 5120
  create-pull-request:
    title-prefix: "[news] "
    excluded-files:
      - "analysis/daily/**/data/**"
  add-comment:
    max: 1

steps:
  - name: Setup Node.js
    uses: actions/setup-node@53b83947a5a98c8d113130e565377fae1a50d02f # v6.3.0
    with:
      node-version: '25'

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
# 🌐 EU Parliament News Article Translation Workflow

You are the **Translation Agent** for EU Parliament Monitor. Your job is to take **existing English articles** and produce **high-quality translations** in 13 other languages.

## 🚫 MANDATORY Scope Restriction

> **⚠️ CRITICAL — READ FIRST**: This workflow ONLY creates translated article files in the `news/` directory and analysis artifacts in the `analysis/daily/` directory. You MUST NOT modify any other files.

**ALLOWED modifications:**
- ✅ Create new `news/*.html` translation files (non-English only)
- ✅ Read existing `news/*-en.html` English source articles
- ✅ Write analysis artifacts to `analysis/daily/${ARTICLE_DATE}/translate-run${RUN_ID}/`

**FORBIDDEN modifications (will cause patch conflicts and workflow failure):**
- ❌ `news/*-en.html` — NEVER modify English source articles (read-only)
- ❌ `src/` — NEVER modify TypeScript source files
- ❌ `scripts/` — NEVER modify JavaScript build output files
- ❌ `test/` — NEVER modify test files
- ❌ `e2e/` — NEVER modify E2E test files
- ❌ `.github/` — NEVER modify workflow or configuration files
- ❌ `index*.html` — NEVER modify index pages
- ❌ `package.json` / `package-lock.json` — NEVER modify dependency files

**FORBIDDEN practices (waste time and produce low-quality output):**
- ❌ **Writing custom Python/Ruby/Perl scripts** — Use ONLY the existing Node.js/TypeScript toolchain (`npm run build`, `node scripts/...`). NEVER use `python3`, `pip install`, or any Python-based workaround
- ❌ **Dangerous shell expansion patterns** — NEVER use `${var@P}`, `${!var}`, `eval`, nested command substitutions `$($(..))`, or indirect variable expansion. These will be blocked by the sandbox
- ❌ **Ad-hoc data processing scripts** — Use the existing `scripts/generate-news-enhanced.js` and pipeline tools
- ❌ **Workarounds for existing tools** — If `npm run build` or existing scripts fail, log the error and continue; do NOT reimplement their functionality in another language

**If you encounter build errors, test failures, or source code bugs:**
- ❌ DO NOT attempt to fix them — that is outside this workflow's scope
- ✅ Log the error and continue with translation
- ✅ The translation generator handles all code logic; your job is to RUN it, not FIX it

## 🚨 CRITICAL — NEVER USE AD-HOC GIT COMMANDS (READ BEFORE ANYTHING ELSE)

> **⛔ ABSOLUTE RULE — ZERO EXCEPTIONS FOR MANUAL GIT OPERATIONS**: You MUST NEVER run ad-hoc/manual git commands such as `git add`, `git commit`, `git push`, `git checkout -b`, or other self-directed git write operations **unless this workflow explicitly instructs you to do so in a later safety/cleanup/recovery step**. The gh-aw framework handles normal PR git operations automatically. If you manually commit files, the `create_pull_request` safe output WILL fail with "No changes to commit" because it expects uncommitted working directory changes.

**The ONLY correct normal workflow:**
1. Write/edit files using bash, `edit`, or `create` tools → files remain as **uncommitted working directory changes**
2. Call `safeoutputs___create_pull_request` with `title`, `body`, `base`, `head` → the framework auto-commits, creates the branch, and opens the PR
3. If a later section of this workflow explicitly tells you to run a git cleanup/recovery command (for example, scope cleanup or git-state safety steps), follow that instruction exactly as written

**FORBIDDEN ad-hoc git operations (these WILL break the workflow):**
- ❌ `git add` — NEVER stage files manually
- ❌ `git commit` — NEVER commit files manually
- ❌ `git push` — NEVER push manually
- ❌ `git checkout -b` — NEVER create branches manually
- ❌ `git reset`, `git checkout`, `git stash`, or similar git state changes **unless this workflow explicitly directs that exact recovery/cleanup step**
- ❌ ANY ad-hoc attempt to "fix" a failed `create_pull_request` call with git commands — retry **once**, then let the workflow fail unless this workflow explicitly instructs a specific git recovery step

**If `create_pull_request` fails:**
1. Retry `safeoutputs___create_pull_request` exactly **once**
2. If still fails: ❌ workflow MUST FAIL — do NOT try alternative ad-hoc git commands, branch tricks, or API calls, except for git commands explicitly required elsewhere in this workflow

## 🧠 Memory & Reasoning Tools

### Repo Memory (persistent across runs)
Read prior translation context at START: `cat /tmp/gh-aw/repo-memory/default/memory/news-generation/translation-log.json 2>/dev/null || echo '[]'`

At END, update `translation-log.json` with today's metadata (keep last 30 entries). Writing to `/tmp/gh-aw/repo-memory/default/memory/news-generation/` is explicitly allowed.

### Memory MCP (session-scoped)
Use `create_entities`/`search_nodes` to track terminology consistency across translations within this run.

### Sequential Thinking
Use `sequentialthinking` for complex translation decisions (ambiguous political terminology, cultural adaptation).

## 🔧 Workflow Dispatch Parameters

- **article_types** = `${{ github.event.inputs.article_types }}`
- **article_date** = `${{ github.event.inputs.article_date }}`
- **languages** = `${{ github.event.inputs.languages }}`
- **force_translation** = `${{ github.event.inputs.force_translation }}`

## 🎯 Purpose

This workflow is the **dedicated translation workflow**. Content generation workflows (news-week-ahead, news-motions, etc.) focus exclusively on producing excellent English articles with deep political intelligence. This workflow takes those English articles and translates them faithfully to all other supported languages.

### Supported Languages (13 non-English targets)

| Code | Language | Notes |
|------|----------|-------|
| sv | Swedish | |
| da | Danish | |
| no | Norwegian | |
| fi | Finnish | |
| de | German | |
| fr | French | |
| es | Spanish | |
| nl | Dutch | |
| ar | Arabic | RTL |
| he | Hebrew | RTL |
| ja | Japanese | CJK |
| ko | Korean | CJK |
| zh | Chinese (Simplified) | CJK |

## 🌐 ANALYSIS FIDELITY REQUIREMENTS (translation specific)

When translating articles, preserve ALL analytical nuance:
- **Stakeholder framing**: Do not simplify stakeholder analysis — translate the full context, not just the conclusion
- **Confidence indicators**: Preserve 🟢/🟡/🔴 confidence markers exactly as in the source; translate the accompanying text labels (High/Medium/Low) to the target-language equivalents while keeping the emoji markers unchanged and the 3-level scale intact
- **Significance labels**: Translate document-significance text labels (High/Medium/Low) to the target language — do not leave English labels in non-English articles
- **Scenario labels**: Preserve the probability *category* (likely/possible/unlikely) by mapping each label to its correct equivalent in the target language — do not upgrade or downgrade certainty during translation
- **Technical terms**: Use EP official terminology in each target language (not ad-hoc translations)
- **Coalition dynamics**: Preserve all references to political group interactions and voting patterns
- **Cultural adaptation**: Adapt *existing* examples, idioms, or references from the source article for local context where helpful, but do not introduce new facts, examples, or analysis not present in the English source

### 📚 Per-Language EP Terminology Standards

Use official EU/EP institutional terminology for each target language. Key terms:

| English Term | sv | de | fr | es | ja | ar |
|---|---|---|---|---|---|---|
| European Parliament | Europaparlamentet | Europäisches Parlament | Parlement européen | Parlamento Europeo | 欧州議会 | البرلمان الأوروبي |
| plenary session | plenarsammanträde | Plenarsitzung | séance plénière | sesión plenaria | 本会議 | الجلسة العامة |
| committee | utskott | Ausschuss | commission | comisión | 委員会 | اللجنة |
| rapporteur | föredragande | Berichterstatter | rapporteur | ponente | 報告者 | المقرر |
| legislative procedure | lagstiftningsförfarande | Gesetzgebungsverfahren | procédure législative | procedimiento legislativo | 立法手続き | الإجراء التشريعي |
| adopted text | antagen text | angenommener Text | texte adopté | texto aprobado | 採択文 | النص المعتمد |
| amendment | ändringsförslag | Änderungsantrag | amendement | enmienda | 修正案 | التعديل |
| trilogue | trilog | Trilog | trilogue | trílogo | 三者協議 | الحوار الثلاثي |
| roll-call vote | omröstning med namnupprop | namentliche Abstimmung | vote par appel nominal | votación nominal | 記名投票 | تصويت بنداء الأسماء |

> For full terminology, consult [EP Multilingual Termbase](https://www.europarl.europa.eu/portal/en) and [IATE](https://iate.europa.eu/).

### 🎯 Translation Quality Dimensions

Each translated article must score well on these 5 dimensions:

1. **Accuracy** (40%): Factual fidelity to the English source — zero additions, zero omissions of substantive claims
2. **Fluency** (20%): Reads naturally in the target language — not "translationese"
3. **Terminology** (20%): Uses official EP/EU institutional vocabulary — not informal or ad-hoc translations
4. **Completeness** (10%): Every section, SWOT entry, stakeholder perspective, and confidence marker is present
5. **Formatting** (10%): RTL/CJK layout correct, locale-appropriate number formatting, emoji markers preserved

## ⏱️ Time Budget (90 minutes)

- **Minutes 0–5**: Date validation, discover English articles, set up MCP gateway
- **Minutes 5–20**: Generate article HTML files using the TypeScript generator (Step 3)
- **Minutes 20–65**: **AI Translation** — translate English narrative content per file (Step 3b)
- **Minutes 65–72**: Validate translated HTML files (Step 4)
- **Minutes 72–80**: Create PR with `safeoutputs___create_pull_request`

> **🔑 TRANSLATION FOCUS**: The generator produces articles with localized UI but English narrative. YOU translate ALL English content.

> **⚠️ HARD DEADLINE**: Translation MUST stop by minute 65 to leave time for validation and PR creation. You MUST call `safeoutputs___create_pull_request` before minute 80. Partial translations in a PR are better than a timeout with no PR.

## MANDATORY MCP Health Gate

Before starting any translation work, verify that ALL MCP servers required by this workflow are available. The translate workflow uses `european-parliament` MCP for article generation, `memory` for cross-run terminology tracking, and `sequential-thinking` for complex translation decisions.

### Step 0: EP API Connectivity Pre-Check (bash)

Run a lightweight HTTP probe **before** the MCP health gate to detect network-level failures (DNS, firewall, EP API outage) instantly:

```bash
EP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "https://data.europarl.europa.eu/api/v2/meps?format=application%2Fld%2Bjson&offset=0&limit=1" 2>/dev/null || true)
EP_STATUS="${EP_STATUS:-000}"
echo "EP API connectivity check: HTTP $EP_STATUS"
if [ "$EP_STATUS" = "000" ] || [ "$EP_STATUS" -ge 500 ] 2>/dev/null; then
  echo "⚠️ EP API appears DOWN (HTTP $EP_STATUS) — EP MCP health gate may also fail. Translation can still proceed with existing English articles."
fi
```

### EP MCP Health Check (REQUIRED for generation)

1. Call `european_parliament___get_plenary_sessions({ limit: 1 })` — if successful, EP MCP is healthy
2. If it fails, wait 30 seconds and retry (up to 3 total attempts)
3. If ALL 3 attempts fail:
   - Log the warning: "⚠️ EP MCP server unavailable — article generation may skip types that require live data"
   - Continue with translation (the generator will handle MCP fallback per article type)
   - Do NOT noop — existing English articles can still be translated even without EP MCP

**Implementation pattern** — execute this check before any other work:

```javascript
// EP MCP Health Gate — verify European Parliament server availability
european_parliament___get_plenary_sessions({ limit: 1 })
// If the call succeeds, EP MCP is healthy — all article types can be generated.
// If it fails after 3 retries (30s between each), log a warning and continue.
// The generator handles MCP unavailability per article type.
```

### Memory MCP Health Check (helpful but not required)

1. Call `memory___read_graph({})` — if successful, the memory MCP server is healthy
2. If it fails, wait 15 seconds and retry (up to 3 total attempts)
3. If ALL 3 attempts fail:
   - Log the warning: "⚠️ Memory MCP server unavailable — proceeding without cross-run terminology tracking"
   - Continue with translation (memory is helpful but NOT required for core translation)

```javascript
// Memory MCP Health Gate — verify memory server availability
memory___read_graph({})
// If the call succeeds, proceed to Date Context Establishment below.
// If it fails after 3 retries (15s between each), log a warning and continue.
```

> **NOTE**: Both EP MCP and Memory MCP are declared in `mcp-servers:` and MUST be health-checked. The translate workflow should NEVER noop solely because one MCP server is unavailable — partial results are always better than no results.

## MANDATORY Date Context Establishment

**⚠️ ALWAYS run this block FIRST (immediately after the MCP Health Gate above).**

```bash
echo "=== Translation Date Context ==="
TODAY=$(date -u +%Y-%m-%d)
ARTICLE_DATE="${EP_ARTICLE_DATE:-$TODAY}"
CURRENT_YEAR=$(date -u +%Y)
DAY_OF_WEEK=$(date -u +%A)
START_EPOCH=$(date +%s)
TRANSLATION_DEADLINE_MIN=65
RUN_ID="${GITHUB_RUN_NUMBER:-0}"
ANALYSIS_DIR="analysis/daily/${ARTICLE_DATE}/translate-run${RUN_ID}"
echo "Today:        $TODAY ($DAY_OF_WEEK)"
echo "Article date: $ARTICLE_DATE"
echo "Year:         $CURRENT_YEAR"
echo "Run ID:       $RUN_ID"
echo "Analysis Dir: $ANALYSIS_DIR"
echo "Start epoch:  $START_EPOCH"
echo "Deadline:     ${TRANSLATION_DEADLINE_MIN} minutes"
echo "==================================="
export TODAY ARTICLE_DATE CURRENT_YEAR DAY_OF_WEEK START_EPOCH TRANSLATION_DEADLINE_MIN RUN_ID ANALYSIS_DIR

# ⚠️ MANDATORY: Create baseline analysis directory and summary BEFORE any noop exits.
# Per ai-driven-analysis-guide.md Rule 5, no workflow run should be wasted.
# This ensures even early noop paths (no articles found, all translations exist)
# produce a committed analysis artifact via an analysis-only PR.
mkdir -p "${ANALYSIS_DIR}"
SUMMARY_FILE="${ANALYSIS_DIR}/summary.md"
if [ ! -f "${SUMMARY_FILE}" ]; then
  cat > "${SUMMARY_FILE}" <<EOF
# Translation Analysis Summary — ${ARTICLE_DATE}

Automatically generated baseline translation analysis report for ${ARTICLE_DATE}.
Ensures no workflow run is wasted, even when no new translations were produced
or when all translations already existed.

## 1. Translation Coverage Matrix

- Article types covered: _(to be filled/extended by translation steps or reviewers)_
- Languages covered: _(to be filled/extended by translation steps or reviewers)_

## 2. Terminology Consistency

- EP-specific terms observed: _(document here)_
- Cross-language consistency notes: _(summarize here)_

## 3. Quality Assessment

- Overall quality per language: _(score + brief justification)_

## 4. Coverage Gap Analysis

- Article types not translated and reasons: _(document here)_
- Languages not translated and reasons: _(document here)_

## 5. Improvement Recommendations

- Short-term: _(e.g., terminology updates, language-specific fixes)_
- Longer-term: _(e.g., better prompts, additional validation, automation)_

---
_If a more detailed analysis already exists for this date, extend and refine it rather
than replacing it. This file is a minimal baseline to satisfy analysis requirements
when translation activity is low or skipped._
EOF
  echo "📊 Created baseline translation analysis summary: ${SUMMARY_FILE}"
else
  echo "📊 Existing translation analysis found — will extend in Step 4c"
fi
```

## Pre-flight: Verify No Pending Content PRs

> **⚠️ IMPORTANT**: If content-generation workflows (news-weekly-review, news-monthly-review, etc.) have open PRs waiting to be merged, our translation patch will conflict with them. Wait for content PRs to merge before translating.

```bash
# Check for open content-generation PRs that could cause patch conflicts
CONTENT_BRANCH_PATTERN="^news/(week-in-review|month-in-review|weekly-review|monthly-review|week-ahead|motions|propositions|committee-reports|breaking|month-ahead)"

PENDING_NEWS_PRS=$(gh pr list --repo "$GITHUB_REPOSITORY" --state open --limit 200 --json title,number,headRefName \
  --jq "[.[] | select(.headRefName | test(\"$CONTENT_BRANCH_PATTERN\"))] | length" 2>/dev/null || echo "UNKNOWN")

if [ "$PENDING_NEWS_PRS" = "UNKNOWN" ]; then
  echo "⚠️ Unable to determine pending content-generation PRs (gh/jq failure) — proceeding with caution."
  echo "ℹ️ Patch conflicts with content-generation PRs are possible but translations will be attempted."
elif [ "$PENDING_NEWS_PRS" -gt 0 ]; then
  echo "⚠️ Found $PENDING_NEWS_PRS pending content-generation PR(s) — these may cause patch conflicts"
  echo "Listing pending content PRs:"
  gh pr list --repo "$GITHUB_REPOSITORY" --state open --limit 200 --json title,number,headRefName \
    --jq ".[] | select(.headRefName | test(\"$CONTENT_BRANCH_PATTERN\")) | \"  #\\(.number): \\(.title)\"" 2>/dev/null || true
  echo "ℹ️ Proceeding with translation — patch conflicts are possible but translations will be attempted"
else
  echo "✅ No pending content-generation PRs — safe to translate"
fi
```

## Step 1: Discover English Articles Needing Translation

Find English articles that don't have corresponding translations:

```bash
# Determine which article types to process
ARTICLE_TYPES_INPUT="${EP_ARTICLE_TYPES:-}"

if [ -z "$ARTICLE_TYPES_INPUT" ]; then
  # Auto-discover: find all English articles for the target date
  ARTICLE_TYPES=$(ls news/${ARTICLE_DATE}-*-en.html 2>/dev/null | \
    sed "s|news/${ARTICLE_DATE}-||;s|-en\.html||" | \
    sort -u | tr '\n' ',' | sed 's/,$//')
  echo "Auto-discovered article types: $ARTICLE_TYPES"
else
  ARTICLE_TYPES="$ARTICLE_TYPES_INPUT"
  echo "Specified article types: $ARTICLE_TYPES"
fi

if [ -z "$ARTICLE_TYPES" ]; then
  echo "ℹ️ No English articles found for $ARTICLE_DATE — nothing to translate"
  # Per Rule 5: no workflow run wasted — create analysis-only PR with baseline summary
  echo "📊 Creating analysis-only PR with baseline translation analysis for $ARTICLE_DATE"
  # Update the baseline summary with specifics about why no translations were produced
  cat >> "${ANALYSIS_DIR}/summary.md" <<EOF

## Run Outcome — No Articles Found

- **Date**: ${ARTICLE_DATE}
- **Result**: No English articles found for this date
- **Action**: No translations produced; baseline analysis committed
EOF
  BRANCH_NAME="news/translate-${ARTICLE_DATE}"
```

Create the analysis-only PR and exit:

```javascript
safeoutputs___create_pull_request({
  title: "chore: translate EU Parliament articles ${ARTICLE_DATE} (analysis-only)",
  body: "## 📊 Translation Analysis Only — ${ARTICLE_DATE}\n\n### Summary\nNo English articles found for ${ARTICLE_DATE}.\n\n### Details\n- **Date**: ${ARTICLE_DATE}\n- **Result**: No English source articles available for translation\n- **Action**: Baseline translation analysis committed per Rule 5\n- **Workflow**: `news-translate`\n\n### Next Steps\n- Check if content workflows have run for this date\n- Verify English articles were merged to main branch\n\n---\n> Generated by the `news-translate` agentic workflow.",
  base: "main",
  head: BRANCH_NAME
})
```

```bash
  exit 0
fi

# Check which articles already have translations
NEEDS_TRANSLATION=""
for TYPE in $(echo "$ARTICLE_TYPES" | tr ',' ' '); do
  EN_FILE="news/${ARTICLE_DATE}-${TYPE}-en.html"
  if [ ! -f "$EN_FILE" ]; then
    echo "⚠️ English article not found: $EN_FILE — skipping type $TYPE"
    continue
  fi

  # Check if translations already exist (use sv as indicator)
  SV_FILE="news/${ARTICLE_DATE}-${TYPE}-sv.html"
  if [ -f "$SV_FILE" ] && [ "${EP_FORCE_TRANSLATION:-}" != "true" ]; then
    echo "ℹ️ Translations already exist for $TYPE on $ARTICLE_DATE — skipping"
    continue
  fi

  NEEDS_TRANSLATION="${NEEDS_TRANSLATION:+$NEEDS_TRANSLATION,}$TYPE"
  echo "📝 Will translate: $TYPE ($EN_FILE)"
done

if [ -z "$NEEDS_TRANSLATION" ]; then
  echo "ℹ️ All articles for $ARTICLE_DATE already have translations"
  # Per Rule 5: no workflow run wasted — create analysis-only PR with baseline summary
  echo "📊 Creating analysis-only PR with baseline translation analysis for $ARTICLE_DATE"
  # Update the baseline summary with specifics about why no new translations were produced
  cat >> "${ANALYSIS_DIR}/summary.md" <<EOF

## Run Outcome — Translations Already Exist

- **Date**: ${ARTICLE_DATE}
- **Article types checked**: ${ARTICLE_TYPES}
- **Result**: All articles already have translations
- **Action**: No new translations produced; baseline analysis committed
EOF
  BRANCH_NAME="news/translate-${ARTICLE_DATE}"
```

Create the analysis-only PR and exit:

```javascript
safeoutputs___create_pull_request({
  title: "chore: translate EU Parliament articles ${ARTICLE_DATE} (analysis-only)",
  body: "## 📊 Translation Analysis Only — ${ARTICLE_DATE}\n\n### Summary\nAll articles for ${ARTICLE_DATE} already have translations.\n\n### Details\n- **Date**: ${ARTICLE_DATE}\n- **Article types checked**: ${ARTICLE_TYPES}\n- **Result**: All translations already exist — no new translations needed\n- **Action**: Baseline translation analysis committed per Rule 5\n- **Workflow**: `news-translate`\n\n---\n> Generated by the `news-translate` agentic workflow.",
  base: "main",
  head: BRANCH_NAME
})
```

```bash
  exit 0
fi

echo "🌐 Articles to translate: $NEEDS_TRANSLATION"
export NEEDS_TRANSLATION
```

## Step 2: Set Up Translation Languages

```bash
LANGUAGES_INPUT="${EP_LANG_INPUT:-all-non-en}"

# Strict allowlist validation
case "$LANGUAGES_INPUT" in
  "all-non-en") LANG_ARG="sv,da,no,fi,de,fr,es,nl,ar,he,ja,ko,zh" ;;
  "eu-core")    LANG_ARG="de,fr,es,nl" ;;
  "nordic")     LANG_ARG="sv,da,no,fi" ;;
  *)
    if printf '%s' "$LANGUAGES_INPUT" | grep -Eq '^(sv|da|no|fi|de|fr|es|nl|ar|he|ja|ko|zh)(,(sv|da|no|fi|de|fr|es|nl|ar|he|ja|ko|zh))*$'; then
      LANG_ARG="$LANGUAGES_INPUT"
    else
      echo "❌ Invalid languages input: $LANGUAGES_INPUT" >&2
      echo "Allowed: all-non-en, eu-core, nordic, or comma-separated: sv,da,no,fi,de,fr,es,nl,ar,he,ja,ko,zh" >&2
      exit 1
    fi
    ;;
esac

echo "🌐 Target languages: $LANG_ARG"
export LANG_ARG
```

## Step 3: Generate Article Structure

**Use the TypeScript generator to produce article HTML files.** The generator produces articles with:
- ✅ **Localized UI**: Headings, navigation, labels, date formatting — all in the target language
- ⚠️ **English narrative content**: The narrative analysis (what, why, impact, outlook, stakeholders) is generated in **English** without any markers. You MUST translate ALL English content.

> The generator handles structural localization. **Step 3b** (below) handles ALL narrative content translation — this is where YOU (the AI agent) **read the entire file, identify every English sentence, and translate it** to the target language. There are NO `lang="en"` markers — read every paragraph and translate all English text.

> ⚠️ **CRITICAL — MCP env vars and the generation script MUST run in the same bash block.**

```bash
# --- Re-initialize time tracking (env vars do NOT persist across bash blocks) ---
START_EPOCH=$(date +%s)
TRANSLATION_DEADLINE_MIN=65
echo "⏱️ Translation start epoch: $START_EPOCH (deadline: ${TRANSLATION_DEADLINE_MIN} min)"

# --- MCP Gateway Setup ---
MCP_CONFIG="${GH_AW_MCP_CONFIG:-/home/runner/.copilot/mcp-config.json}"

if [ -f "$MCP_CONFIG" ]; then
  echo "✅ MCP gateway config found at $MCP_CONFIG"
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
      localhost|127.0.0.1|::1|host.docker.internal) GATEWAY_SCHEME="http" ;;
      *) GATEWAY_SCHEME="https" ;;
    esac
    export EP_MCP_GATEWAY_URL="${GATEWAY_SCHEME}://${GATEWAY_DOMAIN}:${GATEWAY_PORT}/mcp/european-parliament"
    export EP_MCP_GATEWAY_API_KEY="${GATEWAY_API_KEY:-}"
    echo "✅ Gateway mode: EP_MCP_GATEWAY_URL=$EP_MCP_GATEWAY_URL"
  fi
else
  echo "ℹ️ No gateway config found, will use stdio mode"
fi

# Fallback: verify binary for stdio mode
if [ -z "${EP_MCP_GATEWAY_URL:-}" ]; then
  if [ -f "node_modules/.bin/european-parliament-mcp-server" ]; then
    echo "✅ EP MCP server binary found for stdio mode"
  else
    echo "⚠️ EP MCP server binary not found, attempting reinstall..."
    npm install --no-save european-parliament-mcp-server@1.2.1
  fi
fi

export USE_EP_MCP=true

# --- Translate Each Article Type ---
TRANSLATED_TYPES=""
FAILED_TYPES=""

for TYPE in $(echo "$NEEDS_TRANSLATION" | tr ',' ' '); do
  echo ""
  echo "═══════════════════════════════════════════"
  echo "🌐 Translating: $TYPE (date: $ARTICLE_DATE)"
  echo "═══════════════════════════════════════════"

  # ⏱️ Time check: stop translating if deadline reached
  NOW_EPOCH=$(date +%s)
  ELAPSED_MIN=$(( (NOW_EPOCH - START_EPOCH) / 60 ))
  echo "⏱️ Elapsed: ${ELAPSED_MIN} minutes (deadline: ${TRANSLATION_DEADLINE_MIN})"
  if [ "$ELAPSED_MIN" -ge "$TRANSLATION_DEADLINE_MIN" ]; then
    echo "⚠️ Deadline reached (${ELAPSED_MIN}min elapsed, limit: ${TRANSLATION_DEADLINE_MIN}min). Stopping translation to ensure PR creation."
    break
  fi

  SKIP_FLAG=""
  if [ "${{ github.event.inputs.force_translation }}" = "false" ]; then
    SKIP_FLAG="--skip-existing"
  fi

  npx tsx src/generators/news-enhanced.ts \
    --types="$TYPE" \
    --languages="$LANG_ARG" \
    $SKIP_FLAG

  if [ $? -eq 0 ]; then
    TRANSLATED_TYPES="${TRANSLATED_TYPES:+$TRANSLATED_TYPES,}$TYPE"
    echo "✅ Translation completed for $TYPE"
  else
    FAILED_TYPES="${FAILED_TYPES:+$FAILED_TYPES,}$TYPE"
    echo "⚠️ Translation failed for $TYPE — continuing with remaining types"
  fi
done

echo ""
echo "═══ Translation Summary ═══"
echo "✅ Translated: ${TRANSLATED_TYPES:-none}"
echo "❌ Failed:     ${FAILED_TYPES:-none}"

if [ -z "$TRANSLATED_TYPES" ]; then
  echo "⚠️ All translations failed — will create analysis-only PR"
  TRANSLATED_TYPES="none"
fi
```

## Step 3b: AI Translation — Translate English Content

> **CORE STEP**: The generator produces articles with localized UI but **English narrative content**. You MUST translate all English text in each non-English file.

> **⛔ REMINDER — NO GIT COMMANDS**: Use `edit` tool or bash file writes (e.g., `cat > file`, `sed -i`) to update translation files. NEVER run `git add`, `git commit`, or any git command. Files MUST remain as uncommitted working directory changes for the PR creation step to work.

> **⏱️ TIME MANAGEMENT**: Check elapsed time after each article type. If 65+ minutes elapsed, SKIP remaining translations and proceed directly to Step 5 (PR creation). Partial translations are acceptable.

For each non-English article file generated in Step 3:

1. Read the file, identify English text in `<p>`, `<li>`, `<td>`, `<span>`, `<div>` elements
2. Translate to the target language using EP terminology standards (see table above)
3. Write the translated file back using `edit` tool or bash file writes — do NOT use git commands
4. Keep: proper nouns (MEP names), abbreviations (EPP, S&D), reference IDs, location names

Translate ALL narrative content: analysis, stakeholder perspectives, impact assessments, SWOT entries, outlook, footer disclaimers, and alt text.

**Quality checklist per article:**
- [ ] All list items and table cells with descriptions are translated
- [ ] EP terminology follows the official vocabulary table above
- [ ] Confidence markers (🟢/🟡/🔴) are preserved with translated labels
- [ ] Vote counts and percentages are numerically identical to English source
- [ ] The article reads naturally in the target language (not "translationese")

## Step 4: Validate Translated Articles

```bash
if [ -z "${ARTICLE_DATE:-}" ]; then
  ARTICLE_DATE=$(date -u +%Y-%m-%d)
fi
CURRENT_YEAR=$(date -u +%Y)
VALIDATION_FAILURES=0

for TYPE in $(echo "$TRANSLATED_TYPES" | tr ',' ' '); do
  echo "Validating translations for: $TYPE"

  for LANG in $(echo "$LANG_ARG" | tr ',' ' '); do
    FILE="news/${ARTICLE_DATE}-${TYPE}-${LANG}.html"
    if [ ! -f "$FILE" ]; then
      echo "⚠️ Missing: $FILE"
      VALIDATION_FAILURES=$((VALIDATION_FAILURES + 1))
      continue
    fi

    # Validate HTML structure
    MISSING_SWITCHER=$(grep -cL 'class="language-switcher"' "$FILE" 2>/dev/null || echo 0)
    MISSING_HEADER=$(grep -cL 'class="site-header"' "$FILE" 2>/dev/null || echo 0)
    if [ "$MISSING_SWITCHER" -gt 0 ]; then
      echo "⚠️ $FILE: Missing required language switcher"
      VALIDATION_FAILURES=$((VALIDATION_FAILURES + 1))
    fi
    if [ "$MISSING_HEADER" -gt 0 ]; then
      echo "⚠️ $FILE: Missing required site header"
      VALIDATION_FAILURES=$((VALIDATION_FAILURES + 1))
    fi

    # Check word count (skip for CJK languages where whitespace tokenization undercounts)
    if [ "$LANG" != "ja" ] && [ "$LANG" != "ko" ] && [ "$LANG" != "zh" ]; then
      WORD_COUNT=$(sed 's/<[^>]*>/ /g' "$FILE" | tr -s '[:space:]' '\n' | grep -c '[[:alnum:]]' 2>/dev/null || echo 0)
      if [ "$WORD_COUNT" -lt 300 ]; then
        echo "⚠️ $FILE: Low word count ($WORD_COUNT) — translation may be incomplete"
        VALIDATION_FAILURES=$((VALIDATION_FAILURES + 1))
      fi
    fi

    # ── Translation content-level quality checks ──
    # Check for untranslated English phrases in non-English articles
    # After Step 3b AI translation, ALL English content should be translated
    # This list covers common English phrases that indicate incomplete translation
    ENGLISH_PHRASES="legislative processing capacity|coalition-building strategies|political group dynamics|regulatory implications|democratic participation|inter-institutional relations|Likely scenario|Possible scenario|Earlier intervention|committee coordinators|Pipeline health|Throughput rate|What Happened|Why This Matters|Impact Assessment|Stakeholder Perspectives|Missed Opportunities|The European Parliament|This vote demonstrates|This legislative|political implications|economic impact|stakeholder analysis|forward-looking|represents a significant|The Commission|Member States agreed|adopted by|rejected by|abstention rate"
    UNTRANSLATED_COUNT=$(grep -Eic "$ENGLISH_PHRASES" "$FILE" 2>/dev/null || echo 0)
    if [ "$UNTRANSLATED_COUNT" -gt 0 ]; then
      echo "⚠️ $FILE: Found $UNTRANSLATED_COUNT instances of untranslated English phrases — translation incomplete"
      VALIDATION_FAILURES=$((VALIDATION_FAILURES + 1))
    fi

    # Check lang="en" markers — the generator no longer produces these, but check as safety net
    EN_CONTENT_MARKERS=$(grep -c 'lang="en"' "$FILE" 2>/dev/null || echo 0)
    if [ "$EN_CONTENT_MARKERS" -gt 0 ]; then
      echo "⚠️ $FILE: Found $EN_CONTENT_MARKERS unexpected lang=\"en\" markers"
      VALIDATION_FAILURES=$((VALIDATION_FAILURES + 1))
    fi

    # Broad English sentence detection — check for common English patterns
    # This catches English content that lacks lang="en" markers
    ENGLISH_PATTERNS="\\bthe\\b.*\\bof\\b|\\bThis\\b.*\\bis\\b|\\bwill\\b.*\\bbe\\b|\\bhas\\b.*\\bbeen\\b|\\bshould\\b.*\\bbe\\b|\\bcould\\b.*\\blead\\b|\\bin terms of\\b|\\bwith respect to\\b|\\baccording to\\b"
    BROAD_ENGLISH=$(sed 's/<[^>]*>//g' "$FILE" | grep -Eic "$ENGLISH_PATTERNS" 2>/dev/null || echo 0)
    if [ "$BROAD_ENGLISH" -gt 5 ]; then
      echo "⚠️ $FILE: Detected ~$BROAD_ENGLISH English sentence patterns — significant untranslated content remains"
      VALIDATION_FAILURES=$((VALIDATION_FAILURES + 1))
    fi

    # CJK-specific checks: ensure CJK characters are present
    if echo "$LANG" | grep -qE '^(ja|ko|zh)$'; then
      CJK_CHARS=$(grep -oP '[\x{4E00}-\x{9FFF}\x{3040}-\x{309F}\x{30A0}-\x{30FF}\x{AC00}-\x{D7AF}\x{1100}-\x{11FF}]' "$FILE" 2>/dev/null | wc -l || echo 0)
      if [ "$CJK_CHARS" -lt 50 ]; then
        echo "⚠️ $FILE: Only $CJK_CHARS CJK characters found — content likely untranslated"
        VALIDATION_FAILURES=$((VALIDATION_FAILURES + 1))
      fi
    fi

    # RTL-specific checks: ensure dir="rtl" is present
    if echo "$LANG" | grep -qE '^(ar|he)$'; then
      HAS_RTL=$(grep -c 'dir="rtl"' "$FILE" 2>/dev/null || echo 0)
      if [ "$HAS_RTL" -eq 0 ]; then
        echo "⚠️ $FILE: Missing dir=\"rtl\" attribute for RTL language $LANG"
        VALIDATION_FAILURES=$((VALIDATION_FAILURES + 1))
      fi
    fi

    # Check for stale dates
    DATES=$(grep -E 'name="date"|article:published_time|datePublished' "$FILE" 2>/dev/null \
      | grep -Eo '20[0-9]{2}-[0-9]{2}-[0-9]{2}' | sort -u || true)
    for DATE_VALUE in $DATES; do
      DATE_YEAR=$(echo "$DATE_VALUE" | cut -c1-4)
      if [ "$DATE_YEAR" != "$CURRENT_YEAR" ]; then
        echo "⚠️ $FILE: Contains stale date $DATE_VALUE"
      fi
    done
  done
done

if [ "$VALIDATION_FAILURES" -gt 0 ]; then
  echo "⚠️ Translation validation found $VALIDATION_FAILURES issue(s) — proceeding with PR creation"
else
  echo "✅ All translations pass validation"
fi
```

## Step 4b: Scope Verification (Prevent Patch Conflicts)

> **⚠️ CRITICAL**: This step prevents patch apply failures caused by unintended file modifications.
>
> **NOTE**: The `git checkout` and `git reset` commands in this scope cleanup block are **explicitly whitelisted** — run them exactly as written below to revert out-of-scope changes.

```bash
echo "=== Scope Verification ==="

# Use NUL-delimited output for safe handling of all filenames
# Check for modifications outside news/ and analysis/daily/ directories (unstaged, staged, and untracked)
OUT_OF_SCOPE=$(git diff -z --name-only 2>/dev/null | tr '\0' '\n' | grep -Ev '^(news|analysis/daily)(/|$)' || true)
STAGED_OOS=$(git diff -z --name-only --staged 2>/dev/null | tr '\0' '\n' | grep -Ev '^(news|analysis/daily)(/|$)' || true)
UNTRACKED_OOS=$(git ls-files -z --others --exclude-standard 2>/dev/null | tr '\0' '\n' | grep -Ev '^(news|analysis/daily)(/|$)' || true)

# Check for modifications to English source articles (translate must not edit originals)
EN_MODIFIED=$(git diff -z --name-only 2>/dev/null | tr '\0' '\n' | grep -E '^news/.*-en\.html$' || true)
EN_STAGED=$(git diff -z --name-only --staged 2>/dev/null | tr '\0' '\n' | grep -E '^news/.*-en\.html$' || true)

SCOPE_VIOLATION=""
[ -n "$OUT_OF_SCOPE" ] || [ -n "$STAGED_OOS" ] || [ -n "$UNTRACKED_OOS" ] && SCOPE_VIOLATION="yes"
[ -n "$EN_MODIFIED" ] || [ -n "$EN_STAGED" ] && SCOPE_VIOLATION="yes"

if [ -n "$SCOPE_VIOLATION" ]; then
  echo "⚠️ Scope violations detected — reverting to prevent patch conflicts:"

  # Revert unstaged tracked file changes outside news/
  if [ -n "$OUT_OF_SCOPE" ]; then
    echo "Reverting unstaged out-of-scope tracked files:"
    echo "$OUT_OF_SCOPE"
    echo "$OUT_OF_SCOPE" | xargs -d '\n' -r git checkout -- 2>/dev/null || echo "⚠️ Some files could not be reverted"
  fi

  # Unstage and revert staged file changes outside news/
  if [ -n "$STAGED_OOS" ]; then
    echo "Reverting staged out-of-scope files:"
    echo "$STAGED_OOS"
    echo "$STAGED_OOS" | xargs -d '\n' -r git reset HEAD -- 2>/dev/null || echo "⚠️ Some files could not be unstaged"
    echo "$STAGED_OOS" | xargs -d '\n' -r git checkout -- 2>/dev/null || echo "⚠️ Some files could not be reverted"
  fi

  # Remove untracked files outside news/
  if [ -n "$UNTRACKED_OOS" ]; then
    echo "Removing untracked out-of-scope files:"
    echo "$UNTRACKED_OOS"
    echo "$UNTRACKED_OOS" | xargs -d '\n' -r rm -f -- 2>/dev/null || echo "⚠️ Some files could not be removed"
  fi

  # Revert modifications to English source articles
  if [ -n "$EN_MODIFIED" ]; then
    echo "Reverting modified English source articles (read-only for translation):"
    echo "$EN_MODIFIED"
    echo "$EN_MODIFIED" | xargs -d '\n' -r git checkout -- 2>/dev/null || echo "⚠️ Some English sources could not be reverted"
  fi
  if [ -n "$EN_STAGED" ]; then
    echo "Reverting staged English source articles:"
    echo "$EN_STAGED"
    echo "$EN_STAGED" | xargs -d '\n' -r git reset HEAD -- 2>/dev/null || echo "⚠️ Some English sources could not be unstaged"
    echo "$EN_STAGED" | xargs -d '\n' -r git checkout -- 2>/dev/null || echo "⚠️ Some English sources could not be reverted"
  fi

  echo "✅ Scope violations reverted"
else
  echo "✅ All changes are within scope — only non-English news/ and analysis/ files modified"
fi
```

## Step 4c: Translation Analysis (MANDATORY per ai-driven-analysis-guide.md Rule 5)

> **⚠️ MANDATORY**: Per `analysis/methodologies/ai-driven-analysis-guide.md` Rule 5, no workflow run should be wasted. The translation workflow MUST produce analysis artifacts documenting translation quality, coverage, and terminology consistency. Each run creates its own unique analysis directory.

Before creating the PR, read ALL methodology documents in `analysis/methodologies/` and produce a translation analysis report in `${ANALYSIS_DIR}/`:

**Required analysis content:**
1. **Translation Coverage Matrix** — Which article types × languages were translated, which were skipped and why
2. **Terminology Consistency** — EP-specific terms used, any terminology lookups from MCP server, consistency across languages
3. **Quality Assessment** — Self-assessment of translation quality per language using `analysis/templates/significance-scoring.md`
4. **Coverage Gap Analysis** — Languages or article types that could not be translated, with reasons
5. **Improvement Recommendations** — What could be improved in the next translation run

Write the analysis artifacts to `${ANALYSIS_DIR}/` following the templates in `analysis/templates/`. If previous translation analysis exists for this date, read it first and extend/improve it rather than replacing.

```bash
# Re-initialize ANALYSIS_DIR (env vars do NOT persist across bash blocks)
if [ -z "${ARTICLE_DATE:-}" ]; then
  ARTICLE_DATE=$(date -u +%Y-%m-%d)
fi
RUN_ID="${GITHUB_RUN_NUMBER:-0}"
ANALYSIS_DIR="analysis/daily/${ARTICLE_DATE}/translate-run${RUN_ID}"
mkdir -p "${ANALYSIS_DIR}"
echo "📊 Translation analysis directory: ${ANALYSIS_DIR}/"

# The baseline summary.md was created at the start of the workflow (before any noop exits).
# If this step is reached, translations were actually produced — extend/improve the analysis.
SUMMARY_FILE="${ANALYSIS_DIR}/summary.md"
echo "📊 Extending analysis summary with translation results: ${SUMMARY_FILE}"
```

## Step 5: Create Pull Request

#### MANDATORY Git State Safety Check (Prevent "No changes to commit" Error)

> **⚠️ CRITICAL**: The `create_pull_request` safe output expects ALL file changes to be **uncommitted working directory modifications**. If any git commits were accidentally made (e.g., via `git add` + `git commit`), this safety check undoes them so the safe output can capture the changes.
>
> **NOTE**: The `git reset` and `git checkout` commands in this block are **explicitly whitelisted** — they are the only git state-changing commands permitted in this workflow. Run them exactly as written below.

```bash
# Safety check: undo any accidental git commits made during translation
# The safe output mechanism expects uncommitted working directory changes.
# If the agent accidentally committed, reset to the original checkout state
# while keeping all file changes in the working directory.
ORIGINAL_BRANCH=$(git rev-parse --abbrev-ref HEAD)
# Find the original checkout SHA — use GITHUB_SHA (set by Actions) if available,
# otherwise find the root commit of the current branch
CHECKOUT_SHA="${GITHUB_SHA:-}"
if [ -z "$CHECKOUT_SHA" ]; then
  CHECKOUT_SHA=$(git rev-list --max-parents=0 HEAD 2>/dev/null | tail -1)
fi
if [ -z "$CHECKOUT_SHA" ]; then
  echo "⚠️ Could not determine original checkout SHA — skipping safety check"
else
  CURRENT_SHA=$(git rev-parse HEAD)
  COMMITS_SINCE_CHECKOUT=$(git rev-list --count "$CHECKOUT_SHA".."$CURRENT_SHA" 2>/dev/null || echo 0)

  echo "📋 Git state check:"
  echo "  Branch:               $ORIGINAL_BRANCH"
  echo "  Checkout SHA:         $CHECKOUT_SHA"
  echo "  Current SHA:          $CURRENT_SHA"
  echo "  Commits since checkout: $COMMITS_SINCE_CHECKOUT"

  if [ "$COMMITS_SINCE_CHECKOUT" -gt 0 ]; then
    echo "⚠️ Git state safety: detected $COMMITS_SINCE_CHECKOUT commit(s) since checkout — resetting to keep files as uncommitted changes"
    # Reset to the original checkout commit, keeping all file changes in working directory
    git reset --mixed "$CHECKOUT_SHA" 2>/dev/null || true
    echo "✅ Git state restored — all changes are now uncommitted working directory modifications"
  else
    echo "✅ Git state clean — no accidental commits detected"
  fi
fi

# Ensure we're on the original branch (not a manually created branch)
# Use GITHUB_REF_NAME if available, otherwise default to main
DEFAULT_BRANCH="${GITHUB_REF_NAME:-main}"
if [ "$ORIGINAL_BRANCH" != "$DEFAULT_BRANCH" ] && [ "$ORIGINAL_BRANCH" != "HEAD" ]; then
  echo "⚠️ Git state safety: on branch '$ORIGINAL_BRANCH' instead of '$DEFAULT_BRANCH' — switching back"
  git checkout "$DEFAULT_BRANCH" 2>/dev/null || true
fi

echo "📋 Working directory status (should show uncommitted changes):"
git status --short | head -20
CHANGE_COUNT=$(git status --short | wc -l)
echo "📊 Total uncommitted changes: $CHANGE_COUNT"
```

#### MANDATORY Metadata Cleanup (Prevent Patch Conflicts)

> **⚠️ CRITICAL**: The generator writes `news/metadata/generation-YYYY-MM-DD.json` during article creation. When multiple news workflows run on the same day, each creates the same date's metadata file. If another workflow's PR is merged before this workflow's patch is applied, the metadata file already exists on `main` and the patch fails with "Failed to apply patch". **Remove the metadata file from the working directory before creating the PR** so it is not included in the diff.

```bash
# Remove metadata files to prevent patch conflicts with other same-day workflows
rm -f news/metadata/generation-*.json
rm -f news/articles-metadata.json
# ⚠️ MANDATORY: Persist analysis artifacts per ai-driven-analysis-guide.md Rule 5
# No workflow run should be wasted — translation analysis is ALWAYS persisted.
# Remove only raw data downloads to control PR size. Analysis markdown MUST be kept.
rm -rf analysis-output/
# Scope cleanup to THIS workflow's analysis directory only — never touch other workflows' data
if [ -z "${ARTICLE_DATE:-}" ]; then
  ARTICLE_DATE=$(date -u +%Y-%m-%d)
fi
RUN_ID="${GITHUB_RUN_NUMBER:-0}"
TRANSLATE_ANALYSIS_DIR="analysis/daily/${ARTICLE_DATE}/translate-run${RUN_ID}"
if [ -d "${TRANSLATE_ANALYSIS_DIR}" ]; then
  find "${TRANSLATE_ANALYSIS_DIR}" -type f -path "*/data/*" ! -name "*.analysis.md" ! -name "*.md" -delete 2>/dev/null || true
  find "${TRANSLATE_ANALYSIS_DIR}" -type d -name "data" -empty -delete 2>/dev/null || true
fi
echo "🧹 Cleaned raw data payloads for ${TRANSLATE_ANALYSIS_DIR}; translation analysis markdown artifacts PRESERVED for PR"

if [ -z "${ARTICLE_DATE:-}" ]; then
  ARTICLE_DATE=$(date -u +%Y-%m-%d)
fi
TRANSLATED_COUNT=$(find news/ -type f -name "${ARTICLE_DATE}-*-*.html" ! -name "*-en.html" 2>/dev/null | wc -l)
echo "📊 Total translated files: $TRANSLATED_COUNT"
BRANCH_NAME="news/translate-${ARTICLE_DATE}"
echo "Branch: $BRANCH_NAME"

# Determine PR title and body based on whether translations were produced
if [ "${TRANSLATED_TYPES}" = "none" ] || [ "$TRANSLATED_COUNT" -eq 0 ]; then
  PR_TITLE="chore: translate EU Parliament articles ${ARTICLE_DATE} (analysis-only)"
  PR_BODY="## 📊 Translation Analysis Only — ${ARTICLE_DATE}\n\n### Summary\nAll translation attempts failed for ${ARTICLE_DATE}. Analysis artifacts committed per Rule 5.\n\n### Details\n- **Article types attempted**: ${FAILED_TYPES:-unknown}\n- **Target languages**: ${LANG_ARG}\n- **Translated files**: 0\n- **Workflow**: \`news-translate\`\n- **Data source**: Existing English articles in \`news/\` directory\n\n### Next Steps\n- Review failed article types and retry on next scheduled run\n- Check English source article availability\n\n---\n> Generated by the \`news-translate\` agentic workflow."
else
  PR_TITLE="chore: translate EU Parliament articles ${ARTICLE_DATE}"
  PR_BODY="## 🌐 EU Parliament Article Translations — ${ARTICLE_DATE}\n\n### Summary\nTranslated EU Parliament news articles from English to ${LANG_ARG} for ${ARTICLE_DATE}.\n\n### Translation Coverage\n- **Article types**: ${TRANSLATED_TYPES}\n- **Target languages**: ${LANG_ARG}\n- **Total translated files**: ${TRANSLATED_COUNT}\n- **Workflow**: \`news-translate\`\n\n### Quality Checks\n- HTML validation: ✅ Passed\n- Language attribute verification: ✅ Checked\n- RTL/CJK layout validation: ✅ Verified (where applicable)\n- EP terminology consistency: ✅ Cross-referenced with official EU terminology\n\n### Data Pipeline\n- **Source**: English articles generated by content workflows (\`news-breaking\`, \`news-week-ahead\`, etc.)\n- **Translation method**: AI translation with EP-specific terminology standards\n- **Post-processing**: TypeScript generator pipeline with locale-specific formatting\n\n---\n> Generated by the \`news-translate\` agentic workflow. English source articles were generated by the individual content workflows."
fi
echo "PR title: $PR_TITLE"
```

```javascript
safeoutputs___create_pull_request({
  title: PR_TITLE,
  body: PR_BODY,
  base: "main",
  head: BRANCH_NAME
})
```

## Translation Rules Summary

### NEVER Translate
- EP document reference IDs, political group abbreviations, committee abbreviations, MEP names, session location names, procedure codes

### Language-Specific Notes
- **Nordic** (sv, da, no, fi): Formal register, official EP names per language
- **EU Core** (de, fr, es, nl): Formal register, official terminology
- **RTL** (ar, he): Modern Standard Arabic / formal Hebrew; RTL layout with `dir="rtl"`
- **CJK** (ja, ko, zh): Formal register; CJK punctuation; verify CJK character density

## MANDATORY PR Creation

> **⚠️ CRITICAL**: You MUST call `safeoutputs___create_pull_request` in EVERY run where files were generated, even if translation is incomplete. The gh-aw framework captures all file changes as a patch — you do NOT manage git operations.

### 🔑 How Safe Pull Request Works (READ FIRST)

The gh-aw framework **automatically captures all file changes** you make in the working directory as a patch. You do NOT manage git operations yourself.

**The mechanism:**
1. The TypeScript generator writes translation files to `news/`
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

- ✅ `safeoutputs___create_pull_request` when ANY translations are generated
- ✅ `safeoutputs___create_pull_request` with analysis-only if no articles found
- ✅ `safeoutputs___noop` ONLY if no English articles exist AND no analysis-only PR created
- ❌ NEVER exit without calling either `safeoutputs___create_pull_request` or `safeoutputs___noop`

## Error Handling

**If translation generator fails:**
1. Log the specific failure
2. Continue with remaining article types — partial translations are acceptable
3. If ALL types fail, create analysis-only PR with failure summary

**If PR creation fails AFTER generating translations:**
1. Retry `safeoutputs___create_pull_request` exactly **once**
2. If still fails: ❌ workflow MUST FAIL — do NOT try alternative ad-hoc git commands or API calls
3. The translations exist but no PR = readers can't see them = FAILURE
4. Do NOT attempt: ad-hoc branch creation, ad-hoc git reset, reflog recovery, or any other git tricks (the mandatory safety/cleanup steps above are the only permitted git commands)

**If no English articles found:**
- Create analysis-only PR or call `safeoutputs___noop`

**If MCP server unavailable:**
- Generator falls back to stdio mode — continue normally
