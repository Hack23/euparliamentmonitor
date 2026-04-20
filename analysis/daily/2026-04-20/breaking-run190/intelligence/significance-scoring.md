---
articleType: breaking
runId: 190
date: 2026-04-20
analysisPhase: significance-scoring
confidence: MEDIUM
---

# 📊 Significance Scoring — Easter Recess Day 7 / Run 190 (Easter Monday)

**Analysis Date:** 2026-04-20 | **Run:** 190 | **Day:** Easter Monday — Recess Day 7 of 13

![Status](https://img.shields.io/badge/Parliament-Easter_Monday_Day_7-orange?style=flat-square)
![Significance](https://img.shields.io/badge/Significance-15%2F50-yellow?style=flat-square)
![Mode](https://img.shields.io/badge/Mode-ANALYSIS_ONLY-blue?style=flat-square)
![API_Status](https://img.shields.io/badge/EP_API-Tier--2_Offline_Day_10-red?style=flat-square)
![USTR](https://img.shields.io/badge/USTR_301_Window-Opens_Tomorrow-orange?style=flat-square)

---

## Newsworthiness Gate Assessment

**Final Score: 15/50 | Gate: FAIL (threshold: 25/50) | Mode: ANALYSIS_ONLY**

### Dimensional Scoring

| Dimension | Weight | Score | Weighted | Rationale |
|-----------|--------|-------|----------|-----------|
| EP Activity Today | ×2 | 0/5 | 0/10 | Easter Monday — zero institutional activity |
| Intelligence Accumulation | ×2 | 2.5/5 | 5/10 | Day 10 of recess series; saturation approaching on core topics |
| Forward Trigger Proximity | ×2 | 3.5/5 | 7/10 | USTR window <24h; Council Coreper 3 days; return 7 days |
| Data Quality | ×2 | 1.5/5 | 3/10 | Tier-2 offline Day 10; 159 texts unchanged; content still blocked |
| Total | | | **15/50** | Well below publication threshold |

### Scoring Rationale (Pass 2 Extended)

**EP Activity Today (0/10 — Definitive):** April 20, 2026 is Easter Monday, a public holiday in
the overwhelming majority of EU member states including Germany (federal holiday), France (Lundi
de Pâques), Netherlands, Belgium, Poland, Sweden, Finland, Denmark, and more. The European
Parliament building in Brussels and Strasbourg are closed. No committee meetings, no political
group meetings, no press conferences, no formal institutional decisions. This dimension scores
zero with 🟢 HIGH confidence — it is both a calendar fact and empirically confirmed by the
complete absence of EP feed data for today's timeframe across all four primary feed endpoints.

**Intelligence Accumulation (5/10 — Revised Slightly Downward):** Run 190 is the eleventh
run in the Easter Recess Series (Runs 179–190). The core analytical narratives — five-dimensional
legislative signal, EP API dual-layer architecture, non-monotonic restoration, Grand Centre
stability — have been fully developed across 10 prior runs. Marginal analytical value from
additional runs declines as:
- March 26 landmark texts remain title-confirmed-only (no new content accessible)
- Coalition composition unchanged (738 MEPs, groups stable)
- All five forward scenarios remain at same probability estimates as Run 188

However, three incremental intelligence additions justify a partial score:
1. Easter Monday context adds institutional quiescence documentation to the series record
2. USTR window proximity creates a new pre-window monitoring baseline
3. Day 10 API outage confirmation further refines restoration probability estimates
Confidence: 🟡 MEDIUM

**Forward Trigger Proximity (7/10 — Strong):** This dimension is the standout positive in
today's scoring. Within the next seven days, four high-significance observable events will occur:
- **April 21 (tomorrow):** USTR Section 301 petition filing window opens — potentially the most
  consequential external trigger for EU Parliament in the post-recess period (20% probability)
- **April 23:** German Bundesrat session — first member state legislature signal on BRRD3/SRMR3
- **April 23-25:** Council Coreper — Banking Union ratification agenda items
- **April 27:** Parliament returns from recess
The concentration of four high-stakes triggers within a 7-day window is historically rare and
warrants elevated monitoring posture. Confidence: 🟢 HIGH (dates are confirmed from official schedules)

**Data Quality (3/10 — Degraded):** Tier-2 feeds (events, procedures, documents, plenary/committee
documents, parliamentary questions) have been offline for 10 consecutive days. The adoption of
a non-monotonic restoration model (established in Run 188 via TA-0101 regression) means the
current 159-text metadata count cannot be treated as growing reliably toward full restoration. Run
188's regression discovery represents the strongest indicator that restoration will be patchy even
when it begins. The metadata layer continues to function (year-filter endpoint), enabling partial
monitoring. Confidence: 🟢 HIGH on current status, 🔴 LOW on restoration timeline.

---

## Historical Context: Easter Recess Series Significance Progression

```
Run 179: 12/50 → ANALYSIS_ONLY (Day 1 — recess begins)
Run 180: 12/50 → ANALYSIS_ONLY
Run 181: 13/50 → ANALYSIS_ONLY
Run 182: 12/50 → ANALYSIS_ONLY
Run 183: 13/50 → ANALYSIS_ONLY
Run 184: 28/50 → ARTICLE (API restoration window — reference quality)
Run 185: 12/50 → ANALYSIS_ONLY (immediate reversion)
Run 186: 14/50 → ANALYSIS_ONLY
Run 187: 14/50 → ANALYSIS_ONLY
Run 188: 18/50 → ANALYSIS_ONLY (peak — title confirmation methodological breakthrough)
Run 190: 15/50 → ANALYSIS_ONLY (today — Easter Monday, USTR pre-window)
```

The series reveals an asymmetric pattern: significance can spike sharply when API restoration
produces genuinely newsworthy data (Run 184 spike to 28/50), but immediately reverts to baseline
when data degrades. The series mean is approximately 14.5/50 — substantially below the 25/50
publication threshold. Easter Monday's 15/50 is consistent with this mean.

---

## Comparison with Prior Breaking News Articles

Run 184 (April 18) achieved 28/50 significance and produced a reference-quality article. The
factors that elevated Run 184:
- Five landmark text IDs confirmed for the first time
- EU-China TRQ (TA-0101) was content-accessible (subsequently regressed)
- March 26 five-dimensional signal framing was novel (first articulation)

Run 190's lower score (15/50) reflects:
- Same landmark texts: title-confirmed only, still no content
- No novel framing available — all five narrative dimensions fully developed
- Easter Monday institutional quiescence: below even typical recess-day baseline
- One partial upward driver: USTR window proximity creates forward intelligence value

---

## Significance Ceiling Analysis

The theoretical maximum significance achievable on Easter Monday 2026 (absent an external shock)
is approximately 25/50, which would require:
- A USTR Section 301 petition filing during business hours April 20 (Washington DC, UTC-5)
- An API restoration producing content access to one of the five landmark texts
- A major EP political group breaking recess silence with a substantive statement

None of these conditions have been met as of this analysis run. Significance ceiling this run: 20/50
(theoretical) → actual 15/50 (observed).

---

## Determination

**NEWSWORTHINESS GATE: FAIL**

No breaking news article will be generated. Analysis-only PR will be created per
`ai-driven-analysis-guide.md` Rule 5. Full analysis artifacts preserved for cross-run
intelligence continuity.

**Recommended next action:** Monitor USTR.gov at 09:00, 14:00, and 17:00 Washington DC time
on April 21. Run 191 significance estimate: 20-28/50 depending on USTR outcome.
