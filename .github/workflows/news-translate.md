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
      max_source_lines:
        description: "Source-brief line count above which the discovery script flags `largeSource: true` and the agent switches to the 2-phase skeleton-then-edit translation strategy. Default 300 (the empirical cutoff that produced the cancelled run #26181499722 at 385 lines)."
        required: false
        default: "300"
      target_brief:
        description: "Operator override — queue ONLY this brief and ignore mode/max_briefs/max_age_days. Accepted forms: `YYYY-MM-DD/<slug>` (short, e.g. `2026-05-21/propositions`), `YYYY-MM-DD/<slug>/extended` (legacy extended path), `analysis/daily/YYYY-MM-DD/<slug>/executive-brief.md`, or `analysis/daily/YYYY-MM-DD/<slug>/extended/executive-brief.md`. NOTE: targeting an extended brief also requires `include_extended: true` — otherwise discovery will not scan extended sources and the queue will be empty. Leave blank for the normal scheduled fresh-then-backlog behaviour."
        required: false
        default: ""

permissions:
  contents: read
  issues: read
  pull-requests: read
  actions: read
  discussions: read
  security-events: read

# 60-minute hard cap. Per-run budget: MAX_BRIEFS × 13 languages × ~12 KB ≈
# 26-39 markdown files / 300-450 KB of generated content. Comfortably inside
# the gh-aw safe-outputs 10 MB patch ceiling and the model's invocation
# budget. Time management: start preparing to commit after 40 min elapsed;
# emergency-flush fires at ≥ 40 min elapsed or ≤ 20 min remaining. This
# leaves 20 min for the flush + safe-outputs bundle application. Root-cause
# fixes for transient-API errors (model downgrade, retry-loop detection)
# remove the need for a longer cap.
timeout-minutes: 60

imports:
  - shared/config/news-common-settings.md
  - shared/mcp/news-mcp-servers.md
  # Host-side PAT PR fallback. When safe_outputs's gh-aw bundle push fails —
  # e.g. because main moved during the 60-min run and the agent's branch tree
  # now differs from main's workflow files (GitHub App push without
  # `workflows: write` permission is then rejected) — this fallback re-pushes
  # the translation payload via COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN and
  # opens the PR, replacing the previous fallback-as-issue path. The shared
  # script is translate-aware (slug=translate-briefs ⇒ branch
  # `news/translate-briefs-<date>` and eligible
  # `analysis/translation-runs/**` paths).
  - uses: shared/config/news-pat-pr-fallback.md
    with:
      slug: translate-briefs
      workflowName: "News: Translate Executive Briefs"

# Concurrency uses one workflow-wide lease so scheduled runs and re-runs cannot
# race while targeting the shared daily `news/translate-briefs-<date>` branch.
# cancel-in-progress: true kills a stale cron run when the next tick fires,
# preventing zombie stacked runs from accumulating compute (learned from
# riksdagsmonitor which uses per-input concurrency with cancel-in-progress).
concurrency:
  group: "news-translate"
  job-discriminator: translate-briefs
  cancel-in-progress: true

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
  # Translation failures retry on the next cron tick (3×/day); auto-created
  # failure issues are noise. Suppress them (learned from riksdagsmonitor).
  report-failure-as-issue: false
  # Per-run patch ≈ 300-450 KB of markdown (no HTML, no Chart.js, no images).
  # The gh-aw default 1024 KB is plenty but we leave headroom for catch-up
  # days when an operator overrides max_briefs=4 (push closer to 600 KB).
  max-patch-size: 4096
  # Explicit file ceiling: max_briefs=4 × 13 langs = 52 files per flush.
  # 100 gives headroom for validator reports and retry flushes.
  max-patch-files: 100
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
      # Briefs whose source markdown exceeds MAX_SOURCE_LINES are flagged
      # `largeSource: true` in the queue, and the translator agent
      # switches to a 2-phase skeleton-then-edit strategy for them
      # (Step 2 below). 300 lines is the conservative cutoff that
      # corresponds to the empirically-observed failure point in run
      # #26181499722 (385-line election-cycle brief stalled the first
      # Swedish `create` after 5× transient-API-error loops).
      MAX_SOURCE_LINES: ${{ github.event.inputs.max_source_lines || '300' }}
      # Operator override (workflow_dispatch only). Empty on scheduled runs
      # so the normal fresh-then-backlog selection is used. When set, the
      # discovery script queues ONLY this brief and ignores mode /
      # max_briefs / max_age_days. Validated by parseTargetBriefSpec()
      # against [a-z0-9-] slug + YYYY-MM-DD date — directory traversal is
      # rejected at parse time.
      TARGET_BRIEF: ${{ github.event.inputs.target_brief || '' }}
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
        --max-source-lines "$MAX_SOURCE_LINES" \
        --target-brief "$TARGET_BRIEF" \
        --output /tmp/gh-aw/discovery/queue.json \
        $EXTENDED_FLAG
      echo "Discovery queue summary:"
      node -e 'const q=require("/tmp/gh-aw/discovery/queue.json");console.log(JSON.stringify(q.totals,null,2));'

post-steps:
  # The "Capture agent recovery patch" post-step is provided by the imported
  # shared/config/news-pat-pr-fallback.md — do not duplicate it here.

  # Always run the validator on whatever the agent produced. The script
  # exits non-zero on any BLOCKING violation (severity != 'warning');
  # preserve that status so invalid translations are rejected instead of
  # slipping into the safe-output PR. The validator emits
  # `skeleton-incomplete` advisories with `severity: warning` for Phase A
  # stubs produced by Step 4b emergency partial flushes — those are
  # non-blocking under the default policy because the next scheduled run
  # will pick up the missing languages via discovery. Pass
  # `--strict-skeletons` to treat them as blocking (used by CI sweeps,
  # not by the per-run gate).
  #
  # IMPORTANT: scope validation to the briefs THIS RUN was asked to translate
  # (the entries in /tmp/gh-aw/discovery/queue.json). Pre-existing defects in
  # older, unrelated briefs (e.g. a source brief whose H2 layout was extended
  # AFTER its translations were already merged) must NOT fail this run — the
  # translation agent has bounded scope and cannot fix them anyway. See the
  # regression analysis in the PR that introduced this scoping (failure
  # pattern: runs #206, #207, #208, #209, #210, #214, #219, #220, #221, #223,
  # and the skeleton-cascade failure #26235374860 that motivated the
  # `--strict-skeletons` opt-in policy).
  - name: Validate brief translations
    if: always()
    run: |
      mkdir -p /tmp/gh-aw/validation
      # Derive sibling globs from the discovery queue (one per brief the
      # agent was asked to translate). If the queue is missing or empty,
      # there is nothing this run produced to validate — exit cleanly.
      node -e '
        const fs = require("node:fs");
        const queuePath = "/tmp/gh-aw/discovery/queue.json";
        if (!fs.existsSync(queuePath)) {
          fs.writeFileSync("/tmp/gh-aw/validation/paths.txt", "");
          process.exit(0);
        }
        const q = JSON.parse(fs.readFileSync(queuePath, "utf8"));
        const entries = Array.isArray(q.queue) ? q.queue : [];
        const globs = entries
          .map((e) => typeof e.sourcePath === "string" ? e.sourcePath : "")
          .filter((p) => p.endsWith("/executive-brief.md"))
          .map((p) => p.replace(/\/executive-brief\.md$/, "/executive-brief_*.md"));
        fs.writeFileSync("/tmp/gh-aw/validation/paths.txt", globs.join("\n"));
        console.log("Validator scope (" + globs.length + " brief sibling glob(s)):");
        for (const g of globs) console.log("  " + g);
      '
      # Read globs (one per line) into a bash array without nested expansion.
      PATHS_FILE="/tmp/gh-aw/validation/paths.txt"
      glob_args=()
      if [ -s "$PATHS_FILE" ]; then
        while IFS= read -r line; do
          if [ -n "$line" ]; then
            glob_args+=("$line")
          fi
        done < "$PATHS_FILE"
      fi
      if [ "${#glob_args[@]}" -eq 0 ]; then
        echo "No briefs in discovery queue — skipping validator (nothing this run produced to validate)."
        exit 0
      fi
      set +e
      node scripts/validate-brief-translations.js \
        --paths "${glob_args[@]}" \
        --report /tmp/gh-aw/validation/report.json
      VALIDATION_STATUS=$?
      node -e '
        const r = require("/tmp/gh-aw/validation/report.json");
        const t = r.totals || {};
        const blocking = typeof t.blocking === "number" ? t.blocking : t.violations;
        console.log("Translations checked:", t.filesChecked,
          "| violations:", t.violations,
          "| blocking:", blocking);
        if (r.violations.length) {
          for (const v of r.violations.slice(0, 20)) {
            const icon = v.severity === "warning" ? "⚠️" : "•";
            console.log(icon, v.translationPath, "[" + v.gate + "]", v.message);
          }
        }
      '
      exit "$VALIDATION_STATUS"

engine:
  id: copilot
  model: claude-sonnet-4.6
  max-continuations: 1
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
| Call `safeoutputs___create_pull_request` after each fully-translated brief | Call `safeoutputs___create_pull_request` with zero translations produced (no files on disk) |
| Emergency partial flush when wall-clock budget is exhausted (≥ 40 min elapsed OR <20 min remaining) — see § Step 4b | Silently let the engine time out / terminate without flushing any progress |

> **Why a flush-before-timeout safety net matters**: prior runs have died
> mid-brief (e.g. 10/13 languages written, engine terminated) and lost
> ~15-25 minutes of translation work because no PR was ever created. The
> safe-outputs system requires the agent to explicitly call
> `create_pull_request`; if the engine dies without that call, **all
> uncommitted translations are discarded**. Therefore: prefer a partial-
> brief PR (flagged by the validator post-step) over zero output. An empty
> PR is still worse than no PR — the safety net only fires when ≥ 1
> translation file has been written to disk.

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

# Wall-clock budget tracking — every later bash block checks elapsed
# minutes against this anchor to decide when to fire the emergency
# partial flush (Step 4b). Stored in /tmp so subsequent agent steps
# can re-source it without re-exporting from this block.
WORKFLOW_START_EPOCH=$(date -u +%s)
echo "${WORKFLOW_START_EPOCH}" > /tmp/gh-aw/workflow-start-epoch
echo "Workflow start epoch: ${WORKFLOW_START_EPOCH}"

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
> `IMF` to `IMV` (nl) / `IPF` or `Det internasjonale valutafondet` (no)
> / `IVF` or `Internationella valutafonden` (sv) / `IMV` or `Den
> Internationale Valutafond` (da) / `IMF` → `KVR` (fi) / `صندوق النقد` (ar)
> / `IWF` (de) / `FMI` (fr / es) is **forbidden** — copy the Latin-script
> token verbatim. The Nordic / EU-core Latin-script languages (`no`,
> `sv`, `da`, `fi`, `de`, `fr`, `es`, `nl`) are the most common failure
> mode because the target alphabet matches the source and the model is
> tempted to localise the acronym; **don't**.

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
   # Node.js (the repo-wide toolchain — see 00-scope-and-ground-rules.md §4).
   # Matches the `node -e` pattern used 110 lines down to read `largeSource` /
   # `sourceLineCount` from the same queue.json. Python heredocs are banned
   # repo-wide (see §"🚫 Never" below and 00-scope-and-ground-rules.md).
   node -e '
     const fs = require("node:fs");
     const queuePath = "/tmp/gh-aw/discovery/queue.json";
     const raw = process.argv[2];
     if (!raw) {
       console.error("Missing required argument: entry index");
       process.exit(1);
     }
     try {
       const payload = JSON.parse(fs.readFileSync(queuePath, "utf8"));
       const queue = Array.isArray(payload.queue) ? payload.queue : [];
       const idx = Number(raw);
       if (!Number.isInteger(idx) || idx < 0 || idx >= queue.length) {
         throw new RangeError("entry index " + raw + " out of range (queue length " + queue.length + ")");
       }
       const entry = queue[idx] || {};
       process.stdout.write((typeof entry.sourcePath === "string" ? entry.sourcePath : "") + "\n");
     } catch (exc) {
       console.error("Failed to read/parse queue or access entry index " + raw + " in " + queuePath + ": " + exc.message);
       process.exit(1);
     }
   ' "$entryIndex" > /tmp/gh-aw/source-path.txt || exit 1
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

   > **🐘 LARGE-SOURCE 2-PHASE STRATEGY** — when the current queue
   > entry has `largeSource: true` (source `sourceLineCount` >
   > `MAX_SOURCE_LINES`, default 300; the cancelled run #26181499722
   > had a 385-line brief that stalled the first `create` with 5×
   > transient-API-error loops, and run #26235374860 hit the same
   > pattern twice in succession for ~25 min of lost wall-clock), do
   > **not** attempt to write the full translation in one `create`
   > call. Instead, for **each language**:
   >
   > 1. **Phase A — skeleton `create`**: write the file as the
   >    skeleton marker line, then the H1, then the full ordered
   >    list of `## H2` headings copied verbatim from the source
   >    (translated where appropriate but with the same count and
   >    order), with a one-line `<!-- pending -->` placeholder
   >    under each H2. The very **first line** of every Phase A
   >    file MUST be the literal marker:
   >
   >    ```
   >    <!-- translation-skeleton: lang=<lang> phase=A run=${RUN_ID} -->
   >    ```
   >
   >    The marker is a contract with `scripts/validate-brief-translations.js`:
   >    skeleton-stub files are detected via this marker and emit a
   >    single non-blocking `skeleton-incomplete` advisory instead
   >    of cascading length/token/heading/mermaid violations. Without
   >    the marker, an emergency partial flush (Step 4b) will mark
   >    the entire job as `failure` even though it successfully
   >    saved the languages that completed Phase B (the regression
   >    pattern from run #26235374860).
   >
   > 2. **Phase B — section-by-section `edit`**: iterate the H2
   >    sections in order. For each one, call `edit` once with the
   >    placeholder line (`<!-- pending -->`) as `oldText` and the
   >    fully translated section body as `newText`. Each `edit` call
   >    is bounded to one section's worth of output, which the model
   >    emits reliably. After the **last** Phase B `edit` for a
   >    language completes, **remove the skeleton marker** with one
   >    final `edit` (oldText = the full marker line including the
   >    trailing newline, newText = empty string) — this promotes
   >    the file from skeleton to fully translated so the validator
   >    runs strict gates against it.
   >
   > 3. **Phase C — H2 spot-check (step 4a)**: unchanged — runs once
   >    the file is complete.
   >
   > Small briefs (`largeSource: false`, the common case) continue
   > to use the one-shot `create` documented below.
   >
   > **Recovery from `edit "No match found"`**: if Phase B's `edit`
   > call returns "No match found" (the layout of the Phase A
   > placeholder differs from what `oldText` expected), do NOT
   > escalate to a `python3 << 'PYEOF'` heredoc — heredocs of any
   > flavour are banned (see §"🚫 Never"). Instead: (a) re-read the
   > current file with the `view` tool, (b) copy the exact
   > placeholder line including any leading whitespace into a fresh
   > `edit` call, OR (c) if more than one section needs repair,
   > rewrite the whole file with a single `create` call passing the
   > full `file_text`. Both options preserve the no-heredoc invariant.

   Read the `largeSource` and `sourceLineCount` fields of the current
   queue entry before choosing your strategy:
   ```bash
   set -euo pipefail
   if [ -z "${entryIndex:-}" ]; then
     echo "Missing entryIndex for current queue entry" >&2; exit 1
   fi
   LARGE_SOURCE=$(node -e '
     const q = require("/tmp/gh-aw/discovery/queue.json");
     const idx = Number(process.argv[2]);
     const e = (q.queue || [])[idx] || {};
     process.stdout.write(e.largeSource ? "true" : "false");
   ' "$entryIndex")
   SOURCE_LINE_COUNT=$(node -e '
     const q = require("/tmp/gh-aw/discovery/queue.json");
     const idx = Number(process.argv[2]);
     const e = (q.queue || [])[idx] || {};
     process.stdout.write(String(e.sourceLineCount || 0));
   ' "$entryIndex")
   echo "📏 Source line count: ${SOURCE_LINE_COUNT} | largeSource: ${LARGE_SOURCE}"
   if [ "$LARGE_SOURCE" = "true" ]; then
     echo "⚠️  Using 2-phase skeleton-then-edit strategy for this brief."
   fi
   ```

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

   **Pre-loop: scan existing translations (transient-error recovery)**
   Before writing the first language for this brief, check which sibling
   files already exist on disk. A transient API error during a `create`
   call causes the gh-aw framework to retry the inference — when it does,
   the agent must NOT re-create files that were already successfully
   written in an earlier attempt. Run this once per brief, right after
   the H2 checklist above:

   ```bash
   set -euo pipefail
   BRIEF_DIR=$(dirname "$sourcePath")
   echo "=== Translations already on disk for this brief ==="
   ls "${BRIEF_DIR}"/executive-brief_*.md 2>/dev/null || echo "(none yet)"
   echo "===================================================="
   ```

   For any `lang` from `missingLangs` where the output file already
   exists, **skip the `create` call and jump directly to the H2
   spot-check (step 4a)**. Overwriting with an identical `create` call
   is harmless but wastes tokens; skipping and spot-checking is correct.

   **Per-language pre-write check** — run immediately before every
   `create` call (defends against transient-API-error retry loops where
   the agent re-announces the same language but the file was already
   written in the previous attempt):

   ```bash
   BRIEF_DIR=$(dirname "$sourcePath")
   if [ -f "${BRIEF_DIR}/executive-brief_${lang}.md" ]; then
     echo "skip_create=true  # ${lang} already on disk"
   else
     echo "skip_create=false  # ${lang} needs create"
   fi
   ```

   When the file exists on disk, do NOT call the `create` tool; proceed
   directly to **step 4a** (H2 spot-check).

   **4a. Mandatory H2 spot-check per language** — run immediately after
   creating each `executive-brief_<lang>.md`, BEFORE moving to the next
   language. A mismatch means a section was dropped (almost always the
   last H2). Fix the translation NOW; do not continue to the next
   language until this exits 0.

    ```bash
    set -euo pipefail
    BRIEF_DIR=$(dirname "$sourcePath")
    src_h2=$(grep -cE '^## ' "$sourcePath" || true)
    out_h2=$(grep -cE '^## ' "${BRIEF_DIR}/executive-brief_${lang}.md" || true)
    if [ "$src_h2" != "$out_h2" ]; then
     echo "❌ H2 MISMATCH for ${lang}: source=${src_h2} translation=${out_h2}" >&2
     echo "Source H2 titles:" >&2
     grep -E '^## ' "$sourcePath" >&2 || true
     echo "Translation H2 titles:" >&2
     grep -E '^## ' "${BRIEF_DIR}/executive-brief_${lang}.md" >&2 || true
     exit 1
   fi
   echo "✅ H2 spot-check OK for ${lang}: ${out_h2}/${src_h2}"
   ```

   **4b. Wall-clock safety net — emergency partial flush.** After every
   language file is written and H2-checked, compute elapsed minutes
   from `WORKFLOW_START_EPOCH`. If **≥ 40 minutes** have elapsed (or
   `≤ 20 minutes` remain of the 60-minute cap), **STOP translating
   immediately** and call `safeoutputs___create_pull_request` with
   whatever files are already on disk — even if the current brief is
   only partially translated (e.g. 10/13 languages). A partial-brief
   PR is **always** preferable to an engine timeout that loses all
   work. Record the missing language codes in the emergency-flush
   marker and in the PR body (the validator only checks files that
   exist — it cannot flag absent siblings, so the gap list must come
   from the marker and the `PARTIAL_LANG_COUNT` bookkeeping vars in
   Step 6). Reviewers can re-queue the missing languages on the next
   cron tick, and the validator's `skeleton-incomplete` advisory
   (severity: warning) will keep the partial-flush job conclusion
   at `success` instead of `failure`.

   ```bash
   set -euo pipefail
   START_EPOCH=$(cat /tmp/gh-aw/workflow-start-epoch)
   NOW_EPOCH=$(date -u +%s)
   ELAPSED_MIN=$(( (NOW_EPOCH - START_EPOCH) / 60 ))
   REMAINING_MIN=$(( 60 - ELAPSED_MIN ))
   echo "⏱️  Elapsed: ${ELAPSED_MIN} min | Remaining: ${REMAINING_MIN} min"
   if [ "${ELAPSED_MIN}" -ge 40 ] || [ "${REMAINING_MIN}" -le 20 ]; then
     echo "🚨 EMERGENCY FLUSH WINDOW REACHED — call safeoutputs___create_pull_request NOW with partial progress, then end the run." >&2
     # Record a breadcrumb so post-step diagnostics can correlate the early
     # flush. Include the missing-language list because the validator only
     # checks files that exist and cannot detect absent siblings.
     BRIEF_DIR=$(dirname "$sourcePath")
     WRITTEN_LANGS=$(ls "${BRIEF_DIR}"/executive-brief_*.md 2>/dev/null | \
       sed 's|.*executive-brief_||;s|\.md$||' | tr '\n' ',' | sed 's/,$//')
     ALL_LANGS="sv,da,no,fi,de,fr,es,nl,ar,he,ja,ko,zh"
     MISSING_LANGS=""
     for lang in $(printf '%s' "${ALL_LANGS}" | tr ',' '\n'); do
       if [ ! -f "${BRIEF_DIR}/executive-brief_${lang}.md" ]; then
         if [ -z "${MISSING_LANGS}" ]; then
           MISSING_LANGS="${lang}"
         else
           MISSING_LANGS="${MISSING_LANGS},${lang}"
         fi
       fi
     done
     printf 'emergency_flush_triggered_at=%s\nelapsed_min=%s\nwritten_langs=%s\nmissing_langs=%s\n' \
       "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "${ELAPSED_MIN}" \
       "${WRITTEN_LANGS}" "${MISSING_LANGS}" \
       > "${ANALYSIS_DIR}/emergency-flush-${RUN_ID}.marker"
     echo "Written languages: ${WRITTEN_LANGS}" >&2
     echo "Missing languages: ${MISSING_LANGS}" >&2
   fi
   ```

   When the emergency-flush marker is written, call
   `safeoutputs___create_pull_request` immediately with the
   partial-progress title format (see Step 6 alternative below) and
   **do not start another language**. The next scheduled cron run
   will pick up the remaining languages via the discovery queue
   (missing-language detection is automatic).

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
    flush step. **Exception**: when the Step 4b emergency-flush
    marker file exists at
    `${ANALYSIS_DIR}/emergency-flush-${RUN_ID}.marker`, you MAY skip
    this hard gate and proceed directly to the partial-progress flush
    (Step 6, alternative title). Validator failures will surface in
    the post-step report and the PR comment — that is intended; do
    not let strict validation block the emergency rescue.
6. **Flush** — after step 5 reported `✅` (or after the emergency-flush
    marker was written in Step 4b), call
    `safeoutputs___create_pull_request`. The template literal below uses
    two bookkeeping variables you maintain in your own head as you
    iterate over the queue:

   - `COMPLETED_COUNT` — number of briefs whose 13 language siblings have
     all been written AND validator-clean (incremented after step 5 of
     this iteration).
   - `QUEUED_COUNT` — `totals.queued` from `/tmp/gh-aw/discovery/queue.json`
     (read once in Step 1; this is `2` on a default run, up to `4` on
     catch-up runs).
   - `PARTIAL_BRIEF_PATH` *(emergency flush only)* — `sourcePath` of the
     in-progress brief at the moment the Step 4b marker fired (e.g.
     `analysis/daily/2026-04-01/propositions/executive-brief.md`).
   - `PARTIAL_LANG_COUNT` *(emergency flush only)* — number of language
     siblings already written to disk for the in-progress brief (e.g.
     `10` when `ar` and `he` are done but `ja`, `ko`, `zh` are not).
     Compute with `ls "${BRIEF_DIR}"/executive-brief_*.md | wc -l`
     immediately before calling `safeoutputs___create_pull_request`.

   ```javascript
   safeoutputs___create_pull_request({
     title: `[news] Translate executive briefs — ${RUN_DATE} (${COMPLETED_COUNT}/${QUEUED_COUNT} briefs)`,
     body: `Translated ${COMPLETED_COUNT} executive briefs to 13 languages this run.\n\nSee analysis/translation-runs/${RUN_DATE}/summary.md for the per-brief quality matrix.`,
     base: "main",
     head: `news/translate-briefs-${RUN_DATE}`,
   })
   ```

   **Alternative title — partial-progress / emergency flush** (use when
   the Step 4b marker was written or the current brief is partially
   translated):

   ```javascript
   safeoutputs___create_pull_request({
     title: `[news] Translate executive briefs — ${RUN_DATE} (PARTIAL: ${COMPLETED_COUNT} complete + ${PARTIAL_LANG_COUNT}/13 in progress)`,
     body: `Emergency partial flush at wall-clock budget exhaustion.\n\nCompleted briefs: ${COMPLETED_COUNT}/${QUEUED_COUNT}. Partial brief (${PARTIAL_BRIEF_PATH}): ${PARTIAL_LANG_COUNT}/13 languages written.\n\n**Missing languages** (not validated by post-step — listed here because the validator only checks files that exist): ${MISSING_LANGS}\n\nThe next scheduled cron run will resume the missing languages automatically via the discovery queue.\n\nSee analysis/translation-runs/${RUN_DATE}/emergency-flush-${RUN_ID}.marker for the full gap record (written_langs + missing_langs fields).`,
     base: "main",
     head: `news/translate-briefs-${RUN_DATE}`,
   })
   ```

7. **Move to the next queue entry** until the queue is empty OR you've
   used ≥ 40 minutes of the 60-minute cap (the Step 4b check enforces
   this automatically — when the marker is written, end the run after
   the emergency flush).

### Step 3 — Final flush

When the queue is empty (or the wall-clock budget is exhausted):

1. Write `${ANALYSIS_DIR}/summary.md` with a per-brief, per-language
   quality matrix (one row per `(date, slug, lang)` triple). Score each
   translation 1-5 on the 5 quality dimensions from the translator guide:
   accuracy, fluency, terminology, completeness, formatting.
2. Run the validator one last time and copy its output into the summary.
3. Call `safeoutputs___create_pull_request` with the finalised title and
   body. Same branch. **Final flush must land by minute ≤ 50.**
4. **STOP IMMEDIATELY — do not execute any further commands.**
   Output a one-line confirmation (e.g. "PR created. Exiting.") and terminate.
   Do not continue processing — the run is complete.

## ⏱️ Time Budget (60-minute hard cap)

| Minutes | Action |
|---------|--------|
| 0-1 | Step 0 date context (records `WORKFLOW_START_EPOCH`); Step 1 read queue |
| 1-2 | Step 2 read sources, count headings, choose 1-phase vs 2-phase strategy |
| 2-30 | Translate brief #1 (13 languages, Pass 1 + Pass 2; largeSource = Phase A + Phase B). First per-brief flush at ~30. |
| 30-40 | Translate brief #2 (if queue has one). Second flush at ~40. |
| 40-45 | **Step 4b emergency-flush window**: any in-progress translation MUST stop and flush whatever is on disk by minute ≤ 45. |
| 45-50 | Step 3 summary + final flush. **Final flush must land by minute ≤ 50.** |
| 50-60 | Buffer for safe-outputs bundle application and graceful exit. **Do NOT start new work after minute 40.** |

Stretch: if `max_briefs` is overridden to 3 or 4 (catch-up mode), tighten
each per-brief window proportionally. The script-level discovery already
caps the queue; the AI does not need to ration its own work. The Step 4b
wall-clock guard is the failsafe — if anything overruns, it forces an
emergency partial flush instead of letting the engine time out with no PR.

**Transient-API-error mitigation**: rather than budgeting extra time for
retry loops, the root cause is addressed by (1) using a lower-cost model
(`claude-sonnet-4` instead of `claude-sonnet-4.6`) to reduce rate limiting,
(2) detecting retry loops early (two consecutive `edit` calls > 5 min each
= retry loop → trigger Step 4b immediately), and (3) aggressive 40-min
commit preparation threshold that ensures at least partial output is saved
even if a retry loop consumed early minutes.

## 🚫 Never

- **Never** translate before reading the translator guide.
- **Never** translate by running `sed`/`awk`/`tr` over the source.
- **Never** use `cat > file << 'EOF'` shell heredocs to write translation
  content. Heredocs silently truncate when the output fills the context
  window, dropping the last H2 section(s) without any visible error —
  this is the root cause of the recurring "7/8 H2" failures. Use the
  `create` tool exclusively.
- **Never** use `python3 << 'PYEOF'` (or any other language) heredocs to
  write translation content either. The same context-window truncation
  applies to every heredoc syntax; the Python variant was the fallback
  the agent reached for in run #26235374860 after an `edit "No match
  found"` failure on the Norwegian skeleton — and it works far less
  reliably than re-reading the file with `view` and re-issuing the
  `edit` with the exact placeholder string, or rewriting the whole
  file via a single `create` call. When `edit` fails, use `view` to
  recover the exact `oldText`, then retry `edit` or fall back to a
  full-file `create` — never to a heredoc.
- **Never** add new sections or merge sections — structural fidelity is
  enforced by validator gates #6 (heading parity), #7 (Mermaid parity), and
  human review.
- **Never** translate FIXED TOKENS. `IMF` stays `IMF`; `World Bank` stays
  `World Bank`; `TA-10-2026-0160` stays `TA-10-2026-0160`. **Latin-script
  target languages (`nl`, `no`, `sv`, `da`, `fi`, `de`, `fr`, `es`) are
  the highest-risk failure mode** because the target alphabet matches the
  source and the model is tempted to localise the acronym:
  - Dutch (`nl`): `IMF blijft IMF`; `WEO blijft WEO` — never `IMV` /
    `Wereldwijde Economische Vooruitzichten`.
  - Norwegian (`no`): `IMF` forblir `IMF`; `WEO` forblir `WEO` — aldri
    `IPF` / `IMV` / `Det internasjonale valutafondet` /
    `Pengefondet`.
  - Swedish (`sv`): `IMF` förblir `IMF` — aldrig `IVF` /
    `Internationella valutafonden`.
  - Danish (`da`): `IMF` forbliver `IMF` — aldrig `IMV` / `Den
    Internationale Valutafond`.
  - Finnish (`fi`): `IMF` säilyy muodossa `IMF` — ei koskaan `KVR` /
    `Kansainvälinen valuuttarahasto`.
  - German / French / Spanish: `IMF` stays `IMF` — never `IWF` (de) or
    `FMI` (fr / es). Run validator gate #5 in Step 2.4 to catch token
    drift before flush.
- **Never** call `safeoutputs___create_pull_request` with **zero
  `executive-brief_<lang>.md` translation files** written — the run
  marker written by Step 0 does not count. An empty-translation PR is
  the only flush that is always worse than no flush. Partial-brief
  flushes are explicitly **allowed** by Step 4b's emergency safety net
  (≥ 1 `executive-brief_<lang>.md` file on disk is sufficient).
- **Never** let the engine time out or terminate without flushing
  whatever translations are already on disk. The Step 4b wall-clock
  guard fires at ≥ 40 elapsed minutes (or ≤ 20 remaining of the
  60-minute cap); when it does, call
  `safeoutputs___create_pull_request` immediately with the
  partial-progress title — even mid-brief — and end the run.
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
- **`max-continuations: 1`** — after the final PR flush, the engine MUST
  NOT restart. One continuation is allowed only for crash recovery (resume
  from cache-memory). If the PR was already created, there is nothing left
  to do — terminate immediately.
- **Bounded data loss**: at any session failure between flushes, at most
  one brief's 13 files are lost — the prior brief's flush already landed
  in the PR.

## 🛑 Graceful Termination (MANDATORY after final flush)

After calling `safeoutputs___create_pull_request` for the **last time**
(either the final flush in Step 3 or the emergency flush in Step 4b):

1. **Do NOT start any new translation work.**
2. **Do NOT read additional files or run exploratory commands.**
3. **Output a single summary line** confirming the PR was created, e.g.:
   `"PR created. All translations complete. Exiting."` or
   `"Emergency flush complete. Partial translations submitted. Exiting."`
4. **Stop.** The run is done. Any further activity wastes tokens and risks
   an engine timeout that marks the entire workflow as "failure" even though
   the PR was successfully created.

> **Why this matters**: In run #219 (2026-05-18), the agent completed all
> 26 translations and created the PR at minute 41, but the engine continued
> running for another 14 minutes until it was forcibly terminated — marking
> the run as "failure" despite complete success. This costs rerun budget
> and generates spurious failure issues.

## 🔗 Related References

- [`analysis/methodologies/executive-brief-translation-guide.md`](../../analysis/methodologies/executive-brief-translation-guide.md) — canonical translator contract.
- [`analysis/templates/executive-brief-translation-template.md`](../../analysis/templates/executive-brief-translation-template.md) — empty target shell.
- [`scripts/discover-untranslated-briefs.js`](../../scripts/discover-untranslated-briefs.js) — queue builder.
- [`scripts/validate-brief-translations.js`](../../scripts/validate-brief-translations.js) — automated quality gate.
- [`.github/workflows/README.md`](./README.md) §"Translation cadence" — sizing & scheduling.
