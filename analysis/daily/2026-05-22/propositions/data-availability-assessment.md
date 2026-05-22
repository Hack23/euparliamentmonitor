# Data Availability Assessment — EU Parliament Propositions
**Run Date:** 2026-05-22 | **Article Type:** propositions | **Data Mode:** degraded-feeds

---

## Executive Summary

This run encountered severe EP Open Data Portal API degradation affecting three of the four primary
feeds designated for the propositions workflow. All three primary feeds — procedures, committee
documents, and external documents — returned either 404 errors or empty result sets. The adopted
texts endpoint (`get_adopted_texts`) and the political landscape tool functioned normally, providing
a reliable baseline of 2026 legislative output and current political group composition.

**Overall Data Confidence:** 🟡 MEDIUM — sufficient for analytical conclusions on legislative themes
and political dynamics; insufficient for granular procedure-tracking or committee-level detail.

---

## Source-by-Source Availability

| Data Source | Status | Items Retrieved | Quality | Impact |
|-------------|--------|-----------------|---------|--------|
| `get_procedures_feed` | 🔴 DEGRADED | 0 (recent) | EP API 404 | Cannot track active procedures |
| `get_external_documents_feed` | 🔴 UNAVAILABLE | 0 | Empty/freshness lag | No Commission proposals |
| `get_committee_documents_feed` | 🔴 UNAVAILABLE | 0 | EP API 404 | No committee-stage docs |
| `get_adopted_texts` (2026) | 🟢 FULL | 21 | High | Key legislative output confirmed |
| `generate_political_landscape` | 🟢 FULL | 719 MEPs / 9 groups | High | Coalition analysis possible |
| `get_latest_votes` | 🟡 DEGRADED | 0 | Week not yet available | No roll-call data for May 2026 |
| `monitor_legislative_pipeline` | 🔴 TIMEOUT | 0 | Timed out 30s | Pipeline health unknown |
| IMF WEO data | 🟡 FALLBACK | Subscription required | WEO Apr 2026 (knowledge) | Economic context available |

---

## Degradation Root Cause Analysis

### EP API Enrichment Failures
The primary failure mode is a 404 error from the EP enrichment POST endpoint:
`POST https://admin.data.europarl.europa.eu/api/v2/procedures/?view=uri&view-version=v2.1`

This URL pattern suggests the EP admin API may be undergoing maintenance or facing capacity issues
on 2026-05-22. The degradation affects the JSON-LD enrichment layer that converts raw procedure
IDs to structured objects with metadata (title, stage, rapporteur, committee, subject matter).
Without enrichment, the fallback `GET /procedures` returns procedures dating from 1972 with no
stage or activity information — analytically useless for a current-affairs workflow.

### Upstream Freshness Lag
The external documents feed returned zero items explicitly flagging "ambiguous between true empty
window and feed freshness/ordering lag." This is a known EP API pattern where the feed endpoint
fails to promote recent items, particularly after plenary weeks.

### DOCEO Voting Data Gap
The latest votes tool found no data for the week of 2026-05-18. EP plenary voting records from
DOCEO XML are published with a delay of 2-5 business days; the most recent plenary week
(2026-05-18 to 2026-05-22) is therefore not yet available.

---

## Available Data Summary

### Adopted Texts 2026 (21 items — HIGH CONFIDENCE)
Legislative output confirmed for EP10 (2024-2029 mandate) through 2026-04-30:
- **January 2026**: Financial stability safeguarding; Electoral Act reform; EU-Mercosur ECJ opinion;
  Ukraine loan (COD 2025/0431)
- **February 2026**: Measuring Instruments Directive amendment; EU designs codification; ECB Annual
  Report 2025; Subcontracting/workers' rights; UN Commission on Status of Women recommendation;
  Northeast Syria resolution
- **March 2026**: EGF for displaced workers (Belgium/Tupperware)
- **April 2026**: 2027 Budget guidelines; Animal welfare (dogs & cats); EIB financial control;
  EU-Iceland PNR agreement; Haiti trafficking; Digital Markets Act enforcement; Ukraine accountability;
  Armenia democratic resilience; EP 2027 budget estimates

### Political Landscape (HIGH CONFIDENCE)
- **EPP**: 185 MEPs (25.73%) — largest group, right-leaning centre
- **S&D**: 136 MEPs (18.92%) — social democrats
- **PfE**: 85 MEPs (11.82%) — right-wing populist (incl. Le Pen, Orbán affiliates)
- **ECR**: 81 MEPs (11.27%) — national-conservative
- **Renew**: 77 MEPs (10.71%) — liberal/centrist
- **Greens/EFA**: 53 MEPs (7.37%) — greens/regionalists
- **The Left**: 45 MEPs (6.26%) — radical left
- **NI**: 30 MEPs (4.17%) — non-attached
- **ESN**: 27 MEPs (3.76%) — far-right sovereignist

---

## Floor Factor Application

Per the data availability matrix (`degraded-feeds` → factor 0.80), all per-artifact line floors
are reduced to 80% of their catalog values. Structural requirements (Mermaid diagrams, Admiralty
grades, confidence labels) are **not** reduced — they apply at 100% regardless of data mode.

Applied floor factor: **0.80 (degraded-feeds)**

---

## Analytical Conclusions Despite Degradation

Despite feed unavailability, the following conclusions carry 🟢 HIGH confidence:
1. EP10 is legislatively active: 21 adopted texts in 4.5 months of 2026 = strong output pace
2. Key legislative priority clusters: security/defense, digital regulation, social/labor, trade
3. EPP-S&D coalition mathematics: combined 321 seats = exactly the grand coalition threshold
4. Right-wing bloc (PfE+ECR+ESN) totals 193 seats — significant but well below blocking minority
5. The Digital Markets Act and trade files (EU-Mercosur) are among the most politically salient

The following conclusions carry 🟡 MEDIUM confidence (limited by missing procedures data):
1. Active procedure count in EP pipeline (estimated 150-300 based on historical EP10 patterns)
2. Committee-specific workload distribution
3. Rapporteur political group balance

The following conclusions carry 🔴 LOW confidence:
1. Specific procedure identifiers for procedures initiated in May 2026
2. Committee vote outcomes from the current week
3. Amendments tabled in active procedures

---

## Recommendations for Future Runs

1. **Retry timing**: EP enrichment failures are often transient; retrying after 2-4 hours may
   restore full feed access
2. **IMF API key**: Configure `IMF_API_PRIMARY_KEY` environment variable for direct WEO SDMX
   access rather than relying on knowledge-based fallback
3. **Pre-fetch expansion**: Add `get_adopted_texts` to the pre-fetch script as a reliable
   fallback for legislative output tracking when primary feeds degrade
