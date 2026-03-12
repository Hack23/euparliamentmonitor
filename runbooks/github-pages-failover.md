# 🌐 GitHub Pages Failover Runbook

**Last updated:** 2026-03-12
**Owner:** BCP Team
**Trigger:** AWS S3 + CloudFront extended outage (>30 minutes)

---

## 📋 Prerequisites

- Local clone of the repository
- Node.js (current production version) installed
- GitHub account with push access to the repository
- Access to GitHub repository **Settings → Pages**

---

## 🚀 Failover Procedure

### Step 1: Build and Prepare Content

Run `npm install` (if needed) and `npm run build` locally to compile TypeScript into `./scripts`. If news content or index/sitemap files need to be regenerated, also run `npm run generate-news` (and any other required content-generation commands) so that the repository root contains the up-to-date HTML entry points, `news/` directory, and generated index/sitemap files.

```bash
npm install
npm run build
npm run generate-news  # if content regeneration is needed
```

### Step 2: Create Deployable Branch

Create or update a `gh-pages` branch that contains the deployable static site: the root HTML files (`index.html`, `index-*.html`), the `news/` directory, and the generated sitemap (`sitemap.xml`). Exclude build tooling, tests, and non-essential development artifacts to keep the branch minimal.

```bash
git checkout -b gh-pages
# Include only deployable artifacts:
# - index.html, index-*.html (root HTML entry points)
# - news/ directory
# - sitemap.xml
# - scripts/ directory (compiled JS)
# Exclude: src/, test/, e2e/, node_modules/, .github/
```

### Step 3: Deploy to GitHub Pages

Push the `gh-pages` branch to GitHub and configure GitHub Pages (under **Settings → Pages**) to serve from the `gh-pages` branch, root directory. Reference the configuration change (who/when/what) in the incident ticket so that it is auditable.

### Step 4: Validate Availability

Wait for GitHub Pages to report as active, then validate availability via the GitHub Pages URL for all 14 language paths:

| Language | Path |
|----------|------|
| English | `/index.html` |
| Swedish | `/index-sv.html` |
| Danish | `/index-da.html` |
| Norwegian | `/index-no.html` |
| Finnish | `/index-fi.html` |
| German | `/index-de.html` |
| French | `/index-fr.html` |
| Spanish | `/index-es.html` |
| Dutch | `/index-nl.html` |
| Arabic | `/index-ar.html` |
| Hebrew | `/index-he.html` |
| Japanese | `/index-ja.html` |
| Korean | `/index-ko.html` |
| Chinese | `/index-zh.html` |

Confirm that root HTML, `news/`, and the generated index and sitemap files load correctly.

### Step 5: Record and Communicate

Record the fallback URL in the incident ticket and, if applicable, update status communications to direct users to the GitHub Pages fallback or alternative CDN endpoint.

---

## 🔄 Post-Incident Recovery

After the primary AWS S3 + CloudFront service is restored:

1. **Revert** any manual GitHub Pages configuration changes
2. **Document** the incident resolution in the incident ticket
3. **Validate** the primary S3/CloudFront endpoint is fully operational
4. If this fallback procedure is needed frequently, create a version-controlled `workflow_dispatch` workflow in `.github/workflows/` to automate these steps

---

## 📎 References

- [BCPPlan.md](../BCPPlan.md) — Business Continuity Plan (Phase 2: Short-Term Recovery)
- [AWS S3 + CloudFront deployment workflow](../.github/workflows/deploy-s3.yml)
- [ISMS Incident Response Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Incident_Response_Policy.md)
