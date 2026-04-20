# 🎯 IMF Data Use Cases — EU Parliament Monitor

> When IMF data adds material value beyond World Bank for each EU
> Parliament Monitor article type, ranked by expected editorial lift.

**📅 Last Updated:** 2026-04-20 | **🏷️ Classification:** Public

---

## 1. Article-Type Quality Matrix

| Article type | IMF contribution | Lift |
|---|---|:---:|
| `news-week-ahead` | Forward-looking forecasts populate the "Economic outlook" paragraph with actual IMF numbers instead of AI-speculation | ★★★★★ |
| `news-month-ahead` | Same as above + quarterly IFS inflation/unemployment trajectory | ★★★★★ |
| `news-committee-reports` (ECON, BUDG, AFET, SEDE, INTA) | Fiscal Monitor debt, primary balance, structural balance, current account, REER, FDI quarterly | ★★★★★ |
| `news-weekly-review` | Period-over-period change from CPI/IFS; WEO-delta vs prior vintage | ★★★★ |
| `news-monthly-review` | Same + monthly PCPS commodity and ER exchange-rate context | ★★★★ |
| `news-breaking` | Eliminates "data to 2024" stale claim; cites Q4 2025 / Q1 2026 IFS inflation | ★★★★ |
| `news-motions` | Macro backdrop for legislative risk-assessment SWOT | ★★★ |
| `news-propositions` | As motions | ★★★ |
| `news-article-generator` | Topic-dependent; matches the underlying article type | ★★★ |
| `news-translate` | Terminology update only (glossary: "World Bank" → "IMF") | neutral |

---

## 2. Decision Rule: When to prefer IMF over World Bank

Use IMF **first** when any of the following conditions holds:

1. The article period extends into the current year or **any future
   year** — WDI will not have the data.
2. The indicator is macro/fiscal/trade/monetary — IMF WEO/FM/IFS/BOP
   are the authoritative sources.
3. Quarterly or monthly granularity is required — WDI is annual.
4. The article needs a forecast (any year beyond the latest actual) —
   WEO/FM are the only viable source.
5. The committee context is ECON, BUDG, AFET, SEDE, INTA — these
   committees' statutory remit aligns with IMF's primary outputs.

Use **World Bank** (and do NOT substitute IMF) when:

1. The indicator is social (life expectancy, birth rate, internet users).
2. The indicator is health (physicians, hospital beds, immunisation).
3. The indicator is education (enrolment, literacy).
4. The indicator is environmental (CO₂, renewable energy).
5. The indicator is innovation (R&D spending, high-tech exports).

---

## 3. Concrete Editorial Upgrades Unlocked

### 3.1 Forecast-vs-actual tracking in SWOT

Strengths and Opportunities sections can cite 2027-2030 WEO paths
(e.g. "IMF projects real GDP growth of 1.7 % in 2027 rising to 1.8 %
by 2030 — a Strength given the 1.2 % 2023-2024 drag"). Weaknesses can
cite forecast revisions vs prior vintage.

### 3.2 Policy-stance-to-macro correlation

ECON committee voting cohesion can be charted against the WEO
structural-balance path, illustrating the political economy of
consolidation choices.

### 3.3 Quarterly anomaly detection

`early_warning_system` analysis can fold IFS quarterly
inflation/unemployment deltas into the scoring, upgrading CRITICAL/HIGH
alerts with timely backing.

### 3.4 Cross-country comparative ranking with 2025 actuals + 2026 forecasts

The current "Germany GDP growth 2024" comparator is stale; IMF WEO
ships 2025 actuals and 2026 forecasts for every EU-27 country enabling
proper peer ranking today.

### 3.5 Confidence-level evidence chain

Per the intelligence-operative framework, IMF WEO April 2026 is a
single authoritative timestamped vintage, improving the "source
attribution + data currency dates" checklist item in
`analysis/methodologies/ai-driven-analysis-guide.md` Rule 22.

---

## 4. Editorial Guardrails

- **Label every forecast**: An article citing a WEO forecast MUST
  include the word "forecast", "projection", or "IMF projects" near
  the number, plus the vintage (e.g. "IMF WEO April 2026").
- **Acknowledge optimism bias**: For horizons ≥3 years, include a
  one-sentence note that WEO forecasts historically overstate
  medium-term growth.
- **Cite both sources when appropriate**: Health/education articles
  using IMF macro context MUST still cite WB for the domain-specific
  indicator (e.g. life expectancy).
- **Prefer actuals**: When both an actual and a forecast exist for the
  same year, use the actual. `getMostRecentObservation` in
  `src/utils/imf-data.ts` implements this rule.

---

## 5. Dual-Source Citation Pattern

```
<p>
  Germany's general government debt reached 62.4 % of GDP in 2024
  (IMF Fiscal Monitor April 2026) and the IMF projects it to stay at
  61 % through 2026. In parallel, the World Bank's social indicators
  show health-expenditure intensity at 12.4 % of GDP (SH.XPD.CHEX.GD.ZS,
  2023 latest), the highest in the EU-27.
</p>
```

This pattern satisfies both gates (`articlePolicyHasWorldBank` and
`articlePolicyHasEconomicContext`) and makes the source provenance
transparent to readers.
