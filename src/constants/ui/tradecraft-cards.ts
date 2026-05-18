// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/UI/TradecraftCards
 * @description Localized tradecraft and analysis-index card labels surfaced on the methodology / analysis-index pages.
 */

import type { LanguageMap } from '../../types/index.js';
export const TRADECRAFT_HEADING_LABELS: LanguageMap = {
  en: 'Tradecraft References',
  sv: 'Tradecraft-referenser',
  da: 'Tradecraft-referencer',
  no: 'Tradecraft-referanser',
  fi: 'Tradecraft-viitteet',
  de: 'Tradecraft-Referenzen',
  fr: 'Références méthodologiques',
  es: 'Referencias de tradecraft',
  nl: 'Tradecraft-referenties',
  ar: 'مراجع الحِرَف الاستخباراتية',
  he: 'הפניות מקצועיות',
  ja: 'トレードクラフト参考文献',
  ko: '트레이드크래프트 참고문헌',
  zh: '情报技术参考',
};

/** Localized description for the Tradecraft References appendix */
export const TRADECRAFT_INTRO_LABELS: LanguageMap = {
  en: 'This article is produced under the Hack23 AB intelligence tradecraft library. Every methodology and artifact template applied to this run is linked below.',
  sv: 'Denna artikel produceras inom Hack23 AB:s underrättelsebibliotek. Varje metod och artefaktmall som tillämpats i denna körning finns länkad nedan.',
  da: 'Denne artikel er produceret under Hack23 AB\u2019s efterretningsbibliotek. Enhver metode og artefaktskabelon, der er anvendt i denne kørsel, er linket nedenfor.',
  no: 'Denne artikkelen er produsert under Hack23 ABs etterretningsbibliotek. Hver metode og artefaktmal som er brukt i denne kjøringen er lenket nedenfor.',
  fi: 'Tämä artikkeli on tuotettu Hack23 AB:n tiedustelumenetelmäkirjaston avulla. Jokainen tässä ajossa käytetty menetelmä ja artefaktimalli on linkitetty alla.',
  de: 'Dieser Artikel wurde unter der Hack23 AB Intelligence-Tradecraft-Bibliothek erstellt. Jede angewandte Methodik und Artefaktvorlage ist unten verlinkt.',
  fr: "Cet article est produit avec la bibliothèque méthodologique de renseignement de Hack23 AB. Chaque méthodologie et modèle d'artefact appliqué est lié ci-dessous.",
  es: 'Este artículo se produce bajo la biblioteca de tradecraft de inteligencia de Hack23 AB. Cada metodología y plantilla de artefacto aplicada se enlaza a continuación.',
  nl: 'Dit artikel is geproduceerd met de Hack23 AB intelligence tradecraft-bibliotheek. Elke toegepaste methodologie en artefactsjabloon is hieronder gekoppeld.',
  ar: 'أُنتج هذا المقال وفق مكتبة الحِرَف الاستخباراتية لشركة Hack23 AB. كل منهجية وقالب مواد مطبَّق مرتبط أدناه.',
  he: 'מאמר זה מיוצר תחת ספריית המקצועיות המודיעינית של Hack23 AB. כל מתודולוגיה ותבנית ממצא שהופעלו מקושרים למטה.',
  ja: 'この記事は Hack23 AB のインテリジェンス・トレードクラフト・ライブラリに基づいて作成されています。適用された全ての方法論とアーティファクトテンプレートを以下にリンクします。',
  ko: '이 기사는 Hack23 AB 인텔리전스 트레이드크래프트 라이브러리에 따라 제작되었습니다. 이번 실행에 적용된 모든 방법론과 아티팩트 템플릿이 아래에 연결되어 있습니다.',
  zh: '本文基于 Hack23 AB 情报技术库制作。本次运行中应用的所有方法论和工件模板均链接如下。',
};

/** Localized sub-heading for Methodologies */
export const TRADECRAFT_METHODOLOGIES_LABELS: LanguageMap = {
  en: 'Methodologies',
  sv: 'Metoder',
  da: 'Metoder',
  no: 'Metoder',
  fi: 'Menetelmät',
  de: 'Methoden',
  fr: 'Méthodologies',
  es: 'Metodologías',
  nl: 'Methodologieën',
  ar: 'المنهجيات',
  he: 'מתודולוגיות',
  ja: '方法論',
  ko: '방법론',
  zh: '方法论',
};

/** Localized sub-heading for Artifact templates */
export const TRADECRAFT_TEMPLATES_LABELS: LanguageMap = {
  en: 'Artifact templates',
  sv: 'Artefaktmallar',
  da: 'Artefaktskabeloner',
  no: 'Artefaktmaler',
  fi: 'Artefaktimallit',
  de: 'Artefaktvorlagen',
  fr: "Modèles d'artefacts",
  es: 'Plantillas de artefactos',
  nl: 'Artefactsjablonen',
  ar: 'قوالب المواد',
  he: 'תבניות ממצאים',
  ja: 'アーティファクトテンプレート',
  ko: '아티팩트 템플릿',
  zh: '工件模板',
};

/** Localized heading for the Analysis Index appendix */
export const ANALYSIS_INDEX_HEADING_LABELS: LanguageMap = {
  en: 'Analysis Index',
  sv: 'Analysindex',
  da: 'Analyseindeks',
  no: 'Analyseindeks',
  fi: 'Analyysihakemisto',
  de: 'Analyseindex',
  fr: "Index d'analyse",
  es: 'Índice de análisis',
  nl: 'Analyse-index',
  ar: 'فهرس التحليل',
  he: 'מפתח ניתוח',
  ja: '分析インデックス',
  ko: '분석 색인',
  zh: '分析索引',
};

/**
 * Localized description for the Analysis Index appendix.
 * NOTE: Every translation MUST contain the literal substring "manifest.json"
 * — the HTML renderer injects a link around it at render time.
 */
export const ANALYSIS_INDEX_INTRO_LABELS: LanguageMap = {
  en: 'Every artifact below was read by the aggregator and contributed to this article. The raw manifest.json carries the full machine-readable list, including gate-result history.',
  sv: 'Varje artefakt nedan lästes av aggregeraren och bidrog till denna artikel. Rå manifest.json innehåller den fullständiga maskinläsbara listan, inklusive gate-resultathistorik.',
  da: 'Enhver artefakt nedenfor blev læst af aggregatoren og bidrog til denne artikel. Den rå manifest.json indeholder den fulde maskinlæsbare liste, inklusive gate-resultathistorik.',
  no: 'Hver artefakt nedenfor ble lest av aggregatoren og bidro til denne artikkelen. Rå manifest.json inneholder den fullstendige maskinlesbare listen, inkludert gate-resultathistorikk.',
  fi: 'Aggregaattori luki jokaisen alla olevan artefaktin ja ne kaikki vaikuttivat tähän artikkeliin. Raaka manifest.json sisältää täydellisen koneluettavan listan, mukaan lukien gate-tuloshistorian.',
  de: 'Jedes Artefakt unten wurde vom Aggregator gelesen und hat zu diesem Artikel beigetragen. Die rohe manifest.json enthält die vollständige maschinenlesbare Liste einschließlich der Gate-Ergebnishistorie.',
  fr: "Chaque artefact ci-dessous a été lu par l'agrégateur et a contribué à cet article. Le fichier manifest.json brut contient la liste complète lisible par machine, y compris l'historique des résultats de validation.",
  es: 'Cada artefacto a continuación fue leído por el agregador y contribuyó a este artículo. El archivo manifest.json sin procesar contiene la lista completa legible por máquina, incluido el historial de resultados de validación.',
  nl: 'Elk artefact hieronder werd gelezen door de aggregator en droeg bij aan dit artikel. Het ruwe manifest.json-bestand bevat de volledige machineleesbare lijst, inclusief de gate-resultaatgeschiedenis.',
  ar: 'كل مادة أدناه قرأها المجمِّع وأسهمت في هذا المقال. يحمل ملف manifest.json الخام القائمة الكاملة القابلة للقراءة آليًا، بما في ذلك تاريخ نتائج البوابة.',
  he: 'כל ממצא למטה נקרא על ידי המאגד ותרם למאמר זה. קובץ manifest.json הגולמי מכיל את הרשימה המלאה הניתנת לקריאה ממוכנת, כולל היסטוריית תוצאות השער.',
  ja: '以下の全アーティファクトはアグリゲーターによって読み取られ、本記事に寄与しました。生の manifest.json にはゲート結果履歴を含む完全な機械可読リストが含まれています。',
  ko: '아래의 모든 아티팩트는 애그리게이터에 의해 읽혀 이 기사에 기여했습니다. 원시 manifest.json에는 게이트 결과 이력을 포함한 전체 기계 판독 가능 목록이 포함되어 있습니다.',
  zh: '以下每个工件均由聚合器读取并为本文做出了贡献。原始 manifest.json 包含完整的机器可读列表，包括门控结果历史。',
};

/** Localized table header: "Section" */
export const ANALYSIS_INDEX_COL_SECTION_LABELS: LanguageMap = {
  en: 'Section',
  sv: 'Avsnitt',
  da: 'Afsnit',
  no: 'Seksjon',
  fi: 'Osio',
  de: 'Abschnitt',
  fr: 'Section',
  es: 'Sección',
  nl: 'Sectie',
  ar: 'القسم',
  he: 'סעיף',
  ja: 'セクション',
  ko: '섹션',
  zh: '章节',
};

/** Localized table header: "Artifact" */
export const ANALYSIS_INDEX_COL_ARTIFACT_LABELS: LanguageMap = {
  en: 'Artifact',
  sv: 'Artefakt',
  da: 'Artefakt',
  no: 'Artefakt',
  fi: 'Artefakti',
  de: 'Artefakt',
  fr: 'Artefact',
  es: 'Artefacto',
  nl: 'Artefact',
  ar: 'المادة',
  he: 'ממצא',
  ja: 'アーティファクト',
  ko: '아티팩트',
  zh: '工件',
};

/** Localized table header: "Path" */
export const ANALYSIS_INDEX_COL_PATH_LABELS: LanguageMap = {
  en: 'Path',
  sv: 'Sökväg',
  da: 'Sti',
  no: 'Sti',
  fi: 'Polku',
  de: 'Pfad',
  fr: 'Chemin',
  es: 'Ruta',
  nl: 'Pad',
  ar: 'المسار',
  he: 'נתיב',
  ja: 'パス',
  ko: '경로',
  zh: '路径',
};

/** Localized "View source code on GitHub" label for the source-link UI */
export const VIEW_SOURCE_LABELS: LanguageMap = {
  en: 'View source code on GitHub',
  sv: 'Visa källkod på GitHub',
  da: 'Se kildekode på GitHub',
  no: 'Se kildekode på GitHub',
  fi: 'Näytä lähdekoodi GitHubissa',
  de: 'Quellcode auf GitHub anzeigen',
  fr: 'Voir le code source sur GitHub',
  es: 'Ver código fuente en GitHub',
  nl: 'Broncode bekijken op GitHub',
  ar: 'عرض الكود المصدري على GitHub',
  he: 'הצג קוד מקור ב-GitHub',
  ja: 'GitHubでソースコードを表示',
  ko: 'GitHub에서 소스 코드 보기',
  zh: '在GitHub上查看源代码',
};

/** Localized open-source note labels */
export const OPEN_SOURCE_NOTE_LABELS: LanguageMap = {
  en: 'Apache-2.0 licensed open-source project',
  sv: 'Apache-2.0-licensierat projekt med öppen källkod',
  da: 'Apache-2.0-licenseret open source-projekt',
  no: 'Apache-2.0-lisensiert åpen kildekode-prosjekt',
  fi: 'Apache-2.0-lisensoitu avoimen lähdekoodin projekti',
  de: 'Apache-2.0-lizenziertes Open-Source-Projekt',
  fr: 'Projet open source sous licence Apache-2.0',
  es: 'Proyecto de código abierto con licencia Apache-2.0',
  nl: 'Apache-2.0-gelicenseerd open-sourceproject',
  ar: 'مشروع مفتوح المصدر بترخيص Apache-2.0',
  he: 'פרויקט קוד פתוח ברישיון Apache-2.0',
  ja: 'Apache-2.0ライセンスのオープンソースプロジェクト',
  ko: 'Apache-2.0 라이센스 오픈 소스 프로젝트',
  zh: 'Apache-2.0 许可的开源项目',
};

/** Localized AI analysis guide labels */
export const VIEW_SOURCE_MARKDOWN_LABELS: LanguageMap = {
  en: 'View source Markdown',
  sv: 'Visa Markdown-källa',
  da: 'Vis Markdown-kilde',
  no: 'Vis Markdown-kilde',
  fi: 'Näytä Markdown-lähde',
  de: 'Markdown-Quelle anzeigen',
  fr: 'Voir la source Markdown',
  es: 'Ver fuente Markdown',
  nl: 'Markdown-bron bekijken',
  ar: 'عرض مصدر Markdown',
  he: 'הצג מקור Markdown',
  ja: 'Markdownソースを表示',
  ko: 'Markdown 소스 보기',
  zh: '查看 Markdown 源文件',
};

/** Icons (emoji) for each article type to improve visual recognition */
