// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/ReaderGuide/Labels
 * @description Top-level chrome labels for the Reader Intelligence Guide
 * — section title, intro paragraph, and column headers — translated into
 * the 14 supported languages. Per-section reader-need / value rows live
 * in `./rows.js`.
 */

import type { LanguageMap } from '../../types/index.js';

/** Section title for the Reader Intelligence Guide */
export const READER_GUIDE_TITLE_LABELS: LanguageMap = {
  en: 'Reader Intelligence Guide',
  sv: 'Läsarguide för underrättelser',
  da: 'Læserguide til efterretninger',
  no: 'Leserguide for etterretning',
  fi: 'Lukijan tiedusteluopas',
  de: 'Leser-Intelligenz-Leitfaden',
  fr: "Guide d'intelligence pour le lecteur",
  es: 'Guía de inteligencia para el lector',
  nl: 'Lezersgids voor inlichtingen',
  ar: 'دليل القارئ الاستخباراتي',
  he: 'מדריך מודיעין לקורא',
  ja: '読者インテリジェンスガイド',
  ko: '독자 인텔리전스 가이드',
  zh: '读者情报指南',
};

/** Introduction text for the Reader Intelligence Guide */
export const READER_GUIDE_INTRO_LABELS: LanguageMap = {
  en: 'Use this guide to read the article as a political-intelligence product rather than a raw artifact dump. High-value reader lenses appear first; technical provenance remains available in the audit appendices.',
  sv: 'Använd denna guide för att läsa artikeln som en politisk underrättelseprodukt snarare än en rå artefaktsamling. Högvärda läsarperspektiv visas först; teknisk härkomst finns tillgänglig i granskningsbilagorna.',
  da: 'Brug denne guide til at læse artiklen som et politisk efterretningsprodukt snarere end en rå artefaktsamling. Læserperspektiver med høj værdi vises først; teknisk oprindelse forbliver tilgængelig i revisionsbilagene.',
  no: 'Bruk denne guiden til å lese artikkelen som et politisk etterretningsprodukt i stedet for en rå artefaktsamling. Leserperspektiver med høy verdi vises først; teknisk opprinnelse er tilgjengelig i revisjonsvedleggene.',
  fi: "Käytä tätä opasta artikkelin lukemiseen poliittisena tiedustelutuotteena raa'an artefaktikokoelman sijaan. Arvokkaita lukijanäkökulmia esitetään ensin; tekninen alkuperä on saatavilla tarkastusliitteissä.",
  de: 'Nutzen Sie diesen Leitfaden, um den Artikel als politisches Nachrichtendienstprodukt statt als bloße Artefaktsammlung zu lesen. Hochwertige Leserperspektiven erscheinen zuerst; technische Herkunft bleibt in den Prüfanhängen verfügbar.',
  fr: "Utilisez ce guide pour lire l'article comme un produit de renseignement politique plutôt qu'un simple recueil d'artefacts. Les perspectives de lecture à haute valeur apparaissent en premier ; la provenance technique reste disponible dans les annexes d'audit.",
  es: 'Use esta guía para leer el artículo como un producto de inteligencia política en lugar de una colección de artefactos sin procesar. Las perspectivas de lectura de alto valor aparecen primero; la procedencia técnica permanece disponible en los apéndices de auditoría.',
  nl: 'Gebruik deze gids om het artikel te lezen als een politiek inlichtingenproduct in plaats van een ruwe artefactverzameling. Hoogwaardige lezersperspectieven verschijnen eerst; technische herkomst blijft beschikbaar in de auditbijlagen.',
  ar: 'استخدم هذا الدليل لقراءة المقال كمنتج استخباراتي سياسي بدلاً من مجموعة مواد خام. تظهر العدسات عالية القيمة أولاً؛ تبقى المصادر التقنية متاحة في ملاحق المراجعة.',
  he: 'השתמש במדריך זה לקריאת המאמר כמוצר מודיעין פוליטי ולא כאוסף ממצאים גולמי. עדשות קריאה בעלות ערך גבוה מופיעות ראשונות; מקור טכני נשאר זמין בנספחי הביקורת.',
  ja: 'このガイドを使用して、生の成果物の集まりではなく政治インテリジェンス製品として記事を読んでください。高価値な読者視点が最初に表示されます。技術的な出所は監査付録で引き続き確認できます。',
  ko: '이 가이드를 사용하여 기사를 원시 산출물 모음이 아닌 정치 인텔리전스 제품으로 읽으십시오. 고가치 독자 관점이 먼저 나타납니다. 기술적 출처는 감사 부록에서 확인할 수 있습니다.',
  zh: '使用本指南将文章作为政治情报产品而非原始工件集合来阅读。高价值读者视角优先呈现；技术出处可在审计附录中查阅。',
};

/** Table header: "Reader need" */
export const READER_GUIDE_COL_NEED_LABELS: LanguageMap = {
  en: 'Reader need',
  sv: 'Läsarbehov',
  da: 'Læserbehov',
  no: 'Leserbehov',
  fi: 'Lukijan tarve',
  de: 'Leserbedarf',
  fr: 'Besoin du lecteur',
  es: 'Necesidad del lector',
  nl: 'Lezersbehoefte',
  ar: 'حاجة القارئ',
  he: 'צורך הקורא',
  ja: '読者のニーズ',
  ko: '독자 요구',
  zh: '读者需求',
};

/** Table header: "What you'll get" */
export const READER_GUIDE_COL_VALUE_LABELS: LanguageMap = {
  en: "What you'll get",
  sv: 'Vad du får',
  da: 'Hvad du får',
  no: 'Hva du får',
  fi: 'Mitä saat',
  de: 'Was Sie erhalten',
  fr: 'Ce que vous obtiendrez',
  es: 'Lo que obtendrá',
  nl: 'Wat u krijgt',
  ar: 'ما ستحصل عليه',
  he: 'מה תקבל',
  ja: '得られる情報',
  ko: '얻게 되는 정보',
  zh: '您将获得',
};

/** Table header: "Source artifact" */
export const READER_GUIDE_COL_SOURCE_LABELS: LanguageMap = {
  en: 'Source artifact',
  sv: 'Källartefakt',
  da: 'Kildeartefakt',
  no: 'Kildeartefakt',
  fi: 'Lähdeartefakti',
  de: 'Quellartefakt',
  fr: 'Artefact source',
  es: 'Artefacto fuente',
  nl: 'Bronartefact',
  ar: 'مصدر المواد',
  he: 'ממצא מקור',
  ja: 'ソースアーティファクト',
  ko: '소스 아티팩트',
  zh: '源工件',
};
