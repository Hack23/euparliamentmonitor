---
name: "News: Translate Articles"
description: Translates English EU Parliament news articles to 13 other languages. Runs after content workflows generate English articles, ensuring high-quality translations with full linguistic fidelity.
strict: false
on:
  schedule:
    # Run 4x daily on weekdays to keep up with content workflows + clear backlog faster
    # Offset from content workflows: committee-reports(04), propositions(05), motions(06), week-ahead(Fri 07)
    # 09:00 — first pass after morning content workflows complete (~07:00–08:00)
    # 12:00 — midday catch-up, picks up breaking news (00:00/06:00 slots)
    # 15:00 — afternoon pass, clears any remaining gaps from the day
    # 17:00 — late afternoon backfill, maximises daily translation throughput
    - cron: "0 9,12,15,17 * * 1-5"
    # Saturday: 15:00 to avoid conflict with news-weekly-review (09:00 Sat, ~90min run + PR merge ~11:00-12:00)
    - cron: "0 15 * * 6"
    # Sunday: 10:00 — weekend backfill pass (no content workflows run Sunday)
    - cron: "0 10 * * 0"
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

runtimes:
  node:
    version: "25"

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
    - defaults

mcp-servers:
  european-parliament:
    container: "node:25-alpine"
    entrypoint: "npx"
    entrypointArgs: ["-y", "european-parliament-mcp-server@1.2.6", "--timeout", "90000"]
    env:
      EP_REQUEST_TIMEOUT_MS: "90000"
  world-bank:
    container: "node:25-alpine"
    entrypoint: "npx"
    entrypointArgs: ["-y", "worldbank-mcp@1.0.1"]
  memory:
    container: "node:25-alpine"
    entrypoint: "npx"
    entrypointArgs: ["-y", "@modelcontextprotocol/server-memory"]
  sequential-thinking:
    container: "node:25-alpine"
    entrypoint: "npx"
    entrypointArgs: ["-y", "@modelcontextprotocol/server-sequential-thinking"]

tools:
  github:
    toolsets:
      - all
  bash: true
  agentic-workflows: true
  repo-memory:
    branch-name: memory/news-generation
    allowed-extensions: [".md", ".json"]
    max-file-size: 51200
    max-file-count: 50
    max-patch-size: 51200

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
    labels: [agentic-news, analysis-data]
    draft: false
    expires: 14d
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

> **📚 Shared patterns reference**: See [SHARED_PROMPT_PATTERNS.md](SHARED_PROMPT_PATTERNS.md) for EP MCP tool reference, safe outputs, and shared rules. See [ai-driven-analysis-guide.md](../../analysis/methodologies/ai-driven-analysis-guide.md) for the analysis protocol.

## 🚫 MANDATORY Scope Restriction

> **⚠️ CRITICAL — READ FIRST**: This workflow ONLY creates translated article files in the `news/` directory and analysis artifacts in the `analysis/daily/` directory. You MUST NOT modify any other files.

**ALLOWED modifications:**
- ✅ Create new `news/*.html` translation files (non-English only)
- ✅ Read existing `news/*-en.html` English source articles
- ✅ Write analysis artifacts to `analysis/daily/${ARTICLE_DATE}/translate-run${RUN_ID}/`

**FORBIDDEN modifications (will cause patch conflicts and workflow failure):**
- ❌ `news/*-en.html` — NEVER modify English source articles (read-only)
- ❌ `.github/` — NEVER modify workflow or configuration files
- ❌ `test/` / `e2e/` — NEVER modify test files
- ❌ `index*.html` — NEVER modify index pages
- ❌ `package.json` / `package-lock.json` — NEVER modify dependency files

**CONDITIONAL: Minor TypeScript/Script corrections** — see [SHARED_PROMPT_PATTERNS.md](SHARED_PROMPT_PATTERNS.md#minor-typescriptscript-corrections-conditional-allow) for the full policy. In brief: you MAY fix compilation or runtime errors in `src/` or `scripts/` (max 20 lines) when the fix is necessary to complete translation generation. You MUST NOT refactor, add features, or modify tests.

**FORBIDDEN practices (waste time and produce low-quality output):**
- ❌ **Writing new custom scripts in ANY language** — NEVER create new helper scripts (`.js`, `.py`, `.sh`, `.rb`, etc.) in `/tmp/`, the repo, or anywhere else. Use ONLY the existing Node.js/TypeScript toolchain (for example: `npm run build`, `node scripts/...`, `npx tsx src/generators/news-enhanced.ts ...`). NEVER use `python3`, `pip install`, or any Python-based workaround. **Approved exception**: the inline `node -e` snippet in Step 3's backfill/improvement path is permitted for metadata-normalization only (updating `lang`, `dir`, `og:locale`, and self-referential URLs in copied placeholder files). It must NOT be expanded into general content transformation or new standalone scripting
- ❌ **Creating translation dictionary/data files** — NEVER create JSON, JS, or other data files containing translation dictionaries. Translate directly in each HTML file using the `edit` tool
- ❌ **Batch translation via custom code** — NEVER write a script (e.g., `gen-translations.js`) to automate translation. Translate each file individually using the `edit` tool, one file at a time
- ❌ **Search/replace pattern-based translation** — NEVER use `sed`, `awk`, `perl`, `tr`, regex substitution, or ANY text-processing command to **translate narrative content**. The AI must READ the English text, UNDERSTAND its meaning, and WRITE the correct translation. Pattern-based replacement produces garbage translations. (Note: using `grep`, `sed`, or shell tools for non-translation tasks like file listing, path manipulation, or metadata extraction is fine)
- ❌ **Translation lookup tables** — NEVER create a mapping like `{"English phrase": "Translated phrase"}` and then apply it. Each translation must be done by the AI reading context and producing natural-sounding output
- ❌ **Dangerous shell expansion patterns** — NEVER use `${var@P}`, `${!var}`, `eval`, nested command substitutions `$($(..))`, or indirect variable expansion. These will be blocked by the sandbox
- ❌ **Ad-hoc data processing scripts** — Use the existing `scripts/generate-news-enhanced.js` and pipeline tools
- ❌ **Workarounds for existing tools** — If `npm run build` or existing scripts fail, log the error and continue; do NOT reimplement their functionality in another language
- ❌ **Exiting without translating** — NEVER use an analysis-only PR, `safeoutputs___noop`, or any other no-op path as an early-exit shortcut before attempting the required Phase 1/2/3 translation flow. After those phases have been attempted, follow the later workflow rules: if they explicitly require preserved analysis artifacts (for example when `TOTAL_FILES=0`) so a reviewable PR can still be opened, that fallback is allowed

**If you encounter build errors, test failures, or source code bugs:**
- ✅ You MAY apply minor targeted fixes (max 20 lines in `src/`/`scripts/`) to unblock translation generation per [SHARED_PROMPT_PATTERNS.md](SHARED_PROMPT_PATTERNS.md#minor-typescriptscript-corrections-conditional-allow)
- ✅ Log the error and continue with translation if fix is not straightforward
- ✅ The translation generator handles all code logic; your primary job is to RUN it, not overhaul it

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

### 🚨 ALWAYS-TRANSLATE Mandate

> **This workflow MUST ALWAYS produce translated files when possible. If no translations are possible, it produces preserved analysis artifacts for a reviewable PR.**

The workflow follows a **three-phase priority system**:

1. **Phase 1 — Today's articles**: Translate any English articles from today that lack translations
2. **Phase 2 — Historical backfill**: If today has no articles or all are translated, scan backward through the last 30+ days for ANY English articles with missing translations in ANY language
3. **Phase 3 — Quality improvement**: If ALL articles across ALL dates have complete translations (all 13 languages), select recent articles and IMPROVE their translation quality (fix awkward phrasing, improve terminology, make translations read more naturally)

**There is ALWAYS work to do.** NEVER call `safeoutputs___noop`. NEVER create an analysis-only PR without attempting all three phases first. If all phases find no actionable work and `TOTAL_FILES=0`, the workflow creates a preserved analysis summary artifact so a reviewable PR can still be created.

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

| English Term | sv | da | no |
|---|---|---|---|
| European Parliament | Europaparlamentet | Europa-Parlamentet | Europaparlamentet |
| plenary session | plenarsammanträde | plenarmøde | plenumsmøte |
| committee | utskott | udvalg | komité |
| rapporteur | föredragande | ordfører | ordfører |
| legislative procedure | lagstiftningsförfarande | lovgivningsprocedure | lovgivningsprosedyre |
| adopted text | antagen text | vedtaget tekst | vedtatt tekst |
| amendment | ändringsförslag | ændringsforslag | endringsforslag |
| trilogue | trilog | trilog | trilog |
| roll-call vote | omröstning med namnupprop | afstemning ved navneopråb | navneopprop |

| English Term | fi | de | fr |
|---|---|---|---|
| European Parliament | Euroopan parlamentti | Europäisches Parlament | Parlement européen |
| plenary session | täysistunto | Plenarsitzung | séance plénière |
| committee | valiokunta | Ausschuss | commission |
| rapporteur | esittelijä | Berichterstatter | rapporteur |
| legislative procedure | lainsäädäntömenettely | Gesetzgebungsverfahren | procédure législative |
| adopted text | hyväksytty teksti | angenommener Text | texte adopté |
| amendment | tarkistus | Änderungsantrag | amendement |
| trilogue | kolmikantaneuvottelu | Trilog | trilogue |
| roll-call vote | nimenhuutoäänestys | namentliche Abstimmung | vote par appel nominal |

| English Term | es | nl | ar |
|---|---|---|---|
| European Parliament | Parlamento Europeo | Europees Parlement | البرلمان الأوروبي |
| plenary session | sesión plenaria | plenaire vergadering | الجلسة العامة |
| committee | comisión | commissie | اللجنة |
| rapporteur | ponente | rapporteur | المقرر |
| legislative procedure | procedimiento legislativo | wetgevingsprocedure | الإجراء التشريعي |
| adopted text | texto aprobado | aangenomen tekst | النص المعتمد |
| amendment | enmienda | amendement | التعديل |
| trilogue | trílogo | triloog | الحوار الثلاثي |
| roll-call vote | votación nominal | stemming bij naamafroeping | تصويت بنداء الأسماء |

| English Term | he | ja | ko | zh |
|---|---|---|---|---|
| European Parliament | הפרלמנט האירופי | 欧州議会 | 유럽의회 | 欧洲议会 |
| plenary session | מליאה | 本会議 | 본회의 | 全体会议 |
| committee | ועדה | 委員会 | 위원회 | 委员会 |
| rapporteur | מדווח | 報告者 | 보고자 | 报告员 |
| legislative procedure | הליך חקיקה | 立法手続き | 입법절차 | 立法程序 |
| adopted text | טקסט שאומץ | 採択文 | 채택된 문서 | 通过的文本 |
| amendment | תיקון | 修正案 | 개정안 | 修正案 |
| trilogue | טרילוג | 三者協議 | 삼자협의 | 三方谈判 |
| roll-call vote | הצבעה בקריאת שמות | 記名投票 | 기명투표 | 点名投票 |

> For full terminology, consult [EP Multilingual Termbase](https://www.europarl.europa.eu/portal/en) and [IATE](https://iate.europa.eu/).

### 🗣️ Per-Language Register & Style Guidelines

Apply these language-specific conventions in addition to the terminology table above:

| Language | Register | Key Style Notes |
|----------|----------|-----------------|
| **sv** Swedish | Formal | Use *Europaparlamentet* (one word). Political groups: EPP→*Europeiska folkpartiet*, S&D→*Progressiva alliansen*. Formal pronoun *ni* in UI; avoid passive overuse. |
| **da** Danish | Formal | Use *Europa-Parlamentet* (hyphenated). Capitalise *Kommissionen*, *Rådet*. Avoid anglicised constructions; prefer Danish word order. |
| **no** Norwegian | Formal (Bokmål) | Use *Europaparlamentet*. Prefer Bokmål over Nynorsk. Political process terms follow EU Norwegian terminology. |
| **fi** Finnish | Formal | Use *Euroopan parlamentti*. Finnish requires correct case endings on all EP institution names. Avoid calque constructions from Swedish. |
| **de** German | Formal | Capitalise ALL nouns (e.g., *der Ausschuss*, *die Abstimmung*). Use *Europäisches Parlament* (full form) on first use; *EP* on subsequent use. Political groups translated per their German official names. |
| **fr** French | Formal | Use *le Parlement européen* (lower-case *e*). Gendered agreement required. Use *la Commission européenne*, *le Conseil*. Prefer passive constructions for formal EP texts. |
| **es** Spanish | Formal | Use *el Parlamento Europeo*. Gender agreement required. Formal register (*usted* forms). Use *comisión* for committee. |
| **nl** Dutch | Formal | Use *het Europees Parlement*. Compound nouns written together or hyphenated per Dutch rules. Use *commissie* for committee. |
| **ar** Arabic | Formal (Modern Standard) | Right-to-left. Use *البرلمان الأوروبي*. Formal MSA — no colloquial Arabic. Verify `dir="rtl"` is present (set by metadata normalization in Step 3) and use Arabic Unicode punctuation (،، ؟). Numbers in Eastern Arabic (٠١٢…) or Western per article style. |
| **he** Hebrew | Formal | Right-to-left. Use *הפרלמנט האירופי*. Modern formal Hebrew; no archaisms. Verify `dir="rtl"` is present (set by metadata normalization in Step 3). Numbers typically Western (0-9) for EP statistical data. |
| **ja** Japanese | Formal (敬体) | Use *欧州議会* (not *ヨーロッパ議会*). Formal desu/masu style for UI; da/de aru for narrative. Full-width punctuation (。、「」). Katakana for foreign loan words only where no kanji exists. |
| **ko** Korean | Formal (격식체) | Use *유럽의회*. Formal 합쇼체 register. Full-width CJK punctuation. Hanja rarely needed — hangul preferred. |
| **zh** Chinese (Simplified) | Formal | Use *欧洲议会* (not *欧洲国会* or *欧盟议会*). Formal written Chinese. Full-width punctuation (。，「」). No Traditional Chinese characters. |

### 🎯 Translation Quality Dimensions

Each translated article must score well on these 5 dimensions:

1. **Accuracy** (40%): Factual fidelity to the English source — zero additions, zero omissions of substantive claims
2. **Fluency** (20%): Reads naturally in the target language — not "translationese"
3. **Terminology** (20%): Uses official EP/EU institutional vocabulary — not informal or ad-hoc translations
4. **Completeness** (10%): Every section, SWOT entry, stakeholder perspective, and confidence marker is present
5. **Formatting** (10%): RTL/CJK layout correct, locale-appropriate number formatting, emoji markers preserved

### ⚡ Throughput Strategy (clear backlog efficiently)

When multiple article–language pairs are queued (backfill mode), maximise throughput by:

1. **Process one file completely** before starting the next — do not interleave edits across files
2. **Batch `edit` calls within a file** — translate entire sections (e.g., all `<p>` tags in a section) in one `edit` call rather than one `edit` per sentence
3. **Prioritise structural completeness** over perfect fluency for backfill runs — ensure every section is translated even if quality review comes in a later improvement-mode run
4. **Use the terminology tables above verbatim** — do not re-derive institution names; copy from the table to ensure consistency
5. **Check elapsed time after each file** (not each section) — if time is running short, complete the current file and stop

## ⏱️ Time Budget (90 minutes)

- **Minute ~3**: **🛡️ CHECKPOINT** — call `safeoutputs___create_pull_request` immediately after baseline analysis is created (Date Context Establishment — see the CHECKPOINT section below). This is your crash-resilience checkpoint. ALL subsequent work (generator output, translations) is automatically captured in this PR even if the engine crashes afterward.
- **Minutes 0–5**: Date validation, discover English articles, set up MCP gateway
- **Minutes 5–20**: Generate article HTML files using the TypeScript generator (Step 3)
- **Minutes 20–75**: **AI Translation** — translate English narrative content per file (Step 3b)
- **Minutes 75–82**: Validate translated HTML files (Step 4)
- **Minutes 82–88**: Final PR confirmation (checkpoint PR already created at minute ~3; if NOT yet called, call `safeoutputs___create_pull_request` now)

> **🔑 TRANSLATION FOCUS**: The generator produces articles with localized UI but English narrative. YOU translate ALL English content.

> **⚠️ HARD DEADLINE**: Translation MUST stop by minute 75 to leave time for validation and PR creation. If you did NOT call `safeoutputs___create_pull_request` at the minute ~3 checkpoint, you MUST call it before minute 86. Partial translations in a PR are better than a timeout with no PR.

> **🛡️ EARLY SAFE OUTPUT — CRITICAL FOR ENGINE CRASH RESILIENCE**: The Copilot engine may terminate unexpectedly due to transient authentication failures — typically at minute 10–20 into the run. To protect your work, call `safeoutputs___create_pull_request` **immediately after the baseline analysis summary is created in Date Context Establishment (minute ~3)**, before running MCP health checks, discovery, or the generator. The framework captures ALL files in the working directory when the agent job ends (whether normally or due to a crash), so translations completed AFTER the safeoutputs call are still included in the PR. If you have NOT yet called safeoutputs and the engine crashes, ALL work is lost. **Call it at minute ~3 right after the baseline summary is written, then keep working.**

## MANDATORY MCP Health Gate

Before starting any translation work, verify that MCP servers required by this workflow are available. The translate workflow uses `european-parliament` MCP for supplemental context (not required for core translation), `memory` for cross-run terminology tracking, and `sequential-thinking` for complex translation decisions.

> **⚡ SPEED NOTE**: The EP MCP health check is helpful but **NOT required** for translation. If the EP API is unreachable, log a warning and continue — the translate workflow reads existing English HTML articles, it does not need EP API data. Do NOT spend more than 2 minutes total on health checks. Minimise retries and wait times to preserve the time budget for translation work.

### Step 0: EP API Connectivity & AWF Firewall Pre-Check (bash)

Run a comprehensive network diagnostic **before** the MCP health gate to detect AWF firewall blocks, DNS failures, and EP API outages instantly:

```bash
echo "=== AWF FIREWALL & EP API DIAGNOSTIC ==="
echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

# 1. DNS resolution check
echo "--- DNS Resolution ---"
if command -v getent >/dev/null 2>&1; then
  DNS_EXIT=0
  DNS_OUTPUT=$(set -o pipefail; getent hosts data.europarl.europa.eu | head -5) || DNS_EXIT=$?
  if [ $DNS_EXIT -eq 0 ] && [ -n "$DNS_OUTPUT" ]; then
    printf '%s\n' "$DNS_OUTPUT"
  else
    echo "DNS FAILED — AWF may be blocking DNS"
  fi
elif command -v nslookup >/dev/null 2>&1; then
  DNS_EXIT=0
  DNS_OUTPUT=$(set -o pipefail; nslookup data.europarl.europa.eu 2>&1 | head -5) || DNS_EXIT=$?
  if [ $DNS_EXIT -eq 0 ] && [ -n "$DNS_OUTPUT" ]; then
    printf '%s\n' "$DNS_OUTPUT"
  else
    echo "DNS FAILED — AWF may be blocking DNS"
  fi
else
  echo "DNS FAILED — neither getent nor nslookup is available"
fi

# 2. Direct HTTP connectivity (bypasses MCP server)
echo "--- EP API Direct HTTP Check ---"
if EP_STATUS=$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 30 "https://data.europarl.europa.eu/api/v2/meps?format=application%2Fld%2Bjson&offset=0&limit=1" 2>/dev/null); then
  EP_CURL_EXIT=0
else
  EP_CURL_EXIT=$?
fi
EP_STATUS="${EP_STATUS:-000}"
case "$EP_CURL_EXIT" in
  0)  echo "EP API HTTP Status: $EP_STATUS" ;;
  6)  echo "EP API HTTP Status: $EP_STATUS (curl exit $EP_CURL_EXIT: DNS resolution failed)" ;;
  7)  echo "EP API HTTP Status: $EP_STATUS (curl exit $EP_CURL_EXIT: connection failed)" ;;
  28) echo "EP API HTTP Status: $EP_STATUS (curl exit $EP_CURL_EXIT: operation timed out)" ;;
  *)  echo "EP API HTTP Status: $EP_STATUS (curl exit $EP_CURL_EXIT: transport/TLS/other client error)" ;;
esac

# 3. Network reachability
echo "--- Network Reachability ---"
for host in data.europarl.europa.eu github.com api.github.com; do
  timeout 5 bash -c "echo >/dev/tcp/$host/443" 2>/dev/null && \
    echo "$host:443 REACHABLE" || echo "$host:443 UNREACHABLE (AWF firewall?)"
done

# 4. MCP environment check
echo "--- MCP Environment ---"
echo "EP_REQUEST_TIMEOUT_MS=${EP_REQUEST_TIMEOUT_MS:-NOT SET (default 60000)}"

# 5. Diagnosis (uses curl exit code to distinguish DNS/connect/timeout failures)
if [ "$EP_CURL_EXIT" -eq 6 ]; then
  echo "⚠️ EP API DNS FAILURE (curl exit 6) — AWF firewall blocking DNS resolution"
  echo "   Translation can still proceed with existing English articles."
elif [ "$EP_CURL_EXIT" -eq 7 ]; then
  echo "⚠️ EP API CONNECTION REFUSED (curl exit 7) — AWF firewall blocking HTTPS"
  echo "   Translation can still proceed with existing English articles."
elif [ "$EP_CURL_EXIT" -eq 28 ]; then
  echo "⚠️ EP API TIMEOUT (curl exit 28) — EP API slow, not a firewall issue"
  echo "   Translation can still proceed with existing English articles."
elif [ "$EP_STATUS" = "000" ]; then
  echo "⚠️ EP API UNREACHABLE (HTTP 000, curl exit $EP_CURL_EXIT) — transport/TLS error"
  echo "   Translation can still proceed with existing English articles."
elif [ "$EP_STATUS" -ge 500 ] 2>/dev/null; then
  echo "⚠️ EP API SERVER ERROR (HTTP $EP_STATUS) — EP MCP health gate may fail. Translation can still proceed."
elif [ "$EP_STATUS" = "200" ]; then
  echo "✅ EP API reachable and responding (HTTP 200)"
fi
```

### EP MCP Health Check (helpful but NOT required for translation)

1. Call `european_parliament___get_plenary_sessions({ limit: 1 })` — if successful, EP MCP is healthy
2. If it fails, wait 10 seconds and retry (**1 retry only** — max 2 total attempts to save time)
3. If both attempts fail:
   - Log a brief warning: "⚠️ EP MCP unavailable — continuing without EP context (not needed for translation)"
   - Continue with translation immediately — existing English articles can be translated without EP MCP
   - Do NOT noop, do NOT call `get_server_health`, do NOT spend additional time diagnosing

**Implementation pattern** — execute this check quickly:

```javascript
// EP MCP Health Gate — quick check, not required for translation
european_parliament___get_plenary_sessions({ limit: 1 })
// If it fails once, retry after 10s. If still fails, log warning and move on.
// Translation reads existing English HTML files — EP API data is supplemental only.
```

### Memory MCP Health Check (helpful but not required)

1. Call `memory___read_graph({})` — if successful, the memory MCP server is healthy
2. If it fails, wait 10 seconds and retry (**1 retry only** — max 2 total attempts)
3. If both attempts fail:
   - Log the warning: "⚠️ Memory MCP server unavailable — proceeding without cross-run terminology tracking"
   - Continue with translation (memory is helpful but NOT required for core translation)

```javascript
// Memory MCP Health Gate — verify memory server availability
memory___read_graph({})
// If the call succeeds, proceed to Date Context Establishment below.
// If it fails after 1 retry (10s wait), log a warning and continue.
```

> **NOTE**: Both EP MCP and Memory MCP are declared in `mcp-servers:` and MUST be health-checked. The translate workflow should NEVER noop solely because one MCP server is unavailable — partial results are always better than no results. Keep total health check time under 2 minutes.

## MANDATORY Date Context Establishment

**⚠️ ALWAYS run this block FIRST (immediately after the MCP Health Gate above).**

```bash
echo "=== Translation Date Context ==="
TODAY=$(date -u +%Y-%m-%d)
ARTICLE_DATE="${{ github.event.inputs.article_date }}"
if [ -z "$ARTICLE_DATE" ]; then
  ARTICLE_DATE="${EP_ARTICLE_DATE:-$TODAY}"
fi
CURRENT_YEAR=$(date -u +%Y)
DAY_OF_WEEK=$(date -u +%A)
START_EPOCH=$(date +%s)
TRANSLATION_DEADLINE_MIN=75
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

## 🛡️ CHECKPOINT: Immediate Safe Output (minute ~3)

> **⚡ MANDATORY — DO THIS NOW, BEFORE ANY OTHER STEP**: Call `safeoutputs___create_pull_request` **immediately** after the Date Context Establishment block above creates the baseline analysis summary. Do NOT wait until after the generator or translations. The framework captures ALL files in the working directory when the agent job ends — translations done AFTER this call are included in the PR automatically.

**Why so early?** The Copilot engine may crash at minute 10–20 due to transient authentication failures. If that happens before a safeoutputs call is made, ALL work is lost and no PR is created. By calling it at minute ~3 (when the baseline analysis file already exists), you guarantee that at minimum the analysis artifact is preserved, and that all subsequent generator output and translations are automatically captured in the same PR.

Call safeoutputs now with:
- **title**: `Translate articles checkpoint — ${ARTICLE_DATE} (run ${RUN_ID})` (use the ARTICLE_DATE and RUN_ID variables from the bash block above; the `[news] ` prefix is added automatically)
- **body**: Baseline translation analysis checkpoint. Engine crash resilience PR — generator output and AI translations will be added to this PR automatically as the agent continues working.
- **base**: `main`
- **head**: `news/translate-${ARTICLE_DATE}-${RUN_ID}` (use ARTICLE_DATE and RUN_ID from above)

> **After calling safeoutputs**: continue immediately with Pre-flight, Step 1 (discovery), Step 3 (generator), and Step 3b (AI translation). Do NOT stop. The PR title remains as set above, but all subsequent translations are automatically captured as file changes in this PR.

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

> **🚨 MANDATORY RULE — NEVER EXIT WITHOUT A PR**: This workflow MUST ALWAYS attempt translations. If today's articles are all translated, scan backward through older dates. If ALL articles across ALL dates are 100% translated, improve the quality of existing translations. There is ALWAYS work to do. **NEVER** call `safeoutputs___noop`. If all three phases find no actionable work and `TOTAL_FILES=0`, the workflow creates a preserved analysis artifact so a reviewable PR can still be produced.

Find English articles that need translation — starting with today, then scanning backward:

```bash
# Re-derive date context (env vars do NOT persist across bash blocks in gh-aw)
TODAY=$(date -u +%Y-%m-%d)
ARTICLE_DATE="${{ github.event.inputs.article_date }}"
if [ -z "$ARTICLE_DATE" ]; then
  ARTICLE_DATE="${EP_ARTICLE_DATE:-$TODAY}"
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

        # Limit backfill to a manageable batch (max 10 article types per run)
        ITEM_COUNT=$(echo "$NEEDS_TRANSLATION" | tr ',' '\n' | wc -l)
        if [ "$ITEM_COUNT" -ge 10 ]; then
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

  # Pick the 2 most recent dates with translations to improve
  IMPROVE_DATES=$(ls news/*-en.html 2>/dev/null | sed 's|news/||;s|-[a-z].*||' | sort -ru | head -2)
  for CHECK_DATE in $IMPROVE_DATES; do
    for EN_FILE in news/${CHECK_DATE}-*-en.html; do
      [ ! -f "$EN_FILE" ] && continue
      TYPE=$(echo "$EN_FILE" | sed "s|news/${CHECK_DATE}-||;s|-en\.html||")
      NEEDS_TRANSLATION="${NEEDS_TRANSLATION:+$NEEDS_TRANSLATION,}${CHECK_DATE}:${TYPE}"
      echo "✨ Will improve translations: ${CHECK_DATE}/${TYPE}"
      # Enforce item cap inside per-file loop (same pattern as backfill)
      ITEM_COUNT=$(echo "$NEEDS_TRANSLATION" | tr ',' '\n' | wc -l)
      if [ "$ITEM_COUNT" -ge 2 ]; then
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

**Use the TypeScript generator to produce article HTML files.** The generator produces articles with:
- ✅ **Localized UI**: Headings, navigation, labels, date formatting — all in the target language
- ⚠️ **English narrative content**: The narrative analysis (what, why, impact, outlook, stakeholders) is generated in **English** without any markers. You MUST translate ALL English content.

> The generator handles structural localization. **Step 3b** (below) handles ALL narrative content translation — this is where YOU (the AI agent) **read the entire file, identify every English sentence, and translate it** to the target language. There are NO `lang="en"` markers — read every paragraph and translate all English text.

> ⚠️ **CRITICAL — MCP env vars and the generation script MUST run in the same bash block.**

> **📅 BACKFILL/IMPROVEMENT MODE**: For articles from older dates (backfill) or improvement mode, the TypeScript generator is NOT used (it only works for today's date). Instead, the AI must:
> 1. Read the existing English article (`news/${ITEM_DATE}-${TYPE}-en.html`)
> 2. For each missing language, the workflow copies the English article to create `news/${ITEM_DATE}-${TYPE}-${LANG}.html`
> 3. Then YOU (the AI) translate ALL English content in the copy using the `edit` tool (Step 3b)

```bash
# --- Re-initialize time tracking (env vars do NOT persist across bash blocks) ---
START_EPOCH=$(date +%s)
TRANSLATION_DEADLINE_MIN=75
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
    npm install --no-save european-parliament-mcp-server@1.2.6
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

  # For today's items, use the generator; for backfill/improvement, copy English and prepare for AI translation
  if [ "$ITEM_DATE" = "$CURRENT_DATE_CACHED" ] && [ "$IMPROVEMENT_MODE" != "true" ]; then
    # Today's articles: use the TypeScript generator
    SKIP_FLAG=""
    if [ "$FORCE_TRANSLATION" != "true" ]; then
      SKIP_FLAG="--skip-existing"
    fi

    npx tsx src/generators/news-enhanced.ts \
      --types="$TYPE" \
      --languages="$MISSING_LANGS" \
      $SKIP_FLAG

    if [ $? -eq 0 ]; then
      TRANSLATED_TYPES="${TRANSLATED_TYPES:+$TRANSLATED_TYPES,}${ITEM_DATE}:${TYPE}"
      echo "✅ Generation completed for ${ITEM_DATE}/${TYPE}"
    else
      FAILED_TYPES="${FAILED_TYPES:+$FAILED_TYPES,}${ITEM_DATE}:${TYPE}"
      echo "⚠️ Generation failed for ${ITEM_DATE}/${TYPE} — continuing with remaining types"
    fi
  else
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
  fi
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

### 🛡️ Step 3 Checkpoint: Safe Output Fallback (If Minute ~3 Checkpoint Was Missed)

> **⚠️ ONLY if you did NOT call `safeoutputs___create_pull_request` at the minute ~3 checkpoint in Date Context Establishment**: Call it NOW, immediately after Step 3 generates the HTML files and BEFORE starting AI translation. The framework captures the working directory state when the agent job ends (whether normally or due to a crash), so files you translate in Step 3b AFTER this call are still included in the PR.

> **If you already called safeoutputs at the minute ~3 checkpoint**: Skip this step — max 1 PR per run. Continue directly to Step 3b for AI translation.

Call `safeoutputs___create_pull_request` if NOT already called, using:
- **title**: `Translate articles checkpoint — ${ARTICLE_DATE} (run ${RUN_ID})` (the `[news] ` prefix is added automatically)
- **body**: Translation checkpoint for ${ARTICLE_DATE}. Generator output and AI translations will be added to this PR automatically as the agent continues working.
- **base**: `main`
- **head**: `news/translate-${ARTICLE_DATE}-${RUN_ID}`

```javascript
// FALLBACK: Call safeoutputs only if NOT already called at minute ~3 checkpoint
// If already called, skip this block — continue to Step 3b directly
safeoutputs___create_pull_request({
  title: "Translate articles checkpoint — ${ARTICLE_DATE} (run ${RUN_ID})",
  body: "Translation checkpoint for ${ARTICLE_DATE}. Generator output and AI translations captured automatically.",
  base: "main",
  head: "news/translate-${ARTICLE_DATE}-${RUN_ID}"
})
// Continue to Step 3b — all subsequent file edits are captured automatically
```

## Step 3b: AI Translation — Translate English Content

> **🚨 CORE STEP — THIS IS THE MOST IMPORTANT STEP**: The generator produces articles with localized UI but **English narrative content**. YOU (the AI agent) MUST read each file and translate ALL English text to the target language. This is pure AI translation work — you read English, you think in the target language, you write the translation using the `edit` tool.

> **⛔ ABSOLUTE PROHIBITION — AI DOES ALL TRANSLATION WORK**: You MUST NEVER create any script, code, dictionary, translation map, JSON file, search/replace pattern, regex-based bulk replacement, sed command, awk command, Python script, Node.js script, or ANY other programmatic approach to translate **narrative or user-visible content**. The AI (YOU) must read the English text, understand its meaning, and write the correct translation in the target language. Use ONLY the `edit` tool to replace English text with translated text in each HTML file. **Any attempt to automate translation via code is a CRITICAL violation.** Limited non-translation mechanical edits explicitly required elsewhere in this workflow — for example updating a copied file's `lang` attribute or similarly narrow metadata-only adjustments — are allowed and are NOT considered automated translation.

> **⛔ REMINDER — NO GIT COMMANDS**: Use the `edit` tool to update translation files, one file and one section at a time. NEVER run `git add`, `git commit`, or any git command. Files MUST remain as uncommitted working directory changes for the PR creation step to work.

> **⛔ NEVER CREATE HELPER SCRIPTS OR TRANSLATION DICTIONARY/BATCH FILES**: Do NOT create new script files (e.g., `gen-translations.js`, `translate.sh`) or translation helper data files (e.g., `translations.json`, `dictionaries.js`) in `/tmp/` or anywhere else to perform or stage translations indirectly. Translate DIRECTLY in each HTML file using the `edit` tool. **This prohibition does NOT apply to repo-memory logs or analysis artifacts explicitly required elsewhere in this workflow** (for example `/tmp/gh-aw/repo-memory/.../translation-log.json`). Creating translation helper scripts or dictionary/batch artifacts wastes time, risks tool call failures on large files, and violates the FORBIDDEN practices above.

> **⏱️ TIME MANAGEMENT**: Check elapsed time after each article type. If 75+ minutes elapsed, SKIP remaining translations and proceed directly to Step 5 (PR creation). Partial translations are acceptable.

> **✨ IMPROVEMENT MODE**: When `IMPROVEMENT_MODE=true`, the files already contain translations. Read both the English source and the existing translation, then improve the translation quality — fix awkward phrasing, improve terminology, ensure EP official vocabulary is used, and make the text read more naturally in the target language.

### Translation Method (MANDATORY — follow exactly)

For each non-English article file (from Step 3 generation, backfill, or improvement), process **one file at a time**:

1. **Derive the translation target list for this run only** by listing tracked changes and untracked new files under `news/`, then keeping only non-English HTML articles: `(git diff --name-only -- news/; git ls-files --others --exclude-standard -- news/) | grep -E '^news/.+-(sv|da|no|fi|de|fr|es|nl|ar|he|ja|ko|zh)\.html$'`
2. **Do not** use a repository-wide glob such as `ls news/*-{sv,da,no,fi,de,fr,es,nl,ar,he,ja,ko,zh}.html`, because that can include historical translations outside the current run
3. **For each changed file** `news/<DATE>-<TYPE>-<LANG>.html`:
4. **Read** the target file with `cat news/<DATE>-<TYPE>-<LANG>.html`
5. **Read** the English source with `cat news/<DATE>-<TYPE>-en.html`
6. **Identify** English text in ALL user-visible elements: `<h1>`, `<h2>`, `<h3>`, `<p>`, `<li>`, `<td>`, `<th>`, `<span>`, `<div>`, `<a>` (link text), `<figcaption>`, `<blockquote>`, and `<title>`
7. **Translate** to the target language using EP terminology standards (see table above)
8. **Write back** the translated content using the `edit` tool — replace old English text with translated text, one section at a time
9. **Keep unchanged**: proper nouns (MEP names), abbreviations (EPP, S&D), reference IDs, location names, HTML tags, CSS classes, URLs

**Also translate these SEO and structured data elements:**
- `<title>` tag — translate the page title (keep `| EU Parliament Monitor` suffix)
- `<meta name="description" content="...">` — translate the description content
- `<meta name="keywords" content="...">` — translate keywords to the target language
- `<meta property="og:title" content="...">` — translate the Open Graph title
- `<meta property="og:description" content="...">` — translate the OG description
- `<meta property="og:image:alt" content="...">` — translate the image alt text
- `<script type="application/ld+json">` — translate `headline`, `description`, and `keywords` fields in the JSON-LD structured data blocks
- **Do NOT change**: `og:locale`, `og:url`, `og:site_name`, schema.org `@context`/`@type`, `datePublished`, `dateModified`, author names, or any URLs

> **⚠️ CRITICAL APPROACH**: Process ONE file, then ONE section within that file, using `edit` tool calls. Do NOT try to create a batch translation script or a translation dictionary data file. The `edit` tool replaces specific text in a file — use it to swap English paragraphs for translated paragraphs.

Translate ALL narrative content: headings, analysis, stakeholder perspectives, impact assessments, SWOT entries, outlook, footer disclaimers, alt text, SEO metadata, and structured data.

**Quality checklist per article:**
- [ ] All headings (`<h1>`–`<h3>`), table headers (`<th>`), and link text are translated
- [ ] All list items and table cells with descriptions are translated
- [ ] SEO meta tags (`title`, `description`, `keywords`) are translated
- [ ] Open Graph tags (`og:title`, `og:description`, `og:image:alt`) are translated
- [ ] JSON-LD structured data (`headline`, `description`, `keywords`) is translated
- [ ] EP terminology follows the official vocabulary table above
- [ ] Confidence markers (🟢/🟡/🔴) are preserved with translated labels
- [ ] Vote counts and percentages are numerically identical to English source
- [ ] The article reads naturally in the target language (not "translationese")

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

# --- Persist validation results for PR body ---
VAL_STATE_FILE="/tmp/gh-aw-translate-validation.sh"
printf 'VALIDATION_FAILURES=%q\n' "${VALIDATION_FAILURES}" > "$VAL_STATE_FILE"
echo "💾 Validation state persisted to $VAL_STATE_FILE"
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

> **🛡️ REMINDER — SAFE OUTPUT**: If you have NOT already called `safeoutputs___create_pull_request` (as instructed in the minute ~3 checkpoint in Date Context Establishment, or in the Step 3 fallback), call it NOW. This is the last chance — you MUST call it before minute 86. Files generated after this call are still captured if the agent job continues.

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
# --- Restore state from previous steps ---
STATE_FILE="/tmp/gh-aw-translate-state.sh"
GEN_STATE_FILE="/tmp/gh-aw-translate-generation.sh"
VAL_STATE_FILE="/tmp/gh-aw-translate-validation.sh"
[ -f "$STATE_FILE" ] && source "$STATE_FILE"
[ -f "$GEN_STATE_FILE" ] && source "$GEN_STATE_FILE"
[ -f "$VAL_STATE_FILE" ] && source "$VAL_STATE_FILE"
VALIDATION_FAILURES="${VALIDATION_FAILURES:-0}"
echo "✅ Restored state for PR creation: BACKFILL_DATES=$BACKFILL_DATES IMPROVEMENT_MODE=$IMPROVEMENT_MODE VALIDATION_FAILURES=$VALIDATION_FAILURES"

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
# Count ALL newly generated/modified non-English HTML files (not just today's date)
TRANSLATED_COUNT=$(git diff --name-only 2>/dev/null | grep '^news/.*\.html$' | grep -v '\-en\.html$' | wc -l | tr -d ' ')
UNTRACKED_COUNT=$(git ls-files --others --exclude-standard 2>/dev/null | grep '^news/.*\.html$' | grep -v '\-en\.html$' | wc -l | tr -d ' ')
TOTAL_FILES=$((TRANSLATED_COUNT + UNTRACKED_COUNT))
echo "📊 Total modified/new translation files: $TOTAL_FILES"
if [ "$TOTAL_FILES" -eq 0 ]; then
  echo "⚠️ No translated non-English news/*.html changes were detected."
  echo "ℹ️ This can happen when translation targets are already up to date or improvement mode produced no HTML edits."
  echo "ℹ️ Creating a preserved analysis summary so branch and PR creation can still proceed."
  mkdir -p "${TRANSLATE_ANALYSIS_DIR}"
  cat > "${TRANSLATE_ANALYSIS_DIR}/translation-no-html-changes.analysis.md" <<EOF
# Translation run produced no non-English HTML changes

- article_date: ${ARTICLE_DATE}
- run_id: ${RUN_ID}
- improvement_mode: ${IMPROVEMENT_MODE:-false}
- reason: Translation targets were already up to date, or refinement produced no HTML edits.

This summary is intentionally written so the workflow can still create a reviewable PR with preserved analysis artifacts instead of hard-failing before branch/PR creation.
EOF
fi

# Determine branch name — include backfill info if applicable
if [ -n "$BACKFILL_DATES" ]; then
  FIRST_BACKFILL_DATE=$(echo "$BACKFILL_DATES" | tr ',' '\n' | head -1)
  BRANCH_NAME="news/translate-backfill-${FIRST_BACKFILL_DATE}-${ARTICLE_DATE}"
elif [ "$IMPROVEMENT_MODE" = "true" ]; then
  BRANCH_NAME="news/translate-improve-${ARTICLE_DATE}"
else
  BRANCH_NAME="news/translate-${ARTICLE_DATE}"
fi
echo "Branch: $BRANCH_NAME"

# Build PR title and body — reflect actual validation results
if [ "${VALIDATION_FAILURES:-0}" -gt 0 ]; then
  VAL_STATUS="⚠️ ${VALIDATION_FAILURES} issue(s) found"
else
  VAL_STATUS="✅ Passed"
fi
QUALITY_CHECKS="### Quality Checks\n- HTML validation: ${VAL_STATUS}\n- Language attribute verification: ${VAL_STATUS}\n- RTL/CJK layout validation: ${VAL_STATUS}\n- EP terminology consistency: ${VAL_STATUS}"

if [ "$IMPROVEMENT_MODE" = "true" ]; then
  PR_TITLE="chore: improve EU Parliament article translations ${ARTICLE_DATE}"
  PR_BODY="## ✨ EU Parliament Translation Improvements — ${ARTICLE_DATE}\n\n### Summary\nImproved translation quality for EU Parliament news articles.\n\n### Details\n- **Improved articles**: ${TRANSLATED_TYPES}\n- **Target languages**: ${LANG_ARG}\n- **Total files modified**: ${TOTAL_FILES}\n- **Mode**: Quality improvement (all translations were 100% complete)\n- **Workflow**: \`news-translate\`\n\n${QUALITY_CHECKS}\n\n---\n> Generated by the \`news-translate\` agentic workflow."
elif [ -n "$BACKFILL_DATES" ]; then
  PR_TITLE="chore: translate EU Parliament articles (backfill)"
  PR_BODY="## 🌐 EU Parliament Article Translations — Backfill\n\n### Summary\nBackfilled missing translations for EU Parliament news articles.\n\n### Translation Coverage\n- **Backfill dates**: ${BACKFILL_DATES}\n- **Article types**: ${TRANSLATED_TYPES}\n- **Target languages**: ${LANG_ARG}\n- **Total translated files**: ${TOTAL_FILES}\n- **Workflow**: \`news-translate\`\n\n${QUALITY_CHECKS}\n\n---\n> Generated by the \`news-translate\` agentic workflow."
else
  PR_TITLE="chore: translate EU Parliament articles ${ARTICLE_DATE}"
  PR_BODY="## 🌐 EU Parliament Article Translations — ${ARTICLE_DATE}\n\n### Summary\nTranslated EU Parliament news articles from English to ${LANG_ARG} for ${ARTICLE_DATE}.\n\n### Translation Coverage\n- **Article types**: ${TRANSLATED_TYPES}\n- **Target languages**: ${LANG_ARG}\n- **Total translated files**: ${TOTAL_FILES}\n- **Workflow**: \`news-translate\`\n\n${QUALITY_CHECKS}\n\n### Data Pipeline\n- **Source**: English articles generated by content workflows (\`news-breaking\`, \`news-week-ahead\`, etc.)\n- **Translation method**: AI translation with EP-specific terminology standards\n- **Post-processing**: TypeScript generator pipeline with locale-specific formatting\n\n---\n> Generated by the \`news-translate\` agentic workflow. English source articles were generated by the individual content workflows."
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

See the full **Per-Language EP Terminology Standards** and **Per-Language Register & Style Guidelines** tables above for detailed language-specific guidance. Summary:

- **Nordic** (sv, da, no, fi): Formal register; official EP institution names per language (note: *Europaparlamentet* in sv/no, *Europa-Parlamentet* in da, *Euroopan parlamentti* in fi); genitive/case forms required in fi
- **EU Core** (de, fr, es, nl): Formal register; strict gender agreement (de/fr/es/nl); capitalise ALL nouns in German; *le Parlement européen* (lower-case *e* after article) in French
- **RTL** (ar, he): Modern Standard Arabic / formal Hebrew; `dir="rtl"` and `lang="ar"` / `lang="he"` already set by metadata normalization; use Unicode RTL punctuation (،، ؟ for ar; standard Hebrew punctuation for he); double-check that all text blocks render RTL
- **CJK** (ja, ko, zh): Formal register; full-width CJK punctuation (。、「」); verify CJK character density ≥ 50 chars per article in validation; *欧州議会* (ja), *유럽의회* (ko), *欧洲议会* (zh) — use these exact forms

## MANDATORY PR Creation

> **⚠️ CRITICAL**: You MUST call `safeoutputs___create_pull_request` in EVERY run where files were generated, even if translation is incomplete. The gh-aw framework captures all file changes as a patch — you do NOT manage git operations.

> **🛡️ CHECKPOINT ALREADY CALLED?** If you called `safeoutputs___create_pull_request` at the minute ~3 checkpoint (Date Context Establishment) or at the Step 3 fallback, DO NOT call it again here (max 1 PR per run). The checkpoint PR already captures ALL translations made during this run. Proceed directly to updating the repo memory and finishing.

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

- ✅ `safeoutputs___create_pull_request` when ANY translations are generated or improved
- ✅ `safeoutputs___create_pull_request` for backfill translations of older dates
- ❌ NEVER call `safeoutputs___noop` — there is ALWAYS work to do (new translations, backfill, or quality improvement)
- ❌ NEVER exit without calling `safeoutputs___create_pull_request`

## Error Handling

**If the Copilot engine terminates unexpectedly (transient auth failure):**
- This is a known intermittent issue — "No authentication information found" errors are transient platform failures
- If you called `safeoutputs___create_pull_request` before the crash (e.g., at the minute ~3 checkpoint), the framework will still create a PR with ALL files in the working directory
- **Prevention**: Call `safeoutputs___create_pull_request` at the minute ~3 checkpoint (immediately after creating the baseline analysis summary in Date Context Establishment), BEFORE running discovery, MCP checks, or the generator. This is the primary crash protection mechanism.
- The next scheduled run will pick up remaining untranslated languages

**If translation generator fails for a specific article type:**
1. Log the specific failure
2. Continue with remaining article types — partial translations are acceptable
3. If ALL types fail for today, move to historical backfill (Phase 2)
4. If backfill also fails, move to improvement mode (Phase 3)
5. There is ALWAYS work to do — NEVER produce an empty PR

**If PR creation fails AFTER generating translations:**
1. Retry `safeoutputs___create_pull_request` exactly **once**
2. If still fails: ❌ workflow MUST FAIL — do NOT try alternative ad-hoc git commands or API calls
3. The translations exist but no PR = readers can't see them = FAILURE
4. Do NOT attempt: ad-hoc branch creation, ad-hoc git reset, reflog recovery, or any other git tricks (the mandatory safety/cleanup steps above are the only permitted git commands)

**If no English articles found for today:**
- Scan backward through older dates for missing translations (Phase 2)
- If all older dates are fully translated, improve existing translations (Phase 3)
- NEVER call `safeoutputs___noop` — ALWAYS produce translations

**If MCP server unavailable:**
- Generator falls back to stdio mode — continue normally
