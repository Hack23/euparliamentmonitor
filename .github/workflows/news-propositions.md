---
name: "News: EU Parliament Legislative Propositions"
description: Generates EU Parliament legislative propositions analysis articles for all 14 EU languages. Single article type per run.
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
        description: 'Languages to generate (en,de,fr | eu-core | nordic | all)'
        required: false
        default: all

permissions:
  contents: read
  issues: read
  pull-requests: read
  actions: read
  discussions: read
  security-events: read

timeout-minutes: 30

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
      - european-parliament-mcp-server@0.4.0

tools:
  github:
    toolsets:
      - all
  bash: true

safe-outputs:
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

## ⏱️ Time Budget (30 minutes)

- **Minutes 0–3**: Date validation, EP MCP server warm-up
- **Minutes 3–10**: Query EP MCP tools for legislative proposals and pipeline data
- **Minutes 10–22**: Generate articles for requested languages
- **Minutes 22–27**: Validate HTML and regenerate indexes
- **Minutes 27–30**: Create PR with `safeoutputs___create_pull_request`

## MANDATORY Date Validation

```bash
echo "=== Date Validation Check ==="
date -u "+Current UTC: %A %Y-%m-%d %H:%M:%S"
echo "Article Type: propositions"
echo "============================"
```

## MANDATORY PR Creation

- ✅ `safeoutputs___create_pull_request` when articles generated
- ✅ `noop` ONLY if genuinely no new proposals available from MCP
- ❌ NEVER use `noop` as fallback for PR creation failures

## 🏛️ EP MCP Tools for Propositions

**ALL data MUST come from these EP MCP tools:**

```javascript
// Fetch latest legislative proposals
search_documents({ query: "Commission proposal", limit: 20 })

// Monitor legislative pipeline
monitor_legislative_pipeline({ status: "ACTIVE", limit: 10 })

// Track a specific procedure (use procedure ID from search_documents results)
track_legislation({ procedureId: "2024/0001(COD)" })

// Get committee referral information
get_committee_info({ committeeId: "ENVI" })

// Analyze legislative effectiveness
analyze_legislative_effectiveness({ subjectType: "COMMITTEE", subjectId: "ENVI" })
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

### Step 1: Check Recent Generation

Check if propositions articles exist from the last 11 hours. If **force_generation** is `true`, skip this check.

### Step 2: Query EP MCP

```javascript
// Warm up and fetch proposals
search_documents({ query: "Commission proposal", limit: 20 })
monitor_legislative_pipeline({ status: "ACTIVE", limit: 10 })
```

### Step 3: Generate Articles

```bash
# Set LANGUAGES_INPUT to the value shown in Workflow Dispatch Parameters above
LANGUAGES_INPUT="${{ github.event.inputs.languages }}"
[ -z "$LANGUAGES_INPUT" ] && LANGUAGES_INPUT="all"

# Validate input against known safe values to prevent shell injection
case "$LANGUAGES_INPUT" in
  "eu-core") LANG_ARG="en,de,fr,es,it,nl" ;;
  "nordic")  LANG_ARG="en,sv,da,fi" ;;
  "all")     LANG_ARG="en,de,fr,es,it,pt,nl,el,pl,ro,sv,da,fi,hu" ;;
  *)
    # Strict whitelist: only allow comma-separated 2-letter language codes
    if echo "$LANGUAGES_INPUT" | grep -qE '^[a-z]{2}(,[a-z]{2})*$'; then
      LANG_ARG="$LANGUAGES_INPUT"
    else
      echo "❌ Invalid languages input: '$LANGUAGES_INPUT' (must be preset or comma-separated 2-letter codes)"
      exit 1
    fi
    ;;
esac

# Respect force_generation: skip existing articles unless force is true
FORCE_GENERATION="${{ github.event.inputs.force_generation }}"
[ -z "$FORCE_GENERATION" ] && FORCE_GENERATION="false"

SKIP_FLAG="--skip-existing"
if [ "$FORCE_GENERATION" = "true" ]; then
  SKIP_FLAG=""
fi

npx tsx src/generators/news-enhanced.ts \
  --types=propositions \
  --languages="$LANG_ARG" \
  ${SKIP_FLAG}
```

### Step 4: Validate & Regenerate Indexes

```bash
npx tsx src/generators/generate-news-indexes.ts
```

### Step 5: Analysis Quality Check

**CRITICAL: Each article MUST contain real analysis, not just a list of links.**

Every generated article must include:
- An analytical lede paragraph about the EU's current legislative agenda
- Legislative pipeline status section showing where proposals stand in the OLP
- "Why It Matters" analysis per proposal with policy domain context
- Inter-institutional dynamics section (EP committees, Council positions)
- Policy implications assessment

If the generated article lacks these analytical sections, manually add contextual analysis before committing.

## Translation Rules

- EU document reference formats (COM(2024)123, SWD(2024)456) are NEVER translated
- Political group abbreviations (EPP, S&D, Renew, Greens/EFA, ECR, PfE, ESN, Left) are NEVER translated
- EU institution names are translated to target language conventions
- Procedure codes (COD, CNS, APP) are NEVER translated
- ZERO TOLERANCE for language mixing within articles

## Article Naming Convention

Files: `YYYY-MM-DD-propositions-{lang}.html`

## ISMS Compliance

- **Secure Development Policy**: Input validation, output encoding applied
- **GDPR**: Public EU Parliament data only — no personal data processing
- **ISO 27001**: MCP data sanitization per SECURITY_ARCHITECTURE.md
