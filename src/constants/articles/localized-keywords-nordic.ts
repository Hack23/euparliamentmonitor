// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable sonarjs/no-duplicate-string -- Intentional keyword duplication across language groups */

/**
 * @module Constants/Articles/LocalizedKeywordsNordic
 * @description Nordic localized-keyword arrays.
 */

import type { LanguageMap } from '../../types/index.js';
import { ArticleCategory } from '../../types/index.js';

/** Nordic localized keyword arrays */
export const LOCALIZED_KEYWORDS_NORDIC: Pick<
  LanguageMap<Record<string, readonly string[]>>,
  'en' | 'sv' | 'da' | 'no' | 'fi'
> = {
  en: {
    [ArticleCategory.WEEK_AHEAD]: [
      'EU Parliament',
      'week ahead',
      'committee meetings',
      'plenary debate',
      'European Parliament',
      'legislation',
    ],
    [ArticleCategory.MONTH_AHEAD]: [
      'EU Parliament',
      'month ahead',
      'legislative agenda',
      'European Parliament',
      'plenary session',
    ],
    [ArticleCategory.BREAKING_NEWS]: [
      'EU Parliament',
      'breaking news',
      'European Parliament',
      'legislation',
      'plenary vote',
    ],
    [ArticleCategory.COMMITTEE_REPORTS]: [
      'EU Parliament',
      'committee activity',
      'European Parliament',
      'committee report',
      'legislation',
    ],
    [ArticleCategory.PROPOSITIONS]: [
      'EU Parliament',
      'legislative procedures',
      'European Parliament',
      'proposal',
      'regulation',
    ],
    [ArticleCategory.MOTIONS]: [
      'EU Parliament',
      'plenary votes',
      'resolutions',
      'European Parliament',
      'voting record',
    ],
    [ArticleCategory.WEEK_IN_REVIEW]: [
      'EU Parliament',
      'week in review',
      'European Parliament',
      'summary',
      'legislation',
    ],
    [ArticleCategory.MONTH_IN_REVIEW]: [
      'EU Parliament',
      'month in review',
      'European Parliament',
      'summary',
      'legislative review',
    ],
  },
  sv: {
    [ArticleCategory.WEEK_AHEAD]: [
      'EU-parlamentet',
      'veckan framåt',
      'utskottsmöten',
      'plenardebatt',
      'Europaparlamentet',
      'lagstiftning',
    ],
    [ArticleCategory.MONTH_AHEAD]: [
      'EU-parlamentet',
      'månaden framåt',
      'lagstiftningsagenda',
      'Europaparlamentet',
      'plenarsession',
    ],
    [ArticleCategory.BREAKING_NEWS]: [
      'EU-parlamentet',
      'senaste nytt',
      'Europaparlamentet',
      'lagstiftning',
      'omröstning',
    ],
    [ArticleCategory.COMMITTEE_REPORTS]: [
      'EU-parlamentet',
      'utskottsverksamhet',
      'Europaparlamentet',
      'utskottsrapport',
      'lagstiftning',
    ],
    [ArticleCategory.PROPOSITIONS]: [
      'EU-parlamentet',
      'lagstiftningsförfaranden',
      'Europaparlamentet',
      'förslag',
      'förordning',
    ],
    [ArticleCategory.MOTIONS]: [
      'EU-parlamentet',
      'omröstningar',
      'resolutioner',
      'Europaparlamentet',
      'röstprotokoll',
    ],
    [ArticleCategory.WEEK_IN_REVIEW]: [
      'EU-parlamentet',
      'veckans sammanfattning',
      'Europaparlamentet',
      'sammanfattning',
      'lagstiftning',
    ],
    [ArticleCategory.MONTH_IN_REVIEW]: [
      'EU-parlamentet',
      'månadens sammanfattning',
      'Europaparlamentet',
      'sammanfattning',
      'lagstiftningsöversikt',
    ],
  },
  da: {
    [ArticleCategory.WEEK_AHEAD]: [
      'EU-Parlamentet',
      'ugen fremover',
      'udvalgsmøder',
      'plenardebat',
      'Europa-Parlamentet',
      'lovgivning',
    ],
    [ArticleCategory.MONTH_AHEAD]: [
      'EU-Parlamentet',
      'måneden fremover',
      'lovgivningsdagsorden',
      'Europa-Parlamentet',
      'plenarsamling',
    ],
    [ArticleCategory.BREAKING_NEWS]: [
      'EU-Parlamentet',
      'seneste nyt',
      'Europa-Parlamentet',
      'lovgivning',
      'afstemning',
    ],
    [ArticleCategory.COMMITTEE_REPORTS]: [
      'EU-Parlamentet',
      'udvalgsaktivitet',
      'Europa-Parlamentet',
      'udvalgsrapport',
      'lovgivning',
    ],
    [ArticleCategory.PROPOSITIONS]: [
      'EU-Parlamentet',
      'lovgivningsprocedurer',
      'Europa-Parlamentet',
      'forslag',
      'forordning',
    ],
    [ArticleCategory.MOTIONS]: [
      'EU-Parlamentet',
      'plenar-afstemninger',
      'beslutninger',
      'Europa-Parlamentet',
      'stemmeoversigt',
    ],
    [ArticleCategory.WEEK_IN_REVIEW]: [
      'EU-Parlamentet',
      'ugens overblik',
      'Europa-Parlamentet',
      'sammenfatning',
      'lovgivning',
    ],
    [ArticleCategory.MONTH_IN_REVIEW]: [
      'EU-Parlamentet',
      'månedens overblik',
      'Europa-Parlamentet',
      'sammenfatning',
      'lovgivningsoversigt',
    ],
  },
  no: {
    [ArticleCategory.WEEK_AHEAD]: [
      'EU-parlamentet',
      'uken fremover',
      'komitémøter',
      'plenardebatt',
      'Europaparlamentet',
      'lovgivning',
    ],
    [ArticleCategory.MONTH_AHEAD]: [
      'EU-parlamentet',
      'måneden fremover',
      'lovgivningsagenda',
      'Europaparlamentet',
      'plenarsesjon',
    ],
    [ArticleCategory.BREAKING_NEWS]: [
      'EU-parlamentet',
      'siste nytt',
      'Europaparlamentet',
      'lovgivning',
      'avstemning',
    ],
    [ArticleCategory.COMMITTEE_REPORTS]: [
      'EU-parlamentet',
      'komitéaktivitet',
      'Europaparlamentet',
      'komitérapport',
      'lovgivning',
    ],
    [ArticleCategory.PROPOSITIONS]: [
      'EU-parlamentet',
      'lovgivningsprosedyrer',
      'Europaparlamentet',
      'forslag',
      'forordning',
    ],
    [ArticleCategory.MOTIONS]: [
      'EU-parlamentet',
      'plenaravstemninger',
      'vedtak',
      'Europaparlamentet',
      'stemmeprotokoll',
    ],
    [ArticleCategory.WEEK_IN_REVIEW]: [
      'EU-parlamentet',
      'ukens oppsummering',
      'Europaparlamentet',
      'sammendrag',
      'lovgivning',
    ],
    [ArticleCategory.MONTH_IN_REVIEW]: [
      'EU-parlamentet',
      'månedens oppsummering',
      'Europaparlamentet',
      'sammendrag',
      'lovgivningsoversikt',
    ],
  },
  fi: {
    [ArticleCategory.WEEK_AHEAD]: [
      'EU-parlamentti',
      'tuleva viikko',
      'valiokuntakokoukset',
      'täysistuntokeskustelu',
      'Euroopan parlamentti',
      'lainsäädäntö',
    ],
    [ArticleCategory.MONTH_AHEAD]: [
      'EU-parlamentti',
      'tuleva kuukausi',
      'lainsäädäntöohjelma',
      'Euroopan parlamentti',
      'täysistunto',
    ],
    [ArticleCategory.BREAKING_NEWS]: [
      'EU-parlamentti',
      'uusimmat uutiset',
      'Euroopan parlamentti',
      'lainsäädäntö',
      'äänestys',
    ],
    [ArticleCategory.COMMITTEE_REPORTS]: [
      'EU-parlamentti',
      'valiokuntatoiminta',
      'Euroopan parlamentti',
      'valiokuntaraportti',
      'lainsäädäntö',
    ],
    [ArticleCategory.PROPOSITIONS]: [
      'EU-parlamentti',
      'lainsäädäntömenettelyt',
      'Euroopan parlamentti',
      'ehdotus',
      'asetus',
    ],
    [ArticleCategory.MOTIONS]: [
      'EU-parlamentti',
      'täysistuntoäänestykset',
      'päätöslauselmat',
      'Euroopan parlamentti',
      'äänestyspöytäkirja',
    ],
    [ArticleCategory.WEEK_IN_REVIEW]: [
      'EU-parlamentti',
      'viikon katsaus',
      'Euroopan parlamentti',
      'yhteenveto',
      'lainsäädäntö',
    ],
    [ArticleCategory.MONTH_IN_REVIEW]: [
      'EU-parlamentti',
      'kuukauden katsaus',
      'Euroopan parlamentti',
      'yhteenveto',
      'lainsäädäntökatsaus',
    ],
  },
};
