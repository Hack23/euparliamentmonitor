// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/UI/PWALabels
 * @description Localized labels for the PWA install/update prompts, offline shell, and build-info footer line.
 */

import type { LanguageMap } from '../../types/index.js';
export const INSTALL_APP_LABELS: LanguageMap = {
  en: 'Install app',
  sv: 'Installera app',
  da: 'Installer app',
  no: 'Installer app',
  fi: 'Asenna sovellus',
  de: 'App installieren',
  fr: "Installer l'application",
  es: 'Instalar aplicación',
  nl: 'App installeren',
  ar: 'تثبيت التطبيق',
  he: 'התקן את האפליקציה',
  ja: 'アプリをインストール',
  ko: '앱 설치',
  zh: '安装应用',
};

/** Toast message shown when a newer build of the site is detected. */
export const UPDATE_AVAILABLE_LABELS: LanguageMap = {
  en: 'Updated content available',
  sv: 'Uppdaterat innehåll tillgängligt',
  da: 'Opdateret indhold tilgængeligt',
  no: 'Oppdatert innhold tilgjengelig',
  fi: 'Päivitetty sisältö saatavilla',
  de: 'Aktualisierte Inhalte verfügbar',
  fr: 'Contenu mis à jour disponible',
  es: 'Contenido actualizado disponible',
  nl: 'Bijgewerkte inhoud beschikbaar',
  ar: 'يتوفر محتوى محدث',
  he: 'תוכן מעודכן זמין',
  ja: '最新のコンテンツが利用可能です',
  ko: '업데이트된 콘텐츠가 있습니다',
  zh: '有可用的更新内容',
};

/** "Refresh" CTA on the update toast — reloads the page. */
export const UPDATE_REFRESH_CTA_LABELS: LanguageMap = {
  en: 'Refresh',
  sv: 'Uppdatera',
  da: 'Opdater',
  no: 'Oppdater',
  fi: 'Päivitä',
  de: 'Aktualisieren',
  fr: 'Actualiser',
  es: 'Actualizar',
  nl: 'Vernieuwen',
  ar: 'تحديث',
  he: 'רענן',
  ja: '更新',
  ko: '새로고침',
  zh: '刷新',
};

/** "Dismiss" aria-label on the update toast close button. */
export const UPDATE_DISMISS_LABELS: LanguageMap = {
  en: 'Dismiss',
  sv: 'Stäng',
  da: 'Luk',
  no: 'Lukk',
  fi: 'Sulje',
  de: 'Schließen',
  fr: 'Fermer',
  es: 'Cerrar',
  nl: 'Sluiten',
  ar: 'إغلاق',
  he: 'סגור',
  ja: '閉じる',
  ko: '닫기',
  zh: '关闭',
};

/** Offline page title. */
export const OFFLINE_TITLE_LABELS: LanguageMap = {
  en: "You're offline",
  sv: 'Du är offline',
  da: 'Du er offline',
  no: 'Du er frakoblet',
  fi: 'Olet offline-tilassa',
  de: 'Sie sind offline',
  fr: 'Vous êtes hors ligne',
  es: 'Estás sin conexión',
  nl: 'Je bent offline',
  ar: 'أنت غير متصل',
  he: 'אתה במצב לא מקוון',
  ja: 'オフラインです',
  ko: '오프라인 상태입니다',
  zh: '您当前处于离线状态',
};

/** Offline page body explaining the situation. */
export const OFFLINE_BODY_LABELS: LanguageMap = {
  en: "EU Parliament Monitor is unavailable while you're offline. Reconnect to load the latest political intelligence.",
  sv: 'EU Parliament Monitor är otillgänglig medan du är offline. Anslut igen för att läsa den senaste politiska underrättelsen.',
  da: 'EU Parliament Monitor er utilgængelig, mens du er offline. Opret forbindelse igen for at hente den nyeste politiske efterretning.',
  no: 'EU Parliament Monitor er utilgjengelig mens du er frakoblet. Koble til på nytt for å laste inn den nyeste politiske etterretningen.',
  fi: 'EU Parliament Monitor ei ole käytettävissä, kun olet offline-tilassa. Yhdistä uudelleen ladataksesi uusimman poliittisen tiedustelun.',
  de: 'EU Parliament Monitor ist offline nicht verfügbar. Stellen Sie die Verbindung wieder her, um die neuesten politischen Informationen zu laden.',
  fr: 'EU Parliament Monitor est indisponible hors ligne. Reconnectez-vous pour charger les dernières informations politiques.',
  es: 'EU Parliament Monitor no está disponible sin conexión. Vuelve a conectarte para cargar la última inteligencia política.',
  nl: 'EU Parliament Monitor is offline niet beschikbaar. Maak opnieuw verbinding om de laatste politieke intelligentie te laden.',
  ar: 'مراقب البرلمان الأوروبي غير متوفر أثناء عدم الاتصال. أعد الاتصال لتحميل أحدث المعلومات السياسية.',
  he: 'EU Parliament Monitor אינו זמין במצב לא מקוון. התחבר מחדש כדי לטעון את המודיעין הפוליטי העדכני ביותר.',
  ja: 'オフライン中は EU Parliament Monitor を利用できません。再接続して最新の政治情報を読み込んでください。',
  ko: '오프라인 상태에서는 EU Parliament Monitor를 이용할 수 없습니다. 다시 연결하여 최신 정치 정보를 불러오세요.',
  zh: '您处于离线状态,无法使用 EU Parliament Monitor。重新连接以加载最新的政治情报。',
};

/** "Try again" button on the offline page. */
export const OFFLINE_RETRY_LABELS: LanguageMap = {
  en: 'Try again',
  sv: 'Försök igen',
  da: 'Prøv igen',
  no: 'Prøv igjen',
  fi: 'Yritä uudelleen',
  de: 'Erneut versuchen',
  fr: 'Réessayer',
  es: 'Intentar de nuevo',
  nl: 'Opnieuw proberen',
  ar: 'حاول مرة أخرى',
  he: 'נסה שוב',
  ja: '再試行',
  ko: '다시 시도',
  zh: '重试',
};

/** "Build" label for the build-id link in the footer. */
export const BUILD_INFO_COMMIT_LABELS: LanguageMap = {
  en: 'Build',
  sv: 'Bygg',
  da: 'Build',
  no: 'Build',
  fi: 'Build',
  de: 'Build',
  fr: 'Build',
  es: 'Build',
  nl: 'Build',
  ar: 'البناء',
  he: 'בנייה',
  ja: 'ビルド',
  ko: '빌드',
  zh: '构建',
};

/** "Deployed" label preceding the build timestamp in the footer. */
export const BUILD_INFO_DEPLOYED_LABELS: LanguageMap = {
  en: 'Deployed',
  sv: 'Driftsatt',
  da: 'Implementeret',
  no: 'Distribuert',
  fi: 'Julkaistu',
  de: 'Veröffentlicht',
  fr: 'Déployé',
  es: 'Desplegado',
  nl: 'Geïmplementeerd',
  ar: 'تم النشر',
  he: 'נפרס',
  ja: 'デプロイ済み',
  ko: '배포됨',
  zh: '已部署',
};

/* ─── Header CTAs (Sponsor / Become a sponsor / Security commitment) ── */

/** Sponsor CTA in the sticky site header. */
