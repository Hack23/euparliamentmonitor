# Threat Model — EP10 Month-in-Review April 2026

## Threat Taxonomy

### Tier 1 — Systemic Threats (High Impact, Possible)

**T1.1: Banking Union Incompletion Risk**
Description: BRRD3 enters force but CMDI stalls. Member States diverge on transposition of bail-in sequencing. Resolution colleges lack harmonised data standards required by EBA Level 2 measures.
Actor: Uncoordinated MS transposition; German constitutional objections to EDIS risk mutualisation.
Impact: Asymmetric resolution treatment creates cross-border contagion risk. BRRD3's value partially negated.
Likelihood: Possible (🟡 MEDIUM). Evidence: Historical pattern of Banking Union implementation delays (SSM took 24 months; SRM took 36 months for full operationalisation).
Mitigant: EBA supervisory convergence tools; Commission infringement proceedings.

**T1.2: CSAM Permanent Regulation Legal Challenge**
Description: Civil liberties coalition successfully refers the forthcoming mandatory CSAM detection regulation to ECJ. Interim measures suspend enforcement.
Actor: EDRi, AccessNow, national courts (Verwaltungsgericht Hamburg precedent).
Impact: Delays child protection enforcement; creates legal uncertainty for operators that invested in voluntary compliance systems.
Likelihood: Possible (🟡 MEDIUM). Evidence: ECJ's strong track record invalidating mass surveillance mandates (Digital Rights Ireland, Schrems II).
Mitigant: Rights-by-design architecture in voluntary phase; EP LIBE committee oversight.

### Tier 2 — Coalition Threats (Medium Impact, Possible)

**T2.1: Renew Europe Fragmentation**
Description: French and German Renew Europe national delegations diverge on economic regulation as 2027 European Council approaches. Renew splits on AI Act implementation (pro-innovation vs. pro-rights factions).
Actor: Internal EP group dynamics; national government pressure.
Impact: Working majority reduced to EPP + S&D + selective Greens/EFA support. Harder to pass contested texts.
Likelihood: Possible (🟡 MEDIUM). Evidence: French delegation voted differently from German Renew MEPs on two of eighteen March 26 texts (intelligence estimate, roll-call data pending).
Mitigant: Group leadership discipline; Commission legislative coordination.

**T2.2: EPP Shift Under Patriots for Europe Competitive Pressure**
Description: EPP national parties losing voters to Patriots for Europe affiliates. EPP group in EP shifts rightward, abandoning S&D-aligned coalition on social files.
Actor: Electoral pressure from member parties (Italy's FdI competition with FI; French LR vs. RN dynamics).
Impact: S&D loses reliable coalition partner. Anti-Corruption Directive implementation weakened by EPP blocking secondary measures.
Likelihood: Possible (🟡 MEDIUM). Evidence: EPP-affiliated governments in Hungary, Italy, Poland increasingly aligned with PfE positions on rule of law.
Mitigant: S&D builds Renew Europe + Greens/EFA alternative majority for social files.

### Tier 3 — Implementation Threats (Lower Impact, Likely)

**T3.1: AI Governance Capacity Gap**
Description: AI Act national supervisory authorities underfunded and understaffed across multiple Member States. Level 2 Delegated Acts delayed due to Commission capacity constraints.
Actor: Austerity-driven national budget pressures; regulatory technical complexity.
Impact: Regulatory divergence between well-resourced (Germany, France, Netherlands) and under-resourced (Romania, Bulgaria, Cyprus) MS.
Likelihood: Likely (🟢 HIGH confidence this will occur to some degree). Evidence: Comparable implementation gap observed in GDPR enforcement (2018–2022).
Mitigant: EU coordination mechanism under AI Office; Commission implementation support fund.

**T3.2: Anti-Corruption Directive Minimum Standards Drift**
Description: Member States transpose Anti-Corruption Directive at the absolute minimum threshold, preserving existing institutional arrangements that enabled prior high-profile corruption cases.
Actor: MS governments with institutional self-preservation incentives.
Impact: Directive fails to deliver substantive anti-corruption improvement in high-risk jurisdictions.
Likelihood: Likely (🟡-🟢 confidence). Evidence: Historical pattern in anti-money laundering directive transposition.
Mitigant: Commission transposition review; Council of Europe GRECO monitoring process.

## Risk-Threat Matrix Summary

| Threat | Likelihood | Impact | Priority |
|---|---|---|---|
| Banking Union incompletion | Possible | Systemic | HIGH |
| CSAM ECJ challenge | Possible | High | HIGH |
| Renew fragmentation | Possible | Medium | MEDIUM |
| EPP rightward shift | Possible | High | MEDIUM-HIGH |
| AI capacity gap | Likely | Medium | MEDIUM |
| Anti-Corruption drift | Likely | Medium | MEDIUM |

## Diamond Model — Anti-Corruption Directive Threat

Applying the Diamond Model (Adversary, Capability, Infrastructure, Victim) to the enforcement-threat surface of the Anti-Corruption Directive adopted March 26:

**Adversary**: transnational corruption networks operating across Member State boundaries, with particular concentration in public-procurement fraud rings and cross-border money-laundering structures. Threat sophistication ranges from individual opportunistic actors to organized networks with legal-process manipulation capability.

**Capability**: established networks possess procurement-document manipulation capability, shell-company layering across multiple Member States, and access to compromised public officials in at least three high-risk Member States (documented in upstream intelligence). New Directive provisions on whistleblower protection and cross-border enforcement raise the capability bar required to sustain operations, but do not eliminate sophisticated networks.

**Infrastructure**: bank account networks across EU + Switzerland + UK + offshore centers; shell-company registration portals in low-transparency Member States; compromised procurement-portal credentials. Directive beneficial-ownership-register provisions increase infrastructure friction but do not eliminate capability.

**Victim**: Member State treasuries (direct financial loss), EU structural-fund programs (cohesion-policy credibility), and civil society (governance legitimacy). Secondary victims include compliant economic operators facing unfair competition.

Three Diamond Model observations. First, the Directive enforcement threat surface will expand rather than contract in Q2–Q4 2026 as networks adapt to new compliance requirements — a classic displacement effect. Second, the primary capability gap is in small-value cross-border fraud (below EU-prosecution thresholds), which remains a Member-State competence and therefore uneven in enforcement quality. Third, the victim axis governance-legitimacy dimension is the most difficult to measure but arguably the most consequential for Directive success.

## Cross-References to Daily Analyses

- `analysis/daily/2026-03-26/breaking-run179/intelligence/threat-model.md` — authoritative Anti-Corruption Directive threat model with full STRIDE decomposition
- `analysis/daily/2026-03-26/breaking-run182/intelligence/wildcards-blackswans.md` — CSAM legal-challenge threat vectors
- `analysis/daily/2026-03-26/breaking-run184/intelligence/threat-model.md` — composite threat model with risk-weighted scoring
- `analysis/daily/2026-03-26/breaking-run185/intelligence/threat-model.md` — bloc-level threat refinement
- `analysis/daily/2026-04-11/week-in-review-run12/intelligence/threat-model.md` — pre-recess threat baseline

## Attack Chain: CSAM Legal Challenge Sequence

Modeling the adversary progression chain for a hypothetical constitutional-court referral on the CSAM extension regulation (probability 0.28 within 18 months per breaking-run182):

1. **Reconnaissance**: civil-society NGOs and privacy-focused law firms identify constitutional-friction points in the extended regulation; scanning-obligation proportionality is the most-cited vulnerability.
2. **Weaponization**: case-theory development, targeting either Austrian Verfassungsgerichtshof or German Bundesverfassungsgericht as the most-sympathetic venues based on prior jurisprudence on proportionality review.
3. **Delivery**: strategic litigation filing, either by civil-society NGO with standing or by sympathetic Member State minority constitutional-review mechanism.
4. **Exploitation**: constitutional court accepts referral, triggering preliminary question to CJEU under Article 267 TFEU.
5. **Installation**: CJEU preliminary ruling on validity of the regulation proportionality calibration; Advocate General opinion precedes.
6. **Command and Control**: CJEU ruling establishes binding interpretation across all Member States; Commission must issue implementing-act adjustments.
7. **Actions on Objectives**: regulation scanning obligations are narrowed or the extension is limited to shorter duration than originally adopted.

Three chain observations. First, stages 1–3 are not monitorable through EP-API channels — external court-docket and NGO-communication monitoring is required. Second, the typical elapsed time from stage 3 to stage 6 is 18–30 months based on historical CSAM-adjacent cases, suggesting resolution in late 2027 to mid-2028. Third, early-stage detection (stages 1–2) is the most intelligence-valuable but the most opaque; consumers requiring early warning should invest in NGO-communication monitoring through Q2 2026.

## Threat Model Summary

Three composite threat-model observations close this artifact. First, the enforcement threat surface is expanding across Anti-Corruption, CSAM, and AI governance dimensions simultaneously, creating implementation-capacity pressure on DGs and national authorities. Second, the constitutional-friction threat vector is the highest-impact but lowest-probability surface; specialized court-docket monitoring is required for early detection. Third, the trade-countermeasure threat surface is actively evolving during recess and will be the most-changed dimension when the next threat model is refreshed.
