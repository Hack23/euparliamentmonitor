<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📐 Reference Analysis Quality — EU Parliament Week Ahead
## Window: 1–5 June 2026 | Produced: 2026-05-29

**Classification:** UNCLASSIFIED // FOR PUBLIC RELEASE
**Purpose:** self-assessment of this run's analytical quality against the artifact catalog, tradecraft standards, and source-reliability rules.

## 🎯 Quality Dimensions Assessed

1. Source reliability (Admiralty grading)
2. Tradecraft compliance (WEP, SATs, confidence labelling)
3. Coverage completeness (artifact catalog)
4. Evidence density and citation
5. Calibration and uncertainty handling

## 📊 Source Reliability Ledger (Admiralty)

| Source | Admiralty grade | Use |
|---|---|---|
| IMF WEO (live) | A1 | All economic/fiscal claims (sole authority) |
| EP plenary calendar | A2 | No-plenary thesis, June dates |
| EP adopted texts (TA-10-2026-*) | A2 | Legislative-output evidence |
| EP committee docs | B3 | Committee context (titles sparse) |
| EP feed telemetry | B2 | Outage/degraded-mode evidence |
| Pipeline cache (cold) | C3 | Flagged INSUFFICIENT_DATA |

- **Load-bearing evidence sits at A1/A2.** No headline judgement rests on below-B sourcing. 🟢 HIGH.

## 🧪 Tradecraft Compliance Checklist

- ✅ WEP probability bands on headline judgements (synthesis, scenario, threat, exec-brief, risk, forward, wildcards).
- ✅ Time horizons attached to forward judgements.
- ✅ Admiralty grades on external sources.
- ✅ 🟢/🟡/🔴 confidence labels throughout.
- ✅ No unfilled-analysis placeholder tokens remain (checked against the validator's forbidden-marker set).
- ✅ SATs named where required (Key Assumptions, QoI, Scenario, Pre-Mortem, Stakeholder Mapping, ACH).
- ✅ IMF as sole economic source; no non-IMF economic claims.

## 📈 Coverage Completeness

- Framework artifacts: significance, actor-mapping, forces, impact-matrix — ✅ present.
- Risk artifacts: risk-matrix, quantitative-swot — ✅ present.
- Intelligence artifacts: synthesis, scenario, pestle, stakeholder, wildcards, threat, coalition, forward-projection, historical-baseline, economic-context, analysis-index, procedures-proxy, mcp-reliability-audit — ✅ present.
- Briefs: executive-brief — ✅ present; extended/media-framing — ✅ present.
- Governance: reference-analysis-quality (this file), methodology-reflection — ✅ present.
- Documents: document-analysis-index — ✅ present.

## 🔍 Evidence-Density Self-Check

- Specific text citations used (TA-10-2026-0112, 0183, 0160, 0174, 0177, fisheries SFPAs).
- Specific macro figures used (DE/FR/IT GDP, inflation, fiscal balance from IMF WEO).
- Specific seat counts used (EP10 nine-group distribution, 398 grand coalition, ENP 6.55).
- 🟢 HIGH density relative to a no-plenary preparatory week.

## ⚠️ Known Quality Limitations

- **Committee-agenda granularity (B3):** un-published agendas cap forward precision; all such claims flagged MEDIUM.
- **Pipeline metrics (cold cache):** no dwell/bottleneck data; substituted with adopted-texts proxy and flagged.
- **Behavioural calibration:** group stances inferred (no fresh roll-call this week); flagged MEDIUM.

## 🧭 Overall Quality Verdict

- **Sourcing:** 🟢 HIGH (A1/A2 load-bearing).
- **Tradecraft:** 🟢 HIGH (full WEP/Admiralty/SAT/confidence compliance).
- **Coverage:** 🟢 HIGH (full catalog produced).
- **Calibration:** 🟡 MEDIUM-HIGH (transparent uncertainty handling).

**Bottom line:** A high-quality, well-sourced, tradecraft-compliant run, with transparently-flagged limitations confined to un-published agenda detail and a cold pipeline cache — neither of which undermines the central judgement.

## 🗺️ Quality-Assurance Map

```mermaid
flowchart TD
  SRC[Source grading<br/>Admiralty A1-C3] --> Q[Quality score]
  COV[Artifact coverage<br/>39 templates] --> Q
  TRADE[Tradecraft:<br/>WEP + confidence] --> Q
  LIM[Limitations<br/>flagged] --> Q
  Q --> VERDICT[High-quality run]
```

## 📊 Quality Scorecard

| Dimension | Rating | Evidence |
| --- | --- | --- |
| Source reliability | 🟢 HIGH | A1 IMF + A2 EP calendar load-bearing |
| Coverage completeness | 🟢 HIGH | Full artifact set produced |
| Tradecraft discipline | 🟢 HIGH | WEP bands + Admiralty + confidence labels |
| Transparency of limits | 🟢 HIGH | Degraded feeds + agenda opacity declared |
| Analytical independence | 🟢 HIGH | Partisan frames attributed, not adopted |

## 🔍 Residual Limitations (declared)

- **Agenda granularity:** committee-level detail un-published for 1–5 June (B3) — forward claims hedged accordingly.
- **Cold pipeline cache:** legislative-pipeline metrics returned INSUFFICIENT_DATA — excluded from load-bearing judgements.
- **Degraded feeds:** events/procedures feeds 404'd — recovered via adopted-texts + calendar fallbacks; floors adjusted ×0.80 per policy.

## 🧭 Net Quality Verdict

- The central judgement (quiet committee week → budget-season runway) rests entirely on A1/A2 sources and is robust to every declared limitation.
- 🟢 HIGH overall confidence in the run's fitness for publication.

## 📎 Annex — QA Checklist

- ✅ Every artifact re-sized to its degraded-feeds-adjusted floor.
- ✅ Mermaid diagrams present in all diagram-directory artifacts.
- ✅ Admiralty source grades attached to load-bearing claims.
- ✅ WEP probability bands on forward judgements.
- ✅ Confidence labels (🟢/🟡/🔴) standardised.
- ✅ Forbidden placeholder tokens removed repository-wide.
- ✅ Partisan frames attributed, not adopted.
- ✅ Degraded-feeds limitation declared in the manifest and audit.

### Residual limitations (declared)
- Agenda granularity (B3) — forward claims hedged.
- Cold pipeline cache — excluded from load-bearing judgements.

### Confidence ledger
- 🟢 HIGH: fitness for publication.
