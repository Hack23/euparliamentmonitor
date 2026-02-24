---
name: "News: EU Parliament Motions"
description: Generates EU Parliament motions and resolutions analysis articles for all 14 languages. Single article type per run.
strict: false
on:
  schedule:
    - cron: "0 6 * * 1-5"
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
# 🗳️ EU Parliament Motions Article Generator

You are the **News Journalist Agent** for EU Parliament Monitor generating **EU Parliament motions and resolutions** analysis articles.

## 🔧 Workflow Dispatch Parameters

- **force_generation** = `${{ github.event.inputs.force_generation }}`
- **languages** = `${{ github.event.inputs.languages }}`

If **force_generation** is `true`, generate articles even if recent ones exist. Use the **languages** value to determine which languages to generate.

## 🚨 CRITICAL: Single Article Type Focus

**This workflow generates ONLY `motions` articles.** Do not generate other article types.

## 🚨 CRITICAL: European Parliament MCP Server Is the Primary Data Source

**ALL article data MUST be fetched from the European Parliament MCP server.** No other data source should be used for article content.

## ⏱️ Time Budget (45 minutes)
- **Minutes 0–3**: Date validation, MCP warm-up
- **Minutes 3–12**: Query EP MCP tools for motions data (parallel where possible)
- **Minutes 12–35**: Generate articles for requested languages
- **Minutes 35–40**: Validate HTML and commit
- **Minutes 40–45**: Create PR with `safeoutputs___create_pull_request`

## Required Skills

1. **`.github/skills/european-political-system.md`** — EU Parliament political groups and dynamics
2. **`.github/skills/legislative-monitoring.md`** — Motion and resolution procedures
3. **`.github/skills/european-parliament-data.md`** — EP MCP tool documentation
4. **`.github/skills/political-science-analysis.md`** — Political analysis frameworks
5. **`.github/skills/gh-aw-firewall.md`** — Network security and safe outputs

## MANDATORY Date Validation

```bash
echo "=== Date Validation Check ==="
date -u "+Current UTC: %A %Y-%m-%d %H:%M:%S"
echo "Article Type: motions"
echo "============================"
```

## MANDATORY PR Creation

- ✅ `safeoutputs___create_pull_request` when articles generated
- ✅ `noop` ONLY if genuinely no new motions
- ❌ NEVER use `noop` as fallback for PR creation failures

## EP MCP Tools for Motions

Use the following EP MCP tools to gather data for motions analysis. **All data MUST come from these tools.**

```javascript
// Primary motions data
european_parliament___search_documents({ query: "motion for resolution", limit: 20 })

// Parliamentary questions and interpellations
european_parliament___get_parliamentary_questions({ limit: 10 })

// OSINT: Voting anomalies on motions
european_parliament___detect_voting_anomalies({})

// OSINT: Political group alignment on motions
european_parliament___analyze_coalition_dynamics({})

// OSINT: Group positions comparison
european_parliament___compare_political_groups({ groupIds: ["EPP", "S&D", "Renew", "Greens/EFA", "ECR", "The Left", "PfE", "ESN"] })

// Voting records on motions
european_parliament___get_voting_records({ topic: "resolution", limit: 20 })

// OSINT: Key MEP influence (call per influential MEP identified)
european_parliament___assess_mep_influence({ mepId: "<mepId>" })

// OSINT: Country delegation analysis (v0.5.1 tool)
european_parliament___analyze_country_delegation({ country: "<countryCode>" })

// Parliament-wide landscape for context (v0.5.1 tool)
european_parliament___generate_political_landscape({})
```

### Handling Slow API Responses

EU Parliament API responses commonly take 30+ seconds. To handle this:
1. Use `Promise.allSettled()` for all parallel MCP queries
2. Never fail the workflow on individual tool timeouts
3. Continue with available data if some queries time out
4. Log warnings for failed queries but generate articles with whatever data is available

## Generation Steps

### Step 0: Check for Existing Open PRs

Before generating, check if an open PR already exists for `motions` articles on today's date:

```bash
TODAY=$(date -u +%Y-%m-%d)
EXISTING_PR=$(gh pr list --repo Hack23/euparliamentmonitor \
  --search "motions $TODAY in:title" \
  --state open --json number --jq '.[0].number' 2>/dev/null || echo "")
echo "Existing PR check: EXISTING_PR=$EXISTING_PR, TODAY=$TODAY"
```

If `EXISTING_PR` is non-empty **and** **force_generation** is `false`:

```bash
if [ -n "$EXISTING_PR" ] && [ "${EP_FORCE_GENERATION:-}" != "true" ]; then
  echo "PR #$EXISTING_PR already exists for motions on $TODAY. Skipping to avoid duplicate PR."
  safeoutputs___noop
  exit 0
fi
```

### Step 1: Check Recent Generation

Check if motions articles exist from the last 11 hours. If **force_generation** is `true`, skip this check.

### Step 2: Query EP MCP Tools

Fetch all required data from the European Parliament MCP server:

```javascript
// Fetch in parallel for efficiency
european_parliament___search_documents({ query: "motion for resolution", limit: 20 })
european_parliament___get_parliamentary_questions({ limit: 10 })
european_parliament___detect_voting_anomalies({})
european_parliament___analyze_coalition_dynamics({})
european_parliament___get_voting_records({ topic: "resolution", limit: 20 })
european_parliament___compare_political_groups({ groupIds: ["EPP", "S&D", "Renew", "Greens/EFA", "ECR"] })
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

SKIP_FLAG=""
if [ "${EP_FORCE_GENERATION:-}" != "true" ]; then
  SKIP_FLAG="--skip-existing"
fi

npx tsx src/generators/news-enhanced.ts \
  --types=motions \
  --languages="$LANG_ARG" \
  $SKIP_FLAG
```

### Step 4: Validate & Regenerate Indexes

```bash
npx tsx src/generators/news-indexes.ts
```

### Step 5: Create PR

Set the deterministic branch name before creating the PR:

```bash
TODAY=$(date -u +%Y-%m-%d)
BRANCH_NAME="news/motions-$TODAY"
echo "Branch: $BRANCH_NAME"
```

Pass `$BRANCH_NAME` (e.g., `news/motions-2026-02-24`) as the branch argument to `safeoutputs___create_pull_request`:

```
safeoutputs___create_pull_request
```

## Analysis Quality Requirements

**CRITICAL: Each article MUST contain real analysis, not just a list of data points.**

Every generated article must include:
- An analytical lede paragraph about political dynamics and legislative trends (not just a motion count)
- Voting Records section with motion titles, vote counts (for/against/abstain), and outcomes
- Party Cohesion Analysis showing group discipline across EPP, S&D, Renew, Greens/EFA, ECR, The Left, PfE, ESN
- Detected Voting Anomalies with context on why defections or unusual patterns occurred
- Parliamentary Questions section with MEP author, topic, and status
- "Why It Matters" analysis for key motions with policy domain context
- Coalition Dynamics section showing cross-party alliances and opposition patterns

## EP Motion Types Reference

| Motion Type | Description |
|-------------|-------------|
| Motion for Resolution | Standard parliamentary resolution on policy matters |
| Joint Motion for Resolution | Cross-party resolution signed by multiple groups |
| Written Question | MEP question requiring written answer from Commission/Council |
| Oral Question | Question answered orally during plenary session |
| Priority Question | Urgent question for immediate plenary response |
| Interpellation | Formal question with debate requiring Commission/Council response |

## Political Groups Reference

| Abbreviation | Full Name |
|--------------|-----------|
| EPP | European People's Party |
| S&D | Progressive Alliance of Socialists and Democrats |
| Renew | Renew Europe |
| Greens/EFA | Greens–European Free Alliance |
| ECR | European Conservatives and Reformists |
| The Left | The Left in the European Parliament (GUE/NGL) |
| PfE | Patriots for Europe |
| ESN | Europe of Sovereign Nations |
| NI | Non-Inscrits (Non-attached Members) |

## Translation Rules

- Motion reference numbers (e.g., `B10-0001/2025`, `RC-B10-0001/2025`) are NEVER translated
- Political group abbreviations (EPP, S&D, Renew, etc.) are NEVER translated
- MEP names are NEVER translated
- Vote counts and percentages are locale-formatted but numerically identical
- All article body text MUST be in the target language
- ZERO TOLERANCE for language mixing within a single article

## Article Naming Convention

Files: `YYYY-MM-DD-motions-{lang}.html` (e.g., `2026-02-23-motions-en.html`)

## ISMS Compliance

- **Secure Development Policy**: Input validation, output encoding applied
- **GDPR**: Public EU Parliament data only — no personal data processing
- **ISO 27001**: MCP data sanitization per SECURITY_ARCHITECTURE.md
