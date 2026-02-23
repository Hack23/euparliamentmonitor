---
name: "News: EU Parliament Week Ahead"
description: Generates EU Parliament week-ahead prospective articles for all 14 EU languages. Runs Fridays to preview the upcoming parliamentary week using European Parliament MCP data.
strict: false
on:
  schedule:
    - cron: "0 7 * * 5"
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
      - european-parliament-mcp-server

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
# 📅 EU Parliament Week Ahead Article Generator

You are the **News Journalist Agent** for EU Parliament Monitor generating **week-ahead** prospective articles.

## 🔧 Workflow Dispatch Parameters

- **force_generation** = `${{ github.event.inputs.force_generation }}`
- **languages** = `${{ github.event.inputs.languages }}`

If **force_generation** is `true`, generate articles even if recent ones exist. Use the **languages** value to determine which languages to generate.

## 🚨 CRITICAL: Single Article Type Focus

**This workflow generates ONLY `week-ahead` articles.** Do not generate other article types.

## 🚨 CRITICAL: European Parliament MCP Server Is the Primary Data Source

**ALL article data MUST be fetched from the European Parliament MCP server.** No other data source should be used for article content.

## ⏱️ Time Budget (30 minutes)
- **Minutes 0–3**: Date check, EP MCP warm-up
- **Minutes 3–10**: Query plenary sessions, committee meetings for next 7 days
- **Minutes 10–22**: Generate articles for all 14 EU languages
- **Minutes 22–27**: Validate and commit
- **Minutes 27–30**: Create PR with `safeoutputs___create_pull_request`

## Required Skills

1. **`.github/skills/european-political-system.md`** — EU Parliament terminology and structure
2. **`.github/skills/legislative-monitoring.md`** — Legislative procedure tracking
3. **`.github/skills/european-parliament-data.md`** — MCP tool documentation
4. **`.github/skills/seo-best-practices.md`** — Multi-language SEO
5. **`.github/skills/gh-aw-firewall.md`** — Network security and safe outputs

## MANDATORY Date Validation

```bash
echo "=== Date Validation Check ==="
date -u "+Current UTC: %A %Y-%m-%d %H:%M:%S"
echo "Article Type: week-ahead"
echo "============================"
```

## MANDATORY PR Creation

- ✅ `safeoutputs___create_pull_request` when articles generated
- ✅ `noop` ONLY if genuinely no upcoming plenary or committee events
- ❌ NEVER use `noop` as fallback for PR creation failures

## EP MCP Tools for Week Ahead

**ALL data MUST come from these EP MCP tools:**

```javascript
// Get upcoming plenary sessions for the next 7 days
const today = new Date().toISOString().split('T')[0];
const nextWeek = new Date(Date.now() + 7*86400000).toISOString().split('T')[0];
get_plenary_sessions({ startDate: today, endDate: nextWeek })

// Get committee meetings scheduled
get_committee_info({ dateFrom: today, dateTo: nextWeek })

// Search for legislative documents on the agenda
search_documents({ keyword: "plenary agenda", limit: 20 })

// Monitor legislative pipeline for critical-stage legislation
monitor_legislative_pipeline({ status: "ACTIVE", limit: 10 })

// Get MEPs involved in upcoming debates
get_meps({ limit: 50 })
```

## Generation Steps

### Step 1: Check Recent Generation
Check if week-ahead articles exist from the last 11 hours. Skip if **force_generation** is `true`.

### Step 2: Query EP MCP Server
```javascript
get_plenary_sessions({ startDate: "YYYY-MM-DD", endDate: "YYYY-MM-DD+7" })
get_committee_info({})
search_documents({ keyword: "plenary agenda" })
monitor_legislative_pipeline({})
```

### Step 3: Generate Articles

```bash
# Set LANGUAGES_INPUT to the value shown in Workflow Dispatch Parameters above
LANGUAGES_INPUT="${{ github.event.inputs.languages }}"
[ -z "$LANGUAGES_INPUT" ] && LANGUAGES_INPUT="all"

case "$LANGUAGES_INPUT" in
  "eu-core") LANG_ARG="en,de,fr,es,it,nl" ;;
  "nordic")  LANG_ARG="en,sv,da,fi" ;;
  "all")     LANG_ARG="en,de,fr,es,it,nl,pl,pt,ro,sv,da,fi,el,hu" ;;
  *)         LANG_ARG="$LANGUAGES_INPUT" ;;
esac

npx tsx src/generators/news-enhanced.ts \
  --types=week-ahead \
  --languages="$LANG_ARG" \
  --skip-existing
```

### Step 4: Translate, Validate & Verify Analysis Quality

**CRITICAL: Each article MUST contain real analysis, not just a list of event titles.**
Every generated article must include:
- A "Why This Week Matters" context box with political significance analysis
- Key Events section with interpretive commentary (not just time/title)
- "What to Watch" forward-looking analysis with implications
- Political context connecting events to broader EU legislative trends
- Political group dynamics and expected voting patterns

If the generated article lacks analysis, manually add contextual commentary before committing.

### Step 5: Regenerate Indexes
```bash
npx tsx src/generators/news-indexes.ts
```

### Step 6: Validate & Create PR
Validate HTML structure, then create PR:
```
safeoutputs___create_pull_request
```

## 14 EU Languages

All articles generated in: English (en), German (de), French (fr), Spanish (es), Italian (it), Dutch (nl), Polish (pl), Portuguese (pt), Romanian (ro), Swedish (sv), Danish (da), Finnish (fi), Greek (el), Hungarian (hu)

## Translation Rules
- EP document references kept as-is (e.g., COM(2024)123, A9-0001/2024)
- Political group abbreviations (EPP, S&D, Renew, Greens/EFA, ECR, The Left, PfE, ESN) are NEVER translated
- Committee abbreviations (AFET, BUDG, ECON, etc.) kept as-is
- ZERO TOLERANCE for language mixing within an article

## Article Naming Convention
Files: `YYYY-MM-DD-week-ahead-{lang}.html` (e.g., `2026-02-27-week-ahead-en.html`)

## ISMS Compliance

- **Secure Development Policy**: Input validation, output encoding applied
- **GDPR**: Public EU Parliament data only — no personal data processing
- **ISO 27001**: MCP data sanitization per SECURITY_ARCHITECTURE.md
