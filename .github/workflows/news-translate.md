---
name: "News: Translate Articles"
description: Translates English EU Parliament news articles to 13 other languages. Runs after content workflows generate English articles, ensuring high-quality translations with full linguistic fidelity.
strict: false
on:
  schedule:
    # Run 3x daily on weekdays to pick up new English articles
    # Offset from content workflows: committee-reports(04), propositions(05), motions(06), week-ahead(Fri 07)
    - cron: "0 9,12,15 * * 1-5"
    # Saturday for weekly review translations
    - cron: "0 12 * * 6"
    # 1st and 28th for monthly article translations
    - cron: "0 12 1,28 * *"
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
        default: false

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
      - european-parliament-mcp-server@1.1.9
    env:
      EP_REQUEST_TIMEOUT_MS: "30000"

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
# 🌐 EU Parliament News Article Translation Workflow

You are the **Translation Agent** for EU Parliament Monitor. Your job is to take **existing English articles** and produce **high-quality translations** in 13 other languages.

## 🚫 MANDATORY Scope Restriction

> **⚠️ CRITICAL — READ FIRST**: This workflow ONLY creates translated article files in the `news/` directory. You MUST NOT modify any other files.

**ALLOWED modifications:**
- ✅ Create new `news/*.html` translation files (non-English only)
- ✅ Read existing `news/*-en.html` English source articles

**FORBIDDEN modifications (will cause patch conflicts and workflow failure):**
- ❌ `news/*-en.html` — NEVER modify English source articles (read-only)
- ❌ `src/` — NEVER modify TypeScript source files
- ❌ `scripts/` — NEVER modify JavaScript build output files
- ❌ `test/` — NEVER modify test files
- ❌ `e2e/` — NEVER modify E2E test files
- ❌ `.github/` — NEVER modify workflow or configuration files
- ❌ `index*.html` — NEVER modify index pages
- ❌ `package.json` / `package-lock.json` — NEVER modify dependency files

**If you encounter build errors, test failures, or source code bugs:**
- ❌ DO NOT attempt to fix them — that is outside this workflow's scope
- ✅ Log the error and continue with translation
- ✅ The translation generator handles all code logic; your job is to RUN it, not FIX it

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
- **Confidence indicators**: Preserve 🟢/🟡/🔴 confidence markers exactly as in the source
- **Scenario labels**: Translate scenario names meaningfully (e.g., "likely" = "probable" in target language, NOT "possible")
- **Technical terms**: Use EP official terminology in each target language (not ad-hoc translations)
- **Coalition dynamics**: Preserve all references to political group interactions and voting patterns
- **Cultural adaptation**: Adapt examples for local context where helpful, but never at the expense of analytical accuracy

## ⏱️ Time Budget (90 minutes)

- **Minutes 0–3**: Date validation, discover English articles that need translation
- **Minutes 3–8**: Set up MCP gateway, validate environment
- **Minutes 8–80**: Translate articles using the TypeScript generator
- **Minutes 80–85**: Validate translated HTML files
- **Minutes 85–90**: Create PR with `safeoutputs___create_pull_request`

> **🔑 TRANSLATION-ONLY FOCUS**: This workflow does NOT generate new content. It reads existing English articles and produces faithful translations. Use the full time budget to ensure every translation is linguistically excellent.

**If you reach minute 80 and the PR has not yet been created**: Stop translating. Finalize current file edits and immediately create the PR. Partial translations in a PR are better than a timeout with no PR.
