# 📜 Open Source Governance Skill

## Purpose

Ensure all open source activities comply with Hack23's Open Source Policy, Apache-2.0 licensing requirements, REUSE compliance, and community engagement standards.

## Rules

### MUST (Critical)
1. MUST use Apache-2.0 license for all Hack23 projects
2. MUST maintain REUSE 3.3 compliance (SPDX headers on all files)
3. MUST verify license compatibility before adding dependencies
4. MUST generate SBOM (Software Bill of Materials) for releases
5. MUST follow SLSA Level 3 supply chain security
6. MUST never commit secrets or credentials

### REUSE Compliance

```toml
# REUSE.toml - Bulk annotations
version = 1

[[annotations]]
path = ["**/*.js", "**/*.html", "**/*.css"]
SPDX-FileCopyrightText = "2024-2026 Hack23 AB"
SPDX-License-Identifier = "Apache-2.0"

[[annotations]]
path = ["**/*.json", "**/*.yml", "**/*.yaml", "**/*.md"]
SPDX-FileCopyrightText = "2024-2026 Hack23 AB"
SPDX-License-Identifier = "Apache-2.0"
```

### Dependency License Compatibility

| License | Compatible | Notes |
|---------|-----------|-------|
| Apache-2.0 | ✅ Yes | Same license |
| MIT | ✅ Yes | Permissive |
| BSD-2/3 | ✅ Yes | Permissive |
| ISC | ✅ Yes | Permissive |
| MPL-2.0 | ⚠️ Careful | File-level copyleft |
| GPL-2.0+ | ❌ No | Incompatible copyleft |
| AGPL-3.0 | ❌ No | Strong copyleft |

### Supply Chain Security

- **SBOM Generation**: SPDX JSON format with anchore/sbom-action
- **Build Provenance**: actions/attest-build-provenance (SLSA L3)
- **Attestation Verification**: `gh attestation verify`
- **Dependency Scanning**: Dependabot + npm audit
- **Secret Scanning**: GitHub Advanced Security enabled

### OpenSSF Scorecard

Target: Score ≥ 7/10

Key checks:
- ✅ Branch protection enabled
- ✅ Code review required
- ✅ CI tests passing
- ✅ Dependencies pinned
- ✅ Security policy published
- ✅ Signed releases
- ✅ Vulnerability disclosure process

### Release Process

1. Version bump in package.json
2. Run full test suite (`npm run test:coverage`)
3. Generate documentation (`npm run docs:generate`)
4. Create GitHub Release with changelog
5. Generate SBOM attestation
6. Publish build provenance

## Related Policies
- [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)
- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
- [Third Party Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Third_Party_Management.md)

## Open Source Policy — Dependency Intake Workflow

Every new runtime or build dependency MUST pass these gates before being merged. See the extended checklist in [sdlc-security-integration](sdlc-security-integration.md#open-source-policy--dependency-intake-workflow).

1. **License compatibility** — Apache-2.0 / MIT / BSD / ISC accepted; GPL / AGPL / SSPL / BUSL rejected; MPL-2.0 / LGPL reviewed
2. **Advisory check** — `gh-advisory-database` + GHSA + OSV.dev; no unresolved High/Critical against adopted version
3. **Maintenance health** — recent release within 24 months, active maintainers, resolved CVE backlog, Scorecard ≥ 4/10 for critical-path deps
4. **Supply-chain provenance** — prefer deps with SLSA provenance / signed releases / protected branches
5. **Pinning** — `package-lock.json` committed, GitHub Actions pinned by SHA, Docker by digest
6. **Documentation** — update `SECURITY_ARCHITECTURE.md` when the dep is on a security-sensitive path (parser, auth, crypto, network)

## Inbound Contribution Workflow (community PRs)

1. **CLA / DCO** — contributor must accept per repo settings
2. **Automated checks** — lint, build, test, CodeQL all pass
3. **License compatibility** — any new transitive dep goes through intake workflow
4. **Security review** — required for changes in `src/mcp/`, `src/types/`, `scripts/`, `.github/workflows/`
5. **CONTRIBUTING.md compliance** — use `contribution-checker` agent

## Outbound Contribution Workflow (we publish)

- All code under Apache-2.0 with NOTICE maintained
- Every file carries SPDX headers (REUSE 3.3 compliant)
- Patches upstream are dual-reviewed before submission
- Never include Hack23 or third-party confidential data in public PRs

## Release Evidence Artifacts

For every release, CI emits:

- **SBOM (SPDX JSON)** via `anchore/sbom-action`
- **Build provenance (SLSA L3)** via `actions/attest-build-provenance`
- **Signed tag** (if enabled) + GitHub Release notes + CHANGELOG
- **Attestation verification** — `gh attestation verify dist/*.tgz --repo Hack23/euparliamentmonitor`

These satisfy:
- Open Source Policy release requirements
- EU Cyber Resilience Act essential requirements (known-vuln-free, secure-by-default, support period)
- ISO 27001 A.5.19 supplier relationships + A.8.30 outsourced development
