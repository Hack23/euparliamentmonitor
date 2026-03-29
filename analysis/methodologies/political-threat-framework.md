<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🎭 Political Threat Analysis Framework — European Parliament</h1>

<p align="center">
  <strong>📊 STRIDE-Adapted Framework for EU Democratic Process Threats</strong><br>
  <em>🎯 Spoofing · Tampering · Repudiation · Disclosure · Denial · Elevation</em>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 1.0 | **📅 Last Updated:** 2026-03-28 (UTC)
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-06-28
**🏢 Owner:** Hack23 AB (Org.nr 5595347807) | **🏷️ Classification:** Public

---

## 🎯 Purpose

This framework adapts the STRIDE threat modelling methodology from cybersecurity to **EU democratic process threat analysis**. Each STRIDE category maps to a class of threats against the European Parliament's democratic functioning, providing structured analytical coverage of institutional, political, and external risks.

This methodology is inspired by [Hack23 ISMS Threat Modeling](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Threat_Modeling.md) and the [Riksdagsmonitor political threat framework](https://github.com/Hack23/riksdagsmonitor/blob/main/analysis/methodologies/political-threat-framework.md), adapted for the EU Parliament context.

---

## 🎭 STRIDE Categories for EU Democratic Threats

### S — Spoofing: False Narratives & Disinformation

Actors misrepresenting facts, identities, or political positions to manipulate EU public discourse or parliamentary outcomes.

| Threat Type | EU Parliament Context | MCP Detection Tools |
|------------|----------------------|-------------------|
| Foreign disinformation campaigns | State actors targeting EP elections or legislative debates | `get_parliamentary_questions`, `get_speeches` |
| Astroturfing MEP positions | Misrepresenting MEP voting records on social media | `get_voting_records`, `analyze_voting_patterns` |
| Manufactured consensus | Creating appearance of political group unity on contested votes | `detect_voting_anomalies` |
| Deepfake political statements | AI-generated false statements attributed to EP officials | External monitoring |

**Severity Indicators:**
- Scale: number of member states affected
- Timing: proximity to EP elections or key votes
- Attribution: identifiable state actor → higher severity

---

### T — Tampering: Policy Corruption Risks

Manipulation of legislative texts, parliamentary records, or policy processes to corrupt outcomes.

| Threat Type | EU Parliament Context | MCP Detection Tools |
|------------|----------------------|-------------------|
| Undisclosed lobbying | Lobbyists influencing amendments without transparency register compliance | `get_committee_documents`, `search_documents` |
| Opaque trilogue negotiations | Key legislative changes made in closed trilogue without plenary input | `track_legislation`, `get_procedures` |
| Regulatory capture | Industry groups dominating committee expert hearings | `get_committee_info`, `get_events` |
| Amendment flooding | Deliberate overload of amendments to obscure substantive changes | `get_plenary_documents` |

---

### R — Repudiation: Accountability Evasion

Actors denying statements, votes, or commitments to evade accountability.

| Threat Type | EU Parliament Context | MCP Detection Tools |
|------------|----------------------|-------------------|
| Voting record contradictions | MEPs contradicting their roll-call voting positions in national media | `get_voting_records`, `analyze_voting_patterns` |
| Political group position reversal | Groups claiming positions inconsistent with prior voting patterns | `compare_political_groups`, `detect_voting_anomalies` |
| Commission accountability gaps | Commissioners evading EP oversight questions | `get_parliamentary_questions` |
| National delegation splits | National parties claiming EP group positions they voted against | `analyze_country_delegation` |

**EP Mitigation:** Roll-call votes are fully public; the MCP server provides complete voting records for cross-referencing.

---

### I — Information Disclosure: Transparency Failures

Suppression, delay, or selective disclosure of politically significant information.

| Threat Type | EU Parliament Context | MCP Detection Tools |
|------------|----------------------|-------------------|
| Classified trilogue documents | Key legislative texts withheld from public scrutiny | `get_procedures`, `search_documents` |
| MEP financial interest concealment | Incomplete or delayed declarations of financial interests | `get_mep_declarations` |
| Commission document delays | Strategic delays in publishing impact assessments | `get_external_documents` |
| Selective plenary agenda manipulation | Burying controversial votes in crowded sessions | `get_plenary_sessions`, `get_meeting_activities` |

---

### D — Denial: Democratic Process Obstruction

Obstruction, delay, or blockage of normal democratic processes.

| Threat Type | EU Parliament Context | MCP Detection Tools |
|------------|----------------------|-------------------|
| Committee obstruction | Blocking committee reports through procedural delays | `get_committee_documents`, `analyze_committee_activity` |
| Plenary filibustering | Extended debate to prevent timely votes | `get_speeches`, `get_plenary_sessions` |
| Blocking minority abuse | Using EP rules to delay or prevent legislative progress | `monitor_legislative_pipeline` |
| Cross-institutional deadlock | EP-Council impasse blocking legislation | `track_legislation`, `get_procedures` |

---

### E — Elevation of Privilege: Power Concentration

Actors accumulating power beyond democratic mandate or circumventing institutional checks.

| Threat Type | EU Parliament Context | MCP Detection Tools |
|------------|----------------------|-------------------|
| Executive overreach | Commission legislating via delegated acts bypassing EP | `get_procedures`, `search_documents` |
| Conference of Presidents dominance | Bureau decisions circumventing full plenary authority | `get_events`, `get_plenary_session_documents` |
| Political group whip power | Groups suppressing internal dissent on conscience votes | `detect_voting_anomalies`, `analyze_voting_patterns` |
| Interinstitutional power shift | Council bypassing EP co-decision in CFSP/defence | `get_adopted_texts`, `get_external_documents` |

---

## 📊 Threat Severity Assessment

| Severity | Score | EU Democratic Consequence |
|----------|:-----:|--------------------------|
| **SEVERE** | 5 | EU Treaty-level crisis; institutional legitimacy threatened |
| **HIGH** | 4 | Major legislative failure; significant democratic deficit |
| **MODERATE** | 3 | Policy process distorted; recoverable with institutional action |
| **LOW** | 2 | Minor procedural irregularity; normal institutional correction |
| **MINIMAL** | 1 | Routine political manoeuvring; no democratic harm |

---

## 🎯 Threat Actor Categories

| Actor Type | Examples | Primary STRIDE Categories |
|-----------|---------|--------------------------|
| **State Actors** | Russia, China, influence operations | S (Spoofing), I (Disclosure) |
| **Political Groups** | EPP, S&D, ECR, PfE, ESN | R (Repudiation), D (Denial), E (Elevation) |
| **Individual MEPs** | Key rapporteurs, committee chairs | R (Repudiation), T (Tampering) |
| **EU Institutions** | Commission, Council, EEAS | T (Tampering), E (Elevation) |
| **Lobby Groups** | Industry federations, NGOs | T (Tampering), I (Disclosure) |
| **Media** | EU-focused press, national media | S (Spoofing), I (Disclosure) |

---

## 🔗 Related Documents

- [templates/threat-analysis.md](../templates/threat-analysis.md) — Threat analysis template
- [political-risk-methodology.md](political-risk-methodology.md) — Complementary risk scoring
- [political-classification-guide.md](political-classification-guide.md) — Classification input

---

**Document Control:**
- **Path:** `/analysis/methodologies/political-threat-framework.md`
- **ISMS Reference:** [Threat_Modeling.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Threat_Modeling.md)
- **Adapted from:** [Riksdagsmonitor threat framework](https://github.com/Hack23/riksdagsmonitor/blob/main/analysis/methodologies/political-threat-framework.md)
- **Classification:** Public
