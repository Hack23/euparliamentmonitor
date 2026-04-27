---
name: "News: Translate Articles"
description: Translates English EU Parliament news articles to 13 other languages. Runs after content workflows generate English articles, ensuring high-quality translations with full linguistic fidelity.
strict: false
on:
  # Manual trigger ONLY. The cron schedule was removed because scheduled runs
  # were wasting AI budget and hitting rate limits — user explicitly requires
  # manual invocation. GitHub Actions runs the compiled `news-translate.lock.yml`
  # (the `.md` source is ignored by the runner), so invoke via
  # `gh workflow run "News: Translate Articles"` or `gh workflow run news-translate.lock.yml`,
  # or use the "Run workflow" button in the Actions UI.
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

timeout-minutes: 45

features:
  mcp-gateway: true

sandbox:
  agent: awf
  mcp:
    port: 8080
    # `keepalive-interval` (seconds) for HTTP MCP backends — see upstream
    # reference/mcp-gateway.md §4.1.3.5. Gateway default is 1500 (25 min);
    # we override to 300 so the gateway pings each backend every 5 minutes.
    # This keeps backend HTTP sessions warm during the 45-minute multi-call
    # flush window without triggering EP-side rate limits.
    keepalive-interval: 300

imports:
  - shared/mcp/news-mcp-servers.md

concurrency:
  job-discriminator: translate-${{ github.event.inputs.article_date || 'manual' }}

runtimes:
  node:
    version: "25"

# Network allowlist — uses ecosystem identifiers where possible (per
# upstream docs/reference/network.md §"Ecosystem Identifiers"):
#   - `defaults` — basic infrastructure (certs, JSON schema, package mirrors)
#   - `github`   — all GitHub domains (replaces explicit github.com/api.github.com)
#   - `node`     — npm/npx ecosystem (needed for MCP server boot via npx)
network:
  allowed:
    - defaults
    - github
    - node
    - data.europarl.europa.eu
    - dataservices.imf.org
    - api.worldbank.org
    - "*.europa.eu"
    - hack23.com
    - www.hack23.com
    - riksdagsmonitor.com
    - www.riksdagsmonitor.com
    - euparliamentmonitor.com
    - www.euparliamentmonitor.com

tools:
  timeout: 300            # per-tool-call cap
  startup-timeout: 90     # MCP server boot (npx package install)
  github:
    toolsets:
      - all
  bash: true
  edit:                   # explicit file-edit tool for translation files
  web-fetch:              # fallback fetch for source EP pages
  agentic-workflows: true
  # Cache memory — restores partial translations across runs so a failed
  # safeoutputs flush does not lose 10+ minutes of translation work.
  # Per reference/cache-memory.md, the compiler injects restore + save steps.
  cache-memory:
    key: news-translate-${{ github.repository_owner }}
    retention-days: 7
    allowed-extensions: [".md", ".json", ".jsonl", ".txt", ".html"]
  repo-memory:
    branch-name: memory/news-generation
    allowed-extensions: [".md", ".json"]
    max-file-size: 51200
    max-file-count: 50
    max-patch-size: 51200

safe-outputs:
  # This workflow translates 1 English article into 13 languages per run
  # (plus manual runs may cover 2+ article types). Each translated HTML is
  # typically 20–40 KB, so a full run patch is commonly 500 KB–2 MB once
  # analysis artifacts are included. The gh-aw default of 1024 KB is too
  # small: run 156 (24635614642) had all 26 translations completed by the
  # agent but safeoutputs rejected the PR with
  #   "Patch size (1084 KB) exceeds maximum allowed size (1024 KB)"
  # causing total data loss. Raising to 10 MB gives ample headroom while
  # still protecting against runaway patches.
  max-patch-size: 10240
  allowed-domains:
    - github                         # ecosystem: github.com + api.github.com (least-privilege; PR creation only)
    - data.europarl.europa.eu
    - www.europarl.europa.eu
    - hack23.com
    - www.hack23.com
    - riksdagsmonitor.com
    - www.riksdagsmonitor.com
    - euparliamentmonitor.com
    - www.euparliamentmonitor.com
  create-pull-request:
    # The translation workflow follows a "first productive flush" pattern
    # (see prompt "🚫 NEVER CREATE A ZERO-TRANSLATION PR" section): there is
    # NO checkpoint/baseline call at minute ~2. The first safeoutputs call
    # is intentionally deferred until at least 3 real translations are
    # complete and HTMLHint-clean (typically minute ~12–18). After that
    # first flush, the workflow flushes again every additional 3 translated
    # files, plus a final call with the quality-scored title and body. For a
    # single article type this is ~5 calls (1 first flush after 3
    # translations + 3 more periodic flushes to cover 13 languages + 1
    # final); `max: 10` is the gh-aw schema maximum and provides comfortable
    # headroom. Without `max` set here, gh-aw defaults to 1, which silently
    # rejects every flush after the first and causes total translation loss
    # (see PR #1346 / run 188 `agent_output.json` — 5× "Too many items of
    # type 'create_pull_request'. Maximum allowed: 1."). All flushes target
    # the same branch `news/translate-${DATE}`, so raising `max` does NOT
    # create multiple PRs — it just lets the single PR's patch be refreshed
    # as translations land.
    max: 10
    title-prefix: "[news] "
    labels: [agentic-news, analysis-data]
    draft: false
    expires: 14d
    allowed-base-branches: ["main"]
    excluded-files:
      - "analysis/daily/**/data/**"
      - ".github/**"
      - "**/*.lock"
      - "node_modules/**"
    # Resilience knobs (per upstream reference/safe-outputs-pull-requests.md):
    if-no-changes: warn              # zero-translation flushes warn instead of erroring
    fallback-as-issue: true          # if PR creation blocked, open issue link
    auto-close-issue: false          # not issue-triggered — never auto-close
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
  model: claude-opus-4.7
  # max-continuations: 3 enables autopilot mode (--autopilot --max-autopilot-continues 3
  # in the compiled lock) so the agent can restart up to 3 times. Translate needs
  # multiple passes to cover all 14 languages within the single job budget.
  max-continuations: 3
---
# 🌐 EU Parliament News Article Translation Workflow

You are the **Translation Agent**. Your ONLY job: take existing English articles and produce **high-quality translations** in 13 languages. **TRANSLATE FILES — that is your primary output.** Produce at least **5 translated files total per run** in the selected non-English target languages.

## ⚡ IMMEDIATE ACTIONS (do these FIRST, before reading anything else)

> **🚨 CRITICAL — HOW SAFEOUTPUTS ACTUALLY WORKS (READ CAREFULLY)**:
>
> **Each** call to `safeoutputs___create_pull_request` takes a **snapshot of all current changes relative to the base branch** — that includes **uncommitted working-directory changes plus any commits made since base** — and overwrites the PR's patch with that snapshot. It is **NOT a stream**. Files you edit **or commits you create after** the most recent successful call are NOT in the PR until you call `safeoutputs___create_pull_request` **again**.
>
> This means interim `git commit` usage does **not** make changes disappear from safeoutputs by itself: committed-since-base changes are still included in the next successful snapshot. The real risk is waiting too long between successful calls, because the PR only contains whatever was captured by the **latest** successful snapshot. Note also that a subsequent `git reset` (e.g. `git reset --mixed`) can remove commits from future snapshots — so if you ever commit, always **flush first, reset second**.
>
> MCP gateway keepalive is enabled in frontmatter (`sandbox.mcp.keepalive-interval: 300`) to prevent idle session expiry during long runs. Combined with `safe-outputs.create-pull-request.max: 10` (the gh-aw schema maximum), you can safely do up to 10 flushes per run, and the session stays alive for the whole 45-minute budget even while you are translating.

## 🚫 NEVER CREATE A ZERO-TRANSLATION PR (PRIMARY CONTRACT)

> **⛔ The number-one rule of this workflow: a PR MUST contain translations, or it MUST NOT exist at all. Zero-translation PRs are forbidden. Work is never lost by refusing to open an empty PR — it is lost by opening one and then failing to flush real content into it (PR #1346 is the canonical failure).**

Mandatory ordering contract:

1. **NEVER call `safeoutputs___create_pull_request` before at least one translated HTML file exists under `news/`**. An empty `summary.md` placeholder is NOT a translation and NOT enough. If the agent dies before producing any translations, no PR should be opened — that is the correct, resource-conserving outcome.
2. **First productive flush (safeoutputs call #1)**: happens only after **≥3 non-English HTML files** in `news/` are fully translated and HTMLHint-clean. With the MCP keepalive this typically lands at minute 12–18. This is both the initial PR creation AND the first data checkpoint — one call, real value, no empty placeholder.
3. **Subsequent flushes (calls #2 … #N)**: after every additional **3 completed translations** — flush at counts 6, 9, 12 for a single-article run. Each call snapshots new files into the same PR (same branch → same PR) and refreshes the session timer.
4. **Final flush (call ≤ max:10)**: at end of Step 5 with the quality-scored title/body. This call carries at most 1–2 files not yet flushed plus the finalised summary.

> **Why this ordering is correct — resource + work-preservation calculus**:
> - **No wasted AI spend**: if the run dies before translation #1 completes, no PR is opened, no reviewer is paged, no branch is leased, no 14-day expiry timer starts.
> - **No zero-translation PRs**: the very first PR snapshot already contains ≥3 real translations.
> - **Bounded data loss**: at any flush failure after the first, at most 2 translated files are in the unflushed window.
> - **Session safety**: `sandbox.mcp.keepalive-interval: 300` keeps the MCP session alive during the ~20-minute pre-flush translation window — you do NOT need an empty placeholder call at minute 2 to "warm up" the session.

## 🔁 Execution Order

1. **Run the Date Context bash block** (MANDATORY Date Context Establishment section). Creates `${ANALYSIS_DIR}/` and the baseline `summary.md` (used only for state tracking; it is NOT an independent safeoutputs trigger).
2. **Step 1 → Step 3**: discover English articles, generate target-language HTML shells. The generator output is English content inside language-tagged files — still not a translation.
3. **Step 3b — translate the first 3 files fully**. Every section of each file must be translated to its target language; HTMLHint-clean before moving on. THIS is when AI value is produced.
4. **FIRST PRODUCTIVE FLUSH** (safeoutputs call #1) — only now. Title/body can already describe partial progress (e.g. "3/13 complete"). Base/head must be `main` / `news/translate-${ARTICLE_DATE}` (NO `${RUN_ID}` — branch is date-keyed so repeated manual runs for the same date update the **same** PR).
5. **Continue translating**, flushing every 3 files (calls #2, #3, #4).
6. **Step 5 — final flush** with the quality-scored title, full coverage matrix, and finalised `summary.md`.

> **Past failures — re-diagnosed**:
> - Run #107: only called safeoutputs at the end → 13 lost. **Root cause**: single-call anti-pattern, solved by periodic flushes.
> - Runs #126, #128, #131: called safeoutputs at min 2 with placeholder, then session expired → 13–21 lost + empty PRs left behind. **Root cause**: empty-baseline first-call wasted the call; keepalive + deferred-first-call prevents both.
> - Run #188 (PR #1346): called safeoutputs 6× but `max:1` default rejected 5/6 → 13 lost + empty PR left behind. **Root cause**: two separate bugs — `max:1` default (fixed in previous commit, now `max:10`), and the "empty baseline" anti-pattern (fixed in this commit).

> **📚 Reference**: [README.md](../prompts/README.md) for EP MCP tools and safe outputs.
> **📈 Economic context pass-through (Wave-3)**: Translation workflows inherit IMF (primary economic) + World Bank (non-economic) citations and chart structure from the source English article. Do not add, remove, or alter `<canvas data-chart-config>` blocks, IMF citations, WB citations, or vintage strings; translations are structural pass-throughs and must preserve the same Chart.js + indicator evidence as the source. **Preserve proper names untranslated**: `IMF`, `WEO`, `Fiscal Monitor`, `World Economic Outlook`, `data-vintage="WEO-April-2026"`. See [`analysis/methodologies/imf-indicator-mapping.md`](../../analysis/methodologies/imf-indicator-mapping.md) and [`analysis/methodologies/worldbank-indicator-mapping.md`](../../analysis/methodologies/worldbank-indicator-mapping.md) for reference only.

## 🔁 MCP Gateway Keepalive + Flush Policy (NON-NEGOTIABLE)

> **⚠️ CRITICAL**: Session reliability is now handled at workflow level with
> `sandbox.mcp.keepalive-interval: 300`. Do **not** use
> `safeoutputs___push_repo_memory` heartbeat patterns.

**Mandatory policy (45-minute budget):**
- **Do NOT call `safeoutputs___create_pull_request` before at least 3 translated HTML files are on disk and lint-clean.** Placeholder baselines create empty PRs (PR #1346).
- First productive flush = minute ~12–18 (after the first 3 translations). Subsequent flushes every 3 completed files. Final flush at end of Step 5 with the quality-scored title/body — must complete by minute ≤ 28 to stay inside the safeoutputs MCP session TTL (~28–30 min).
- Budget: ~5 calls for a single-article 13-language run (flushes #1–#5: first at 3 files, then at 6/9/12, then final at 13) — well below the `safe-outputs.create-pull-request.max: 10` schema cap.
- Do not introduce extra heartbeat-only tool calls between flushes. Keepalive is already configured.
- If any `safeoutputs___create_pull_request` call returns `"session not found"`,
  stop translating, note lost unflushed files in `${ANALYSIS_DIR}/summary.md`,
  and end the run. Any translations already flushed remain in the PR — bounded loss.
- If the agent fails **before** the first productive flush, the run ends with **no PR opened**. That is the correct resource-conserving outcome — no empty PR, no wasted reviewer cycles, no 14-day expiring branch occupying namespace.

## 📞 Bash Tool Call Contract (CRITICAL)

> **⚠️ NON-NEGOTIABLE**: Every time you invoke the `bash` / shell tool, you MUST provide BOTH required fields: `command` AND `description`. Calls that omit either field fail with `Multiple validation errors: - "command": Required, - "description": Required`, waste a tool-call turn, and can stall the workflow.
>
> ✅ Correct format:
> ```json
> {"command": "echo hello", "description": "Print hello to verify shell works"}
> ```
>
> ❌ Wrong — missing `description`:
> ```json
> {"command": "echo hello"}
> ```
>
> ❌ Wrong — missing `command`:
> ```json
> {"description": "Print hello"}
> ```
>
> Additionally, to avoid AWF sandbox shell-expansion rejections:
> - Do NOT nest `$(...)` inside `$(( ... ))` arithmetic — assign command output to a variable on its own line first, then reference the variable.
> - Do NOT combine `${VAR:-$(cmd || cmd2)}` default-with-fallback — use explicit `if/else` blocks.
> - Do NOT use adjacent `${RANDOM}${RANDOM}` — use `$$` (PID) and `$(date +%s)` on separate assignment lines.
> - Avoid putting multiple `$(...)` substitutions inside a single double-quoted string — split onto separate variable assignments.

## 🚫 Scope Restriction

**ALLOWED:** ✅ Create `news/*.html` translations (non-English) | ✅ Read `news/*-en.html` sources | ✅ Write to `analysis/daily/${ARTICLE_DATE}/translate-run${RUN_ID}/`

**FORBIDDEN:** ❌ Modify English articles, `.github/`, `index*.html`, `package.json` | ❌ Modify `test/` or `e2e/` unless required by an accompanying `src/`/`scripts/` fix (see [00-scope-and-ground-rules.md § 3](../prompts/00-scope-and-ground-rules.md#3--conditional-allow--minor-srcscripts-fixes)) | ❌ Write scripts, translation dictionaries, or batch tools | ❌ Use `sed`/`awk`/regex for translating narrative content | ❌ Dangerous shell expansion patterns — NEVER use `${var@P}`, `${!var}`, `eval`, nested command substitutions `$($(..))`, nested parameter expansions like `${var:+...${#other}...}`, `${VAR:-$(cmd)}` default-with-command-substitution, or input redirection inside command substitution `$(cmd < file)`. Use `if/else` blocks instead. These will be blocked by the sandbox | ❌ Use `git commit`/`git push` during translation — stay in working-dir-only mode. **Safe rule**: avoid committing entirely; if a commit is ever made, call `safeoutputs___create_pull_request` **immediately** (before any `git reset --mixed` or other reset), because a later reset can remove unflushed commits from subsequent snapshots | ❌ Call `safeoutputs___noop` — always produce translations | ❌ Call `safeoutputs___create_pull_request` **before at least 3 translated HTML files exist in `news/` and are lint-clean** — zero-translation placeholder PRs are the #1 failure mode (PR #1346). If the run dies before 3 translations complete, it MUST end without opening a PR — that is the correct resource-conserving outcome | ❌ Exit with analysis-only PR without attempting translation | ❌ End a normally-completing run with fewer than 5 translated files in the PR. The **first** productive flush MAY open the PR at **3 translated files** (this is by design — see "first productive flush" contract); the **final state** of a normally-completing run MUST contain **at least 5** translated files | ❌ Skip the periodic flush in Step 3b — that is the #1 cause of bounded data loss after the first flush

> **Minor TypeScript fixes** (max 20 lines in `src/`/`scripts/`) allowed ONLY to unblock translation generation.

## 🛡️ AI-First Pre-Translation Diagnostic (NON-BLOCKING — translate EVERY source anyway)

> **🚫 NEVER REFUSE TRANSLATION**: This workflow MUST translate every eligible English source. The validator below is **diagnostic only** — a non-zero exit is a signal to the translating AI, not a reason to skip a file, call `safeoutputs___noop`, backfill an older date, or reduce the translation set. **Every English article on `${ARTICLE_DATE}` MUST receive all 13 language translations, contaminated or not.**

> **How to handle leaks in the English source**: Per the [Analysis-to-Article Data Contract](../prompts/05-analysis-to-article-contract.md), the `[AI_ANALYSIS_REQUIRED]` sentinel, the six generic stakeholder-reasoning fallback sentences (e.g. *"This parliamentary activity on 'voting period …' has moderate implications…"*), and date-range topic placeholders (e.g. `"Voting outcomes <date>–<date>"`) are defects in the source English article. When YOU encounter one of these in a section YOU are translating:
>
> 1. **Do NOT translate the placeholder verbatim.** Propagating it across 13 languages multiplies the defect.
> 2. **Author a faithful, concise replacement** in the target language, using the matching `analysis/daily/${ARTICLE_DATE}/<run>/**/*.md` artefacts (especially `intelligence/stakeholder-map.md`, `intelligence/synthesis-summary.md`, `existing/stakeholder-impact.md`, `classification/impact-matrix.md`) as your source of truth — exactly the same contract the English workflow was meant to follow.
> 3. **Keep the English article unchanged** (scope restriction forbids editing `*-en.html`). Your repair is contained in the target-language HTML only.
> 4. **Continue translating every remaining section of every remaining article.** Never stop at the first leak, never skip a file, never reduce the set.

**Run this diagnostic BEFORE starting Step 1 (translation), capture the report, then proceed regardless of exit code:**

```bash
# Diagnostic scan: records which English sources have fallback leaks so the
# AI translator knows where to perform section-level repairs while still
# translating every file. This block NEVER exits the workflow — the trailing
# "|| true" and "; true" ensure the translator always proceeds to Step 1.
mkdir -p "analysis/daily/${ARTICLE_DATE}/translate-run${RUN_ID}"
DIAG="analysis/daily/${ARTICLE_DATE}/translate-run${RUN_ID}/source-leak-report.txt"
SOURCES=$(ls news/${ARTICLE_DATE}-*-en.html 2>/dev/null | tr '\n' ' ')
if [ -n "$SOURCES" ]; then
  VALIDATOR_ARGS=""
  for S in $SOURCES; do
    VALIDATOR_ARGS="$VALIDATOR_ARGS --article-html=$S"
  done
  # shellcheck disable=SC2086
  node scripts/validate-analysis-completeness.js $VALIDATOR_ARGS > "$DIAG" 2>&1 || true
  echo "ℹ️ Leak diagnostic written to $DIAG — translator MUST repair leaks per-section while translating; translation of ALL sources still proceeds."
fi
true  # Non-blocking: continue to Step 1 no matter what.
```

> **Why non-blocking**: Translation coverage across 13 languages is a primary product commitment. Refusing to translate a contaminated English article would punish downstream readers for an upstream defect; silently propagating the defect would be equally bad. The only acceptable behaviour is: **translate everything, repair leaks at translation time, record the diagnostic in the run directory for the English workflow owners to fix upstream.**

## 🎯 MINIMUM TRANSLATION REQUIREMENT

> **⚠️ HARD REQUIREMENT**: Every run MUST produce at least **5 translated HTML files**. If today has no articles, backfill older dates. If all articles are translated, improve existing translations. There is ALWAYS work to do. NEVER produce an empty or analysis-only PR.

> **⚠️ LANGUAGE CORRECTNESS**: The filename suffix determines the target language. `-es.html` = Spanish, `-de.html` = German, `-fr.html` = French. The `<html lang>` attribute MUST match the filename. Run #110 (PR #1186) put German content into a Spanish-named file — this is a critical defect.

## 🔧 Inputs & Memory

- **article_types** = `${{ github.event.inputs.article_types }}` | **article_date** = `${{ github.event.inputs.article_date }}` | **languages** = `${{ github.event.inputs.languages }}` | **force_translation** = `${{ github.event.inputs.force_translation }}`
- **Repo Memory**: Read/write `translation-log.json` in `/tmp/gh-aw/repo-memory/default/memory/news-generation/`
- **Memory MCP**: Use `create_entities`/`search_nodes` for terminology tracking within this run
- **Sequential Thinking**: Use for complex translation decisions

### Supported Languages (13 non-English targets)

sv (Swedish), da (Danish), no (Norwegian), fi (Finnish), de (German), fr (French), es (Spanish), nl (Dutch), ar (Arabic/RTL), he (Hebrew/RTL), ja (Japanese/CJK), ko (Korean/CJK), zh (Chinese Simplified/CJK)

## Translation Standards (CONDENSED)

### Key EP Terms per Language

- **sv**: Europaparlamentet, plenarsammanträde, utskott, föredragande, lagstiftningsförfarande
- **da**: Europa-Parlamentet, plenarmøde, udvalg, ordfører, lovgivningsprocedure
- **no**: Europaparlamentet, plenumsmøte, komité, ordfører, lovgivningsprosedyre
- **fi**: Euroopan parlamentti, täysistunto, valiokunta, esittelijä, lainsäädäntömenettely
- **de**: Europäisches Parlament, Plenarsitzung, Ausschuss, Berichterstatter, Gesetzgebungsverfahren
- **fr**: Parlement européen, séance plénière, commission, rapporteur, procédure législative
- **es**: Parlamento Europeo, sesión plenaria, comisión, ponente, procedimiento legislativo
- **nl**: Europees Parlement, plenaire vergadering, commissie, rapporteur, wetgevingsprocedure
- **ar**: البرلمان الأوروبي، الجلسة العامة، اللجنة، المقرر، الإجراء التشريعي
- **he**: הפרלמנט האירופי, מליאה, ועדה, מדווח, הליך חקיקה
- **ja**: 欧州議会, 本会議, 委員会, 報告者, 立法手続き
- **ko**: 유럽의회, 본회의, 위원회, 보고자, 입법절차
- **zh**: 欧洲议会, 全体会议, 委员会, 报告员, 立法程序

> Full terminology: [EP Multilingual Termbase](https://www.europarl.europa.eu/portal/en) and [IATE](https://iate.europa.eu/).

### Style Rules (per language)
- **Nordic** (sv/da/no/fi): Formal register, official EP names per language, genitive/case in fi
- **EU Core** (de/fr/es/nl): Formal, strict gender agreement, capitalise ALL nouns in de
- **RTL** (ar/he): MSA for ar, formal Hebrew for he. `dir="rtl"` already set by metadata normalization
- **CJK** (ja/ko/zh): Formal register, full-width punctuation (。、「」), desu/masu in ja, 합쇼체 in ko

### Quality Dimensions
1. **Accuracy** (40%): Zero additions/omissions vs English source
2. **Fluency** (20%): Natural target-language text, not "translationese"
3. **Terminology** (20%): Official EP/EU vocabulary
4. **Completeness** (10%): Every section, SWOT entry, confidence marker present
5. **Formatting** (10%): RTL/CJK correct, emoji markers preserved

### ❌ Translation Quality Gate (Step 4 auto-enforced)
- **Title check**: `<title>` must differ from English source
- **H1 check**: `<h1>` must differ from English source
- **Body check**: First 500 chars of body text must differ from English source
- **English pattern check**: Fewer than 5 English sentence patterns in translated file
- Files failing these checks are **automatically REMOVED** from the PR and the agent is told to re-translate them
- Per-language quality scores are included in the PR description and analysis summary

## ⏱️ Time Budget (45 minutes — hard cap; safeoutputs MCP TTL ~28–30 min)

| Minutes | Action |
|---------|--------|
| 1–2 | Date Context + Discovery (Step 1) — NO safeoutputs call yet |
| 2–5 | Generate article HTML files (Step 3) — NO safeoutputs call yet |
| 5–14 | **First 3 translations** (Step 3b, files 1–3). Translate ALL sections, HTMLHint-clean each. NO safeoutputs call yet |
| 14 | **FIRST PRODUCTIVE FLUSH** — `safeoutputs___create_pull_request` call #1. PR is created here, already containing 3 real translations. Never before this point. |
| 14–25 | **AI TRANSLATION continues** (files 4–N). **Flush safeoutputs after every additional 3 files** — calls #2, #3, #4 at completion counts 6, 9, 12. Each flush refreshes the safeoutputs session timer. |
| 25–27 | Validate translations (Step 4) — reject untranslated copies |
| 27–28 | **Write quality-scored summary** (Step 4c) — MANDATORY, no placeholders |
| 28 | **Final `safeoutputs___create_pull_request`** with quality scores (Step 5). MUST land by minute ≤ 28 — past minute 30 the safeoutputs session is reaped and the PR call returns `session not found`. |
| 28–45 | Buffer for retry, npm steps, git push and graceful exit |

> **Per-run article-type scope**: One article type per run only. A 45-minute budget covers ~9–13 of the 13 target languages depending on article length. If `article_types` input names multiple types, run them in separate workflow invocations rather than chaining them in a single run.

> **TRANSLATION IS THE PRIORITY**: Spend ≥ 18 minutes translating (minute 5–25 of the 45-min cap). Every file MUST have its title, h1, description, and body text fully translated — just changing the lang attribute is NOT a translation. Files that are untranslated copies of English will be automatically REJECTED in Step 4.

> **QUALITY SUMMARY IS MANDATORY**: Step 4c summary.md MUST contain per-language quality scores and a coverage matrix. Placeholders like "_(to be filled)_" are NEVER acceptable. If you run out of time, write what you have — but NEVER leave the template empty.

> **Flush timing is NON-NEGOTIABLE**: Write files with `edit`/`create` tools → **DO NOT** call safeoutputs until the first 3 translations are fully complete and lint-clean → call it for the first time after file 3 → call it AGAIN after every additional 3 completed translations → call it one more time at the end of Step 5. Empty-baseline placeholder calls are forbidden; periodic in-run calls are required.

## MANDATORY Date Context Establishment

Run this bash block FIRST, then call safeoutputs immediately after.

> **Tool call contract (CRITICAL)**: Every time you invoke the `bash` tool, you MUST provide both required fields: `command` and `description`. Calls without either field fail validation and can stall the workflow.
>
> ✅ Correct format:
> ```json
> {"command":"echo \"hello\"","description":"Print hello"}
> ```

```bash
echo "=== Translation Date Context ==="
TODAY=$(date -u +%Y-%m-%d)
ARTICLE_DATE="${{ github.event.inputs.article_date }}"
if [ -z "$ARTICLE_DATE" ]; then
  ARTICLE_DATE="${EP_ARTICLE_DATE:-$TODAY}"
fi
# Validate ARTICLE_DATE is YYYY-MM-DD to prevent path traversal and invalid branch names
if ! echo "$ARTICLE_DATE" | grep -qE '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'; then
  echo "⚠️ Invalid ARTICLE_DATE='$ARTICLE_DATE' — must be YYYY-MM-DD. Falling back to TODAY."
  ARTICLE_DATE="$TODAY"
fi
CURRENT_YEAR=$(date -u +%Y)
DAY_OF_WEEK=$(date -u +%A)
START_EPOCH=$(date +%s)
TRANSLATION_DEADLINE_MIN=25
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

# ⚠️ MANDATORY — REQUIRED FOR CHECKPOINT PR: Create baseline analysis directory and
# summary file BEFORE calling safeoutputs___create_pull_request in the CHECKPOINT step.
# The gh-aw safeoutputs create_pull_request handler FAILS with
#   "No changes to commit - no commits found"
# when there are zero uncommitted working-directory changes at call time. This baseline
# file ensures the checkpoint PR always contains at least one artifact — it is the single
# change that makes the minute-2 safeoutputs call succeed. Do NOT skip this block.
# Per ai-driven-analysis-guide.md Rule 5, no workflow run is wasted either.
mkdir -p "${ANALYSIS_DIR}"
SUMMARY_FILE="${ANALYSIS_DIR}/summary.md"
if [ ! -f "${SUMMARY_FILE}" ]; then
  cat > "${SUMMARY_FILE}" <<EOF
# Translation Analysis — ${ARTICLE_DATE}

## Coverage
- Article types: _(to be filled)_
- Languages: _(to be filled)_

## Quality
- Terminology: _(EP terms consistency)_
- Overall: _(score per language)_

## Gaps & Recommendations
- Missing: _(document here)_
- Improvements: _(short-term and long-term)_
EOF
  echo "📊 Created baseline translation analysis summary: ${SUMMARY_FILE}"
else
  echo "📊 Existing translation analysis found — will extend in Step 4c"
fi

# ⚠️ UNCONDITIONAL RUN MARKER: Always append a unique line so that git-status ALWAYS
# reports ≥1 uncommitted change at checkpoint-call time, even if ANALYSIS_DIR already
# existed (e.g. from an earlier attempt of the same run) or was restored from the PR
# branch. Run #128 (Apr 17) surfaced a case where the baseline creation branch was taken
# but safeoutputs still returned "No changes to commit" — the unconditional marker
# eliminates that failure mode.
#
# ⚠️ SANDBOX-SAFE UNIQUENESS: The AWF shell sandbox rejects adjacent parameter
# expansions such as `${RANDOM}${RANDOM}` ("dangerous shell expansion patterns").
# Use `$$` (PID) + `$(date +%s%N)` (epoch NANOSECONDS, finer than seconds so
# repeated calls within the same second still differ) + `$GITHUB_RUN_ATTEMPT`
# (to disambiguate re-runs of the same workflow run) assigned on their own
# lines to build a unique seq token without nested/adjacent expansions.
MARKER_TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
MARKER_EPOCH_NS=$(date +%s%N)
MARKER_RUN_ATTEMPT="${GITHUB_RUN_ATTEMPT:-0}"
MARKER_SEQ="$$-${MARKER_EPOCH_NS}-${MARKER_RUN_ATTEMPT}"
RUN_MARKER_LINE="<!-- run-marker: run=${RUN_ID} ts=${MARKER_TS} seq=${MARKER_SEQ} -->"
printf '%s\n' "${RUN_MARKER_LINE}" >> "${SUMMARY_FILE}"
sync 2>/dev/null || true

# Verify baseline is visible to git as an uncommitted change — checkpoint PR depends on this.
BASELINE_CHANGES=$(git status --porcelain -- "${ANALYSIS_DIR}" 2>/dev/null | wc -l)
echo "📋 Baseline changes detected by git: ${BASELINE_CHANGES} (must be ≥1 for checkpoint PR to succeed)"
if [ "${BASELINE_CHANGES}" -lt 1 ]; then
  echo "⚠️ git did not detect the baseline change — writing a second marker file as fallback."
  FALLBACK_EPOCH_NS=$(date +%s%N)
  FALLBACK_RUN_ATTEMPT="${GITHUB_RUN_ATTEMPT:-0}"
  FALLBACK_SEQ="$$-${FALLBACK_EPOCH_NS}-${FALLBACK_RUN_ATTEMPT}"
  printf 'run=%s epoch_ns=%s seq=%s\n' "${RUN_ID}" "${FALLBACK_EPOCH_NS}" "${FALLBACK_SEQ}" > "${ANALYSIS_DIR}/run-marker.txt"
  sync 2>/dev/null || true
  BASELINE_CHANGES=$(git status --porcelain -- "${ANALYSIS_DIR}" 2>/dev/null | wc -l)
  echo "📋 Baseline changes after fallback marker: ${BASELINE_CHANGES}"
fi
```

## 🛡️ FIRST PRODUCTIVE FLUSH (after 3 translations — NOT before)

> **⛔ DO NOT call `safeoutputs___create_pull_request` in Steps 0–3.** The Date Context bash block and the target-language file generator produce `summary.md` and empty-HTML shells, not translations. Calling safeoutputs at this point would create a zero-translation PR — the exact failure mode of PR #1346. Empty-PR creation is PROHIBITED regardless of whether the call would "succeed".
>
> **✅ DO call `safeoutputs___create_pull_request` immediately after Step 3b translates files 1–3** to their target languages and they pass HTMLHint. This is call #1 — it both creates the PR and makes the first productive snapshot. It typically lands at minute 12–18.

When the first 3 translations are complete and lint-clean, call:

```javascript
safeoutputs___create_pull_request({
  title: "[news] Translate ${ARTICLE_TYPE_SLUG} — ${ARTICLE_DATE} (run ${RUN_ID}) — 3/13 complete",
  body: "First productive flush — 3 of 13 languages translated so far. Continuing with the remaining 10.",
  base: "main",
  head: "news/translate-${ARTICLE_DATE}"
})
```

> **If this first call returns `"No changes to commit - no commits found"`**: something went wrong in Step 3b — verify that the translated HTML files actually exist and differ from the English source. Do NOT fall back to a placeholder baseline just to make the call succeed. Fix the underlying translation or let the run end PR-less.
>
> **If this first call returns `"session not found"`**: the MCP session expired during translation. This should be extremely rare given `sandbox.mcp.keepalive-interval: 300`. If it happens, write a short note to `${ANALYSIS_DIR}/summary.md` and end the run — the next manual run will pick up the work. No PR is created — the 3 translated files are lost for this run but the run also didn't produce a misleading empty PR.

> **Branch and PR identity — ONE PR PER ARTICLE DATE**: All flushes — and **all future manual runs for the same `ARTICLE_DATE`** — use the same `head: news/translate-${ARTICLE_DATE}`. safeoutputs tracks "create or update the PR for this head branch", so:
>
> - **Within a single run**: every flush (after 3/6/9/12 files and final Step 5) updates the same PR.
> - **Across repeated manual runs for the same date**: the second run's first flush updates the PR opened by the first run — the reviewer sees **exactly one PR per article-date**, not one per run.
> - If a date's PR has already been merged, a fresh manual run on the same date re-opens a new PR on the deleted branch. If it hasn't been merged, improvements from the second run are reviewed together with the first run's content on that same PR.
>
> This is the user-facing guarantee: never more than **one open translation PR per article-date** to review/merge. Do NOT include `${RUN_ID}` in the head branch name. Do NOT invent a per-run suffix. Do NOT create a second branch for "the second translation attempt today" — improve the existing one.

## MCP Health Check (OPTIONAL — max 30 seconds)

Quick check — EP MCP is NOT required for translation (we read existing HTML files). Skip if short on time.

1. Call `european_parliament___get_plenary_sessions({ limit: 1 })` — if fails, log warning and continue
2. Call `memory___read_graph({})` — if fails, log warning and continue
3. **Do NOT spend more than 30 seconds on health checks. Proceed to Step 1 immediately.**

## Step 1: Discover English Articles Needing Translation

Find articles needing translation using three-phase priority: (1) Today's articles, (2) Historical backfill (last 90 days), (3) Quality improvement of existing translations. **There is ALWAYS work to do.**

Find English articles that need translation — starting with today, then scanning backward:

```bash
# Re-derive date context (env vars do NOT persist across bash blocks in gh-aw)
TODAY=$(date -u +%Y-%m-%d)
ARTICLE_DATE="${{ github.event.inputs.article_date }}"
if [ -z "$ARTICLE_DATE" ]; then
  ARTICLE_DATE="${EP_ARTICLE_DATE:-$TODAY}"
fi
# Validate ARTICLE_DATE is YYYY-MM-DD to prevent path traversal and invalid branch names
if ! echo "$ARTICLE_DATE" | grep -qE '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'; then
  echo "⚠️ Invalid ARTICLE_DATE='$ARTICLE_DATE' — must be YYYY-MM-DD. Falling back to TODAY."
  ARTICLE_DATE="$TODAY"
fi
RUN_ID="${GITHUB_RUN_NUMBER:-0}"
TRANSLATE_ANALYSIS_DIR="analysis/daily/${ARTICLE_DATE}/translate-run${RUN_ID}"

# Determine which article types to process (prefer workflow_dispatch inputs, fall back to env)
ARTICLE_TYPES_INPUT="${{ github.event.inputs.article_types }}"
if [ -z "$ARTICLE_TYPES_INPUT" ]; then
  ARTICLE_TYPES_INPUT="${EP_ARTICLE_TYPES:-}"
fi
FORCE_TRANSLATION="${EP_FORCE_TRANSLATION:-${{ github.event.inputs.force_translation }}}"

# --- Resolve target languages FIRST (needed by discovery) ---
LANGUAGES_INPUT="${{ github.event.inputs.languages }}"
if [ -z "$LANGUAGES_INPUT" ]; then
  LANGUAGES_INPUT="${EP_LANG_INPUT:-all-non-en}"
fi
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
echo "🌐 Target languages for discovery and generation: $LANG_ARG"

# --- Phase 1: Check today's articles ---
if [ -z "$ARTICLE_TYPES_INPUT" ]; then
  ARTICLE_TYPES=$(ls news/${ARTICLE_DATE}-*-en.html 2>/dev/null | \
    sed "s|news/${ARTICLE_DATE}-||;s|-en\.html||" | \
    sort -u | tr '\n' ',' | sed 's/,$//')
  echo "Auto-discovered article types for $ARTICLE_DATE: ${ARTICLE_TYPES:-none}"
else
  ARTICLE_TYPES="$ARTICLE_TYPES_INPUT"
  echo "Specified article types: $ARTICLE_TYPES"
fi

# Check which articles for today need translation
NEEDS_TRANSLATION=""
for TYPE in $(echo "$ARTICLE_TYPES" | tr ',' ' '); do
  EN_FILE="news/${ARTICLE_DATE}-${TYPE}-en.html"
  if [ ! -f "$EN_FILE" ]; then
    echo "⚠️ English article not found: $EN_FILE — skipping type $TYPE"
    continue
  fi

  # Check if selected target translations exist
  MISSING_COUNT=0
  for LANG in $(echo "$LANG_ARG" | tr ',' ' '); do
    LANG_FILE="news/${ARTICLE_DATE}-${TYPE}-${LANG}.html"
    if [ ! -f "$LANG_FILE" ]; then
      MISSING_COUNT=$((MISSING_COUNT + 1))
    fi
  done

  if [ "$MISSING_COUNT" -gt 0 ] || [ "$FORCE_TRANSLATION" = "true" ]; then
    NEEDS_TRANSLATION="${NEEDS_TRANSLATION:+$NEEDS_TRANSLATION,}$TYPE"
    echo "📝 Will translate: $TYPE ($EN_FILE) — $MISSING_COUNT languages missing"
  else
    echo "✅ All selected translations exist for $TYPE on $ARTICLE_DATE"
  fi
done

# --- Phase 2: Historical backfill — scan backward for missing translations ---
# If today has no work (no articles or all translated), scan the last 30 days
BACKFILL_DATES=""
if [ -z "$NEEDS_TRANSLATION" ]; then
  echo ""
  echo "═══════════════════════════════════════════"
  echo "📅 Phase 2: Historical Backfill Scan"
  echo "═══════════════════════════════════════════"
  echo "Today ($ARTICLE_DATE) has no pending translations — scanning recent dates..."

  # Scan all dates with English articles, most recent first
  ALL_DATES=$(ls news/*-en.html 2>/dev/null | sed 's|news/||;s|-[a-z].*||' | sort -ru | head -90)

  for CHECK_DATE in $ALL_DATES; do
    # Skip today (already checked)
    [ "$CHECK_DATE" = "$ARTICLE_DATE" ] && continue

    for EN_FILE in news/${CHECK_DATE}-*-en.html; do
      [ ! -f "$EN_FILE" ] && continue
      TYPE=$(echo "$EN_FILE" | sed "s|news/${CHECK_DATE}-||;s|-en\.html||")

      MISSING_COUNT=0
      MISSING_LANGS=""
      for LANG in $(echo "$LANG_ARG" | tr ',' ' '); do
        LANG_FILE="news/${CHECK_DATE}-${TYPE}-${LANG}.html"
        if [ ! -f "$LANG_FILE" ]; then
          MISSING_COUNT=$((MISSING_COUNT + 1))
          MISSING_LANGS="${MISSING_LANGS} ${LANG}"
        fi
      done

      if [ "$MISSING_COUNT" -gt 0 ]; then
        echo "📝 Backfill: ${CHECK_DATE}/${TYPE} — $MISSING_COUNT languages missing:$MISSING_LANGS"
        NEEDS_TRANSLATION="${NEEDS_TRANSLATION:+$NEEDS_TRANSLATION,}${CHECK_DATE}:${TYPE}"
        case ",${BACKFILL_DATES}," in
          *,"${CHECK_DATE}",*) ;;
          *) BACKFILL_DATES="${BACKFILL_DATES:+$BACKFILL_DATES,}${CHECK_DATE}" ;;
        esac

        # Limit backfill to a manageable batch (max 20 article types per run)
        ITEM_COUNT=$(echo "$NEEDS_TRANSLATION" | tr ',' '\n' | wc -l)
        if [ "$ITEM_COUNT" -ge 20 ]; then
          echo "⏱️ Backfill batch limit reached ($ITEM_COUNT items) — remaining gaps will be filled in next run"
          break 2
        fi
      fi
    done
  done
fi

# --- Phase 3: Translation improvement mode ---
# If ALL articles are 100% translated, improve quality of existing translations
IMPROVEMENT_MODE=""
if [ -z "$NEEDS_TRANSLATION" ]; then
  echo ""
  echo "═══════════════════════════════════════════"
  echo "✨ Phase 3: Translation Quality Improvement"
  echo "═══════════════════════════════════════════"
  echo "All articles have complete translations — entering improvement mode"
  IMPROVEMENT_MODE="true"

  # Pick the 4 most recent dates with translations to improve
  IMPROVE_DATES=$(ls news/*-en.html 2>/dev/null | sed 's|news/||;s|-[a-z].*||' | sort -ru | head -4)
  for CHECK_DATE in $IMPROVE_DATES; do
    for EN_FILE in news/${CHECK_DATE}-*-en.html; do
      [ ! -f "$EN_FILE" ] && continue
      TYPE=$(echo "$EN_FILE" | sed "s|news/${CHECK_DATE}-||;s|-en\.html||")
      NEEDS_TRANSLATION="${NEEDS_TRANSLATION:+$NEEDS_TRANSLATION,}${CHECK_DATE}:${TYPE}"
      echo "✨ Will improve translations: ${CHECK_DATE}/${TYPE}"
      # Enforce item cap inside per-file loop (same pattern as backfill)
      ITEM_COUNT=$(echo "$NEEDS_TRANSLATION" | tr ',' '\n' | wc -l)
      if [ "$ITEM_COUNT" -ge 4 ]; then
        break 2
      fi
    done
  done
fi

echo ""
echo "═══ Discovery Summary ═══"
if [ -n "$BACKFILL_DATES" ]; then
  echo "📅 Mode: Historical backfill"
  echo "📅 Backfill dates: $BACKFILL_DATES"
elif [ "$IMPROVEMENT_MODE" = "true" ]; then
  echo "✨ Mode: Translation quality improvement"
else
  echo "📅 Mode: Today's translations ($ARTICLE_DATE)"
fi
echo "🌐 Articles to translate: ${NEEDS_TRANSLATION:-none}"

# --- Persist state across bash blocks (sanitized to prevent shell injection) ---
STATE_FILE="/tmp/gh-aw-translate-state.sh"
{
  printf 'NEEDS_TRANSLATION=%q\n' "${NEEDS_TRANSLATION}"
  printf 'BACKFILL_DATES=%q\n' "${BACKFILL_DATES}"
  printf 'IMPROVEMENT_MODE=%q\n' "${IMPROVEMENT_MODE}"
  printf 'FORCE_TRANSLATION=%q\n' "${FORCE_TRANSLATION}"
  printf 'LANG_ARG=%q\n' "${LANG_ARG}"
  printf 'ARTICLE_DATE=%q\n' "${ARTICLE_DATE}"
  printf 'RUN_ID=%q\n' "${RUN_ID}"
  printf 'TRANSLATE_ANALYSIS_DIR=%q\n' "${TRANSLATE_ANALYSIS_DIR}"
} > "$STATE_FILE"
echo "💾 Discovery state persisted to $STATE_FILE"
```

## Step 2: Restore Discovery State & Target Languages

```bash
# Source state from Step 1 (env vars do NOT persist across bash blocks)
STATE_FILE="/tmp/gh-aw-translate-state.sh"
if [ -f "$STATE_FILE" ]; then
  source "$STATE_FILE"
  echo "✅ Restored discovery state: NEEDS_TRANSLATION=$NEEDS_TRANSLATION"
  echo "✅ Target languages: LANG_ARG=$LANG_ARG"
else
  echo "⚠️ State file not found — re-resolving languages"
  LANG_ARG="sv,da,no,fi,de,fr,es,nl,ar,he,ja,ko,zh"
fi
export NEEDS_TRANSLATION BACKFILL_DATES IMPROVEMENT_MODE FORCE_TRANSLATION LANG_ARG ARTICLE_DATE RUN_ID TRANSLATE_ANALYSIS_DIR
echo "🌐 Target languages: $LANG_ARG"
```

## Step 3: Generate Article Structure

Use the TypeScript generator for today's articles. For backfill/improvement, copy English files and translate them in Step 3b.

> ⚠️ MCP env vars and generation script MUST run in the same bash block.

```bash
# --- Re-initialize time tracking (env vars do NOT persist across bash blocks) ---
START_EPOCH=$(date +%s)
TRANSLATION_DEADLINE_MIN=25
echo "⏱️ Translation start epoch: $START_EPOCH (deadline: ${TRANSLATION_DEADLINE_MIN} min)"

# --- Restore discovery state from Step 1 ---
STATE_FILE="/tmp/gh-aw-translate-state.sh"
if [ -f "$STATE_FILE" ]; then
  source "$STATE_FILE"
  echo "✅ Restored: NEEDS_TRANSLATION=$NEEDS_TRANSLATION"
  echo "✅ Restored: LANG_ARG=$LANG_ARG FORCE_TRANSLATION=$FORCE_TRANSLATION IMPROVEMENT_MODE=$IMPROVEMENT_MODE"
else
  echo "⚠️ State file not found — discovery results unavailable. Creating analysis artifact and continuing with empty state."
  NEEDS_TRANSLATION=""
  BACKFILL_DATES=""
  IMPROVEMENT_MODE="false"
  FORCE_TRANSLATION="false"
  LANG_ARG="sv,da,no,fi,de,fr,es,nl,ar,he,ja,ko,zh"
  # Re-derive date context for fallback (since state file was not available)
  TODAY=$(date -u +%Y-%m-%d)
  ARTICLE_DATE="${{ github.event.inputs.article_date }}"
  if [ -z "$ARTICLE_DATE" ]; then
    ARTICLE_DATE="${EP_ARTICLE_DATE:-$TODAY}"
  fi
  # Validate ARTICLE_DATE is YYYY-MM-DD to prevent path traversal and invalid branch names
  if ! echo "$ARTICLE_DATE" | grep -qE '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'; then
    echo "⚠️ Invalid ARTICLE_DATE='$ARTICLE_DATE' — must be YYYY-MM-DD. Falling back to TODAY."
    ARTICLE_DATE="$TODAY"
  fi
  RUN_ID="${GITHUB_RUN_NUMBER:-0}"
  TRANSLATE_ANALYSIS_DIR="analysis/daily/${ARTICLE_DATE}/translate-run${RUN_ID}"
  mkdir -p "${TRANSLATE_ANALYSIS_DIR}"
  cat > "${TRANSLATE_ANALYSIS_DIR}/translation-state-missing.analysis.md" <<EOF
# Translation state file missing

- article_date: ${ARTICLE_DATE}
- run_id: ${RUN_ID}
- reason: /tmp/gh-aw-translate-state.sh was not found. Discovery results from Step 1 were unavailable.
- action: Proceeding with empty state so PR creation can still complete with analysis artifacts.
EOF
fi

# --- MCP Gateway Setup ---
# Route through MCP gateway using the shared setup script (uses node -e, no jq dependency)
source scripts/mcp-setup.sh

# Fallback: verify binary for stdio mode
if [ -z "${EP_MCP_GATEWAY_URL:-}" ]; then
  if [ -f "node_modules/.bin/european-parliament-mcp-server" ]; then
    echo "✅ EP MCP server binary found for stdio mode"
  else
    echo "⚠️ No gateway URL set, installing EP MCP server for stdio mode..."
    npm install --no-save european-parliament-mcp-server@1.2.15
  fi
fi

export USE_EP_MCP=true

# --- Translate Each Article Type ---
# NEEDS_TRANSLATION entries are either "TYPE" (today) or "DATE:TYPE" (backfill/improvement)
TRANSLATED_TYPES=""
FAILED_TYPES=""
CURRENT_DATE_CACHED=$(date -u +%Y-%m-%d)

for ITEM in $(echo "$NEEDS_TRANSLATION" | tr ',' ' '); do
  # Parse DATE:TYPE or just TYPE
  if echo "$ITEM" | grep -q ':'; then
    ITEM_DATE=$(echo "$ITEM" | cut -d: -f1)
    TYPE=$(echo "$ITEM" | cut -d: -f2)
  else
    ITEM_DATE="$ARTICLE_DATE"
    TYPE="$ITEM"
  fi

  echo ""
  echo "═══════════════════════════════════════════"
  echo "🌐 Translating: $TYPE (date: $ITEM_DATE)"
  echo "═══════════════════════════════════════════"

  # ⏱️ Time check: stop translating if deadline reached
  NOW_EPOCH=$(date +%s)
  ELAPSED_MIN=$(( (NOW_EPOCH - START_EPOCH) / 60 ))
  echo "⏱️ Elapsed: ${ELAPSED_MIN} minutes (deadline: ${TRANSLATION_DEADLINE_MIN})"
  if [ "$ELAPSED_MIN" -ge "$TRANSLATION_DEADLINE_MIN" ]; then
    echo "⚠️ Deadline reached (${ELAPSED_MIN}min elapsed, limit: ${TRANSLATION_DEADLINE_MIN}min). Stopping translation to ensure PR creation."
    break
  fi

  # Determine which languages are missing for this article
  MISSING_LANGS=""
  EN_FILE="news/${ITEM_DATE}-${TYPE}-en.html"
  if [ ! -f "$EN_FILE" ]; then
    echo "⚠️ English source not found: $EN_FILE — skipping"
    FAILED_TYPES="${FAILED_TYPES:+$FAILED_TYPES,}${ITEM_DATE}:${TYPE}"
    continue
  fi

  for LANG in $(echo "$LANG_ARG" | tr ',' ' '); do
    LANG_FILE="news/${ITEM_DATE}-${TYPE}-${LANG}.html"
    if [ ! -f "$LANG_FILE" ] || [ "$IMPROVEMENT_MODE" = "true" ] || [ "$FORCE_TRANSLATION" = "true" ]; then
      MISSING_LANGS="${MISSING_LANGS:+$MISSING_LANGS,}$LANG"
    fi
  done

  if [ -z "$MISSING_LANGS" ]; then
    echo "✅ All translations exist for ${ITEM_DATE}/${TYPE} — skipping"
    continue
  fi

  echo "📝 Languages to generate: $MISSING_LANGS"

  # For today's items, use the deterministic aggregator/renderer for the
  # missing languages; for backfill/improvement (legacy HTML-only articles
  # without committed analysis source markdown), fall back to the AI HTML
  # translation path further below.
  if [ "$ITEM_DATE" = "$CURRENT_DATE_CACHED" ] && [ "$IMPROVEMENT_MODE" != "true" ]; then
    # Today's articles: resolve the canonical stable analysis folder for
    # this (date, type) pair and call the deterministic renderer for each
    # missing language. The aggregator skips writes when the target file's
    # mtime ≥ all source artifacts (idempotent re-runs are cheap).
    TYPE_ANALYSIS_DIR=$(scripts/resolve-analysis-dir.sh "$ITEM_DATE" "$TYPE" 2>/dev/null || echo "")
    if [ -z "$TYPE_ANALYSIS_DIR" ] || [ ! -f "$TYPE_ANALYSIS_DIR/manifest.json" ]; then
      echo "⚠️ No committed analysis at $TYPE_ANALYSIS_DIR for ${ITEM_DATE}/${TYPE} — falling through to HTML translation path"
    else
      LANG_ARGS=""
      for L in $(echo "$MISSING_LANGS" | tr ',' ' '); do
        LANG_ARGS="$LANG_ARGS --lang $L"
      done

      # shellcheck disable=SC2086
      npm run generate-article -- --run "$TYPE_ANALYSIS_DIR" $LANG_ARGS

      if [ $? -eq 0 ]; then
        TRANSLATED_TYPES="${TRANSLATED_TYPES:+$TRANSLATED_TYPES,}${ITEM_DATE}:${TYPE}"
        echo "✅ Render completed for ${ITEM_DATE}/${TYPE} (${MISSING_LANGS})"
        continue
      else
        FAILED_TYPES="${FAILED_TYPES:+$FAILED_TYPES,}${ITEM_DATE}:${TYPE}"
        echo "⚠️ Render failed for ${ITEM_DATE}/${TYPE} — continuing with remaining types"
        continue
      fi
    fi
    # fall through to HTML-translation path below if analysis-dir guard tripped
  fi
  # Backfill / improvement / today's-articles-without-committed-analysis path:
  # copy the English HTML for each missing language and let the AI agent
  # translate in Step 3b.
  {
    # Backfill or improvement: copy English article for each missing language
    # The AI agent will translate the content in Step 3b
    EN_SOURCE="news/${ITEM_DATE}-${TYPE}-en.html"
    COPY_COUNT=0
    MARK_COUNT=0
    for LANG in $(echo "$MISSING_LANGS" | tr ',' ' '); do
      LANG_FILE="news/${ITEM_DATE}-${TYPE}-${LANG}.html"
      IS_NEW_COPY="false"
      if [ ! -f "$LANG_FILE" ]; then
        cp "$EN_SOURCE" "$LANG_FILE"
        IS_NEW_COPY="true"
      elif [ "$IMPROVEMENT_MODE" = "true" ] || [ "$FORCE_TRANSLATION" = "true" ]; then
        # File exists but needs improvement/re-translation — append a marker comment
        # so Step 3b's git-diff-based discovery can detect it as a changed file
        echo "<!-- translation-pending: improvement run $(date -u +%Y-%m-%dT%H:%M:%SZ) -->" >> "$LANG_FILE"
        MARK_COUNT=$((MARK_COUNT + 1))
      fi

      # Metadata normalization: only for newly copied files (existing files already have correct metadata)
      if [ "$IS_NEW_COPY" = "true" ]; then
        # Map language to dir and og:locale for comprehensive metadata update
        case "$LANG" in
          ar) LANG_DIR="rtl"; OG_LOCALE="ar_SA" ;;
          he) LANG_DIR="rtl"; OG_LOCALE="he_IL" ;;
          sv) LANG_DIR="ltr"; OG_LOCALE="sv_SE" ;;
          da) LANG_DIR="ltr"; OG_LOCALE="da_DK" ;;
          no) LANG_DIR="ltr"; OG_LOCALE="nb_NO" ;;
          fi) LANG_DIR="ltr"; OG_LOCALE="fi_FI" ;;
          de) LANG_DIR="ltr"; OG_LOCALE="de_DE" ;;
          fr) LANG_DIR="ltr"; OG_LOCALE="fr_FR" ;;
          es) LANG_DIR="ltr"; OG_LOCALE="es_ES" ;;
          nl) LANG_DIR="ltr"; OG_LOCALE="nl_NL" ;;
          ja) LANG_DIR="ltr"; OG_LOCALE="ja_JP" ;;
          ko) LANG_DIR="ltr"; OG_LOCALE="ko_KR" ;;
          zh) LANG_DIR="ltr"; OG_LOCALE="zh_CN" ;;
          *) LANG_DIR="ltr"; OG_LOCALE="${LANG}" ;;
        esac

        # Normalize document-level language metadata and self-referential URLs in the
        # copied file so Step 3b can focus on translating content rather than
        # fixing structural metadata. Scope replacements to page metadata only to avoid
        # rewriting navigation/footer hreflang links or unrelated content.
        # Approved exception to the FORBIDDEN "never write new custom scripts" rule:
        # this inline Node.js snippet is metadata-normalization only for copied
        # placeholder files in the backfill/improvement path, and must not be expanded
        # into general content transformation or new standalone scripting.
        EN_BASENAME=$(basename "$EN_SOURCE")
        LANG_BASENAME=$(basename "$LANG_FILE")
        node -e '
const fs = require("node:fs");
const [filePath, lang, langDir, ogLocale, enName, langName] = process.argv.slice(1);
let c = fs.readFileSync(filePath, "utf8");

// Update document-level <html> and <article> lang/dir attributes only (not nav/footer)
c = c.replace(/(<html\b[^>]*\s)lang="en"/, `$1lang="${lang}"`);
c = c.replace(/(<html\b[^>]*\s)dir="(?:ltr|rtl)"/, `$1dir="${langDir}"`);
c = c.replace(/(<article\b[^>]*\s)lang="en"/, `$1lang="${lang}"`);

// Update JSON-LD inLanguage
c = c.replace(/("inLanguage"\s*:\s*")en(")/g, `$1${lang}$2`);

// Update og:locale meta tag
c = c.replace(/(<meta\s+property="og:locale"\s+content=")[^"]*(")/g, `$1${ogLocale}$2`);

// Update self-referential URL-bearing fields: canonical, og:url, JSON-LD @id/url
// Use targeted replacements on specific tags rather than blanket replaceAll
const enEsc = enName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const urlFieldRe = new RegExp(
  `(<(?:link|meta)\\s[^>]*(?:href|content)=")([^"]*)(")` +
  `|("(?:@id|url|mainEntityOfPage)"\\s*:\\s*")([^"]*)(")`,
  "g"
);
c = c.replace(urlFieldRe, (match, p1, p2, p3, j1, j2, j3) => {
  if (p1) return p1 + p2.replace(new RegExp(enEsc, "g"), langName) + p3;
  if (j1) return j1 + j2.replace(new RegExp(enEsc, "g"), langName) + j3;
  return match;
});

fs.writeFileSync(filePath, c, "utf8");
' "$LANG_FILE" "$LANG" "$LANG_DIR" "$OG_LOCALE" "$EN_BASENAME" "$LANG_BASENAME"
        COPY_COUNT=$((COPY_COUNT + 1))
      fi
    done
    echo "📋 Copied English source to $COPY_COUNT language files for AI translation"
    if [ "$MARK_COUNT" -gt 0 ]; then
      echo "📋 Marked $MARK_COUNT existing files for improvement/re-translation"
    fi
    TRANSLATED_TYPES="${TRANSLATED_TYPES:+$TRANSLATED_TYPES,}${ITEM_DATE}:${TYPE}"
  }
done

echo ""
echo "═══ Generation Summary ═══"
echo "✅ Generated: ${TRANSLATED_TYPES:-none}"
echo "❌ Failed:    ${FAILED_TYPES:-none}"

if [ -z "$TRANSLATED_TYPES" ]; then
  echo "⚠️ All generation attempts failed — will still attempt AI translation of any existing files"
fi

# --- Persist generation results for later steps (sanitized to prevent shell injection) ---
GEN_STATE_FILE="/tmp/gh-aw-translate-generation.sh"
{
  printf 'TRANSLATED_TYPES=%q\n' "${TRANSLATED_TYPES}"
  printf 'FAILED_TYPES=%q\n' "${FAILED_TYPES}"
} > "$GEN_STATE_FILE"
echo "💾 Generation state persisted to $GEN_STATE_FILE"
```

### Step 3 Checkpoint — INTENTIONALLY REMOVED

> **⛔ This workflow no longer calls safeoutputs before translation starts.** A checkpoint at Step 3 with only generator output (English content inside language-tagged shells) is NOT a translation and would create a zero-translation PR (the PR #1346 failure mode). The first `safeoutputs___create_pull_request` call happens ONLY after the first 3 real translations land in Step 3b — see the "🛡️ FIRST PRODUCTIVE FLUSH" section above. Do not add a checkpoint call here.

## Step 3b: AI Translation — Translate English Content

> **THIS IS YOUR PRIMARY TASK — spend 65+ minutes here.** The generator produces articles with localized UI but English narrative. YOU translate ALL English text using the `edit` tool. Do NOT create scripts, dictionaries, or batch tools. Translate directly in each file.

> **⚠️ TRANSLATE MANY FILES, NOT JUST ONE**: You MUST translate at least 5 files per run. Each article has 13 language variants. Translate ALL languages for each article before moving to the next. **Never stop after just 1 file.**

> **⚠️ LANGUAGE CORRECTNESS**: When translating a file like `news/DATE-TYPE-es.html`, you MUST translate to SPANISH (not German, not French). The filename suffix (`-es`, `-de`, `-fr`) tells you the target language. The `<html lang="es">` attribute MUST match the filename. **PR #1186 was caused by writing German content into a Spanish-labeled file — this is unacceptable.**

### 🔁 Periodic Flush (CRITICAL — the #1 data-loss prevention rule after the first flush)

> **Flush numbering starts AT the first productive flush (3 translations complete).** There is no earlier checkpoint to count — call #1 IS the first-productive-flush call that creates the PR. After that, call `safeoutputs___create_pull_request` again after every additional 3 completed translations, using the SAME `base`/`head` so the SAME PR's patch is refreshed. Each call:
>
> 1. **Snapshots the current working directory** into the PR patch — every translated file you have finished since the last call lands in the PR.
> 2. **Refreshes the safeoutputs session idle timer** — without this, the session expires after ~10–20 min of inactivity and every subsequent call returns `"session not found"` (total data loss past the last successful flush).
>
> **Flush schedule for a 13-language single-article run**:
> - After files 1–3 translated and lint-clean → flush #1 (PR is CREATED here — see "🛡️ FIRST PRODUCTIVE FLUSH" section)
> - After files 4–6 → flush #2
> - After files 7–9 → flush #3
> - After files 10–12 → flush #4
> - After file 13 → flush #5 (this is the final Step 5 flush with the quality-scored title/body)
>
> **If a flush returns `"session not found"`**: the session is gone and your remaining files for this run will not be saved. Stop translating, write a short note into `${ANALYSIS_DIR}/summary.md` explaining which files were translated in the working directory but could not be flushed, and END the run. Do NOT keep translating — every additional minute is wasted work. The next manual run (via `gh workflow run "News: Translate Articles"` or `gh workflow run news-translate.lock.yml`) will pick up the gap.

Use this exact javascript pattern for each subsequent periodic flush (calls #2–#5). **Only `base` and `head` MUST be identical to the first-productive-flush call** (that is what causes the SAME PR to be updated instead of a new one being created). `title` and `body` may vary per call — a differing body is fine and actually helps debugging by recording which flush this was:

```javascript
safeoutputs___create_pull_request({
  title: "[news] Translate ${ARTICLE_TYPE_SLUG} — ${ARTICLE_DATE} (N/13 complete)",
  body: "Translation progress for ${ARTICLE_DATE} — periodic flush.",
  base: "main",
  head: "news/translate-${ARTICLE_DATE}"
})
```

### Translation Method

1. List files to translate: `(git diff --name-only -- news/; git ls-files --others --exclude-standard -- news/) | grep -E '^news/.+-(sv|da|no|fi|de|fr|es|nl|ar|he|ja|ko|zh)\.html$'`
2. For each file, **verify the target language from the filename** (e.g., `-es.html` → Spanish, `-de.html` → German)
3. Read the file and the English source, then translate ALL user-visible text to the **correct target language**
4. Use `edit` tool to replace English text with translations, one section at a time
5. Keep unchanged: MEP names, abbreviations (EPP, S&D), reference IDs, HTML tags, CSS, URLs
6. Also translate: `<title>`, `<meta name="description">`, `<meta name="keywords">`, `og:title`, `og:description`, JSON-LD fields
7. **After finishing each file, run HTMLHint** to validate: `npx htmlhint <file>`. Fix ALL errors before starting the next file. Common issues: unclosed tags, duplicate IDs, missing alt attributes.
8. **After every 3 completed + lint-clean files, call `safeoutputs___create_pull_request`** (see Periodic Flush block above) — this is NOT optional. Track your flush cadence explicitly: count completed files and call safeoutputs at counts 3, 6, 9, 12.
9. **Check elapsed time after each file** — stop at 25 minutes and proceed to Step 5

> **⚠️ MANDATORY PER-FILE LINT**: After completing translation of EACH file, you MUST run `npx htmlhint news/DATE-TYPE-LANG.html` and fix any errors BEFORE moving to the next file. Do not defer validation until the end or rely on an end-of-run batch lint as a substitute for this per-file check — catch and fix errors immediately while the file context is fresh. A later batch validation in Step 4 is allowed, but only as an additional backstop. Zero HTMLHint errors per file is required.

> **Improvement mode** (`IMPROVEMENT_MODE=true`): Read both English and existing translation, then improve quality.
> **Throughput**: Process one file completely (translate → lint → fix) before starting the next. Batch `edit` calls within a file.

## Step 4: Validate Translated Articles

```bash
# --- Restore state from previous steps ---
STATE_FILE="/tmp/gh-aw-translate-state.sh"
GEN_STATE_FILE="/tmp/gh-aw-translate-generation.sh"
[ -f "$STATE_FILE" ] && source "$STATE_FILE"
[ -f "$GEN_STATE_FILE" ] && source "$GEN_STATE_FILE"
echo "✅ Restored state: TRANSLATED_TYPES=$TRANSLATED_TYPES LANG_ARG=$LANG_ARG"

if [ -z "${ARTICLE_DATE:-}" ]; then
  ARTICLE_DATE=$(date -u +%Y-%m-%d)
fi
CURRENT_YEAR=$(date -u +%Y)
VALIDATION_FAILURES=0

for ITEM in $(echo "$TRANSLATED_TYPES" | tr ',' ' '); do
  # Parse DATE:TYPE format
  if echo "$ITEM" | grep -q ':'; then
    ITEM_DATE=$(echo "$ITEM" | cut -d: -f1)
    TYPE=$(echo "$ITEM" | cut -d: -f2)
  else
    ITEM_DATE="$ARTICLE_DATE"
    TYPE="$ITEM"
  fi
  echo "Validating translations for: $TYPE (date: $ITEM_DATE)"

  for LANG in $(echo "$LANG_ARG" | tr ',' ' '); do
    FILE="news/${ITEM_DATE}-${TYPE}-${LANG}.html"
    if [ ! -f "$FILE" ]; then
      echo "⚠️ Missing: $FILE"
      VALIDATION_FAILURES=$((VALIDATION_FAILURES + 1))
      continue
    fi

    # Validate HTML structure (use selectors matching repository article validators)
    if ! grep -q 'class="site-header__langs"' "$FILE" 2>/dev/null && ! grep -q 'class="language-switcher"' "$FILE" 2>/dev/null; then
      echo "⚠️ $FILE: Missing required language switcher (site-header__langs or language-switcher)"
      VALIDATION_FAILURES=$((VALIDATION_FAILURES + 1))
    fi
    if ! grep -q 'class="site-header"' "$FILE" 2>/dev/null; then
      echo "⚠️ $FILE: Missing required site header"
      VALIDATION_FAILURES=$((VALIDATION_FAILURES + 1))
    fi

    # HTMLHint validation — final safety net (agent should have linted per-file in Step 3b)
    HTMLHINT_OUTPUT=$(npx htmlhint "$FILE" 2>&1)
    HTMLHINT_STATUS=$?
    if [ "$HTMLHINT_STATUS" -ne 0 ]; then
      echo "❌ $FILE: HTMLHint validation failed — fix before PR"
      echo "$HTMLHINT_OUTPUT" | grep -E '(error|L[0-9])' | head -5 || echo "$HTMLHINT_OUTPUT"
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

    # ── CRITICAL: Untranslated copy detection ──
    # Compare <title> and <h1> against English source to detect files that are
    # just copies of English with lang attribute changed (but no actual translation).
    # This is the #1 quality defect — agent copies English, changes html lang, and submits.
    EN_SOURCE="news/${ITEM_DATE}-${TYPE}-en.html"
    if [ -f "$EN_SOURCE" ]; then
      EN_TITLE=$(grep -oP '<title>\K[^<]+' "$EN_SOURCE" 2>/dev/null | head -1)
      LANG_TITLE=$(grep -oP '<title>\K[^<]+' "$FILE" 2>/dev/null | head -1)
      EN_H1=$(grep -oP '<h1>\K[^<]+' "$EN_SOURCE" 2>/dev/null | head -1)
      LANG_H1=$(grep -oP '<h1>\K[^<]+' "$FILE" 2>/dev/null | head -1)
      # Strip site name suffix for comparison
      EN_TITLE_BASE=$(echo "$EN_TITLE" | sed 's/ | EU Parliament Monitor$//')
      LANG_TITLE_BASE=$(echo "$LANG_TITLE" | sed 's/ | EU Parliament Monitor$//')
      if [ "$EN_TITLE_BASE" = "$LANG_TITLE_BASE" ] && [ "$LANG" != "en" ]; then
        echo "❌ $FILE: UNTRANSLATED COPY — <title> is identical to English source (CRITICAL)"
        echo "   English: $EN_TITLE_BASE"
        echo "   $LANG:    $LANG_TITLE_BASE"
        VALIDATION_FAILURES=$((VALIDATION_FAILURES + 1))
        UNTRANSLATED_COPIES="${UNTRANSLATED_COPIES:-} $FILE"
      fi
      if [ "$EN_H1" = "$LANG_H1" ] && [ "$LANG" != "en" ]; then
        echo "❌ $FILE: UNTRANSLATED COPY — <h1> is identical to English source (CRITICAL)"
        VALIDATION_FAILURES=$((VALIDATION_FAILURES + 1))
      fi
      # Content similarity check: extract body text and compare
      EN_BODY_TEXT=$(sed 's/<[^>]*>//g' "$EN_SOURCE" | tr -s '[:space:]' ' ' | head -c 500)
      LANG_BODY_TEXT=$(sed 's/<[^>]*>//g' "$FILE" | tr -s '[:space:]' ' ' | head -c 500)
      if [ "$EN_BODY_TEXT" = "$LANG_BODY_TEXT" ]; then
        echo "❌ $FILE: UNTRANSLATED COPY — body text identical to English (CRITICAL)"
        VALIDATION_FAILURES=$((VALIDATION_FAILURES + 1))
        UNTRANSLATED_COPIES="${UNTRANSLATED_COPIES:-} $FILE"
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

    # ── Per-file quality score (legacy validate-articles removed April 2026) ──
    # The TS quality scorer was purged in the aggregator-pipeline migration.
    # Translation QA now relies on the structural/linguistic checks above
    # (word count, untranslated markers, broad-English pattern detection,
    # CJK/RTL presence). Leave QUALITY_SCORE/QUALITY_GRADE unset → "n/a"
    # in the per-language summary.
    QUALITY_SCORE=""
    QUALITY_GRADE=""
    # Persist per-file quality data for summary
    QUALITY_DATA="${QUALITY_DATA:-}"
    QUALITY_DATA="${QUALITY_DATA}${LANG}|${QUALITY_SCORE:-n/a}|${QUALITY_GRADE:-n/a}|${WORD_COUNT:-0}|${UNTRANSLATED_COUNT:-0}|${BROAD_ENGLISH:-0}
"

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

    # ── Language mismatch detection (filename vs <html lang> attribute) ──
    # Catches critical bugs like PR #1186: filename said -es (Spanish) but content was lang="de" (German)
    HTML_LANG=$(grep -oP '<html[^>]*\slang="\K[^"]+' "$FILE" 2>/dev/null | head -1)
    if [ -n "$HTML_LANG" ] && [ "$HTML_LANG" != "$LANG" ]; then
      echo "❌ $FILE: LANGUAGE MISMATCH — filename says '$LANG' but <html lang=\"$HTML_LANG\"> (CRITICAL)"
      VALIDATION_FAILURES=$((VALIDATION_FAILURES + 1))
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
  echo "⚠️ Translation validation found $VALIDATION_FAILURES issue(s)"
else
  echo "✅ All translations pass validation"
fi

# ── CRITICAL: Remove untranslated copies from PR ──
# Files detected as identical-to-English copies MUST be excluded.
# They add noise and confuse users into thinking translations are done.
UNTRANSLATED_COPIES="${UNTRANSLATED_COPIES:-}"
REMOVED_COUNT=0
if [ -n "$UNTRANSLATED_COPIES" ]; then
  echo ""
  echo "❌❌❌ UNTRANSLATED COPIES DETECTED — REMOVING FROM PR ❌❌❌"
  echo ""
  echo "The following files are just English content with a changed lang attribute."
  echo "They are NOT actual translations and MUST NOT be included in the PR."
  echo "The agent MUST go back to Step 3b and ACTUALLY TRANSLATE these files."
  echo ""
  for COPY_FILE in $UNTRANSLATED_COPIES; do
    echo "  🗑️ Removing untranslated copy: $COPY_FILE"
    git checkout -- "$COPY_FILE" 2>/dev/null || rm -f "$COPY_FILE" 2>/dev/null || true
    REMOVED_COUNT=$((REMOVED_COUNT + 1))
  done
  echo ""
  echo "⚠️ Removed $REMOVED_COUNT untranslated copies. You MUST translate these files before creating the PR."
  echo "   Go back to Step 3b and translate the removed files properly."
fi

# --- Persist validation results for PR body ---
VAL_STATE_FILE="/tmp/gh-aw-translate-validation.sh"
{
  printf 'VALIDATION_FAILURES=%q\n' "${VALIDATION_FAILURES}"
  printf 'UNTRANSLATED_COPY_COUNT=%q\n' "${REMOVED_COUNT}"
  printf 'QUALITY_DATA=%q\n' "${QUALITY_DATA:-}"
} > "$VAL_STATE_FILE"
echo "💾 Validation state persisted to $VAL_STATE_FILE"
```

## Step 4b: Scope Verification (Prevent Patch Conflicts)

> Revert changes outside `news/` and `analysis/daily/` to prevent patch conflicts. The `git checkout`/`git reset` below are whitelisted.

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

## Step 4c: Translation Analysis (MANDATORY — quality-scored summary)

> **⚠️ MANDATORY**: You MUST complete the analysis summary with ACTUAL data from validation. Do NOT leave placeholder text like "_(to be filled)_". The summary MUST include per-language quality scores and a coverage matrix. See `analysis/daily/2026-04-10/translate-run86/summary.md` for the expected format.

Write the completed translation summary to `${ANALYSIS_DIR}/summary.md`. Use validation data from Step 4 to populate quality grades.

```bash
if [ -z "${ARTICLE_DATE:-}" ]; then
  ARTICLE_DATE=$(date -u +%Y-%m-%d)
fi
RUN_ID="${GITHUB_RUN_NUMBER:-0}"
ANALYSIS_DIR="analysis/daily/${ARTICLE_DATE}/translate-run${RUN_ID}"
mkdir -p "${ANALYSIS_DIR}"

# Restore validation data
VAL_STATE_FILE="/tmp/gh-aw-translate-validation.sh"
[ -f "$VAL_STATE_FILE" ] && source "$VAL_STATE_FILE"

echo "📊 Translation analysis directory: ${ANALYSIS_DIR}/"
echo "📊 Writing quality-scored summary (MANDATORY — no placeholders allowed)"
```

After the bash block above, you MUST use the `edit` tool to write the completed summary to `${ANALYSIS_DIR}/summary.md`. The summary MUST include:

1. **Translation Coverage Matrix** — table showing article types × languages with ✅/❌ status
2. **Quality Assessment** — table with columns: Language | Quality Score | Grade | Word Count | Notes
3. **Terminology Consistency** — at least 3 EP-specific term examples per language
4. **Coverage Gap Analysis** — any missing languages or articles
5. **Improvement Recommendations** — actionable short-term and long-term items

> **❌ NEVER** leave the template placeholders like `_(to be filled)_`. If you don't have data, explain why.
> **❌ NEVER** mark a translation as "in progress" — either it is ✅ Fully translated or ❌ Not translated.
> **✅ DO** use the `QUALITY_DATA` variable from Step 4 validation to populate per-language quality scores.

## Step 5: Create Pull Request

> **🛡️ REMINDER — FINAL FLUSH**: This is your LAST `safeoutputs___create_pull_request` call. If you have been doing periodic flushes every 3 files (as required by Step 3b), this call simply replaces the PR title/body with the quality-scored version and snapshots any last 1–2 files not yet flushed. If you SKIPPED the periodic flushes and this is only your 2nd-ever call, the session is almost certainly expired already and you will lose everything since the checkpoint — this is why Step 3b's Periodic Flush rule is non-negotiable.

#### MANDATORY Git State Safety Check

> Undo accidental git commits — safe output expects uncommitted working directory changes only.
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

> Remove metadata files that conflict with other same-day workflows.

```bash
# --- Restore state from previous steps ---
STATE_FILE="/tmp/gh-aw-translate-state.sh"
GEN_STATE_FILE="/tmp/gh-aw-translate-generation.sh"
VAL_STATE_FILE="/tmp/gh-aw-translate-validation.sh"
[ -f "$STATE_FILE" ] && source "$STATE_FILE"
[ -f "$GEN_STATE_FILE" ] && source "$GEN_STATE_FILE"
[ -f "$VAL_STATE_FILE" ] && source "$VAL_STATE_FILE"
VALIDATION_FAILURES="${VALIDATION_FAILURES:-0}"
UNTRANSLATED_COPY_COUNT="${UNTRANSLATED_COPY_COUNT:-0}"
QUALITY_DATA="${QUALITY_DATA:-}"
echo "✅ Restored state for PR creation: BACKFILL_DATES=$BACKFILL_DATES IMPROVEMENT_MODE=$IMPROVEMENT_MODE VALIDATION_FAILURES=$VALIDATION_FAILURES UNTRANSLATED_COPIES=$UNTRANSLATED_COPY_COUNT"

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
# ── Auto-detect actual translation inventory from working directory ──
# This builds the PR title/body from ACTUAL files, not agent assumptions.
# Prevents mismatches like PR #1186 (title said "Spanish" but file was German).
ALL_TRANSLATED_FILES=$( { git diff --diff-filter=ACMR --name-only 2>/dev/null; git ls-files --others --exclude-standard 2>/dev/null; } | grep '^news/.*\.html$' | grep -v '\-en\.html$' | sort -u)
# Filter to files that actually exist (safety check)
ALL_TRANSLATED_FILES=$(echo "$ALL_TRANSLATED_FILES" | while read -r f; do [ -f "$f" ] && echo "$f"; done)
TOTAL_FILES=$(echo "$ALL_TRANSLATED_FILES" | grep -c '.' 2>/dev/null || echo 0)
echo "📊 Total modified/new translation files: $TOTAL_FILES"

# Build per-language file counts and detect language mismatches
LANG_FLAG_MAP="sv:🇸🇪 da:🇩🇰 no:🇳🇴 fi:🇫🇮 de:🇩🇪 fr:🇫🇷 es:🇪🇸 nl:🇳🇱 ar:🇸🇦 he:🇮🇱 ja:🇯🇵 ko:🇰🇷 zh:🇨🇳"
LANG_NAME_MAP="sv:Swedish da:Danish no:Norwegian fi:Finnish de:German fr:French es:Spanish nl:Dutch ar:Arabic he:Hebrew ja:Japanese ko:Korean zh:Chinese"
LANG_COUNTS=""
MISMATCH_LIST=""
ARTICLE_SET=""
for FILE in $ALL_TRANSLATED_FILES; do
  BASENAME=$(basename "$FILE" .html)
  # Extract language code from filename (last two chars after final hyphen)
  FILE_LANG=$(echo "$BASENAME" | grep -oP '(?<=-)[a-z]{2}$')
  # Verify against <html lang> attribute
  HTML_LANG=$(grep -oP '<html[^>]*\slang="\K[^"]+' "$FILE" 2>/dev/null | head -1)
  if [ -n "$HTML_LANG" ] && [ "$HTML_LANG" != "$FILE_LANG" ]; then
    FILE_NAME=$(basename "$FILE")
    MISMATCH_LIST="${MISMATCH_LIST}$(printf '| `%s` | `%s` | `%s` | ❌ MISMATCH |\n' "$FILE_NAME" "$FILE_LANG" "$HTML_LANG")"
  fi
  # Count per language
  LANG_COUNTS="${LANG_COUNTS} ${FILE_LANG}"
  # Track article types
  ARTICLE_BASE=$(echo "$BASENAME" | sed "s/-${FILE_LANG}$//")
  case ",${ARTICLE_SET}," in
    *,"${ARTICLE_BASE}",*) ;;
    *) ARTICLE_SET="${ARTICLE_SET:+$ARTICLE_SET,}${ARTICLE_BASE}" ;;
  esac
done

# Build language coverage table rows
LANG_TABLE=""
LANG_COVERAGE_SUMMARY=""
for ENTRY in $LANG_FLAG_MAP; do
  L=$(echo "$ENTRY" | cut -d: -f1)
  FLAG=$(echo "$ENTRY" | cut -d: -f2)
  LNAME=""
  for NE in $LANG_NAME_MAP; do
    NL=$(echo "$NE" | cut -d: -f1)
    NM=$(echo "$NE" | cut -d: -f2)
    if [ "$NL" = "$L" ]; then LNAME="$NM"; break; fi
  done
  COUNT=$(echo "$LANG_COUNTS" | tr ' ' '\n' | grep -c "^${L}$" 2>/dev/null || echo 0)
  if [ "$COUNT" -gt 0 ]; then
    LANG_TABLE="${LANG_TABLE}$(printf '| %s %s (`%s`) | %s | ✅ |\n' "$FLAG" "$LNAME" "$L" "$COUNT")"
    LANG_COVERAGE_SUMMARY="${LANG_COVERAGE_SUMMARY}${FLAG}"
  else
    LANG_TABLE="${LANG_TABLE}$(printf '| %s %s (`%s`) | 0 | ⬜ |\n' "$FLAG" "$LNAME" "$L")"
  fi
done

ARTICLE_COUNT=$(echo "$ARTICLE_SET" | tr ',' '\n' | grep -c '.' 2>/dev/null || echo 0)
echo "📊 Articles: $ARTICLE_COUNT | Languages with files: $(echo "$LANG_COUNTS" | tr ' ' '\n' | sort -u | grep -c '.' || echo 0) | Total files: $TOTAL_FILES"

# ── Minimum translation enforcement ──
if [ "$TOTAL_FILES" -lt 5 ]; then
  echo ""
  echo "⚠️⚠️⚠️ INSUFFICIENT TRANSLATIONS: Only $TOTAL_FILES files — MINIMUM 5 REQUIRED ⚠️⚠️⚠️"
  echo ""
  echo "🔄 You MUST go back and translate more files before creating the PR."
  echo "   Find articles needing translation:"
  echo '   for f in $(ls news/*-en.html 2>/dev/null | sort -r | head -30); do'
  echo '     BASE=$(basename "$f" -en.html)'
  echo '     MISSING=$(echo "sv da no fi de fr es nl ar he ja ko zh" | tr " " "\n" | while read L; do [ ! -f "news/${BASE}-${L}.html" ] && echo "$L"; done | tr "\n" "," | sed "s/,$//")'
  echo '     [ -n "$MISSING" ] && echo "NEEDS TRANSLATION: $f -> $MISSING"'
  echo '   done'
  echo ""
  echo "   DO NOT proceed to PR creation until you have at least 5 translated files."
  if [ "$TOTAL_FILES" -eq 0 ]; then
    mkdir -p "${TRANSLATE_ANALYSIS_DIR}"
    cat > "${TRANSLATE_ANALYSIS_DIR}/translation-insufficient.analysis.md" <<EOF
# Translation run produced insufficient translations ($TOTAL_FILES files)

- article_date: ${ARTICLE_DATE}
- run_id: ${RUN_ID}
- minimum_required: 5
- actual: ${TOTAL_FILES}
- action_required: Agent must translate more files before creating PR
EOF
  fi
fi

# Determine branch name — ARTICLE_DATE-keyed (NO RUN_ID) so that repeated
# manual runs for the same date update the SAME PR, giving the reviewer
# exactly ONE translation PR per article-date. Do NOT append ${RUN_ID}.
if [ -z "$RUN_ID" ]; then
  RUN_ID="${GITHUB_RUN_NUMBER:-0}"
fi
if [ -n "$BACKFILL_DATES" ]; then
  FIRST_BACKFILL_DATE=$(echo "$BACKFILL_DATES" | tr ',' '\n' | head -1)
  BRANCH_NAME="news/translate-backfill-${FIRST_BACKFILL_DATE}-${ARTICLE_DATE}"
elif [ "$IMPROVEMENT_MODE" = "true" ]; then
  BRANCH_NAME="news/translate-improve-${ARTICLE_DATE}"
else
  BRANCH_NAME="news/translate-${ARTICLE_DATE}"
fi
echo "Branch: $BRANCH_NAME"

# ── Build PR title and body from ACTUAL file inventory ──
if [ "${VALIDATION_FAILURES:-0}" -gt 0 ]; then
  VAL_ICON="⚠️"; VAL_STATUS="${VALIDATION_FAILURES} issue(s)"
else
  VAL_ICON="✅"; VAL_STATUS="All checks passed"
fi

# Build mismatch warning section (empty if no mismatches)
MISMATCH_SECTION=""
if [ -n "$MISMATCH_LIST" ]; then
  MISMATCH_SECTION="$(printf '\n### ❌ Language Mismatches Detected\n\n| File | Filename Lang | HTML Lang | Status |\n|------|---------------|-----------|--------|\n%s\n> **Action needed**: Files with mismatched language codes may contain wrong-language content.\n' "$MISMATCH_LIST")"
fi

# Dynamic title based on actual content (safe-outputs adds "[news] " prefix automatically)
if [ "$IMPROVEMENT_MODE" = "true" ]; then
  PR_TITLE="✨ Improve translations — ${ARTICLE_DATE} (${TOTAL_FILES} files)"
elif [ -n "$BACKFILL_DATES" ]; then
  PR_TITLE="🌐 Translate articles (backfill) — ${TOTAL_FILES} files across ${ARTICLE_COUNT} articles"
else
  PR_TITLE="🌐 Translate articles — ${ARTICLE_DATE} (${TOTAL_FILES} files, ${ARTICLE_COUNT} articles)"
fi

# Article list for body
ARTICLE_LIST=""
for ART in $(echo "$ARTICLE_SET" | tr ',' '\n'); do
  ARTICLE_LIST="$(printf '%s- `%s`\n' "$ARTICLE_LIST" "$ART")"
done

FILENAME_MATCH_STATUS="✅"
if [ -n "$MISMATCH_LIST" ]; then FILENAME_MATCH_STATUS="❌ Mismatches"; fi

# Determine mode row
MODE_ROW="| 📅 **Mode** | Scheduled translation |"
if [ "$IMPROVEMENT_MODE" = "true" ]; then
  MODE_ROW="| 🔧 **Mode** | Quality improvement |"
elif [ -n "$BACKFILL_DATES" ]; then
  MODE_ROW="| 📅 **Mode** | Backfill (${BACKFILL_DATES}) |"
fi

# Write PR body to temp file with real newlines (not escaped \n)
PR_BODY_FILE="/tmp/gh-aw-pr-body.md"

# ── Build per-language quality table from validation data ──
QUALITY_TABLE=""
if [ -n "${QUALITY_DATA:-}" ]; then
  while IFS='|' read -r QL_LANG QL_SCORE QL_GRADE QL_WORDS QL_UNTRANS QL_ENGLISH; do
    [ -z "$QL_LANG" ] && continue
    # Determine translation status
    QL_STATUS="✅ Translated"
    if [ "${QL_UNTRANS:-0}" -gt 5 ] || [ "${QL_ENGLISH:-0}" -gt 10 ]; then
      QL_STATUS="⚠️ Partial"
    fi
    # Get flag emoji
    QL_FLAG=""
    for FE in $LANG_FLAG_MAP; do
      FL=$(echo "$FE" | cut -d: -f1)
      FF=$(echo "$FE" | cut -d: -f2)
      if [ "$FL" = "$QL_LANG" ]; then QL_FLAG="$FF"; break; fi
    done
    QUALITY_TABLE="${QUALITY_TABLE}$(printf '| %s %s | %s | %s | %s | %s |\n' "$QL_FLAG" "$QL_LANG" "${QL_GRADE:-—}" "${QL_WORDS:-—}" "$QL_STATUS" "${QL_SCORE:-—}")"
  done <<EOF
${QUALITY_DATA}
EOF
fi

cat > "$PR_BODY_FILE" <<PRBODYEOF
## 🌐 EU Parliament Article Translations — ${ARTICLE_DATE}

### 📊 Summary

| Metric | Value |
|--------|-------|
| 📄 **Total files** | ${TOTAL_FILES} |
| 📰 **Articles translated** | ${ARTICLE_COUNT} |
| 🌍 **Languages** | ${LANG_COVERAGE_SUMMARY} |
| ${VAL_ICON} **Validation** | ${VAL_STATUS} |
| 🗑️ **Untranslated copies removed** | ${UNTRANSLATED_COPY_COUNT:-0} |
${MODE_ROW}

### 📰 Articles

${ARTICLE_LIST}

### 🌍 Language Coverage

| Language | Files | Status |
|----------|-------|--------|
${LANG_TABLE}
${MISMATCH_SECTION}

### 📊 Per-Language Quality Scores

| Language | Grade | Words | Translation Status | Score |
|----------|-------|-------|--------------------|-------|
${QUALITY_TABLE:-| _(no quality data)_ | — | — | — | — |}

### ✅ Quality Checks

| Check | Result |
|-------|--------|
| HTML structure | ${VAL_ICON} ${VAL_STATUS} |
| Language attributes | ${VAL_ICON} |
| RTL/CJK layout | ${VAL_ICON} |
| EP terminology | ${VAL_ICON} |
| Filename↔lang match | ${FILENAME_MATCH_STATUS} |
| 🔍 HTMLHint lint | ${VAL_ICON} |
| 🔍 Title/H1 vs English | ${UNTRANSLATED_COPY_COUNT:-0} untranslated copies |
| 📊 Quality scoring | Included above |

### 🔧 Pipeline

- **Source**: English articles from content workflows
- **Method**: AI translation with EP-specific terminology
- **Workflow**: \`news-translate\` (run ${RUN_ID})
- **Quality gate**: Title + H1 + body must differ from English source
PRBODYEOF

# Write PR title to temp file
PR_TITLE_FILE="/tmp/gh-aw-pr-title.txt"
echo "$PR_TITLE" > "$PR_TITLE_FILE"
echo "PR title: $PR_TITLE"
echo "PR body written to: $PR_BODY_FILE ($(wc -l "$PR_BODY_FILE" | awk '{print $1}') lines)"
```

Read `/tmp/gh-aw-pr-title.txt` for the PR title and `/tmp/gh-aw-pr-body.md` for the PR body, then call safeoutputs:

```javascript
// Read the computed PR title and body from the temp files written by the bash block above.
// The title is in /tmp/gh-aw-pr-title.txt and the body in /tmp/gh-aw-pr-body.md.
// IMPORTANT: head MUST be the ARTICLE_DATE-keyed branch `news/translate-${ARTICLE_DATE}`
// (NO `${RUN_ID}`) so that this final flush updates the SAME PR as the first productive
// flush earlier in this run AND as any prior manual run for the same date. This gives
// the reviewer exactly ONE translation PR per article-date.
safeoutputs___create_pull_request({
  title: "<contents of /tmp/gh-aw-pr-title.txt>",
  body: "<contents of /tmp/gh-aw-pr-body.md>",
  base: "main",
  head: `news/translate-${ARTICLE_DATE}`
})
```

## Translation Rules Summary

- **Never translate**: MEP names, political group abbreviations (EPP, S&D), committee codes, procedure IDs, URLs
- **RTL languages** (ar, he): Ensure `dir="rtl"` is set. Use Unicode RTL punctuation for Arabic.
- **CJK languages** (ja, ko, zh): Full-width punctuation. Verify CJK character density ≥ 50 chars.
- **Nordic/EU Core**: Formal register, official EP institution names, gender agreement where required.

## Error Handling

- **Engine crash**: If safeoutputs was called recently (within the last periodic flush), the framework has a patch snapshot up to that flush. Files translated after the last flush are lost.
- **"session not found" from safeoutputs**: The MCP session has expired. **Bounded data loss**: everything up to the last successful flush is already in the PR patch. Files translated since the last flush are lost. DO NOT keep translating — write a short note to `${ANALYSIS_DIR}/summary.md` listing which files were lost and END the run. Periodic flushing (Step 3b) is the ONLY prevention.
- **`git commit` during translation**: NOT recommended — the next flush's diff-vs-base may not include committed files if Step 5's safety reset is not reached.
- **Generator failure**: Log error, continue with remaining types. Move to backfill (Phase 2) if all fail.
- **No English articles today**: Scan backward for missing translations. Improve existing if all complete.
- **MCP unavailable**: Continue without — translation reads existing HTML, not EP API data
- **First-flush failure (before ≥3 translations on disk)**: Do NOT fall back to a placeholder baseline. Let the run end without opening a PR — the user will re-trigger manually. An empty PR is worse than no PR.
- **Missed periodic flush**: If you realize you've translated 4+ files without a flush, call `safeoutputs___create_pull_request` IMMEDIATELY (before translating one more file). Every minute past the 10-min idle threshold increases session-loss risk.
