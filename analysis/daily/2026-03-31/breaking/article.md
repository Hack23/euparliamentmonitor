# Breaking — 2026-03-31

<!-- Aggregated analysis — do not edit; regenerate via `npm run generate-article`. -->

> **Provenance**
>
> - **Article type:** `breaking`
> - **Run date:** 2026-03-31
> - **Run id:** `breaking`
> - **Gate result:** `PENDING`
> - **Analysis tree:** [analysis/daily/2026-03-31/breaking](https://github.com/Hack23/euparliamentmonitor/tree/main/analysis/daily/2026-03-31/breaking)
> - **Manifest:** [manifest.json](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/daily/2026-03-31/breaking/manifest.json)

<h2 id="section-supplementary-intelligence">Supplementary Intelligence</h2>

### Breaking News Analysis

<p class="artifact-source"><a href="https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/daily/2026-03-31/breaking/breaking-news-analysis.md" rel="noopener">View source: <code>breaking-news-analysis.md</code></a></p>

### Executive Summary

| Metric | Value | Trend |
|--------|-------|-------|
| **Assessment Date** | 2026-03-31 (Tuesday) | — |
| **Breaking News Significance** | None — No plenary activity today | down |
| **Last Plenary Session** | 2026-03-26 (Brussels) | — |
| **Next Expected Session** | April 2026 (TBD) | — |
| **Feed Data Availability** | Partial (3/8 feeds returned data) | declining |
| **Overall Risk Level** | MEDIUM | stable |
| **Parliamentary Stability** | 84/100 | stable |

#### Key Finding

**No breaking news significance detected for 2026-03-31.** The European Parliament is in an inter-sessional period between the Brussels mini-plenary of March 25-26 and the next scheduled session. The adopted texts feed returned 34 items updated in the portal today, but all adoption dates are from earlier sessions (most recent: March 26, 2026). The events and procedures feeds returned 404 errors, and several advisory feeds timed out, consistent with low parliamentary activity during inter-sessional periods.

---

### Data Collection Summary

#### Feed Endpoint Results

| Feed Endpoint | Timeframe | Status | Items | Notes |
|--------------|-----------|--------|-------|-------|
| get_adopted_texts_feed | today | Success | 34 | All adoption dates at or before 2026-03-26 |
| get_events_feed | today then one-week | 404 | 0 | Both timeframes returned 404 |
| get_procedures_feed | today then one-week | 404 | 0 | Both timeframes returned 404 |
| get_meps_feed | today | Success | 737 | Full MEP roster returned |
| get_documents_feed | one-week | Timeout | 0 | 120s timeout exceeded |
| get_plenary_documents_feed | one-week | Timeout | 0 | 120s timeout exceeded |
| get_committee_documents_feed | one-week | Timeout | 0 | 120s timeout exceeded |
| get_parliamentary_questions_feed | one-week | 404 | 0 | 404 Not Found |

#### Analytical Context Results

| Tool | Status | Key Finding |
|------|--------|-------------|
| detect_voting_anomalies | Success | 0 anomalies detected; group stability score: 100; risk level: LOW |
| analyze_coalition_dynamics | Success | Fragmentation index: 4.04; dominant coalition: Renew+ECR (cohesion: 0.95) |
| generate_political_landscape | Success | 8 groups; PPE dominant (38%); majority requires multi-coalition |
| early_warning_system | Success | Risk: MEDIUM; stability: 84/100; 1 HIGH warning (PPE dominance) |

---

### Political Landscape Analysis

#### Current Parliament Composition (EP10)

| Group | Members | Seat Share | Role | Trend |
|-------|---------|-----------|------|-------|
| **PPE** | 38 | 38% | Dominant centre-right | Stable |
| **S&D** | 22 | 22% | Main opposition | Stable |
| **PfE** | 11 | 11% | Right-wing bloc | Growing |
| **Verts/ALE** | 10 | 10% | Green/progressive | Stable |
| **ECR** | 8 | 8% | Conservative | Stable |
| **Renew** | 5 | 5% | Liberal centre | Declining |
| **NI** | 4 | 4% | Non-attached | Stable |
| **The Left** | 2 | 2% | Far left | Declining |

#### Power Dynamics

- **Majority threshold**: 51 seats (out of 100 sampled)
- **Grand coalition (PPE+S&D)**: 60 seats — viable
- **Progressive bloc (S&D+Verts/ALE+Renew+Left)**: 39 seats — insufficient alone
- **Conservative bloc (PPE+ECR+PfE)**: 57 seats — viable
- **Fragmentation index**: HIGH (4.04 effective parties)
- **Multi-coalition required**: Yes — no single group can govern alone

#### Early Warning Signals

| Warning | Severity | Description | Recommended Action |
|---------|----------|-------------|-------------------|
| High Fragmentation | MEDIUM | 8 political groups increase coalition complexity | Monitor cross-group voting patterns |
| PPE Dominance Risk | HIGH | PPE is 19x larger than smallest group | Track minority coalition formation |
| Small Group Quorum | LOW | Renew, NI, The Left may struggle with quorum | Monitor participation rates |

---

### Recent Legislative Output Analysis (March 2026)

#### March 25-26 Brussels Mini-Plenary Highlights

The most recent plenary session (March 25-26 in Brussels) adopted significant legislation across multiple policy domains:

##### Banking and Financial Reform Package
- **TA-10-2026-0090** — DGSD2: Deposit guarantee scheme reform (adopted 2026-03-26) — Confidence: High
- **TA-10-2026-0091** — BRRD3: Bank recovery and resolution directive (adopted 2026-03-26) — Confidence: High
- **TA-10-2026-0092** — SRMR3: Single resolution mechanism regulation (adopted 2026-03-26) — Confidence: High

**Significance**: HIGH — Comprehensive banking reform package completing the Banking Union. These three interconnected texts address deposit protection, bank recovery, and resolution funding.

**Stakeholder Impact**:
- *EU Citizens*: Enhanced deposit protection and financial stability safeguards — Positive (high)
- *Industry and Business*: New compliance requirements for banks, but clearer resolution framework — Mixed (medium)
- *National Governments*: Harmonized rules reduce regulatory arbitrage between member states — Positive (medium)

##### Trade and Tariffs
- **TA-10-2026-0096** — Adjustment of customs duties for US imports (adopted 2026-03-26) — Confidence: High
- **TA-10-2026-0097** — Non-application of customs duties on certain goods (adopted 2026-03-26) — Confidence: High
- **TA-10-2026-0101** — EU-China tariff rate quota modification (adopted 2026-03-26) — Confidence: Medium

**Significance**: HIGH — Trade policy adjustments vis-a-vis both US and China signal EU active trade positioning amid geopolitical tensions.

**Stakeholder Impact**:
- *Industry and Business*: Direct impact on import costs, competitiveness, and supply chains — Mixed (high)
- *EU Citizens*: Potential consumer price effects from tariff adjustments — Negative (medium)
- *National Governments*: Divergent national interests on trade policy — Mixed (high)

##### Anti-Corruption and Rule of Law
- **TA-10-2026-0094** — Combating corruption (adopted 2026-03-26) — Confidence: High
- **TA-10-2026-0088** — Immunity waiver: Grzegorz Braun (adopted 2026-03-26) — Confidence: High
- **TA-10-2026-0089** — Immunity waiver: Nikos Pappas (adopted 2026-03-26) — Confidence: High

**Significance**: MEDIUM — Anti-corruption directive combined with two immunity waivers demonstrates Parliament commitment to rule of law.

##### Digital and AI Regulation
- **TA-10-2026-0098** — Digital Omnibus on AI: Simplification of AI regulation (adopted 2026-03-26) — Confidence: High

**Significance**: MEDIUM — Simplification of the landmark AI Act implementation shows pragmatic regulatory approach.

##### Environmental Protection
- **TA-10-2026-0093** — Surface water and groundwater pollutants (adopted 2026-03-26) — Confidence: High

**Significance**: MEDIUM — Updated environmental standards for water quality protection.

##### International Affairs and Foreign Policy
- **TA-10-2026-0100** — EU-Lebanon scientific cooperation (adopted 2026-03-26) — Confidence: High
- **TA-10-2026-0104** — Global Gateway strategy review (adopted 2026-03-26) — Confidence: Medium
- **TA-10-2026-0099** — UN Convention on judicial sales of ships (adopted 2026-03-26) — Confidence: High

---

### Cross-Domain Policy Linkages

The Q1 2026 legislative output reveals interconnected policy clusters:

1. **Financial Stability to Trade**: Banking reform (DGSD2/BRRD3/SRMR3) strengthens EU financial resilience at a time of trade policy recalibration with US and China
2. **Digital to Environment**: AI regulation simplification occurs alongside environmental protection updates, reflecting the twin transition agenda
3. **Rule of Law to Defence**: Anti-corruption framework complements the defence integration push — clean governance enables credible security partnerships
4. **Social to Economic**: Housing crisis resolution, gender pay gap, and just transition texts form a coherent social fairness agenda alongside economic competitiveness measures

---

### SWOT Analysis: EP10 Q1 2026 Legislative Period

#### Strengths
- Productive legislative output: 104 adopted texts in Q1 2026 across diverse policy domains
- Banking Union completion: Comprehensive reform package (DGSD2+BRRD3+SRMR3) demonstrates capacity for complex multi-file legislation
- Grand coalition viable: PPE+S&D hold 60% of seats, enabling majority formation
- Active trade policy: Simultaneous US, China, and Mercosur trade adjustments show strategic agility

#### Weaknesses
- High fragmentation: 8 political groups (effective parties: 4.04) complicate consensus-building
- PPE dominance: 19x size disparity between largest and smallest group risks marginalizing small parties
- Data transparency gaps: Voting statistics unavailable from EP API, limiting accountability metrics
- Inter-sessional gaps: Extended periods without plenary activity reduce legislative momentum

#### Opportunities
- AI regulatory leadership: Digital Omnibus shows EU ability to iterate on landmark regulation pragmatically
- Global Gateway expansion: Strategy review may strengthen EU geopolitical positioning
- Defence integration: Multiple defence texts signal momentum toward European defence capability
- Anti-corruption framework: New directive could strengthen institutional integrity across EU

#### Threats
- Trade tensions: Simultaneous tariff adjustments with US and China carry economic risks
- Coalition instability: Small group quorum risks (Renew, NI, The Left below 5% threshold)
- Implementation burden: Multiple new directives across banking, environment, and digital sectors strain transposition capacity
- Geopolitical pressure: Ukraine support, Iran, Georgia situations demand sustained parliamentary attention

---

### Forward-Looking Scenarios

#### Scenario 1: Consolidated Legislative Momentum (Likely — 65%)
The April plenary session continues the productive pace, with focus on implementing Q1 decisions. The banking reform package moves through Council trilogue efficiently. PPE-S&D grand coalition holds for key votes. Trade policy adjustments are implemented without major disruption.

#### Scenario 2: Fragmentation Friction (Possible — 25%)
Growing tensions between PPE and smaller groups over the defence budget and AI implementation details lead to vote delays. The Renew group declining seat share weakens the liberal centre, making centrist majorities harder to form. Some Q1 legislation faces implementation challenges.

#### Scenario 3: External Shock Disruption (Unlikely — 10%)
A major geopolitical event (escalation in Ukraine, trade war escalation with US, or institutional crisis) forces emergency plenary sessions and reshuffles legislative priorities. The banking reform package is delayed as Parliament pivots to crisis response.

---

### Assessment: No Breaking News for 2026-03-31

**Determination**: After comprehensive data collection and analysis, no items qualify as breaking news for March 31, 2026.

**Reasoning**:
1. No plenary session scheduled for today (inter-sessional period)
2. All adopted texts in the feed have adoption dates of March 26 or earlier
3. Events and procedures feeds returned 404 (no new events/procedures)
4. MEP feed returned full roster, not today-specific updates
5. No voting anomalies detected; parliamentary stability score at 84/100

**Data preserved for**: Pattern analysis across inter-sessional periods, baseline comparison for next session, feed availability monitoring.

**Next expected parliamentary activity**: April 2026 plenary sessions (dates TBD from EP calendar).

---

*Analysis generated by EU Parliament Monitor AI Pipeline | Data source: European Parliament Open Data Portal (data.europarl.europa.eu) | Methodology: CIA Coalition Analysis, OSINT framework, multi-stakeholder assessment*

### Political Landscape Context

<p class="artifact-source"><a href="https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/daily/2026-03-31/breaking/political-landscape-context.md" rel="noopener">View source: <code>political-landscape-context.md</code></a></p>

### Current Political Group Composition

The 10th European Parliament (EP10, 2024-2029) comprises 720 MEPs from 27 EU member states organized into 8 political groups. The current sample from EP API reveals:

| Rank | Group | Full Name | Members | Seat Share | Political Position |
|------|-------|-----------|---------|-----------|-------------------|
| 1 | PPE | European People's Party | 38 | 38% | Centre-right |
| 2 | S&D | Progressive Alliance of Socialists and Democrats | 22 | 22% | Centre-left |
| 3 | PfE | Patriots for Europe | 11 | 11% | Right-wing populist |
| 4 | Verts/ALE | Greens/European Free Alliance | 10 | 10% | Green/regionalist |
| 5 | ECR | European Conservatives and Reformists | 8 | 8% | Conservative |
| 6 | Renew | Renew Europe | 5 | 5% | Liberal |
| 7 | NI | Non-Inscrits | 4 | 4% | Non-attached |
| 8 | The Left | The Left in the EP | 2 | 2% | Far left |

**Note**: The above counts reflect a 100-MEP sample from the EP API. Full Parliament has 720 MEPs. Proportions are indicative.

---

### Coalition Viability Analysis

#### Viable Coalition Configurations

| Coalition | Groups | Seats | Above Majority | Assessment |
|-----------|--------|-------|---------------|------------|
| Grand Coalition | PPE + S&D | 60 | Yes (+9) | Traditional majority — viable but ideologically diverse |
| Centre-Right | PPE + ECR + PfE | 57 | Yes (+6) | Conservative majority — ideologically closer but PfE controversial |
| Broad Centre | PPE + S&D + Renew | 65 | Yes (+14) | Comfortable majority — traditional pro-European core |
| Progressive | S&D + Verts/ALE + Renew + Left | 39 | No (-12) | Insufficient — cannot form majority without PPE |

#### Coalition Dynamics from MCP Data

The coalition dynamics analysis reveals:
- **Strongest alliance signal**: Renew-ECR (cohesion: 0.95, strengthening)
- **Secondary alliances**: The Left-NI (0.65, strengthening), S&D-ECR (0.60, stable)
- **Weakening pairs**: All pairs involving EPP show 0.0 cohesion (data limitation — EPP member count returned as 0 in some API responses)
- **Parliamentary fragmentation**: 4.04 effective parties (high fragmentation)

**Data confidence**: LOW — Per-MEP voting statistics are not available from the EP API. Coalition pair cohesion is derived from group size ratios only.

---

### March 2026 Session Review

#### Strasbourg Session (March 9-12, 2026)

The first March session in Strasbourg covered a wide legislative agenda:

**Key Legislative Acts:**
- EU Talent Pool regulation (TA-10-2026-0058) — Labour mobility
- ECB Vice-President appointment (TA-10-2026-0060) — Institutional
- EBA Chairperson appointment (TA-10-2026-0061) — Financial regulation
- European Chief Prosecutor appointment (TA-10-2026-0062) — Rule of law
- Copyright and generative AI (TA-10-2026-0066) — Digital policy
- Housing crisis resolution (TA-10-2026-0064) — Social policy
- EU-Canada cooperation (TA-10-2026-0078) — Foreign affairs
- EU enlargement strategy (TA-10-2026-0077) — Institutional expansion
- Defence market barriers (TA-10-2026-0079) — Security/defence
- Flagship defence projects (TA-10-2026-0080) — Security/defence

**Policy themes**: Institutional appointments, digital governance, social policy, defence integration, foreign affairs

#### Brussels Mini-Plenary (March 25-26, 2026)

The second March session in Brussels focused on financial, trade, and governance reforms:

**Key Legislative Acts:**
- Banking reform trilogy: DGSD2 (TA-10-2026-0090), BRRD3 (TA-10-2026-0091), SRMR3 (TA-10-2026-0092) — Financial stability
- Combating corruption directive (TA-10-2026-0094) — Rule of law
- US customs duties adjustment (TA-10-2026-0096) — Trade
- Digital Omnibus on AI (TA-10-2026-0098) — Digital regulation
- EU-China tariff quotas (TA-10-2026-0101) — Trade
- Global Gateway review (TA-10-2026-0104) — Foreign affairs
- Surface water pollutants (TA-10-2026-0093) — Environment

**Policy themes**: Financial reform, trade policy recalibration, anti-corruption, AI regulation simplification

---

### Early Warning Assessment

#### Active Warnings (as of 2026-03-31)

1. **PPE Dominance Risk** (HIGH severity)
   - PPE holds 38% of seats, 19x larger than the smallest group
   - Risk: Potential for dominant group to set agenda without meaningful opposition input
   - Mitigant: Grand coalition requirement means S&D has veto power on key votes
   - Monitoring: Track PPE unilateral proposals and opposition group responses

2. **High Parliamentary Fragmentation** (MEDIUM severity)
   - 8 political groups with effective number of parties at 4.04
   - Risk: Coalition formation more complex, legislative gridlock possible
   - Mitigant: Grand coalition viable (60% of seats)
   - Monitoring: Watch for coalition breakdowns on contentious votes

3. **Small Group Quorum Risk** (LOW severity)
   - Renew (5 members), NI (4), The Left (2) may struggle with quorum
   - Risk: Under-representation of liberal, non-attached, and far-left positions
   - Mitigant: Groups can coordinate with larger allies for specific votes
   - Monitoring: Track attendance rates for small groups

#### Stability Indicators

| Indicator | Direction | Confidence | Description |
|-----------|-----------|-----------|-------------|
| Parliamentary fragmentation | Neutral | 70% | Moderate fragmentation at 4.4 effective parties |
| Grand coalition viability | Positive | 65% | Top-2 groups hold 60% of seats |
| Minority representation | Positive | 60% | 6% of MEPs in minority groups — healthy distribution |

**Overall stability score**: 84/100 (STABLE)
**Overall risk level**: MEDIUM
**Key risk factor**: Dominant group risk (PPE)

---

### Inter-Sessional Period Analysis

#### Pattern: March-April Transition

The current inter-sessional gap (March 27 - early April) is typical for the EP calendar. Key observations:

1. **Legislative backlog**: 20+ adopted texts from March 26 are now entering the Council review and trilogue phase
2. **Committee work continues**: Even without plenary sessions, committee meetings may be occurring (committee document feeds timed out)
3. **Feed availability degrades**: During inter-sessional periods, several EP API feed endpoints return 404 or timeout, suggesting reduced portal activity
4. **Next session preparation**: National delegations and political groups are likely preparing positions for April agenda items

#### Implications for April Session

The substantial legislative output from March (two major session weeks) creates several implications:
- Council must respond to banking reform trilogy (DGSD2/BRRD3/SRMR3) — potential for trilogue negotiations
- Trade policy adjustments (US, China) may generate external reactions requiring parliamentary follow-up
- Anti-corruption directive implementation details will be debated in committee
- AI regulation simplification may face pushback from civil society groups in committee hearings

---

*Analysis generated by EU Parliament Monitor AI Pipeline | Data source: European Parliament Open Data Portal (data.europarl.europa.eu)*

<h2 id="aggregator-tradecraft-references">Tradecraft References</h2>

This article is produced under the [Hack23 AB](https://hack23.com) intelligence tradecraft library. Every methodology and artifact template applied to this run is linked below.

### Methodologies

- [README](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/README.md)
- [Ai Driven Analysis Guide](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/ai-driven-analysis-guide.md)
- [Artifact Catalog](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/artifact-catalog.md)
- [Electoral Domain Methodology](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/electoral-domain-methodology.md)
- [Imf Indicator Mapping](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/imf-indicator-mapping.md)
- [Osint Tradecraft Standards](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/osint-tradecraft-standards.md)
- [Per Artifact Methodologies](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/per-artifact-methodologies.md)
- [Per Document Methodology](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/per-document-methodology.md)
- [Political Classification Guide](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/political-classification-guide.md)
- [Political Risk Methodology](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/political-risk-methodology.md)
- [Political Style Guide](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/political-style-guide.md)
- [Political Swot Framework](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/political-swot-framework.md)
- [Political Threat Framework](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/political-threat-framework.md)
- [Strategic Extensions Methodology](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/strategic-extensions-methodology.md)
- [Structural Metadata Methodology](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/structural-metadata-methodology.md)
- [Synthesis Methodology](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/synthesis-methodology.md)
- [Worldbank Indicator Mapping](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/worldbank-indicator-mapping.md)

### Artifact templates

- [README](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/README.md)
- [Actor Mapping](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/actor-mapping.md)
- [Actor Threat Profiles](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/actor-threat-profiles.md)
- [Analysis Index](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/analysis-index.md)
- [Coalition Dynamics](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/coalition-dynamics.md)
- [Coalition Mathematics](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/coalition-mathematics.md)
- [Comparative International](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/comparative-international.md)
- [Consequence Trees](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/consequence-trees.md)
- [Cross Reference Map](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/cross-reference-map.md)
- [Cross Run Diff](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/cross-run-diff.md)
- [Cross Session Intelligence](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/cross-session-intelligence.md)
- [Data Download Manifest](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/data-download-manifest.md)
- [Deep Analysis](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/deep-analysis.md)
- [Devils Advocate Analysis](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/devils-advocate-analysis.md)
- [Economic Context](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/economic-context.md)
- [Executive Brief](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/executive-brief.md)
- [Forces Analysis](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/forces-analysis.md)
- [Forward Indicators](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/forward-indicators.md)
- [Historical Baseline](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/historical-baseline.md)
- [Historical Parallels](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/historical-parallels.md)
- [Imf Vintage Audit](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/imf-vintage-audit.md)
- [Impact Matrix](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/impact-matrix.md)
- [Implementation Feasibility](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/implementation-feasibility.md)
- [Intelligence Assessment](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/intelligence-assessment.md)
- [Legislative Disruption](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/legislative-disruption.md)
- [Legislative Velocity Risk](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/legislative-velocity-risk.md)
- [Mcp Reliability Audit](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/mcp-reliability-audit.md)
- [Media Framing Analysis](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/media-framing-analysis.md)
- [Methodology Reflection](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/methodology-reflection.md)
- [Per File Political Intelligence](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/per-file-political-intelligence.md)
- [Pestle Analysis](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/pestle-analysis.md)
- [Political Capital Risk](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/political-capital-risk.md)
- [Political Classification](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/political-classification.md)
- [Political Threat Landscape](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/political-threat-landscape.md)
- [Quantitative Swot](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/quantitative-swot.md)
- [Reference Analysis Quality](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/reference-analysis-quality.md)
- [Risk Assessment](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/risk-assessment.md)
- [Risk Matrix](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/risk-matrix.md)
- [Scenario Forecast](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/scenario-forecast.md)
- [Session Baseline](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/session-baseline.md)
- [Significance Classification](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/significance-classification.md)
- [Significance Scoring](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/significance-scoring.md)
- [Stakeholder Impact](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/stakeholder-impact.md)
- [Stakeholder Map](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/stakeholder-map.md)
- [Swot Analysis](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/swot-analysis.md)
- [Synthesis Summary](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/synthesis-summary.md)
- [Threat Analysis](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/threat-analysis.md)
- [Threat Model](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/threat-model.md)
- [Voter Segmentation](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/voter-segmentation.md)
- [Voting Patterns](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/voting-patterns.md)
- [Wildcards Blackswans](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/wildcards-blackswans.md)
- [Workflow Audit](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/workflow-audit.md)

<h2 id="aggregator-analysis-index">Analysis Index</h2>

Every artifact below was read by the aggregator and contributed to this article. The raw [manifest.json](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/daily/2026-03-31/breaking/manifest.json) carries the full machine-readable list, including gate-result history.

| Section | Artifact | Path |
|---|---|---|
| section-supplementary-intelligence | [breaking-news-analysis](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/daily/2026-03-31/breaking/breaking-news-analysis.md) | `breaking-news-analysis.md` |
| section-supplementary-intelligence | [political-landscape-context](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/daily/2026-03-31/breaking/political-landscape-context.md) | `political-landscape-context.md` |

