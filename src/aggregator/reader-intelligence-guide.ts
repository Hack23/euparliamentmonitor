// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/ReaderIntelligenceGuide
 * @description Language-aware, manifest-driven Reader Intelligence Guide
 * component. Emits exactly one guide per article with all labels, descriptions,
 * and section anchors translated into the article's language. Replaces the
 * inline Markdown guide that was previously embedded in the aggregated document.
 *
 * The guide gives readers a navigation layer over the analysis artifacts
 * behind the article, keyed to the article's H2 sections.
 */

import type { LanguageCode, LanguageMap } from '../types/index.js';
import { getLocalizedString, getTextDirection } from '../constants/language-core.js';
import { escapeHTML } from '../utils/file-utils.js';
import type { TocSection, IncludedArtifact } from './reader-guide-constants.js';
import { READER_GUIDE_SECTION_ID } from './reader-guide-constants.js';

export type { TocSection, IncludedArtifact } from './reader-guide-constants.js';
export {
  READER_GUIDE_SECTION_ID,
  READER_GUIDE_SECTION_IDS,
  READER_GUIDE_SECTION_TITLE,
} from './reader-guide-constants.js';

/* ─── Translated labels ─────────────────────────────────────────── */

/** Section title for the Reader Intelligence Guide */
export const READER_GUIDE_TITLE_LABELS: LanguageMap = {
  en: 'Reader Intelligence Guide',
  sv: 'Läsarguide för underrättelser',
  da: 'Læserguide til efterretninger',
  no: 'Leserguide for etterretning',
  fi: 'Lukijan tiedusteluopas',
  de: 'Leser-Intelligenz-Leitfaden',
  fr: "Guide d'intelligence pour le lecteur",
  es: 'Guía de inteligencia para el lector',
  nl: 'Lezersgids voor inlichtingen',
  ar: 'دليل القارئ الاستخباراتي',
  he: 'מדריך מודיעין לקורא',
  ja: '読者インテリジェンスガイド',
  ko: '독자 인텔리전스 가이드',
  zh: '读者情报指南',
};

/** Introduction text for the Reader Intelligence Guide */
export const READER_GUIDE_INTRO_LABELS: LanguageMap = {
  en: 'Use this guide to read the article as a political-intelligence product rather than a raw artifact dump. High-value reader lenses appear first; technical provenance remains available in the audit appendices.',
  sv: 'Använd denna guide för att läsa artikeln som en politisk underrättelseprodukt snarare än en rå artefaktsamling. Högvärda läsarperspektiv visas först; teknisk härkomst finns tillgänglig i granskningsbilagorna.',
  da: 'Brug denne guide til at læse artiklen som et politisk efterretningsprodukt snarere end en rå artefaktsamling. Læserperspektiver med høj værdi vises først; teknisk oprindelse forbliver tilgængelig i revisionsbilagene.',
  no: 'Bruk denne guiden til å lese artikkelen som et politisk etterretningsprodukt i stedet for en rå artefaktsamling. Leserperspektiver med høy verdi vises først; teknisk opprinnelse er tilgjengelig i revisjonsvedleggene.',
  fi: "Käytä tätä opasta artikkelin lukemiseen poliittisena tiedustelutuotteena raa'an artefaktikokoelman sijaan. Arvokkaita lukijanäkökulmia esitetään ensin; tekninen alkuperä on saatavilla tarkastusliitteissä.",
  de: 'Nutzen Sie diesen Leitfaden, um den Artikel als politisches Nachrichtendienstprodukt statt als bloße Artefaktsammlung zu lesen. Hochwertige Leserperspektiven erscheinen zuerst; technische Herkunft bleibt in den Prüfanhängen verfügbar.',
  fr: "Utilisez ce guide pour lire l'article comme un produit de renseignement politique plutôt qu'un simple recueil d'artefacts. Les perspectives de lecture à haute valeur apparaissent en premier ; la provenance technique reste disponible dans les annexes d'audit.",
  es: 'Use esta guía para leer el artículo como un producto de inteligencia política en lugar de una colección de artefactos sin procesar. Las perspectivas de lectura de alto valor aparecen primero; la procedencia técnica permanece disponible en los apéndices de auditoría.',
  nl: 'Gebruik deze gids om het artikel te lezen als een politiek inlichtingenproduct in plaats van een ruwe artefactverzameling. Hoogwaardige lezersperspectieven verschijnen eerst; technische herkomst blijft beschikbaar in de auditbijlagen.',
  ar: 'استخدم هذا الدليل لقراءة المقال كمنتج استخباراتي سياسي بدلاً من مجموعة مواد خام. تظهر العدسات عالية القيمة أولاً؛ تبقى المصادر التقنية متاحة في ملاحق المراجعة.',
  he: 'השתמש במדריך זה לקריאת המאמר כמוצר מודיעין פוליטי ולא כאוסף ממצאים גולמי. עדשות קריאה בעלות ערך גבוה מופיעות ראשונות; מקור טכני נשאר זמין בנספחי הביקורת.',
  ja: 'このガイドを使用して、生の成果物の集まりではなく政治インテリジェンス製品として記事を読んでください。高価値な読者視点が最初に表示されます。技術的な出所は監査付録で引き続き確認できます。',
  ko: '이 가이드를 사용하여 기사를 원시 산출물 모음이 아닌 정치 인텔리전스 제품으로 읽으십시오. 고가치 독자 관점이 먼저 나타납니다. 기술적 출처는 감사 부록에서 확인할 수 있습니다.',
  zh: '使用本指南将文章作为政治情报产品而非原始工件集合来阅读。高价值读者视角优先呈现；技术出处可在审计附录中查阅。',
};

/** Table header: "Reader need" */
export const READER_GUIDE_COL_NEED_LABELS: LanguageMap = {
  en: 'Reader need',
  sv: 'Läsarbehov',
  da: 'Læserbehov',
  no: 'Leserbehov',
  fi: 'Lukijan tarve',
  de: 'Leserbedarf',
  fr: 'Besoin du lecteur',
  es: 'Necesidad del lector',
  nl: 'Lezersbehoefte',
  ar: 'حاجة القارئ',
  he: 'צורך הקורא',
  ja: '読者のニーズ',
  ko: '독자 요구',
  zh: '读者需求',
};

/** Table header: "What you'll get" */
export const READER_GUIDE_COL_VALUE_LABELS: LanguageMap = {
  en: "What you'll get",
  sv: 'Vad du får',
  da: 'Hvad du får',
  no: 'Hva du får',
  fi: 'Mitä saat',
  de: 'Was Sie erhalten',
  fr: 'Ce que vous obtiendrez',
  es: 'Lo que obtendrá',
  nl: 'Wat u krijgt',
  ar: 'ما ستحصل عليه',
  he: 'מה תקבל',
  ja: '得られる情報',
  ko: '얻게 되는 정보',
  zh: '您将获得',
};

/** Table header: "Source artifact" */
export const READER_GUIDE_COL_SOURCE_LABELS: LanguageMap = {
  en: 'Source artifact',
  sv: 'Källartefakt',
  da: 'Kildeartefakt',
  no: 'Kildeartefakt',
  fi: 'Lähdeartefakti',
  de: 'Quellartefakt',
  fr: 'Artefact source',
  es: 'Artefacto fuente',
  nl: 'Bronartefact',
  ar: 'مصدر المواد',
  he: 'ממצא מקור',
  ja: 'ソースアーティファクト',
  ko: '소스 아티팩트',
  zh: '源工件',
};

/* ─── Per-section reader-guide values (translated) ───────────────── */

/** Translated reader-guide row data keyed by section ID. */
interface GuideRowData {
  readonly need: LanguageMap;
  readonly value: LanguageMap;
}

const READER_GUIDE_ROWS: Readonly<Record<string, GuideRowData>> = {
  'section-executive-brief': {
    need: {
      en: 'BLUF and editorial decisions',
      sv: 'BLUF och redaktionella beslut',
      da: 'BLUF og redaktionelle beslutninger',
      no: 'BLUF og redaksjonelle beslutninger',
      fi: 'BLUF ja toimitukselliset päätökset',
      de: 'BLUF und redaktionelle Entscheidungen',
      fr: 'BLUF et décisions éditoriales',
      es: 'BLUF y decisiones editoriales',
      nl: 'BLUF en redactionele beslissingen',
      ar: 'ملخص تنفيذي وقرارات تحريرية',
      he: 'תמצית ניהולית והחלטות עריכה',
      ja: 'BLUF と編集上の判断',
      ko: 'BLUF 및 편집 결정',
      zh: 'BLUF与编辑决策',
    },
    value: {
      en: 'fast answer to what happened, why it matters, who is accountable, and the next dated trigger',
      sv: 'snabbt svar på vad som hände, varför det spelar roll, vem som ansvarar och nästa daterade trigger',
      da: 'hurtigt svar på hvad der skete, hvorfor det er vigtigt, hvem der er ansvarlig, og den næste daterede trigger',
      no: 'raskt svar på hva som skjedde, hvorfor det betyr noe, hvem som er ansvarlig, og neste daterte trigger',
      fi: 'nopea vastaus siihen mitä tapahtui, miksi sillä on merkitystä, kuka on vastuussa ja seuraava päivätty laukaisin',
      de: 'schnelle Antwort auf was passiert ist, warum es wichtig ist, wer verantwortlich ist und der nächste terminierte Auslöser',
      fr: "réponse rapide à ce qui s'est passé, pourquoi c'est important, qui est responsable et le prochain déclencheur daté",
      es: 'respuesta rápida a qué sucedió, por qué importa, quién es responsable y el próximo evento programado',
      nl: 'snel antwoord op wat er gebeurde, waarom het belangrijk is, wie verantwoordelijk is en de volgende geplande trigger',
      ar: 'إجابة سريعة عما حدث، لماذا يهم، من المسؤول، والمحفز التالي المؤرخ',
      he: 'תשובה מהירה למה שקרה, למה זה חשוב, מי אחראי, והטריגר הבא',
      ja: '何が起きたか、なぜ重要か、誰が責任者か、次の予定トリガーへの即答',
      ko: '무슨 일이 있었는지, 왜 중요한지, 누가 책임지는지, 다음 예정된 트리거에 대한 빠른 답변',
      zh: '快速回答发生了什么、为何重要、谁负责以及下一个预定触发事件',
    },
  },
  'section-synthesis': {
    need: {
      en: 'Integrated thesis',
      sv: 'Integrerad tes',
      da: 'Integreret tese',
      no: 'Integrert tese',
      fi: 'Integroitu teesi',
      de: 'Integrierte These',
      fr: 'Thèse intégrée',
      es: 'Tesis integrada',
      nl: 'Geïntegreerde these',
      ar: 'أطروحة متكاملة',
      he: 'תזה משולבת',
      ja: '統合テーゼ',
      ko: '통합 논제',
      zh: '综合论点',
    },
    value: {
      en: 'the lead political reading that connects facts, actors, risks, and confidence',
      sv: 'den ledande politiska läsningen som kopplar samman fakta, aktörer, risker och förtroende',
      da: 'den ledende politiske læsning der forbinder fakta, aktører, risici og tillid',
      no: 'den ledende politiske lesningen som kobler sammen fakta, aktører, risikoer og tillit',
      fi: 'johtava poliittinen tulkinta, joka yhdistää faktat, toimijat, riskit ja luottamuksen',
      de: 'die führende politische Lesart, die Fakten, Akteure, Risiken und Vertrauen verbindet',
      fr: 'la lecture politique principale qui relie faits, acteurs, risques et confiance',
      es: 'la lectura política principal que conecta hechos, actores, riesgos y confianza',
      nl: "de leidende politieke lezing die feiten, actoren, risico's en vertrouwen verbindt",
      ar: 'القراءة السياسية الرائدة التي تربط الحقائق والفاعلين والمخاطر والثقة',
      he: 'הקריאה הפוליטית המובילה שמחברת עובדות, שחקנים, סיכונים ואמון',
      ja: '事実、アクター、リスク、信頼を結びつける主要な政治的解釈',
      ko: '사실, 행위자, 위험 및 신뢰를 연결하는 주요 정치적 해석',
      zh: '将事实、行动者、风险和信心联系起来的主要政治解读',
    },
  },
  'section-significance': {
    need: {
      en: 'Significance scoring',
      sv: 'Betydelsepoäng',
      da: 'Betydningsvurdering',
      no: 'Betydningsvurdering',
      fi: 'Merkittävyyspisteytys',
      de: 'Bedeutungsbewertung',
      fr: 'Évaluation de la signification',
      es: 'Puntuación de significancia',
      nl: 'Significantiebeoordeling',
      ar: 'تقييم الأهمية',
      he: 'ציון משמעות',
      ja: '重要度スコアリング',
      ko: '중요도 평가',
      zh: '重要性评分',
    },
    value: {
      en: 'why this story outranks or trails other same-day European Parliament signals',
      sv: 'varför denna nyhet överträffar eller underpresterar andra samma dags EU-parlamentssignaler',
      da: 'hvorfor denne historie overgår eller ligger under andre EU-parlamentssignaler fra samme dag',
      no: 'hvorfor denne saken overgår eller ligger bak andre EU-parlamentssignaler fra samme dag',
      fi: 'miksi tämä uutinen ohittaa tai jää jälkeen muista saman päivän EU-parlamentin signaaleista',
      de: 'warum diese Geschichte andere gleichzeitige EU-Parlamentssignale übertrifft oder hinterherhinkt',
      fr: "pourquoi cette histoire surpasse ou suit d'autres signaux du Parlement européen du même jour",
      es: 'por qué esta historia supera o queda detrás de otras señales del Parlamento Europeo del mismo día',
      nl: 'waarom dit verhaal andere EU-Parlementsignalen van dezelfde dag overtreft of achterblijft',
      ar: 'لماذا تتفوق هذه القصة أو تتخلف عن إشارات البرلمان الأوروبي الأخرى في نفس اليوم',
      he: 'מדוע הסיפור הזה עולה או נופל ביחס לאותות אחרים של הפרלמנט האירופי מאותו יום',
      ja: 'この記事が同日の他のEU議会シグナルを上回る/下回る理由',
      ko: '이 기사가 같은 날의 다른 EU 의회 신호보다 높은/낮은 순위인 이유',
      zh: '为何此新闻在同日欧洲议会信号中排名靠前或靠后',
    },
  },
  'section-coalitions-voting': {
    need: {
      en: 'Coalitions and voting',
      sv: 'Koalitioner och röstning',
      da: 'Koalitioner og afstemning',
      no: 'Koalisjoner og avstemning',
      fi: 'Koalitiot ja äänestys',
      de: 'Koalitionen und Abstimmungen',
      fr: 'Coalitions et votes',
      es: 'Coaliciones y votación',
      nl: 'Coalities en stemmingen',
      ar: 'التحالفات والتصويت',
      he: 'קואליציות והצבעות',
      ja: '連立と投票',
      ko: '연합 및 투표',
      zh: '联盟与投票',
    },
    value: {
      en: 'political group alignment, voting evidence, and coalition pressure points',
      sv: 'politisk gruppanpassning, röstbevis och koalitionstryckpunkter',
      da: 'politisk gruppeafstemning, stemmebevis og koalitionstrykpunkter',
      no: 'politisk gruppetilpasning, avstemningsbevis og koalisjonstrykpunkter',
      fi: 'poliittisen ryhmän linjaus, äänestystodisteet ja koalition painepisteet',
      de: 'politische Gruppenausrichtung, Abstimmungsnachweise und Koalitionsdruckpunkte',
      fr: 'alignement des groupes politiques, preuves de vote et points de pression de la coalition',
      es: 'alineamiento de grupos políticos, evidencia de votación y puntos de presión de la coalición',
      nl: 'politieke groepsafstemming, stembewijzen en coalitiepressuurpunten',
      ar: 'توافق المجموعات السياسية وأدلة التصويت ونقاط ضغط التحالف',
      he: 'התאמת קבוצות פוליטיות, ראיות הצבעה ונקודות לחץ קואליציוניות',
      ja: '政党グループの連携、投票エビデンス、連立圧力ポイント',
      ko: '정치 그룹 정렬, 투표 증거 및 연합 압력 지점',
      zh: '政治团体对齐、投票证据和联盟压力点',
    },
  },
  'section-stakeholder-map': {
    need: {
      en: 'Stakeholder impact',
      sv: 'Intressentpåverkan',
      da: 'Interessentpåvirkning',
      no: 'Interessentpåvirkning',
      fi: 'Sidosryhmävaikutus',
      de: 'Stakeholder-Auswirkungen',
      fr: 'Impact sur les parties prenantes',
      es: 'Impacto en las partes interesadas',
      nl: 'Impact op belanghebbenden',
      ar: 'تأثير أصحاب المصلحة',
      he: 'השפעה על בעלי עניין',
      ja: 'ステークホルダーへの影響',
      ko: '이해관계자 영향',
      zh: '利益相关者影响',
    },
    value: {
      en: 'who gains, who loses, and which institutions or citizens feel the policy effect',
      sv: 'vem som vinner, vem som förlorar, och vilka institutioner eller medborgare som påverkas',
      da: 'hvem vinder, hvem taber, og hvilke institutioner eller borgere der mærker politikeffekten',
      no: 'hvem som vinner, hvem som taper, og hvilke institusjoner eller borgere som merker politikkeffekten',
      fi: 'kuka voittaa, kuka häviää, ja mitkä instituutiot tai kansalaiset tuntevat politiikan vaikutuksen',
      de: 'wer gewinnt, wer verliert, und welche Institutionen oder Bürger die Politikwirkung spüren',
      fr: "qui gagne, qui perd, et quelles institutions ou citoyens ressentent l'effet de la politique",
      es: 'quién gana, quién pierde, y qué instituciones o ciudadanos sienten el efecto de la política',
      nl: 'wie wint, wie verliest, en welke instellingen of burgers het beleidseffect voelen',
      ar: 'من يكسب، من يخسر، وأي مؤسسات أو مواطنين يشعرون بتأثير السياسة',
      he: 'מי מרוויח, מי מפסיד, ואילו מוסדות או אזרחים חשים את השפעת המדיניות',
      ja: '誰が得をし、誰が損をし、どの機関や市民が政策効果を感じるか',
      ko: '누가 이익을 보고, 누가 손해를 보며, 어떤 기관이나 시민이 정책 효과를 느끼는지',
      zh: '谁受益、谁受损，哪些机构或公民感受到政策效果',
    },
  },
  'section-economic-context': {
    need: {
      en: 'IMF-backed economic context',
      sv: 'IMF-stödd ekonomisk kontext',
      da: 'IMF-støttet økonomisk kontekst',
      no: 'IMF-støttet økonomisk kontekst',
      fi: 'IMF:n tukema taloudellinen konteksti',
      de: 'IWF-gestützter wirtschaftlicher Kontext',
      fr: 'Contexte économique soutenu par le FMI',
      es: 'Contexto económico respaldado por el FMI',
      nl: 'IMF-ondersteunde economische context',
      ar: 'سياق اقتصادي مدعوم من صندوق النقد الدولي',
      he: 'הקשר כלכלי מגובה קרן המטבע',
      ja: 'IMF裏付け経済コンテキスト',
      ko: 'IMF 지원 경제 맥락',
      zh: 'IMF支持的经济背景',
    },
    value: {
      en: 'macro, fiscal, trade, or monetary evidence that changes the political interpretation',
      sv: 'makro-, finans-, handels- eller monetärbevis som förändrar den politiska tolkningen',
      da: 'makro-, finans-, handels- eller monetærbevis der ændrer den politiske fortolkning',
      no: 'makro-, finans-, handels- eller pengepolitiske bevis som endrer den politiske tolkningen',
      fi: 'makro-, finanssi-, kauppa- tai rahapoliittiset todisteet, jotka muuttavat poliittista tulkintaa',
      de: 'makroökonomische, fiskalische, Handels- oder geldpolitische Belege, die die politische Interpretation ändern',
      fr: "preuves macro, fiscales, commerciales ou monétaires qui modifient l'interprétation politique",
      es: 'evidencia macro, fiscal, comercial o monetaria que cambia la interpretación política',
      nl: 'macro-, fiscaal, handels- of monetair bewijs dat de politieke interpretatie verandert',
      ar: 'أدلة كلية أو مالية أو تجارية أو نقدية تغير التفسير السياسي',
      he: 'ראיות מקרו, פיסקליות, מסחריות או מוניטריות שמשנות את הפרשנות הפוליטית',
      ja: '政治的解釈を変えるマクロ、財政、貿易、金融エビデンス',
      ko: '정치적 해석을 바꾸는 거시, 재정, 무역 또는 통화 증거',
      zh: '改变政治解读的宏观、财政、贸易或货币证据',
    },
  },
  'section-scenarios': {
    need: {
      en: 'Forward indicators',
      sv: 'Framåtblickande indikatorer',
      da: 'Fremadrettede indikatorer',
      no: 'Fremoverpekende indikatorer',
      fi: 'Tulevaisuuden indikaattorit',
      de: 'Vorausschauende Indikatoren',
      fr: 'Indicateurs prospectifs',
      es: 'Indicadores prospectivos',
      nl: 'Vooruitkijkende indicatoren',
      ar: 'مؤشرات استشرافية',
      he: 'אינדיקטורים קדימה',
      ja: '先行指標',
      ko: '전망 지표',
      zh: '前瞻性指标',
    },
    value: {
      en: 'dated watch items that let readers verify or falsify the assessment later',
      sv: 'daterade bevakningspunkter som låter läsare verifiera eller falsifiera bedömningen senare',
      da: 'daterede overvågningspunkter der lader læsere verificere eller falsificere vurderingen senere',
      no: 'daterte overvåkningspunkter som lar lesere verifisere eller falsifisere vurderingen senere',
      fi: 'päivätyt seurantakohteet, joiden avulla lukijat voivat myöhemmin vahvistaa tai kumota arvion',
      de: 'datierte Beobachtungspunkte, mit denen Leser die Bewertung später verifizieren oder falsifizieren können',
      fr: "éléments de surveillance datés permettant aux lecteurs de vérifier ou d'infirmer l'évaluation ultérieurement",
      es: 'elementos de vigilancia fechados que permiten a los lectores verificar o refutar la evaluación posteriormente',
      nl: 'gedateerde bewakingspunten waarmee lezers de beoordeling later kunnen verifiëren of weerleggen',
      ar: 'عناصر مراقبة مؤرخة تتيح للقراء التحقق من التقييم أو دحضه لاحقاً',
      he: 'פריטי מעקב מתוארכים שמאפשרים לקוראים לאמת או להפריך את ההערכה בהמשך',
      ja: '読者が後で評価を検証または反証できる日付入り監視項目',
      ko: '독자가 나중에 평가를 검증하거나 반증할 수 있는 날짜가 지정된 감시 항목',
      zh: '让读者日后验证或证伪评估的标注日期监测项目',
    },
  },
  'section-risk': {
    need: {
      en: 'Risk assessment',
      sv: 'Riskbedömning',
      da: 'Risikovurdering',
      no: 'Risikovurdering',
      fi: 'Riskiarviointi',
      de: 'Risikobewertung',
      fr: 'Évaluation des risques',
      es: 'Evaluación de riesgos',
      nl: 'Risicobeoordeling',
      ar: 'تقييم المخاطر',
      he: 'הערכת סיכונים',
      ja: 'リスク評価',
      ko: '위험 평가',
      zh: '风险评估',
    },
    value: {
      en: 'policy, institutional, coalition, communications, and implementation risk register',
      sv: 'policy-, institutions-, koalitions-, kommunikations- och genomföranderiskregister',
      da: 'politik-, institutions-, koalitions-, kommunikations- og implementeringsrisikoregister',
      no: 'politikk-, institusjons-, koalisjons-, kommunikasjons- og gjennomføringsrisikoregister',
      fi: 'politiikka-, instituutio-, koalitio-, viestintä- ja toteutusriskien rekisteri',
      de: 'Risikoverzeichnis für Politik, Institutionen, Koalitionen, Kommunikation und Umsetzung',
      fr: 'registre des risques politiques, institutionnels, de coalition, de communication et de mise en œuvre',
      es: 'registro de riesgos políticos, institucionales, de coalición, de comunicación y de implementación',
      nl: 'risicoregister voor beleid, instellingen, coalities, communicatie en implementatie',
      ar: 'سجل مخاطر السياسات والمؤسسات والتحالفات والاتصالات والتنفيذ',
      he: 'מרשם סיכוני מדיניות, מוסדות, קואליציות, תקשורת ויישום',
      ja: '政策、制度、連立、コミュニケーション、実施のリスクレジスター',
      ko: '정책, 기관, 연합, 커뮤니케이션 및 이행 위험 등록부',
      zh: '政策、机构、联盟、沟通和执行风险登记册',
    },
  },
};

/* ─── HTML builder ───────────────────────────────────────────────── */

/**
 * Build a translated Reader Intelligence Guide as an HTML section.
 * Emits exactly one component with `data-component="reader-intelligence-guide"`
 * for de-duplication detection by E2E tests.
 *
 * @param lang - Target language code
 * @param sections - Emitted section TOC entries, in document order
 * @param included - Included artifacts, used to name each section's source
 * @returns HTML fragment for the guide, or empty string if no rows match
 */
export function buildReaderIntelligenceGuideHtml(
  lang: LanguageCode,
  sections: readonly TocSection[],
  included: readonly IncludedArtifact[]
): string {
  const dir = getTextDirection(lang);
  const rows: string[] = [];

  for (const section of sections) {
    const rowData = Object.getOwnPropertyDescriptor(READER_GUIDE_ROWS, section.id)?.value as
      | GuideRowData
      | undefined;
    if (!rowData) continue;

    const need = getLocalizedString(rowData.need, lang);
    const value = getLocalizedString(rowData.value, lang);
    const source = included.find((artifact) => artifact.sectionId === section.id)?.runRelPath;
    const sourceLabel = source ? `<code>${escapeHTML(source)}</code>` : escapeHTML(section.title);

    rows.push(
      `<tr><td><a href="#${escapeHTML(section.id)}">${escapeHTML(need)}</a></td><td>${escapeHTML(value)}</td><td>${sourceLabel}</td></tr>`
    );
  }

  if (rows.length === 0) return '';

  const title = getLocalizedString(READER_GUIDE_TITLE_LABELS, lang);
  const intro = getLocalizedString(READER_GUIDE_INTRO_LABELS, lang);
  const colNeed = getLocalizedString(READER_GUIDE_COL_NEED_LABELS, lang);
  const colValue = getLocalizedString(READER_GUIDE_COL_VALUE_LABELS, lang);
  const colSource = getLocalizedString(READER_GUIDE_COL_SOURCE_LABELS, lang);

  return `<section id="${READER_GUIDE_SECTION_ID}" data-component="reader-intelligence-guide" aria-label="${escapeHTML(title)}"${dir === 'rtl' ? ' dir="rtl"' : ''}>
<h2 id="${READER_GUIDE_SECTION_ID}-heading">${escapeHTML(title)}</h2>
<p>${escapeHTML(intro)}</p>
<div class="table-scroll" role="region" tabindex="0" aria-labelledby="${READER_GUIDE_SECTION_ID}-heading">
<table>
<caption class="sr-only">${escapeHTML(title)}</caption>
<thead><tr><th scope="col">${escapeHTML(colNeed)}</th><th scope="col">${escapeHTML(colValue)}</th><th scope="col">${escapeHTML(colSource)}</th></tr></thead>
<tbody>
${rows.join('\n')}
</tbody>
</table>
</div>
</section>`;
}

/**
 * Strip an AI-authored Reader Intelligence Guide section from rendered HTML.
 * Looks for H2 headings with id="reader-intelligence-guide" and removes
 * everything up to the next H2 or the end of the content. This ensures
 * the canonical renderer-owned guide is the sole instance in the article.
 *
 * @param html - Rendered HTML body fragment
 * @returns HTML with any inline reader-intelligence-guide removed
 */
export function stripInlineReaderGuide(html: string): string {
  // Match from the H2 opening with the reader-intelligence-guide id to just before the next H2 or end
  const pattern =
    /<h2[^>]*id=["']reader-intelligence-guide["'][^>]*>[\s\S]*?(?=<h2[ >]|<section[ >]|$)/gi;
  return html.replace(pattern, '');
}
