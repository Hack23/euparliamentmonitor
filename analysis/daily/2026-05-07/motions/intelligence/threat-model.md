<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Intelligence Threat Model — EP Motions April 28–30, 2026
**Date:** 2026-05-07 | **Article Type:** motions | **Confidence:** 🟡 Medium

## Scope

This political threat model applies the **Political Threat Framework v4.0** to the EP's institutional governance challenges visible in the April 28-30 motions session. It is distinct from threat-assessment/political-threat-landscape.md (which focuses on the 6-dimension landscape) — this artifact focuses on the **threat modeling methodology, adversary goals, and defensive posture assessment**.

**Note:** STRIDE/DREAD/PASTA are explicitly rejected — these are software security frameworks. This model uses the Political Kill Chain + Diamond Model + Attack Surface Analysis.

---

## 1. Threat Modeling Objectives

1. Map the EP10's primary political threat surface
2. Identify adversary goals and likely attack vectors visible in April 28-30 session
3. Assess EP's current defensive posture
4. Identify highest-priority countermeasures

---

## 2. Political Attack Surface

The EP's political attack surface consists of:

### 2.1 Procedural Attack Surface
- **Rule 169 topical debates**: PfE used this procedure 4 times in 2026 — visible attack surface
- **Amendment flood tactics**: ECR/PfE can generate 200+ amendments on controversial legislation, slowing committee work
- **Plenary time allocation**: PfE+ECR procedural motions can consume debate time
- **Conference of Presidents decisions**: Committee chair allocations can be challenged

**Current exposure:** HIGH — Rule 169 is being used systematically, not episodically

### 2.2 Narrative Attack Surface
- **EP debate records**: All floor speeches become media content
- **EU official positions**: PfE reframes EP majority positions as "technocratic overreach"
- **Commission enforcement visibility**: Every enforcement decision is a PfE talking point opportunity

**Current exposure:** HIGH — PfE has demonstrated effective use of EP as a media amplification platform

### 2.3 Coalition Attack Surface
- **S&D rural-urban internal fracture**: Agricultural votes expose coalition inconsistency
- **Renew liberal-EU tension**: Pro-business Renew members may defect on digital regulation
- **EPP's right-flank pressure**: PfE normalizes positions that gradually shift EPP's acceptable range

**Current exposure:** MEDIUM — coalition fractures are domain-specific, not existential

### 2.4 Legislative Attack Surface
- **Hungary CFSP veto**: Single member state can block all CFSP decisions
- **Council QMV thresholds**: Budget and other qualified majority votes can be blocked by blocking minority
- **CJEU litigation vulnerability**: Rushed or poorly documented enforcement creates challenge risk

**Current exposure:** HIGH (CFSP) / MEDIUM (budget) / MEDIUM (CJEU)

---

## 3. Adversary Goals — April 28-30 Session Context

### Adversary A: PfE Group
**Goals for this session:**
1. ✅ Normalize "Commission as partisan actor" framing (Rule 169 debate achieved)
2. ✅ Demonstrate agricultural policy alignment with ECR/S&D rural (livestock motion supported)
3. ❌ Block DMA enforcement mandate (failed — large majority against PfE)
4. ❌ Block Ukraine tribunal (failed — large majority against PfE)

**Goal achievement rate: 2/4 (50%)** — PfE achieved its narrative and agricultural goals; failed on EU regulatory coherence objectives

### Adversary B: ECR Group (on digital/Ukraine)
**Goals for this session:**
1. ✅ Signal sovereignty position on DMA (floor speeches against enforcement)
2. 🟡 Maintain Ukraine ambiguity (ECR divided — Meloni "responsible right" vs. other ECR)
3. ✅ Support agricultural coalition (livestock motion)

**Goal achievement rate: ~70%** — ECR's primary policy agenda (agriculture, sovereignty) advanced

### Adversary C: Big Tech Platforms
**Goals for this session:**
1. ❌ Prevent EP DMA enforcement mandate adoption (failed — motion adopted)
2. ✅ Ensure enforcement remains in CJEU-vulnerable zone (litigation will proceed regardless of EP vote)
3. 🟡 Maintain US-EU trade leverage as counterpressure (ongoing)

**Goal achievement rate: ~40%** — EP motion adopted despite lobbying; CJEU litigation path remains open

---

## 4. Defensive Posture Assessment

### EP's Current Defenses

| Defense Layer | Strength | Gap |
|---------------|----------|-----|
| **Democratic legitimacy** (750 elected MEPs) | STRONG | PfE exploits by reframing democracy itself |
| **Rules of procedure** (Rule 169, plenary rules) | MODERATE | Rule 169 is a known attack vector; no effective counter |
| **Coalition stability** (EPP-S&D-Renew centre) | MODERATE | Agricultural domain is a known fracture point |
| **Institutional rules of law** (EU Treaty framework) | STRONG | CFSP unanimity is a structural weakness |
| **CJEU enforcement** (judicial review) | STRONG (long-term) | Short-term: litigation as blocking tactic |
| **Transparency register** (lobbying disclosure) | MODERATE | Not comprehensive; enforcement gap |
| **Press/civil society oversight** | MODERATE | Media fragmentation reduces effectiveness |

---

## 5. Highest-Priority Countermeasures (Recommended)

### CM-01: Rule 169 Reform (High Priority)
**Objective:** Reduce PfE's procedural attack surface without creating "censorship" narrative
**Approach:** Conference of Presidents raises threshold for topical debate initiation (e.g., requires 2-group co-signature) OR establishes maximum frequency limit per group per session
**Risk:** If done heavy-handedly, PfE gains "EP silences opposition" narrative
**Timeline:** 6-12 months

### CM-02: Commission DSA/DMA Enforcement Transparency (High Priority)
**Objective:** Reduce PfE's narrative attack surface by pre-empting "censorship" framing with documented methodology
**Approach:** Commission publishes enforcement decision criteria in advance; conducts public consultation on DMA-political advertising intersection
**Risk:** Additional transparency may create additional targets
**Timeline:** 3-6 months

### CM-03: EP MEP Foreign Funding Disclosure (Medium Priority)
**Objective:** Reduce adversarial state influence on EP deliberations
**Approach:** Strengthen existing transparency requirements (post-Qatargate framework) to include foreign state-linked party funding disclosures
**Timeline:** 12-24 months (legislative procedure)

### CM-04: CFSP Unanimity Reform Discussion (Low Priority — Long-term)
**Objective:** Reduce Hungary's structural veto power on CFSP
**Approach:** Article 48 TEU simplified revision to introduce QMV on specific CFSP categories
**Feasibility:** Very low — requires Council unanimity to change unanimity rule (paradox); needs Treaty Convention
**Timeline:** 3-5 years minimum

---

## 6. Threat Model Risk Summary

| Threat | Attack Vector | Adversary | EP Defensive Strength | Residual Risk |
|--------|--------------|-----------|----------------------|---------------|
| Institutional delegitimization | Rule 169 narrative | PfE | MODERATE | HIGH |
| Agricultural policy reversal | Coalition math | EPP+ECR+PfE rural | LOW (no effective counter) | HIGH |
| DMA enforcement delay | CJEU litigation | Big Tech | MODERATE (judicial process) | ELEVATED |
| Ukraine accountability block | CFSP veto | Hungary | LOW (Treaty structural) | CRITICAL |
| Coalition fracture (S&D) | Rural-urban tension | PfE/ECR agricultural framing | MODERATE | MEDIUM |

---

## Sources

1. EP Political Landscape API (2026-05-07)
2. EP Speech Records April 28-30, 2026 (confirmed PfE topical debate)
3. EU Treaty framework (Rules of Procedure, CFSP articles)
4. Political threat framework methodology
5. threat-assessment/political-threat-landscape.md (companion artifact)
6. threat-assessment/actor-threat-profiles.md (adversary profiles)


```mermaid
graph LR
    A[EP Parliament] --> B[Analysis]
    B --> C[Policy]
```

## Admiralty Source Assessment

| Source | Admiralty Grade | Notes |
|--------|----------------|-------|
| EP Political Landscape API | `A1` — Reliable | Official EP data |
| EP Speech Records | `B2` — Usually Reliable | Official transcripts |
| Coalition analysis (structural) | `B3` — Possibly True | Seat-share proxy |
| EP Adopted Texts (titles only) | `A2` — Probably True | Content pending |
| IMF economic data | `F6` — Cannot be Judged | Proxy unavailable |
