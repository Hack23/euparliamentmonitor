---
title: "🗺️ Stakeholder Power-Interest Map — Pre-Plenary Landscape (Run 184)"
date: 2026-04-18
articleType: breaking
runId: 184
framework: "Mendelow Power-Interest Grid + RACI adaptation + position/salience vectors"
stakeholders: 18
confidence: MEDIUM
---

# 🗺️ Stakeholder Power-Interest Map — April 18, 2026 (Run 184)

![Framework](https://img.shields.io/badge/Framework-Power_x_Interest-blue?style=flat-square)
![Stakeholders](https://img.shields.io/badge/Stakeholders-18-green?style=flat-square)
![Confidence](https://img.shields.io/badge/Confidence-MEDIUM-yellow?style=flat-square)

> **Purpose**: Enumerate the 18 stakeholders with material influence on the April 28–30
> Strasbourg plenary agenda, position them on a power × interest grid, and summarise each
> one's known position, current activity, and expected behaviour. Stakeholder mapping
> underpins the scenario forecast (`scenario-forecast.md`) and the threat model
> (`threat-model.md`).

---

## Power × Interest Grid (Mendelow)

```mermaid
%%{init: {
  "theme": "dark",
  "themeVariables": {
    "quadrant1Fill": "#1565C0",
    "quadrant2Fill": "#2E7D32",
    "quadrant3Fill": "#FF9800",
    "quadrant4Fill": "#D32F2F",
    "quadrantTitleFill": "#ffffff",
    "quadrantPointFill": "#ffffff",
    "quadrantPointTextFill": "#ffffff",
    "quadrantXAxisTextFill": "#ffffff",
    "quadrantYAxisTextFill": "#ffffff"
  },
  "quadrantChart": {
    "chartWidth": 700,
    "chartHeight": 700,
    "pointLabelFontSize": 14,
    "titleFontSize": 22,
    "quadrantLabelFontSize": 18,
    "xAxisLabelFontSize": 16,
    "yAxisLabelFontSize": 16
  }
}}%%
quadrantChart
    title Stakeholder Power × Interest — April 28 Plenary
    x-axis Low Interest --> High Interest
    y-axis Low Power --> High Power
    quadrant-1 Manage Closely (Key Players)
    quadrant-2 Keep Satisfied
    quadrant-3 Monitor
    quadrant-4 Keep Informed
    European Commission: [0.85, 0.95]
    Von der Leyen Cabinet: [0.90, 0.90]
    EPP Group: [0.80, 0.95]
    S&D Group: [0.80, 0.80]
    Renew Group: [0.70, 0.70]
    ECR Group: [0.55, 0.65]
    ECB: [0.55, 0.85]
    German Government: [0.85, 0.80]
    French Government: [0.75, 0.70]
    Italian Government: [0.55, 0.55]
    Polish Government: [0.60, 0.45]
    USTR / US Trade Rep: [0.75, 0.75]
    Sparkassen Association: [0.90, 0.80]
    Civil Society (EDRi / Access Now): [0.80, 0.25]
    Housing Europe / EAPN: [0.75, 0.20]
    Bundesrat: [0.70, 0.60]
    Greens-EFA Group: [0.75, 0.55]
    The Left Group: [0.60, 0.35]
```

> Quadrant 1 (top-right, Manage Closely) contains the decisive actors; Quadrant 2
> (top-left, Keep Satisfied) contains powerful but currently low-engagement actors whose
> posture can shift dramatically; Quadrant 4 contains high-interest low-power actors who
> shape narrative even when they cannot directly determine outcomes.

---

## Manage-Closely Stakeholders (High Power × High Interest)

### 1. European Commission (Von der Leyen II)

**Power**: Institutional monopoly on legislative initiative; enforcement authority;
Article 122 emergency powers; college of 27 commissioners. **Interest**: Extreme
every live dossier (housing response, trade countermeasure activation, Banking Union
transposition, ECJ defence) demands college attention in the April 21–28 window.

**Current activity**: Housing response drafting (DG EMPL lead); transatlantic outreach
by Commissioner Šefčovič; Banking Union implementation coordination (DG FISMA); ECJ
legal-service preparation on Digital Omnibus.

**Expected posture on April 28**: Defensive on housing (consultation-over-action
pattern); activist on trade if USTR files; conciliatory on ECJ challenge. **Confidence:
🟡 Medium** — Commission communications during recess have been measured; no tell-tale
escalation signals yet.

### 2. EPP Group (European People's Party)

**Power**: Largest EP group (~188 seats), decisive in any grand-coalition configuration,
two committee chairs on ECON and AFET. **Interest**: Extreme — EPP's internal
positioning on trade, housing, and banking will determine every major April 28 vote.

**Current activity**: Group coordinators' meeting schedule for April 26–27 (pre-plenary);
ongoing but opaque whipping process. **Data quality alert**: EPP `memberCount=0` in the
MCP API (see `mcp-reliability-audit.md` defect #2) — coalition mathematics involving
EPP carries 🔴 LOW confidence.

**Expected posture**: Pro-countermeasure activation with pro-industry conditions;
resistant to binding housing regulation; supportive of Banking Union transposition
timeline.

### 3. S&D Group (Socialists & Democrats)

**Power**: Second-largest group (135 seats); rapporteurship on Housing Affordability;
strong labour-union proxy relationships. **Interest**: Extreme — housing dossier is
S&D's headline policy agenda; countermeasure activation is an internal cohesion test.

**Current activity**: Rule 144 drafting in preparation for inadequate Commission
housing response; coordination with Greens/EFA on AI Act challenge positioning.

**Expected posture**: Aggressive on housing if Commission response inadequate
(55% probability); pro-countermeasure on trade; supportive of Digital Omnibus defence
if attacked by civil society.

### 4. German Federal Government (Merz CDU/CSU-led coalition)

**Power**: Largest member state; Bundesrat veto capacity; Eurogroup influence. **Interest**:
High — BRRD3 transposition, trade posture (automotive exposure), housing (German housing
ministry is in coalition partner's portfolio).

**Current activity**: Interministerial coordination on Banking Union transposition
timeline; Finanzministerium briefings with Sparkassen; Auswärtiges Amt quiet coordination
with US State Department on trade de-escalation.

**Expected plenary impact**: CDU/CSU MEPs (within EPP) will reflect Berlin's posture on
BRRD3 — any Bundesrat hearing would be a direct intervention signal.

### 5. USTR (US Trade Representative)

**Power**: Monopoly authority over Section 301 proceedings; tariff-setting authority
under IEEPA; congressional political cover. **Interest**: High — transatlantic digital
trade is a priority file for the administration.

**Current activity**: Federal Register filings pipeline; coordination with US Chamber
of Commerce on digital-services-tax concerns; outreach to EU member states' permanent
representations in Washington.

**Expected behaviour**: 20–25% probability of Section 301 filing in April 22–26
window. If filed, high probability of EP emergency debate on April 28 (80%).

### 6. European Central Bank (ECB)

**Power**: Monetary-policy monopoly; banking-supervisory authority via SSM; extensive
financial-stability tools. **Interest**: High — Banking Union implementation, trade-
tension financial-stability implications, Digital Omnibus AI risk to financial-services
supervision.

**Current activity**: April 17 Governing Council meeting (immediately pre-plenary);
SSM ongoing BRRD3 preparatory work; ECB legal-service position on AI Act threshold
modification for banking AI.

**Expected plenary impact**: Not a direct plenary actor, but Lagarde press-conference
language on April 17 will set market expectations that colour the April 28 political
mood.

---

## Keep-Satisfied Stakeholders (High Power × Lower Interest)

### 7. Sparkassen Association (DSGV)

**Power**: Controls ~40% of German retail banking; Bundesrat-lobby relationships;
Handwerkskammern alliance. **Interest**: Currently high on BRRD3 specifically, low on
other dossiers.

**Expected lobbying vector**: Amendment-campaign for BRRD3 transposition exemptions or
extensions through CDU/CSU parliamentary channels.

### 8. Bundesrat (German Federal Council)

**Power**: Formal veto on European banking implementation legislation under German
constitutional law; agenda-setting authority on EU-affairs resolutions. **Interest**:
High specifically on BRRD3, variable on other dossiers.

**Expected signal**: April 24–25 session agenda is the primary trigger for Risk
Vector #1 (Banking Union Transposition Defection Risk).

---

## Key-Player — Member State Governments (variable power × variable interest)

### 9. French Government (Macron presidency, fragile National Assembly)

**Power**: Eurogroup influence; Renew-group proxy via French delegation; Elysée
communications authority. **Interest**: High on trade (automotive + aerospace exposure);
moderate on Banking Union (French banks less exposed than German); low on housing.

**Expected posture**: Pro-strategic-autonomy on trade; supportive of countermeasure
activation; pragmatic on banking; disengaged on housing.

### 10. Italian Government (Meloni)

**Power**: Third-largest member state; ECR-group proxy via FdI MEPs; pivotal on
Mediterranean foreign policy. **Interest**: High on trade (manufacturing exposure),
moderate on critical minerals, low-moderate on banking.

**Expected posture**: Pro-industry on trade; supportive of critical-minerals
strategic reserve; cautious on BRRD3 (cooperative banking sector exposure).

### 11. Polish Government (Tusk KO-led)

**Power**: Large EP delegation; EU-funds political leverage; Rule-of-law rebuilding
priority. **Interest**: High on Anti-Corruption Directive (domestic political utility);
moderate on trade.

**Expected posture**: Pro-Anti-Corruption-Directive early implementation; supportive
of EU-US de-escalation; pragmatic on countermeasures.

---

## Other High-Interest Groups

### 12. Renew Europe Group

**Power**: Third-largest group (77 seats); pivotal in grand-coalition mathematics.
**Interest**: High — French-delegation cohesion is stress-tested on trade; Dutch
delegation splits on banking.

**Expected posture**: Divided internally — classical-liberal wing pro-free-trade,
industrialist wing pro-countermeasure. Renew's public position on April 28 will be
the single most telling coalition signal.

### 13. ECR Group

**Power**: 81 seats; coordination with PfE on selected dossiers; Polish-Italian
delegation weight. **Interest**: High on Anti-Corruption transposition; low-moderate
on trade.

**Expected posture**: Pro-Anti-Corruption; anti-countermeasure-activation (preserving
transatlantic alignment); critical of housing regulation.

### 14. Greens/EFA Group

**Power**: ~53 seats (API reports 0 — see reliability audit); environmental-committee
rapporteurship. **Interest**: High on Digital Omnibus defence, housing regulation,
critical-minerals environmental safeguards.

**Expected posture**: Aggressive on housing if Commission response inadequate;
coordinate-with-S&D on Digital Omnibus ECJ defence.

### 15. The Left Group

**Power**: 46 seats. **Interest**: High on housing, medium on trade (critical of both
US and EU approaches).

**Expected posture**: Loud on housing; split on trade (anti-countermeasure on peace
grounds vs pro-countermeasure on economic-sovereignty grounds).

---

## Non-Parliamentary Actors

### 16. Civil Society — Digital Rights Coalition (EDRi, Access Now, noyb)

**Power**: Media amplification; Article 263 litigation capacity; expert witness
credibility with EP committees. **Interest**: Extreme on Digital Omnibus challenge.

**Current activity**: Public-comms escalation since April 10; legal-argumentation
coordination for Article 263 filing in May–June window.

**Impact on plenary**: Will shape media framing of April 28 Digital Omnibus questions
even absent a scheduled agenda item.

### 17. Civil Society — Housing Coalition (Housing Europe, EAPN, national tenant unions)

**Power**: Lower institutional access; strong public-opinion resonance. **Interest**:
Extreme on Commission housing response.

**Current activity**: Pre-positioned media campaigns ready to launch upon Commission
response publication.

### 18. Industry — EuroCommerce, BusinessEurope, ECBA

**Power**: High committee-level access; extensive technical-expertise credibility;
member-state-government coordination capacity. **Interest**: Variable — high on
trade, high on AI-Act enforcement, moderate on Banking Union.

**Expected posture**: Industry line will be pro-de-escalation on trade (preserve
transatlantic supply chains); pro-lightweight enforcement on AI Act; pro-delayed
transposition on BRRD3.

---

## Stakeholder Position Matrix on Key April 28 Decisions

| Stakeholder | US Countermeasure Activation | Housing Regulation | BRRD3 On-Time Transposition | Digital Omnibus Defence |
|------------|:---------------------------:|:-------------------:|:---------------------------:|:------------------------:|
| Commission | Conditional support | Consultation-preferred | Support | Support |
| EPP Group | Conditional-pro | Against-binding | Pro | Pro-with-modifications |
| S&D Group | Pro | Strong-pro | Pro | Split |
| Renew Group | Split | Moderate-pro | Pro | Pro |
| ECR Group | Anti | Against | Conditional | Critical |
| Greens/EFA | Pro | Strong-pro | Pro-with-conditions | **Strong anti** |
| The Left | Split | Strong-pro | Split | **Strong anti** |
| German govt | Conditional | Against-binding | **Anti (transposition delay)** | Pro |
| French govt | Pro | Moderate-pro | Pro | Pro |
| USTR | N/A (external) | N/A | N/A | Critical-of-enforcement |
| Civil society (digital) | Neutral | Neutral | Neutral | **Strong anti** |
| Civil society (housing) | Neutral | **Strong pro** | Neutral | Neutral |

---

## Coalition-Formation Implications

The stakeholder matrix reveals three natural coalition formations on April 28:

1. **Grand Coalition (EPP + S&D + Renew)** for BRRD3 transposition on-time vote — but
   German EPP delegation drag creates defection risk.
2. **Progressive Bloc (S&D + Greens/EFA + The Left + left-Renew)** on housing if
   Commission response inadequate — but falls short of majority (264/720).
3. **Conservative-Sovereignty Bloc (ECR + right-EPP + PfE + ESN)** on anti-
   countermeasure-activation if USTR files — blocks only if EPP splits.

The decisive coalition variable across all three formations is EPP internal cohesion.
Given the EPP data gap (MCP `memberCount=0`), this is the single highest-value
intelligence to collect post-recess through EPP Group website, EPP President Weber's
public statements, and German CDU MEP coordinator signals.

---

*Framework: Mendelow Power-Interest Grid + position-matrix extension*
*Analysis generated: April 18, 2026 | Run 184 | Breaking workflow | Analysis-only mode*
*Aggregate stakeholder-signal confidence: 🟡 Medium (constrained by EPP data gap)*
