<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">⚠️ Political Risk Assessment Template</h1>

<p align="center">
  <strong>📊 Multi-Dimensional Risk Analysis with Cascading Risk & Scenario Trees</strong><br>
  <em>🎯 Coalition · Policy · Budget · Electoral · Cascading Risk Chains · Bayesian Updates</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-2.3-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--06--01-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Classification-Public-green?style=for-the-badge" alt="Classification"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 2.3 | **📅 Last Updated:** 2026-06-01 (UTC)  
**🏢 Owner:** Hack23 AB (Org.nr 5595347807) | **🏷️ Classification:** Public

> **📌 Template Instructions:** Copy to `analysis/daily/YYYY-MM-DD/{articleType}/`. Save as `risk-assessment.md` in the workflow's own folder (never overwrite another workflow's files). Scores use Likelihood × Impact methodology from [methodologies/political-risk-methodology.md](../methodologies/political-risk-methodology.md).

> **🚨 Anti-Pattern Warning:** Simple risk tables without cascading risk analysis, risk interconnection, or forward-looking scenarios are REJECTED. Every risk assessment MUST include:
> 1. **Risk Context** metadata header
> 2. **Risk Heat Map** (Mermaid diagram with color-coded risk scores)
> 3. **5-Dimension Risk Scoring** (Coalition, Policy, Budget, Electoral, External)
> 4. **Cascading Risk Chain** for the highest-risk event (Mermaid flowchart)
> 5. **Risk Interconnection Map** showing how risks amplify each other
> 6. **Evidence tables** with L×I scores, dok_id citations, confidence labels
> 7. **Forward indicators** and scenario outlook


---

## 📋 Risk Context

| Field | Value |
|-------|-------|
| **Risk Assessment ID** | `[REQUIRED: RSK-YYYY-MM-DD-NNN]` |
| **Assessment Date** | `[REQUIRED: YYYY-MM-DD HH:MM UTC]` |
| **Assessment Period** | `[REQUIRED: e.g. "2026-03-26 to 2026-04-02"]` |
| **Produced By** | `[REQUIRED: workflow name]` |
| **Political Context** | `[REQUIRED: 2–3 sentences on current political situation — which coalition governs, pending votes, recent crises]` |
| **Riksmöte** | `[REQUIRED: e.g. 2025/26]` |
| **Overall Risk Level** | `[REQUIRED: LOW / MEDIUM / HIGH / CRITICAL]` |

---

## 🗳️ Election 2026 Risk Dimensions

| Dimension | Assessment | Evidence |
|-----------|------------|----------|
| **Electoral Impact** | `[REQUIRED: How do these risks affect September 2026 election positioning?]` | `[Specific evidence]` |
| **Coalition Scenarios** | `[REQUIRED: Which coalition configurations are at risk before 2026 election?]` | `[Evidence]` |
| **Voter Salience** | `[REQUIRED: Which voter segments are most affected by these risks?]` | `[Evidence]` |
| **Campaign Vulnerability** | `[REQUIRED: Do these risks create campaign attack vectors for opposition?]` | `[Evidence]` |
| **Policy Legacy** | `[REQUIRED: Will these risk materializations become electoral liabilities?]` | `[Evidence]` |

**Overall Electoral Significance**: `[REQUIRED: CRITICAL/HIGH/MODERATE/LOW/NEGLIGIBLE]`

**Most Likely Electoral Narrative**: `[REQUIRED: How will opposition frame these risks in the 2026 campaign?]`

---

## 🎯 Confidence Scale (5-Level)

| Level | Label | Criteria | Evidence Threshold |
|-------|-------|----------|--------------------|
| ⬛ 1 | **VERY LOW** | Speculation only, single unverified source | 0–1 sources, no corroboration |
| 🟥 2 | **LOW** | Circumstantial evidence, indirect indicators | 2 sources, indirect evidence |
| 🟧 3 | **MEDIUM** | Multiple independent sources, moderate corroboration | 3+ sources, moderate agreement |
| 🟩 4 | **HIGH** | Official records, documented data, direct evidence | Official docs, voting records, committee reports |
| 🟦 5 | **VERY HIGH** | Verified data + independent corroboration + expert consensus | Multiple official sources, cross-validated |

---

## 🗂️ Risk Inventory

Risk Score = Likelihood (1–5) × Impact (1–5). See scoring guide in [political-risk-methodology.md](../methodologies/political-risk-methodology.md).

### Risk Heat Map

> **AI Instructions:** Replace node labels with actual risk descriptions from the register below. Color each node by tier.

```mermaid
graph TD
    subgraph "⚖️ Political Risk Landscape — Likelihood × Impact"
        R1["🔴 RSK-001: [Budget vote risk]<br/>L:? × I:? = ?"]
        R2["🟠 RSK-002: [Coalition strain]<br/>L:? × I:? = ?"]
        R3["🟡 RSK-003: [Policy delay]<br/>L:? × I:? = ?"]
        R4["🟢 RSK-004: [Routine motion]<br/>L:? × I:? = ?"]
        R5["🟢 RSK-005: [Minor amendment]<br/>L:? × I:? = ?"]
    end

    subgraph "📊 Risk Score Tiers"
        TC["🔴 CRITICAL<br/>Score 15–25"]
        TH["🟠 HIGH<br/>Score 10–14"]
        TM["🟡 MEDIUM<br/>Score 5–9"]
        TL["🟢 LOW<br/>Score 1–4"]
    end

    R1 -.-> TC
    R2 -.-> TH
    R3 -.-> TM
    R4 -.-> TL
    R5 -.-> TL

    style R1 fill:#D32F2F,color:#FFFFFF
    style R2 fill:#FF9800,color:#FFFFFF
    style R3 fill:#FFC107,color:#000000
    style R4 fill:#4CAF50,color:#FFFFFF
    style R5 fill:#4CAF50,color:#FFFFFF
    style TC fill:#D32F2F,color:#FFFFFF
    style TH fill:#FF9800,color:#FFFFFF
    style TM fill:#FFC107,color:#000000
    style TL fill:#4CAF50,color:#FFFFFF
```

```
Risk Tiers:  1–4 = Low 🟢  |  5–9 = Medium 🟡  |  10–14 = High 🟠  |  15–25 = Critical 🔴
```

| Risk ID | Description | Likelihood (1–5) | Impact (1–5) | Risk Score | Tier | Trend | Mitigation |
|---------|-------------|:----------------:|:------------:|:----------:|------|:-----:|------------|
| `RSK-001` | `[REQUIRED: e.g. "Budget vote fails in Riksdag"]` | `[#]` | `[#]` | `[L×I]` | `[🟢/🟡/🟠/🔴]` | `[↑/→/↓]` | `[REQUIRED: mitigation actions; append "Trend evidence:" followed by 1 sentence]` |
| `RSK-002` | `[REQUIRED]` | `[#]` | `[#]` | `[L×I]` | `[tier]` | `[↑/→/↓]` | `[REQUIRED: mitigation actions; append "Trend evidence:" followed by 1 sentence]` |
| `RSK-003` | `[OPTIONAL]` | `[#]` | `[#]` | `[L×I]` | `[tier]` | `[↑/→/↓]` | `[OPTIONAL: mitigation actions; append "Trend evidence:" followed by 1 sentence if trend is used]` |
| `RSK-004` | `[OPTIONAL]` | `[#]` | `[#]` | `[L×I]` | `[tier]` | `[↑/→/↓]` | `[OPTIONAL: mitigation actions; append "Trend evidence:" followed by 1 sentence if trend is used]` |
| `RSK-005` | `[OPTIONAL]` | `[#]` | `[#]` | `[L×I]` | `[tier]` | `[↑/→/↓]` | `[OPTIONAL: mitigation actions; append "Trend evidence:" followed by 1 sentence if trend is used]` |

> **Trend Legend:** `↑ Increasing` — risk score rose since last assessment · `→ Stable` — no change · `↓ Decreasing` — risk score dropped. Record the required 1-sentence evidence justification in the final table column, prefixed with `Trend evidence:`.

**Risk Score Summary** (copy scores from table above):

| Risk ID | Risk Score | Tier |
|---------|:----------:|------|
| RSK-001 | `[L×I]` | `[🟢/🟡/🟠/🔴]` |
| RSK-002 | `[L×I]` | `[🟢/🟡/🟠/🔴]` |
| RSK-003 | `[L×I]` | `[🟢/🟡/🟠/🔴]` |
| RSK-004 | `[L×I]` | `[🟢/🟡/🟠/🔴]` |
| RSK-005 | `[L×I]` | `[🟢/🟡/🟠/🔴]` |

> *Fill in actual risk scores from the register above. This table replaces a Mermaid `xychart-beta` chart for maximum Markdown renderer compatibility.*

---

## 🤝 Coalition Stability Risk

### Current Coalition Assessment

| Parameter | Value |
|-----------|-------|
| **Governing Coalition** | `[REQUIRED: e.g. "Tidökoalitionen: M + SD + KD + L"]` |
| **Coalition Strength** | `[REQUIRED: HIGH / MEDIUM / LOW]` |
| **Confidence Level** | `[REQUIRED: XX%]` |
| **Supporting Parties** | `[OPTIONAL: parties providing external support]` |
| **Opposition Majority Risk** | `[REQUIRED: YES / NO / MARGINAL]` |
| **Next Confidence Test** | `[OPTIONAL: YYYY-MM-DD or "None scheduled"]` |

### Coalition Risk Factors

| Factor | Status | Evidence | Risk Contribution |
|--------|--------|----------|-------------------|
| Internal party disagreements | `[REQUIRED: Active/Latent/None]` | `[dok_id or description]` | `[HIGH/MED/LOW]` |
| Budget disagreements | `[REQUIRED]` | `[source]` | `[tier]` |
| SD confidence threshold | `[REQUIRED]` | `[source]` | `[tier]` |
| By-election pressure | `[OPTIONAL]` | `[source]` | `[tier]` |
| EU policy conflict | `[OPTIONAL]` | `[source]` | `[tier]` |

**Coalition Collapse Probability (next 90 days):** `[REQUIRED: LOW <15% / MEDIUM 15–35% / HIGH >35%]`

---

## 📋 Policy Implementation Risk

Key policies at risk of parliamentary defeat, amendment, or delay:

| Policy | Ministry | Stage | Risk Level | Blocking Factor |
|--------|----------|-------|------------|-----------------|
| `[REQUIRED: policy name]` | `[REQUIRED: e.g. Finansdepartementet]` | `[REQUIRED: e.g. Committee review]` | `[🟢/🟡/🟠/🔴]` | `[REQUIRED: what could block it]` |
| `[OPTIONAL]` | `[OPTIONAL]` | `[OPTIONAL]` | `[tier]` | `[OPTIONAL]` |
| `[OPTIONAL]` | `[OPTIONAL]` | `[OPTIONAL]` | `[tier]` | `[OPTIONAL]` |

**Overall Policy Risk:** `[REQUIRED: LOW / MEDIUM / HIGH]`

---

## 💰 Budget Risk

| Parameter | Value |
|-----------|-------|
| **Budget Year** | `[REQUIRED: e.g. 2026]` |
| **Fiscal Committee (FiU) Status** | `[REQUIRED: e.g. "Approved 2025-12-01"]` |
| **Surplus/Deficit Projection** | `[REQUIRED: SEK billions, e.g. "-45 BSEK"]` |
| **Budget Risk Level** | `[REQUIRED: LOW / MEDIUM / HIGH / CRITICAL]` |
| **Key Budget Risks** | `[REQUIRED: 2–3 bullet points]` |

**Riksdag Fiscal Committee (FiU) Oversight:**
- Autumn Budget Proposition Status: `[REQUIRED: Approved / Pending / Rejected / Modified]`
- Spring Amending Budget Status: `[OPTIONAL]`
- Key FiU Dissents: `[OPTIONAL: party name + issue]`

---

## 🗳️ Electoral Risk Timeline

Structured around the Swedish electoral cycle (general elections every 4 years, September):

```mermaid
timeline
    title Electoral Risk Horizon
    section Near-term (0–6 months)
        By-elections : [OPTIONAL: describe any pending by-elections]
        Local elections : [OPTIONAL: scheduled dates]
    section Medium-term (6–18 months)
        EU Parliament : [OPTIONAL: relevant EU dynamics]
        Party conferences : [OPTIONAL: key party congress dates]
    section Long-term (18+ months)
        Next General Election : [REQUIRED: target date, e.g. September 2026]
        Pre-election positioning : [OPTIONAL: key dynamics]
```

| Electoral Event | Date | Risk to Coalition | Impact if Adverse |
|----------------|------|-------------------|-------------------|
| `[REQUIRED: event]` | `[YYYY-MM-DD or "TBD"]` | `[HIGH/MED/LOW]` | `[REQUIRED: 1 sentence]` |
| `[OPTIONAL]` | `[OPTIONAL]` | `[tier]` | `[OPTIONAL]` |

**Pre-election Fragility Index:** `[REQUIRED: LOW / MEDIUM / HIGH]`  
**Assessment Confidence:** `[REQUIRED: VERY HIGH / HIGH / MEDIUM / LOW / VERY LOW]`

---

## 🔑 Risk Summary & Recommendations

### Top 3 Risks This Period

1. **[Risk ID]:** `[Name]` — Score `[N]` — `[1-sentence summary]`
2. **[Risk ID]:** `[Name]` — Score `[N]` — `[1-sentence summary]`
3. **[Risk ID]:** `[Name]` — Score `[N]` — `[1-sentence summary]`

### Recommended Actions

- `[REQUIRED: specific monitoring or editorial action]`
- `[REQUIRED: specific monitoring or editorial action]`
- `[OPTIONAL]`

---

## ⚡ Escalation & Freshness

### Freshness Requirements

| Risk Tier | Maximum Age Before Re-evaluation |
|:---------:|:-------------------------------:|
| 🔴 Critical (15–25) | **24 hours** — must be re-assessed daily |
| 🟠 High (10–14) | **72 hours** — re-assess within 3 days |
| 🟡 Medium (5–9) | **7 days** — re-assess weekly |
| 🟢 Low (1–4) | **30 days** — re-assess monthly |

### When to Escalate from Risk Register to Breaking Analysis

| Condition | Action |
|-----------|--------|
| Any risk score increases from ≤14 to ≥15 (crosses into Critical) | Trigger breaking risk assessment; notify editorial |
| ≥ 3 risks simultaneously in High tier | Elevate overall risk level; flag in daily synthesis |
| Coalition collapse probability moves from LOW to MEDIUM or HIGH | Immediate re-assessment of all coalition-related risks |
| Budget vote approaches with unresolved High risk | Pre-position breaking analysis template |

---

## 🔗 Section 5: Cascading Risk Chain

> **AI Instructions:** For the highest-scoring risk, trace the cascade of second-order and third-order effects.

```mermaid
flowchart TD
    TRIGGER["⚠️ TRIGGER:<br/>[REQUIRED: Primary risk event]<br/>Score: [L×I]"]
    TRIGGER --> FIRST["⚠️ 1ST ORDER:<br/>[REQUIRED: Immediate consequence]<br/>Score: [L×I]"]
    FIRST --> SECOND_A["⚠️ 2ND ORDER (A):<br/>[REQUIRED: Follow-on effect]<br/>Score: [L×I]"]
    FIRST --> SECOND_B["⚠️ 2ND ORDER (B):<br/>[OPTIONAL: Alternative path]<br/>Score: [L×I]"]

    style TRIGGER fill:#D32F2F,color:#FFFFFF
    style FIRST fill:#FF9800,color:#FFFFFF
    style SECOND_A fill:#FFC107,color:#000000
    style SECOND_B fill:#FFC107,color:#000000
```

| Chain Stage | Risk Event | L | I | Score | Circuit Breaker |
|:-----------:|-----------|:-:|:-:|:-----:|----------------|
| Trigger | `[REQUIRED]` | `[#]` | `[#]` | `[#]` | `[What stops it here?]` |
| 1st Order | `[REQUIRED]` | `[#]` | `[#]` | `[#]` | `[Intervention point]` |
| 2nd Order | `[REQUIRED]` | `[#]` | `[#]` | `[#]` | `[Recovery action]` |

---

## 🌐 Section 6: Risk Interconnection Map

> **AI Instructions:** Show how the 5 risk dimensions affect each other.

| From → To | Connection Strength | Mechanism | Evidence |
|:---------:|:-------------------:|-----------|---------|
| Coalition → Budget | `[Strong/Medium/Weak]` | `[REQUIRED: How this connection works]` | `[dok_id]` |
| Coalition → Policy | `[Strong/Medium/Weak]` | `[REQUIRED]` | `[dok_id]` |
| Policy → Electoral | `[Strong/Medium/Weak]` | `[REQUIRED]` | `[dok_id]` |

**System fragility assessment:** `[REQUIRED: Are ≥3 risk dimensions at High level? If so, system is fragile — describe why.]`

---

## 🔮 Section 7: Forward Indicators & Scenario Outlook

| Scenario | Probability | Key Trigger | Risk Dimensions Affected |
|----------|:----------:|------------|-------------------------|
| `[REQUIRED: Most likely outcome]` | `[%]` | `[Specific trigger]` | `[Coalition + Policy + ...]` |
| `[REQUIRED: Alternative outcome]` | `[%]` | `[Specific trigger]` | `[Risk dimensions]` |

---

## 📂 MCP Data Files Used

> *Record all data files and MCP tool calls consulted during this risk assessment for audit traceability and reproducibility.*

`[REQUIRED: List all analysis/daily/YYYY-MM-DD/{articleType}/data/ files consulted]`

| # | Data Source | File / Tool Path | Data Type | Retrieved |
|:-:|-----------|-----------------|-----------|-----------|
| 1 | `[e.g. riksdag-regering-mcp]` | `[e.g. search_voteringar(rm="2025/26", bet="FiU1")]` | `[e.g. Voting records]` | `[YYYY-MM-DD HH:MM UTC]` |
| 2 | `[e.g. riksdag-regering-mcp]` | `[e.g. search_dokument(doktyp="prop", rm="2025/26")]` | `[e.g. Propositions]` | `[YYYY-MM-DD HH:MM UTC]` |
| 3 | `[e.g. CIA export]` | `[e.g. cia-data/exports/risk-summary.json]` | `[e.g. Risk indicators]` | `[YYYY-MM-DD HH:MM UTC]` |
| 4 | `[OPTIONAL]` | `[path or tool call]` | `[type]` | `[timestamp]` |

### Risk-Specific MCP Tool Usage

> **AI Instructions:** Map which MCP tools provided evidence for each risk dimension. This ensures every risk score has traceable data provenance.

| Risk Dimension | Primary MCP Tool | Key Parameters | Evidence Count |
|---------------|-----------------|----------------|:--------------:|
| Coalition Stability | `[e.g. riksdag-regering-mcp search_voteringar]` | `[e.g. rm="2025/26"]` | `[#]` |
| Policy Implementation | `[e.g. riksdag-regering-mcp search_dokument]` | `[e.g. doktyp="bet"]` | `[#]` |
| Budget | `[e.g. riksdag-regering-mcp get_propositioner]` | `[e.g. rm="2025/26"]` | `[#]` |
| Electoral | `[e.g. riksdag-regering-mcp search_anforanden]` | `[e.g. parti="S"]` | `[#]` |
| External | `[e.g. riksdag-regering-mcp search_regering]` | `[e.g. type="pressmeddelanden"]` | `[#]` |

> **📌 Note:** All files listed above MUST exist in the repository at the stated paths. If a file was fetched but not persisted, note `(transient — not cached)` in the File Path column.

---

## 📊 Section 8: Previous Assessment Comparison

> **AI Instructions:** Compare current risk scores with the most recent previous risk assessment for the same article type. If no previous assessment exists, note "First assessment — no baseline available."

| Risk ID | Previous Score | Current Score | Change | Trend | Evidence for Change |
|---------|:--------------:|:------------:|:------:|:-----:|---------------------|
| `RSK-001` | `[previous L×I or N/A]` | `[current L×I]` | `[+N / 0 / -N]` | `[↑/→/↓]` | `[REQUIRED: What changed since last assessment?]` |
| `RSK-002` | `[previous L×I or N/A]` | `[current L×I]` | `[+N / 0 / -N]` | `[↑/→/↓]` | `[REQUIRED]` |
| `RSK-003` | `[previous or N/A]` | `[current]` | `[delta]` | `[↑/→/↓]` | `[OPTIONAL]` |

**Previous Assessment Reference:** `[REQUIRED: path to previous risk-assessment.md or "N/A — first assessment"]`  
**Overall Risk Trend:** `[REQUIRED: ↑ Escalating / → Stable / ↓ De-escalating]`  
**Trend Confidence:** `[REQUIRED: VERY HIGH / HIGH / MEDIUM / LOW / VERY LOW]`

---

## 🌐 Section 9: Risk Interconnection Diagram

> **AI Instructions:** Render the risk interconnection map from Section 6 as a Mermaid diagram showing how the 5 risk dimensions amplify or dampen each other. Edge labels describe the mechanism.

```mermaid
graph LR
    subgraph "🌐 Risk Interconnection Map"
        COA["🤝 Coalition<br/>Stability"]
        POL["📋 Policy<br/>Implementation"]
        BUD["💰 Budget<br/>/ Fiscal"]
        ELE["🗳️ Electoral<br/>Risk"]
        EXT["🌍 External<br/>/ International"]
    end

    COA -->|"[mechanism]"| POL
    COA -->|"[mechanism]"| BUD
    POL -->|"[mechanism]"| ELE
    BUD -->|"[mechanism]"| COA
    EXT -->|"[mechanism]"| POL

    style COA fill:#D32F2F,color:#FFFFFF
    style POL fill:#FF9800,color:#FFFFFF
    style BUD fill:#FFC107,color:#000000
    style ELE fill:#4CAF50,color:#FFFFFF
    style EXT fill:#1565C0,color:#FFFFFF
```

> **AI Instructions:** Replace `[mechanism]` edge labels with actual causal descriptions (e.g., "SD withdrawal collapses budget majority"). Color each node by its current risk tier using the standard palette.

---

## 🔗 Cross-References

> *Link to sibling analysis files and same-day analysis from other article types for contextual completeness.*

| Related Analysis File | Relationship | Key Finding |
|----------------------|-------------|-------------|
| `[REQUIRED: e.g. swot-analysis.md]` | `[feeds into / informed by / contradicts]` | `[1 sentence]` |
| `[REQUIRED: e.g. threat-analysis.md]` | `[feeds into / informed by]` | `[1 sentence]` |
| `[REQUIRED: e.g. synthesis-summary.md]` | `[summarises / consumed by]` | `[1 sentence]` |
| `[OPTIONAL: same-day analysis from different article type]` | `[cross-reference]` | `[1 sentence]` |

---

## ✅ Quality Self-Check Checklist

> **Pre-commit validation — every item MUST be checked before finalising this analysis.**

- [ ] **Metadata complete:** Risk Assessment ID, date, period, producer, political context, riksmöte, overall risk level all filled
- [ ] **Risk Heat Map rendered:** Mermaid diagram has actual risk descriptions (no `[placeholder]` text remaining)
- [ ] **Minimum 2 risks scored:** At least RSK-001 and RSK-002 have L×I scores with evidence
- [ ] **Trend column populated:** Every scored risk has a trend indicator (↑/→/↓) with evidence
- [ ] **Cascading Risk Chain present:** Section 5 has a completed Mermaid flowchart for the highest-risk event
- [ ] **Risk Interconnection Map filled:** Section 6 table and Section 9 diagram have actual mechanisms (not placeholders)
- [ ] **Forward Indicators present:** Section 7 has ≥2 scenarios with probabilities summing to ~100%
- [ ] **Previous Assessment Comparison:** Section 8 filled (or marked "first assessment")
- [ ] **MCP Data Provenance:** All data sources listed with timestamps; every factual claim traceable
- [ ] **No placeholder text remaining:** Search for `[REQUIRED` — zero hits expected
- [ ] **Cross-references linked:** At least 2 sibling analysis files referenced
- [ ] **Election 2026 Risk Dimensions present:** All 5 dimensions assessed with overall electoral significance rating
- [ ] **5-level confidence applied:** Assessment Confidence and Trend Confidence use VERY HIGH/HIGH/MEDIUM/LOW/VERY LOW scale
- [ ] **Named actors:** ≥2 named politicians/parties with party affiliations cited
- [ ] **Confidence labels:** Every claim has VERY HIGH/HIGH/MEDIUM/LOW/VERY LOW confidence or numeric severity

---

**Document Control:**  
- **Template Path:** `/analysis/templates/risk-assessment.md`  
- **Framework Reference:** [methodologies/political-risk-methodology.md](../methodologies/political-risk-methodology.md)  
- **Version:** 2.3  
- **Effective Date:** 2026-06-01 (UTC)  
- **Key Changes v2.3:** Added Election 2026 Risk Dimensions section, 5-level confidence scale (VERY HIGH/HIGH/MEDIUM/LOW/VERY LOW), updated quality checklist  
- **Advanced Sections:** Cascading Risk, Risk Interconnection, Scenario Outlook, Previous Assessment Comparison, MCP Data Provenance  
- **ISMS Alignment:** ISO 27001:2022 A.5.7 (Threat Intelligence), NIST CSF 2.0 ID.RA (Risk Assessment)  
- **Classification:** Public  
- **Owner:** Hack23 AB (Org.nr 5595347807)  
- **Next Review:** 2026-06-30
