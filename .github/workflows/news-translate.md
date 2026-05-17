---
name: "News: Translate Executive Briefs"
description: |
  Scheduled 3×/day translation of every untranslated
  analysis/daily/**/executive-brief.md into the 13 non-English language
  companions (`executive-brief_<lang>.md`). AI performs every translation;
  scripted dictionary substitution is FORBIDDEN. Discovery and quality
  validation are delegated to scripts/discover-untranslated-briefs.js and
  scripts/validate-brief-translations.js so the workflow body stays focused
  on AI orchestration.
strict: false
on:
  # 3 scheduled runs / day at 06:30, 12:30, 18:30 UTC, staggered against
  # article-generation workflows (which cluster around the top of each hour
  # for fresh EP feeds). Each run translates ≤ MAX_BRIEFS source briefs ×
  # 13 languages. See README.md "Translation cadence" section for sizing.
  schedule:
    - cron: "30 6 * * *"
    - cron: "30 12 * * *"
    - cron: "30 18 * * *"
  workflow_dispatch:
    inputs:
      max_briefs:
        description: "Maximum number of source briefs to translate this run (1-4). Default 2."
        required: false
        default: "2"
      max_age_days:
        description: "Skip executive-brief.md files older than this many days. Default 180."
        required: false
        default: "180"
      include_extended:
        description: "Also process extended/executive-brief.md (legacy path). Default false."
        type: boolean
        required: false
        default: false
      mode:
        description: "Discovery prioritisation: fresh-then-backlog (default) | backlog-only | newest-first."
        required: false
        default: "fresh-then-backlog"

permissions:
  contents: read
  issues: read
  pull-requests: read
  actions: read
  discussions: read
  security-events: read

# 60-minute hard cap. Per-run budget: MAX_BRIEFS × 13 languages × ~12 KB ≈
# 26-39 markdown files / 300-450 KB of generated content. Comfortably inside
# the gh-aw safe-outputs 10 MB patch ceiling and the model's invocation budget.
timeout-minutes: 60

imports:
  - shared/config/news-common-settings.md
  - shared/mcp/news-mcp-servers.md

# Concurrency uses one workflow-wide lease so scheduled runs and re-runs cannot
# race while targeting the shared daily `news/translate-briefs-<date>` branch.
concurrency:
  job-discriminator: translate-briefs

tools:
  timeout: 180            # per-tool-call cap
  startup-timeout: 180    # MCP server boot (npx package install)
  github:
    toolsets:
      - all
  bash: true
  edit:                   # explicit file-edit tool for translation files
  web-fetch:              # IATE / EP termbase lookup fallback
  agentic-workflows: true
  # Cache memory restores partial translations across runs so a failed
  # safeoutputs flush does not lose 10+ minutes of translation work.
  cache-memory:
    key: news-translate-briefs-${{ github.repository_owner }}
    retention-days: 7
    allowed-extensions: [".md", ".json", ".txt"]
safe-outputs:
  threat-detection:
    continue-on-error: true
  # Per-run patch ≈ 300-450 KB of markdown (no HTML, no Chart.js, no images).
  # The gh-aw default 1024 KB is plenty but we leave headroom for catch-up
  # days when an operator overrides max_briefs=4 (push closer to 600 KB).
  max-patch-size: 4096
  steps:
    - name: Fetch triggering commit for bundle prerequisites
      # The safe_outputs job checks out the current branch tip with
      # fetch-depth:1. When another news PR merges between the agent job and
      # safe-output bundle application, the bundle may require the older
      # triggering commit as a prerequisite. Fetch that commit explicitly so
      # bundle apply does not fail with
      #   "Repository lacks these prerequisite commits"
      if: contains(needs.agent.outputs.output_types, 'create_pull_request')
      shell: bash
      run: |
        if [ -n "${GITHUB_SHA:-}" ] && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
          if ! git fetch --no-tags origin "$GITHUB_SHA"; then
            branch_name="$GITHUB_REF_NAME"
            if [ -z "$branch_name" ]; then
              branch_name=main
            fi
            if git rev-parse --is-shallow-repository | grep -qx true; then
              git fetch --unshallow --no-tags origin "$branch_name"
            else
              git fetch --no-tags origin "$branch_name"
            fi
          fi
        fi
  create-pull-request:
    # Budget: 1 flush per fully-translated brief (13 files) + 1 final flush
    # with the validator report. For max_briefs=2 (default) that's 3 calls;
    # for max_briefs=4 (catch-up) that's 5 calls. max:10 is the schema cap
    # and gives comfortable headroom for retry.
    max: 10
    title-prefix: "[news] "
    labels: [agentic-news, analysis-data, translation]
    draft: false
    expires: 14d
    allowed-base-branches: ["main"]
    excluded-files:
      - "analysis/daily/**/data/**"
      - ".github/**"
      - "**/*.lock"
      - "node_modules/**"
      - "news/**"
    if-no-changes: warn
    fallback-as-issue: true
    auto-close-issue: false
  add-comment:
    max: 1

steps:
  - name: Setup Node.js
    uses: actions/setup-node@53b83947a5a98c8d113130e565377fae1a50d02f # v6.3.0
    with:
      node-version: '26'

  - name: Install dependencies
    run: |
      npm ci --prefer-offline --no-audit

  - name: Build TypeScript (required for shared MCP client)
    run: |
      npm run build

  # Run discovery BEFORE the agent starts so the LLM never spends time on
  # filesystem scans. The queue is a small, deterministic JSON file that
  # the agent reads in Step 1 of the prompt.
  - name: Discover untranslated executive briefs
    id: discover
    env:
      MAX_BRIEFS: ${{ github.event.inputs.max_briefs || '2' }}
      MAX_AGE_DAYS: ${{ github.event.inputs.max_age_days || '180' }}
      INCLUDE_EXTENDED: ${{ github.event.inputs.include_extended || 'false' }}
      DISCOVERY_MODE: ${{ github.event.inputs.mode || 'fresh-then-backlog' }}
      RUN_NUMBER: ${{ github.run_number }}
    run: |
      set -euo pipefail
      mkdir -p /tmp/gh-aw/discovery
      EXTENDED_FLAG=""
      if [ "$INCLUDE_EXTENDED" = "true" ]; then
        EXTENDED_FLAG="--include-extended"
      fi
      # shellcheck disable=SC2086
      node scripts/discover-untranslated-briefs.js \
        --max-briefs "$MAX_BRIEFS" \
        --max-age-days "$MAX_AGE_DAYS" \
        --mode "$DISCOVERY_MODE" \
        --run-number "$RUN_NUMBER" \
        --output /tmp/gh-aw/discovery/queue.json \
        $EXTENDED_FLAG
      echo "Discovery queue summary:"
      node -e 'const q=require("/tmp/gh-aw/discovery/queue.json");console.log(JSON.stringify(q.totals,null,2));'

post-steps:
  - name: Capture agent recovery patch
    if: always()
    continue-on-error: true
    run: bash scripts/gh-aw-capture-agent-patch.sh

  # Always run the validator on whatever the agent produced. The script
  # exits non-zero on any violation; preserve that status so invalid
  # translations are rejected instead of slipping into the safe-output PR.
  - name: Validate brief translations
    if: always()
    run: |
      mkdir -p /tmp/gh-aw/validation
      set +e
      node scripts/validate-brief-translations.js \
        --report /tmp/gh-aw/validation/report.json
      VALIDATION_STATUS=$?
      node -e 'const r=require("/tmp/gh-aw/validation/report.json");console.log("Translations checked:",r.totals.filesChecked,"violations:",r.totals.violations);if(r.violations.length){for(const v of r.violations.slice(0,20)){console.log("•",v.translationPath,"["+v.gate+"]",v.message);}}'
      exit "$VALIDATION_STATUS"

engine:
  id: copilot
  model: claude-sonnet-4.6
  max-continuations: 3
---
# 🌐 Executive-Brief Translation Workflow

> **You are the Translation Agent.** Your only job: take the source
> `executive-brief.md` files listed in `/tmp/gh-aw/discovery/queue.json` and
> produce high-quality translations into the 13 non-English target
> languages. **AI translates every word. No scripted substitution.**

## 📚 Required Reading (BEFORE you write any translation)

1. **Canonical translator guide** — read it end-to-end:
   [`analysis/methodologies/executive-brief-translation-guide.md`](../../analysis/methodologies/executive-brief-translation-guide.md).
   Pay special attention to:
   - § 2 Mandatory preservation rules (FIXED TOKENS)
   - § 3 Structural fidelity rules (1:1 with source)
   - § 4 Per-language style register
   - § 5 Per-language EP terminology table
   - § 7 Quality dimensions and automated gates
2. **Target-language template**:
   [`analysis/templates/executive-brief-translation-template.md`](../../analysis/templates/executive-brief-translation-template.md).
3. **Scope and ground rules**:
   [`.github/prompts/00-scope-and-ground-rules.md`](../prompts/00-scope-and-ground-rules.md).

## 🎯 Bounded Scope

| Allowed ✅ | Forbidden ❌ |
|------------|--------------|
| Create `analysis/daily/<date>/<slug>/executive-brief_<lang>.md` siblings | Modify the source `executive-brief.md` |
| Read any artifact in `analysis/daily/**/` for terminology context | Edit `news/**/*.html`, `.github/**`, `src/**`, `scripts/**`, `package.json` |
| Read `/tmp/gh-aw/discovery/queue.json` | Read other unrelated repository files |
| Run `node scripts/validate-brief-translations.js --paths …` to self-check | Use `sed`/`awk`/regex/`tr` to translate narrative content |
| Call `safeoutputs___create_pull_request` after each fully-translated brief | Call `safeoutputs___create_pull_request` before at least one brief is fully translated (= all 13 missing languages produced and validator-clean) |

> **Why the safeoutputs deferral matters**: an empty PR or a PR with a
> half-translated brief is worse than no PR. The validator rejects partial
> coverage, and reviewers should never see a "1/13 languages done" PR.

## 🛡️ Seven Quality Gates (auto-enforced before the PR is created)

The post-step `Validate brief translations` runs
`scripts/validate-brief-translations.js` and posts the report. Translations
that fail ANY gate will be flagged in the PR comment:

1. **Filename ↔ language code** — `executive-brief_<lang>.md` with `<lang>`
   in `{sv, da, no, fi, de, fr, es, nl, ar, he, ja, ko, zh}`.
2. **Source presence** — sibling `executive-brief.md` exists.
3. **Length floor** — translation byte size ≥ 50 % of source.
4. **No English fall-through** — fewer than 5 hits of the EN sentence
   patterns (see [`scripts/validate-brief-translations.js`](../../scripts/validate-brief-translations.js)
   `EN_PATTERNS`).
5. **Fixed-token preservation** — every `IMF`, `WEO`, `World Bank`,
   `data-vintage="WEO-…"`, EP adopted-text ID (`TA-NN-YYYY-NNNN`), and
   procedure ID (`YYYY/NNNN(COD|INI|NLE)`) in the source MUST appear
   verbatim in the translation. The discovery queue exposes the exact
   per-token count for every queued source as `sourceFixedTokens`; treat
   that map as your verbatim-preserve budget per brief.
6. **Heading parity** — H1 and H2 counts must match the source **exactly**
   (zero tolerance for either); H3 counts may differ by at most one
   heading. Dropping or merging a `## Section` — including a
   duplicate-titled addendum such as `## IMF Economic Context — May 2026
   Update` — is rejected. When the validator flags an H2 mismatch it
   quotes the full source H2 title list back at you, and (when the
   mismatch is exactly one section) names the **Likely dropped** title
   directly so you know what to re-translate.
7. **Mermaid block parity** — every source ```` ```mermaid ```` opener must
   appear in the translation so diagrams remain renderable.

## 🔁 Execution Order

### Step 0 — Date context & branch identity (mandatory, FIRST bash block)

```bash
set -euo pipefail
TODAY=$(date -u +%Y-%m-%d)
RUN_ID="${GITHUB_RUN_NUMBER:-0}"
RUN_DATE="$TODAY"
BRANCH="news/translate-briefs-${RUN_DATE}"

ANALYSIS_DIR="analysis/translation-runs/${RUN_DATE}"
mkdir -p "${ANALYSIS_DIR}"

# Record a run marker so safeoutputs always sees ≥1 working-directory change
# when the agent decides to flush. The marker file is intentionally outside
# the per-brief output paths so it never confuses the validator.
MARKER_FILE="${ANALYSIS_DIR}/run-${RUN_ID}.marker"
{
  printf 'run_id=%s\n' "${RUN_ID}"
  printf 'run_date=%s\n' "${RUN_DATE}"
  printf 'started_at=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf 'attempt=%s\n' "${GITHUB_RUN_ATTEMPT:-1}"
} > "${MARKER_FILE}"

echo "Run date:     ${RUN_DATE}"
echo "Run ID:       ${RUN_ID}"
echo "Branch:       ${BRANCH}"
echo "Analysis dir: ${ANALYSIS_DIR}"
```

### Step 1 — Read the discovery queue

The pre-agent `Discover untranslated executive briefs` step has written
`/tmp/gh-aw/discovery/queue.json`. Read it BEFORE doing anything else:

```bash
cat /tmp/gh-aw/discovery/queue.json
```

Each queue entry has the shape:

```json
{
  "date": "2026-05-15",
  "slug": "breaking",
  "sourcePath": "analysis/daily/2026-05-15/breaking/executive-brief.md",
  "missingLangs": ["sv","da","no","fi","de","fr","es","nl","ar","he","ja","ko","zh"],
  "missingCount": 13,
  "isExtended": false,
  "sourceH2Count": 8,
  "sourceH2Titles": [
    { "line": 7,   "title": "Headline Intelligence" },
    { "line": 96,  "title": "IMF Economic Context" },
    { "line": 146, "title": "IMF Economic Context — May 2026 Update" }
  ],
  "sourceFixedTokens": { "IMF": 17, "WEO": 2, "TA-id": 4 }
}
```

> **`sourceH2Titles` is the single most important field to scan before
> translating.** If two H2 titles share a common prefix (e.g.
> `IMF Economic Context` and `IMF Economic Context — May 2026 Update`),
> they are **distinct sections**. Never collapse them. The validator's
> heading-parity gate (`H2_TOLERANCE = 0`) will reject a translation that
> drops or merges any source H2 — and the violation message will quote
> the missing title back at you.

> **`sourceFixedTokens` is your verbatim-preservation budget.** Every
> count listed here MUST appear at least that many times in every
> translation. If the source has `IMF: 17`, every `executive-brief_<lang>.md`
> must contain the exact token `IMF` at least 17 times. Translating
> `IMF` to `IMV` / `صندوق النقد` / `IWF` is forbidden — copy the Latin-
> script token verbatim.

**Queue ordering (`fresh-then-backlog`, default):** slot 0 is the newest
source with any missing language ("fresh slice"); slots 1+ are the
*oldest* sources with gaps in date-ascending order, finishing half-done
briefs before starting blank ones ("backlog slice"). This policy is what
actually drains the long-tail backlog — older briefs cannot be perpetually
starved by today's wins. **Treat every queue entry identically: full
13-language translation per brief, no fast-path for the fresh slot.** The
`totals.freshNewestDate` and `totals.backlogOldestDate` fields show the
extents of what's still missing across the entire repository.

If `totals.queued == 0`, the workflow has nothing to do. Write a short
note to `${ANALYSIS_DIR}/no-work.md` explaining this, then END THE RUN
without calling safeoutputs. **An empty PR is never the right outcome.**

### Step 2 — Translate one brief at a time

For each queue entry, in order:

1. **Read the source brief in full** (`sourcePath`).
2. **Count source headings BEFORE writing any translation**
   (assign `sourcePath` from the current queue entry first):
   ```bash
   # entryIndex must be set by your queue loop (0-based current queue position).
   # Example: resolve sourcePath for the current queue index ($entryIndex)
   if [ -z "${entryIndex:-}" ]; then
     echo "Missing entryIndex for current queue entry" >&2
     exit 1
   fi
   python3 - "$entryIndex" > /tmp/gh-aw/source-path.txt <<'PY' || exit 1
import json
import sys
from pathlib import Path

queue_path = Path("/tmp/gh-aw/discovery/queue.json")
if len(sys.argv) < 2:
    print("Missing required argument: entry index", file=sys.stderr)
    sys.exit(1)
raw_index = sys.argv[1]
try:
    payload = json.loads(queue_path.read_text(encoding="utf-8"))
    queue = payload.get("queue", [])
    idx = int(raw_index)
    print(queue[idx].get("sourcePath", ""))
except (FileNotFoundError, json.JSONDecodeError, ValueError, IndexError, TypeError) as exc:
    print(f"Failed to read/parse queue or access entry index {raw_index} in {queue_path}: {exc}", file=sys.stderr)
    sys.exit(1)
PY
   IFS= read -r sourcePath < /tmp/gh-aw/source-path.txt
   if [ -z "${sourcePath:-}" ] || [ ! -f "$sourcePath" ]; then
     echo "Missing or invalid sourcePath: $sourcePath" >&2
     exit 1
   fi
   echo "Source H1: $(grep -cE '^# [^#]' "$sourcePath")"
   echo "Source H2: $(grep -cE '^## [^#]' "$sourcePath")"
   echo "Source H3: $(grep -cE '^### ' "$sourcePath")"
   ```
   Every translation MUST have the same H1 and H2 counts (zero tolerance).
   Pay special attention to duplicate-titled sections — e.g. a source
   that contains both `## IMF Economic Context` AND
   `## IMF Economic Context — May 2026 Update` has **two** distinct H2
   sections, not one. Do not collapse them.
3. **Open the translator guide** (`analysis/methodologies/executive-brief-translation-guide.md`)
   to the per-language terminology table for the languages you're producing.
4. **For each `lang` in `missingLangs`**, create a sibling next to
   `sourcePath`: replace the source filename `executive-brief.md` with
   `executive-brief_<lang>.md`. For canonical entries that is
   `analysis/daily/<date>/<slug>/executive-brief_<lang>.md`; for
   `isExtended: true` entries it is
   `analysis/daily/<date>/<slug>/extended/executive-brief_<lang>.md`.

   > **⚠️ TOOL REQUIREMENT — read before writing:** Use the `create`
   > tool **exclusively** (pass `path` and `file_text` explicitly on
   > every call). **NEVER** use `cat > file << 'EOF'` shell heredocs —
   > heredocs silently truncate when the translation content fills the
   > context, causing the last H2 section(s) to vanish without any
   > error. Use `edit` only for files that already exist on disk.

   Before writing the first word of any translation, enumerate the
   source H2 titles so you know the full checklist (`$sourcePath` is
   already set by step 2's bash block):
   ```bash
   set -euo pipefail
   if [ -z "${sourcePath:-}" ] || [ ! -f "$sourcePath" ]; then
     echo "sourcePath not set or file missing: ${sourcePath:-<unset>}" >&2; exit 1
   fi
   echo "=== Source H2 checklist ==="
   grep -E '^## ' "$sourcePath"
   echo "==========================="
   ```
   Treat every line printed as a **MUST-TRANSLATE** item. The last H2
   title printed is the one most often dropped — write or verify it
   explicitly. Do **not** begin a new language until you have confirmed
   the previous one contains every H2 from this list.

   - Mirror the source structure: exact H1 and H2 counts (zero
     tolerance), H3 count within ±1 (legitimate CJK sub-bullet fusion),
     same list count, table rows, blockquote count, emoji-marker
     positions. Every `##` in the source MUST have a matching `##` in
     the translation.
   - Translate every prose section into the target language. Pass 1 first
     covers every section once; Pass 2 re-reads the entire file and
     expands cramped passages, fixes terminology drift, and verifies
     every FIXED TOKEN is present.
   - Preserve every FIXED TOKEN verbatim: `IMF`, `WEO`, `World Bank`,
     `Fiscal Monitor`, `data-vintage="WEO-…"`, `TA-NN-YYYY-NNNN`,
     `YYYY/NNNN(COD|INI|NLE)`, ISO country/currency codes, confidence
     emoji (`🟢 HIGH` / `🟡 MEDIUM` / `🔴 LOW`), classification stamps.
   - Apply per-language register from § 4 of the translator guide
     (Nordic / EU-core / RTL / CJK).

   **4a. Mandatory H2 spot-check per language** — run immediately after
   creating each `executive-brief_<lang>.md`, BEFORE moving to the next
   language. A mismatch means a section was dropped (almost always the
   last H2). Fix the translation NOW; do not continue to the next
   language until this exits 0.

    ```bash
    set -euo pipefail
    BRIEF_DIR=$(dirname "$sourcePath")
    src_h2=$(grep -cE '^## ' "$sourcePath" || echo 0)
    out_h2=$(grep -cE '^## ' "${BRIEF_DIR}/executive-brief_${lang}.md" || echo 0)
    if [ "$src_h2" != "$out_h2" ]; then
     echo "❌ H2 MISMATCH for ${lang}: source=${src_h2} translation=${out_h2}" >&2
     echo "Source H2 titles:" >&2
     grep -E '^## ' "$sourcePath" >&2
     echo "Translation H2 titles:" >&2
     grep -E '^## ' "${BRIEF_DIR}/executive-brief_${lang}.md" >&2
     exit 1
   fi
   echo "✅ H2 spot-check OK for ${lang}: ${out_h2}/${src_h2}"
   ```

5. **Self-validate** the brief you just finished. **This is a hard gate.
    Do not call `safeoutputs___create_pull_request` until this step
    reports zero violations for the brief's siblings.**

    ```bash
    set -euo pipefail
    BRIEF_DIR=$(dirname "$sourcePath")
    if node scripts/validate-brief-translations.js \
         --paths "${BRIEF_DIR}/executive-brief_*.md" \
         --report "${ANALYSIS_DIR}/validator-${BRIEF_DIR//\//_}.json"; then
      echo "✅ Brief at ${BRIEF_DIR} is validator-clean — safe to flush."
    else
      echo "❌ Validator violations remain in ${BRIEF_DIR}. Re-translate before flush." >&2
      node -e 'const r=require(process.argv[2]); for (const v of r.violations) console.error("•", v.translationPath, "["+v.gate+"]", v.message);' \
        "${ANALYSIS_DIR}/validator-${BRIEF_DIR//\//_}.json"
      exit 1
    fi
    ```

    If any gate flagged a translation, **re-translate it now** — do not
    let it slip into the PR. Common diagnoses and fixes:

    - `heading-parity` H2 mismatch → re-read the validator's
      `Source H2 titles: [...]` list. If it includes `Likely dropped:
      [...]`, that section literally needs to be added back to the
      translation. Duplicate-titled H2s (e.g. `IMF Economic Context` AND
      `IMF Economic Context — May 2026 Update`) are **distinct
      sections** — never collapse them.
    - `fixed-token-preservation` → search the translation for every
      missing token; re-insert it verbatim (never localised). Cross-
      check against `sourceFixedTokens` from the discovery queue.
    - `mermaid-parity` → copy every ```` ```mermaid ```` block from the
      source unchanged; never translate diagram node text.
    - `length-floor` / `english-fallthrough` → the translation is
      probably a stub or contains untranslated paragraphs; redo it.

    Only after the validator returns exit 0 may you proceed to the
    flush step.
6. **Flush** — after step 5 reported `✅`, call
    `safeoutputs___create_pull_request`. The template literal below uses
    two bookkeeping variables you maintain in your own head as you
    iterate over the queue:

   - `COMPLETED_COUNT` — number of briefs whose 13 language siblings have
     all been written AND validator-clean (incremented after step 5 of
     this iteration).
   - `QUEUED_COUNT` — `totals.queued` from `/tmp/gh-aw/discovery/queue.json`
     (read once in Step 1; this is `2` on a default run, up to `4` on
     catch-up runs).

   ```javascript
   safeoutputs___create_pull_request({
     title: `[news] Translate executive briefs — ${RUN_DATE} (${COMPLETED_COUNT}/${QUEUED_COUNT} briefs)`,
     body: `Translated ${COMPLETED_COUNT} executive briefs to 13 languages this run.\n\nSee analysis/translation-runs/${RUN_DATE}/summary.md for the per-brief quality matrix.`,
     base: "main",
     head: `news/translate-briefs-${RUN_DATE}`,
   })
   ```

7. **Move to the next queue entry** until the queue is empty OR you've
   used ≥ 50 minutes of the 60-minute cap.

### Step 3 — Final flush

When the queue is empty (or the wall-clock budget is exhausted):

1. Write `${ANALYSIS_DIR}/summary.md` with a per-brief, per-language
   quality matrix (one row per `(date, slug, lang)` triple). Score each
   translation 1-5 on the 5 quality dimensions from the translator guide:
   accuracy, fluency, terminology, completeness, formatting.
2. Run the validator one last time and copy its output into the summary.
3. Call `safeoutputs___create_pull_request` with the finalised title and
   body. Same branch. **Final flush must land by minute ≤ 55.**

## ⏱️ Time Budget (60-minute hard cap)

| Minutes | Action |
|---------|--------|
| 0-1 | Step 0 date context; Step 1 read queue |
| 1-25 | Translate brief #1 (13 languages, Pass 1 + Pass 2). First flush at ~25. |
| 25-50 | Translate brief #2 (13 languages, Pass 1 + Pass 2). Second flush at ~50. |
| 50-55 | Step 3 summary + final flush |
| 55-60 | Buffer for retry and graceful exit |

Stretch: if `max_briefs` is overridden to 3 or 4 (catch-up mode), tighten
each per-brief window proportionally. The script-level discovery already
caps the queue; the AI does not need to ration its own work.

## 🚫 Never

- **Never** translate before reading the translator guide.
- **Never** translate by running `sed`/`awk`/`tr` over the source.
- **Never** use `cat > file << 'EOF'` shell heredocs to write translation
  content. Heredocs silently truncate when the output fills the context
  window, dropping the last H2 section(s) without any visible error —
  this is the root cause of the recurring "7/8 H2" failures. Use the
  `create` tool exclusively.
- **Never** add new sections or merge sections — structural fidelity is
  enforced by validator gates #6 (heading parity), #7 (Mermaid parity), and
  human review.
- **Never** translate FIXED TOKENS. `IMF` stays `IMF`; `World Bank` stays
  `World Bank`; `TA-10-2026-0160` stays `TA-10-2026-0160`. **Dutch (`nl`)
  in particular**: `IMF blijft IMF`; `WEO blijft WEO` — never localise to
  `IMV` / `Wereldwijde Economische Vooruitzichten`. Run validator gate #5
  in Step 2.4 to catch token drift before flush.
- **Never** call `safeoutputs___create_pull_request` before at least one
  brief has all 13 languages produced and is validator-clean.
- **Never** skip a queue entry because its date is old; backlog parity is
  the workflow's primary KPI. The `fresh-then-backlog` discovery policy
  guarantees slot 0 is always the day's newest brief, so slots 1+ exist
  *specifically* to drain the long tail — translate them with the same
  rigour as the fresh slot.
- **Never** include `news/**`, `src/**`, `scripts/**`, or `.github/**` in
  the PR. The `excluded-files` config blocks them; do not work around it.

## 🛡️ MCP / Engine Notes

- **MCP gateway** is configured by `shared/mcp/news-mcp-servers.md`. The
  EP MCP server is *not* required for translation (translations read
  on-disk markdown). Skip MCP health checks; spend the budget on AI work.
- **`max-continuations: 3`** lets the agent restart up to 3 times if the
  session is suspended. Each restart resumes from the last successful
  flush (cache-memory key `news-translate-briefs-…`).
- **Bounded data loss**: at any session failure between flushes, at most
  one brief's 13 files are lost — the prior brief's flush already landed
  in the PR.

## 🔗 Related References

- [`analysis/methodologies/executive-brief-translation-guide.md`](../../analysis/methodologies/executive-brief-translation-guide.md) — canonical translator contract.
- [`analysis/templates/executive-brief-translation-template.md`](../../analysis/templates/executive-brief-translation-template.md) — empty target shell.
- [`scripts/discover-untranslated-briefs.js`](../../scripts/discover-untranslated-briefs.js) — queue builder.
- [`scripts/validate-brief-translations.js`](../../scripts/validate-brief-translations.js) — automated quality gate.
- [`.github/workflows/README.md`](./README.md) §"Translation cadence" — sizing & scheduling.
