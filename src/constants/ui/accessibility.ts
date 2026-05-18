// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/UI/Accessibility
 * @description Localized accessibility chrome — skip-link text, language switcher ARIA labels, TOC labels, and footer trust-badge ARIA labels.
 */

import type { LanguageMap } from '../../types/index.js';
export const SKIP_LINK_TEXTS: LanguageMap = {
  en: 'Skip to main content',
  sv: 'Hoppa till huvudinnehåll',
  da: 'Spring til hovedindhold',
  no: 'Hopp til hovedinnhold',
  fi: 'Siirry pääsisältöön',
  de: 'Zum Hauptinhalt springen',
  fr: 'Aller au contenu principal',
  es: 'Ir al contenido principal',
  nl: 'Ga naar hoofdinhoud',
  ar: 'انتقل إلى المحتوى الرئيسي',
  he: 'דלג לתוכן הראשי',
  ja: 'メインコンテンツへスキップ',
  ko: '본문으로 건너뛰기',
  zh: '跳至主要内容',
};

/** Table-of-contents ARIA label per language */
export const TOC_ARIA_LABELS: LanguageMap = {
  en: 'Table of contents',
  sv: 'Innehållsförteckning',
  da: 'Indholdsfortegnelse',
  no: 'Innholdsfortegnelse',
  fi: 'Sisällysluettelo',
  de: 'Inhaltsverzeichnis',
  fr: 'Table des matières',
  es: 'Tabla de contenidos',
  nl: 'Inhoudsopgave',
  ar: 'جدول المحتويات',
  he: 'תוכן עניינים',
  ja: '目次',
  ko: '목차',
  zh: '目录',
};

/* ─── Language selector localisation ──────────────────────────────────────── */

/** Aria-label for the language selector control */
export const LANGUAGE_SELECTION_ARIA_LABELS: LanguageMap = {
  en: 'Language selection',
  sv: 'Språkval',
  da: 'Sprogvalg',
  no: 'Språkvalg',
  fi: 'Kielivalinta',
  de: 'Sprachauswahl',
  fr: 'Sélection de la langue',
  es: 'Selección de idioma',
  nl: 'Taalkeuze',
  ar: 'اختيار اللغة',
  he: 'בחירת שפה',
  ja: '言語選択',
  ko: '언어 선택',
  zh: '语言选择',
};

/** Aria-label for the cluster of project trust / quality badges in the footer. */
export const FOOTER_TRUST_BADGES_ARIA_LABELS: LanguageMap = {
  en: 'Project trust badges',
  sv: 'Projektets förtroendebadges',
  da: 'Projektets tillidsbadges',
  no: 'Prosjektets tillitsbadges',
  fi: 'Projektin luottamusmerkit',
  de: 'Projekt-Vertrauensabzeichen',
  fr: 'Badges de confiance du projet',
  es: 'Insignias de confianza del proyecto',
  nl: 'Vertrouwensbadges van het project',
  ar: 'شارات الثقة بالمشروع',
  he: 'תגי אמון של הפרויקט',
  ja: 'プロジェクトの信頼バッジ',
  ko: '프로젝트 신뢰 배지',
  zh: '项目信任徽章',
};

/** Short company tagline shown under the About paragraph in the footer. */
