// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/LanguageArticles
 * @description Article-type-specific title generators and body-text strings per language.
 * Each article type (week-ahead, motions, breaking, committee, propositions)
 * has its own localized title template returning `LangTitleSubtitle`.
 */

import type {
  LanguageMap,
  LangTitleSubtitle,
  PropositionsStrings,
  EditorialStrings,
} from '../types/index.js';

/** Week ahead title templates per language */
export const WEEK_AHEAD_TITLES: LanguageMap<(start: string, end: string) => LangTitleSubtitle> = {
  en: (start, end) => ({
    title: `Week Ahead: ${start} to ${end}`,
    subtitle:
      'European Parliament calendar, committee meetings, and plenary debates for the coming week',
  }),
  sv: (start, end) => ({
    title: `Vecka Framåt: ${start} till ${end}`,
    subtitle: 'Europaparlamentets kalender, utskottsmöten och plenardebatter för kommande vecka',
  }),
  da: (start, end) => ({
    title: `Ugen Fremover: ${start} til ${end}`,
    subtitle: 'Europa-Parlamentets kalender, udvalgsmøder og plenardebatter for den kommende uge',
  }),
  no: (start, end) => ({
    title: `Uken Fremover: ${start} til ${end}`,
    subtitle: 'Europaparlamentets kalender, komitémøter og plenardebatter for kommende uke',
  }),
  fi: (start, end) => ({
    title: `Tuleva Viikko: ${start} - ${end}`,
    subtitle:
      'Euroopan parlamentin kalenteri, valiokuntien kokoukset ja täysistuntokeskustelut tulevalle viikolle',
  }),
  de: (start, end) => ({
    title: `Woche Voraus: ${start} bis ${end}`,
    subtitle:
      'Europäischer Parlamentskalender, Ausschusssitzungen und Plenardebatten für die kommende Woche',
  }),
  fr: (start, end) => ({
    title: `Semaine à Venir: ${start} au ${end}`,
    subtitle:
      'Calendrier du Parlement européen, réunions de commission et débats pléniers pour la semaine à venir',
  }),
  es: (start, end) => ({
    title: `Semana Próxima: ${start} a ${end}`,
    subtitle:
      'Calendario del Parlamento Europeo, reuniones de comisión y debates plenarios para la próxima semana',
  }),
  nl: (start, end) => ({
    title: `Week Vooruit: ${start} tot ${end}`,
    subtitle:
      'Europees Parlement kalender, commissievergaderingen en plenaire debatten voor de komende week',
  }),
  ar: (start, end) => ({
    title: `الأسبوع القادم: ${start} إلى ${end}`,
    subtitle: 'جدول أعمال البرلمان الأوروبي واجتماعات اللجان والنقاشات العامة للأسبوع القادم',
  }),
  he: (start, end) => ({
    title: `השבוע הקרוב: ${start} עד ${end}`,
    subtitle: 'לוח הזמנים של הפרלמנט האירופי, ישיבות ועדות ודיוני מליאה לשבוע הקרוב',
  }),
  ja: (start, end) => ({
    title: `今週の予定: ${start} ～ ${end}`,
    subtitle: '欧州議会のカレンダー、委員会会合、本会議の討論',
  }),
  ko: (start, end) => ({
    title: `다음 주 일정: ${start} ~ ${end}`,
    subtitle: '유럽 의회 일정, 위원회 회의 및 본회의 토론',
  }),
  zh: (start, end) => ({
    title: `下周预告: ${start} 至 ${end}`,
    subtitle: '欧洲议会日历、委员会会议和全体辩论',
  }),
};

/** Motions title templates per language */
export const MOTIONS_TITLES: LanguageMap<(date: string) => LangTitleSubtitle> = {
  en: (date) => ({
    title: `Parliamentary Motions & Votes: ${date}`,
    subtitle:
      'Recent parliamentary motions, voting records, party cohesion analysis, and detected voting anomalies in the European Parliament',
  }),
  sv: (date) => ({
    title: `Parlamentariska Motioner & Omröstningar: ${date}`,
    subtitle:
      'Senaste parlamentariska motioner, omröstningsresultat, analys av partikohesion och upptäckta omröstningsanomalier i Europaparlamentet',
  }),
  da: (date) => ({
    title: `Parlamentariske Motioner & Afstemninger: ${date}`,
    subtitle:
      'Seneste parlamentariske motioner, afstemningsresultater, analyse af partikohæsion og opdagede afstemningsanomalier i Europa-Parlamentet',
  }),
  no: (date) => ({
    title: `Parlamentariske Forslag & Avstemninger: ${date}`,
    subtitle:
      'Siste parlamentariske forslag, avstemningsresultater, partikohesjon og avvikende avstemninger i Europaparlamentet',
  }),
  fi: (date) => ({
    title: `Parlamentaariset Esitykset & Äänestykset: ${date}`,
    subtitle:
      'Viimeisimmät parlamentaariset esitykset, äänestystulokset, puoluekohesio-analyysi ja havaitut äänestyspoikkeamat Euroopan parlamentissa',
  }),
  de: (date) => ({
    title: `Parlamentarische Anträge & Abstimmungen: ${date}`,
    subtitle:
      'Aktuelle parlamentarische Anträge, Abstimmungsergebnisse, Fraktionskohäsionsanalyse und erkannte Abstimmungsanomalien im Europäischen Parlament',
  }),
  fr: (date) => ({
    title: `Motions & Votes Parlementaires: ${date}`,
    subtitle:
      'Motions parlementaires récentes, résultats de votes, analyse de cohésion des groupes politiques et anomalies de vote détectées au Parlement européen',
  }),
  es: (date) => ({
    title: `Mociones & Votaciones Parlamentarias: ${date}`,
    subtitle:
      'Mociones parlamentarias recientes, resultados de votaciones, análisis de cohesión de grupos políticos y anomalías de votación detectadas en el Parlamento Europeo',
  }),
  nl: (date) => ({
    title: `Parlementaire Moties & Stemmingen: ${date}`,
    subtitle:
      'Recente parlementaire moties, stemresultaten, fractiebinding-analyse en gedetecteerde stemanomalieën in het Europees Parlement',
  }),
  ar: (date) => ({
    title: `الاقتراحات البرلمانية والتصويت: ${date}`,
    subtitle:
      'أحدث الاقتراحات البرلمانية وسجلات التصويت وتحليل تماسك الأحزاب والشذوذ في التصويت في البرلمان الأوروبي',
  }),
  he: (date) => ({
    title: `הצעות פרלמנטריות והצבעות: ${date}`,
    subtitle:
      'הצעות פרלמנטריות אחרונות, רשומות הצבעה, ניתוח לכידות מפלגתית וחריגות הצבעה בפרלמנט האירופי',
  }),
  ja: (date) => ({
    title: `議会動議と投票: ${date}`,
    subtitle: '欧州議会における最近の議会動議、投票記録、政党結束分析、投票異常',
  }),
  ko: (date) => ({
    title: `의회 동의안 및 투표: ${date}`,
    subtitle: '유럽 의회의 최근 의회 동의안, 투표 기록, 정당 결속 분석 및 투표 이상 감지',
  }),
  zh: (date) => ({
    title: `议会动议与投票: ${date}`,
    subtitle: '欧洲议会最近的议会动议、投票记录、政党凝聚力分析和投票异常检测',
  }),
};

/** Breaking news title templates per language */
export const BREAKING_NEWS_TITLES: LanguageMap<(date: string) => LangTitleSubtitle> = {
  en: (date) => ({
    title: `Breaking: Significant Parliamentary Developments — ${date}`,
    subtitle: 'Intelligence analysis of voting anomalies, coalition shifts, and key MEP activities',
  }),
  sv: (date) => ({
    title: `Senaste Nytt: Betydande Parlamentariska Händelser — ${date}`,
    subtitle:
      'Underrättelseanalys av röstningsanomalier, koalitionsförändringar och viktig MEP-aktivitet',
  }),
  da: (date) => ({
    title: `Seneste Nyt: Betydelige Parlamentariske Udviklinger — ${date}`,
    subtitle:
      'Efterretningsanalyse af afstemningsanomalier, koalitionsforskydninger og centrale MEP-aktiviteter',
  }),
  no: (date) => ({
    title: `Siste Nytt: Betydelige Parlamentariske Hendelser — ${date}`,
    subtitle:
      'Etterretningsanalyse av avstemningsavvik, koalisjonsendringer og viktige MEP-aktiviteter',
  }),
  fi: (date) => ({
    title: `Uusimmat Uutiset: Merkittäviä Parlamentaarisia Kehityksiä — ${date}`,
    subtitle:
      'Tiedusteluanalyysi äänestyspoikkeamista, koalitiomuutoksista ja keskeisistä MEP-toimista',
  }),
  de: (date) => ({
    title: `Eilmeldung: Bedeutende Parlamentarische Entwicklungen — ${date}`,
    subtitle:
      'Analyse von Abstimmungsanomalien, Koalitionsverschiebungen und wichtigen MEP-Aktivitäten',
  }),
  fr: (date) => ({
    title: `Dernières Nouvelles: Développements Parlementaires Significatifs — ${date}`,
    subtitle:
      'Analyse des anomalies de vote, des évolutions des coalitions et des activités clés des eurodéputés',
  }),
  es: (date) => ({
    title: `Última Hora: Desarrollos Parlamentarios Significativos — ${date}`,
    subtitle:
      'Análisis de anomalías en votaciones, cambios en coaliciones y actividades clave de eurodiputados',
  }),
  nl: (date) => ({
    title: `Laatste Nieuws: Significante Parlementaire Ontwikkelingen — ${date}`,
    subtitle: 'Analyse van stemanomalieën, coalitieverschuivingen en belangrijke MEP-activiteiten',
  }),
  ar: (date) => ({
    title: `عاجل: تطورات برلمانية هامة — ${date}`,
    subtitle: 'تحليل استخباراتي لشذوذ التصويت وتحولات التحالفات وأنشطة النواب الرئيسية',
  }),
  he: (date) => ({
    title: `חדשות דחופות: התפתחויות פרלמנטריות משמעותיות — ${date}`,
    subtitle: 'ניתוח מודיעיני של חריגות הצבעה, שינויי קואליציה ופעילויות חברי פרלמנט מרכזיות',
  }),
  ja: (date) => ({
    title: `速報: 重要な議会の動き — ${date}`,
    subtitle: '投票異常、連立変動、主要MEP活動の分析',
  }),
  ko: (date) => ({
    title: `속보: 중요한 의회 동향 — ${date}`,
    subtitle: '투표 이상, 연합 변화 및 주요 MEP 활동 분석',
  }),
  zh: (date) => ({
    title: `突发: 重大议会进展 — ${date}`,
    subtitle: '投票异常、联盟变化和关键MEP活动的情报分析',
  }),
};

/** Committee reports titles per language */
export const COMMITTEE_REPORTS_TITLES: LanguageMap<(committee: string) => LangTitleSubtitle> = {
  en: (committee) => ({
    title: `EU Parliament Committee Activity Report: ${committee}`,
    subtitle:
      'Analysis of recent legislative output, effectiveness metrics, and key committee activities',
  }),
  sv: (committee) => ({
    title: `Aktivitetsrapport för Europaparlamentets utskott: ${committee}`,
    subtitle:
      'Analys av nylig lagstiftningsproduktion, effektivitetsmätningar och viktigaste utskottsaktiviteter',
  }),
  da: (committee) => ({
    title: `Aktivitetsrapport for Europa-Parlamentets udvalg: ${committee}`,
    subtitle:
      'Analyse af den seneste lovgivningsproduktion, effektivitetsmålinger og vigtigste udvalgsaktiviteter',
  }),
  no: (committee) => ({
    title: `Aktivitetsrapport for Europaparlamentets komiteer: ${committee}`,
    subtitle:
      'Analyse av nylig lovgivningsproduksjon, effektivitetsmålinger og viktigste komitéaktiviteter',
  }),
  fi: (committee) => ({
    title: `Euroopan parlamentin valiokuntien toimintaraportti: ${committee}`,
    subtitle:
      'Analyysi viimeaikaisesta lainsäädäntötuotannosta, tehokkuusmittareista ja tärkeimmistä valiokuntatoiminnoista',
  }),
  de: (committee) => ({
    title: `EU-Parlament Ausschussbericht: ${committee}`,
    subtitle:
      'Analyse der Gesetzgebungsleistung, Effektivitätskennzahlen und wichtiger Ausschussaktivitäten',
  }),
  fr: (committee) => ({
    title: `Rapport d'activité des commissions du Parlement européen: ${committee}`,
    subtitle:
      "Analyse de la production législative récente, des indicateurs d'efficacité et des activités clés des commissions",
  }),
  es: (committee) => ({
    title: `Informe de actividad de comisiones del Parlamento Europeo: ${committee}`,
    subtitle:
      'Análisis de la producción legislativa reciente, métricas de efectividad y actividades clave de las comisiones',
  }),
  nl: (committee) => ({
    title: `Activiteitenrapport commissies Europees Parlement: ${committee}`,
    subtitle:
      'Analyse van recente wetgevingsoutput, effectiviteitsmetrieken en belangrijkste commissieactiviteiten',
  }),
  ar: (committee) => ({
    title: `تقرير نشاط لجان البرلمان الأوروبي: ${committee}`,
    subtitle: 'تحليل الإنتاج التشريعي الأخير ومقاييس الفعالية والأنشطة الرئيسية للجان',
  }),
  he: (committee) => ({
    title: `דוח פעילות ועדות הפרלמנט האירופי: ${committee}`,
    subtitle: 'ניתוח תפוקה חקיקתית אחרונה, מדדי אפקטיביות ופעילויות ועדה מרכזיות',
  }),
  ja: (committee) => ({
    title: `EU議会委員会活動報告: ${committee}`,
    subtitle: '最近の立法成果、有効性指標、主要な委員会活動の分析',
  }),
  ko: (committee) => ({
    title: `EU 의회 위원회 활동 보고서: ${committee}`,
    subtitle: '최근 입법 산출물, 효과성 지표 및 주요 위원회 활동 분석',
  }),
  zh: (committee) => ({
    title: `EU议会委员会活动报告: ${committee}`,
    subtitle: '最近立法成果、效能指标和关键委员会活动分析',
  }),
};

/** Propositions title templates per language */
export const PROPOSITIONS_TITLES: LanguageMap<() => LangTitleSubtitle> = {
  en: () => ({
    title: 'Legislative Proposals: European Parliament Monitor',
    subtitle:
      'Recent legislative proposals, procedure tracking, and pipeline status in the European Parliament',
  }),
  sv: () => ({
    title: 'Lagstiftningsförslag: EU-parlamentsmonitor',
    subtitle:
      'Senaste lagstiftningsförslag, procedurspårning och pipeline-status i Europaparlamentet',
  }),
  da: () => ({
    title: 'Lovgivningsforslag: EU-parlamentsmonitor',
    subtitle:
      'Seneste lovgivningsforslag, proceduresporing og pipeline-status i Europa-Parlamentet',
  }),
  no: () => ({
    title: 'Lovgivningsforslag: EU-parlamentsmonitor',
    subtitle: 'Siste lovgivningsforslag, prosedyresporing og pipeline-status i Europaparlamentet',
  }),
  fi: () => ({
    title: 'Lainsäädäntöehdotukset: EU-parlamentin seuranta',
    subtitle:
      'Viimeisimmät lainsäädäntöehdotukset, menettelyseuranta ja pipeline-tila Euroopan parlamentissa',
  }),
  de: () => ({
    title: 'Gesetzgebungsvorschläge: EU-Parlamentsmonitor',
    subtitle:
      'Aktuelle Gesetzgebungsvorschläge, Verfahrensverfolgung und Pipeline-Status im Europäischen Parlament',
  }),
  fr: () => ({
    title: 'Propositions Législatives: Moniteur du Parlement Européen',
    subtitle:
      'Propositions législatives récentes, suivi des procédures et état du pipeline au Parlement européen',
  }),
  es: () => ({
    title: 'Propuestas Legislativas: Monitor del Parlamento Europeo',
    subtitle:
      'Propuestas legislativas recientes, seguimiento de procedimientos y estado del pipeline en el Parlamento Europeo',
  }),
  nl: () => ({
    title: 'Wetgevingsvoorstellen: EU Parlementsmonitor',
    subtitle:
      'Recente wetgevingsvoorstellen, procedurebewaking en pipeline-status in het Europees Parlement',
  }),
  ar: () => ({
    title: 'المقترحات التشريعية: مراقب البرلمان الأوروبي',
    subtitle:
      'المقترحات التشريعية الأخيرة ومتابعة الإجراءات وحالة خط الأنابيب في البرلمان الأوروبي',
  }),
  he: () => ({
    title: 'הצעות חקיקה: מוניטור הפרלמנט האירופי',
    subtitle: 'הצעות חקיקה אחרונות, מעקב אחר הליכים ומצב צינור החקיקה בפרלמנט האירופי',
  }),
  ja: () => ({
    title: '法案提案: EU議会モニター',
    subtitle: '欧州議会における最近の法案提案、手続き追跡、パイプライン状況',
  }),
  ko: () => ({
    title: '입법 제안: EU 의회 모니터',
    subtitle: '유럽 의회의 최근 입법 제안, 절차 추적 및 파이프라인 상태',
  }),
  zh: () => ({
    title: '立法提案: EU议会监测',
    subtitle: '欧洲议会最近的立法提案、程序跟踪和流水线状态',
  }),
};

/** Localized body text strings for propositions articles */
export const PROPOSITIONS_STRINGS: LanguageMap<PropositionsStrings> = {
  en: {
    lede: 'The European Parliament is actively processing multiple legislative proposals across key policy areas. This report tracks current proposals, their procedure status, and the overall legislative pipeline.',
    proposalsHeading: 'Recent Legislative Proposals',
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
    proposalsHeading: 'Senaste Lagstiftningsförslag',
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
    proposalsHeading: 'Seneste Lovgivningsforslag',
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
    proposalsHeading: 'Siste Lovgivningsforslag',
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
    proposalsHeading: 'Viimeisimmät Lainsäädäntöehdotukset',
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
    proposalsHeading: 'Aktuelle Gesetzgebungsvorschläge',
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
    proposalsHeading: 'Propositions Législatives Récentes',
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
    proposalsHeading: 'Propuestas Legislativas Recientes',
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
    proposalsHeading: 'Recente Wetgevingsvoorstellen',
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
    proposalsHeading: 'المقترحات التشريعية الأخيرة',
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
    proposalsHeading: 'הצעות חקיקה אחרונות',
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
    proposalsHeading: '最近の法案提案',
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
    proposalsHeading: '최근 입법 제안',
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
    proposalsHeading: '最近的立法提案',
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
export const EDITORIAL_STRINGS: LanguageMap<EditorialStrings> = {
  en: {
    whyThisMatters: 'Why This Matters',
    keyTakeaway: 'Key Finding',
    parliamentaryContext: 'Parliamentary Context',
    sourceAttribution: 'According to European Parliament data',
    analysisNote: 'Analysis Note',
  },
  sv: {
    whyThisMatters: 'Varför Det Spelar Roll',
    keyTakeaway: 'Viktigaste Slutsats',
    parliamentaryContext: 'Parlamentarisk Kontext',
    sourceAttribution: 'Enligt Europaparlamentets uppgifter',
    analysisNote: 'Analysnot',
  },
  da: {
    whyThisMatters: 'Hvorfor Det Betyder Noget',
    keyTakeaway: 'Vigtigste Konklusion',
    parliamentaryContext: 'Parlamentarisk Kontekst',
    sourceAttribution: 'Ifølge Europa-Parlamentets data',
    analysisNote: 'Analysenotat',
  },
  no: {
    whyThisMatters: 'Hvorfor Det Betyr Noe',
    keyTakeaway: 'Viktigste Funn',
    parliamentaryContext: 'Parlamentarisk Kontekst',
    sourceAttribution: 'Ifølge Europaparlamentets data',
    analysisNote: 'Analysenotat',
  },
  fi: {
    whyThisMatters: 'Miksi Tällä On Merkitystä',
    keyTakeaway: 'Tärkein Havainto',
    parliamentaryContext: 'Parlamentaarinen Konteksti',
    sourceAttribution: 'Euroopan parlamentin tietojen mukaan',
    analysisNote: 'Analyysimerkintä',
  },
  de: {
    whyThisMatters: 'Warum Das Wichtig Ist',
    keyTakeaway: 'Wichtigste Erkenntnis',
    parliamentaryContext: 'Parlamentarischer Kontext',
    sourceAttribution: 'Laut Daten des Europäischen Parlaments',
    analysisNote: 'Analysehinweis',
  },
  fr: {
    whyThisMatters: "Pourquoi C'est Important",
    keyTakeaway: 'Constat Clé',
    parliamentaryContext: 'Contexte Parlementaire',
    sourceAttribution: 'Selon les données du Parlement européen',
    analysisNote: "Note d'analyse",
  },
  es: {
    whyThisMatters: 'Por Qué Importa',
    keyTakeaway: 'Hallazgo Clave',
    parliamentaryContext: 'Contexto Parlamentario',
    sourceAttribution: 'Según datos del Parlamento Europeo',
    analysisNote: 'Nota de Análisis',
  },
  nl: {
    whyThisMatters: 'Waarom Dit Belangrijk Is',
    keyTakeaway: 'Belangrijkste Bevinding',
    parliamentaryContext: 'Parlementaire Context',
    sourceAttribution: 'Volgens gegevens van het Europees Parlement',
    analysisNote: 'Analysenoot',
  },
  ar: {
    whyThisMatters: 'لماذا هذا مهم',
    keyTakeaway: 'الاستنتاج الرئيسي',
    parliamentaryContext: 'السياق البرلماني',
    sourceAttribution: 'وفقاً لبيانات البرلمان الأوروبي',
    analysisNote: 'ملاحظة تحليلية',
  },
  he: {
    whyThisMatters: 'מדוע זה חשוב',
    keyTakeaway: 'ממצא מרכזי',
    parliamentaryContext: 'הקשר פרלמנטרי',
    sourceAttribution: 'לפי נתוני הפרלמנט האירופי',
    analysisNote: 'הערת ניתוח',
  },
  ja: {
    whyThisMatters: 'なぜ重要か',
    keyTakeaway: '主要な発見',
    parliamentaryContext: '議会の背景',
    sourceAttribution: '欧州議会データによると',
    analysisNote: '分析メモ',
  },
  ko: {
    whyThisMatters: '왜 중요한가',
    keyTakeaway: '핵심 발견',
    parliamentaryContext: '의회 맥락',
    sourceAttribution: '유럽 의회 데이터에 따르면',
    analysisNote: '분석 메모',
  },
  zh: {
    whyThisMatters: '为何重要',
    keyTakeaway: '关键发现',
    parliamentaryContext: '议会背景',
    sourceAttribution: '根据欧洲议会数据',
    analysisNote: '分析说明',
  },
};
