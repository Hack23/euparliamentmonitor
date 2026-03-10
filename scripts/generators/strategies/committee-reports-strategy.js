// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { ArticleCategory } from '../../types/index.js';
import { COMMITTEE_REPORTS_TITLES, COMMITTEE_ANALYSIS_CONTENT_STRINGS, getLocalizedString, } from '../../constants/languages.js';
import { computeRollingDateRange, fetchCommitteeData, fetchEPFeedData, } from '../pipeline/fetch-stage.js';
import { FEATURED_COMMITTEES, isPlaceholderCommitteeData, PLACEHOLDER_CHAIR, PLACEHOLDER_MEMBERS, } from '../committee-helpers.js';
import { escapeHTML } from '../../utils/file-utils.js';
import { buildDeepAnalysisSection } from '../deep-analysis-content.js';
import { buildCommitteeAnalysis, buildCommitteeSwot, buildCommitteeDashboard, } from '../analysis-builders.js';
import { buildSwotSection } from '../swot-content.js';
import { buildDashboardSection } from '../dashboard-content.js';
/** European Parliament home-page URL used as source reference */
const EP_SOURCE_URL = 'https://www.europarl.europa.eu';
/** European Parliament display name for source titles and article lede */
const EP_DISPLAY_NAME = 'European Parliament';
/** Keywords shared by all Committee Reports articles */
const COMMITTEE_REPORTS_KEYWORDS = ['committee', 'EU Parliament', 'legislation'];
/** Source reference included in every committee reports article */
const COMMITTEE_REPORTS_SOURCES = [
    { title: EP_DISPLAY_NAME, url: EP_SOURCE_URL },
];
// ─── Feed data enrichment ─────────────────────────────────────────────────────
/**
 * Build an HTML section from adopted texts feed data.
 * Groups texts by thematic area and provides committee-relevant context.
 *
 * @param feedData - EP feed data with adopted texts
 * @param lang - Language code for localized strings
 * @returns HTML string, or empty string when no feed data
 */
function buildAdoptedTextsSection(feedData, lang) {
    if (!feedData?.adoptedTexts?.length)
        return '';
    const texts = feedData.adoptedTexts;
    // Map adopted texts to committee themes
    const envKeywords = ['environment', 'climate', 'health', 'food', 'medicinal', 'detergent', 'GMO', 'genetically', 'cancer'];
    const econKeywords = ['economic', 'financial', 'Central Bank', 'monetary', 'fiscal', '28th Regime'];
    const afetKeywords = ['foreign', 'security', 'defence', 'defense', 'sanctions', 'Magnitsky', 'Ukraine', 'aggression', 'peace'];
    const libeKeywords = ['civil', 'justice', 'rights', 'safe countries', 'safe third', 'asylum', 'migration'];
    const agriKeywords = ['agriculture', 'wine', 'agri-food', 'Mercosur', 'rural', 'farming'];
    const categorize = (title) => {
        const t = title.toLowerCase();
        if (envKeywords.some(k => t.includes(k.toLowerCase())))
            return 'ENVI';
        if (econKeywords.some(k => t.includes(k.toLowerCase())))
            return 'ECON';
        if (afetKeywords.some(k => t.includes(k.toLowerCase())))
            return 'AFET';
        if (libeKeywords.some(k => t.includes(k.toLowerCase())))
            return 'LIBE';
        if (agriKeywords.some(k => t.includes(k.toLowerCase())))
            return 'AGRI';
        return 'OTHER';
    };
    const grouped = {};
    for (const text of texts) {
        const cat = categorize(text.title);
        if (!grouped[cat])
            grouped[cat] = [];
        grouped[cat].push(text);
    }
    const committeeNames = {
        ENVI: 'Environment, Public Health and Food Safety',
        ECON: 'Economic and Monetary Affairs',
        AFET: 'Foreign Affairs',
        LIBE: 'Civil Liberties, Justice and Home Affairs',
        AGRI: 'Agriculture and Rural Development',
        OTHER: 'Cross-Committee and Plenary',
    };
    const sectionLabel = lang === 'en' ? 'Recent Adopted Texts by Committee Theme' : 'Recent Adopted Texts';
    const displayOrder = ['ENVI', 'ECON', 'AFET', 'LIBE', 'AGRI', 'OTHER'];
    const sections = displayOrder
        .filter(cat => grouped[cat]?.length)
        .map(cat => {
        const items = grouped[cat];
        const listItems = items
            .map(item => `<li class="adopted-text-item"><strong>${escapeHTML(item.title)}</strong> <span class="document-date">(${escapeHTML(item.date)})</span></li>`)
            .join('\n                ');
        return `
            <div class="committee-theme-group">
              <h4>${escapeHTML(committeeNames[cat] ?? cat)}</h4>
              <ul class="adopted-texts-list">${listItems}</ul>
            </div>`;
    })
        .join('');
    if (!sections)
        return '';
    return `
          <section class="adopted-texts-overview">
            <h3>${escapeHTML(sectionLabel)}</h3>
            <p>The European Parliament adopted ${texts.length} texts in recent sessions, spanning environmental, economic, security, civil liberties, and agricultural policy domains.</p>
            ${sections}
          </section>`;
}
// ─── HTML builders ────────────────────────────────────────────────────────────
/**
 * Build the HTML body for a committee reports article.
 *
 * @param committeeDataList - Pre-fetched committee data
 * @param lang - Language code for localized strings
 * @returns Article HTML body
 */
function buildCommitteeReportsHTML(committeeDataList, lang) {
    const s = getLocalizedString(COMMITTEE_ANALYSIS_CONTENT_STRINGS, lang);
    const committeeSections = committeeDataList
        .map((committee) => {
        // Render an unavailable notice for individual placeholder committee entries
        if (committee.chair === PLACEHOLDER_CHAIR &&
            committee.members === PLACEHOLDER_MEMBERS &&
            committee.documents.length === 0) {
            return `
      <section class="committee-card committee-card--unavailable">
        <h3 class="committee-name">${escapeHTML(committee.name)} (${escapeHTML(committee.abbreviation)})</h3>
        <p class="committee-metadata-unavailable">${escapeHTML(s.committeeMetadataUnavailable)}</p>
      </section>`;
        }
        const docItems = committee.documents.length > 0
            ? committee.documents
                .map((doc) => `
                <li class="document-item">
                  <span class="document-type">${escapeHTML(doc.type)}</span>
                  <span class="document-title">${escapeHTML(doc.title)}</span>
                  ${doc.date ? `<span class="document-date">${escapeHTML(doc.date)}</span>` : ''}
                </li>`)
                .join('')
            : `<li>${escapeHTML(s.noRecentDocs)}</li>`;
        const effectivenessHtml = committee.effectiveness
            ? `<p class="effectiveness-score">${escapeHTML(committee.effectiveness)}</p>`
            : '';
        return `
      <section class="committee-card">
        <h3 class="committee-name">${escapeHTML(committee.name)} (${escapeHTML(committee.abbreviation)})</h3>
        <div class="committee-meta">
          <span class="committee-chair">${escapeHTML(s.chairLabel)} ${escapeHTML(committee.chair)}</span>
          <span class="committee-members">${committee.members} ${escapeHTML(s.membersLabel)}</span>
        </div>
        <section class="recent-activity">
          <ul class="document-list">${docItems}</ul>
        </section>
        <section class="effectiveness-metrics">${effectivenessHtml}</section>
      </section>`;
    })
        .join('');
    return `
    <div class="article-content">
      <section class="committee-overview">
        <p class="lede">${escapeHTML(s.lede)}</p>
      </section>
      <section class="committee-reports">${committeeSections}</section>
    </div>`;
}
// ─── Strategy implementation ──────────────────────────────────────────────────
/**
 * Article strategy for {@link ArticleCategory.COMMITTEE_REPORTS}.
 * Fetches info, documents and effectiveness data for the featured committees
 * then renders an activity overview.
 */
export class CommitteeReportsStrategy {
    type = ArticleCategory.COMMITTEE_REPORTS;
    requiredMCPTools = [
        'get_committee_info',
        'search_documents',
        'analyze_legislative_effectiveness',
        'get_committee_documents_feed',
    ];
    /**
     * Fetch committee data for all featured committees in parallel.
     *
     * @param client - MCP client or null
     * @param date - ISO 8601 publication date
     * @returns Populated committee reports data payload
     */
    async fetchData(client, date) {
        const feedDateRange = computeRollingDateRange(date, 30, 'committee feed window');
        // Fetch individual committee data and EP feeds in parallel
        const [committeeDataRaw, feedData] = await Promise.all([
            Promise.all(FEATURED_COMMITTEES.map((abbr) => fetchCommitteeData(client, abbr).catch((error) => {
                const message = error instanceof Error ? error.message : String(error);
                console.error(`  ⚠️ Failed to fetch data for committee ${abbr}:`, message);
                return null;
            }))),
            fetchEPFeedData(client, 'one-month', feedDateRange),
        ]);
        const committeeDataList = committeeDataRaw.filter((committee) => committee !== null);
        return { date, committeeDataList, feedData };
    }
    /**
     * Build the committee reports HTML body.
     *
     * @param data - Committee reports data payload
     * @param lang - Language code for localized content
     * @returns Article HTML body
     */
    buildContent(data, lang) {
        const base = buildCommitteeReportsHTML(data.committeeDataList, lang);
        const feedSection = buildAdoptedTextsSection(data.feedData, lang);
        const analysis = buildCommitteeAnalysis(data.committeeDataList, data.date, lang);
        const deepSection = buildDeepAnalysisSection(analysis, lang);
        const swotData = buildCommitteeSwot(data.committeeDataList, lang);
        const swotSection = buildSwotSection(swotData, lang);
        const dashboardData = buildCommitteeDashboard(data.committeeDataList, lang);
        const dashboardSection = buildDashboardSection(dashboardData, lang);
        const injection = feedSection + deepSection + swotSection + dashboardSection;
        // Inject before the closing </div> of .article-content
        if (injection) {
            const closingTag = '</div>';
            const lastIdx = base.lastIndexOf(closingTag);
            if (lastIdx !== -1) {
                return base.slice(0, lastIdx) + injection + '\n' + base.slice(lastIdx);
            }
        }
        return base;
    }
    /**
     * Return language-specific metadata for the committee reports article.
     *
     * @param _data - Committee reports data payload (unused — metadata is data-independent)
     * @param lang - Target language code
     * @returns Localised metadata
     */
    getMetadata(_data, lang) {
        const committeeLabel = FEATURED_COMMITTEES.join(', ');
        const titleFn = getLocalizedString(COMMITTEE_REPORTS_TITLES, lang);
        const { title, subtitle } = titleFn(committeeLabel);
        return {
            title,
            subtitle,
            keywords: [...COMMITTEE_REPORTS_KEYWORDS],
            category: ArticleCategory.COMMITTEE_REPORTS,
            sources: COMMITTEE_REPORTS_SOURCES,
        };
    }
    /**
     * Skip generation when no real data is available.
     *
     * Skips when:
     * - All committee fetches failed (empty committeeDataList), or
     * - All fetched committee data is placeholder AND no feed data is available.
     * When EP feed data contains adopted texts or other items, the article can still
     * provide valuable content even if individual committee metadata is sparse.
     *
     * @param data - Committee reports data payload
     * @returns `true` when there is no usable data at all
     */
    shouldSkip(data) {
        const { committeeDataList, feedData } = data;
        if (committeeDataList.length === 0) {
            return true;
        }
        // If feed data has any items, generate even with placeholder committees
        if (feedData) {
            const feedItemCount = (feedData.adoptedTexts?.length ?? 0) +
                (feedData.committeeDocuments?.length ?? 0) +
                (feedData.plenaryDocuments?.length ?? 0) +
                (feedData.documents?.length ?? 0) +
                (feedData.procedures?.length ?? 0);
            if (feedItemCount > 0) {
                return false;
            }
        }
        return isPlaceholderCommitteeData(committeeDataList);
    }
}
/** Singleton instance for use by the strategy registry */
export const committeeReportsStrategy = new CommitteeReportsStrategy();
//# sourceMappingURL=committee-reports-strategy.js.map