// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
export const BREAKING_NEWS_TITLES = {
    en: (date) => ({
        title: `Breaking: Significant Parliamentary Developments — ${date}`,
        subtitle: 'Intelligence analysis of voting anomalies, coalition shifts, and key MEP activities',
    }),
    sv: (date) => ({
        title: `Senaste Nytt: Betydande Parlamentariska Händelser — ${date}`,
        subtitle: 'Underrättelseanalys av röstningsanomalier, koalitionsförändringar och viktig MEP-aktivitet',
    }),
    da: (date) => ({
        title: `Seneste Nyt: Betydelige Parlamentariske Udviklinger — ${date}`,
        subtitle: 'Efterretningsanalyse af afstemningsanomalier, koalitionsforskydninger og centrale MEP-aktiviteter',
    }),
    no: (date) => ({
        title: `Siste Nytt: Betydelige Parlamentariske Hendelser — ${date}`,
        subtitle: 'Etterretningsanalyse av avstemningsavvik, koalisjonsendringer og viktige MEP-aktiviteter',
    }),
    fi: (date) => ({
        title: `Uusimmat Uutiset: Merkittäviä Parlamentaarisia Kehityksiä — ${date}`,
        subtitle: 'Tiedusteluanalyysi äänestyspoikkeamista, koalitiomuutoksista ja keskeisistä MEP-toimista',
    }),
    de: (date) => ({
        title: `Eilmeldung: Bedeutende Parlamentarische Entwicklungen — ${date}`,
        subtitle: 'Analyse von Abstimmungsanomalien, Koalitionsverschiebungen und wichtigen MEP-Aktivitäten',
    }),
    fr: (date) => ({
        title: `Dernières Nouvelles: Développements Parlementaires Significatifs — ${date}`,
        subtitle: 'Analyse des anomalies de vote, des évolutions des coalitions et des activités clés des eurodéputés',
    }),
    es: (date) => ({
        title: `Última Hora: Desarrollos Parlamentarios Significativos — ${date}`,
        subtitle: 'Análisis de anomalías en votaciones, cambios en coaliciones y actividades clave de eurodiputados',
    }),
    nl: (date) => ({
        title: `Laatste Nieuws: Significante Parlementaire Ontwikkelingen — ${date}`,
        subtitle: 'Analyse van stemanomalieën, coalitieverschuivingen en belangrijke MEP-activiteiten',
    }),
    ar: (date) => ({
        title: `عاجل: تطورات برلمانية هامة — ${date}`,
        subtitle: 'تحليل استخباراتي لشذوذ التصويت وتحولات التحالفات وأنشطة النواب الرئيسية',
    }),
    he: (date) => ({
        title: `חדשות דחופות: התפתחויות פרלמנטריות משמעותיות — ${date}`,
        subtitle: 'ניתוח מודיעיני של חריגות הצבעה, שינויי קואליציה ופעילויות חברי פרלמנט מרכזיות',
    }),
    ja: (date) => ({
        title: `速報: 重要な議会の動き — ${date}`,
        subtitle: '投票異常、連立変動、主要MEP活動の分析',
    }),
    ko: (date) => ({
        title: `속보: 중요한 의회 동향 — ${date}`,
        subtitle: '투표 이상, 연합 변화 및 주요 MEP 활동 분석',
    }),
    zh: (date) => ({
        title: `突发: 重大议会进展 — ${date}`,
        subtitle: '投票异常、联盟变化和关键MEP活动的情报分析',
    }),
};
/** Committee reports titles per language */
import { BREAKING_STRINGS_NORDIC } from './breaking-strings-nordic.js';
import { BREAKING_STRINGS_CENTRAL } from './breaking-strings-central.js';
import { BREAKING_STRINGS_WEST } from './breaking-strings-west.js';
import { BREAKING_STRINGS_EAST } from './breaking-strings-east.js';
export const BREAKING_STRINGS = {
    ...BREAKING_STRINGS_NORDIC,
    ...BREAKING_STRINGS_CENTRAL,
    ...BREAKING_STRINGS_WEST,
    ...BREAKING_STRINGS_EAST,
};
/** Localized body-text strings for the committee-analysis deep-analysis section */
//# sourceMappingURL=breaking.js.map