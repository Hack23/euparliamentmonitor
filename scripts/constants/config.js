// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Constants/Config
 * @description Shared configuration constants
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ArticleCategory } from '../types/index.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/** Project root directory */
export const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
/** News directory */
export const NEWS_DIR = path.join(PROJECT_ROOT, 'news');
/** Metadata directory */
export const METADATA_DIR = path.join(NEWS_DIR, 'metadata');
/** Base URL for the production site */
export const BASE_URL = 'https://euparliamentmonitor.com';
/** Article filename pattern regex */
export const ARTICLE_FILENAME_PATTERN = /^(\d{4}-\d{2}-\d{2})-(.+)-([a-z]{2})\.html$/;
/** Words per minute for read time calculation */
export const WORDS_PER_MINUTE = 250;
/** Valid article categories for generation — all values of the ArticleCategory enum */
export const VALID_ARTICLE_CATEGORIES = Object.values(ArticleCategory);
/** Week ahead article category constant */
export const ARTICLE_TYPE_WEEK_AHEAD = ArticleCategory.WEEK_AHEAD;
/** Breaking news article category constant */
export const ARTICLE_TYPE_BREAKING = ArticleCategory.BREAKING_NEWS;
/** Committee reports article category constant */
export const ARTICLE_TYPE_COMMITTEE_REPORTS = ArticleCategory.COMMITTEE_REPORTS;
/** Propositions article category constant */
export const ARTICLE_TYPE_PROPOSITIONS = ArticleCategory.PROPOSITIONS;
/** Motions article category constant */
export const ARTICLE_TYPE_MOTIONS = ArticleCategory.MOTIONS;
/** Month ahead article category constant */
export const ARTICLE_TYPE_MONTH_AHEAD = ArticleCategory.MONTH_AHEAD;
/** Week in review article category constant */
export const ARTICLE_TYPE_WEEK_IN_REVIEW = ArticleCategory.WEEK_IN_REVIEW;
/** Month in review article category constant */
export const ARTICLE_TYPE_MONTH_IN_REVIEW = ArticleCategory.MONTH_IN_REVIEW;
/** CLI argument separator */
export const ARG_SEPARATOR = '=';
/** Application version read from package.json */
export const APP_VERSION = (() => {
    try {
        const pkgPath = path.join(PROJECT_ROOT, 'package.json');
        const parsed = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        if (typeof parsed === 'object' && parsed !== null && 'version' in parsed) {
            const versionValue = parsed.version;
            if (typeof versionValue === 'string' && versionValue.trim() !== '') {
                return versionValue;
            }
        }
        console.warn('Invalid or missing "version" in package.json, falling back to default 0.0.0');
        return '0.0.0';
    }
    catch (err) {
        console.warn('Failed to read version from package.json:', err);
        return '0.0.0';
    }
})();
/**
 * Pinned Mermaid bundle version, read from `devDependencies.mermaid` in
 * `package.json`. Used as a cache-busting query parameter on the
 * `mermaid-init.js` script tag in generated article HTML so a Mermaid
 * version bump in `package.json` automatically invalidates browser /
 * CloudFront caches the next time articles are regenerated. Any leading
 * semver range character (`^`, `~`, `>=`) is stripped — the contract for
 * this repo is a fixed pin (e.g. `"mermaid": "11.14.0"`), but stripping
 * keeps us robust if the pin is briefly relaxed during a dependency update.
 */
export const MERMAID_VERSION = (() => {
    try {
        const pkgPath = path.join(PROJECT_ROOT, 'package.json');
        const parsed = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        if (typeof parsed === 'object' && parsed !== null && 'devDependencies' in parsed) {
            const devDeps = parsed.devDependencies;
            if (typeof devDeps === 'object' && devDeps !== null && 'mermaid' in devDeps) {
                const raw = devDeps.mermaid;
                if (typeof raw === 'string' && raw.trim() !== '') {
                    return raw.replace(/^[\^~><=\s]+/, '').trim();
                }
            }
        }
        console.warn('Invalid or missing "devDependencies.mermaid" in package.json, falling back to 0.0.0');
        return '0.0.0';
    }
    catch (err) {
        console.warn('Failed to read mermaid version from package.json:', err);
        return '0.0.0';
    }
})();
/**
 * Generate theme toggle HTML button markup with a localized aria-label.
 * Renders a moon (light→dark) and sun (dark→light) icon; CSS controls visibility.
 *
 * @param ariaLabel - Localized accessible label for the theme toggle button
 * @returns HTML string for the theme toggle button
 */
export function createThemeToggleButton(ariaLabel) {
    return `<button type="button" class="theme-toggle" aria-label="${ariaLabel}"><span class="theme-toggle__icon--light" aria-hidden="true">🌙</span><span class="theme-toggle__icon--dark" aria-hidden="true">☀️</span></button>`;
}
/**
 * Raw theme toggle script content (without wrapping `<script>` tags).
 * Used as single source of truth for both the injected `<script>` block
 * and the CSP hash computation in article-template.ts.
 */
export const THEME_TOGGLE_SCRIPT_CONTENT = `
  (function(){
    var docEl=document.documentElement;
    var t=localStorage.getItem('ep-theme');
    var storedTheme=t==='light'?'light':t==='dark'?'dark':null;
    if(storedTheme){
      docEl.setAttribute('data-theme',storedTheme);
    }else if(t){
      localStorage.removeItem('ep-theme');
    }
    var btn=document.querySelector('.theme-toggle');
    if(!btn)return;
    btn.addEventListener('click',function(){
      var cur=docEl.getAttribute('data-theme');
      if(!cur){
        cur=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light';
      }
      var next=cur==='dark'?'light':'dark';
      docEl.setAttribute('data-theme',next);
      localStorage.setItem('ep-theme',next);
    });
  })();
  `;
/**
 * Theme toggle inline script block (complete `<script>…</script>` markup).
 * Reads/writes localStorage key "ep-theme" and sets `data-theme` on `<html>`.
 * Detects system theme on first click when no explicit preference is saved.
 */
export const THEME_TOGGLE_SCRIPT = `
  <script>${THEME_TOGGLE_SCRIPT_CONTENT}</script>`;
/**
 * Resolve the current build commit SHA. Precedence:
 *   1. `process.env.BUILD_ID` (CI sets this from `${{ github.sha }}`)
 *   2. `git rev-parse HEAD` (works in dev clones / local builds)
 *   3. `'0'.repeat(40)` (deterministic, never throws)
 *
 * Always returns a 40-char lowercase hex string. Never throws — generator
 * scripts must be safe to run on machines without git installed.
 *
 * @returns 40-char lowercase hex commit SHA, or `'0'.repeat(40)` placeholder.
 */
function resolveBuildId() {
    const fromEnv = (process.env.BUILD_ID ?? '').trim();
    if (/^[0-9a-f]{40}$/i.test(fromEnv)) {
        return fromEnv.toLowerCase();
    }
    try {
        const fromGit = execSync('git rev-parse HEAD', {
            encoding: 'utf-8',
            stdio: ['ignore', 'pipe', 'ignore'],
            cwd: PROJECT_ROOT,
        }).trim();
        if (/^[0-9a-f]{40}$/i.test(fromGit)) {
            return fromGit.toLowerCase();
        }
    }
    catch {
        /* git unavailable or not a repo — fall through to placeholder */
    }
    return '0'.repeat(40);
}
/**
 * Full git commit SHA (40 chars) for the running build. Resolved via env
 * (`BUILD_ID`), then `git rev-parse HEAD`, then a deterministic placeholder
 * (`'0'.repeat(40)`). Never empty, never throws.
 */
export const BUILD_ID = resolveBuildId();
/** First 7 chars of {@link BUILD_ID} — the conventional short SHA. */
export const BUILD_SHORT = BUILD_ID.slice(0, 7);
/**
 * ISO 8601 timestamp for when this build was produced. Precedence:
 *   1. `process.env.BUILD_TIME` (CI sets this in the workflow)
 *   2. `new Date().toISOString()` fallback
 */
export const BUILD_TIME = (() => {
    const fromEnv = (process.env.BUILD_TIME ?? '').trim();
    if (fromEnv)
        return fromEnv;
    return new Date().toISOString();
})();
/**
 * Optional release tag (e.g. `v0.8.51`). Empty string when no tag was
 * supplied via `process.env.RELEASE_TAG`. Surfaced in `build-info.json`
 * for clients that want a human-readable label.
 */
export const RELEASE_TAG = (process.env.RELEASE_TAG ?? '').trim();
// ─── EP Election Calendar Constants ────────────────────────────────────────
/**
 * Start of the next European Parliament election window (EP10 → EP11 transition).
 * Council Decision (EU) 2018/767 sets the election in the second week of June.
 * ISO 8601 date string.
 */
export const EP_NEXT_ELECTION_START = '2029-06-04';
/**
 * End of the next European Parliament election window (EP10 → EP11 transition).
 * ISO 8601 date string.
 */
export const EP_NEXT_ELECTION_END = '2029-06-09';
/** Current parliamentary term identifier */
export const EP_CURRENT_TERM = 'EP10';
/** Next parliamentary term identifier */
export const EP_NEXT_TERM = 'EP11';
//# sourceMappingURL=config.js.map