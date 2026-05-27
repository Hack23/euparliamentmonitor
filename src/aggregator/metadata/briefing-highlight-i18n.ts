// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Metadata/BriefingHighlightI18n
 * @description Per-language section-heading needle dictionaries and
 * boilerplate stem patterns used by {@link briefing-highlight.ts} to
 * recognise translated `## Strategic Intelligence Summary` / `## Top
 * Findings` / `## Reader Briefing` blocks across all 14 supported
 * languages.
 *
 * The English needles (held in the parent module) are kept verbatim
 * because Convention-A briefs (motions, committee-reports) still ship
 * English H2 text inside translated bodies. The per-language entries
 * here cover Convention-B briefs (propositions, breaking) where
 * translators have additionally localised the H2 text per §3 of the
 * executive-brief translation guide.
 *
 * Needles are stored lower-cased to match {@link headingMatches}'s
 * post-normalization comparison. CJK / Arabic / Hebrew strings are
 * left as-is because `.toLowerCase()` is a no-op for those scripts.
 * Empty arrays mean "no language-specific override — base English
 * matchers cover this language" (used for `en`).
 *
 * Pure leaf module — no I/O, no upward imports beyond
 * {@link LanguageCode}.
 */

import type { LanguageCode } from '../../types/languages.js';

/**
 * Localised needles for the `## Strategic Intelligence Summary` /
 * `## Strategic Context` / `## Five Key Judgments` family of section
 * openers, keyed by target language. Only the localised forms are
 * stored here; the English base list lives in
 * {@link briefing-highlight.ts}.
 */
export const STRATEGIC_SECTION_HEADINGS_BY_LANG: Readonly<Record<LanguageCode, readonly string[]>> =
  Object.freeze({
    en: [],
    sv: [
      'strategisk rubrik',
      'strategiskt sammanhang',
      'strategisk kontext',
      'strategisk syntes',
      'rubrikbedömning',
      'rubrikbedömningar',
      'lägesbedömning',
      'lägesanalys',
      'lägesanalys — toppnivå',
      'tre centrala underrättelsebedömningar',
      'fem nyckelomdömen',
      'fem nyckelomdömen (underrättelsesammanfattning)',
      'underrättelsesammanfattning',
      'sammantagen underrättelsebedömning',
      'principal underrättelsebedömning',
      'slutsats',
    ],
    da: [
      'strategisk overskrift',
      'strategisk kontekst',
      'strategisk syntese',
      'overskriftsvurdering',
      'overskriftsvurderinger',
      'situationsvurdering',
      'situationsvurdering — topniveau',
      'situationsvurdering — toppniveau',
      'tre centrale efterretningsvurderinger',
      'fem nøglevurderinger',
      'fem nøglevurderinger (efterretningsresumé)',
      'efterretningsresumé',
      'samlet efterretningsvurdering',
      'principal efterretningsvurdering',
      'konklusion',
    ],
    no: [
      'strategisk overskrift',
      'strategisk kontekst',
      'strategisk syntese',
      'overskriftsvurdering',
      'overskriftsvurderinger',
      'situasjonsvurdering',
      'situasjonsvurdering — toppnivå',
      'tre sentrale etterretningsvurderinger',
      'fem nøkkelvurderinger',
      'fem nøkkelvurderinger (etterretningssammendrag)',
      'etterretningssammendrag',
      'samlet etterretningsvurdering',
      'principal etterretningsvurdering',
      'konklusjon',
    ],
    fi: [
      'strateginen otsikko',
      'strateginen konteksti',
      'strateginen tilannekuva',
      'strateginen synteesi',
      'otsikkoarviointi',
      'otsikkoarvioinnit',
      'tilannearvio',
      'tilannearvio — ylätaso',
      'kolme keskeistä tiedusteluarviota',
      'viisi keskeistä arviota',
      'viisi keskeistä arviota (tiedusteluyhteenveto)',
      'tiedusteluyhteenveto',
      'kokonaisvaltainen tiedusteluarvio',
      'johtopäätös',
    ],
    de: [
      'strategische schlagzeile',
      'strategischer kontext',
      'strategische synthese',
      'hauptbeurteilung',
      'hauptbeurteilungen',
      'lagebeurteilung',
      'lagebeurteilung — überblick',
      'drei zentrale geheimdienstbeurteilungen',
      'fünf schlüsselurteile',
      'fünf schlüsselurteile (geheimdienstübersicht)',
      'geheimdienstübersicht',
      'gesamtbeurteilung der nachrichtendienste',
      'fazit',
      'schlussfolgerung',
    ],
    fr: [
      'titre stratégique',
      'contexte stratégique',
      'synthèse stratégique',
      'évaluation des titres',
      'évaluation de la situation',
      'évaluation de la situation — niveau supérieur',
      'aperçu stratégique de la situation',
      'trois jugements de renseignement clés',
      'cinq jugements clés',
      'cinq jugements clés (synthèse de renseignement)',
      'synthèse de renseignement',
      'évaluation globale du renseignement',
      'évaluation principale du renseignement',
      'conclusion',
    ],
    es: [
      'titular estratégico',
      'contexto estratégico',
      'síntesis estratégica',
      'evaluación de titulares',
      'evaluación de la situación',
      'evaluación de la situación — nivel superior',
      'tres juicios clave de inteligencia',
      'cinco juicios clave',
      'cinco juicios clave (resumen de inteligencia)',
      'cinco conclusiones estratégicas',
      'resumen de inteligencia',
      'evaluación general de inteligencia',
      'evaluación principal de inteligencia',
      'conclusión',
    ],
    nl: [
      'strategische koptekst',
      'strategische context',
      'strategische synthese',
      'hoofdbeoordeling',
      'hoofdbeoordelingen',
      'situatiebeoordeling',
      'situatiebeoordeling — overzicht',
      'drie centrale inlichtingenbeoordelingen',
      'vijf sleuteloordeelen',
      'vijf sleuteloordeelen (inlichtingensamenvatting)',
      'inlichtingensamenvatting',
      'algehele inlichtingenbeoordeling',
      'conclusie',
    ],
    ar: [
      'العنوان الاستراتيجي',
      'السياق الاستراتيجي',
      'التحليل الاستراتيجي',
      'تقييم العناوين',
      'تقييم الوضع',
      'ثلاث تقييمات استخباراتية رئيسية',
      'خمسة أحكام رئيسية',
      'خمسة أحكام رئيسية (ملخص الاستخبارات)',
      'ملخص الاستخبارات',
      'التقييم الاستخباراتي الشامل',
      'الخلاصة',
      'الاستنتاج',
    ],
    he: [
      'כותרת אסטרטגית',
      'הקשר אסטרטגי',
      'סינתזה אסטרטגית',
      'הערכת כותרות',
      'הערכת מצב',
      'שלוש הערכות מודיעין מרכזיות',
      'חמש הלכות מרכזיות',
      'חמש הלכות מרכזיות (סיכום מודיעיני)',
      'סיכום מודיעיני',
      'הערכה מודיעינית כוללת',
      'מסקנה',
    ],
    ja: [
      '戦略的見出し',
      '戦略的背景',
      '戦略的文脈',
      '戦略的シンセシス',
      '主要判断',
      '主要な判断',
      '状況評価',
      '三つの主要情報評価',
      '五つの主要判断',
      '五つの主要判断（インテリジェンス要約）',
      '五つの主要判断 (インテリジェンス要約)',
      'インテリジェンス要約',
      '総合情報評価',
      '結論',
    ],
    ko: [
      '전략적 헤드라인',
      '전략적 맥락',
      '전략적 문맥',
      '전략적 종합',
      '주요 판단',
      '상황 평가',
      '3가지 핵심 정보 평가',
      '세 가지 핵심 정보 평가',
      '다섯 가지 핵심 판단',
      '다섯 가지 핵심 판단 (정보 요약)',
      '정보 요약',
      '종합 정보 평가',
      '결론',
    ],
    zh: [
      '战略性标题',
      '战略标题',
      '战略背景',
      '战略综合',
      '主要判断',
      '状况评估',
      '三项关键情报评估',
      '五项关键判断',
      '五项关键判断（情报摘要）',
      '五项关键判断 (情报摘要)',
      '情报摘要',
      '总体情报评估',
      '结论',
    ],
  });

/**
 * Localised needles for the `## Top Findings` / `## Key Findings` /
 * `## Key Events` family of section openers.
 */
export const TOP_FINDINGS_HEADINGS_BY_LANG: Readonly<Record<LanguageCode, readonly string[]>> =
  Object.freeze({
    en: [],
    sv: [
      'viktiga händelser',
      'viktigaste händelser',
      'nyckelhändelser',
      'viktigaste slutsatser',
      'viktigaste fynd',
      'huvudfynd',
      'topp fynd',
      'nyckelfynd',
      'principal underrättelsebedömning',
    ],
    da: [
      'vigtige begivenheder',
      'vigtigste begivenheder',
      'nøglebegivenheder',
      'vigtigste resultater',
      'vigtigste fund',
      'nøglefund',
      'topfund',
      'principal efterretningsvurdering',
    ],
    no: [
      'viktige hendelser',
      'viktigste hendelser',
      'nøkkelhendelser',
      'viktigste funn',
      'nøkkelfunn',
      'principal etterretningsvurdering',
    ],
    fi: [
      'tärkeät tapahtumat',
      'tärkeimmät tapahtumat',
      'avaintapahtumat',
      'keskeiset tapahtumat',
      'tärkeimmät havainnot',
      'avainhavainnot',
      'keskeiset havainnot',
    ],
    de: [
      'schlüsselereignisse',
      'wichtigste ereignisse',
      'wichtige ereignisse',
      'wichtigste erkenntnisse',
      'wichtigste befunde',
      'top-erkenntnisse',
      'top erkenntnisse',
    ],
    fr: [
      'événements clés',
      'principaux événements',
      'principales conclusions',
      'résultats clés',
      'principaux résultats',
      'conclusions clés',
    ],
    es: [
      'eventos clave',
      'principales eventos',
      'principales conclusiones',
      'hallazgos clave',
      'principales hallazgos',
      'conclusiones clave',
    ],
    nl: [
      'belangrijkste gebeurtenissen',
      'belangrijke gebeurtenissen',
      'kerngebeurtenissen',
      'belangrijkste bevindingen',
      'kernbevindingen',
    ],
    ar: [
      'الأحداث الرئيسية',
      'أحداث رئيسية',
      'أبرز النتائج',
      'النتائج الرئيسية',
      'أبرز 5 تطورات عاجلة',
    ],
    he: ['אירועים מרכזיים', 'אירועי מפתח', 'תוצאות מרכזיות', 'ממצאים מרכזיים'],
    ja: [
      '主要な出来事',
      '主要事象',
      '重要な出来事',
      '主要な発見',
      '主要な所見',
      '重要な所見',
      '主要イベント',
      'トップ・ファインディングス',
      'キーファインディングス',
    ],
    ko: ['주요 사건', '핵심 사건', '주요 발견', '핵심 발견', '주요 결과'],
    zh: ['主要事件', '关键事件', '重大事件', '主要发现', '关键发现', '主要结果'],
  });

/**
 * Localised needles for the `## Reader Briefing` family of section
 * openers, plus the `60-Second Read` shortcut headings used in
 * Convention-B propositions/breaking briefs.
 */
export const READER_BRIEFING_HEADINGS_BY_LANG: Readonly<Record<LanguageCode, readonly string[]>> =
  Object.freeze({
    en: [],
    sv: [
      'läsarbriefing',
      'läsarbriefing (vanligt språk)',
      '60-sekunders läsning',
      '60-sekundersläsning',
      '60-sekunderläsning',
      'lättillgänglig läsning',
      'lättillgänglig läsning (vardagligt språk)',
    ],
    da: [
      'læserbriefing',
      'læserbriefing (almindeligt sprog)',
      '60-sekunders læsning',
      'læservenlig læsning',
    ],
    no: ['leserbriefing', 'leserbriefing (vanlig språk)', '60-sekunders lesing', 'lettlest lesing'],
    fi: [
      'lukijabriefing',
      'lukijabriefing (selkokielellä)',
      '60-sekunnin luenta',
      '60 sekunnin luenta',
    ],
    de: [
      'leser-briefing',
      'leserbriefing',
      'leserbriefing (klartext)',
      '60-sekunden-lektüre',
      '60-sekunden-lese',
    ],
    fr: [
      'briefing du lecteur',
      'briefing lecteur',
      'briefing du lecteur (langage simple)',
      'lecture en 60 secondes',
      'lecture de 60 secondes',
    ],
    es: [
      'briefing del lector',
      'briefing del lector (lenguaje sencillo)',
      'lectura de 60 segundos',
      'lectura en 60 segundos',
    ],
    nl: [
      'lezersbriefing',
      'lezersbriefing (begrijpelijke taal)',
      '60-seconden lectuur',
      '60 seconden lezen',
    ],
    ar: ['موجز القارئ', 'موجز القارئ (لغة مبسطة)', 'قراءة 60 ثانية', 'قراءة في 60 ثانية'],
    he: ['תקציר לקורא', 'תקציר לקורא (שפה פשוטה)', 'קריאה של 60 שניות'],
    ja: [
      '読者向けブリーフィング',
      '読者向けブリーフィング (平易な表現)',
      '60秒読み',
      '60秒読み (平易な表現)',
    ],
    ko: ['독자 브리핑', '독자 브리핑 (평이한 언어)', '60초 읽기'],
    zh: ['读者简报', '读者简报 (通俗语言)', '60秒阅读'],
  });

/**
 * Localised stems of the "This executive brief synthesizes…"
 * boilerplate sentence patterns. Used by both
 * {@link briefing-highlight.ts}'s {@link normalizeBriefingLine} and
 * {@link title-rejection.ts}'s {@link looksLikeBoilerplate} to filter
 * self-referential meta-prose that describes the brief itself rather
 * than the substantive content. Each pattern is anchored at
 * start-of-line so false positives are unlikely.
 */
export const BOILERPLATE_STEM_PATTERNS_BY_LANG: Readonly<Record<LanguageCode, readonly RegExp[]>> =
  Object.freeze({
    en: [],
    sv: [
      /^denna (?:verkställande )?sammanfattning[^.\n]{0,80}?(?:syntetiserar|sammanfattar|presenterar|täcker)/iu,
      /^detta verkställande sammandrag[^.\n]{0,80}?(?:syntetiserar|sammanfattar)/iu,
      /^denna (?:rapport|analys|bedömning)[^.\n]{0,80}?(?:syntetiserar|sammanfattar|presenterar)/iu,
    ],
    da: [
      /^dette (?:udøvende )?(?:resumé|sammendrag)[^.\n]{0,80}?(?:syntetiserer|sammenfatter|præsenterer|dækker)/iu,
      /^denne (?:rapport|analyse|vurdering)[^.\n]{0,80}?(?:syntetiserer|sammenfatter|præsenterer)/iu,
    ],
    no: [
      /^dette (?:utøvende )?sammendrag(?:et)?[^.\n]{0,80}?(?:syntetiserer|oppsummerer|presenterer|dekker)/iu,
      /^denne (?:rapporten|analysen|vurderingen)[^.\n]{0,80}?(?:syntetiserer|oppsummerer|presenterer)/iu,
    ],
    fi: [
      /^tämä (?:toimeenpaneva )?(?:tiivistelmä|yhteenveto)[^.\n]{0,80}?(?:syntetisoi|kokoaa|kattaa|esittää)/iu,
      /^tämä (?:raportti|analyysi|arvio)[^.\n]{0,80}?(?:syntetisoi|kokoaa|kattaa|esittää)/iu,
    ],
    de: [
      /^dieser (?:kurzbericht|exekutivbericht|bericht)[^.\n]{0,80}?(?:synthetisiert|fasst zusammen|umfasst|deckt|präsentiert)/iu,
      /^dieses (?:executive (?:briefing|summary)|kurzdossier)[^.\n]{0,80}?(?:synthetisiert|fasst zusammen|umfasst|deckt)/iu,
      /^diese (?:analyse|bewertung|zusammenfassung)[^.\n]{0,80}?(?:synthetisiert|fasst zusammen|umfasst)/iu,
    ],
    fr: [
      /^ce (?:briefing exécutif|résumé exécutif|résumé|rapport|document)[^.\n]{0,80}?(?:synthétise|résume|couvre|présente|contient)/iu,
      /^cette (?:analyse|évaluation|note(?: de synthèse)?)[^.\n]{0,80}?(?:synthétise|résume|couvre|présente)/iu,
    ],
    es: [
      /^este (?:informe ejecutivo|resumen ejecutivo|resumen|informe|documento)[^.\n]{0,80}?(?:sintetiza|resume|cubre|presenta|contiene)/iu,
      /^esta (?:análisis|evaluación|nota)[^.\n]{0,80}?(?:sintetiza|resume|cubre|presenta)/iu,
    ],
    nl: [
      /^deze (?:executive briefing|samenvatting|briefing|rapportage)[^.\n]{0,80}?(?:synthetiseert|vat samen|dekt|behandelt|presenteert)/iu,
      /^dit (?:uitvoerend(?:e)? briefingdocument|rapport|document|verslag|briefingdocument)[^.\n]{0,80}?(?:synthetiseert|vat samen|dekt|behandelt|presenteert)/iu,
    ],
    ar: [
      // eslint-disable-next-line security/detect-unsafe-regex
      /^(?:يلخص|يجمع|يتناول|يجمِّع|يُجمِّع|يُلخِّص)\s+هذا(?:\s+(?:الموجز(?: التنفيذي)?|التقرير|التحليل|الملخص(?: التنفيذي)?))?/u,
    ],
    he: [
      /^(?:תקציר(?: ניהולי| מנהלים)?\s+זה|דו"ח\s+זה|מסמך\s+זה|דוח\s+זה)[^.\n]{0,80}?(?:מסכם|מציג|מכסה|מסנתז)/u,
    ],
    ja: [
      // eslint-disable-next-line security/detect-unsafe-regex
      /^(?:この|本)(?:エグゼクティブ・?|エグゼクティブ ?)?(?:ブリーフィング|ブリーフ|要約|サマリー|レポート|報告書)(?:は|では)/u,
    ],
    ko: [
      /^이 (?:집행|행정|경영진)?\s*(?:브리핑|요약|보고서|간추림)(?:은|는|이|가)/u,
      /^본 (?:집행|행정|경영진)?\s*(?:브리핑|요약|보고서)(?:은|는|이|가)/u,
    ],
    zh: [/^本(?:执行)?(?:简报|摘要|报告|文件)/u, /^这份?(?:执行)?(?:简报|摘要|报告)/u],
  });

/**
 * Resolve the active needle list for a section family + target
 * language. Returns the English base list unioned with the
 * locale-specific entries from the supplied map. Order is preserved
 * (base first, locale-specific second) so deterministic match order
 * is maintained.
 *
 * @param map - Per-language needle dictionary
 * @param baseEnglish - The English needle list from the parent module
 * @param lang - Target language code (defaults to `'en'`)
 * @returns Combined needle list to pass to `headingMatches`
 */
export function resolveHeadingNeedles(
  map: Readonly<Record<LanguageCode, readonly string[]>>,
  baseEnglish: readonly string[],
  lang: LanguageCode
): readonly string[] {
  const localised = map[lang] ?? [];
  if (lang === 'en' || localised.length === 0) return baseEnglish;
  return [...baseEnglish, ...localised];
}

/**
 * Resolve the active boilerplate-stem RegExp list for a target
 * language. Unions the English base patterns with the locale-specific
 * patterns. Order is preserved.
 *
 * @param baseEnglish - The English RegExp list from the parent module
 * @param lang - Target language code (defaults to `'en'`)
 * @returns Combined RegExp list for `.some(re => re.test(...))`
 */
export function resolveBoilerplatePatterns(
  baseEnglish: readonly RegExp[],
  lang: LanguageCode
): readonly RegExp[] {
  const localised = BOILERPLATE_STEM_PATTERNS_BY_LANG[lang] ?? [];
  if (lang === 'en' || localised.length === 0) return baseEnglish;
  return [...baseEnglish, ...localised];
}
