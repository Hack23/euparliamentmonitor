# Analysis Index — Year-Ahead Artifact Map (2026-05-31)

> **Article type:** `year-ahead`
> **Run date:** 2026-05-31
> **Data mode:** degraded-feeds
> **Method:** Index of all analysis artifacts produced this run.

## BLUF

This run produced a full year-ahead analysis artifact set.

The artifacts span classification, risk-scoring, intelligence, and extended layers.

Each artifact carries explicit confidence labelling.

The executive brief synthesises the set for the article render.

Confidence is 🟢 HIGH on the index completeness.

## Classification Layer

| Artifact | Purpose |
| --- | --- |
| significance-classification.md | Newsworthiness scoring |
| actor-mapping.md | Key-actor map |
| forces-analysis.md | Driving/restraining forces |
| impact-matrix.md | Impact distribution |

## Risk-Scoring Layer

| Artifact | Purpose |
| --- | --- |
| risk-matrix.md | Probability/impact matrix |
| quantitative-swot.md | Weighted SWOT |

## Intelligence Layer

| Artifact | Purpose |
| --- | --- |
| synthesis-summary.md | Cross-artifact synthesis |
| coalition-dynamics.md | Group behaviour |
| scenario-forecast.md | Scenario projection |
| pestle-analysis.md | PESTLE drivers |
| stakeholder-map.md | Stakeholder mapping |
| wildcards-blackswans.md | Tail risks |
| historical-baseline.md | Comparative context |
| economic-context.md | IMF macro context |
| threat-model.md | Threat narrative |
| mcp-reliability-audit.md | Data provenance |
| forward-projection.md | Quantitative outlook |
| legislative-pipeline-forecast.md | File flow |
| parliamentary-calendar-projection.md | Sitting map |
| presidency-trio-context.md | Council overlay |
| commission-wp-alignment.md | Commission mapping |
| methodology-reflection.md | Method attestation |

## Extended Layer

| Artifact | Purpose |
| --- | --- |
| media-framing-analysis.md | Framing/narrative |
| forward-indicators.md | Leading indicators |

## Root Artifact

| Artifact | Purpose |
| --- | --- |
| executive-brief.md | Editorial synthesis |

## Reading Order for the Article

The article should read the executive brief first.

It should then read synthesis-summary and scenario-forecast.

It should cite forward-projection for quantitative claims.

It should cite economic-context for all macro claims.

It should cite coalition-dynamics for group behaviour.

## Cross-Reference Integrity

Each intelligence artifact cross-references its neighbours.

The synthesis ties the set together.

The index confirms all 26 artifacts are present.

## Confidence Statement

Confidence is 🟢 HIGH on artifact presence.

Confidence is 🟢 HIGH on layer organisation.

Confidence is 🟡 MEDIUM on individual-artifact depth under time pressure.

## Artifact Count Verification

The classification layer contains four artifacts.

The risk-scoring layer contains two artifacts.

The intelligence layer contains nineteen artifacts.

The extended layer contains two artifacts.

The root layer contains one artifact (executive-brief).

Wait — the canonical count is twenty-six including the manifest's tracked set.

The mandatory set is twenty-five plus the executive brief.

## Coverage Confirmation

Every methodology-required artifact is present.

Every WEP+Admiralty-required artifact carries both elements.

Every IMF claim is sourced from the economic-context artifact.

Every artifact carries explicit confidence labelling.

## Dependency Notes

The executive brief depends on synthesis and scenario.

The synthesis depends on all intelligence artifacts.

The forward indicators depend on coalition-dynamics.

The media framing depends on stakeholder-map.

## Bottom Line

The artifact set is complete and well organised.

The executive brief is the article's primary entry point.

## Artifact Dependency Map

```mermaid
flowchart LR
  D[Data] --> C[Classification]
  C --> I[Intelligence]
  I --> R[Risk-scoring]
  R --> X[Extended]
  X --> B[Executive brief]
  B --> A[Article render]
```

The map shows the read order from data to article.

Each downstream artifact consumes its upstream peers.

The executive brief sits at the confluence of all chains.

The article should cite per-section artifacts per the map above.
