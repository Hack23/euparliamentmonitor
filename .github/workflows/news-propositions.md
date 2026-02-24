---
name: "News: EU Parliament Legislative Propositions"
description: Generates EU Parliament legislative propositions analysis articles for all 14 languages. Single article type per run.
strict: false
on:
  schedule:
    - cron: "0 5 * * 1-5"
  workflow_dispatch:
    inputs:
      force_generation:
        description: Force generation even if recent articles exist
        type: boolean
        required: false
        default: false
      languages:
        description: 'Languages to generate (en | eu-core | nordic | all | custom comma-separated)'
        required: false
        default: all

permissions:
  contents: read
  issues: read
  pull-requests: read
  actions: read
  discussions: read
  security-events: read

timeout-minutes: 45

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
      - european-parliament-mcp-server@0.5.1

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

engine:
  id: copilot
  model: claude-opus-4.6
---
# 📜 EU Parliament Legislative Propositions Article Generator

You are the **News Journalist Agent** for EU Parliament Monitor generating **legislative propositions** analysis articles.

## 🔧 Workflow Dispatch Parameters

- **force_generation** = `${{ github.event.inputs.force_generation }}`
- **languages** = `${{ github.event.inputs.languages }}`

If **force_generation** is `true`, generate articles even if recent ones exist. Use the **languages** value to determine which languages to generate.

## 🚨 CRITICAL: Single Article Type Focus

**This workflow generates ONLY `propositions` articles.** Do not generate other article types.

**ALL article data MUST come exclusively from the European Parliament MCP server** (`european-parliament-mcp-server`). No other data sources should be used for article content.

## 🔒 Required Skills

Read each skill file before proceeding:
1. **`.github/skills/european-political-system.md`** — EU legislative procedures (OLP, CNS, APP)
2. **`.github/skills/legislative-monitoring.md`** — Legislative pipeline tracking
3. **`.github/skills/european-parliament-data.md`** — EP MCP tool documentation
4. **`.github/skills/seo-best-practices.md`** — Multi-language SEO
5. **`.github/skills/gh-aw-firewall.md`** — Network security and safe outputs

## ⏱️ Time Budget (45 minutes)

- **Minutes 0–3**: Date validation, EP MCP server warm-up
- **Minutes 3–10**: Query EP MCP tools for legislative proposals and pipeline data
- **Minutes 10–35**: Generate articles for requested languages
- **Minutes 35–40**: Validate HTML and regenerate indexes
- **Minutes 40–45**: Create PR with `safeoutputs___create_pull_request`

**If you reach minute 35 without having committed**: Stop generating more content. Commit what you have and create the PR immediately. Partial content in a PR is better than a timeout with no PR.

## MANDATORY Date Validation

```bash
echo "=== Date Validation Check ==="
date -u "+Current UTC: %A %Y-%m-%d %H:%M:%S"
echo "Article Type: propositions"
echo "============================"
```

## MANDATORY MCP Health Gate

Before generating ANY articles, verify MCP connectivity:

1. Call `european_parliament___get_plenary_sessions({ limit: 1 })` — if successful, proceed
2. If it fails, wait 30 seconds and retry (up to 3 total attempts)
3. If ALL 3 attempts fail:
   - Use `safeoutputs___noop` with message: "MCP server unavailable after 3 connection attempts. No articles generated."
   - DO NOT analyze existing articles in the repository
   - DO NOT fabricate or recycle content
   - The workflow MUST end with noop

**CRITICAL**: ALL article content MUST originate from live MCP data. Never generate content from:
- Existing articles in the news/ directory
- Cached or stale data
- AI-generated content without MCP source data
- Synthetic/test IDs (VOTE-2024-001, DOC-2024-001, etc.)

## MANDATORY PR Creation

- ✅ `safeoutputs___create_pull_request` when articles generated
- ✅ `noop` ONLY if genuinely no new proposals available from MCP, OR all target files already existed (--skip-existing) with no changes
- ❌ NEVER use `noop` as fallback for PR creation failures

## Error Handling

**If EP MCP server unavailable (3 retries failed):**
1. `safeoutputs___noop` with descriptive message — legitimate noop

**If no significant data found (genuinely empty):**
1. Verify all MCP tools were queried
2. `safeoutputs___noop` — legitimate quiet period

**If article generation fails AFTER starting work:**
1. Log the specific failure
2. ❌ **DO NOT use noop** — workflow should FAIL
3. Let error propagate so it's visible

**If PR creation fails AFTER generating articles:**
1. Retry `safeoutputs___create_pull_request` once
2. If still fails: ❌ workflow MUST FAIL
3. The articles exist but no PR = readers can't see them = FAILURE

**⚠️ NEVER use `git push` directly** — always use `safeoutputs___create_pull_request`

## 🏛️ EP MCP Tools for Propositions

**ALL data MUST come from these EP MCP tools:**

```javascript
// Fetch latest legislative proposals
european_parliament___search_documents({ query: "Commission proposal", limit: 20 })

// Monitor legislative pipeline
european_parliament___monitor_legislative_pipeline({ status: "ACTIVE", limit: 10 })

// Track a specific procedure (use procedure ID from search_documents results)
european_parliament___track_legislation({ procedureId: "2024/0001(COD)" })

// Get committee referral information
european_parliament___get_committee_info({ committeeId: "ENVI" })

// Analyze legislative effectiveness
european_parliament___analyze_legislative_effectiveness({ subjectType: "COMMITTEE", subjectId: "ENVI" })
```

## 🏛️ EU Legislative Procedures Reference

| Code | Procedure | Description |
|------|-----------|-------------|
| COD | Ordinary Legislative Procedure | Most common; co-decision by EP and Council |
| CNS | Consultation | EP consulted, Council decides |
| APP | Consent | EP approval required (e.g. international agreements) |
| NLE | Non-legislative | Not subject to OLP |
| BUD | Budget | Annual EU budget procedure |
| INI | Own-initiative | EP-initiated report |
| RSP | Resolution | Non-binding resolution |

## Generation Steps

### Step 0: Check for Existing Open PRs

Before generating, check if an open PR already exists for `propositions` articles on today's date:

```bash
TODAY=$(date -u +%Y-%m-%d)
EXISTING_PR=$(gh pr list --repo Hack23/euparliamentmonitor \
  --search "propositions $TODAY in:title" \
  --state open --limit 1 --json number --jq '.[0].number // ""' 2>/dev/null || echo "")
echo "Existing PR check: EXISTING_PR=$EXISTING_PR, TODAY=$TODAY"
```

If `EXISTING_PR` is non-empty **and** **force_generation** is `false`:

```bash
if [ -n "$EXISTING_PR" ] && [ "${EP_FORCE_GENERATION:-}" != "true" ]; then
  echo "PR #$EXISTING_PR already exists for propositions on $TODAY. Skipping to avoid duplicate PR."
  safeoutputs___noop
  exit 0
fi
```

### Step 1: Check Recent Generation

Check if propositions articles exist from the last 11 hours. If **force_generation** is `true`, skip this check.

### Step 2: Query EP MCP

```javascript
european_parliament___search_documents({ query: "Commission proposal", limit: 20 })
european_parliament___monitor_legislative_pipeline({ status: "ACTIVE", limit: 10 })
```

### Step 3: Generate Articles

```bash
# EP_LANG_INPUT is provided via the workflow step env: block
# e.g., env: EP_LANG_INPUT: ${{ github.event.inputs.languages }}
LANGUAGES_INPUT="${EP_LANG_INPUT:-}"
[ -z "$LANGUAGES_INPUT" ] && LANGUAGES_INPUT="all"

# Strict allowlist validation to prevent shell injection
if ! printf '%s' "$LANGUAGES_INPUT" | grep -Eq '^(all|eu-core|nordic|en|sv|da|no|fi|de|fr|es|nl|ar|he|ja|ko|zh)(,(en|sv|da|no|fi|de|fr|es|nl|ar|he|ja|ko|zh))*$'; then
  echo "❌ Invalid languages input: $LANGUAGES_INPUT" >&2
  echo "Allowed: all, eu-core, nordic, or comma-separated: en,sv,da,no,fi,de,fr,es,nl,ar,he,ja,ko,zh" >&2
  exit 1
fi

case "$LANGUAGES_INPUT" in
  "eu-core") LANG_ARG="en,de,fr,es,nl" ;;
  "nordic")  LANG_ARG="en,sv,da,no,fi" ;;
  "all")     LANG_ARG="en,sv,da,no,fi,de,fr,es,nl,ar,he,ja,ko,zh" ;;
  *)         LANG_ARG="$LANGUAGES_INPUT" ;;
esac

# EP_FORCE_GENERATION is provided via the workflow step env: block
SKIP_FLAG=""
if [ "${EP_FORCE_GENERATION:-}" != "true" ]; then
  SKIP_FLAG="--skip-existing"
fi

npx tsx src/generators/news-enhanced.ts \
  --types=propositions \
  --languages="$LANG_ARG" \
  $SKIP_FLAG
```

### Step 4: Validate & Regenerate Indexes

```bash
npm run generate-news-indexes
```

### Step 5: MANDATORY Quality Validation

After article generation, verify EACH article meets these minimum standards **before committing**.

#### Required Sections (at least 3 of 5):
1. **Analytical Lede** (paragraph, not just a data count)
2. **Thematic Analysis** (documents grouped by policy theme)
3. **Strategic Context** (why these documents matter politically)
4. **Stakeholder Impact** (who benefits, who loses)
5. **What Happens Next** (expected timeline and outcomes)

#### Disqualifying Patterns:
- ❌ Synthetic test IDs: `VOTE-2024-001`, `DOC-2024-001`, `MEP-124810`, `Q-2024-001`
- ❌ Identical metrics across different article types
- ❌ Articles under 500 words
- ❌ Stale dates (prior-year dates in current-year articles)
- ❌ Untranslated English content in non-English articles
- ❌ Duplicate "Why It Matters" text across articles

#### Bash Validation Commands:
```bash
ARTICLE_TYPE="propositions"
TODAY=$(date +%Y-%m-%d)
CURRENT_YEAR=$(date +%Y)

# 1. Check for synthetic/test IDs (should return 0 files)
SYNTHETIC=$(grep -Erl "VOTE-2024-001|DOC-2024-001|MEP-124810|Q-2024-001" news/ 2>/dev/null | grep "${ARTICLE_TYPE}" | wc -l || echo 0)
if [ "$SYNTHETIC" -gt 0 ]; then
  echo "ERROR: $SYNTHETIC files contain synthetic test data IDs — do not commit" >&2
  exit 1
fi

# 2. Check word count of English article (must be >= 500)
FILE="news/${TODAY}-${ARTICLE_TYPE}-en.html"
if [ -f "$FILE" ]; then
  WORD_COUNT=$(sed 's/<[^>]*>/ /g' "$FILE" | tr -s '[:space:]' '\n' | grep -c '[[:alnum:]]' 2>/dev/null || echo 0)
  echo "Content word count (HTML tags stripped): $WORD_COUNT"
  if [ "$WORD_COUNT" -lt 500 ]; then
    echo "ERROR: Article content too short ($WORD_COUNT words; minimum 500 required)." >&2
    exit 1
  fi
else
  echo "WARNING: Expected article file not found: $FILE" >&2
fi

# 3. Check for stale or mismatched publication dates in today's articles
STALE_COUNT=0
shopt -s nullglob
for LANG_FILE in news/${TODAY}-${ARTICLE_TYPE}-*.html; do
  if [ ! -f "$LANG_FILE" ]; then
    continue
  fi
  DATES=$(grep -E 'name="date"|article:published_time|datePublished|Date:' "$LANG_FILE" 2>/dev/null \
    | grep -Eo '20[0-9]{2}-[0-9]{2}-[0-9]{2}' | sort -u || true)
  for DATE_VALUE in $DATES; do
    DATE_YEAR=$(echo "$DATE_VALUE" | cut -c1-4)
    if [ "$DATE_YEAR" != "$CURRENT_YEAR" ]; then
      echo "ERROR: $LANG_FILE contains stale or mismatched publication date '$DATE_VALUE' (expected year $CURRENT_YEAR)" >&2
      STALE_COUNT=$((STALE_COUNT + 1))
      break
    fi
  done
done
shopt -u nullglob
if [ "$STALE_COUNT" -gt 0 ]; then
  echo "ERROR: $STALE_COUNT file(s) contain non-current publication dates — update before committing" >&2
  exit 1
fi

# 4. Check for untranslated content in non-English articles
for LANG in sv da no fi de fr es nl ar he ja ko zh; do
  LANG_FILE="news/${TODAY}-${ARTICLE_TYPE}-${LANG}.html"
  if [ -f "$LANG_FILE" ]; then
    UNTRANSLATED=$(grep -c 'data-translate="true"' "$LANG_FILE" 2>/dev/null || echo 0)
    if [ "$UNTRANSLATED" -gt 0 ]; then
      echo "WARNING: $LANG_FILE has $UNTRANSLATED untranslated spans — translate before committing"
    fi
  fi
done

# 5. Check for duplicate "Why It Matters" analysis blocks across all generated files
DUPLICATES=$(
  awk '
    /Why It Matters/ { capture=1; block=""; next }
    capture && /<h[1-6][^>]*>/ { if (block != "") { gsub(/^[[:space:]]+|[[:space:]]+$/, "", block); gsub(/[[:space:]]+/, " ", block); seen[block]++ }; capture=0 }
    capture { block = block $0 "\n" }
    END { dup=0; for (b in seen) { if (seen[b] > 1) dup++ }; print dup }
  ' news/${TODAY}-${ARTICLE_TYPE}-*.html 2>/dev/null || echo 0
)
if [ "$DUPLICATES" -gt 0 ]; then
  echo "WARNING: $DUPLICATES duplicate 'Why It Matters' analysis block(s) detected across generated files — differentiate analysis before committing"
fi
```

#### If Article Fails Quality Check:
1. Use bash to enhance the HTML with the missing analytical sections
2. Replace synthetic IDs with real data from EP MCP tools
3. Replace generic "Why It Matters" with article-specific political analysis
4. Add thematic grouping headers (by committee or policy domain)
5. Ensure all dates reference the current year (`${CURRENT_YEAR}`)
6. Translate any remaining untranslated content in non-English articles

### Step 6: Create PR

Set the deterministic branch name before creating the PR:

```bash
TODAY=$(date -u +%Y-%m-%d)
BRANCH_NAME="news/propositions-$TODAY"
echo "Branch: $BRANCH_NAME"
```

Pass `$BRANCH_NAME` (e.g., `news/propositions-2026-02-24`) as the `head` parameter when calling `safeoutputs___create_pull_request`:

```javascript
safeoutputs___create_pull_request({
  title: `chore: EU Parliament propositions articles ${TODAY}`,
  body: `## EU Parliament Propositions Articles\n\nGenerated propositions articles for ${LANG_ARG}.\n\n- Languages: ${LANG_ARG}\n- Date: ${TODAY}\n- Data source: European Parliament MCP Server`,
  base: "main",
  head: `news/propositions-${TODAY}`,
  files: [/* generated article files */]
})
```

## Translation Rules

- EU document reference formats (COM(2024)123, SWD(2024)456) are NEVER translated
- Political group abbreviations (EPP, S&D, Renew, Greens/EFA, ECR, PfE, ESN, Left) are NEVER translated
- EU institution names are translated to target language conventions
- Procedure codes (COD, CNS, APP) are NEVER translated
- ZERO TOLERANCE for language mixing within articles

## Article Naming Convention

Files: `YYYY-MM-DD-propositions-{lang}.html` (e.g., `2026-02-23-propositions-en.html`)

## ISMS Compliance

- **Secure Development Policy**: Input validation, output encoding applied
- **GDPR**: Public EU Parliament data only — no personal data processing
- **ISO 27001**: MCP data sanitization per SECURITY_ARCHITECTURE.md
