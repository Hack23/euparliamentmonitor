// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { getLocalizedString, getTextDirection } from '../constants/language-core.js';
import { escapeHTML } from '../utils/file-utils.js';
import { READER_GUIDE_SECTION_ID } from './reader-guide-constants.js';
export { READER_GUIDE_SECTION_ID, READER_GUIDE_SECTION_IDS, READER_GUIDE_SECTION_TITLE, } from './reader-guide-constants.js';
/* ─── Translated labels ─────────────────────────────────────────── */
/** Section title for the Reader Intelligence Guide */
export const READER_GUIDE_TITLE_LABELS = {
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
export const READER_GUIDE_INTRO_LABELS = {
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
export const READER_GUIDE_COL_NEED_LABELS = {
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
export const READER_GUIDE_COL_VALUE_LABELS = {
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
export const READER_GUIDE_COL_SOURCE_LABELS = {
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
const READER_GUIDE_ROWS = {
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
    'section-actors-forces': {
        need: {
            en: 'Actors & forces',
            sv: 'Aktörer & krafter',
            da: 'Aktører & kræfter',
            no: 'Aktører & krefter',
            fi: 'Toimijat & voimat',
            de: 'Akteure & Kräfte',
            fr: 'Acteurs & forces',
            es: 'Actores & fuerzas',
            nl: 'Actoren & krachten',
            ar: 'الفاعلون والقوى',
            he: 'שחקנים וכוחות',
            ja: 'アクターと力学',
            ko: '행위자 & 세력',
            zh: '行动者与力量',
        },
        value: {
            en: 'who is driving the story, what political forces line up behind them, and which institutional levers they can pull',
            sv: 'vem som driver händelsen, vilka politiska krafter står bakom och vilka institutionella spakar de kan dra',
            da: 'hvem der driver historien, hvilke politiske kræfter står bag, og hvilke institutionelle håndtag de kan trække',
            no: 'hvem som driver saken, hvilke politiske krefter står bak, og hvilke institusjonelle spaker de kan trekke',
            fi: 'kuka ohjaa tarinaa, mitkä poliittiset voimat ovat takana ja mitä institutionaalisia vipuja he voivat käyttää',
            de: 'wer die Geschichte vorantreibt, welche politischen Kräfte dahinterstehen und welche institutionellen Hebel sie ziehen können',
            fr: "qui pilote l'histoire, quelles forces politiques sont alignées derrière, et quels leviers institutionnels ils peuvent actionner",
            es: 'quién impulsa la historia, qué fuerzas políticas están detrás y qué palancas institucionales pueden accionar',
            nl: 'wie het verhaal aandrijft, welke politieke krachten erachter staan en welke institutionele hefbomen ze kunnen overhalen',
            ar: 'من يقود القصة، وما القوى السياسية المصطفة خلفه، وأي روافع مؤسسية يمكنهم تحريكها',
            he: 'מי מניע את הסיפור, אילו כוחות פוליטיים מאחוריו, ואילו מנופים מוסדיים הם יכולים להפעיל',
            ja: 'ストーリーを動かしているのは誰か、その背後にある政治的勢力、そして彼らが引ける制度的レバー',
            ko: '누가 이야기를 주도하는지, 그 뒤에 어떤 정치적 세력이 있는지, 그리고 어떤 제도적 지렛대를 당길 수 있는지',
            zh: '谁在推动故事、哪些政治力量在其背后、以及他们可以拉动哪些制度杠杆',
        },
    },
    'section-threat': {
        need: {
            en: 'Threat landscape',
            sv: 'Hotlandskap',
            da: 'Trussellandskab',
            no: 'Trussellandskap',
            fi: 'Uhkamaisema',
            de: 'Bedrohungslandschaft',
            fr: 'Paysage des menaces',
            es: 'Panorama de amenazas',
            nl: 'Dreigingslandschap',
            ar: 'مشهد التهديدات',
            he: 'נוף האיומים',
            ja: '脅威ランドスケープ',
            ko: '위협 환경',
            zh: '威胁态势',
        },
        value: {
            en: 'hostile actors, attack vectors, consequence trees, and the legislative-disruption pathways the article tracks',
            sv: 'fientliga aktörer, attackvektorer, konsekvensträd och de lagstiftningsstörningsvägar artikeln spårar',
            da: 'fjendtlige aktører, angrebsvektorer, konsekvenstræer og de lovgivningsforstyrrelsesveje artiklen følger',
            no: 'fiendtlige aktører, angrepsvektorer, konsekvenstrær og lovgivningsforstyrrelsesveiene artikkelen sporer',
            fi: 'vihamieliset toimijat, hyökkäysvektorit, seurauspuut ja lainsäädännön häiriöpolut, joita artikkeli seuraa',
            de: 'feindliche Akteure, Angriffsvektoren, Konsequenzbäume und die Gesetzgebungsstörungspfade, die der Artikel verfolgt',
            fr: "acteurs hostiles, vecteurs d'attaque, arbres de conséquences et voies de perturbation législative que l'article suit",
            es: 'actores hostiles, vectores de ataque, árboles de consecuencias y las vías de disrupción legislativa que sigue el artículo',
            nl: 'vijandige actoren, aanvalsvectoren, gevolgenbomen en de wetgevingsverstoringspaden die het artikel volgt',
            ar: 'الجهات المعادية وناقلات الهجوم وأشجار العواقب ومسارات التعطيل التشريعي التي يتتبعها المقال',
            he: 'שחקנים עוינים, ווקטורי תקיפה, עצי השלכה ונתיבי שיבוש החקיקה שהמאמר עוקב אחריהם',
            ja: '敵対的アクター、攻撃ベクトル、結果ツリー、および記事が追跡する立法阻害経路',
            ko: '적대적 행위자, 공격 벡터, 결과 트리, 그리고 기사가 추적하는 입법 교란 경로',
            zh: '敌对行为者、攻击向量、后果树以及文章追踪的立法干扰路径',
        },
    },
    'section-forward-projection': {
        need: {
            en: 'What to watch',
            sv: 'Vad att bevaka',
            da: 'Hvad man skal følge',
            no: 'Hva å følge med på',
            fi: 'Mitä seurata',
            de: 'Was zu beobachten ist',
            fr: 'À surveiller',
            es: 'Qué vigilar',
            nl: 'Wat te volgen',
            ar: 'ما يجب مراقبته',
            he: 'מה לעקוב אחריו',
            ja: '注目ポイント',
            ko: '주목할 사항',
            zh: '关注要点',
        },
        value: {
            en: 'dated trigger events, parliamentary-calendar dependencies, and the legislative-pipeline forecast',
            sv: 'daterade triggers, beroenden i parlamentskalendern och prognosen för lagstiftningspipelinen',
            da: 'daterede triggers, parlamentskalender-afhængigheder og prognosen for lovgivningspipelinen',
            no: 'daterte triggers, parlamentskalender-avhengigheter og prognosen for lovgivningspipelinen',
            fi: 'päivätyt laukaisimet, parlamentin kalenterin riippuvuudet ja lainsäädäntöputken ennuste',
            de: 'datierte Auslöseereignisse, Abhängigkeiten vom Parlamentskalender und die Prognose der Gesetzgebungspipeline',
            fr: 'événements déclencheurs datés, dépendances du calendrier parlementaire et prévision du pipeline législatif',
            es: 'eventos desencadenantes fechados, dependencias del calendario parlamentario y previsión del pipeline legislativo',
            nl: 'gedateerde triggergebeurtenissen, afhankelijkheden van de parlementaire agenda en de voorspelling van de wetgevingspijplijn',
            ar: 'أحداث محفزة مؤرخة، تبعيات الجدول البرلماني، وتوقعات خط الأنابيب التشريعي',
            he: 'אירועי טריגר מתוארכים, תלויות לוח הפרלמנט ותחזית צינור החקיקה',
            ja: '日付付きのトリガーイベント、議会カレンダーの依存関係、立法パイプラインの予測',
            ko: '날짜가 지정된 트리거 이벤트, 의회 일정 의존성, 입법 파이프라인 예측',
            zh: '标注日期的触发事件、议会日历依赖关系以及立法流程预测',
        },
    },
    'section-electoral-arc': {
        need: {
            en: 'Electoral arc & mandate',
            sv: 'Valbåge & mandat',
            da: 'Valgbue & mandat',
            no: 'Valgbue & mandat',
            fi: 'Vaalikaari & mandaatti',
            de: 'Wahlbogen & Mandat',
            fr: 'Arc électoral & mandat',
            es: 'Arco electoral & mandato',
            nl: 'Verkiezingsboog & mandaat',
            ar: 'القوس الانتخابي والتفويض',
            he: 'קשת בחירות ומנדט',
            ja: '選挙アークとマンデート',
            ko: '선거 아크 & 위임',
            zh: '选举弧线与任期',
        },
        value: {
            en: 'where in the term the story sits, mandate-fulfilment scoring, seat projection, and the presidency-trio context',
            sv: 'var i mandatperioden händelsen befinner sig, mandatuppfyllelsescoring, mandatprojektion och ordförandetrio-kontexten',
            da: 'hvor i valgperioden historien ligger, mandatopfyldelsesscoring, mandatprojektion og formandstrio-konteksten',
            no: 'hvor i valgperioden saken ligger, mandatoppfyllelsesscoring, mandatprojeksjon og formannskapstrio-konteksten',
            fi: 'mihin kohtaan kautta tarina sijoittuu, mandaatin täyttymisen pisteytys, paikkaennuste ja puheenjohtajatrion konteksti',
            de: 'wo im Mandat die Geschichte liegt, Mandatserfüllungs-Scoring, Sitzprojektion und Präsidentschaftstrio-Kontext',
            fr: "où en est l'histoire dans le mandat, notation de l'exécution du mandat, projection des sièges et contexte du trio présidentiel",
            es: 'dónde se sitúa la historia en el mandato, puntuación de cumplimiento del mandato, proyección de escaños y contexto del trío presidencial',
            nl: 'waar het verhaal zich in het mandaat bevindt, scoring mandaatuitvoering, zetelprojectie en context van de voorzittersdrieluik',
            ar: 'موقع القصة في الولاية، تقييم تنفيذ التفويض، توقعات المقاعد، وسياق الترويكا الرئاسية',
            he: 'איפה בכהונה הסיפור ממוקם, ניקוד מילוי המנדט, תחזית מושבים, והקשר של שלישיית הנשיאות',
            ja: '物語が任期のどこに位置するか、マンデート遂行スコア、議席予測、議長トリオの文脈',
            ko: '이야기가 임기의 어디에 위치하는지, 위임 이행 점수, 의석 예측, 의장 트리오 맥락',
            zh: '故事在任期中所处的位置、任期履行评分、席位预测以及主席三人组的背景',
        },
    },
    'section-pestle-context': {
        need: {
            en: 'PESTLE & structural context',
            sv: 'PESTLE & strukturell kontext',
            da: 'PESTLE & strukturel kontekst',
            no: 'PESTLE & strukturell kontekst',
            fi: 'PESTLE & rakenteellinen konteksti',
            de: 'PESTLE & struktureller Kontext',
            fr: 'PESTLE & contexte structurel',
            es: 'PESTLE & contexto estructural',
            nl: 'PESTLE & structurele context',
            ar: 'PESTLE والسياق الهيكلي',
            he: 'PESTLE והקשר מבני',
            ja: 'PESTLEと構造的コンテキスト',
            ko: 'PESTLE & 구조적 맥락',
            zh: 'PESTLE与结构性背景',
        },
        value: {
            en: 'political, economic, social, technological, legal, and environmental forces plus the historical baseline',
            sv: 'politiska, ekonomiska, sociala, tekniska, juridiska och miljömässiga krafter samt historisk baslinje',
            da: 'politiske, økonomiske, sociale, teknologiske, juridiske og miljømæssige kræfter samt historisk baseline',
            no: 'politiske, økonomiske, sosiale, teknologiske, juridiske og miljømessige krefter pluss historisk grunnlinje',
            fi: 'poliittiset, taloudelliset, sosiaaliset, teknologiset, juridiset ja ympäristötekijät sekä historiallinen lähtötaso',
            de: 'politische, wirtschaftliche, soziale, technologische, rechtliche und Umweltkräfte plus historische Baseline',
            fr: 'forces politiques, économiques, sociales, technologiques, juridiques et environnementales plus la base historique',
            es: 'fuerzas políticas, económicas, sociales, tecnológicas, legales y ambientales más la línea base histórica',
            nl: 'politieke, economische, sociale, technologische, juridische en milieukrachten plus de historische basislijn',
            ar: 'القوى السياسية والاقتصادية والاجتماعية والتكنولوجية والقانونية والبيئية بالإضافة إلى الأساس التاريخي',
            he: 'כוחות פוליטיים, כלכליים, חברתיים, טכנולוגיים, משפטיים וסביבתיים בתוספת קו הבסיס ההיסטורי',
            ja: '政治・経済・社会・技術・法律・環境の各要因と歴史的ベースライン',
            ko: '정치, 경제, 사회, 기술, 법률, 환경 요인과 역사적 기준선',
            zh: '政治、经济、社会、技术、法律和环境力量加上历史基准',
        },
    },
    'section-continuity': {
        need: {
            en: 'Cross-run continuity',
            sv: 'Kontinuitet mellan körningar',
            da: 'Kryds-kørsels-kontinuitet',
            no: 'Kontinuitet mellom kjøringer',
            fi: 'Ajojen välinen jatkuvuus',
            de: 'Laufübergreifende Kontinuität',
            fr: 'Continuité inter-exécutions',
            es: 'Continuidad entre ejecuciones',
            nl: 'Continuïteit tussen runs',
            ar: 'استمرارية عبر التشغيلات',
            he: 'רציפות בין הרצות',
            ja: 'クロスラン継続性',
            ko: '교차 실행 연속성',
            zh: '跨运行连续性',
        },
        value: {
            en: 'how this run links to prior sessions, what changed, and how confidence shifted between runs',
            sv: 'hur denna körning kopplar till tidigare sessioner, vad som förändrats och hur förtroendet skiftat mellan körningar',
            da: 'hvordan denne kørsel forbinder til tidligere sessioner, hvad der er ændret, og hvordan tilliden har skiftet mellem kørsler',
            no: 'hvordan denne kjøringen kobler til tidligere økter, hva som er endret, og hvordan tilliten har skiftet mellom kjøringer',
            fi: 'miten tämä ajo kytkeytyy aiempiin istuntoihin, mikä on muuttunut ja miten luottamus on siirtynyt ajojen välillä',
            de: 'wie dieser Lauf mit früheren Sitzungen verknüpft ist, was sich geändert hat und wie sich das Vertrauen zwischen Läufen verschoben hat',
            fr: "comment cette exécution se relie aux sessions précédentes, ce qui a changé, et comment la confiance s'est déplacée entre les exécutions",
            es: 'cómo se vincula esta ejecución con sesiones anteriores, qué cambió y cómo se desplazó la confianza entre ejecuciones',
            nl: 'hoe deze run aansluit op eerdere sessies, wat er is veranderd en hoe het vertrouwen tussen runs is verschoven',
            ar: 'كيفية ارتباط هذا التشغيل بالجلسات السابقة، وما الذي تغير، وكيف تحولت الثقة بين عمليات التشغيل',
            he: 'כיצד הרצה זו מתקשרת להפעלות קודמות, מה השתנה, וכיצד הביטחון השתנה בין הרצות',
            ja: 'この実行が以前のセッションとどう繋がるか、何が変わったか、実行間で信頼性がどう変動したか',
            ko: '이 실행이 이전 세션과 어떻게 연결되는지, 무엇이 변경되었는지, 실행 간에 신뢰도가 어떻게 변화했는지',
            zh: '本次运行如何与先前会话关联、变化了什么以及置信度在运行之间如何变化',
        },
    },
    'section-extended-intel': {
        need: {
            en: 'Extended intelligence',
            sv: 'Utökad underrättelse',
            da: 'Udvidet efterretning',
            no: 'Utvidet etterretning',
            fi: 'Laajennettu tiedustelu',
            de: 'Erweiterte Aufklärung',
            fr: 'Renseignement étendu',
            es: 'Inteligencia ampliada',
            nl: 'Uitgebreide inlichtingen',
            ar: 'استخبارات موسعة',
            he: 'מודיעין מורחב',
            ja: '拡張インテリジェンス',
            ko: '확장 인텔리전스',
            zh: '扩展情报',
        },
        value: {
            en: "devil's-advocate critique, comparative international parallels, historical precedents, and media-framing analysis",
            sv: 'djävulens-advokat-kritik, jämförande internationella paralleller, historiska prejudikat och mediaframing-analys',
            da: 'djævlens-advokat-kritik, sammenlignende internationale paralleller, historiske præcedenser og medieframing-analyse',
            no: 'djevelens advokat-kritikk, sammenlignende internasjonale paralleller, historiske presedenser og mediaframing-analyse',
            fi: 'paholaisen asianajaja -kritiikki, kansainväliset vertailut, historialliset ennakkotapaukset ja media-analyysi',
            de: 'Devil-Advocate-Kritik, vergleichende internationale Parallelen, historische Präzedenzfälle und Medien-Framing-Analyse',
            fr: "critique de l'avocat du diable, parallèles internationaux comparatifs, précédents historiques et analyse du cadrage médiatique",
            es: 'crítica de abogado del diablo, paralelismos internacionales comparativos, precedentes históricos y análisis de encuadre mediático',
            nl: 'devils-advocate-kritiek, vergelijkende internationale parallellen, historische precedenten en media-framinganalyse',
            ar: 'نقد محامي الشيطان، توازيات دولية مقارنة، سوابق تاريخية، وتحليل التأطير الإعلامي',
            he: 'ביקורת פרקליט השטן, מקבילות בינלאומיות השוואתיות, תקדימים היסטוריים וניתוח מסגור תקשורתי',
            ja: '悪魔の代弁者批評、比較国際パラレル、歴史的先例、メディアフレーミング分析',
            ko: '악마의 변호인 비판, 비교 국제 평행 사례, 역사적 선례, 미디어 프레이밍 분석',
            zh: '魔鬼代言人批评、比较国际平行案例、历史先例和媒体框架分析',
        },
    },
    'section-mcp-reliability': {
        need: {
            en: 'MCP data reliability',
            sv: 'MCP-datatillförlitlighet',
            da: 'MCP-datapålidelighed',
            no: 'MCP-datapålitelighet',
            fi: 'MCP-datan luotettavuus',
            de: 'MCP-Datenzuverlässigkeit',
            fr: 'Fiabilité des données MCP',
            es: 'Fiabilidad de datos MCP',
            nl: 'Betrouwbaarheid MCP-gegevens',
            ar: 'موثوقية بيانات MCP',
            he: 'אמינות נתוני MCP',
            ja: 'MCPデータ信頼性',
            ko: 'MCP 데이터 신뢰성',
            zh: 'MCP数据可靠性',
        },
        value: {
            en: 'which feeds were healthy, which were degraded, and how the data limitations bound the conclusions',
            sv: 'vilka flöden var friska, vilka var degraderade och hur databegränsningar binder slutsatserna',
            da: 'hvilke feeds var sunde, hvilke var forringede, og hvordan databegrænsningerne binder konklusionerne',
            no: 'hvilke feeds var sunne, hvilke var degradert, og hvordan databegrensninger binder konklusjonene',
            fi: 'mitkä syötteet olivat terveitä, mitkä huonontuneita ja miten datarajoitukset rajaavat johtopäätöksiä',
            de: 'welche Feeds gesund waren, welche degradiert, und wie die Datengrenzen die Schlussfolgerungen binden',
            fr: 'quels flux étaient sains, lesquels étaient dégradés et comment les limites de données contraignent les conclusions',
            es: 'qué fuentes estaban sanas, cuáles degradadas y cómo las limitaciones de datos restringen las conclusiones',
            nl: 'welke feeds gezond waren, welke gedegradeerd, en hoe databeperkingen de conclusies inperken',
            ar: 'أي الموجزات كانت صحية، وأيها متدهورة، وكيف تقيد قيود البيانات الاستنتاجات',
            he: 'אילו פידים היו תקינים, אילו היו פגומים, וכיצד מגבלות הנתונים תוחמות את המסקנות',
            ja: 'どのフィードが健全だったか、どれが劣化していたか、そしてデータの制約が結論をどう制限するか',
            ko: '어떤 피드가 건강했고, 어떤 피드가 저하되었으며, 데이터 제약이 결론을 어떻게 제한하는지',
            zh: '哪些数据源健康、哪些已降级，以及数据限制如何约束结论',
        },
    },
    'section-quality-reflection': {
        need: {
            en: 'Analytical quality & reflection',
            sv: 'Analytisk kvalitet & reflektion',
            da: 'Analytisk kvalitet & refleksion',
            no: 'Analytisk kvalitet & refleksjon',
            fi: 'Analyyttinen laatu & pohdinta',
            de: 'Analytische Qualität & Reflexion',
            fr: 'Qualité analytique & réflexion',
            es: 'Calidad analítica & reflexión',
            nl: 'Analytische kwaliteit & reflectie',
            ar: 'الجودة التحليلية والتأمل',
            he: 'איכות אנליטית ורפלקציה',
            ja: '分析品質と内省',
            ko: '분석 품질 & 성찰',
            zh: '分析质量与反思',
        },
        value: {
            en: 'self-assessment scores, methodology audit, structured-analytic-techniques used, and known limitations',
            sv: 'självvärderingspoäng, metodologirevision, strukturerade analystekniker som använts och kända begränsningar',
            da: 'selvevalueringsresultater, metoderevision, anvendte strukturerede analyseteknikker og kendte begrænsninger',
            no: 'selvvurderingsskår, metoderevisjon, brukte strukturerte analyseteknikker og kjente begrensninger',
            fi: 'itsearviointipisteet, metodologian auditointi, käytetyt strukturoidut analyysitekniikat ja tunnetut rajoitukset',
            de: 'Selbsteinschätzungs-Scores, Methodologie-Audit, eingesetzte strukturierte Analysetechniken und bekannte Einschränkungen',
            fr: "scores d'auto-évaluation, audit méthodologique, techniques analytiques structurées utilisées et limitations connues",
            es: 'puntuaciones de autoevaluación, auditoría metodológica, técnicas analíticas estructuradas utilizadas y limitaciones conocidas',
            nl: 'zelfevaluatiescores, methodologie-audit, gebruikte gestructureerde analytische technieken en bekende beperkingen',
            ar: 'درجات التقييم الذاتي، تدقيق المنهجية، تقنيات التحليل المنظمة المستخدمة، والقيود المعروفة',
            he: 'ציוני הערכה עצמית, ביקורת מתודולוגית, טכניקות אנליטיות מובנות שנעשה בהן שימוש ומגבלות ידועות',
            ja: '自己評価スコア、方法論監査、使用された構造化分析技法、および既知の制約',
            ko: '자가 평가 점수, 방법론 감사, 사용된 구조화된 분석 기법 및 알려진 한계',
            zh: '自我评估分数、方法论审计、使用的结构化分析技术和已知限制',
        },
    },
};
/* ─── Section icons ─────────────────────────────────────────────── */
/** Visual icons for each reader guide section to improve scannability. */
const SECTION_ICONS = {
    'section-executive-brief': '📋',
    'section-synthesis': '🔗',
    'section-significance': '⚖️',
    'section-actors-forces': '🎭',
    'section-coalitions-voting': '🤝',
    'section-stakeholder-map': '👥',
    'section-economic-context': '💶',
    'section-risk': '⚠️',
    'section-threat': '🛡️',
    'section-scenarios': '🔮',
    'section-forward-projection': '🔭',
    'section-electoral-arc': '🗳️',
    'section-pestle-context': '🌍',
    'section-continuity': '🔁',
    'section-extended-intel': '🧠',
    'section-mcp-reliability': '📡',
    'section-quality-reflection': '🪞',
};
/**
 * Look up the visual icon for a known article section.
 *
 * Exposed so the article-level Table-of-Contents (`buildArticleToc`)
 * can render the same emoji that the Reader Intelligence Guide uses
 * for each section, keeping the two navigation surfaces visually
 * consistent. Unknown section IDs (e.g. ad-hoc `supplementary-…` or
 * appendix anchors) fall back to a generic 📎 paperclip.
 *
 * @param sectionId - Anchor id of the section (e.g. `section-risk`)
 * @returns Single emoji glyph used as a `guide-icon`
 */
export function getReaderGuideSectionIcon(sectionId) {
    return SECTION_ICONS[sectionId] ?? '📎';
}
/* ─── HTML builder ───────────────────────────────────────────────── */
/**
 * Build a translated Reader Intelligence Guide as an HTML section.
 * Emits exactly one component with `data-component="reader-intelligence-guide"`
 * for de-duplication detection by E2E tests.
 *
 * The guide renders one row per emitted article section that has a
 * curated reader-need translation (see {@link READER_GUIDE_ROWS}). The
 * `included` list is no longer surfaced — the previous "source artifact"
 * column duplicated the per-section navigation that the Analysis Index
 * appendix already presents, and clutters the headline reader lens. The
 * parameter is kept on the signature for backward compatibility with
 * callers that may pre-compute the run manifest.
 *
 * @param lang - Target language code
 * @param sections - Emitted section TOC entries, in document order
 * @param _included - (Unused) Included artifacts; kept for API stability
 * @returns HTML fragment for the guide, or empty string if no rows match
 */
export function buildReaderIntelligenceGuideHtml(lang, sections, _included = []) {
    const dir = getTextDirection(lang);
    const rows = [];
    for (const section of sections) {
        const rowData = Object.getOwnPropertyDescriptor(READER_GUIDE_ROWS, section.id)?.value;
        if (!rowData)
            continue;
        const need = getLocalizedString(rowData.need, lang);
        const value = getLocalizedString(rowData.value, lang);
        const sectionIcon = getReaderGuideSectionIcon(section.id);
        rows.push(`<tr><td><span class="guide-icon" aria-hidden="true">${sectionIcon}</span> <a href="#${escapeHTML(section.id)}">${escapeHTML(need)}</a></td><td>${escapeHTML(value)}</td></tr>`);
    }
    if (rows.length === 0)
        return '';
    const title = getLocalizedString(READER_GUIDE_TITLE_LABELS, lang);
    const intro = getLocalizedString(READER_GUIDE_INTRO_LABELS, lang);
    const colNeed = getLocalizedString(READER_GUIDE_COL_NEED_LABELS, lang);
    const colValue = getLocalizedString(READER_GUIDE_COL_VALUE_LABELS, lang);
    return `<section id="${READER_GUIDE_SECTION_ID}" data-component="reader-intelligence-guide" aria-label="${escapeHTML(title)}"${dir === 'rtl' ? ' dir="rtl"' : ''}>
<h2 id="${READER_GUIDE_SECTION_ID}-heading"><span class="guide-icon" aria-hidden="true">🧭</span> ${escapeHTML(title)}</h2>
<p class="reader-guide-intro">${escapeHTML(intro)}</p>
<div class="table-scroll" role="region" tabindex="0" aria-labelledby="${READER_GUIDE_SECTION_ID}-heading">
<table class="reader-guide-table">
<caption class="sr-only">${escapeHTML(title)}</caption>
<thead><tr><th scope="col">${escapeHTML(colNeed)}</th><th scope="col">${escapeHTML(colValue)}</th></tr></thead>
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
export function stripInlineReaderGuide(html) {
    // Match from the H2 opening with the reader-intelligence-guide id to just before the next H2 or end
    const pattern = /<h2[^>]*id=["']reader-intelligence-guide["'][^>]*>[\s\S]*?(?=<h2[ >]|<section[ >]|$)/gi;
    return html.replace(pattern, '');
}
//# sourceMappingURL=reader-intelligence-guide.js.map