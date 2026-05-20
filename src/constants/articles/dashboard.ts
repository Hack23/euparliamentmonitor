// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/Articles/Dashboard
 * @description Dashboard article strings and dashboard builder strings (14 languages).
 *
 * Per-language strings live together so a translator can update one language
 * for this article type without touching any other article type.
 */

import type { LanguageMap, DashboardStrings, DashboardBuilderStrings } from '../../types/index.js';
export const DASHBOARD_STRINGS: LanguageMap<DashboardStrings> = {
  en: {
    sectionHeading: 'Dashboard',
    trendPrefix: 'Trend:',
    trendUp: 'increasing',
    trendDown: 'decreasing',
    trendStable: 'stable',
    noChartData: 'No chart data available',
    chartLabel: 'Chart',
    categoryLabel: 'Category',
  },
  sv: {
    sectionHeading: 'Instrumentpanel',
    trendPrefix: 'Trend:',
    trendUp: 'ökande',
    trendDown: 'minskande',
    trendStable: 'stabil',
    noChartData: 'Ingen diagramdata tillgänglig',
    chartLabel: 'Diagram',
    categoryLabel: 'Kategori',
  },
  da: {
    sectionHeading: 'Dashboard',
    trendPrefix: 'Tendens:',
    trendUp: 'stigende',
    trendDown: 'faldende',
    trendStable: 'stabil',
    noChartData: 'Ingen diagramdata tilgængelig',
    chartLabel: 'Diagram',
    categoryLabel: 'Kategori',
  },
  no: {
    sectionHeading: 'Dashbord',
    trendPrefix: 'Trend:',
    trendUp: 'stigende',
    trendDown: 'fallende',
    trendStable: 'stabil',
    noChartData: 'Ingen diagramdata tilgjengelig',
    chartLabel: 'Diagram',
    categoryLabel: 'Kategori',
  },
  fi: {
    sectionHeading: 'Koontinäyttö',
    trendPrefix: 'Trendi:',
    trendUp: 'nouseva',
    trendDown: 'laskeva',
    trendStable: 'vakaa',
    noChartData: 'Ei kaaviotietoja saatavilla',
    chartLabel: 'Kaavio',
    categoryLabel: 'Luokka',
  },
  de: {
    sectionHeading: 'Dashboard',
    trendPrefix: 'Trend:',
    trendUp: 'steigend',
    trendDown: 'fallend',
    trendStable: 'stabil',
    noChartData: 'Keine Diagrammdaten verfügbar',
    chartLabel: 'Diagramm',
    categoryLabel: 'Kategorie',
  },
  fr: {
    sectionHeading: 'Tableau de bord',
    trendPrefix: 'Tendance\u00a0:',
    trendUp: 'en hausse',
    trendDown: 'en baisse',
    trendStable: 'stable',
    noChartData: 'Aucune donnée graphique disponible',
    chartLabel: 'Graphique',
    categoryLabel: 'Catégorie',
  },
  es: {
    sectionHeading: 'Panel de control',
    trendPrefix: 'Tendencia:',
    trendUp: 'creciente',
    trendDown: 'decreciente',
    trendStable: 'estable',
    noChartData: 'No hay datos de gráfico disponibles',
    chartLabel: 'Gráfico',
    categoryLabel: 'Categoría',
  },
  nl: {
    sectionHeading: 'Dashboard',
    trendPrefix: 'Trend:',
    trendUp: 'stijgend',
    trendDown: 'dalend',
    trendStable: 'stabiel',
    noChartData: 'Geen grafiekgegevens beschikbaar',
    chartLabel: 'Grafiek',
    categoryLabel: 'Categorie',
  },
  ar: {
    sectionHeading: 'لوحة المعلومات',
    trendPrefix: 'الاتجاه:',
    trendUp: 'تصاعدي',
    trendDown: 'تنازلي',
    trendStable: 'مستقر',
    noChartData: 'لا تتوفر بيانات الرسم البياني',
    chartLabel: 'رسم بياني',
    categoryLabel: 'فئة',
  },
  he: {
    sectionHeading: 'לוח מחוונים',
    trendPrefix: 'מגמה:',
    trendUp: 'עולה',
    trendDown: 'יורד',
    trendStable: 'יציב',
    noChartData: 'אין נתוני תרשים זמינים',
    chartLabel: 'תרשים',
    categoryLabel: 'קטגוריה',
  },
  ja: {
    sectionHeading: 'ダッシュボード',
    trendPrefix: 'トレンド:',
    trendUp: '上昇',
    trendDown: '下降',
    trendStable: '安定',
    noChartData: 'チャートデータがありません',
    chartLabel: 'チャート',
    categoryLabel: 'カテゴリ',
  },
  ko: {
    sectionHeading: '대시보드',
    trendPrefix: '추세:',
    trendUp: '상승',
    trendDown: '하락',
    trendStable: '안정',
    noChartData: '차트 데이터 없음',
    chartLabel: '차트',
    categoryLabel: '카테고리',
  },
  zh: {
    sectionHeading: '仪表板',
    trendPrefix: '趋势：',
    trendUp: '上升',
    trendDown: '下降',
    trendStable: '稳定',
    noChartData: '无图表数据',
    chartLabel: '图表',
    categoryLabel: '类别',
  },
};

// ─── SWOT Builder Strings ────────────────────────────────────────────────────

/**
 * Localized strings used by the 5 SWOT builder functions in analysis-builders.
 * Template functions accept dynamic counts; plain strings are static prose.
 */
import { DASHBOARD_BUILDER_STRINGS } from './dashboard/index.js';

export { DASHBOARD_BUILDER_STRINGS };

// ─── Month-in-Review section heading strings ──────────────────────────────────

/** Section headings for month-in-review articles, localized to all 14 languages */
