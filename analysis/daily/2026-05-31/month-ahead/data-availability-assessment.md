<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 🗂️ Data Availability Assessment — Month Ahead (June 2026 horizon)

**Run date:** 2026-05-31 (UTC) · **Article type:** `month-ahead` · **Horizon:** 2026-05-31 → 2026-06-30
**Data mode:** `degraded-feeds` (line-floor factor 0.80) · **Classification:** Public

---

## 1. BLUF

The run operated in **`degraded-feeds`** mode. Three of the four pre-fetched EP
Open Data Portal feeds (`procedures`, `events`, `documents`) returned HTTP 404
from the `admin.data.europarl.europa.eu` v2.1 endpoint, matching the documented
May-2026 known-issues table. Analytical floor was recovered through the
**A2-grade fallback** `get_adopted_texts(year=2026)`, which returned 41 adopted
texts spanning January→May 2026, including the most recent May-II plenary
(2026-05-19/20). IMF WEO macro data (Sept-2025 vintage) was retrieved cleanly
via the SDMX 3.0 REST proxy. Forward-statements registry returned an empty set,
so prospective synthesis relies on the legislative-pipeline signal embedded in
recent adopted texts plus structural EP-calendar reasoning.

**Overall confidence in source base:** 🟡 MEDIUM — strong retrospective
coverage, weaker forward-calendar coverage.

---

## 2. Source inventory

| Source | Tool / endpoint | Status | Grade | Records | Use |
|--------|-----------------|--------|-------|---------|-----|
| Procedures feed | `prefetch procedures-feed.json` | ❌ 404 | F6 | 0 | Placeholder only |
| Events feed | `prefetch events-feed.json` | ❌ 404 | F6 | 0 | Placeholder only |
| Documents feed | `prefetch documents-feed.json` | ❌ 404 | F6 | 0 | Placeholder only |
| Adopted texts (fallback) | `get_adopted_texts(year=2026)` | ✅ OK | A2 | 41 | **Primary legislative substance** |
| Procedures (direct) | `get_procedures(limit=40)` | ⚠️ Stale | D4 | 41 | Historical-tail (1972–1989) — discarded |
| Plenary sessions (fwd) | `get_plenary_sessions(D→D+30)` | ⚠️ Empty | D4 | 0 | Forward calendar not populated |
| Political landscape | `generate_political_landscape` | ❌ Timeout | F6 | 0 | 100s timeout — discarded |
| Legislative pipeline | `monitor_legislative_pipeline` | ⚠️ Cold | D4 | 0 | Lifecycle cache cold; momentum=STRONG only |
| IMF WEO macro | SDMX 3.0 `IMF.RES/WEO` | ✅ OK | A1 | 9 series | **Economic context (sole macro source)** |
| Forward statements | `forward-statements-registry read` | ⚠️ Empty | — | 0 | No carried-forward forward statements |

Admiralty grades follow `osint-tradecraft-standards.md` (A=reliable/official,
D=not-usually-reliable, F=cannot-judge; 1=confirmed … 6=cannot-assess).

---

## 3. Degradation analysis

The three 404 feeds share a single root cause: the
`POST …/api/v2/…/?view=uri&view-version=v2.1` enrichment route is returning
404 for the `procedures`, `events`, and `documents` collections. This is the
**exact failure signature** logged across `analysis/daily/2026-05-2*/` runs in
the May-2026 known-issues table (Rule 2a). It is an upstream EP API regression,
not a sandbox or gateway fault: the `get_adopted_texts` paginated endpoint —
which does not traverse the v2.1 enrichment layer — succeeded on the first call.

Per Rule 2a, no invocation budget was spent re-probing the degraded feeds once
their placeholders were on disk. A single fallback call recovered the
legislative floor. This is the canonical degraded-feeds recovery path.

---

## 4. Impact on analytical scope

| Dimension | Impact | Mitigation |
|-----------|--------|-----------|
| Retrospective legislative substance | 🟢 Low | 41 adopted texts cover Jan–May 2026 fully |
| Forward plenary calendar | 🔴 High | Plenary feed empty → structural calendar inference (June Strasbourg week) |
| Roll-call / voting detail | 🟡 Medium | Within DOCEO publication lag; no per-MEP vote data |
| Committee pipeline detail | 🟡 Medium | Inferred from adopted-text committee codes |
| Economic context | 🟢 Low | IMF WEO retrieved cleanly |
| Forward statements continuity | 🟡 Medium | Registry empty; synthesised fresh from pipeline |

---

## 5. Line-floor factor justification

Per the Data-Mode Declaration ladder, multiple single-axis degradations apply
(feeds 404, IMF OK, voting within lag). The **single most-severe single-axis
mode whose trigger independently applies** is `degraded-feeds` (1+ feeds
unavailable after retries) at factor **0.80**. We do **not** compose modes:
`minimal` (0.65) is rejected because its trigger ("most EP feeds unavailable
*and* IMF absent") does not independently hold — IMF data is present and the
adopted-texts spine is intact. Structural checks (Mermaid diagrams, WEP bands,
Admiralty grades, SAT ≥ 10) remain at full strength regardless of mode.

---

## 6. Confidence statement

🟡 **MEDIUM overall.** Retrospective claims grounded in A2 adopted-text data are
HIGH confidence; forward-calendar claims for June 2026 are MEDIUM-to-LOW and are
explicitly WEP-banded with time horizons throughout the intelligence artifacts.
Every forward judgement carries its own confidence marker and Admiralty grade.

---

*Generated by `news-month-ahead` Stage A. Source provenance: `data/` directory
and `cache/imf/`. See `intelligence/mcp-reliability-audit.md` for the full
tool-call ledger.*
