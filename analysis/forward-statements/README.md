<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Forward-Statements Registry

**Location:** `analysis/forward-statements/`  
**Format:** Append-mostly JSONL, sharded by calendar month (`YYYY-MM.jsonl`)  
**Script:** `scripts/aggregator/forward-statements-registry.js`  
**ISMS reference:** [AI Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md) — accountability for forward-looking claims requires tracking to closure

---

## Purpose

The forward-statements registry persists forward-looking claims made in **week-ahead** and
**month-ahead** analysis runs. Each subsequent run reads open items and must address them
either confirming delivery, marking as superseded, or carrying them forward with updated
evidence. This closes the loop between predictive analysis and accountability, implementing
the NIS2 transparency principle.

---

## Schema

Each JSONL line is one forward-statement entry:

```json
{
  "id":                "uuid-v4",
  "topic":             "banking-union",
  "originatingRunId":  "week-ahead-run12345-1714204800",
  "originatingDate":   "2026-04-27",
  "statement":         "SRMR3/BRRD3/DGSD2 Banking Union trilogue expected to conclude first reading by end of May 2026.",
  "expectedHorizon":   "2026-05-31",
  "status":            "open",
  "lastObservedDate":  "2026-04-27",
  "evidenceRefs":      ["A-10-2026-0067", "2024/0001(COD)"]
}
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `id` | `string` (UUID v4) | ✅ | Stable identifier generated on first append |
| `topic` | `string` | ✅ | Short kebab-case topic slug (e.g. `banking-union`, `ai-act`, `defence-spending`) |
| `originatingRunId` | `string` | ✅ | The `RUN_ID` value from the originating workflow (e.g. `week-ahead-run12345-1714204800`) |
| `originatingDate` | `string` (YYYY-MM-DD) | ✅ | Calendar date the statement was first produced |
| `statement` | `string` | ✅ | The forward-looking claim in full prose |
| `expectedHorizon` | `string` (YYYY-MM-DD or YYYY-Www) | ✅ | Expected resolution date or ISO week |
| `status` | enum | ✅ | See **Status Lifecycle** below |
| `lastObservedDate` | `string` (YYYY-MM-DD) | ✅ | Date of the last run that touched this entry |
| `evidenceRefs` | `string[]` | ✅ | EP document IDs, procedure IDs, or adopted-text references supporting the claim |

### Status Lifecycle

```
open  ──────► implemented   (claim confirmed delivered)
  │
  ├──────────► superseded    (claim replaced by a newer statement on the same topic)
  │
  └──────────► abandoned     (claim no longer relevant — horizon passed without evidence)
```

| Status | Meaning |
|--------|---------|
| `open` | Claim is active; subsequent runs must address it |
| `implemented` | The stated action/vote/procedure has been confirmed delivered |
| `superseded` | A newer statement on the same topic replaces this one |
| `abandoned` | Expected horizon passed without confirming evidence; claim retired |

---

## File Layout

```
analysis/forward-statements/
├── README.md            ← this file (static)
├── 2026-04.jsonl        ← all entries originating in April 2026
├── 2026-05.jsonl        ← all entries originating in May 2026
└── …
```

Monthly sharding keeps individual files small. All read operations scan every
extant shard unless a date filter is applied.

**Append-mostly semantics:** Update operations append a new line with the
revised `status`/`lastObservedDate`/`evidenceRefs`; old lines are retained for
audit trail. Readers use the **last occurrence** of each `id` as the canonical
state.

---

## Usage

### Append new statements

```bash
# From a JSON array file:
node scripts/aggregator/forward-statements-registry.js append --file /tmp/new-statements.json

# From stdin (pipe a JSON array):
echo '[{"topic":"ai-act","originatingRunId":"week-ahead-run1-1714204800","originatingDate":"2026-04-27","statement":"AI Act delegated acts expected by end of May.","expectedHorizon":"2026-05-31","status":"open","evidenceRefs":["2021/0106(COD)"]}]' \
  | node scripts/aggregator/forward-statements-registry.js append
```

### Read open items (Stage A seed)

```bash
# All open items whose horizon is on or after today:
node scripts/aggregator/forward-statements-registry.js read \
  --status open \
  --horizon-from "$(date -u +%Y-%m-%d)"
```

### Update a statement

```bash
node scripts/aggregator/forward-statements-registry.js update \
  --id "550e8400-e29b-41d4-a716-446655440000" \
  --status implemented \
  --evidence "TA-10-2026-0142"
```

### Print summary

```bash
node scripts/aggregator/forward-statements-registry.js summary
```

---

## Stage A Integration (week-ahead / month-ahead)

At the start of Stage A, each week-ahead and month-ahead run should:

1. Read the registry for open items within the run's horizon window:

```bash
TODAY=$(date -u +%Y-%m-%d)
HORIZON_END=$(date -u -d '30 days' +%Y-%m-%d)  # or '7 days' for week-ahead
node scripts/aggregator/forward-statements-registry.js read \
  --status open \
  --horizon-from "$TODAY" \
  --horizon-to "$HORIZON_END" \
  > "${ANALYSIS_DIR}/data/forward-statements-open.json"
```

2. Surface open items in `intelligence/synthesis-summary.md` under the
   **"Carried-forward forward statements"** section.

3. At the end of Stage B, for each carried item:
   - Mark `implemented` with an evidence ref if confirmed delivered.
   - Mark `superseded` and append a new entry if the prediction changed.
   - Leave `open` and update `lastObservedDate` if no new evidence.

---

## Stage C Validator Contract

When `data/forward-statements-open.json` exists in the run directory and is
non-empty, `scripts/validate-analysis-completeness.js` will check that
`intelligence/synthesis-summary.md` contains a **"Carried-forward forward
statements"** section. A missing section produces a `RED` gate.

---

## Urgency Motion Sweep (Monday mornings)

When a week-ahead run executes on a Monday (the first day of an EP session
week), Stage A additionally calls:

```bash
node scripts/aggregator/forward-statements-registry.js read \
  --status open \
  --horizon-from "$HORIZON_START" \
  --horizon-to "$HORIZON_END" \
  > "${ANALYSIS_DIR}/data/forward-statements-open.json"
```

…and polls `get_adopted_texts_feed` + `get_procedures_feed` to detect any
Rule 132 urgency motions filed that morning before confirming agenda-specific
predictions.

---

## ISMS Compliance

| Control | Requirement |
|---------|-------------|
| ISO 27001 A.12.4.1 | Event logging — every append/update is an immutable audit record |
| NIST CSF ID.GV-1 | Governance — forward claims are tracked with accountability |
| NIS2 Art. 23 | Transparency — open forward statements are visible in published synthesis |
| AI Policy §5 | Forward-looking AI outputs are tracked to resolution or retirement |
