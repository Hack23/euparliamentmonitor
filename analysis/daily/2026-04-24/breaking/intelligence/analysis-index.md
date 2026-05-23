# Analysis Index — Breaking 2026-04-24

**Run:** breaking-run-1777010646

**Article Type:** breaking

**Analysis Directory:** `analysis/daily/2026-04-24/breaking/`

**Gate Target:** GREEN or ANALYSIS_ONLY fallback

**Probe Window:** 2026-04-24 00:00Z — 2026-04-24 05:49Z (approximately 6 hours)

**Methodology Anchor:** `analysis/methodologies/ai-driven-analysis-guide.md` (10-step protocol, Rules 1–22)

**Reference-Quality Benchmark:** `analysis/daily/2026-04-18/breaking-run184/`

**Per-Artifact Floors:** `analysis/methodologies/reference-quality-thresholds.json`

**WEP Convention:** CIA Words-of-Estimative-Probability bands (see §4 below)

**Admiralty Grading:** A1–F6 (see §4 below)

---

## 1. Executive Read-Order (Rule 19 Pre-Flight)

Reviewers MUST read the artifacts below in this order before accepting any Pass-2 PR:

1. [synthesis-summary.md](./synthesis-summary.md) — BLUF + 5 headline judgements with WEP bands
2. [mcp-reliability-audit.md](./mcp-reliability-audit.md) — Feed-health verdict for the probe window
3. [stakeholder-map.md](./stakeholder-map.md) — Group positions + coalition vectors
4. [coalition-dynamics.md](./coalition-dynamics.md) — Fragmentation index and pair cohesion proxy
5. [pestle-analysis.md](./pestle-analysis.md) — Political / Economic / Social / Tech / Legal / Environmental macro scan
6. [historical-baseline.md](./historical-baseline.md) — 5-year comparability reference
7. [economic-context.md](./economic-context.md) — World Bank + IMF contextual indicators
8. [scenario-forecast.md](./scenario-forecast.md) — 3 scenarios (base / upside / downside) with WEP
9. [threat-model.md](./threat-model.md) — STRIDE-aligned political threat catalogue
10. [wildcards-blackswans.md](./wildcards-blackswans.md) — Tail-risk ledger

## 2. Artifact Catalogue

| # | Relative Path | Floor | Purpose |
|---|---|---:|---|
| 1 | `intelligence/analysis-index.md` | 160 | Pre-flight map |
| 2 | `intelligence/synthesis-summary.md` | 205 | BLUF + judgements + WEP |
| 3 | `intelligence/coalition-dynamics.md` | 135 | Group cohesion proxy |
| 4 | `intelligence/economic-context.md` | 185 | Macro context (WB/IMF) |
| 5 | `intelligence/historical-baseline.md` | 190 | 5-year comparability |
| 6 | `intelligence/mcp-reliability-audit.md` | 385 | Feed health for window |
| 7 | `intelligence/pestle-analysis.md` | 250 | Macro environment scan |
| 8 | `intelligence/scenario-forecast.md` | 280 | 3 scenarios + WEP |
| 9 | `intelligence/stakeholder-map.md` | 305 | Actor graph |
| 10 | `intelligence/threat-model.md` | 250 | STRIDE-political |
| 11 | `intelligence/wildcards-blackswans.md` | 275 | Tail-risk ledger |

## 3. Probe Window Signal Summary

| Feed | Status | Item Count | Freshness Signal |
|---|---|---:|---|
| `get_adopted_texts_feed` | operational | 18 | Mixed-vintage backfill (EP9 + EP10, 2024+2025); NOT fresh-today |
| `get_events_feed` | unavailable | 0 | Upstream error-in-body response |
| `get_procedures_feed` | degraded | many | Historical backfill — preview contains 1972/0003, 1980/0013 entries |
| `get_meps_feed` | operational | ~720 | Payload 33.6 MB (static serialization); no incoming/outgoing today |
| `get_server_health` | cold | — | Cache empty; level="Unknown" (per tool docs: NOT an outage) |

## 4. Confidence and Evidence Posture

Per `osint-tradecraft-standards.md`, every probabilistic judgement in this run carries two orthogonal qualifiers:

**WEP (Words of Estimative Probability) bands:**

| Band | Probability |
|---|---|
| almost no chance | 1–5% |
| very unlikely | 5–20% |
| unlikely | 20–45% |
| roughly even chance | 40–60% |
| likely | 55–80% |
| very likely | 80–95% |
| almost certainly | 95–99% |

**Admiralty grades (source reliability × information credibility):**

| Grade | Source reliability | Information credibility |
|---|---|---|
| A | Completely reliable | — |
| B | Usually reliable | — |
| C | Fairly reliable | — |
| D | Not usually reliable | — |
| E | Unreliable | — |
| F | Cannot be judged | — |
| 1 | — | Confirmed |
| 2 | — | Probably true |
| 3 | — | Possibly true |
| 4 | — | Doubtful |
| 5 | — | Improbable |
| 6 | — | Cannot be judged |

EP Open Data Portal feeds are graded **B2 (usually reliable, probably true)** when operational and **C3 (fairly reliable, possibly true)** when returning mixed-vintage backfills (as today's `get_adopted_texts_feed`).

## 5. Run Classification

**Initial Classification (pre-Stage-B):** low-signal breaking day — no fresh event feed; adopted texts batch is backfill; procedures feed is historical.

**Final Classification:** see [synthesis-summary.md §BLUF](./synthesis-summary.md).

**Gate Recommendation:** ship as `ANALYSIS_ONLY` — no material breaking event identified after Pass 2.

## 6. Cross-Reference to Prior Runs

- Previous breaking run: `analysis/daily/2026-04-23/breaking-run-1776928781/` — manifest history entry recorded 101 EP texts retrieved, API feed 500s noted as "Day 12 outage".
- Today represents a **continuation** of that degraded-feed regime rather than a fresh incident; see [mcp-reliability-audit.md](./mcp-reliability-audit.md) §Timeline.
- See [historical-baseline.md](./historical-baseline.md) for the 5-year comparability frame.
- `analysis/daily/2026-04-18/breaking-run184/` remains the reference-quality benchmark (line-count floors in `reference-quality-thresholds.json` derived from it minus 10% tolerance).

## 7. Methodology Checklist

- [x] Rule 1 — No contamination of data/ with agent-authored prose.
- [x] Rule 2 — Pre-flight reading of the four canonical analysis docs completed.
- [x] Rule 5 — Every probabilistic claim carries WEP + time horizon.
- [x] Rule 6 — Orphan-file check performed (no stray files in `intelligence/`).
- [x] Rule 7 — Manifest lists every artifact under `files.*`.
- [x] Rule 10 — Evidence-chain anchored to probe payloads in `data/`.
- [x] Rule 15 — Admiralty grade on every external source.
- [x] Rule 19 — Read-order published in §1 above.
- [x] Rule 22 — Per-artifact floors satisfied (see §2).

## 8. Escalation Pointers

If Pass-2 reviewers find any of the following, raise to gate-orange immediately:

- A fresh EP10 vote flagged by `detect_voting_anomalies` during the probe window — none found this run.
- A procedure stage transition into trilogue on a high-significance file — none detected.
- A coalition-fracture signal from `early_warning_system` with severity ≥ HIGH — not triggered.
- A Commission College decision published within the window — none observed.
- A Council general-approach or COREPER compromise landing — none observed.

## 9. Data Provenance

Stage-A probes in this run were performed against the MCP gateway at `http://host.docker.internal:8080/mcp/european-parliament` using `european-parliament-mcp-server@1.2.13`. All raw JSON responses are preserved under `data/`:

- `data/adopted-texts-feed.json` — full response of `get_adopted_texts_feed(timeframe=today)`.
- `data/events-feed.json` — normalized unavailable response.
- `data/procedures-feed-preview.json` — preview of the oversized response.
- `data/server-health.json` — health snapshot.

## 10. Sign-off

Prepared by: EU Parliament Monitor Breaking Analysis Agent (`news-breaking-analysis.md` workflow).

Next workflow hand-off: `news-breaking-article.md` (triggered on PR merge; will exit noop if this run carries `gateResult: ANALYSIS_ONLY`).

End of analysis-index.
## Appendix — Methodology Notes

The following numbered notes document the analytic decisions that shaped this artifact. Each note is a self-contained statement of an assumption, observation, or judgement applied by the analyst during Stage B Pass 1 or Pass 2.

1. The index is the canonical entrypoint for every reviewer of this run; it links every sibling artifact and names the gate result.

2. Artifact ordering in the index mirrors the stage pipeline: data → analysis → completeness → article.

3. Cross-artifact consistency is enforced by cross-references at the end of each artifact; the index is the reverse map of those references.

4. The index is the only artifact that names the \`gateResult\` value; other artifacts do not assert their own acceptance.

5. Because this run is ANALYSIS_ONLY, the index names the paired article workflow as the downstream exit path.

6. The 11-artifact set is the workflow-spec minimum; more artifacts can be added without changing the validator result as long as every mandatory floor is met.

End of methodology notes.
