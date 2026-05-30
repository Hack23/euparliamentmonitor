# Data Availability Assessment — EU Parliament Year Ahead 2026-2027
**Date:** 2026-05-30 | **Article Type:** year-ahead | **Stage:** A (data triage)
**Horizon:** 2026-05-30 → 2027-05-30 | **dataMode: degraded-feeds**

---

## Purpose

This Stage-A artifact records the state of every data source consulted for the year-ahead run, declares the
operative **dataMode**, and documents the line-floor reduction rationale applied downstream. It is the
authoritative provenance ledger for the run: every later artifact inherits the confidence ceiling set here.

---

## dataMode Declaration

**dataMode = `degraded-feeds`.**

Rationale: three forward-looking EP feeds (`/procedures-feed`, `/events-feed`, `/documents-feed`) returned
**HTTP 404**; the forward `get_plenary_sessions` window returned **0 sittings**; `generate_political_landscape`
**timed out at 100s**; and `monitor_legislative_pipeline` returned **0 procedures** from a cold lifecycle
cache. Two sources, however, succeeded richly — `get_adopted_texts(year=2026)` returned **51 adopted texts**
(the primary substance base) and the **IMF SDMX WEO probe returned 449 live records** (vintage 2025-09-23).
The run therefore has strong *substance and economics* but weak *forward structural feeds*, which is the
defining signature of `degraded-feeds` rather than a full outage.

### Line-floor reduction (×0.80)

Under `degraded-feeds`, per-artifact line floors are reduced to **×0.80** of their nominal full-data values.
The reduction is justified because the forward-feed outage removes the granular procedure/event/sitting
detail that normally pads structural artifacts; demanding full-length output from a thinner evidence base
would incentivise padding and speculation. The ×0.80 floor preserves analytical depth while honestly
reflecting reduced primary granularity. It does **not** relax the no-placeholder rule, the IMF-sole-authority
rule, or the confidence-labelling rule — those remain in force at full strength.

---

## Source Inventory & Status

| # | Source / MCP tool | Status | Items | Admiralty | Confidence |
|---|-------------------|--------|-------|-----------|-----------|
| 1 | `get_adopted_texts(year=2026)` | 🟢 SUCCESS | 51 texts | **A1** | 🟢 HIGH |
| 2 | IMF SDMX WEO probe (live) | 🟢 SUCCESS | 449 records | **A1** | 🟢 HIGH |
| 3 | EP10 structural seat counts | 🟢 SUCCESS (static) | 720 seats | **B2** | 🟢 HIGH |
| 4 | `compare_political_groups` | 🟡 PARTIAL | PfE=85, ECR=81, ESN=27; others 0 | **C3** | 🟡 MEDIUM |
| 5 | Council presidency trio | 🟡 UNVERIFIED | 4 presidencies | **C3** | 🟡 MEDIUM |
| 6 | `get_plenary_sessions` (forward) | 🔴 EMPTY | 0 forward sittings | **F6** | 🔴 LOW |
| 7 | `generate_political_landscape` | 🔴 TIMEOUT (100s) | 0 | **F6** | 🔴 LOW |
| 8 | `monitor_legislative_pipeline` | 🔴 EMPTY | 0 procedures (cold cache) | **F6** | 🔴 LOW |
| 9 | EP `/procedures-feed` | 🔴 404 | 0 | **F6** | 🔴 LOW |
| 10 | EP `/events-feed` | 🔴 404 | 0 | **F6** | 🔴 LOW |
| 11 | EP `/documents-feed` | 🔴 404 | 0 | **F6** | 🔴 LOW |
| 12 | EP `/external-documents-feed` | 🟡 DEGRADED | act-follow-up only, 0 discrete items | **D4** | 🔴 LOW |

Admiralty legend: A=completely reliable … F=cannot be judged; 1=confirmed … 6=cannot be judged. The
forward feeds are graded **F6** because a 404 outage yields no evidence to assess, not because the
underlying source is known-unreliable.

---

## Successful Sources — Detail

### `get_adopted_texts(year=2026)` — A1, 🟢 HIGH
The richest source this run. 51 adopted texts provide the substantive backbone for every downstream
judgement. Thematic clusters legible in the corpus: banking-union deepening and ECB appointments/Annual
Report 2025; **EU Electoral Act reform** (uniform procedure, transnational lists); **EU–Mercosur** with a
CJEU opinion sought and agricultural safeguards; the **Macro-Financial Loan for Ukraine** (immobilised
Russian assets framing); migration "safe third country" reform of the Asylum Procedure Regulation; the
first EP own-initiative on **affordable housing**; the "omnibus" Better Law-Making / competitiveness
deregulation drive; heavy-duty vehicle CO2 standards and CAP post-2027; DMA/DSA enforcement ramp-up;
2027 budget guidelines and MFF post-2027 opening; EGF deindustrialisation cases (Audi Brussels, Tupperware);
and a dense series of defence/foreign-affairs urgency resolutions.

### IMF SDMX WEO — A1, 🟢 HIGH
Live probe, 449 records, vintage 2025-09-23, cached at
`cache/imf/weo-ea-deu-fra-ita-gdp-inflation-fiscal.json`. **IMF is the sole authority** for every economic,
fiscal, monetary, trade, FDI, exchange-rate and banking-soundness claim across the artifact set. No
World Bank economic series may be substituted. Headline figures carried forward: German real GDP growth
**0.79% in 2026**; French growth **0.86% in 2026**; Italian growth **0.52% in 2026**; German fiscal
balance **-3.78% of GDP in 2026**; French fiscal balance **-4.94% of GDP in 2026**; Italian fiscal balance
**-2.82% of GDP in 2026**.

---

## Degraded & Failed Sources — Mitigation

| Gap | Impact on analysis | Mitigation applied |
|-----|--------------------|--------------------|
| Forward sittings empty (`get_plenary_sessions`) | No published forward calendar | Calendar signposts derived from EP10 structural cadence; flagged 🟡 |
| `generate_political_landscape` timeout | No computed landscape/fragmentation | Landscape reconstructed from B2 structural seat counts |
| `monitor_legislative_pipeline` empty | No live bottleneck/throughput data | Pipeline narrative built from 51 adopted texts + Commission WP knowledge |
| `compare_political_groups` partial | Only PfE/ECR/ESN seats returned; balance 0.61 | Supplemented with full structural seat counts (B2); partial figures flagged C3 |
| `/procedures`,`/events`,`/documents` feeds 404 | No granular procedure/event detail | Substance from adopted texts; outage logged in `intelligence/mcp-reliability-audit.md` |
| `/external-documents-feed` degraded | No discrete Council/Commission items | Treated as null; not cited as evidence |

---

## Confidence Ceiling Set By This Run

Because forward structural feeds are unavailable, **no downstream artifact may claim 🟢 HIGH confidence on
forward calendar specifics, live pipeline throughput, or computed fragmentation indices.** Those domains are
capped at 🟡 MEDIUM (structural inference) or 🔴 LOW (12-month projection). Substance-based judgements grounded
in the 51 adopted texts and economic judgements grounded in IMF WEO may carry 🟢 HIGH where the evidence is
direct. This asymmetric ceiling is the central governance output of this assessment.

---

## Tool-Name Reference (for downstream provenance)

Artifacts citing data lineage should reference these MCP tool names exactly: `get_adopted_texts`,
`get_plenary_sessions`, `monitor_legislative_pipeline`, `compare_political_groups`,
`generate_political_landscape`. The IMF series is sourced from the SDMX WEO probe (not an EP MCP tool) and
must be attributed as `IMF Source: live`.

---

## Triage Verdict

**Proceed in `degraded-feeds` mode.** The run has sufficient primary substance (51 adopted texts, A1) and
authoritative economics (IMF WEO, A1) to support a credible year-ahead analysis. Forward structural detail is
absent and must be replaced by transparent structural inference, every instance of which carries a confidence
label and, where relevant, an Admiralty grade. Line floors apply at ×0.80. Overall run reliability: **B2**.

---

*This assessment governs the run. Any later artifact that asserts forward-calendar or live-pipeline precision
beyond what this ledger supports should be treated as overconfident and revised at Pass 2.*
