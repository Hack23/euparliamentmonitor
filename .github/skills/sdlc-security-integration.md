# 🛠️🔒 SDLC Security Integration Skill

## Purpose

Integrate Hack23's three foundational SDLC governance policies into every phase of development for EU Parliament Monitor:

1. **[Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md)** — Organisation-wide CIA (Confidentiality, Integrity, Availability) mandate, risk management, ownership
2. **[Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)** — SSDLC gates, threat modelling, secure coding, testing, release
3. **[Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)** — OSS intake, license compatibility, contribution workflow, supply-chain security

This skill is **mandatory reading** for every agent that touches `src/`, `scripts/`, `.github/workflows/`, architecture documents, or dependencies.

---

## Rules

### MUST (Critical)

1. **Every change MUST pass through all applicable SSDLC gates** (see phase table below) before merge to `main`.
2. **Every new dependency MUST be evaluated** for license compatibility, security advisories, maintenance health, and supply-chain provenance before adoption.
3. **Every architecture change MUST update** `ARCHITECTURE.md`, `SECURITY_ARCHITECTURE.md`, and `THREAT_MODEL.md` when security-relevant.
4. **Every code change MUST preserve CIA properties** (confidentiality, integrity, availability) — regressions require explicit risk acceptance.
5. **Every release MUST emit** SBOM (SPDX JSON), SLSA L3 build provenance, and signed tag/release.
6. **No secret MAY be committed** — enforced by secret scanning + pre-commit review.
7. **No deprecated crypto (MD5, SHA-1, DES, 3DES, RC4) MAY appear** in code or dependencies.
8. **All AI-generated content and code MUST go through** the 2-pass iterative improvement process (`ai-first-quality` skill) and pass secure coding review.

### SHOULD (High Priority)

- Use threat modelling (STRIDE) for every new feature that processes external data
- Pin GitHub Actions to commit SHA (not tags) for supply-chain integrity
- Include security-relevant unit/E2E tests for every new input-handling path
- Keep OSS dependency count minimal — prefer platform/standard library primitives

---

## Information Security Policy — Core Mandates

The Information Security Policy sets the organisation-wide direction. Every agent and every change applies these:

### CIA Triad for EU Parliament Monitor

| Property | Target | How We Achieve It |
|----------|--------|-------------------|
| **Confidentiality** | All data is PUBLIC (open parliamentary data). Internal build secrets are CONFIDENTIAL. | GitHub environment secrets, no PII beyond public MEP roles, no telemetry of readers, CSP + HTTPS-only |
| **Integrity** | Medium-High — data accuracy is mission-critical for democratic transparency | Input validation on all MCP responses, SRI for CDN assets, signed commits, SLSA L3 provenance, reproducible builds |
| **Availability** | Medium — static site 24h RTO, daily news generation can tolerate a missed run | GitHub Pages + CloudFront, workflow retry + fallback, multi-region CDN, runbook for rollback |

### Roles & Accountability

| Role | Responsibility | Primary Agents |
|------|----------------|----------------|
| **Product owner** | Risk acceptance, roadmap alignment | product-task-agent |
| **Security champion** | Threat modelling, security review sign-off | documentation-architect (for SECURITY_ARCHITECTURE.md) |
| **Developer** | Secure coding, tests, SBOM hygiene | frontend-specialist, data-pipeline-specialist, devops-engineer |
| **Content owner** | Editorial accuracy, GDPR-safe journalism | news-journalist |
| **QA** | Test coverage, accessibility, regression gate | quality-engineer |

### Risk Management Cycle

1. **Identify** — SWOT.md, THREAT_MODEL.md, dependency advisories (Dependabot, GHSA)
2. **Assess** — Likelihood × impact scored in `risk-assessment-frameworks` skill methodology
3. **Treat** — Fix (preferred), mitigate (CSP, sandbox), transfer (vendor SLA), accept (document)
4. **Monitor** — CodeQL, secret scanning, Dependabot, CI workflow results, OpenSSF Scorecard
5. **Review** — Quarterly SECURITY_ARCHITECTURE.md review; annual policy review

---

## Secure Development Policy — SSDLC Phase Gates

Every change moves through these phases. Each phase has a **mandatory gate**; no gate may be skipped.

### Phase 1 — Requirements & Threat Modelling

**Activities:**
- Capture security requirements alongside functional ones (in issue/epic)
- STRIDE threat modelling for features processing external input
- Data classification for any new data type (PUBLIC / INTERNAL / CONFIDENTIAL / RESTRICTED)
- Identify affected ISO 27001 / NIST CSF controls

**Gate:** Issue has `security-reviewed` label or documented rationale that none needed
**Evidence:** Issue body section "Threat Model Summary" or link to `THREAT_MODEL.md` update

### Phase 2 — Design

**Activities:**
- Update `ARCHITECTURE.md`, `DATA_MODEL.md`, `SECURITY_ARCHITECTURE.md` as needed
- Choose the smallest trust boundary that satisfies the requirement
- Prefer language/platform primitives over custom crypto, custom parsers, custom auth
- Validate against Access Control Policy + Cryptography Policy

**Gate:** Design review comment from documentation-architect or security champion
**Evidence:** Updated architecture docs committed on the feature branch

### Phase 3 — Implementation

**Activities:**
- SPDX headers on every new file (`SPDX-FileCopyrightText: 2024-2026 Hack23 AB` + `SPDX-License-Identifier: Apache-2.0`)
- TypeScript strict mode, no `any` on untrusted boundaries, explicit return types
- Validate + sanitise every MCP / external response before use
- Use `crypto.randomUUID` / `crypto.randomBytes` — never `Math.random` for anything security-relevant
- Never interpolate untrusted input into RegExp, HTML, shell, or SQL without escaping
- Never hard-code tokens, URLs with credentials, or private keys

**Gate:** `npm run lint && npm run build && npm run test` all green
**Evidence:** CI run attached to PR, reviewer approval

### Phase 4 — Testing

**Activities:**
- Unit tests (Vitest) for every new public function with edge cases (null, empty, invalid, boundary)
- Integration tests for every MCP client path, including error and timeout paths
- E2E tests (Playwright) for every new user-visible flow including axe-core accessibility scan
- Security regression tests for previously-fixed vulnerabilities

**Gate:** Coverage does not decrease; `npm run test:coverage` and `npm run test:e2e` pass
**Evidence:** Coverage report, Playwright HTML report

### Phase 5 — Code Review

**Activities:**
- Human review by a second person (or agent proxy in agentic workflows) focusing on:
  - Secure coding correctness
  - Input trust boundaries
  - Secret / credential hygiene
  - Dependency introductions
  - Test adequacy
- `grumpy-reviewer` agent used for thorough negative critique on risky changes

**Gate:** At least one approving review + all required status checks
**Evidence:** PR review decision, resolved review threads

### Phase 6 — Release & Deployment

**Activities:**
- Generate SBOM (`anchore/sbom-action`, SPDX JSON)
- Generate SLSA L3 build provenance (`actions/attest-build-provenance`)
- Sign release tags
- Update `CHANGELOG` / GitHub Release notes
- Roll out via GitHub Pages / CloudFront

**Gate:** All release workflow jobs green; release artifacts include SBOM + attestation
**Evidence:** GitHub Release page, attestation verifiable with `gh attestation verify`

### Phase 7 — Operations & Monitoring

**Activities:**
- Monitor Dependabot, CodeQL, secret scanning alerts — SLA table below
- Track OpenSSF Scorecard (target ≥ 7/10)
- Review failed workflow runs weekly, incidents quarterly
- Rotate any exposed credential immediately

**Gate:** All alerts triaged within SLA, monthly security review performed
**Evidence:** Issue log referencing alert IDs, security architecture review notes

---

## Vulnerability SLA (Secure Development Policy)

| Severity | Detection → Fix Target | Typical Source |
|----------|------------------------|----------------|
| **Critical** | 7 days | CodeQL high, Dependabot critical, external disclosure |
| **High** | 14 days | CodeQL, Dependabot, npm audit |
| **Medium** | 30 days | Scorecard, warning-level scans |
| **Low** | Next minor release | Style/policy findings |

`Critical` issues MAY require emergency release outside the normal cycle — coordinated with product-task-agent and devops-engineer.

---

## Open Source Policy — Dependency Intake Workflow

Every new runtime or build dependency MUST go through this workflow before being added to `package.json`:

### Step 1 — License Compatibility Check

| License | Verdict | Notes |
|---------|---------|-------|
| Apache-2.0 | ✅ Adopt | Same as project |
| MIT, BSD-2/3, ISC, 0BSD, Unlicense, CC0-1.0 | ✅ Adopt | Permissive, compatible |
| MPL-2.0 | ⚠️ Review | File-level copyleft — acceptable only if we do not modify vendored sources |
| LGPL-2.1 / LGPL-3.0 | ⚠️ Review | Linking-only; usually OK for Node libraries but requires CLA/notice updates |
| GPL-2.0+, GPL-3.0+, AGPL-3.0 | ❌ Reject | Incompatible strong copyleft for a linked/embedded use |
| SSPL, BUSL, Commons Clause | ❌ Reject | Source-available, not OSI open source |
| Proprietary / Unknown / Missing | ❌ Reject until clarified | Legal risk |

### Step 2 — Security Advisory Check

- Run `gh-advisory-database` on the package (ecosystem `npm`, `actions`, or relevant)
- Check [GitHub Advisory Database](https://github.com/advisories)
- Check [OSV.dev](https://osv.dev)
- **Any unresolved High/Critical advisory against the exact version → reject or pin to patched version**

### Step 3 — Maintenance Health Check

Reject candidates that fail any of:

- No release in the last 24 months (for JS ecosystem) — indicates abandonment risk
- Single maintainer with no succession plan for critical-path dependency
- Unresolved CVEs older than 180 days
- Test suite absent or < 40% coverage (for libraries on the trust path)
- OpenSSF Scorecard < 4/10 (for critical-path dependencies)

### Step 4 — Supply-Chain Provenance

Prefer dependencies that:

- Publish SLSA provenance / attestations
- Use protected branches + required reviews
- Have signed commits or signed releases
- Are reproducible from source

### Step 5 — Version Pinning

- `package.json` uses conservative ranges (`^x.y.z`); `package-lock.json` committed for integrity
- GitHub Actions pinned to **commit SHA** with a comment stating the version tag
- Docker base images pinned to digest (e.g. `node:25-alpine@sha256:...`) in workflows

### Step 6 — Documentation

- Add dependency to SBOM output (automatic via build)
- If the dependency is security-sensitive (parser, auth, crypto, network), note it in `SECURITY_ARCHITECTURE.md`

---

## Open Source Contribution Workflow (Inbound & Outbound)

### Inbound Contributions (PRs from the community)

1. **CLA / DCO check** — Contributor must accept the project DCO or sign the CLA (per repository settings)
2. **Automated checks** — lint, build, test, CodeQL must pass
3. **Licence compatibility** — any new dependency introduced by the PR goes through the intake workflow above
4. **Security review** — any change touching `src/mcp/`, `src/types/`, `scripts/`, or `.github/workflows/` requires review by `security-architect` or `documentation-architect` agent proxy
5. **Contribution checker** — use the `contribution-checker` agent to validate against `CONTRIBUTING.md`

### Outbound Contributions (changes we publish)

1. All code released under **Apache-2.0** with NOTICE file maintained
2. Every file carries SPDX headers (REUSE 3.3 compliant)
3. Patches to upstream projects must be dual-reviewed before submission
4. Never include Hack23 confidential or third-party-confidential data in public PRs

---

## Compliance Evidence Mapping

For each change, the evidence artifacts that satisfy Secure Development Policy + Information Security Policy + Open Source Policy audit requirements:

| Evidence Artifact | Stored Where | Satisfies |
|-------------------|--------------|-----------|
| Architecture diff (`ARCHITECTURE.md`) | Feature branch commit | Secure Development §Design |
| Threat model note (`THREAT_MODEL.md` or PR body) | PR | Secure Development §Requirements |
| CodeQL scan result | GitHub Security tab | Secure Development §Testing, ISO A.8.25 |
| Dependabot result | GitHub Security tab | Open Source §Intake, ISO A.8.8 |
| Unit/E2E test results | CI run on PR | Secure Development §Testing |
| Coverage report | CI run on PR | Secure Development §Testing |
| SBOM (SPDX JSON) | GitHub Release artifacts | Open Source §Release, CRA |
| Build provenance (SLSA L3) | GitHub Release attestations | Open Source §Release, SLSA |
| Signed tag / release | GitHub Release | Information Security §Integrity |
| PR review decision | PR | Secure Development §Code Review |
| SPDX headers on source files | Source tree | Open Source §License |
| License audit (npm) | CI job output | Open Source §Intake |

---

## Agent Integration

This skill is referenced by:

| Agent | Primary Usage |
|-------|---------------|
| **product-task-agent** | Ensures new issues include security requirements, threat-modelling notes, and policy checkboxes |
| **devops-engineer** | Enforces CI gates (SBOM, provenance, pinning), vulnerability SLA tracking, workflow hardening |
| **data-pipeline-specialist** | Validates MCP input trust boundaries, licence-checks new HTTP/parsing dependencies |
| **frontend-specialist** | Applies CSP, SRI, output encoding, privacy-first analytics patterns |
| **quality-engineer** | Verifies coverage, regression tests, accessibility, policy-compliance tests |
| **documentation-architect** | Maintains ARCHITECTURE.md / SECURITY_ARCHITECTURE.md / THREAT_MODEL.md during design changes |
| **news-journalist** | Honours GDPR / privacy principles, avoids disclosing non-public personal data, attributes sources |
| **intelligence-operative** | Observes classification and OSINT ethics (public-data-only), respects MEP data-protection boundaries |
| **business-development-specialist** | Frames partnership + monetisation choices within Open Source Policy and mission constraints |
| **marketing-specialist** | Honours GDPR, accessibility, and privacy-by-design in outreach content |

---

## Quick Checklist for Every PR

Copy this into PR description:

```markdown
### SDLC Security Integration Checklist
- [ ] Applicable threat model considered (STRIDE); THREAT_MODEL.md updated if needed
- [ ] ARCHITECTURE.md / SECURITY_ARCHITECTURE.md updated if design changed
- [ ] No new secret / credential committed
- [ ] No deprecated crypto introduced (MD5, SHA-1, DES, 3DES, RC4)
- [ ] External inputs validated and sanitised
- [ ] New dependencies passed license + advisory + maintenance + provenance checks
- [ ] SPDX headers present on new files
- [ ] Tests added/updated; `npm run lint && npm run build && npm run test` pass locally
- [ ] Accessibility considered for UI changes (WCAG 2.1 AA)
- [ ] Commit signed (if applicable)
```

---

## Related Skills

- [isms-compliance](isms-compliance.md) — ISMS evidence & framework mapping
- [security-by-design](security-by-design.md) — Defense-in-depth + STRIDE patterns
- [open-source-governance](open-source-governance.md) — REUSE, SBOM, SLSA details
- [compliance-frameworks](compliance-frameworks.md) — ISO / NIST / CIS / GDPR / NIS2 / CRA
- [threat-modeling](threat-modeling.md) — STRIDE technique guide
- [data-protection](data-protection.md) — GDPR & classification handling
- [ai-governance](ai-governance.md) — EU AI Act + OWASP LLM security
- [ai-first-quality](ai-first-quality.md) — 2-pass content / code quality discipline

## Related Policies

- [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md)
- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
- [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)
- [Access Control Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Access_Control_Policy.md)
- [Cryptography Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Cryptography_Policy.md)
- [Classification Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Classification_Policy.md)
- [AI Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md)
- [Third Party Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Third_Party_Management.md)
- [Incident Response Plan](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Incident_Response_Plan.md)
