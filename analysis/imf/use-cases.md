# 🎯 IMF Data Use Cases — EU Parliament Monitor

> When IMF data adds material value beyond World Bank for each EU
> Parliament Monitor article type, ranked by expected editorial lift.

**📅 Last Updated:** 2026-04-24 | **🏷️ Classification:** Public | **🌀 Wave:** 4

---

## 1. Article-Type Quality Matrix

Under **IMF is the sole authoritative source for
economic context** for every article type below — World Bank is
retained only for non-economic domains and is additive, not
substitutable.

| Article type | IMF contribution | Min IMF indicators | WB cross-ref allowed? |
|---|---|:---:|:---:|
| `news-week-ahead` | Forward-looking forecasts populate the "Economic outlook" paragraph with actual IMF numbers instead of AI-speculation | ≥ 2 | non-economic |
| `news-month-ahead` | Same as above + quarterly IFS inflation/unemployment trajectory | ≥ 2 | non-economic |
| `news-committee-reports` (ECON) | WEO+IFS+FSI core macro+monetary; GFSR for stability callouts | ≥ 4 | non-economic |
| `news-committee-reports` (BUDG) | FM debt, primary balance, structural balance | ≥ 3 | non-economic |
| `news-committee-reports` (AFET / SEDE) | WEO macro context, DOT bilateral flows, EREO Europe briefs | ≥ 2 | defence/military on WB |
| `news-committee-reports` (INTA) | DOT + BOP_AGG + WEO trade volume | ≥ 3 | non-economic |
| `news-weekly-review` | Period-over-period change from CPI/IFS; WEO-delta vs prior vintage | ≥ 1 | non-economic |
| `news-monthly-review` | Same + monthly PCPS commodity and ER exchange-rate context | ≥ 2 | non-economic |
| `news-breaking` | Eliminates "data to 2024" stale claim; cites Q4 2025 / Q1 2026 IFS inflation | ≥ 1 | non-economic |
| `news-motions` | Macro backdrop for legislative risk-assessment SWOT | ≥ 1 | non-economic |
| `news-propositions` | As motions | ≥ 1 | non-economic |
| `news-article-generator` | Topic-dependent; matches the underlying article type | per underlying type | per underlying type |
| `news-translate` | Terminology: preserve "IMF", "WEO", "Fiscal Monitor" proper names in non-Latin scripts | — | — |

---

## 2. Decision Rule: When IMF is mandatory

IMF is **mandatory** for any policy-required article type whose
subject matter touches:

1. GDP / growth / output
2. Inflation / prices / CPI / HICP
3. Unemployment / labour
4. Public debt / deficit / fiscal balance
5. Current account / trade balance / export / import
6. FDI / capital flows
7. Exchange rate / monetary policy / interest rate
8. Banking / financial-sector stability
9. Commodity prices (where relevant to the policy topic)
10. Any forward-looking or forecast-based claim

WB may still be cited **additively** for non-economic context in the
same article.

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
  same year, use the actual. The agent applies this rule when
  constructing `intelligence/economic-context.md` (the `A` and `F`
  `OBS_STATUS` codes in the raw SDMX-JSON payload make the distinction
  explicit — see [`indicator-catalog.md §4`](indicator-catalog.md#4-observation-attributes)).

---

## 5. Canonical Citation Pattern

```
<p>
  Germany's general government debt reached 62.4 % of GDP in 2024
  (IMF <em>Fiscal Monitor</em>, April 2026) and the IMF projects it
  to stay at 61 % through 2026. For context on the non-economic
  side, the World Bank's health indicators show health-expenditure
  intensity at 12.4 % of GDP (SH.XPD.CHEX.GD.ZS, 2023 latest), the
  highest in the EU-27.
</p>
```

IMF is the primary citation for the fiscal claim; World Bank is
additive for the non-economic health-expenditure framing. This
pattern satisfies the  editorial IMF-primary policy enforced at
Stage C — see [`../methodologies/imf-indicator-mapping.md`](../methodologies/imf-indicator-mapping.md)
for the per-committee mapping.

---

## 6. See also

- [`database-directory.md`](database-directory.md) — full database list
- [`indicator-catalog.md`](indicator-catalog.md) — per-database indicator codes
- [`release-calendar.md`](release-calendar.md) — vintage SLAs
- [`forecast-accuracy-baseline.md`](forecast-accuracy-baseline.md) — optimism-bias bands
- [`cross-source-triangulation.md`](cross-source-triangulation.md) — ECB/Eurostat/OECD cross-checks
- [`../methodologies/imf-indicator-mapping.md`](../methodologies/imf-indicator-mapping.md) — per-committee indicator mapping
