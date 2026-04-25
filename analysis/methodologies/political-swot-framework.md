<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">💼 Political SWOT Analysis Framework — European Parliament</h1>

<p align="center">
  <strong>📊 Evidence-Based SWOT Methodology for EU Political Intelligence</strong><br>
  <em>🎯 MCP Sources · Confidence Levels · Aggregation · Temporal Decay</em>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 2.3 | **📅 Last Updated:** 2026-04-25 (UTC)
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-07-31
**🏢 Owner:** Hack23 AB (Org.nr 5595347807) | **🏷️ Classification:** Public

---

## 🎯 Purpose

This framework establishes the evidence-based SWOT analysis methodology for EU Parliament Monitor. Unlike traditional opinion-based SWOT, this methodology requires **verifiable evidence** for every entry — either an EP document reference, named primary source, or official data source.

This methodology is inspired by [CIA platform SWOT.md](https://github.com/Hack23/cia/blob/master/SWOT.md) and the [Riksdagsmonitor SWOT framework](https://github.com/Hack23/riksdagsmonitor/blob/main/analysis/methodologies/political-swot-framework.md), adapted for EU Parliament political intelligence.

---

## 📐 Evidence-Based vs. Opinion-Based SWOT

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
graph LR
    A[SWOT Entry] --> B{Has verifiable<br/>evidence source?}
    B -->|Yes: EP procedure,<br/>vote record, official data| C[✅ Evidence-Based<br/>PUBLISHABLE]
    B -->|No: analyst opinion,<br/>general impression| D[❌ Opinion-Based<br/>REJECTED]

    C --> E[Assign Confidence Level<br/>based on source quality]
    D --> F[Return for evidence gathering<br/>or discard]

    E --> G[HIGH: Official EP document<br/>or Eurostat data]
    E --> H[MEDIUM: Verified press report<br/>+ corroborating source]
    E --> I[LOW: Single source,<br/>credible but unverified]
```

### Evidence Hierarchy (by confidence level)

| Confidence | Acceptable Sources | MCP Tool |
|:----------:|-------------------|----------|
| **HIGH** | Official EP adopted text, legislative resolution | `get_adopted_texts`, `get_procedures` |
| **HIGH** | Verified roll-call voting record | `get_voting_records`, `analyze_voting_patterns` |
| **HIGH** | Eurostat/IMF (primary economic)/World Bank (non-economic) official statistics | IMF SDMX REST + World Bank MCP tools |
| **MEDIUM** | Commission communication or proposal | `get_external_documents`, `search_documents` |
| **MEDIUM** | Named MEP speech in plenary record | `get_speeches` |
| **MEDIUM** | Verified major media outlet with named sources | External verification |
| **LOW** | Single unnamed source | — (flag for verification) |
| **REJECTED** | Analyst inference without evidence | — |

---

## 📊 MCP Data Sources for Each Quadrant

### ✅ Strengths — Optimal MCP Sources

Strengths are demonstrated by **legislative achievements** and **institutional cohesion**:

| Strength Type | MCP Tool | Query Strategy |
|--------------|----------|---------------|
| Legislative achievement | `get_adopted_texts` | Filter by type=legislative resolution, status=adopted |
| Grand coalition cohesion | `analyze_coalition_dynamics` | EPP+S&D+Renew voting alignment rate |
| Committee productivity | `analyze_committee_activity` | Output rate, report adoption rate |
| EP institutional authority | `get_procedures` | Successful co-decision files vs. Council |
| International engagement | `search_documents` | AFET/INTA resolutions with broad support |

### ⚠️ Weaknesses — Optimal MCP Sources

| Weakness Type | MCP Tool | Query Strategy |
|--------------|----------|---------------|
| Political group fragmentation | `detect_voting_anomalies` | Intra-group defection rates |
| Legislative pipeline stalls | `monitor_legislative_pipeline` | Stalled procedures, bottleneck index |
| Low MEP engagement | `track_mep_attendance` | Attendance rates below thresholds |
| EP-Council deadlocks | `track_legislation` | Procedures stuck in trilogue >12 months |
| Public trust deficit | Eurobarometer / World Bank WGI governance data (non-economic) | Turnout trends, satisfaction metrics |

### 🚀 Opportunities — Optimal MCP Sources

| Opportunity Type | MCP Tool | Query Strategy |
|-----------------|----------|---------------|
| Pending landmark legislation | `get_procedures` | Key files approaching plenary vote |
| Cross-party consensus building | `analyze_coalition_dynamics` | High cohesion votes across 4+ groups |
| New Commission proposals | `get_external_documents` | Recent Commission proposals with EP support |
| Institutional reform windows | `search_documents` | AFCO reports on Treaty changes |
| Green Deal implementation | `get_adopted_texts` | Climate/environment legislation progress |

### 🔴 Threats — Optimal MCP Sources

| Threat Type | MCP Tool | Query Strategy |
|------------|----------|---------------|
| Far-right group growth | `compare_political_groups` | Seat share trends for PfE/ECR/ESN |
| Institutional legitimacy crisis | `get_parliamentary_questions` | Article 7 / rule of law references |
| Budget framework disputes | `get_adopted_texts` | MFF-related rejections or amendments |
| Geopolitical pressure | `get_plenary_documents` | CFSP/security resolutions with low consensus |
| Democratic backsliding in MS | `detect_voting_anomalies` | National delegation voting patterns |

---

## 🎯 Confidence Level Assignment

| Level | Criteria | Example |
|-------|---------|---------|
| **HIGH** | Multiple independent sources; primary EP document; current (within 90 days) | "Grand coalition secured 412/720 votes on Green Deal regulation (verified via roll-call 2026-03-15)" |
| **MEDIUM** | Single primary source confirmed; or primary source older than 90 days | "Eurobarometer shows 48% EP trust; single survey" |
| **LOW** | Credible but single unverified source; inference from related evidence | "Estimated PfE group dissent based on plenary debate tone — no formal vote yet" |

### Confidence Decay Rule

| Original Confidence | After 30 days | After 90 days | After 180 days |
|--------------------|:------------:|:-------------:|:--------------:|
| HIGH | HIGH | MEDIUM | LOW |
| MEDIUM | MEDIUM | LOW | EXPIRED |
| LOW | LOW | EXPIRED | EXPIRED |

**EXPIRED entries must be re-verified or removed before inclusion in new SWOT analyses.**

---

## 🔗 Aggregating Political Group SWOTs into Landscape SWOT

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
flowchart TD
    A[Individual Group SWOTs] --> B[Grand Coalition SWOT<br/>EPP + S&D + Renew]
    A --> C[Opposition Bloc SWOT<br/>ECR + PfE/ESN]
    A --> D[Cross-cutting SWOT<br/>Greens/EFA + The Left]

    B --> E[Landscape SWOT Aggregation]
    C --> E
    D --> E

    E --> F{Intersection Analysis}
    F --> G[Coalition S vs Opposition T<br/>= Contested terrain]
    F --> H[Coalition W vs Opposition O<br/>= Opposition opportunity]
    F --> I[Shared O<br/>= Cross-party opportunity]
    F --> J[Shared T<br/>= System-level risk]
```

### Intersection Rules

- **Coalition Strength + Opposition Threat** = Priority watchpoint (contested terrain)
- **Coalition Weakness + Opposition Opportunity** = High-significance political risk
- **Shared Opportunity** = Major policy window; grand bargain possible
- **Shared Threat** = System-level risk; Treaty/institutional dimension

---

## 🤖 AI Analysis Protocol for SWOT

The AI agent **MUST** follow this protocol when generating SWOT analysis:

1. **Read this framework** — understand evidence hierarchy, confidence levels, decay rules
2. **Query EP MCP tools** — use the tool/query strategies from the tables above for each quadrant
3. **Fill SWOT template** — every entry needs: Statement + Evidence (EP doc reference) + Confidence + Impact
4. **Apply intersection analysis** — identify contested terrain, opposition opportunities, shared risks
5. **Validate quality gate** — ≥ 2 entries per quadrant, zero opinion-only entries, zero EXPIRED entries
6. **Integrate with Risk and Threat** — Risk scores ≥10 become SWOT Threat entries; threat actor findings inform SWOT Weakness entries

> **🚨 Anti-Pattern Warning:** SWOT entries without specific evidence citations (EP document IDs, MCP tool outputs, or named sources) are REJECTED. "The EU faces challenges" is not a valid Weakness entry — "EPP-S&D voting alignment dropped from 68% to 54% in Q1 2026 (EP MCP `compare_political_groups`)" is.

---

## 📐 Advanced Technique 0: Mandatory Evidence Citation Format per SWOT Item (New in v2.2)

Every single SWOT entry — whether in a per-file analysis, daily synthesis, or weekly rollup — MUST follow this citation format. This is not optional.

### Required SWOT Entry Structure

The template `analysis/templates/swot-analysis.md` uses **per-quadrant sections** (Strengths, Weaknesses, Opportunities, Threats), each with its own table. The `#` column provides a sequential ID within that quadrant (e.g., S1, W2, O1, T3):

```markdown
| # | Strength Statement | Evidence (EP reference) | Confidence | Impact |
|---|-------------------|----------------------|:----------:|:------:|
| S1 | [Specific, testable strength claim] | [EP ref: P9_TA(2026)0089 / RCV-2026-0342 / MCP tool output] | H/M/L | H/M/L |
```

**Every field is mandatory.** No entry may omit evidence, confidence, or impact. When a Severity dimension is needed (e.g., in risk-adjacent SWOT entries), append it as inline text within the Statement field: `"[claim] — Severity: high"`.

### Evidence Citation Minimum Standards

| SWOT Quadrant | Minimum Evidence Requirement | Acceptable Sources |
|:-------------:|------------------------------|-------------------|
| ✅ Strengths | Official EP document OR verified vote result | Adopted text ref, roll-call vote, MCP `get_adopted_texts` |
| ⚠️ Weaknesses | Observable institutional deficiency with data source | MCP `detect_voting_anomalies`, `monitor_legislative_pipeline` bottleneck index |
| 🚀 Opportunities | Pending procedure or confirmed political signal | Procedure ID from `get_procedures`, group position statement |
| 🔴 Threats | Specific risk indicator with likelihood evidence | For group-level seat share / trend claims: MCP `compare_political_groups`, `analyze_coalition_dynamics`, `get_all_generated_stats`; for individual-MEP threat claims only: MCP `analyze_voting_patterns` |

### Good vs. Bad — SWOT Citation

**❌ BAD (opinion-only, no evidence):**
```markdown
| S1 | Grand coalition has strong legislative majority | — | H | H |
```

**✅ GOOD (evidence-anchored, citable):**
```markdown
| S1 | Grand coalition (EPP+S&D+Renew) secured 412/720 majority on Green Deal vote, 18pp above required majority — Severity: high | EP MCP `get_voting_records`, RCV-2026-0342, 2026-03-15 | H | H |
```

**❌ BAD (vague threat, no quantification):**
```markdown
| T1 | Far-right groups growing in Parliament | — | M | H |
```

**✅ GOOD (quantified, traceable):**
```markdown
| T1 | ECR+PfE combined seat share rose from 22% to 26% between EP9 and EP10, reducing grand coalition surplus from 87 to 41 above majority threshold — Severity: high | EP MCP `compare_political_groups`, seat share data EP9 vs EP10 | H | H |
```

---

## 🕐 Advanced Technique 5: Temporal SWOT — Current vs. 90-Day Projected (New in v2.2)

A standard SWOT captures the **current** political landscape. The Temporal SWOT extends this by projecting how each entry is likely to **evolve over the next 90 days**, enabling forward-looking strategic intelligence rather than rear-view analysis.

### Temporal SWOT Protocol

For each SWOT entry, the AI agent MUST add:
1. **Current assessment** — the entry as it stands today (with evidence)
2. **90-day projection** — how is this entry likely to evolve? (with trigger conditions)
3. **Trajectory** — Is the entry strengthening (↑), stable (→), or weakening (↓)?

### Temporal SWOT Table Format

```markdown
| Quadrant | Current Statement | 90-Day Projection | Trajectory | Key Trigger |
|----------|-----------------|------------------|:----------:|------------|
| ✅ S | [Current strength with evidence] | [Projected status in 90 days] | ↑/→/↓ | [Event that would change trajectory] |
| ⚠️ W | [Current weakness with evidence] | [Projected status in 90 days] | ↑/→/↓ | [Event that could resolve or worsen] |
| 🚀 O | [Current opportunity with evidence] | [Projected window — open/closing/closed] | ↑/→/↓ | [Decision point that opens/closes window] |
| 🔴 T | [Current threat with evidence] | [Projected materialization likelihood] | ↑/→/↓ | [Trigger that would materialize or neutralize] |
```

### Temporal SWOT Example

**Grand Coalition Legislative Majority — Temporal Assessment**

| Field | Current (2026-04-06) | 90-Day Projection (2026-07-06) |
|-------|---------------------|-------------------------------|
| **Statement** | EPP+S&D+Renew holds 412-seat combined majority (57.2% of 720 seats) [HIGH confidence, EP10 seat data] | Majority likely to hold at 57–58% unless Renew suffers defections on migration package |
| **Trajectory** | → Stable | ↓ Declining risk — migration vote in May plenary is key test |
| **Key Trigger** | — | Renew abstentions ≥15 on May migration vote → would reduce functional majority below 395, increasing coalition stress score from 12→16 |
| **Evidence** | EP MCP `compare_political_groups`, seat share 2026-04-01 | Scenario analysis per political-risk-methodology.md AT4 |

### 90-Day Projection Windows

| SWOT Quadrant | Projection Approach | Horizon Focus |
|:-------------:|--------------------|----|
| ✅ Strengths | Will the strength be sustained, eroded, or reinforced? | Upcoming votes, group leadership changes |
| ⚠️ Weaknesses | Will the weakness be resolved, unchanged, or worsened? | Upcoming events that could address or deepen the weakness |
| 🚀 Opportunities | Is the opportunity window open, closing, or already closed? | Specific dates: plenary sessions, trilogue deadlines |
| 🔴 Threats | What is the materialization probability over 90 days? | Trigger conditions and probability range |

### Mandatory 90-Day Projection Rule

Every **daily SWOT** MUST include at least one Temporal SWOT entry with an explicit 90-day projection and trigger condition. **Weekly and monthly rollups MUST include Temporal SWOT for all HIGH-impact entries.**

> **Anti-pattern (REJECTED):** A SWOT that describes only the current state without any forward-looking projections. The European Parliament operates on predictable calendar rhythms — plenary weeks, committee deadlines, trilogue rounds — making 90-day projections feasible for most entries.

---

## 🔀 Advanced Technique 1: Cross-SWOT Interference Analysis

When the EU political landscape involves multiple actors (Grand Coalition, Opposition, kingmaker groups), their SWOT elements don't exist in isolation — they **interfere** with each other, creating amplification effects:

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
graph TD
    subgraph "Grand Coalition SWOT"
        GS["💪 GC Strength:<br/>Legislative majority (EPP+S&D+Renew)"]
        GW["⚡ GC Weakness:<br/>Internal policy disagreements"]
    end
    subgraph "Opposition SWOT"
        OS["💪 Opp Strength:<br/>United front on democratic reform"]
        OT["🔴 Opp Threat:<br/>ECR-ID coalition building"]
    end
    subgraph "Swing Groups SWOT"
        SS["💪 Swing Strength:<br/>Pivotal voting position"]
        SW["⚡ Swing Weakness:<br/>Policy delivery credibility"]
    end

    GW -->|"amplifies"| OS
    SS -->|"enables"| GS
    SW -->|"undermines"| GS
    OT -->|"constrains"| OS

    style GS fill:#28a745,color:#fff
    style GW fill:#fd7e14,color:#fff
    style OS fill:#28a745,color:#fff
    style OT fill:#dc3545,color:#fff
    style SS fill:#28a745,color:#fff
    style SW fill:#fd7e14,color:#fff
```

### Interference Matrix

| GC SWOT Element | Opposition SWOT Element | Interference Effect | Implication |
|:----------------:|:----------------:|:------------------:|------------|
| **GC Strength** + Opp Weakness | — | Reinforcing advantage | Grand Coalition position consolidates |
| **GC Weakness** + Opp Strength | — | Amplified vulnerability | Opposition likely to exploit through amendments |
| **GC Threat** + Opp Opportunity | — | Converging pressure | High-risk moment for legislative agenda |
| **GC Strength** + Swing Weakness | — | Fragile dependency | Majority depends on unreliable swing votes |

### Interference Detection Protocol

For each SWOT entry:
1. Ask: "Does this element AMPLIFY or COUNTERACT any element from another actor's SWOT?"
2. Map the interference (amplifies, enables, undermines, constrains)
3. Rate the interference strength (strong/moderate/weak)
4. Identify the **net political effect** — is the system moving toward stability or instability?

---

## 📊 Advanced Technique 2: TOWS Strategic Options Matrix

TOWS converts SWOT findings into **strategic options** — answering "So what?" for each SWOT combination:

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
graph TD
    SO["SO Strategies<br/>(Strengths × Opportunities)<br/><em>Leverage strengths to exploit opportunities</em>"]
    WO["WO Strategies<br/>(Weaknesses × Opportunities)<br/><em>Use opportunities to address weaknesses</em>"]
    ST["ST Strategies<br/>(Strengths × Threats)<br/><em>Use strengths to counter threats</em>"]
    WT["WT Strategies<br/>(Weaknesses × Threats)<br/><em>Defensive: minimise vulnerabilities</em>"]

    style SO fill:#28a745,color:#fff
    style WO fill:#0d6efd,color:#fff
    style ST fill:#ffc107,color:#000
    style WT fill:#dc3545,color:#fff
```

| TOWS Cell | Political Context | Example |
|:---------:|------------------|---------|
| **SO** (Strength × Opportunity) | "Grand Coalition uses legislative majority (S1) to pass landmark Green Deal legislation (O1) before next EP elections" | Proactive agenda-setting |
| **WO** (Weakness × Opportunity) | "Coalition uses EU competitiveness mandate (O2) to force internal alignment on industrial policy (W1)" | External pressure as internal discipline |
| **ST** (Strength × Threat) | "Grand Coalition uses committee control (S2) to moderate ECR-ID proposals, neutralising populist threat (T1)" | Pre-emptive moderation |
| **WT** (Weakness × Threat) | "Internal disagreements (W1) + right-wing populist growth (T1) = highest-risk scenario requiring immediate coalition management" | Defensive damage control |

**Every SWOT analysis MUST include at least 2 TOWS strategic options** with evidence-backed reasoning.

---

## 🔮 Advanced Technique 3: Strategic Scenario Generation

Use SWOT combinations to construct **plausible political futures** (scenarios), each with a probability range and trigger conditions:

### Scenario Construction Protocol

1. **Identify 2–3 key uncertainties** from the SWOT analysis (e.g., "Will the Grand Coalition hold on Green Deal?" + "Will ECR-ID alliance formalize?")
2. **Construct 2×2 scenario matrix** from the two most impactful uncertainties
3. **Name each scenario** and describe its political characteristics
4. **Assign probability ranges** based on evidence
5. **Identify trigger indicators** that would signal movement toward each scenario

### Example Scenario Table

| Scenario | GC Status | ECR-ID Status | Probability | Key Trigger |
|----------|:---------:|:------------:|:-----------:|------------|
| 🟢 **Status Quo** | Holds | Informal | 40–55% | EPP–S&D publicly confirm legislative pact |
| 🟠 **Stress Test** | Holds | Formalizes | 15–25% | ECR–ID joint voting bloc on migration |
| 🟡 **Pressure** | Fractures | Informal | 10–20% | S&D breaks with EPP on rule of law |
| 🔴 **Realignment** | Fractures | Formalizes | 5–15% | Combined pressure triggers new coalition map |

---

## 📐 Advanced Technique 4: Power-Interest Mapping

Position key stakeholders by their **power** (ability to influence EP outcomes) and **interest** (stake in specific issues) to identify who matters most:

```mermaid
%%{init: {
  "theme": "dark",
  "themeVariables": {
    "quadrant1Fill": "#1565C0",
    "quadrant2Fill": "#2E7D32",
    "quadrant3Fill": "#FF9800",
    "quadrant4Fill": "#D32F2F",
    "quadrantTitleFill": "#ffffff",
    "quadrantPointFill": "#ffffff",
    "quadrantPointTextFill": "#ffffff",
    "quadrantXAxisTextFill": "#ffffff",
    "quadrantYAxisTextFill": "#ffffff"
  },
  "quadrantChart": {
    "chartWidth": 700,
    "chartHeight": 700,
    "pointLabelFontSize": 14,
    "titleFontSize": 22,
    "quadrantLabelFontSize": 18,
    "xAxisLabelFontSize": 16,
    "yAxisLabelFontSize": 16
  }
}}%%
quadrantChart
    title 🤝 Stakeholder Power-Interest Map
    x-axis "Low Interest" --> "High Interest"
    y-axis "Low Power" --> "High Power"
    quadrant-1 "🎯 Manage Closely"
    quadrant-2 "🛡️ Keep Satisfied"
    quadrant-3 "👁️ Monitor"
    quadrant-4 "📢 Keep Informed"
    "🏛️ EP President": [0.8, 0.9]
    "🔵 EPP Group": [0.8, 0.85]
    "🌹 S&D Group": [0.75, 0.75]
    "🇪🇺 European Commission": [0.5, 0.8]
    "🏛️ EU Council": [0.3, 0.7]
    "🤝 Civil Society": [0.7, 0.25]
    "👥 EU Citizens": [0.6, 0.15]
```

| Quadrant | Strategy | Stakeholders |
|----------|---------|-------------|
| **Manage Closely** (high power, high interest) | Full analysis; primary intelligence consumer | EP President, EPP, S&D, Renew, Commission President |
| **Keep Satisfied** (high power, low interest) | Monitor for engagement; alert on activation | EU Council, ECB, member state governments |
| **Keep Informed** (low power, high interest) | Regular reporting; citizen engagement | Media, civil society, industry associations, EU citizens |
| **Monitor** (low power, low interest) | Periodic check; no active engagement | Non-Inscrits Members of the European Parliament (NI MEPs), regional bodies, minor party delegations |

---

## 🔗 Related Documents

- [templates/swot-analysis.md](../templates/swot-analysis.md) — SWOT template
- [templates/per-file-political-intelligence.md](../templates/per-file-political-intelligence.md) — Per-file template with SWOT section
- [../../SWOT.md](../../SWOT.md) — Platform strategic SWOT (**formatting exemplar**)
- [political-risk-methodology.md](political-risk-methodology.md) — Complementary risk scoring
- [political-style-guide.md](political-style-guide.md) — Writing standards for SWOT entries
- [ai-driven-analysis-guide.md](ai-driven-analysis-guide.md) — Per-file analysis protocol

---

**Document Control:**
- **Path:** `/analysis/methodologies/political-swot-framework.md`
- **Adapted from:** [Riksdagsmonitor SWOT framework](https://github.com/Hack23/riksdagsmonitor/blob/main/analysis/methodologies/political-swot-framework.md)
- **Classification:** Public
- **Version:** 2.3 — Bumped version to 2.2; Added Advanced Technique 0 (Mandatory Evidence Citation Format per SWOT Item), Advanced Technique 5 (Temporal SWOT — Current vs. 90-Day Projected)
- **Next Review:** 2026-07-31
