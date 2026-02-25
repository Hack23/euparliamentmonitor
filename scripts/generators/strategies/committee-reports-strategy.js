// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { ArticleCategory } from '../../types/index.js';
import { COMMITTEE_REPORTS_TITLES, getLocalizedString } from '../../constants/languages.js';
import { fetchCommitteeData } from '../pipeline/fetch-stage.js';
import { FEATURED_COMMITTEES } from '../committee-helpers.js';
import { escapeHTML } from '../../utils/file-utils.js';
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
// ─── HTML builders ────────────────────────────────────────────────────────────
/**
 * Build the HTML body for a committee reports article.
 *
 * @param committeeDataList - Pre-fetched committee data
 * @returns Article HTML body
 */
function buildCommitteeReportsHTML(committeeDataList) {
    const committeeSections = committeeDataList
        .map((committee) => {
        const docItems = committee.documents.length > 0
            ? committee.documents
                .map((doc) => `
                <li class="document-item">
                  <span class="document-type">${escapeHTML(doc.type)}</span>
                  <span class="document-title">${escapeHTML(doc.title)}</span>
                  ${doc.date ? `<span class="document-date">${escapeHTML(doc.date)}</span>` : ''}
                </li>`)
                .join('')
            : '<li>No recent documents available</li>';
        const effectivenessHtml = committee.effectiveness
            ? `<p class="effectiveness-score">${escapeHTML(committee.effectiveness)}</p>`
            : '';
        return `
      <section class="committee-card">
        <h3 class="committee-name">${escapeHTML(committee.name)} (${escapeHTML(committee.abbreviation)})</h3>
        <div class="committee-meta">
          <span class="committee-chair">Chair: ${escapeHTML(committee.chair)}</span>
          <span class="committee-members">Members: ${committee.members}</span>
        </div>
        <section class="recent-activity">
          <ul class="document-list">${docItems}</ul>
        </section>
        <section class="effectiveness-metrics">${effectivenessHtml}</section>
      </section>`;
    })
        .join('');
    return `
    <section class="committee-overview">
      <p class="lede">${escapeHTML(EP_DISPLAY_NAME)} committee activity and legislative effectiveness analysis.</p>
    </section>
    <section class="committee-reports">${committeeSections}</section>`;
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
    ];
    /**
     * Fetch committee data for all featured committees in parallel.
     *
     * @param client - MCP client or null
     * @param date - ISO 8601 publication date
     * @returns Populated committee reports data payload
     */
    async fetchData(client, date) {
        const committeeDataRaw = await Promise.all(FEATURED_COMMITTEES.map((abbr) => fetchCommitteeData(client, abbr).catch((error) => {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`  ⚠️ Failed to fetch data for committee ${abbr}:`, message);
            return null;
        })));
        const committeeDataList = committeeDataRaw.filter((committee) => committee !== null);
        return { date, committeeDataList };
    }
    /**
     * Build the committee reports HTML body.
     *
     * @param data - Committee reports data payload
     * @param _lang - Language code (unused — content is language-independent)
     * @returns Article HTML body
     */
    buildContent(data, _lang) {
        const crData = data;
        return buildCommitteeReportsHTML(crData.committeeDataList);
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
}
/** Singleton instance for use by the strategy registry */
export const committeeReportsStrategy = new CommitteeReportsStrategy();
//# sourceMappingURL=committee-reports-strategy.js.map