// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/PoliticalIntelligence/Descriptions/ArtifactInfo
 * @description Per-language titles + descriptions for **per-artifact**
 * Markdown files generated under `analysis/daily/**`. Provides:
 *  - `FEED_PREFIX_LABELS` — canonical EP-API feed prefixes
 *    (adoptedtexts, procedures, documents, events, externaldocuments)
 *    with a single localized "per-item analysis of an EP {feed} entry"
 *    label so the political-intelligence index doesn't drown in
 *    near-duplicate per-item cards.
 *  - `ORPHAN_ARTIFACT_INFO` — curated localized titles + descriptions
 *    for stems that don't have a matching `analysis/templates/<x>.md`
 *    entry, ensuring every artifact card reads naturally in all 14
 *    languages.
 *  - `getArtifactInfo` — public resolver: feed-prefix → orphan →
 *    canonicalized template → localized generic fallback.
 *
 * Split out of the monolithic `political-intelligence-descriptions.ts`
 * (Refactor 8/8).
 */

import type { LanguageCode } from '../../../types/index.js';
import { getFromRecord, stripEmojiAndPunct } from './fallback.js';
import { canonicalizeArtifactStem } from './run-types.js';
import { getCuratedDescription, getCuratedTitle, hasCuratedDescription } from './lookup.js';

/**
 * Feed-prefix label — when an artifact name starts with one of these
 * canonical EP-API feed prefixes we surface a single localized "per-item
 * analysis of an EP {feed} entry" label instead of a noisy raw stem.
 */
const FEED_PREFIX_LABELS: Record<
  string,
  { title: Record<LanguageCode, string>; desc: Record<LanguageCode, string> }
> = {
  adoptedtexts: {
    title: {
      en: 'Adopted Text Analysis',
      sv: 'Analys av antagen text',
      da: 'Analyse af vedtaget tekst',
      no: 'Analyse av vedtatt tekst',
      fi: 'Hyväksytyn tekstin analyysi',
      de: 'Analyse eines angenommenen Textes',
      fr: 'Analyse d’un texte adopté',
      es: 'Análisis de texto adoptado',
      nl: 'Analyse aangenomen tekst',
      ar: 'تحليل نص معتمد',
      he: 'ניתוח טקסט שאומץ',
      ja: '採択文書の分析',
      ko: '채택된 문서 분석',
      zh: '已通过文本分析',
    },
    desc: {
      en: 'Per-item analysis of one adopted European Parliament text (resolution, legislative position or non-legislative decision) — classification, stakeholder impact, SWOT and risk scoring.',
      sv: 'Enskild analys av en antagen text från Europaparlamentet (resolution, lagstiftningsposition eller icke-lagstiftande beslut) — klassificering, intressentpåverkan, SWOT och riskpoäng.',
      da: 'Analyse pr. element af én vedtaget tekst fra Europa-Parlamentet — klassificering, interessentpåvirkning, SWOT og risikoscoring.',
      no: 'Analyse per element av én vedtatt tekst fra Europaparlamentet — klassifisering, interessent­påvirkning, SWOT og risikoscoring.',
      fi: 'Yhden Euroopan parlamentin hyväksymän tekstin yksittäinen analyysi — luokittelu, sidosryhmä­vaikutus, SWOT ja riskipisteet.',
      de: 'Einzelanalyse eines angenommenen Textes des Europäischen Parlaments — Klassifizierung, Stakeholder-Wirkung, SWOT und Risikobewertung.',
      fr: 'Analyse individuelle d’un texte adopté du Parlement européen — classification, impact sur les parties prenantes, SWOT et score de risque.',
      es: 'Análisis individual de un texto adoptado del Parlamento Europeo — clasificación, impacto en partes interesadas, SWOT y puntuación de riesgo.',
      nl: 'Individuele analyse van één aangenomen tekst van het Europees Parlement — classificatie, stakeholderimpact, SWOT en risicoscoring.',
      ar: 'تحليل فردي لنص معتمد في البرلمان الأوروبي — التصنيف وتأثير أصحاب المصلحة وSWOT وتقييم المخاطر.',
      he: 'ניתוח פרטני של טקסט שאומץ בפרלמנט האירופי — סיווג, השפעה על בעלי עניין, SWOT וניקוד סיכון.',
      ja: '欧州議会で採択された 1 件の文書の個別分析 — 分類、ステークホルダー影響、SWOT、リスクスコア。',
      ko: '유럽의회에서 채택된 단일 문서 개별 분석 — 분류, 이해관계자 영향, SWOT 및 위험 점수.',
      zh: '对欧洲议会一项已通过文本的逐件分析——分类、利益相关者影响、SWOT 及风险评分。',
    },
  },
  procedures: {
    title: {
      en: 'Legislative Procedure Analysis',
      sv: 'Analys av lagstiftningsförfarande',
      da: 'Analyse af lovgivningsprocedure',
      no: 'Analyse av lovgivningsprosedyre',
      fi: 'Lainsäädäntö­menettelyn analyysi',
      de: 'Analyse eines Gesetzgebungs­verfahrens',
      fr: 'Analyse de procédure législative',
      es: 'Análisis de procedimiento legislativo',
      nl: 'Analyse wetgevingsprocedure',
      ar: 'تحليل إجراء تشريعي',
      he: 'ניתוח הליך חקיקה',
      ja: '立法手続の分析',
      ko: '입법 절차 분석',
      zh: '立法程序分析',
    },
    desc: {
      en: 'Per-item analysis of one European Parliament legislative procedure — rapporteur, co-decision path, committee assignments, trilogue risk and amendment map.',
      sv: 'Enskild analys av ett lagstiftnings­förfarande i Europaparlamentet — föredragande, medbeslutande­väg, utskottstilldelningar, trilog­risk och ändringskarta.',
      da: 'Analyse pr. element af én EP-lovgivnings­procedure — ordfører, fælles beslutningsforløb, udvalgs­tildelinger, trilog-risiko og ændringskort.',
      no: 'Analyse per element av én EP-lovgivnings­prosedyre — saksordfører, medbestemmelses­løp, komité­tildelinger, trilog-risiko og endringskart.',
      fi: 'Yhden EP:n lainsäädäntö­menettelyn yksittäinen analyysi — esittelijä, yhteispäätös­polku, valiokunta­tehtävät, trilogi­riski ja tarkistuskartta.',
      de: 'Einzelanalyse eines EP-Gesetzgebungs­verfahrens — Berichterstatter, Mitentscheidungs­pfad, Ausschuss­zuweisungen, Trilog-Risiko und Änderungs­karte.',
      fr: 'Analyse individuelle d’une procédure législative du PE — rapporteur, trajet de codécision, attributions de commissions, risque de trilogue et carte des amendements.',
      es: 'Análisis individual de un procedimiento legislativo del PE — ponente, vía de codecisión, asignaciones de comisión, riesgo de trílogo y mapa de enmiendas.',
      nl: 'Individuele analyse van één EP-wetgevings­procedure — rapporteur, medebeslissings­traject, commissie­toewijzingen, triloogrisico en amendementenkaart.',
      ar: 'تحليل فردي لإجراء تشريعي واحد في البرلمان الأوروبي — المقرر، مسار التقرير المشترك، تكليفات اللجان، مخاطر الترايلوج وخريطة التعديلات.',
      he: 'ניתוח פרטני של הליך חקיקה בפרלמנט האירופי — דובר הוועדה, מסלול החלטה משותפת, הקצאות ועדות, סיכון טרילוג ומפת תיקונים.',
      ja: '欧州議会の 1 件の立法手続の個別分析 — 報告者、共同決定の経路、委員会割当、トリローグリスク、修正マップ。',
      ko: 'EP 단일 입법 절차 개별 분석 — 보고위원, 공동결정 경로, 위원회 배정, 삼자협의 위험, 수정안 지도.',
      zh: '对一项欧洲议会立法程序的逐件分析——报告员、共同决定路径、委员会分配、三方谈判风险和修正案图谱。',
    },
  },
  documents: {
    title: {
      en: 'Committee Document Analysis',
      sv: 'Analys av utskotts­dokument',
      da: 'Analyse af udvalgs­dokument',
      no: 'Analyse av komité­dokument',
      fi: 'Valiokunta­asiakirjan analyysi',
      de: 'Analyse eines Ausschuss­dokuments',
      fr: 'Analyse d’un document de commission',
      es: 'Análisis de documento de comisión',
      nl: 'Analyse commissie­document',
      ar: 'تحليل وثيقة لجنة',
      he: 'ניתוח מסמך ועדה',
      ja: '委員会文書の分析',
      ko: '위원회 문서 분석',
      zh: '委员会文件分析',
    },
    desc: {
      en: 'Per-item analysis of one EP committee document — working document, draft report or opinion — with stakeholder map, amendment risk and trilogue readiness assessment.',
      sv: 'Enskild analys av ett EP-utskottsdokument — arbets­dokument, utkast till betänkande eller yttrande — med intressentkarta, ändringsrisk och bedömning av trilog­beredskap.',
      da: 'Analyse pr. element af ét EP-udvalgs­dokument — arbejds­dokument, udkast til betænkning eller udtalelse — med interessentkort, ændringsrisiko og trilog-paratheds­vurdering.',
      no: 'Analyse per element av ett EP-komité­dokument — arbeids­dokument, rapportutkast eller uttalelse — med interessentkart, endringsrisiko og trilog-beredskaps­vurdering.',
      fi: 'Yhden EP:n valiokunta-asiakirjan yksittäinen analyysi — työasiakirja, mietintö­luonnos tai lausunto — sidosryhmä­kartalla, tarkistus­riskillä ja trilogivalmius­arviolla.',
      de: 'Einzelanalyse eines EP-Ausschuss­dokuments — Arbeitsdokument, Berichtsentwurf oder Stellungnahme — mit Stakeholder-Karte, Änderungsrisiko und Trilog-Bereitschaftsbewertung.',
      fr: 'Analyse individuelle d’un document de commission PE — document de travail, projet de rapport ou avis — avec carte des parties prenantes, risque d’amendement et évaluation de la préparation au trilogue.',
      es: 'Análisis individual de un documento de comisión PE — documento de trabajo, proyecto de informe u opinión — con mapa de partes interesadas, riesgo de enmienda y evaluación de preparación para trílogo.',
      nl: 'Individuele analyse van één EP-commissie­document — werkdocument, ontwerpverslag of advies — met stakeholderkaart, amendement­risico en triloog­paraatheidsbeoordeling.',
      ar: 'تحليل فردي لوثيقة لجنة في البرلمان الأوروبي — وثيقة عمل أو مسودة تقرير أو رأي — مع خريطة أصحاب المصلحة ومخاطر التعديل وتقييم جاهزية الترايلوج.',
      he: 'ניתוח פרטני של מסמך ועדה בפרלמנט האירופי — מסמך עבודה, טיוטת דו״ח או חוות דעת — עם מפת בעלי עניין, סיכון תיקונים והערכת מוכנות לטרילוג.',
      ja: 'EP 委員会文書 1 件の個別分析（作業文書／報告書草案／意見書）— ステークホルダーマップ、修正リスク、トリローグ準備度評価。',
      ko: 'EP 위원회 문서 1건 개별 분석(작업 문서, 보고서 초안 또는 의견서) — 이해관계자 지도, 수정 위험 및 삼자협의 준비도 평가.',
      zh: '对一份欧洲议会委员会文件（工作文件、报告草案或意见书）的逐件分析——利益相关者图谱、修正风险及三方谈判准备度评估。',
    },
  },
  events: {
    title: {
      en: 'Parliamentary Event Analysis',
      sv: 'Analys av parlamentariskt evenemang',
      da: 'Analyse af parlamentarisk begivenhed',
      no: 'Analyse av parlamentarisk hendelse',
      fi: 'Parlamentaarisen tapahtuman analyysi',
      de: 'Analyse einer parlamentarischen Veranstaltung',
      fr: 'Analyse d’un événement parlementaire',
      es: 'Análisis de evento parlamentario',
      nl: 'Analyse parlementair evenement',
      ar: 'تحليل فعالية برلمانية',
      he: 'ניתוח אירוע פרלמנטרי',
      ja: '議会イベントの分析',
      ko: '의회 이벤트 분석',
      zh: '议会活动分析',
    },
    desc: {
      en: 'Per-item analysis of one EP event — plenary, committee meeting, hearing or conference — with agenda map, stakeholder participation and political significance scoring.',
      sv: 'Enskild analys av ett EP-evenemang — plenum, utskottsmöte, utfrågning eller konferens — med dagordningskarta, intressentdeltagande och politisk signifikanspoäng.',
      da: 'Analyse pr. element af én EP-begivenhed — plenarmøde, udvalgs­møde, høring eller konference — med dagsordens­kort, interessentdeltagelse og politisk signifikansscoring.',
      no: 'Analyse per element av én EP-hendelse — plenum, komitémøte, høring eller konferanse — med agendakart, interessent­deltakelse og politisk signifikansscore.',
      fi: 'Yhden EP-tapahtuman yksittäinen analyysi — täysistunto, valiokuntakokous, kuuleminen tai konferenssi — esityslista­kartalla, sidosryhmien osallistumisella ja poliittisella merkitys­pisteytyksellä.',
      de: 'Einzelanalyse einer EP-Veranstaltung — Plenum, Ausschuss­sitzung, Anhörung oder Konferenz — mit Tagesordnungs­karte, Stakeholder-Teilnahme und politischer Signifikanzbewertung.',
      fr: 'Analyse individuelle d’un événement PE — plénière, réunion de commission, audition ou conférence — avec carte de l’ordre du jour, participation des parties prenantes et score d’importance politique.',
      es: 'Análisis individual de un evento PE — pleno, reunión de comisión, audiencia o conferencia — con mapa de orden del día, participación de interesados y puntuación de significancia política.',
      nl: 'Individuele analyse van één EP-evenement — plenair, commissie­vergadering, hoorzitting of conferentie — met agendakaart, stakeholder­deelname en politieke significantiescore.',
      ar: 'تحليل فردي لفعالية في البرلمان الأوروبي — جلسة عامة أو اجتماع لجنة أو جلسة استماع أو مؤتمر — مع خريطة جدول الأعمال ومشاركة أصحاب المصلحة وتقييم الأهمية السياسية.',
      he: 'ניתוח פרטני של אירוע בפרלמנט האירופי — מליאה, ישיבת ועדה, שימוע או כנס — עם מפת סדר יום, השתתפות בעלי עניין ודירוג משמעות פוליטית.',
      ja: 'EP イベント 1 件の個別分析（本会議／委員会／公聴会／会議）— 議題マップ、ステークホルダー参加、政治的重要度スコア。',
      ko: 'EP 이벤트 1건 개별 분석(본회의, 위원회 회의, 공청회 또는 콘퍼런스) — 의제 지도, 이해관계자 참여 및 정치적 중요도 점수.',
      zh: '对一次欧洲议会活动（全体会议、委员会会议、听证会或研讨会）的逐件分析——议程图、利益相关者参与度、政治重要性评分。',
    },
  },
  externaldocuments: {
    title: {
      en: 'External Document Analysis',
      sv: 'Analys av externt dokument',
      da: 'Analyse af eksternt dokument',
      no: 'Analyse av eksternt dokument',
      fi: 'Ulkopuolisen asiakirjan analyysi',
      de: 'Analyse eines externen Dokuments',
      fr: 'Analyse d’un document externe',
      es: 'Análisis de documento externo',
      nl: 'Analyse extern document',
      ar: 'تحليل وثيقة خارجية',
      he: 'ניתוח מסמך חיצוני',
      ja: '外部文書の分析',
      ko: '외부 문서 분석',
      zh: '外部文件分析',
    },
    desc: {
      en: 'Per-item analysis of one external document referenced by the EP — Council position, Commission proposal or partner-institution input — with cross-institutional stakeholder map and risk score.',
      sv: 'Enskild analys av ett externt dokument som EP hänvisar till — rådets ståndpunkt, kommissionens förslag eller bidrag från partner­institution — med institutionsövergripande intressentkarta och riskpoäng.',
      da: 'Analyse pr. element af ét eksternt dokument, som EP henviser til — rådets holdning, Kommissionens forslag eller input fra partner­institution — med institutions­overskridende interessentkort og risikoscoring.',
      no: 'Analyse per element av ett eksternt dokument EP refererer til — råds­posisjon, kommisjons­forslag eller partner­institusjons­innspill — med tverr­institusjonelt interessentkart og risikoscore.',
      fi: 'Yhden EP:n viittaaman ulkopuolisen asiakirjan yksittäinen analyysi — neuvoston kanta, komission ehdotus tai yhteistyö­laitoksen kontribuutio — toimi­elinten väliseltä sidosryhmä­kartalta ja riskipisteillä.',
      de: 'Einzelanalyse eines vom EP referenzierten externen Dokuments — Ratsposition, Kommissions­vorschlag oder Beitrag einer Partnerinstitution — mit institutionsübergreifender Stakeholder-Karte und Risikobewertung.',
      fr: 'Analyse individuelle d’un document externe référencé par le PE — position du Conseil, proposition de la Commission ou apport d’une institution partenaire — avec carte des parties prenantes inter-institutions et score de risque.',
      es: 'Análisis individual de un documento externo referenciado por el PE — posición del Consejo, propuesta de la Comisión o aportación de una institución socia — con mapa de interesados interinstitucional y puntuación de riesgo.',
      nl: 'Individuele analyse van één extern document waarnaar het EP verwijst — Raads­standpunt, Commissie­voorstel of input van een partner­instelling — met inter-institutionele stakeholderkaart en risicoscoring.',
      ar: 'تحليل فردي لوثيقة خارجية يشير إليها البرلمان الأوروبي — موقف المجلس أو اقتراح المفوضية أو مساهمة مؤسسة شريكة — مع خريطة أصحاب المصلحة بين المؤسسات وتقييم المخاطر.',
      he: 'ניתוח פרטני של מסמך חיצוני שהפרלמנט האירופי מפנה אליו — עמדת המועצה, הצעת הנציבות או קלט ממוסד שותף — עם מפת בעלי עניין בין-מוסדית וניקוד סיכון.',
      ja: 'EP が参照する外部文書 1 件の個別分析（理事会ポジション／欧州委提案／パートナー機関寄与）— 機関横断ステークホルダーマップ、リスクスコア。',
      ko: 'EP이 참조하는 외부 문서 1건 개별 분석(이사회 입장, 집행위원회 제안 또는 파트너 기관 기여) — 기관 간 이해관계자 지도 및 위험 점수.',
      zh: '对欧洲议会引用的一份外部文件（理事会立场、欧委会提案或合作机构意见）的逐件分析——跨机构利益相关者图谱与风险评分。',
    },
  },
};

/**
 * Orphan artifact table — free-standing artifact stems that have no
 * counterpart template under `analysis/templates/`. Every entry ships all
 * 14 languages so non-English pages never show raw English.
 */
const ORPHAN_ARTIFACT_INFO: Record<
  string,
  { title: Record<LanguageCode, string>; desc: Record<LanguageCode, string> }
> = {
  'agent-pre-work': {
    title: {
      en: 'Agent Pre-Work',
      sv: 'Agentens förberedelsearbete',
      da: 'Agentens forarbejde',
      no: 'Agentens forarbeid',
      fi: 'Agentin ennakkotyö',
      de: 'Agenten-Vorarbeit',
      fr: 'Travail préparatoire de l’agent',
      es: 'Trabajo previo del agente',
      nl: 'Voorbereidend werk van de agent',
      ar: 'أعمال تمهيدية للعميل',
      he: 'עבודת הכנה של הסוכן',
      ja: 'エージェント事前作業',
      ko: '에이전트 사전 작업',
      zh: '代理前期工作',
    },
    desc: {
      en: 'Raw inputs the AI agent collected before starting analysis — data-pull logs, scope notes, tool inventory and methodology selection. Gives auditors full traceability of what went into the run.',
      sv: 'Rådata som AI-agenten samlade in innan analysen — datahämtnings­loggar, omfattnings­anteckningar, verktygsinventering och metodval. Ger granskare full spårbarhet över vad som gick in i körningen.',
      da: 'Rå input indsamlet af AI-agenten før analysen — datahentningslogfiler, scope-noter, værktøjs­inventar og metodeudvælgelse. Giver revisorer fuld sporbarhed.',
      no: 'Rådata AI-agenten samlet inn før analysen — datauttrekkslogger, omfangs­notater, verktøy­inventar og metodevalg. Gir full sporbarhet for revisorer.',
      fi: 'AI-agentin keräämät raakatiedot ennen analyysiä — tiedonhaku­lokit, rajaus­muistiinpanot, työkalu­luettelo ja metodi­valinta. Antaa auditoijille täyden jäljitettävyyden.',
      de: 'Rohdaten, die der KI-Agent vor Analysebeginn gesammelt hat — Datenabruf­protokolle, Scope-Notizen, Werkzeug­inventar und Methoden­auswahl. Liefert Prüfern volle Nachvollziehbarkeit.',
      fr: 'Données brutes collectées par l’agent IA avant l’analyse — journaux d’extraction, notes de cadrage, inventaire d’outils et sélection méthodologique. Traçabilité complète pour les auditeurs.',
      es: 'Entradas en bruto que el agente de IA recopiló antes del análisis — registros de extracción, notas de alcance, inventario de herramientas y selección metodológica. Trazabilidad completa para auditores.',
      nl: 'Ruwe input die de AI-agent vóór de analyse verzamelde — data-pull­logs, scope-notities, toolinventaris en methodologie­selectie. Volledige traceerbaarheid voor auditors.',
      ar: 'المدخلات الخام التي جمعها وكيل الذكاء الاصطناعي قبل التحليل — سجلات سحب البيانات، ملاحظات النطاق، جرد الأدوات واختيار المنهجية. يضمن تتبعًا كاملاً.',
      he: 'קלט גולמי שסוכן ה-AI אסף לפני הניתוח — יומני משיכת נתונים, הערות טווח, מלאי כלים ובחירת מתודולוגיה. עקיבות מלאה לבודקים.',
      ja: 'AI エージェントが分析開始前に収集した生データ — データ取得ログ、スコープメモ、ツール一覧、方法論の選定。監査人が完全な追跡性を得られる。',
      ko: 'AI 에이전트가 분석 시작 전 수집한 원시 입력 — 데이터 추출 로그, 범위 메모, 도구 목록, 방법론 선택. 감사자에게 완전한 추적성을 제공합니다.',
      zh: 'AI 代理在开始分析前收集的原始输入——数据抽取日志、范围说明、工具清单与方法论选择，为审计者提供完整的可追溯性。',
    },
  },
  summary: {
    title: {
      en: 'Run Summary',
      sv: 'Körnings­sammanfattning',
      da: 'Kørsels­opsummering',
      no: 'Kjørings­oppsummering',
      fi: 'Ajon yhteenveto',
      de: 'Lauf-Zusammenfassung',
      fr: 'Synthèse d’exécution',
      es: 'Resumen de ejecución',
      nl: 'Run-samenvatting',
      ar: 'ملخص التشغيل',
      he: 'סיכום ההרצה',
      ja: '実行サマリー',
      ko: '실행 요약',
      zh: '运行摘要',
    },
    desc: {
      en: 'Executive summary of the run — top-line findings, headline risk score, decisive artifacts and the key takeaways fed into the final article.',
      sv: 'Sammanfattning av körningen — huvudfynd, riskpoäng i rubriken, avgörande artefakter och nyckelslutsatser som gick in i slutartikeln.',
      da: 'Executive summary af kørslen — hovedfund, overskriftsrisiko­score, afgørende artefakter og nøglebudskaber til slutartiklen.',
      no: 'Sammendrag av kjøringen — hovedfunn, overskrifts­risikoscore, avgjørende artefakter og nøkkelpunkter til sluttartikkelen.',
      fi: 'Ajon tiivistelmä — päähavainnot, otsikkotason riskipisteet, ratkaisevat artefaktit ja lopulliseen artikkeliin vietävät avainviestit.',
      de: 'Executive Summary des Laufs — Kernergebnisse, Kopfzeilen-Risiko, entscheidende Artefakte und Schlüsselaussagen für den Artikel.',
      fr: 'Synthèse exécutive de l’exécution — conclusions principales, score de risque en une ligne, artefacts décisifs et messages-clés repris dans l’article final.',
      es: 'Resumen ejecutivo de la ejecución — hallazgos principales, puntuación de riesgo de titular, artefactos decisivos y conclusiones clave que alimentan el artículo final.',
      nl: 'Executive summary van de run — hoofdbevindingen, kop-risicoscore, beslissende artefacten en kernpunten voor het uiteindelijke artikel.',
      ar: 'ملخص تنفيذي للتشغيل — أبرز النتائج، درجة المخاطر في العنوان، القطع الحاسمة والرسائل الرئيسية التي تغذي المقال النهائي.',
      he: 'תקציר מנהלים של ההרצה — ממצאים מרכזיים, ציון סיכון לכותרת, ארטיפקטים מכריעים ומסקנות עיקריות שמזינות את המאמר הסופי.',
      ja: '実行のエグゼクティブ・サマリー — 主要所見、ヘッドライン・リスクスコア、決定的アーティファクト、最終記事に反映される要点。',
      ko: '실행 요약 — 핵심 발견, 헤드라인 위험 점수, 결정적 산출물 및 최종 기사에 반영되는 주요 시사점.',
      zh: '运行的执行摘要——核心发现、头条风险评分、关键产物以及纳入最终文章的主要结论。',
    },
  },
  readme: {
    title: {
      en: 'Run README',
      sv: 'Körnings-README',
      da: 'Kørsels-README',
      no: 'Kjørings-README',
      fi: 'Ajon README',
      de: 'Lauf-README',
      fr: 'README d’exécution',
      es: 'README de ejecución',
      nl: 'Run-README',
      ar: 'قراءة أولى للتشغيل',
      he: 'README של ההרצה',
      ja: '実行 README',
      ko: '실행 README',
      zh: '运行 README',
    },
    desc: {
      en: 'Orientation file for the run — article type, scope, methodology set applied, artifact inventory and how to read the folder.',
      sv: 'Orienteringsfil för körningen — artikeltyp, omfattning, tillämpad metoduppsättning, artefaktförteckning och hur mappen ska läsas.',
      da: 'Orienterings­fil for kørslen — artikeltype, scope, anvendt metodesæt, artefakt­oversigt og mappens læseguide.',
      no: 'Orienterings­fil for kjøringen — artikkeltype, omfang, anvendt metodesett, artefakt­oversikt og mappeguide.',
      fi: 'Ajon orientaatio­tiedosto — artikkelityyppi, laajuus, sovellettu metodiryhmä, artefakti­luettelo ja kansion luku­ohje.',
      de: 'Orientierungs­datei für den Lauf — Artikeltyp, Scope, angewandtes Methoden­set, Artefakt­inventar und Lese­leitfaden des Ordners.',
      fr: 'Fichier d’orientation de l’exécution — type d’article, périmètre, méthodologies appliquées, inventaire d’artefacts et guide de lecture du dossier.',
      es: 'Archivo de orientación de la ejecución — tipo de artículo, alcance, metodologías aplicadas, inventario de artefactos y guía de lectura de la carpeta.',
      nl: 'Oriëntatie­bestand voor de run — artikeltype, scope, toegepaste methodologieënset, artefactinventaris en leeswijzer van de map.',
      ar: 'ملف توجيه للتشغيل — نوع المقال، النطاق، مجموعة المنهجيات المطبقة، جرد القطع وكيفية قراءة المجلد.',
      he: 'קובץ התמצאות להרצה — סוג המאמר, טווח, ערכת מתודולוגיות שיושמה, מלאי ארטיפקטים ומדריך קריאה של התיקייה.',
      ja: '実行のオリエンテーション・ファイル — 記事タイプ、スコープ、適用メソドロジーセット、アーティファクト一覧、フォルダ閲覧ガイド。',
      ko: '실행 안내 파일 — 기사 유형, 범위, 적용된 방법론 세트, 산출물 목록 및 폴더 읽기 가이드.',
      zh: '运行的指引文件——文章类型、范围、应用的方法论集、产物清单与目录阅读指南。',
    },
  },
};

/**
 * Parse a feed-prefixed artifact stem (e.g. `adoptedtexts-foo-bar-analysis`)
 * into its canonical feed key (`adoptedtexts`) and tail, if recognized.
 *
 * @param stem - Raw filename stem (extension stripped)
 * @returns `{ feed, tail }` when recognized, else `null`
 */
function parseFeedPrefix(stem: string): { feed: string; tail: string } | null {
  for (const feed of Object.keys(FEED_PREFIX_LABELS)) {
    if (stem.startsWith(`${feed}-`)) {
      return { feed, tail: stem.slice(feed.length + 1) };
    }
  }
  return null;
}

/**
 * Resolve a localized title + description for a single daily analysis
 * artifact Markdown file.
 *
 * Resolution order:
 *   1. Feed-prefix detection — files starting with `adoptedtexts-`,
 *      `procedures-`, `documents-`, `events-`, `externaldocuments-` get a
 *      single fully-localized per-item label irrespective of the slug tail.
 *   2. Stem canonicalization — `ai-swot-analysis` → `swot-analysis`,
 *      `political-risk-assessment` → `risk-assessment`, etc. — so shared
 *      curated template entries apply to every variant.
 *   3. Template lookup — `analysis/templates/<canonical>.md` in the
 *      {@link getCuratedTitle} / {@link getCuratedDescription} tables.
 *   4. Orphan table — for stems with no template we ship curated titles
 *      and descriptions in all 14 languages.
 *   5. Localized generic fallback — humanized stem + language-specific
 *      "template in the EU Parliament Monitor analysis library" sentence.
 *
 * @param shortPath - Run-relative path (e.g. `intelligence/swot-analysis.md`)
 * @param lang      - Target language code
 * @returns `{ title, description }` — both always non-empty and localized
 */
export function getArtifactInfo(
  shortPath: string,
  lang: LanguageCode
): { title: string; description: string } {
  const base = shortPath.split('/').pop() ?? shortPath;
  const rawStem = base.replace(/\.[^.]+$/, '');
  const feed = parseFeedPrefix(rawStem);
  if (feed && Object.prototype.hasOwnProperty.call(FEED_PREFIX_LABELS, feed.feed)) {
    const entry = FEED_PREFIX_LABELS[feed.feed];
    if (entry) {
      return {
        title: getFromRecord(entry.title, lang),
        description: getFromRecord(entry.desc, lang),
      };
    }
  }
  const stem = canonicalizeArtifactStem(rawStem);
  const stemLower = stem.toLowerCase();
  if (Object.prototype.hasOwnProperty.call(ORPHAN_ARTIFACT_INFO, stemLower)) {
    const orphan = ORPHAN_ARTIFACT_INFO[stemLower];
    if (orphan) {
      return {
        title: getFromRecord(orphan.title, lang),
        description: getFromRecord(orphan.desc, lang),
      };
    }
  }
  const templateKey = `analysis/templates/${stem}.md`;
  const humanized = stripEmojiAndPunct(stem);
  const title = getCuratedTitle(templateKey, lang, humanized);
  const descriptionKey = hasCuratedDescription(templateKey)
    ? templateKey
    : `analysis/daily/${stem}.md`;
  const description = getCuratedDescription(descriptionKey, lang, humanized);
  return { title, description };
}
