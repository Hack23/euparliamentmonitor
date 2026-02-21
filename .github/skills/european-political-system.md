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
European Parliament (751 seats, Lisbon Treaty maximum)
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
│   ├── ID — Identity and Democracy
│   ├── The Left — GUE/NGL successor
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
| **European People's Party** | EPP | Centre-right | ~180 MEPs | Single market, security, competitiveness |
| **Socialists and Democrats** | S&D | Centre-left | ~140 MEPs | Social rights, workers' protection, equality |
| **Renew Europe** | Renew | Liberal/centrist | ~100 MEPs | Rule of law, digital agenda, trade |
| **Greens/EFA** | Greens/EFA | Green/regionalist | ~70 MEPs | Climate, environment, minority rights |
| **European Conservatives** | ECR | Conservative | ~65 MEPs | Sovereignty, subsidiarity, fiscal discipline |
| **Identity and Democracy** | ID | Right-wing | ~60 MEPs | Immigration control, national identity |
| **The Left** | GUE/NGL | Left-wing | ~35 MEPs | Social justice, anti-austerity, peace |
| **Non-Inscritti** | NI | Various | ~30 MEPs | No group affiliation |

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
