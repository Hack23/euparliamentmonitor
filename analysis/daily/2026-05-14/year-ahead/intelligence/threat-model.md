# Threat Model — EU Parliament Year Ahead 2026-2027
**Date:** 2026-05-14 | **Article Type:** year-ahead | **Methodology:** STRIDE + Cyber Kill Chain + MITRE ATT&CK for EU Institutions

---

## Threat Model Scope

This model covers threats to the European Parliament's legislative processes, information security, and institutional integrity during the May 2026 – May 2027 period. Threat actors are foreign states, domestic extremist networks, and opportunistic cybercriminals.

---

## Threat Actor Registry

### TA-1: Russia (SVR/GRU/FSB)
**Motivation:** Degrade EU unity on Ukraine; weaken sanctions; influence EP committee outputs
**Capability:** 🔴 ADVANCED — nation-state resources, established EU parliament penetration
**Intent:** 🔴 HIGH — ongoing documented activity against EP
**MITRE Groups:** APT28 (Fancy Bear), APT29 (Cozy Bear)

**Attack vectors:**
- Spear-phishing against MEP staff involved in AFET, BUDG Ukraine dossiers
- Social engineering through think-tank intermediaries
- Disinformation campaigns targeting EP votes on Ukraine instruments
- DDoS against EP systems during critical vote windows

### TA-2: China (MSS)
**Motivation:** Influence EU regulatory posture on AI, technology, trade
**Capability:** 🔴 ADVANCED — sustained long-term penetration operations
**Intent:** 🟡 MEDIUM — selective targeting of high-value dossiers
**MITRE Groups:** APT10, APT41

**Attack vectors:**
- Targeting MEPs and staff on ITRE (technology), INTA (trade), AFET (Taiwan) committees
- Influence operations through academic and cultural front organisations
- Supply chain attacks against EP IT vendor ecosystem

### TA-3: Domestic Far-Right Networks
**Motivation:** Amplify legislative disruption; undermine EU institutional legitimacy
**Capability:** 🟡 MEDIUM — distributed networks; limited technical capability
**Intent:** 🔴 HIGH — ideological alignment with disruption

**Attack vectors:**
- Insider access through sympathetic EP staff or MEP offices
- Information leaks from committee deliberations
- Physical disruption of EP chamber activities

### TA-4: Opportunistic Cybercriminals
**Motivation:** Ransomware; data theft for sale
**Capability:** 🟡 MEDIUM — commodity tools; high volume
**Intent:** 🟡 MEDIUM — targets of opportunity

**Attack vectors:**
- Ransomware against EP administrative systems
- Phishing credential harvest
- Third-party vendor compromise

---

## STRIDE Threat Analysis

| Threat | Asset | Vector | Actor | Likelihood | Impact |
|--------|-------|--------|-------|-----------|--------|
| **Spoofing** | MEP identity in communication | Spear-phish → credential theft | TA-1, TA-2 | 🟡 MEDIUM | 🔴 HIGH |
| **Tampering** | Committee document integrity | Internal access or API exploit | TA-1, TA-3 | 🟢 LOW | 🔴 HIGH |
| **Repudiation** | Vote record authenticity | System compromise during vote | TA-1 | 🟢 LOW | 🔴 HIGH |
| **Information Disclosure** | Committee deliberations | Staff phishing; insider | TA-1, TA-2, TA-3 | 🟡 MEDIUM | 🟡 MEDIUM |
| **Denial of Service** | EP communication/plenary systems | DDoS; ransomware | TA-1, TA-4 | 🟡 MEDIUM | 🟡 MEDIUM |
| **Elevation of Privilege** | EP IT administrative access | Supply chain; lateral movement | TA-1, TA-2 | 🟢 LOW | 🔴 HIGH |

---

## Kill Chain Mapping for Highest-Priority Threat Scenario

**Scenario: Russia SVR spear-phish targeting Ukraine vote (highest probability high-impact scenario)**

```
RECONNAISSANCE → EP AFET committee member list (public); LinkedIn profiles of legislative staff
WEAPONISATION → Custom spear-phish document exploiting Office zero-day or credential harvest
DELIVERY → Email to MEP legislative assistant appearing from known think-tank contact
EXPLOITATION → User opens document; malware executes; or clicks phishing link → credential harvested
INSTALLATION → Implant installed on staff device; credentials used for EP Intranet access
C2 → Exfiltration of advance vote tallies, rapporteur negotiating positions, private committee deliberations
ACTIONS → Intelligence shared internally; selective leak to strategic media; influence operations timed to vote
```

**Disruption potential:** Even without successful compromise, the threat of intelligence collection changes MEP behaviour — potentially chilling open deliberation.

---

## Institutional Countermeasures Assessment

| Countermeasure | Status | Adequacy |
|---------------|--------|---------|
| EP Cybersecurity Office (CERT-EP) | Active | 🟡 MEDIUM — adequate for commodity threats |
| Multi-factor authentication | Deployed | 🟢 ADEQUATE — significantly raises attack cost |
| Classified document handling | CONFIDENTIAL-EU procedures in place | 🟡 MEDIUM — human factor remains |
| MEP staff security training | Annual | 🟡 MEDIUM — awareness varies significantly |
| Supply chain assessment | Partial | 🟢 IMPROVING — NIS2 implementation ongoing |
| Incident response plan | Documented | 🟡 MEDIUM — tested but limited visibility |

---

## Threat Model Summary

**Overall threat level for EP legislative processes 2026-2027:**

🟡 ELEVATED — above baseline due to Ukraine war context, AI/tech regulatory tensions with China, and ongoing domestic polarisation. Specific critical periods (key Ukraine votes, Budget 2027 negotiations) represent 🔴 HIGH threat windows requiring heightened security posture.

**Primary residual risk:** Nation-state intelligence collection operations against EP deliberative processes. These are difficult to fully prevent and create a persistent background risk to the integrity of EP decision-making.

*Confidence: 🟡 Medium. Threat intelligence derived from open-source reporting and methodological modelling; classified intelligence assessments would modify this picture.*

## Admiralty Credibility Rating

**Source reliability: C (Fairly reliable)** — Threat assessments drawn from OSINT and public reporting; no classified sources

**Information reliability: 3 (Possibly true)** — Attribution and capability assessments based on open-source evidence

**Overall: C3** for specific threat actor assessments; **B2** for institutional countermeasure status

## World Economic Perspective (WEP)

**Economic dimension of threat:** Russia's capacity to conduct cyber operations is partially constrained by economic sanctions (import restrictions on semiconductors affect cyber tool production) but Russian state threat actors have demonstrated adaptability. China's economic growth trajectory (2.5-3% global GDP share increase 2020-2025) funds continued intelligence operations. Both actors' cyber capabilities are funded by domestic budgets insulated from EU-imposed restrictions.

**Economic interdependence constraint:** EU-China trade relationship (~EUR 800bn bilateral 2025) provides structural incentive for both sides to avoid escalatory cyber incidents that could trigger economic retaliation — a partial deterrent.
