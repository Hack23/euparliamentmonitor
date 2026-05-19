// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/PoliticalIntelligence/Descriptions/Fallback
 * @description Generic fallback machinery for the curated political-
 * intelligence description tables: per-language kind words
 * (methodology / template / reference / artifact) and the localized
 * "{title} — {kind} …" sentence template. Used by
 * {@link buildGenericFallback} when a file ships without a curated
 * per-language description so readers on every locale see a meaningful
 * card — never raw English.
 *
 * Split out of the monolithic `political-intelligence-descriptions.ts`
 * (Refactor 8/8).
 */

import type { LanguageCode } from '../../../types/index.js';

/**
 * Per-language localized generic fallback phrase for **descriptions**.
 *
 * The placeholder `{title}` is replaced with the file's curated/localized
 * title; `{kind}` is replaced with a localized kind word (methodology /
 * template / reference). When `{title}` is omitted from a given language's
 * template, the kind-only form is used (back-compat path).
 *
 * This is what readers see when a file ships without a curated per-language
 * description (e.g. a brand-new methodology added after this table was last
 * updated) — so even new files never display raw English on non-English
 * pages.
 */
const GENERIC_FALLBACK_I18N: Record<LanguageCode, string> = {
  en: '{title} — {kind} in the EU Parliament Monitor analysis library.',
  sv: '{title} — {kind} i EU Parliament Monitors analysbibliotek.',
  da: '{title} — {kind} i EU Parliament Monitors analysebibliotek.',
  no: '{title} — {kind} i EU Parliament Monitors analysebibliotek.',
  fi: '{title} — {kind} EU Parliament Monitorin analyysikirjastossa.',
  de: '{title} — {kind} in der EU-Parliament-Monitor-Analysebibliothek.',
  fr: '{title} — {kind} dans la bibliothèque d’analyse EU Parliament Monitor.',
  es: '{title} — {kind} en la biblioteca de análisis EU Parliament Monitor.',
  nl: '{title} — {kind} in de analysebibliotheek van EU Parliament Monitor.',
  ar: '{title} — {kind} في مكتبة تحليل EU Parliament Monitor.',
  he: '{title} — {kind} בספריית הניתוחים של EU Parliament Monitor.',
  ja: '{title} — EU Parliament Monitor 分析ライブラリの{kind}。',
  ko: '{title} — EU Parliament Monitor 분석 라이브러리의 {kind}.',
  zh: '{title} — EU Parliament Monitor 分析库中的{kind}。',
};

/** Per-language word for "methodology". */
const KIND_WORDS_METHODOLOGY: Record<LanguageCode, string> = {
  en: 'methodology',
  sv: 'metodologi',
  da: 'metode',
  no: 'metodikk',
  fi: 'metodologia',
  de: 'Methodologie',
  fr: 'méthodologie',
  es: 'metodología',
  nl: 'methodologie',
  ar: 'منهجية',
  he: 'מתודולוגיה',
  ja: '方法論',
  ko: '방법론',
  zh: '方法论',
};

/** Per-language word for "template". */
const KIND_WORDS_TEMPLATE: Record<LanguageCode, string> = {
  en: 'template',
  sv: 'mall',
  da: 'skabelon',
  no: 'mal',
  fi: 'malli',
  de: 'Vorlage',
  fr: 'modèle',
  es: 'plantilla',
  nl: 'sjabloon',
  ar: 'قالب',
  he: 'תבנית',
  ja: 'テンプレート',
  ko: '템플릿',
  zh: '模板',
};

/** Per-language word for "reference". */
const KIND_WORDS_REFERENCE: Record<LanguageCode, string> = {
  en: 'reference',
  sv: 'referens',
  da: 'reference',
  no: 'referanse',
  fi: 'viite',
  de: 'Referenz',
  fr: 'référence',
  es: 'referencia',
  nl: 'referentie',
  ar: 'مرجع',
  he: 'ייחוס',
  ja: '参照資料',
  ko: '참조 자료',
  zh: '参考资料',
};

/** Per-language word for "analysis artifact" (for files under analysis/daily/). */
const KIND_WORDS_ARTIFACT: Record<LanguageCode, string> = {
  en: 'analysis artifact',
  sv: 'analysartefakt',
  da: 'analyseartefakt',
  no: 'analyseartefakt',
  fi: 'analyysiartefakti',
  de: 'Analyseartefakt',
  fr: 'artefact d’analyse',
  es: 'artefacto de análisis',
  nl: 'analyse-artefact',
  ar: 'ناتج تحليل',
  he: 'תוצר ניתוח',
  ja: '分析アーティファクト',
  ko: '분석 산출물',
  zh: '分析产物',
};

/**
 * Strip leading emojis/punctuation from a display string and return a
 * title-cased humanized tail. Used only as a last-ditch fallback when no
 * H1 title is provided to `getCuratedDescription`.
 *
 * @param keyOrTitle - Raw string (typically a path stem or an H1)
 * @returns Title-cased humanized string
 */
export function stripEmojiAndPunct(keyOrTitle: string): string {
  const seed =
    keyOrTitle
      .split('/')
      .pop()
      ?.replace(/\.[^.]+$/, '')
      ?.replace(/[-_]+/g, ' ')
      ?.trim() ?? keyOrTitle;
  return seed.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Infer a kind ("methodology" / "template" / "reference") from the
 * repository-relative path.
 *
 * @param relPath - Repository-relative Markdown path
 * @returns The inferred kind; falls back to `'reference'` when the path
 *   does not match a `/methodologies/` or `/templates/` directory
 */
function inferKind(relPath: string): 'methodology' | 'template' | 'artifact' | 'reference' {
  if (relPath.includes('/methodologies/')) return 'methodology';
  if (relPath.includes('/templates/')) return 'template';
  if (relPath.includes('/daily/')) return 'artifact';
  return 'reference';
}

/**
 * Resolve the localized kind word for a given path and language.
 *
 * @param relPath - Repository-relative Markdown path
 * @param lang    - Target language code
 * @returns Localized kind word (e.g. `'methodology'`, `'mall'`, `'템플릿'`)
 */
function kindWord(relPath: string, lang: LanguageCode): string {
  const kind = inferKind(relPath);
  if (kind === 'methodology') return getFromRecord(KIND_WORDS_METHODOLOGY, lang);
  if (kind === 'template') return getFromRecord(KIND_WORDS_TEMPLATE, lang);
  if (kind === 'artifact') return getFromRecord(KIND_WORDS_ARTIFACT, lang);
  return getFromRecord(KIND_WORDS_REFERENCE, lang);
}

/**
 * Look up a value in a {@link Record} keyed by {@link LanguageCode}, falling
 * back to the English entry if the requested language is not present.
 * Uses a small allowlist pattern to satisfy `security/detect-object-injection`.
 *
 * @param record - Lookup table keyed by language code
 * @param lang   - Language code to resolve (or `'en'` fallback)
 * @returns The resolved string (never empty for well-formed records)
 */
export function getFromRecord<T extends Record<LanguageCode, string>>(
  record: T,
  lang: LanguageCode
): string {
  return record[lang] ?? record.en;
}

/**
 * Build the localized generic fallback sentence for a file the curated
 * table does not know about (or whose curated entry has no per-language
 * description).
 *
 * @param relPath - Repo-relative path to the Markdown file
 * @param lang    - Target language
 * @param title   - Localized title of the file (already resolved via
 *                  `getCuratedTitle`) used to make the fallback sentence
 *                  meaningful even when no curated description exists
 * @returns Fully localized description sentence
 */
export function buildGenericFallback(relPath: string, lang: LanguageCode, title: string): string {
  const template = GENERIC_FALLBACK_I18N[lang] ?? GENERIC_FALLBACK_I18N.en;
  const kind = kindWord(relPath, lang);
  return template.replace('{title}', title).replace('{kind}', kind);
}
