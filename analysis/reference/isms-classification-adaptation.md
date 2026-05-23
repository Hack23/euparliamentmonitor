<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🗂️ ISMS Classification → EU Political Intelligence Adaptation</h1>

<p align="center">
  <strong>📊 Mapping ISMS Classification Framework to EU Parliamentary Sensitivity Levels</strong><br>
  <em>🎯 Confidentiality · Integrity · Availability → Sensitivity · Accuracy · Urgency</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.0-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--03--30-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Classification-Public-green?style=for-the-badge" alt="Classification"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 1.0 | **📅 Last Updated:** 2026-03-30 (UTC)
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-06-30
**🏢 Owner:** Hack23 AB (Org.nr 5595347807) | **🏷️ Classification:** Public

---

## 🎯 Purpose

This reference document maps [Hack23 ISMS CLASSIFICATION.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) to EU Parliament Monitor's political intelligence classification. It provides the authoritative translation between ISMS security classification concepts and EU parliamentary political sensitivity levels.

---

## 🔒 Confidentiality Levels → Political Sensitivity Levels

| ISMS Confidentiality | ISMS Definition | Political Sensitivity | Political Definition |
|:--------------------:|-----------------|:---------------------:|---------------------|
| **Public** | Freely shared without risk | 🟢 **PUBLIC** | Routine EP activity; freely publishable |
| **Internal** | Limited external distribution | 🟡 **SENSITIVE** | Politically charged; requires careful framing |
| **Confidential** | Legal, competitive, or safety restrictions | 🔴 **RESTRICTED** | Legal sensitivity or acute political risk; editorial review mandatory |

### EU Parliament Adaptation

- **PUBLIC** is the default — unlike ISMS where most data is Internal. The EP operates under maximum transparency principles
- **RESTRICTED** indicates journalistic caution (verification and framing), not suppression
- EU-specific triggers for SENSITIVE: political group fractures, Article 7 proceedings, OLAF investigations, contested trilogue outcomes

---

## ✅ Integrity → Political Accuracy Requirements

| ISMS Integrity | Political Accuracy | Verification via EP MCP |
|:--------------:|:------------------:|------------------------|
| **High** | **Verified** — official EP document or voting record | `get_adopted_texts`, `get_voting_records`, `get_plenary_sessions` |
| **Medium** | **Corroborated** — single EP source + secondary confirmation | `search_documents` + `get_speeches` cross-reference |
| **Low** | **Unverified** — single source; flag with [LOW confidence] | Explicit confidence notation required |

---

## ⚡ Availability → Political Urgency Levels

| ISMS Availability | Political Urgency | Publication Deadline |
|:-----------------:|:-----------------:|---------------------|
| **Critical** (99.99%) | 🔴 **CRITICAL** | Immediate; all 14 languages within 2 hours |
| **High** (99.9%) | 🟠 **URGENT** | Publish within 4–8 hours |
| **Medium** (99%) | 🔵 **ELEVATED** | Include in next scheduled news cycle |
| **Low** (best-effort) | ⚪ **ROUTINE** | Standard workflow; 24–48 hours acceptable |

---

## 📊 ISMS Impact → EU Political Impact

| ISMS Impact Category | Political Impact Category | EU Political Consequence |
|:--------------------:|:-------------------------:|-------------------------|
| **Reputational** | **Democratic Credibility** | Damage to trust in EU democratic institutions |
| **Financial** | **Economic Impact** | Policy cost to EU citizens or GDP impact across member states |
| **Legal/Regulatory** | **Treaty/Institutional Impact** | Breach of EU treaty procedures or institutional norms |
| **Operational** | **Governance Impact** | Disruption to EP legislative function |
| **Safety** | **Social Cohesion** | Harm to European social fabric or minority rights |

---

## 🔗 Implementation Reference

- [methodologies/political-classification-guide.md](../methodologies/political-classification-guide.md) — Full classification guide
- [templates/political-classification.md](../templates/political-classification.md) — Classification template

---

**Document Control:**
- **Path:** `/analysis/reference/isms-classification-adaptation.md`
- **Source ISMS Doc:** [CLASSIFICATION.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md)
- **Classification:** Public
- **Next Review:** 2026-06-30
