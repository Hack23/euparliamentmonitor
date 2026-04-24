# Threat Model — Propositions Pipeline — 2026-04-24

**Framework**: STRIDE+ adapted for legislative intelligence. Assets =
propositions-track data integrity, coalition-formation intelligence,
rapporteur-identification intelligence, public-narrative trust. Threat
vectors are ranked by likelihood × impact (1–5 each) = risk score.

## 1 · Asset Inventory

| # | Asset | Description |
|---|-------|-------------|
| A1 | **Propositions-pipeline data** | EP Open Data Portal feed (procedures, adopted texts, committee documents) |
| A2 | **Coalition-formation intelligence** | derived from political-landscape + coalition-dynamics tools |
| A3 | **Rapporteur identification** | currently blocked by EP API empty-field defect |
| A4 | **Public-narrative trust** | the propositions article's credibility in the EU public sphere |
| A5 | **Workflow integrity** | gh-aw sandbox, MCP gateway, safe-output surface |

## 2 · STRIDE+ Decomposition

### T1 — Tampering (data-integrity threats)
- **T1.1**: Upstream EP API returns wrong `identifier` → `stage` mapping.
  **Risk**: 2 × 4 = **8**. Mitigation: cross-validate against
  `get_procedure_events` when called.
- **T1.2**: MCP gateway log-poisoning via reflected content in MCP
  tool outputs. **Risk**: 1 × 4 = **4**. Mitigation: gh-aw sandbox
  + DIFC integrity filter.
- **T1.3**: Memory-MCP cross-run contamination. **Risk**: 1 × 3 =
  **3**. Mitigation: run-scoped memory keys.

### T2 — Repudiation
- **T2.1**: Run cannot be reconstructed because manifest.json
  history[] is malformed. **Risk**: 2 × 3 = **6**. Mitigation:
  `mergeManifestHistory` in src/utils/file-utils.ts.
- **T2.2**: Analysis PR merges without gate result recorded.
  **Risk**: 1 × 4 = **4**. Mitigation: Stage C blocking behaviour.

### T3 — Information disclosure
- **T3.1**: Narrow-margin propositions attract disinformation
  amplification. **Risk**: 3 × 4 = **12** (HIGH).
- **T3.2**: Rapporteur personal-data exposure through aggregated
  profiling. **Risk**: 1 × 4 = **4**. Mitigation: EP MCP aggregates
  only, no per-MEP voting data available anyway.

### T4 — Denial of service
- **T4.1**: EP API feed outage blocks Stage A. **Risk**: 3 × 4 =
  **12** (HIGH). Mitigation: multi-endpoint fallback per
  `07-mcp-reference.md §Feeds`.
- **T4.2**: safeoutputs HTTP session TTL expires before PR call.
  **Risk**: 3 × 5 = **15** (CRITICAL). Mitigation: ≤ 28-min hard
  wall-clock cap; Stage C commits before any wait.
- **T4.3**: MCP gateway docker-in-docker instability. **Risk**:
  2 × 4 = **8**.

### T5 — Elevation of privilege
- **T5.1**: Prompt-injection from EP-feed text bypasses analysis
  instructions. **Risk**: 2 × 4 = **8**. Mitigation: treat feed
  content as untrusted data; do not follow embedded instructions.
- **T5.2**: Agent writes outside `analysis/**` scope. **Risk**:
  1 × 5 = **5**. Mitigation: `00-scope-and-ground-rules.md` +
  sandbox file-path restrictions.

### T6 — Supply-chain (STRIDE+)
- **T6.1**: `european-parliament-mcp-server@1.2.11/1.2.13` version
  drift introduces silent behaviour changes. **Risk**: 2 × 3 =
  **6**. Mitigation: version-pinned `mcp-servers:` frontmatter.
- **T6.2**: `worldbank-mcp@1.0.1` country-code regressions (EUU/EMU
  unresolved). **Risk**: 2 × 3 = **6**. Mitigation: bilateral
  fallback (DE + FR) used this run.

### T7 — Social-engineering / Influence (STRIDE+ E)
- **T7.1**: External actor attempts to frame our propositions
  analysis as biased. **Risk**: 2 × 4 = **8**. Mitigation:
  transparency in confidence/WEP/Admiralty, devil's-advocate pass.
- **T7.2**: Rapporteur-office lobbying pre-publication. **Risk**:
  Out-of-scope for this workflow.

## 3 · Top Threats (risk score ≥ 10)

| Rank | Threat | Risk | Mitigation state |
|-----:|--------|-----:|------------------|
| 1 | T4.2 safeoutputs session TTL | 15 | ACTIVE (≤28-min cap) |
| 2 | T3.1 disinformation on narrow files | 12 | PARTIAL (confidence surfacing) |
| 3 | T4.1 EP API feed outage | 12 | ACTIVE (multi-endpoint fallback) |
| 4 | T6.* supply-chain MCP drift | 6–8 | ACTIVE (version-pinning) |
| 5 | T1.1 upstream data integrity | 8 | ACTIVE (cross-validation when possible) |

## 4 · Data-Availability Threats (this run)

- **UPSTREAM_404 on 13/13 probed TA-10-2026 identifiers** — not a
  threat per se but a **data-availability degradation** that
  propagates into document-level intelligence opacity. Tracked in
  `mcp-reliability-audit.md §Defects #1`.
- **get_committee_documents_feed: unavailable** — single-feed outage.
  Not a systemic event.

## 5 · Cross-References

- `wildcards-blackswans.md` — low-probability high-impact events
- `mcp-reliability-audit.md` — detailed defect list
- `risk-scoring/risk-matrix.md` — formalised 5×5 matrix

## 6 · WEP / Confidence

- **Headline**: safeoutputs TTL remains the single highest-risk
  operational threat. **WEP: LIKELY (55–80%)** at least one
  propositions run in the next 30 days hits the TTL if wall-clock
  discipline slips. **Confidence in evidence**: HIGH (documented
  precedent in run 24818921747).

## 7 · Limitations

- Threat model does not cover workflows outside propositions
  (handled by other workflows' threat models).
- No quantitative dollar-impact ranking (out of scope).

*— Threat Model · Pass 2 complete · 2026-04-24*


## 8 · Control catalogue (preventive / detective / corrective)

| Threat | Control(s) | Type |
|--------|-----------|:----:|
| T1.1 | cross-validate `get_procedure_events` when deep-fetching | D |
| T1.2 | gh-aw sandbox + DIFC integrity filter | P |
| T1.3 | run-scoped memory keys | P |
| T2.1 | `mergeManifestHistory` helper | P |
| T2.2 | Stage C blocking exit | P |
| T3.1 | surface WEP + confidence + Admiralty on every judgement | D |
| T3.2 | no per-MEP voting data requested | P |
| T4.1 | multi-endpoint fallback | C |
| T4.2 | ≤ 28-min wall-clock cap + Stage C commits | P |
| T4.3 | docker-in-docker not used in gh-aw runners | P |
| T5.1 | treat feed content as untrusted | P |
| T5.2 | scope-and-ground-rules.md + sandbox file-path | P |
| T6.1 | version-pinned `mcp-servers:` frontmatter | P |
| T6.2 | bilateral WB fallback | C |
| T7.1 | confidence-surfacing + devil's-advocate pass | D |

## 9 · Threat-trend vs previous propositions run

| Threat | Prior state | Current | Direction |
|--------|-------------|---------|-----------|
| T3.1 disinformation | HIGH | HIGH | flat |
| T4.1 EP feed outage | MED | HIGH | ↑ (committee feed outage observed) |
| T4.2 safeoutputs TTL | CRITICAL | CRITICAL | flat |
| T6.* supply-chain | MED | MED | flat |

## 10 · Observability priorities

To operationalise the threat model, the paired article workflow
should prioritise the following telemetry:
1. Gateway-log count of `UPSTREAM_404` responses per deep-fetch batch
2. Wall-clock elapsed timestamp at each stage transition
3. MCP server version string captured in `manifest.json.run.mcpVersions`
4. DIFC integrity-filter trips per run

## 11 · Residual-risk acceptance

Residual risk accepted this run: T3.1 and T4.2 retain CRITICAL /
HIGH scores because mitigations are partial. No immediate technical
uplift planned; operational discipline (the 28-min cap) is the
compensating control.

*— Threat Model · extended · 2026-04-24*
