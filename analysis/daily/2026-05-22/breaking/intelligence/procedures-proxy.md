<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Procedures Proxy — EP Breaking News | 2026-05-22

**Classification:** PUBLIC | **Data Mode:** degraded-feeds (procedures endpoint returned stale data)

---

## Overview

The EP procedures feed returned stale historical data (STALENESS_WARNING; 1972-era items). This proxy reconstructs the most relevant procedural context from the adopted texts metadata and historical patterns.

---

## Inferred Procedures for May 2026 Items

| Adopted Text | Inferred Procedure Type | Reasoning |
|-------------|------------------------|-----------|
| TA-10-2026-0183 (AI trade strategy) | INI — Own-initiative | "AI strategy" non-legislative EP initiative; standard INI template |
| TA-10-2026-0174 (EU-Uzbekistan EPCA) | NLE — Non-legislative EP consent | International agreement; requires EP consent under TFEU Art. 218 |
| TA-10-2026-0177 (EU-Lebanon Eurojust) | NLE — Non-legislative EP consent | International agreement; Eurojust external cooperation |
| TA-10-2026-0178 (São Tomé fisheries) | NLE — Non-legislative EP consent | Fisheries SFPAs require EP consent per TFEU Art. 218 |
| TA-10-2026-0179 (Cook Islands fisheries) | NLE — Non-legislative EP consent | Fisheries SFPAs require EP consent per TFEU Art. 218 |
| TA-10-2026-0182 (UN GA recommendation) | RSP — Resolution on topical subject | EP external policy recommendations; no legislative effect |
| TA-10-2026-0164 (Vilimsky immunity) | IMM — Immunity case | Rule 7 procedure; EP decision on parliamentary immunity waiver |
| TA-10-2026-0166 (Pappas immunity) | IMM — Immunity case | Rule 7 procedure; EP decision on parliamentary immunity waiver |

---

## Procedure Status Confidence

All procedural inferences are **C3** (reliable third-party source; analytical inference):
- EP adopted texts with "TA-10-" prefix are completed procedures (stage: FINAL)
- INI procedures: EP's own initiative; co-signed by responsible committee
- NLE consent procedures: usually initiated by Commission proposal

---

## Procedures Feed Failure Note

**Root cause (probable):** EP Open Data Portal procedures endpoint serving cached/stale historical data since approximately April 2026. This is a known upstream degradation pattern documented in `data-availability-assessment.md`.

**Impact:** Cannot confirm pending procedures for upcoming sessions or retrieve committee stages for May 2026 items. Analysis limited to completed texts.

**Recovery path:** Next run should attempt `get_procedures(processId=<specific>)` using IDs obtained from adopted texts metadata, rather than the feed endpoint.
