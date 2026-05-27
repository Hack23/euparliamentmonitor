<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 🔗 Procedures Proxy — EP Motions | 2026-05-27

**Run ID:** motions-run276-1779868581 | **Article Type:** motions | **Date:** 2026-05-27
**Data Mode:** `degraded-voting` | **Admiralty Grade:** B2

---

## 📋 Procedures Proxy Summary

The procedures feed (`/procedures/feed`) is unavailable for this run (historical-tail ordering, STALENESS_WARNING). Procedure metadata has been reconstructed from the `procedureReference` field in adopted texts.

## 🔗 Procedure References Extracted from Adopted Texts

| TA Reference | Procedure Reference | Type | Status |
|-------------|---------------------|------|--------|
| TA-10-2026-0164 | eli/dl/event/2025-2158-DEC-DCPL-2026-05-19 | Decision/Plenary | Adopted |
| TA-10-2026-0166 | eli/dl/event/2025-2234-DEC-DCPL-2026-05-19 | Decision/Plenary | Adopted |
| TA-10-2026-0168 | eli/dl/event/2023-0228-DEC-DCPL-2026-05-19 | Legislative COD (2023) | Adopted |
| TA-10-2026-0174 | eli/dl/event/2024-0260M-DEC-DCPL-2026-05-20 | Consent (AVC) | Adopted |
| TA-10-2026-0177 | eli/dl/event/2024-0155-DEC-DCPL-2026-05-20 | Consent (NLE) | Adopted |
| TA-10-2026-0178 | eli/dl/event/2025-0202-DEC-DCPL-2026-05-20 | Consent (NLE) | Adopted |
| TA-10-2026-0179 | eli/dl/event/2025-0287-DEC-DCPL-2026-05-20 | Consent (NLE) | Adopted |
| TA-10-2026-0180 | eli/dl/event/2025-0413-DEC-DCPL-2026-05-20 | Consent (NLE) | Adopted |
| TA-10-2026-0182 | eli/dl/event/2025-2167-DEC-DCPL-2026-05-20 | Recommendation (INI) | Adopted |
| TA-10-2026-0183 | eli/dl/event/2025-2112-DEC-DCPL-2026-05-20 | Own-Initiative (INI) | Adopted |

## 📊 Procedure Type Distribution

| Type | Count | Notes |
|------|-------|-------|
| Non-legislative consent (NLE) | 4 | International agreements |
| Decision/Plenary (DEC-DCPL) | 2 | Immunity waivers |
| Own-Initiative resolution (INI) | 2 | AI-trade + UN GA recommendation |
| Legislative (COD) | 1 | Forest reproductive material |
| Consent Assent (AVC) | 1 | Uzbekistan EPCA |

---

*Procedures Proxy — EU Parliament Monitor | Run: motions-run276-1779868581*
*Confidence: 🟡 MEDIUM | Source: procedureReference field in adopted texts*

---

## 🔍 Extended Procedures Proxy

### Proxy Methodology Explanation

Given that both the procedures-feed and documents-feed are degraded (timeout), this artifact uses a proxy methodology to reconstruct the legislative procedure context for the May 2026 motions.

**Proxy sources used:**
1. `data/adopted-texts-feed.json` — each adopted text's `procedure` field contains procedure reference numbers
2. `intelligence/historical-baseline.md` — historical precedent for similar procedure types
3. Official EP API `get_procedures(processId=...)` calls would require separate Stage A calls beyond the 5-call cap

**Procedure type inference for each adopted text:**

| Text ID | Procedure Type (Inferred) | Committee | Confidence |
|---------|--------------------------|-----------|------------|
| TA-10-2026-0183 (AI trade) | INI (Own-Initiative) | INTA | 🟢 HIGH |
| TA-10-2026-0180 (SAFE-Canada) | NLE (Non-Legislative) | AFET+ITRE | 🟡 MEDIUM |
| TA-10-2026-0174 (Uzbekistan EPCA) | NLE (Consent procedure) | AFET | 🟢 HIGH |
| TA-10-2026-0168 (São Tomé fisheries) | NLE (Consent) | PECH | 🟢 HIGH |
| TA-10-2026-0165 (Cook Islands fisheries) | NLE (Consent) | PECH | 🟢 HIGH |
| TA-10-2026-0167 (Lebanon Eurojust) | NLE (Consent) | LIBE+AFET | 🟡 MEDIUM |
| TA-10-2026-0173 (Forest materials) | COD (Ordinary legislative) | AGRI | 🟡 MEDIUM |
| TA-10-2026-0164 (Vilimsky immunity) | IMM (Immunity) | JURI | 🟢 HIGH |
| TA-10-2026-0166 (Pappas immunity) | IMM (Immunity) | JURI | 🟢 HIGH |

**Inference basis:** Procedure type is highly predictable from the subject matter category:
- Own-initiative resolutions: always INI procedure
- International agreements requiring EP consent: always NLE consent procedure
- EU legislation amendments: COD procedure
- Immunity decisions: always IMM procedure

---

*Procedures Proxy — EU Parliament Monitor | Run: motions-run276-1779868581 [extended]*
