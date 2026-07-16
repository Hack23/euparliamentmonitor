# Release Process Guide

## 📦 Creating a New Release

This guide describes how to create a new release of EU Parliament Monitor with automated documentation and attestations.

## 🚀 Release Workflow

### Automated Release (Recommended)

1. **Navigate to GitHub Actions**
   - Go to https://github.com/Hack23/euparliamentmonitor/actions
   - Select "Release" workflow

2. **Trigger Release**
   - Click "Run workflow"
   - Enter version (e.g., `v1.0.0`)
   - Select if pre-release
   - Click "Run workflow"

3. **Workflow Steps** (Automatic)
   The workflow will automatically:
   - ✅ Validate code (linting, HTML validation)
   - ✅ Run all tests (unit, integration, E2E)
   - ✅ Generate test coverage reports
   - ✅ Generate API documentation (JSDoc)
   - ✅ Create documentation index
   - ✅ Commit documentation to main branch
   - ✅ Create release artifacts with docs
   - ✅ Generate SBOM (Software Bill of Materials)
   - ✅ Create build provenance attestations
   - ✅ Create GitHub release with all artifacts
   - ✅ Create one annotated `vX.Y.Z` tag and one release run

4. **Review Release**
   - Check the release notes at https://github.com/Hack23/euparliamentmonitor/releases
   - Verify documentation is updated in docs/
   - Verify attestations are present

### Release Trigger Policy

Use **Run workflow** on `main` for every release. Do not create or push a
release tag manually: the release workflow validates the requested version,
commits the version and generated documentation, then creates and pushes the
tag atomically. This prevents a workflow-created tag from recursively starting
a second release run.

### Optional Commit and Tag Signing

To sign the release commit and annotated tag, configure the protected
`RELEASE_SSH_SIGNING_KEY` environment secret with a dedicated SSH signing key,
and add its public key as a Git signing key for the release bot account. The
workflow detects the secret and enables SSH commit and tag signing; without it,
the release remains protected by the GitHub App identity, tag immutability,
SBOM, and SLSA attestations but is not Git-signature verified.

## 📚 Documentation Generated

Each release automatically generates and commits:

### 1. API Documentation (`docs/api/`)
- Complete JSDoc-generated API reference
- Searchable interface
- Source code cross-references
- Module documentation

### 2. Test Coverage (`docs/coverage/`)
- Line coverage reports
- Branch coverage analysis
- Function coverage metrics
- Interactive HTML reports

### 3. Test Results (`docs/test-results/`)
- Unit test results summary
- Integration test results
- Links to detailed reports

### 4. E2E Test Reports (`playwright-report/`)
- Playwright test execution results
- Browser-specific results
- Screenshots and videos on failure
- Accessibility scan results

### 5. Documentation Index (`docs/index.html`)
- Beautiful landing page
- Links to all documentation
- Quick navigation
- Responsive design

## 🔒 Security Attestations

Each release includes:

### SBOM (Software Bill of Materials)
- Format: SPDX JSON
- Lists all dependencies
- Includes version information
- File: `euparliamentmonitor-{version}.spdx.json`

### Build Provenance
- SLSA Level 3 attestation
- Build environment details
- Build parameters
- File: `euparliamentmonitor-{version}.zip.intoto.jsonl`

### SBOM Attestation
- SBOM integrity verification
- Cryptographically signed
- File: `euparliamentmonitor-{version}.spdx.json.intoto.jsonl`

## 🔍 Verifying Releases

### Verify Attestations

Using GitHub CLI:
```bash
# Install GitHub CLI if needed
# brew install gh  # macOS
# or download from https://cli.github.com/

# Verify the release artifact
gh attestation verify euparliamentmonitor-v1.0.0.zip --owner Hack23

# Expected output:
# ✓ Verification succeeded!
```

### Check Documentation

1. **Online Documentation**
   - Visit https://hack23.github.io/euparliamentmonitor/docs/
   - Browse API docs, coverage, and test reports

2. **Local Documentation**
   - Extract release artifact
   - Open `docs/index.html` in browser

## 📋 Release Checklist

Before creating a release:

- [ ] All tests passing on main branch
- [ ] No known security vulnerabilities
- [ ] CHANGELOG.md updated (if exists)
- [ ] Version number follows semantic versioning
- [ ] Documentation is up-to-date

After release:

- [ ] Verify release artifacts are present
- [ ] Check documentation is updated
- [ ] Verify attestations with `gh attestation verify`
- [ ] Test release artifact downloads
- [ ] Announce release (if applicable)

## 📊 Deployment

The release workflow automatically:

1. **Commits to main branch**
   - Documentation updates
   - Version bumps (if workflow_dispatch)

2. **Creates GitHub Release**
   - Release notes from Release Drafter
   - Artifacts attached
   - Tagged with version

3. **Artifacts Available**
   - Main application zip
   - SBOM (SPDX format)
   - Build provenance attestation
   - SBOM attestation

## 🔄 Continuous Deployment

For automatic deployment to S3/CloudFront:
- See `.github/workflows/deploy-s3.yml`
- Triggers on successful release
- Deploys to production environment

## 🐛 Troubleshooting

### Workflow Fails on Tests
- Check test logs in GitHub Actions
- Run tests locally: `npm test`
- Fix issues and retry release

### Documentation Not Generated
- Verify JSDoc configuration: `jsdoc.json`
- Run locally: `npm run docs:generate`
- Check for errors in workflow logs

### Attestation Issues
- Ensure OIDC token permissions are set
- Check `attestations: write` permission
- Verify GitHub Actions version

### Version Conflict
- Check if tag already exists
- Delete tag if needed: `git tag -d v1.0.0`
- Push deletion: `git push origin :refs/tags/v1.0.0`

## 📝 Version Numbering

Follow Semantic Versioning (SemVer):

- **Major** (v2.0.0) - Breaking changes
- **Minor** (v1.1.0) - New features, backward compatible
- **Patch** (v1.0.1) - Bug fixes, backward compatible

Examples:
- Initial release: `v1.0.0`
- Bug fix: `v1.0.1`
- New feature: `v1.1.0`
- Breaking change: `v2.0.0`
- Pre-release: `v1.0.0-alpha.1`

## 🔗 Related Documentation

- [README.md](../README.md) - Project overview
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
- [SECURITY.md](../SECURITY.md) - Security policy
- [docs/README.md](../docs/README.md) - Documentation guide

## 📞 Support

For issues or questions:
- Open an issue: https://github.com/Hack23/euparliamentmonitor/issues
- Email: conduct@hack23.com

---

**Last Updated**: 2026-02-18  
**Version**: 1.0
