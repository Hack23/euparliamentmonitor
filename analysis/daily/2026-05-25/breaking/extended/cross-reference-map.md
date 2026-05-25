# Cross-Reference Map — EP Breaking News 2026-05-25
**Admiralty Grade**: A1 | Internal cross-reference index across all analysis artifacts

---

## Purpose

This map links every major analytical finding to its source artifact(s) and identifies the dependencies between artifacts for article generation.

---

## Core Evidence → Artifact Mapping

| Evidence Item | Source Artifact(s) | Used In |
|---|---|---|
| TA-10-2026-0183 (AI-trade resolution) | documents/document-analysis-index.md | executive-brief.md, intelligence/synthesis-summary.md, extended/comparative-international.md |
| TA-10-2026-0174 (Uzbekistan EPCA) | documents/document-analysis-index.md | intelligence/synthesis-summary.md, intelligence/stakeholder-map.md |
| TA-10-2026-0177 (Lebanon Eurojust) | documents/document-analysis-index.md | intelligence/synthesis-summary.md, intelligence/stakeholder-map.md |
| Fisheries protocols (0178, 0179) | documents/document-analysis-index.md | classification/significance-classification.md |
| Pappas immunity waiver | documents/document-analysis-index.md | classification/significance-classification.md |
| IMF WEO April 2026: EU GDP 1.4% | intelligence/economic-context.md | executive-brief.md, extended/comparative-international.md |
| IMF: Uzbekistan GDP 7.2% | intelligence/economic-context.md | extended/comparative-international.md |
| ECB rate 2.50% | intelligence/economic-context.md | extended/coalition-mathematics.md |
| EP10 coalition: EPP+S&D+RE majority (54%) | intelligence/coalition-dynamics.md | extended/coalition-mathematics.md, intelligence/voting-patterns.md |
| GDPR precedent for AI governance | extended/historical-parallels.md | executive-brief.md, extended/comparative-international.md |
| Media framing risks | extended/media-framing-analysis.md | executive-brief.md |
| Forward indicators (6-month horizon) | extended/forward-indicators.md | intelligence/scenario-forecast.md |
| Devil's advocate challenges | extended/devils-advocate-analysis.md | intelligence/threat-model.md, intelligence/wildcards-blackswans.md |
| Implementation feasibility assessment | extended/implementation-feasibility.md | risk-scoring/risk-matrix.md |

---

## Artifact Dependency Graph (Stage D Read-Before-Render Order)

```
documents/document-analysis-index.md
  └→ executive-brief.md
      └→ intelligence/synthesis-summary.md
          └→ intelligence/coalition-dynamics.md
          └→ intelligence/stakeholder-map.md
          └→ risk-scoring/quantitative-swot.md
              └→ extended/forward-indicators.md
              └→ extended/scenario-forecast (via intelligence/scenario-forecast.md)
          └→ intelligence/economic-context.md
```

---

## Cross-Run Continuity Links

See intelligence/cross-run-diff.md for run continuity context. This is the first run of the day; no prior artifacts exist. The cross-run-diff.md documents the fresh-start baseline.

---

## Quality Flags

- All artifacts carry Admiralty grades; see intelligence/mcp-reliability-audit.md for aggregate data quality assessment
- Artifacts depending on DOCEO voting data (intelligence/voting-patterns.md, intelligence/coalition-dynamics.md) carry C-grade source reliability due to unavailable May 2026 plenary roll-call data
- Economic context artifacts carry A/B-grade source reliability (IMF WEO April 2026)
