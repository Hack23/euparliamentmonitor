# 🔍 Threat Modeling Skill

## Purpose

Apply systematic threat identification and mitigation for the EU Parliament Monitor platform using STRIDE methodology, aligned with Hack23 ISMS requirements.

## Rules

### MUST (Critical)
1. MUST maintain THREAT_MODEL.md with current threat analysis
2. MUST apply STRIDE methodology for threat identification
3. MUST document mitigations for each identified threat
4. MUST update threat model when architecture changes
5. MUST classify threats by risk level (Critical/High/Medium/Low)

### STRIDE Analysis for Static Site + MCP Integration

| Category | Threat | Mitigation |
|----------|--------|-----------|
| **Spoofing** | Fake MCP server responses | TLS verification, response validation |
| **Spoofing** | CDN content substitution | SRI (Subresource Integrity) hashes |
| **Tampering** | Modified static assets | CSP headers, build integrity checks |
| **Tampering** | MCP data manipulation | Input validation, data schema checks |
| **Repudiation** | Unauthorized content changes | Git signed commits, audit logs |
| **Information Disclosure** | Leaked API keys/secrets | Secret scanning, environment variables |
| **Information Disclosure** | Server info in headers | Security header hardening |
| **Denial of Service** | CDN cache poisoning | Cache validation, origin protection |
| **Denial of Service** | MCP server overload | Rate limiting, circuit breakers |
| **Elevation of Privilege** | GitHub Actions compromise | SHA-pinned actions, least privilege |
| **Elevation of Privilege** | Supply chain attack | Dependabot, SBOM, npm audit |

### Risk Assessment Matrix

```
Impact →       Low    Medium   High    Critical
Likelihood ↓
High          Medium  High     Critical Critical
Medium        Low     Medium   High     Critical  
Low           Low     Low      Medium   High
Very Low      Low     Low      Low      Medium
```

### Attack Surface Analysis

| Surface | Risk | Controls |
|---------|------|----------|
| Static HTML pages | Low | CSP, SRI, HTTPS-only |
| MCP data pipeline | Medium | Validation, sanitization, caching |
| GitHub Actions CI/CD | Medium | SHA-pinning, harden-runner, least privilege |
| npm dependencies | Medium | npm audit, Dependabot, SBOM |
| GitHub Pages hosting | Low | CDN protection, DDoS mitigation |

### Security Controls Mapping

| Control | ISO 27001 | NIST CSF | CIS Control |
|---------|-----------|----------|-------------|
| Input validation | A.8.28 | PR.DS-6 | CIS-16.12 |
| Dependency scanning | A.8.8 | DE.CM-8 | CIS-7 |
| Secret management | A.8.24 | PR.DS-2 | CIS-3 |
| Access control | A.8.2 | PR.AC-1 | CIS-6 |
| Logging/monitoring | A.8.16 | DE.AE-3 | CIS-8 |

## Related Policies
- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
- [Incident Response Plan](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Incident_Response_Plan.md)
