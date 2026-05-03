<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">📚 EU Parliament Monitor — ISMS Documentation Index</h1>

<p align="center">
  <strong>Single landing page for every repository document required by the Hack23 AB ISMS</strong><br>
  <em>One-line purpose · Local doc link · Matching ISMS-PUBLIC policy</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.0-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--05--03-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Review-Quarterly-orange?style=for-the-badge" alt="Review Cycle"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 1.0 | **📅 Last Updated:** 2026-05-03 (UTC)  
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-08-03 | **🏷️ Classification:** Public

---

## 🎯 Purpose

This index gives auditors, contributors, and Copilot agents a one-stop map of every ISMS-required document in this repository, the reason it exists, and the corresponding public ISMS policy in [`Hack23/ISMS-PUBLIC`](https://github.com/Hack23/ISMS-PUBLIC). It is generated and maintained alongside the documents listed below.

---

## 🏛️ Architecture & Design (Current State)

| Document | Purpose | Matching ISMS-PUBLIC Policy |
|---|---|---|
| [`ARCHITECTURE.md`](../ARCHITECTURE.md) | C4 model — context, container, deployment views of the static-site + agentic-workflow platform | [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md) |
| [`DATA_MODEL.md`](../DATA_MODEL.md) | TypeScript-first data shapes for analysis-artifact → article aggregator pipeline | [Data Classification Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Data_Classification_Policy.md) |
| [`FLOWCHART.md`](../FLOWCHART.md) | End-to-end Mermaid flow from EP MCP fetch through Stage A→E to S3/CloudFront | [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) |
| [`STATEDIAGRAM.md`](../STATEDIAGRAM.md) | Build, deploy, agentic-workflow state machines | [Change Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Change_Management.md) |
| [`MINDMAP.md`](../MINDMAP.md) | Topic mindmap of capability areas, tooling, ISMS controls | [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md) |
| [`SWOT.md`](../SWOT.md) | Strategic snapshot — strengths, weaknesses, opportunities, threats | [Risk Assessment Methodology](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Risk_Assessment_Methodology.md) |
| [`SECURITY_ARCHITECTURE.md`](../SECURITY_ARCHITECTURE.md) | Live security controls map (CSP, branch protection, OIDC, SBOM, agentic safeguards) | [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) |
| [`THREAT_MODEL.md`](../THREAT_MODEL.md) | STRIDE threat model + MITRE ATT&CK mapping for the agentic news pipeline | [Threat Modeling](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Threat_Modeling.md) |
| [`WORKFLOWS.md`](../WORKFLOWS.md) | Catalog of every CI/CD + agentic workflow with cadence, secrets, and runbooks | [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) |
| [`CLASSIFICATION.md`](../CLASSIFICATION.md) | CIA classification + business-impact framework for repo assets | [Data Classification Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Data_Classification_Policy.md) |

## 🔮 Architecture & Design (Forward-Looking Baseline)

| Document | Purpose | Matching ISMS-PUBLIC Policy |
|---|---|---|
| [`FUTURE_ARCHITECTURE.md`](../FUTURE_ARCHITECTURE.md) | Next-quarter architectural delta proposals | [Change Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Change_Management.md) |
| [`FUTURE_DATA_MODEL.md`](../FUTURE_DATA_MODEL.md) | Planned data-model evolutions | [Data Classification Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Data_Classification_Policy.md) |
| [`FUTURE_FLOWCHART.md`](../FUTURE_FLOWCHART.md) | Forward-state E2E flow with planned multi-region S3 + auto-translate | [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) |
| [`FUTURE_MINDMAP.md`](../FUTURE_MINDMAP.md) | Capability mindmap with planned feature additions | [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md) |
| [`FUTURE_SECURITY_ARCHITECTURE.md`](../FUTURE_SECURITY_ARCHITECTURE.md) | Roadmap for hardening (Sigstore signing, Stage-F, EP MCP v1.3) | [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) |
| [`FUTURE_STATEDIAGRAM.md`](../FUTURE_STATEDIAGRAM.md) | Future state machines (incl. Stage-F translation auto-trigger) | [Change Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Change_Management.md) |
| [`FUTURE_SWOT.md`](../FUTURE_SWOT.md) | Forward-looking strategic SWOT | [Risk Assessment Methodology](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Risk_Assessment_Methodology.md) |
| [`FUTURE_THREAT_MODEL.md`](../FUTURE_THREAT_MODEL.md) | Threat model deltas tied to roadmap items | [Threat Modeling](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Threat_Modeling.md) |
| [`FUTURE_WORKFLOWS.md`](../FUTURE_WORKFLOWS.md) | Planned workflow additions (Stage-F translate, multi-region replication) | [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) |

## 🛡️ Operational Plans

| Document | Purpose | Matching ISMS-PUBLIC Policy |
|---|---|---|
| [`BCPPlan.md`](../BCPPlan.md) | Business-continuity scenarios incl. gh-aw toolchain breakage (Scenario 11) | [Business Continuity Plan](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Business_Continuity_Plan.md) |
| [`FinancialSecurityPlan.md`](../FinancialSecurityPlan.md) | Cost analysis showing < $30/yr operating cost while preserving controls | [Asset Register](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Asset_Register.md) |
| [`End-of-Life-Strategy.md`](../End-of-Life-Strategy.md) | Lifecycle policy — published article retention, EoL of historical horizons | [Change Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Change_Management.md) |
| [`SECURITY.md`](../SECURITY.md) | Coordinated vulnerability disclosure entry point | [Vulnerability Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Vulnerability_Management.md) |
| [`runbooks/`](../runbooks/) | Operational runbooks (e.g. GitHub Pages → S3 failover) | [Disaster Recovery Plan](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Disaster_Recovery_Plan.md) |

## ✅ Compliance & Governance

| Document | Purpose | Matching ISMS-PUBLIC Policy |
|---|---|---|
| [`CRA-ASSESSMENT.md`](../CRA-ASSESSMENT.md) | EU Cyber Resilience Act conformity self-assessment | [CRA Conformity Assessment Process](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CRA_Conformity_Assessment_Process.md) |
| [`CONTRIBUTING.md`](../CONTRIBUTING.md) | Contribution standards, branch-protection expectations | [Acceptable Use Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Acceptable_Use_Policy.md) |
| [`CODE_OF_CONDUCT.md`](../CODE_OF_CONDUCT.md) | Community behavioral expectations | [Acceptable Use Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Acceptable_Use_Policy.md) |
| [`AUTHORS.md`](../AUTHORS.md) | Authoritative list of code authors | [Asset Register](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Asset_Register.md) |

## 🧪 Testing & Quality Evidence

| Document | Purpose | Matching ISMS-PUBLIC Policy |
|---|---|---|
| [`UnitTestPlan.md`](../UnitTestPlan.md) | Unit test strategy targeting ≥ 80 % line / 70 % branch coverage | [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) |
| [`E2ETestPlan.md`](../E2ETestPlan.md) | End-to-end (Playwright) test plan | [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) |
| [`E2E_TESTING_COMPLETE.md`](../E2E_TESTING_COMPLETE.md) | Most recent E2E run report | [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) |
| [`TEST_IMPLEMENTATION_COMPLETE.md`](../TEST_IMPLEMENTATION_COMPLETE.md) | Unit-test implementation status report | [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) |
| [`performance-testing.md`](../performance-testing.md) | Lighthouse / load-test methodology | [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) |

## 📰 Article-Pipeline Operational Docs

| Document | Purpose | Matching ISMS-PUBLIC Policy |
|---|---|---|
| [`Article-Generation.md`](../Article-Generation.md) | Author-facing primer on the 5-stage A→E article pipeline | [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) |
| [`LOOK_AHEAD_DATA_FLOW.md`](../LOOK_AHEAD_DATA_FLOW.md) | Unified Stage-A fan-out for prospective + electoral horizons | [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) |
| [`WEEK_AHEAD_DATA_FLOW.md`](../WEEK_AHEAD_DATA_FLOW.md) | Stage-A deep-dive for the `week-ahead` horizon | [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) |
| [`docs/isms-doc-delta-2026-05.md`](./isms-doc-delta-2026-05.md) | Per-document drift audit driving the May 2026 ISMS refresh | [Change Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Change_Management.md) |

---

## 🔁 Maintenance

This index is enforced by `scripts/lint-isms-docs.js` (run via `npm run lint:isms-docs`):

1. Every doc above must be present.
2. Every current-state ISMS doc must reference at least one ISMS-PUBLIC URL.
3. No doc may reference removed legacy workflow files (`news-article-generator.md`, `news-<type>-analysis.md`, `news-<type>-article.md`, `news-weekly/monthly-review-analysis.md`).
4. Every article slug from `src/config/article-horizons.ts` must appear in `WORKFLOWS.md` and `ARCHITECTURE.md`.
5. The version badge in `ARCHITECTURE.md`, `WORKFLOWS.md`, and `SECURITY_ARCHITECTURE.md` must equal `package.json` `version`.

---

### 🔗 Related ISMS-PUBLIC Policies

- [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md)
- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
- [Change Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Change_Management.md)

---

**📋 Document Control:**  
**✅ Approved by:** James Pether Sörling, CEO  
**📤 Distribution:** Public  
**🏷️ Classification:** [![Confidentiality: Public](https://img.shields.io/badge/C-Public-lightgrey?style=flat-square&logo=shield&logoColor=black)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md#confidentiality-levels) [![Integrity: Moderate](https://img.shields.io/badge/I-Moderate-yellow?style=flat-square&logo=check-circle&logoColor=black)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md#integrity-levels) [![Availability: Standard](https://img.shields.io/badge/A-Standard-lightgreen?style=flat-square&logo=server&logoColor=white)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md#availability-levels)  
**🎯 Framework Compliance:** [![ISO 27001](https://img.shields.io/badge/ISO_27001-2022_Aligned-blue?style=flat-square&logo=iso&logoColor=white)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) [![NIST CSF 2.0](https://img.shields.io/badge/NIST_CSF-2.0_Aligned-green?style=flat-square&logo=nist&logoColor=white)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) [![CIS Controls](https://img.shields.io/badge/CIS_Controls-v8.1_Aligned-orange?style=flat-square&logo=cisecurity&logoColor=white)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md)
