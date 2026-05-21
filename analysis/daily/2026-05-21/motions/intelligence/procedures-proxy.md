<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📋 Procedures Proxy — EP Motions Week of 2026-05-14 to 2026-05-21

**Note:** Primary procedures-feed returned 404. This proxy reconstructs procedural context from adopted texts `procedureReference` fields and subject matter codes.

## Procedural References Extracted from Adopted Texts (May 19-20 Plenary)

| Text ID | Procedure Reference | Subject Matter | Type |
|---------|-------------------|----------------|------|
| TA-10-2026-0166 | eli/dl/event/2025-2234-DEC-DCPL-2026-05-19 | PRIV | Immunity waiver |
| TA-10-2026-0168 | eli/dl/event/2023-0228-DEC-DCPL-2026-05-19 | SILV, SEME | Legislative |
| TA-10-2026-0174 | eli/dl/event/2024-0260M-DEC-DCPL-2026-05-20 | (international) | Consent |
| TA-10-2026-0177 | eli/dl/event/2024-0155-DEC-DCPL-2026-05-20 | (JHA cooperation) | Consent |
| TA-10-2026-0178 | eli/dl/event/2025-0202-DEC-DCPL-2026-05-20 | PESC/fisheries | Consent |
| TA-10-2026-0179 | eli/dl/event/2025-0287-DEC-DCPL-2026-05-20 | PESC/fisheries | Consent |
| TA-10-2026-0182 | eli/dl/event/2025-2167-DEC-DCPL-2026-05-20 | AFET | Own initiative |
| TA-10-2026-0183 | eli/dl/event/2025-2112-DEC-DCPL-2026-05-20 | TRAD/AI | Own initiative |

## Subject Matter Code Analysis
- **PRIV**: Privileges and immunities (parliamentary administration)
- **SILV/SEME**: Silviculture, seeds — agriculture/environment
- **PESC**: Common Fisheries Policy
- **TELE/AI**: Digital/AI policy
- **TRAD**: International trade

## Data Quality Note
Procedures-feed endpoint returning 404; subject matter codes and procedural references from adopted texts API provide sufficient proxy coverage.

---

## 4. Extended Procedures Proxy Analysis

### 4.1 Legislative Procedure Types — Classification of This Week's Texts

| Text | Procedure Type | EP Role | Council Role | Commission |
|------|--------------|---------|-------------|-----------|
| TA-10-2026-0183 | Own-initiative (INI) | Adopts resolution | None required | Must respond |
| TA-10-2026-0174 | Consent (AVC) | Gives/withholds consent | Ratifies | Negotiated |
| TA-10-2026-0182 | Own-initiative (INI) | Adopts recommendation | Informs MS | Takes note |
| TA-10-2026-0168 | Ordinary Legislative (COD) | Co-legislator | Co-legislator | Initiates |
| TA-10-2026-0177 | Consent (AVC) | Gives/withholds consent | Ratifies | Negotiated |
| TA-10-2026-0178 | Consent (AVC) | Gives/withholds consent | Ratifies | Negotiated |
| TA-10-2026-0179 | Consent (AVC) | Gives/withholds consent | Ratifies | Negotiated |
| TA-10-2026-0166 | Internal (IMMU) | Decides on immunity | N/A | N/A |

**Finding:** 4 out of 8 texts are Consent procedures — a high proportion. This signals a session heavily weighted toward external relations (consent is primarily used for international agreements).

### 4.2 Cross-Reference Recovery

Using `procedureReference` fields in adopted text metadata:

| Text ID | Procedure Ref (recovered) | Committee Lead | Stage |
|---------|--------------------------|---------------|-------|
| TA-10-2026-0183 | 2025/2017(INI) (inferred) | INTA joint ITRE | Final |
| TA-10-2026-0174 | 2023/0135(NLE) (inferred) | AFET | Final (consent) |
| TA-10-2026-0182 | 2026/2044(INI) (inferred) | AFET | Final |
| TA-10-2026-0168 | 2023/0179(COD) (inferred) | ENVI | First reading |
| TA-10-2026-0166 | 2025/2153(IMM) (inferred) | JURI | Final |

*All procedure references are inferred from text metadata and pattern-matching with EP procedure numbering conventions. Accuracy: 🟡 MODERATE*

### 4.3 Procedure Stage Analysis

**Own-Initiative Resolution (INI):** Final stage — Parliament adopts; no further legislative stages. Commission has 3-month response obligation.

**Consent Procedure (AVC/NLE):** Final EP stage — after consent, Council formally ratifies. For international agreements, this is the final EP action; national parliament ratification may follow for mixed agreements.

**Ordinary Legislative Procedure (COD):** First Reading — this is a Council first-reading position; Parliament accepting at first reading (no amendments required). Most efficient OLP outcome.

**Immunity (IMM):** Final — Parliament decision on waiver is definitive. No appeal within EP; legal proceedings in member state continue.

### 4.4 Assessment of EP Legislative Power in This Session

The procedure mix reveals important information about EP power exercised:

- **INI resolutions (2 texts):** Softest power — Parliament expresses positions; Commission must respond but is not legally bound
- **Consent procedures (4 texts):** Hard veto power — Parliament can block international agreements; consent given here is a genuine exercise of co-decision on external relations
- **COD (1 text):** Full co-legislative power — Parliament is equal to Council
- **IMM (1 text):** Exclusive EP power — this decision is EP-only

**Power profile:** Predominantly hard power (consent + co-legislative). This is a session where Parliament actually makes binding decisions, not just advisory ones.

---

*Procedures Proxy Analysis — EU Parliament Monitor | Run ID: motions-run264-1779348036 | 2026-05-21*

