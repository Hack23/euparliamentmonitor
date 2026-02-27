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
  MotionsStrings,
  WeekAheadStrings,
  BreakingStrings,
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

/** Month ahead title templates per language */
export const MONTH_AHEAD_TITLES: LanguageMap<(month: string) => LangTitleSubtitle> = {
  en: (month) => ({
    title: `Month Ahead: ${month}`,
    subtitle:
      'European Parliament strategic outlook — legislative milestones, committee calendar, and policy agenda for the coming month',
  }),
  sv: (month) => ({
    title: `Månaden Framåt: ${month}`,
    subtitle:
      'Europaparlamentets strategiska utsikt — lagstiftningsmilstolpar, utskottskalender och politisk agenda för kommande månad',
  }),
  da: (month) => ({
    title: `Måneden Fremover: ${month}`,
    subtitle:
      'Europa-Parlamentets strategiske udsigt — lovgivningsmilepæle, udvalgskalender og politisk dagsorden for den kommende måned',
  }),
  no: (month) => ({
    title: `Måneden Fremover: ${month}`,
    subtitle:
      'Europaparlamentets strategiske utsikt — lovgivningsmilestener, komitékalender og politisk agenda for kommende måned',
  }),
  fi: (month) => ({
    title: `Tuleva Kuukausi: ${month}`,
    subtitle:
      'Euroopan parlamentin strateginen katsaus — lainsäädännölliset virstanpylväät, valiokuntakalenteri ja poliittinen agenda tulevalle kuukaudelle',
  }),
  de: (month) => ({
    title: `Monat Voraus: ${month}`,
    subtitle:
      'Strategischer Ausblick des Europäischen Parlaments — Gesetzgebungsmeilensteine, Ausschusskalender und politische Agenda für den kommenden Monat',
  }),
  fr: (month) => ({
    title: `Mois à Venir: ${month}`,
    subtitle:
      'Perspectives stratégiques du Parlement européen — jalons législatifs, calendrier des commissions et agenda politique pour le mois à venir',
  }),
  es: (month) => ({
    title: `Mes Próximo: ${month}`,
    subtitle:
      'Perspectiva estratégica del Parlamento Europeo — hitos legislativos, calendario de comisiones y agenda política para el próximo mes',
  }),
  nl: (month) => ({
    title: `Maand Vooruit: ${month}`,
    subtitle:
      'Strategische vooruitblik Europees Parlement — wetgevingsmijlpalen, commissiekalender en politieke agenda voor de komende maand',
  }),
  ar: (month) => ({
    title: `الشهر القادم: ${month}`,
    subtitle:
      'نظرة استراتيجية للبرلمان الأوروبي — معالم تشريعية وجدول أعمال اللجان والأجندة السياسية للشهر القادم',
  }),
  he: (month) => ({
    title: `החודש הקרוב: ${month}`,
    subtitle:
      'תחזית אסטרטגית של הפרלמנט האירופי — אבני דרך חקיקתיות, לוח ועדות ואג׳נדה פוליטית לחודש הקרוב',
  }),
  ja: (month) => ({
    title: `来月の展望: ${month}`,
    subtitle: '欧州議会の戦略的展望 — 立法上のマイルストーン、委員会カレンダー、政策アジェンダ',
  }),
  ko: (month) => ({
    title: `다음 달 전망: ${month}`,
    subtitle: '유럽 의회 전략적 전망 — 입법 이정표, 위원회 일정 및 정책 의제',
  }),
  zh: (month) => ({
    title: `下月展望: ${month}`,
    subtitle: '欧洲议会战略展望 — 立法里程碑、委员会日程和政策议程',
  }),
};

/** Weekly review title templates per language */
export const WEEKLY_REVIEW_TITLES: LanguageMap<(start: string, end: string) => LangTitleSubtitle> =
  {
    en: (start, end) => ({
      title: `Week in Review: ${start} to ${end}`,
      subtitle:
        'Analysis of the past week in the European Parliament — votes, committee decisions, and legislative developments',
    }),
    sv: (start, end) => ({
      title: `Veckan i Korthet: ${start} till ${end}`,
      subtitle:
        'Analys av den gångna veckan i Europaparlamentet — omröstningar, utskottsbeslut och lagstiftningsutvecklingar',
    }),
    da: (start, end) => ({
      title: `Ugen i Overblik: ${start} til ${end}`,
      subtitle:
        'Analyse af den forgangne uge i Europa-Parlamentet — afstemninger, udvalgsbeslutninger og lovgivningsudviklinger',
    }),
    no: (start, end) => ({
      title: `Uken i Tilbakeblikk: ${start} til ${end}`,
      subtitle:
        'Analyse av den siste uken i Europaparlamentet — avstemninger, komitébeslutninger og lovgivningsutvikling',
    }),
    fi: (start, end) => ({
      title: `Viikon Katsaus: ${start} - ${end}`,
      subtitle:
        'Analyysi kuluneesta viikosta Euroopan parlamentissa — äänestykset, valiokuntapäätökset ja lainsäädäntökehitys',
    }),
    de: (start, end) => ({
      title: `Woche im Rückblick: ${start} bis ${end}`,
      subtitle:
        'Analyse der vergangenen Woche im Europäischen Parlament — Abstimmungen, Ausschussentscheidungen und Gesetzgebungsentwicklungen',
    }),
    fr: (start, end) => ({
      title: `Semaine en Revue: ${start} au ${end}`,
      subtitle:
        'Analyse de la semaine écoulée au Parlement européen — votes, décisions de commission et évolutions législatives',
    }),
    es: (start, end) => ({
      title: `Semana en Revisión: ${start} a ${end}`,
      subtitle:
        'Análisis de la semana pasada en el Parlamento Europeo — votaciones, decisiones de comisión y desarrollos legislativos',
    }),
    nl: (start, end) => ({
      title: `Week in Overzicht: ${start} tot ${end}`,
      subtitle:
        'Analyse van de afgelopen week in het Europees Parlement — stemmingen, commissiebesluiten en wetgevingsontwikkelingen',
    }),
    ar: (start, end) => ({
      title: `مراجعة الأسبوع: ${start} إلى ${end}`,
      subtitle:
        'تحليل الأسبوع الماضي في البرلمان الأوروبي — التصويتات وقرارات اللجان والتطورات التشريعية',
    }),
    he: (start, end) => ({
      title: `סקירת השבוע: ${start} עד ${end}`,
      subtitle: 'ניתוח השבוע שחלף בפרלמנט האירופי — הצבעות, החלטות ועדות והתפתחויות חקיקתיות',
    }),
    ja: (start, end) => ({
      title: `今週の振り返り: ${start} ～ ${end}`,
      subtitle: '欧州議会における先週の分析 — 投票、委員会の決定、立法の進展',
    }),
    ko: (start, end) => ({
      title: `주간 리뷰: ${start} ~ ${end}`,
      subtitle: '유럽 의회 지난 주 분석 — 투표, 위원회 결정 및 입법 발전',
    }),
    zh: (start, end) => ({
      title: `本周回顾: ${start} 至 ${end}`,
      subtitle: '欧洲议会过去一周分析 — 投票、委员会决定和立法进展',
    }),
  };

/** Monthly review title templates per language */
export const MONTHLY_REVIEW_TITLES: LanguageMap<(month: string) => LangTitleSubtitle> = {
  en: (month) => ({
    title: `Month in Review: ${month}`,
    subtitle:
      'Comprehensive analysis of the European Parliament — legislative output, coalition dynamics, and policy trends',
  }),
  sv: (month) => ({
    title: `Månaden i Korthet: ${month}`,
    subtitle:
      'Övergripande analys av Europaparlamentet — lagstiftningsutfall, koalitionsdynamik och policytrender',
  }),
  da: (month) => ({
    title: `Måneden i Overblik: ${month}`,
    subtitle:
      'Omfattende analyse af Europa-Parlamentet — lovgivningsresultater, koalitionsdynamik og politiktendenser',
  }),
  no: (month) => ({
    title: `Måneden i Tilbakeblikk: ${month}`,
    subtitle:
      'Omfattende analyse av Europaparlamentet — lovgivningsresultater, koalisjonsdynamikk og politiske trender',
  }),
  fi: (month) => ({
    title: `Kuukauden Katsaus: ${month}`,
    subtitle:
      'Kattava analyysi Euroopan parlamentista — lainsäädäntötulokset, koalitiodynamiikka ja politiikkatrendit',
  }),
  de: (month) => ({
    title: `Monat im Rückblick: ${month}`,
    subtitle:
      'Umfassende Analyse des Europäischen Parlaments — Gesetzgebungsleistung, Koalitionsdynamik und Politiktrends',
  }),
  fr: (month) => ({
    title: `Mois en Revue: ${month}`,
    subtitle:
      'Analyse complète du Parlement européen — production législative, dynamiques de coalition et tendances politiques',
  }),
  es: (month) => ({
    title: `Mes en Revisión: ${month}`,
    subtitle:
      'Análisis integral del Parlamento Europeo — producción legislativa, dinámicas de coalición y tendencias políticas',
  }),
  nl: (month) => ({
    title: `Maand in Overzicht: ${month}`,
    subtitle:
      'Uitgebreide analyse van het Europees Parlement — wetgevingsproductie, coalitiedynamiek en beleidstrends',
  }),
  ar: (month) => ({
    title: `مراجعة الشهر: ${month}`,
    subtitle:
      'تحليل شامل للبرلمان الأوروبي — الإنتاج التشريعي وديناميات التحالفات واتجاهات السياسات',
  }),
  he: (month) => ({
    title: `סקירת החודש: ${month}`,
    subtitle: 'ניתוח מקיף של הפרלמנט האירופי — תפוקה חקיקתית, דינמיקת קואליציות ומגמות מדיניות',
  }),
  ja: (month) => ({
    title: `月間レビュー: ${month}`,
    subtitle: '欧州議会の包括的分析 — 立法成果、連立動態、政策トレンド',
  }),
  ko: (month) => ({
    title: `월간 리뷰: ${month}`,
    subtitle: '유럽 의회 종합 분석 — 입법 성과, 연합 역학 및 정책 동향',
  }),
  zh: (month) => ({
    title: `月度回顾: ${month}`,
    subtitle: '欧洲议会综合分析 — 立法成果、联盟动态和政策趋势',
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

/** Localized section heading strings for motions articles */
export const MOTIONS_STRINGS: LanguageMap<MotionsStrings> = {
  en: {
    lede: 'Recent parliamentary activities reveal key voting patterns, party cohesion trends, and notable political dynamics in the European Parliament.',
    votingRecordsHeading: 'Recent Voting Records',
    partyCohesionHeading: 'Party Cohesion Analysis',
    anomaliesHeading: 'Detected Voting Anomalies',
    questionsHeading: 'Recent Parliamentary Questions',
    dateLabel: 'Date',
    resultLabel: 'Result',
    forLabel: 'For',
    againstLabel: 'Against',
    abstainLabel: 'Abstain',
    cohesionLabel: 'Cohesion',
    participationLabel: 'Participation',
    severityLabel: 'Severity',
    statusLabel: 'Status',
    keyTakeawayText:
      'Voting records and party cohesion data reveal political alignment across the European Parliament, helping citizens understand how their elected representatives make legislative decisions.',
    politicalAlignmentHeading: 'Political Alignment',
  },
  sv: {
    lede: 'Senaste parlamentariska aktiviteter avslöjar viktiga röstmönster, partikohesionstrender och anmärkningsvärda politiska dynamiker i Europaparlamentet.',
    votingRecordsHeading: 'Senaste Omröstningsresultat',
    partyCohesionHeading: 'Analys av Partikohesion',
    anomaliesHeading: 'Upptäckta Omröstningsanomalier',
    questionsHeading: 'Senaste Parlamentariska Frågor',
    dateLabel: 'Datum',
    resultLabel: 'Resultat',
    forLabel: 'För',
    againstLabel: 'Emot',
    abstainLabel: 'Avstår',
    cohesionLabel: 'Kohesion',
    participationLabel: 'Deltagande',
    severityLabel: 'Allvarlighetsgrad',
    statusLabel: 'Status',
    keyTakeawayText:
      'Omröstningsresultat och partikohesionsdata avslöjar politisk samstämmighet i Europaparlamentet och hjälper medborgare att förstå hur deras valda representanter fattar lagstiftningsbeslut.',
    politicalAlignmentHeading: 'Politisk Samstämmighet',
  },
  da: {
    lede: 'Seneste parlamentariske aktiviteter afslører vigtige afstemningmønstre, partikohæsionstendenser og bemærkelsesværdige politiske dynamikker i Europa-Parlamentet.',
    votingRecordsHeading: 'Seneste Afstemningsresultater',
    partyCohesionHeading: 'Analyse af Partikohæsion',
    anomaliesHeading: 'Opdagede Afstemningsanomalier',
    questionsHeading: 'Seneste Parlamentariske Spørgsmål',
    dateLabel: 'Dato',
    resultLabel: 'Resultat',
    forLabel: 'For',
    againstLabel: 'Imod',
    abstainLabel: 'Undlader',
    cohesionLabel: 'Kohæsion',
    participationLabel: 'Deltagelse',
    severityLabel: 'Alvorlighed',
    statusLabel: 'Status',
    keyTakeawayText:
      'Afstemningsresultater og partikohæsionsdata afslører politisk tilpasning i Europa-Parlamentet og hjælper borgere med at forstå, hvordan deres valgte repræsentanter træffer lovgivningsbeslutninger.',
    politicalAlignmentHeading: 'Politisk Tilpasning',
  },
  no: {
    lede: 'Nylige parlamentariske aktiviteter avslører viktige avstemningsmønstre, partikohesjonstrender og bemerkelsesverdige politiske dynamikker i Europaparlamentet.',
    votingRecordsHeading: 'Siste Avstemningsresultater',
    partyCohesionHeading: 'Analyse av Partikohesjon',
    anomaliesHeading: 'Oppdagede Avstemningsavvik',
    questionsHeading: 'Siste Parlamentariske Spørsmål',
    dateLabel: 'Dato',
    resultLabel: 'Resultat',
    forLabel: 'For',
    againstLabel: 'Mot',
    abstainLabel: 'Avstår',
    cohesionLabel: 'Kohesjon',
    participationLabel: 'Deltakelse',
    severityLabel: 'Alvorlighetsgrad',
    statusLabel: 'Status',
    keyTakeawayText:
      'Avstemningsresultater og partikohesjonsdata avslører politisk samsvar i Europaparlamentet og hjelper borgere med å forstå hvordan deres valgte representanter tar lovgivningsbeslutninger.',
    politicalAlignmentHeading: 'Politisk Samsvar',
  },
  fi: {
    lede: 'Viimeaikaiset parlamentaariset toimet paljastavat keskeisiä äänestyskuvioita, puoluekohesiotrendejä ja merkittäviä poliittisia dynamiikkoja Euroopan parlamentissa.',
    votingRecordsHeading: 'Viimeisimmät Äänestystulokset',
    partyCohesionHeading: 'Puoluekohesion Analyysi',
    anomaliesHeading: 'Havaitut Äänestyspoikkeamat',
    questionsHeading: 'Viimeisimmät Parlamentaariset Kysymykset',
    dateLabel: 'Päivämäärä',
    resultLabel: 'Tulos',
    forLabel: 'Puolesta',
    againstLabel: 'Vastaan',
    abstainLabel: 'Tyhjä',
    cohesionLabel: 'Koheesio',
    participationLabel: 'Osallistuminen',
    severityLabel: 'Vakavuus',
    statusLabel: 'Tila',
    keyTakeawayText:
      'Äänestystulokset ja puoluekohesiotiedot paljastavat poliittisen linjauksen Euroopan parlamentissa ja auttavat kansalaisia ymmärtämään, miten heidän valitsemansa edustajat tekevät lainsäädäntöpäätöksiä.',
    politicalAlignmentHeading: 'Poliittinen Linjaus',
  },
  de: {
    lede: 'Jüngste parlamentarische Aktivitäten zeigen wichtige Abstimmungsmuster, Fraktionskohäsionstrends und bemerkenswerte politische Dynamiken im Europäischen Parlament.',
    votingRecordsHeading: 'Aktuelle Abstimmungsergebnisse',
    partyCohesionHeading: 'Analyse der Fraktionskohäsion',
    anomaliesHeading: 'Erkannte Abstimmungsanomalien',
    questionsHeading: 'Aktuelle Parlamentarische Anfragen',
    dateLabel: 'Datum',
    resultLabel: 'Ergebnis',
    forLabel: 'Dafür',
    againstLabel: 'Dagegen',
    abstainLabel: 'Enthaltung',
    cohesionLabel: 'Kohäsion',
    participationLabel: 'Beteiligung',
    severityLabel: 'Schweregrad',
    statusLabel: 'Status',
    keyTakeawayText:
      'Abstimmungsergebnisse und Fraktionskohäsionsdaten zeigen die politische Ausrichtung im Europäischen Parlament und helfen den Bürgern zu verstehen, wie ihre gewählten Vertreter Gesetzgebungsentscheidungen treffen.',
    politicalAlignmentHeading: 'Politische Ausrichtung',
  },
  fr: {
    lede: 'Les activités parlementaires récentes révèlent des schémas de vote clés, des tendances de cohésion des groupes politiques et des dynamiques politiques notables au Parlement européen.',
    votingRecordsHeading: 'Résultats de Vote Récents',
    partyCohesionHeading: 'Analyse de Cohésion des Groupes',
    anomaliesHeading: 'Anomalies de Vote Détectées',
    questionsHeading: 'Questions Parlementaires Récentes',
    dateLabel: 'Date',
    resultLabel: 'Résultat',
    forLabel: 'Pour',
    againstLabel: 'Contre',
    abstainLabel: 'Abstention',
    cohesionLabel: 'Cohésion',
    participationLabel: 'Participation',
    severityLabel: 'Gravité',
    statusLabel: 'Statut',
    keyTakeawayText:
      "Les résultats de vote et les données de cohésion des groupes révèlent l'alignement politique au Parlement européen, aidant les citoyens à comprendre comment leurs représentants élus prennent des décisions législatives.",
    politicalAlignmentHeading: 'Alignement Politique',
  },
  es: {
    lede: 'Las actividades parlamentarias recientes revelan patrones de votación clave, tendencias de cohesión de grupos políticos y dinámicas políticas notables en el Parlamento Europeo.',
    votingRecordsHeading: 'Resultados de Votación Recientes',
    partyCohesionHeading: 'Análisis de Cohesión de Grupos',
    anomaliesHeading: 'Anomalías de Votación Detectadas',
    questionsHeading: 'Preguntas Parlamentarias Recientes',
    dateLabel: 'Fecha',
    resultLabel: 'Resultado',
    forLabel: 'A favor',
    againstLabel: 'En contra',
    abstainLabel: 'Abstención',
    cohesionLabel: 'Cohesión',
    participationLabel: 'Participación',
    severityLabel: 'Gravedad',
    statusLabel: 'Estado',
    keyTakeawayText:
      'Los resultados de votación y los datos de cohesión de grupos revelan la alineación política en el Parlamento Europeo, ayudando a los ciudadanos a comprender cómo sus representantes electos toman decisiones legislativas.',
    politicalAlignmentHeading: 'Alineación Política',
  },
  nl: {
    lede: 'Recente parlementaire activiteiten onthullen belangrijke stempatronen, fractiebindingtrends en opmerkelijke politieke dynamieken in het Europees Parlement.',
    votingRecordsHeading: 'Recente Stemresultaten',
    partyCohesionHeading: 'Analyse van Fractiebinding',
    anomaliesHeading: 'Gedetecteerde Stemanomalieën',
    questionsHeading: 'Recente Parlementaire Vragen',
    dateLabel: 'Datum',
    resultLabel: 'Resultaat',
    forLabel: 'Voor',
    againstLabel: 'Tegen',
    abstainLabel: 'Onthouding',
    cohesionLabel: 'Cohesie',
    participationLabel: 'Deelname',
    severityLabel: 'Ernst',
    statusLabel: 'Status',
    keyTakeawayText:
      'Stemresultaten en fractiebindingsgegevens onthullen de politieke afstemming in het Europees Parlement en helpen burgers te begrijpen hoe hun gekozen vertegenwoordigers wetgevingsbeslissingen nemen.',
    politicalAlignmentHeading: 'Politieke Afstemming',
  },
  ar: {
    lede: 'تكشف الأنشطة البرلمانية الأخيرة أنماط تصويت رئيسية واتجاهات تماسك الأحزاب وديناميات سياسية بارزة في البرلمان الأوروبي.',
    votingRecordsHeading: 'سجلات التصويت الأخيرة',
    partyCohesionHeading: 'تحليل تماسك الأحزاب',
    anomaliesHeading: 'شذوذ التصويت المكتشف',
    questionsHeading: 'الأسئلة البرلمانية الأخيرة',
    dateLabel: 'التاريخ',
    resultLabel: 'النتيجة',
    forLabel: 'مع',
    againstLabel: 'ضد',
    abstainLabel: 'امتناع',
    cohesionLabel: 'التماسك',
    participationLabel: 'المشاركة',
    severityLabel: 'الخطورة',
    statusLabel: 'الحالة',
    keyTakeawayText:
      'تكشف سجلات التصويت وبيانات تماسك الأحزاب التوافق السياسي في البرلمان الأوروبي، مما يساعد المواطنين على فهم كيفية اتخاذ ممثليهم المنتخبين للقرارات التشريعية.',
    politicalAlignmentHeading: 'التوافق السياسي',
  },
  he: {
    lede: 'פעילויות פרלמנטריות אחרונות חושפות דפוסי הצבעה מרכזיים, מגמות לכידות מפלגתית ודינמיקות פוליטיות בולטות בפרלמנט האירופי.',
    votingRecordsHeading: 'רשומות הצבעה אחרונות',
    partyCohesionHeading: 'ניתוח לכידות מפלגתית',
    anomaliesHeading: 'חריגות הצבעה שזוהו',
    questionsHeading: 'שאילתות פרלמנטריות אחרונות',
    dateLabel: 'תאריך',
    resultLabel: 'תוצאה',
    forLabel: 'בעד',
    againstLabel: 'נגד',
    abstainLabel: 'נמנע',
    cohesionLabel: 'לכידות',
    participationLabel: 'השתתפות',
    severityLabel: 'חומרה',
    statusLabel: 'סטטוס',
    keyTakeawayText:
      'רשומות הצבעה ונתוני לכידות מפלגתית חושפים את ההתאמה הפוליטית בפרלמנט האירופי, ומסייעים לאזרחים להבין כיצד נבחריהם מקבלים החלטות חקיקה.',
    politicalAlignmentHeading: 'התאמה פוליטית',
  },
  ja: {
    lede: '最近の議会活動は、欧州議会における主要な投票パターン、政党結束の傾向、注目すべき政治的ダイナミクスを明らかにしています。',
    votingRecordsHeading: '最近の投票記録',
    partyCohesionHeading: '政党結束分析',
    anomaliesHeading: '検出された投票異常',
    questionsHeading: '最近の議会質問',
    dateLabel: '日付',
    resultLabel: '結果',
    forLabel: '賛成',
    againstLabel: '反対',
    abstainLabel: '棄権',
    cohesionLabel: '結束率',
    participationLabel: '参加率',
    severityLabel: '深刻度',
    statusLabel: 'ステータス',
    keyTakeawayText:
      '投票記録と政党結束データは、欧州議会における政治的連携を明らかにし、市民が選出された代表者がどのように立法上の決定を行うかを理解するのに役立ちます。',
    politicalAlignmentHeading: '政治的連携',
  },
  ko: {
    lede: '최근 의회 활동은 유럽 의회의 주요 투표 패턴, 정당 결속 동향 및 주목할 만한 정치적 역학을 보여줍니다.',
    votingRecordsHeading: '최근 투표 기록',
    partyCohesionHeading: '정당 결속 분석',
    anomaliesHeading: '감지된 투표 이상',
    questionsHeading: '최근 의회 질문',
    dateLabel: '날짜',
    resultLabel: '결과',
    forLabel: '찬성',
    againstLabel: '반대',
    abstainLabel: '기권',
    cohesionLabel: '결속률',
    participationLabel: '참여율',
    severityLabel: '심각도',
    statusLabel: '상태',
    keyTakeawayText:
      '투표 기록과 정당 결속 데이터는 유럽 의회의 정치적 정렬을 보여주며, 시민들이 선출된 대표자가 입법 결정을 내리는 방식을 이해하는 데 도움을 줍니다.',
    politicalAlignmentHeading: '정치적 정렬',
  },
  zh: {
    lede: '最近的议会活动揭示了欧洲议会中的关键投票模式、政党凝聚力趋势和值得注意的政治动态。',
    votingRecordsHeading: '最近投票记录',
    partyCohesionHeading: '政党凝聚力分析',
    anomaliesHeading: '检测到的投票异常',
    questionsHeading: '最近议会质询',
    dateLabel: '日期',
    resultLabel: '结果',
    forLabel: '赞成',
    againstLabel: '反对',
    abstainLabel: '弃权',
    cohesionLabel: '凝聚力',
    participationLabel: '参与率',
    severityLabel: '严重程度',
    statusLabel: '状态',
    keyTakeawayText:
      '投票记录和政党凝聚力数据揭示了欧洲议会中的政治一致性，帮助公民了解其当选代表如何做出立法决定。',
    politicalAlignmentHeading: '政治一致性',
  },
};

/** Localized section heading strings for week-ahead articles */
export const WEEK_AHEAD_STRINGS: LanguageMap<WeekAheadStrings> = {
  en: {
    lede: 'The European Parliament prepares for an active week ahead with multiple committee meetings and plenary sessions scheduled',
    plenarySessions: 'Plenary Sessions',
    committeeMeetings: 'Committee Meetings',
    legislativeDocuments: 'Upcoming Legislative Documents',
    legislativePipeline: 'Legislative Pipeline',
    parliamentaryQuestions: 'Parliamentary Questions',
    noPlenary: 'No plenary sessions scheduled for this period.',
    bottleneckIndicator: '⚠ Bottleneck',
    whatToWatch: 'What to Watch',
  },
  sv: {
    lede: 'Europaparlamentet förbereder sig för en aktiv vecka framåt med flera utskottsmöten och plenarsammanträden planerade',
    plenarySessions: 'Plenarsammanträden',
    committeeMeetings: 'Utskottsmöten',
    legislativeDocuments: 'Kommande Lagstiftningsdokument',
    legislativePipeline: 'Lagstiftnings-Pipeline',
    parliamentaryQuestions: 'Parlamentariska Frågor',
    noPlenary: 'Inga plenarsammanträden planerade för denna period.',
    bottleneckIndicator: '⚠ Flaskhals',
    whatToWatch: 'Att Bevaka',
  },
  da: {
    lede: 'Europa-Parlamentet forbereder sig på en aktiv uge med flere udvalgsmøder og plenarforsamlinger planlagt',
    plenarySessions: 'Plenarforsamlinger',
    committeeMeetings: 'Udvalgsmøder',
    legislativeDocuments: 'Kommende Lovgivningsdokumenter',
    legislativePipeline: 'Lovgivningspipeline',
    parliamentaryQuestions: 'Parlamentariske Spørgsmål',
    noPlenary: 'Ingen plenarforsamlinger planlagt for denne periode.',
    bottleneckIndicator: '⚠ Flaskehals',
    whatToWatch: 'Hvad Man Skal Holde Øje Med',
  },
  no: {
    lede: 'Europaparlamentet forbereder seg på en aktiv uke fremover med flere komitémøter og plenarrsamlinger planlagt',
    plenarySessions: 'Plenarsamlinger',
    committeeMeetings: 'Komitémøter',
    legislativeDocuments: 'Kommende Lovgivningsdokumenter',
    legislativePipeline: 'Lovgivningspipeline',
    parliamentaryQuestions: 'Parlamentariske Spørsmål',
    noPlenary: 'Ingen plenarsamlinger planlagt for denne perioden.',
    bottleneckIndicator: '⚠ Flaskehals',
    whatToWatch: 'Hva Man Bør Følge Med På',
  },
  fi: {
    lede: 'Euroopan parlamentti valmistautuu aktiiviseen viikkoon useilla valiokuntakokouksilla ja täysistunnoilla suunnitelmissa',
    plenarySessions: 'Täysistunnot',
    committeeMeetings: 'Valiokuntakokoukset',
    legislativeDocuments: 'Tulevat Lainsäädäntöasiakirjat',
    legislativePipeline: 'Lainsäädäntöputki',
    parliamentaryQuestions: 'Parlamentaariset Kysymykset',
    noPlenary: 'Ei täysistuntoja suunniteltu tälle jaksolle.',
    bottleneckIndicator: '⚠ Pullonkaula',
    whatToWatch: 'Mitä Seurata',
  },
  de: {
    lede: 'Das Europäische Parlament bereitet sich auf eine aktive Woche mit mehreren Ausschusssitzungen und Plenarsitzungen vor',
    plenarySessions: 'Plenarsitzungen',
    committeeMeetings: 'Ausschusssitzungen',
    legislativeDocuments: 'Anstehende Gesetzgebungsdokumente',
    legislativePipeline: 'Gesetzgebungspipeline',
    parliamentaryQuestions: 'Parlamentarische Anfragen',
    noPlenary: 'Keine Plenarsitzungen für diesen Zeitraum geplant.',
    bottleneckIndicator: '⚠ Engpass',
    whatToWatch: 'Was Zu Beachten Ist',
  },
  fr: {
    lede: 'Le Parlement européen se prépare pour une semaine active avec plusieurs réunions de commission et sessions plénières programmées',
    plenarySessions: 'Sessions Plénières',
    committeeMeetings: 'Réunions de Commission',
    legislativeDocuments: 'Documents Législatifs à Venir',
    legislativePipeline: 'Pipeline Législatif',
    parliamentaryQuestions: 'Questions Parlementaires',
    noPlenary: 'Aucune session plénière prévue pour cette période.',
    bottleneckIndicator: "⚠ Goulot d'étranglement",
    whatToWatch: 'À Suivre',
  },
  es: {
    lede: 'El Parlamento Europeo se prepara para una semana activa con múltiples reuniones de comisión y sesiones plenarias programadas',
    plenarySessions: 'Sesiones Plenarias',
    committeeMeetings: 'Reuniones de Comisión',
    legislativeDocuments: 'Documentos Legislativos Próximos',
    legislativePipeline: 'Pipeline Legislativo',
    parliamentaryQuestions: 'Preguntas Parlamentarias',
    noPlenary: 'No hay sesiones plenarias programadas para este período.',
    bottleneckIndicator: '⚠ Cuello de botella',
    whatToWatch: 'Qué Observar',
  },
  nl: {
    lede: 'Het Europees Parlement bereidt zich voor op een actieve week met meerdere commissievergaderingen en plenaire vergaderingen gepland',
    plenarySessions: 'Plenaire Vergaderingen',
    committeeMeetings: 'Commissievergaderingen',
    legislativeDocuments: 'Aankomende Wetgevende Documenten',
    legislativePipeline: 'Wetgevende Pipeline',
    parliamentaryQuestions: 'Parlementaire Vragen',
    noPlenary: 'Geen plenaire vergaderingen gepland voor deze periode.',
    bottleneckIndicator: '⚠ Knelpunt',
    whatToWatch: 'Wat Te Volgen',
  },
  ar: {
    lede: 'يستعد البرلمان الأوروبي لأسبوع نشط مع العديد من اجتماعات اللجان والجلسات العامة المجدولة',
    plenarySessions: 'الجلسات العامة',
    committeeMeetings: 'اجتماعات اللجان',
    legislativeDocuments: 'الوثائق التشريعية القادمة',
    legislativePipeline: 'خط الأنابيب التشريعي',
    parliamentaryQuestions: 'الأسئلة البرلمانية',
    noPlenary: 'لا توجد جلسات عامة مجدولة لهذه الفترة.',
    bottleneckIndicator: '⚠ عنق زجاجة',
    whatToWatch: 'ما يجب متابعته',
  },
  he: {
    lede: 'הפרלמנט האירופי מתכונן לשבוע פעיל עם מספר ישיבות ועדות וישיבות מליאה מתוכננות',
    plenarySessions: 'ישיבות מליאה',
    committeeMeetings: 'ישיבות ועדות',
    legislativeDocuments: 'מסמכים חקיקתיים קרובים',
    legislativePipeline: 'צינור חקיקה',
    parliamentaryQuestions: 'שאילתות פרלמנטריות',
    noPlenary: 'אין ישיבות מליאה מתוכננות לתקופה זו.',
    bottleneckIndicator: '⚠ צוואר בקבוק',
    whatToWatch: 'מה לעקוב',
  },
  ja: {
    lede: '欧州議会は、複数の委員会会合と本会議が予定されている活発な一週間に備えています',
    plenarySessions: '本会議',
    committeeMeetings: '委員会会合',
    legislativeDocuments: '今後の立法文書',
    legislativePipeline: '立法パイプライン',
    parliamentaryQuestions: '議会質問',
    noPlenary: 'この期間に本会議は予定されていません。',
    bottleneckIndicator: '⚠ ボトルネック',
    whatToWatch: '注目すべきポイント',
  },
  ko: {
    lede: '유럽 의회는 다수의 위원회 회의와 본회의가 예정된 활발한 한 주를 준비하고 있습니다',
    plenarySessions: '본회의',
    committeeMeetings: '위원회 회의',
    legislativeDocuments: '예정된 입법 문서',
    legislativePipeline: '입법 파이프라인',
    parliamentaryQuestions: '의회 질문',
    noPlenary: '이 기간에 예정된 본회의가 없습니다.',
    bottleneckIndicator: '⚠ 병목 현상',
    whatToWatch: '주목할 사항',
  },
  zh: {
    lede: '欧洲议会正在为活跃的一周做准备，多场委员会会议和全体会议已排定日程',
    plenarySessions: '全体会议',
    committeeMeetings: '委员会会议',
    legislativeDocuments: '即将发布的立法文件',
    legislativePipeline: '立法管道',
    parliamentaryQuestions: '议会质询',
    noPlenary: '该时段没有预定的全体会议。',
    bottleneckIndicator: '⚠ 瓶颈',
    whatToWatch: '值得关注',
  },
};

/** Localized section heading strings for breaking news articles */
export const BREAKING_STRINGS: LanguageMap<BreakingStrings> = {
  en: {
    breakingBanner: '⚡ BREAKING',
    votingAnomalyIntel: 'Voting Anomaly Intelligence',
    coalitionDynamics: 'Coalition Dynamics Assessment',
    analyticalReport: 'Analytical Report',
    keyMEPInfluence: 'Key MEP Influence Analysis',
    intelligenceBriefing: 'Intelligence Briefing',
    votingAnomalyAlert: 'Voting Anomaly Alert',
    coalitionDynamicsSection: 'Coalition Dynamics',
    keyPlayers: 'Key Parliamentary Players',
    placeholderNotice:
      'This is placeholder content generated while the European Parliament MCP Server is unavailable. Live intelligence data will appear here when the server is connected.',
    placeholderLede:
      'Significant parliamentary developments are being monitored. Connect the European Parliament MCP Server to receive real-time intelligence on voting anomalies, coalition shifts, and MEP activities.',
    lede: 'Intelligence analysis from the European Parliament MCP Server has identified significant parliamentary developments requiring immediate attention',
  },
  sv: {
    breakingBanner: '⚡ SENASTE NYTT',
    votingAnomalyIntel: 'Röstningsanomalier — Underrättelseanalys',
    coalitionDynamics: 'Bedömning av Koalitionsdynamik',
    analyticalReport: 'Analytisk Rapport',
    keyMEPInfluence: 'Analys av Viktiga MEP-Inflytanden',
    intelligenceBriefing: 'Underrättelserapport',
    votingAnomalyAlert: 'Varning för Röstningsanomalier',
    coalitionDynamicsSection: 'Koalitionsdynamik',
    keyPlayers: 'Parlamentariska Nyckelaktörer',
    placeholderNotice:
      'Detta är platshållarinnehåll genererat medan EU-parlamentets MCP-server är otillgänglig.',
    placeholderLede:
      'Betydande parlamentariska händelser övervakas. Anslut EU-parlamentets MCP-server för att ta emot realtidsinformation.',
    lede: 'Underrättelseanalys från EU-parlamentets MCP-server har identifierat betydande parlamentariska händelser som kräver omedelbar uppmärksamhet',
  },
  da: {
    breakingBanner: '⚡ SENESTE NYT',
    votingAnomalyIntel: 'Afstemningsanomali — Efterretningsanalyse',
    coalitionDynamics: 'Vurdering af Koalitionsdynamik',
    analyticalReport: 'Analytisk Rapport',
    keyMEPInfluence: 'Analyse af Vigtige MEP-Indflydelse',
    intelligenceBriefing: 'Efterretningsbriefing',
    votingAnomalyAlert: 'Advarsel om Afstemningsanomalier',
    coalitionDynamicsSection: 'Koalitionsdynamik',
    keyPlayers: 'Parlamentariske Nøgleaktører',
    placeholderNotice:
      'Dette er pladsholderindhold genereret mens Europa-Parlamentets MCP-server er utilgængelig.',
    placeholderLede:
      'Betydelige parlamentariske udviklinger overvåges. Tilslut Europa-Parlamentets MCP-server for at modtage realtidsintelligens.',
    lede: 'Efterretningsanalyse fra Europa-Parlamentets MCP-server har identificeret betydelige parlamentariske udviklinger der kræver øjeblikkelig opmærksomhed',
  },
  no: {
    breakingBanner: '⚡ SISTE NYTT',
    votingAnomalyIntel: 'Avstemningsavvik — Etterretningsanalyse',
    coalitionDynamics: 'Vurdering av Koalisjonsdynamikk',
    analyticalReport: 'Analytisk Rapportering',
    keyMEPInfluence: 'Analyse av Viktige MEP-Innflytelse',
    intelligenceBriefing: 'Etterretningsbriefing',
    votingAnomalyAlert: 'Advarsel om Avstemningsavvik',
    coalitionDynamicsSection: 'Koalisjonsdynamikk',
    keyPlayers: 'Parlamentariske Nøkkelaktører',
    placeholderNotice:
      'Dette er plassholder-innhold generert mens Europaparlamentets MCP-server er utilgjengelig.',
    placeholderLede:
      'Betydelige parlamentariske hendelser overvåkes. Koble til Europaparlamentets MCP-server for å motta sanntidsinformasjon.',
    lede: 'Etterretningsanalyse fra Europaparlamentets MCP-server har identifisert betydelige parlamentariske hendelser som krever umiddelbar oppmerksomhet',
  },
  fi: {
    breakingBanner: '⚡ TUOREET UUTISET',
    votingAnomalyIntel: 'Äänestyspoikkeamat — Tiedusteluanalyysi',
    coalitionDynamics: 'Koalitiodynamiikan Arviointi',
    analyticalReport: 'Analyyttinen Raportti',
    keyMEPInfluence: 'Avain-MEP-vaikutusanalyysi',
    intelligenceBriefing: 'Tiedusteluraportti',
    votingAnomalyAlert: 'Äänestyspoikkeamavaroitus',
    coalitionDynamicsSection: 'Koalitiodynamiikka',
    keyPlayers: 'Parlamentaariset Avainpelaajat',
    placeholderNotice:
      'Tämä on paikkamerkkisisältö, joka on luotu EU-parlamentin MCP-palvelimen ollessa pois käytöstä.',
    placeholderLede:
      'Merkittäviä parlamentaarisia tapahtumia seurataan. Yhdistä EU-parlamentin MCP-palvelimeen reaaliaikaisen tiedon vastaanottamiseksi.',
    lede: 'EU-parlamentin MCP-palvelimen tiedusteluanalyysi on tunnistanut merkittäviä parlamentaarisia tapahtumia, jotka vaativat välitöntä huomiota',
  },
  de: {
    breakingBanner: '⚡ EILMELDUNG',
    votingAnomalyIntel: 'Abstimmungsanomalien — Nachrichtendienstanalyse',
    coalitionDynamics: 'Bewertung der Koalitionsdynamik',
    analyticalReport: 'Analytischer Bericht',
    keyMEPInfluence: 'Analyse des Einflusses wichtiger MdEPs',
    intelligenceBriefing: 'Nachrichtendienstbriefing',
    votingAnomalyAlert: 'Warnung vor Abstimmungsanomalien',
    coalitionDynamicsSection: 'Koalitionsdynamik',
    keyPlayers: 'Parlamentarische Schlüsselfiguren',
    placeholderNotice:
      'Dies ist Platzhalterinhalt, der generiert wurde, während der MCP-Server des EU-Parlaments nicht verfügbar ist.',
    placeholderLede:
      'Bedeutende parlamentarische Entwicklungen werden überwacht. Verbinden Sie den MCP-Server des EU-Parlaments für Echtzeit-Informationen.',
    lede: 'Die Nachrichtendienstanalyse des MCP-Servers des EU-Parlaments hat bedeutende parlamentarische Entwicklungen identifiziert, die sofortige Aufmerksamkeit erfordern',
  },
  fr: {
    breakingBanner: '⚡ DERNIÈRES NOUVELLES',
    votingAnomalyIntel: 'Anomalies de Vote — Analyse de Renseignement',
    coalitionDynamics: 'Évaluation des Dynamiques de Coalition',
    analyticalReport: 'Rapport Analytique',
    keyMEPInfluence: "Analyse de l'Influence des Eurodéputés Clés",
    intelligenceBriefing: 'Briefing de Renseignement',
    votingAnomalyAlert: 'Alerte Anomalie de Vote',
    coalitionDynamicsSection: 'Dynamiques de Coalition',
    keyPlayers: 'Acteurs Parlementaires Clés',
    placeholderNotice:
      'Ceci est un contenu indicatif généré pendant que le serveur MCP du Parlement européen est indisponible.',
    placeholderLede:
      'Des développements parlementaires importants sont surveillés. Connectez le serveur MCP du Parlement européen pour recevoir des renseignements en temps réel.',
    lede: "L'analyse de renseignement du serveur MCP du Parlement européen a identifié des développements parlementaires significatifs nécessitant une attention immédiate",
  },
  es: {
    breakingBanner: '⚡ ÚLTIMA HORA',
    votingAnomalyIntel: 'Anomalías de Votación — Análisis de Inteligencia',
    coalitionDynamics: 'Evaluación de Dinámicas de Coalición',
    analyticalReport: 'Informe Analítico',
    keyMEPInfluence: 'Análisis de Influencia de Eurodiputados Clave',
    intelligenceBriefing: 'Informe de Inteligencia',
    votingAnomalyAlert: 'Alerta de Anomalía de Votación',
    coalitionDynamicsSection: 'Dinámicas de Coalición',
    keyPlayers: 'Actores Parlamentarios Clave',
    placeholderNotice:
      'Este es contenido de marcador de posición generado mientras el servidor MCP del Parlamento Europeo no está disponible.',
    placeholderLede:
      'Se están monitoreando desarrollos parlamentarios significativos. Conecte el servidor MCP del Parlamento Europeo para recibir inteligencia en tiempo real.',
    lede: 'El análisis de inteligencia del servidor MCP del Parlamento Europeo ha identificado desarrollos parlamentarios significativos que requieren atención inmediata',
  },
  nl: {
    breakingBanner: '⚡ LAATSTE NIEUWS',
    votingAnomalyIntel: 'Stemanomalieën — Inlichtingenanalyse',
    coalitionDynamics: 'Beoordeling van Coalitiedynamiek',
    analyticalReport: 'Analytisch Rapport',
    keyMEPInfluence: 'Analyse van Invloed Belangrijke Europarlementsleden',
    intelligenceBriefing: 'Inlichtingenbriefing',
    votingAnomalyAlert: 'Waarschuwing Stemanomalieën',
    coalitionDynamicsSection: 'Coalitiedynamiek',
    keyPlayers: 'Parlementaire Sleutelfiguren',
    placeholderNotice:
      'Dit is tijdelijke inhoud gegenereerd terwijl de MCP-server van het Europees Parlement niet beschikbaar is.',
    placeholderLede:
      'Significante parlementaire ontwikkelingen worden gemonitord. Verbind de MCP-server van het Europees Parlement voor realtime-informatie.',
    lede: 'Inlichtingenanalyse van de MCP-server van het Europees Parlement heeft significante parlementaire ontwikkelingen geïdentificeerd die onmiddellijke aandacht vereisen',
  },
  ar: {
    breakingBanner: '⚡ عاجل',
    votingAnomalyIntel: 'شذوذ التصويت — تحليل استخباراتي',
    coalitionDynamics: 'تقييم ديناميات التحالف',
    analyticalReport: 'تقرير تحليلي',
    keyMEPInfluence: 'تحليل تأثير النواب الرئيسيين',
    intelligenceBriefing: 'ملخص استخباراتي',
    votingAnomalyAlert: 'تنبيه شذوذ التصويت',
    coalitionDynamicsSection: 'ديناميات التحالف',
    keyPlayers: 'اللاعبون البرلمانيون الرئيسيون',
    placeholderNotice: 'هذا محتوى مؤقت تم إنشاؤه أثناء عدم توفر خادم MCP للبرلمان الأوروبي.',
    placeholderLede:
      'تتم مراقبة تطورات برلمانية مهمة. قم بتوصيل خادم MCP للبرلمان الأوروبي لتلقي معلومات استخبارية في الوقت الفعلي.',
    lede: 'حدد التحليل الاستخباراتي لخادم MCP للبرلمان الأوروبي تطورات برلمانية مهمة تتطلب اهتماماً فورياً',
  },
  he: {
    breakingBanner: '⚡ חדשות דחופות',
    votingAnomalyIntel: 'חריגות הצבעה — ניתוח מודיעיני',
    coalitionDynamics: 'הערכת דינמיקת קואליציה',
    analyticalReport: 'דוח אנליטי',
    keyMEPInfluence: 'ניתוח השפעת חברי פרלמנט מרכזיים',
    intelligenceBriefing: 'תדרוך מודיעיני',
    votingAnomalyAlert: 'התראת חריגות הצבעה',
    coalitionDynamicsSection: 'דינמיקת קואליציה',
    keyPlayers: 'שחקני מפתח פרלמנטריים',
    placeholderNotice: 'זהו תוכן מציין מיקום שנוצר בזמן ששרת MCP של הפרלמנט האירופי אינו זמין.',
    placeholderLede:
      'מתבצע ניטור של התפתחויות פרלמנטריות משמעותיות. חבר את שרת MCP של הפרלמנט האירופי לקבלת מודיעין בזמן אמת.',
    lede: 'ניתוח מודיעיני משרת MCP של הפרלמנט האירופי זיהה התפתחויות פרלמנטריות משמעותיות הדורשות תשומת לב מיידית',
  },
  ja: {
    breakingBanner: '⚡ 速報',
    votingAnomalyIntel: '投票異常 — 情報分析',
    coalitionDynamics: '連立動態評価',
    analyticalReport: '分析レポート',
    keyMEPInfluence: '主要MEP影響力分析',
    intelligenceBriefing: 'インテリジェンスブリーフィング',
    votingAnomalyAlert: '投票異常警報',
    coalitionDynamicsSection: '連立動態',
    keyPlayers: '議会の主要人物',
    placeholderNotice:
      'これは欧州議会MCPサーバーが利用できない間に生成されたプレースホルダーコンテンツです。',
    placeholderLede:
      '重大な議会の動きを監視しています。リアルタイムの情報を受信するには、欧州議会MCPサーバーに接続してください。',
    lede: '欧州議会MCPサーバーの情報分析により、即座の注意を要する重大な議会の動きが特定されました',
  },
  ko: {
    breakingBanner: '⚡ 속보',
    votingAnomalyIntel: '투표 이상 — 정보 분석',
    coalitionDynamics: '연합 역학 평가',
    analyticalReport: '분석 보고서',
    keyMEPInfluence: '주요 MEP 영향력 분석',
    intelligenceBriefing: '정보 브리핑',
    votingAnomalyAlert: '투표 이상 경보',
    coalitionDynamicsSection: '연합 역학',
    keyPlayers: '의회 핵심 인물',
    placeholderNotice: '유럽 의회 MCP 서버를 사용할 수 없는 동안 생성된 자리 표시자 콘텐츠입니다.',
    placeholderLede:
      '중요한 의회 동향이 모니터링되고 있습니다. 실시간 정보를 수신하려면 유럽 의회 MCP 서버에 연결하세요.',
    lede: '유럽 의회 MCP 서버의 정보 분석에서 즉각적인 주의가 필요한 중요한 의회 동향이 확인되었습니다',
  },
  zh: {
    breakingBanner: '⚡ 突发',
    votingAnomalyIntel: '投票异常 — 情报分析',
    coalitionDynamics: '联盟动态评估',
    analyticalReport: '分析报告',
    keyMEPInfluence: '关键MEP影响力分析',
    intelligenceBriefing: '情报简报',
    votingAnomalyAlert: '投票异常警报',
    coalitionDynamicsSection: '联盟动态',
    keyPlayers: '议会关键人物',
    placeholderNotice: '这是在欧洲议会MCP服务器不可用时生成的占位符内容。',
    placeholderLede: '正在监控重大议会动态。请连接欧洲议会MCP服务器以接收实时情报。',
    lede: '欧洲议会MCP服务器的情报分析已确定需要立即关注的重大议会动态',
  },
};
