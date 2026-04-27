<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🛡️ EU Parliament Monitor — Security Policy</h1>

<p align="center">
  <strong>Vulnerability disclosure · Severity SLAs · Compliance posture · Accepted risks</strong><br>
  <em>🔐 Responsible disclosure · 🚨 48h ack · ⚖️ ISO 27001 / NIS2 / EU CRA aligned · 🤝 Coordinated public credit</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.1-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Classification-Public-success?style=for-the-badge" alt="Classification"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Review-Quarterly-orange?style=for-the-badge" alt="Review Cycle"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--04--27-2E7D32?style=for-the-badge" alt="Effective"/></a>
</p>

<p align="center">
  <a href="https://github.com/Hack23/euparliamentmonitor/security/advisories"><img src="https://img.shields.io/badge/🔒_Report-Security_Advisory-D32F2F?style=for-the-badge" alt="Report Security Advisory"/></a>
  <a href="mailto:security@hack23.com"><img src="https://img.shields.io/badge/✉️_Email-security@hack23.com-0A66C2?style=for-the-badge" alt="Email security@hack23.com"/></a>
  <a href="https://github.com/Hack23/ISMS-PUBLIC"><img src="https://img.shields.io/badge/🏛️_Hack23-ISMS--PUBLIC-7B1FA2?style=for-the-badge" alt="Hack23 ISMS"/></a>
</p>

<p align="center">
  <a href="https://scorecard.dev/viewer/?uri=github.com/Hack23/euparliamentmonitor"><img src="https://api.securityscorecards.dev/projects/github.com/Hack23/euparliamentmonitor/badge" alt="OpenSSF Scorecard"/></a>
  <a href="https://www.bestpractices.dev/projects/12068"><img src="https://www.bestpractices.dev/projects/12068/badge" alt="OpenSSF Best Practices"/></a>
  <a href="https://github.com/Hack23/euparliamentmonitor/attestations"><img src="https://slsa.dev/images/gh-badge-level3.svg" alt="SLSA 3"/></a>
  <a href="https://github.com/Hack23/euparliamentmonitor/actions/workflows/codeql.yml"><img src="https://github.com/Hack23/euparliamentmonitor/actions/workflows/codeql.yml/badge.svg" alt="CodeQL"/></a>
  <a href="https://github.com/Hack23/euparliamentmonitor/actions/workflows/scorecards.yml"><img src="https://github.com/Hack23/euparliamentmonitor/actions/workflows/scorecards.yml/badge.svg" alt="Scorecards"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 1.1 | **📅 Last Updated:** 2026-04-27 (UTC)
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-07-27 | **🏷️ Classification:** Public

---

## 🎯 Purpose & Scope

This Security Policy documents how to **report vulnerabilities** in the EU Parliament Monitor platform, the **severity-based remediation SLAs** we commit to, the **compliance frameworks** we align with, and the **accepted residual risks** we explicitly carry. It is the public face of the broader [SECURITY_ARCHITECTURE.md](SECURITY_ARCHITECTURE.md) and operates under the Hack23 ISMS [Vulnerability Management Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Vulnerability_Management.md).

> 🔗 **Sister policies:** [SECURITY_ARCHITECTURE.md](SECURITY_ARCHITECTURE.md) (C4 controls + threat model) · [THREAT_MODEL.md](THREAT_MODEL.md) (STRIDE for software-security context) · [CRA-ASSESSMENT.md](CRA-ASSESSMENT.md) (EU Cyber Resilience Act conformity) · [CLASSIFICATION.md](CLASSIFICATION.md) (CIA triad + BCP impact bands).

---

## 📦 Supported Versions

This project is under active development. Security updates are provided for the **latest** released version only. Always upgrade to the most recent release for security fixes.

| 🏷️ Version | 🛡️ Supported | 📅 EOL |
|---|---|---|
| `latest` (`main`) | ✅ Active | — |
| Older releases | ❌ End of life | Upgrade required |

---

## 🚨 Reporting a Vulnerability

We take the security of the EU Parliament Monitor project seriously. If you discover a potential vulnerability, **please report it privately** so we can assess and remediate before public disclosure.

### 🎯 What constitutes a vulnerability

| Category | Examples |
|---|---|
| 💉 **Injection** | XSS, HTML injection, Markdown-it sanitization bypass |
| 🔐 **Auth/Authz** | OIDC misconfiguration, GitHub Actions secret leakage |
| 📦 **Supply chain** | Insecure dependencies, compromised vendored bundle (Mermaid/Chart.js/D3) |
| 🔓 **Data exposure** | Sensitive data exposure, GDPR boundary violation |
| ⚙️ **Misconfiguration** | Insecure defaults, CSP bypass, S3/CloudFront exposure |
| ✋ **Validation** | Insufficient input validation in MCP payload handling |

### 🛠️ How to privately report (preferred — GitHub Security Advisory)

1. Visit [github.com/Hack23/euparliamentmonitor](https://github.com/Hack23/euparliamentmonitor)
2. Click the **Security** tab → **Advisories** → **[Report a vulnerability](https://github.com/Hack23/euparliamentmonitor/security/advisories/new)**
3. Fill in: description, reproduction steps, potential impact, suggested mitigation
4. Submit — maintainers are notified privately and you become a collaborator on the advisory

### ✉️ Alternative reporting

| Channel | Address | Use when |
|---|---|---|
| 🔒 **GitHub Advisory** | [Report here](https://github.com/Hack23/euparliamentmonitor/security/advisories/new) | **Default — preferred** |
| 📧 **Email** | [security@hack23.com](mailto:security@hack23.com) | GitHub unavailable; subject line `[SECURITY] EU Parliament Monitor — <brief description>` |

---

## ⏱️ Disclosure Timeline & Severity SLAs

Upon receipt of a vulnerability report:

| Phase | Target | Action |
|---|---|---|
| 🔵 **Acknowledge** | ≤ 48 hours | Confirm receipt and assign internal handler |
| 🟡 **Validate** | ≤ 7 days | Reproduce, classify CVSS severity, assign CVE if applicable |
| 🟢 **Remediate** | Per SLA below | Develop, test, and release patch or mitigation |
| 🟣 **Publish** | After patch | Coordinated public advisory with reporter credit |

### 🎚️ Severity-based remediation SLAs

Per the [Hack23 ISMS Vulnerability Management Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Vulnerability_Management.md):

| 🚦 Severity | CVSS v3.1 | ⏰ Remediation SLA | 📝 Description |
|---|---|---|---|
| 🔴 **Critical** | 9.0 – 10.0 | **7 days** | Immediate threat, active exploitation possible |
| 🟠 **High** | 7.0 – 8.9 | **30 days** | Significant security impact |
| 🟡 **Medium** | 4.0 – 6.9 | **90 days** | Moderate security impact |
| 🟢 **Low** | 0.1 – 3.9 | Best effort | Minimal security impact |

---

## 🧪 Security Testing

We employ multiple defence-in-depth layers, all wired into CI/CD:

| 🔬 Layer | Tool | Trigger |
|---|---|---|
| 🛠️ **SAST** | [CodeQL](https://github.com/Hack23/euparliamentmonitor/actions/workflows/codeql.yml) | Push, PR, weekly schedule |
| 📦 **SCA** | [Dependabot](https://github.com/Hack23/euparliamentmonitor/network/updates) + `npm audit` | Daily, PR validation |
| ✅ **Unit security tests** | Vitest (≥80% coverage) | Every commit |
| 🌐 **DAST** | Playwright + axe-core (accessibility-as-security) | PR + nightly |
| 🏆 **Supply chain** | [OpenSSF Scorecard](https://scorecard.dev/viewer/?uri=github.com/Hack23/euparliamentmonitor) + [SLSA L3 attestations](https://github.com/Hack23/euparliamentmonitor/attestations) | Weekly + on release |
| 📜 **License compliance** | [REUSE](https://github.com/Hack23/euparliamentmonitor/actions/workflows/reuse.yml) | Push, PR, weekly |

📊 See [SECURITY_ARCHITECTURE.md § Security Testing](SECURITY_ARCHITECTURE.md#-security-testing) for full coverage details.

---

## 🎯 Scope

### ✅ In scope

- 📰 News generation scripts (`scripts/`)
- 🟢 Analysis-artifact aggregator (`src/aggregator/**` — `artifact-order.ts`, `clean-artifact.ts`, `analysis-aggregator.ts`, `markdown-renderer.ts`, `article-html.ts`, `article-metadata.ts`, `article-generator.ts` CLI)
- 🧹 HTML sanitiser (`src/utils/html-sanitize.ts`) and the `markdown-it` render pipeline with explicit plugin allowlist (`markdown-it-anchor`, `markdown-it-footnote`, `markdown-it-attrs`, `markdown-it-deflist`)
- 🔌 MCP clients (`src/mcp/**` — European Parliament, IMF, World Bank) including the `getVotingRecordsWithFallback()` three-state fallback to the EP Open Data Portal
- 🧠 Committed analysis artifacts under `analysis/daily/**` (attack surface for aggregator rendering)
- 🎨 Vendored client-side diagram renderer (`js/vendor/mermaid/` etc.) under strict `script-src 'self'` CSP
- 📄 HTML templates and rendered output (`news/*.html`, language variants)
- 🤖 GitHub Actions and gh-aw agentic workflows (`.github/workflows/news-*.md` — 8 unified `news-<type>.md` + `news-translate.md`)
- ☁️ AWS S3 + CloudFront deployment pipeline (`deploy-s3.yml`, OIDC `GithubWorkFlowRole`)
- 📦 Dependencies and supply chain (OpenSSF Scorecard + SLSA L3 provenance + SBOM)

### ❌ Out of scope

- 🌐 Third-party services (GitHub, European Parliament APIs, IMF SDMX REST, World Bank Open Data)
- 🏗️ Infrastructure (AWS account-level, GitHub Pages hosting as fallback runbook)
- 🖥️ Client-side browser vulnerabilities not under platform control

---

## 🏆 Recognition & Anonymity

| Channel | What you get |
|---|---|
| 📋 **Release notes** | Reporter credit (with consent) |
| 📜 **Security advisory** | Public acknowledgment in the GHSA |
| 🌟 **Public GitHub recognition** | Credit on the advisory page (unless anonymity requested) |
| 🏅 **Security Hall of Fame** | Repeat or high-impact contributors considered |

We respect anonymity requests — opt out at any point in the disclosure flow.

---

## 📐 Compliance Frameworks

EU Parliament Monitor aligns with the following frameworks. Evidence is traceable through ISMS-PUBLIC, the SECURITY_ARCHITECTURE compliance matrix, and the CRA-ASSESSMENT conformity table.

| 🏛️ Framework | 📌 Scope | 📂 Evidence |
|---|---|---|
| **ISO 27001:2022** | Information security management | [SECURITY_ARCHITECTURE § Compliance Matrix](SECURITY_ARCHITECTURE.md#-compliance-matrix) |
| **NIST CSF 2.0** | Identify · Protect · Detect · Respond · Recover | [SECURITY_ARCHITECTURE § NIST CSF](SECURITY_ARCHITECTURE.md#-nist-csf-20-mapping) |
| **CIS Controls v8.1** | 18 critical security controls | CodeQL, Dependabot, npm audit, SBOM |
| **GDPR** | Data minimisation, purpose limitation | EP open data only, no profiling |
| **NIS2** | Article 20–21 cybersecurity risk management | [THREAT_MODEL.md](THREAT_MODEL.md) (STRIDE software context) |
| **EU Cyber Resilience Act** | SBOM, vulnerability disclosure, Annex I/V | [CRA-ASSESSMENT.md](CRA-ASSESSMENT.md), SLSA provenance |
| **OWASP Top 10** | Web-app security best practices | Same-origin CSP, sanitised rendering |

---

## 📊 Security Metrics (live posture)

| Metric | Target | Current |
|---|---|---|
| 🟢 Known vulnerabilities (`npm audit`) | 0 production | 0 (2 documented dev-only accepted risks — see below) |
| 🟢 Code coverage with security tests | ≥ 80 % line | 82 %+ |
| 🟢 Dependency-scanning coverage | 100 % | 100 % |
| 🟢 CodeQL critical/high findings | 0 | 0 |
| 🟢 OpenSSF Scorecard | ≥ 7.0 | [Live score](https://scorecard.dev/viewer/?uri=github.com/Hack23/euparliamentmonitor) |
| 🟢 SLSA build level | L3 | [Attestations](https://github.com/Hack23/euparliamentmonitor/attestations) |

📈 See [SECURITY_ARCHITECTURE.md § Security Metrics](SECURITY_ARCHITECTURE.md#-security-metrics) for trend data.

### 🟡 Accepted Risks (documented dev-only false positives)

The following advisories are detected by `npm audit` and explicitly allow-listed in `.github/workflows/test-and-report.yml` (Security Check job). Both are **dev-only** and do **not** reach end-user runtime:

| 🆔 GHSA | 📦 Package | 🚦 Severity | 📂 Path | 📝 Justification |
|---|---|---|---|---|
| [`GHSA-2g4f-4pwh-qvx6`](https://github.com/advisories/GHSA-2g4f-4pwh-qvx6) | `ajv` (via ESLint) | 🟡 Moderate (ReDoS) | devDep | ESLint does not invoke `ajv` with the `$data` option; only triggered on attacker-controlled JSON schemas, which we never feed it. Resolves with the ESLint 10 upgrade. |
| [`GHSA-w5hq-g745-h8pq`](https://github.com/advisories/GHSA-w5hq-g745-h8pq) | `uuid <14.0.0` (via `mermaid`) | 🟡 Moderate (buffer bounds) | devDep | `mermaid` is a build-time-only dependency. Library is vendored to `js/vendor/mermaid/` and renders diagrams from analyst-authored Markdown that has passed the Stage-C completeness gate; user input never reaches `uuid.v3/v5/v6` with an attacker-controlled `buf` argument. The site is fully static — no server-side `mermaid` execution. |

> ⚠️ **Drift guard:** if `npm audit` reports any GHSA outside this list, the **Security Check job MUST fail**. Allow-listing requires a pull request that updates this table **and** the workflow allow-list together.

---

## 📚 Security Resources

| Resource | Link |
|---|---|
| 🛡️ Threat model | [SECURITY_ARCHITECTURE § Threat Model](SECURITY_ARCHITECTURE.md#-threat-model) |
| 🔐 Security controls | [SECURITY_ARCHITECTURE § Security Controls](SECURITY_ARCHITECTURE.md#-security-controls) |
| 🚒 Incident response | [Hack23 ISMS Incident Response Plan](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Incident_Response_Plan.md) |
| 🐛 Vulnerability management | [Hack23 ISMS Vulnerability Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Vulnerability_Management.md) |
| 🏛️ Information security policy | [Hack23 ISMS Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md) |
| 🛠️ Secure development policy | [Hack23 ISMS Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) |
| 🔍 Threat modelling policy | [Hack23 ISMS Threat Modeling](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Threat_Modeling.md) |
| 📋 Classification framework | [Hack23 ISMS Classification](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) |
| ⚖️ EU CRA conformity assessment | [CRA-ASSESSMENT.md](CRA-ASSESSMENT.md) |

---

## 🌐 Hack23 Ecosystem

EU Parliament Monitor is part of the broader **[Hack23](https://hack23.com/)** civic-tech and security portfolio:

| 🏛️ Project | 🎯 Focus | 🔗 Link |
|---|---|---|
| 🌐 **Hack23 Homepage** | Organisation site, ISMS hub | [hack23.com](https://hack23.com/) · [`Hack23/homepage`](https://github.com/Hack23/homepage) |
| 📜 **ISMS-PUBLIC** | Public ISO 27001 / NIST CSF / CIS / GDPR / NIS2 / EU CRA policies | [`Hack23/ISMS-PUBLIC`](https://github.com/Hack23/ISMS-PUBLIC) |
| 🔌 **European Parliament MCP Server** | TypeScript MCP server with 60+ EP open-data tools | [`Hack23/European-Parliament-MCP-Server`](https://github.com/Hack23/European-Parliament-MCP-Server) |
| 🇸🇪 **Riksdag Monitor** | Swedish Parliament monitor (sister project) | [`Hack23/riksdagsmonitor`](https://github.com/Hack23/riksdagsmonitor) |
| 🕵️ **CIA** | Swedish Parliament intelligence platform (Java/Spring) | [`Hack23/cia`](https://github.com/Hack23/cia) |
| ✅ **CIA Compliance Manager** | CIA-triad compliance dashboard (TypeScript) | [`Hack23/cia-compliance-manager`](https://github.com/Hack23/cia-compliance-manager) |
| 🥋 **Black Trigram** | Korean martial-arts game with security focus | [`Hack23/blacktrigram`](https://github.com/Hack23/blacktrigram) |

---

## 📞 Contact

| Channel | Use for |
|---|---|
| 🔒 [GitHub Security Advisory](https://github.com/Hack23/euparliamentmonitor/security/advisories/new) | **Vulnerabilities (preferred)** |
| ✉️ [security@hack23.com](mailto:security@hack23.com) | Vulnerabilities (alternative) |
| 🐛 [GitHub Issues](https://github.com/Hack23/euparliamentmonitor/issues) | Non-security bugs and feature requests |
| 💬 [GitHub Discussions](https://github.com/Hack23/euparliamentmonitor/discussions) | Q&A, design discussions |
| 📧 [info@hack23.com](mailto:info@hack23.com) | General inquiries |
| 🤝 [conduct@hack23.com](mailto:conduct@hack23.com) | Code of Conduct concerns |

---

🙏 **Thank you for helping us keep EU Parliament Monitor and its users safe.** Your contributions to our security posture are deeply appreciated.

> _Maintained by **Hack23 AB — Intelligence Operations Team** under the [Hack23 ISMS](https://github.com/Hack23/ISMS-PUBLIC) framework._
