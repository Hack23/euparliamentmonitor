// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/PoliticalIntelligence/Copy/Other
 * @description Non-Latin-script language overrides for the Political
 * Intelligence landing-page copy (ar, he, ja, ko, zh). Split out of
 * `copy.ts` (Refactor 8/8) so each translator can edit one bounded file.
 */

import type { PICopy } from './types.js';

export const AR_COPY: Partial<PICopy> = {
  title: 'الاستخبارات السياسية',
  intro:
    'كل تحليل سياسي يُنشر على هذا الموقع مدعوم بسلسلة شفافة من المنهجيات وقوالب القطع الأثرية وبيانات التحليل على مستوى التشغيل. توفر هذه الصفحة فهرسًا واحدًا مرتبطًا بالكامل بكل المهارة المستخدمة لإنتاج الأخبار.',
  heroSubtitle: 'المنهجيات والقوالب وشفافية التحليل اليومي',
  home: 'الرئيسية',
  breadcrumbCurrent: 'الاستخبارات السياسية',
  breadcrumbLabel: 'مسار التنقل',
  methodologiesHeading: 'المنهجيات',
  methodologiesDescription:
    'أدلة احترافية موثوقة — أطر المخاطر ومعايير الأسلوب وبروتوكول التحليل المدعوم بالذكاء الاصطناعي المكون من 10 خطوات.',
  templatesHeading: 'قوالب التحليل',
  templatesDescription:
    'كتالوج قوالب القطع الأثرية المنتجة في كل تشغيل تحليل يومي — SWOT و PESTLE ومصفوفات التهديد وديناميكيات التحالف وأشجار العواقب.',
  referenceHeading: 'المراجع ومصادر البيانات',
  referenceDescription:
    'تكييفات مرجعية ISMS وكتالوجات المؤشرات وخرائط دول الاتحاد الأوروبي وأدلة دمج المخططات خلف كل مصدر من صندوق النقد الدولي والبنك الدولي.',
  statReferenceLabel: 'المراجع',
  dailyHeading: 'عمليات التحليل اليومية',
  dailyDescription:
    'كل عملية تحليل منشورة، مجمعة حسب التاريخ ومرتبة من الأحدث إلى الأقدم. يربط كل تشغيل بشجرة GitHub الكاملة.',
  statMethodologiesLabel: 'المنهجيات',
  statTemplatesLabel: 'القوالب',
  statRunsLabel: 'عمليات التحليل',
  statArtifactsLabel: 'القطع الأثرية',
  viewOnGitHub: 'عرض على GitHub',
  artifactCountLabel: '{count} قطعة أثرية',
  artifactCountLabelSingular: 'قطعة أثرية واحدة',
  runsCountLabel: '{count} عمليات',
  runsCountLabelSingular: 'عملية واحدة',
  artifactsToggleLabel: 'عرض جميع ملفات القطع الأثرية ({count})',
  artifactsToggleLabelSingular: 'عرض ملف القطعة الأثرية',
  sourceInEnglishNote:
    'تُنشر المواد المصدر (المنهجيات والقوالب والقطع الأثرية للتحليل اليومي) باللغة الإنجليزية. لذلك تظهر العناوين ومسارات الملفات بالإنجليزية — فقط تنقل الصفحة والأوصاف مترجمة.',
  seoKeywords:
    'البرلمان الأوروبي, الاستخبارات السياسية, OSINT, تحليل SWOT, تحليل PESTLE, منهجية, قوالب الأدلة, رياضيات التحالف, تقييم المخاطر, نموذج التهديد, الشفافية, الاتحاد الأوروبي',
};

export const HE_COPY: Partial<PICopy> = {
  title: 'מודיעין פוליטי',
  intro:
    'כל ניתוח פוליטי המתפרסם באתר זה נתמך בשרשרת שקופה של מתודולוגיות, תבניות ארטיפקטים ונתוני ניתוח ברמת ריצה. עמוד זה מספק אינדקס יחיד ומקושר במלואו לכל המלאכה המשמשת להפקת החדשות.',
  heroSubtitle: 'מתודולוגיות, תבניות ושקיפות ניתוח יומי',
  home: 'בית',
  breadcrumbCurrent: 'מודיעין פוליטי',
  breadcrumbLabel: 'נתיב ניווט',
  methodologiesHeading: 'מתודולוגיות',
  methodologiesDescription:
    'מדריכי מלאכה מוסמכים — מסגרות סיכון, סטנדרטי סגנון ופרוטוקול ניתוח מונחה בינה מלאכותית בן 10 שלבים.',
  templatesHeading: 'תבניות ניתוח',
  templatesDescription:
    'קטלוג תבניות ארטיפקטים המיוצרות בכל ריצת ניתוח יומית — SWOT, PESTLE, מטריצות איום, דינמיקות קואליציה ועצי השלכות.',
  referenceHeading: 'הפניות ומקורות נתונים',
  referenceDescription:
    'התאמות ייחוס ISMS, קטלוגי אינדיקטורים, מיפויי מדינות האיחוד האירופי ומדריכי שילוב תרשימים מאחורי כל מקור של קרן המטבע הבינלאומית והבנק העולמי.',
  statReferenceLabel: 'הפניות',
  dailyHeading: 'ריצות ניתוח יומיות',
  dailyDescription:
    'כל ריצת ניתוח שפורסמה, מקובצת לפי תאריך ומסודרת מהחדש ביותר. כל ריצה מקושרת לעץ GitHub המלא.',
  statMethodologiesLabel: 'מתודולוגיות',
  statTemplatesLabel: 'תבניות',
  statRunsLabel: 'ריצות ניתוח',
  statArtifactsLabel: 'ארטיפקטים',
  viewOnGitHub: 'הצג ב-GitHub',
  artifactCountLabel: '{count} ארטיפקטים',
  artifactCountLabelSingular: 'ארטיפקט אחד',
  runsCountLabel: '{count} ריצות',
  runsCountLabelSingular: 'ריצה אחת',
  artifactsToggleLabel: 'הצג את כל {count} קבצי הארטיפקטים',
  artifactsToggleLabelSingular: 'הצג את קובץ הארטיפקט',
  sourceInEnglishNote:
    'חומרי המקור (מתודולוגיות, תבניות וארטיפקטי ניתוח יומיים) מתפרסמים באנגלית. הכותרות ונתיבי הקבצים מופיעים אפוא באנגלית — רק הניווט והתיאורים בדף תורגמו.',
  seoKeywords:
    'הפרלמנט האירופי, מודיעין פוליטי, OSINT, ניתוח SWOT, ניתוח PESTLE, מתודולוגיה, תבניות ארטיפקט, מתמטיקה של קואליציות, הערכת סיכונים, מודל איום, שקיפות, האיחוד האירופי',
};

export const JA_COPY: Partial<PICopy> = {
  title: '政治インテリジェンス',
  intro:
    '当サイトで公開されるすべての政治分析は、透明な方法論・成果物テンプレート・実行レベルの分析データの連鎖に裏付けられています。このページは、ニュースを生み出すために使用されるすべてのトレードクラフトへの単一の、完全にリンクされたインデックスを提供します。',
  heroSubtitle: '方法論、テンプレート、日次分析の透明性',
  home: 'ホーム',
  breadcrumbCurrent: '政治インテリジェンス',
  breadcrumbLabel: 'パンくずリスト',
  methodologiesHeading: '方法論',
  methodologiesDescription:
    '権威あるトレードクラフトガイド — リスクフレームワーク、スタイル基準、10 ステップの AI 駆動分析プロトコル。',
  templatesHeading: '分析テンプレート',
  templatesDescription:
    '毎日の分析実行で生成される成果物テンプレートのカタログ — SWOT、PESTLE、脅威マトリックス、連携ダイナミクス、結果ツリーなど。',
  referenceHeading: '参照とデータソース',
  referenceDescription:
    'ISMS参照適応、指標カタログ、EU各国マッピング、および IMF と世界銀行のデータパイプラインの背後にあるチャート統合ガイド。',
  statReferenceLabel: '参照',
  dailyHeading: '日次分析実行',
  dailyDescription:
    '公開されたすべての分析実行を日付でグループ化し、新しい順に並べています。各実行は完全な GitHub ツリーにリンクします。',
  statMethodologiesLabel: '方法論',
  statTemplatesLabel: 'テンプレート',
  statRunsLabel: '分析実行',
  statArtifactsLabel: '成果物',
  viewOnGitHub: 'GitHub で表示',
  artifactCountLabel: '{count} 件の成果物',
  artifactCountLabelSingular: '1 件の成果物',
  runsCountLabel: '{count} 件の実行',
  runsCountLabelSingular: '1 件の実行',
  artifactsToggleLabel: '{count} 件のすべての成果物ファイルを表示',
  artifactsToggleLabelSingular: '1 件の成果物ファイルを表示',
  sourceInEnglishNote:
    'ソース資料(方法論・テンプレート・日次分析成果物)は英語で公開されています。そのためタイトルとファイルパスは英語で表示されます。ページのナビゲーションと説明のみが翻訳されています。',
  seoKeywords:
    '欧州議会, 政治インテリジェンス, OSINT, SWOT分析, PESTLE分析, 方法論, 成果物テンプレート, 連立数学, リスク評価, 脅威モデル, 透明性, EU',
};

export const KO_COPY: Partial<PICopy> = {
  title: '정치 정보',
  intro:
    '본 사이트에 게시되는 모든 정치 분석은 방법론, 산출물 템플릿, 실행 수준 분석 데이터의 투명한 사슬에 의해 뒷받침됩니다. 이 페이지는 뉴스를 제작하는 데 사용된 모든 기술을 단일하고 완전히 링크된 인덱스로 제공합니다.',
  heroSubtitle: '방법론, 템플릿 및 일일 분석 투명성',
  home: '홈',
  breadcrumbCurrent: '정치 정보',
  breadcrumbLabel: '이동 경로',
  methodologiesHeading: '방법론',
  methodologiesDescription:
    '권위 있는 트레이드크래프트 가이드 — 위험 프레임워크, 스타일 표준, 10단계 AI 기반 분석 프로토콜.',
  templatesHeading: '분석 템플릿',
  templatesDescription:
    '매일 분석 실행에서 생성되는 산출물 템플릿 카탈로그 — SWOT, PESTLE, 위협 매트릭스, 연합 역학, 결과 트리.',
  referenceHeading: '참조 및 데이터 출처',
  referenceDescription:
    'ISMS 참조 적응, 지표 카탈로그, EU 국가 매핑, IMF 및 세계은행 데이터 파이프라인의 차트 통합 가이드.',
  statReferenceLabel: '참조',
  dailyHeading: '일일 분석 실행',
  dailyDescription:
    '게시된 모든 분석 실행을 날짜별로 그룹화하여 최신순으로 정렬합니다. 각 실행은 전체 GitHub 트리로 연결됩니다.',
  statMethodologiesLabel: '방법론',
  statTemplatesLabel: '템플릿',
  statRunsLabel: '분석 실행',
  statArtifactsLabel: '산출물',
  viewOnGitHub: 'GitHub에서 보기',
  artifactCountLabel: '{count}개 산출물',
  artifactCountLabelSingular: '1개 산출물',
  runsCountLabel: '{count}회 실행',
  runsCountLabelSingular: '1회 실행',
  artifactsToggleLabel: '{count}개 산출물 파일 모두 보기',
  artifactsToggleLabelSingular: '1개 산출물 파일 보기',
  sourceInEnglishNote:
    '원본 자료(방법론, 템플릿, 일일 분석 산출물)는 영어로 게시됩니다. 따라서 제목과 파일 경로는 영어로 표시되며, 페이지 탐색 및 설명만 번역되어 있습니다.',
  seoKeywords:
    '유럽의회, 정치 정보, OSINT, SWOT 분석, PESTLE 분석, 방법론, 산출물 템플릿, 연정 수학, 위험 평가, 위협 모델, 투명성, EU',
};

export const ZH_COPY: Partial<PICopy> = {
  title: '政治情报',
  intro:
    '本网站上发布的每一篇政治分析都由方法论、工件模板和运行级分析数据的透明链条所支撑。本页面提供了一个单一、完全链接的索引,指向用于生成新闻的所有工艺。',
  heroSubtitle: '方法论、模板和每日分析透明度',
  home: '首页',
  breadcrumbCurrent: '政治情报',
  breadcrumbLabel: '面包屑导航',
  methodologiesHeading: '方法论',
  methodologiesDescription:
    '权威的工艺指南 — 风险框架、风格标准,以及每篇文章遵循的 10 步 AI 驱动分析协议。',
  templatesHeading: '分析模板',
  templatesDescription:
    '每次日常分析运行中产生的工件模板目录 — SWOT、PESTLE、威胁矩阵、联盟动态和后果树。',
  referenceHeading: '参考与数据源',
  referenceDescription:
    'ISMS 参考适配、指标目录、欧盟国家映射以及 IMF 和世界银行数据管道背后的图表集成指南。',
  statReferenceLabel: '参考',
  dailyHeading: '每日分析运行',
  dailyDescription:
    '每次发布的分析运行,按日期分组并按最新优先排序。每次运行都链接到完整的 GitHub 树。',
  statMethodologiesLabel: '方法论',
  statTemplatesLabel: '模板',
  statRunsLabel: '分析运行',
  statArtifactsLabel: '工件',
  viewOnGitHub: '在 GitHub 上查看',
  artifactCountLabel: '{count} 个工件',
  artifactCountLabelSingular: '1 个工件',
  runsCountLabel: '{count} 次运行',
  runsCountLabelSingular: '1 次运行',
  artifactsToggleLabel: '显示全部 {count} 个工件文件',
  artifactsToggleLabelSingular: '显示 1 个工件文件',
  sourceInEnglishNote:
    '源材料(方法论、模板和每日分析工件)以英文发布。因此标题和文件路径以英文显示 — 仅页面导航和描述进行了翻译。',
  seoKeywords:
    '欧洲议会, 政治情报, OSINT, SWOT 分析, PESTLE 分析, 方法论, 工件模板, 联盟数学, 风险评估, 威胁模型, 透明度, 欧盟',
};
