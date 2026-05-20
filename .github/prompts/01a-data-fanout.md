<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 01a — Stage-A Fan-Out Helpers (forward statements + multi-day sweeps)

**Summary:** Stage-A helpers that only apply to forward-looking and
long-horizon article workflows. Extracted from
[`01-data-collection.md`](01-data-collection.md) to keep the universal
data-collection contract under the prompt-module line cap. Universal
rules (feeds, deep-fetch, IMF/WB context, data-mode declaration,
seat-count normalisation, MCP defensive rules, hard rules, Stage-A
exit) remain in `01-data-collection.md`.

## When to import this module

| Helper | Applies to |
|--------|------------|
| §1 Forward-statements registry seed | `week-ahead`, `month-ahead`, `quarter-ahead`, `year-ahead`, `term-outlook`, `election-cycle` |
| §2 Multi-day foreseen activities fan-out | `week-ahead`, `month-ahead`, `quarter-ahead`, `year-ahead`, `term-outlook`, `election-cycle` |
| §3 Monday urgency motion sweep | `week-ahead` (Monday execution only) |
| §4 Quarter+ horizon fan-out (≥ 90 days) | `quarter-ahead`, `quarter-in-review`, `year-ahead`, `year-in-review`, `term-outlook`, `election-cycle` |

Retrospective workflows (`week-in-review`, `month-in-review`) and
short-cycle workflows (`breaking`, `motions`, `propositions`,
`committee-reports`) **do not** import this module — they only need
the universal contract in `01-data-collection.md`.

## 1 · Forward-Statements Registry Seed (week-ahead / month-ahead)

For `week-ahead` and `month-ahead` workflows, Stage A **must** read the
persistent forward-statements registry and seed the synthesis with any open
items in scope:

```bash
TODAY=$(date -u +%Y-%m-%d)
# week-ahead: 7-day horizon; month-ahead: 30-day horizon
if [ "${ARTICLE_TYPE_SLUG}" = "week-ahead" ]; then
  HORIZON_DAYS=7
else
  HORIZON_DAYS=30
fi
HORIZON_END=$(date -u -d "${HORIZON_DAYS} days" +%Y-%m-%d)
node scripts/aggregator/forward-statements-registry.js read \
  --status open \
  --horizon-from "$TODAY" \
  --horizon-to "$HORIZON_END" \
  > "${ANALYSIS_DIR}/data/forward-statements-open.json"
echo "FORWARD_STATEMENTS_OPEN=$(cat "${ANALYSIS_DIR}/data/forward-statements-open.json" | wc -c)" >> "$GITHUB_ENV"
```

After Stage B, for each open item in `data/forward-statements-open.json`:
- If confirmed delivered: `node scripts/aggregator/forward-statements-registry.js update --id <id> --status implemented --evidence <ref>`
- If superseded by new analysis: `node scripts/aggregator/forward-statements-registry.js update --id <id> --status superseded`
- If carried forward unchanged: update `lastObservedDate` by re-running the registry update with `--status open`

**Expired carry-forward close-out (§9.2 quality gate):** When a forward statement's
`expectedHorizon` has passed (i.e. `now > expectedHorizon`), the agent MUST close it
out with a status update. Stage C turns RED if >2 expired statements remain
unresolved. For each expired item, update the registry row:
- `status: 'resolved'` — prediction confirmed by EP data; use `--evidence <ref>` to cite the confirming source
- `status: 'stale'` — horizon passed without resolution; mark as withdrawn (`--evidence` is optional)
- `status: 'extended'` — horizon passed but analyst extends with fresh evidence; use `--evidence <ref>`

The `--evidence` flag appends to the entry's `evidenceRefs` array (it can remain empty for `stale` close-outs).

```bash
node scripts/aggregator/forward-statements-registry.js update --id <id> --status resolved --evidence <ref>
node scripts/aggregator/forward-statements-registry.js update --id <id> --status stale
```

At the end of Stage B, append new forward statements produced by this run:

```bash
node scripts/aggregator/forward-statements-registry.js append --file /tmp/new-forward-statements.json
```

## 2 · Multi-Day Foreseen Activities Fan-Out (week-ahead / month-ahead)

For `week-ahead` and `month-ahead` workflows, Stage A **must** call
`get_meeting_foreseen_activities` for **every** session day in the coverage
window — not just day 1. EP plenary sessions run Monday through Thursday in
Strasbourg (4 days) and Wednesday/Thursday in Brussels mini-sessions (2 days).

**Fan-out pattern (Strasbourg full session):**

Call `get_meeting_foreseen_activities` for each sitting ID:
- `sittingId: "MTG-PL-<YYYY-MM-DD>"` for Mon (day 1)
- `sittingId: "MTG-PL-<YYYY-MM-DD+1>"` for Tue (day 2)
- `sittingId: "MTG-PL-<YYYY-MM-DD+2>"` for Wed (day 3)
- `sittingId: "MTG-PL-<YYYY-MM-DD+3>"` for Thu (day 4)

Each call should use `limit: 20`. Collect all results and merge into
`${ANALYSIS_DIR}/data/foreseen-activities-<YYYY-MM-DD>.json` per day.

If any day's call returns 0 items or a 404, log the failure but continue with
remaining days — partial coverage is better than no coverage.

**Budget:** These are light calls (each typically < 2 s). Four calls fit
comfortably within the ≤ 4 min Stage A budget.

## 3 · Monday Urgency Motion Sweep

When a `week-ahead` run executes on a **Monday** (the first day of an EP
session week), Stage A **must** perform a brief urgency motion sweep
*before* confirming any agenda-specific predictions:

```bash
TODAY=$(date -u +%Y-%m-%d)
DOW=$(date -u -d "$TODAY" +%u)  # 1=Mon … 7=Sun
if [ "$DOW" = "1" ]; then
  # Monday urgency motion sweep — Rule 132 motions are filed Monday morning
  echo "URGENCY_SWEEP=true" >> "$GITHUB_ENV"
fi
```

When `URGENCY_SWEEP=true`, Stage A additionally:
1. Calls `get_adopted_texts_feed` with `timeframe: "today"` to capture any
   Rule 132 urgency motions adopted or tabled that morning.
2. Calls `get_procedures_feed` with `timeframe: "today"` to detect newly
   registered urgency procedures.
3. Writes results to `${ANALYSIS_DIR}/data/urgency-motions-<TODAY>.json`.
4. Logs a note in `manifest.json` under `dataVerification.urgencyMotionSweep`
   with timestamp and item count.

This 60-second sweep ensures the article's agenda predictions reflect the
Monday morning Rule 132 filings and are not locked to Sunday's pre-session
state.

## 4 · Quarter+ Horizon Fan-Out (≥ 90-day horizons)

For article types with a data window ≥ 90 days (`quarter-ahead`,
`quarter-in-review`, `year-ahead`, `year-in-review`, `term-outlook`,
`election-cycle`, `deep-analysis`), Stage A **must** fan out EP data
collection per-month and pull institutional-calendar context:

**Per-month plenary session fan-out:**

The fan-out loop iterates over the article's `dataWindow` (days + direction)
from `src/config/article-horizons.ts`, NOT the `forwardStatementsHorizonDays`
value (which may be 0 for retrospective horizons). For prospective articles,
iterate forward from today; for retrospective articles, iterate backward.

```bash
TODAY=$(date -u +%Y-%m-%d)
# Use dataWindow.days from the article-horizons registry (NOT FORWARD_HORIZON_DAYS)
HORIZON_DAYS="${DATA_WINDOW_DAYS:-90}"
if [ "${HORIZON_DAYS}" -ge 90 ]; then
  MONTHS_TO_COVER=$(( (HORIZON_DAYS + 29) / 30 ))
  # direction: +N months for prospective, -N months for retrospective
  DIRECTION="${DATA_WINDOW_DIRECTION:-forward}"
  for i in $(seq 0 "$MONTHS_TO_COVER"); do
    if [ "$DIRECTION" = "backward" ]; then
      MONTH_START=$(date -u -d "$TODAY -${i} months" +%Y-%m-01)
    else
      MONTH_START=$(date -u -d "$TODAY +${i} months" +%Y-%m-01)
    fi
    MONTH_END=$(date -u -d "$MONTH_START +1 month -1 day" +%Y-%m-%d)
    echo "Fetching plenary sessions: $MONTH_START → $MONTH_END"
  done
fi
```

For each month in the window, call `get_plenary_sessions({ dateFrom:
<month-start>, dateTo: <month-end>, limit: 20 })`. Merge results into
`${ANALYSIS_DIR}/data/plenary-sessions-horizon.json`.

**Commission Work Programme & Council Presidency (external documents):**

For horizons ≥ 90 days, additionally pull:
1. `get_external_documents_feed({ timeframe: "one-month" })` — captures
   Commission proposals and Council Presidency programme documents.
2. `get_external_documents({ limit: 50 })` — fallback if feed is empty;
   scan for Commission Work Programme (CWP) and Trio Presidency programme.

Write results to `${ANALYSIS_DIR}/data/external-docs-horizon.json`.

**Election calendar context:**

When `ELECTORAL_OVERLAY=true` (per `src/config/article-horizons.ts`),
derive EP-term anchors and days-to-next-election from the fallback guidance
in [`electoral-cycle-methodology.md`](../../analysis/methodologies/electoral-cycle-methodology.md)
using the documented term anchors (EP9: 2019-07-02 → 2024-07-15; EP10:
2024-07-16 → 2029-06; next EP election = second Sunday of June per Council
Decision 2018/767). Reference
[`12-electoral-cycle.md`](12-electoral-cycle.md) §5 for auto-trigger
thresholds (T-180 / T-90 / T-30).

**Budget:** Per-month fan-out adds ~2 s per month; a 12-month horizon adds
~24 s. External-docs feed is < 2 s. Total overhead stays within the ≤ 5 min
Stage A budget for prospective horizons (per `src/config/article-horizons.ts`
`PROSPECTIVE_BUDGETS.A = 5`).
