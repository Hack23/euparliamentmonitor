# Voting Patterns Analysis — EU Parliament Breaking News
## 2026-05-10

**Confidence:** 🟡 MEDIUM | **Note:** Individual vote data unavailable (EP publication delay); analysis based on political group structure and historical patterns

---

## ⚠️ DATA LIMITATION STATEMENT

EP roll-call vote data for the April 28-30, 2026 Strasbourg plenary is NOT available at time of this analysis (2026-05-10). EP publishes roll-call data with a multi-week delay. `get_latest_votes()` returned empty (DOCEO XML not yet published for this plenary week). `get_voting_records(dateFrom=2026-05-01)` returned empty (EP API publication delay).

The following analysis is based on:
1. **Confirmed adoption** — all 5 resolutions were adopted (indicated by TA-10-2026-XXXX identifiers and confirmed listing in `get_adopted_texts(year=2026)`)
2. **Political group positions** inferred from prior stated positions and historical voting patterns
3. **Coalition structure** from `generate_political_landscape()` and `analyze_coalition_dynamics()`

---

## 🗳️ INFERRED VOTING PATTERNS BY RESOLUTION

### TA-10-2026-0160: DMA Enforcement
**Likely supporting:** EPP, S&D, Renew, Greens, The Left (~413 MEPs; well above 359 majority)
**Likely opposing/abstaining:** PfE, ESN, portions of ECR
**Assessment:** LARGE MAJORITY — likely 400-450 for; 150-200 against; 50-80 abstentions
**EPP internal discipline:** 🟢 HIGH — DMA enforcement is rule-of-law issue; EPP consensus

---

### TA-10-2026-0161: Ukraine Accountability
**Likely supporting:** EPP, S&D, Renew, ECR (largely), Greens, The Left (~520+ MEPs)
**Likely opposing:** PfE (divided), ESN, NI
**Assessment:** VERY LARGE MAJORITY — likely 480-530 for; 80-120 against; 60-80 abstentions
**PfE internal division:** 🔴 DIVIDED — Salvini (pro-Russia soft) vs. Meloni-adjacent (harder line)

---

### TA-10-2026-0162: Armenia Resilience
**Likely supporting:** EPP, S&D, Renew, Greens, The Left, portions of ECR (~450+ MEPs)
**Likely opposing/abstaining:** ESN, portions of NI, portions of PfE
**Assessment:** LARGE MAJORITY — likely 430-480 for; 80-120 against; 80-100 abstentions

---

### TA-10-2026-0112: Budget 2027 Guidelines
**Likely supporting:** EPP, S&D, Renew (~396 MEPs minimum)
**Likely opposing:** Left (insufficient defence/climate balance), PfE (fiscal concerns), ECR fiscal hawks
**Assessment:** QUALIFIED MAJORITY — likely 360-420 for; 150-200 against; 80-100 abstentions
**Most contested resolution of the session**

---

### TA-10-2026-0151: Haiti Trafficking
**Likely supporting:** All groups except far-right (near unanimous adoption likely)
**Assessment:** VERY LARGE MAJORITY — 500+ for

---

## 📊 COALITION COHESION ESTIMATES

| Group | DMA | Ukraine | Armenia | Budget | Haiti | Avg Cohesion |
|-------|-----|---------|---------|--------|-------|-------------|
| EPP (183) | 🟢 High | 🟢 High | 🟢 High | 🟡 Med | 🟢 High | **🟢 HIGH** |
| S&D (136) | 🟢 High | 🟢 High | 🟢 High | 🟡 Med | 🟢 High | **🟢 HIGH** |
| PfE (85) | 🔴 Low | 🔴 Low | 🟡 Med | 🟡 Med | 🟡 Med | **🔴 LOW** |
| ECR (81) | 🟡 Med | 🟡 Med | 🟡 Med | 🟡 Med | 🟡 Med | **🟡 MEDIUM** |
| Renew (77) | 🟢 High | 🟢 High | 🟢 High | 🟡 Med | 🟢 High | **🟢 HIGH** |
| Greens (53) | 🟢 High | 🟢 High | 🟢 High | 🔴 Low | 🟢 High | **🟡 MEDIUM** |
| The Left (45) | 🟢 High | 🟡 Med | 🟢 High | 🔴 Low | 🟢 High | **🟡 MEDIUM** |
| NI (30) | 🔴 Low | 🔴 Low | 🔴 Low | 🔴 Low | 🟡 Med | **🔴 LOW** |
| ESN (27) | 🔴 Low | 🔴 Low | 🔴 Low | 🟡 Med | 🟡 Med | **🔴 LOW** |

---

*Voting Patterns Analysis | EU Parliament Monitor | 2026-05-10*
*Note: All vote estimates are inferred from political group positions and historical patterns — not confirmed roll-call data*
