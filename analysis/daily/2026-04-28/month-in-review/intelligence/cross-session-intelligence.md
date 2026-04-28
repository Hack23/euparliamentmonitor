<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Cross-Session Intelligence — EU Parliament Monitor: April 2026

**Run Date:** 2026-04-28 | **Type:** month-in-review  
**Scope:** Intelligence continuity across multiple analysis runs  
**Prior Run Reference:** 2026-04-27/month-in-review

---

## 1. Intelligence Continuity Assessment

### 1.1 Confirmed Intelligence from Prior Runs

The following assessments from prior runs have been validated against new evidence:

**Validated 2026-04-27 → 2026-04-28:**

1. **Legislative productivity high** (prior confidence: 🟢 HIGH → validated 🟢 HIGH)
   - Prior estimate: EP10 on track for 200–250 adopted texts/year
   - New data: 104 texts by April (TA-0001 to TA-0104); annualised ~312/year — EXCEEDS prior estimate
   - Confidence increase: legislative output momentum stronger than projected

2. **EPP+S&D+Renew coalition stable** (prior: 🟡 MEDIUM → validated 🟢 HIGH)
   - Prior concern: migration texts could strain S&D
   - New evidence: Coalition held on all economic/institutional/AI texts; migration defection contained to specific texts only
   - Update: Coalition stability is stronger than mechanical plurality — shared governance identity

3. **Banking union completion imminent** (prior: 🟢 HIGH → CONFIRMED)
   - Prior prediction: BRRD3/SRMR3/DGSD2 expected Q1 2026
   - New evidence: TA-0090/0091/0092 all adopted March 26, 2026
   - Status: PREDICTION CONFIRMED — closed

4. **Defence integration accelerating** (prior: 🟢 HIGH → CONFIRMED)
   - Prior prediction: Defence flagship projects legislation expected Q1–Q2 2026
   - New evidence: TA-0080 adopted March 11, 2026
   - Status: PREDICTION CONFIRMED — closed

5. **WTO MC14 position adoption** (prior: 🟡 MEDIUM → CONFIRMED)
   - Prior prediction: Q2 2026 trade position validation
   - New evidence: TA-0086 adopted March 12, 2026 (ahead of prior estimate)
   - Status: PREDICTION CONFIRMED — closed

---

### 1.2 Updated Intelligence

**Still Pending from Prior Runs:**

1. **Affordable Housing Initiative** (prior confidence: 🟡 MEDIUM)
   - Prior: Commission expected May/June 2026
   - Current: Still pending; no new evidence contradicts timeline
   - Updated: Commission expected May 2026 (STILL PENDING → deadline approaching)

2. **AI Act implementing acts** (prior confidence: 🟡 MEDIUM)
   - Prior: Expected Q2 2026
   - Current: Digital Omnibus (TA-0098) creates parallel simplification track
   - Updated: 🟡 MEDIUM confidence, possible Q3 2026 delay due to Digital Omnibus coordination

3. **Defence White Paper follow-up** (prior confidence: 🟡 MEDIUM)
   - Prior: Expected H2 2026
   - Current: No change; flagship projects (TA-0080) creates immediate implementation framework
   - Updated: Confidence maintained at 🟡 MEDIUM; first legislative proposals likely September 2026

---

## 2. Cross-Session Pattern Recognition

### 2.1 Emerging Patterns (3+ sessions)

**Pattern: EP right-wing issue coalition**
- Observed: Multiple sessions — EPP using ECR+PfE on migration texts over S&D reluctance
- Sessions confirmed: Multiple migration texts in EP10 (2024–2026)
- March 2026: Safe countries (TA-0025), safe third country (TA-0026)
- Assessment: STRUCTURAL PATTERN — not a one-time defection. EPP has internalized that ECR/PfE are available as a fallback on migration.

**Pattern: Broad defence consensus**
- Observed: Every major defence vote shows EPP+S&D+Renew+ECR supermajority
- Sessions confirmed: Multiple CSDP, defence industry, Ukraine texts
- March 2026: TA-0080 (flagship), TA-0040 (strategic), TA-0078 (EU-Canada), TA-0056 (Ukraine war)
- Assessment: STRUCTURAL — geopolitical driver (Russia-Ukraine) maintains this supermajority through EP10 term

**Pattern: High EP10 legislative productivity**
- Observed: Each monthly session produces 15–30 adopted texts
- March 2026: approximately 25–30 texts in one session
- Year-to-date 2026: 104 texts through April
- Assessment: STRUCTURAL — EP10 has exceptional productive capacity; may reflect political consensus or institutional improvement

### 2.2 Single-Session Observations (unconfirmed patterns)

- AI governance triple (three texts in one session) — whether this continues as a pattern awaits follow-up sessions
- EP-Commission Framework Agreement — one-time institutional reset, not a pattern

---

## 3. Intelligence Gaps (Persistent)

### Gap 1: Individual MEP Voting Behavior

**Persistence:** Every run since EP10 began  
**Root cause:** EP Open Data Portal does not yet expose per-MEP roll-call data in a machine-readable format that the MCP server can query efficiently  
**Impact:** Cannot identify specific MEP defections, loyalty scores, or individual influence patterns  
**Mitigation:** Qualitative political analysis based on group positions; adopted text outcomes

### Gap 2: Real-Time Plenary Feed

**Persistence:** Multiple runs  
**Root cause:** EP plenary sessions enrichment failing (filteredTotal=0)  
**Impact:** Cannot track live debate content or vote timings during sessions  
**Mitigation:** `get_speeches` provides partial data; `get_adopted_texts_feed` provides completion signal

### Gap 3: Procedures Feed Reliability

**Persistence:** Multiple consecutive runs  
**Root cause:** EP API `/procedures/feed` endpoint returning 404; fallback to historical (pre-1990) data  
**Impact:** Cannot track active legislative procedure stages  
**Mitigation:** Adopted texts provide completion signal; procedure status inferred from text adoption

### Gap 4: IMF Economic Data

**Persistence:** Multiple runs (AWF firewall constraint)  
**Root cause:** `dataservices.imf.org` not accessible through Squid proxy  
**Impact:** Cannot complement World Bank data with IMF World Economic Outlook forecasts  
**Mitigation:** World Bank GDP/unemployment data provides adequate economic context

---

## 4. Longitudinal Context: EP10 So Far (2024–2026)

| Period | Key Legislative Themes | Coalition Stability |
|--------|----------------------|---------------------|
| July–December 2024 | New Parliament organisation, initial legislation | Forming — 🟡 MEDIUM |
| Q1 2025 | Economic Recovery, Digital Decade | Stabilising — 🟢 HIGH |
| Q2–Q3 2025 | AI Act implementation, climate | Stable — 🟢 HIGH |
| Q4 2025–Q1 2026 | Defence integration, banking union completion | Stable with right-wing supplementation — 🟢 HIGH |
| Q2 2026 (current) | AI Act second wave, housing, follow-on defence | Watch for friction — 🟡 MEDIUM |

**Trajectory:** EP10 has been more productive than EP9 in legislative output and more decisive in coalition management. The structural uncertainty is whether the EPP's increasing reliance on ECR/PfE for specific issues (migration, deregulation) will destabilize its relationship with S&D over time.

---

## 5. Intelligence Assessment Updates

**INCREASED CONFIDENCE:**
- Banking union legislative completion: NOW CONFIRMED
- Defence integration momentum: EXCEEDS prior estimates
- EP10 coalition resilience: Higher than modelled

**DECREASED CONFIDENCE:**
- AI Act implementing acts timeline: Delayed by Digital Omnibus parallel track
- IMF data availability: Consistently unavailable (firewall)

**NEW INTELLIGENCE (not in prior model):**
- EU-Canada defence cooperation (TA-0078): New bilateral defence dimension not prominently flagged in prior run
- EP-Commission Framework Agreement (TA-0069): Institutional reset has longer-term implications for EP-Commission power balance
- European Research Area Act (TA-0068): Innovation governance dimension under-analysed in prior runs

---

## 6. Session Baseline Comparison

**2026-04-27 Session:**
- Total adopted texts: ~100 (estimate)
- Coalition stability: 84/100
- Primary themes: Defence, Banking, AI

**2026-04-28 Session:**  
- Total adopted texts: 104 confirmed
- Coalition stability: 84/100 (same reading)
- Additional intelligence: Cross-session patterns confirmed; 3 pending predictions on track

**Delta:** No material change in coalition stability. Legislative output slightly exceeds prior projection.

---

*Cross-session intelligence compiled from: prior run analysis (2026-04-27), current run Stage A data, EP Open Data Portal adopted texts, pattern recognition across EP10 sessions*
