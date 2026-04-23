// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/PoliticalIntelligenceDescriptions
 * @description Curated per-file descriptions for the political-intelligence
 * index page. Replaces the fragile first-paragraph extraction from Markdown
 * source files (which leaked document-owner metadata and `---` separators
 * into the rendered UI) with hand-written, high-quality descriptions keyed
 * by the repository-relative file path.
 *
 * Each entry ships with:
 * - a **canonical English description** (`description`) used as the fallback
 *   for every language that has no override;
 * - an optional **per-language overlay** (`i18n`) mapping a subset of the 14
 *   supported language codes to a localized rendering of the same meaning.
 *
 * Unmapped files fall back to a generic localized phrase built from the
 * file's display title — see {@link getGenericFallback}.
 */

import type { LanguageCode } from '../types/index.js';

/** Per-language description overlay keyed by 2-letter language code. */
export type DescriptionI18n = Partial<Record<LanguageCode, string>>;

/** One curated entry for a methodology / template / reference file. */
export interface CuratedDescription {
  /** Canonical English description. */
  readonly description: string;
  /** Optional per-language overrides. English fallback is used for missing keys. */
  readonly i18n?: DescriptionI18n;
}

/**
 * Curated descriptions keyed by the repository-relative file path.
 * Descriptions are concise (≤ ~220 chars), factual, and describe the
 * methodology / template's *purpose* — not its metadata block.
 *
 * Where a per-language translation is not provided, readers see the
 * English canonical description. The localized "source materials are in
 * English" note at the top of the page acknowledges this.
 */
export const CURATED_DESCRIPTIONS: Readonly<Record<string, CuratedDescription>> = {
  // ========================================================================
  // Methodologies
  // ========================================================================
  'analysis/methodologies/README.md': {
    description:
      'Index of every analytical tradecraft guide used by EU Parliament Monitor — the entry point for the full methodology library.',
    i18n: {
      sv: 'Index över varje analytisk tradecraft-guide som används av EU Parliament Monitor — ingången till hela metodologibiblioteket.',
      da: 'Indeks over hver analytisk tradecraft-guide brugt af EU Parliament Monitor — indgangen til hele metodebiblioteket.',
      no: 'Indeks over hver analytisk tradecraft-guide brukt av EU Parliament Monitor — inngangen til hele metodebiblioteket.',
      fi: 'Luettelo jokaisesta EU Parliament Monitorin käyttämästä analyyttisestä tradecraft-oppaasta — koko metodologiakirjaston sisäänkäynti.',
      de: 'Index jeder analytischen Tradecraft-Anleitung, die EU Parliament Monitor verwendet — der Einstieg in die gesamte Methodologie-Bibliothek.',
      fr: 'Index de chaque guide de savoir-faire analytique utilisé par EU Parliament Monitor — le point d’entrée de la bibliothèque complète de méthodologies.',
      es: 'Índice de cada guía de oficio analítico utilizada por EU Parliament Monitor — punto de entrada a toda la biblioteca de metodologías.',
      nl: 'Index van elke analytische vakgids die EU Parliament Monitor gebruikt — het startpunt voor de volledige methodologiebibliotheek.',
      ar: 'فهرس كل دليل حرفي تحليلي يستخدمه مرصد البرلمان الأوروبي — نقطة الدخول إلى مكتبة المنهجيات الكاملة.',
      he: 'אינדקס של כל מדריך מלאכה אנליטי שבו משתמש EU Parliament Monitor — שער הכניסה לספריית המתודולוגיות המלאה.',
      ja: 'EU Parliament Monitor が使用するすべての分析トレードクラフトガイドの目次 — 方法論ライブラリ全体への入口。',
      ko: 'EU Parliament Monitor가 사용하는 모든 분석 트레이드크래프트 가이드의 색인 — 전체 방법론 라이브러리의 진입점.',
      zh: 'EU Parliament Monitor 使用的每一份分析工艺指南的索引 — 进入完整方法论库的入口。',
    },
  },
  'analysis/methodologies/ai-driven-analysis-guide.md': {
    description:
      'The canonical 10-step AI-driven analysis protocol followed by every agentic workflow — Rules 1–22 plus Step 10.5 methodology reflection, with positive voice and colour-coded Mermaid diagrams.',
    i18n: {
      sv: 'Det kanoniska 10-stegs AI-drivna analysprotokollet som följs av alla agentiska arbetsflöden — Regler 1–22 plus Steg 10.5 metodologireflektion, med positivt tonläge och färgkodade Mermaid-diagram.',
      da: 'Den kanoniske 10-trins AI-drevne analyseprotokol, som alle agentiske arbejdsgange følger — Regler 1-22 plus Trin 10.5 metoderefleksion, med positivt tonefald og farvekodede Mermaid-diagrammer.',
      no: 'Den kanoniske 10-stegs AI-drevne analyseprotokollen som alle agentiske arbeidsflyter følger — Regler 1-22 pluss Steg 10.5 metoderefleksjon, med positiv tone og fargekodede Mermaid-diagrammer.',
      fi: 'Kanoninen 10-vaiheinen tekoälypohjainen analyysiprotokolla, jota jokainen agenttinen työnkulku noudattaa — säännöt 1–22 ja vaihe 10.5 metodologian reflektio, myönteinen sävy ja väri­koodatut Mermaid-kaaviot.',
      de: 'Das kanonische 10-Schritt-KI-gesteuerte Analyseprotokoll, dem jeder agentische Workflow folgt — Regeln 1–22 plus Schritt 10.5 Methodologie-Reflexion, mit positiver Tonlage und farbcodierten Mermaid-Diagrammen.',
      fr: 'Le protocole canonique d’analyse pilotée par IA en 10 étapes suivi par chaque workflow agentique — Règles 1–22 plus Étape 10.5 de réflexion méthodologique, avec voix positive et diagrammes Mermaid codés par couleur.',
      es: 'El protocolo canónico de análisis impulsado por IA en 10 pasos que sigue cada flujo de trabajo agéntico — Reglas 1–22 más Paso 10.5 de reflexión metodológica, con voz positiva y diagramas Mermaid codificados por color.',
      nl: 'Het canonieke 10-staps AI-gedreven analyseprotocol dat elke agentische workflow volgt — Regels 1–22 plus Stap 10.5 methodologiereflectie, met positieve toon en kleurgecodeerde Mermaid-diagrammen.',
      ar: 'بروتوكول التحليل الكنسي المدفوع بالذكاء الاصطناعي من 10 خطوات الذي تتبعه كل سير عمل وكيلي — القواعد 1–22 والخطوة 10.5 للتأمل المنهجي، بنبرة إيجابية ومخططات Mermaid مرمزة بالألوان.',
      he: 'הפרוטוקול הקנוני בן 10 השלבים לניתוח מבוסס בינה מלאכותית שכל זרימת עבודה אג׳נטית עוקבת אחריו — חוקים 1–22 ושלב 10.5 להתבוננות מתודולוגית, בטון חיובי ותרשימי Mermaid מקודדים בצבע.',
      ja: 'すべてのエージェント型ワークフローが従う正典的な 10 ステップ AI 駆動分析プロトコル — ルール 1〜22 とステップ 10.5 の方法論的振り返りを、肯定的な語調と色分け Mermaid 図で提供。',
      ko: '모든 에이전트 워크플로가 따르는 표준 10단계 AI 기반 분석 프로토콜 — 규칙 1–22 및 단계 10.5 방법론 성찰을 긍정적 어조와 색상 코드 Mermaid 다이어그램으로 제공.',
      zh: '所有代理式工作流遵循的权威 10 步 AI 驱动分析协议 — 规则 1–22 及第 10.5 步方法论反思，采用积极语气和彩色编码的 Mermaid 图表。',
    },
  },
  'analysis/methodologies/artifact-catalog.md': {
    description:
      'Master catalog of the 39 analysis artifacts produced by every article-generating workflow — mapping each artifact to its methodology, template, depth floor, and Mermaid diagram type.',
    i18n: {
      sv: 'Huvudkatalog över de 39 analysartefakter som varje artikelgenererande arbetsflöde producerar — kopplar varje artefakt till metodologi, mall, djupgolv och Mermaid-diagramtyp.',
      de: 'Hauptkatalog der 39 Analyse-Artefakte, die von jedem artikelerzeugenden Workflow produziert werden — ordnet jedes Artefakt seiner Methodologie, Vorlage, Tiefenuntergrenze und Mermaid-Diagrammart zu.',
      fr: 'Catalogue maître des 39 artefacts d’analyse produits par chaque workflow générateur d’articles — associant chaque artefact à sa méthodologie, son modèle, son seuil de profondeur et son type de diagramme Mermaid.',
      es: 'Catálogo maestro de los 39 artefactos de análisis producidos por cada flujo de trabajo generador de artículos — mapea cada artefacto con su metodología, plantilla, umbral de profundidad y tipo de diagrama Mermaid.',
      ja: '記事生成ワークフローが生成する 39 の分析成果物のマスターカタログ — 各成果物を方法論・テンプレート・深さ下限・Mermaid 図タイプにマッピング。',
      ko: '모든 기사 생성 워크플로가 생성하는 39개 분석 산출물의 마스터 카탈로그 — 각 산출물을 방법론·템플릿·깊이 하한·Mermaid 다이어그램 유형에 매핑.',
      zh: '每个生成文章的工作流产生的 39 个分析产物的主目录 — 将每个产物映射到其方法论、模板、深度下限和 Mermaid 图表类型。',
    },
  },
  'analysis/methodologies/electoral-domain-methodology.md': {
    description:
      'Methodology for EU-wide electoral analysis — forecasting, coalition mathematics at the EP (361-seat threshold) and member-state level, and voter-segmentation frameworks.',
    i18n: {
      sv: 'Metodologi för EU-omfattande valanalys — prognoser, koalitionsmatematik vid EP-tröskeln på 361 platser och på medlemsstatsnivå, samt ramverk för väljarsegmentering.',
      de: 'Methodologie für EU-weite Wahlanalysen — Prognosen, Koalitionsmathematik an der 361-Sitze-Schwelle des EP und auf Mitgliedstaatsebene sowie Wählersegmentierungs-Rahmenwerke.',
      fr: 'Méthodologie pour l’analyse électorale à l’échelle de l’UE — prévisions, mathématiques de coalition au seuil de 361 sièges du PE et au niveau des États membres, et cadres de segmentation des électeurs.',
      es: 'Metodología para análisis electoral a escala de la UE — pronósticos, matemáticas de coalición en el umbral de 361 escaños del PE y a nivel de Estados miembros, y marcos de segmentación de votantes.',
      ja: 'EU 全域の選挙分析の方法論 — 予測、EP の 361 議席閾値および加盟国レベルでの連立数学、有権者セグメンテーション枠組み。',
      ko: 'EU 전역 선거 분석 방법론 — 예측, 유럽의회 361석 임계값 및 회원국 차원의 연정 수학, 유권자 세분화 프레임워크.',
      zh: '欧盟范围选举分析方法论 — 预测、欧洲议会 361 席阈值及成员国层面的联盟数学，以及选民分群框架。',
    },
  },
  'analysis/methodologies/imf-indicator-mapping.md': {
    description:
      'Canonical mapping of IMF WEO, Fiscal Monitor, IFS, BOP, ER and PCPS indicators to European Parliament Monitor article types — the primary source for economic, monetary, fiscal, trade and FDI context.',
    i18n: {
      sv: 'Kanonisk mappning av IMF:s indikatorer (WEO, Fiscal Monitor, IFS, BOP, ER, PCPS) till artikeltyper i EU Parliament Monitor — den primära källan för ekonomisk, monetär, finanspolitisk, handels- och FDI-kontext.',
      de: 'Kanonische Zuordnung der IWF-Indikatoren (WEO, Fiscal Monitor, IFS, BOP, ER, PCPS) zu Artikeltypen von EU Parliament Monitor — die primäre Quelle für wirtschaftlichen, monetären, fiskalischen, Handels- und FDI-Kontext.',
      fr: 'Mise en correspondance canonique des indicateurs du FMI (WEO, Fiscal Monitor, IFS, BOP, ER, PCPS) avec les types d’articles d’EU Parliament Monitor — source principale pour le contexte économique, monétaire, budgétaire, commercial et IDE.',
      es: 'Mapeo canónico de los indicadores del FMI (WEO, Fiscal Monitor, IFS, BOP, ER, PCPS) a los tipos de artículos de EU Parliament Monitor — fuente principal para contexto económico, monetario, fiscal, comercial y de IED.',
      ja: 'IMF 指標（WEO、Fiscal Monitor、IFS、BOP、ER、PCPS）を EU Parliament Monitor の記事種別にマッピングする正典参照 — 経済・金融・財政・貿易・FDI 文脈の主要データ源。',
      ko: 'IMF 지표(WEO, Fiscal Monitor, IFS, BOP, ER, PCPS)를 EU Parliament Monitor 기사 유형에 매핑하는 표준 참조 — 경제·통화·재정·무역·외국인직접투자 맥락의 주요 출처.',
      zh: '将 IMF 指标（WEO、Fiscal Monitor、IFS、BOP、ER、PCPS）映射到 EU Parliament Monitor 文章类型的权威参考 — 经济、货币、财政、贸易和 FDI 背景的主要数据源。',
    },
  },
  'analysis/methodologies/osint-tradecraft-standards.md': {
    description:
      'OSINT / INTOP tradecraft standards for EP political intelligence — source evaluation, attribution, verification, analytic-confidence grading, and GDPR-compliant collection.',
    i18n: {
      sv: 'OSINT/INTOP-tradecraft-standarder för politisk underrättelse om EP — källutvärdering, attribuering, verifiering, analytisk tillförlitlighetsklassificering och GDPR-efterlevande insamling.',
      de: 'OSINT-/INTOP-Handwerksstandards für politische Aufklärung zum EP — Quellenbewertung, Attribution, Verifikation, analytische Konfidenz­bewertung und DSGVO-konforme Erhebung.',
      fr: 'Normes de savoir-faire OSINT/INTOP pour le renseignement politique du PE — évaluation des sources, attribution, vérification, notation de confiance analytique et collecte conforme au RGPD.',
      es: 'Estándares de tradecraft OSINT/INTOP para inteligencia política del PE — evaluación de fuentes, atribución, verificación, clasificación de confianza analítica y recolección conforme al RGPD.',
      ja: 'EP 政治情報向け OSINT/INTOP トレードクラフト基準 — 情報源評価、帰属、検証、分析信頼度格付け、GDPR 準拠の収集。',
      ko: 'EP 정치 정보를 위한 OSINT/INTOP 전문 기법 표준 — 출처 평가, 귀속, 검증, 분석 신뢰도 등급, GDPR 준수 수집.',
      zh: '用于欧洲议会政治情报的 OSINT/INTOP 专业标准 — 信息源评估、归因、验证、分析可信度分级以及符合 GDPR 的收集。',
    },
  },
  'analysis/methodologies/per-artifact-methodologies.md': {
    description:
      'Per-artifact methodology notes — 34 sections, one per artifact type, with construction rules, quality signals, and line-count floors enforced at Stage C.',
    i18n: {
      sv: 'Metodnoteringar per artefakt — 34 avsnitt, ett per artefakttyp, med konstruktions­regler, kvalitetssignaler och radgolv som upprätthålls i steg C.',
      de: 'Methodologische Hinweise pro Artefakt — 34 Abschnitte, einer je Artefakttyp, mit Konstruktionsregeln, Qualitätssignalen und Zeilen-Untergrenzen, die in Stufe C durchgesetzt werden.',
      fr: 'Notes méthodologiques par artefact — 34 sections, une par type d’artefact, avec règles de construction, signaux de qualité et planchers de lignes appliqués à l’étape C.',
      es: 'Notas metodológicas por artefacto — 34 secciones, una por tipo de artefacto, con reglas de construcción, señales de calidad y pisos de líneas aplicados en la Etapa C.',
      ja: 'アーティファクトごとの方法論ノート — アーティファクト種別ごとに 34 セクション、構築ルール・品質シグナル・ステージ C で強制される行数下限を収録。',
      ko: '산출물별 방법론 노트 — 산출물 유형마다 34개 섹션, 구성 규칙·품질 신호·스테이지 C에서 강제되는 줄 수 하한 포함.',
      zh: '按产物划分的方法论说明 — 每种产物类型 34 个章节，附构建规则、质量信号以及在 C 阶段强制执行的行数下限。',
    },
  },
  'analysis/methodologies/per-document-methodology.md': {
    description:
      'Atomic evidence-layer methodology: document-level guidance for extracting, annotating, scoring and contextualising individual EP documents (reports, motions, votes, committee minutes).',
    i18n: {
      sv: 'Atomär bevislagersmetodik: dokumentnivåvägledning för att extrahera, annotera, poängsätta och kontextualisera enskilda EP-dokument (rapporter, motioner, röster, utskottsprotokoll).',
      de: 'Methodologie für die atomare Evidenz­ebene: Dokumentebene-Leitlinien zur Extraktion, Annotation, Bewertung und Kontextualisierung einzelner EP-Dokumente (Berichte, Anträge, Abstimmungen, Ausschussprotokolle).',
      fr: 'Méthodologie de la couche d’éléments atomiques : orientations au niveau du document pour extraire, annoter, noter et contextualiser chaque document du PE (rapports, motions, votes, procès-verbaux de commission).',
      es: 'Metodología de la capa de evidencia atómica: orientación a nivel de documento para extraer, anotar, puntuar y contextualizar documentos individuales del PE (informes, mociones, votos, actas de comisión).',
      ja: '原子的エビデンス層の方法論：個別の EP 文書（報告、動議、投票、委員会議事録）を抽出・注釈・採点・文脈化するための文書単位ガイダンス。',
      ko: '원자적 증거 계층 방법론: 개별 EP 문서(보고서, 동의안, 표결, 위원회 회의록)를 추출·주석·평가·맥락화하기 위한 문서 수준 지침.',
      zh: '原子证据层方法论：用于提取、标注、评分并将单个 EP 文件（报告、动议、投票、委员会纪要）置于语境中的文档级指导。',
    },
  },
  'analysis/methodologies/political-classification-guide.md': {
    description:
      'Political classification taxonomy for the European Parliament — actors, stances, risk surfaces and information-security classification applied to every analyzed artifact.',
    i18n: {
      sv: 'Taxonomi för politisk klassificering av Europaparlamentet — aktörer, hållningar, riskytor och informationssäkerhets­klassificering som tillämpas på varje analyserad artefakt.',
      de: 'Taxonomie der politischen Klassifikation für das Europäische Parlament — Akteure, Positionen, Risikoflächen und Informationssicherheits­klassifikation, angewandt auf jedes analysierte Artefakt.',
      fr: 'Taxonomie de classification politique pour le Parlement européen — acteurs, positions, surfaces de risque et classification en sécurité de l’information appliquées à chaque artefact analysé.',
      es: 'Taxonomía de clasificación política para el Parlamento Europeo — actores, posturas, superficies de riesgo y clasificación de seguridad de la información aplicadas a cada artefacto analizado.',
      ja: '欧州議会向けの政治分類分類法 — アクター、立場、リスク面、情報セキュリティ分類を、分析対象のすべての成果物に適用。',
      ko: '유럽의회를 위한 정치 분류 체계 — 모든 분석 산출물에 적용되는 행위자, 입장, 위험 표면, 정보보안 분류.',
      zh: '面向欧洲议会的政治分类法 — 对每个被分析的产物应用的行为者、立场、风险面与信息安全分类。',
    },
  },
  'analysis/methodologies/political-risk-methodology.md': {
    description:
      'Quantitative 5×5 Likelihood × Impact political-risk scoring adapted from the Hack23 ISMS — applied to coalition, policy, budget, institutional and geopolitical risks in the European Parliament.',
    i18n: {
      sv: 'Kvantitativ 5×5 sannolikhets × konsekvens-poängsättning av politisk risk anpassad från Hack23 ISMS — tillämpad på koalitions-, policy-, budget-, institutionella och geopolitiska risker i Europaparlamentet.',
      da: 'Kvantitativ 5×5 sandsynlighed × konsekvens-scoring af politisk risiko tilpasset Hack23 ISMS — anvendt på koalitions-, politik-, budget-, institutionelle og geopolitiske risici i Europa-Parlamentet.',
      de: 'Quantitative 5×5-Wahrscheinlichkeits × Auswirkungs-Bewertung politischer Risiken, angepasst aus dem Hack23-ISMS — angewandt auf Koalitions-, Politik-, Haushalts-, institutionelle und geopolitische Risiken im Europäischen Parlament.',
      fr: 'Notation quantitative 5×5 Probabilité × Impact des risques politiques adaptée du SMSI Hack23 — appliquée aux risques de coalition, politiques, budgétaires, institutionnels et géopolitiques au Parlement européen.',
      es: 'Puntuación cuantitativa 5×5 Probabilidad × Impacto de riesgo político adaptada del ISMS de Hack23 — aplicada a riesgos de coalición, política, presupuesto, institucionales y geopolíticos en el Parlamento Europeo.',
      nl: 'Kwantitatieve 5×5 Waarschijnlijkheid × Impact-scoring van politieke risico’s, overgenomen uit het Hack23-ISMS — toegepast op coalitie-, beleids-, budget-, institutionele en geopolitieke risico’s in het Europees Parlement.',
      ja: 'Hack23 ISMS を転用した政治リスクの定量 5×5 可能性×影響スコアリング — 欧州議会における連立・政策・予算・制度・地政学リスクに適用。',
      ko: 'Hack23 ISMS를 차용한 정치 위험의 정량적 5×5 가능성×영향 점수화 — 유럽의회의 연정·정책·예산·제도·지정학 위험에 적용.',
      zh: '源自 Hack23 ISMS 的政治风险定量 5×5 可能性 × 影响评分 — 应用于欧洲议会的联盟、政策、预算、制度与地缘政治风险。',
    },
  },
  'analysis/methodologies/political-style-guide.md': {
    description:
      'Editorial and political style guide — The Economist-inspired tone, balance, attribution rules, Mermaid diagram conventions, and multi-language considerations across all 14 supported languages.',
    i18n: {
      sv: 'Redaktionell och politisk stilguide — The Economist-inspirerad ton, balans, attribueringsregler, Mermaid-diagram­konventioner och övervägande för alla 14 språk.',
      de: 'Redaktioneller und politischer Styleguide — vom Economist inspirierter Ton, Ausgewogenheit, Attributionsregeln, Mermaid-Diagramm­konventionen und Überlegungen zu allen 14 Sprachen.',
      fr: 'Guide éditorial et politique — ton inspiré de The Economist, équilibre, règles d’attribution, conventions de diagrammes Mermaid et considérations multilingues pour les 14 langues.',
      es: 'Guía editorial y política — tono inspirado en The Economist, equilibrio, reglas de atribución, convenciones de diagramas Mermaid y consideraciones multilingües para los 14 idiomas.',
      ja: '編集・政治スタイルガイド — The Economist に触発された語調・バランス・帰属ルール・Mermaid 図の規約、および 14 言語すべての多言語考慮事項。',
      ko: '편집 및 정치 스타일 가이드 — The Economist 영감의 어조·균형·귀속 규칙·Mermaid 다이어그램 관례와 14개 언어 전반의 다국어 고려사항.',
      zh: '编辑与政治文风指南 — 受《经济学人》启发的语气、平衡性、归因规则、Mermaid 图表约定以及对全部 14 种语言的多语言考量。',
    },
  },
  'analysis/methodologies/political-swot-framework.md': {
    description:
      'SWOT framework adapted for EU political actors, coalitions and policy positions — with quantitative weighting, TOWS strategy generation, and ≥ 80-word depth floors per quadrant item.',
    i18n: {
      sv: 'SWOT-ramverk anpassat för EU:s politiska aktörer, koalitioner och politikpositioner — med kvantitativ viktning, TOWS-strategigenerering och ≥ 80 ord per kvadrantobjekt.',
      de: 'Für politische EU-Akteure, Koalitionen und Politikpositionen adaptiertes SWOT-Rahmenwerk — mit quantitativer Gewichtung, TOWS-Strategie­generierung und ≥ 80-Wörter-Tiefenuntergrenzen pro Quadrantenpunkt.',
      fr: 'Cadre SWOT adapté aux acteurs politiques, coalitions et positions de l’UE — avec pondération quantitative, génération de stratégies TOWS et planchers de profondeur de ≥ 80 mots par item de quadrant.',
      es: 'Marco SWOT adaptado a actores políticos, coaliciones y posiciones de política de la UE — con ponderación cuantitativa, generación de estrategias TOWS y pisos de profundidad de ≥ 80 palabras por ítem de cuadrante.',
      ja: 'EU の政治アクター・連立・政策立場向けに調整された SWOT 枠組み — 定量的ウェイト、TOWS 戦略生成、象限項目ごとの 80 語以上の深さ下限を伴う。',
      ko: 'EU의 정치 행위자·연정·정책 입장에 맞춘 SWOT 프레임워크 — 정량 가중치, TOWS 전략 생성, 사분면 항목당 80단어 이상 깊이 하한 포함.',
      zh: '为欧盟政治行为者、联盟与政策立场调整的 SWOT 框架 — 含定量权重、TOWS 策略生成，以及每个象限项目 ≥ 80 词的深度下限。',
    },
  },
  'analysis/methodologies/political-threat-framework.md': {
    description:
      'Six-dimension democratic-threat framework for the European Parliament — institutional, procedural, information, coalition, external-interference and geopolitical threats with STRIDE-style enumeration.',
    i18n: {
      sv: 'Sexdimensionellt ramverk för demokratiska hot mot Europaparlamentet — institutionella, procedurella, informations-, koalitions-, externa inblandnings- och geopolitiska hot med STRIDE-liknande uppräkning.',
      de: 'Sechsdimensionales Rahmenwerk für demokratische Bedrohungen des Europäischen Parlaments — institutionelle, verfahrenstechnische, informationelle, Koalitions-, externe Einflussnahme- und geopolitische Bedrohungen mit STRIDE-artiger Aufzählung.',
      fr: 'Cadre de menaces démocratiques à six dimensions pour le Parlement européen — menaces institutionnelles, procédurales, informationnelles, de coalition, d’ingérence externe et géopolitiques, avec énumération de type STRIDE.',
      es: 'Marco de amenazas democráticas de seis dimensiones para el Parlamento Europeo — amenazas institucionales, procedimentales, informativas, de coalición, de injerencia externa y geopolíticas, con enumeración estilo STRIDE.',
      ja: '欧州議会の民主的脅威のための 6 次元フレームワーク — 制度・手続・情報・連立・対外干渉・地政学的脅威を STRIDE 型で列挙。',
      ko: '유럽의회를 위한 6차원 민주적 위협 프레임워크 — 제도·절차·정보·연정·외부 개입·지정학적 위협을 STRIDE 방식으로 열거.',
      zh: '用于欧洲议会的六维民主威胁框架 — 以 STRIDE 风格列举制度、程序、信息、联盟、外部干预与地缘政治威胁。',
    },
  },
  'analysis/methodologies/strategic-extensions-methodology.md': {
    description:
      'Strategic extensions to the core methodologies — scenario planning, devil’s-advocate analysis, wildcards and black swans, long-horizon forecasting and cross-run synthesis.',
    i18n: {
      sv: 'Strategiska utvidgningar av kärnmetodikerna — scenarioplanering, djävulens-advokat-analys, jokrar och svarta svanar, långhorisontsprognoser och tvärkörningssyntes.',
      de: 'Strategische Erweiterungen der Kernmethodologien — Szenarienplanung, Devil’s-Advocate-Analyse, Wildcards und Schwarze Schwäne, Langzeitprognosen und Cross-Run-Synthese.',
      fr: 'Extensions stratégiques des méthodologies centrales — planification de scénarios, analyse avocat du diable, jokers et cygnes noirs, prévisions à long horizon et synthèse entre exécutions.',
      es: 'Extensiones estratégicas de las metodologías principales — planificación de escenarios, análisis de abogado del diablo, comodines y cisnes negros, pronósticos a largo plazo y síntesis entre ejecuciones.',
      ja: 'コア方法論への戦略的拡張 — シナリオ計画、悪魔の代弁者分析、ワイルドカードとブラックスワン、長期予測、ラン横断シンセシス。',
      ko: '핵심 방법론의 전략적 확장 — 시나리오 기획, 악마의 변호인 분석, 와일드카드와 블랙스완, 장기 예측, 런 간 시너지스.',
      zh: '核心方法论的战略扩展 — 情景规划、魔鬼代言人分析、通配牌与黑天鹅、长视野预测以及跨运行综合。',
    },
  },
  'analysis/methodologies/structural-metadata-methodology.md': {
    description:
      'Methodology for structural metadata extraction, provenance tracking and cross-linkage of every EP document type — enabling reproducible analytics and GDPR Article 30 compliance.',
    i18n: {
      sv: 'Metodologi för extraktion av strukturell metadata, proveniensspårning och korslänkning av varje EP-dokumenttyp — möjliggör reproducerbar analys och efterlevnad av GDPR artikel 30.',
      de: 'Methodologie zur Extraktion struktureller Metadaten, Provenienz­verfolgung und Querverknüpfung jedes EP-Dokumenttyps — ermöglicht reproduzierbare Analytik und Einhaltung von DSGVO Art. 30.',
      fr: 'Méthodologie d’extraction des métadonnées structurelles, de traçabilité de la provenance et d’inter-liaison de chaque type de document du PE — permettant des analyses reproductibles et la conformité à l’article 30 du RGPD.',
      es: 'Metodología para extracción de metadatos estructurales, trazabilidad de procedencia e interrelación de cada tipo de documento del PE — permite análisis reproducibles y cumplimiento del artículo 30 del RGPD.',
      ja: 'あらゆる EP 文書タイプの構造的メタデータ抽出・来歴追跡・相互リンクの方法論 — 再現可能な分析と GDPR 第 30 条遵守を実現。',
      ko: '모든 EP 문서 유형의 구조적 메타데이터 추출·출처 추적·상호 연결 방법론 — 재현 가능한 분석과 GDPR 제30조 준수를 가능하게 함.',
      zh: '对每种 EP 文件类型进行结构化元数据提取、来源追踪与交叉链接的方法论 — 实现可复现的分析及 GDPR 第 30 条合规。',
    },
  },
  'analysis/methodologies/synthesis-methodology.md': {
    description:
      'Synthesis & scoring methodology — combines multiple artifacts into cohesive intelligence products with significance scoring, confidence grading and cross-reference integrity checks.',
    i18n: {
      sv: 'Syntes- och poängsättningsmetodik — kombinerar flera artefakter till sammanhängande underrättelseprodukter med betydelsepoäng, tillförlitlighets­klassificering och kontroller av korsreferens­integritet.',
      de: 'Synthese- und Bewertungs­methodologie — kombiniert mehrere Artefakte zu kohärenten Intelligence-Produkten mit Signifikanz-Scoring, Konfidenz­bewertung und Querverweis-Integritätsprüfungen.',
      fr: 'Méthodologie de synthèse et de notation — combine plusieurs artefacts en produits de renseignement cohérents avec notation de signification, classement de confiance et vérifications d’intégrité des références croisées.',
      es: 'Metodología de síntesis y puntuación — combina múltiples artefactos en productos de inteligencia coherentes con puntuación de significancia, gradación de confianza y verificaciones de integridad de referencias cruzadas.',
      ja: '統合・採点の方法論 — 複数の成果物を、重要度スコアリング、信頼度格付け、相互参照整合性チェックを備えた一貫したインテリジェンス製品に統合。',
      ko: '종합 및 점수 매김 방법론 — 중요도 채점·신뢰도 등급·상호참조 무결성 점검을 통해 여러 산출물을 일관된 정보 제품으로 결합.',
      zh: '综合与评分方法论 — 通过重要性评分、可信度分级以及交叉引用完整性检查，将多个产物整合为连贯的情报产品。',
    },
  },
  'analysis/methodologies/worldbank-indicator-mapping.md': {
    description:
      'Mapping of non-economic World Bank Open Data indicators to EU Parliament Monitor article types — covering health, education, social, environment, demographics, governance and innovation.',
    i18n: {
      sv: 'Mappning av icke-ekonomiska indikatorer från Världsbankens öppna data till artikeltyper i EU Parliament Monitor — hälsa, utbildning, socialt, miljö, demografi, styrning och innovation.',
      de: 'Zuordnung nicht-ökonomischer Indikatoren der Weltbank-Offene-Daten zu Artikeltypen von EU Parliament Monitor — Gesundheit, Bildung, Soziales, Umwelt, Demografie, Governance und Innovation.',
      fr: 'Mise en correspondance des indicateurs non économiques des données ouvertes de la Banque mondiale avec les types d’articles d’EU Parliament Monitor — santé, éducation, social, environnement, démographie, gouvernance et innovation.',
      es: 'Mapeo de indicadores no económicos del Banco Mundial Open Data a los tipos de artículos de EU Parliament Monitor — salud, educación, social, medioambiente, demografía, gobernanza e innovación.',
      ja: '世界銀行の非経済オープンデータ指標を EU Parliament Monitor 記事種別にマッピング — 保健、教育、社会、環境、人口動態、ガバナンス、イノベーションを網羅。',
      ko: '세계은행 비경제 공개 데이터 지표를 EU Parliament Monitor 기사 유형에 매핑 — 보건, 교육, 사회, 환경, 인구, 거버넌스, 혁신 포함.',
      zh: '将世界银行非经济开放数据指标映射到 EU Parliament Monitor 文章类型 — 涵盖健康、教育、社会、环境、人口、治理与创新。',
    },
  },

  // ========================================================================
  // Templates
  // ========================================================================
  'analysis/templates/README.md': {
    description:
      'Index of the 39 analysis artifact templates — 6 framework templates, 14 agentic-workflow templates, and 25 per-artifact templates used in every daily analysis run.',
  },
  'analysis/templates/actor-mapping.md': {
    description:
      'Actor mapping template — at least 12 named EP actors with quantified influence weights, committee seats, roll-call alignment and alliance footprints.',
  },
  'analysis/templates/actor-threat-profiles.md': {
    description:
      'Actor threat profiles — Diamond-Model analysis of political actors (capabilities, infrastructure, victims, adversary relationships) applied to EP politics.',
  },
  'analysis/templates/analysis-index.md': {
    description:
      'Master run-artifact navigator — indexes every artifact produced during an article-generating workflow, with cross-links to methodology, templates and source data.',
  },
  'analysis/templates/coalition-dynamics.md': {
    description:
      'Coalition dynamics template — group cohesion rates, alliance pairs, defection patterns and fragmentation index across EP political groups.',
  },
  'analysis/templates/coalition-mathematics.md': {
    description:
      'Coalition mathematics — seat arithmetic, blocking minorities and majority-feasibility scenarios against the EP 361-seat threshold.',
  },
  'analysis/templates/comparative-international.md': {
    description:
      'Comparative international template — places EP political events in international context against member states, the US, UK and other peer jurisdictions.',
  },
  'analysis/templates/consequence-trees.md': {
    description:
      'Multi-level consequence tree template — first-order, second-order and third-order political consequences of each identified threat.',
  },
  'analysis/templates/cross-reference-map.md': {
    description:
      'Cross-reference map — document-to-document relationship graph showing how evidence flows through every artifact in a run for claim-provenance auditability.',
  },
  'analysis/templates/cross-run-diff.md': {
    description:
      'Cross-run Bayesian delta analysis — compares the current run to previous runs of the same article type, exposing new signals, reversals and analytical drift.',
  },
  'analysis/templates/cross-session-intelligence.md': {
    description:
      'Cross-session intelligence — plenary-session progression view linking developments across consecutive EP sessions.',
  },
  'analysis/templates/data-download-manifest.md': {
    description:
      'Data download manifest — logs every EP MCP tool call and external-data retrieval during a workflow run for reproducibility and GDPR Article 30 compliance.',
  },
  'analysis/templates/deep-analysis.md': {
    description:
      'Deep political analysis template — long-form Economist-style narrative with ≥ 60% prose ratio, Chart.js visualisations and rigorous per-section evidence citations.',
  },
  'analysis/templates/devils-advocate-analysis.md': {
    description:
      'Devil’s-advocate template — Analysis of Competing Hypotheses (ACH) stress-testing dominant interpretations with the strongest counter-arguments.',
  },
  'analysis/templates/economic-context.md': {
    description:
      'Economic context template — anchors article narratives with IMF (primary) and World Bank (supporting) data: GDP, inflation, fiscal balance, trade, FDI.',
  },
  'analysis/templates/executive-brief.md': {
    description:
      'Executive brief — concise 2-page decision-maker summary with top findings, risks and recommendations for every published article.',
  },
  'analysis/templates/forces-analysis.md': {
    description:
      'Lewin force-field analysis for EP politics — enumerates driving and restraining forces on each proposed policy or coalition change.',
  },
  'analysis/templates/forward-indicators.md': {
    description:
      'Forward indicators template — signals worth monitoring over the coming days and weeks, with trigger thresholds and expected impact.',
  },
  'analysis/templates/historical-baseline.md': {
    description:
      'Historical baseline template — metric trending and anchoring across the current EP term and comparable past terms.',
  },
  'analysis/templates/historical-parallels.md': {
    description:
      'Historical parallels template — draws on 20+ years of EP data to surface comparable precedents and their outcomes.',
  },
  'analysis/templates/impact-matrix.md': {
    description:
      'Impact matrix — event × stakeholder grid quantifying positive/negative impact on each affected EP or member-state constituency.',
  },
  'analysis/templates/implementation-feasibility.md': {
    description:
      'Implementation feasibility template — assesses whether proposed EP policies can realistically be delivered, covering legal, budgetary and operational constraints.',
  },
  'analysis/templates/intelligence-assessment.md': {
    description:
      'Full intelligence assessment template — judgements, confidence levels, knowledge gaps and dissenting views for each analyzed event.',
  },
  'analysis/templates/legislative-disruption.md': {
    description:
      'Legislative disruption template — adversarial procedure-level threats: filibusters, amendment storms, quorum-busting and committee-chair manoeuvring.',
  },
  'analysis/templates/legislative-velocity-risk.md': {
    description:
      'Legislative velocity risk — pipeline throughput and deadline exposure: stalled procedures, trilogue delays and mandate-expiry risk.',
  },
  'analysis/templates/mcp-reliability-audit.md': {
    description:
      'MCP reliability audit — endpoint health and uptime report for every European Parliament MCP tool invocation during a workflow run.',
  },
  'analysis/templates/media-framing-analysis.md': {
    description:
      'Media framing analysis — maps how narratives spread across outlets and languages, comparing national-media framings of EP events.',
  },
  'analysis/templates/methodology-reflection.md': {
    description:
      'Methodology reflection template — the final Step 10.5 artifact capturing lessons learned, protocol gaps and continuous-improvement notes for each run.',
  },
  'analysis/templates/per-file-political-intelligence.md': {
    description:
      'Per-file political intelligence template — annotates individual EP documents (reports, motions, votes) with structured intelligence findings.',
  },
  'analysis/templates/pestle-analysis.md': {
    description:
      'PESTLE analysis template — Political, Economic, Social, Technological, Legal, Environmental factors shaping the analyzed EP event.',
  },
  'analysis/templates/political-capital-risk.md': {
    description:
      'Political capital risk template — named-actor capital exposure: reputational, coalition, electoral and personal political capital at stake.',
  },
  'analysis/templates/political-classification.md': {
    description:
      'Political event classification — applies the classification taxonomy to the current artifact with actor tags, stance scores and risk flags.',
  },
  'analysis/templates/political-threat-landscape.md': {
    description:
      'Six-dimension democratic threat view — applied threat landscape for the analyzed EP event across all six threat categories.',
  },
  'analysis/templates/quantitative-swot.md': {
    description:
      'Quantitative SWOT + TOWS template — numeric-weight SWOT items with derived TOWS strategy matrix (SO, ST, WO, WT).',
  },
  'analysis/templates/reference-analysis-quality.md': {
    description:
      'Reference quality self-score — benchmarks each cited source against the platform’s reference-quality thresholds (primary/secondary/tertiary + IMF/WB coverage).',
  },
  'analysis/templates/risk-assessment.md': {
    description:
      'Political risk assessment — enumerated risks with 5×5 Likelihood × Impact scoring, mitigations, residual risk and monitoring indicators.',
  },
  'analysis/templates/risk-matrix.md': {
    description:
      '5×5 Likelihood × Impact political risk grid — visual heatmap placing every enumerated risk for the analyzed EP event.',
  },
  'analysis/templates/scenario-forecast.md': {
    description:
      'Scenario forecast template — 3–5 probability-weighted futures with drivers, indicators and decision points for EP policy paths.',
  },
  'analysis/templates/session-baseline.md': {
    description:
      'Session baseline template — plenary calendar and adopted-texts roster capturing the starting state for an article workflow run.',
  },
  'analysis/templates/significance-classification.md': {
    description:
      'Significance classification — 5-dimension rubric (institutional, policy, electoral, media, international) for ranking the analyzed event.',
  },
  'analysis/templates/significance-scoring.md': {
    description:
      'Political significance scoring — numerical rank of artifacts by political and societal importance, used to prioritise article coverage.',
  },
  'analysis/templates/stakeholder-impact.md': {
    description:
      'Stakeholder impact assessment — maps affected groups (citizens, industry, member states, institutions) and their expected consequences with ≥ 150-word perspectives.',
  },
  'analysis/templates/stakeholder-map.md': {
    description:
      'Stakeholder map — Power × Alignment grid of actors around the analyzed EP issue, identifying supporters, opponents and swing players.',
  },
  'analysis/templates/swot-analysis.md': {
    description:
      'Classic SWOT-analysis template customised for EP actors and policies — Strengths, Weaknesses, Opportunities, Threats with ≥ 80 words per quadrant item.',
  },
  'analysis/templates/synthesis-summary.md': {
    description:
      'Political intelligence synthesis — consolidates every artifact in a run into a single cohesive intelligence product with bottom-line-up-front judgements.',
  },
  'analysis/templates/threat-analysis.md': {
    description:
      'Political threat landscape analysis — identifies adversaries, tactics, techniques, procedures (TTPs) and political-threat surfaces with defence priorities.',
  },
  'analysis/templates/threat-model.md': {
    description:
      'Threat model template — democratic and institutional threat analysis using STRIDE-style enumeration over the EP trust boundary.',
  },
  'analysis/templates/voter-segmentation.md': {
    description:
      'Voter segmentation template — models EU-wide constituencies, demographics and behavioural clusters relevant to the analyzed policy area.',
  },
  'analysis/templates/voting-patterns.md': {
    description:
      'Voting patterns template — EP roll-call analysis across political groups, national delegations and coalition configurations.',
  },
  'analysis/templates/wildcards-blackswans.md': {
    description:
      'Wildcards & black swans — low-probability, high-impact events that could disrupt the baseline EP forecast, with early-warning indicators.',
  },
  'analysis/templates/workflow-audit.md': {
    description:
      'Workflow audit — agentic-run self-assessment covering every step, tool call, artifact produced and Stage A–D completeness gate.',
  },

  // ========================================================================
  // Reference / ISMS adaptations
  // ========================================================================
  'analysis/reference/isms-classification-adaptation.md': {
    description:
      'Adaptation of the Hack23 ISMS information-classification scheme (Public, Internal, Confidential, Restricted) to EU political intelligence artifacts.',
  },
  'analysis/reference/isms-risk-assessment-adaptation.md': {
    description:
      'Adaptation of the Hack23 ISMS risk-assessment methodology to EU political risk — reuses the 5×5 Likelihood × Impact matrix on coalition, policy and institutional risks.',
  },
  'analysis/reference/isms-style-guide-adaptation.md': {
    description:
      'Adaptation of the Hack23 ISMS documentation style guide to EU political intelligence writing — structure, tone, citation and multi-language conventions.',
  },
  'analysis/reference/isms-threat-modeling-adaptation.md': {
    description:
      'Adaptation of the Hack23 ISMS threat-modelling methodology to EU political threats — STRIDE-style enumeration over EP institutional trust boundaries.',
  },

  // ========================================================================
  // IMF data pipeline
  // ========================================================================
  'analysis/imf/README.md': {
    description:
      'IMF data integration overview — how EU Parliament Monitor consumes the IMF SDMX 3.0 REST API via a native TypeScript client for economic, fiscal and monetary context.',
  },
  'analysis/imf/chart-integration-guide.md': {
    description:
      'IMF chart integration guide — how to render IMF indicator series as Chart.js visualisations embedded in EU Parliament Monitor articles.',
  },
  'analysis/imf/eu-country-mapping.md': {
    description:
      'IMF country and aggregation codelist — maps every EU-27 member state plus EU/EA aggregates to their canonical IMF 3-letter country codes.',
  },
  'analysis/imf/indicator-catalog.md': {
    description:
      'Complete IMF indicator catalog — every WEO, Fiscal Monitor, IFS, BOP, ER and PCPS series available to article workflows, keyed to article-type policies.',
  },
  'analysis/imf/use-cases.md': {
    description:
      'IMF data use cases — worked examples showing how to anchor breaking, week-ahead, committee-report and proposition articles in IMF economic data.',
  },

  // ========================================================================
  // World Bank data pipeline
  // ========================================================================
  'analysis/worldbank/README.md': {
    description:
      'World Bank indicator integration overview — how EU Parliament Monitor consumes the worldbank-mcp server for non-economic development indicators.',
  },
  'analysis/worldbank/chart-integration-guide.md': {
    description:
      'Chart integration guide for World Bank data in EU Parliament Monitor articles — accessible Chart.js rendering with WCAG 2.1 AA contrast and SR labels.',
  },
  'analysis/worldbank/eu-country-mapping.md': {
    description:
      'EU-27 → World Bank country-code mapping plus a guard for aggregate codes (EUU, EMU, ECS, OED, WLD) that the worldbank-mcp 1.0.1 server rejects.',
  },
  'analysis/worldbank/indicator-catalog.md': {
    description:
      'Complete World Bank indicator reference — every non-economic indicator (health, education, social, environment, demographics, governance, innovation) keyed to article types.',
  },
  'analysis/worldbank/use-cases.md': {
    description:
      'World Bank indicator use cases — worked examples showing how to weave non-economic World Bank data into EP article narratives.',
  },
};

/**
 * Per-language localized generic fallback phrase. The placeholder `{title}`
 * is replaced with the file's display title; `{kind}` is replaced with a
 * localized kind word (methodology / template / reference).
 *
 * This is what readers see when a file ships without a curated description
 * (e.g. a brand-new methodology added after this table was last updated).
 */
const GENERIC_FALLBACK_I18N: Record<LanguageCode, string> = {
  en: 'Reference {kind} in the EU Parliament Monitor analysis library.',
  sv: 'Referens{kind} i EU Parliament Monitors analysbibliotek.',
  da: 'Reference-{kind} i EU Parliament Monitors analysebibliotek.',
  no: 'Referanse-{kind} i EU Parliament Monitors analysebibliotek.',
  fi: 'Viite{kind} EU Parliament Monitorin analyysikirjastossa.',
  de: 'Referenz-{kind} in der EU-Parliament-Monitor-Analysebibliothek.',
  fr: '{kind} de référence dans la bibliothèque d’analyse EU Parliament Monitor.',
  es: '{kind} de referencia en la biblioteca de análisis EU Parliament Monitor.',
  nl: 'Referentie-{kind} in de analysebibliotheek van EU Parliament Monitor.',
  ar: '{kind} مرجعية في مكتبة تحليل EU Parliament Monitor.',
  he: '{kind} ייחוס בספריית הניתוחים של EU Parliament Monitor.',
  ja: 'EU Parliament Monitor 分析ライブラリの参照{kind}。',
  ko: 'EU Parliament Monitor 분석 라이브러리의 참조 {kind}.',
  zh: 'EU Parliament Monitor 分析库中的参考{kind}。',
};

/** Per-language word for "methodology". */
const KIND_WORDS_METHODOLOGY: Record<LanguageCode, string> = {
  en: 'methodology',
  sv: 'metodologi',
  da: 'metode',
  no: 'metodikk',
  fi: 'metodologia',
  de: 'Methodologie',
  fr: 'méthodologie',
  es: 'metodología',
  nl: 'methodologie',
  ar: 'منهجية',
  he: 'מתודולוגיה',
  ja: '方法論',
  ko: '방법론',
  zh: '方法论',
};

/** Per-language word for "template". */
const KIND_WORDS_TEMPLATE: Record<LanguageCode, string> = {
  en: 'template',
  sv: 'mall',
  da: 'skabelon',
  no: 'mal',
  fi: 'malli',
  de: 'Vorlage',
  fr: 'modèle',
  es: 'plantilla',
  nl: 'sjabloon',
  ar: 'قالب',
  he: 'תבנית',
  ja: 'テンプレート',
  ko: '템플릿',
  zh: '模板',
};

/** Per-language word for "reference". */
const KIND_WORDS_REFERENCE: Record<LanguageCode, string> = {
  en: 'reference',
  sv: 'referens',
  da: 'reference',
  no: 'referanse',
  fi: 'viite',
  de: 'Referenz',
  fr: 'référence',
  es: 'referencia',
  nl: 'referentie',
  ar: 'مرجع',
  he: 'ייחוס',
  ja: '参照資料',
  ko: '참조 자료',
  zh: '参考资料',
};

/**
 * Infer a kind ("methodology" / "template" / "reference") from the
 * repository-relative path.
 *
 * @param relPath - Repository-relative Markdown path
 * @returns The inferred kind; falls back to `'reference'` when the path
 *   does not match a `/methodologies/` or `/templates/` directory
 */
function inferKind(relPath: string): 'methodology' | 'template' | 'reference' {
  if (relPath.includes('/methodologies/')) return 'methodology';
  if (relPath.includes('/templates/')) return 'template';
  return 'reference';
}

/**
 * Resolve the localized kind word for a given path and language.
 *
 * @param relPath - Repository-relative Markdown path
 * @param lang    - Target language code
 * @returns Localized kind word (e.g. `'methodology'`, `'mall'`, `'템플릿'`)
 */
function kindWord(relPath: string, lang: LanguageCode): string {
  const kind = inferKind(relPath);
  if (kind === 'methodology') return getFromRecord(KIND_WORDS_METHODOLOGY, lang);
  if (kind === 'template') return getFromRecord(KIND_WORDS_TEMPLATE, lang);
  return getFromRecord(KIND_WORDS_REFERENCE, lang);
}

/**
 * Look up a value in a {@link Record} keyed by {@link LanguageCode}, falling
 * back to the English entry if the requested language is not present.
 * Uses a small allowlist pattern to satisfy `security/detect-object-injection`.
 *
 * @param record - Lookup table keyed by language code
 * @param lang   - Language code to resolve (or `'en'` fallback)
 * @returns The resolved string (never empty for well-formed records)
 */
function getFromRecord<T extends Record<LanguageCode, string>>(record: T, lang: LanguageCode): string {
  // eslint-disable-next-line security/detect-object-injection
  return record[lang] ?? record.en;
}

/**
 * Build the localized generic fallback sentence for a file the curated
 * table does not know about.
 *
 * @param relPath - Repo-relative path to the Markdown file
 * @param lang    - Target language
 * @returns Fully localized description sentence
 */
function buildGenericFallback(relPath: string, lang: LanguageCode): string {
  // eslint-disable-next-line security/detect-object-injection
  const template = GENERIC_FALLBACK_I18N[lang] ?? GENERIC_FALLBACK_I18N.en;
  const kind = kindWord(relPath, lang);
  return template.replace('{kind}', kind);
}

/**
 * Resolve the best description for a given methodology / template / reference
 * file and language.
 *
 * Lookup priority:
 * 1. Curated per-language description (`CURATED_DESCRIPTIONS[relPath].i18n[lang]`)
 * 2. Curated English canonical description (`CURATED_DESCRIPTIONS[relPath].description`)
 * 3. Localized generic fallback ("reference template in the analysis library")
 *
 * @param relPath - Repository-relative file path (e.g. `analysis/methodologies/ai-driven-analysis-guide.md`)
 * @param lang    - Target language code
 * @returns A non-empty description string
 */
export function getCuratedDescription(relPath: string, lang: LanguageCode): string {
  // Normalise path separators so Windows callers don't silently miss entries.
  const key = relPath.replace(/\\/g, '/');
  // eslint-disable-next-line security/detect-object-injection
  const entry = CURATED_DESCRIPTIONS[key];
  if (entry) {
    // eslint-disable-next-line security/detect-object-injection
    const localized = entry.i18n?.[lang];
    if (localized) return localized;
    return entry.description;
  }
  return buildGenericFallback(key, lang);
}

/**
 * Whether the curated table has an explicit entry (curated English
 * description) for this path — used by tests and by the generator to detect
 * newly-added analysis files that still need a curated entry.
 *
 * @param relPath - Repository-relative file path
 * @returns `true` when the curated table contains the file
 */
export function hasCuratedDescription(relPath: string): boolean {
  // eslint-disable-next-line security/detect-object-injection
  return Object.prototype.hasOwnProperty.call(CURATED_DESCRIPTIONS, relPath.replace(/\\/g, '/'));
}
