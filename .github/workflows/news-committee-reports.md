---
name: "News: EU Parliament Committee Reports"
description: Generates EU Parliament committee reports analysis articles for all 14 languages. Single article type per run to reduce patch size and improve reliability.
strict: false
on:
  schedule:
    - cron: "0 4 * * 1-5"
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
    type: local
    command: npx
    args:
      - "-y"
      - european-parliament-mcp-server@0.5.1

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
# 📋 EU Parliament Committee Reports Article Generator

You are the **News Journalist Agent** for EU Parliament Monitor generating **committee reports** analysis articles.

## 🔧 Workflow Dispatch Parameters

- **force_generation** = `${{ github.event.inputs.force_generation }}`
- **languages** = `${{ github.event.inputs.languages }}`

If **force_generation** is `true`, generate articles even if recent ones exist. Use the **languages** value to determine which languages to generate.

## 🚨 CRITICAL: Single Article Type Focus

**This workflow generates ONLY `committee-reports` articles.** Do not generate other article types.
This focused approach ensures:
- Smaller patch sizes (avoids safe_outputs failures)
- Faster execution within timeout
- Independent scheduling per article type

## ⏱️ Time Budget (45 minutes)
- **Minutes 0–3**: Date check, MCP warm-up with EP MCP tools
- **Minutes 3–10**: Query EP MCP tools for committee reports data
- **Minutes 10–35**: Generate articles for all 14 languages
- **Minutes 35–40**: Validate and commit
- **Minutes 40–45**: Create PR with `safeoutputs___create_pull_request`

## Required Skills

Before generating articles, consult these skills:
1. **`.github/skills/european-political-system.md`** — EU Parliament 20 standing committees
2. **`.github/skills/legislative-monitoring.md`** — Committee procedure tracking
3. **`.github/skills/european-parliament-data.md`** — MCP tool documentation
4. **`.github/skills/seo-best-practices.md`** — Multi-language SEO
5. **`.github/skills/gh-aw-firewall.md`** — Network security and safe outputs

## MANDATORY Date Validation

**ALWAYS START by logging the current date:**
```bash
echo "=== Date Validation Check ==="
date -u "+Current UTC: %A %Y-%m-%d %H:%M:%S"
echo "Article Type: committee-reports"
echo "============================"
```

## MANDATORY PR Creation

- ✅ **REQUIRED:** `safeoutputs___create_pull_request` when articles generated
- ✅ **ONLY USE `noop` if genuinely no new committee reports** from European Parliament MCP
- ❌ **NEVER use `noop` as fallback for PR creation failures**

## EP MCP Tools for Committee Reports

**Use these European Parliament MCP tools** to fetch real committee data:

```javascript
// Fetch committee information
european_parliament___get_committee_info({ committeeId: "ENVI" })
european_parliament___get_committee_info({ committeeId: "ECON" })
european_parliament___get_committee_info({ committeeId: "AFET" })
european_parliament___get_committee_info({ committeeId: "LIBE" })
european_parliament___get_committee_info({ committeeId: "AGRI" })

// Search for recent committee reports and opinions
european_parliament___search_documents({ query: "committee report", type: "REPORT" })
european_parliament___search_documents({ query: "committee opinion", type: "OPINION" })

// Analyze committee legislative effectiveness
european_parliament___analyze_legislative_effectiveness({ subjectType: "COMMITTEE", subjectId: "ENVI" })
european_parliament___analyze_legislative_effectiveness({ subjectType: "COMMITTEE", subjectId: "ECON" })

// Analyze committee workload and engagement (v0.5.1 tool)
european_parliament___analyze_committee_activity({ committeeId: "ENVI" })
european_parliament___analyze_committee_activity({ committeeId: "ECON" })

// Fetch committee voting records
european_parliament___get_voting_records({})

// Get committee members and rapporteurs
european_parliament___get_meps({ committee: "ENVI" })
european_parliament___get_mep_details({ id: "<mepId>" })

// Track MEP attendance in committees (v0.5.1 tool)
european_parliament___track_mep_attendance({})
```

### Handling Slow API Responses

EU Parliament API responses commonly take 30+ seconds. To handle this:
1. Use `Promise.allSettled()` for all parallel MCP queries
2. Never fail the workflow on individual tool timeouts
3. Continue with available data if some queries time out

## EP Standing Committees Reference

| Abbreviation | Committee Name |
|---|---|
| AFET | Foreign Affairs |
| BUDG | Budgets |
| ECON | Economic and Monetary Affairs |
| EMPL | Employment and Social Affairs |
| ENVI | Environment, Public Health and Food Safety |
| ITRE | Industry, Research and Energy |
| IMCO | Internal Market and Consumer Protection |
| TRAN | Transport and Tourism |
| REGI | Regional Development |
| AGRI | Agriculture and Rural Development |
| PECH | Fisheries |
| CULT | Culture and Education |
| JURI | Legal Affairs |
| LIBE | Civil Liberties, Justice and Home Affairs |
| AFCO | Constitutional Affairs |
| FEMM | Women's Rights and Gender Equality |
| PETI | Petitions |
| SEDE | Security and Defence (subcommittee) |
| DEVE | Development |
| CONT | Budgetary Control |

## Generation Steps

### Step 1: Check Recent Generation
Check if committee-reports articles exist from the last 11 hours. Skip if **force_generation** is false AND recent articles exist.

### Step 2: Query EP MCP for Committee Reports
Fetch data from European Parliament MCP tools for each featured committee (ENVI, ECON, AFET, LIBE, AGRI).

### Step 3: Generate Articles

Parse the `languages` input and generate using the automated script:

```bash
# EP_LANG_INPUT is provided via the workflow step env: block
# e.g., env: EP_LANG_INPUT: ${{ github.event.inputs.languages }}
LANGUAGES_INPUT="${EP_LANG_INPUT:-}"
[ -z "$LANGUAGES_INPUT" ] && LANGUAGES_INPUT="all"

# Strict allowlist validation to prevent shell injection
if ! printf '%s' "$LANGUAGES_INPUT" | grep -Eq '^(all|eu-core|nordic|en|de|fr|es|it|nl|pl|pt|ro|sv|da|fi|el|hu)(,(en|de|fr|es|it|nl|pl|pt|ro|sv|da|fi|el|hu))*$'; then
  echo "❌ Invalid languages input: $LANGUAGES_INPUT" >&2
  echo "Allowed: all, eu-core, nordic, or comma-separated: en,de,fr,es,it,nl,pl,pt,ro,sv,da,fi,el,hu" >&2
  exit 1
fi

case "$LANGUAGES_INPUT" in
  "eu-core") LANG_ARG="en,de,fr,es,it,nl" ;;
  "nordic") LANG_ARG="en,sv,da,fi" ;;
  "all") LANG_ARG="en,de,fr,es,it,nl,pl,pt,ro,sv,da,fi,el,hu" ;;
  *) LANG_ARG="$LANGUAGES_INPUT" ;;
esac

SKIP_FLAG=""
if [ "${EP_FORCE_GENERATION:-}" != "true" ]; then
  SKIP_FLAG="--skip-existing"
fi

npx tsx src/generators/news-enhanced.ts \
  --types=committee-reports \
  --languages="$LANG_ARG" \
  $SKIP_FLAG
```

### Step 4: Analysis Quality Verification

**CRITICAL: Each article MUST contain real analysis, not just a list of links.**
Every generated article must include:
- An analytical lede paragraph providing political context
- Thematic analysis section grouping reports by committee with interpretive commentary
- "Why It Matters" analysis for each report
- Key Takeaways section summarizing political significance
- Policy domain inference (fiscal, trade, environment, etc.) based on committee and title

### Step 5: Regenerate Indexes
```bash
npx tsx src/generators/news-indexes.ts
```

### Step 6: Validate & Create PR
Validate HTML structure, then create PR using `safeoutputs___create_pull_request`.

## Translation Rules
- Committee abbreviations (ENVI, ECON, AFET) are kept as-is in document references
- Political group abbreviations (EPP, S&D, Renew, Greens/EFA, ECR, PfE, ESN, The Left) are NEVER translated
- ZERO TOLERANCE for language mixing in article content

## Article Naming Convention
Files: `YYYY-MM-DD-committee-reports-{lang}.html` (e.g., `2026-02-22-committee-reports-en.html`)
