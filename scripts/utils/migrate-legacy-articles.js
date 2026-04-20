// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * One-shot migration script to normalize legacy news/*.html files to the
 * current canonical header/footer/script layout.
 *
 * Applied operations per file (idempotent — safe to re-run):
 *   1. Upgrade the `<header class="site-header">` block to the current markup
 *      (header-logo.png/webp at 72×48, theme-toggle, in-header language
 *      switcher `<nav class="site-header__langs">`).
 *   2. Remove any standalone legacy `<nav class="language-switcher">` block
 *      that sits outside the header.
 *   3. Replace the two inline `<script>` blocks (reading-progress + theme
 *      toggle) with a single `<script src="../js/article-runtime.js" defer>`.
 *   4. Replace the `<footer class="site-footer">` with a freshly rendered
 *      fully-localized footer built via `buildSiteFooter` — so Quick Links,
 *      Built by, contact, disclaimer etc. are all in the correct language
 *      for all 14 languages.
 *
 * Preserved as-is:
 *   - All JSON-LD schema scripts (`<script type="application/ld+json">`).
 *   - The `<article>` body and all analysis sections.
 *   - Chart.js / D3 vendor + init scripts when already present.
 *   - Hreflang link alternates, canonical link, meta tags.
 *
 * Usage: `node scripts/utils/migrate-legacy-articles.js [--dry-run]`
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildSiteFooter } from '../templates/section-builders.js';
import {
  ALL_LANGUAGES,
  LANGUAGE_FLAGS,
  LANGUAGE_NAMES,
  THEME_TOGGLE_LABELS,
  HEADER_SUBTITLE_LABELS,
  getLocalizedString,
} from '../constants/languages.js';
import { createThemeToggleButton } from '../constants/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const NEWS_DIR = path.join(REPO_ROOT, 'news');

/** Simple HTML-entity encode for attribute values. */
function escapeHTML(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Parse `YYYY-MM-DD-slug-[runNN-]LL.html` → { date, slug, lang }. */
function parseFilename(filename) {
  const m = filename.match(/^(\d{4}-\d{2}-\d{2})-([a-z0-9-]+?)(?:-run\d+)?-([a-z]{2})\.html$/);
  if (!m) return null;
  const [, date, slug, lang] = m;
  if (!ALL_LANGUAGES.includes(lang)) return null;
  return { date, slug, lang };
}

/** Build the in-header language switcher anchor list (no wrapping <nav>). */
function buildLangSwitcherAnchors(date, slug, currentLang, availableLanguages) {
  const langs = availableLanguages.length > 0 ? availableLanguages : ALL_LANGUAGES;
  return langs
    .map((code) => {
      const flag = getLocalizedString(LANGUAGE_FLAGS, code);
      const name = getLocalizedString(LANGUAGE_NAMES, code);
      const active = code === currentLang ? ' active' : '';
      const href = `${date}-${slug}-${code}.html`;
      return `<a href="${escapeHTML(href)}" class="lang-link${active}" hreflang="${code}" lang="${code}" title="${escapeHTML(name)}">${flag} ${code.toUpperCase()}</a>`;
    })
    .join('\n        ');
}

/** Build the canonical `<header class="site-header">…</header>` block. */
function buildCanonicalHeader(date, slug, lang, availableLanguages) {
  const themeLabel = escapeHTML(getLocalizedString(THEME_TOGGLE_LABELS, lang));
  const subtitle = escapeHTML(getLocalizedString(HEADER_SUBTITLE_LABELS, lang));
  const langs = buildLangSwitcherAnchors(date, slug, lang, availableLanguages);
  const indexHref = lang === 'en' ? '../index.html' : `../index-${lang}.html`;
  return `<header class="site-header" role="banner">
    <div class="site-header__inner">
      <a href="${escapeHTML(indexHref)}" class="site-header__brand" aria-label="EU Parliament Monitor">
        <picture class="site-header__logo-picture">
          <source srcset="../images/header-logo.webp" type="image/webp">
          <img class="site-header__logo site-header__logo--header" src="../images/header-logo.png" alt="" width="72" height="48" aria-hidden="true">
        </picture>
        <span>
          <span class="site-header__title">EU Parliament Monitor</span>
          <span class="site-header__subtitle">${subtitle}</span>
        </span>
      </a>
      ${createThemeToggleButton(themeLabel)}
      <nav class="site-header__langs" role="navigation" aria-label="Language selection">
        ${langs}
      </nav>
    </div>
  </header>`;
}

/** Detect which languages a given {date}-{slug} article has. */
function discoverAvailableLanguages(allFilenames, date, slug) {
  const set = new Set();
  for (const f of allFilenames) {
    // Match both suffixed (-runNN-LL) and plain (-LL) patterns
    const m = f.match(
      new RegExp(`^${date}-${slug.replace(/[-.]/g, '\\$&')}(?:-run\\d+)?-([a-z]{2})\\.html$`)
    );
    if (m && ALL_LANGUAGES.includes(m[1])) set.add(m[1]);
  }
  return ALL_LANGUAGES.filter((l) => set.has(l));
}

/**
 * Apply in-place migrations to one HTML document string.
 * Returns the new content (same string if no changes).
 */
function migrateDocument(html, date, slug, lang, availableLanguages) {
  let out = html;

  // ── 1. Replace the `<header class="site-header">…</header>` block
  //        with the canonical version (handles both legacy and "modern" headers)
  const canonicalHeader = buildCanonicalHeader(date, slug, lang, availableLanguages);
  out = out.replace(
    /<header class="site-header"[\s\S]*?<\/header>/,
    () => canonicalHeader
  );

  // ── 2. Remove any standalone legacy `<nav class="language-switcher">…</nav>`
  //        (legacy files put lang-switcher nav OUTSIDE the header; modern
  //        files put it INSIDE the header as site-header__langs — we already
  //        injected that in step 1, so any remaining standalone nav is redundant).
  out = out.replace(
    /\s*<nav class="language-switcher"[\s\S]*?<\/nav>\s*/g,
    '\n\n  '
  );

  // ── 3. Replace inline `<script>…</script>` blocks that handle
  //        reading-progress or theme-toggle with nothing. The external
  //        `<script src="../js/article-runtime.js" defer>` is injected if
  //        not already present. JSON-LD scripts (type="application/ld+json")
  //        are left untouched.
  out = out.replace(/<script(?![^>]*\bsrc=)(?![^>]*\btype="application\/ld\+json")[^>]*>[\s\S]*?<\/script>\s*/g,
    (block) => {
      // Preserve non-theme/non-reading-progress inline scripts (very rare but
      // possible for chart-init/d3-init fallbacks)
      if (/reading-progress/.test(block) || /ep-theme/.test(block) || /theme-toggle/.test(block)) {
        return '';
      }
      return block;
    }
  );

  // Ensure article-runtime.js is referenced exactly once before </body>.
  if (!/<script\s[^>]*src="\.\.\/js\/article-runtime\.js"/i.test(out)) {
    out = out.replace(
      /<\/body>/i,
      '  <script src="../js/article-runtime.js" defer></script>\n</body>'
    );
  }

  // ── 4. Replace the <footer class="site-footer">…</footer> block with a
  //        freshly-rendered, fully-localized footer.
  const newFooter = buildSiteFooter({ lang, pathPrefix: '../' });
  out = out.replace(/<footer class="site-footer"[\s\S]*?<\/footer>/, () => newFooter);

  return out;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const filesArg = process.argv.find((a) => a.startsWith('--files='));
  const allFiles = (await fs.readdir(NEWS_DIR)).filter((f) => f.endsWith('.html'));
  const files = filesArg
    ? filesArg.slice('--files='.length).split(',').filter((f) => f.endsWith('.html'))
    : allFiles;

  let changed = 0;
  let skipped = 0;
  let errors = 0;

  for (const f of files) {
    const parsed = parseFilename(f);
    if (!parsed) {
      skipped++;
      continue;
    }
    const { date, slug, lang } = parsed;
    const available = discoverAvailableLanguages(allFiles, date, slug);

    const p = path.join(NEWS_DIR, f);
    try {
      const before = await fs.readFile(p, 'utf8');
      const after = migrateDocument(before, date, slug, lang, available);
      if (after !== before) {
        if (!dryRun) await fs.writeFile(p, after, 'utf8');
        changed++;
      } else {
        skipped++;
      }
    } catch (err) {
      console.error(`✗ ${f}: ${err.message}`);
      errors++;
    }
  }

  console.log(
    `${dryRun ? '[dry-run] ' : ''}migrated: ${changed}, unchanged: ${skipped}, errors: ${errors}, total: ${files.length}`
  );

  if (errors > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
