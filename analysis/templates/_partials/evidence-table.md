<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📊 Canonical Evidence Table

> **Reused in every artifact that makes external claims.** Templates that
> embed an evidence table use the column shape below. The completeness
> validator looks for a markdown table whose header includes one of
> `Source`, `Evidence`, or `Reference` — any of those three signals is
> sufficient. Templates may add columns (e.g. `Confidence`, `Horizon`) but
> must not drop the source-grade column.

## Canonical 5-column form

```markdown
| # | Claim | Admiralty grade | Source / Evidence | Confidence |
|:-:|---|:-:|---|:-:|
| 1 | EPP withdraws support for AI Act trilogue | A1 | EP MCP `get_voting_records(sessionId=PV-2026-04-15)` — record #347 | 🟢 |
| 2 | Council compromise text amends Article 6 | A2 | Council doc 8123/26 §3.1 | 🟢 |
| 3 | Politico reports rapporteur replacement | C3 | Politico 2026-04-12 — "Renew swap" | 🟡 |
```

## Optional columns

When the artifact's mermaidType or methodology requires it, add:

| Column | When to add |
|---|---|
| `Probability (WEP)` | Probabilistic artifacts — scenario-forecast, risk-matrix, wildcards-blackswans |
| `Horizon` | Forward-looking artifacts — forward-projection, forward-indicators |
| `Sentiment` | Media-framing-analysis |
| `Stakeholder` | Stakeholder-map, impact-matrix |
| `MS coverage` | Implementation-feasibility, comparative-international |

## Anti-patterns (rejected)

- Plain bullet lists without a markdown table → validator does not see the source-diversity signal.
- Footnotes-only citations → the per-claim grade is invisible at scan time.
- `[Source: TBD]` → triggers the no-placeholder grep.
- Mixed Admiralty grades inside one cell ("(A1)/(C3)") — split into rows.
