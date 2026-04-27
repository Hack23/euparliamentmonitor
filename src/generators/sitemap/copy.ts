// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Sitemap/Copy
 * @description Localized copy tables and the canonical category order used
 * by the sitemap HTML pages. Lifted out of `sitemap.ts` so the data can
 * be shared between the HTML renderer and any future consumer (RSS title
 * fallback, structured-data builder, etc.) without duplicating 14
 * language variants.
 *
 * **No imports from other generator modules** — this file is leaf data
 * with a single public type re-export from `../types/index.ts`. That
 * keeps the bounded context of "sitemap copy" pure, makes the file easy
 * to audit, and lets any new locale be added in one place.
 */

import { ArticleCategory } from '../../types/index.js';

/** Default sitemap title used as English fallback */
export const DEFAULT_SITEMAP_TITLE = 'Sitemap';

/** Sitemap page titles per language */
export const SITEMAP_TITLES: Record<string, string> = {
  en: DEFAULT_SITEMAP_TITLE,
  sv: 'Webbplatskarta',
  da: DEFAULT_SITEMAP_TITLE,
  no: 'Nettstedskart',
  fi: 'Sivukartta',
  de: 'Seitenübersicht',
  fr: 'Plan du site',
  es: 'Mapa del sitio',
  nl: DEFAULT_SITEMAP_TITLE,
  ar: 'خريطة الموقع',
  he: 'מפת אתר',
  ja: 'サイトマップ',
  ko: '사이트맵',
  zh: '网站地图',
};

/** Sitemap section headings per language */
export const SITEMAP_SECTIONS: Record<string, { news: string; docs: string; pages: string }> = {
  en: { news: 'News Articles', docs: 'Documentation', pages: 'Pages' },
  sv: { news: 'Nyhetsartiklar', docs: 'Dokumentation', pages: 'Sidor' },
  da: { news: 'Nyhedsartikler', docs: 'Dokumentation', pages: 'Sider' },
  no: { news: 'Nyhetsartikler', docs: 'Dokumentasjon', pages: 'Sider' },
  fi: { news: 'Uutisartikkelit', docs: 'Dokumentaatio', pages: 'Sivut' },
  de: { news: 'Nachrichtenartikel', docs: 'Dokumentation', pages: 'Seiten' },
  fr: { news: 'Articles de presse', docs: 'Documentation', pages: 'Pages' },
  es: { news: 'Artículos de noticias', docs: 'Documentación', pages: 'Páginas' },
  nl: { news: 'Nieuwsartikelen', docs: 'Documentatie', pages: "Pagina's" },
  ar: { news: 'مقالات إخبارية', docs: 'التوثيق', pages: 'الصفحات' },
  he: { news: 'מאמרי חדשות', docs: 'תיעוד', pages: 'דפים' },
  ja: { news: 'ニュース記事', docs: 'ドキュメント', pages: 'ページ' },
  ko: { news: '뉴스 기사', docs: '문서', pages: '페이지' },
  zh: { news: '新闻文章', docs: '文档', pages: '页面' },
};

/** Documentation section labels per language */
export const DOCS_LABELS: Record<
  string,
  { api: string; coverage: string; testResults: string; docsHome: string }
> = {
  en: {
    api: 'API Documentation',
    coverage: 'Code Coverage',
    testResults: 'Test Results',
    docsHome: 'Documentation Home',
  },
  sv: {
    api: 'API-dokumentation',
    coverage: 'Kodtäckning',
    testResults: 'Testresultat',
    docsHome: 'Dokumentationsstart',
  },
  da: {
    api: 'API-dokumentation',
    coverage: 'Kodedækning',
    testResults: 'Testresultater',
    docsHome: 'Dokumentationsstart',
  },
  no: {
    api: 'API-dokumentasjon',
    coverage: 'Kodedekning',
    testResults: 'Testresultater',
    docsHome: 'Dokumentasjonsstart',
  },
  fi: {
    api: 'API-dokumentaatio',
    coverage: 'Koodikattavuus',
    testResults: 'Testitulokset',
    docsHome: 'Dokumentaation etusivu',
  },
  de: {
    api: 'API-Dokumentation',
    coverage: 'Codeabdeckung',
    testResults: 'Testergebnisse',
    docsHome: 'Dokumentationsstart',
  },
  fr: {
    api: 'Documentation API',
    coverage: 'Couverture du code',
    testResults: 'Résultats des tests',
    docsHome: 'Accueil documentation',
  },
  es: {
    api: 'Documentación API',
    coverage: 'Cobertura de código',
    testResults: 'Resultados de pruebas',
    docsHome: 'Inicio de documentación',
  },
  nl: {
    api: 'API-documentatie',
    coverage: 'Codedekking',
    testResults: 'Testresultaten',
    docsHome: 'Documentatiestart',
  },
  ar: {
    api: 'وثائق API',
    coverage: 'تغطية الكود',
    testResults: 'نتائج الاختبار',
    docsHome: 'الصفحة الرئيسية للتوثيق',
  },
  he: {
    api: 'תיעוד API',
    coverage: 'כיסוי קוד',
    testResults: 'תוצאות בדיקות',
    docsHome: 'דף הבית של התיעוד',
  },
  ja: {
    api: 'APIドキュメント',
    coverage: 'コードカバレッジ',
    testResults: 'テスト結果',
    docsHome: 'ドキュメントホーム',
  },
  ko: {
    api: 'API 문서',
    coverage: '코드 커버리지',
    testResults: '테스트 결과',
    docsHome: '문서 홈',
  },
  zh: { api: 'API 文档', coverage: '代码覆盖率', testResults: '测试结果', docsHome: '文档首页' },
};

/** Localized strings that power the sitemap hero, breadcrumb and section intros */
export interface SitemapCopy {
  /** Intro paragraph rendered below the h1 hero heading */
  intro: string;
  /** Short subtitle rendered inside the hero block */
  heroSubtitle: string;
  /** Breadcrumb label for the Home link */
  home: string;
  /** Breadcrumb label for the current Site Map page */
  breadcrumbCurrent: string;
  /** ARIA label for the breadcrumb nav */
  breadcrumbLabel: string;
  /** Intro paragraph for the Pages section */
  pagesDescription: string;
  /** Intro paragraph for the Documentation section */
  docsDescription: string;
  /** Intro paragraph for the News Articles section */
  newsDescription: string;
  /** Stats: "Articles" label */
  statArticlesLabel: string;
  /** Stats: "Languages" label */
  statLanguagesLabel: string;
  /** Stats: "Last updated" label */
  statLastUpdatedLabel: string;
  /** Stats: "Categories" label */
  statCategoriesLabel: string;
  /** One-line description for the link to the Political Intelligence page */
  politicalIntelligenceLinkDescription: string;
}

/** Per-language copy for the sitemap hero, breadcrumb, and section intros */
export const SITEMAP_COPY: Record<string, SitemapCopy> = {
  en: {
    intro:
      'Complete overview of every page on EU Parliament Monitor — index pages, news articles, and technical documentation. Use this page to discover content and navigate directly to any article across all 14 languages.',
    heroSubtitle: 'Complete site navigation',
    home: 'Home',
    breadcrumbCurrent: 'Site Map',
    breadcrumbLabel: 'Breadcrumb',
    pagesDescription:
      'Primary landing pages in every supported language — the best starting point for each audience.',
    docsDescription:
      'Technical documentation including API reference, code coverage, and test results.',
    newsDescription:
      'Every published news article in this language, sorted newest first and grouped by editorial format.',
    statArticlesLabel: 'Articles',
    statLanguagesLabel: 'Languages',
    statLastUpdatedLabel: 'Last updated',
    statCategoriesLabel: 'Categories',
    politicalIntelligenceLinkDescription:
      'Index of every methodology, template, and daily analysis run — the transparent tradecraft behind every article.',
  },
  sv: {
    intro:
      'Komplett översikt över alla sidor på EU Parliament Monitor — startsidor, nyhetsartiklar och teknisk dokumentation. Använd sidan för att upptäcka innehåll och navigera direkt till valfri artikel på alla 14 språk.',
    heroSubtitle: 'Komplett webbplatsnavigering',
    home: 'Hem',
    breadcrumbCurrent: 'Webbplatskarta',
    breadcrumbLabel: 'Brödsmulor',
    pagesDescription:
      'Primära startsidor på varje språk som stöds — bästa utgångspunkten för varje målgrupp.',
    docsDescription: 'Teknisk dokumentation inklusive API-referens, kodtäckning och testresultat.',
    newsDescription:
      'Alla publicerade nyhetsartiklar på detta språk, sorterade med nyaste överst och grupperade efter redaktionellt format.',
    statArticlesLabel: 'Artiklar',
    statLanguagesLabel: 'Språk',
    statLastUpdatedLabel: 'Senast uppdaterad',
    statCategoriesLabel: 'Kategorier',
    politicalIntelligenceLinkDescription:
      'Index över varje metodik, mall och daglig analyskörning — det transparenta hantverket bakom varje artikel.',
  },
  da: {
    intro:
      'Komplet oversigt over alle sider på EU Parliament Monitor — startsider, nyhedsartikler og teknisk dokumentation. Brug siden til at opdage indhold og navigere direkte til enhver artikel på alle 14 sprog.',
    heroSubtitle: 'Komplet webstedsnavigation',
    home: 'Hjem',
    breadcrumbCurrent: 'Sitemap',
    breadcrumbLabel: 'Brødkrummer',
    pagesDescription:
      'Primære startsider på hvert understøttet sprog — det bedste udgangspunkt for hver målgruppe.',
    docsDescription:
      'Teknisk dokumentation inklusive API-reference, kodedækning og testresultater.',
    newsDescription:
      'Alle offentliggjorte nyhedsartikler på dette sprog, sorteret nyeste først og grupperet efter redaktionelt format.',
    statArticlesLabel: 'Artikler',
    statLanguagesLabel: 'Sprog',
    statLastUpdatedLabel: 'Sidst opdateret',
    statCategoriesLabel: 'Kategorier',
    politicalIntelligenceLinkDescription:
      'Indeks over hver metode, skabelon og daglig analysekørsel — det gennemsigtige håndværk bag hver artikel.',
  },
  no: {
    intro:
      'Komplett oversikt over alle sider på EU Parliament Monitor — startsider, nyhetsartikler og teknisk dokumentasjon. Bruk siden for å oppdage innhold og navigere direkte til enhver artikkel på alle 14 språk.',
    heroSubtitle: 'Komplett nettstedsnavigasjon',
    home: 'Hjem',
    breadcrumbCurrent: 'Nettstedskart',
    breadcrumbLabel: 'Brødsmuler',
    pagesDescription:
      'Primære startsider på hvert støttet språk — det beste utgangspunktet for hver målgruppe.',
    docsDescription:
      'Teknisk dokumentasjon inkludert API-referanse, kodedekning og testresultater.',
    newsDescription:
      'Alle publiserte nyhetsartikler på dette språket, sortert med nyeste først og gruppert etter redaksjonelt format.',
    statArticlesLabel: 'Artikler',
    statLanguagesLabel: 'Språk',
    statLastUpdatedLabel: 'Sist oppdatert',
    statCategoriesLabel: 'Kategorier',
    politicalIntelligenceLinkDescription:
      'Indeks over hver metodologi, mal og daglige analysekjøring — det gjennomsiktige håndverket bak hver artikkel.',
  },
  fi: {
    intro:
      'Täydellinen yleiskatsaus kaikkiin EU Parliament Monitor -sivuston sivuihin — etusivuihin, uutisartikkeleihin ja tekniseen dokumentaatioon. Käytä tätä sivua löytääksesi sisältöä ja siirtyäksesi suoraan mihin tahansa artikkeliin kaikilla 14 kielellä.',
    heroSubtitle: 'Täydellinen sivustonavigaatio',
    home: 'Etusivu',
    breadcrumbCurrent: 'Sivukartta',
    breadcrumbLabel: 'Navigointipolku',
    pagesDescription:
      'Ensisijaiset aloitussivut jokaisella tuetulla kielellä — paras lähtökohta kullekin yleisölle.',
    docsDescription:
      'Tekninen dokumentaatio, mukaan lukien API-viite, koodikattavuus ja testitulokset.',
    newsDescription:
      'Kaikki julkaistut uutisartikkelit tällä kielellä, uusimmat ensin ja ryhmitellyt toimituksellisen muodon mukaan.',
    statArticlesLabel: 'Artikkelit',
    statLanguagesLabel: 'Kielet',
    statLastUpdatedLabel: 'Viimeksi päivitetty',
    statCategoriesLabel: 'Luokat',
    politicalIntelligenceLinkDescription:
      'Hakemisto jokaisesta metodologiasta, pohjasta ja päivittäisestä analyysiajoista — läpinäkyvä käsityötaito jokaisen artikkelin takana.',
  },
  de: {
    intro:
      'Vollständige Übersicht über alle Seiten von EU Parliament Monitor — Startseiten, Nachrichtenartikel und technische Dokumentation. Nutzen Sie diese Seite, um Inhalte zu entdecken und direkt zu jedem Artikel in allen 14 Sprachen zu navigieren.',
    heroSubtitle: 'Vollständige Seitennavigation',
    home: 'Startseite',
    breadcrumbCurrent: 'Seitenübersicht',
    breadcrumbLabel: 'Breadcrumb',
    pagesDescription:
      'Primäre Startseiten in jeder unterstützten Sprache — der beste Ausgangspunkt für jede Zielgruppe.',
    docsDescription:
      'Technische Dokumentation einschließlich API-Referenz, Codeabdeckung und Testergebnissen.',
    newsDescription:
      'Alle veröffentlichten Nachrichtenartikel in dieser Sprache, nach Datum absteigend sortiert und nach redaktionellem Format gruppiert.',
    statArticlesLabel: 'Artikel',
    statLanguagesLabel: 'Sprachen',
    statLastUpdatedLabel: 'Zuletzt aktualisiert',
    statCategoriesLabel: 'Kategorien',
    politicalIntelligenceLinkDescription:
      'Index jeder Methodologie, Vorlage und täglichen Analysedurchführung — die transparente Handwerkskunst hinter jedem Artikel.',
  },
  fr: {
    intro:
      'Vue d\u2019ensemble complète de toutes les pages d\u2019EU Parliament Monitor — pages d\u2019accueil, articles d\u2019actualité et documentation technique. Utilisez cette page pour découvrir du contenu et naviguer directement vers n\u2019importe quel article dans les 14 langues.',
    heroSubtitle: 'Navigation complète du site',
    home: 'Accueil',
    breadcrumbCurrent: 'Plan du site',
    breadcrumbLabel: 'Fil d\u2019Ariane',
    pagesDescription:
      'Pages d\u2019accueil principales dans chaque langue prise en charge — le meilleur point de départ pour chaque audience.',
    docsDescription:
      'Documentation technique comprenant la référence API, la couverture de code et les résultats des tests.',
    newsDescription:
      'Tous les articles d\u2019actualité publiés dans cette langue, triés du plus récent au plus ancien et groupés par format éditorial.',
    statArticlesLabel: 'Articles',
    statLanguagesLabel: 'Langues',
    statLastUpdatedLabel: 'Dernière mise à jour',
    statCategoriesLabel: 'Catégories',
    politicalIntelligenceLinkDescription:
      "Index de chaque méthodologie, modèle et exécution d'analyse quotidienne — le savoir-faire transparent derrière chaque article.",
  },
  es: {
    intro:
      'Vista general completa de todas las páginas de EU Parliament Monitor — páginas principales, artículos de noticias y documentación técnica. Usa esta página para descubrir contenido y navegar directamente a cualquier artículo en los 14 idiomas.',
    heroSubtitle: 'Navegación completa del sitio',
    home: 'Inicio',
    breadcrumbCurrent: 'Mapa del sitio',
    breadcrumbLabel: 'Ruta de navegación',
    pagesDescription:
      'Páginas principales en cada idioma soportado — el mejor punto de partida para cada audiencia.',
    docsDescription:
      'Documentación técnica, incluyendo referencia de API, cobertura de código y resultados de pruebas.',
    newsDescription:
      'Todos los artículos de noticias publicados en este idioma, ordenados del más reciente al más antiguo y agrupados por formato editorial.',
    statArticlesLabel: 'Artículos',
    statLanguagesLabel: 'Idiomas',
    statLastUpdatedLabel: 'Última actualización',
    statCategoriesLabel: 'Categorías',
    politicalIntelligenceLinkDescription:
      'Índice de cada metodología, plantilla y ejecución de análisis diario — el oficio transparente detrás de cada artículo.',
  },
  nl: {
    intro:
      'Volledig overzicht van elke pagina op EU Parliament Monitor — landingspagina\u2019s, nieuwsartikelen en technische documentatie. Gebruik deze pagina om inhoud te ontdekken en direct naar elk artikel in alle 14 talen te navigeren.',
    heroSubtitle: 'Volledige site-navigatie',
    home: 'Home',
    breadcrumbCurrent: 'Sitemap',
    breadcrumbLabel: 'Broodkruimelpad',
    pagesDescription:
      'Primaire landingspagina\u2019s in elke ondersteunde taal — het beste vertrekpunt voor elk publiek.',
    docsDescription:
      'Technische documentatie inclusief API-referentie, code-dekking en testresultaten.',
    newsDescription:
      'Alle gepubliceerde nieuwsartikelen in deze taal, nieuwste bovenaan en gegroepeerd op redactioneel formaat.',
    statArticlesLabel: 'Artikelen',
    statLanguagesLabel: 'Talen',
    statLastUpdatedLabel: 'Laatst bijgewerkt',
    statCategoriesLabel: 'Categorieën',
    politicalIntelligenceLinkDescription:
      'Index van elke methodologie, sjabloon en dagelijkse analyse-uitvoering — het transparante vakmanschap achter elk artikel.',
  },
  ar: {
    intro:
      'نظرة عامة كاملة على كل صفحة في EU Parliament Monitor — الصفحات الرئيسية والمقالات الإخبارية والوثائق التقنية. استخدم هذه الصفحة لاكتشاف المحتوى والانتقال مباشرة إلى أي مقال بجميع اللغات الـ14.',
    heroSubtitle: 'التنقل الكامل في الموقع',
    home: 'الرئيسية',
    breadcrumbCurrent: 'خريطة الموقع',
    breadcrumbLabel: 'مسار التنقل',
    pagesDescription: 'الصفحات الرئيسية الأساسية بكل لغة مدعومة — أفضل نقطة انطلاق لكل جمهور.',
    docsDescription: 'وثائق تقنية تشمل مرجع واجهة البرمجة وتغطية الكود ونتائج الاختبارات.',
    newsDescription:
      'جميع المقالات الإخبارية المنشورة بهذه اللغة، مرتبة من الأحدث إلى الأقدم ومصنفة حسب الصيغة التحريرية.',
    statArticlesLabel: 'المقالات',
    statLanguagesLabel: 'اللغات',
    statLastUpdatedLabel: 'آخر تحديث',
    statCategoriesLabel: 'الفئات',
    politicalIntelligenceLinkDescription:
      'فهرس لكل منهجية وقالب وتشغيل تحليل يومي — الحرفة الشفافة وراء كل مقال.',
  },
  he: {
    intro:
      'סקירה מלאה של כל עמוד ב-EU Parliament Monitor — עמודי בית, מאמרי חדשות ותיעוד טכני. השתמשו בעמוד זה כדי לגלות תוכן ולנווט ישירות לכל מאמר בכל 14 השפות.',
    heroSubtitle: 'ניווט מלא באתר',
    home: 'בית',
    breadcrumbCurrent: 'מפת אתר',
    breadcrumbLabel: 'נתיב ניווט',
    pagesDescription: 'עמודי נחיתה ראשיים בכל שפה נתמכת — נקודת ההתחלה הטובה ביותר לכל קהל.',
    docsDescription: 'תיעוד טכני כולל מקור API, כיסוי קוד ותוצאות בדיקות.',
    newsDescription:
      'כל מאמרי החדשות שפורסמו בשפה זו, ממוינים מהחדש לישן ומקובצים לפי פורמט מערכת.',
    statArticlesLabel: 'מאמרים',
    statLanguagesLabel: 'שפות',
    statLastUpdatedLabel: 'עודכן לאחרונה',
    statCategoriesLabel: 'קטגוריות',
    politicalIntelligenceLinkDescription:
      'אינדקס של כל מתודולוגיה, תבנית וריצת ניתוח יומית — המלאכה השקופה שמאחורי כל מאמר.',
  },
  ja: {
    intro:
      'EU Parliament Monitor の全ページの完全な一覧です — トップページ、ニュース記事、技術ドキュメント。このページを使って、14 言語すべての任意の記事を発見・直接閲覧できます。',
    heroSubtitle: 'サイト全体のナビゲーション',
    home: 'ホーム',
    breadcrumbCurrent: 'サイトマップ',
    breadcrumbLabel: 'パンくずリスト',
    pagesDescription: '各対応言語のメインランディングページ — 各読者に最適な入り口。',
    docsDescription: 'API リファレンス、コードカバレッジ、テスト結果を含む技術ドキュメント。',
    newsDescription:
      'この言語で公開された全ニュース記事を、新しい順に掲載し編集フォーマット別にグループ化しています。',
    statArticlesLabel: '記事',
    statLanguagesLabel: '言語',
    statLastUpdatedLabel: '最終更新',
    statCategoriesLabel: 'カテゴリ',
    politicalIntelligenceLinkDescription:
      'すべての方法論、テンプレート、日次分析実行のインデックス — 各記事の背後にある透明な手法。',
  },
  ko: {
    intro:
      'EU Parliament Monitor의 모든 페이지 전체 개요 — 홈 페이지, 뉴스 기사 및 기술 문서를 포함합니다. 이 페이지를 통해 14개 언어 전체의 어떤 기사든 직접 찾아 이동할 수 있습니다.',
    heroSubtitle: '전체 사이트 내비게이션',
    home: '홈',
    breadcrumbCurrent: '사이트맵',
    breadcrumbLabel: '이동 경로',
    pagesDescription: '지원되는 각 언어의 주요 랜딩 페이지 — 각 독자를 위한 최적의 시작점입니다.',
    docsDescription: 'API 레퍼런스, 코드 커버리지, 테스트 결과를 포함한 기술 문서입니다.',
    newsDescription: '이 언어로 게시된 모든 뉴스 기사를 최신순으로 편집 형식별로 정리했습니다.',
    statArticlesLabel: '기사',
    statLanguagesLabel: '언어',
    statLastUpdatedLabel: '마지막 업데이트',
    statCategoriesLabel: '카테고리',
    politicalIntelligenceLinkDescription:
      '모든 방법론, 템플릿 및 일일 분석 실행의 색인 — 각 기사 뒤에 있는 투명한 기술.',
  },
  zh: {
    intro:
      '欧洲议会监测(EU Parliament Monitor)所有页面的完整概览 — 包括首页、新闻文章和技术文档。通过此页面可以发现内容并直接访问 14 种语言的任何文章。',
    heroSubtitle: '完整站点导航',
    home: '首页',
    breadcrumbCurrent: '网站地图',
    breadcrumbLabel: '面包屑导航',
    pagesDescription: '每种受支持语言的主要落地页 — 每个受众的最佳起点。',
    docsDescription: '技术文档,包括 API 参考、代码覆盖率和测试结果。',
    newsDescription: '该语言发布的所有新闻文章,按最新优先排序,并按编辑格式分组。',
    statArticlesLabel: '文章',
    statLanguagesLabel: '语言',
    statLastUpdatedLabel: '最近更新',
    statCategoriesLabel: '分类',
    politicalIntelligenceLinkDescription:
      '所有方法论、模板和每日分析运行的索引 — 每篇文章背后透明的工艺。',
  },
};

/**
 * Ordered list of article categories used for the News Articles section.
 * Matches the hero badge ordering used elsewhere in the site.
 */
export const CATEGORY_ORDER: readonly ArticleCategory[] = [
  ArticleCategory.BREAKING_NEWS,
  ArticleCategory.WEEK_AHEAD,
  ArticleCategory.WEEK_IN_REVIEW,
  ArticleCategory.MONTH_AHEAD,
  ArticleCategory.MONTH_IN_REVIEW,
  ArticleCategory.YEAR_AHEAD,
  ArticleCategory.YEAR_IN_REVIEW,
  ArticleCategory.MOTIONS,
  ArticleCategory.PROPOSITIONS,
  ArticleCategory.COMMITTEE_REPORTS,
  ArticleCategory.DEEP_ANALYSIS,
] as const;

/**
 * Get localized sitemap copy (hero, breadcrumb, section intros).
 *
 * @param lang - Language code
 * @returns Localized copy object, falling back to English when missing
 */
export function getSitemapCopy(lang: string): SitemapCopy {
  return SITEMAP_COPY[lang] ?? (SITEMAP_COPY['en'] as SitemapCopy);
}
