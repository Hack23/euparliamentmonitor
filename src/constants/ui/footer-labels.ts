// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/UI/FooterLabels
 * @description Localized footer chrome — about, quick links, copyright, footer navigation, trust badges, and per-section footer links.
 */

import type { LanguageMap } from '../../types/index.js';

/** Shared Scandinavian "About EU Parliament Monitor" label (sv/da/no) */
const ABOUT_HEADING_NORDIC = 'Om EU Parliament Monitor';

export const FOOTER_ABOUT_HEADING_LABELS: LanguageMap = {
  en: 'About EU Parliament Monitor',
  sv: ABOUT_HEADING_NORDIC,
  da: ABOUT_HEADING_NORDIC,
  no: ABOUT_HEADING_NORDIC,
  fi: 'Tietoa EU Parliament Monitorista',
  de: '\u00dcber EU Parliament Monitor',
  fr: '\u00c0 propos du EU Parliament Monitor',
  es: 'Acerca del EU Parliament Monitor',
  nl: 'Over EU Parliament Monitor',
  ar: '\u062d\u0648\u0644 EU Parliament Monitor',
  he: '\u05d0\u05d5\u05d3\u05d5\u05ea EU Parliament Monitor',
  ja: 'EU Parliament Monitor\u306b\u3064\u3044\u3066',
  ko: 'EU Parliament Monitor \uc18c\uac1c',
  zh: '\u5173\u4e8e EU Parliament Monitor',
};

/** "About" footer description text per language */
export const FOOTER_ABOUT_TEXT_LABELS: LanguageMap = {
  en: 'European Parliament Intelligence Platform \u2014 monitoring political activity with systematic transparency. Powered by European Parliament open data.',
  sv: 'Europ\u00e4isk parlamentarisk underr\u00e4ttelseplattform \u2014 \u00f6vervakar politisk verksamhet med systematisk \u00f6ppenhet. Drivs av Europaparlamentets \u00f6ppna data.',
  da: 'Europ\u00e6isk parlamentarisk efterretningsplatform \u2014 overv\u00e5ger politisk aktivitet med systematisk gennemsigtighed. Drevet af Europa-Parlamentets \u00e5bne data.',
  no: 'Europeisk parlamentarisk etterretningsplattform \u2014 overv\u00e5ker politisk aktivitet med systematisk \u00e5penhet. Drevet av Europaparlamentets \u00e5pne data.',
  fi: 'Euroopan parlamentin tiedustelualusta \u2014 seuraa poliittista toimintaa j\u00e4rjestelm\u00e4llisell\u00e4 avoimuudella. Perustuu Euroopan parlamentin avoimeen dataan.',
  de: 'Europ\u00e4ische Parlamentsnachrichten-Plattform \u2014 \u00dcberwachung politischer Aktivit\u00e4ten mit systematischer Transparenz. Angetrieben von offenen Daten des Europ\u00e4ischen Parlaments.',
  fr: "Plateforme de renseignements du Parlement europ\u00e9en \u2014 surveillance de l'activit\u00e9 politique avec une transparence syst\u00e9matique. Aliment\u00e9e par les donn\u00e9es ouvertes du Parlement europ\u00e9en.",
  es: 'Plataforma de inteligencia del Parlamento Europeo \u2014 monitorizando la actividad pol\u00edtica con transparencia sistem\u00e1tica. Impulsada por datos abiertos del Parlamento Europeo.',
  nl: 'Europees parlementair inlichtingenplatform \u2014 monitoring van politieke activiteit met systematische transparantie. Aangedreven door open data van het Europees Parlement.',
  ar: '\u0645\u0646\u0635\u0629 \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u0628\u0631\u0644\u0645\u0627\u0646 \u0627\u0644\u0623\u0648\u0631\u0648\u0628\u064a \u2014 \u0631\u0635\u062f \u0627\u0644\u0646\u0634\u0627\u0637 \u0627\u0644\u0633\u064a\u0627\u0633\u064a \u0628\u0634\u0641\u0627\u0641\u064a\u0629 \u0645\u0646\u0647\u062c\u064a\u0629. \u0645\u062f\u0639\u0648\u0645\u0629 \u0628\u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0645\u0641\u062a\u0648\u062d\u0629 \u0644\u0644\u0628\u0631\u0644\u0645\u0627\u0646 \u0627\u0644\u0623\u0648\u0631\u0648\u0628\u064a.',
  he: '\u05e4\u05dc\u05d8\u05e4\u05d5\u05e8\u05de\u05ea \u05de\u05d9\u05d3\u05e2 \u05d4\u05e4\u05e8\u05dc\u05de\u05e0\u05d8 \u05d4\u05d0\u05d9\u05e8\u05d5\u05e4\u05d9 \u2014 \u05e0\u05d9\u05d8\u05d5\u05e8 \u05e4\u05e2\u05d9\u05dc\u05d5\u05ea \u05e4\u05d5\u05dc\u05d9\u05d8\u05d9\u05ea \u05d1\u05e9\u05e7\u05d9\u05e4\u05d5\u05ea \u05e9\u05d9\u05d8\u05ea\u05d9\u05ea. \u05de\u05d5\u05e0\u05e2 \u05e2\u05dc \u05d9\u05d3\u05d9 \u05e0\u05ea\u05d5\u05e0\u05d9\u05dd \u05e4\u05ea\u05d5\u05d7\u05d9\u05dd \u05e9\u05dc \u05d4\u05e4\u05e8\u05dc\u05de\u05e0\u05d8 \u05d4\u05d0\u05d9\u05e8\u05d5\u05e4\u05d9.',
  ja: '\u6b27\u5dde\u8b70\u4f1a\u60c5\u5831\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0 \u2014 \u7d44\u7e54\u7684\u306a\u900f\u660e\u6027\u3067\u653f\u6cbb\u6d3b\u52d5\u3092\u76e3\u8996\u3002\u6b27\u5dde\u8b70\u4f1a\u306e\u30aa\u30fc\u30d7\u30f3\u30c7\u30fc\u30bf\u306b\u3088\u308b\u3002',
  ko: '\uc720\ub7fd \uc758\ud68c \uc778\ud154\ub9ac\uc804\uc2a4 \ud50c\ub7ab\ud3fc \u2014 \uccb4\uacc4\uc801\uc778 \ud22c\uba85\uc131\uc73c\ub85c \uc815\uce58 \ud65c\ub3d9\uc744 \ubaa8\ub2c8\ud130\ub9c1. \uc720\ub7fd \uc758\ud68c \uacf5\uac1c \ub370\uc774\ud130\ub97c \uae30\ubc18\uc73c\ub85c \ud568.',
  zh: '\u6b27\u6d32\u8bae\u4f1a\u60c5\u62a5\u5e73\u53f0 \u2014 \u4ee5\u7cfb\u7edf\u6027\u900f\u660e\u5ea6\u76d1\u6d4b\u653f\u6cbb\u6d3b\u52a8\u3002\u7531\u6b27\u6d32\u8bae\u4f1a\u5f00\u653e\u6570\u636e\u9a71\u52a8\u3002',
};

/** "Quick Links" footer section heading per language */
export const FOOTER_QUICK_LINKS_LABELS: LanguageMap = {
  en: 'Quick Links',
  sv: 'Snabbl\u00e4nkar',
  da: 'Hurtige links',
  no: 'Hurtiglenker',
  fi: 'Pikavalinnat',
  de: 'Schnelllinks',
  fr: 'Liens rapides',
  es: 'Enlaces r\u00e1pidos',
  nl: 'Snelle links',
  ar: '\u0631\u0648\u0627\u0628\u0637 \u0633\u0631\u064a\u0639\u0629',
  he: '\u05e7\u05d9\u05e9\u05d5\u05e8\u05d9\u05dd \u05de\u05d4\u05d9\u05e8\u05d9\u05dd',
  ja: '\u30af\u30a4\u30c3\u30af\u30ea\u30f3\u30af',
  ko: '\ube60\ub978 \ub9c1\ud06c',
  zh: '\u5feb\u901f\u94fe\u63a5',
};

/** "Built by Hack23 AB" footer section heading per language */
export const FOOTER_BUILT_BY_LABELS: LanguageMap = {
  en: 'Built by Hack23 AB',
  sv: 'Byggd av Hack23 AB',
  da: 'Bygget af Hack23 AB',
  no: 'Bygget av Hack23 AB',
  fi: 'Rakennettu Hack23 AB:n toimesta',
  de: 'Erstellt von Hack23 AB',
  fr: 'Cr\u00e9\u00e9 par Hack23 AB',
  es: 'Construido por Hack23 AB',
  nl: 'Gebouwd door Hack23 AB',
  ar: '\u0645\u0646 \u062a\u0637\u0648\u064a\u0631 Hack23 AB',
  he: '\u05e0\u05d1\u05e0\u05d4 \u05e2\u05dc \u05d9\u05d3\u05d9 Hack23 AB',
  ja: 'Hack23 AB\u306b\u3088\u308b\u958b\u767a',
  ko: 'Hack23 AB \uc81c\uc791',
  zh: '\u7531 Hack23 AB \u6784\u5efa',
};

/** "Languages" footer section heading per language */
export const FOOTER_LANGUAGES_LABELS: LanguageMap = {
  en: 'Languages',
  sv: 'Spr\u00e5k',
  da: 'Sprog',
  no: 'Spr\u00e5k',
  fi: 'Kielet',
  de: 'Sprachen',
  fr: 'Langues',
  es: 'Idiomas',
  nl: 'Talen',
  ar: '\u0627\u0644\u0644\u063a\u0627\u062a',
  he: '\u05e9\u05e4\u05d5\u05ea',
  ja: '\u8a00\u8a9e',
  ko: '\uc5b8\uc5b4',
  zh: '\u8bed\u8a00',
};

/* ─── Sources section heading ────────────────────────────────────── */

/** Localized "Sources" heading used in the article footer sources section */
export const FOOTER_HOME_LABELS: LanguageMap = {
  en: 'Home',
  sv: 'Hem',
  da: 'Hjem',
  no: 'Hjem',
  fi: 'Etusivu',
  de: 'Startseite',
  fr: 'Accueil',
  es: 'Inicio',
  nl: 'Startpagina',
  ar: 'الرئيسية',
  he: 'דף הבית',
  ja: 'ホーム',
  ko: '홈',
  zh: '主页',
};

/** Localized "Sitemap" link label used in footer Quick Links section */
export const FOOTER_SITEMAP_LABELS: LanguageMap = {
  en: 'Sitemap',
  sv: 'Webbplatskarta',
  da: 'Sitemap',
  no: 'Nettstedskart',
  fi: 'Sivukartta',
  de: 'Sitemap',
  fr: 'Plan du site',
  es: 'Mapa del sitio',
  nl: 'Sitemap',
  ar: 'خريطة الموقع',
  he: 'מפת האתר',
  ja: 'サイトマップ',
  ko: '사이트맵',
  zh: '网站地图',
};

/** Localized "RSS Feed" link label used in footer Quick Links section */
export const FOOTER_RSS_LABELS: LanguageMap = {
  en: 'RSS Feed',
  sv: 'RSS-flöde',
  da: 'RSS-feed',
  no: 'RSS-feed',
  fi: 'RSS-syöte',
  de: 'RSS-Feed',
  fr: 'Flux RSS',
  es: 'Canal RSS',
  nl: 'RSS-feed',
  ar: 'خلاصة RSS',
  he: 'עדכון RSS',
  ja: 'RSSフィード',
  ko: 'RSS 피드',
  zh: 'RSS 订阅',
};

/** Localized "GitHub Repository" link label used in footer Quick Links section */
export const FOOTER_GITHUB_REPO_LABELS: LanguageMap = {
  en: 'GitHub Repository',
  sv: 'GitHub-förvar',
  da: 'GitHub-lager',
  no: 'GitHub-lager',
  fi: 'GitHub-varasto',
  de: 'GitHub-Repository',
  fr: 'Dépôt GitHub',
  es: 'Repositorio GitHub',
  nl: 'GitHub-repository',
  ar: 'مستودع GitHub',
  he: 'מאגר GitHub',
  ja: 'GitHubリポジトリ',
  ko: 'GitHub 저장소',
  zh: 'GitHub 仓库',
};

/** Localized "Apache-2.0 License" link label used in footer Quick Links section */
export const FOOTER_LICENSE_LABELS: LanguageMap = {
  en: 'Apache-2.0 License',
  sv: 'Apache-2.0-licens',
  da: 'Apache-2.0-licens',
  no: 'Apache-2.0-lisens',
  fi: 'Apache-2.0-lisenssi',
  de: 'Apache-2.0-Lizenz',
  fr: 'Licence Apache-2.0',
  es: 'Licencia Apache-2.0',
  nl: 'Apache-2.0-licentie',
  ar: 'ترخيص Apache-2.0',
  he: 'רישיון Apache-2.0',
  ja: 'Apache-2.0ライセンス',
  ko: 'Apache-2.0 라이선스',
  zh: 'Apache-2.0 许可证',
};

/** Localized "European Parliament" link label used in footer Quick Links section */
export const FOOTER_EUROPARL_LABELS: LanguageMap = {
  en: 'European Parliament',
  sv: 'Europaparlamentet',
  da: 'Europa-Parlamentet',
  no: 'Europaparlamentet',
  fi: 'Euroopan parlamentti',
  de: 'Europäisches Parlament',
  fr: 'Parlement européen',
  es: 'Parlamento Europeo',
  nl: 'Europees Parlement',
  ar: 'البرلمان الأوروبي',
  he: 'הפרלמנט האירופי',
  ja: '欧州議会',
  ko: '유럽 의회',
  zh: '欧洲议会',
};

/** Localized "LinkedIn" link label used in footer Built by section */
export const FOOTER_LINKEDIN_LABELS: LanguageMap = {
  en: 'LinkedIn',
  sv: 'LinkedIn',
  da: 'LinkedIn',
  no: 'LinkedIn',
  fi: 'LinkedIn',
  de: 'LinkedIn',
  fr: 'LinkedIn',
  es: 'LinkedIn',
  nl: 'LinkedIn',
  ar: 'لينكدإن',
  he: 'לינקדאין',
  ja: 'LinkedIn',
  ko: 'LinkedIn',
  zh: 'LinkedIn',
};

/** Localized "Security & Privacy Policy" link label used in footer Built by section */
export const FOOTER_SECURITY_POLICY_LABELS: LanguageMap = {
  en: 'Security &amp; Privacy Policy',
  sv: 'Säkerhets- &amp; sekretesspolicy',
  da: 'Sikkerheds- &amp; privatlivspolitik',
  no: 'Sikkerhets- &amp; personvernpolicy',
  fi: 'Tietoturva- &amp; yksityisyyspolitiikka',
  de: 'Sicherheits- &amp; Datenschutzrichtlinie',
  fr: 'Politique de sécurité &amp; confidentialité',
  es: 'Política de seguridad &amp; privacidad',
  nl: 'Beveiligings- &amp; privacybeleid',
  ar: 'سياسة الأمان &amp; الخصوصية',
  he: 'מדיניות אבטחה &amp; פרטיות',
  ja: 'セキュリティ &amp; プライバシーポリシー',
  ko: '보안 &amp; 개인정보 정책',
  zh: '安全和隐私政策',
};

/** Localized "Contact" link label used in footer Built by section */
export const FOOTER_CONTACT_LABELS: LanguageMap = {
  en: 'Contact',
  sv: 'Kontakt',
  da: 'Kontakt',
  no: 'Kontakt',
  fi: 'Yhteystiedot',
  de: 'Kontakt',
  fr: 'Contact',
  es: 'Contacto',
  nl: 'Contact',
  ar: 'اتصل بنا',
  he: 'צור קשר',
  ja: 'お問い合わせ',
  ko: '문의',
  zh: '联系我们',
};

/** Localized platform disclaimer sentence used in the footer-bottom bar */
export const FOOTER_DISCLAIMER_LABELS: LanguageMap = {
  en: 'This platform is under ongoing improvement.',
  sv: 'Denna plattform förbättras löpande.',
  da: 'Denne platform forbedres løbende.',
  no: 'Denne plattformen forbedres løpende.',
  fi: 'Tätä alustaa kehitetään jatkuvasti.',
  de: 'Diese Plattform wird laufend verbessert.',
  fr: "Cette plateforme fait l'objet d'améliorations continues.",
  es: 'Esta plataforma está en mejora continua.',
  nl: 'Dit platform wordt voortdurend verbeterd.',
  ar: 'هذه المنصة في تحسين مستمر.',
  he: 'פלטפורמה זו נמצאת בשיפור מתמיד.',
  ja: 'このプラットフォームは継続的に改善されています。',
  ko: '이 플랫폼은 지속적으로 개선되고 있습니다.',
  zh: '此平台正在持续改进中。',
};

/** Localized "report any issues on GitHub" link text used in the footer disclaimer */
export const FOOTER_REPORT_ISSUES_LABELS: LanguageMap = {
  en: 'report any issues on GitHub',
  sv: 'rapportera problem på GitHub',
  da: 'rapporter problemer på GitHub',
  no: 'rapporter problemer på GitHub',
  fi: 'ilmoita ongelmista GitHubissa',
  de: 'Probleme auf GitHub melden',
  fr: 'signaler des problèmes sur GitHub',
  es: 'reportar problemas en GitHub',
  nl: 'problemen melden op GitHub',
  ar: 'الإبلاغ عن المشكلات على GitHub',
  he: 'דווח על בעיות ב-GitHub',
  ja: 'GitHubで問題を報告する',
  ko: 'GitHub에서 문제 보고',
  zh: '在GitHub上报告问题',
};

/** Localized "{count} articles available" stats text used in footer About section */
export const FOOTER_ARTICLES_AVAILABLE_LABELS: LanguageMap = {
  en: '{count} articles available',
  sv: '{count} artiklar tillgängliga',
  da: '{count} artikler tilgængelige',
  no: '{count} artikler tilgjengelige',
  fi: '{count} artikkelia saatavilla',
  de: '{count} Artikel verfügbar',
  fr: '{count} articles disponibles',
  es: '{count} artículos disponibles',
  nl: '{count} artikelen beschikbaar',
  ar: '{count} مقالة متاحة',
  he: '{count} מאמרים זמינים',
  ja: '{count}件の記事が利用可能',
  ko: '{count}개 기사 이용 가능',
  zh: '{count}篇文章可用',
};

/** Localized "Political Intelligence" link label used in footer Quick Links section */
export const FOOTER_POLITICAL_INTELLIGENCE_LABELS: LanguageMap = {
  en: 'Political Intelligence',
  sv: 'Politisk underrättelse',
  da: 'Politisk efterretning',
  no: 'Politisk etterretning',
  fi: 'Poliittinen tiedustelu',
  de: 'Politische Aufklärung',
  fr: 'Intelligence politique',
  es: 'Inteligencia política',
  nl: 'Politieke intelligentie',
  ar: 'الاستخبارات السياسية',
  he: 'מודיעין פוליטי',
  ja: '政治インテリジェンス',
  ko: '정치 정보',
  zh: '政治情报',
};

/* ─── PWA + freshness UI labels (Phase 3) ────────────────────────── */

/** "Install app" CTA label (PWA install hint). */
export const FOOTER_NEWS_LABELS: LanguageMap = {
  en: 'News',
  sv: 'Nyheter',
  da: 'Nyheder',
  no: 'Nyheter',
  fi: 'Uutiset',
  de: 'Nachrichten',
  fr: 'Actualités',
  es: 'Noticias',
  nl: 'Nieuws',
  ar: 'الأخبار',
  he: 'חדשות',
  ja: 'ニュース',
  ko: '뉴스',
  zh: '新闻',
};

/** "Dashboard" navigation label. */
export const FOOTER_DASHBOARD_LABELS: LanguageMap = {
  en: 'Dashboard',
  sv: 'Översiktspanel',
  da: 'Dashboard',
  no: 'Dashbord',
  fi: 'Hallintapaneeli',
  de: 'Dashboard',
  fr: 'Tableau de bord',
  es: 'Panel',
  nl: 'Dashboard',
  ar: 'لوحة التحكم',
  he: 'לוח בקרה',
  ja: 'ダッシュボード',
  ko: '대시보드',
  zh: '仪表板',
};

/** Shared Scandinavian "Analysis & Reports" label (sv/da/no). */
const ANALYSIS_REPORTS_NORDIC = 'Analyser \u0026 rapporter';

/** "Analysis & Reports" navigation label. */
export const FOOTER_ANALYSIS_REPORTS_LABELS: LanguageMap = {
  en: 'Analysis \u0026 Reports',
  sv: ANALYSIS_REPORTS_NORDIC,
  da: ANALYSIS_REPORTS_NORDIC,
  no: ANALYSIS_REPORTS_NORDIC,
  fi: 'Analyysit \u0026 raportit',
  de: 'Analysen \u0026 Berichte',
  fr: 'Analyses \u0026 rapports',
  es: 'Análisis e informes',
  nl: 'Analyses \u0026 rapporten',
  ar: 'التحليلات والتقارير',
  he: 'ניתוחים ודוחות',
  ja: '分析とレポート',
  ko: '분석 및 보고서',
  zh: '分析与报告',
};

/** "API Documentation" navigation label. */
export const FOOTER_API_DOCS_LABELS: LanguageMap = {
  en: 'API Documentation',
  sv: 'API-dokumentation',
  da: 'API-dokumentation',
  no: 'API-dokumentasjon',
  fi: 'API-dokumentaatio',
  de: 'API-Dokumentation',
  fr: 'Documentation API',
  es: 'Documentación de la API',
  nl: 'API-documentatie',
  ar: 'وثائق واجهة البرمجة',
  he: 'תיעוד API',
  ja: 'API ドキュメント',
  ko: 'API 문서',
  zh: 'API 文档',
};

/** Aria-label for the language switcher `<nav>` in the site header. */
export const FOOTER_COMPANY_TAGLINE_LABELS: LanguageMap = {
  en: 'Swedish cybersecurity consultancy specialising in political transparency and open-source intelligence.',
  sv: 'Svensk cybersäkerhetskonsult specialiserad på politisk transparens och öppen källkodsintelligens.',
  da: 'Svensk cybersikkerhedskonsulent specialiseret i politisk gennemsigtighed og open source-efterretning.',
  no: 'Svensk cybersikkerhetskonsulent spesialisert på politisk åpenhet og open source-etterretning.',
  fi: 'Ruotsalainen kyberturvallisuuskonsultti, joka erikoistuu poliittiseen avoimuuteen ja avoimen lähdekoodin tiedusteluun.',
  de: 'Schwedische Cybersicherheitsberatung mit Schwerpunkt auf politischer Transparenz und Open-Source-Aufklärung.',
  fr: 'Cabinet suédois de cybersécurité spécialisé dans la transparence politique et le renseignement open source.',
  es: 'Consultora sueca de ciberseguridad especializada en transparencia política e inteligencia de fuentes abiertas.',
  nl: 'Zweeds cybersecurity-adviesbureau gespecialiseerd in politieke transparantie en open source intelligence.',
  ar: 'شركة استشارات أمن سيبراني سويدية متخصصة في الشفافية السياسية والاستخبارات مفتوحة المصدر.',
  he: 'חברת ייעוץ סייבר שוודית המתמחה בשקיפות פוליטית ומודיעין ממקורות גלויים.',
  ja: '政治的透明性とオープンソース・インテリジェンスを専門とするスウェーデンのサイバーセキュリティ・コンサルティング。',
  ko: '정치적 투명성과 오픈소스 인텔리전스를 전문으로 하는 스웨덴 사이버보안 컨설팅 회사.',
  zh: '一家专注于政治透明度与开源情报的瑞典网络安全咨询机构。',
};

/** Localized "View source Markdown" link label for articles */
