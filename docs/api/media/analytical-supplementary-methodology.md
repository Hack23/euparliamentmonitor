<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🔬 Analytical Supplementary Methodology</h1>

<p align="center">
  <strong>📊 Rules for Optional Deep-Dive Analytical Templates</strong><br>
  <em>🎯 PESTLE Deep-Dive · Wildcards & Black Swans · Quantitative SWOT · Media Framing Deep-Dive</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.0-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--05--06-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Classification-Public-green?style=for-the-badge" alt="Classification"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 1.0 | **📅 Last Updated:** 2026-05-06 (UTC)
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-08-01
**🏢 Owner:** Hack23 AB (Org.nr 5595347807) | **🏷️ Classification:** Public

---

## 🎯 Purpose

This methodology governs the **four optional deep-dive analytical templates** that augment the mandatory core artifacts with specialised analytical lenses. These artifacts are **not blocking** at the Stage-C completeness gate — their absence does not prevent PR creation. However, when produced, they must meet the quality standards documented here.

**Trigger conditions** — produce these artifacts when:

| Template | Trigger Condition |
|----------|-------------------|
| `pestle-analysis.md` | Event crosses ≥2 PESTLE dimensions simultaneously |
| `wildcards-blackswans.md` | Long-horizon forecasting (month-ahead, quarter-ahead, year-ahead) or crisis/uncertainty period |
| `quantitative-swot.md` | Decision memo requiring numerically scored SWOT ranking for comparison |
| `media-framing-analysis.md` | High-salience event with significant media coverage (≥15 articles across ≥5 outlets) |

---

## 🔄 Tradecraft Anchors

| Element | Value | Reference |
|---------|-------|-----------|
| **F3EAD Stage** | ANALYZE — deep-dive analytical lens | [osint-tradecraft-standards.md §F3EAD](osint-tradecraft-standards.md) |
| **PIRs Served** | Variable per template (see individual sections below) |
| **Admiralty Floor** | B2 minimum for external sources | [osint-tradecraft-standards.md §Admiralty](osint-tradecraft-standards.md) |
| **WEP + ODNI** | WEP bands required on all probabilistic claims | [osint-tradecraft-standards.md §WEP](osint-tradecraft-standards.md) |
| **SATs Applied** | ≥3 per template: ACH, Red Team, Outside-In, Indicators & Signposts | [osint-tradecraft-standards.md §SAT Catalog](osint-tradecraft-standards.md) |
| **ICD 203 Standards** | 1, 2, 5, 6, 9 | ODNI ICD 203 |

---

## 📊 Composition Rules (Shared Across All Four Templates)

### DIW Weight Vector

When any supplementary artifact contributes to the significance-scoring composite, it uses the standard 5-dimension weight vector:

| Dimension | Weight | Measurement |
|-----------|:------:|-------------|
| Democratic Impact | 0.30 | Effect on democratic participation, representation, accountability |
| Institutional Weight | 0.25 | Involvement of key EU institutions (EP, Council, Commission, ECJ) |
| Policy Breadth | 0.20 | Number of policy areas and MS affected |
| Temporal Urgency | 0.15 | Time pressure for decision/action |
| Public Salience | 0.10 | Citizen awareness and engagement level |

### Evidence Citations

Every factual claim in a supplementary artifact MUST cite:
- An EP MCP tool call (tool name + parameters + timestamp), OR
- An EP procedure ID / adopted-text reference, OR
- An external source with Admiralty grade ≥ C2

### Forward-Indicator Feed

Supplementary artifacts that produce forward-looking assessments MUST feed their indicators into:
- `extended/forward-indicators.md` — signpost register
- `intelligence/scenario-forecast.md` — probability-weighted scenarios

### TTP Mapping (where applicable)

DISARM TTP codes (T-numbers) are used for media-framing and wildcards artifacts to identify manipulation techniques. STRIDE is **explicitly excluded** from political analysis (see [political-threat-framework.md §Historical Note](political-threat-framework.md)).

---

## 📋 AS1 — PESTLE Analysis Deep-Dive

### Trigger

Event crosses ≥2 PESTLE dimensions simultaneously (e.g., Green Deal affects Political + Economic + Environmental + Legal).

### PIRs Served

PIR-1 (Legislative Impact), PIR-2 (Political Stability), PIR-3 (Economic Consequences), PIR-5 (Environmental Policy)

### Construction Steps

1. **Identify cross-dimensional event** — the event must demonstrably span ≥2 of the 6 PESTLE dimensions
2. **Per-dimension scan** — for each of the 6 dimensions, document:
   - Current state (with EP MCP evidence)
   - Pressure direction (strengthening / weakening / stable)
   - Key actors driving change in this dimension
   - IMF data (for Economic dimension — mandatory, sole authoritative source)
3. **Cross-dimension interactions** — identify ≥3 interactions where one dimension's change amplifies or dampens another (e.g., Political pressure → Legal reform → Economic adaptation)
4. **Mermaid mindmap** — 6-branch mindmap with ≥3 items per branch
5. **Forward monitors** — per-dimension indicators with WEP bands

### Quality Signals

- ≥250 lines
- All 6 PESTLE dimensions populated with ≥3 items each
- ≥3 cross-dimension interaction pathways documented with causal logic
- IMF data cited for Economic dimension (mandatory)
- Mindmap Mermaid with 6 branches
- Forward monitors with dated trigger points

### EP MCP Tools

- `get_adopted_texts` — legislation crossing multiple dimensions
- `get_parliamentary_questions` — political dimension scrutiny
- `track_legislation` — procedure status for Legal dimension
- `get_voting_records` — political dimension alignment
- `get_plenary_sessions` — institutional context

---

## 📋 AS2 — Wildcards & Black Swans Deep-Dive

### Trigger

Long-horizon forecasting (month-ahead, quarter-ahead, year-ahead) OR period of elevated uncertainty (geopolitical crisis, institutional crisis, pandemic, economic shock).

### PIRs Served

PIR-2 (Political Stability), PIR-4 (Security Threats), PIR-6 (Election Integrity), PIR-8 (Foreign Influence)

### Construction Steps

1. **Wildcard register** — enumerate ≥8 low-probability / high-impact events relevant to EU Parliament operations, across categories:
   - Institutional (EP composition shock, Commission fall, Treaty change)
   - Geopolitical (NATO Article 5, EU enlargement acceleration, major conflict escalation)
   - Economic (Eurozone crisis, sovereign default, energy supply disruption)
   - Technological (AI regulatory emergency, critical infrastructure attack)
   - Environmental (climate tipping point, natural disaster affecting EU summit)
   - Democratic (mass disinformation campaign, election interference)
2. **Black-swan candidates** — identify ≥3 events that are:
   - Below the current consensus probability threshold
   - Would fundamentally reshape EU political dynamics if they occurred
   - Have precedents in other jurisdictions or historical periods
3. **Causal chains** — for each black-swan candidate, document the causal chain:
   Trigger → First-order effect → Second-order cascade → EP institutional response → Democratic outcome
4. **Probability × Impact quadrantChart** — position all wildcards and black swans
5. **Early-warning indicators** — per-candidate signpost with monitoring cadence

### Quality Signals

- ≥275 lines
- ≥8 wildcards enumerated across ≥4 categories
- ≥3 black-swan candidates with full causal chains (≥4 steps each)
- quadrantChart (probability × impact) with all items positioned
- Early-warning indicators with WEP bands and Admiralty grades
- Cross-reference to `intelligence/scenario-forecast.md`

### EP MCP Tools

- `early_warning_system` — emerging political shifts
- `detect_voting_anomalies` — unusual patterns
- `analyze_coalition_dynamics` — coalition fracture signals
- `get_plenary_sessions` — institutional calendar for timing
- `generate_political_landscape` — current power balance

---

## 📋 AS3 — Quantitative SWOT Deep-Dive

### Trigger

Decision memo requiring numerically scored SWOT ranking for comparison across political positions, legislative options, or institutional strategies.

### PIRs Served

PIR-1 (Legislative Impact), PIR-2 (Political Stability), PIR-3 (Economic Consequences)

### Construction Steps

1. **SWOT enumeration** — identify 3+ items per quadrant (Strengths, Weaknesses, Opportunities, Threats) with strict evidence-based classification
2. **Numerical scoring** — score each item using the DIW weight vector (§Composition Rules above):
   - Impact score (1–5)
   - Probability score (1–5) for O/T; certainty score (1–5) for S/W
   - Temporal urgency (1–5)
   - Composite = Impact × Probability × (DIW weight for relevant dimension)
3. **TOWS cross-quadrant strategies** — generate ≥4 strategic options:
   - SO (use Strengths to exploit Opportunities)
   - WO (address Weaknesses to capture Opportunities)
   - ST (use Strengths to mitigate Threats)
   - WT (minimize Weaknesses to avoid Threats)
4. **Ranked action list** — top-5 scored actions with responsible actor + timeline
5. **180-day decay model** — how scores change over time (per [political-swot-framework.md](political-swot-framework.md))
6. **Mermaid quadrantChart** — items positioned by Impact × Likelihood

### Quality Signals

- ≥140 lines
- 3+3+3+3 items minimum (12 total SWOT items)
- Each item scored numerically with transparent formula
- TOWS matrix with ≥4 cross-quadrant strategies
- Ranked action list with named responsible actors
- 180-day decay projections on top-3 items
- quadrantChart Mermaid

### EP MCP Tools

- `compare_political_groups` — group-level strengths/weaknesses
- `analyze_voting_patterns` — voting cohesion (strength/weakness indicator)
- `monitor_legislative_pipeline` — pipeline bottlenecks (threat/opportunity)
- `assess_mep_influence` — influential actor mapping

---

## 📋 AS4 — Media Framing Deep-Dive

### Trigger

High-salience event with significant media coverage (≥15 articles across ≥5 outlets from ≥3 MS/languages) where framing analysis adds intelligence value beyond the base synthesis.

### PIRs Served

PIR-6 (Election Integrity), PIR-7 (Democratic Norms), PIR-8 (Foreign Influence), PIR-9 (Cognitive Security), PIR-10 (EU Institutional Legitimacy)

### Construction Steps

This section governs the deep-dive production of `extended/media-framing-analysis.md` using the [media-framing-analysis.md template](../templates/media-framing-analysis.md) v2.0. The template's 22 sections are produced in order:

1. **Tradecraft Context** (§1) — populate F3EAD anchors, PIRs, SATs
2. **Global Audience Orientation** (§2) — select relevant regional reader notes
3. **Framing Context** (§3) — metadata block with source scope
4. **Frame Package Overview** (§4) — identify 3–5 frames, produce Mermaid graph
5. **Entman Functions** (§5) — all 4 functions per frame (Problem / Cause / Moral / Treatment)
6. **Cognitive Vulnerability Map** (§6) — bias × mechanism × inoculation per frame
7. **DISARM TTP Map** (§7) — scan for manipulation indicators using T-codes
8. **Narrative-Laundering Chain** (§8) — trace narrative flow fringe → mainstream
9. **Source Ecology / Outlet Bias Audit** (§9) — no-neutral-media multi-axis audit
10. **CIB Signal Block** (§10) — ABCDE framework indicator scan
11. **Algorithmic-Amplification Asymmetry** (§11) — per-platform reach with academic evidence
12. **Comparative-International Frame Lineage** (§12) — ≥2 cognates per frame
13. **Strategic-Doctrine Detection** (§13) — pattern-match against known doctrines
14. **Frame Lifecycle** (§14) — intensity curve + half-life + zombie probability
15. **RRPA Impact Conversion** (§15) — Reach × Resonance × Persistence × Action composite
16. **Counter-Resilience Plan** (§16) — L1–L5 ladder per dominant frame
17. **Quote Salience** (§17) — key quotes with manipulation flags
18. **Frame-Competition Dynamics** (§18) — inter-frame relationship Mermaid
19. **Coverage-Volume Dashboard** (§19) — day-by-day volume by outlet category
20. **EU vs National Framing** (§20) — cross-national divergence (≥5 MS)
21. **Forward Watchlist** (§21) — trigger → frame-shift with WEP + Admiralty
22. **Sources + Document Control** (§22) — provenance and no-neutral doctrine

### Quality Signals

- ≥270 lines
- ≥15 outlets assessed across ≥5 MS/languages
- All 4 Entman functions per frame
- DISARM TTPs with verbatim T-codes
- Narrative-laundering chain with ≥4 stages
- CIB ABCDE: all 7 indicators assessed
- ≥3 academic citations for algorithmic-amplification claims
- ≥2 international cognates per frame
- Frame lifecycle xychart with ≥8 time points
- RRPA composite with dated real-world indicator per frame
- Counter-resilience L1–L5 populated for dominant frame(s)
- Pass-2 Self-Audit Checklist (33 items) fully attested

### EP MCP Tools

- `get_speeches` — plenary debate framing analysis
- `get_adopted_texts` — resolution language as frame codification
- `get_parliamentary_questions` — scrutiny topics as political signals
- `search_documents` — committee reports for institutional framing
- `get_plenary_sessions` — session context

### External Sources (open-access only)

| Source Category | Examples | Admiralty Grade | Role in Analysis |
|-----------------|----------|:--------------:|------------------|
| Brussels Bureau | Politico EU, EUobserver, Euractiv | B2 | Frame identification + elite discourse |
| Wire Services | AFP, Reuters, DPA | B2 | Baseline neutral-procedural frame |
| National Quality | FAZ, Le Monde, Corriere, El País, Gazeta Wyborcza | C2 | National frame divergence |
| Public Broadcasters | ARD/ZDF, France24, RAI, TVE, TVP | C2 | Public-service proceduralist frame |
| State-Affiliated (monitored) | RT, CGTN, TRT World | D3–F6 | Frame E detection (never cited as factual) |
| Academic/Think Tank | Bruegel, CEPS, EPC, Hertie School | B1 | Counter-framing evidence |

---

## 🔗 Integration with Core Pipeline

### How supplementary artifacts feed the article

The article aggregator (`src/aggregator/article-generator.ts`) reads `manifest.files` and flattens all groups. When the following artifacts are present in their canonical locations, they contribute:

| Artifact | Canonical Path | Article Section Fed |
|----------|---------------|---------------------|
| `pestle-analysis.md` | `intelligence/pestle-analysis.md` | Policy Context section — cross-dimensional analysis |
| `wildcards-blackswans.md` | `intelligence/wildcards-blackswans.md` | Risk Outlook section — low-probability/high-impact register |
| `quantitative-swot.md` | `risk-scoring/quantitative-swot.md` | Strategic Assessment section — scored position ranking |
| `media-framing-analysis.md` | `extended/media-framing-analysis.md` | Media & Perception section — dominant narratives + influence operations |

### Registration in manifest.json

```json
{
  "files": {
    "intelligence": [
      "intelligence/pestle-analysis.md",
      "intelligence/wildcards-blackswans.md"
    ],
    "risk_scoring": [
      "risk-scoring/quantitative-swot.md"
    ],
    "extended": [
      "extended/media-framing-analysis.md"
    ]
  }
}
```

### Stage-C Gate Interaction

These artifacts are **non-blocking** — their absence does not prevent Stage-C from passing. However:
- If an artifact IS listed in `manifest.files` (i.e., part of the mandatory set for the run), it must meet its line floor (from `reference-quality-thresholds.json`)
- If a listed artifact IS produced below floor, Stage-C treats it as a **RED issue** (`short:<lines><<minLines>`) — the run fails validation
- Artifacts found on disk but NOT listed in `manifest.files` are reported only as WARN orphans
- The `manifest.pass2.rewriteCount` check still applies to all produced artifacts

---

## 📚 Related Documents

- [`ai-driven-analysis-guide.md`](ai-driven-analysis-guide.md) — 10-step protocol
- [`artifact-catalog.md`](artifact-catalog.md) — complete artifact registry
- [`per-artifact-methodologies.md`](per-artifact-methodologies.md) — per-artifact construction rules
- [`political-swot-framework.md`](political-swot-framework.md) — SWOT methodology (governs AS3)
- [`political-risk-methodology.md`](political-risk-methodology.md) — risk scoring
- [`electoral-domain-methodology.md`](electoral-domain-methodology.md) — Family D domain lenses (governs AS4 via Part 4)
- [`osint-tradecraft-standards.md`](osint-tradecraft-standards.md) — tradecraft reference layer
- [`political-threat-framework.md`](political-threat-framework.md) — 5-framework threat analysis (STRIDE explicitly rejected)

---

## 📜 Version History

| Version | Date | Changes |
|:-------:|------|---------|
| 1.0 | 2026-05-06 | Initial EU Parliament Monitor analytical supplementary methodology. Ported from riksdagsmonitor v4.5 (`analytical-supplementary-methodology.md`), adapted for EU 27-MS context with: EP political groups, DSA/EEAS FIMI frameworks, IMF-only economic sourcing rule, STRIDE rejection preserved, media-framing deep-dive (v2.0 template integration). |

---

*Analytical Supplementary Methodology v1.0 — EU Parliament Monitor*
*Next review: 2026-08-01*
