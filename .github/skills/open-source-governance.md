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
