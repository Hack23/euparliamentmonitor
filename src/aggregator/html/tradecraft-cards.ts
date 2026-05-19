// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Html/TradecraftCards
 * @description Upgrade the Markdown-rendered Tradecraft References
 * bullet lists into a `pi-card-grid` of richly described cards. Mirrors
 * the visual vocabulary of `political-intelligence.html` so the cards
 * inside news articles render consistently with the site-wide tradecraft
 * index. Also exports the shared stem-keyed icon table consumed by the
 * Analysis Index card grid.
 */

import { escapeHTML } from '../../utils/file-utils.js';
import type { LanguageCode } from '../../types/index.js';
import { TRADECRAFT_SECTION_ID } from '../artifact-order.js';
import { humanizeStem } from '../analysis-aggregator.js';
import {
  getCuratedTitle,
  getCuratedDescription,
} from '../../generators/political-intelligence-descriptions.js';

/* ─── Tradecraft & Analysis Index card-grid enhancement ─────────── */

/**
 * Default emoji used for cards that do not have a curated icon mapped to
 * their stem. Mirrors the fallback used in
 * {@link political-intelligence/html.buildPiCard}.
 */
export const DEFAULT_CARD_ICON = '🧭';

/**
 * Curated icon overrides keyed by the methodology / template stem (the
 * filename without the `.md` extension). Mirrors a subset of the icon
 * map used by `generators/political-intelligence/html.ts` so the cards
 * embedded inside news articles match the icons on the dedicated
 * Political Intelligence index page.
 */
export const STEM_ICONS: Readonly<Record<string, string>> = {
  README: '📘',
  'ai-driven-analysis-guide': '🧭',
  'analytical-supplementary-methodology': '🧭',
  'artifact-catalog': '📚',
  'electoral-cycle-methodology': '🗳️',
  'electoral-domain-methodology': '🗳️',
  'forward-projection-methodology': '🔭',
  'imf-indicator-mapping': '💶',
  'osint-tradecraft-standards': '🛳️',
  'per-artifact-methodologies': '🧭',
  'per-document-methodology': '🧭',
  'political-classification-guide': '🏷️',
  'political-risk-methodology': '⚠️',
  'political-style-guide': '✒️',
  'political-swot-framework': '⚖️',
  'political-threat-framework': '🛡️',
  'strategic-extensions-methodology': '🧭',
  'structural-metadata-methodology': '🧭',
  'synthesis-methodology': '🔗',
  'worldbank-indicator-mapping': '🌍',
  'actor-mapping': '🎭',
  'actor-threat-profiles': '🛡️',
  'analysis-index': '📚',
  'coalition-dynamics': '🤝',
  'coalition-mathematics': '🧮',
  'commission-wp-alignment': '📋',
  'comparative-international': '🌐',
  'consequence-trees': '🌳',
  'cross-reference-map': '🗺️',
  'cross-run-diff': '🔁',
  'cross-session-intelligence': '🔁',
  'data-download-manifest': '📦',
  'deep-analysis': '🔍',
  'devils-advocate-analysis': '🪞',
  'economic-context': '💶',
  'executive-brief': '📋',
  'forces-analysis': '⚙️',
  'forward-indicators': '🔭',
  'forward-projection': '🔭',
  'historical-baseline': '📜',
  'historical-parallels': '📜',
  'imf-vintage-audit': '💶',
  'impact-matrix': '📊',
  'implementation-feasibility': '🔧',
  'intelligence-assessment': '🧠',
  'legislative-disruption': '🛡️',
  'legislative-pipeline-forecast': '🛤️',
  'legislative-velocity-risk': '⏱️',
  'mandate-fulfilment-scorecard': '📋',
  'mcp-reliability-audit': '📡',
  'media-framing-analysis': '📰',
  'methodology-reflection': '🪞',
  'parliamentary-calendar-projection': '📅',
  'per-file-political-intelligence': '🧭',
  'pestle-analysis': '🌍',
  'political-capital-risk': '💼',
  'political-classification': '🏷️',
  'political-threat-landscape': '🛡️',
  'presidency-trio-context': '🇪🇺',
  'quantitative-swot': '⚖️',
  'reference-analysis-quality': '✅',
  'risk-assessment': '⚠️',
  'risk-matrix': '⚠️',
  'scenario-forecast': '🔮',
  'seat-projection': '🪑',
  'session-baseline': '📊',
  'significance-classification': '⚖️',
  'significance-scoring': '⚖️',
  'stakeholder-impact': '👥',
  'stakeholder-map': '👥',
  'swot-analysis': '⚖️',
  'synthesis-summary': '🔗',
  'term-arc': '🗳️',
  'threat-analysis': '🛡️',
  'threat-model': '🛡️',
  'voter-segmentation': '👥',
  'voting-patterns': '🤝',
  'wildcards-blackswans': '⚡',
  'workflow-audit': '🔧',
};

/**
 * Resolve the icon for a tradecraft / artifact card by file stem.
 *
 * @param stem - File stem (filename without `.md`)
 * @returns Single emoji glyph for the card icon
 */
export function getStemIcon(stem: string): string {
  return STEM_ICONS[stem] ?? DEFAULT_CARD_ICON;
}

/** One link extracted from the rendered tradecraft `<ul>` block. */
export interface ExtractedLink {
  /** Absolute GitHub blob URL for the file */
  readonly href: string;
  /** Repo-relative path (e.g. `analysis/methodologies/synthesis-methodology.md`) */
  readonly repoRelPath: string;
}

/**
 * Extract `<a href="…">label</a>` link tokens from the slice of HTML
 * between two indices. Used to harvest the methodology / template list
 * the Markdown renderer emitted as `<ul><li><a>…</a></li>…</ul>` so we
 * can re-render it as a card grid.
 *
 * Anchors whose `href` does not point at an `analysis/<methodologies|
 * templates>/<…>.md` blob URL are silently skipped — the tradecraft
 * appendix only contains those, and any stray external link (e.g. the
 * Hack23 URL inside the intro paragraph) must not be promoted to a card.
 *
 * @param html - HTML slice to scan
 * @param expectedPrefix - Path prefix (e.g. `analysis/methodologies/`)
 * @returns List of extracted `{ href, repoRelPath }` tuples
 */
export function extractTradecraftLinks(html: string, expectedPrefix: string): ExtractedLink[] {
  const out: ExtractedLink[] = [];
  let cursor = 0;
  while (cursor < html.length) {
    const aIdx = html.indexOf('<a ', cursor);
    if (aIdx === -1) break;
    const hrefIdx = html.indexOf('href="', aIdx);
    if (hrefIdx === -1) break;
    const urlStart = hrefIdx + 'href="'.length;
    const urlEnd = html.indexOf('"', urlStart);
    if (urlEnd === -1) break;
    const href = html.slice(urlStart, urlEnd);
    const closeIdx = html.indexOf('>', urlEnd);
    if (closeIdx === -1) break;
    const endIdx = html.indexOf('</a>', closeIdx);
    if (endIdx === -1) break;
    cursor = endIdx + '</a>'.length;
    const blobMarker = `/blob/main/${expectedPrefix}`;
    const blobIdx = href.indexOf(blobMarker);
    if (blobIdx === -1) continue;
    const repoRelPath = href.slice(blobIdx + '/blob/main/'.length);
    out.push({ href, repoRelPath });
  }
  return out;
}

/**
 * Render a single tradecraft / artifact card. Mirrors the structure
 * used on `political-intelligence.html` so the visual vocabulary stays
 * consistent (same `.pi-card-grid`, `.pi-card`, `.pi-card__icon`,
 * `.pi-card__body`, `.pi-card__title`, `.pi-card__desc`,
 * `.pi-card__cta` class hooks).
 *
 * The `.pi-card__path` filename row that the political-intelligence
 * page emits is intentionally omitted here — inside an article body the
 * curated title plus the curated description already convey the
 * artifact's purpose, and the raw `analysis/.../foo.md` filename adds
 * visual noise without providing reader-relevant context. Readers who
 * need the path can hover the card link or click through.
 *
 * The CTA is kind-aware ("View methodology" for the Methodologies
 * sub-section, "View artifact template" for the Artifact templates
 * sub-section) — the older generic "View on GitHub" leaked workflow
 * jargon into a reader-facing surface and provided no context about
 * what the link targets.
 *
 * @param link - Extracted link with absolute href + repo-relative path
 * @param lang - Target language code for title/description lookup
 * @param ctaLabel - Pre-resolved localised CTA text (kind-aware)
 * @returns HTML fragment for one `<li class="pi-card">…</li>` element
 */
export function renderTradecraftCard(
  link: ExtractedLink,
  lang: LanguageCode,
  ctaLabel: string
): string {
  const stem = link.repoRelPath.split('/').pop()?.replace(/\.md$/i, '') ?? link.repoRelPath;
  const fallbackTitle = humanizeStem(stem);
  const title = getCuratedTitle(link.repoRelPath, lang, fallbackTitle);
  const description = getCuratedDescription(link.repoRelPath, lang, fallbackTitle);
  const icon = getStemIcon(stem);
  return [
    `          <li class="pi-card">`,
    `            <a class="pi-card__link" href="${escapeHTML(link.href)}" rel="noopener external" target="_blank">`,
    `              <span class="pi-card__icon" aria-hidden="true">${icon}</span>`,
    `              <span class="pi-card__body">`,
    `                <span class="pi-card__title">${escapeHTML(title)}</span>`,
    `                <span class="pi-card__desc">${escapeHTML(description)}</span>`,
    `                <span class="pi-card__cta">${escapeHTML(ctaLabel)} <span aria-hidden="true">↗</span></span>`,
    `              </span>`,
    `            </a>`,
    `          </li>`,
  ].join('\n');
}

/**
 * Localised "View methodology" CTA used on every Tradecraft References
 * methodology card. Tells the reader exactly what the link surface
 * targets — a methodology guide — so the call-to-action is informative
 * even when the card is read in isolation.
 *
 * @param lang - Target language code
 * @returns Localised CTA text
 */
export function getViewMethodologyLabel(lang: LanguageCode): string {
  const labels: Partial<Record<LanguageCode, string>> = {
    en: 'View methodology',
    sv: 'Visa metodologi',
    da: 'Se metode',
    no: 'Se metodologi',
    fi: 'Näytä metodologia',
    de: 'Methodologie ansehen',
    fr: 'Voir la méthodologie',
    es: 'Ver metodología',
    nl: 'Methodologie bekijken',
    ar: 'عرض المنهجية',
    he: 'הצג מתודולוגיה',
    ja: '方法論を表示',
    ko: '방법론 보기',
    zh: '查看方法论',
  };
  return labels[lang] ?? labels.en ?? 'View methodology';
}

/**
 * Localised "View artifact template" CTA used on every Tradecraft
 * References artifact-template card. Tells the reader exactly what the
 * link surface targets — a structured template that defines the shape
 * of the artifact behind the article.
 *
 * @param lang - Target language code
 * @returns Localised CTA text
 */
function getViewTemplateLabel(lang: LanguageCode): string {
  const labels: Partial<Record<LanguageCode, string>> = {
    en: 'View artifact template',
    sv: 'Visa artefaktmall',
    da: 'Se artefaktskabelon',
    no: 'Se artefaktmal',
    fi: 'Näytä artefaktipohja',
    de: 'Artefaktvorlage ansehen',
    fr: 'Voir le modèle d’artefact',
    es: 'Ver plantilla de artefacto',
    nl: 'Artefactsjabloon bekijken',
    ar: 'عرض قالب القطعة',
    he: 'הצג תבנית פריט',
    ja: 'アーティファクト テンプレートを表示',
    ko: '아티팩트 템플릿 보기',
    zh: '查看构件模板',
  };
  return labels[lang] ?? labels.en ?? 'View artifact template';
}

/**
 * Replace the `<ul>` block that follows a sub-heading with a card-grid
 * `<ul class="pi-card-grid">` rendering. Matching is bounded to the
 * first `<ul>` that appears after `searchFromIdx` and that closes with
 * `</ul>` — so the function is safe to call on partial HTML.
 *
 * @param html - HTML to transform
 * @param searchFromIdx - Index after which the first `<ul>` is located
 * @param cardsHtml - Pre-rendered `<li class="pi-card">…</li>` joined by `\n`
 * @returns `{ html, endIdx }` with the new HTML and the index just after
 *          the inserted card grid (so successive calls can chain)
 */
function replaceFollowingUlWithCardGrid(
  html: string,
  searchFromIdx: number,
  cardsHtml: string
): { html: string; endIdx: number } {
  const ulIdx = html.indexOf('<ul>', searchFromIdx);
  if (ulIdx === -1) return { html, endIdx: searchFromIdx };
  const ulEnd = html.indexOf('</ul>', ulIdx);
  if (ulEnd === -1) return { html, endIdx: searchFromIdx };
  const replacement = `<ul class="pi-card-grid">\n${cardsHtml}\n        </ul>`;
  const closeIdx = ulEnd + '</ul>'.length;
  const next = html.slice(0, ulIdx) + replacement + html.slice(closeIdx);
  return { html: next, endIdx: ulIdx + replacement.length };
}

/**
 * Replace the rendered Tradecraft References bullet lists with a
 * `pi-card-grid` of richly described cards (icon, curated title,
 * curated description, kind-aware CTA). The cards reuse the exact same
 * class hooks as `political-intelligence.html`, so the site-wide CSS
 * already styles them — no additional CSS is required.
 *
 * After the April-2026 reorder the rendered Markdown emits Artifact
 * templates as the first sub-heading and Methodologies as the second,
 * matching how readers encounter the run (artifacts first, methodology
 * library second). The card upgrade follows the same order so the H3
 * positions stay aligned with the kind-aware CTA labels.
 *
 * Falls back to the original Markdown-rendered list when the expected
 * structure (H2 → intro paragraph → Artifact-templates sub-heading →
 * `<ul>` → Methodologies sub-heading → `<ul>`) is missing, so partially
 * stripped or unusual articles are not silently corrupted.
 *
 * @param bodyHtml - The (already-localised) article body HTML
 * @param lang - Target language code for curated titles/descriptions
 * @returns Body HTML with the tradecraft section upgraded to cards
 */
export function enhanceTradecraftCards(bodyHtml: string, lang: LanguageCode): string {
  const anchorIdx = bodyHtml.indexOf(`id="${TRADECRAFT_SECTION_ID}"`);
  if (anchorIdx === -1) return bodyHtml;
  const nextH2 = bodyHtml.indexOf('<h2 ', anchorIdx + 1);
  const sectionEnd = nextH2 === -1 ? bodyHtml.length : nextH2;
  const section = bodyHtml.slice(anchorIdx, sectionEnd);
  const methodLinks = extractTradecraftLinks(section, 'analysis/methodologies/');
  const templateLinks = extractTradecraftLinks(section, 'analysis/templates/');
  if (methodLinks.length === 0 && templateLinks.length === 0) return bodyHtml;
  const methodCta = getViewMethodologyLabel(lang);
  const templateCta = getViewTemplateLabel(lang);
  let next = bodyHtml;
  const firstHeadingIdx = next.indexOf('<h3', anchorIdx);
  if (firstHeadingIdx !== -1 && templateLinks.length > 0) {
    const templateCards = templateLinks
      .map((l) => renderTradecraftCard(l, lang, templateCta))
      .join('\n');
    const result = replaceFollowingUlWithCardGrid(next, firstHeadingIdx, templateCards);
    next = result.html;
  }
  const secondHeadingSearchStart = next.indexOf(`id="${TRADECRAFT_SECTION_ID}"`);
  if (secondHeadingSearchStart !== -1 && methodLinks.length > 0) {
    const firstH3 = next.indexOf('<h3', secondHeadingSearchStart);
    if (firstH3 !== -1) {
      const secondH3 = next.indexOf('<h3', firstH3 + 1);
      if (secondH3 !== -1) {
        const methodCards = methodLinks
          .map((l) => renderTradecraftCard(l, lang, methodCta))
          .join('\n');
        const result = replaceFollowingUlWithCardGrid(next, secondH3, methodCards);
        next = result.html;
      }
    }
  }
  return next;
}
