// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/ArticleStrings/Committee
 * @description Localized content strings for the committee-reports article
 * deep-analysis body text (templates, productivity descriptors, committee
 * full-name labels, impact / outlook text).
 */

/** Localized content strings for the committee analysis deep analysis body text */
export interface CommitteeAnalysisContentStrings {
  /** Template: what happened. {date}, {total}, {docs}, {active} placeholders */
  readonly what: string;
  /** Template: what happened when no documents are available. {date}, {total} placeholders */
  readonly whatNoData: string;
  /** "Reporting date:" label prefix */
  readonly reportDateLabel: string;
  /** "members" label */
  readonly membersLabel: string;
  /** "Chair:" label */
  readonly chairLabel: string;
  /** "robust" productivity descriptor */
  readonly productivityRobust: string;
  /** "moderate" productivity descriptor */
  readonly productivityModerate: string;
  /** "low" productivity descriptor used when 0% of committees have recent documents */
  readonly productivityLow: string;
  /** Why section text. {pct}, {descriptor} placeholders */
  readonly why: string;
  /** Impact political text when no committees are active. */
  readonly impactPoliticalNone: string;
  /** Stakeholder reason: highly productive. {n} placeholder */
  readonly stakeholderHighlyProductive: string;
  /** Stakeholder reason: moderate activity. {n} placeholder */
  readonly stakeholderModerateActivity: string;
  /** Stakeholder reason: no documents */
  readonly stakeholderNoDocs: string;
  /** Impact political text. {active}, {total} placeholders */
  readonly impactPolitical: string;
  /** Impact economic text */
  readonly impactEconomic: string;
  /** Impact social text */
  readonly impactSocial: string;
  /** Impact legal text. {docs} placeholder */
  readonly impactLegal: string;
  /** Impact geopolitical text */
  readonly impactGeopolitical: string;
  /** Action label. {abbr}, {n} placeholders */
  readonly actionProcessed: string;
  /** Consequence text */
  readonly actionConsequence: string;
  /** Mistake description */
  readonly mistakeDescription: string;
  /** Mistake alternative */
  readonly mistakeAlternative: string;
  /** Outlook when pipeline is healthy. {n}, {total} placeholders */
  readonly outlookGood: string;
  /** Outlook when pipeline has concerns */
  readonly outlookConcern: string;
  /** Lede paragraph for the committee-reports article overview */
  readonly lede: string;
  /** "No recent documents available" fallback list item */
  readonly noRecentDocs: string;
  /** Notice shown in committee cards when all committee metadata is unavailable from the EP API */
  readonly committeeMetadataUnavailable: string;
  /** Section heading for the adopted texts overview in feed-enriched articles */
  readonly adoptedTextsSectionHeading: string;
  /** Summary paragraph for adopted texts section (plural). {count} placeholder is replaced with the number of texts */
  readonly adoptedTextsSummary: string;
  /** Summary paragraph for adopted texts section when exactly one text was adopted (singular form) */
  readonly adoptedTextsSummarySingular: string;
  /** Full name of the ENVI committee */
  readonly committeeNameENVI: string;
  /** Full name of the ECON committee */
  readonly committeeNameECON: string;
  /** Full name of the AFET committee */
  readonly committeeNameAFET: string;
  /** Full name of the LIBE committee */
  readonly committeeNameLIBE: string;
  /** Full name of the AGRI committee */
  readonly committeeNameAGRI: string;
  /** Label for texts not fitting the named committee themes */
  readonly committeeNameOTHER: string;
}
