# 🔒 Security by Design Skill

## Purpose

Ensure security is integrated from the design phase through implementation, testing, and deployment. Apply defense-in-depth principles appropriate for a static site with MCP data integration.

## Rules

### MUST (Critical)
1. MUST implement Content Security Policy (CSP) headers
2. MUST use HTTPS-only with TLS 1.3
3. MUST sanitize all external data before rendering
4. MUST validate all inputs from MCP server responses
5. MUST never hard-code secrets, credentials, or API keys
6. MUST never use deprecated crypto (MD5, SHA-1, DES, 3DES)
7. MUST use Subresource Integrity (SRI) for CDN assets
8. MUST enable secret scanning and CodeQL analysis

### Security Headers Configuration

```html
<!-- Required security headers (via meta tags or server config) -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta name="referrer" content="strict-origin-when-cross-origin">
```

### Input Validation for MCP Data

```javascript
// ✅ GOOD: Validate MCP server responses before use
function validateMEPData(data) {
  if (!data || typeof data !== 'object') return null;
  if (typeof data.name !== 'string' || data.name.length > 200) return null;
  if (typeof data.country !== 'string' || !/^[A-Z]{2}$/.test(data.country)) return null;
  // Sanitize HTML content
  data.name = escapeHtml(data.name);
  return data;
}

// ✅ GOOD: Escape HTML to prevent XSS
function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}
```

### Dependency Security

```bash
# Run before every release
npm audit --audit-level=high
# Must pass with zero high/critical vulnerabilities
```

### CI/CD Security Controls

- Pin GitHub Actions to SHA (not tags)
- Use `step-security/harden-runner` in workflows
- Implement least privilege permissions
- Generate SBOM for releases
- SLSA Level 3 attestations

### STRIDE Threat Model

| Threat | Mitigation |
|--------|-----------|
| **Spoofing** | HTTPS-only, SRI for CDN assets |
| **Tampering** | CSP headers, build integrity checks |
| **Repudiation** | Audit logging, signed commits |
| **Information Disclosure** | Data classification, no PII in static pages |
| **Denial of Service** | CDN caching, static site resilience |
| **Elevation of Privilege** | No server-side code, minimal JavaScript |

## Related Policies
- [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md)
- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
- [Cryptography Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Cryptography_Policy.md)
- [Access Control Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Access_Control_Policy.md)

## SSDLC Phase Activities (Secure Development Policy)

Apply these security activities in every feature lifecycle. See [sdlc-security-integration](sdlc-security-integration.md) for the full gate + evidence matrix.

| Phase | Security Activity | Gate |
|-------|-------------------|------|
| Requirements | Capture security + privacy requirements, data classification | Issue has threat-model notes |
| Design | STRIDE threat model, update SECURITY_ARCHITECTURE.md, choose smallest trust boundary | Design review comment from security champion |
| Implementation | SPDX headers, TS strict, input validation, secure-by-default, no hard-coded secrets | `npm run lint && build && test` green |
| Testing | Unit + integration + E2E + security regression tests | Coverage not decreased, Playwright + axe green |
| Review | Peer review, grumpy-reviewer for risky diffs | ≥ 1 approval, all status checks green |
| Release | SBOM, SLSA L3 provenance, signed tag | Release artifacts present, `gh attestation verify` passes |
| Operations | Monitor Dependabot, CodeQL, secret scanning alerts within SLA | Alerts triaged within SLA |

## Secure Coding Quick Reference

| Risk | Primary Control | Code Pattern |
|------|-----------------|--------------|
| XSS | HTML output encoding | `escapeHtml` helper in templates |
| Injection | Parameterised APIs | Never concatenate untrusted → RegExp, shell, SQL, HTML |
| SSRF | Allowlist outbound URLs | Validate against known MCP hosts; use AWF firewall for workflows |
| Prototype pollution | Safe parsing | Never merge untrusted JSON into shared objects |
| Unsafe deserialisation | Schema validation | Validate MCP responses with shape guards before use |
| Weak randomness | Platform crypto | `crypto.randomUUID` / `crypto.randomBytes` |
| Secret leakage | Env + secret scanning | GitHub env secrets; never in code, logs, artifacts |
| Broken auth | Least privilege | GitHub tokens scoped; workflows pinned by SHA |
| Misconfig | CSP + security headers | See headers block above |
| Vulnerable deps | Dependabot + npm audit | Per vulnerability SLA |

## Vulnerability SLA

| Severity | Fix By | Trigger |
|----------|--------|---------|
| Critical | 7 days | CodeQL critical, Dependabot critical, external disclosure |
| High | 14 days | CodeQL high, Dependabot high |
| Medium | 30 days | Scorecard warnings, npm audit medium |
| Low | Next minor release | Style/policy findings |

