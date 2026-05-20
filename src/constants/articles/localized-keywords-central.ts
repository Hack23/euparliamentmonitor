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
export const LOCALIZED_KEYWORDS_CENTRAL: Pick<LanguageMap<Record<string, readonly string[]>>, 'de', 'fr'> = {
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
  },
};
