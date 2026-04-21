<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🧩 Per-Artifact Methodologies</h1>

<p align="center">
  <strong>📊 Construction Rules for Every Analysis Artifact Produced Under <code>analysis/daily/*/</code></strong><br>
  <em>🎯 One Section per Artifact · Purpose · Inputs · Structure · Mermaid · Depth Floor</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.1-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--04--21-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Classification-Public-green?style=for-the-badge" alt="Classification"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 1.1 | **📅 Last Updated:** 2026-04-21 (UTC)
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-06-30

---

## 🎯 How to Use This Document

Each section is self-contained and describes a single analysis artifact. Use it as a lookup:

1. [Artifact Catalog](artifact-catalog.md) points you here for the construction rules of each artifact.
2. Each section gives you: **Purpose · EP MCP inputs · Required sections · Mandatory Mermaid · Depth floor · Quality signals**.
3. Apply the rules, write Pass 1, then read the whole file back and do Pass 2 (see [`ai-driven-analysis-guide.md` §Step 9](ai-driven-analysis-guide.md)).

**Shared Hack23 Mermaid theme block** — prepend this to every diagram:

```
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","errorBkgColor":"#D32F2F","fontFamily":"Inter, Helvetica, Arial, sans-serif"}}}%%
```

**Color semantic mapping** (use consistently):

| Role in diagram | Color |
|---|---|
| Primary actor / input / scope | `#1565C0` blue |
| Synthesis / cognitive layer | `#7B1FA2` purple |
| Safe / supporting / approved | `#2E7D32` green |
| Caution / medium risk | `#FF9800` orange |
| Threat / high risk / rejected | `#D32F2F` red |
| Metadata / pending / note | `#FFC107` yellow |
| Reference / read-only | `#0288D1` light blue |

---

## 🧠 intelligence/

### analysis-index

**Purpose.** Read-me-first index naming every artifact in this run and the recommended reading order for a downstream consumer (article generator, reviewer, next-run agent).

**EP MCP inputs.** None directly — built from `manifest.json` + filesystem walk of the run root.

**Required sections.**
1. Run header — date, article type, run number, runtime, data sources attempted, data sources succeeded.
2. Stage table — Stage 1 (Facts: classification/, documents/), Stage 2 (Quantification: risk-scoring/), Stage 3 (Intelligence: intelligence/), Stage 4 (Decision: synthesis-summary).
3. One row per artifact with: path, purpose (one line), reading priority (P1/P2/P3), line count, status (complete / short / placeholder).
4. Recommended reading order (numbered list) and expected total reading time.
5. "Where to start if you only have N minutes" shortcuts for 5 / 15 / 30 minutes.

**Mandatory Mermaid.** `flowchart LR` with four stage nodes (blue → green → purple → orange) linking into the artifacts produced in each stage.

**Depth floor (breaking):** 160 lines.

**Quality signals.** Every path in the table resolves to an existing file; every file listed in `manifest.files.*` appears in the index; no "TBD" rows.

---

### synthesis-summary

**Purpose.** The run's intelligence executive summary. The one file a reader consults if they only have 5 minutes.

**EP MCP inputs.** Consolidates every other intelligence/ and risk-scoring/ artifact; reads no raw MCP data directly.

**Required sections.**
1. **Executive finding** — one paragraph naming the single most politically significant finding of the run with confidence level.
2. **Top-5 findings** — table: finding, evidence (artifact citations), confidence (🟢/🟡/🔴), change vs. prior run.
3. **Parliament status dashboard** — coalition stability, pipeline health, threat posture (each with a trend arrow).
4. **Stakeholder snapshot** — 3–5 named actors with position shift vs. prior run.
5. **Forward monitors** — ≥6 specific, time-bounded watchpoints (date, event, what-to-watch, trigger threshold).
6. **Confidence ledger** — where confidence is HIGH vs. where LOW, and what evidence would change it.

**Mandatory Mermaid.** `mindmap` rooted at the headline finding with six branches (Coalition · Risk · Stakeholders · Economic · Threats · Forward), plus a small `flowchart LR` showing the forward-monitor timeline.

**Depth floor (breaking):** 205 lines.

**Quality signals.** Every claim in the Executive Finding paragraph links to at least one other artifact in the run; the Top-5 table has ≥3 numeric citations (score, margin, %); no paragraph exceeds 150 words without structure.

---

### stakeholder-map

**Purpose.** Named-stakeholder map placing ≥12 actors (political groups, key MEPs, committees, Commission DGs, Council configurations, external lobbies, citizen groups) on a Power × Alignment grid for the period's dominant issue.

**EP MCP inputs.** `get_meps`, `get_committee_info`, `analyze_country_delegation`, `assess_mep_influence`, `get_speeches` (for position attribution).

**Required sections.**
1. Issue frame — one paragraph stating the exact question the map answers.
2. Actor roster — table of ≥12 actors with: name, role, power score (0–10, justified), alignment (-5 … +5, justified).
3. Power × Alignment `quadrantChart` (Mermaid) with every actor positioned.
4. Quadrant narratives — one paragraph per quadrant (Champions, Defenders, Critics, Sceptics) with ≥150 words.
5. Movement since prior period — arrows / table showing actor shifts.
6. Coalition implications — which quadrant combinations can form majorities on this issue.

**Mandatory Mermaid.** `quadrantChart` with axes `Power` (y) and `Alignment` (x), ≥12 labelled points.

**Depth floor (breaking):** 305 lines.

**Quality signals.** Every power score cites a source (MEP influence index, committee role, group seat share); every alignment score cites a roll-call, speech, or public position.

---

### scenario-forecast

**Purpose.** Three to five forward scenarios with probability weights, early-warning indicators, and trigger events.

**EP MCP inputs.** `track_legislation`, `monitor_legislative_pipeline`, `analyze_coalition_dynamics`, `get_plenary_sessions` (upcoming), `get_procedure_events`.

**Required sections.**
1. Horizon statement — timeframe covered (next 7 / 30 / 90 days).
2. Baseline assumption — the single most important current-state claim the scenarios branch off.
3. Scenarios — ≥3, each with: name, probability %, narrative (≥150 words), early-warning indicators (≥3), trigger events (≥2 date-bounded), stakeholder impact summary.
4. Cross-scenario sensitivity — a single variable whose movement flips probability weights.
5. Monitoring plan — what to re-check and when.

**Mandatory Mermaid.** `flowchart TD` branching from the baseline node into the named scenarios, then into early-warning indicators and trigger events. Use green for the most-likely branch, orange for medium, red for tail-risk branch.

**Depth floor (breaking):** 280 lines.

**Quality signals.** Probabilities sum to 100%; each scenario names at least one procedure ID, date, or named actor; no scenario is described in bullet points alone.

---

### pestle-analysis

**Purpose.** Political / Economic / Social / Technological / Legal / Environmental scan of factors shaping the period's dominant issue.

**EP MCP inputs.** `get_procedures`, `get_adopted_texts`, `search_documents`, plus World Bank / IMF macro data via [`worldbank-indicator-mapping.md`](worldbank-indicator-mapping.md) and [`imf-indicator-mapping.md`](imf-indicator-mapping.md).

**Required sections.**
1. Issue frame — the question the scan answers.
2. Six dimensions — one subsection each (Political, Economic, Social, Technological, Legal, Environmental), each with ≥150 words, ≥2 evidence citations, and a pressure rating 🟢/🟡/🔴.
3. Pressure synthesis — which dimensions reinforce each other, which offset.
4. Implications for EP — how the scan translates to committee / coalition / procedure action.

**Mandatory Mermaid.** `mindmap` with six coloured branches (Political=blue, Economic=orange, Social=green, Technological=purple, Legal=light-blue, Environmental=red) and named sub-drivers per branch.

**Depth floor (breaking):** 250 lines.

**Quality signals.** At least one World Bank or IMF indicator cited; legal dimension cites at least one treaty article or CJEU reference; each dimension's pressure rating has a written justification.

---

### threat-model

**Purpose.** Multi-framework threat view of the period — Diamond Model + Attack Trees + Kill Chain — applied to democratic / institutional threats (never software-centric).

**EP MCP inputs.** `get_meps`, `get_parliamentary_questions` (accountability probes), `get_mep_declarations` (interest exposure), `get_voting_records`.

**Required sections.**
1. Threat landscape summary — 6 purpose-built dimensions per [`political-threat-framework.md`](political-threat-framework.md).
2. Diamond Model — per top threat: adversary, capability, infrastructure, victim (named).
3. Attack tree — root goal → subgoals → specific actions (named procedures, named MEPs where relevant).
4. Kill chain — reconnaissance → weaponisation → delivery → exploitation → objectives, mapped to political manoeuvres.
5. Mitigation posture — existing institutional safeguards and their residual gaps.

**Mandatory Mermaid.** `graph TD` attack tree with top node red, intermediate nodes orange, leaf actions yellow. Arrows labelled with the action.

**Depth floor (breaking):** 250 lines.

**Quality signals.** Each threat is named, not generic; mitigation posture references at least one EP rule, treaty article, or institutional practice.

---

### coalition-dynamics

**Purpose.** Group cohesion scores and cross-party alliance pairs for the period's named votes, positions, and committee outputs.

**EP MCP inputs.** `get_voting_records`, `analyze_coalition_dynamics`, `compare_political_groups`, `analyze_voting_patterns`.

**Required sections.**
1. Group roster — EPP, S&D, Renew, Greens/EFA, ECR, PfE, ESN, NI — seat count + current observed cohesion %.
2. Alliance pair table — top 5 pairs by agreement rate this period, with trend vs. prior period.
3. Defection highlights — named MEPs breaking with group line on named votes (with RCV IDs).
4. Grand coalition status — viability indicator and named stress points.
5. Confidence ledger — where roll-call data is available vs. where structural inference is used.

**Mandatory Mermaid.** `graph LR` linking groups with edge weight = agreement % (green >70%, orange 50-70%, red <50%).

**Depth floor (breaking):** 135 lines.

**Quality signals.** At least one RCV ID cited; where EP voting feed has not yet published data, this is stated explicitly and group claims are marked LOW confidence.

---

### cross-run-diff

**Purpose.** Bayesian delta vs. the previous run for the same article type: what changed in the data, what changed in the analytical assessment, and why.

**EP MCP inputs.** Reads the prior run's `manifest.json` + synthesis-summary + risk-matrix; optionally re-queries EP MCP only for fields that have refreshed.

**Required sections.**
1. Prior-run header — date, run number, key findings, key scores.
2. Data delta — new documents, new votes, new events since prior run.
3. Assessment delta — each top-5 finding from prior run, with status (confirmed / upgraded / downgraded / reversed) and Bayesian posterior.
4. Confidence migration — which claims moved between 🔴/🟡/🟢.
5. Open questions — what the next run should investigate.

**Mandatory Mermaid.** `flowchart LR` with three columns: Prior → New Evidence → Posterior, one row per top finding.

**Depth floor (breaking):** 100 lines.

**Quality signals.** Prior-run artifact paths are valid; posterior assessments state the evidence class (supporting / contradicting / orthogonal) per [`political-risk-methodology.md` §Bayesian Update](political-risk-methodology.md).

---

### economic-context

**Purpose.** Anchor the period's policy topics in World Bank / IMF macro, fiscal, trade, monetary and sectoral data.

**EP MCP inputs.** World Bank MCP (`worldbank-get-economic-data`, `worldbank-get-social-data`) and / or IMF native client (`scripts/imf-mcp-probe.sh`). See the [Wave-2 OR-gate](../../.github/skills/imf-data-integration.md): either source is acceptable.

**Required sections.**
1. Topic-to-indicator mapping — table linking each EP policy topic discussed this period to ≥1 World Bank indicator or IMF series (see [`worldbank-indicator-mapping.md`](worldbank-indicator-mapping.md), [`imf-indicator-mapping.md`](imf-indicator-mapping.md)).
2. EU-27 headline indicators — latest values + 5-year trend + delta vs. EU average.
3. Affected member-state focus — ≥3 member states most exposed to the period's dominant policy; compare indicators.
4. Forward outlook — IMF WEO or World Bank projection data (+5y) where available.
5. Analytical bridge — how the data should shape the period's political reading.

**Mandatory Mermaid.** One `xyChart` showing the headline indicator over time, plus a `flowchart LR` mapping indicators to policy topics.

**Depth floor (breaking):** 185 lines.

**Quality signals.** Every indicator cites its series code; every value cites its vintage date; data-source bridge is present when only one of WB/IMF is available.

---

### historical-baseline

**Purpose.** Anchor every current score / metric in the run to its 30-day and 90-day historical baseline so the reader can tell rising from stable from declining.

**EP MCP inputs.** `get_all_generated_stats`, previous runs in `analysis/daily/`, `monitor_legislative_pipeline` trend, `compare_political_groups` over periods.

**Required sections.**
1. Metric roster — table: metric, current value, 30-day avg, 90-day avg, trajectory arrow, confidence.
2. Records and rarities — named "highest since …", "first occurrence in EP10", "return to baseline after …" findings.
3. Cohort comparisons — current run vs. comparable runs earlier in the quarter / term.
4. Anomaly highlights — any metric ≥2σ from its 90-day mean.
5. Confidence caveats — where baselines are thin or unavailable.

**Mandatory Mermaid.** `xyChart` or timeline showing the leading metric over ≥90 days with current run highlighted.

**Depth floor (breaking):** 190 lines.

**Quality signals.** Every baseline claim cites a prior run or an EP stats endpoint; "first occurrence" claims are justified against at least two prior periods.

---

### mcp-reliability-audit

**Purpose.** Endpoint-by-endpoint record of EP MCP availability and data freshness during the run, plus any upstream issues filed on `Hack23/European-Parliament-MCP-Server`.

**EP MCP inputs.** Every endpoint the run attempted; the audit is a side-effect of the data-collection phase.

**Required sections.**
1. Endpoint scoreboard — table: tool name, attempts, successes, 4xx/5xx/timeouts, data-age when available.
2. Per-endpoint findings — one subsection per failing or degraded endpoint with: symptom, likely root cause, repro attempt, workaround used in this run.
3. Upstream issues — list of linked issues on `Hack23/European-Parliament-MCP-Server` with title + URL.
4. Data-source bridge — which alternative sources (direct endpoint fallback, prior-run cache, World Bank / IMF) compensated for failures.
5. Reliability index — overall reliability score for this run (0–100) with breakdown.

**Mandatory Mermaid.** `flowchart LR` of endpoints with green (ok), orange (degraded), red (failed) nodes.

**Depth floor (breaking):** 385 lines (this is the deepest breaking-run artifact — MCP reliability is a first-class product concern).

**Quality signals.** Every degraded endpoint has a cited GitHub issue link OR a note that one should be filed; workarounds are reproducible from the text.

---

### significance-scoring

**Purpose.** 5-dimension composite significance score per candidate item with publish / withhold decision.

**EP MCP inputs.** Every event or document being scored; cross-referenced with `get_all_generated_stats` for historical comparability.

**Required sections.**
1. Rubric recap — the five dimensions and their weights (from [`political-classification-guide.md` §significance](political-classification-guide.md)).
2. Scoring table — one row per candidate item with per-dimension score + composite + decision (Publish / Hold / Withhold).
3. Top-item narrative — ≥100 words on the highest-scored item explaining each dimension score.
4. Threshold comparison — composite vs. the 30-day median score and the all-time top-5 scores.
5. Decision audit — explicit reason for every Publish / Withhold.

**Mandatory Mermaid.** `pie` of dimension weights plus a small bar chart of candidate items by composite score.

**Depth floor (breaking):** 105 lines.

**Quality signals.** Composite scores match the weighted sum of per-dimension scores; top item has evidence citations per dimension.

---

### political-threat-landscape

**Purpose.** Threat Landscape view of the period applied to the six purpose-built EP democratic-threat dimensions defined in [`political-threat-framework.md`](political-threat-framework.md). May live under `intelligence/` or `threat-assessment/` depending on the article type.

**Required sections.**
1. Six-dimension scoreboard — each dimension scored 0–5 with a sentence of evidence.
2. Top named threats — 3–5 with actor, mechanism, and affected institution.
3. Institutional resilience — EP rules, treaty provisions, or institutional practices that offset each threat.
4. Watchlist — concrete events to monitor.

**Mandatory Mermaid.** `graph TD` with a centre node "EP Democratic Integrity" and six colour-coded branches (one per dimension).

**Depth floor (breaking):** 90 lines (minimum); threat-heavy runs will routinely exceed this.

**Quality signals.** Every named threat resolves to specific EP activity (procedure, MEP, group manoeuvre); no software-centric models are used.

---

### wildcards-blackswans

**Purpose.** Low-probability / high-impact reserve watchlist — events that would invalidate the main scenarios if they occurred.

**Required sections.**
1. Wildcard roster — ≥5 wildcards, each with probability (0–10%), impact (High / Severe), trigger signals.
2. Quadrant chart — Probability × Impact placing each wildcard.
3. Early-warning matrix — what signals would raise the wildcard to a scenario.
4. Cascade map — which wildcard triggering would activate which other wildcards.

**Mandatory Mermaid.** `quadrantChart` with Probability (x) × Impact (y), every wildcard labelled. Black-swan zone (low prob, severe impact) in red.

**Depth floor (breaking):** 275 lines.

**Quality signals.** No wildcard is boilerplate ("economic crisis"); each is named to a plausible EP / EU trigger.

---

### reference-analysis-quality

**Purpose.** Self-score of this run against the reference benchmark ([Run 184](../daily/2026-04-18/breaking-run184/)) plus a Pass-2 action list.

**Required sections.**
1. Per-artifact line count vs. depth floor table.
2. Per-artifact Mermaid presence + theme compliance check.
3. Per-artifact evidence-density score.
4. Benchmark gap narrative — ≥100 words identifying the run's weakest artifacts and why.
5. Pass-2 action list — specific lines / sections to expand.

**Mandatory Mermaid.** `flowchart LR` Pass 1 → gap detected → Pass 2 → reference-quality exit.

**Depth floor (breaking):** 190 lines.

**Quality signals.** Gap claims match the validator output; action list items are concrete enough that Pass 2 can execute them without re-reading the whole run.

---

### voting-patterns

**Purpose.** Group-by-group bloc-behaviour analysis for the period — cohesion per group, observed coalitions, bloc win-rate, outlier votes, forward-vote forecasts. Distinct from [`coalition-dynamics`](#coalition-dynamics) (which is alliance-pair focused): voting-patterns answers *"how did each of the 8 groups behave?"*

**EP MCP inputs.** `get_voting_records` per plenary session covered, `analyze_voting_patterns`, `analyze_coalition_dynamics`, `compare_political_groups`, `track_mep_attendance` (for attendance-weighted cohesion).

**Required sections.**
1. Group size & theoretical coalition arithmetic — ≥8 groups with seat counts, % of 720, one-line strategic role.
2. Observed coalition patterns — table of ≥4 coalitions (Grand Centre, Progressive-Centrist, Conservative-Right, Opposition) with typical majority size, use-case policy domains, cohesion %, ≥1 RCV citation per row.
3. Per-group behaviour — ≥7 groups each with internal cohesion %, dominant position, notable defections (named MEPs + RCV IDs), cross-group alliances.
4. Bloc-behaviour index — per-bloc win-rate with trend vs. prior period.
5. Stress points & outlier votes — ≥3 named RCVs where coalitions flipped, with ≥30-word explanation.
6. Forward implications — ≥3 upcoming votes with expected coalition, confidence level, flip-conditions.

**Mandatory Mermaid.** `graph LR` of groups linked by agreement-rate edges; EPP blue, S&D red, Renew orange, Greens green, ECR light-blue (party colours aligned with the Hack23 semantic palette where possible).

**Depth floor (breaking):** 150 lines (weekly / other: 120 lines).

**Quality signals.** ≥5 RCV IDs cited; every cohesion % has a vote-count backing; aggregate-only claims explicitly flagged LOW confidence where EP roll-call data has not yet published.

---

### workflow-audit

**Purpose.** End-of-run self-audit of workflow execution — phases completed, MCP tools called, Core Principles compliance, time budget, issues and deviations. Produced at Step 10 of the 10-step protocol by every news-* workflow.

**EP MCP inputs.** None directly. Reads the workflow log, the run's `data/` directory, the run's artifact filesystem, and `manifest.json`.

**Required sections.**
1. Metadata YAML block — `articleType`, `runId`, `date`, `confidenceLevel`, `rulesAudited`, `complianceRate`.
2. Workflow execution summary — 6-phase table with status per phase (Health gate → Data collection → Editorial context → Analysis → Significance gate → Validation → PR creation).
3. MCP tool call log — one row per MCP call with tool, args (truncated), result, record count, latency.
4. Core Principles compliance — 10-row scorecard against [`ai-driven-analysis-guide.md §Core Principles`](ai-driven-analysis-guide.md#-core-principles-the-10-rules-that-replace-rules-122), with evidence cell per row.
5. Artifact production — folder-by-folder table (planned / produced / short-of-floor).
6. Time budget — step-by-step target vs. actual.
7. Issues & deviations — per-issue narrative (symptom / root cause / workaround / next-run recommendation).
8. Recommendations for the next same-type run — ≥3 concrete items.

**Mandatory Mermaid.** `flowchart LR` of the 6 phases colour-coded by status (green=ok, orange=degraded, red=failed).

**Depth floor (breaking):** 100 lines (same across article types — this is a run-transparency artifact, not a content artifact).

**Quality signals.** Every ❌ or ⚠️ status has a named symptom; every next-run recommendation is specific enough that the next run can execute it without re-deriving it.

---

### cross-session-intelligence

**Purpose.** Session-over-session narrative of parliamentary politics *across plenary sessions* within a period. Distinct from [`cross-run-diff`](#cross-run-diff) (which is cross-run of the same article type) — this file tells the story of *how the political programme matured across sessions*.

**EP MCP inputs.** `get_plenary_sessions` (year-filtered), `get_meeting_decisions` per session ID, `get_meeting_activities`, `get_adopted_texts` (period), `get_voting_records` per session.

**Required sections.**
1. Session overview — table with ≥2 sessions covering dates, sitting days, location, texts adopted, theme.
2. Progression diagram — Mermaid `timeline` showing the period's sessions as a horizontal sequence with key themes.
3. Session-by-session progression — ≥200 words per session covering character, political arc, ≥3 adopted-text IDs, rapporteurs.
4. Cross-session themes — ≥4 themes with "sessions touched" columns and trajectory narrative (≥30 words each).
5. Crystallisation moment — identify the period's single most strategically concentrated session with ≥250-word analysis.
6. Momentum indicators — multi-metric table (texts/day, cohesion %, RCVs/day, attendance %) across all sessions with trend arrows.
7. Forward outlook for next session — ≥3 topic forecasts with confidence levels.

**Mandatory Mermaid.** `timeline` of the period's sessions. Optional secondary `flowchart LR` showing cross-session theme threads.

**Depth floor (breaking):** 220 lines (motions quarterly-scope runs), 150 lines (week-in-review / month-in-review).

**Quality signals.** Sessions reference specific part-session IDs or date ranges; the crystallisation-moment section stands on its own as analysis (not a bullet list).

---

## 🏷️ classification/

### significance-classification

**Purpose.** 5-dimension significance rubric per event + publish / withhold decision. Often identical in content to `intelligence/significance-scoring.md` but lives here when classification comes before intelligence synthesis in the run.

**Inputs, sections, Mermaid, floor.** Use the [significance-scoring rules above](#significance-scoring).

---

### actor-mapping

**Purpose.** Named actors with influence weights, committee seats, roll-call alignment patterns, and alliance footprints.

**EP MCP inputs.** `get_meps`, `get_committee_info`, `assess_mep_influence`, `analyze_country_delegation`, `analyze_voting_patterns`.

**Required sections.**
1. Actor table — ≥12 named actors with role, institutional base, influence weight (0–10, justified).
2. Alliance footprint — which actors reliably vote / speak together.
3. Dissent footprint — which actors break with their group most often and on what topics.
4. New-actor spotlight — any MEPs / groups who gained or lost influence this period.

**Mandatory Mermaid.** `graph LR` network of actors with edge weight = co-alignment rate.

**Depth floor (breaking):** flat 30 lines (not yet benchmarked).

**Quality signals.** Every influence weight cites at least one EP MCP data source.

---

### forces-analysis

**Purpose.** Driving forces vs. restraining forces on the period's dominant issue (Lewin force-field analysis adapted to EP politics).

**Required sections.**
1. Issue frame.
2. Driving forces — ≥5, each with magnitude 1–5 and origin (institutional / political / economic / external).
3. Restraining forces — ≥5, same structure.
4. Net pressure — forces summed, with direction and narrative.
5. Intervention points — where a small input could flip the balance.

**Mandatory Mermaid.** `flowchart LR` with arrows sized by magnitude, driving forces green, restraining red, issue node in centre.

**Depth floor (breaking):** flat 30 lines.

**Quality signals.** Every force is named to a specific EP, EU, or geopolitical source.

---

### impact-matrix

**Purpose.** Event × stakeholder × dimension matrix showing who is affected by what, and how.

**Required sections.**
1. Event list — ≥5 named events / decisions from the period.
2. Stakeholder list — ≥6 named stakeholder groups.
3. Matrix — rows = events, columns = stakeholders, cells = impact class (🟢 Positive · 🟡 Mixed · 🔴 Negative · ⚪ None) with one-line justification.
4. Hot-cell narratives — ≥3 paragraphs expanding the most consequential cells.

**Mandatory Mermaid.** None required (matrix is a table); optional `flowchart LR` event → stakeholder if the chain is dense.

**Depth floor (breaking):** flat 30 lines.

**Quality signals.** No cell is unjustified; hot-cell narratives cite specific procedures or documents.

---

## ⚠️ risk-scoring/

### risk-matrix

**Purpose.** 5×5 Likelihood × Impact matrix with ≥5 named political risks and monitoring triggers. Canonical methodology: [`political-risk-methodology.md`](political-risk-methodology.md).

**Required sections.**
1. Risk roster — ≥5 named risks with L (1–5), I (1–5), score (L×I), category (Coalition / Policy / Institutional / External / Data).
2. 5×5 matrix — Mermaid `quadrantChart` placing each risk.
3. Per-risk narrative — ≥100 words per top-3 risk with evidence, stakeholder exposure, and monitoring trigger.
4. Trend vs. prior run — each risk scored last time + delta.
5. Accept / Prepare / Monitor decision — per risk.

**Mandatory Mermaid.** `quadrantChart` 5×5 with labels Low/High on both axes, monitored-zone green, elevated-zone orange, critical-zone red.

**Depth floor (breaking):** 150 lines.

**Quality signals.** Every score matches `L × I`; every monitoring trigger is time-bounded.

---

### quantitative-swot

**Purpose.** 3+3+3+3 SWOT with numeric weights plus TOWS cross-quadrant strategies. Canonical methodology: [`political-swot-framework.md`](political-swot-framework.md).

**Required sections.**
1. Quadrants — Strengths, Weaknesses, Opportunities, Threats — each ≥3 items, each item with severity (high/medium/low) + ≥80 words of evidence.
2. TOWS matrix — SO / ST / WO / WT strategies, one per cell.
3. Cross-quadrant interference — which S reinforces which O, which W amplifies which T.
4. Scenario bridge — which SWOT configuration points to which scenario in [`scenario-forecast.md`](#scenario-forecast).

**Mandatory Mermaid.** `quadrantChart` with axes External/Internal × Positive/Negative; optional `graph LR` for TOWS bridges.

**Depth floor (breaking):** 140 lines.

**Quality signals.** Every SWOT item has an evidence citation; no quadrant has fewer than 3 items; TOWS strategies name specific actors and timelines.

---

### political-capital-risk

**Purpose.** Named rapporteur / chair / group-leader political capital exposure per top position in the period.

**Required sections.**
1. Named actor capital table — actor, position, capital invested, counter-party, downside if defeated.
2. Capital flow diagram — where capital is being spent and what payoff is expected.
3. Precedent table — similar bets from the past and their outcomes.
4. Outlook — capital likely to be preserved / eroded / lost.

**Mandatory Mermaid.** `graph LR` capital flow from actor to procedure to outcome.

**Depth floor (breaking):** flat 30 lines.

**Quality signals.** Every named actor has an EP role cited.

---

### legislative-velocity-risk

**Purpose.** Throughput, stalled procedures, and deadline exposure vs. term end. Canonical upstream methodology: [`political-risk-methodology.md` §Velocity](political-risk-methodology.md).

**Required sections.**
1. Pipeline summary — open procedures by stage, throughput per week, median time-in-stage.
2. Stalled procedures — ≥3 named, with time-in-stage, likely cause, and rescue paths.
3. Deadline exposure — procedures at risk of expiring before term end.
4. Bottleneck map — where the process is slowest and why.

**Mandatory Mermaid.** `gantt` of top procedures' remaining stages, or `flowchart LR` bottleneck map.

**Depth floor (breaking):** flat 30 lines.

**Quality signals.** Uses `monitor_legislative_pipeline` data explicitly.

---

## 🎭 threat-assessment/

### consequence-trees

**Purpose.** Consequence tree per named threat: action → first-order → second-order → democratic outcome.

**Required sections.**
1. Threat roster — ≥3 named threats.
2. Per-threat consequence tree — ≥3 levels deep with probability / severity per branch.
3. Cross-tree convergence — where multiple threats hit the same democratic outcome.
4. Intervention points — where the tree can be pruned by EP / EU action.

**Mandatory Mermaid.** `graph TD` tree per threat, red root → orange mid → yellow leaves.

**Depth floor (breaking):** flat 30 lines.

**Quality signals.** No branch is "and then bad things happen"; every branch names a mechanism.

---

### legislative-disruption

**Purpose.** How adversarial pressure could stall, redirect, or capture specific procedures.

**Required sections.**
1. Targeted-procedure list — ≥3 procedures with procedure ID, rapporteur, current stage, disruption opportunity score.
2. Disruption playbook — per procedure, named techniques (amendment flooding, rapporteur targeting, committee obstruction, trilogue stalling).
3. Detection indicators — what would reveal disruption early.
4. Institutional counter-measures — EP Rule of Procedure tools available.

**Mandatory Mermaid.** `flowchart LR` procedure → disruptor vector → detection → counter.

**Depth floor (breaking):** flat 30 lines.

**Quality signals.** Every technique is linked to a named EP Rule of Procedure or precedent.

---

### actor-threat-profiles

**Purpose.** Per-threat-actor profile using the Diamond Model (adversary / capability / infrastructure / victim) adapted for political actors.

**Required sections.**
1. Actor roster — ≥3 named actors.
2. Per-actor Diamond — intent, capability, opportunity, attack surface.
3. Relationship map — how actors cooperate, compete, offset each other.
4. Escalation paths — how each profile could escalate in severity.

**Mandatory Mermaid.** `graph LR` actors × target institutions with edge labels for capability.

**Depth floor (breaking):** flat 30 lines.

**Quality signals.** No personal-life data on MEPs; analysis stays strictly on public parliamentary role.

---

### political-stride-assessment

**Purpose.** STRIDE reinterpreted for political actors — Spoofing (identity manipulation) / Tampering (procedural tampering) / Repudiation / Information disclosure / Denial of service (obstruction) / Elevation of privilege (rule gaming).

**Required sections.**
1. STRIDE × Actor matrix — each STRIDE letter × each named actor category.
2. Per-cell threat narrative — ≥50 words per non-empty cell.
3. Residual risk after existing EP safeguards.
4. Priority of mitigations.

**Mandatory Mermaid.** `graph LR` STRIDE node × actor nodes with edges showing exposure.

**Depth floor (breaking):** flat 30 lines.

**Quality signals.** Political STRIDE letters are defined in this file (not copy-pasted from software STRIDE) — the threats stay institutional.

---

## 📄 documents/

### document-analysis-index

**Purpose.** One row per downloaded EP document with its per-file analysis path, status, classification, significance score, and link to the raw MCP data file.

**Required sections.**
1. Feed-by-feed download summary — how many items per feed succeeded / failed.
2. Document table — one row per document: id, type, title (first 80 chars), feed, analysis file path, status, significance score.
3. Coverage metrics — % of downloaded documents with analysis file; top gaps.
4. Links to representative deep-dives — ≥3 high-significance per-file analyses.

**Mandatory Mermaid.** `flowchart LR` feed → raw-data/ → per-file analysis.md → aggregation into intelligence/.

**Depth floor (breaking):** 95 lines.

**Quality signals.** Every analysis file path in the table resolves to an existing file with ≥100 lines.

---

## 📜 existing/ (legacy long-form layout)

The `existing/` folder is the canonical location for long-form prose artifacts used by `motions`, `propositions`, and quarter / month-in-review workflows. It is a **layout convention**, not a new artifact group — files here co-exist with the 5 standard folders (`intelligence/`, `classification/`, `risk-scoring/`, `threat-assessment/`, `documents/`) and carry content the standard folders cannot accommodate (10 000-word political prose; multi-session fact rosters). Newer runs may place the same content under `intelligence/` instead; both locations are valid.

### deep-analysis

**Purpose.** Long-form (4 000–10 000 word) Economist-style political intelligence prose — the 30-minute read complement to the 5-minute `synthesis-summary.md`. Primary output of `motions-run*` workflows, secondary output of `month-in-review` and `propositions` workflows.

**EP MCP inputs.** Consumes the run's `session-baseline.md`, `voting-patterns.md`, `cross-session-intelligence.md`, `coalition-dynamics.md`, `stakeholder-map.md`. Pulls named adopted-text IDs directly from `get_adopted_texts` results in `data/`.

**Required sections.**
1. Executive summary — ≥200 words stating the political thesis of the period.
2. Structural thesis — ≥400 words identifying ≥3 named policy clusters with ≥2 named texts per cluster, coalition footprint, historical comparison.
3. Crystallisation moment — ≥500 words on the period's defining session with architectural, procedural, and coalition angles; ≥3 adopted-text IDs and ≥2 RCV IDs cited inline.
4. Coalition dynamics — ≥500 words on the Grand Centre (or dominant coalition) performance with ≥2 named MEPs whose defections mattered.
5. Policy dimensions — ≥4 sub-sections, ≥300 words each (Trade / Defence / Digital / Environment / etc.), each with committee, rapporteur, adopted texts, coalition behaviour.
6. Institutional dynamics — ≥400 words on the EP ↔ Commission ↔ Council triangle.
7. Geopolitical context — ≥400 words grounding the period in external events and macro indicators.
8. Forward trajectory — ≥400 words with ≥5 forward monitors and ≥2 probability-weighted scenarios.
9. Confidence & method note — ≥150 words explaining data-source bridges, gaps, and what would change the assessment.

**Mandatory Mermaid.** ≥3 diagrams across the file (structural thesis diagram + coalition network + forward trajectory flowchart are typical).

**Depth floor (breaking):** 400 lines (motions / month-in-review), 200 lines (week-in-review).

**Quality signals.** ≥15 named procedures / adopted texts / RCVs cited inline; ≥2 historical comparisons (prior term / prior year); named coalitions with explicit cohesion percentages; no partisan conclusions.

---

### session-baseline

**Purpose.** Structured calendar + adopted-texts roster for every plenary session in scope. The data-dense reference that other artifacts cite ("see session-baseline §4.2"). Distinct from [`historical-baseline`](#historical-baseline) (metric trending) — session-baseline is the **calendar**.

**EP MCP inputs.** `get_plenary_sessions` (year-filtered), `get_adopted_texts` (period), `get_procedures`, `get_committee_info`, `track_mep_attendance` for attendance means.

**Required sections.**
1. Run context — date, run ID, analysis directory, article type, parliament term, period covered.
2. Plenary session calendar — one sub-section per session in scope with dates, location, sitting days, texts adopted, RCVs, key theme, EP session ID.
3. Session calendar diagram — Mermaid `gantt` with Strasbourg vs. Brussels sections and each session as a bar.
4. Period totals — sitting days, texts, RCVs, resolutions (non-binding), legislative acts (binding), mean attendance.
5. Adopted texts roster — per-session table (≥1 row per adopted text in scope) with adopted-text ID, title (first 80 chars), procedure code, committee, domain.
6. Committee activity map — ≥5 committees with texts reported, rapporteurships, shadow rapporteurships, dominant group.
7. Procedure-code distribution — count and % per procedure type (COD / CNS / APP / INI / Budget / Other).
8. Historical anchor — current period vs. same-quarter-prior-year vs. prior-quarter vs. term-to-date average with ≥100-word narrative.
9. Data-source ledger — ≥5 MCP tools with records fetched, status, notes.

**Mandatory Mermaid.** `gantt` of the session calendar.

**Depth floor (breaking):** 200 lines (motions / month-in-review), 150 lines (weekly / breaking).

**Quality signals.** Every session row has an explicit EP session ID or an explicit "session ID unavailable via MCP this run" note; every adopted text has a `TA-YY-YYYY-NNNN` ID.

---

### Mirror artifacts in `existing/`

Older `motions-*` runs mirror `intelligence/coalition-dynamics.md`, `intelligence/stakeholder-impact.md`, and `intelligence/synthesis-summary.md` into `existing/` alongside `deep-analysis.md` and `session-baseline.md`. **Construction rules for these mirrors are identical to their `intelligence/` counterparts** — follow the `intelligence/` sections above. The duplication is a legacy layout side-effect; newer runs write only to the `intelligence/` location.

---

## 🧭 Folder Variants

Two folder-name variants appear in historical runs and are treated as equivalent by the validator:

| Canonical folder | Historical variant | Treatment |
|------------------|--------------------|-----------|
| `risk-scoring/` | `risk/` | Both accepted. New runs **must** write to `risk-scoring/`. The validator resolves `risk/` reads for backward compatibility. |
| `intelligence/` | `existing/` (for long-form) | Both accepted for `deep-analysis.md`, `session-baseline.md`, and mirror artifacts. New runs may use either; `intelligence/` is preferred. |

When authoring a run from scratch, always use the canonical folder names; when reading prior runs for cross-run-diff or historical-baseline, resolve both variants.

---

## 🔗 Related Documents

- [`ai-driven-analysis-guide.md`](ai-driven-analysis-guide.md) — 10-step analysis protocol (how to construct a run end-to-end)
- [`artifact-catalog.md`](artifact-catalog.md) — single-page table of every artifact
- [`political-swot-framework.md`](political-swot-framework.md) — SWOT methodology
- [`political-risk-methodology.md`](political-risk-methodology.md) — risk methodology
- [`political-threat-framework.md`](political-threat-framework.md) — threat methodology
- [`political-classification-guide.md`](political-classification-guide.md) — classification rubric
- [`political-style-guide.md`](political-style-guide.md) — writing standards
- [`reference-quality-thresholds.json`](reference-quality-thresholds.json) — machine-enforced depth floors

---

**Document Control:**
- **Path:** `/analysis/methodologies/per-artifact-methodologies.md`
- **Classification:** Public
- **Version:** 1.1 — Initial per-artifact construction rules extracted from Run 184 reference benchmark and daily runs 2026-04-20 / 2026-04-21. v1.1 adds voting-patterns, workflow-audit, cross-session-intelligence, deep-analysis, session-baseline and documents the `existing/` legacy folder + `risk/` folder variant.
- **Next Review:** 2026-06-30
