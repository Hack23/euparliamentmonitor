// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/MotionsContent
 * @description Pure functions for building motions article HTML and
 * generating placeholder/fallback data when MCP is unavailable.
 */

import { escapeHTML } from '../utils/file-utils.js';
import { getLocalizedString, EDITORIAL_STRINGS, MOTIONS_STRINGS } from '../constants/languages.js';
import type {
  VotingRecord,
  VotingPattern,
  VotingAnomaly,
  MotionsQuestion,
  CoalitionIntelligence,
  AdoptedTextFeedItem,
} from '../types/index.js';

/** Marker string used in all fallback/placeholder data to indicate MCP data is unavailable */
export const PLACEHOLDER_MARKER = 'DATA_UNAVAILABLE (placeholder)';

/**
 * Get fallback data for motions article
 *
 * @param dateStr - Current date string
 * @param dateFromStr - Start date string
 * @returns Object with all fallback data arrays
 */
export function getMotionsFallbackData(
  dateStr: string,
  dateFromStr: string
): {
  votingRecords: VotingRecord[];
  votingPatterns: VotingPattern[];
  anomalies: VotingAnomaly[];
  questions: MotionsQuestion[];
} {
  return {
    votingRecords: [
      {
        title: 'Example motion (placeholder – data unavailable)',
        date: dateStr,
        result: PLACEHOLDER_MARKER,
        votes: { for: 0, against: 0, abstain: 0 },
      },
      {
        title: 'Example amendment (placeholder – data unavailable)',
        date: dateFromStr,
        result: PLACEHOLDER_MARKER,
        votes: { for: 0, against: 0, abstain: 0 },
      },
    ],
    votingPatterns: [
      {
        group: 'Example group A (placeholder)',
        cohesion: 0.0,
        participation: 0.0,
      },
      {
        group: 'Example group B (placeholder)',
        cohesion: 0.0,
        participation: 0.0,
      },
    ],
    anomalies: [
      {
        type: 'Placeholder example',
        description:
          'No real anomaly data available from MCP – this is illustrative placeholder content only.',
        severity: 'LOW',
      },
    ],
    questions: [
      {
        author: 'Placeholder MEP 1',
        topic: 'Placeholder parliamentary question on energy security (MCP data unavailable)',
        date: dateStr,
        status: PLACEHOLDER_MARKER,
      },
      {
        author: 'Placeholder MEP 2',
        topic: 'Placeholder parliamentary question on migration policy (MCP data unavailable)',
        date: dateFromStr,
        status: PLACEHOLDER_MARKER,
      },
    ],
  };
}

/**
 * Returns true when there is no real roll-call data: either the records
 * array is empty or every voting record carries the placeholder marker,
 * indicating no real roll-call data was retrieved from MCP.
 *
 * @param records - Voting records to test
 * @returns `true` if the array is empty or all records are placeholder-only data
 */
function isPlaceholderVotingRecords(records: readonly VotingRecord[]): boolean {
  return records.length === 0 || records.every((r) => r.result === PLACEHOLDER_MARKER);
}

/**
 * Returns true when there is no real voting pattern data: either the patterns
 * array is empty or every voting pattern is placeholder/fallback data
 * (groups whose name contains the word "placeholder" — case-insensitive).
 *
 * @param patterns - Voting patterns to test
 * @returns `true` if the array is empty or all patterns are placeholder-only data
 */
function isPlaceholderVotingPatterns(patterns: readonly VotingPattern[]): boolean {
  return patterns.length === 0 || patterns.every((p) => /placeholder/i.test(p.group));
}

/**
 * Returns true when there is no real anomaly data: either the array is empty
 * or every anomaly type contains the word "placeholder" (case-insensitive).
 *
 * @param anomalies - Anomalies to test
 * @returns `true` if the array is empty or all anomalies are placeholder-only data
 */
function isPlaceholderAnomalies(anomalies: readonly VotingAnomaly[]): boolean {
  return anomalies.length === 0 || anomalies.every((a) => /placeholder/i.test(a.type));
}

/**
 * Returns true when there is no real questions data: either the array is empty
 * or every question carries the placeholder marker in its status field.
 *
 * @param questions - Parliamentary questions to test
 * @returns `true` if the array is empty or all questions are placeholder-only data
 */
function isPlaceholderQuestions(questions: readonly MotionsQuestion[]): boolean {
  return questions.length === 0 || questions.every((q) => q.status === PLACEHOLDER_MARKER);
}

/**
 * Generate HTML content for motions article
 *
 * @param dateFromStr - Start date
 * @param dateStr - End date
 * @param votingRecords - Voting records data
 * @param votingPatterns - Voting patterns data
 * @param anomalies - Anomalies data
 * @param questions - Questions data
 * @param lang - Language code for editorial strings (default: 'en')
 * @returns HTML content string
 */
export function generateMotionsContent(
  dateFromStr: string,
  dateStr: string,
  votingRecords: VotingRecord[],
  votingPatterns: VotingPattern[],
  anomalies: VotingAnomaly[],
  questions: MotionsQuestion[],
  lang = 'en'
): string {
  const editorial = getLocalizedString(EDITORIAL_STRINGS, lang);
  const strings = getLocalizedString(MOTIONS_STRINGS, lang);
  const ledeAnalysisRaw = strings.ledeAnalysis
    .replace('{DATE_FROM}', dateFromStr)
    .replace('{DATE_TO}', dateStr);
  const showVotingResults = !isPlaceholderVotingRecords(votingRecords);
  const showVotingPatterns = !isPlaceholderVotingPatterns(votingPatterns);
  const showAnomalies = !isPlaceholderAnomalies(anomalies);
  const showQuestions = !isPlaceholderQuestions(questions);
  return `
    <div class="article-content">
      <section class="lede">
        <p>${escapeHTML(strings.lede)} ${escapeHTML(editorial.sourceAttribution)}, ${escapeHTML(ledeAnalysisRaw)}</p>
      </section>
      ${
        showVotingResults
          ? `
      <section class="voting-results">
        <h2>${escapeHTML(strings.votingRecordsHeading)}</h2>
        ${votingRecords
          .filter((r) => r.result !== PLACEHOLDER_MARKER)
          .map(
            (record) => `
          <div class="vote-item">
            <h3>${escapeHTML(record.title)}</h3>
            <p class="vote-date">${escapeHTML(strings.dateLabel)}: ${escapeHTML(record.date)}</p>
            <p class="vote-result"><strong>${escapeHTML(strings.resultLabel)}:</strong> ${escapeHTML(record.result)}</p>
            <div class="vote-breakdown">
              <span class="vote-for">${escapeHTML(strings.forLabel)}: ${escapeHTML(String(record.votes.for))}</span>
              <span class="vote-against">${escapeHTML(strings.againstLabel)}: ${escapeHTML(String(record.votes.against))}</span>
              <span class="vote-abstain">${escapeHTML(strings.abstainLabel)}: ${escapeHTML(String(record.votes.abstain))}</span>
            </div>
          </div>
        `
          )
          .join('')}
      </section>`
          : ''
      }
      ${
        showVotingPatterns
          ? `
      <section class="voting-patterns">
        <h2>${escapeHTML(strings.partyCohesionHeading)}</h2>
        <p>${escapeHTML(editorial.parliamentaryContext)}: Analysis of voting behavior reveals varying levels of party discipline across political groups:</p>
        ${votingPatterns
          .filter((p) => !/placeholder/i.test(p.group))
          .map(
            (pattern) => `
          <div class="pattern-item">
            <h3>${escapeHTML(pattern.group)}</h3>
            <p><strong>${escapeHTML(strings.cohesionLabel)}:</strong> ${escapeHTML(String((pattern.cohesion * 100).toFixed(1)))}%</p>
            <p><strong>${escapeHTML(strings.participationLabel)}:</strong> ${escapeHTML(String((pattern.participation * 100).toFixed(1)))}%</p>
          </div>
        `
          )
          .join('')}
      </section>`
          : ''
      }
      ${
        showAnomalies
          ? `
      <section class="anomalies">
        <h2>${escapeHTML(strings.anomaliesHeading)}</h2>
        <p>${escapeHTML(editorial.analysisNote)}: Unusual voting patterns that deviate from typical party lines:</p>
        ${anomalies
          .filter((a) => !/placeholder/i.test(a.type))
          .map((anomaly) => {
            const rawSeverity = anomaly.severity ?? 'unknown';
            const severityDisplay =
              typeof rawSeverity === 'string' ? rawSeverity : String(rawSeverity);
            const severityClass = severityDisplay.toLowerCase();
            return `
          <div class="anomaly-item severity-${escapeHTML(severityClass)}">
            <h3>${escapeHTML(anomaly.type)}</h3>
            <p>${escapeHTML(anomaly.description)}</p>
            <p class="severity">${escapeHTML(strings.severityLabel)}: ${escapeHTML(severityDisplay)}</p>
          </div>
        `;
          })
          .join('')}
      </section>`
          : ''
      }
      ${
        showQuestions
          ? `
      <section class="questions">
        <h2>${escapeHTML(strings.questionsHeading)}</h2>
        ${questions
          .filter((q) => q.status !== PLACEHOLDER_MARKER)
          .map(
            (question) => `
          <div class="question-item">
            <p class="question-author">${escapeHTML(question.author)}</p>
            <p class="question-topic"><strong>${escapeHTML(question.topic)}</strong></p>
            <p class="question-meta">${escapeHTML(strings.dateLabel)}: ${escapeHTML(question.date)} | ${escapeHTML(strings.statusLabel)}: ${escapeHTML(question.status)}</p>
          </div>
        `
          )
          .join('')}
      </section>`
          : ''
      }

      <section class="why-this-matters">
        <h2>${escapeHTML(editorial.whyThisMatters)}</h2>
        <p>${escapeHTML(editorial.keyTakeaway)}: ${escapeHTML(strings.keyTakeawayText)}</p>
      </section>
      <!-- /article-content -->
    </div>
  `;
}

// ─── Political Alignment section ──────────────────────────────────────────────

/**
 * Build HTML list items for voting record alignment rows
 *
 * @param records - Voting records to render
 * @returns HTML list items string
 */
function buildVoteAlignmentHtml(records: VotingRecord[]): string {
  if (records.length === 0) return '';
  const realRecords = records.filter((r) => r.result !== PLACEHOLDER_MARKER);
  if (realRecords.length === 0) return '';
  const items = realRecords
    .map((r) => {
      const forVotes = escapeHTML(String(r.votes.for));
      const againstVotes = escapeHTML(String(r.votes.against));
      const abstainVotes = escapeHTML(String(r.votes.abstain));
      return (
        `<li class="alignment-vote">` +
        `<strong>${escapeHTML(r.title)}</strong> — ` +
        `${escapeHTML(r.result)} ` +
        `(${forVotes}&#43; / ${againstVotes}&#8722; / ${abstainVotes} abstain)` +
        `</li>`
      );
    })
    .join('\n          ');
  return `<ul class="alignment-votes">\n          ${items}\n        </ul>`;
}

/**
 * Build HTML list items for coalition alignment rows
 *
 * @param coalitions - Coalition intelligence items to render
 * @returns HTML list items string
 */
function buildCoalitionAlignmentHtml(coalitions: CoalitionIntelligence[]): string {
  if (coalitions.length === 0) return '';
  const items = coalitions
    .map(
      (c) =>
        `<li class="alignment-coalition alignment-${escapeHTML(c.riskLevel)}">` +
        `${escapeHTML(c.groups.join(', '))} — ` +
        `cohesion: ${escapeHTML(String(Math.round(c.cohesionScore * 100)))}% ` +
        `(${escapeHTML(c.alignmentTrend)})</li>`
    )
    .join('\n          ');
  return `<ul class="alignment-coalitions">\n          ${items}\n        </ul>`;
}

/**
 * Build political alignment analysis section for motions, showing how
 * voting records map to coalition cohesion and cross-party dynamics.
 * Returns an empty string when both input arrays are empty or yield no items.
 *
 * @param votingRecords - Voting records to analyse
 * @param coalitions - Coalition intelligence data from MCP
 * @param language - BCP 47 language code used as the section lang attribute
 * @returns HTML string for the political alignment section
 */
export function buildPoliticalAlignmentSection(
  votingRecords: VotingRecord[],
  coalitions: CoalitionIntelligence[],
  language: string
): string {
  if (votingRecords.length === 0 && coalitions.length === 0) return '';
  const recordsHtml = buildVoteAlignmentHtml(votingRecords);
  const coalitionsHtml = buildCoalitionAlignmentHtml(coalitions);
  if (!recordsHtml && !coalitionsHtml) return '';
  const strings = getLocalizedString(MOTIONS_STRINGS, language);
  return `
        <section class="political-alignment" lang="${escapeHTML(language)}">
          <h2>${escapeHTML(strings.politicalAlignmentHeading)}</h2>
          ${recordsHtml}
          ${coalitionsHtml}
        </section>`;
}

/** Localized headings for the adopted texts feed section */
const ADOPTED_TEXTS_HEADINGS: Record<string, string> = {
  en: 'Recently Adopted Texts',
  sv: 'Nyligen Antagna Texter',
  da: 'Nyligt Vedtagne Tekster',
  no: 'Nylig Vedtatte Tekster',
  fi: 'Äskettäin Hyväksytyt Tekstit',
  de: 'Kürzlich Angenommene Texte',
  fr: 'Textes Récemment Adoptés',
  es: 'Textos Recientemente Adoptados',
  nl: 'Recent Aangenomen Teksten',
  ar: 'النصوص المعتمدة مؤخراً',
  he: 'טקסטים שאומצו לאחרונה',
  ja: '最近採択されたテキスト',
  ko: '최근 채택된 텍스트',
  zh: '最近通过的文本',
};

/** Localized fallback label for items with no adoption date */
const ADOPTED_TEXTS_DATE_UNKNOWN_STRINGS: Record<string, string> = {
  en: 'Unknown',
  sv: 'Okänt',
  da: 'Ukendt',
  no: 'Ukjent',
  fi: 'Tuntematon',
  de: 'Unbekannt',
  fr: 'Inconnu',
  es: 'Desconocido',
  nl: 'Onbekend',
  ar: 'غير معروف',
  he: 'לא ידוע',
  ja: '不明',
  ko: '알 수 없음',
  zh: '未知',
};

/** Localized count descriptions for the adopted texts feed section */
const ADOPTED_TEXTS_COUNT_STRINGS: Record<string, (n: number) => string> = {
  en: (n) => `${n} texts adopted in recent plenary sessions:`,
  sv: (n) => `${n} texter antagna i nyliga plenarsammanträden:`,
  da: (n) => `${n} tekster vedtaget i seneste plenarmøder:`,
  no: (n) => `${n} tekster vedtatt i nylige plenumsmøter:`,
  fi: (n) => `${n} tekstiä hyväksytty viimeisimmissä täysistunnoissa:`,
  de: (n) => `${n} Texte in jüngsten Plenarsitzungen angenommen:`,
  fr: (n) => `${n}\u00a0textes adoptés lors des récentes sessions plénières\u00a0:`,
  es: (n) => `${n} textos adoptados en recientes sesiones plenarias:`,
  nl: (n) => `${n} teksten aangenomen in recente plenaire vergaderingen:`,
  ar: (n) => `تم اعتماد ${n} نصاً في جلسات البرلمان الأخيرة:`,
  he: (n) => `${n} טקסטים אומצו בישיבות המליאה האחרונות:`,
  ja: (n) => `最近の本会議セッションで ${n} 件のテキストが採択されました：`,
  ko: (n) => `최근 전체 회의에서 ${n}개의 텍스트가 채택되었습니다:`,
  zh: (n) => `最近全体会议共通过了 ${n} 份文本：`,
};

/**
 * Build an HTML section listing recently adopted texts from EP feed data.
 * Groups texts by adoption date and renders them as a structured list.
 *
 * @param adoptedTexts - Adopted text feed items
 * @param language - BCP 47 language code
 * @returns HTML section string, or empty string if no texts
 */
export function buildAdoptedTextsSection(
  adoptedTexts: readonly AdoptedTextFeedItem[],
  language: string
): string {
  if (adoptedTexts.length === 0) return '';

  const heading =
    ADOPTED_TEXTS_HEADINGS[language] ?? ADOPTED_TEXTS_HEADINGS['en'] ?? 'Recently Adopted Texts';
  const countFn = ADOPTED_TEXTS_COUNT_STRINGS[language] ?? ADOPTED_TEXTS_COUNT_STRINGS['en']!;
  const countText = countFn(adoptedTexts.length);
  const unknownDate =
    ADOPTED_TEXTS_DATE_UNKNOWN_STRINGS[language] ?? ADOPTED_TEXTS_DATE_UNKNOWN_STRINGS['en']!;

  // Group by date, sort most recent first
  const byDate = new Map<string, AdoptedTextFeedItem[]>();
  for (const item of adoptedTexts) {
    const date = item.date || unknownDate;
    const group = byDate.get(date) ?? [];
    group.push(item);
    byDate.set(date, group);
  }
  const sortedDates = [...byDate.keys()].sort().reverse();

  let itemsHtml = '';
  for (const date of sortedDates) {
    const items = byDate.get(date) ?? [];
    for (const item of items) {
      const ref = item.identifier ?? item.id;
      const title = item.title || ref;
      itemsHtml += `
            <li class="adopted-text-item">
              <strong>${escapeHTML(title)}</strong>
              <span class="feed-label">${escapeHTML(ref)}</span>
              <span class="feed-date">${escapeHTML(date)}</span>
            </li>`;
    }
  }

  return `
        <section class="adopted-texts-feed" lang="${escapeHTML(language)}">
          <h2>${escapeHTML(heading)}</h2>
          <p>${escapeHTML(countText)}</p>
          <ul class="adopted-texts-list">
            ${itemsHtml}
          </ul>
        </section>`;
}
