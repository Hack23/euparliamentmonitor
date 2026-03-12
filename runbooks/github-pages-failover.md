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

Run `npm ci` (preferred, when `package-lock.json` is present; otherwise run `npm install`) and `npm run build` locally to compile TypeScript into `./scripts`. If news content or index/sitemap files need to be regenerated, also run `npm run generate-news` (and any other required content-generation commands) so that the repository root contains the up-to-date HTML entry points, `news/` directory, and generated index/sitemap files.

```bash
# Prefer npm ci for reproducible builds (matches CI pipeline)
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi
npm run build
npm run generate-news  # if content regeneration is needed
```

### Step 2: Create Deployable Branch

Create or update a `gh-pages` branch that contains **only** the deployable static site artifacts: the root HTML files (`index.html`, `index-*.html`), the `news/` directory, the `scripts/` directory, and the generated sitemap (`sitemap.xml`). The procedure first saves the build artifacts from the current working tree into a temporary directory, then creates an orphan branch with a clean state, and copies the artifacts back in.

```bash
# Save the deployable artifacts from the current working tree into a temporary directory
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT ERR
cp -p index.html "$TMP_DIR"/ 2>/dev/null || true
cp -p index-*.html "$TMP_DIR"/ 2>/dev/null || true
cp -pr news "$TMP_DIR"/ 2>/dev/null || true
cp -pr scripts "$TMP_DIR"/ 2>/dev/null || true
cp -p sitemap.xml "$TMP_DIR"/ 2>/dev/null || true

# If gh-pages branch already exists locally, delete it first
git branch -D gh-pages 2>/dev/null || true

# Create an orphan branch (no parent commits, clean working tree)
git checkout --orphan gh-pages

# Remove all tracked files and clean untracked files from the working tree
git reset --hard
git clean -fdx

# Copy the deployable artifacts from the temporary directory into the repository root
cp -pr "$TMP_DIR"/. .

# Clean up the temporary directory
rm -rf "$TMP_DIR"

# Add and commit only the deployable artifacts
git add index.html ':(glob)index-*.html' news/ scripts/ sitemap.xml
git commit -m "Deploy static site to GitHub Pages (incident failover)"
```

### Step 3: Deploy to GitHub Pages

Push the `gh-pages` branch to GitHub (force-push is expected since the orphan branch has no common history with any previous `gh-pages` contents):

```bash
git push --force origin gh-pages
```

Then configure GitHub Pages (under **Settings → Pages**) to serve from the `gh-pages` branch, root directory. Reference the configuration change (who/when/what) in the incident ticket so that it is auditable.

### Step 4: Validate Availability

Wait for GitHub Pages to report as active, then validate availability using the GitHub Pages **project page** base URL for this repository:

- Base URL: `https://hack23.github.io/euparliamentmonitor`

Validate that all 14 language variants are available at the following full URLs:

| Language | Full URL |
|----------|----------|
| English | `https://hack23.github.io/euparliamentmonitor/index.html` |
| Swedish | `https://hack23.github.io/euparliamentmonitor/index-sv.html` |
| Danish | `https://hack23.github.io/euparliamentmonitor/index-da.html` |
| Norwegian | `https://hack23.github.io/euparliamentmonitor/index-no.html` |
| Finnish | `https://hack23.github.io/euparliamentmonitor/index-fi.html` |
| German | `https://hack23.github.io/euparliamentmonitor/index-de.html` |
| French | `https://hack23.github.io/euparliamentmonitor/index-fr.html` |
| Spanish | `https://hack23.github.io/euparliamentmonitor/index-es.html` |
| Dutch | `https://hack23.github.io/euparliamentmonitor/index-nl.html` |
| Arabic | `https://hack23.github.io/euparliamentmonitor/index-ar.html` |
| Hebrew | `https://hack23.github.io/euparliamentmonitor/index-he.html` |
| Japanese | `https://hack23.github.io/euparliamentmonitor/index-ja.html` |
| Korean | `https://hack23.github.io/euparliamentmonitor/index-ko.html` |
| Chinese | `https://hack23.github.io/euparliamentmonitor/index-zh.html` |

> **Note:** If this runbook is used from a fork, replace `hack23` in the base URL with your GitHub username or organization.

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
