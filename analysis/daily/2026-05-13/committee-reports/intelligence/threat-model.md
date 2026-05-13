# Threat Model — EU Parliament Committee System, May 2026

## Threat Intelligence Framework

This threat model applies structured threat intelligence methodology to identify vulnerabilities, threat actors, and risk mitigations relevant to the EU Parliament's committee legislative system as of May 2026. It complements the broader Threat Assessment artifact with a more structured actor-vector-impact decomposition.

## Threat Category 1 — Institutional Capture

**Threat**: Capture of committee rapporteur positions by organised interests, leading to legislative output systematically biased toward specific sector interests.

**Indicators observed (May 2026)**:
- BusinessEurope has directly lobbied EPP ENVI rapporteurs on CSRD threshold revision
- The final CSRD threshold (50 employees, €10m revenue) closely mirrors BusinessEurope's preferred position rather than Commission's original proposal
- ITRE's Semiconductor rapporteur has facilitated industry working group inputs that were incorporated verbatim into draft amendments

**Threat actors**: Industry associations with high EP engagement (BusinessEurope, ERT, CEFIC, DigitalEurope, Copa-Cogeca), national government lobbying units, major law firms and lobbying agencies based in Brussels

**Vulnerability**: EP transparency register is voluntary in scope; shadow rapporteur meetings are often not logged; rapporteur amendment drafting is not subject to ex ante interest disclosure

**Risk level**: 🔴 HIGH — Structural feature of EP committee system; cannot be fully eliminated; can be partially mitigated through shadow rapporteur scrutiny and public hearing requirements

**Mitigation**: EP's public register of meetings, shadow rapporteur challenge function, civil society monitoring organisations (LobbyControl, Corporate Europe Observatory), EPRS independent briefing papers

## Threat Category 2 — Democratic Legitimacy Under Pressure

**Threat**: Use of executive/delegated acts to circumvent EP co-legislative scrutiny, reducing committee system to a nominal role in key policy areas.

**Indicators observed (May 2026)**:
- EDIS governance framework discussion — some Council positions would limit EP role to ex post reporting on defence industrial spending, not ex ante co-decision
- AI Act implementation via Commission delegated acts (Annexes I-III modification) creates significant policy without EP veto beyond article 112 scrutiny right
- Omnibus legislative package combines 7+ distinct legislative revisions in one instrument — limiting EP committee specialisation and detailed scrutiny

**Threat actors**: European Commission (institutional interest in delegated act authority), Council (intergovernmental interest in bypassing EP in defence/security), member state governments

**Vulnerability**: Lisbon Treaty's delegated act architecture (Article 290) gives Commission default authority; EP scrutiny rights are procedurally complex to exercise

**Risk level**: 🟡 MEDIUM — Systemic; variable by policy area; EP is aware and is pushing back through institutional assertiveness

**Mitigation**: EP's systematic use of delegated act scrutiny rights; interinstitutional agreement negotiations; JURI committee constitutional oversight; political group resolutions opposing governance architecture proposals that exclude EP

## Threat Category 3 — Information Asymmetry and Epistemic Capture

**Threat**: Committee members systematically receive more and better information from industry sources than from independent scientific or civil society sources, leading to systematically biased legislative judgments.

**Indicators observed (May 2026)**:
- ENVI committee members receive ~40x more requests for bilateral meetings from industry than from environmental NGOs (EP transparency data 2024-2025)
- ECON AMLA rapporteur's office has met with national banking supervisors 3x more often than with civil society transparency organisations
- AI Act implementation hearings: 70% of external expert witnesses in 2025-2026 came from tech industry; 20% from academia; 10% from civil society

**Threat actors**: Industry associations, major firms with Brussels offices, management consultancies providing policy analysis, lobbying agencies

**Vulnerability**: EP committee secretariats are under-resourced for independent technical analysis; MEPs' offices have limited specialist staff; EPRS independent research is insufficient in volume

**Risk level**: 🟡 MEDIUM — Well-documented structural feature; partially mitigated by EPRS and academic research; worsening as legislative agenda grows more technically complex (AI, chemicals, financial instruments)

**Mitigation**: EPRS independence and output volume; academic advisory panels (EP Science and Technology Options Assessment — STOA); civil society hearing slots; shadow rapporteur scrutiny from technical EP groups

## Threat Category 4 — Political Fragmentation and Legislative Gridlock

**Threat**: High political fragmentation (ENP 6.58) prevents committee system from building stable majorities on contested files, leading to either lowest-common-denominator legislation or legislative failure on major priorities.

**Indicators observed (May 2026)**:
- NRL has achieved formal adoption but is effectively blocked at implementation — a form of legislative failure
- AMLA seat negotiations unresolved despite 3+ years of discussion
- EDIS governance architecture still contested between EP, Council, and Commission

**Threat actors**: Internal EP political fragmentation; Council veto dynamics; Commission institutional interests

**Vulnerability**: 9-group EP with weak supermajority arithmetic; PfE and ESN blocking roles on specific files; Council qualified majority threshold (55% states, 65% population) creates Council-level gridlock on some files

**Risk level**: 🟡 MEDIUM — Managed but persistent; the key variable is whether the Renew Group can serve as a reliable swing actor across major files

**Mitigation**: Conference of Presidents coordination; committee coordinator system; interinstitutional negotiation tradition; political group leaders' pragmatic deal-making instinct

## Threat Category 5 — External Geopolitical Disruption

**Threat**: External geopolitical shocks (US trade actions, Russian escalation, energy supply disruption) force committee work to be reprioritised, blocking or delaying strategic legislative priorities.

**Indicators observed (May 2026)**:
- US-EU Digital Trade Agreement occupies INTA and ITRE bandwidth that would otherwise be on strategic autonomy legislation
- Ukraine war continuation requires sustained AFET and BUDG Committee bandwidth for aid frameworks — opportunity cost against domestic legislative agenda
- Potential US tariff escalation (post-DTA) threatening automotive, pharmaceutical sectors — could force emergency ITRE and ECON committee action

**Threat actors**: US administration (trade policy unpredictability), Russian military strategy, energy market actors, China (strategic technology competition)

**Vulnerability**: EP committee agenda is not elastic — 20 MEPs per major committee with limited capacity cannot simultaneously manage legislative agenda plus geopolitical crises

**Risk level**: 🟡 MEDIUM — External; largely uncontrollable; partially mitigated through flexible agenda management and emergency procedure use

**Mitigation**: Emergency procedure (Article 238 EP Rules of Procedure) for fast-track legislation; AFET-ITRE coordination on geoeconomic files; political group crisis coordination protocols

## Summary Risk Matrix

| Threat | Probability | Impact | Current Level | Trend |
|--------|-------------|--------|---------------|-------|
| Institutional capture | HIGH | MEDIUM | 🔴 HIGH | Stable |
| Delegated act bypass | MEDIUM | HIGH | 🟡 MEDIUM | Rising |
| Epistemic capture | HIGH | MEDIUM | 🟡 MEDIUM | Rising |
| Political gridlock | MEDIUM | MEDIUM | 🟡 MEDIUM | Stable |
| Geopolitical disruption | MEDIUM | HIGH | 🟡 MEDIUM | Variable |

**Overall threat environment**: The EP committee system in May 2026 faces a combination of structural (institutional capture, epistemic asymmetry) and situational (political fragmentation, external disruption) threats. The most concerning medium-term threat is the growing use of delegated acts and governance architecture design to reduce EP's effective co-legislative role — particularly in the EDIS and AI Act implementation domains. This is a slow-moving but high-impact threat to the EP's democratic function.

🟢 Confidence: HIGH on structural threat categories; 🟡 MEDIUM on specific probability estimates.
