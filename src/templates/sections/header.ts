// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Templates/Sections/Header
 * @description Shared responsive site header used by every generated page family.
 * Split out of `section-builders.ts` (Refactor 8/8).
 */

import { escapeHTML } from '../../utils/file-utils.js';
import type { LanguageCode } from '../../types/index.js';
import {
  getLocalizedString,
  HEADER_SUBTITLE_LABELS,
  THEME_TOGGLE_LABELS,
  HEADER_CTA_SPONSOR_LABELS,
  HEADER_CTA_BECOME_SPONSOR_LABELS,
  HEADER_CTA_SECURITY_LABELS,
  FOOTER_POLITICAL_INTELLIGENCE_LABELS,
  LANGUAGE_SELECTION_ARIA_LABELS,
} from '../../constants/languages.js';
import { createThemeToggleButton } from '../../constants/config.js';
import { icon, type IconName } from '../icons.js';
import { buildResponsiveBannerPicture } from './banner.js';

/** Icon name used for security/transparency links across the chrome. */
const ICON_SECURITY: IconName = 'shield-star';

/**
 * Options for building the shared site header.
 */
export interface SiteHeaderOptions {
  /** Language code used for localization. */
  lang: LanguageCode;
  /**
   * URL path prefix prepended to relative asset and page links.
   * Use `''` for root pages and `'../'` for pages inside `news/`.
   */
  pathPrefix: string;
  /** Link target for the brand/logo. */
  homeHref: string;
  /** Accessible site title and visible brand title. */
  siteTitle: string;
  /** Pre-rendered language switcher links for the current page family. */
  languageSwitcherHtml: string;
  /**
   * Optional override for the Political Intelligence destination. When
   * omitted the link points at the language-aware
   * `political-intelligence[_<lang>].html` page using `pathPrefix`.
   * Pass an empty string to suppress the link altogether.
   */
  politicalIntelligenceHref?: string;
}

/**
 * Build the shared responsive site header used by every generated page family.
 *
 * @param options - {@link SiteHeaderOptions} controlling language, assets, and language links.
 * @returns HTML string for `<header class="site-header">…</header>`.
 */
export function buildSiteHeader(options: SiteHeaderOptions): string {
  const { lang, pathPrefix, homeHref, siteTitle, languageSwitcherHtml } = options;
  const headerSubtitle = escapeHTML(getLocalizedString(HEADER_SUBTITLE_LABELS, lang));
  const themeToggleLabel = getLocalizedString(THEME_TOGGLE_LABELS, lang);
  const sponsorLabel = escapeHTML(getLocalizedString(HEADER_CTA_SPONSOR_LABELS, lang));
  const becomeSponsorLabel = escapeHTML(getLocalizedString(HEADER_CTA_BECOME_SPONSOR_LABELS, lang));
  const securityLabel = escapeHTML(getLocalizedString(HEADER_CTA_SECURITY_LABELS, lang));
  const piLabel = escapeHTML(getLocalizedString(FOOTER_POLITICAL_INTELLIGENCE_LABELS, lang));
  const langSelectionLabel = escapeHTML(getLocalizedString(LANGUAGE_SELECTION_ARIA_LABELS, lang));
  const safeTitle = escapeHTML(siteTitle);
  const defaultPiHref = `${pathPrefix}${lang === 'en' ? 'political-intelligence.html' : `political-intelligence_${lang}.html`}`;
  const rawPiHref =
    typeof options.politicalIntelligenceHref === 'string'
      ? options.politicalIntelligenceHref
      : defaultPiHref;
  const isSafeHref =
    rawPiHref.length === 0 ||
    (rawPiHref.startsWith('/') && !rawPiHref.startsWith('//') && rawPiHref[1] !== '\\') ||
    rawPiHref.startsWith('./') ||
    rawPiHref.startsWith('../') ||
    rawPiHref.startsWith('https://') ||
    (!rawPiHref.includes(':') && !rawPiHref.startsWith('//') && !rawPiHref.startsWith('\\'));
  const piHref = isSafeHref ? rawPiHref : defaultPiHref;

  const cta = (extraClass: string, href: string, iconName: IconName, label: string): string =>
    `<a class="site-header__cta${extraClass ? ` ${extraClass}` : ''}" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${label}" title="${label}">${icon(iconName)}<span class="site-header__cta-label">${label}</span></a>`;

  const piCta =
    piHref.length > 0
      ? `<a class="site-header__cta site-header__cta--pi" href="${escapeHTML(piHref)}" aria-label="${piLabel}" title="${piLabel}">${icon('pi')}<span class="site-header__cta-label">${piLabel}</span></a>\n        `
      : '';

  return `<header class="site-header" role="banner">
    <div class="site-header__inner site-header__inner--stacked">
      <a href="${escapeHTML(homeHref)}" class="site-header__brand" aria-label="${safeTitle}">
        ${buildResponsiveBannerPicture({
          pathPrefix,
          pictureClass: 'site-header__logo-picture',
          imageClass: 'site-header__logo site-header__logo--banner',
          alt: siteTitle,
          sizes: '(max-width: 640px) 58vw, (max-width: 1200px) 15vw, 260px',
        })}
        <span class="site-header__brand-text">
          <span class="site-header__title">${safeTitle}</span>
          <span class="site-header__subtitle">${headerSubtitle}</span>
        </span>
      </a>
      <div class="site-header__actions">
        <div class="site-header__cta-group">
          ${piCta}${cta('site-header__cta--sponsor', 'https://github.com/sponsors/Hack23', 'heart', sponsorLabel)}
          ${cta('', 'https://www.hack23.com', 'sponsor', becomeSponsorLabel)}
          ${cta('site-header__cta--security', 'https://github.com/Hack23/euparliamentmonitor/blob/main/SECURITY.md', ICON_SECURITY, securityLabel)}
        </div>
        <div class="site-header__theme-toggle-slot">
          ${createThemeToggleButton(themeToggleLabel)}
        </div>
      </div>
      <nav class="site-header__langs" role="navigation" aria-label="${langSelectionLabel}">
        ${languageSwitcherHtml}
      </nav>
    </div>
  </header>`;
}
