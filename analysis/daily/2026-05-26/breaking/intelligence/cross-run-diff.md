# Cross-Run Differential Analysis
**Date:** 2026-05-26 | **Article Type:** breaking
**Note:** First run today — no prior run to compare. Establishing baseline.
**SATs Applied:** Bayesian Update ✅ | Quality of Information Check ✅

---

## Run History

| Run Date | Run ID | Artifacts | Gate Result | Key Finding |
|---|---|---|---|---|
| 2026-05-26 | breaking-run267-1779759215 | This run (in progress) | TBD | May 19-21 plenary |

*No prior same-day runs to compare. This document establishes the baseline for future cross-run differential analysis.*

---

## Baseline Establishment

### Key Metrics (This Run)
- **Primary news event:** May 19-21, 2026 Strasbourg plenary session
- **Texts adopted:** TA-10-2026-0164 through TA-10-2026-0191 (28 texts)
- **Key legislative items:** FDI Screening (0171), Steel (0170), AI Trade (0183), SAFE/Canada (0180), Afghanistan (0186), Uzbekistan (0173/174)
- **Data mode:** degraded-feeds (events and procedures feeds 404)
- **DOCEO roll-call availability:** Not yet published for May 19-21

### Baseline Intelligence Positions
For future cross-run comparison, the following positions are baseline:
1. **FDI Regulation implementation probability:** 45% managed implementation (Scenario 1)
2. **Chinese WTO consultation probability:** 50% within 12 months
3. **Hungarian ECJ challenge probability:** 70% within 6 months of entry into force
4. **Coalition stability assessment:** MODERATE-HIGH (65%)
5. **Steel safeguard activation:** HIGH probability (>80%) within 60-day Commission deadline

### Data Quality Baseline
| Source | Availability | Quality |
|---|---|---|
| EP Adopted Texts | FULL | HIGH |
| EP Events | DEGRADED (404) | N/A |
| EP Procedures | DEGRADED (historical only) | LOW for 2026 |
| EP MEPs | FULL | HIGH |
| DOCEO Roll-Call (May 19-21) | NOT YET PUBLISHED | N/A |
| IMF WEO | ACCESSED | HIGH |

---

## Quality of Information Check (SAT)

This baseline run established intelligence positions based on:
- ✅ Official EP adopted text titles (Admiralty A1)
- ✅ IMF macroeconomic data (Admiralty A2)
- ⚠️ Political coalition analysis (estimated, not confirmed roll-call) (Admiralty C3)
- ⚠️ Chinese/US response scenarios (speculative, based on historical patterns) (Admiralty C3)
- ❌ Event-level procedural data (unavailable)

**Overall baseline confidence:** MODERATE. Legislative facts HIGH confidence; political dynamics MODERATE; external actor responses LOW-MODERATE.

---

## Future Update Instructions

When roll-call data becomes available (expected: June 10-17, 2026):
1. Run `npm run prior-run-diff -- "${ANALYSIS_DIR}"` to identify which intelligence positions require update
2. Update `intelligence/voting-patterns.md` with confirmed roll-call figures
3. Update coalition-dynamics.md cohesion rates
4. File cross-run-diff.md entry comparing confirmed vs. estimated positions
5. Update scenario probability weights based on Commission response to 60-day steel deadline (due ~July 19, 2026)

**Bayesian Update trigger events:**
- Commission ISA legislation published → update Scenario 1 probability
- China WTO consultation filed → update Threat 1 probability
- Hungarian ECJ challenge announced → update Threat 4 probability
- NATO ministerial June 2026 → update SAFE/Canada assessment
