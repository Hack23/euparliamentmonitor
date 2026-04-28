<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">⚠️ Political Risk Assessment Methodology — European Parliament</h1>

<p align="center">
  <strong>📊 Likelihood × Impact Scoring for EU Parliamentary Risk</strong><br>
  <em>🎯 Coalition · Policy · Budget · Institutional · Geopolitical Risk Quantification</em>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 2.3 | **📅 Last Updated:** 2026-04-25 (UTC)
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-07-31
**🏢 Owner:** Hack23 AB (Org.nr 5595347807) | **🏷️ Classification:** Public

---

## 🎯 Purpose

This methodology provides the authoritative framework for political risk assessment in EU Parliament Monitor's analytical workflows. It adapts the quantitative Likelihood × Impact approach from [Hack23 ISMS Risk_Assessment_Methodology.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Risk_Assessment_Methodology.md) to the dynamics of the European Parliament.

---

## 📐 Core Methodology: Likelihood × Impact

All political risks are scored using a **5×5 matrix**. Risk Score = Likelihood × Impact.

### Likelihood Scale (1–5)

| Score | Label | Definition | EP Parliamentary Analogy |
|:-----:|-------|------------|------------------------|
| 1 | **Rare** | <5% probability | Grand coalition collapse with 400+ seat combined majority |
| 2 | **Unlikely** | 5–20% probability | Budget vote fails despite EPP-S&D agreement |
| 3 | **Possible** | 21–40% probability | ECR defects on single non-budget vote |
| 4 | **Likely** | 41–70% probability | Political group files resolution of censure when polls shift |
| 5 | **Almost Certain** | >70% probability | Commission proposes annual work programme in October |

### Impact Scale (1–5)

| Score | Label | Definition | EP Political Example |
|:-----:|-------|------------|---------------------|
| 1 | **Negligible** | Routine disruption | Minor committee delay |
| 2 | **Minor** | Moderate disruption | Single legislative report rejected; rapporteur reassigned |
| 3 | **Moderate** | Significant disruption | Major trilogue amendment forced by Parliament |
| 4 | **Major** | Severe disruption | Commissioner forced to withdraw; interinstitutional crisis |
| 5 | **Severe** | Institutional crisis | Motion of censure succeeds; Commission falls |

### Risk Matrix

| Score | Tier | Colour | Action |
|:-----:|------|--------|--------|
| 1–4 | **Low** | 🟢 | Monitor; mention in weekly digest |
| 5–9 | **Medium** | 🟡 | Active monitoring; flag in daily analysis |
| 10–14 | **High** | 🟠 | Priority assessment; include in news articles |
| 15–25 | **Critical** | 🔴 | Immediate analysis; breaking news consideration |

---

## 🏛️ Six EP Political Risk Categories

| Category | Failure Mode | Key Indicators |
|----------|-------------|---------------|
| **grand-coalition-stability** | EPP-S&D-Renew majority fracture | Voting cohesion scores, roll-call defections, group switching |
| **policy-implementation** | Legislative file stalls or fails | Trilogue breakdowns, committee rejections, Council blocking |
| **institutional-integrity** | EU democratic norm erosion | Article 7, Rule of Law Conditionality, EP-Council conflicts |
| **economic-governance** | EU fiscal framework stress | MFF disputes, NextGenEU, Stability Pact breaches |
| **social-cohesion** | Societal division across member states | East-West/North-South splits, migration, energy policy |
| **geopolitical-standing** | EU external position weakening | Trade disputes, sanctions disagreements, NATO-EU coordination |

---

## 📊 Risk Scoring

Political risks in this methodology are **only** scored using the 1–25 **Likelihood × Impact** matrix defined above.

All dashboards, templates, and analyses MUST use:
- The 1–5 Likelihood scale
- The 1–5 Impact scale
- The resulting 1–25 Risk Score with the Low/Medium/High/Critical bands in the Risk Matrix table

No alternative 0–100 scaling or separate threshold system is used in this methodology.

---

## 🤝 Grand Coalition Stability Risk

The grand coalition (EPP + S&D + Renew) holds ~400 of 720 seats. Its stability is the most politically distinctive risk type.

### Stability Factors

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
flowchart TD
    A[Grand Coalition Stability] --> B[Seat Arithmetic]
    A --> C[Policy Cohesion]
    A --> D[Electoral Pressure]
    A --> E[External Constraints]

    B --> B1[Formal majority: ≥361 of 720]
    B --> B2[Cordon sanitaire reliability]
    B --> B3[MEP group switching]

    C --> C1[Legislative agreement rate]
    C --> C2[Green Deal / migration splits]
    C --> C3[Internal group tensions]

    D --> D1[National election spillovers]
    D --> D2[Eurobarometer trends]
    D --> D3[Far-right group growth]

    E --> E1[EU-Ukraine policy]
    E --> E2[Trade policy consensus]
    E --> E3[Climate target compliance]
```

---

## 📊 Calibration Examples

| Scenario | Likelihood | Impact | Score | Tier | Rationale |
|----------|:----------:|:------:|:-----:|------|-----------|
| ECR conditionally supports von der Leyen initiative | 4 | 4 | 16 | 🔴 Critical | Frequent pattern; major governance impact |
| Renew exits grand coalition over migration | 2 | 5 | 10 | 🟠 High | Historically rare; would fracture majority |
| Minor committee report delayed | 1 | 1 | 1 | 🟢 Low | Routine; no political consequence |
| Plenary adopts resolution with expected margin | 4 | 1 | 4 | 🟢 Low | Likely but low-impact routine event |
| Motion of censure against Commission | 1 | 5 | 5 | 🟡 Medium | Very rare; catastrophic if passed |
| New Commission proposal on AI regulation | 4 | 3 | 12 | 🟠 High | Likely publication; major policy implications |
| Article 7 proceedings escalation | 2 | 5 | 10 | 🟠 High | Unlikely but severe institutional impact |

---

## 🔍 MCP Data Sources for Risk Assessment

| Risk Category | Primary MCP Tools | Query Strategy |
|--------------|-------------------|---------------|
| Grand coalition stability | `analyze_voting_patterns`, `analyze_coalition_dynamics` | Track EPP-S&D-Renew voting cohesion |
| Policy implementation | `get_procedures`, `track_legislation` | Monitor trilogue progress, committee votes |
| Institutional integrity | `detect_voting_anomalies`, `get_parliamentary_questions` | Track Article 7 references, rule of law |
| Economic governance | `get_adopted_texts`, IMF data (primary — WEO/FM/GFS), World Bank WGI (governance only) | MFF implementation, economic indicators |
| Social cohesion | `get_speeches`, `get_voting_records` | East-West vote splits, migration debates |
| Geopolitical standing | `get_plenary_documents`, `search_documents` | Foreign affairs resolutions, trade votes |

---

## 🤖 AI Analysis Protocol for Risk Assessment

The AI agent **MUST** follow this protocol when performing risk assessment:

1. **Read this methodology** — understand the 5×5 matrix, calibration examples, and EU-specific factors
2. **Query EP MCP tools** for evidence:
   - `analyze_coalition_dynamics` — current grand coalition cohesion
   - `get_voting_records` + `analyze_voting_patterns` — recent vote margins and group alignment
   - `track_legislation` — legislative pipeline bottlenecks
   - `get_parliamentary_questions` — oversight activity patterns
   - IMF data (primary) — economic context for budget and electoral risk; World Bank (non-economic governance / demographics / social)
3. **Score each risk dimension** using the 5×5 matrix with evidence citations
4. **Apply calibration** — compare against the calibration examples above
5. **Assign overall risk level** — weighted: Grand Coalition 0.30, Policy 0.25, Budget 0.20, Electoral 0.15, External 0.10
6. **Integrate with threat analysis** — risk scores ≥10 should trigger multi-framework threat assessment per [political-threat-framework.md](political-threat-framework.md)

### Risk-to-SWOT Integration

Risk assessment results feed directly into SWOT analysis:
- **Risk Score ≥ 15 (Critical)** → SWOT Threat entry (HIGH confidence, HIGH impact)
- **Risk Score 10–14 (High)** → SWOT Threat or Weakness entry (MEDIUM+ confidence)
- **Risk Score 5–9 (Medium)** → SWOT Weakness or Threat entry (flag for monitoring)
- **Risk Score 1–4 (Low)** → Informational only; no SWOT entry required

> **🚨 Anti-Pattern Warning:** Generic risk statements like "medium risk" without specific scores, evidence, or calibration examples are REJECTED. Every risk must have a Likelihood × Impact score with cited evidence.

---

## 🔗 Advanced Technique 1: Cascading Risk Analysis

Political risks rarely occur in isolation. A **cascading risk chain** models how one risk event triggers subsequent risks:

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
flowchart TD
    R1["⚠️ TRIGGER RISK:<br/>ECR demands migration<br/>policy concession<br/>L=4, I=3, Score=12 🟠"]
    R1 --> R2["⚠️ SECOND-ORDER:<br/>EPP refuses; Grand Coalition<br/>tension rises<br/>L=3, I=4, Score=12 🟠"]
    R2 --> R3A["⚠️ BRANCH A:<br/>ECR tables no-confidence<br/>motion against Commissioner<br/>L=2, I=5, Score=10 🟠"]
    R2 --> R3B["⚠️ BRANCH B:<br/>EPP compromises;<br/>S&D loses face<br/>L=3, I=3, Score=9 🟡"]
    R3A --> R4A["🔴 CASCADING CRISIS:<br/>Commission reshuffled<br/>L=2, I=5, Score=10 🟠"]
    R3B --> R4B["🟡 MANAGED STRESS:<br/>Internal S&D dissent<br/>L=3, I=2, Score=6 🟡"]

    style R1 fill:#fd7e14,color:#fff
    style R2 fill:#fd7e14,color:#fff
    style R3A fill:#dc3545,color:#fff
    style R3B fill:#ffc107,color:#000
    style R4A fill:#dc3545,color:#fff
    style R4B fill:#ffc107,color:#000
```

### Cascading Risk Construction Protocol

1. **Identify trigger risk** — the initial event that starts the chain
2. **Map first-order consequences** — what happens immediately if the trigger occurs?
3. **Map second-order consequences** — what happens as a result of the first-order effects?
4. **Identify branching points** — where does the chain split into alternative paths?
5. **Score each node** independently using the 5×5 matrix
6. **Assess cumulative chain risk** — compare alternative paths using the node Likelihood × Impact scores and qualitative judgement; do not multiply the 1–5 Likelihood scores as if they were precise probabilities
7. **Identify circuit breakers** — what intervention could stop the chain at each stage?

### Cascading Risk Table Template

| Chain Stage | Risk Event | Likelihood | Impact | Score | Circuit Breaker |
|:-----------:|-----------|:----------:|:------:|:-----:|----------------|
| Trigger | `[Initial event]` | `[1-5]` | `[1-5]` | `[L×I]` | `[What stops it here?]` |
| 1st Order | `[Immediate consequence]` | `[1-5]` | `[1-5]` | `[L×I]` | `[Intervention point]` |
| 2nd Order | `[Follow-on effect]` | `[1-5]` | `[1-5]` | `[L×I]` | `[Intervention point]` |
| Terminal | `[Final outcome]` | `[1-5]` | `[1-5]` | `[L×I]` | `[Recovery action]` |

---

## 📊 Advanced Technique 2: Bayesian Updating for Risk Scores

Political risk scores should be **updated** as new evidence arrives, not just recalculated from scratch. Bayesian updating provides a disciplined framework:

### Update Protocol

| Step | Action | Example |
|:----:|--------|---------|
| 1 | **Start with prior** — the current risk score based on existing evidence | "Grand Coalition collapse risk: L=2, I=5, Score=10 (prior)" |
| 2 | **New evidence arrives** — an MCP-observable event changes the picture | "ECR publicly demands migration concession (MCP: adopted text AT-2026-0123)" |
| 3 | **Assess evidence strength** — how much should this shift the score? | Strong evidence (official EP resolution) → adjust by +1 on likelihood |
| 4 | **Update score** — adjust likelihood and/or impact based on evidence | "Grand Coalition collapse risk: L=3, I=5, Score=15 (posterior)" |
| 5 | **Document the update** — record prior, evidence, and posterior | "Prior 10 → Evidence: ECR adopted text → Posterior 15 (+5)" |

### Evidence Strength Table

| Evidence Type | Likelihood Adjustment | Example |
|-------------|:---------------------:|---------|
| Official EP adopted text / roll-call vote result | ±1 to ±2 | Roll-call vote passes/fails |
| Named MEP or political group public statement | ±1 | EPP group leader demands concession |
| Verified media report with named sources | ±1 | Politico reports trilogue stalled |
| Single unnamed source | ±1 | "Sources say Commissioner may resign" |
| Statistical data (Eurostat, IMF primary, World Bank non-economic) | ±1 | GDP growth data, unemployment change |

---

## 📈 Advanced Technique 2b: Risk Trajectory Tracking — New in v2.2

Risk scores are not static snapshots — they must be tracked over time to reveal whether political risks are **rising, stable, or declining**. This trajectory context is as important as the current score. Every risk assessment MUST include a trajectory assessment aligned with the trajectory arrows (↑/→/↓) already present in synthesis summaries.

### Risk Trajectory Definitions

| Trajectory | Symbol | Definition | EP Parliamentary Indicator |
|:----------:|:------:|------------|---------------------------|
| **Rising** | ↑ | Score increased ≥3 points in the past 14 days, OR confidence upgraded while score held | Coalition cohesion declining across consecutive sessions |
| **Stable** | → | Score fluctuated <3 points in the past 14 days | No major new vote evidence; situation holding |
| **Declining** | ↓ | Score decreased ≥3 points in the past 14 days, OR confidence downgraded | Cross-party agreement reached; trilogue advancing |
| **Accelerating** | ↑↑ | Score increased ≥5 points in the past 7 days | Imminent vote; coalition fracture signal detected |
| **Spike** | ⚡ | Score exceeded CRITICAL (≥15) threshold within 24 hours | Emergency session called; censure motion tabled |

### Trajectory Tracking Table

Each risk assessment MUST include this trajectory table to align with synthesis-summary.md output:

| Risk Category | Prior Score (date) | Current Score | Trajectory | Key Driver of Change |
|:------------:|:-----------------:|:-------------:|:----------:|----------------------|
| Grand Coalition Stability | `[score] ([date])` | `[score]` | `[↑/→/↓/↑↑/⚡]` | `[REQUIRED: cite evidence — EP doc or MCP data point]` |
| Policy Implementation | `[score] ([date])` | `[score]` | `[↑/→/↓]` | `[REQUIRED]` |
| Budget / MFF | `[score] ([date])` | `[score]` | `[↑/→/↓]` | `[REQUIRED]` |
| Institutional Integrity | `[score] ([date])` | `[score]` | `[↑/→/↓]` | `[REQUIRED]` |
| Social Cohesion | `[score] ([date])` | `[score]` | `[↑/→/↓]` | `[REQUIRED]` |
| Geopolitical Standing | `[score] ([date])` | `[score]` | `[↑/→/↓]` | `[REQUIRED]` |

### Trajectory Mermaid Chart

Include the following trend chart when multiple sessions are available. Replace `[X]` placeholders with actual trajectory scores (comma-separated as labels + data):

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
xychart-beta
    title "Grand Coalition Stability Risk — 4-Week Trend"
    x-axis ["Week -4", "Week -3", "Week -2", "Week -1", "Current"]
    y-axis "Risk Score (L×I)" 0 --> 25
    line [6, 8, 10, 9, 12]
```

> ⚠️ AI Agent: Replace the data array `[6, 8, 10, 9, 12]` with actual risk scores from prior synthesis summaries. If fewer than 5 data points are available, use what is available and note the gap.

### Good vs. Bad — Risk Trajectory Assessment

**❌ BAD (no trajectory):**
```markdown
Grand Coalition stability risk: L=3, I=4, Score=12 (🟠 HIGH).
```

**✅ GOOD (trajectory-anchored):**
```markdown
Grand Coalition stability risk: L=3, I=4, Score=12 (🟠 HIGH) ↑ **Rising** — score
increased from 6 (🟡 MEDIUM) three weeks ago (SYN-2026-03-22-A1B2) to current 12.
Key driver: EPP cohesion dropped from 72% to 61% over the same period
(`analyze_coalition_dynamics`, coalition=Grand Coalition, focus=EPP cohesion, 2026-03-01 to
2026-04-06). If this trajectory continues, the score may reach CRITICAL (≥15) by the
April 22 plenary session.
```

### Trajectory Integration with Synthesis Summaries

The `↑/→/↓` trajectory symbols in the **Risk Landscape Summary** table of `synthesis-summary.md` are populated directly from this trajectory tracking table. Because `synthesis-summary.md` supports only `↑/→/↓`, any more detailed trajectory labels defined in this methodology must be normalized to one of those three symbols. Ensure they match:

| synthesis-summary.md column | Source |
|----------------------------|--------|
| "Trend vs. Previous" → `↑` | This table: trajectory = Rising, Accelerating, or Spike |
| "Trend vs. Previous" → `→` | This table: trajectory = Stable |
| "Trend vs. Previous" → `↓` | This table: trajectory = Declining |

> **📌 Normalization Rule:** Detailed methodology trajectories such as `↑↑ Accelerating` and `⚡ Spike` must appear as `↑` in `synthesis-summary.md`. The synthesis summary uses only coarse trend symbols; the detailed label remains in the full risk assessment narrative.

> **🚨 Anti-Pattern Warning:** Trajectory arrows in synthesis summaries that are not backed by an explicit prior score comparison in the risk assessment are REJECTED. Every trajectory symbol must be traceable to a prior score with a date and source reference.

---

## 🔗 Advanced Technique 3: Risk Interconnection Mapping

Political risks are **interconnected** — coalition risk affects legislative risk, which affects institutional credibility risk. Map these connections to understand system-level vulnerability:

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
graph TD
    CR["🤝 Grand-Coalition Stability<br/>Score: [X]"]
    PR["📋 Policy Implementation<br/>Score: [X]"]
    IR["🏛️ Institutional Integrity<br/>Score: [X]"]
    ER["💶 Economic Governance<br/>Score: [X]"]
    SR["🧩 Social Cohesion<br/>Score: [X]"]
    XR["🌍 Geopolitical Standing<br/>Score: [X]"]

    CR -->|"Coalition instability delays<br/>policy implementation agenda"| PR
    CR -->|"Grand Coalition friction<br/>weakens institutional integrity"| IR
    PR -->|"Implementation failures erode<br/>public trust and social cohesion"| SR
    IR -->|"Institutional pressure forces<br/>unwanted policy compromises"| PR
    XR -->|"Geopolitical crisis forces<br/>rapid EU policy response"| PR
    XR -->|"External pressure strains<br/>grand-coalition stability"| CR
    XR -->|"Global economic shocks stress<br/>EU fiscal governance"| ER
    ER -->|"Budgetary constraints increase<br/>coalition posturing"| CR
    SR -->|"Social fragmentation<br/>undermines institutional legitimacy"| IR

    style CR fill:#dc3545,color:#fff
    style PR fill:#fd7e14,color:#fff
    style IR fill:#ffc107,color:#000
    style ER fill:#0d6efd,color:#fff
    style SR fill:#198754,color:#fff
    style XR fill:#6f42c1,color:#fff
```

### Interconnection Strength Assessment

| From → To | Connection Strength | Mechanism | Evidence |
|:---------:|:-------------------:|-----------|---------|
| Grand-Coalition → Policy | **Strong** | Legislative agenda requires coalition majority | `[vote records via get_voting_records]` |
| Grand-Coalition → Institutional | **Strong** | EU institutional functioning depends on EP coalition cooperation | `[committee composition via get_committee_info]` |
| Policy → Social Cohesion | **Medium** | Policy success/failure affects citizen trust | `[Eurobarometer data]` |
| Geopolitical → Policy | **Medium** | External pressures constrain legislative calendar | `[EU Council positions]` |
| Geopolitical → Economic | **Medium** | Global shocks stress EU fiscal governance | `[IMF WEO/FM economic data + World Bank WGI governance]` |
| Economic → Grand-Coalition | **Medium** | Budgetary constraints increase coalition posturing | `[MFF debates, budget votes]` |
| Social Cohesion → Institutional | **Medium** | Social fragmentation undermines institutional legitimacy | `[EP participation data, speeches]` |

**System-Level Risk Assessment:** When ≥3 risk categories score ≥10 (High), the system is in a **fragile state** where any single trigger event could cascade across multiple risk dimensions simultaneously.

### Risk Interconnection Cascade Example

**❌ BAD (interconnection not mapped):**
```markdown
Coalition risk: HIGH. Policy implementation risk: HIGH. Both need monitoring.
```

**✅ GOOD (cascade path traced with mechanism):**
```markdown
## Risk Interconnection — Active Cascade Chain

Grand Coalition Stability (Score 12, ↑ Rising) is driving a **secondary risk cascade**:

1. **Source risk:** Grand Coalition cohesion at 61% (↓ from 72%) — EPP internal split on
   migration (RCV-2026-0298: 11 EPP defections)
2. **First cascade:** Policy Implementation risk rising from 8→11 — the EPP defections have
   already delayed the CBAM regulation trilogue by 6 weeks (procedure 2023/0406(COD))
3. **Second cascade:** Institutional Integrity risk now at 9 — ECR has filed a transparency
   inquiry citing the delayed trilogue (written question P-001234/2026)
4. **Circuit breaker:** An EPP group leadership statement reaffirming coalition commitment
   (expected before April 22 plenary) would interrupt the cascade at Stage 1.

Connection strength: Grand-Coalition → Policy: **STRONG** (direct legislative blocking).
```

---

## 🌳 Advanced Technique 4: Scenario Tree Analysis

For complex risk situations with multiple branching points, construct a **scenario tree** showing probability-weighted outcomes:

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
flowchart TD
    START["📊 Current Situation<br/>Grand Coalition majority holds"]
    START -->|"60%"| A["🟢 Stability<br/>Coalition remains intact"]
    START -->|"30%"| B["🟡 Stress<br/>Coalition strained but holds"]
    START -->|"10%"| C["🔴 Crisis<br/>Coalition fractures"]

    A -->|"80%"| A1["Major legislation passes normally"]
    A -->|"20%"| A2["Legislation amended but passes"]

    B -->|"50%"| B1["Compromise found, stability restored"]
    B -->|"30%"| B2["Ongoing tension, weakened governance"]
    B -->|"20%"| B3["Delayed fracture"]

    C -->|"60%"| C1["New coalition configuration formed"]
    C -->|"40%"| C2["Minority coalition with ad-hoc majorities"]

    style START fill:#0d6efd,color:#fff
    style A fill:#28a745,color:#fff
    style B fill:#ffc107,color:#000
    style C fill:#dc3545,color:#fff
    style A1 fill:#28a745,color:#fff
    style A2 fill:#28a745,color:#fff
    style B1 fill:#ffc107,color:#000
    style B2 fill:#ffc107,color:#000
    style B3 fill:#ffc107,color:#000
    style C1 fill:#dc3545,color:#fff
    style C2 fill:#dc3545,color:#fff
```

### Scenario Tree Table

| Path | Probability | Outcome | Key Trigger | Watch Indicator |
|------|:----------:|---------|------------|----------------|
| Stability → Passes | 48% (60%×80%) | Normal governance continues | EPP–S&D confirm legislative agreement | Joint political group statement |
| Stability → Amended | 12% (60%×20%) | Minor adjustments, governance continues | Partial group objections | Committee amendment volume |
| Stress → Compromise | 15% (30%×50%) | Short-term disruption resolved | Public negotiation succeeds | Trilogue progress reports |
| Crisis → New coalition | 6% (10%×60%) | Coalition reconfigured, EU governance adapts | Grand Coalition collapse triggers realignment | No-confidence motion result |
| Crisis → Minority | 4% (10%×40%) | Ad-hoc legislative majorities | No stable coalition possible | EP vote fragmentation patterns |

---

## 📡 Advanced Technique 5: EP API Data Availability as a Risk Factor (New in v2.1)

Data availability is itself a risk dimension. When EP MCP API feeds return degraded results (empty datasets, 404 responses, stale data), analytical confidence decreases and risk assessments become less reliable. This section formalises data availability as a risk input.

### Data Availability Risk Matrix

> **Alignment note:** These availability bands follow the canonical project thresholds defined in `political-style-guide.md` to ensure consistent workflow decisions across analysis and publishing.

| Data Availability Level | EP MCP Feeds Active | Risk Assessment Impact | Analytical Action |
|------------------------|:-------------------:|----------------------|-------------------|
| **Full** | ≥6 of 8 core feeds | Normal analysis | Standard risk scoring protocol |
| **Degraded** | 3–5 feeds active | Likelihood estimates less precise (±1 uncertainty) | Widen confidence intervals; note data gaps |
| **Sparse** | 1–2 feeds active (typical recess) | Likelihood and impact estimates unreliable | Carry forward prior assessments with temporal decay; do not generate new risk scores from insufficient data |
| **Unavailable** | 0 feeds active (major outage) | Risk assessment impossible | State: "Risk assessment suspended — no EP MCP data available" |

### Core EP MCP Feeds for Risk Assessment

> **Note:** The 8 core feeds are MCP `get_*` data sources only. Analysis helpers such as `analyze_voting_patterns` are used to interpret feed data, but they are not counted as feeds in availability or degradation assessments.

| Feed | Risk Categories Served | Degradation Impact |
|------|----------------------|-------------------|
| `get_voting_records` | Grand coalition stability, policy implementation | **Critical** — voting data is the primary evidence for coalition risk |
| `get_adopted_texts` | Policy implementation, economic governance | **High** — adopted texts confirm legislative outcomes |
| `get_procedures` | Policy implementation | **High** — procedure status tracks legislative pipeline |
| `get_parliamentary_questions` | Institutional integrity, social cohesion | **Medium** — oversight activity pattern indicator |
| `get_speeches` | Social cohesion, geopolitical standing | **Medium** — debate content signals political direction |
| `get_plenary_sessions` | All categories | **High** — session context for all other data |
| `get_committee_documents` | Policy implementation, institutional integrity | **Medium** — committee output indicates legislative progress |
| `get_events` | Institutional integrity, geopolitical standing | **Medium** — event schedules and diplomatic activity provide forward-looking context |

### Recess-Period Risk Scoring Guidance

During EP recess periods (Easter, summer, year-end), risk scores from the most recent active session remain valid but decay over time per the confidence decay rules in [political-swot-framework.md](political-swot-framework.md):

| Time Since Last Active Session | Risk Score Handling |
|-------------------------------|-------------------|
| 0–30 days | Carry forward at current score; note: "Based on pre-recess data from [date]" |
| 31–90 days | Apply ±1 uncertainty to likelihood; downgrade confidence by one level |
| 91–180 days | Risk score marked as STALE; re-verification required when session resumes |
| >180 days | Risk score EXPIRED; must be recalculated from fresh data |

> **⚠️ Anti-Pattern Warning:** Never present a risk score based on stale data as if it were current. Always timestamp risk assessments and note the data currency: "Risk score as of [date]; EP in recess since [date]; next session [date]."

---

## 🔗 Related Documents

- [templates/risk-assessment.md](../templates/risk-assessment.md) — Risk assessment template
- [templates/per-file-political-intelligence.md](../templates/per-file-political-intelligence.md) — Per-file template with risk section
- [political-threat-framework.md](political-threat-framework.md) — Complementary threat analysis (multi-framework)
- [political-classification-guide.md](political-classification-guide.md) — Classification (risk input)
- [reference/isms-risk-assessment-adaptation.md](../reference/isms-risk-assessment-adaptation.md) — ISMS mapping
- [ai-driven-analysis-guide.md](ai-driven-analysis-guide.md) — Per-file analysis protocol

---

**Document Control:**
- **Path:** `/analysis/methodologies/political-risk-methodology.md`
- **ISMS Reference:** [Risk_Assessment_Methodology.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Risk_Assessment_Methodology.md)
- **Adapted from:** [Riksdagsmonitor risk methodology](https://github.com/Hack23/riksdagsmonitor/blob/main/analysis/methodologies/political-risk-methodology.md)
- **Classification:** Public
- **Version:** 2.3 — Added Advanced Technique 2b (Risk Trajectory Tracking), enhanced Advanced Technique 3 (Risk Interconnection Cascade Example with good vs. bad patterns)
