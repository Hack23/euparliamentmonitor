// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable sonarjs/no-duplicate-string -- Intentional keyword duplication across language groups */

/**
 * @module Constants/Articles/LocalizedKeywordsCentral
 * @description Central localized-keyword arrays.
 */

import type { LanguageMap } from '../../types/index.js';
import { ArticleCategory } from '../../types/index.js';

/** Central localized keyword arrays */
export const LOCALIZED_KEYWORDS_CENTRAL: Pick<
  LanguageMap<Record<string, readonly string[]>>,
  'de' | 'fr'
> = {
  de: {
    [ArticleCategory.WEEK_AHEAD]: [
      'EU-Parlament',
      'Woche voraus',
      'Ausschusssitzungen',
      'Plenardebatte',
      'Europäisches Parlament',
      'Gesetzgebung',
    ],
    [ArticleCategory.MONTH_AHEAD]: [
      'EU-Parlament',
      'Monat voraus',
      'Gesetzgebungsagenda',
      'Europäisches Parlament',
      'Plenarsitzung',
    ],
    [ArticleCategory.BREAKING_NEWS]: [
      'EU-Parlament',
      'Eilmeldung',
      'Europäisches Parlament',
      'Gesetzgebung',
      'Abstimmung',
    ],
    [ArticleCategory.COMMITTEE_REPORTS]: [
      'EU-Parlament',
      'Ausschusstätigkeit',
      'Europäisches Parlament',
      'Ausschussbericht',
      'Gesetzgebung',
    ],
    [ArticleCategory.PROPOSITIONS]: [
      'EU-Parlament',
      'Gesetzgebungsverfahren',
      'Europäisches Parlament',
      'Vorschlag',
      'Verordnung',
    ],
    [ArticleCategory.MOTIONS]: [
      'EU-Parlament',
      'Plenar-Abstimmungen',
      'Entschließungen',
      'Europäisches Parlament',
      'Abstimmungsprotokoll',
    ],
    [ArticleCategory.WEEK_IN_REVIEW]: [
      'EU-Parlament',
      'Wochenrückblick',
      'Europäisches Parlament',
      'Zusammenfassung',
      'Gesetzgebung',
    ],
    [ArticleCategory.MONTH_IN_REVIEW]: [
      'EU-Parlament',
      'Monatsrückblick',
      'Europäisches Parlament',
      'Zusammenfassung',
      'Gesetzgebungsübersicht',
    ],
    [ArticleCategory.QUARTER_AHEAD]: [
      'EU-Parlament',
      'Quartal voraus',
      'strategischer Ausblick',
      'Europäisches Parlament',
      'Gesetzgebungsprognose',
    ],
    [ArticleCategory.QUARTER_IN_REVIEW]: [
      'EU-Parlament',
      'Quartalsrückblick',
      'Europäisches Parlament',
      'Quartalsübersicht',
      'Gesetzgebungsübersicht',
    ],
    [ArticleCategory.YEAR_AHEAD]: [
      'EU-Parlament',
      'Jahr voraus',
      'Jahresausblick',
      'Europäisches Parlament',
      'Gesetzgebungsagenda',
    ],
    [ArticleCategory.YEAR_IN_REVIEW]: [
      'EU-Parlament',
      'Jahresrückblick',
      'Europäisches Parlament',
      'Jahreszusammenfassung',
      'Gesetzgebungserfolge',
    ],
    [ArticleCategory.TERM_OUTLOOK]: [
      'EU-Parlament',
      'Legislaturperioden-Ausblick',
      'Europäisches Parlament',
      'Legislaturperiode',
      'strategische Prognose',
    ],
    [ArticleCategory.ELECTION_CYCLE]: [
      'EU-Parlament',
      'Wahlzyklus',
      'Europäisches Parlament',
      'Wahlen',
      'politische Landschaft',
    ],
    [ArticleCategory.DEEP_ANALYSIS]: [
      'EU-Parlament',
      'Tiefenanalyse',
      'Europäisches Parlament',
      'politische Aufklärung',
      'Politikanalyse',
    ],
  },
  fr: {
    [ArticleCategory.WEEK_AHEAD]: [
      'Parlement européen',
      'semaine à venir',
      'réunions de commission',
      'débat en plénière',
      'législation',
    ],
    [ArticleCategory.MONTH_AHEAD]: [
      'Parlement européen',
      'mois à venir',
      'agenda législatif',
      'session plénière',
    ],
    [ArticleCategory.BREAKING_NEWS]: [
      'Parlement européen',
      'dernières nouvelles',
      'législation',
      'vote en plénière',
    ],
    [ArticleCategory.COMMITTEE_REPORTS]: [
      'Parlement européen',
      'travaux des commissions',
      'rapport de commission',
      'législation',
    ],
    [ArticleCategory.PROPOSITIONS]: [
      'Parlement européen',
      'procédures législatives',
      'proposition',
      'règlement',
    ],
    [ArticleCategory.MOTIONS]: [
      'Parlement européen',
      'votes en plénière',
      'résolutions',
      'protocole de vote',
    ],
    [ArticleCategory.WEEK_IN_REVIEW]: [
      'Parlement européen',
      'bilan de la semaine',
      'résumé',
      'législation',
    ],
    [ArticleCategory.MONTH_IN_REVIEW]: [
      'Parlement européen',
      'bilan du mois',
      'résumé',
      'revue législative',
    ],
    [ArticleCategory.QUARTER_AHEAD]: [
      'Parlement européen',
      'trimestre à venir',
      'perspectives stratégiques',
      'prévisions législatives',
    ],
    [ArticleCategory.QUARTER_IN_REVIEW]: [
      'Parlement européen',
      'bilan trimestriel',
      'revue du trimestre',
      'synthèse législative',
    ],
    [ArticleCategory.YEAR_AHEAD]: [
      'Parlement européen',
      'année à venir',
      'perspectives annuelles',
      'agenda législatif',
    ],
    [ArticleCategory.YEAR_IN_REVIEW]: [
      'Parlement européen',
      'bilan annuel',
      "résumé de l'année",
      'réalisations législatives',
    ],
    [ArticleCategory.TERM_OUTLOOK]: [
      'Parlement européen',
      'perspectives de la législature',
      'mandature',
      'prévisions stratégiques',
    ],
    [ArticleCategory.ELECTION_CYCLE]: [
      'Parlement européen',
      'cycle électoral',
      'élections',
      'paysage politique',
    ],
    [ArticleCategory.DEEP_ANALYSIS]: [
      'Parlement européen',
      'analyse approfondie',
      'renseignement politique',
      'analyse des politiques',
    ],
  },
};
