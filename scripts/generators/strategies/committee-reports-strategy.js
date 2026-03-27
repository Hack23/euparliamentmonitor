// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { ArticleCategory } from '../../types/index.js';
import {
  COMMITTEE_REPORTS_TITLES,
  COMMITTEE_ANALYSIS_CONTENT_STRINGS,
  getLocalizedString,
} from '../../constants/languages.js';
import {
  computeRollingDateRange,
  fetchCommitteeData,
  fetchEPFeedData,
} from '../pipeline/fetch-stage.js';
import {
  FEATURED_COMMITTEES,
  isPlaceholderCommitteeData,
  PLACEHOLDER_CHAIR,
  PLACEHOLDER_MEMBERS,
} from '../committee-helpers.js';
import { escapeHTML } from '../../utils/file-utils.js';
import { buildDeepAnalysisSection } from '../deep-analysis-content.js';
import {
  buildCommitteeAnalysis,
  buildCommitteeSwot,
  buildCommitteeDashboard,
  buildCommitteeMindmap,
} from '../analysis-builders.js';
import { buildSwotSection } from '../swot-content.js';
import { buildDashboardSection } from '../dashboard-content.js';
import { buildIntelligenceMindmapSection } from '../mindmap-content.js';
import { pl } from '../../utils/metadata-utils.js';
/** European Parliament home-page URL used as source reference */
const EP_SOURCE_URL = 'https://www.europarl.europa.eu';
/** European Parliament display name for source titles and article lede */
const EP_DISPLAY_NAME = 'European Parliament';
/** Base keywords shared by all Committee Reports articles */
const COMMITTEE_REPORTS_BASE_KEYWORDS = ['committee', 'EU Parliament', 'legislation'];
/** Source reference included in every committee reports article */
const COMMITTEE_REPORTS_SOURCES = [{ title: EP_DISPLAY_NAME, url: EP_SOURCE_URL }];
/**
 * Extract content-aware keywords from committee data and feed data.
 *
 * Includes committee abbreviations, names, document types, and adopted-text
 * themes for richer SEO coverage.
 *
 * @param committeeDataList - Fetched committee data
 * @param feedData - EP feed data (may be undefined)
 * @returns Deduplicated keyword array
 */
function buildCommitteeKeywords(committeeDataList, feedData) {
  const keywords = [...COMMITTEE_REPORTS_BASE_KEYWORDS];
  // Add committee abbreviations and names
  for (const c of committeeDataList) {
    if (c.abbreviation) keywords.push(c.abbreviation);
    if (c.name) keywords.push(c.name);
  }
  // Add adopted text themes from feed
  if (feedData?.adoptedTexts) {
    for (const text of feedData.adoptedTexts.slice(0, 5)) {
      if (text.title) {
        const theme = categorizeAdoptedText(text.title);
        if (theme !== 'OTHER') keywords.push(theme);
      }
    }
  }
  return [...new Set(keywords)];
}
/**
 * Build a content-aware description from committee data.
 * Summarises the number of active committees, document counts, and
 * effectiveness highlights when available.
 *
 * @param committeeDataList - Fetched committee data
 * @param feedData - EP feed data (may be undefined)
 * @returns SEO-friendly description (≤ 200 chars)
 */
function buildCommitteeDescription(committeeDataList, feedData) {
  const activeCount = committeeDataList.filter((c) => c.chair !== PLACEHOLDER_CHAIR).length;
  const totalDocs = committeeDataList.reduce((sum, c) => sum + c.documents.length, 0);
  const adoptedCount = feedData?.adoptedTexts?.length ?? 0;
  const parts = [];
  if (activeCount > 0) parts.push(`${pl(activeCount, 'committee', 'committees')} reporting`);
  if (totalDocs > 0) parts.push(pl(totalDocs, 'recent document', 'recent documents'));
  if (adoptedCount > 0) parts.push(pl(adoptedCount, 'adopted text', 'adopted texts'));
  const abbrs = committeeDataList
    .filter((c) => c.chair !== PLACEHOLDER_CHAIR)
    .map((c) => c.abbreviation)
    .join(', ');
  if (abbrs) parts.push(`covering ${abbrs}`);
  if (parts.length === 0) {
    return 'Analysis of recent legislative output, effectiveness metrics, and key committee activities';
  }
  const desc = `EP committee activity: ${parts.join('; ')}.`;
  return desc.length > 200 ? desc.slice(0, 197) + '...' : desc;
}
/**
 * Build a content-aware title suffix from committee data counts.
 *
 * @param committeeDataList - Fetched committee data
 * @param feedData - EP feed data (may be undefined)
 * @returns Short suffix for the title, or empty string
 */
function buildCommitteeTitleSuffix(committeeDataList, feedData) {
  const activeCount = committeeDataList.filter((c) => c.chair !== PLACEHOLDER_CHAIR).length;
  const totalDocs = committeeDataList.reduce((sum, c) => sum + c.documents.length, 0);
  const adoptedCount = feedData?.adoptedTexts?.length ?? 0;
  const parts = [];
  if (totalDocs > 0) parts.push(pl(totalDocs, 'Document', 'Documents'));
  if (adoptedCount > 0) parts.push(pl(adoptedCount, 'Adopted Text', 'Adopted Texts'));
  if (activeCount > 0 && parts.length === 0) {
    parts.push(pl(activeCount, 'Active Committee', 'Active Committees'));
  }
  return parts.join(', ');
}
// Keyword lists are pre-normalized to lowercase so that each call to
// categorizeAdoptedText only needs to lowercase the title once.
//
// LIBE is checked before AFET so that human-rights and human-trafficking
// titles are correctly classified under civil liberties even when the title
// also mentions a country (e.g. "Ukraine") that would match AFET.
// Both LIBE and AFET are checked before AGRI so that person-name false
// positives (e.g. "Bobi Wine" matching the agricultural keyword "wine")
// are avoided.
// AGRI is then checked before ENVI so that titles containing 'agri-food' are
// not incorrectly captured by ENVI's broader 'food' keyword.
/** Lowercase keywords that map an adopted-text title to the AFET theme group */
export const AFET_KEYWORDS = [
  'foreign affairs',
  'foreign policy',
  'security policy',
  'security cooperation',
  'defence',
  'defense',
  'sanctions',
  'magnitsky',
  'ukraine',
  'aggression',
  'peace agreement',
  'peace process',
  'peace mission',
  'peace operation',
  'post-election',
  'opposition leader',
  'threats against',
];
/** Lowercase keywords that map an adopted-text title to the LIBE theme group */
export const LIBE_KEYWORDS = [
  'civil liberties',
  'civil rights',
  'justice and home affairs',
  'justice cooperation',
  'criminal justice',
  'fundamental rights',
  'human rights',
  'human trafficking',
  "workers' rights",
  'safe countries',
  'safe third',
  'asylum',
  'migration',
];
/** Lowercase keywords that map an adopted-text title to the AGRI theme group */
export const AGRI_KEYWORDS = [
  'agriculture',
  'wine',
  'agri-food',
  'mercosur',
  'rural',
  'farming',
  'fisheries',
];
/** Lowercase keywords that map an adopted-text title to the ENVI theme group */
export const ENVI_KEYWORDS = [
  'environment',
  'climate',
  'emission',
  'health',
  'food',
  'medicinal',
  'detergent',
  'gmo',
  'genetically',
  'cancer',
];
/** Lowercase keywords that map an adopted-text title to the ECON theme group */
export const ECON_KEYWORDS = [
  'economic',
  'financial',
  'central bank',
  'monetary',
  'fiscal',
  '28th regime',
];
/**
 * Categorize an adopted-text title into a committee theme group.
 *
 * LIBE is tested before AFET so that human-rights and human-trafficking
 * titles are classified under civil liberties even when they also mention
 * an AFET country keyword (e.g. "Ukraine"). Both are tested before AGRI
 * to avoid person-name false positives (e.g. "Bobi Wine").
 *
 * @param title - Adopted text title to categorize
 * @returns Committee theme key — one of `'ENVI'` | `'ECON'` | `'AFET'` | `'LIBE'` | `'AGRI'` | `'OTHER'`
 */
export function categorizeAdoptedText(title) {
  const t = title.toLowerCase();
  if (LIBE_KEYWORDS.some((k) => t.includes(k))) return 'LIBE';
  if (AFET_KEYWORDS.some((k) => t.includes(k))) return 'AFET';
  if (AGRI_KEYWORDS.some((k) => t.includes(k))) return 'AGRI';
  if (ENVI_KEYWORDS.some((k) => t.includes(k))) return 'ENVI';
  if (ECON_KEYWORDS.some((k) => t.includes(k))) return 'ECON';
  return 'OTHER';
}
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
  if (!feedData?.adoptedTexts?.length) return '';
  const texts = feedData.adoptedTexts;
  const s = getLocalizedString(COMMITTEE_ANALYSIS_CONTENT_STRINGS, lang);
  const grouped = {};
  for (const text of texts) {
    const cat = categorizeAdoptedText(text.title);
    const bucket = grouped[cat] ?? [];
    bucket.push(text);
    grouped[cat] = bucket;
  }
  const committeeNames = {
    ENVI: s.committeeNameENVI,
    ECON: s.committeeNameECON,
    AFET: s.committeeNameAFET,
    LIBE: s.committeeNameLIBE,
    AGRI: s.committeeNameAGRI,
    OTHER: s.committeeNameOTHER,
  };
  const sectionLabel = s.adoptedTextsSectionHeading;
  const summary =
    texts.length === 1
      ? s.adoptedTextsSummarySingular
      : s.adoptedTextsSummary.replace('{count}', String(texts.length));
  const displayOrder = ['ENVI', 'ECON', 'AFET', 'LIBE', 'AGRI', 'OTHER'];
  const sections = displayOrder
    .filter((cat) => grouped[cat]?.length)
    .map((cat) => {
      const items = grouped[cat];
      const listItems = items
        .map(
          (item) =>
            `<li class="adopted-text-item"><strong>${escapeHTML(item.title)}</strong> <span class="document-date">(${escapeHTML(item.date)})</span></li>`
        )
        .join('\n                ');
      return `
            <div class="committee-theme-group">
              <h4>${escapeHTML(committeeNames[cat] ?? cat)}</h4>
              <ul class="adopted-texts-list">${listItems}</ul>
            </div>`;
    })
    .join('');
  if (!sections) return '';
  return `
          <section class="adopted-texts-overview">
            <h3>${escapeHTML(sectionLabel)}</h3>
            <p>${escapeHTML(summary)}</p>
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
      if (
        committee.chair === PLACEHOLDER_CHAIR &&
        committee.members === PLACEHOLDER_MEMBERS &&
        committee.documents.length === 0
      ) {
        return `
      <section class="committee-card committee-card--unavailable">
        <h3 class="committee-name">${escapeHTML(committee.name)} (${escapeHTML(committee.abbreviation)})</h3>
        <p class="committee-metadata-unavailable">${escapeHTML(s.committeeMetadataUnavailable)}</p>
      </section>`;
      }
      const docItems =
        committee.documents.length > 0
          ? committee.documents
              .map(
                (doc) => `
                <li class="document-item">
                  <span class="document-type">${escapeHTML(doc.type)}</span>
                  <span class="document-title">${escapeHTML(doc.title)}</span>
                  ${doc.date ? `<span class="document-date">${escapeHTML(doc.date)}</span>` : ''}
                </li>`
              )
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
      Promise.all(
        FEATURED_COMMITTEES.map((abbr) =>
          fetchCommitteeData(client, abbr).catch((error) => {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`  ⚠️ Failed to fetch data for committee ${abbr}:`, message);
            return null;
          })
        )
      ),
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
    const mindmapData = buildCommitteeMindmap(data.committeeDataList, lang);
    const mindmapSection = buildIntelligenceMindmapSection(mindmapData, lang);
    const swotData = buildCommitteeSwot(data.committeeDataList, lang);
    const swotSection = buildSwotSection(swotData, lang);
    const dashboardData = buildCommitteeDashboard(data.committeeDataList, lang);
    const dashboardSection = buildDashboardSection(dashboardData, lang);
    const injection = feedSection + deepSection + mindmapSection + swotSection + dashboardSection;
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
   * @param data - Committee reports data payload
   * @param lang - Target language code
   * @returns Localised metadata
   */
  getMetadata(data, lang) {
    const committeeLabel = FEATURED_COMMITTEES.join(', ');
    const titleFn = getLocalizedString(COMMITTEE_REPORTS_TITLES, lang);
    const { title: baseTitle, subtitle: baseSubtitle } = titleFn(committeeLabel);
    const suffix =
      lang === 'en' ? buildCommitteeTitleSuffix(data.committeeDataList, data.feedData) : '';
    const title = suffix ? `${baseTitle} — ${suffix}` : baseTitle;
    const subtitle =
      lang === 'en'
        ? buildCommitteeDescription(data.committeeDataList, data.feedData) || baseSubtitle
        : baseSubtitle;
    return {
      title,
      subtitle,
      keywords: buildCommitteeKeywords(data.committeeDataList, data.feedData),
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
      const feedItemCount =
        (feedData.adoptedTexts?.length ?? 0) +
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
