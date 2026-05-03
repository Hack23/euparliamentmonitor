<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 💱 IMF — Sole Authoritative Economic Source

> **Embed this callout in every artifact that cites macro / fiscal /
> monetary / trade / FDI / exchange-rate / banking-soundness data.** The
> contract is non-negotiable — see
> [`imf-indicator-mapping.md`](../../methodologies/imf-indicator-mapping.md).

```markdown
> 💱 **Economic Data Source — IMF (sole authority).** Every economic,
> fiscal, monetary, trade, FDI, exchange-rate, and banking-soundness claim
> in this artifact cites the IMF MCP server only. World Bank, ECB, OECD and
> Eurostat are accepted **only** for non-economic cross-references (e.g.
> demographics, education, environment) and must be tagged as such.
> Cross-source disagreement ≥ 0.2 pp triggers an `imf-vintage-audit.md`
> companion artifact.
```

## When to embed

| Artifact | Embed? |
|---|:-:|
| `intelligence/economic-context.md` | ✅ mandatory |
| `intelligence/pestle-analysis.md` (E pillar) | ✅ when economic data appears |
| `intelligence/scenario-forecast.md` (macro paths) | ✅ when scenarios use macro priors |
| `risk-scoring/risk-matrix.md` (economic risks) | ✅ when economic risks listed |
| `extended/comparative-international.md` (cross-jurisdiction macro) | ✅ |
| `extended/intelligence-assessment.md` (when economic) | ✅ |
| `intelligence/imf-vintage-audit.md` | ✅ — this *is* the audit |
| Other artifacts (no economic claims) | ❌ skip |

## Anti-patterns

- Citing World Bank GDP as the headline figure → automatic Pass-2 rewrite.
- Mixing IMF WEO October vs IMF WEO April vintages without a vintage audit.
- Quoting Eurostat for unemployment when IMF has the same series — IMF wins.
