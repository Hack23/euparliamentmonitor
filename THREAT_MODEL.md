# Threat Model - EU Parliament Monitor

**Document Classification:** Public  
**Version:** 1.0  
**Last Updated:** 2026-02-18  
**Next Review:** 2026-05-18 (Quarterly)  
**Owner:** Security Team / CEO  
**Status:** 🟢 Living Document

---

## Executive Summary

This threat model provides a comprehensive security analysis of the EU Parliament Monitor system following the [Hack23 ISMS Threat Modeling Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Threat_Modeling.md). The analysis applies the STRIDE framework, integrates MITRE ATT&CK tactics and techniques, and provides risk-based prioritization aligned with the system's classification ([CLASSIFICATION.md](CLASSIFICATION.md): Public/Medium/Medium).

### Key Findings

- **Total Threats Identified:** 6 (T-001 to T-006)
- **Risk Distribution:**
  - Critical: 0
  - High: 0
  - Medium: 1 (Data Integrity - P1 Priority)
  - Low: 5 (Managed with existing controls)
- **Primary Security Focus:** Data integrity and supply chain security
- **Defense Posture:** Multi-layer defense-in-depth with 25+ security controls

**System Classification Foundation (from [CLASSIFICATION.md](CLASSIFICATION.md)):**
- **Confidentiality:** Public (Level 1) - European Parliament open data
- **Integrity:** Medium (Level 2) - News accuracy critical for democratic transparency
- **Availability:** Medium (Level 2) - Daily updates expected, 24h outage acceptable
- **RTO/RPO:** 24 hours / 1 day

---

## Detailed Threat Analysis

### Threat T-001: Cross-Site Scripting (XSS) via Parliamentary Data Injection

| Attribute | Value |
|-----------|-------|
| **Threat ID** | T-001 |
| **STRIDE Category** | Injection, Tampering |
| **MITRE ATT&CK** | T1189 (Drive-by Compromise), T1059 (Command and Script Interpreter) |
| **Threat Agent** | Malicious Insider, Nation-State Actor, Cybercriminal |
| **Likelihood** | Low (1/5) |
| **Impact** | Medium (3/5) - Integrity risk, user trust damage |
| **Risk Score** | Low (3/25) |
| **Priority** | P3 |

**Existing Controls:**
- ✅ Content Security Policy (CSP) headers
- ✅ Handlebars auto-escaping
- ✅ Input validation for EP data
- ✅ ESLint security plugin
- ✅ Code review required

**Residual Risk:** Low - Multiple defense layers

**Risk Treatment:** Accept - Existing controls sufficient

---

### Threat T-002: Supply Chain Attack via npm Dependencies

| Attribute | Value |
|-----------|-------|
| **Threat ID** | T-002 |
| **STRIDE Category** | Elevation of Privilege, Tampering |
| **MITRE ATT&CK** | T1195.002 (Compromise Software Supply Chain), T1608.001 (Upload Malware) |
| **Threat Agent** | Cybercriminal, Nation-State Actor |
| **Likelihood** | Low (1/5) |
| **Impact** | High (4/5) - Could compromise build process |
| **Risk Score** | Low (4/25) |
| **Priority** | P2 |

**Existing Controls:**
- ✅ Minimal dependencies (zero production, 17 dev-only)
- ✅ Dependabot automated vulnerability scanning
- ✅ SBOM generation (CycloneDX format)
- ✅ SHA-pinned GitHub Actions
- ✅ package-lock.json with integrity hashes

**Residual Risk:** Low - Minimal attack surface

**Risk Treatment:** Monitor and Review - Annual dependency audit

---

### Threat T-003: Data Integrity - Incorrect News Generation ⚠️ P1

| Attribute | Value |
|-----------|-------|
| **Threat ID** | T-003 |
| **STRIDE Category** | Tampering, Information Disclosure |
| **MITRE ATT&CK** | T1565.001 (Stored Data Manipulation), T1499 (Endpoint Denial of Service) |
| **Threat Agent** | Accidental Insider, LLM Model Error, EP API Changes |
| **Likelihood** | Medium (3/5) |
| **Impact** | Medium (3/5) - News accuracy critical for democracy |
| **Risk Score** | Medium (9/25) |
| **Priority** | **P1** (Requires Additional Controls) |

**Existing Controls:**
- ✅ Schema validation for EP data
- ✅ Type checking (JavaScript with JSDoc)
- ✅ Error logging
- ✅ Unit tests (82% line coverage, 70% branch)
- ✅ Official European Parliament API source

**Residual Risk:** Medium - Automated content verification not yet implemented

**Risk Treatment:** Reduce Risk - Implement additional controls

**Recommendations (Q3 2026):**
1. 🔄 Automated fact-checking pipeline
2. 🔄 Confidence scoring (0.0-1.0) for each article
3. 🔄 Human-in-the-loop review queue (<0.85 confidence)
4. 🔄 Cross-reference generated content with source EP data

**Target Residual Risk:** Low (after Phase 1 implementation)

---

### Threat T-004: Denial of Service - GitHub Actions Downtime

| Attribute | Value |
|-----------|-------|
| **Threat ID** | T-004 |
| **STRIDE Category** | Denial of Service |
| **MITRE ATT&CK** | T1499 (Endpoint Denial of Service), T1498 (Network Denial of Service) |
| **Threat Agent** | External Service Provider, Cyber Vandal, Hacktivist |
| **Likelihood** | Low (1/5) |
| **Impact** | Low (2/5) - 24h RTO acceptable per classification |
| **Risk Score** | Low (2/25) |
| **Priority** | P3 |

**Existing Controls:**
- ✅ GitHub infrastructure (multi-region redundancy)
- ✅ Manual workflow trigger available
- ✅ Cached content remains online
- ✅ RTO/RPO alignment (24h/1d)
- ✅ Static site architecture (no real-time dependencies)

**Residual Risk:** Low - Within acceptable RTO/RPO

**Risk Treatment:** Accept - Availability Medium classification tolerates 24h outages

---

### Threat T-005: Repository Compromise - Unauthorized Code Changes

| Attribute | Value |
|-----------|-------|
| **Threat ID** | T-005 |
| **STRIDE Category** | Tampering, Elevation of Privilege |
| **MITRE ATT&CK** | T1078 (Valid Accounts), T1190 (Exploit Public-Facing Application) |
| **Threat Agent** | Malicious Insider, Cybercriminal |
| **Likelihood** | Low (1/5) |
| **Impact** | High (4/5) - Could compromise entire site |
| **Risk Score** | Low (4/25) |
| **Priority** | P2 |

**Existing Controls:**
- ✅ Branch protection (protected main branch)
- ✅ Required pull request reviews
- ✅ MFA requirement (GitHub organization)
- ✅ CODEOWNERS enforcement
- ✅ CodeQL automated SAST scanning
- ✅ GitHub audit logging
- ✅ Quarterly access review

**Residual Risk:** Low - Multiple access control layers

**Risk Treatment:** Monitor - Annual security review

---

### Threat T-006: MCP Server Compromise

| Attribute | Value |
|-----------|-------|
| **Threat ID** | T-006 |
| **STRIDE Category** | Spoofing, Tampering |
| **MITRE ATT&CK** | T1557 (Adversary-in-the-Middle), T1565 (Data Manipulation) |
| **Threat Agent** | Nation-State Actor, Advanced Persistent Threat |
| **Likelihood** | Very Low (0.5/5) |
| **Impact** | Medium (3/5) - Could manipulate EP data |
| **Risk Score** | Very Low (1.5/25) |
| **Priority** | P4 |

**Existing Controls:**
- ✅ Localhost-only binding (127.0.0.1)
- ✅ Process isolation with limited permissions
- ✅ Ephemeral execution (start/stop per run)
- ✅ No persistent state (stateless operation)
- ✅ GitHub Actions sandbox isolation

**Residual Risk:** Very Low - Local access required (GitHub Actions runner already secured)

**Risk Treatment:** Accept - Existing GitHub Actions isolation sufficient

---

## Risk Treatment Plan

### Priority-Based Treatment

| Threat ID | Threat Name | Risk Level | Priority | Treatment | Timeline | Owner |
|-----------|-------------|------------|----------|-----------|----------|-------|
| **T-003** | Data Integrity - Incorrect News | Medium | P1 | **Reduce** | Q3 2026 | Product Team |
| T-002 | Supply Chain Attack | Low | P2 | Monitor | Annual Review | Security Team |
| T-005 | Repository Compromise | Low | P2 | Monitor | Annual Review | Security Team |
| T-001 | XSS via Data Injection | Low | P3 | Accept | Quarterly Review | Security Team |
| T-004 | GitHub Actions Downtime | Low | P3 | Accept | Monitor | DevOps Team |
| T-006 | MCP Server Compromise | Very Low | P4 | Accept | Annual Review | Security Team |

### Risk Matrix

```
      │ V.Low (1) │  Low (2)   │  Med (3)  │  High (4) │ Crit (5)
──────┼───────────┼────────────┼───────────┼───────────┼──────────
Crit  │           │            │           │           │
(5)   │           │            │           │           │
──────┼───────────┼────────────┼───────────┼───────────┼──────────
High  │           │  T-002     │           │           │
(4)   │           │  T-005     │           │           │
──────┼───────────┼────────────┼───────────┼───────────┼──────────
Med   │  T-006    │  T-001     │  T-003 ★  │           │
(3)   │           │  T-004     │   (P1)    │           │
──────┼───────────┼────────────┼───────────┼───────────┼──────────
Low   │           │            │           │           │
(2)   │           │            │           │           │
──────┼───────────┼────────────┼───────────┼───────────┼──────────
V.Low │           │            │           │           │
(1)   │           │            │           │           │
──────┴───────────┴────────────┴───────────┴───────────┴──────────
      │ V.Low (1) │  Low (2)   │  Med (3)  │  High (4) │ Crit (5)
                              Impact
```

**Legend:** ★ = Requires action (P1), Others = Monitor/Accept

---

## Defense-in-Depth Architecture

### Security Layers

| Layer | Controls | Threats Mitigated | Status |
|-------|----------|-------------------|--------|
| **1. Perimeter** | GitHub infrastructure, TLS 1.3, DNS security | T-004 (DoS), T-006 (MITM) | ✅ Implemented |
| **2. Network** | HTTPS-only, CSP headers, CDN | T-001 (XSS), T-006 (MITM) | ✅ Implemented |
| **3. Application** | Input validation, output encoding, Handlebars escaping | T-001 (XSS), T-003 (Data Integrity) | ✅ Implemented |
| **4. Data** | Schema validation, type checking, error logging | T-003 (Data Integrity) | ✅ Implemented |
| **5. Monitoring** | CodeQL, Dependabot, audit logs, security scanning | T-002 (Supply Chain), T-005 (Compromise) | ✅ Implemented |

---

## Related Documentation

### Architecture Documentation

| Document | Link |
|----------|------|
| **CLASSIFICATION.md** | [CLASSIFICATION.md](CLASSIFICATION.md) |
| **SECURITY_ARCHITECTURE.md** | [SECURITY_ARCHITECTURE.md](SECURITY_ARCHITECTURE.md) |
| **ARCHITECTURE.md** | [ARCHITECTURE.md](ARCHITECTURE.md) |
| **DATA_MODEL.md** | [DATA_MODEL.md](DATA_MODEL.md) |
| **FLOWCHART.md** | [FLOWCHART.md](FLOWCHART.md) |
| **STATEDIAGRAM.md** | [STATEDIAGRAM.md](STATEDIAGRAM.md) |
| **MINDMAP.md** | [MINDMAP.md](MINDMAP.md) |
| **SWOT.md** | [SWOT.md](SWOT.md) |

### Future Architecture

| Document | Link |
|----------|------|
| **FUTURE_SECURITY_ARCHITECTURE.md** | [FUTURE_SECURITY_ARCHITECTURE.md](FUTURE_SECURITY_ARCHITECTURE.md) |
| **FUTURE_ARCHITECTURE.md** | [FUTURE_ARCHITECTURE.md](FUTURE_ARCHITECTURE.md) |
| **FUTURE_DATA_MODEL.md** | [FUTURE_DATA_MODEL.md](FUTURE_DATA_MODEL.md) |
| **FUTURE_FLOWCHART.md** | [FUTURE_FLOWCHART.md](FUTURE_FLOWCHART.md) |
| **FUTURE_STATEDIAGRAM.md** | [FUTURE_STATEDIAGRAM.md](FUTURE_STATEDIAGRAM.md) |
| **FUTURE_MINDMAP.md** | [FUTURE_MINDMAP.md](FUTURE_MINDMAP.md) |
| **FUTURE_SWOT.md** | [FUTURE_SWOT.md](FUTURE_SWOT.md) |

### ISMS Policies (Hack23)

| Policy | Link |
|--------|------|
| **Threat Modeling Policy** | [Hack23 ISMS - Threat Modeling](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Threat_Modeling.md) |
| **Classification Framework** | [Hack23 ISMS - Classification](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) |
| **Secure Development Policy** | [Hack23 ISMS - Secure Development](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) |

---

## Approval and Review

| Role | Name | Date | Signature |
|------|------|------|-----------|
| **Security Architect** | Security Team | 2026-02-18 | Approved |
| **Product Owner** | Product Team | 2026-02-18 | Approved |
| **CEO / CISO** | CEO | 2026-02-18 | Approved |

### Review Schedule

- **Current Review:** 2026-02-18
- **Next Quarterly Review:** 2026-05-18
- **Annual Comprehensive Review:** 2027-02-18

### Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-18 | Security Team | Initial threat model creation per Hack23 ISMS Threat Modeling Policy |

---

**Document Status:** ✅ Complete and Approved  
**ISMS Compliance:** 100% - Meets all Hack23 Threat Modeling Policy requirements  
**Next Action:** Implement P1 control (T-003: Automated content verification) by Q3 2026

---
