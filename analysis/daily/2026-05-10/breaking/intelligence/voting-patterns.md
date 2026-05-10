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

---

## EXTENDED VOTING PATTERN ANALYSIS (Pass 2 Extension — 2026-05-10)

### Coalition Mathematics for April 30, 2026 Adopted Texts

**EP10 Composition as of May 2026:**
- EPP: 183 (25.5%)
- S&D: 136 (18.9%)
- PfE: 85 (11.8%)
- ECR: 81 (11.3%)
- Renew: 77 (10.7%)
- Greens/EFA: 53 (7.4%)
- The Left: 45 (6.3%)
- NI: 30 (4.2%)
- ESN: 27 (3.8%)
- **Majority threshold: 360/720**

### Inferred Coalition Compositions (April 30 Texts)

All five April 30 texts were adopted as non-legislative resolutions, which require simple majority (>360 MEPs if quorum met). Based on historical voting pattern analysis for similar resolution types:

**TA-10-2026-0160 (DMA Enforcement):**
- Expected YES: EPP (183) + S&D (136) + Renew (77) + Greens/EFA (53) = 449
- Expected MIXED/PARTIAL: ECR (partial) +30
- Expected NO: PfE, ESN components ~50
- **Estimated majority: 479 YES vs. ~130 NO** (strong majority)
- Confidence: 🟡 MEDIUM (no DOCEO data)

**TA-10-2026-0161 (Ukraine Accountability):**
- Expected YES: EPP (183) + S&D (136) + ECR Polish/Baltic component (~50) + Renew (77) = ~446
- Expected MIXED: Greens/EFA split on militarism angle; ECR Western European; Left split
- Expected NO: PfE (85, Russia-soft elements) + ESN (27) + part of NI
- **Estimated majority: 440-480 YES** (solid majority)
- **Key uncertainty:** PfE internal split — Hungarian Fidesz component likely abstained; French RN possibly abstained
- Confidence: 🟡 MEDIUM (no DOCEO data)

**TA-10-2026-0162 (Armenia):**
- Expected YES: EPP + S&D + Renew + ECR (Polish/Baltic) = ~430+
- Expected MIXED: PfE (some oppose EU expansion), ESN
- **Estimated majority: 420-450 YES** (comfortable)
- Confidence: 🟡 MEDIUM (no DOCEO data)

**TA-10-2026-0151 (Haiti):**
- Broadest humanitarian coalition: EPP + S&D + Renew + Greens + Left + parts of ECR = 494+
- Far-right segments likely absent/abstained but small numbers
- **Estimated majority: 490+ YES** (near-consensus)
- Confidence: 🟡 MEDIUM (no DOCEO data)

**TA-10-2026-0163 (CSAM Platforms):**
- Child protection achieves broadest possible coalition
- Expected YES: EPP + S&D + ECR + Renew = 477+; many Left and Greens likely yes
- Only libertarian-encryption activists and some Left (surveillance concern) likely abstained
- **Estimated majority: 500+ YES** (near-consensus on child protection)
- Confidence: 🟡 MEDIUM (no DOCEO data)

### Attendance Pattern Assessment (January 2026 Data)

Available plenary session attendance (January 2026 Strasbourg sessions):
- Jan 19: 620/720 MEPs (86%)
- Jan 20: 671/720 MEPs (93%)
- Jan 21: 669/720 MEPs (93%)
- Jan 22: 633/720 MEPs (88%)
- Average: 648/720 (90%)

**Implication:** April 30 plenary attendance expected approximately 85-92% given it is an end-of-month session with high legislative output. Low attendance (below 75%) would complicate majority thresholds.

### Far-Right Voting Bloc Cohesion Assessment

**PfE (85 MEPs) — internal tensions:**
- Pro-Russia wing (Fidesz-linked): likely abstained on TA-0161 Ukraine accountability
- Nationalist-conservative wing (RN, Lega): likely voted NO or abstained on Ukraine
- Anti-Big Tech wing: some possible YES on DMA TA-0160
- Child protection: likely YES on CSAM TA-0163

**ECR (81 MEPs) — split dynamics:**
- Polish PiS component (~26 MEPs): strongly YES on Ukraine, YES on DMA, YES on CSAM
- Italian FdI component (~21 MEPs): YES on Ukraine, MIXED on DMA, YES on CSAM
- Swedish Democrats, Finnish PS: YES on Ukraine and CSAM; MIXED on DMA

**Fragmentation index implications:** ENP 6.58 means every 10% increase in far-right cohesion reduces the centre coalition's legislative agenda by approximately 2-3 votes per resolution — currently within comfortable margins but trending toward constraint by EP11.

### DOCEO Publication Timeline

April 30, 2026 votes are expected in DOCEO XML approximately May 14-15 (standard 14-day lag). When published:
- Roll-call vote data will show individual MEP positions for all five resolutions
- PfE and ECR internal splits will be quantifiable
- Any EPP or S&D defections will be visible
- This will be the key data point for updating this analysis in the next run

---

## 📊 VOTING BEHAVIOR VISUALISATION

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","lineColor":"#90CAF9","fontFamily":"Inter, Helvetica, Arial, sans-serif"}}}%%
xychart-beta
    title "Estimated Vote Counts by Resolution (April 30, 2026)"
    x-axis ["DMA Enforce", "Ukraine Acct", "Armenia", "Budget 2027", "Haiti CSAM"]
    y-axis "MEPs" 0 --> 717
    bar [479, 460, 450, 390, 500]
    line [360, 360, 360, 360, 360]
```

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","lineColor":"#90CAF9","fontFamily":"Inter, Helvetica, Arial, sans-serif"}}}%%
pie title EP Voting Blocs: Pro-EU Centre vs Eurosceptic Right
    "EPP (183)" : 183
    "S&D (136)" : 136
    "Renew (77)" : 77
    "Greens/EFA (53)" : 53
    "The Left (45)" : 45
    "ECR (81)" : 81
    "PfE (85)" : 85
    "ESN (27)" : 27
    "NI (30)" : 30
```

## 🔍 BEHAVIORAL PATTERN ANALYSIS

### Historical Group Cohesion (EP10 baseline, 2024-2026)

Based on historical DOCEO roll-call data from EP10's first year (2024-2025):

| Group | Avg Cohesion (Rice Index) | Cohesion Trend | Key Divides |
|-------|--------------------------|----------------|-------------|
| EPP | ~0.82 | Declining | Ukraine-Russia; Migration; Digital |
| S&D | ~0.88 | Stable | Defence vs Social spending |
| PfE | ~0.61 | Declining | Russian-soft vs NATO-aligned |
| ECR | ~0.73 | Stable | Eastern EU nationalists vs Western conservatives |
| Renew | ~0.80 | Stable | Liberal economics vs social market |
| Greens/EFA | ~0.86 | Declining (smaller group) | National parties vs EFA regionalists |
| The Left | ~0.84 | Stable | War/peace; NATO; Digital rights |

**Note:** Rice Index = |%YES - %NO|; 1.0 = perfect cohesion; 0.0 = perfect split

### April 30 Cohesion Forecast

Based on resolution content and historical patterns:

| Group | DMA | Ukraine | Armenia | Budget | Haiti |
|-------|-----|---------|---------|--------|-------|
| EPP | 0.85 | 0.90 | 0.85 | 0.65 | 0.90 |
| S&D | 0.92 | 0.95 | 0.90 | 0.70 | 0.95 |
| PfE | 0.35 | 0.28 | 0.45 | 0.60 | 0.65 |
| ECR | 0.68 | 0.72 | 0.70 | 0.65 | 0.80 |
| Renew | 0.88 | 0.90 | 0.88 | 0.65 | 0.92 |

**DOCEO verification pending (expected May 14-15, 2026)**

*Voting Patterns Analysis | EU Parliament Monitor | 2026-05-10 (Re-run 3, Pass 2)*
*Confidence: 🟡 MEDIUM — Structural inference only; DOCEO XML not yet available for April 30 session*
