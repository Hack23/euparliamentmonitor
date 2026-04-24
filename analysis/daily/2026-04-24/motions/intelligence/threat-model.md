# Threat Model — March 2026 Motion Cluster

<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

**Framework**: adapted STRIDE for political-process threats — each
motion cluster is treated as a "process asset" whose confidentiality,
integrity, and availability are subject to adversarial pressure from
internal (EP-group) and external (Member State, third-country, private)
actors. WEP bands and Admiralty grading per
`osint-tradecraft-standards.md`.

## 1 · Asset inventory

| Asset | Criticality | Owner | Dependency |
|---|---|---|---|
| A-1 Adopted texts March 2026 | HIGH | EP plenary | OLP majority (SRMR3, US tariff, HDV); simple majority (INI + urgency) |
| A-2 Political narrative "clean hands" | HIGH | Parliament as institution | Reinforced by Braun waiver + TA-10-2026-0094 |
| A-3 Grand-coalition arithmetic | HIGH | EPP–S&D–Renew | Subject to fatigue, external pressure |
| A-4 Rule-of-law foreign-policy voice | MEDIUM | AFET + DROI | Credible only if sanctions instruments follow |
| A-5 Housing demand pipeline | MEDIUM | S&D + Greens/EFA + The Left | Dependent on Commission WP 2027 |
| A-6 Banking-union completeness | HIGH | ECON + SRB | SRMR3 trilogue output |
| A-7 AI-copyright transparency norm | MEDIUM | JURI + CULT | Dependent on delegated acts |

## 2 · Adversary catalogue

| Adversary | Actor type | Primary lever | Likelihood (WEP) of exercising |
|---|---|---|---|
| T-US Trump-II trade team | Third-country state | Counter-tariffs, political pressure on Member States | LIKELY |
| T-GED Georgian Dream | Third-country state | Rhetoric, targeted sanctions on EU actors | EVEN CHANCE |
| T-IR Iranian regime | Third-country state | Proxy pressure, disinformation | LIKELY |
| T-OEM Truck OEMs (ACEA) | Industry | Technical lobbying on HDV delegated act | HIGHLY LIKELY |
| T-AI AI model providers | Industry | Regulatory erosion, litigation | HIGHLY LIKELY |
| T-FR Far-right coordination (PfE + ECR fragments + ESN + NI) | Internal EP | Amendment strategies, delay tactics, media cycles | LIKELY |
| T-MS Member-state justice ministries (HU + SK + AT rotating) | Internal EU | Council blocking-minority | LIKELY |
| T-CY Hostile cyber actor | External | Exploitation of EP systems around votes | UNLIKELY but HIGH-IMPACT |
| T-MF Mis-/dis-information actor | External | Narrative spoiling on Braun waiver + housing | LIKELY |

## 3 · STRIDE mapping per asset

### A-1 · Adopted texts (process integrity)

* **S** Spoofing — impersonation of rapporteur positions in external
  media (low probability).
* **T** Tampering — amendments deliberately crafted to hollow out
  substantive provisions (T-OEM on HDV; T-AI on copyright). WEP:
  HIGHLY LIKELY during delegated-act phase.
* **R** Repudiation — Council actors denying substantive
  interpretation of an EP demand motion (T-MS on corruption). WEP:
  LIKELY.
* **I** Information disclosure — leak of draft negotiating positions
  before trilogue. WEP: LIKELY for SRMR3.
* **D** Denial of service — procedural delay tactics by far-right
  groups (T-FR). WEP: LIKELY but low amplitude.
* **E** Elevation of privilege — minority attempts to hijack majority
  rapporteurship slot via procedural motion. WEP: UNLIKELY.

### A-2 · "Clean hands" narrative

* **T** Tampering — counter-narrative campaign by NI + PfE claiming
  political persecution of Braun (T-FR + T-MF). WEP: LIKELY,
  observed in comparable EP9 immunity-waiver cases.
* **D** Denial of service — narrative dilution by competing
  negative-institutional stories (Qatargate follow-on, new MEP
  scandals). WEP: EVEN CHANCE (base rate of new scandals in any 12-
  month window: ~1 major + ~2 minor).

### A-3 · Grand-coalition arithmetic

* **T** Tampering — targeted issue wedges (Mercosur, farmer protests,
  migration) designed to split EPP from S&D or Renew from EPP. WEP:
  LIKELY.
* **R** Repudiation — individual national delegations breaking from
  group whip on specific files (observed pattern for FR and IT
  delegations on trade files). WEP: HIGHLY LIKELY.

### A-4 · Rule-of-law foreign-policy voice

* **I** Information disclosure — hostile actor publishes private
  correspondence of AFET rapporteurs (Iranian regime base rate:
  episodic; Russian/Belarusian base rate: persistent).
* **R** Repudiation — Member State refusing to implement targeted
  sanctions downstream of an EP resolution. WEP: LIKELY.

### A-6 · Banking-union completeness

* **T** Tampering — Council amendment strategy during trilogue
  (T-MS + bank-lobby coordinated pressure via national capitals).
  WEP: LIKELY.
* **I** Information disclosure — leak of SRB stress-test parameters
  or contingency plans during SRMR3 finalisation. WEP: UNLIKELY but
  HIGH-IMPACT.
* **D** Denial of service — major bank resolution event occurring
  before SRMR3 entry into force creates political pressure to
  reopen the text. WEP: UNLIKELY but HIGH-IMPACT.

### A-7 · AI-copyright transparency norm

* **T** Tampering — delegated-act dilution by Commission under
  industry pressure (T-AI). WEP: HIGHLY LIKELY.
* **E** Elevation of privilege — model-provider self-attestation
  regimes replacing third-party audit. WEP: LIKELY.

## 4 · Attack narratives

### AN-1 · HDV delegated-act dilution (T-OEM)

ACEA-led technical commentary argues that the 2025-2029 credit
calculation is "technically unworkable" and lobbies Member States
within Council to signal non-opposition to a Commission retreat.
Parliament's only tool is the Rule 105 objection to the delegated
act. **Mitigation**: ENVI-TRAN coordinated monitoring of the
Commission delegated-act text; early objection motion cued up for
2026-Q4.

### AN-2 · SRMR3 trilogue dilution (T-MS + bank lobby)

Select Member States in Council push amendments to extend
early-intervention triggers, diluting the Parliament line on faster
resolution. **Mitigation**: ECON coordinator unity + transparent
trilogue reporting to plenary.

### AN-3 · Anti-corruption Directive soft-law retreat (T-MS)

HU + SK + possibly one additional Member State signal Council
blocking-minority on a horizontal Directive; Commission retreats to
Communication. **Mitigation**: Parliament secondary resolution
re-escalating; coalition with EPPO Chief Prosecutor public advocacy.

### AN-4 · Braun narrative counter-campaign (T-FR + T-MF)

Coordinated far-right media push depicting the Braun waiver as
"political persecution"; potentially amplified by non-EU state
actors. **Mitigation**: factual communication from JURI and EP
President; rapid-response press capacity.

### AN-5 · US retaliation (T-US)

Commerce-department counter-announcements on EU steel, automotive,
or agricultural products. **Mitigation**: Commission INTA-led
Article 207 TFEU response; Parliament resolution signalling
willingness to authorise further trade-defence measures.

## 5 · Risk rating (compact)

| ID | Threat | Likelihood (WEP) | Impact | Composite |
|---|---|---|---|---|
| R-HDV-01 | HDV delegated-act dilution | HIGHLY LIKELY | MEDIUM | HIGH |
| R-SRMR3-01 | Trilogue dilution | LIKELY | MEDIUM | MEDIUM-HIGH |
| R-CORR-01 | Soft-law retreat | EVEN CHANCE | HIGH | MEDIUM-HIGH |
| R-BRAUN-01 | Counter-narrative | LIKELY | MEDIUM | MEDIUM |
| R-US-01 | Counter-tariff escalation | EVEN CHANCE | HIGH | MEDIUM-HIGH |
| R-AI-01 | Transparency erosion | HIGHLY LIKELY | MEDIUM | HIGH |
| R-MS-01 | Council blocking minority (multi-file) | LIKELY | HIGH | HIGH |
| R-CY-01 | Hostile cyber on EP infra | UNLIKELY | VERY HIGH | MEDIUM |
| R-GRC-01 | Grand-coalition fatigue | EVEN CHANCE | HIGH | MEDIUM-HIGH |

## 6 · Confidence audit

Every row above uses WEP bands. Admiralty grade for derived evidence:
B-3 (external lobbying patterns inferred from prior public filings,
not from the EP Open Data Portal). Base rates are documented in
`intelligence/historical-baseline.md`. This threat model intentionally
avoids point estimates on likelihood numerics; WEP ranges govern.

## 7 · Treatment plan cross-reference

Every identified threat has an associated treatment line in
`risk-scoring/risk-matrix.md`. The risk matrix is the authoritative
treatment register; this threat model is the analytical source.
