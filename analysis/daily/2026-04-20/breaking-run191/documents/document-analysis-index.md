---
articleType: breaking
runId: 191
date: 2026-04-20
confidenceLevel: MEDIUM
---

# 📋 Document Analysis Index — Run 191

## Confirmed Document Corpus (April 20, 2026)

### Available in API Index (Title-Layer Only)

The following documents are confirmed in the EP API index but content remains unavailable:

#### March 26, 2026 Legislative Package (18 texts — CONTENT BLOCKED)

| ID | Title | Domain | Content Status |
|----|-------|--------|----------------|
| TA-10-2026-0087 | Immunity waiver — Grzegorz Braun (case 1) | Procedural | ❌ 404 |
| TA-10-2026-0088 | Immunity waiver — Grzegorz Braun (case 2) | Procedural | ❌ 404 |
| TA-10-2026-0089 | Immunity waiver — Nikos Pappas | Procedural | ❌ 404 |
| TA-10-2026-0090 | DGSD2 — Deposit guarantee schemes | Banking | ❌ 404 |
| TA-10-2026-0091 | BRRD3 — Bank Resolution Directive | Banking | ❌ 404 |
| TA-10-2026-0092 | SRMR3 — Single Resolution Mechanism | Banking | ❌ 404 |
| TA-10-2026-0093 | Surface/groundwater pollutants directive | Environment | ❌ 404 |
| TA-10-2026-0094 | Anti-Corruption Directive | Justice | ❌ 404 |
| TA-10-2026-0095 | Regulation (EU) 2021/1232 amendment | Digital/Child protection | ❌ 404 |
| TA-10-2026-0096 | Customs duty adjustment / US tariff TRQs | Trade | ❌ 404 |
| TA-10-2026-0097 | Non-application of customs duties | Trade | ❌ 404 |
| TA-10-2026-0098 | Digital Omnibus AI — AI Act simplification | Digital/AI | ❌ 404 |
| TA-10-2026-0099 | UN Convention on ship judicial sales | Maritime law | ❌ 404 |
| TA-10-2026-0100 | EU-Lebanon sci/tech cooperation | Foreign affairs | ❌ 404 |
| TA-10-2026-0101 | EU-China TRQ modification | Trade | ❌ 404 |
| TA-10-2026-0102 | EGF mobilisation (case 1) | Employment | ❌ 404 |
| TA-10-2026-0103 | EGF mobilisation (case 2) | Employment | ❌ 404 |
| TA-10-2026-0104 | Global Gateway — past impacts and future | Development | ❌ 404 |

#### Restored to Index — January-February 2026 Texts

| ID | Title | Domain | Date | Content Status |
|----|-------|--------|------|----------------|
| TA-10-2026-0011 | EU-Bosnia Frontex operations agreement | Border/Enlargement | 2026-01-21 | ❌ 404 |
| TA-10-2026-0014 | Human Rights Annual Report 2025 | Foreign affairs | 2026-01-21 | ❌ 404 |
| TA-10-2026-0018 | Jimmy Lai conviction (Hong Kong) | Human rights/China | 2026-01-22 | ❌ 404 |
| TA-10-2026-0036 | Ukraine Facility amendment | Foreign affairs | 2026-02-11 | ❌ 404 |

### API Metadata Count Evolution (Critical Series)

| Run | Date | Count | Change | Phase |
|-----|------|-------|--------|-------|
| 179-184 | Apr 10-18 | 104 | baseline | Pre-regression |
| 188 | Apr 19 | 104 | 0 | Stable |
| 189 | Apr 19 | 101 | -3 | **Regression 1** |
| 190 | Apr 20 | 100 | -1 | **Regression 2** |
| 191 | Apr 20 | 104 | +4 | **RESTORED** ← Run 191 |

### Feed-Level Document Status

- `get_adopted_texts_feed(timeframe:"today")`: Returns EP8/2019 data — **REGRESSION** (same as prior runs)
- `get_adopted_texts(year:2026, limit:100)`: Returns 100 items, latest March 26 — **NORMAL**
- `get_adopted_texts(year:2026, limit:100, offset:100)`: Returns 4 items (restored texts) — **RESTORED**
- `get_adopted_texts(docId:"TA-10-2026-0092")`: UPSTREAM_404 — **CONTENT BLOCKED**
- `get_events_feed`: Not attempted (DEGRADED MODE)
- `get_procedures_feed`: Not attempted (DEGRADED MODE)

## Document Intelligence Assessment

### High-Priority Documents for Content Access (Post-Restoration)

When content restoration occurs, these texts should be the first priority for deep analysis:

**Priority 1 — Banking Union Completion**:
- TA-10-2026-0091 (BRRD3): What specific changes to early intervention thresholds were adopted? What is the timeline for member state transposition?
- TA-10-2026-0092 (SRMR3): What resolution funding changes were made? Is the backstop mechanism materially different from the 2021 proposal?

**Priority 2 — Anti-Corruption Architecture**:
- TA-10-2026-0094: Which criminal offences are covered? What are the minimum sentencing requirements? Which member states are expected to require legislative changes?

**Priority 3 — Trade Architecture**:
- TA-10-2026-0096: What specific US product categories have tariff adjustments? What are the TRQ volumes and duration?
- TA-10-2026-0101: Which EU-China TRQ schedules were modified? What are the volume implications?

**Priority 4 — Digital Governance**:
- TA-10-2026-0098: Which AI Act compliance obligations were simplified? What is the implementation timeline change?

### Document Linkage Intelligence

The restored texts reveal an important EU strategy pattern:
- **January 22**: Parliament condemns Jimmy Lai conviction (TA-10-2026-0018) — HUMAN RIGHTS signal to China
- **March 26**: Parliament modifies EU-China TRQs (TA-10-2026-0101) — TRADE ENGAGEMENT signal to China

This "condemn-and-trade" pattern is a deliberate European strategic choice: maintain democratic accountability statements while preserving economic interdependence. It mirrors the EU's Gaza/Israel trade relationship pattern (humanitarian criticism + trade continuity). The temporal gap between the two texts (2 months) creates diplomatic cover — they can be presented as independent policy tracks.

The Ukraine Facility amendment (TA-10-2026-0036, February 11) adds a third dimension: Parliament committed additional Ukraine support funding while maintaining the China TRQ engagement. This is the EU's "values-based pragmatism" doctrine in concrete legislative action.
