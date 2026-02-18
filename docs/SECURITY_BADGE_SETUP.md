# Security Badge Setup Guide

This guide provides step-by-step instructions for setting up and maintaining
security badges for EU Parliament Monitor, following
[Hack23 ISMS Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md).

## Prerequisites

- Repository must be public
- Administrator access to GitHub repository
- Email address for service registrations
- All workflows committed and pushed to `main` branch

## 1. OpenSSF Scorecard

**Status**: ✅ Already configured (workflow exists)

**Current Setup**:

- Workflow: `.github/workflows/scorecards.yml`
- Runs: Weekly on Tuesday at 7:20 AM UTC, on push to main, on branch protection
  changes
- Badge:
  `https://api.securityscorecards.dev/projects/github.com/Hack23/euparliamentmonitor/badge`

**View Current Score**:

```
https://scorecard.dev/viewer/?uri=github.com/Hack23/euparliamentmonitor
```

**Optimization Tips**:

1. **Branch Protection** (Required for full score):
   - Go to Settings → Branches → Add rule for `main`
   - Enable: "Require a pull request before merging"
   - Enable: "Require approvals" (at least 1)
   - Enable: "Require status checks to pass before merging"
   - Enable: "Do not allow bypassing the above settings"

2. **Code Review** (Already enabled):
   - All PRs require review before merge
   - Copilot PR workflow ensures review

3. **Security Scanning** (Already enabled):
   - CodeQL: ✅
   - Dependabot: ✅
   - Dependency Review: ✅

4. **Action Pinning** (Already done):
   - All actions pinned to SHA hashes
   - Step Security Harden Runner enabled

**Target Score**: ≥7.0

**Documentation**: https://github.com/ossf/scorecard

---

## 2. CII Best Practices Badge

**Status**: 📝 Registration Required

**Steps**:

1. **Register Project**:
   - Go to https://bestpractices.coreinfrastructure.org/
   - Click "Get Your Badge Now"
   - Log in with GitHub account
   - Enter repository URL: `https://github.com/Hack23/euparliamentmonitor`

2. **Complete Questionnaire**:

   **Basics**:
   - [x] Project has a version-controlled public repository:
         `https://github.com/Hack23/euparliamentmonitor`
   - [x] Project has a bug-tracking system: GitHub Issues
   - [x] Project is released as FLOSS: Apache-2.0 license

   **Change Control**:
   - [x] Public version-controlled source repository: GitHub
   - [x] Unique version numbering: Semantic versioning
   - [x] Release notes: Via Release Drafter

   **Reporting**:
   - [x] Bug reporting process: GitHub Issues
   - [x] Vulnerability reporting process: SECURITY.md (GitHub Security
         Advisories)
   - [x] Vulnerability report response time: 48 hours (documented in
         SECURITY.md)

   **Quality**:
   - [x] Working build system: npm scripts
   - [x] Automated test suite: Vitest (169 tests) + Playwright (60+ E2E tests)
   - [x] Test policy: ≥80% line coverage, ≥75% branch coverage (documented in
         CONTRIBUTING.md)
   - [x] Continuous integration: GitHub Actions

   **Security**:
   - [x] Secure development knowledge: SECURITY_ARCHITECTURE.md, Hack23 ISMS
   - [x] Use of basic good cryptographic practices: HTTPS only, CSP headers
   - [x] Delivered securely: GitHub Pages HTTPS
   - [x] Publicly known vulnerabilities fixed: Dependabot, npm audit
   - [x] Static code analysis: CodeQL, ESLint security plugin
   - [x] Dynamic code analysis: Planned (Q3 2026)

   **Documentation**:
   - [x] English documentation: README.md
   - [x] Installation instructions: README.md
   - [x] User documentation: README.md, docs/
   - [x] Developer documentation: CONTRIBUTING.md, docs/CODE_STANDARDS.md

3. **Submit for Passing Badge**:
   - Answer all required questions
   - Provide justifications where needed
   - Submit for review

4. **Add Badge to README**:
   - Badge markdown provided after approval
   - Replace placeholder `XXXXX` with actual project ID

**Target Level**: Passing (minimum), Silver (stretch goal)

**Documentation**: https://bestpractices.coreinfrastructure.org/en/criteria

---

## 3. SLSA Build Provenance

**Status**: ✅ Already configured

**Current Setup**:

- Workflow: `.github/workflows/slsa-provenance.yml`
- Triggers: On release creation, manual workflow dispatch
- Attestations: Build provenance + SBOM (CycloneDX)
- Level: **SLSA Level 3**

**Features**:

- ✅ Automated build on release
- ✅ GitHub-hosted runner (isolated environment)
- ✅ Build provenance attestation
- ✅ SBOM generation (CycloneDX format)
- ✅ Artifact signing via GitHub Attestations API

**View Attestations**:

```
https://github.com/Hack23/euparliamentmonitor/attestations/
```

**Manual Trigger**:

```bash
# Via GitHub UI:
Actions → SLSA Provenance → Run workflow
# Enter version tag (e.g., v1.0.0)

# Or create a release:
Actions → Release → Run workflow
```

**Verification** (after release):

```bash
# Download release artifacts
gh release download v1.0.0

# Verify attestation (requires gh CLI v2.40.0+)
gh attestation verify euparliamentmonitor-v1.0.0.tar.gz \
  --owner Hack23
```

**Documentation**: https://slsa.dev/

---

## 4. SonarCloud Analysis

**Status**: 📝 Setup Required

**Steps**:

1. **Enable SonarCloud**:
   - Go to https://sonarcloud.io/
   - Click "Log in" → "With GitHub"
   - Authorize SonarCloud
   - Click "Analyze new project"
   - Select `Hack23/euparliamentmonitor`
   - Click "Set Up"

2. **Configure Organization**:
   - Organization: `hack23`
   - Project Key: `Hack23_euparliamentmonitor`
   - (These match values in `sonar-project.properties`)

3. **Generate Token**:
   - Go to Account → Security → Generate Token
   - Name: `euparliamentmonitor-github-actions`
   - Type: Project Analysis Token
   - Copy token value

4. **Add GitHub Secret**:
   - Go to repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `SONAR_TOKEN`
   - Value: [paste token from step 3]
   - Click "Add secret"

5. **Configure Quality Gate** (Optional):
   - Go to SonarCloud → Project → Quality Gate
   - Set thresholds:
     - Coverage: ≥80%
     - Maintainability Rating: A
     - Reliability Rating: A
     - Security Rating: A

6. **Trigger Analysis**:
   - Push to main branch, or
   - Create a pull request, or
   - Wait for weekly scheduled run

**Verify Setup**:

- Check Actions → SonarCloud Analysis workflow
- View results at
  `https://sonarcloud.io/dashboard?id=Hack23_euparliamentmonitor`

**Documentation**: https://docs.sonarcloud.io/

---

## 5. FOSSA License Compliance

**Status**: 📝 Setup Required

**Steps**:

1. **Sign Up**:
   - Go to https://fossa.com/
   - Click "Get Started for Free"
   - Sign up with GitHub account

2. **Add Project**:
   - Click "Add a Project"
   - Select "GitHub"
   - Find and select `Hack23/euparliamentmonitor`
   - Click "Import"

3. **Configure Scan**:
   - Default settings are usually sufficient
   - Scan language: JavaScript/Node.js
   - Scan directory: root

4. **Set License Policy**:
   - Go to Project → Settings → License Policy
   - Allowed licenses: Apache-2.0, MIT, BSD-3-Clause, ISC
   - Flag for review: GPL, LGPL, AGPL
   - Deny: Proprietary, unknown

5. **Wait for Initial Scan**:
   - FOSSA will automatically scan the repository
   - First scan takes 5-15 minutes

6. **Get Badge**:
   - Go to Project → Settings → Badge
   - Copy badge URL (already in README.md)
   - Badge format:
     `https://app.fossa.com/api/projects/git%2Bgithub.com%2FHack23%2Feuparliamentmonitor.svg?type=shield`

**Maintenance**:

- FOSSA scans automatically on new commits
- Review license issues in FOSSA dashboard
- Fix any license compliance issues before merging PRs

**Documentation**: https://docs.fossa.com/

---

## 6. REUSE Compliance

**Status**: ✅ Already configured

**Current Setup**:

- Workflow: `.github/workflows/reuse.yml`
- Configuration: `.reuse/dep5`
- Runs: On push to main, PRs, weekly on Monday

**Verification**:

- Badge:
  `https://api.reuse.software/badge/github.com/Hack23/euparliamentmonitor`
- Dashboard:
  `https://api.reuse.software/info/github.com/Hack23/euparliamentmonitor`

**Maintaining Compliance**:

1. **For new JavaScript files**, add SPDX header:

   ```javascript
   // SPDX-FileCopyrightText: 2024-2026 Hack23 AB
   // SPDX-License-Identifier: Apache-2.0
   ```

2. **For new configuration/data files**, add to `.reuse/dep5`:

   ```
   Files: path/to/files/*.ext
   Copyright: 2024-2026 Hack23 AB
   License: Apache-2.0
   ```

3. **Verify compliance locally**:

   ```bash
   # Install reuse tool
   pip3 install reuse

   # Check compliance
   reuse lint
   ```

**Documentation**: https://reuse.software/

---

## 7. GitHub Native Security Features

### CodeQL

**Status**: ✅ Already configured

**Workflow**: `.github/workflows/codeql.yml`

**View Results**:

- Security → Code scanning alerts
- All alerts should be resolved before merge

### Dependabot

**Status**: ✅ Already configured

**Configuration**: `.github/dependabot.yml`

**View Results**:

- Security → Dependabot alerts
- Security → Dependabot updates (PRs)

**Response Time**: Critical/High within 7 days (ISMS requirement)

### Dependency Review

**Status**: ✅ Already configured

**Workflow**: `.github/workflows/dependency-review.yml`

**Function**: Blocks PRs that introduce known vulnerabilities

---

## Verification Checklist

After completing setup, verify all badges are working:

- [ ] **OpenSSF Scorecard**: Score visible at scorecard.dev
- [ ] **CII Best Practices**: Badge shows "passing" status
- [ ] **SLSA Provenance**: Attestations visible after creating a release
- [ ] **SonarCloud**: Quality gate results visible in PRs
- [ ] **FOSSA**: License scan passes, no violations
- [ ] **REUSE**: Compliance check passes in CI
- [ ] **CodeQL**: No critical/high findings
- [ ] **Dependabot**: Alerts monitored, no unresolved critical/high

---

## Maintenance Schedule

| Badge/Service      | Frequency  | Action                           |
| ------------------ | ---------- | -------------------------------- |
| OpenSSF Scorecard  | Weekly     | Review score, optimize if < 7.0  |
| CII Best Practices | Annually   | Re-certify, update questionnaire |
| SLSA Provenance    | On release | Verify attestations generated    |
| SonarCloud         | Per PR     | Review quality gate, fix issues  |
| FOSSA              | Per PR     | Review license compliance        |
| REUSE              | Per PR     | Ensure new files comply          |
| CodeQL             | Weekly     | Review and triage alerts         |
| Dependabot         | Daily      | Review alerts, merge updates     |

---

## Troubleshooting

### OpenSSF Scorecard Score Low

**Common Issues**:

- Branch protection not enabled → Enable in Settings
- Actions not pinned to SHA → Pin all actions
- No code review → Require PR reviews
- Security policy missing → Verify SECURITY.md exists

### SonarCloud Not Running

**Common Issues**:

- SONAR_TOKEN not set → Add secret in repository settings
- Token expired → Generate new token in SonarCloud
- Workflow syntax error → Check Actions tab for errors

### REUSE Compliance Failing

**Common Issues**:

- Missing license headers → Add SPDX headers to files
- Files not in dep5 → Add entries to `.reuse/dep5`
- Copyright year wrong → Update to 2024-2026

### SLSA Attestations Not Generated

**Common Issues**:

- Release not created → Workflow only runs on releases
- Permissions issue → Verify `id-token: write` permission
- Build failed → Check workflow logs in Actions tab

---

## Support

- **ISMS Questions**: See [Hack23 ISMS](https://github.com/Hack23/ISMS-PUBLIC)
- **Badge Issues**: Open issue in
  [euparliamentmonitor](https://github.com/Hack23/euparliamentmonitor/issues)
- **Service-Specific**: Consult service documentation links above

---

**Last Updated**: 2026-02-17  
**Owner**: DevOps Engineer / Security Architect  
**Review Frequency**: Quarterly
