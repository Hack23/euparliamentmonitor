<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Document Analysis Index — EP Motions: April 28–29, 2026 Strasbourg Plenary

**Article Type:** motions | **Run Date:** 2026-04-30 | **Confidence:** 🟢 High

---

## Primary Source Documents

### Adopted Texts (Confirmed)

| Reference | Type | Source API | Status |
|-----------|------|-----------|--------|
| TA-10-2026-0105 | Immunity waiver — Jaki | get_adopted_texts(2026) | ✅ Confirmed adopted |
| TA-10-2026-0106 | Immunity waiver — Obajtek | get_adopted_texts(2026) | ✅ Confirmed adopted |
| TA-10-2026-0108 | Immunity waiver — Şoşoacă | get_adopted_texts(2026) | ✅ Confirmed adopted |
| TA-10-2026-0112 | 2027 Budget Guidelines | get_adopted_texts(2026) | ✅ Confirmed adopted |
| TA-10-2026-0113 | GHG Transport | get_adopted_texts(2026) | ✅ Confirmed adopted |
| TA-10-2026-0115 | Animal welfare (dogs/cats) | get_adopted_texts(2026) | ✅ Confirmed adopted |
| TA-10-2026-0118 | Rules of Procedure | get_adopted_texts(2026) | ✅ Confirmed adopted |
| TA-10-2026-0119 | EIB Control | get_adopted_texts(2026) | ✅ Confirmed adopted |
| TA-10-2026-0122 | Performance Instruments | get_adopted_texts(2026) | ✅ Confirmed adopted |
| TA-10-2026-0123 | Tourism/Cultural Heritage | get_adopted_texts(2026) | ✅ Confirmed adopted |
| TA-10-2026-0132 | Budget Discharge — CoR | get_adopted_texts(2026) | ✅ Confirmed adopted |
| TA-10-2026-0142 | EU-Iceland PNR | get_adopted_texts(2026) | ✅ Confirmed adopted |

### Meeting Decision Records

| Meeting ID | Date | API Call | Status |
|-----------|------|---------|--------|
| MTG-PL-2026-04-28 | 2026-04-28 | get_meeting_decisions | ✅ Retrieved (79.6KB) |
| MTG-PL-2026-04-29 | 2026-04-29 | get_meeting_decisions | ✅ Retrieved (117.1KB) |

### Supporting Data

| Document | Source | Status |
|----------|--------|--------|
| EP political landscape | generate_political_landscape | ✅ Retrieved |
| Early warning system | early_warning_system | ✅ Retrieved (stability 84) |
| Current MEPs sample | get_current_meps(30) | ✅ Retrieved |
| Plenary sessions 2026 | get_plenary_sessions(2026) | ✅ Retrieved |
| Adopted texts feed | get_adopted_texts_feed(one-week) | ✅ Retrieved (52.8KB) |
| Speeches (April 27+) | get_speeches(dateFrom: 2026-04-27) | ✅ Retrieved |
| Coalition dynamics | analyze_coalition_dynamics | ✅ Structural data only |
| Poland GDP | world-bank-get-economic-data(PL, GDP_GROWTH) | ✅ Retrieved (3.03%, 2024) |

---

## Documents Not Retrieved

| Document | Reason | Impact |
|----------|--------|--------|
| Roll-call voting records | EP 4–6 week publication delay | 🟡 Medium — voting patterns structural only |
| JURI committee reports | Not available in current API feed | 🟢 Low — adopted texts sufficient |
| MEP individual vote positions | No individual roll-call data | 🟡 Medium — group-level inference only |
| Şoşoacă/Jaki/Obajtek written statements | Not in EP API | 🟢 Low — positions inferred |

---

## Analysis Coverage Assessment

| Domain | Document Coverage | Confidence |
|--------|-----------------|-----------|
| Immunity waivers | 🟢 HIGH (3 confirmed TAs, meeting decisions) | 🟡 Medium (no vote tallies) |
| Budget guidelines | 🟢 HIGH (TA confirmed) | 🟡 Medium |
| GHG transport | 🟢 HIGH (TA confirmed) | 🟢 High |
| Animal welfare | 🟢 HIGH (TA confirmed) | 🟢 High |
| PNR Iceland | 🟢 HIGH (TA confirmed) | 🟢 High |
| Political context | 🟢 HIGH (landscape, early warning) | 🟡 Medium |

---

**All primary documents accessed via European Parliament Open Data Portal. Attribution: CC BY 4.0.**
