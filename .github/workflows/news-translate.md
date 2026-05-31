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
# Checkout (gh-aw v0.76+): shallow clone (fetch-depth: 1) for fast checkout.
# Rationale:
#   * Full-history clones (fetch-depth: 0) took 14+ min on large repos,
#     consuming ~25 % of the 60-minute budget before the agent even starts.
#   * The safe-outputs prerequisite step in shared/config/news-safe-outputs-head.md
#     fetches the triggering commit (GITHUB_SHA) on demand — this satisfies
#     bundle-apply requirements without downloading full history upfront.
#   * Real-data feeds (`analysis/**/data/**`) are gitignored and excluded
#     by safe-outputs `excluded-files`, so the working tree is compact.
#   * Mirrors the efficient checkout pattern used in riksdagsmonitor workflows.
# Per the gh-aw v0.76 schema, `checkout.fetch-depth` is honoured only
# on top-level workflow files (placing it in a shared/imported config is
# silently ignored), which is why it lives here in every news-*.md.
checkout:
  fetch-depth: 1
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
        description: "Maximum number of source briefs to translate this run (1-4). Default 2. The prompt now bounds per-turn context (batched per-brief checks, side-file output, register pre-extracted into queue.json), so two briefs × 13 languages stays under the Copilot CAPI 25M effective-token per-session cap that previously limited this to 1 (regression run #26641760920). Override to 3-4 only for short-brief catch-up and watch the token budget."
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
# 13-19 markdown files / 150-230 KB of generated content per brief. The
# binding constraint is NOT the 10 MB patch ceiling but the Copilot CAPI
# 25M *effective-token* per-session cap: one agent session re-feeds its
# growing context on each turn. The prompt now bounds that accumulation —
# batched once-per-brief checks (one H2-parity block + one self-validate
# instead of per-language), verbose tool output redirected to side files,
# and the per-language register pre-extracted into queue.json so the 18 KB
# guide is not opened in-session. With that overhead removed, two briefs ×
# 13 languages stays under the cap, so MAX_BRIEFS defaults to 2 (was 1
# after regression run #26641760920 429'd a two-brief session). Time
# management: start preparing to commit
# after 40 min elapsed;
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
  # Raised to the gh-aw v0.76 schema maximum (10240 KB) for headroom on
  # operator-driven catch-up runs and to share a single ceiling with the
  # 14 article workflows. Real data is excluded via `excluded-files`
  # (`analysis/daily/**/data/**`), so headroom does not weaken the
  # "analysis artifacts only" guarantee.
  max-patch-size: 10240
  # Explicit file ceiling raised to the schema-unbounded "max" we standardise
  # on across all news-* workflows. Translation flushes ≤ max_briefs × 13
  # langs ≈ 52 files; 2500 gives ample headroom for validator reports and
  # retry flushes without ever approaching the cap.
  max-patch-files: 200
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
  # stubs produced by Step 4 emergency partial flushes — those are
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

1. **Per-language register** — the run's `queue.json` already carries the
   style register, EP terminology pairs, and FIXED-TOKEN note for exactly
   the languages you are producing (Step 1 extracts them to
   `/tmp/gh-aw/register.json`). Read those rows; you do **not** need to
   open the full guide in-session. Consult the **canonical translator
   guide**
   [`analysis/methodologies/executive-brief-translation-guide.md`](../../analysis/methodologies/executive-brief-translation-guide.md)
   only for an edge case the register does not cover (its § 2 preservation
   rules, § 3 structural fidelity, § 7 quality gates are the relevant
   sections).
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
| Emergency partial flush when wall-clock budget is exhausted (≥ 40 min elapsed OR ≤ 20 min remaining) — see § Step 4 | Silently let the engine time out / terminate without flushing any progress |

> **Why a flush-before-timeout safety net matters**: the safe-outputs
> system only commits when the agent explicitly calls
> `create_pull_request`; if the engine dies first, all uncommitted
> translations are discarded. Always prefer a partial-brief PR (flagged
> by the validator post-step) over zero output — the safety net fires
> once ≥ 1 translation file is on disk.

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

### Step 0 — Date context & run marker (mandatory, FIRST bash block)

> The PR branch (`news/translate-briefs-<date>`) is created automatically
> by `safeoutputs___create_pull_request` from the staged translation
> files — see the `concurrency` and `safe-outputs.create-pull-request`
> blocks in this file's frontmatter. **Do not** run `git checkout`,
> `git branch`, or any other git command in this step or in any
> agent bash-tool command during this run (see § 🚫 Never).

```bash
set -euo pipefail
mkdir -p /tmp/gh-aw
TODAY=$(date -u +%Y-%m-%d)
RUN_ID="${GITHUB_RUN_NUMBER:-0}"
RUN_DATE="$TODAY"

ANALYSIS_DIR="analysis/translation-runs/${RUN_DATE}"
mkdir -p "${ANALYSIS_DIR}"

# Wall-clock budget tracking — every later bash block checks elapsed
# minutes against this anchor to decide when to fire the emergency
# partial flush (Step 4). Stored in /tmp so subsequent agent steps
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
echo "Analysis dir: ${ANALYSIS_DIR}"
echo "PR branch (auto, created by safeoutputs): news/translate-briefs-${RUN_DATE}"
```

### Step 1 — Read the discovery queue (ONE bash block, parsed to file)

The pre-agent `Discover untranslated executive briefs` step has written
`/tmp/gh-aw/discovery/queue.json`. Parse it once into a compact summary —
do **not** `cat` the whole file into the transcript: it carries the
per-language register and would re-feed on every later turn.

```bash
set -euo pipefail
node -e '
  const q = require("/tmp/gh-aw/discovery/queue.json");
  const t = q.totals || {};
  console.log("queued=" + t.queued + " queuedTranslations=" + t.queuedTranslations +
    " fresh=" + t.freshNewestDate + " backlogOldest=" + t.backlogOldestDate);
  (q.queue || []).forEach((e, i) => console.log(
    "#" + i + " " + e.date + "/" + e.slug + " missing=" + e.missingCount +
    " H2=" + e.sourceH2Count + " largeSource=" + e.largeSource +
    " lines=" + e.sourceLineCount));
  // Per-language register (style + EP terminology + fixed-token note) written
  // to a side file so it never re-enters the transcript.
  require("node:fs").writeFileSync("/tmp/gh-aw/register.json",
    JSON.stringify(q.translationRegister || {}, null, 2));
' | tee /tmp/gh-aw/queue-summary.txt
echo "register-langs=$(node -e 'process.stdout.write(Object.keys(require("/tmp/gh-aw/register.json")).join(","))')"
```

The one-line summary above is all you need to keep in context. Two side
files hold the verbose data — consult them with `view` only when needed,
never re-`cat` them:

- `/tmp/gh-aw/register.json` — `translationRegister`: per-language style
  register, canonical EP terminology pairs, and the FIXED-TOKEN
  preservation note (gate #5). **Read the rows for the languages you are
  producing directly from this file — you do not need to open the 18 KB
  translator guide in-session.** Open the guide only for an edge case the
  register does not cover.
- Each queue entry also carries `sourceH2Titles` (the full ordered H2
  list — duplicate-titled sections such as `## IMF Economic Context` and
  `## IMF Economic Context — May 2026 Update` are **distinct sections**,
  never collapse them) and `sourceFixedTokens` (the verbatim-preserve
  budget per token).

**Queue ordering (`fresh-then-backlog`, default):** slot 0 is the newest
source with any missing language; slots 1+ are the *oldest* sources with
gaps, draining the long-tail backlog. **Treat every queue entry
identically: full 13-language translation per brief, no fast-path for the
fresh slot.**

If `totals.queued == 0`, write a short note to `${ANALYSIS_DIR}/no-work.md`
and END THE RUN without calling safeoutputs. **An empty PR is never the
right outcome.**

### Step 2 — Translate one brief at a time

For each queue entry (0-based `entryIndex`), in order:

1. **Per-brief setup — read the source ONCE (one bash block).** Resolve
   `sourcePath`, read the source a single time, and write the H2 checklist
   plus the list of translations already on disk to side files. Carry
   these forward; do **not** re-read the source per language.

   ```bash
   set -euo pipefail
   : "${entryIndex:?set entryIndex to the current 0-based queue position}"
   read -r sourcePath largeSource sourceLineCount < <(node -e '
     const q = require("/tmp/gh-aw/discovery/queue.json");
     const e = (q.queue || [])[Number(process.argv[2])] || {};
     process.stdout.write([e.sourcePath || "", e.largeSource ? "true" : "false",
       e.sourceLineCount || 0].join(" "));
   ' "$entryIndex")
   [ -n "$sourcePath" ] && [ -f "$sourcePath" ] || { echo "bad sourcePath: ${sourcePath:-<unset>}" >&2; exit 1; }
   BRIEF_DIR=$(dirname "$sourcePath")
   grep -nE '^## ' "$sourcePath" > /tmp/gh-aw/h2-checklist.txt || true
   ls "${BRIEF_DIR}"/executive-brief_*.md 2>/dev/null \
     | sed 's|.*executive-brief_||;s|\.md$||' | sort > /tmp/gh-aw/on-disk-langs.txt || true
   echo "brief=${BRIEF_DIR} src_h1=$(grep -cE '^# [^#]' "$sourcePath") src_h2=$(wc -l < /tmp/gh-aw/h2-checklist.txt) largeSource=${largeSource} lines=${sourceLineCount} onDisk=$(paste -sd, /tmp/gh-aw/on-disk-langs.txt)"
   ```

   `/tmp/gh-aw/h2-checklist.txt` is your **MUST-TRANSLATE** list (the last
   title is the one most often dropped). `/tmp/gh-aw/on-disk-langs.txt`
   lists languages already written — a transient-API-error retry may have
   re-entered this brief, so **skip any `lang` that is already on disk**
   and do not re-`create` it.

2. **Write each missing language.** For each `lang` in the entry's
   `missingLangs` that is **not** already on disk, create the sibling
   `${BRIEF_DIR}/executive-brief_${lang}.md` (for `isExtended: true`
   entries the path is `…/<slug>/extended/executive-brief_<lang>.md`).

   - Use the `create` tool **exclusively** (pass `path` + `file_text`).
     **NEVER** use shell heredocs (`cat > file << 'EOF'`) — they silently
     truncate when content fills the context, dropping the last H2
     section(s). Use `edit` only for files already on disk.
   - Mirror the source structure: exact H1 and H2 counts (zero tolerance),
     H3 within ±1, same list count, table rows, blockquote count, emoji
     markers. Every `##` in the source needs a matching `##`.
   - Translate every prose section. Pass 1 covers every section; Pass 2
     re-reads the whole file, expands cramped passages, fixes terminology
     drift, and verifies every FIXED TOKEN.
   - Apply the per-language `register` + `terms` + `fixedTokenNote` rows
     from `/tmp/gh-aw/register.json`.
   - Preserve every FIXED TOKEN verbatim: `IMF`, `WEO`, `World Bank`,
     `Fiscal Monitor`, `data-vintage="WEO-…"`, `TA-NN-YYYY-NNNN`,
     `YYYY/NNNN(COD|INI|NLE)`, ISO country/currency codes, confidence
     emoji (`🟢 HIGH` / `🟡 MEDIUM` / `🔴 LOW`), classification stamps.
     Latin-script targets (`nl`, `no`, `sv`, `da`, `fi`, `de`, `fr`, `es`)
     are the highest-risk: never localise `IMF` to `IMV`/`IPF`/`IVF`/
     `KVR`/`IWF`/`FMI` — copy the Latin token verbatim.

   > **🐘 largeSource = `true`** (source `sourceLineCount` >
   > `MAX_SOURCE_LINES`, default 300): do not write the whole translation
   > in one `create`. For each language run **Phase A** — `create` a
   > skeleton whose first line is the marker
   > `<!-- translation-skeleton: lang=<lang> phase=A run=${RUN_ID} -->`,
   > then the H1, then every `## H2` heading in order with a
   > `<!-- pending -->` line under each. Then **Phase B** — `edit` each
   > `<!-- pending -->` placeholder into its translated section; after the
   > last section, **remove the skeleton marker** with one final `edit`.
   > The marker is a contract with the validator (it emits a single
   > non-blocking `skeleton-incomplete` advisory instead of cascading
   > violations, keeping an emergency partial flush at `success`). If
   > `edit` returns "No match found", re-`view` and retry, or rewrite with
   > one `create` — never a heredoc (`python3 << 'PYEOF'` is equally
   > banned). Small briefs (`largeSource: false`) use the one-shot
   > `create`.

3. **Batched H2 verification (ONE bash block AFTER every language for this
   brief is written).** This replaces the old per-language spot-check:
   loop all siblings once, compare `src_h2` vs `out_h2`, and exit
   non-zero naming offenders. Run once per brief, not per language.

   ```bash
   set -euo pipefail
   BRIEF_DIR=$(dirname "$sourcePath")
   src_h2=$(grep -cE '^## ' "$sourcePath" || true)
   fail=0
   for f in "${BRIEF_DIR}"/executive-brief_*.md; do
     [ -e "$f" ] || continue
     out_h2=$(grep -cE '^## ' "$f" || true)
     if [ "$src_h2" != "$out_h2" ]; then
       echo "❌ H2 MISMATCH $(basename "$f"): source=${src_h2} translation=${out_h2}" >&2
       fail=1
     fi
   done
   if [ "$fail" -ne 0 ]; then
     echo "Source H2 titles:" >&2; cat /tmp/gh-aw/h2-checklist.txt >&2
     exit 1
   fi
   echo "✅ H2 parity OK for all siblings in ${BRIEF_DIR} (${src_h2} each)"
   ```

   A mismatch means a section was dropped (almost always the last H2). Fix
   it now before continuing.

4. **Wall-clock safety net — emergency partial flush (once per brief).**
   Compute elapsed minutes from `WORKFLOW_START_EPOCH`. At **≥ 40 min
   elapsed** (or **≤ 20 min remaining** of the 60-min cap), STOP and flush
   whatever is on disk — even a partially-translated brief. A
   partial-progress PR always beats a zero-PR timeout. The validator only
   checks files that exist, so the gap list must come from the marker.

   ```bash
   set -euo pipefail
   START_EPOCH=$(cat /tmp/gh-aw/workflow-start-epoch)
   ELAPSED_MIN=$(( ( $(date -u +%s) - START_EPOCH ) / 60 ))
   REMAINING_MIN=$(( 60 - ELAPSED_MIN ))
   echo "⏱️ elapsed=${ELAPSED_MIN}m remaining=${REMAINING_MIN}m"
   if [ "${ELAPSED_MIN}" -ge 40 ] || [ "${REMAINING_MIN}" -le 20 ]; then
     BRIEF_DIR=$(dirname "$sourcePath")
     WRITTEN_LANGS=$(ls "${BRIEF_DIR}"/executive-brief_*.md 2>/dev/null \
       | sed 's|.*executive-brief_||;s|\.md$||' | tr '\n' ',' | sed 's/,$//')
     ALL_LANGS="sv,da,no,fi,de,fr,es,nl,ar,he,ja,ko,zh"
     MISSING_LANGS=""
     for lang in $(printf '%s' "${ALL_LANGS}" | tr ',' '\n'); do
       [ -f "${BRIEF_DIR}/executive-brief_${lang}.md" ] || MISSING_LANGS="${MISSING_LANGS:+${MISSING_LANGS},}${lang}"
     done
     printf 'emergency_flush_triggered_at=%s\nelapsed_min=%s\nwritten_langs=%s\nmissing_langs=%s\n' \
       "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "${ELAPSED_MIN}" "${WRITTEN_LANGS}" "${MISSING_LANGS}" \
       > "${ANALYSIS_DIR}/emergency-flush-${RUN_ID}.marker"
     echo "🚨 EMERGENCY FLUSH — call safeoutputs___create_pull_request now (partial-progress), then end the run." >&2
     echo "written=${WRITTEN_LANGS} missing=${MISSING_LANGS}" >&2
   fi
   ```

   When the marker is written, call `safeoutputs___create_pull_request`
   with the partial-progress title (Step 6) and start no new language; the
   next cron run resumes the gaps via discovery.

5. **Self-validate (hard gate).** Run the validator once over this
    brief's siblings; redirect its log to a side file and read only the
    one-line result. **Do not call `safeoutputs___create_pull_request`
    until this reports `validator-clean`** (exception below).

    ```bash
    set -euo pipefail
    BRIEF_DIR=$(dirname "$sourcePath")
    REPORT="${ANALYSIS_DIR}/validator-${BRIEF_DIR//\//_}.json"
    if node scripts/validate-brief-translations.js \
         --paths "${BRIEF_DIR}/executive-brief_*.md" \
         --report "$REPORT" > /tmp/gh-aw/validate.log 2>&1; then
      echo "✅ ${BRIEF_DIR} validator-clean — safe to flush."
    else
      echo "❌ violations remain in ${BRIEF_DIR}:" >&2
      node -e 'const r=require(process.argv[2]); for (const v of r.violations) console.error("•", v.translationPath, "["+v.gate+"]", v.message);' "$REPORT" >&2
      exit 1
    fi
    ```

    (In `node -e`, the report path is `process.argv[2]` — argv index 1
    is `[eval]`.) Common fixes when a gate flags a translation —
    re-translate it now, never let it slip into the PR:
    `heading-parity` → re-add the dropped `## Section` (duplicate-titled
    H2s like `IMF Economic Context` and `IMF Economic Context — May 2026
    Update` are **distinct sections**); `fixed-token-preservation` →
    re-insert the Latin token verbatim (cross-check `sourceFixedTokens`);
    `mermaid-parity` → copy every ```` ```mermaid ```` block unchanged;
    `length-floor` / `english-fallthrough` → the file is a stub, redo it.

    **Exception**: when the Step 4 emergency-flush marker
    (`${ANALYSIS_DIR}/emergency-flush-${RUN_ID}.marker`) exists, skip this
    gate and proceed directly to the partial-progress flush — let the
    authoritative post-step report the gaps. Do not let strict validation
    block the emergency rescue.
6. **Flush** — after step 5 reported `✅` (or after the emergency-flush
    marker was written in Step 4), call
    `safeoutputs___create_pull_request`. The template literal below uses
    two bookkeeping variables you maintain in your own head as you
    iterate over the queue:

   - `COMPLETED_COUNT` — number of briefs whose 13 language siblings have
     all been written AND validator-clean (incremented after step 5 of
     this iteration).
   - `QUEUED_COUNT` — `totals.queued` from `/tmp/gh-aw/discovery/queue.json`
     (read once in Step 1; default runs queue up to `2` briefs, more on
     catch-up runs).
   - `PARTIAL_BRIEF_PATH` *(emergency flush only)* — `sourcePath` of the
     in-progress brief at the moment the Step 4 marker fired (e.g.
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
   the Step 4 marker was written or the current brief is partially
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
   used ≥ 40 minutes of the 60-minute cap (the Step 4 check enforces
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
| 0-1 | Step 0 date context (records `WORKFLOW_START_EPOCH`); Step 1 read queue (one parsed summary line) |
| 1-2 | Step 2.1 per-brief setup — read source once, write H2 checklist + on-disk list |
| 2-26 | Translate brief #1 (13 languages, Pass 1 + Pass 2; largeSource = Phase A + Phase B), then Step 2.3 batched H2 check + Step 5 self-validate. First flush at ~26. |
| 26-40 | Translate brief #2 (default `max_briefs=2`), batched-verify, self-validate. Second flush by ~40. |
| 40-45 | **Step 4 emergency-flush window**: any in-progress translation MUST stop and flush whatever is on disk by minute ≤ 45. |
| 45-50 | Step 3 summary + final flush. **Final flush must land by minute ≤ 50.** |
| 50-60 | Buffer for safe-outputs bundle application and graceful exit. **Do NOT start new work after minute 40.** |

The batched per-brief checks (one H2-parity block + one self-validate per
brief, instead of per-language) keep the two-brief default within the cap;
the bounded per-turn context also keeps the session under the 25M
effective-token limit that previously forced `max_briefs=1`. If
`max_briefs` is overridden higher (catch-up mode), tighten each per-brief
window proportionally. The Step 4 wall-clock guard is the failsafe — if
anything overruns, it forces an emergency partial flush instead of letting
the engine time out with no PR.

**Transient-API-error mitigation**: rather than budgeting extra time for
retry loops, the root cause is addressed by (1) keeping the model at
`claude-sonnet-4.6` (the repo-wide standard — never downgrade; see
`.github/prompts/09-troubleshooting.md` §5 "Do NOT downgrade the model"
guidance) and aggressively pre-fetching feeds + caching thresholds so
each invocation does maximum useful work, (2) detecting retry loops
early (two consecutive `edit` calls > 5 min each = retry loop → trigger
Step 4 immediately), and (3) aggressive 40-min commit preparation
threshold that ensures at least partial output is saved even if a retry
loop consumed early minutes.

## 🚫 Never

Hard rules — keep tight. Full file-authoring priority lives in `shared/prompts/news-unified-runtime.md` §"📝 File Authoring Policy".

- **Write translation prose with the `create` tool exclusively.** Use `edit` for any file already on disk (Phase B section edits, marker removal, mid-brief recovery). `jq`+`cat > file` is reserved for `manifest.json` / status flags only.
- **Heredocs of any language are banned** for translation output — `cat > file << 'EOF'` and `python3 << 'PYEOF'` (and any `ruby`/`perl` variant) silently truncate at the context-window boundary, which is the root cause of the recurring "7/8 H2" failures and skeleton-cascade regressions. When `edit` returns *"No match found"*, recover via `view` → retry `edit` → fall back to a single full-file `create`. Never to a heredoc.
- **No manual git operations.** `git checkout`, `git branch`, `git status`, `git log`, `git commit`, `git push`, `git merge`, and any other git command are **banned** from the agent's bash tool. The PR branch (`news/translate-briefs-<date>`) and all commits are created automatically by `safeoutputs___create_pull_request` from staged file changes — see the `concurrency` and `safe-outputs.create-pull-request` blocks at the top of this file. Running git manually wastes wall-clock budget, bloats the context window (every command's output stays in the conversation), and was the proximate trigger for the server-error retry that wiped run #26260612873 before a single translation was written.
- **No scripted substitution.** Translate by reading and writing prose; `sed` / `awk` / `tr` over the source is forbidden (it cannot resolve FIXED TOKEN preservation, idiom, or tone).
- **Use the per-language register from `queue.json` first** — read the
  rows in `/tmp/gh-aw/register.json` (Step 1); open
  `analysis/methodologies/executive-brief-translation-guide.md` only for an
  edge case the register does not cover. Do not read the full guide
  end-to-end in-session.
- **Preserve structure.** No new sections, no merged sections — validator gates #6 (heading parity) and #7 (Mermaid parity) enforce this.
- **Preserve FIXED TOKENS.** `IMF` stays `IMF`; `World Bank` stays `World Bank`; `TA-10-2026-0160` stays `TA-10-2026-0160`. Highest risk: Latin-script targets (`nl`, `no`, `sv`, `da`, `fi`, `de`, `fr`, `es`) — never localise (`IMV`, `IPF`, `IVF`, `KVR`, `IWF`, `FMI`, `Pengefondet`, `Internationella valutafonden`, …). Validator gate #5 catches drift; run the Step 5 self-validate before flush.
- **Every PR must contain at least one `executive-brief_<lang>.md`.** The Step 0 run marker alone is not a translation. Partial-brief flushes ARE allowed and ARE encouraged by Step 4's emergency safety net (≥ 1 translation file on disk).
- **Flush before the cap.** Step 4's wall-clock guard fires at ≥ 40 elapsed min / ≤ 20 remaining (60-min cap). When it does, call `safeoutputs___create_pull_request` immediately — even mid-brief — and end the run. A partial-progress PR is always better than a zero-PR timeout.
- **Drain the backlog.** `fresh-then-backlog` discovery guarantees slot 0 is the newest brief; slots 1+ are the long tail. Translate them with the same rigour — date age is not a skip reason.
- **PR scope is `analysis/daily/**` only.** `news/**`, `src/**`, `scripts/**`, `.github/**` are blocked by `excluded-files`; do not work around it.

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
(either the final flush in Step 3 or the emergency flush in Step 4):

1. **Do NOT start any new translation work.**
2. **Do NOT read additional files or run exploratory commands.**
3. **Output a single summary line** confirming the PR was created, e.g.:
   `"PR created. All translations complete. Exiting."` or
   `"Emergency flush complete. Partial translations submitted. Exiting."`
4. **Stop.** The run is done. Any further activity wastes tokens and risks
   an engine timeout that marks the entire workflow as "failure" even though
   the PR was successfully created.

> **Why this matters**: idling after the final PR has been created has
> caused completed runs to be marked "failure" when the engine was later
> forcibly terminated — wasting rerun budget and generating spurious
> failure issues. Exit the moment the PR exists.

## 🔗 Related References

- [`analysis/methodologies/executive-brief-translation-guide.md`](../../analysis/methodologies/executive-brief-translation-guide.md) — canonical translator contract.
- [`analysis/templates/executive-brief-translation-template.md`](../../analysis/templates/executive-brief-translation-template.md) — empty target shell.
- [`scripts/discover-untranslated-briefs.js`](../../scripts/discover-untranslated-briefs.js) — queue builder.
- [`scripts/validate-brief-translations.js`](../../scripts/validate-brief-translations.js) — automated quality gate.
- [`.github/workflows/README.md`](./README.md) §"Translation cadence" — sizing & scheduling.
