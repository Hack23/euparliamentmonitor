// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/PoliticalIntelligence/Descriptions/Methodologies
 * @description Curated descriptions for `analysis/methodologies/*.md` files.
 * Per-file editorial copy with 14-language overlays for the political-
 * intelligence landing-page cards. Split out of the monolithic
 * `political-intelligence-descriptions.ts` (Refactor 8/8).
 */

import type { CuratedDescription } from './types.js';

export const METHODOLOGY_DESCRIPTIONS: Readonly<Record<string, CuratedDescription>> = {
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
  'analysis/methodologies/analytical-supplementary-methodology.md': {
    description:
      'Optional deep-dive methodology — PESTLE, Wildcards, SWOT scoring, and Media Framing v2.0.',
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
};
