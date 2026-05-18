// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/Articles/Motions
 * @description Motions article: 14-language title generator and body strings.
 *
 * Per-language strings live together so a translator can update one language
 * for this article type without touching any other article type.
 */

import type { LanguageMap, LangTitleSubtitle, MotionsStrings } from '../../types/index.js';
export const MOTIONS_TITLES: LanguageMap<(date: string) => LangTitleSubtitle> = {
  en: (date) => ({
    title: `Plenary Votes & Resolutions: ${date}`,
    subtitle:
      'Recent plenary votes, adopted texts, party cohesion analysis, and detected voting anomalies in the European Parliament',
  }),
  sv: (date) => ({
    title: `Omröstningar & Resolutioner: ${date}`,
    subtitle:
      'Senaste plenarröstningar, antagna texter, analys av partikohesion och upptäckta omröstningsanomalier i Europaparlamentet',
  }),
  da: (date) => ({
    title: `Plenar-afstemninger & Beslutninger: ${date}`,
    subtitle:
      'Seneste plenarafstemninger, vedtagne tekster, analyse af partikohæsion og opdagede afstemningsanomalier i Europa-Parlamentet',
  }),
  no: (date) => ({
    title: `Plenaravstemninger & Vedtak: ${date}`,
    subtitle:
      'Siste plenaravstemninger, vedtatte tekster, partikohesjon og avvikende avstemninger i Europaparlamentet',
  }),
  fi: (date) => ({
    title: `Täysistuntoäänestykset & Päätöslauselmat: ${date}`,
    subtitle:
      'Viimeisimmät täysistuntoäänestykset, hyväksytyt tekstit, puoluekohesio-analyysi ja havaitut äänestyspoikkeamat Euroopan parlamentissa',
  }),
  de: (date) => ({
    title: `Plenar-Abstimmungen & Entschließungen: ${date}`,
    subtitle:
      'Aktuelle Plenar-Abstimmungen, angenommene Texte, Fraktionskohäsionsanalyse und erkannte Abstimmungsanomalien im Europäischen Parlament',
  }),
  fr: (date) => ({
    title: `Votes & Résolutions en Plénière: ${date}`,
    subtitle:
      'Votes pléniers récents, textes adoptés, analyse de cohésion des groupes politiques et anomalies de vote détectées au Parlement européen',
  }),
  es: (date) => ({
    title: `Votaciones y Resoluciones Plenarias: ${date}`,
    subtitle:
      'Votaciones plenarias recientes, textos adoptados, análisis de cohesión de grupos políticos y anomalías de votación detectadas en el Parlamento Europeo',
  }),
  nl: (date) => ({
    title: `Plenaire Stemmingen & Resoluties: ${date}`,
    subtitle:
      'Recente plenaire stemmingen, aangenomen teksten, fractiebinding-analyse en gedetecteerde stemanomalieën in het Europees Parlement',
  }),
  ar: (date) => ({
    title: `التصويتات والقرارات العامة: ${date}`,
    subtitle:
      'أحدث التصويتات العامة والنصوص المعتمدة وتحليل تماسك الأحزاب والشذوذ في التصويت في البرلمان الأوروبي',
  }),
  he: (date) => ({
    title: `הצבעות והחלטות מליאה: ${date}`,
    subtitle:
      'הצבעות מליאה אחרונות, טקסטים שאומצו, ניתוח לכידות מפלגתית וחריגות הצבעה בפרלמנט האירופי',
  }),
  ja: (date) => ({
    title: `本会議投票・決議: ${date}`,
    subtitle: '欧州議会における最近の本会議投票、採択テキスト、政党結束分析、投票異常',
  }),
  ko: (date) => ({
    title: `본회의 투표 및 결의: ${date}`,
    subtitle: '유럽 의회의 최근 본회의 투표, 채택 텍스트, 정당 결속 분석 및 투표 이상 감지',
  }),
  zh: (date) => ({
    title: `全体投票与决议: ${date}`,
    subtitle: '欧洲议会最近的全体投票、通过文本、政党凝聚力分析和投票异常检测',
  }),
};

/** Breaking news title templates per language */
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
    ledeAnalysis:
      'analysis of voting records from {DATE_FROM} to {DATE_TO} provides insights into legislative decision-making and party discipline.',
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
    ledeAnalysis:
      'analys av omröstningsprotokoll från {DATE_FROM} till {DATE_TO} ger insikter om lagstiftningsbeslut och partidisciplin.',
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
    ledeAnalysis:
      'analyse af afstemningsoptegnelser fra {DATE_FROM} til {DATE_TO} giver indsigt i lovgivningsmæssig beslutningstagning og partidisciplin.',
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
    ledeAnalysis:
      'analyse av avstemningsregistreringer fra {DATE_FROM} til {DATE_TO} gir innsikt i lovgivningsmessig beslutningstaking og partidisiplin.',
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
    ledeAnalysis:
      'äänestysasiakirjojen analyysi ajalta {DATE_FROM} – {DATE_TO} antaa näkemyksiä lainsäädäntöpäätöksistä ja puoluedisipliinistä.',
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
    ledeAnalysis:
      'Analyse der Abstimmungsunterlagen vom {DATE_FROM} bis {DATE_TO} bietet Einblicke in die gesetzgeberische Entscheidungsfindung und Parteidisziplin.',
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
    ledeAnalysis:
      "l'analyse des résultats de vote du {DATE_FROM} au {DATE_TO} fournit des informations sur la prise de décision législative et la discipline de parti.",
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
    ledeAnalysis:
      'el análisis de registros de votación del {DATE_FROM} al {DATE_TO} proporciona información sobre la toma de decisiones legislativas y la disciplina de partido.',
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
    ledeAnalysis:
      'analyse van stemmingsregistraties van {DATE_FROM} tot {DATE_TO} geeft inzicht in wetgevende besluitvorming en partijdiscipline.',
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
    ledeAnalysis:
      'يوفر تحليل سجلات التصويت من {DATE_FROM} إلى {DATE_TO} رؤى حول صنع القرار التشريعي والانضباط الحزبي.',
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
    ledeAnalysis:
      'ניתוח רשומות ההצבעה מ-{DATE_FROM} עד {DATE_TO} מספק תובנות על קבלת החלטות חקיקתיות ועל משמעת מפלגתית.',
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
    ledeAnalysis:
      '{DATE_FROM}から{DATE_TO}までの投票記録の分析は、立法上の意思決定と政党規律に関する洞察を提供します。',
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
    ledeAnalysis:
      '{DATE_FROM}부터 {DATE_TO}까지의 투표 기록 분석은 입법 의사결정 및 정당 규율에 대한 통찰력을 제공합니다.',
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
    ledeAnalysis: '对{DATE_FROM}至{DATE_TO}投票记录的分析为立法决策和政党纪律提供了见解。',
  },
};

/** Localized section heading strings for week-ahead articles */
