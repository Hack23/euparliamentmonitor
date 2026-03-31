<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">✍️ Political Intelligence Style Guide — European Parliament</h1>

<p align="center">
  <strong>📊 Writing Standards for EU Parliamentary Political Analysis</strong><br>
  <em>🎯 Evidence Density · Attribution · Depth Levels · Multi-Language · Analytical Rigour</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-2.0-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--03--31-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Classification-Public-green?style=for-the-badge" alt="Classification"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 2.0 | **📅 Last Updated:** 2026-03-31 (UTC)
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-06-30
**🏢 Owner:** Hack23 AB (Org.nr 5595347807) | **🏷️ Classification:** Public

---

## 🎯 Purpose

This style guide establishes the writing standards for all political intelligence analysis produced by EU Parliament Monitor's agentic workflows. It ensures consistent analytical quality across 14 languages, mandates evidence-based claims, and defines the three depth levels that distinguish surface reporting from strategic intelligence.

This guide adapts [Hack23 ISMS STYLE_GUIDE.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/STYLE_GUIDE.md) conventions for political journalism. See [reference/isms-style-guide-adaptation.md](../reference/isms-style-guide-adaptation.md) for the full mapping.

---

## 🚨 Intelligence Depth Standards (New in v2.0)

### What Distinguishes Intelligence from Summary

| ✅ Intelligence Analysis | 🚫 Summary/Shallow Content |
|-------------------------|---------------------------|
| Explains **why** something matters, not just what happened | Restates what happened without interpretation |
| Identifies **who benefits and who loses** (cui bono) | Names no specific actors or interests |
| Cross-references with **other documents, votes, and trends** | Treats each document in isolation |
| Provides **forward-looking assessment** (what happens next?) | Only describes current state |
| Explicitly states **confidence level** and cites evidence | Makes claims without attribution |
| Identifies **tensions, contradictions, and hidden dynamics** | Only reports the official narrative |
| Uses **multiple analytical frameworks** (SWOT, Risk, Attack Tree) | Uses no framework or only one |

### Minimum Evidence Density Requirements

| Analysis Type | Min. Evidence Points | Min. EP Doc Citations | Min. Named Actors |
|-------------|:--------------------:|:--------------------:|:-----------------:|
| Per-file analysis | 3 | 2 | 2 |
| Daily SWOT | 8 (≥2 per quadrant) | 4 | 4 |
| Risk assessment | 5 | 3 | 3 |
| Threat analysis | 6 | 3 | 3 |
| Synthesis summary | 10 | 5 | 5 |

### Analytical Depth Indicators

Every analysis file should demonstrate at least 3 of these 5 depth indicators:

1. **Cui Bono Analysis** — Who benefits from this development? Who is harmed? Which political groups, MEPs, or EU institutions gain or lose?
2. **Second-Order Effects** — What cascading consequences follow from this event? How does this affect pending legislation, coalition dynamics, or institutional credibility?
3. **Historical Parallels** — Has the EP faced something similar before? What was the outcome? Reference prior legislative terms (EP6–EP9) where applicable.
4. **Counter-Factual Reasoning** — What would happen if the opposite occurred? What if the vote failed, the coalition fractured, or the rapporteur withdrew?
5. **Tension Identification** — What contradictions or competing interests does this reveal? Are political groups publicly stating one thing while voting differently?

---

## 📝 Three Depth Levels

All political analysis is written at one of three depth levels. The target depth is determined by the output type:

### Level 1 — Surface (News Summary)

**Target:** Citizens wanting a quick overview.
**Length:** 200–500 words.
**Structure:** Lead paragraph → Context → Key facts → Implications (1–2 sentences).
**Evidence:** Minimum 2 source citations.
**Confidence notation:** Not required (implied HIGH for published facts).

**Used by:** Breaking news articles, daily significance scores, classification results.

**Example:**
> The European Parliament voted 412–156 to approve the AI Act trilogue compromise on 13 March 2026. The regulation establishes risk-based categories for AI systems, with banned uses including social scoring and real-time biometric surveillance. All 27 member states must transpose the regulation within 24 months.

### Level 2 — Strategic (Analysis Article)

**Target:** Journalists, policy professionals, informed citizens.
**Length:** 800–2,000 words.
**Structure:** Lead → Political context → Stakeholder analysis → Risk assessment → Forward indicators.
**Evidence:** Minimum 5 source citations with EP document references.
**Confidence notation:** Required for all non-factual claims: `[HIGH/MEDIUM/LOW confidence]`.

**Used by:** Weekly intelligence briefs, committee reports, coalition dynamics articles.

**Example:**
> The EPP's decision to support the S&D amendment on the social climate fund represents a significant shift from its 2024 position [HIGH confidence]. This cross-group alliance, confirmed by roll-call vote RCV-2026-0342, suggests the grand coalition dynamic remains operational on social policy despite fractures on migration (see RCV-2026-0298 where EPP voted with ECR). The S&D rapporteur's willingness to accept EPP conditions on fiscal guardrails [MEDIUM confidence] indicates a pragmatic rather than ideological alliance.

### Level 3 — Intelligence (Deep Analysis)

**Target:** Professional analysts, decision-makers, research institutions.
**Length:** 2,000–5,000 words.
**Structure:** Executive summary → Methodology → Multi-dimensional analysis → Scenario modelling → Probability assessments → Forward indicators → Evidence appendix.
**Evidence:** Minimum 10 source citations; every claim attributed.
**Confidence notation:** Mandatory. Probability ranges for forward-looking assessments.

**Used by:** Monthly strategic briefs, coalition dynamics analysis, MEP influence scorecards, per-file deep analysis.

**Example:**
> **Coalition Fragmentation Probability (90-day window):** We assess a 25–35% probability [MEDIUM confidence] that the Renew Europe group will experience a formal split before the June 2026 plenary, based on three converging indicators: (1) French delegation voting against group line on 4 of 7 key votes in Q1 2026 (EP MCP voting records), (2) public statements by 3 Renew MEPs calling for group reform (EP speeches database), and (3) declining group cohesion from 78% to 61% over 6 months (EP MCP `analyze_voting_patterns`). Alternative hypothesis: the group leadership manages internal tensions through committee chair redistribution [LOW confidence, would require EPP cooperation].

---

## 📊 Evidence Density Requirements

Every analysis artifact must meet minimum evidence density thresholds:

| Analysis Type | Min. Citations | Min. EP Doc References | Min. MCP Data Points |
|--------------|:--------------:|:----------------------:|:--------------------:|
| Per-file analysis | 3 | 1 (the file itself) | 2 cross-references |
| Daily synthesis | 8 | 5 | 5 |
| Weekly brief | 15 | 10 | 10 |
| Monthly strategic brief | 30 | 20 | 20 |
| Coalition dynamics | 20 | 15 | 15 |
| MEP scorecard | 10 | 5 | 8 |

### Citation Format

**Inline citation:**
```
"EPP voting cohesion dropped to 72% in March 2026 (EP MCP analyze_voting_patterns, group=EPP, 2026-03)."
```

**EP document reference:**
```
"Resolution on AI Act (P9_TA(2026)0089), adopted 13 March 2026 with 412 votes in favour."
```

**MCP data reference:**
```
"Data source: european-parliament-mcp-server get_voting_records, dateFrom=2026-03-01, dateTo=2026-03-31"
```

---

## 👤 Attribution Standards

### EP Actor Attribution Rules

| Context | Format | Example |
|---------|--------|---------|
| First mention | Full name + role + group | "European Parliament President Roberta Metsola (EPP)" |
| Subsequent mentions | Last name or role | "Metsola" or "the EP President" |
| Political group | Full name + abbreviation | "European People's Party (EPP)" then "EPP" |
| Committee | Full name + abbreviation | "Committee on the Environment, Public Health and Food Safety (ENVI)" |
| Commissioner | Title + name + portfolio | "Commissioner Thierry Breton (Internal Market)" |

### EP Document Attribution Rules

All factual claims about EP actions **must** cite a verifiable reference:

| Claim Type | Required Citation |
|-----------|------------------|
| Legislation adopted/rejected | EP adopted text reference (e.g., P9_TA(2026)0089) + vote date |
| Committee recommendation | Committee document reference (e.g., PE-745.123/2026) |
| MEP statement | Speech reference from EP plenary (date + debate topic) |
| Roll-call vote result | RCV reference + vote counts (for/against/abstain) |
| Legislative procedure status | Procedure reference (e.g., 2024/0001(COD)) |
| Commission proposal | COM document number |

**Format:** `(EP ref: P9_TA(2026)0089)` or `(RCV-2026-0342, 412 for / 156 against / 12 abstain)`

### What Must Never Be Attributed Without Evidence

- Political group "plans" or "intends" (unless from official group position or adopted text)
- MEP "believes" or "feels" (unless from direct quote in plenary speech)
- Coalition "will" do X (unless from formal agreement or confirmed trilogue outcome)
- Poll-based claims without pollster name, sample size, and date
- Institutional "sources" without at minimum an EP document reference

---

## 🎨 Formatting Standards

### Document Header

Every analysis artifact must include:

```markdown
<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

**📋 Document Owner:** CEO | **📄 Version:** 1.0 | **📅 Analysis Date:** YYYY-MM-DD HH:MM UTC
**🏢 Owner:** Hack23 AB | **🏷️ Classification:** [PUBLIC/SENSITIVE/RESTRICTED]
```

### Emoji Conventions

| Emoji | Usage in Political Analysis |
|:-----:|----------------------------|
| 🎯 | Article purpose; key finding |
| 📊 | Significance scores; risk scores; quantitative data |
| ⚠️ | Risk assessment; coalition warning |
| ✅ | SWOT Strength; legislative success; verified claim |
| ❌ | SWOT Weakness; legislative failure |
| 🚀 | SWOT Opportunity |
| 🔴 | SWOT Threat; RESTRICTED sensitivity; CRITICAL risk |
| 🟢 | PUBLIC sensitivity; LOW risk; HIGH confidence |
| 🟡 | SENSITIVE sensitivity; MEDIUM risk/confidence |
| 🟠 | HIGH risk |
| ⚡ | Breaking news; significance ≥ 9.0 |
| 🏛️ | EU institution (Parliament, Commission, Council) |
| 🤝 | Coalition dynamics; cross-party cooperation |
| 🗳️ | Voting; electoral; roll-call |
| 🌍 | International dimension; geopolitical |
| 🔮 | Forward indicators; predictions |
| 👑 | Power concentration (Elevation threat) |
| 🎭 | Disinformation (Spoofing threat) |

### Policy Domain Icons

| Domain | Icon | EP Context |
|--------|:----:|-----------|
| Economics & Finance | 💰 | ECON committee, EU budget, ECB, fiscal policy |
| Defence & Security | 🛡️ | SEDE subcommittee, CSDP, NATO cooperation |
| Justice & Law | ⚖️ | JURI/LIBE committees, rule of law, judicial reform |
| Social Policy | 🤝 | EMPL committee, social climate fund, pensions |
| Health | 🏥 | ENVI committee (health portfolio), pharmaceutical regulation |
| Education & Research | 📚 | CULT committee, Horizon Europe, Erasmus+ |
| Environment & Climate | 🌿 | ENVI committee, Green Deal, ETS, biodiversity |
| Agriculture | 🌾 | AGRI committee, CAP reform, food security |
| Infrastructure & Transport | 🏗️ | TRAN committee, TEN-T, digital infrastructure |
| Energy | ⚡ | ITRE committee, energy security, REPowerEU |
| Foreign Affairs | 🌍 | AFET committee, EU external action, sanctions |
| Migration & Asylum | 🔀 | LIBE committee, EU Pact on Migration and Asylum |
| Constitutional Affairs | 🏛️ | AFCO committee, treaty reform, EP elections |
| Trade | 🔄 | INTA committee, trade agreements, WTO |
| Digital & Technology | 💻 | ITRE/IMCO committees, AI Act, Digital Markets Act |
| Budget | 📋 | BUDG/CONT committees, MFF, EU budget discharge |

### Mermaid Diagram Standards

All analysis artifacts must include **at least one colour-coded Mermaid diagram**. Standards:

- Use the standard colour palette: `#dc3545` (red/critical), `#fd7e14` (orange/high), `#ffc107` (yellow/medium), `#28a745` (green/low), `#0d6efd` (blue/info), `#6f42c1` (purple/special)
- Use `{N}`, `{x}`, `{y}`, `{YYYY-MM}` placeholders in templates (never hardcoded values)
- Include `⚠️ AI Agent: Replace placeholders with actual data` notes in templates
- Apply `style` directives for colour coding — never rely on default grey

---

## 🚫 Anti-Patterns (Prohibited)

The following patterns are **REJECTED** in all analysis output:

| Anti-Pattern | Why Prohibited | Correct Alternative |
|-------------|---------------|-------------------|
| Plain prose without tables | Not scannable; impossible to compare across days | Use structured tables with evidence columns |
| Claims without confidence | Reader cannot assess reliability | Always append `[HIGH/MEDIUM/LOW confidence]` |
| Opinions without evidence | Violates evidence-based methodology | Cite EP document ID, MCP tool output, or named source |
| Generic statements ("things are uncertain") | Zero informational value | Quantify: "35–45% probability of X based on Y evidence" |
| Software-centric threat models (e.g. STRIDE, DREAD) | Designed for software bugs, not political dynamics; forced mappings produce superficial analysis | Use Political Threat Landscape, Diamond Model, Attack Trees, PESTLE, Scenario Planning |
| Hardcoded Mermaid values in templates | Propagate to generated output as fake data | Use `{N}`, `{x}`, `{y}` placeholders |
| Script-generated boilerplate | "Scripted crap content" — violates analytical mandate | AI must read methodology, analyse data, produce original analysis |
| Overwriting previous analysis | Destroys audit trail; loses temporal context | Each workflow writes to `analysis/{date}/{article-type-slug}/` |

### Good vs. Bad Examples

**❌ BAD (scripted, shallow, no evidence):**
```markdown
## Risk Assessment
The political situation is complex. There are various risks including coalition instability
and policy challenges. The overall risk level is medium.
```

**✅ GOOD (evidence-based, structured, quantified):**
```markdown
## ⚖️ Risk Assessment

| Risk Type | Likelihood (1–5) | Impact (1–5) | Score | Assessment |
|-----------|:-:|:-:|:-:|------------|
| Grand Coalition Fracture | 2 | 4 | 8 🟡 | EPP-S&D alignment dropped from 68% to 54% over Q1 2026 (EP MCP `compare_political_groups`) [MEDIUM confidence] |
| ECR-PfE Merger | 3 | 3 | 9 🟡 | 12 ECR MEPs co-signed PfE initiative on migration (P9_TA(2026)0102) [HIGH confidence] |
| Budget Deadlock | 2 | 5 | 10 🟠 | BUDG committee failed to reach compromise by March deadline (EP MCP `get_committee_info`) [HIGH confidence] |
```

---

## 🌍 Multi-Language Standards

All analysis produced in English serves as the source for 13 additional languages. Writing conventions that support accurate translation:

1. **Avoid idioms** — "The bill sailed through committee" → "The committee approved the bill by a large margin"
2. **Use full titles on first reference** — "European People's Party (EPP)" not just "EPP"
3. **Spell out abbreviations** — "Member of the European Parliament (MEP)" on first use
4. **Consistent terminology** — Always use the same English term for the same concept (never alternate between "political group" and "party group")
5. **Active voice** — "The Parliament voted to approve" not "Approval was voted on"
6. **EP-specific terms** — Use official EP terminology: "rapporteur" (not "lead legislator"), "trilogue" (not "three-way negotiation"), "plenary" (not "full session")

---

## 🔗 Related Documents

- [political-classification-guide.md](political-classification-guide.md) — Classification methodology
- [political-risk-methodology.md](political-risk-methodology.md) — Risk scoring
- [political-swot-framework.md](political-swot-framework.md) — SWOT methodology
- [political-threat-framework.md](political-threat-framework.md) — Threat analysis
- [ai-driven-analysis-guide.md](ai-driven-analysis-guide.md) — Per-file AI analysis protocol
- [reference/isms-style-guide-adaptation.md](../reference/isms-style-guide-adaptation.md) — ISMS mapping

---

**Document Control:**
- **Path:** `/analysis/methodologies/political-style-guide.md`
- **ISMS Reference:** [STYLE_GUIDE.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/STYLE_GUIDE.md)
- **Classification:** Public
- **Next Review:** 2026-06-30
