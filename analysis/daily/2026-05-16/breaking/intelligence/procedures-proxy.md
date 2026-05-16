<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Procedures Proxy — Breaking News 2026-05-16
**Date:** 2026-05-16 | **Mode:** degraded-feeds | **Grade:** B3

## Procedures Data Note

The EP procedures feed returned historical-tail ordering with STALENESS_WARNING.
Current-year procedures data is available but the feed normalization promoted older
historical entries. Active procedures related to the April 2026 adopted texts are inferred
from the texts themselves rather than the procedures feed.

## Inferred Active Procedures

| Text ID | Procedure Type | Legislative Stage | Committee |
|---------|---------------|-------------------|-----------|
| TA-10-2026-0160 | INI (Own initiative) | Adopted | IMCO |
| TA-10-2026-0161 | RSP (Resolution) | Adopted | AFET/SEDE |
| TA-10-2026-0112 | BUD (Budgetary) | Guidelines adopted | BUDG |
| TA-10-2026-0162 | RSP (Resolution) | Adopted | AFET |
| TA-10-2026-0157 | INI (Own initiative) | Adopted | AGRI |
| TA-10-2026-0163 | RSP (Resolution) | Adopted | LIBE |

## Upcoming Procedures to Monitor

- Armenia CEPA II ratification (COD or NLE procedure) — expected AFET hearing Q4 2026
- Chat Control Regulation (COD) — Commission proposal expected Q3 2026; LIBE lead
- 2027 Budget (BUD) — annual procedure; BUDG trilogue begins September 2026
- DMA follow-up (INI on enforcement) — possible IMCO initiative if Commission slow to act

## Proxy Assessment — Active Procedures (Non-Plenary Day)

On a non-plenary day (Saturday May 16, 2026), the procedures API returns historical ordering.
This fallback section provides proxy procedure context from confirmed April 2026 plenary outputs.

**Active procedures by lifecycle stage (proxy from TA texts):**
1. Ukraine Support Instrument accountability framework — post-plenary (Commission implementation)
2. DMA enforcement guidelines — post-plenary (Commission DG COMP action expected)
3. Budget 2027 guidelines — trilogue preparation phase (September 2026)
4. Online exploitation directive — Council adoption pending
5. Armenia CEPA II — EP ratification complete; Council signature pending

```mermaid
flowchart LR
    A[EP Plenary\nAdoption] --> B[Council\nDelegation]
    B --> C{Council\nDecision}
    C -->|Qualified Majority| D[Regulation/\nDirective Published]
    C -->|Unanimity Required\nMFF/CFSP| E[European\nCouncil]
    E --> F[Negotiated\nAmendment]
    F --> D
    D --> G[Member State\nImplementation]
```

Admiralty Grade: C3 — Proxy data; procedures API returned historical ordering.

*Procedures proxy updated: Run 3, 2026-05-16. Admiralty Grade: C3 (proxy data only).*
*Primary data limitation: EP procedures feed returns historical ordering on non-plenary days.*
*This document should be superseded by a fresh procedures feed query on the next plenary day.*
*For real-time procedures status, consult EP Legislative Observatory directly.*

## Run 4 Extension — May 16, 2026 Parliamentary Landscape Update

### Political Group Composition (Live Data — 2026-05-16)

Fresh EP political landscape data confirms 717 MEPs across 9 groups as of 2026-05-16:

| Group | Seats | Seat Share | Coalition Signal |
|-------|-------|------------|-----------------|
| EPP | 183 | 25.52% | Dominant anchor |
| S&D | 136 | 18.97% | Progressive pole |
| PfE | 85 | 11.85% | Populist right |
| ECR | 81 | 11.30% | Conservative right |
| Renew | 77 | 10.74% | Liberal centre |
| Greens/EFA | 53 | 7.39% | Green-progressive |
| The Left | 45 | 6.28% | Radical left |
| NI | 30 | 4.18% | Non-attached |
| ESN | 27 | 3.77% | Nationalist right |

**Majority threshold:** 360 seats. Grand coalition (EPP + S&D + Renew) = 396 seats (55.2%).

### Early Warning Assessment Update (2026-05-16)

- **Stability Score:** 84/100 (STABLE trend)
- **Risk Level:** MEDIUM
- **High severity warning:** PPE dominance risk (19x size of smallest group)
- **Implications for procedure adoption:** Multi-coalition required; no single bloc achieves majority

### Procedures Pipeline Status

No new procedures advanced on 2026-05-16 (non-plenary day). Next plenary week: TBC per EP calendar.
Proxy status remains valid from April 2026 plenary; legislative tracker should be refreshed on next sitting day.

*Updated: Run 4, 2026-05-16. Early warning data incorporated from live EP API.*
