// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/Articles/Propositions
 * @description Propositions / Legislative-Procedures article: 14-language title generator and body strings.
 *
 * Per-language strings live together so a translator can update one language
 * for this article type without touching any other article type.
 */

import type { LanguageMap, LangTitleSubtitle, PropositionsStrings } from '../../types/index.js';
export const PROPOSITIONS_TITLES: LanguageMap<() => LangTitleSubtitle> = {
  en: () => ({
    title: 'Legislative Procedures: European Parliament Monitor',
    subtitle:
      'Recent legislative proposals, procedure tracking, and pipeline status in the European Parliament',
  }),
  sv: () => ({
    title: 'Lagstiftningsförfaranden: EU-parlamentsmonitor',
    subtitle:
      'Senaste lagstiftningsförslag, procedurspårning och pipeline-status i Europaparlamentet',
  }),
  da: () => ({
    title: 'Lovgivningsprocedurer: EU-parlamentsmonitor',
    subtitle:
      'Seneste lovgivningsforslag, proceduresporing og pipeline-status i Europa-Parlamentet',
  }),
  no: () => ({
    title: 'Lovgivningsprosedyrer: EU-parlamentsmonitor',
    subtitle: 'Siste lovgivningsforslag, prosedyresporing og pipeline-status i Europaparlamentet',
  }),
  fi: () => ({
    title: 'Lainsäädäntömenettelyt: EU-parlamentin seuranta',
    subtitle:
      'Viimeisimmät lainsäädäntöehdotukset, menettelyseuranta ja pipeline-tila Euroopan parlamentissa',
  }),
  de: () => ({
    title: 'Gesetzgebungsverfahren: EU-Parlamentsmonitor',
    subtitle:
      'Aktuelle Gesetzgebungsvorschläge, Verfahrensverfolgung und Pipeline-Status im Europäischen Parlament',
  }),
  fr: () => ({
    title: 'Procédures Législatives: Moniteur du Parlement Européen',
    subtitle:
      'Propositions législatives récentes, suivi des procédures et état du pipeline au Parlement européen',
  }),
  es: () => ({
    title: 'Procedimientos Legislativos: Monitor del Parlamento Europeo',
    subtitle:
      'Propuestas legislativas recientes, seguimiento de procedimientos y estado del pipeline en el Parlamento Europeo',
  }),
  nl: () => ({
    title: 'Wetgevingsprocedures: EU Parlementsmonitor',
    subtitle:
      'Recente wetgevingsvoorstellen, procedurebewaking en pipeline-status in het Europees Parlement',
  }),
  ar: () => ({
    title: 'الإجراءات التشريعية: مراقب البرلمان الأوروبي',
    subtitle:
      'المقترحات التشريعية الأخيرة ومتابعة الإجراءات وحالة خط الأنابيب في البرلمان الأوروبي',
  }),
  he: () => ({
    title: 'הליכי חקיקה: מוניטור הפרלמנט האירופי',
    subtitle: 'הצעות חקיקה אחרונות, מעקב אחר הליכים ומצב צינור החקיקה בפרלמנט האירופי',
  }),
  ja: () => ({
    title: '立法手続: EU議会モニター',
    subtitle: '欧州議会における最近の立法提案、手続き追跡、パイプライン状況',
  }),
  ko: () => ({
    title: '입법 절차: EU 의회 모니터',
    subtitle: '유럽 의회의 최근 입법 제안, 절차 추적 및 파이프라인 상태',
  }),
  zh: () => ({
    title: '立法程序: EU议会监测',
    subtitle: '欧洲议会最近的立法提案、程序跟踪和流水线状态',
  }),
};

/** Localized body text strings for propositions articles */
export const PROPOSITIONS_STRINGS: LanguageMap<PropositionsStrings> = {
  en: {
    lede: 'The European Parliament is actively processing multiple legislative proposals across key policy areas. This report tracks current proposals, their procedure status, and the overall legislative pipeline.',
    proposalsHeading: 'Recent Legislative Procedures',
    adoptedTextsHeading: 'Recently Adopted Texts',
    pipelineHeading: 'Legislative Pipeline Overview',
    procedureHeading: 'Procedure Status',
    analysisHeading: 'Impact Assessment',
    analysis:
      "Current legislative activity reflects Parliament's priorities in sustainable finance, digital governance, and environmental policy. Tracking these proposals helps citizens and stakeholders understand the EU's legislative trajectory.",
    pipelineHealthLabel: 'Pipeline Health',
    throughputRateLabel: 'Throughput Rate',
    whyThisMatters:
      'These legislative proposals directly affect EU citizens — from energy costs to digital rights. Understanding the pipeline helps stakeholders anticipate regulatory changes ahead.',
  },
  sv: {
    lede: 'Europaparlamentet bearbetar aktivt flera lagstiftningsförslag inom viktiga politikområden. Denna rapport spårar aktuella förslag, deras procedurstatus och den övergripande lagstiftningspipelinen.',
    proposalsHeading: 'Senaste Lagstiftningsförfaranden',
    adoptedTextsHeading: 'Nyligen Antagna Texter',
    pipelineHeading: 'Översikt av Lagstiftnings-Pipeline',
    procedureHeading: 'Procedurstatus',
    analysisHeading: 'Konsekvensbedömning',
    analysis:
      'Den nuvarande lagstiftningsverksamheten speglar parlamentets prioriteringar inom hållbar finansiering, digital styrning och miljöpolitik.',
    pipelineHealthLabel: 'Pipeline-hälsa',
    throughputRateLabel: 'Genomströmningshastighet',
    whyThisMatters:
      'Dessa lagstiftningsförslag påverkar direkt EU-medborgarna — från energikostnader till digitala rättigheter. Att förstå pipelinen hjälper intressenter att förutse kommande regeländringar.',
  },
  da: {
    lede: 'Europa-Parlamentet behandler aktivt adskillige lovgivningsforslag inden for vigtige politikområder.',
    proposalsHeading: 'Seneste Lovgivningsprocedurer',
    adoptedTextsHeading: 'Nyligt Vedtagne Tekster',
    pipelineHeading: 'Oversigt over Lovgivningspipeline',
    procedureHeading: 'Procedurestatus',
    analysisHeading: 'Konsekvensvurdering',
    analysis:
      'Den aktuelle lovgivningsaktivitet afspejler Parlamentets prioriteter inden for bæredygtig finansiering, digital forvaltning og miljøpolitik.',
    pipelineHealthLabel: 'Pipeline-sundhed',
    throughputRateLabel: 'Gennemstrømningshastighed',
    whyThisMatters:
      'Disse lovgivningsforslag påvirker direkte EU-borgere — fra energiomkostninger til digitale rettigheder. Forståelse af pipeline hjælper interessenter med at forudse kommende regelændringer.',
  },
  no: {
    lede: 'Europaparlamentet behandler aktivt flere lovgivningsforslag innenfor viktige politikkområder.',
    proposalsHeading: 'Siste Lovgivningsprosedyrer',
    adoptedTextsHeading: 'Nylig Vedtatte Tekster',
    pipelineHeading: 'Oversikt over Lovgivningspipeline',
    procedureHeading: 'Prosedyrestatus',
    analysisHeading: 'Konsekvensanalyse',
    analysis:
      'Dagens lovgivningsaktivitet gjenspeiler parlamentets prioriteringer innen bærekraftig finans, digital styring og miljøpolitikk.',
    pipelineHealthLabel: 'Pipeline-helse',
    throughputRateLabel: 'Gjennomstrømningshastighet',
    whyThisMatters:
      'Disse lovgivningsforslagene påvirker direkte EU-borgere — fra energikostnader til digitale rettigheter. Forståelse av pipeline hjelper interessenter med å forutse kommende regelendringer.',
  },
  fi: {
    lede: 'Euroopan parlamentti käsittelee aktiivisesti useita lainsäädäntöehdotuksia keskeisillä politiikka-alueilla.',
    proposalsHeading: 'Viimeisimmät Lainsäädäntömenettelyt',
    adoptedTextsHeading: 'Äskettäin Hyväksytyt Tekstit',
    pipelineHeading: 'Lainsäädäntöputken Yleiskatsaus',
    procedureHeading: 'Menettelyn Tila',
    analysisHeading: 'Vaikutustenarviointi',
    analysis:
      'Nykyinen lainsäädäntötoiminta heijastaa parlamentin prioriteetteja kestävässä rahoituksessa, digitaalisessa hallinnossa ja ympäristöpolitiikassa.',
    pipelineHealthLabel: 'Putkilinjan terveys',
    throughputRateLabel: 'Läpimenoaste',
    whyThisMatters:
      'Nämä lainsäädäntöehdotukset vaikuttavat suoraan EU-kansalaisiin — energiakuluista digitaalisiin oikeuksiin. Putkilinjan ymmärtäminen auttaa sidosryhmiä ennakoimaan tulevia sääntelymuutoksia.',
  },
  de: {
    lede: 'Das Europäische Parlament bearbeitet aktiv mehrere Gesetzgebungsvorschläge in wichtigen Politikbereichen.',
    proposalsHeading: 'Aktuelle Gesetzgebungsverfahren',
    adoptedTextsHeading: 'Kürzlich Angenommene Texte',
    pipelineHeading: 'Überblick über die Gesetzgebungspipeline',
    procedureHeading: 'Verfahrensstatus',
    analysisHeading: 'Folgenabschätzung',
    analysis:
      'Die aktuelle Gesetzgebungstätigkeit spiegelt die Prioritäten des Parlaments in nachhaltiger Finanzierung, digitaler Governance und Umweltpolitik wider.',
    pipelineHealthLabel: 'Pipeline-Gesundheit',
    throughputRateLabel: 'Durchsatzrate',
    whyThisMatters:
      'Diese Gesetzgebungsvorschläge betreffen EU-Bürger direkt — von Energiekosten bis zu digitalen Rechten. Das Verständnis der Pipeline hilft Interessengruppen, kommende Regulierungsänderungen vorherzusehen.',
  },
  fr: {
    lede: 'Le Parlement européen traite activement de multiples propositions législatives dans des domaines politiques clés.',
    proposalsHeading: 'Procédures Législatives Récentes',
    adoptedTextsHeading: 'Textes Récemment Adoptés',
    pipelineHeading: "Vue d'ensemble du Pipeline Législatif",
    procedureHeading: 'Statut de la Procédure',
    analysisHeading: "Évaluation de l'Impact",
    analysis:
      "L'activité législative actuelle reflète les priorités du Parlement en matière de finance durable, de gouvernance numérique et de politique environnementale.",
    pipelineHealthLabel: 'Santé du Pipeline',
    throughputRateLabel: 'Taux de Débit',
    whyThisMatters:
      'Ces propositions législatives concernent directement les citoyens européens — des coûts énergétiques aux droits numériques. Comprendre le pipeline aide les parties prenantes à anticiper les futures évolutions réglementaires.',
  },
  es: {
    lede: 'El Parlamento Europeo está procesando activamente múltiples propuestas legislativas en áreas clave de política.',
    proposalsHeading: 'Procedimientos Legislativos Recientes',
    adoptedTextsHeading: 'Textos Recientemente Adoptados',
    pipelineHeading: 'Descripción General del Pipeline Legislativo',
    procedureHeading: 'Estado del Procedimiento',
    analysisHeading: 'Evaluación de Impacto',
    analysis:
      'La actividad legislativa actual refleja las prioridades del Parlamento en finanzas sostenibles, gobernanza digital y política ambiental.',
    pipelineHealthLabel: 'Salud del Pipeline',
    throughputRateLabel: 'Tasa de Rendimiento',
    whyThisMatters:
      'Estas propuestas legislativas afectan directamente a los ciudadanos europeos — desde costes energéticos hasta derechos digitales. Comprender el pipeline ayuda a los interesados a anticipar los próximos cambios normativos.',
  },
  nl: {
    lede: 'Het Europees Parlement behandelt actief meerdere wetgevende voorstellen op belangrijke beleidsterreinen.',
    proposalsHeading: 'Recente Wetgevingsprocedures',
    adoptedTextsHeading: 'Recent Aangenomen Teksten',
    pipelineHeading: 'Overzicht van de Wetgevende Pipeline',
    procedureHeading: 'Procedurestatus',
    analysisHeading: 'Impactbeoordeling',
    analysis:
      'De huidige wetgevende activiteit weerspiegelt de prioriteiten van het Parlement op het gebied van duurzame financiering, digitaal bestuur en milieubeleid.',
    pipelineHealthLabel: 'Pipeline-gezondheid',
    throughputRateLabel: 'Doorvoersnelheid',
    whyThisMatters:
      'Deze wetgevingsvoorstellen raken EU-burgers direct — van energiekosten tot digitale rechten. Inzicht in de pipeline helpt belanghebbenden toekomstige regelgevingswijzigingen te anticiperen.',
  },
  ar: {
    lede: 'يقوم البرلمان الأوروبي بمعالجة العديد من المقترحات التشريعية في مجالات السياسة الرئيسية.',
    proposalsHeading: 'الإجراءات التشريعية الأخيرة',
    adoptedTextsHeading: 'النصوص المعتمدة مؤخراً',
    pipelineHeading: 'نظرة عامة على خط الأنابيب التشريعي',
    procedureHeading: 'حالة الإجراء',
    analysisHeading: 'تقييم الأثر',
    analysis:
      'يعكس النشاط التشريعي الحالي أولويات البرلمان في التمويل المستدام والحوكمة الرقمية والسياسة البيئية.',
    pipelineHealthLabel: 'صحة خط الأنابيب',
    throughputRateLabel: 'معدل الإنتاجية',
    whyThisMatters:
      'تؤثر هذه المقترحات التشريعية مباشرة على مواطني الاتحاد الأوروبي — من تكاليف الطاقة إلى الحقوق الرقمية. يساعد فهم خط الأنابيب أصحاب المصلحة على توقع التغييرات التنظيمية القادمة.',
  },
  he: {
    lede: 'הפרלמנט האירופי מעבד באופן פעיל הצעות חקיקה מרובות בתחומי מדיניות מרכזיים.',
    proposalsHeading: 'הליכי חקיקה אחרונים',
    adoptedTextsHeading: 'טקסטים שאומצו לאחרונה',
    pipelineHeading: 'סקירת צינור החקיקה',
    procedureHeading: 'מצב ההליך',
    analysisHeading: 'הערכת השפעה',
    analysis:
      'הפעילות החקיקתית הנוכחית משקפת את סדרי העדיפויות של הפרלמנט במימון בר-קיימא, ממשל דיגיטלי ומדיניות סביבתית.',
    pipelineHealthLabel: 'בריאות הצינור',
    throughputRateLabel: 'קצב תפוקה',
    whyThisMatters:
      'הצעות חקיקה אלו משפיעות ישירות על אזרחי האיחוד האירופי — מעלויות אנרגיה ועד לזכויות דיגיטליות. הבנת הצינור מסייעת לבעלי עניין לצפות שינויים רגולטוריים עתידיים.',
  },
  ja: {
    lede: '欧州議会は主要な政策分野にわたる複数の法案提案を積極的に処理しています。',
    proposalsHeading: '最近の立法手続き',
    adoptedTextsHeading: '最近採択されたテキスト',
    pipelineHeading: '立法パイプライン概要',
    procedureHeading: '手続き状況',
    analysisHeading: '影響評価',
    analysis:
      '現在の立法活動は、持続可能な金融、デジタルガバナンス、環境政策における議会の優先事項を反映しています。',
    pipelineHealthLabel: 'パイプライン健全性',
    throughputRateLabel: 'スループット率',
    whyThisMatters:
      'これらの法案提案はEU市民に直接影響します — エネルギーコストからデジタル権利まで。パイプラインを理解することで、利害関係者は今後の規制変更を予測できます。',
  },
  ko: {
    lede: '유럽 의회는 주요 정책 분야에 걸쳐 다수의 입법 제안을 적극적으로 처리하고 있습니다.',
    proposalsHeading: '최근 입법 절차',
    adoptedTextsHeading: '최근 채택된 텍스트',
    pipelineHeading: '입법 파이프라인 개요',
    procedureHeading: '절차 상태',
    analysisHeading: '영향 평가',
    analysis:
      '현재 입법 활동은 지속 가능한 금융, 디지털 거버넌스 및 환경 정책에서 의회의 우선순위를 반영합니다.',
    pipelineHealthLabel: '파이프라인 건전성',
    throughputRateLabel: '처리율',
    whyThisMatters:
      '이러한 입법 제안은 에너지 비용부터 디지털 권리까지 EU 시민에게 직접적인 영향을 미칩니다. 파이프라인을 이해하면 이해관계자들이 향후 규제 변화를 예측하는 데 도움이 됩니다.',
  },
  zh: {
    lede: '欧洲议会正在积极处理多项关键政策领域的立法提案。',
    proposalsHeading: '最近的立法程序',
    adoptedTextsHeading: '最近通过的文本',
    pipelineHeading: '立法管道概述',
    procedureHeading: '程序状态',
    analysisHeading: '影响评估',
    analysis: '当前的立法活动反映了议会在可持续金融、数字治理和环境政策方面的优先事项。',
    pipelineHealthLabel: '管道健康',
    throughputRateLabel: '吞吐率',
    whyThisMatters:
      '这些立法提案直接影响欧盟公民——从能源成本到数字权利。了解管道有助于利益相关者预测即将到来的监管变化。',
  },
};

/** Shared editorial strings used across article types for journalistic framing */
