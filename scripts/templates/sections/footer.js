// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Templates/Sections/Footer
 * @description Shared Hack23 AB site footer used by index, sitemap, news article,
 * and political-intelligence pages. Split out of `section-builders.ts`
 * (Refactor 8/8) so the footer markup, ISMS/security links, and the
 * footer-bottom build-info line can be unit-tested in isolation.
 */
import { escapeHTML } from '../../utils/file-utils.js';
import { ALL_LANGUAGES, LANGUAGE_FLAGS, LANGUAGE_NAMES, getLocalizedString, FOOTER_ABOUT_HEADING_LABELS, FOOTER_ABOUT_TEXT_LABELS, FOOTER_QUICK_LINKS_LABELS, FOOTER_BUILT_BY_LABELS, FOOTER_LANGUAGES_LABELS, FOOTER_HOME_LABELS, FOOTER_SITEMAP_LABELS, FOOTER_RSS_LABELS, FOOTER_GITHUB_REPO_LABELS, FOOTER_LICENSE_LABELS, FOOTER_EUROPARL_LABELS, FOOTER_LINKEDIN_LABELS, FOOTER_SECURITY_POLICY_LABELS, FOOTER_CONTACT_LABELS, FOOTER_DISCLAIMER_LABELS, FOOTER_REPORT_ISSUES_LABELS, FOOTER_ARTICLES_AVAILABLE_LABELS, FOOTER_POLITICAL_INTELLIGENCE_LABELS, BUILD_INFO_COMMIT_LABELS, BUILD_INFO_DEPLOYED_LABELS, FOOTER_NEWS_LABELS, FOOTER_DASHBOARD_LABELS, FOOTER_ANALYSIS_REPORTS_LABELS, FOOTER_API_DOCS_LABELS, FOOTER_COMPANY_TAGLINE_LABELS, FOOTER_TRUST_BADGES_ARIA_LABELS, } from '../../constants/languages.js';
import { APP_VERSION, BUILD_ID, BUILD_SHORT, BUILD_TIME } from '../../constants/config.js';
import { icon } from '../icons.js';
/** Icon name used for security/transparency links across the chrome. */
const ICON_SECURITY = 'shield-star';
/**
 * Build the language grid links used inside the footer Languages section.
 *
 * @param currentLang - The currently active language code.
 * @param pathPrefix - Path prefix for index page hrefs ('' or '../').
 * @returns HTML string of anchor elements.
 */
function buildFooterLangGrid(currentLang, pathPrefix) {
    return ALL_LANGUAGES.map((code) => {
        const flag = getLocalizedString(LANGUAGE_FLAGS, code);
        const safeName = escapeHTML(getLocalizedString(LANGUAGE_NAMES, code));
        const href = code === 'en' ? `${pathPrefix}index.html` : `${pathPrefix}index-${code}.html`;
        const active = code === currentLang ? ' class="active"' : '';
        const current = code === currentLang ? ' aria-current="page"' : '';
        return `<a href="${escapeHTML(href)}"${active} hreflang="${code}" lang="${code}" title="${safeName}" aria-label="${safeName}"${current}>${flag} ${code.toUpperCase()}</a>`;
    }).join('\n            ');
}
/**
 * Build the shared site footer HTML used by both article pages and index pages.
 *
 * Renders four sections (About, Quick Links, Built by Hack23, Languages) plus a
 * footer-bottom bar with copyright, version, and a localized disclaimer.
 *
 * @param options - {@link SiteFooterOptions} controlling lang, pathPrefix, and articleCount.
 * @returns HTML string for `<footer class="site-footer">…</footer>`.
 */
export function buildSiteFooter(options) {
    const { lang, pathPrefix, articleCount } = options;
    const year = new Date().getFullYear();
    const aboutHeading = escapeHTML(getLocalizedString(FOOTER_ABOUT_HEADING_LABELS, lang));
    const aboutText = escapeHTML(getLocalizedString(FOOTER_ABOUT_TEXT_LABELS, lang));
    const quickLinksHeading = escapeHTML(getLocalizedString(FOOTER_QUICK_LINKS_LABELS, lang));
    const builtByHeading = escapeHTML(getLocalizedString(FOOTER_BUILT_BY_LABELS, lang));
    const languagesHeading = escapeHTML(getLocalizedString(FOOTER_LANGUAGES_LABELS, lang));
    const homeLabel = escapeHTML(getLocalizedString(FOOTER_HOME_LABELS, lang));
    const sitemapLabel = escapeHTML(getLocalizedString(FOOTER_SITEMAP_LABELS, lang));
    const rssLabel = escapeHTML(getLocalizedString(FOOTER_RSS_LABELS, lang));
    const politicalIntelligenceLabel = escapeHTML(getLocalizedString(FOOTER_POLITICAL_INTELLIGENCE_LABELS, lang));
    const githubLabel = escapeHTML(getLocalizedString(FOOTER_GITHUB_REPO_LABELS, lang));
    const licenseLabel = escapeHTML(getLocalizedString(FOOTER_LICENSE_LABELS, lang));
    const europarlLabel = escapeHTML(getLocalizedString(FOOTER_EUROPARL_LABELS, lang));
    const linkedinLabel = escapeHTML(getLocalizedString(FOOTER_LINKEDIN_LABELS, lang));
    const securityLabel = getLocalizedString(FOOTER_SECURITY_POLICY_LABELS, lang);
    const contactLabel = escapeHTML(getLocalizedString(FOOTER_CONTACT_LABELS, lang));
    const disclaimerText = escapeHTML(getLocalizedString(FOOTER_DISCLAIMER_LABELS, lang));
    const reportIssuesLabel = escapeHTML(getLocalizedString(FOOTER_REPORT_ISSUES_LABELS, lang));
    const newsLabel = escapeHTML(getLocalizedString(FOOTER_NEWS_LABELS, lang));
    const dashboardLabel = escapeHTML(getLocalizedString(FOOTER_DASHBOARD_LABELS, lang));
    const analysisReportsLabel = escapeHTML(getLocalizedString(FOOTER_ANALYSIS_REPORTS_LABELS, lang));
    const apiDocsLabel = escapeHTML(getLocalizedString(FOOTER_API_DOCS_LABELS, lang));
    const companyTagline = escapeHTML(getLocalizedString(FOOTER_COMPANY_TAGLINE_LABELS, lang));
    const homeHref = `${pathPrefix}${lang === 'en' ? 'index.html' : `index-${lang}.html`}`;
    const sitemapHref = `${pathPrefix}${lang === 'en' ? 'sitemap.html' : `sitemap_${lang}.html`}`;
    const rssHref = `${pathPrefix}${lang === 'en' ? 'rss.xml' : `rss_${lang}.xml`}`;
    const politicalIntelligenceHref = `${pathPrefix}${lang === 'en' ? 'political-intelligence.html' : `political-intelligence_${lang}.html`}`;
    const apiDocsHref = `${pathPrefix}docs/api/`;
    const analysisDocsHref = `${pathPrefix}docs/`;
    const articlesLine = typeof articleCount === 'number'
        ? `\n        <p class="footer-stats">${escapeHTML(getLocalizedString(FOOTER_ARTICLES_AVAILABLE_LABELS, lang).replace('{count}', String(articleCount)))}</p>`
        : '';
    const langGrid = buildFooterLangGrid(lang, pathPrefix);
    const buildLabel = escapeHTML(getLocalizedString(BUILD_INFO_COMMIT_LABELS, lang));
    const deployedLabel = escapeHTML(getLocalizedString(BUILD_INFO_DEPLOYED_LABELS, lang));
    const safeBuildId = escapeHTML(BUILD_ID);
    const safeBuildShort = escapeHTML(BUILD_SHORT);
    const safeBuildTime = escapeHTML(BUILD_TIME);
    const buildLine = `v${escapeHTML(APP_VERSION)} · ` +
        `<a href="https://github.com/Hack23/euparliamentmonitor/commit/${safeBuildId}" ` +
        `class="footer-build" title="${buildLabel} ${safeBuildShort}" target="_blank" rel="noopener noreferrer">` +
        `<code>${safeBuildShort}</code></a> · ` +
        `<span class="footer-build-deployed">${deployedLabel}</span> ` +
        `<time class="footer-build-time" datetime="${safeBuildTime}" data-relative-time>${safeBuildTime}</time>`;
    return `<footer class="site-footer" role="contentinfo">
    <div class="footer-content">
      <div class="footer-section">
        <h3 class="footer-section__heading">${aboutHeading}</h3>
        <p>${aboutText}</p>${articlesLine}
        <p class="footer-company-summary">${companyTagline}</p>
      </div>
      <div class="footer-section">
        <h3 class="footer-section__heading">${quickLinksHeading}</h3>
        <ul>
          <li><a href="${homeHref}">${icon('home')}<span>${homeLabel}</span></a></li>
          <li><a href="${homeHref}#main">${icon('news')}<span>${newsLabel}</span></a></li>
          <li><a href="${analysisDocsHref}">${icon('analysis')}<span>${analysisReportsLabel}</span></a></li>
          <li><a href="${pathPrefix}docs/index.html">${icon('dashboard')}<span>${dashboardLabel}</span></a></li>
          <li><a href="${politicalIntelligenceHref}">${icon('pi')}<span>${politicalIntelligenceLabel}</span></a></li>
          <li><a href="${sitemapHref}">${icon('sitemap')}<span>${sitemapLabel}</span></a></li>
          <li><a href="${apiDocsHref}">${icon('book')}<span>${apiDocsLabel}</span></a></li>
          <li><a href="${rssHref}">${icon('rss')}<span>${rssLabel}</span></a></li>
          <li><a href="https://hack23.com/euparliamentmonitor.html" target="_blank" rel="noopener noreferrer">${icon('external')}<span>EU Parliament Monitor by Hack23</span></a></li>
          <li><a href="https://hack23.com/euparliamentmonitor-features.html" target="_blank" rel="noopener noreferrer">${icon('external')}<span>EU Parliament Monitor Features</span></a></li>
          <li><a href="https://hack23.com/cia-features.html" target="_blank" rel="noopener noreferrer">${icon('external')}<span>CIA Platform</span></a></li>
          <li><a href="https://www.riksdagen.se/" target="_blank" rel="noopener noreferrer">${icon('external')}<span>Sveriges Riksdag</span></a></li>
          <li><a href="https://github.com/Hack23/euparliamentmonitor" target="_blank" rel="noopener noreferrer">${icon('github')}<span>${githubLabel}</span></a></li>
          <li><a href="https://github.com/Hack23/euparliamentmonitor/issues" target="_blank" rel="noopener noreferrer">${icon('external')}<span>${reportIssuesLabel}</span></a></li>
          <li><a href="https://github.com/Hack23/euparliamentmonitor/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">${icon('book')}<span>${licenseLabel}</span></a></li>
          <li><a href="https://www.europarl.europa.eu/" target="_blank" rel="noopener noreferrer">${icon('external')}<span>${europarlLabel}</span></a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h3 class="footer-section__heading">${builtByHeading}</h3>
        <div class="footer-badges" aria-label="${escapeHTML(getLocalizedString(FOOTER_TRUST_BADGES_ARIA_LABELS, lang))}">
          <a href="https://www.npmjs.com/package/euparliamentmonitor" aria-label="npm package version"><img src="https://img.shields.io/npm/v/euparliamentmonitor.svg" alt="npm package version"></a>
          <a href="https://scorecard.dev/viewer/?uri=github.com/Hack23/euparliamentmonitor" aria-label="OpenSSF Scorecard"><img src="https://api.securityscorecards.dev/projects/github.com/Hack23/euparliamentmonitor/badge" alt="OpenSSF Scorecard"></a>
          <a href="https://www.bestpractices.dev/projects/12068" aria-label="OpenSSF Best Practices"><img src="https://www.bestpractices.dev/projects/12068/badge" alt="OpenSSF Best Practices"></a>
          <a href="https://github.com/Hack23/euparliamentmonitor/attestations" aria-label="SLSA Level 3"><img src="https://slsa.dev/images/gh-badge-level3.svg" alt="SLSA Level 3"></a>
        </div>
        <ul>
          <li><a href="https://hack23.com" target="_blank" rel="noopener noreferrer">${icon('external')}<span>Hack23.com</span></a></li>
          <li><a href="https://github.com/sponsors/Hack23" target="_blank" rel="noopener noreferrer">${icon('heart')}<span>Sponsor Hack23 on GitHub</span></a></li>
          <li><a href="https://www.linkedin.com/company/hack23" target="_blank" rel="noopener noreferrer">${icon('linkedin')}<span>${linkedinLabel}</span></a></li>
          <li><a href="https://github.com/Hack23/cia" target="_blank" rel="noopener noreferrer">${icon('github')}<span>Citizen Intelligence Agency</span></a></li>
          <li><a href="https://github.com/Hack23/riksdagsmonitor" target="_blank" rel="noopener noreferrer">${icon('github')}<span>Riksdagsmonitor</span></a></li>
          <li><a href="https://github.com/Hack23/European-Parliament-MCP-Server" target="_blank" rel="noopener noreferrer">${icon('github')}<span>European Parliament MCP Server</span></a></li>
          <li><a href="https://github.com/Hack23/cia-compliance-manager" target="_blank" rel="noopener noreferrer">${icon('github')}<span>CIA Compliance Manager</span></a></li>
          <li><a href="https://github.com/Hack23/homepage" target="_blank" rel="noopener noreferrer">${icon('github')}<span>Hack23 Homepage</span></a></li>
          <li><a href="https://github.com/Hack23/blacktrigram" target="_blank" rel="noopener noreferrer">${icon('github')}<span>Black Trigram</span></a></li>
          <li><a href="https://github.com/Hack23/ISMS-PUBLIC" target="_blank" rel="noopener noreferrer">${icon(ICON_SECURITY)}<span>Public ISMS</span></a></li>
          <li><a href="https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md" target="_blank" rel="noopener noreferrer">${icon(ICON_SECURITY)}<span>${securityLabel}</span></a></li>
          <li><a href="https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md" target="_blank" rel="noopener noreferrer">${icon(ICON_SECURITY)}<span>Secure Development Policy</span></a></li>
          <li><a href="https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md" target="_blank" rel="noopener noreferrer">${icon('book')}<span>Open Source Policy</span></a></li>
          <li><a href="https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md" target="_blank" rel="noopener noreferrer">${icon('book')}<span>AI Policy</span></a></li>
          <li><a href="https://github.com/Hack23/ISMS-PUBLIC/blob/main/Access_Control_Policy.md" target="_blank" rel="noopener noreferrer">${icon(ICON_SECURITY)}<span>Access Control Policy</span></a></li>
          <li><a href="https://github.com/Hack23/ISMS-PUBLIC/blob/main/Cryptography_Policy.md" target="_blank" rel="noopener noreferrer">${icon(ICON_SECURITY)}<span>Cryptography Policy</span></a></li>
          <li><a href="https://github.com/Hack23/euparliamentmonitor/blob/main/SECURITY.md" target="_blank" rel="noopener noreferrer">${icon(ICON_SECURITY)}<span>Security Policy</span></a></li>
          <li><a href="https://hack23.com/privacy.html" target="_blank" rel="noopener noreferrer">${icon(ICON_SECURITY)}<span>Privacy Policy</span></a></li>
          <li><a href="mailto:james@hack23.com">${icon('mail')}<span>${contactLabel}</span></a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h3 class="footer-section__heading">${icon('lang')} ${languagesHeading}</h3>
        <div class="language-grid">
          ${langGrid}
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2008-${year} <a href="https://hack23.com" target="_blank" rel="noopener noreferrer">Hack23 AB</a> (Org.nr 5595347807) | Gothenburg, Sweden | ${buildLine}</p>
      <p class="footer-disclaimer"><span aria-hidden="true">⚠️</span> ${disclaimerText} <a href="https://github.com/Hack23/euparliamentmonitor/issues" target="_blank" rel="noopener noreferrer">${reportIssuesLabel}</a>.</p>
    </div>
  </footer>`;
}
//# sourceMappingURL=footer.js.map