// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/ArticleStrings/WeekAhead
 * @description Localized strings and supporting data structures for
 * week-ahead articles — section headings, stakeholder-impact tables,
 * and the language-agnostic political-temperature gauge.
 */

/** Localized section heading strings for week-ahead articles */
export interface WeekAheadStrings {
  lede: string;
  plenarySessions: string;
  committeeMeetings: string;
  legislativeDocuments: string;
  legislativePipeline: string;
  parliamentaryQuestions: string;
  noPlenary: string;
  bottleneckIndicator: string;
  whatToWatch: string;
}

/** Localized strings for the week-ahead stakeholder impact section */
export interface WeekAheadStakeholderStrings {
  /** Section heading */
  heading: string;
  /** Political temperature gauge label */
  temperatureLabel: string;
  /** "Impact" table column header */
  impactHeader: string;
  /** "Stakeholder" table column header */
  stakeholderHeader: string;
  /** "Reason" table column header */
  reasonHeader: string;
  /** Temperature descriptor: Low (0–24) */
  tempLow: string;
  /** Temperature descriptor: Moderate (25–49) */
  tempModerate: string;
  /** Temperature descriptor: High (50–74) */
  tempHigh: string;
  /** Temperature descriptor: Very High (75–100) */
  tempVeryHigh: string;
  /** Stakeholder label: Political Groups */
  stakeholderPoliticalGroups: string;
  /** Stakeholder label: Civil Society */
  stakeholderCivilSociety: string;
  /** Stakeholder label: Industry */
  stakeholderIndustry: string;
  /** Stakeholder label: EU Citizens */
  stakeholderEuCitizens: string;
  /** Stakeholder label: National Governments */
  stakeholderNationalGovernments: string;
  /** Stakeholder label: EU Institutions */
  stakeholderEuInstitutions: string;
  /** Reason template: "{count} parliamentary event(s) scheduled" */
  reasonEventsScheduled: string;
  /** Reason template: "{count} legislative document(s) under review" */
  reasonDocumentsUnderReview: string;
  /** Reason: Regulatory agenda may affect business environment */
  reasonIndustryRegulatoryAgenda: string;
  /** Reason: Parliamentary decisions shape EU-wide policy */
  reasonCitizensDecisionsShapePolicy: string;
  /** Reason template: "{count} document(s) may require national transposition" */
  reasonDocumentsRequireTransposition: string;
  /** Reason: Cross-institutional coordination required */
  reasonInstitutionsCoordination: string;
}

/** A single row in the stakeholder impact matrix */
export interface StakeholderImpactRow {
  /** Stakeholder label */
  readonly stakeholder: string;
  /** Impact level: high, medium, or low */
  readonly impact: 'high' | 'medium' | 'low';
  /** Short reason explaining the impact */
  readonly reason: string;
}

/** Stakeholder impact section data for week-ahead articles */
export interface StakeholderImpactSection {
  /** Rows of stakeholder impact assessments */
  readonly rows: readonly StakeholderImpactRow[];
}

/**
 * Band key for political temperature, used for localization at render time.
 *
 * These values are language-agnostic and must not be localized directly.
 * UI layers should map this band to appropriate, localized display strings.
 */
export type PoliticalTemperatureBand = 'low' | 'moderate' | 'high' | 'veryHigh';

/**
 * Political temperature score for a parliamentary week.
 * A composite urgency/controversy score on a 0–100 scale.
 */
export interface PoliticalTemperature {
  /** Overall score from 0 (calm) to 100 (highly contentious) */
  readonly score: number;
  /**
   * Language-agnostic band key for the political temperature.
   * Use this band to derive localized labels and visual styling.
   */
  readonly band: PoliticalTemperatureBand;
}
