---
title: "🔬 MCP Server Data-Reliability Audit — 6-Run Empirical Findings (Run 184)"
date: 2026-04-18
articleType: breaking
runId: 184
confidence: HIGH
scope: "European Parliament MCP Server (european-parliament-mcp-server@1.2.8)"
series: "Easter Recess 2026 (Runs 179–184)"
---

# 🔬 MCP Server Data-Reliability Audit — Run 184

![Scope](https://img.shields.io/badge/Scope-EP_MCP_Server_1.2.8-blue?style=flat-square)
![Runs](https://img.shields.io/badge/Empirical_Basis-Runs_179--184-green?style=flat-square)
![Confidence](https://img.shields.io/badge/Audit_Confidence-HIGH-brightgreen?style=flat-square)
![Issues](https://img.shields.io/badge/Defects_Identified-7-red?style=flat-square)

> **Scope**: This audit consolidates every data-reliability anomaly observed across the six
> consecutive Easter-recess runs (179–184) that monitored the European Parliament MCP server
> during its scheduled API maintenance window. It is the canonical reliability record for
> this recess period and the evidence base for five upstream issues filed against
> [`Hack23/European-Parliament-MCP-Server`](https://github.com/Hack23/European-Parliament-MCP-Server/issues).

---

## 1. Executive Summary

The 6-run empirical observation window revealed **seven distinct data-reliability defects**
in the European Parliament MCP server. Three are upstream EP Open Data Portal issues the MCP
server propagates without mitigation; four are defects in the MCP server's own reporting,
error handling, or response-shaping layer that could be fixed in the MCP server codebase
itself.

| # | Defect | Severity | Origin | Remediable In MCP? | Upstream Issue |
|:-:|--------|:--------:|--------|:------------------:|:--------------:|
| 1 | `get_server_health` underreports availability (0/13 when 2/13 are operational) | 🔴 HIGH | MCP server | ✅ Yes | [#366](https://github.com/Hack23/European-Parliament-MCP-Server/issues/366) |
| 2 | `coalition_dynamics` returns `memberCount=0` for EPP / Greens-EFA / PfE / ESN | 🔴 HIGH | MCP server mapping | ✅ Yes | [#367](https://github.com/Hack23/European-Parliament-MCP-Server/issues/367) |
| 3 | Coalition `cohesion` field is a size-ratio artifact, not vote-level alignment | 🟠 MEDIUM | MCP server semantics | ✅ Yes (rename/clarify) | [#368](https://github.com/Hack23/European-Parliament-MCP-Server/issues/368) |
| 4 | `get_adopted_texts({docId})` returns empty-string fields instead of 404 / null | 🟠 MEDIUM | MCP server | ✅ Yes | [#369](https://github.com/Hack23/European-Parliament-MCP-Server/issues/369) |
| 5 | Inconsistent error signalling across feeds (404 / empty array / error string) | 🟠 MEDIUM | MCP server | ✅ Yes | [#370](https://github.com/Hack23/European-Parliament-MCP-Server/issues/370) |
| 6 | `analytics.effectiveNumberOfParties` computed over incomplete group data (4.04 vs ~6.5 actual) | 🟡 LOW | MCP server derivation | ✅ Yes (sanity-check) | (covered by [#367](https://github.com/Hack23/European-Parliament-MCP-Server/issues/367)) |
| 7 | Feed responses lack `lastModified` / `ETag` / `itemCount` metadata | 🟡 LOW | MCP server | ✅ Yes | (backlog) |

**Impact on analysis quality**: The EPP data gap (defect #2) is the single most damaging
reliability problem — it renders the Parliament's largest political group (≈188 seats, 26%
of the chamber) analytically invisible in coalition mathematics, forcing every coalition
scenario produced during Runs 179–184 to carry a "🔴 LOW confidence" stamp even where the
underlying political assessment was otherwise sound.

---

## 2. Defect-Level Findings

### Defect #1 — `get_server_health` underreports actual feed availability

**Severity**: 🔴 HIGH (methodological — monitoring teams trust a misleading signal)
**First observed**: Run 183 (April 18 AM)
**Confirmed in**: Run 184 (direct endpoint testing)

#### Observation

Across every run in the recess series, the MCP server's own health endpoint returned:

```json
{"overall": "Unavailable", "feedsOperational": "0/13", ...}
```

However, when Run 184 bypassed the aggregated health check and called individual feed
endpoints directly, **2/13 feeds (`get_adopted_texts_feed` and `get_meps_feed`) returned
valid data**. The health endpoint's "0/13" figure reflects stale per-feed status caching
rather than live probing.

#### Root-cause hypothesis

The MCP server appears to aggregate feed status from a background health-check job that
either (a) runs less frequently than individual tool invocations or (b) has a stricter
success criterion than tool-level success. Either way, the aggregate undercounts true
availability at the moment of observation.

#### Impact on downstream analysis

A naive consumer that gates its workflow on `get_server_health` will refuse to attempt
data collection even when 15% of the EP feed surface is live. Over a 6-day recess this
compounds into multiple missed data-collection opportunities. Run 184 would have
documented "0 feeds operational" (matching server_health) rather than "2/13 operational"
(ground truth) had the analysis not cross-validated with direct endpoint calls.

#### Recommended remediation

1. Change `get_server_health` to probe each feed live on every invocation (or cache for
   ≤60s, not ≥15 min).
2. Distinguish three states per feed: `operational` / `degraded` / `unavailable` — do not
   collapse `unknown` into `unavailable`.
3. Include a `lastProbedAt` timestamp per feed so consumers can judge staleness.

> **Upstream issue**: [Hack23/European-Parliament-MCP-Server#366](https://github.com/Hack23/European-Parliament-MCP-Server/issues/366).

---

### Defect #2 — `coalition_dynamics` returns `memberCount=0` for EPP, Greens/EFA, PfE/ID, ESN

**Severity**: 🔴 HIGH (blocks coalition mathematics for the Parliament's largest group)
**First observed**: Run 179 (April 13, Day 1)
**Persistence**: All 6 runs (179–184) identical behaviour

#### Observation

`coalition_dynamics` returns complete records for exactly 5 of the 9 EP10 political groups.
The 4 missing groups account for approximately **350 of 720 seats (≈49% of the chamber)**:

| Group | Actual seats (EP website) | API `memberCount` | Status |
|-------|:-----------------------:|:-----------------:|:------:|
| EPP (European People's Party) | ~188 | **0** | ❌ Data pipeline failure |
| S&D | 135 | 135 | ✅ OK |
| Renew Europe | 77 | 77 | ✅ OK |
| ECR | 81 | 81 | ✅ OK |
| The Left | 46 | 46 | ✅ OK |
| NI (Non-Inscrits) | 30 | 30 | ✅ OK |
| Greens/EFA | ~53 | **0** | ❌ Data pipeline failure |
| PfE/ID (Patriots for Europe) | ~84 | **0** | ❌ Data pipeline failure |
| ESN (Europe of Sovereign Nations) | ~25 | **0** | ❌ Data pipeline failure |

The four failing groups include the chamber's *largest* (EPP) and three of its more recently
formed groups (PfE, ESN, reconstituted Greens/EFA). This pattern suggests the upstream
mapping uses an outdated group-name / group-ID table that does not account for the EP10
group composition following the 2024 parliamentary elections and subsequent group
reconstitutions.

#### Root-cause hypothesis

The MCP server likely translates EP Open Data Portal group URIs to internal identifiers via
a static lookup. Groups that changed name, abbreviation, or URI after the July 2024
constitutive session (EPP rebrand, PfE formation from ID dissolution, ESN formation) may
not be in the lookup, causing the member-enumeration query to silently return zero.

#### Impact on downstream analysis

Every coalition pair involving a missing group returns `cohesion: 0.0, trend: "WEAKENING"`.
This is not a political signal — it is a mathematical consequence of null input. Run 184's
coalition dynamics file therefore carries a data-quality warning at the top of the table
and estimates the real Effective Number of Parties (~6.5) rather than reporting the API's
(4.04, computed over incomplete data).

#### Recommended remediation

1. Update the political-group lookup table to match EP10 post-constitutive composition
   (July 2024 onwards).
2. Add a pre-flight validation: if any EP-listed group is missing from the lookup, surface
   a `warning` field in the `coalition_dynamics` response.
3. Add `groupsKnown / groupsTotal` counters to every `coalition_dynamics` response so
   consumers can detect partial data.

> **Upstream issue**: [Hack23/European-Parliament-MCP-Server#367](https://github.com/Hack23/European-Parliament-MCP-Server/issues/367).

---

### Defect #3 — `cohesion` field is a size-ratio artifact, not a vote-alignment measure

**Severity**: 🟠 MEDIUM (semantic — misleading even when numeric values are "valid")
**Observed in**: All 6 runs

#### Observation

The `coalition_dynamics` response contains coalition-pair entries of the form:

```json
{"pair": ["Renew", "ECR"], "cohesion": 0.95, "trend": "STRENGTHENING", "sharedVotes": null}
```

The `sharedVotes: null` is the tell — no vote-level alignment data backs the 0.95 figure.
Empirically the score reflects **group-size proximity** (Renew 77 seats, ECR 81 seats → high
similarity) rather than political alignment. Renew (liberal, federalist, pro-European) and
ECR (eurosceptic, national conservative) sit at opposite ends of the EU integration axis
and almost never vote together on core EU competency questions.

The word "cohesion" in political-science literature specifically denotes vote-level
alignment (Hix / Noury / Roland). Using it as a label for a size-ratio metric is a
*category-error* that will mislead any consumer trained on political-science conventions.

#### Recommended remediation

Either:
1. **Preferred**: Feed `cohesion` from actual roll-call voting alignment data once the
   EP API exposes it (tracked separately — EP API does not publish individual MEP positions).
2. **Minimum**: Rename the field to `sizeSimilarity` and emit `null` for `cohesion` until
   vote-level data is available. Keep `sharedVotes` alongside; when `sharedVotes === null`,
   suppress the `trend` string entirely (it is meaningless without a denominator).
3. Add a `methodologyNote` string in every response: `"cohesion derived from group-size
   ratio; vote-alignment data not available via EP Open Data Portal"`.

> **Upstream issue**: [Hack23/European-Parliament-MCP-Server#368](https://github.com/Hack23/European-Parliament-MCP-Server/issues/368).

---

### Defect #4 — `get_adopted_texts({docId})` returns empty-string fields (not 404 / null)

**Severity**: 🟠 MEDIUM (error-handling semantics)
**Observed in**: Runs 182–184 for texts TA-10-2026-0099 through TA-10-2026-0104

#### Observation

For six texts whose identifiers appear in the `get_adopted_texts_feed` list, individual
detail calls return the following payload:

```json
{
  "id": "",
  "title": "",
  "reference": "",
  "type": "",
  "dateAdopted": "",
  "procedureReference": "",
  "subjectMatter": ""
}
```

This is neither a 404 (document not found), a 202 (content being prepared), nor a `null`
(field not applicable). It is a well-formed response whose every string field is empty
the **worst possible** error signal for a consumer because:

- It passes JSON-schema validation (all required string fields are present).
- A naive consumer will render empty strings in UI (blank title, blank reference, blank date).
- It cannot be distinguished from a genuine response for a text whose every field is
  legitimately blank (edge case, but the shape is indistinguishable).

#### Recommended remediation

1. When the upstream EP Open Data Portal returns a document with only an ID but no content
   (the "Tier 3" enrichment has not yet populated), the MCP server should translate this
   to either:
   - **HTTP 404** with a body: `{"error": "document indexed but content not yet available", "docId": "…"}`, or
   - **HTTP 200** with explicit nulls: `{"id": "TA-10-2026-0099", "title": null, "status": "CONTENT_PENDING", "retryAfterHours": 48}`.
2. Never emit a response where every string field is the empty string — this is a sentinel
   of upstream failure that should be surfaced, not masked.

> **Upstream issue**: [Hack23/European-Parliament-MCP-Server#369](https://github.com/Hack23/European-Parliament-MCP-Server/issues/369).

---

### Defect #5 — Inconsistent error signalling across feed endpoints

**Severity**: 🟠 MEDIUM (operational — consumers cannot write uniform error handlers)
**Observed in**: All 6 runs

#### Observation

Different feed endpoints signal unavailability in *different ways*, forcing every consumer
to implement endpoint-specific error handling:

| Endpoint | Behaviour during maintenance window |
|----------|--------------------------------------|
| `get_events_feed` | HTTP 404 (endpoint not found) |
| `get_procedures_feed` | HTTP 404 (endpoint not found) |
| `get_documents_feed` | Returns empty object / error string interspersed |
| `get_committee_documents_feed` | Empty/error (same as above) |
| `get_parliamentary_questions_feed` | HTTP 200, empty array |
| `get_adopted_texts_feed` | HTTP 200, populated data (when operational) |
| `get_meps_feed` | HTTP 200, populated data (when operational) |

Three distinct failure shapes appear where one should suffice.

#### Recommended remediation

Adopt a single documented contract: every feed endpoint returns `HTTP 200` with a body of
the form:

```json
{
  "status": "operational" | "degraded" | "unavailable",
  "lastSuccessfulProbe": "2026-04-18T07:12:00Z",
  "items": [],
  "itemCount": 0,
  "reason": "Optional string explanation when status !== 'operational'"
}
```

Reserve HTTP 4xx/5xx for genuine transport errors (auth, rate limit, gateway timeout).

> **Upstream issue**: [Hack23/European-Parliament-MCP-Server#370](https://github.com/Hack23/European-Parliament-MCP-Server/issues/370).

---

### Defect #6 — Effective Number of Parties (ENP) computed over incomplete group data

**Severity**: 🟡 LOW (derived metric; a consequence of #2)
**Observed in**: All 6 runs

`analytics.effectiveNumberOfParties: 4.04` is reported alongside the incomplete group data
from defect #2. Using only the 5 groups with non-zero `memberCount` (S&D 135 + Renew 77 +
ECR 81 + Left 46 + NI 30 = 369 seats) yields ENP ≈ 4.04 — mathematically correct *for the
truncated input*, but misleading as a chamber-wide fragmentation index. Re-computed over
the real 9-group composition, ENP ≈ **6.52** — substantially different conclusion about
institutional fragmentation.

**Remediation**: Any derived analytics (ENP, HHI, polarisation indices) should emit `null`
with a `warning` when input data is incomplete, rather than silently producing a plausible
but wrong number. Covered by the remediation for defect #2.

---

### Defect #7 — Feed responses lack `lastModified` / `ETag` / `itemCount` metadata

**Severity**: 🟡 LOW (prevents efficient polling and staleness detection)
**Observed in**: All feeds across all runs

Neither the adopted-texts feed nor the MEPs feed surfaces a `lastModified` or `ETag`
header. Consumers cannot detect whether a subsequent poll returns fresh data or a cached
repeat; this forces workflow-level diffing as currently implemented in
`intelligence/cross-run-diff.md`. Adding standard HTTP caching metadata (or an envelope
field `lastModified`) would let the MCP client short-circuit no-op polls and would let
consumers fail loudly on stale data.

**Remediation**: Add `lastModified` and `itemCount` to every feed envelope. No upstream
issue filed yet — tracked in internal backlog.

---

## 3. Client-Side Defensive Measures (already implemented)

The EU Parliament Monitor's MCP client (`src/mcp/ep-mcp-client.ts` /
`src/mcp/mcp-retry.ts` / `src/mcp/mcp-health.ts`) already implements the following
compensating controls:

| Control | Location | Purpose |
|---------|----------|---------|
| Circuit breaker per tool | `mcp-retry.ts:36-123` | Fast-fails calls to a persistently failing tool for 60 s |
| Exponential-backoff retries | `mcp-retry.ts:156-173` | Absorbs transient 5xx / network errors |
| Aggregated health snapshot | `mcp-health.ts:86-111` | Gives workflows a local availability view independent of the server's own health endpoint |

**These mitigate transport-layer issues** (retries, timeouts, rate limits) but **do not
compensate** for semantic-layer issues like defects #2, #3, #4. Those must be fixed
upstream in the MCP server.

### Proposed additional client-side controls

1. **Coalition data sanity check** — when `coalition_dynamics.groups.length < 7`, emit a
   warning log and tag the downstream analysis with `coalitionDataIncomplete: true` so
   prompts can condition their output confidence accordingly.
2. **Adopted-text content sanity check** — when `get_adopted_texts({docId})` returns a
   response where every string field is empty, treat it as `null` and surface
   `contentStatus: "PENDING"` in the client response rather than passing empty strings to
   prompts (which mistake them for genuine empty data).
3. **Direct-probe fallback for health** — when `get_server_health` reports `0/13`, issue
   one probe each to `get_adopted_texts_feed` and `get_meps_feed`; if either succeeds,
   override the aggregate to `DEGRADED` rather than `UNAVAILABLE`.

These three client-side measures can be implemented in `src/mcp/ep-mcp-client.ts` without
waiting for upstream fixes, and should close on-workflow against the same issues.

---

## 4. Prompt-Level Recommendations (for AI-driven analysis workflows)

The following prompt-level rules should be codified in
`.github/prompts/SHARED_PROMPT_PATTERNS.md` so every news workflow applies them without
having to re-discover them:

1. **Never quote `coalition_dynamics.cohesion` as a political signal** without first
   checking `sharedVotes !== null`. When `sharedVotes === null`, classify the score as a
   "size-ratio artifact" and emit a data-quality warning.
2. **Never trust `get_server_health` alone**. Always cross-validate by probing at least
   one feed endpoint (`get_adopted_texts_feed` is cheapest) before declaring the API
   fully unavailable.
3. **Treat empty-string field responses as missing content**, not as genuine blank data.
   Add explicit sentinel-string detection to every content-consumption prompt.
4. **Sum political-group `memberCount` values** before running coalition mathematics — if
   the sum is under 600 (EP10 has ~720 seats), emit a data-quality warning and cap all
   coalition probability estimates at `0.70 × raw_probability`.
5. **Cross-run diffs are mandatory during API-degraded mode**: when `feedsOperational <
   13`, the workflow MUST produce an `intelligence/cross-run-diff.md` file so incremental
   intelligence can be evaluated even when fresh data is scarce.

Rules 1–4 are new and should be added to the shared prompt patterns. Rule 5 is already
present (captured as `Rule 5 — No wasted runs` in
`analysis/methodologies/ai-driven-analysis-guide.md`) and is restated here for
completeness.

---

## 5. Remediation Tracking Matrix

| Defect | Fix locus | PR target | Priority | ETA |
|--------|-----------|-----------|:--------:|-----|
| [#1 health aggregation](https://github.com/Hack23/European-Parliament-MCP-Server/issues/366) | MCP server | `Hack23/European-Parliament-MCP-Server` | 🔴 P0 | Pre-EP10 summer recess (Aug 2026) |
| [#2 coalition memberCount](https://github.com/Hack23/European-Parliament-MCP-Server/issues/367) | MCP server | `Hack23/European-Parliament-MCP-Server` | 🔴 P0 | ASAP — blocks 6-run analytical baseline |
| [#3 cohesion semantics](https://github.com/Hack23/European-Parliament-MCP-Server/issues/368) | MCP server | `Hack23/European-Parliament-MCP-Server` | 🟠 P1 | Next minor release |
| [#4 adopted_texts shape](https://github.com/Hack23/European-Parliament-MCP-Server/issues/369) | MCP server | `Hack23/European-Parliament-MCP-Server` | 🟠 P1 | Next minor release |
| [#5 error signalling](https://github.com/Hack23/European-Parliament-MCP-Server/issues/370) | MCP server | `Hack23/European-Parliament-MCP-Server` | 🟠 P1 | Next minor release |
| #6 ENP analytics | MCP server | (covered by #2 / issue 367) | 🟡 P2 | — |
| #7 caching metadata | MCP server | (backlog) | 🟡 P3 | Backlog |
| Client sanity checks (3 proposed) | `euparliamentmonitor` | `src/mcp/ep-mcp-client.ts` | 🟠 P1 | Before first post-recess plenary (Apr 28) |
| Prompt rules 1–4 | `euparliamentmonitor` | `.github/prompts/SHARED_PROMPT_PATTERNS.md` | 🟠 P1 | Before first post-recess plenary (Apr 28) |

---

## 6. Validation Plan (Post-Remediation)

Once the upstream MCP server fixes are released (target: `european-parliament-mcp-server@1.3.0`),
the first post-recess run (approximately April 28, 2026 — Run 185+) should execute the
following validation sequence:

1. Call `get_server_health` → expect `feedsOperational >= 2` to match ground truth.
2. Call `coalition_dynamics` → expect `EPP.memberCount >= 180`; expect 9 groups with
   non-zero `memberCount`.
3. Call `get_adopted_texts({docId: "TA-10-2026-0099"})` → expect either populated content
   **or** explicit `status: "CONTENT_PENDING"` rather than empty-string fields.
4. Call each feed endpoint individually → expect uniform 200-with-envelope response shape.

Each validation result should be recorded in `analysis/daily/<date>/breaking-run<N>/intelligence/mcp-reliability-audit.md`
as a new section "Run <N> Validation Against Remediation" — this creates a durable record
of whether each fix actually landed.

---

## 7. Appendix — Empirical Timeline of MCP Reliability Signals (Runs 179–184)

| Date | Run | `server_health` | Feeds actually working | TA-0099–0104 status | EPP `memberCount` |
|------|:---:|:---------------:|------------------------|---------------------|:-----------------:|
| Apr 13 | 179 | 0/13 | 0 | Inferred | 0 |
| Apr 14 | 180 | 0/13 | 0 | Inferred | 0 |
| Apr 15 | 181 | 0/13 | 0 | Inferred | 0 |
| Apr 16 | 182 | 0/13 | 0 | Inferred | 0 |
| Apr 17 | 183 | 0/13 | 2 (undetected at time) | Uncertain | 0 |
| Apr 18 | **184** | **0/13** | **2 (direct-tested)** | **Confirmed in feed** | **0** |

The table reveals that the EPP `memberCount=0` anomaly is **persistent across all six runs**
— this is not a transient API outage but a sustained defect in the group-identifier mapping
within the MCP server. It is the highest-priority upstream fix.

---

*Audit compiled: April 18, 2026 | Run 184 | Basis: 6 consecutive Easter-recess runs*
*Upstream issues filed: `Hack23/European-Parliament-MCP-Server` #366–#370 (see per-defect sections above for issue numbers)*
*Linked remediation tracked in: `src/mcp/ep-mcp-client.ts`, `.github/prompts/SHARED_PROMPT_PATTERNS.md`*
