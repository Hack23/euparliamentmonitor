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
  <a href="#"><img src="https://img.shields.io/badge/Version-2.7-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--05--01-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Classification-Public-green?style=for-the-badge" alt="Classification"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 2.7 | **📅 Last Updated:** 2026-05-01 (UTC)
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-07-31
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

## 🗞️ The Economist-Style Analytical Writing Patterns (New in v2.2)

EU Parliament Monitor analysis must emulate The Economist's editorial voice: authoritative, precise, and evidence-grounded. This section codifies the specific sentence and paragraph patterns that distinguish The Economist from generic news writing.

### Core Sentence Patterns

| Pattern | Template | Example |
|---------|----------|---------|
| **Consequence lead** | "[Actor] [action], [consequence]." | "The ENVI committee's rejection of the rapporteur's compromise, by a margin of 22-38, puts the entire biodiversity regulation at risk of expiring before end of term." |
| **Contradiction reveal** | "[Group] publicly supports X; its voting record tells a different story." | "EPP publicly supports the green transition; its voting record on the CBAM amendment tells a different story: 11 of 31 EPP ENVI members backed the ECR wrecking amendment (RCV-2026-0312)." |
| **Probability qualifier** | "The chances of [outcome] have [risen/fallen] to roughly [range]%." | "The chances of a trilogue deal on the AI Liability Directive before June 2026 have fallen to roughly 20-30%, down from 55% in January (political-risk-methodology.md calibration, coalition risk L=4×I=4=16)." |
| **Historical parallel** | "This echoes [prior event], when [outcome]." | "This echoes the 2019 Spitzenkandidaten crisis, when EPP's failure to secure a parliamentary majority forced a Commission President compromise — a dynamic now replaying under different arithmetic." |
| **Second-order reveal** | "The immediate effect is [X]; the deeper consequence is [Y]." | "The immediate effect is a three-month delay in AI Act implementation; the deeper consequence is that 14 member states' national AI regulators are now operating in a legal vacuum." |
| **Quantified claim** | "[Metric] is [value], [comparison to baseline]." | "Grand coalition cohesion stands at 61%, 7 percentage points below its Q1 2026 average and the lowest reading since the October 2024 farm subsidy confrontation." |

### Paragraph Architecture

Every analytical paragraph MUST follow this structure:

1. **Assertion** — a specific, testable claim (not a description of what happened)
2. **Evidence** — EP document ID, vote count, or MCP data reference
3. **Implication** — what this means for EP political dynamics or EU policy
4. **Qualifier** — confidence level and any counter-argument

**❌ BAD (descriptive, no architecture):**
> The committee voted on the report. Several amendments were proposed. The outcome will have implications for future EU policy.

**✅ GOOD (assertion → evidence → implication → qualifier):**
> The ECON committee's 28-18 adoption of the capital markets union framework (PE-748.234/2026) marks the first time EPP and S&D have jointly overruled Renew Europe on a financial regulation in this parliamentary term [assertion]. The roll-call vote (RCV-2026-0388) shows 6 of 9 Renew ECON members abstaining rather than voting against, signalling passive acquiescence rather than active opposition [evidence]. This pattern suggests Renew is positioning for a face-saving trilogue compromise rather than a blocking minority in plenary — a strategy last used successfully on the DORA regulation (P9_TA(2022)0381) [implication]. Confidence: MEDIUM — trilogue dynamics could still reverse this trend if Council raises substantive objections [qualifier].

### Quantitative Claim Standards (New in v2.2)

**Every quantitative claim MUST meet at least one of these citation standards:**

| Claim Type | Required Citation Standard | Example |
|-----------|---------------------------|---------|
| Vote count | Roll-call reference (RCV-YYYY-NNNN) + vote breakdown | "Passed 412-156-12 (RCV-2026-0342)" |
| Percentage | Named data source + time period | "61% EPP-S&D cohesion (EP MCP `analyze_coalition_dynamics`, groups=EPP+S&D, 2026-Q1)" |
| Seat count | Parliamentary term reference | "EPP holds 188 of 720 seats (EP10, elected June 2024)" |
| Procedure status | Procedure ID + current stage | "2024/0001(COD) in trilogue since 2026-01-15 (`track_legislation`)" |
| Historical comparison | Prior EP MCP data point or EP document | "Highest since October 2024 (SIG-2024-10-14-002: 8.1/10)" |
| Probability estimate | Confidence level + methodology reference | "35–45% [MEDIUM confidence, scenario tree analysis per political-risk-methodology.md Advanced Technique 4]" |
| Economic figure | Named source + publication date | "€12B estimated compliance cost (Commission Impact Assessment SEC(2024)0145, published 2024-03-15)" |

**Forbidden quantitative patterns:**
- ❌ "High voter turnout" — must specify: "61.4% EU-wide turnout in June 2024 EP elections (official EP result)"
- ❌ "Most MEPs" — must specify: "412 of 720 MEPs (57.2%) voted in favour"
- ❌ "Significant majority" — must specify: "passed by 38-22 (63% of committee) with 4 abstentions"
- ❌ "Recently" — must specify the exact date or relative period: "in the 2026-03-18 plenary session"
- ❌ "Growing support" — must specify the direction and magnitude: "support rose from 18 to 24 formal co-signatories between January and March 2026"

### EP-Specific Vocabulary Standards

The Economist style applied to EP coverage requires precise institutional vocabulary. Never substitute informal language for official EP terminology:

| Informal (❌ Avoid) | Official (✅ Use) | Context |
|-------------------|-----------------|---------|
| "The EU parliament" | "The European Parliament" or "Parliament" | Institutional name |
| "Passed by majority" | "Adopted by [N] votes to [N] with [N] abstentions" | Vote outcome |
| "Negotiated a deal" | "Concluded a trilogue agreement" | Interinstitutional process |
| "Party leader" | "Group leader" or "group chair" | EP political groups are not parties |
| "EU law" (for a draft) | "Legislative proposal" or "directive/regulation under negotiation" | Distinguish enacted from pending |
| "Rejected outright" | "Fell on the vote [N to N]" or "failed to secure a majority" | Precise vote language |
| "Cross-party deal" | "Cross-group majority" or "grand coalition agreement" | EP groups, not parties |

---

## 🎙️ Reader-Engagement Standards (New in v2.6)

A Stage-C-clean artifact is necessary but not sufficient. Artifacts must also be *enjoyable to read* — because every analysis artifact is **input** to a human-facing article that 14-language readers will skim on a phone over coffee. This section codifies the reader-engagement craft that turns a technically-correct artifact into one that downstream article generation can lift verbatim into prose.

### The Three-Second Rule

A reader scanning the artifact's first three seconds must extract: **(a) what happened**, **(b) why it matters**, and **(c) the headline number**. If the lede paragraph fails any of those three tests, rewrite it.

| Element | Rule | Example |
|---------|------|---------|
| **Hook (sentence 1)** | Lead with the most surprising, specific, or counter-intuitive fact. Never start with “On 23 April 2026, the European Parliament …” | “For the first time since 2019, EPP has whipped its own ENVI members against a Commission-backed climate file — and the coalition arithmetic has shifted with it.” |
| **Stake (sentence 2)** | Name the policy, the people, and the timeline. | “The revised Industrial Emissions Directive (2024/0123(COD)) now needs 41 floor votes the Grand Coalition no longer has, with trilogue scheduled for 12 May.” |
| **Headline number (sentence 3)** | One quantified claim that anchors the rest of the artifact. Always cite an EP procedure or RCV. | “The ENVI margin collapsed from a 55-seat cushion in February to an 8-seat plurality on 23 April (RCV-2026-0412).” |

### Scene-Setting Without Padding

Good scene-setters earn their words; bad ones recite the calendar. The test: if the sentence could appear in any other artifact, cut it.

| ❌ Padding | ✅ Earned scene-setter |
|------------|----------------------|
| “The European Parliament held a plenary session this week, during which several important issues were discussed.” | “Strasbourg’s plenary chamber rarely ends a Wednesday vote with stunned silence. On 23 April it did — the IED rapporteur lost her own report by a single vote.” |
| “Many topics are on the agenda for the coming weeks.” | “The May part-session compresses three legislative crises — IED trilogue, defence-fund vote, EU–Mercosur ratification — into a 72-hour window the EPP whip’s office has already privately conceded it cannot fully manage.” |

### Signposting Paragraphs (“Bridges”)

When the artifact pivots between dimensions — e.g. from voting analysis to threat assessment — a single short paragraph (15–40 words) tells the reader **where they are going and why**. This is what makes a 400-line artifact feel like a 4-minute read.

**Pattern:** *“The vote arithmetic explains the immediate decision; what follows explains why the same arithmetic now threatens the next three procedures on the same dossier.”*

Place a bridge at every H2 / H3 boundary that crosses an analytical layer (classification → risk, risk → SWOT, SWOT → threat, threat → synthesis). Bridges may not exceed two sentences and must contain at least one signposting word: *what follows*, *the next section shows*, *the upshot is*, *the same logic applies to*, *the deeper question is*.

### Jargon Restraint

Use precise EP institutional vocabulary (see *EP-Specific Vocabulary Standards* above), but every Latinate or procedural term gets **one** plain-language gloss the first time it appears in an artifact. After that, the term carries on its own. This makes the artifact translate cleanly to all 14 languages without losing its bite.

| Term | First-mention gloss (in-line, parenthetical) |
|------|----------------------------------------------|
| Spitzenkandidat | *(“lead candidate” — the political-group nominee for Commission President)* |
| Trilogue | *(the closed-door three-way negotiation between Parliament, Council and Commission)* |
| Rapporteur | *(the MEP charged with steering a file through committee)* |
| Cordon sanitaire | *(the informal pact among centrist groups to deny the far right legislative posts)* |
| Grand Coalition | *(EPP + S&D ± Renew — the centrist majority that has carried most legislation since 2019)* |

### The “Why Now?” Test

At least one paragraph in every artifact must answer: *what changed since the last comparable run*? If nothing changed, say so explicitly — silence on this question is the single most common cause of unread artifacts.

**Pattern:** *“The coalition arithmetic was the same in March; what changed in April is […].”*

or, when nothing changed: *“The coalition arithmetic is unchanged from the March run — a stability that is itself notable given the […].”*

### Restraint on Adjectives

Adjectives are the surest tell of weak analysis. The Economist averages roughly one adjective per ten words. Audit every artifact: if an adjective cannot be replaced by a quantified claim or struck without changing the meaning, strike it.

| ❌ Adjective-heavy | ✅ Quantified |
|-------------------|----------------|
| “A significant blow to the Grand Coalition” | “The Grand Coalition lost three votes this week — its longest losing streak since November 2024.” |
| “An unusually fragmented committee” | “ENVI cohesion fell to 0.42 — below the 0.55 floor at which committee-level deals historically collapse.” |
| “A highly controversial proposal” | “The proposal drew 312 amendments at committee — the highest count since the 2021 Common Agricultural Policy reform.” |

### Quotability

Every artifact should produce **at least three sentences** that an article generator can quote verbatim and that read well in isolation. Test: copy any single sentence into a tweet. If it stands alone with a number, an actor, and a stake, it passes. If it requires two more sentences of context, rewrite it.

### Editorial Anti-Patterns to Hunt in Pass 2

During the mandatory Pass-2 read-back, hunt these patterns and rewrite where you find them:

| Anti-pattern | Why it kills engagement | Fix |
|--------------|--------------------------|-----|
| Stacked passive verbs (“was considered”, “is being assessed”) | Hides the actor | Name the actor and use an active verb |
| Empty signalling adverbs (“clearly”, “notably”, “importantly”) | Tells without showing | Cut the adverb; the evidence below it should carry the weight |
| “It should be noted that…” | Filler before every secondary clause | Cut the phrase; start with the noun |
| Lists of three abstract nouns (“transparency, accountability and effectiveness”) | Reads like a press release | Replace with one concrete behaviour the policy actually changes |
| Closing paragraphs that summarise rather than land | Wastes the most-read paragraph | End with a sentence that names the next observable signal worth watching |

### Worked Example — Lede Pass-1 → Pass-2

**Pass 1 (mechanical):**
> *On 23 April 2026, the ENVI committee voted on the Industrial Emissions Directive. Several amendments were considered. The result will have implications for the trilogue process.*

**Pass 2 (publishable):**
> *Strasbourg rarely produces a clean political shock. On Wednesday it did. The ENVI committee — a body that has carried every Commission climate proposal since 2019 — rejected its own rapporteur’s Industrial Emissions Directive compromise by a single vote (RCV-2026-0412, 22–23–2). The arithmetic alone is striking; the consequence is harder. The May trilogue (file 2024/0123(COD)) now opens without a parliamentary majority behind the Parliament’s lead negotiator — the first such structural gap on a Commission climate file since the 2019 IED-recast.*

Notice what Pass 2 added: a hook, a named actor, an RCV, a comparable historical anchor, and an open thread that signposts the next artifact (`scenario-forecast.md`). That is what “fun to read” looks like in operational political-intelligence prose.

---

## 🗞️ Recess and Data-Sparse Period Guidance (New in v2.1)

The European Parliament has scheduled recess periods (Easter, summer, year-end) during which plenary sessions, committee meetings, and voting do not occur. During recess, EP MCP API feeds return reduced or empty datasets. This section defines how analysis depth and focus should adapt.

### EP Parliamentary Recess Calendar (Typical)

| Recess Period | Approximate Dates | Duration |
|--------------|------------------|----------|
| Easter recess | Late March – mid April | ~2–3 weeks |
| Summer recess | Late July – August | ~5–6 weeks |
| Year-end recess | Late December – mid January | ~3 weeks |
| Constituency weeks | Scattered (see EP calendar) | 1 week each |

### EP API Feed Availability During Recess

During recess, EP MCP API feeds experience degraded availability. Expect the following pattern:

| EP MCP Feed | Recess Behaviour | Expected Response |
|-------------|-----------------|-------------------|
| `get_plenary_sessions` | No new sessions | Empty results or 404 |
| `get_voting_records` | No new votes | Empty results or 404 |
| `get_speeches` | No new speeches | Empty results or 404 |
| `get_adopted_texts` | No new adoptions | Empty results or 404 |
| `get_committee_documents` | Reduced output | Some documents may still be published |
| `get_procedures` | Procedures continue in background | Limited updates; trilogue continues |
| `get_parliamentary_questions` | Written questions still filed | Reduced volume but available |
| `get_events` | No plenary events | Hearings/conferences may still occur |

### Depth Level Selection During Data-Sparse Periods

| Data Availability | Recommended Depth Level | Rationale |
|------------------|:----------------------:|-----------|
| **Full** (≥6 of 8 feeds active) | Level 2 or Level 3 | Full evidence base available |
| **Degraded** (3–5 feeds active) | Level 1 or Level 2 | Reduced evidence; focus on available data |
| **Sparse** (1–2 feeds active, typical recess) | Level 1 (Surface) | Limited new evidence available; constrain analysis to what can be substantiated |
| **Unavailable** (0 feeds active) | Level 1 (Surface) | No current-feed evidence available; avoid strategic conclusions based on absent live data |

### Focus Areas During Recess Periods

When new EP data is unavailable, shift analytical focus to:

1. **Historical trend analysis** — Use existing datasets to identify multi-week or multi-month patterns (e.g., political group cohesion trends over Q1)
2. **Structural analysis** — Analyse committee compositions, rapporteur assignments, and political group positioning that does not change during recess
3. **Forward-looking scenarios** — Use the data-quiet period for scenario planning (per [political-threat-framework.md](political-threat-framework.md) Scenario Planning framework)
4. **Cross-document correlation** — Re-examine previously analysed documents for connections missed in real-time analysis
5. **Retrospective quality improvement** — Review and improve prior analysis quality scores

### Quality Gate Adjustment During Recess

| Period | Quality Gate | Evidence Minimum | Rationale |
|--------|:-----------:|:----------------:|-----------|
| Normal session | 7.0/10 | Per standard table | Full data available |
| Recess period | 7.0/10 (**unchanged**) | Reduced from the standard threshold with rounding up (per-file: 2 citations, 1 EP doc ref) | Quality standard remains; evidence thresholds adjust to data availability |

> **⚠️ Critical Rule:** The quality gate score (7.0/10) does NOT decrease during recess. What changes is the **minimum evidence count** — because less data is available, fewer citations are required to meet the evidence density dimension. During recess, reduced thresholds are calculated from the standard requirement and rounded up to the next whole item where needed (for example, a 3-citation baseline becomes 2 citations). The analytical depth, structural compliance, and neutrality dimensions remain fully enforced.

### Anti-Patterns During Recess

| Anti-Pattern | Why Prohibited | Correct Alternative |
|-------------|---------------|-------------------|
| Fabricating activity ("The Parliament is expected to...") | No basis in evidence when EP is in recess | State: "Parliament is in recess; no new legislative activity" |
| Recycling old data as new | Misleads readers; violates evidence currency | Clearly label: "Based on pre-recess data from [date]" |
| Skipping analysis entirely | Misses structural and trend-based insights | Produce Level 1 analysis focused on trends and scenarios |
| Claiming urgency during recess | No plenary votes or committee actions to be urgent about | Use ROUTINE urgency; reserve ELEVATED+ for genuine post-recess events |

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

**📋 Document Owner:** CEO | **📄 Version:** X.Y | **📅 Analysis Date:** YYYY-MM-DD HH:MM UTC
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
| 👑 | Power concentration; institutional pressure |
| 🎭 | Disinformation; transparency deficit / information integrity risk |

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

All analysis artifacts must include **at least one colour-coded Mermaid diagram**. Standards adapted from [Hack23 ISMS STYLE_GUIDE.md → Mermaid Diagram Guidelines](https://github.com/Hack23/ISMS-PUBLIC/blob/main/STYLE_GUIDE.md#-mermaid-diagram-guidelines):

#### Colour Palette (Classification-Aligned)

Use these exact hex codes — they are aligned with the ISMS classification scheme so SWOT, risk, threat, and stakeholder diagrams render consistently across the platform:

| Severity / Class | Hex | Usage |
|------------------|-----|-------|
| 🔴 Critical / Extreme | `#D32F2F` | Critical risks, severe threats, red-flag items |
| 🟠 High / Very High | `#FF9800` | High-priority risks, monitoring quadrants |
| 🟡 Medium / Moderate | `#FFC107` | Medium risks, watchlist items |
| 🟢 Low / Standard / Success | `#2E7D32` (dark) · `#4CAF50` (bright) | Low risks, opportunities, key-player stakeholders |
| 🔵 Info / Neutral / Manage Closely | `#1565C0` | Primary actors, manage-closely quadrant, info nodes |
| ⚪ Public / Disabled / N/A | `#9E9E9E` | Public/de-prioritised items |
| 🟣 Special / Marketing | `#7B1FA2` | Cross-cutting / special-interest items |

For **graph / flowchart / mindmap** diagrams, attach colour using `style` or `classDef` — never rely on default grey:

```mermaid
classDef critical fill:#D32F2F,stroke:#7F0000,color:#fff
classDef high     fill:#FF9800,stroke:#7F4F00,color:#000
classDef medium   fill:#FFC107,stroke:#7F6000,color:#000
classDef low      fill:#2E7D32,stroke:#0F3F00,color:#fff
classDef info     fill:#1565C0,stroke:#0A3F7F,color:#fff
classDef neutral  fill:#9E9E9E,stroke:#4F4F4F,color:#fff
```

#### Standard `quadrantChart` init block (REQUIRED for all SWOT, TOWS, Stakeholder, Scenario quadrants)

Every `quadrantChart` block in analysis output **MUST** be prefixed with this init block, which mirrors the [ISMS STYLE_GUIDE.md Stakeholder Mapping (Quadrant Format)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/STYLE_GUIDE.md#stakeholder-mapping-quadrant-format) theming. This ensures consistent legibility on dark and light backgrounds and enforces the canonical quadrant colour-to-meaning mapping below:

| Quadrant | Hex | Canonical Meaning |
|---------:|-----|-------------------|
| `quadrant1` (top-right) | `#1565C0` 🔵 | Manage Closely · SO · Sovereignist Opportunities · Critical Risk |
| `quadrant2` (top-left)  | `#2E7D32` 🟢 | Key Players · Stable Reform · Pro-Integration Opportunities |
| `quadrant3` (bottom-left) | `#FF9800` 🟠 | Monitor · Stable Stagnation · Pro-Integration Risks |
| `quadrant4` (bottom-right)| `#D32F2F` 🔴 | Keep Informed · Fragmented Gridlock · Sovereignist Risks |

Reusable snippet (copy verbatim into every `quadrantChart`):

````markdown
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
    title 🎯 [Diagram Title with Domain Icon]
    x-axis "[Low X]" --> "[High X]"
    y-axis "[Low Y]" --> "[High Y]"
    quadrant-1 "🔵 [Top-Right Label]"
    quadrant-2 "🟢 [Top-Left Label]"
    quadrant-3 "🟠 [Bottom-Left Label]"
    quadrant-4 "🔴 [Bottom-Right Label]"
    "🏛️ [Stakeholder/Item 1]": [{x}, {y}]
```
````

#### Standard universal init block (REQUIRED for ALL non-quadrant diagrams)

Every other mermaid diagram type — `graph`, `flowchart`, `mindmap`, `sequenceDiagram`, `gantt`, `pie`, `stateDiagram`, `classDiagram`, `erDiagram`, `gitGraph`, `timeline`, `journey`, `xychart-beta`, `C4Context`, `block-beta` — **MUST** be prefixed with the universal init block below. It applies the canonical ISMS palette across `primaryColor` / `secondaryColor` / `tertiaryColor`, `noteBkgColor`, `errorBkgColor`, `pie1`–`pie12`, `git0`–`git3`, and `cScale0`–`cScale7`, so every diagram inherits consistent colour coding without per-diagram `style` directives.

Reusable single-line snippet (copy verbatim immediately after the ` ```mermaid ` fence):

````markdown
```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
graph LR
    A[🏛️ Council] --> B[📋 Committee]
```
````

> **Note:** A `quadrantChart` MUST use its dedicated quadrant init block above (which sets `quadrant1Fill`–`quadrant4Fill`). Do NOT mix the two snippets.

#### Diagram Authoring Rules

- Use `{N}`, `{x}`, `{y}`, `{YYYY-MM}` placeholders in templates (never hardcoded values)
- Include `⚠️ AI Agent: Replace placeholders with actual data` notes in templates
- Apply `style` / `classDef` directives for additional severity-specific colour overrides where the universal palette is insufficient — never rely on default grey
- Prefix every `quadrantChart` with the standard quadrant init block above (no exceptions)
- Prefix every other diagram with the standard universal init block above (no exceptions)
- Prefix every diagram **title** with a domain icon from the [Policy Domain Icons](#policy-domain-icons) table
- Prefix every quadrant **label** with a coloured-circle emoji (🔵🟢🟠🔴🟡⚪) matching the canonical colour mapping
- Prefix every node label in `graph` / `flowchart` / `mindmap` diagrams with a domain icon (🏛️ institution, 👥 stakeholder, 📋 document, ⚖️ policy, 🚨 risk, 🛡️ defence, 🌍 external, ⏰ time, 📊 metric)

---

## 🎯 Estimative Language & Source Grading (New in v2.5)

All probabilistic judgements produced in EU Parliament Monitor analysis follow the professional intelligence-community discipline codified in [`osint-tradecraft-standards.md`](osint-tradecraft-standards.md). This section is the *style* contract; the standards document is the *normative* contract.

### Estimative Language (Kent / WEP Bands)

- Every uncertain judgement MUST use a Words of Estimative Probability (WEP) band — not bare percentages or vague adverbs ("likely", "possible") without a band attached. The canonical mapping (see [`osint-tradecraft-standards.md` §3.1](osint-tradecraft-standards.md)) is:
  - *Almost no chance* (1–5%) · *Very unlikely* (5–20%) · *Unlikely* (20–45%) · *Roughly even chance* (45–55%) · *Likely* (55–80%) · *Very likely* (80–95%) · *Almost certain* (95–99%)
- Every WEP band MUST carry an explicit **time horizon** (e.g. "*Likely* by the next plenary", "*Very Likely* within the 2026 mandate"). Bands without a horizon are rejected by the Pass-2 reviewer.
- Confidence in the **quality of the evidence** (High / Medium / Low, per [`osint-tradecraft-standards.md` §3.3](osint-tradecraft-standards.md)) is tracked **separately** from WEP probability — the two are never merged into a single marker.
- Legacy markers 🟢 / 🟡 / 🔴 remain valid and map onto High / Medium / Low confidence respectively; they are a visual overlay on the WEP + confidence pair, not a replacement.

### Confidence Labels Are Horizon-Conditional

WEP bands are not horizon-agnostic: the threshold to call something *Likely* at T+7 days is much higher than at T+12 months, because uncertainty grows non-linearly with horizon. A week-ahead claim graded *Likely* using a 12-month band is statistically wrong — calendar, rapporteur, and trilogue-date signal at one week leave less room for upset than a year of Council Presidency turnover, coalition arithmetic shifts, or EP-election structural breaks.

- The **canonical decay table** lives in [`forward-projection-methodology.md` §3 — WEP Decay Table](forward-projection-methodology.md#3-wep-decay-table), and is the single source of truth across the platform. This style guide deliberately does **not** duplicate the numbers or the horizon enumeration — refer to the methodology for the complete set of floor bands per horizon (short-term through EP-election structural-break).
- Authors of `news-week-ahead`, `news-month-ahead`, `news-week-in-review`, `news-month-in-review`, `news-breaking`, `news-committee-reports`, `news-motions`, and `news-propositions` MUST pick the floor band that matches the **dominant horizon of the claim**, not the run's filing cadence. A week-ahead article that includes a structural-break judgement extending past the next election cycle uses the `T+EP-election ±6m` band for that one judgement and the `T+7d` band for everything else.
- **Reference-class refinement:** widen one band (e.g. *Likely* → *Roughly even chance*) when the reference class has fewer than 6 analogues — this rule is mirrored in `forward-projection-methodology.md` §3 and applies uniformly across articles and analysis artifacts. (`forward-projection-methodology.md` §3 prints this midpoint band as "About even"; treat the two as synonyms — *Roughly even chance* is the canonical Kent/WEP term used for prose grading in this style guide.)
- **Pass-2 calibration check:** if a long-horizon article (`week-ahead`, `month-ahead`, scenario sections of any retrospective) does not contain at least one judgement at the horizon's floor band — i.e. every band collapses to *Roughly even chance* / *About even* — the analyst has avoided commitment and the article fails Pass 2.
- **Templates that consume this rule:** `analysis/templates/forward-projection.md`, `analysis/templates/scenario-forecast.md`, and `analysis/templates/forward-indicators.md` already cite the canonical table; their WEP claims must agree with the run's resolved horizon, using `manifest.json.horizonProfile` when present (legacy or unknown-slug runs without a `horizonProfile` fall back to the article-type's nominal horizon documented in `src/aggregator/article-horizons.ts`).

### Source Grading (Admiralty)

- Every cited external source MUST carry an Admiralty grade of the form `A1`–`F6` (see [`osint-tradecraft-standards.md` §2](osint-tradecraft-standards.md)):
  - Letter `A–F` grades **source reliability** (A = completely reliable primary, F = cannot be judged).
  - Digit `1–6` grades **information credibility** (1 = confirmed by independent sources, 6 = cannot be judged).
- EP primary sources (Plenary minutes, adopted texts, roll-call records, ECA reports) are normally `A1`–`A2`. Commission and Council primary documents are normally `A1`–`B2`. Reputable press (FT, POLITICO Europe, Reuters, AFP, Euractiv) is normally `B2`–`C3`. Social-media / unverified blogs start at `E5` and require corroboration before use.
- Single-source judgements with grades worse than `C3` MUST be flagged explicitly and MUST NOT drive a headline finding without a corroborating `A`–`B` source.

### Style Rules for Prose

- Open every Executive Summary / Executive Finding / Bottom-Line-Up-Front paragraph with **one** sentence in the ICD 203 "BLUF + analytic-confidence" form: a headline judgement expressed as a WEP band + time horizon + confidence level (High / Medium / Low) + one-clause rationale.
- Never hide probabilistic language in footnotes. If the claim matters enough to make, it matters enough to grade inline.
- Prefer "judge" / "assess" (ICD-203 verbs) over "think" / "believe" / "feel" when stating analytic positions.
- Any claim that uses a number (%, count, Euro, seat share) MUST either (a) cite an EP / Eurostat / ECB / WB / IMF source with Admiralty grade, or (b) be flagged as an estimate with the confidence level and the estimation basis.

### Pass-2 Reviewer Checklist

Before a Pass-2 reviewer signs off an article or analysis artifact, they MUST confirm — in addition to the existing evidence-density and attribution checks:

1. Every headline judgement carries a WEP band + explicit time horizon.
2. Every cited external source carries an Admiralty grade.
3. Confidence-in-evidence (High / Medium / Low) is tracked separately from probability.
4. At least one Structured Analytic Technique ([`osint-tradecraft-standards.md` §4](osint-tradecraft-standards.md)) is named in the artifact (typical: Key Assumptions Check, ACH, Pre-Mortem, Red-Team, Scenario Analysis, Indicators).
5. No claim blends probability and confidence into a single "35% likely with high confidence" sentence without separating the two dimensions.

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
| Overwriting previous analysis | Destroys audit trail; loses temporal context | Each workflow writes to `analysis/daily/{date}/{article-type-slug}/` |
| **Code-generated titles/descriptions** | Produces generic data-count titles like "5 Votes, 2 Anomalies" that carry zero political intelligence | **AI agent MUST generate ALL titles and descriptions** by analysing the content and identifying the political significance. Pass via `--title` and `--description` CLI flags |
| **Template-string titles** | `Plenary Votes & Resolutions: ${date}` is not a headline — it's a format string | AI agent writes the headline: "ECR Breaks Ranks on Digital Markets Act as Grand Coalition Splits" |

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

All analysis produced in English serves as the source for 13 additional languages (sv, da, no, fi, de, fr, es, nl, ar, he, ja, ko, zh). Writing conventions that support accurate translation:

### Translation-Friendly Writing Rules

1. **Avoid idioms** — "The bill sailed through committee" → "The committee approved the bill by a large margin"
2. **Use full titles on first reference** — "European People's Party (EPP)" not just "EPP"
3. **Spell out abbreviations** — "Member of the European Parliament (MEP)" on first use
4. **Consistent terminology** — Always use the same English term for the same concept (never alternate between "political group" and "party group")
5. **Active voice** — "The Parliament voted to approve" not "Approval was voted on"
6. **EP-specific terms** — Use official EP terminology: "rapporteur" (not "lead legislator"), "trilogue" (not "three-way negotiation"), "plenary" (not "full session")
7. **Short sentences** — Prefer sentences under 25 words; compound sentences with 3+ clauses translate poorly
8. **Explicit subjects** — Avoid pronoun-heavy paragraphs where "it" or "they" could be ambiguous in gendered languages (de, fr, es)
9. **Cultural neutrality** — Avoid culture-specific metaphors ("political football", "Rubicon") that lack equivalents in CJK/RTL languages

### Translation Quality Checklist (per article, all 13 target languages)

- [ ] All narrative text translated — no leftover English passages
- [ ] EP document IDs preserved verbatim (not translated)
- [ ] Political group abbreviations (EPP, S&D, Renew, etc.) preserved
- [ ] MEP names preserved
- [ ] Emoji confidence markers (🟢/🟡/🔴) preserved unchanged
- [ ] Vote counts numerically identical, locale-formatted
- [ ] Probability labels translated (likely→wahrscheinlich/probable/probable etc.) — not upgraded/downgraded
- [ ] RTL layout correct for Arabic (ar) and Hebrew (he)
- [ ] CJK punctuation used for Japanese (ja), Korean (ko), Chinese (zh)
- [ ] Formal register used in all languages

---

## 🔗 Related Documents

- [political-classification-guide.md](political-classification-guide.md) — Classification methodology
- [political-risk-methodology.md](political-risk-methodology.md) — Risk scoring
- [political-swot-framework.md](political-swot-framework.md) — SWOT methodology
- [political-threat-framework.md](political-threat-framework.md) — Threat analysis
- [osint-tradecraft-standards.md](osint-tradecraft-standards.md) — ICD 203 · Admiralty · Kent/WEP · SATs · OSINT ethics
- [ai-driven-analysis-guide.md](ai-driven-analysis-guide.md) — Per-file AI analysis protocol
- [reference/isms-style-guide-adaptation.md](../reference/isms-style-guide-adaptation.md) — ISMS mapping

---

**Document Control:**
- **Path:** `/analysis/methodologies/political-style-guide.md`
- **ISMS Reference:** [STYLE_GUIDE.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/STYLE_GUIDE.md)
- **Classification:** Public
- **Version:** 2.7 — Added §Confidence Labels Are Horizon-Conditional under Estimative Language. The section anchors WEP bands to the canonical decay table in `forward-projection-methodology.md` §3 (single source of truth — not duplicated here) so authors of week-ahead, month-ahead, and retrospective news articles pick the floor band that matches the dominant horizon of the claim, not the run's filing cadence. Cross-linked from `.github/prompts/04-article-generation.md`.
- **Version:** 2.6 — Added §Estimative Language & Source Grading codifying ICD 203 BLUF/confidence format, Kent/WEP probability bands with mandatory time horizons, Admiralty source grading (A1–F6), and Pass-2 reviewer checklist. Added §Reader-Engagement Standards to strengthen narrative discipline, scannability, and reader retention expectations for political-intelligence outputs. Cross-links `osint-tradecraft-standards.md` as the normative contract; this guide is the style contract.
- **Version:** 2.5 — Added universal mermaid init block (mandatory for all `graph`/`flowchart`/`mindmap`/`pie`/`gantt`/`timeline`/`sequenceDiagram`/`stateDiagram`/`classDiagram`/`erDiagram`/`gitGraph`/`xychart-beta`/`C4Context`/`block-beta` diagrams) covering `pie1`–`pie12`, `git0`–`git3`, `cScale0`–`cScale7`, `noteBkgColor`, `errorBkgColor`, and xyChart `plotColorPalette` so every diagram inherits the canonical ISMS palette without per-diagram styling. Added node-icon authoring rule.
- **Version:** 2.4 — Added classification-aligned Mermaid colour palette, mandatory `quadrantChart` init block (per ISMS STYLE_GUIDE.md stakeholder-mapping format), `classDef` snippet for graph/flowchart diagrams, and quadrant-icon labelling rules
- **Next Review:** 2026-07-31
