<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">👥 Stakeholder Impact Assessment Template</h1>

<p align="center">
  <strong>📊 Structured Impact Analysis Across Swedish Society</strong><br>
  <em>🎯 Citizens · Government · Opposition · Business · Civil Society · International · Judiciary · Media</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-2.3-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--06--01-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Classification-Public-green?style=for-the-badge" alt="Classification"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 2.3 | **📅 Last Updated:** 2026-06-01 (UTC)  
**🏢 Owner:** Hack23 AB (Org.nr 5595347807) | **🏷️ Classification:** Public

> **📌 Template Instructions:** Copy to `analysis/daily/YYYY-MM-DD/{articleType}/` and save as `stakeholder-impact.md` in the workflow's own folder (never overwrite another workflow's files). Complete the context block first, then assess each stakeholder group with specific evidence. AI must provide genuine impact analysis with named actors and dok_id citations — not generic "may affect business" prose.

> **🚨 Anti-Pattern Warning:** Generic stakeholder statements like "this may affect business environment" or "citizens may be impacted" without specific evidence are REJECTED. Every stakeholder assessment MUST name specific actors, cite specific documents, and provide specific impact mechanisms. See [ai-driven-analysis-guide.md](../methodologies/ai-driven-analysis-guide.md) for good vs. bad examples.


---

## 📋 Assessment Context

| Field | Value |
|-------|-------|
| **Assessment ID** | `[REQUIRED: STA-YYYY-MM-DD-NNN]` |
| **Assessment Date** | `[REQUIRED: YYYY-MM-DD HH:MM UTC]` |
| **Policy/Event Subject** | `[REQUIRED: brief name of the policy decision or event being assessed]` |
| **Primary dok_id** | `[REQUIRED: Riksdag document ID]` |
| **Stage of Process** | `[REQUIRED: e.g. "Proposition submitted", "Committee vote", "Riksdag vote", "Government decree"]` |
| **Produced By** | `[REQUIRED: workflow name]` |
| **Overall Impact Level** | `[REQUIRED: HIGH / MEDIUM / LOW — based on highest stakeholder impact]` |

---

## 👥 Stakeholder Group Assessments

### Stakeholder Impact Overview

> **AI Instructions:** After completing each stakeholder assessment, update this diagram with actual impact levels (HIGH/MEDIUM/LOW/NONE). Node colors represent **stakeholder group types** (not impact tiers): purple = citizens, green = government/civil society, red = opposition, orange = business, blue = international/policy.

```mermaid
graph TD
    subgraph "📄 Policy Impact Assessment"
        DOC["📄 Policy/Event"]
    end

    subgraph "🏛️ Political Actors"
        CIT["🏘️ Citizens<br/>Impact: [H/M/L/N]"]
        GOV["🏛️ Government<br/>Impact: [H/M/L/N]"]
        OPP["🗳️ Opposition<br/>Impact: [H/M/L/N]"]
    end

    subgraph "💼 Societal Actors"
        BIZ["🏭 Business<br/>Impact: [H/M/L/N]"]
        CIV["🤝 Civil Society<br/>Impact: [H/M/L/N]"]
        INT["🌍 International<br/>Impact: [H/M/L/N]"]
    end

    DOC --> CIT
    DOC --> GOV
    DOC --> OPP
    DOC --> BIZ
    DOC --> CIV
    DOC --> INT

    style DOC fill:#1565C0,color:#FFFFFF
    style CIT fill:#7B1FA2,color:#FFFFFF
    style GOV fill:#4CAF50,color:#FFFFFF
    style OPP fill:#D32F2F,color:#FFFFFF
    style BIZ fill:#FF9800,color:#FFFFFF
    style CIV fill:#4CAF50,color:#FFFFFF
    style INT fill:#1565C0,color:#FFFFFF
```

### 🏘️ Group 1: Citizens (Direct Impact)

*How directly does this policy affect Swedish citizens' daily lives, rights, welfare, or finances?*

| Parameter | Value |
|-----------|-------|
| **Impact Level** | `[REQUIRED: HIGH / MEDIUM / LOW / NONE]` |
| **Impact Timeline** | `[REQUIRED: IMMEDIATE (0–30 days) / SHORT (1–6 months) / MEDIUM (6–18 months) / LONG (18+ months)]` |
| **Affected Population** | `[REQUIRED: e.g. "All 10.5M residents", "Pensioners 65+", "Urban renters", "Asylum seekers"]` |
| **Impact Type** | `[REQUIRED: FINANCIAL / LEGAL / SOCIAL / HEALTH / EDUCATIONAL / COMBINATION]` |
| **Evidence Sources** | `[REQUIRED: dok_id(s), SCB statistics ref, or budget document]` |
| **Confidence Level** | `[REQUIRED: VERY HIGH / HIGH / MEDIUM / LOW / VERY LOW]` |

**Citizen Impact Narrative:**  
`[REQUIRED: 2–4 sentences explaining how ordinary citizens experience this change. Be specific about amounts (SEK), eligibility criteria, timelines, and regional variation if applicable. Reference the scripts/analysis-framework/lenses/citizen.ts perspective framework.]`

**Vulnerable Groups:** `[OPTIONAL: e.g. "Disproportionate impact on low-income households, asylum seekers, rural elderly"]`

---

### 🏛️ Group 2: Government Coalition

*How does this policy affect the governing coalition's political standing, internal cohesion, and electoral positioning?*

| Parameter | Value |
|-----------|-------|
| **Impact Level** | `[REQUIRED: HIGH / MEDIUM / LOW / NONE]` |
| **Impact Timeline** | `[REQUIRED: IMMEDIATE / SHORT / MEDIUM / LONG]` |
| **Primary Affected Parties** | `[REQUIRED: e.g. "M (primary), SD (secondary), KD (minor)"]` |
| **Coalition Cohesion Effect** | `[REQUIRED: STRENGTHENS / NEUTRAL / STRAINS / FRACTURES]` |
| **Evidence Sources** | `[REQUIRED: dok_id, debate ref, or interpellation]` |
| **Confidence Level** | `[REQUIRED: VERY HIGH / HIGH / MEDIUM / LOW / VERY LOW]` |

**Government Coalition Impact Narrative:**  
`[REQUIRED: 2–3 sentences. Reference scripts/analysis-framework/lenses/government.ts.]`

---

### 🗳️ Group 3: Opposition Parties

*How does this policy affect opposition parties' strategic positioning, electoral prospects, and legislative influence?*

| Parameter | Value |
|-----------|-------|
| **Impact Level** | `[REQUIRED: HIGH / MEDIUM / LOW / NONE]` |
| **Impact Timeline** | `[REQUIRED: IMMEDIATE / SHORT / MEDIUM / LONG]` |
| **Primary Affected Parties** | `[REQUIRED: e.g. "S (gains credibility), V (opposition opportunity), MP (marginalised)"]` |
| **Electoral Positioning Effect** | `[REQUIRED: POSITIVE / NEUTRAL / NEGATIVE — from opposition perspective]` |
| **Evidence Sources** | `[REQUIRED: anföranden refs or motion dok_ids]` |
| **Confidence Level** | `[REQUIRED: VERY HIGH / HIGH / MEDIUM / LOW / VERY LOW]` |

**Opposition Impact Narrative:**  
`[REQUIRED: 2–3 sentences. Reference scripts/analysis-framework/lenses/opposition.ts.]`

---

### 🏭 Group 4: Business Sector

*How does this policy affect Swedish businesses, industries, labour market, and economic competitiveness?*

| Parameter | Value |
|-----------|-------|
| **Impact Level** | `[REQUIRED: HIGH / MEDIUM / LOW / NONE]` |
| **Impact Timeline** | `[REQUIRED: IMMEDIATE / SHORT / MEDIUM / LONG]` |
| **Most Affected Sectors** | `[REQUIRED: e.g. "Construction, real estate, manufacturing", "Financial services"]` |
| **Economic Impact Type** | `[REQUIRED: COMPLIANCE COST / MARKET OPPORTUNITY / REGULATORY BURDEN / TAX CHANGE / OTHER]` |
| **Estimated Financial Impact** | `[OPTIONAL: e.g. "±X BSEK annually per Finansdepartementet estimate"]` |
| **Evidence Sources** | `[REQUIRED: proposition dok_id, Riksbank ref, or SOU]` |
| **Confidence Level** | `[REQUIRED: VERY HIGH / HIGH / MEDIUM / LOW / VERY LOW]` |

**Business Sector Impact Narrative:**  
`[REQUIRED: 2–3 sentences. Reference scripts/analysis-framework/lenses/economic.ts.]`

---

### 🤝 Group 5: Civil Society

*How does this policy affect NGOs, trade unions, religious organisations, advocacy groups, and civic institutions?*

| Parameter | Value |
|-----------|-------|
| **Impact Level** | `[REQUIRED: HIGH / MEDIUM / LOW / NONE]` |
| **Impact Timeline** | `[REQUIRED: IMMEDIATE / SHORT / MEDIUM / LONG]` |
| **Most Affected Organisations** | `[REQUIRED: e.g. "LO, TCO (labour)", "Rädda Barnen (welfare)", "Greenpeace (environment)"]` |
| **Civil Society Response** | `[REQUIRED: SUPPORTIVE / NEUTRAL / OPPOSED / DIVIDED]` |
| **Evidence Sources** | `[REQUIRED: remissvar refs, consultation documents, or media statements]` |
| **Confidence Level** | `[REQUIRED: VERY HIGH / HIGH / MEDIUM / LOW / VERY LOW]` |

**Civil Society Impact Narrative:**  
`[REQUIRED: 2–3 sentences.]`

---

### 🌍 Group 6: International / EU

*How does this policy affect Sweden's international relationships, EU obligations, treaty compliance, or bilateral agreements?*

| Parameter | Value |
|-----------|-------|
| **Impact Level** | `[REQUIRED: HIGH / MEDIUM / LOW / NONE]` |
| **Impact Timeline** | `[REQUIRED: IMMEDIATE / SHORT / MEDIUM / LONG]` |
| **Affected Relationships** | `[REQUIRED: e.g. "EU Commission (sanctions risk)", "NATO allies", "Nordic Council"]` |
| **Treaty/Directive Compliance** | `[REQUIRED: COMPLIANT / AT RISK / NON-COMPLIANT / UNCERTAIN]` |
| **Evidence Sources** | `[REQUIRED: EU directive refs, international agreement dok_ids]` |
| **Confidence Level** | `[REQUIRED: VERY HIGH / HIGH / MEDIUM / LOW / VERY LOW]` |

**International Impact Narrative:**  
`[REQUIRED: 2–3 sentences. Reference scripts/analysis-framework/lenses/international.ts.]`

---

## 📊 Impact Summary Matrix

> *Numeric encoding for internal analysis: NONE = 0, LOW = 1, MEDIUM = 2, HIGH = 3 (map to the Impact Level column).*

| Stakeholder Group | Impact Level | Timeline | Confidence | Net Political Effect |
|-------------------|:------------:|:--------:|:----------:|---------------------|
| 🏘️ Citizens | `[H/M/L/N]` | `[I/S/M/L]` | `[H/M/L]` | `[REQUIRED: positive/negative/neutral]` |
| 🏛️ Gov Coalition | `[H/M/L/N]` | `[I/S/M/L]` | `[H/M/L]` | `[REQUIRED]` |
| 🗳️ Opposition | `[H/M/L/N]` | `[I/S/M/L]` | `[H/M/L]` | `[REQUIRED]` |
| 🏭 Business | `[H/M/L/N]` | `[I/S/M/L]` | `[H/M/L]` | `[REQUIRED]` |
| 🤝 Civil Society | `[H/M/L/N]` | `[I/S/M/L]` | `[H/M/L]` | `[REQUIRED]` |
| 🌍 International | `[H/M/L/N]` | `[I/S/M/L]` | `[H/M/L]` | `[REQUIRED]` |
| ⚖️ Judiciary | `[H/M/L/N]` | `[I/S/M/L]` | `[H/M/L]` | `[REQUIRED]` |
| 📰 Media | `[H/M/L/N]` | `[I/S/M/L]` | `[H/M/L]` | `[REQUIRED]` |

---

## 🔑 Key Insights

`[REQUIRED: 3–5 sentences identifying the most significant stakeholder dynamics. Which groups are in tension? Where are unexpected winners/losers? What are the second-order political effects? Reference specific stakeholder interactions.]`

### Conflicting Impact Resolution

When stakeholder impacts conflict (e.g., Citizens benefit but Business bears costs):

| Pattern | Overall Assessment | Editorial Framing |
|---------|-------------------|-------------------|
| Citizens positive + Business negative | **Politically significant** — redistribution dynamic | Lead with citizen impact; note business costs |
| Government positive + Opposition negative | **Standard partisan** — expected dynamics | Present both perspectives equally |
| Citizens negative + Government positive | **Accountability concern** — policy vs. people | Lead with citizen impact; scrutinize government rationale |
| All stakeholders negative | **System-level problem** — policy failure signal | Frame as shared challenge requiring cross-party response |
| All stakeholders positive | **Rare consensus** — highlight cross-party achievement | Note rarity; check for hidden costs or losers |

**Publish Recommendation:** `[REQUIRED: YES — HIGH public interest / YES — MEDIUM interest / MONITOR — low standalone value]`

---

## ⚖️ Stakeholder Group: Judiciary (Domstolsväsendet)

_Note: In the Extended Impact Summary Matrix, stakeholder groups may appear in a different row order. Always cross‑reference by stakeholder name (e.g. "Judiciary") rather than by numeric group or row number._

*How does this policy affect judicial independence, court workload, legal precedent, or constitutional compliance?*

| Parameter | Value |
|-----------|-------|
| **Impact Level** | `[REQUIRED: HIGH / MEDIUM / LOW / NONE]` |
| **Impact Timeline** | `[REQUIRED: IMMEDIATE / SHORT / MEDIUM / LONG]` |
| **Affected Institutions** | `[REQUIRED: e.g. "Högsta domstolen", "Förvaltningsrätten", "Kammarrätten", "JO (Justitieombudsmannen)"]` |
| **Constitutional Compliance** | `[REQUIRED: COMPLIANT / CONSTITUTIONAL RISK / UNDER REVIEW / UNCERTAIN]` |
| **Legal Precedent Impact** | `[REQUIRED: NONE / MINOR ADJUSTMENT / SIGNIFICANT SHIFT / NEW PRECEDENT]` |
| **Evidence Sources** | `[REQUIRED: Lagrådet remiss, SOU dok_id, or constitutional analysis]` |
| **Confidence Level** | `[REQUIRED: VERY HIGH / HIGH / MEDIUM / LOW / VERY LOW]` |

**Judiciary Impact Narrative:**  
`[REQUIRED: 2–3 sentences. Consider Lagrådet opinions, constitutional implications under Regeringsformen (RF), court capacity, and effects on rule-of-law guarantees. Note any EU Charter of Fundamental Rights interactions.]`

---

## 📰 Stakeholder Group: Media & Public Discourse

*How does this policy affect media coverage dynamics, public debate framing, and information ecosystem?*

| Parameter | Value |
|-----------|-------|
| **Impact Level** | `[REQUIRED: HIGH / MEDIUM / LOW / NONE]` |
| **Impact Timeline** | `[REQUIRED: IMMEDIATE / SHORT / MEDIUM / LONG]` |
| **Media Salience** | `[REQUIRED: DOMINANT STORY / SIGNIFICANT / MINOR / NEGLIGIBLE]` |
| **Framing Dynamics** | `[REQUIRED: e.g. "Government frames as security; opposition as civil liberties threat"]` |
| **Key Media Actors** | `[REQUIRED: e.g. "SVT Nyheter, DN ledare, Expressen, SR Ekot"]` |
| **Evidence Sources** | `[REQUIRED: media monitoring refs, press conference dok_ids, or debate transcripts]` |
| **Confidence Level** | `[REQUIRED: VERY HIGH / HIGH / MEDIUM / LOW / VERY LOW]` |

**Media Impact Narrative:**  
`[REQUIRED: 2–3 sentences. Reference scripts/analysis-framework/lenses/media.ts. Describe the anticipated media cycle, competing narratives, and whether the issue will sustain public attention or be displaced.]`

---

## 📊 Extended Impact Summary Matrix

> **AI Instructions:** This extended matrix consolidates all 8 stakeholder groups including Judiciary and Media — use it for the final editorial-quality overview. Populate after completing ALL individual assessments above.

| # | Stakeholder Group | Impact Level | Timeline | Confidence | Net Effect | Key Risk / Opportunity |
|:-:|-------------------|:------------:|:--------:|:----------:|:----------:|------------------------|
| 1 | 🏛️ Government Coalition | `[H/M/L/N]` | `[I/S/M/L]` | `[H/M/L]` | `[positive/negative/neutral]` | `[REQUIRED: one-line risk or opportunity]` |
| 2 | 🗳️ Opposition Bloc (S+V+MP+C) | `[H/M/L/N]` | `[I/S/M/L]` | `[H/M/L]` | `[positive/negative/neutral]` | `[REQUIRED]` |
| 3 | 👥 Citizens | `[H/M/L/N]` | `[I/S/M/L]` | `[H/M/L]` | `[positive/negative/neutral]` | `[REQUIRED]` |
| 4 | 💰 Business & Industry | `[H/M/L/N]` | `[I/S/M/L]` | `[H/M/L]` | `[positive/negative/neutral]` | `[REQUIRED]` |
| 5 | ⚖️ Judiciary | `[H/M/L/N]` | `[I/S/M/L]` | `[H/M/L]` | `[positive/negative/neutral]` | `[REQUIRED]` |
| 6 | 📰 Media | `[H/M/L/N]` | `[I/S/M/L]` | `[H/M/L]` | `[positive/negative/neutral]` | `[REQUIRED]` |
| 7 | 🤝 Civil Society | `[H/M/L/N]` | `[I/S/M/L]` | `[H/M/L]` | `[positive/negative/neutral]` | `[REQUIRED]` |
| 8 | 🌍 International Partners (EU, Nordic) | `[H/M/L/N]` | `[I/S/M/L]` | `[H/M/L]` | `[positive/negative/neutral]` | `[REQUIRED]` |

> *Legend — Impact: **H**igh/**M**edium/**L**ow/**N**one · Timeline: **I**mmediate/**S**hort/**M**edium/**L**ong · Confidence: **H**igh/**M**edium/**L**ow*

---

## 🔑 Extended Key Insights & Editorial Guidance

`[REQUIRED: 3–5 sentences identifying the most significant stakeholder dynamics. Which groups are in tension? Where are unexpected winners/losers? What are the second-order political effects? Consider cross-cutting themes: does this policy create new coalition fault lines, shift the Overton window, or establish precedents that constrain future governments?]`

### Inter-Stakeholder Tension Map

> **AI Instructions:** Identify the two strongest stakeholder tensions and describe the political mechanism. This drives editorial angle selection.

| Tension Pair | Direction | Mechanism | Editorial Relevance |
|--------------|:---------:|-----------|---------------------|
| `[e.g. Citizens ↔ Business]` | `[→ or ←]` | `[REQUIRED: e.g. "Higher employer taxes fund citizen benefit, reducing business competitiveness"]` | `[HIGH/MEDIUM/LOW]` |
| `[e.g. Government ↔ Judiciary]` | `[→ or ←]` | `[REQUIRED: e.g. "Fast-tracked legislation bypasses Lagrådet, raising constitutional concerns"]` | `[HIGH/MEDIUM/LOW]` |

**Publish Recommendation:** `[REQUIRED: YES — HIGH interest / YES — MEDIUM interest / MONITOR — low standalone value]`  
**Recommended Article Type:** `[REQUIRED: BREAKING / ANALYSIS / DEEP-DIVE / MONITOR-ONLY]`  
**Suggested Headline Angle:** `[REQUIRED: one sentence framing the most newsworthy stakeholder dynamic]`

---

## 📂 MCP Data Files Used

> **AI Instructions:** List ALL `analysis/daily/YYYY-MM-DD/{articleType}/data/` files consulted during this assessment. This ensures traceability and reproducibility. Include both Riksdag and Regering data sources accessed via MCP tools.

| # | File Path | Data Type | Freshness | Notes |
|:-:|-----------|-----------|:---------:|-------|
| 1 | `[REQUIRED: e.g. analysis/daily/2026-03-30/budget-analysis/data/proposition.json]` | `[e.g. Proposition]` | `[REQUIRED: date]` | `[brief relevance note]` |
| 2 | `[REQUIRED: e.g. analysis/daily/2026-03-30/budget-analysis/data/votering.json]` | `[e.g. Voting record]` | `[REQUIRED: date]` | `[brief relevance note]` |
| 3 | `[REQUIRED: additional data file]` | `[type]` | `[date]` | `[note]` |

### MCP Tools Invoked

| Tool | Purpose | Parameters |
|------|---------|------------|
| `[REQUIRED: e.g. search_dokument]` | `[e.g. "Fetched proposition H901FiU1"]` | `[key params used]` |
| `[REQUIRED: e.g. search_voteringar]` | `[e.g. "Voting records for bet 2024/25:FiU1"]` | `[key params used]` |
| `[REQUIRED: e.g. search_regering]` | `[e.g. "Government press releases on budget"]` | `[key params used]` |

> **Traceability Note:** Every factual claim in the stakeholder assessments above MUST be traceable to a file or MCP tool invocation listed in this section. Unsubstantiated claims are REJECTED during editorial review.

---

## 📊 Stakeholder Position Change Tracking

> **AI Instructions:** Track how stakeholder positions changed as a result of this policy/event compared to their previous known stance. This enables longitudinal stakeholder analysis.

| Stakeholder | Position BEFORE This Document | Position AFTER This Document | Shift Direction | Evidence |
|------------|------------------------------|-----------------------------:|:---------------:|---------|
| `[REQUIRED: e.g. Government Coalition]` | `[e.g. Strong support for reform]` | `[e.g. Qualified support — SD demands amendments]` | `[→ weakened / → strengthened / → unchanged]` | `[dok_id]` |
| `[REQUIRED: e.g. Opposition (S)]` | `[e.g. Opposed on principle]` | `[e.g. Offers conditional support on amendment]` | `[→ softened / → hardened / → unchanged]` | `[dok_id]` |
| `[REQUIRED: e.g. Business Sector]` | `[previous stance]` | `[current stance]` | `[shift]` | `[evidence]` |
| `[OPTIONAL]` | `[previous]` | `[current]` | `[shift]` | `[evidence]` |

**Most Significant Position Shift:** `[REQUIRED: Which stakeholder shifted most and why?]`

---

## 📐 Power-Interest Grid

> **AI Instructions:** Place each stakeholder on the Power-Interest grid to determine engagement strategy. Power = ability to influence policy outcomes. Interest = stake in this specific policy.

```mermaid
%%{init: {
  "theme": "dark",
  "themeVariables": {
    "quadrant1Fill": "#1565C0",
    "quadrant2Fill": "#2E7D32",
    "quadrant3Fill": "#FF9800",
    "quadrant4Fill": "#D32F2F",
    "quadrantTitleFill": "#FFFFFF",
    "quadrantPointFill": "#FFFFFF",
    "quadrantPointTextFill": "#FFFFFF",
    "quadrantXAxisTextFill": "#FFFFFF",
    "quadrantYAxisTextFill": "#FFFFFF"
  },
  "quadrantChart": {
    "chartWidth": 700,
    "chartHeight": 700,
    "pointLabelFontSize": 14,
    "titleFontSize": 20,
    "quadrantLabelFontSize": 16,
    "xAxisLabelFontSize": 14,
    "yAxisLabelFontSize": 14
  }
}}%%
quadrantChart
    title 🤝 Stakeholder Power-Interest Grid
    x-axis Low Interest --> High Interest
    y-axis Low Power --> High Power
    quadrant-1 MANAGE CLOSELY
    quadrant-2 KEEP SATISFIED
    quadrant-3 MONITOR
    quadrant-4 KEEP INFORMED

    "🏛️ Government Coalition": [0.80, 0.90]
    "🏛️ Opposition (S)": [0.70, 0.60]
    "👥 Citizens": [0.60, 0.30]
    "💼 Business": [0.50, 0.50]
    "🤝 Civil Society": [0.40, 0.20]
    "🇪🇺 International/EU": [0.30, 0.40]
    "⚖️ Judiciary": [0.20, 0.70]
    "📺 Media": [0.70, 0.20]
```

> **AI Instructions:** Replace the placeholder coordinates with actual Power (y) and Interest (x) values between 0.0–1.0 based on the assessment. Position labels should reference actual actor names.

| Stakeholder | Power (0–1.0) | Interest (0–1.0) | Grid Position | Engagement Strategy |
|------------|:-------------:|:----------------:|:-------------:|---------------------|
| `[Government]` | `[0.0–1.0]` | `[0.0–1.0]` | `[Manage Closely / Keep Satisfied / Keep Informed / Monitor]` | `[1 sentence]` |
| `[Opposition]` | `[0.0–1.0]` | `[0.0–1.0]` | `[grid position]` | `[1 sentence]` |
| `[Citizens]` | `[0.0–1.0]` | `[0.0–1.0]` | `[grid position]` | `[1 sentence]` |
| `[Business]` | `[0.0–1.0]` | `[0.0–1.0]` | `[grid position]` | `[1 sentence]` |

---

## 🗳️ Election 2026 Stakeholder Effects

| Dimension | Assessment | Evidence |
|-----------|------------|----------|
| **Electoral Impact** | `[REQUIRED: How do stakeholder dynamics affect September 2026 election positioning?]` | `[Specific evidence]` |
| **Coalition Scenarios** | `[REQUIRED: Which stakeholder coalitions benefit/suffer from current policies?]` | `[Evidence]` |
| **Voter Salience** | `[REQUIRED: Which stakeholder groups translate most directly into voter blocs?]` | `[Evidence]` |
| **Campaign Vulnerability** | `[REQUIRED: Which stakeholder harms create campaign attack vectors for opposition?]` | `[Evidence]` |
| **Policy Legacy** | `[REQUIRED: Which stakeholder wins/losses will define the electoral narrative?]` | `[Evidence]` |

**Overall Electoral Significance**: `[REQUIRED: CRITICAL/HIGH/MODERATE/LOW/NEGLIGIBLE]`

**Most Likely Electoral Narrative**: `[REQUIRED: How will stakeholder impacts be framed in the 2026 campaign?]`

### Stakeholder Voting Bloc Alignment (Election 2026)

| Stakeholder Group | Size (est. voters) | Current Policy Disposition | Swing Potential | Electoral Risk |
|------------------|--------------------|---------------------------|:---------------:|:-------------:|
| Citizens — Welfare-dependent | `[OPTIONAL: e.g. ~1.5M]` | `[OPTIONAL: favourable/neutral/unfavourable]` | `[HIGH/MED/LOW]` | `[tier]` |
| Citizens — Working age | `[OPTIONAL]` | `[OPTIONAL]` | `[HIGH/MED/LOW]` | `[tier]` |
| Business / Industry | `[OPTIONAL]` | `[OPTIONAL]` | `[HIGH/MED/LOW]` | `[tier]` |
| Civil Society orgs | `[OPTIONAL]` | `[OPTIONAL]` | `[HIGH/MED/LOW]` | `[tier]` |

---

## 🎯 Confidence Scale Reference (5-Level)

| Level | Label | Criteria | Evidence Threshold |
|-------|-------|----------|--------------------|
| ⬛ 1 | **VERY LOW** | Speculation only, single unverified source | 0–1 sources, no corroboration |
| 🟥 2 | **LOW** | Circumstantial evidence, indirect indicators | 2 sources, indirect evidence |
| 🟧 3 | **MEDIUM** | Multiple independent sources, moderate corroboration | 3+ sources, moderate agreement |
| 🟩 4 | **HIGH** | Official records, documented data, direct evidence | Official docs, voting records, committee reports |
| 🟦 5 | **VERY HIGH** | Verified data + independent corroboration + expert consensus | Multiple official sources, cross-validated |

---

## 🔗 Cross-References

> *Link to sibling analysis files and same-day analysis from other article types.*

| Related Analysis File | Relationship | Key Finding |
|----------------------|-------------|-------------|
| `[REQUIRED: e.g. risk-assessment.md]` | `[stakeholder impacts inform risk scoring]` | `[1 sentence]` |
| `[REQUIRED: e.g. swot-analysis.md]` | `[stakeholder dynamics map to SWOT entries]` | `[1 sentence]` |
| `[REQUIRED: e.g. synthesis-summary.md]` | `[stakeholder overview consumed by synthesis]` | `[1 sentence]` |
| `[OPTIONAL: same-day analysis from different article type]` | `[cross-reference]` | `[1 sentence]` |

---

## ✅ Quality Self-Check Checklist

> **Pre-commit validation — every item MUST be checked before finalising this assessment.**

- [ ] **Assessment Context complete:** All metadata fields filled (ID, date, subject, dok_id, stage, producer, overall impact)
- [ ] **All 8 stakeholder groups assessed:** Citizens, Government, Opposition, Business, Civil Society, International, Judiciary, Media
- [ ] **Specific evidence on every group:** No generic "may affect" prose — every impact claims specific actors, mechanisms, and evidence
- [ ] **Election 2026 Stakeholder Effects present:** All 5 dimensions assessed with Voting Bloc Alignment table
- [ ] **5-level confidence applied:** Stakeholder impact confidence uses the full scale where applicable
- [ ] **Named actors cited:** ≥3 named politicians/parties/organisations with specific roles
- [ ] **Impact Summary Matrix filled:** All 8 rows in Extended Impact Summary Matrix have levels, timelines, confidence
- [ ] **Inter-Stakeholder Tensions identified:** ≥2 tension pairs with mechanisms and editorial relevance
- [ ] **Position Change Tracking filled:** ≥3 stakeholders tracked with before/after positions
- [ ] **Power-Interest Grid rendered:** Mermaid quadrant chart with actual stakeholder positions
- [ ] **Conflicting Impact Resolution applied:** Editorial framing pattern selected when stakeholder impacts conflict
- [ ] **MCP Data Provenance:** All files and tools listed; every factual claim traceable
- [ ] **No placeholder text remaining:** Search for `[REQUIRED` — zero hits expected
- [ ] **Publish Recommendation provided:** YES/MONITOR with article type and suggested headline angle
- [ ] **Cross-references linked:** At least 2 sibling analysis files referenced

---

**Document Control:**  
- **Template Path:** `/analysis/templates/stakeholder-impact.md`  
- **Version:** 2.3  
- **Effective Date:** 2026-06-01 (UTC)
- **Key Changes v2.3:** Added Election 2026 Stakeholder Effects section with Voting Bloc Alignment table, 5-level confidence scale reference, updated quality checklist  
- **Lens References:** `scripts/analysis-framework/lenses/` (citizen, economic, government, international, media, opposition)  
- **Framework Reference:** [methodologies/political-style-guide.md](../methodologies/political-style-guide.md)  
- **Advanced Sections:** Position Change Tracking, Power-Interest Grid  
- **ISMS Alignment:** ISO 27001:2022 A.5.7 (Threat Intelligence), NIST CSF 2.0 ID.RA (Risk Assessment)  
- **Classification:** Public  
- **Owner:** Hack23 AB (Org.nr 5595347807)  
- **Next Review:** 2026-06-30
