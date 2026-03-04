---
name: european-political-system
description: EU Parliament institutional structure, legislative procedures, political groups, and inter-institutional dynamics for parliamentary monitoring
license: Apache-2.0
---

# 🇪🇺 European Political System Skill

## Purpose

Provide comprehensive knowledge of the European Parliament's institutional structure, legislative procedures, political dynamics, and inter-institutional relationships. Ensures accurate representation of EU parliamentary processes in multi-language news articles and data analysis.

## When to Use

✅ Generating news articles about EU Parliament proceedings
✅ Contextualizing MEP behavior within institutional framework
✅ Explaining legislative procedures to readers in 14 languages
✅ Analyzing political group dynamics and coalition patterns
✅ Covering committee work and plenary sessions
✅ Reporting on EP elections and representation changes

❌ National parliament procedures (each member state differs)
❌ European Council summit analysis
❌ EU foreign policy and CFSP (limited EP role)
❌ ECB monetary policy decisions

## Core Framework

### EU Parliament Structure

```
European Parliament (720 seats as of 2024 elections)
├── President & Bureau
│   ├── President (elected by MEPs)
│   ├── 14 Vice-Presidents
│   └── 5 Quaestors
├── Conference of Presidents
│   └── President + Political Group Leaders
├── Political Groups (minimum 23 MEPs from 7+ member states)
│   ├── EPP — European People's Party
│   ├── S&D — Progressive Alliance of Socialists and Democrats
│   ├── Renew Europe — Liberals and centrists
│   ├── Greens/EFA — Greens and regionalists
│   ├── ECR — European Conservatives and Reformists
│   ├── The Left — GUE/NGL successor
│   ├── PfE — Patriots for Europe
│   ├── ESN — Europe of Sovereign Nations
│   └── NI — Non-Inscritti (non-attached)
├── Standing Committees (20 + 4 sub-committees)
│   ├── AFET — Foreign Affairs
│   ├── BUDG — Budgets
│   ├── ECON — Economic and Monetary Affairs
│   ├── EMPL — Employment and Social Affairs
│   ├── ENVI — Environment, Public Health, Food Safety
│   ├── ITRE — Industry, Research, Energy
│   ├── IMCO — Internal Market and Consumer Protection
│   ├── TRAN — Transport and Tourism
│   ├── REGI — Regional Development
│   ├── AGRI — Agriculture and Rural Development
│   ├── PECH — Fisheries
│   ├── CULT — Culture and Education
│   ├── JURI — Legal Affairs
│   ├── LIBE — Civil Liberties, Justice, Home Affairs
│   ├── AFCO — Constitutional Affairs
│   ├── FEMM — Women's Rights and Gender Equality
│   ├── PETI — Petitions
│   ├── CONT — Budgetary Control
│   ├── DEVE — Development
│   └── INTA — International Trade
└── Plenary Sessions
    ├── Strasbourg — 12 plenary sessions/year (4 days each)
    └── Brussels — Additional mini-plenaries (2 days each)
```

### Political Groups Reference

| Group | Abbreviation | Ideology | Typical Size | Key Policy Focus |
|-------|-------------|----------|--------------|-----------------|
| **European People's Party** | EPP | Centre-right | ~188 MEPs | Single market, security, competitiveness |
| **Socialists and Democrats** | S&D | Centre-left | ~136 MEPs | Social rights, workers' protection, equality |
| **Patriots for Europe** | PfE | National-conservative | ~86 MEPs | Sovereignty, immigration control, national identity |
| **European Conservatives** | ECR | Conservative | ~78 MEPs | Subsidiarity, fiscal discipline, traditional values |
| **Renew Europe** | Renew | Liberal/centrist | ~77 MEPs | Rule of law, digital agenda, trade |
| **Greens/EFA** | Greens/EFA | Green/regionalist | ~53 MEPs | Climate, environment, minority rights |
| **The Left** | The Left | Left-wing | ~46 MEPs | Social justice, anti-austerity, peace |
| **Europe of Sovereign Nations** | ESN | Sovereigntist | ~25 MEPs | National sovereignty, EU reform |
| **Non-Inscritti** | NI | Various | ~33 MEPs | No group affiliation |

### Seat Allocation by Member State

| Country | Seats | Country | Seats | Country | Seats |
|---------|-------|---------|-------|---------|-------|
| 🇩🇪 Germany | 96 | 🇫🇷 France | 81 | 🇮🇹 Italy | 76 |
| 🇪🇸 Spain | 61 | 🇵🇱 Poland | 53 | 🇷🇴 Romania | 33 |
| 🇳🇱 Netherlands | 31 | 🇧🇪 Belgium | 22 | 🇬🇷 Greece | 21 |
| 🇨🇿 Czechia | 21 | 🇸🇪 Sweden | 21 | 🇵🇹 Portugal | 21 |
| 🇭🇺 Hungary | 21 | 🇦🇹 Austria | 20 | 🇧🇬 Bulgaria | 17 |
| 🇩🇰 Denmark | 15 | 🇫🇮 Finland | 15 | 🇸🇰 Slovakia | 15 |
| 🇮🇪 Ireland | 14 | 🇭🇷 Croatia | 12 | 🇱🇹 Lithuania | 11 |
| 🇱🇻 Latvia | 9 | 🇸🇮 Slovenia | 9 | 🇪🇪 Estonia | 7 |
| 🇨🇾 Cyprus | 6 | 🇱🇺 Luxembourg | 6 | 🇲🇹 Malta | 6 |

### Legislative Procedures

#### Ordinary Legislative Procedure (OLP / Co-decision)

```
Commission Proposal
    │
    ▼
EP First Reading (Committee → Plenary)
    │ ←── get_committee_info, search_documents
    ▼
Council First Reading
    │
    ├── Agreement → Act Adopted
    │
    ▼
EP Second Reading (amendments or approval)
    │ ←── get_voting_records, track_legislation
    ▼
Council Second Reading
    │
    ├── Agreement → Act Adopted
    │
    ▼
Conciliation Committee (EP + Council)
    │
    ▼
Third Reading (EP + Council)
    │
    ├── Agreement → Act Adopted
    └── No Agreement → Proposal Falls
```

#### Special Legislative Procedures

| Procedure | EP Role | Council Role | Treaty Basis |
|-----------|---------|-------------|--------------|
| **Consultation** | Non-binding opinion | Decides unanimously | Various TFEU articles |
| **Consent** | Must approve (no amendments) | Decides | Art. 218, 312 TFEU |
| **Budget** | Co-authority with Council | Co-authority | Art. 314 TFEU |

### Trilogue Process

```
   European Parliament          Council of the EU
   (Committee position)         (General Approach)
          │                            │
          └──────────┬─────────────────┘
                     │
              Informal Trilogue
              (EP team, Council Presidency,
               Commission as mediator)
                     │
              ┌──────┴──────┐
              │   Outcome   │
              └──────┬──────┘
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
   EP Plenary Vote        Council Vote
   (Simple majority)      (QMV or unanimity)
```

### Key Institutional Relationships

| Relationship | Mechanism | MCP Relevance |
|-------------|-----------|--------------|
| **EP ↔ Commission** | Investiture vote, censure motion, question time | `get_parliamentary_questions` |
| **EP ↔ Council** | Co-legislation, conciliation, trilogues | `track_legislation` |
| **EP ↔ ECB** | Monetary dialogue, accountability hearings | `get_plenary_sessions` |
| **EP ↔ Court of Auditors** | Budgetary discharge | `search_documents` |

### EP Elections

- **Frequency**: Every 5 years (next: 2029)
- **System**: Proportional representation (varies by member state)
- **Turnout trend**: 42.6% (2014) → 50.7% (2019) → 51.0% (2024)
- **Spitzenkandidaten**: Lead candidate system (non-binding)
- **Term**: 10th parliamentary term (2024–2029)

### MCP Data Mapping to Institutional Structure

```javascript
// Map MCP tools to institutional knowledge
const INSTITUTIONAL_CONTEXT = {
  'get_meps': {
    context: 'Member profiles within political group and national delegation',
    enrichment: ['country seat allocation', 'group ideology', 'committee roles']
  },
  'get_voting_records': {
    context: 'Roll-call votes in plenary or committee',
    enrichment: ['procedure type', 'required majority', 'political significance']
  },
  'get_committee_info': {
    context: 'Standing committee composition and mandate',
    enrichment: ['policy area', 'legislative dossiers', 'inter-committee relations']
  },
  'get_plenary_sessions': {
    context: 'Strasbourg or Brussels sessions',
    enrichment: ['session type', 'agenda items', 'voting schedule']
  },
  'track_legislation': {
    context: 'Legislative procedure progress',
    enrichment: ['procedure type', 'current stage', 'institutional positions']
  }
};
```

### Multi-Language Terminology Guide

| Concept | EN | FR | DE |
|---------|-----|-----|-----|
| Rapporteur | Rapporteur | Rapporteur | Berichterstatter |
| Shadow rapporteur | Shadow rapporteur | Rapporteur fictif | Schattenberichterstatter |
| Roll-call vote | Roll-call vote | Vote par appel nominal | Namentliche Abstimmung |
| Plenary session | Plenary session | Session plénière | Plenarsitzung |
| Amendment | Amendment | Amendement | Änderungsantrag |
| First reading | First reading | Première lecture | Erste Lesung |
| Trilogue | Trilogue | Trilogue | Trilog |
| Political group | Political group | Groupe politique | Fraktion |
| Resolution | Resolution | Résolution | Entschließung |
| Adopted text | Adopted text | Texte adopté | Angenommener Text |
| Legislative proposal | Legislative proposal | Proposition législative | Gesetzgebungsvorschlag |
| Committee report | Committee report | Rapport de commission | Ausschussbericht |
| Parliamentary question | Parliamentary question | Question parlementaire | Parlamentarische Anfrage |

### ⚠️ EP Vocabulary — Common Errors to Avoid

When writing about the European Parliament, use the correct institutional vocabulary:

| ❌ Incorrect Term | ✅ Correct EP Term | Why |
|-------------------|-------------------|-----|
| "Motions" (generic) | **Resolutions**, **Adopted texts**, **Plenary votes** | In the EP, a "motion" only appears in "motion for a resolution" (Rule 143) or "motion of censure" (Rule 119). The EP does not use "motions" generically for plenary activity. |
| "Propositions" | **Legislative proposals**, **Legislative procedures** | "Proposition" is a French/Swedish national parliament term. The EU uses "proposal" (Commission proposal) or "legislative procedure" (COD, CNS, APP). |
| "Laws" | **Regulations**, **Directives**, **Decisions** | The EU has specific legal instrument types — it does not pass "laws" generically. |
| "Parliament votes" | **Plenary votes**, **Roll-call votes** | Be specific: plenary votes happen in Strasbourg/Brussels sessions; committee votes happen in committees. |
| "Committees" (FR: "Commissions") | **Commissions parlementaires** (FR) | In French, distinguish between "la Commission" (European Commission) and "les commissions parlementaires" (EP committees). |
| "Bills" | **Legislative proposals**, **Draft legislation** | The EU does not use "bills" — this is UK/US parliamentary vocabulary. |
| "ID" (Identity and Democracy) | **PfE** (Patriots for Europe), **ESN** (Europe of Sovereign Nations) | ID was dissolved after 2024 elections, replaced by PfE and ESN in the 10th parliamentary term. |

### Article Type Vocabulary Mapping

| Internal Slug | Correct EP Display Name | Content Scope |
|---------------|------------------------|---------------|
| `motions` | **Plenary Votes & Resolutions** | Adopted texts, roll-call votes, party cohesion, voting anomalies, parliamentary questions |
| `propositions` | **Legislative Procedures** | Commission proposals, legislative pipeline, procedure tracking (COD/CNS/APP/BUD) |
| `committee-reports` | **Committee Activity** | Committee documents, rapporteur reports, committee opinions, deliberations |
| `breaking` | **Breaking News** | Feed-first: adopted texts, events, procedures, MEP updates from EP feeds |
| `week-ahead` | **Week Ahead** | Upcoming plenary sessions, committee meetings, events |
| `week-in-review` | **Week in Review** | Past week's votes, decisions, debates |
| `month-ahead` | **Month Ahead** | 30-day strategic outlook |
| `month-in-review` | **Month in Review** | Monthly comprehensive analysis |

## ISMS Compliance Mapping

| ISO 27001 Control | NIST CSF | CIS Control | Implementation |
|-------------------|----------|-------------|----------------|
| A.5.12 Classification | GV.OC-1 | CIS-3.1 | PUBLIC institutional data classification |
| A.5.1 Policies | GV.PO-1 | CIS-1.1 | Accurate institutional representation |
| A.8.25 Secure SDLC | PR.IP-2 | CIS-16 | Validated institutional data in articles |
| A.5.34 Privacy | GV.OC-3 | CIS-3.7 | Public official data only |

## Hack23 ISMS Policy References

- [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md)
- [Classification Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Classification_Policy.md)
- [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)

## References

- [European Parliament — About](https://www.europarl.europa.eu/about-parliament/en)
- [EU Legislative Procedures](https://www.europarl.europa.eu/about-parliament/en/powers-and-procedures)
- [European Parliament Rules of Procedure](https://www.europarl.europa.eu/rules)
- [Treaty on European Union (TEU)](https://eur-lex.europa.eu/eli/treaty/teu_2016/oj)
- [Treaty on the Functioning of the EU (TFEU)](https://eur-lex.europa.eu/eli/treaty/tfeu_2016/oj)
- [European Parliament MCP Server](https://github.com/Hack23/European-Parliament-MCP-Server)
