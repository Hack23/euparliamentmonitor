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
  <a href="#"><img src="https://img.shields.io/badge/Version-1.4-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--04--25-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Classification-Public-green?style=for-the-badge" alt="Classification"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 1.4 | **📅 Last Updated:** 2026-04-25 (UTC)
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-07-31

---

## 🎯 How to Use This Document

Each section is self-contained and describes a single analysis artifact. Use it as a lookup:

1. [Artifact Catalog](artifact-catalog.md) points you here for the construction rules of each artifact.
2. Each section gives you: **Purpose · EP MCP inputs · Required sections · Mandatory Mermaid · Depth floor · Quality signals**.
3. Apply the rules, write Pass 1, then read the whole file back and do Pass 2 (see [`ai-driven-analysis-guide.md` §Step 9](ai-driven-analysis-guide.md)).

### ♻️ Re-Run Improve/Extend Semantics

When a same-day analysis folder already has a `manifest.json.history[]` entry from
a prior run, re-running a workflow on the same date+type is **never a no-op**: every
artifact must be **extended** or **rewritten**. The **prior-run diff helper**
(`scripts/aggregator/prior-run-diff.js`, always-on) classifies each artifact as:

- **`carryForward`** — artifact exists on disk, meets its line floor, has no
  placeholder markers, and (where required) contains a Mermaid block. Stage B
  **MUST extend and deepen it** — skip-writes are forbidden. The entry exposes
  `priorLines` (current on-disk size) and `extendFloor` (= `max(threshold floor,
  priorLines + 20)`). Stage B must log a line per artifact:
  `[EXTEND-FROM-PRIOR: <relativePath> prior=<priorLines>L → new=<newLines>L (+<delta>)]`.
  `manifest.json.artifactSources["<relativePath>"]` is set to
  `"extend-from-prior:<priorRunId>"`.
- **`rewrite`** — artifact is missing, below floor, contains placeholders, or
  lacks a required Mermaid block. Stage B **rewrites it** with a stronger version
  sized to the catalog floor.

**Stage C always validates all artifacts**, including those extended from prior
runs. If an extended artifact does not reach its `extendFloor` (from
`prior-run-diff.json`), Stage C flags it as a hard-RED `extend:below-extendFloor`
violation. On re-runs, `manifest.pass2.rewriteCount === 0` is also a hard-RED
`rerun-no-op` violation. See `scripts/validate-analysis-completeness.js` for the
enforcement logic.

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

### 🕵️ Cross-Cutting Tradecraft Reference

Every artifact in this document applies the professional standards defined in [`osint-tradecraft-standards.md`](osint-tradecraft-standards.md):

- **Source grading** — every citation carries an Admiralty grade (A1–F6); grade → 🟢/🟡/🔴 mapping per §2.3.
- **Estimative language** — every probabilistic claim uses a Words-of-Estimative-Probability band (§3.1) with an explicit time horizon (§3.4). Banned ambiguous terms (§3.2) do not appear in analytic conclusions.
- **Structured Analytic Techniques** — the run's `methodology-reflection.md` attests ≥10 SATs drawn from §4; individual artifacts specify their primary SAT in the *Quality signals* row below.
- **ICD 203 standards** — the nine ODNI analytic standards (§1) map onto the sections of each artifact and are self-audited in `methodology-reflection.md` §12.
- **OSINT scope** — sources outside §5.2 (personal-life data, doxing, covert collection, unverified leaks) are never cited.

Artifacts marked below with **"Source grade × WEP discipline (tradecraft)"** make probabilistic claims and therefore apply the full §2 + §3 discipline.

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

**Quality signals.** Every claim in the Executive Finding paragraph links to at least one other artifact in the run; the Top-5 table has ≥3 numeric citations (score, margin, %); no paragraph exceeds 150 words without structure. **Source-grade × Estimative-language discipline (tradecraft):** every headline judgement uses a WEP band (see [`osint-tradecraft-standards.md` §3.1](osint-tradecraft-standards.md)) with explicit time horizon (§3.4); every Top-5 finding carries an Admiralty source grade (§2) and a 🟢/🟡/🔴 confidence marker consistent with §2.3.

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

> 📎 **Worked example:** [`examples/stakeholder-map-good-output.md`](examples/stakeholder-map-good-output.md) — illustrative 14-actor roster with cited power/alignment scores, four ≥150-word quadrant narratives, and a movement-since-prior-period table.

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

**Quality signals.** Probabilities sum to 100%; each scenario names at least one procedure ID, date, or named actor; no scenario is described in bullet points alone. **Source-grade × Estimative-language discipline (tradecraft):** each scenario's probability is expressed as a WEP band ([`osint-tradecraft-standards.md` §3.1](osint-tradecraft-standards.md)) with explicit time horizon (§3.4); primary SAT is Scenario Analysis with a mandatory Pre-Mortem (§4 techniques 9 + 8); every indicator cites its source with an Admiralty grade (§2).

> 📎 **Worked example:** [`examples/scenario-forecast-good-output.md`](examples/scenario-forecast-good-output.md) — three scenarios with WEP bands separated from confidence labels, dated indicators, a named Pre-Mortem scenario, and a cross-scenario sensitivity flip.

---

### pestle-analysis

**Purpose.** Political / Economic / Social / Technological / Legal / Environmental scan of factors shaping the period's dominant issue.

**EP MCP inputs.** `get_procedures`, `get_adopted_texts`, `search_documents`, plus **IMF** economic context (sole authoritative source) and World Bank non-economic context (health, education, social, environment, demographics, defence, agriculture, innovation, governance only) via [`imf-indicator-mapping.md`](imf-indicator-mapping.md) and [`worldbank-indicator-mapping.md`](worldbank-indicator-mapping.md).

**Required sections.**
1. Issue frame — the question the scan answers.
2. Six dimensions — one subsection each (Political, Economic, Social, Technological, Legal, Environmental), each with ≥150 words, ≥2 evidence citations, and a pressure rating 🟢/🟡/🔴.
3. Pressure synthesis — which dimensions reinforce each other, which offset.
4. Implications for EP — how the scan translates to committee / coalition / procedure action.

**Mandatory Mermaid.** `mindmap` with six coloured branches (Political=blue, Economic=orange, Social=green, Technological=purple, Legal=light-blue, Environmental=red) and named sub-drivers per branch.

**Depth floor (breaking):** 250 lines.

**Quality signals.** At least one IMF indicator cited for any economic dimension; WB non-economic indicator additionally cited for health/education/social/environment/defence dimensions; legal dimension cites at least one treaty article or CJEU reference; each dimension's pressure rating has a written justification.

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

**Quality signals.** Each threat is named, not generic; mitigation posture references at least one EP rule, treaty article, or institutional practice. **Source-grade × Estimative-language discipline (tradecraft):** every threat likelihood and impact uses a WEP band ([`osint-tradecraft-standards.md` §3.1](osint-tradecraft-standards.md)); every cited intent / capability claim carries an Admiralty grade (§2); ≥1 alternative-hypothesis position (ACH or Red-Team, §4) is surfaced for any headline threat judgement.

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

**Group-ID alias contract (MCP server v1.2.14+).** The EP Open Data Portal exposes several groups under native-language acronyms that differ from the canonical English short codes used throughout analysis artifacts. As of `european-parliament-mcp-server@1.2.15`, the server canonicalises these aliases internally — **do not add local remapping code** in the calling workflow or in `src/mcp/ep-mcp-client.ts`. Pass the alias as received; the tool resolves it to the canonical ID before returning results. **If the pinned server version is <1.2.14, the caller is responsible for translating aliases before calling the tool.** Key alias mappings handled upstream (v1.2.14+):

| Native alias(es) | Canonical groupId |
|---|---|
| `PPE`, `PPE-DE`, `Groupe du Parti populaire européen…` | `EPP` |
| `SOC`, `PSE`, `Groupe de l'Alliance progressiste…` | `S&D` |
| `Verts-ALE`, `Groupe des Verts/Alliance libre européenne` | `Greens/EFA` |
| `ALDE`, `RE` | `Renew` |
| Native NI variants | `NI` |
| `GUE/NGL` historical labels | `The Left` |

If a future run finds `coverage.unrecognizedGroups` is non-empty, update the upstream alias table in `Hack23/European-Parliament-MCP-Server` (`src/tools/analyzeCoalitionDynamics.ts` — `POLITICAL_GROUP_ALIASES`) rather than adding a local workaround.

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

**Quality signals.** Prior-run artifact paths are valid; posterior assessments state the evidence class (supporting / contradicting / orthogonal) per [`political-risk-methodology.md` §Bayesian Update](political-risk-methodology.md). **Source-grade × Estimative-language discipline (tradecraft):** every posterior claim is expressed as a WEP band ([`osint-tradecraft-standards.md` §3.1](osint-tradecraft-standards.md)); evidence updating the prior carries an Admiralty grade (§2); primary SATs are Bayesian Update (§4.2) and Quality of Information Check (§4 technique 3).

---

### economic-context

**Purpose.** Anchor the period's policy topics in **IMF** (sole authoritative source) macro, fiscal, trade, monetary, exchange-rate, banking-soundness, and commodity data.

**EP MCP inputs.** IMF native client (`scripts/imf-mcp-probe.sh`, tools `imf-fetch-data` / `imf-search-databases` / `imf-get-parameter-defs` / `imf-get-parameter-codes`) is the **sole** authoritative source for economic / fiscal / monetary / trade / FDI / exchange-rate / banking-soundness claims. World Bank MCP (`worldbank-get-social-data`, `worldbank-get-health-data`, `worldbank-get-education-data`) is used for non-economic context (health, education, social, environment, demographics, defence, agriculture, innovation, governance). See [policy](../../.github/skills/imf-data-integration.md).

**Required sections.**
1. Topic-to-indicator mapping — table linking each EP policy topic discussed this period to ≥1 **IMF** SDMX series (required for economic topics) plus optional WB non-economic cross-refs. See [`imf-indicator-mapping.md`](imf-indicator-mapping.md) and (non-economic) [`worldbank-indicator-mapping.md`](worldbank-indicator-mapping.md).
2. EU-27 headline indicators — IMF WEO latest values + 5-year trend + delta vs. EU average.
3. Affected member-state focus — ≥3 member states most exposed to the period's dominant policy; compare IMF indicators.
4. Forward outlook — IMF WEO / Fiscal Monitor projection data (+5y). Apply optimism-bias caveat sized per [`../imf/forecast-accuracy-baseline.md`](../imf/forecast-accuracy-baseline.md) for horizons ≥3y.
5. Analytical bridge — how the data should shape the period's political reading.
6. Data-source bridge — IMF vintage authoritative; WB non-economic cross-refs declared additive.
7. SEO/evidence bridge — one short paragraph naming the search-intent policy
   terms (committee acronym, procedure title, affected stakeholder) that the
   article title/description may safely reuse from this artifact. Do not write
   separate marketing copy; write evidence-backed phrasing that can support
   `manifest.title` / `manifest.description`.

**Mandatory Mermaid.** One `xyChart` showing the headline IMF indicator over time, plus a `flowchart LR` mapping indicators to policy topics.

**Depth floor (breaking):** 185 lines.

**Quality signals.** Every IMF indicator cites its SDMX code + vintage; the enclosing HTML `<section>` carries `data-vintage="WEO-April-2026"`; every forecast number is within 30 words of a forecast marker (`forecast`/`projection`/`projects`/`expects`). Per-article-type IMF indicator floor (see [`imf-indicator-mapping.md §8`](imf-indicator-mapping.md)) is satisfied. For Tier-1 articles citing high-sensitivity indicators, the cross-source triangulation outcome is logged per [`../imf/cross-source-triangulation.md`](../imf/cross-source-triangulation.md). The final bridge paragraph explicitly links the IMF signal to an EP political mechanism and gives safe SEO terms for title/description reuse.

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
4. Data-source bridge — which alternative sources (direct endpoint fallback, prior-run cache, IMF primary economic, WB non-economic) compensated for failures.
5. Reliability index — overall reliability score for this run (0–100) with breakdown.

**Mandatory Mermaid.** `flowchart LR` of endpoints with green (ok), orange (degraded), red (failed) nodes.

**Depth floor (breaking):** 385 lines (this is the deepest breaking-run artifact — MCP reliability is a first-class product concern).

**Quality signals.** Every degraded or failed endpoint has one of three explicit dispositions: a cited GitHub issue link, a triage-table citation recorded as `documented behaviour — see §11 #N`, or a clear note that it is a fileable new bug not yet linked; workarounds are reproducible from the text. **Triage-gate compliance:** every degraded/failed row has been looked up in [`.github/prompts/07-mcp-reference.md` §11 Audit-Recurring Triage Table](../../.github/prompts/07-mcp-reference.md); items matching a 🟢 LIMITATION or 🔵 CALLING-PATTERN row are recorded as `documented behaviour — see §11 #N` and **excluded** from "Issues needing creation"; only 🔴 real-bug findings (or new symptoms not in the table) are filed. **Denominator exclusion (§5 Reliability Index):** 🟢/🔵-classified items are excluded from both numerator and denominator when computing the success-rate component — do not count OJQ-404 (`get_meeting_foreseen_activities`, §11 #7), events-feed slow-feed timeouts (🟡 `SLOW_FEED_WARNING`, §11 #8), or procedures-feed recess-mode responses (`recessMode: true`, §11 #5) against the reliability score.

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

**Quality signals.** Every named threat resolves to specific EP activity (procedure, MEP, group manoeuvre); no software-centric models are used. **Source-grade × Estimative-language discipline (tradecraft):** every dimension score (0–5) is accompanied by a WEP band for the underlying judgement ([`osint-tradecraft-standards.md` §3.1](osint-tradecraft-standards.md)); every cited threat actor claim carries an Admiralty grade (§2); primary SAT is Key Assumptions Check (§4 technique 1) with a Red-Team alternative (§4 technique 11).

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

**Quality signals.** No wildcard is boilerplate ("economic crisis"); each is named to a plausible EP / EU trigger. **Source-grade × Estimative-language discipline (tradecraft):** wildcard probability is expressed as a WEP band (typically *Very Unlikely* / *Remote Chance*, [`osint-tradecraft-standards.md` §3.1](osint-tradecraft-standards.md)) with explicit time horizon (§3.4); trigger-signal sources carry Admiralty grades (§2); primary SATs are High-Impact / Low-Probability Analysis (§4 technique 10) and Indicators / Signposts (§4 technique 7).

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

**Quality signals.** ≥5 RCV IDs cited; every cohesion % has a vote-count backing; aggregate-only claims explicitly flagged LOW confidence where EP roll-call data has not yet published. §"Voting Data Freshness" table present with `source` field populated (`mcp` / `ep-open-data-portal` / `unavailable`); when source is `ep-open-data-portal` the CC BY 4.0 attribution string is present and WEP bands widened +5 pp; when source is `unavailable` all coalition claims carry explicit LOW-confidence flag and WEP bands widened +10 pp per `osint-tradecraft-standards.md` §3.1. The D-02 fallback path (`getVotingRecordsWithFallback` in `src/mcp/ep-open-data-client.ts`) is invoked whenever `get_voting_records` returns an empty votes array — **structural-proxy cohesion scores may never be used as a silent substitute for real voting data**.

---

### workflow-audit

**Purpose.** End-of-run self-audit of workflow execution — phases completed, MCP tools called, Core Principles compliance, time budget, issues and deviations. Produced at Step 10 of the 10-step protocol by every news-* workflow.

**EP MCP inputs.** None directly. Reads the workflow log, the run's `data/` directory, the run's artifact filesystem, and `manifest.json`.

**Required sections.**
1. Metadata YAML block — `articleType`, `runId`, `date`, `confidenceLevel`, `rulesAudited`, `complianceRate`.
2. Workflow execution summary — 6-phase table with status per phase (Health gate → Data collection → Editorial context → Analysis → Significance gate → Validation → PR creation).
3. MCP tool call log — one row per MCP call with tool, args (truncated), result, record count, latency.
4. Core Principles compliance — 11-row scorecard against [`ai-driven-analysis-guide.md §Core Principles`](ai-driven-analysis-guide.md#-core-principles-the-11-rules-that-replace-rules-122), with evidence cell per row.
5. Artifact production — folder-by-folder table (planned / produced / short-of-floor).
6. Time budget — step-by-step target vs. actual.
7. Issues & deviations — per-issue narrative (symptom / root cause / workaround / next-run recommendation).
8. Recommendations for the next same-type run — ≥3 concrete items.

**Mandatory Mermaid.** `flowchart LR` of the 6 phases colour-coded by status (green=ok, orange=degraded, red=failed).

**Depth floor (breaking):** 100 lines (same across article types — this is a run-transparency artifact, not a content artifact).

**Quality signals.** Every ❌ or ⚠️ status has a named symptom; every next-run recommendation is specific enough that the next run can execute it without re-deriving it.

---

### methodology-reflection

**Purpose.** Analytic-quality retrospective that closes the continuous-improvement loop. Distinct from [`workflow-audit`](#workflow-audit) (which checks mechanical phase-by-phase compliance): `methodology-reflection.md` reflects on **which Structured Analytic Techniques (SATs) were applied, where biases were mitigated, what the evidence would not support, and what the next same-type run must do differently**. Modelled on the [Hack23 riksdagsmonitor interpellations reflection](https://github.com/Hack23/riksdagsmonitor/blob/main/analysis/daily/2026-04-20/interpellations/methodology-reflection.md).

**EP MCP inputs.** None directly — built from the completed run artifacts, the `workflow-audit.md`, the MCP tool call log, and the editorial-review outcome (if any).

**Required sections.**
1. Pipeline overview — colour-coded Mermaid `graph TD` from trigger → MCP pulls → Pass 1 → Pass 2 → significance gate → validation → PR → human editorial review → optional Pass 3.
2. Data sources and provenance — ≥6 rows (tool, purpose, status ✅/⚠️/❌, confidence grade 🟢/🟡/🔴). Null-response signals ("returned 0 results, confirming no activity") captured explicitly.
3. Structured Analytic Techniques applied — ≥10 SATs named (Classification, Significance scoring, SWOT, Risk matrix, Threat analysis, Stakeholder mapping, PESTLE, Scenario analysis, ACH, Key Assumptions Check, Red Team, Historical baseline, Bayesian cross-run delta, Comparative international, Per-document deep dives). Every SAT linked to an artifact.
4. AI-FIRST iteration log — Pass 1 (count of artifacts, coverage gaps, depth gaps, SATs missing) + Pass 2 (concrete changes, word/citation counts added, remaining gaps) + optional Pass 3 (trigger + actions taken).
5. Strengths — ≥5 with ≥1 specific citation each (evidence class, quantitative anchoring, pattern detection, SATs breadth, comparative context, confidence grading discipline).
6. Limitations and caveats — ≥5 with honest specificity (MCP endpoint failures, data-freshness limits, single-run inference constraints, polling data unavailable, language / cultural bias).
7. Lessons for future same-type runs — ≥5 concrete enough that the next run can execute them (data-collection lesson, SAT-timing lesson, comparative-context lesson, methodology-artifact lesson, iteration-time lesson).
8. Known biases and mitigations — ≥6-row table (Confirmation · Availability · Mirror-imaging · Narrative fallacy · Recency · Selection · Anchoring), each with risk level, mitigation applied, and residual risk.
9. Peer review / editorial oversight — per [AI_Policy.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md); name reviewer or state "pending editorial queue".
10. Update plan — ≥5 triggers mapped to specific artifacts with frequency.
11. References — Heuer (1999), Heuer & Pherson (2020), UK MoD Red Teaming Handbook, NATO AJP-2.1, Hack23 AI_Policy, `.github/skills/ai-first-quality.md`, plus run-specific references.

**Mandatory Mermaid.** `graph TD` pipeline diagram in §1 with the seven-colour Hack23 palette applied to node states (blue=input, green=safe-pass, orange=degraded-fallback, red=failed, purple=synthesis, yellow=gate, light-blue=human-review).

**Depth floor (breaking):** 220 lines. Other article types: 180 lines.

**Quality signals.** Every SAT row cites an artifact that actually exists in this run (or states "not-applicable because …"); every limitation is specific enough that a reader knows *what could be wrong* with the analysis; every lesson is actionable by the next run without re-derivation; bias mitigations reference named artifacts; peer-review status is honestly reported (never marked "reviewed" when it is pending).

**Workflow placement.** Produced as the **final** artifact of every run, after `workflow-audit.md` and after the PR patch is otherwise complete. Every news-*.md workflow (except `news-translate.md`) must write this file before calling `safeoutputs___create_pull_request`.

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

**Quality signals.** Every score matches `L × I`; every monitoring trigger is time-bounded. **Source-grade × Estimative-language discipline (tradecraft):** each risk narrative reports the residual likelihood as a WEP band ([`osint-tradecraft-standards.md` §3.1](osint-tradecraft-standards.md)) with time horizon (§3.4); evidence backing the L and I scores carries an Admiralty grade (§2); ACH (§4 technique 6) is used when multiple competing risks share the same monitoring triggers.

> 📎 **Worked example:** [`examples/risk-matrix-good-output.md`](examples/risk-matrix-good-output.md) — illustrative 5-risk register with WEP-banded Likelihood, dated trigger events, named mitigation owners, and pre/post-mitigation residual scoring.

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

> 📎 **Worked example:** [`examples/swot-good-output.md`](examples/swot-good-output.md) — illustrative excerpt showing ≥80-word cells with evidence + confidence labels and four TOWS pairs with dated triggers and named owners.

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

### threat-analysis

**Purpose.** Tabular per-threat record — one row per identified democratic-process threat with vector × likelihood (WEP) × impact × mitigation × owner. Produced when the four landscape artifacts (`political-threat-landscape`, `actor-threat-profiles`, `consequence-trees`, `legislative-disruption`) need a structured roll-up an executive can scan in 60 seconds. Uses the framework template `threat-analysis.md`.

**Required sections.**
1. **BLUF** — single-paragraph judgment of the period’s top threat by Likelihood×Impact, with WEP band and Admiralty grade on the underlying evidence.
2. **Threat register** — one row per threat with columns: ID, vector, target dimension (one of the 6 Political Threat Landscape dimensions), Likelihood (WEP), Impact (1–5), composite score, mitigation, owner, evidence (Admiralty + procedure / RCV reference).
3. **Top-3 threats deep-dive** — one paragraph each, naming the kill-chain stage at which the threat is interruptible.
4. **Cross-references** — ≥1 link into `political-threat-landscape.md` and ≥1 link into `consequence-trees.md` so the reader can pivot from the table into the qualitative analysis.
5. **Tradecraft footer** — ≥1 SAT named (e.g. *Indicators & Signposts*, *Pre-Mortem*); STRIDE explicitly NOT used.

**Mandatory Mermaid.** `graph TD` — vector × mitigation matrix; or kill-chain phase × interruption point.

**Depth floor.** Flat 30 lines (matches the four sister landscape artifacts).

**Quality signals.**
- Every Likelihood is a WEP band (not a bare number); every Impact is justified by one observable consequence.
- Mitigation owners are named institutionally (e.g. “ENVI chair”, “EPP whip”), never by personal name unless the role is the relevant unit of analysis.
- The table totals match the BLUF — if BLUF says “top threat is coalition fracture”, that row’s composite score must be the table maximum.

**What good looks like.**
> *BLUF: The dominant threat across the 21–25 April window is a Grand Coalition fracture on IED enforcement provisions — LIKELY to crystallise at the 12 May trilogue (WEP: LIKELY 65–85%, evidence A2 from RCV-2026-0412). Mitigation owner: EPP whip’s office. Kill-chain interruption point: pre-trilogue shadows meeting (8 May).*

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

## 🧭 `extended/` — Optional Deep-Intelligence Artifacts

**Scope.** The 12 artifacts below were introduced by the riksdagsmonitor port (2026-04-23). They are **optional** (not gated by the completeness-gate) but **recommended** for long-form review workflows and crisis / breaking deep runs. Construction rules follow the same 2-pass AI-First pattern (Pass 1 draft → Pass 2 read-back and improve) as the mandatory artifacts.

### executive-brief

**Purpose.** ≤90-second decision brief for senior readers: BLUF + 3–5 key judgments (each with confidence label and source Admiralty grade) + 3 recommended actions with monitoring windows. Derived from `synthesis-summary.md` and the top-ranked `significance-scoring.md` items.

**Required sources.** `intelligence/synthesis-summary.md` (read entirely), `intelligence/significance-scoring.md` (top 3 items), `extended/intelligence-assessment.md` if present.

**Construction steps.** (1) Extract top-3 significance items. (2) Write BLUF (25–50 words). (3) Derive 3–5 key judgments with WEP bands and confidence levels. (4) Specify 3 actions with named owners and monitoring dates. (5) Admiralty grade every claim.

**Quality signals.** ≥150 lines. ≥5 Admiralty-graded evidence cells. All judgments WEP-labelled. Every action has an owner + monitoring date.

**Cross-refs.** → `intelligence-assessment.md` · → `synthesis-summary.md`.

### devils-advocate-analysis

**Purpose.** Adversarial challenge to the run's consensus view. Applies ACH (Analysis of Competing Hypotheses) and Red Team SAT.

**Required sources.** `intelligence/synthesis-summary.md`, `intelligence/scenario-forecast.md`, plus the primary MCP evidence. `analyze_coalition_dynamics`, `detect_voting_anomalies`, `get_voting_records`.

**Construction steps.** (1) State the consensus view. (2) List 2–4 competing hypotheses. (3) Build an ACH matrix (hypothesis × evidence, consistency markings ++/+/0/−/−−). (4) Red Team attack each consensus assumption. (5) Conclude with confidence-updated assessment.

**Quality signals.** ≥240 lines. ACH matrix with ≥8 evidence rows. ≥3 competing hypotheses. WEP band per hypothesis. Explicit "what would change my mind" section.

**Cross-refs.** → `osint-tradecraft-standards.md §ACH` · → `scenario-forecast.md`.

### historical-parallels

**Purpose.** Map ≥3 EU historical precedents with parallel mechanisms and divergence points. EU-specific precedents: Santer Commission resignation (1999), Article 7 TEU proceedings vs Poland (2017–) and Hungary (2018–), Brexit triggering (2017), MFF 2014–2020 negotiations, eurozone crisis (2010–2012), Constitutional Treaty referendum failures (2005), Commission-censure motions.

**Required sources.** EP Open Data historical document registry, `get_adopted_texts` (historical years), `search_documents`, externally verified historical facts.

**Construction steps.** (1) Name 3–5 precedents. (2) For each: mechanism, outcome, timeline. (3) Map parallels to current situation (≥3 mechanism matches per precedent). (4) Identify divergence points. (5) Base-rate calculation.

**Quality signals.** ≥230 lines. ≥3 precedents with ≥5 mechanism-match cells each. Explicit base-rate estimates with CI. Divergence section ≥100 words.

**Cross-refs.** → `historical-baseline.md` · → `scenario-forecast.md`.

### coalition-mathematics

**Purpose.** Vote-math analysis for the period's contested files. Uses post-2024 EP10 seat counts: **720 seats total, 361 absolute majority**. Grand coalition (EPP 188 + S&D 136 + Renew 77 = 401); Left-of-centre (S&D 136 + Renew 77 + Greens 53 + Left 46 = 312); Right-of-centre (EPP 188 + ECR 78 + PfE 84 = 350).

**Required sources.** `get_voting_records`, `analyze_voting_patterns`, `analyze_coalition_dynamics`, `compare_political_groups`, `analyze_country_delegation`.

**Construction steps.** (1) List contested files. (2) For each, compute pass/fail margins across standard coalitions. (3) Identify swing groups. (4) Model national-delegation defection scenarios (top 5: DE 96, FR 81, IT 76, ES 61, PL 53). (5) Project forward votes with WEP bands.

**Quality signals.** ≥280 lines. ≥3 coalition permutations per file. Swing-group identified. National-delegation defection modelled for ≥2 scenarios. Mermaid flowchart showing arithmetic.

**Cross-refs.** → `coalition-dynamics.md` · → `voting-patterns.md` · → `synthesis-methodology.md`.

### forward-indicators

**Purpose.** Leading-indicator watchlist with WEP bands and monitoring cadence. Applies Indicators & Signposts SAT.

**Required sources.** `monitor_legislative_pipeline`, `track_mep_attendance`, `get_plenary_sessions`, `get_events`, `detect_voting_anomalies`, Eurobarometer.

**Construction steps.** (1) Enumerate 8–15 indicators across coalition stability, legislative throughput, institutional integrity, electoral signals. (2) Per indicator: trigger + detection + cadence + threshold. (3) Dashboard table. (4) Mermaid flowchart of alerting pipeline.

**Quality signals.** ≥250 lines. ≥8 indicators. Every indicator has a specific MCP tool or external source. Escalation thresholds numeric.

**Cross-refs.** → `osint-tradecraft-standards.md §Indicators & Signposts SAT` · → `scenario-forecast.md` · → `significance-scoring.md`.

### intelligence-assessment

**Purpose.** ICD 203 compliant IC-style assessment. BLUF, Key Judgments (with confidence + WEP), Discussion, Outlook, Alternative Hypotheses, Gaps / Caveats, Sources.

**Required sources.** Every artifact in `intelligence/` and `classification/` for the run.

**Construction steps.** (1) BLUF (40–80 words). (2) 3–7 Key Judgments with ICD 203 Standard 8 confidence labels. (3) Discussion with evidence citations (Standard 6). (4) Outlook — WEP-labelled 30/90-day projection. (5) Alt hypotheses. (6) Information gaps. (7) Source Admiralty table.

**Quality signals.** ≥270 lines. ≥3 key judgments. ICD 203 Standards 2/4/6/8 demonstrably present. Source table with ≥10 graded sources.

**Cross-refs.** → `executive-brief.md` · → `osint-tradecraft-standards.md §ICD 203 Mapping`.

### implementation-feasibility

**Purpose.** 27 Member State implementation feasibility across 5 dimensions: legal transposition complexity, administrative capacity, fiscal cost, compliance monitoring, enforcement risk. Heatmap + MS-by-MS risk register.

**Required sources.** `track_legislation`, `get_procedures`, `get_external_documents` (Council + Commission IA), IMF GFS + FM fiscal data (primary for any fiscal / budgetary feasibility claim), World Bank governance indicators (WGI — non-economic).

**Construction steps.** (1) Extract concrete obligations from proposal. (2) Score each MS × 5 dimensions (1–5). (3) Heatmap. (4) Flag high-risk MS (≥3 dimensions scoring ≥4). (5) Identify mitigations and flexibility mechanisms.

**Quality signals.** ≥290 lines. 27 MS × 5 dimensions = 135 cells filled. High-risk MS register with specific mitigations.

**Cross-refs.** → `legislative-velocity-risk.md` · → `economic-context.md`.

### media-framing-analysis

**Purpose.** Dominant narrative frames across EU-wide and national press. Covers Politico Europe, Euractiv, FT, Euronews, Reuters Europe, DPA, AFP + ≥5 national outlets.

**Required sources.** External media (Europresse, LexisNexis EU). External-only, analyst-curated.

**Construction steps.** (1) Identify dominant event. (2) Sample ≥20 articles across ≥15 outlets. (3) Code for frame (thematic / episodic / strategic-game / conflict / human-impact / economic-consequence). (4) Outlet × frame matrix. (5) EU-wide vs national divergence commentary.

**Quality signals.** ≥270 lines. ≥20 coded articles. Outlet × frame matrix fully filled. Divergence commentary ≥200 words.

**Cross-refs.** → `synthesis-summary.md` · → `political-style-guide.md §Narrative Integrity`.

### comparative-international

**Purpose.** Cross-jurisdictional comparison: EP vs US Congress / UK Parliament / G7 legislatures / Council of Europe.

**Required sources.** External authoritative: US Congress.gov, UK Hansard, G7 communiqués, CoE Parliamentary Assembly. Cite with Admiralty grades.

**Construction steps.** (1) Identify comparable mechanism/procedure. (2) Side-by-side table: institutional design + typical outcome + duration + transparency. (3) Takeaways: what EP could learn + what's EU-unique.

**Quality signals.** ≥270 lines. ≥3 jurisdictions. Side-by-side matrix ≥15 rows. Takeaways with named recommendations.

**Cross-refs.** → `implementation-feasibility.md` · → `historical-parallels.md`.

### cross-reference-map

**Purpose.** Inter-artifact citation map for this run. Documents citation edges and identifies orphan / over-cited artifacts.

**Required sources.** All artifacts in this run.

**Construction steps.** (1) Parse every artifact for `[[link]]` / `]` references. (2) Build citation-edge list. (3) Mermaid graph. (4) Identify orphans and over-cites. (5) Flag evidence-terminal vs synthesis-terminal nodes.

**Quality signals.** ≥260 lines. Citation graph ≥30 edges. Orphan / over-cite flags. Evidence-terminal nodes identified.

**Cross-refs.** → `structural-metadata-methodology.md` · → `analysis-index.md`.

### data-download-manifest

**Purpose.** Stage-A inventory of every EP MCP call + raw artifact paths + Admiralty grades. Provenance-first companion to `mcp-reliability-audit.md`.

**Required sources.** All MCP calls made during the run.

**Construction steps.** (1) One row per MCP call: tool, params, timestamp, artifact path, status, Admiralty grade. (2) Summary statistics. (3) Raw-artifact inventory. (4) Gaps section.

**Quality signals.** ≥250 lines. ≥20 MCP-call rows. Freshness stats. Gaps explicitly enumerated.

**Cross-refs.** → `mcp-reliability-audit.md` · → `structural-metadata-methodology.md`.

### voter-segmentation

**Purpose.** EU electorate segmentation across 27 MS + 14 EUPM languages. Segments by Europhile/Euroskeptic, North/South/V4/Baltic/Nordic blocs, urban/rural, age cohort, education.

**Required sources.** Eurobarometer standard + special reports, World Bank demographics (non-economic), IMF WEO (economic context where relevant), EP 2024 election turnout by MS.

**Construction steps.** (1) Enumerate 6–10 segments. (2) Per segment: size, geographic density, issue salience. (3) Map segments to political-group support. (4) Identify swing segments for 2029 EP election. (5) 14-language accessibility note.

**Quality signals.** ≥300 lines. ≥6 segments fully profiled. Swing-segment register. 14-language accessibility note.

**Cross-refs.** → `electoral-domain-methodology.md` · → `stakeholder-map.md`.

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
- **Version:** 1.4 — v1.4 (2026-04-25, late) adds the `### threat-analysis` section to match the new `threat-assessment/threat-analysis.md` row in `artifact-catalog.md` (group now 5/5 reconciled). v1.3 (2026-04-25) refreshes dates and tightens cross-references for the v3.2 methodology release; no `### artifact section` was added or removed. v1.2 (2026-04-23) added the `extended/` folder with 12 optional deep-intelligence artifacts (executive-brief, devils-advocate-analysis, historical-parallels, coalition-mathematics, forward-indicators, intelligence-assessment, implementation-feasibility, media-framing-analysis, comparative-international, cross-reference-map, data-download-manifest, voter-segmentation) from the riksdagsmonitor port. v1.1 added voting-patterns, workflow-audit, cross-session-intelligence, deep-analysis, session-baseline and documented the `existing/` legacy folder + `risk/` folder variant. v1.0 was the initial per-artifact construction rules extracted from Run 184 reference benchmark.
- **Next Review:** 2026-07-31
