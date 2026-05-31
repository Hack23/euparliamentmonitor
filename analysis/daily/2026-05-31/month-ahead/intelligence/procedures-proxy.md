<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# ⚖️ Procedures Proxy — Legislative Pipeline Reconstruction

**Run date:** 2026-05-31 · **Article type:** `month-ahead` · **Data mode:** `degraded-feeds`
**Method:** procedure-state inferred from adopted-text committee codes + reference IDs (procedures feed 404)

---

## 1. Why a proxy

The `/procedures` feed returned historical-tail ordering (procedure IDs
1972–1989) and the enrichment feed returned 404. Per Rule 2a, the canonical
fallback is to reconstruct the active legislative pipeline from the
`procedureReference` field carried on each 2026 adopted text. This proxy maps
recent adopted outputs back to their originating files and committees to
approximate what is *in flight* for the June 2026 horizon.

---

## 2. Reconstructed active strands (by committee)

| Committee | Recent adopted signal | Inferred June-horizon activity |
|-----------|----------------------|-------------------------------|
| **BUDG** | 2027 budget guidelines (TA-0112), EP estimates 2027 (ANN01), EGF Audi/Tupperware | 2027 budget procedure enters Council-reading prep; trilogue scoping |
| **ECON** | ECB annual report (TA-0034), ECB VP appointment (TA-0060), financial stability (TA-0004) | Banking-union / CMU files; ECB scrutiny continues |
| **INTA** | US customs duties (TA-0096), Mercosur CJEU opinion (TA-0008), AI-for-trade (TA-0183) | Trade-defence + Mercosur ratification debate live |
| **AFET** | Ukraine accountability (TA-0161), Armenia (TA-0162), UNGA recommendation (TA-0182) | Foreign-affairs resolutions; Ukraine support track |
| **LIBE** | EU-Lebanon Eurojust (TA-0177), cyberbullying (TA-0163) | JHA cooperation agreements; platform-liability follow-up |
| **IMCO** | DMA enforcement (TA-0160) | Digital Markets Act enforcement scrutiny |
| **PECH** | São Tomé, Cook Islands fisheries protocols | Routine fisheries-agreement consents |
| **AFCO** | European Electoral Act reform (TA-0006) | Electoral-law ratification hurdles debate |
| **AGRI** | Forest reproductive material (TA-0168) | Agricultural-market technical files |

---

## 3. Pipeline momentum signal

`monitor_legislative_pipeline` returned `legislativeMomentum: STRONG` but with a
**cold lifecycle cache** (`corpusSize: 0`) and a small-sample warning, so the
quantitative throughput rate (0) is not reliable. The qualitative read from the
adopted-text cadence — 41 texts Jan→May, with a dense May-II cluster — supports
a **steady-to-strong** momentum assessment heading into June.

🟡 MEDIUM confidence (cache cold; cadence inference only).

---

## 4. Carry-forward candidates for June 2026

1. **2027 budget procedure** — guidelines adopted April; Council position and
   trilogue scoping are the natural June milestones. *Almost Certain* to feature.
2. **Trade defence (US tariffs / Mercosur)** — live INTA strand; *Likely* to
   recur given the March customs-duty adjustment and January CJEU opinion request.
3. **Ukraine financial + accountability track** — recurrent AFET/BUDG theme;
   *Likely* to see further resolutions.
4. **DMA / digital enforcement** — IMCO follow-up; *Even Chance* of a June item.

---

## 5. Limitations

This proxy cannot supply procedure stage codes, rapporteur names, or trilogue
dates (the 404 feed would carry those). All forward inferences are structural
and are downgraded one confidence band relative to a `full`-mode run. They are
re-expressed with explicit WEP bands in `intelligence/forward-projection.md` and
`intelligence/scenario-forecast.md`.

---

*Proxy source: `data/adopted-texts-2026.json`. Discarded stale direct feed:
`get_procedures` (1972–1989 tail).*

## Procedure proxy flow

```mermaid
graph LR
  ADOPTED[Adopted-texts feed] --> PROXY[Procedure proxy inference]
  PROXY --> AGENDA[June agenda projection]
  AGENDA --> SCEN[Scenario forecast]
```
