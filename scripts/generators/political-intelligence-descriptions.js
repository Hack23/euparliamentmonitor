// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * Curated descriptions keyed by the repository-relative file path.
 * Descriptions are concise (≤ ~220 chars), factual, and describe the
 * methodology / template's *purpose* — not its metadata block.
 *
 * Where a per-language translation is not provided, readers see the
 * English canonical description. The localized "source materials are in
 * English" note at the top of the page acknowledges this.
 */
export const CURATED_DESCRIPTIONS = {
    // ========================================================================
    // Methodologies
    // ========================================================================
    'analysis/methodologies/README.md': {
        description: 'Index of every analytical tradecraft guide used by EU Parliament Monitor — the entry point for the full methodology library.',
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
        description: 'The canonical 10-step AI-driven analysis protocol followed by every agentic workflow — Rules 1–22 plus Step 10.5 methodology reflection, with positive voice and colour-coded Mermaid diagrams.',
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
        description: 'Master catalog of the 39 analysis artifacts produced by every article-generating workflow — mapping each artifact to its methodology, template, depth floor, and Mermaid diagram type.',
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
        description: 'Methodology for EU-wide electoral analysis — forecasting, coalition mathematics at the EP (361-seat threshold) and member-state level, and voter-segmentation frameworks.',
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
        description: 'Canonical mapping of IMF WEO, Fiscal Monitor, IFS, BOP, ER and PCPS indicators to European Parliament Monitor article types — the primary source for economic, monetary, fiscal, trade and FDI context.',
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
        description: 'OSINT / INTOP tradecraft standards for EP political intelligence — source evaluation, attribution, verification, analytic-confidence grading, and GDPR-compliant collection.',
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
        description: 'Per-artifact methodology notes — 34 sections, one per artifact type, with construction rules, quality signals, and line-count floors enforced at Stage C.',
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
        description: 'Atomic evidence-layer methodology: document-level guidance for extracting, annotating, scoring and contextualising individual EP documents (reports, motions, votes, committee minutes).',
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
        description: 'Political classification taxonomy for the European Parliament — actors, stances, risk surfaces and information-security classification applied to every analyzed artifact.',
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
        description: 'Quantitative 5×5 Likelihood × Impact political-risk scoring adapted from the Hack23 ISMS — applied to coalition, policy, budget, institutional and geopolitical risks in the European Parliament.',
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
        description: 'Editorial and political style guide — The Economist-inspired tone, balance, attribution rules, Mermaid diagram conventions, and multi-language considerations across all 14 supported languages.',
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
        description: 'SWOT framework adapted for EU political actors, coalitions and policy positions — with quantitative weighting, TOWS strategy generation, and ≥ 80-word depth floors per quadrant item.',
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
        description: 'Six-dimension democratic-threat framework for the European Parliament — institutional, procedural, information, coalition, external-interference and geopolitical threats with STRIDE-style enumeration.',
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
        description: 'Strategic extensions to the core methodologies — scenario planning, devil’s-advocate analysis, wildcards and black swans, long-horizon forecasting and cross-run synthesis.',
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
        description: 'Methodology for structural metadata extraction, provenance tracking and cross-linkage of every EP document type — enabling reproducible analytics and GDPR Article 30 compliance.',
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
        description: 'Synthesis & scoring methodology — combines multiple artifacts into cohesive intelligence products with significance scoring, confidence grading and cross-reference integrity checks.',
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
        description: 'Mapping of non-economic World Bank Open Data indicators to EU Parliament Monitor article types — covering health, education, social, environment, demographics, governance and innovation.',
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
        description: 'Index of the 39 analysis artifact templates — 6 framework templates, 14 agentic-workflow templates, and 25 per-artifact templates used in every daily analysis run.',
    },
    'analysis/templates/actor-mapping.md': {
        description: 'Actor mapping template — at least 12 named EP actors with quantified influence weights, committee seats, roll-call alignment and alliance footprints.',
    },
    'analysis/templates/actor-threat-profiles.md': {
        description: 'Actor threat profiles — Diamond-Model analysis of political actors (capabilities, infrastructure, victims, adversary relationships) applied to EP politics.',
    },
    'analysis/templates/analysis-index.md': {
        description: 'Master run-artifact navigator — indexes every artifact produced during an article-generating workflow, with cross-links to methodology, templates and source data.',
    },
    'analysis/templates/coalition-dynamics.md': {
        description: 'Coalition dynamics template — group cohesion rates, alliance pairs, defection patterns and fragmentation index across EP political groups.',
    },
    'analysis/templates/coalition-mathematics.md': {
        description: 'Coalition mathematics — seat arithmetic, blocking minorities and majority-feasibility scenarios against the EP 361-seat threshold.',
    },
    'analysis/templates/comparative-international.md': {
        description: 'Comparative international template — places EP political events in international context against member states, the US, UK and other peer jurisdictions.',
    },
    'analysis/templates/consequence-trees.md': {
        description: 'Multi-level consequence tree template — first-order, second-order and third-order political consequences of each identified threat.',
    },
    'analysis/templates/cross-reference-map.md': {
        description: 'Cross-reference map — document-to-document relationship graph showing how evidence flows through every artifact in a run for claim-provenance auditability.',
    },
    'analysis/templates/cross-run-diff.md': {
        description: 'Cross-run Bayesian delta analysis — compares the current run to previous runs of the same article type, exposing new signals, reversals and analytical drift.',
    },
    'analysis/templates/cross-session-intelligence.md': {
        description: 'Cross-session intelligence — plenary-session progression view linking developments across consecutive EP sessions.',
    },
    'analysis/templates/data-download-manifest.md': {
        description: 'Data download manifest — logs every EP MCP tool call and external-data retrieval during a workflow run for reproducibility and GDPR Article 30 compliance.',
    },
    'analysis/templates/deep-analysis.md': {
        description: 'Deep political analysis template — long-form Economist-style narrative with ≥ 60% prose ratio, Chart.js visualisations and rigorous per-section evidence citations.',
    },
    'analysis/templates/devils-advocate-analysis.md': {
        description: 'Devil’s-advocate template — Analysis of Competing Hypotheses (ACH) stress-testing dominant interpretations with the strongest counter-arguments.',
    },
    'analysis/templates/economic-context.md': {
        description: 'Economic context template — anchors article narratives with IMF (primary) and World Bank (supporting) data: GDP, inflation, fiscal balance, trade, FDI.',
    },
    'analysis/templates/executive-brief.md': {
        description: 'Executive brief — concise 2-page decision-maker summary with top findings, risks and recommendations for every published article.',
    },
    'analysis/templates/forces-analysis.md': {
        description: 'Lewin force-field analysis for EP politics — enumerates driving and restraining forces on each proposed policy or coalition change.',
    },
    'analysis/templates/forward-indicators.md': {
        description: 'Forward indicators template — signals worth monitoring over the coming days and weeks, with trigger thresholds and expected impact.',
    },
    'analysis/templates/historical-baseline.md': {
        description: 'Historical baseline template — metric trending and anchoring across the current EP term and comparable past terms.',
    },
    'analysis/templates/historical-parallels.md': {
        description: 'Historical parallels template — draws on 20+ years of EP data to surface comparable precedents and their outcomes.',
    },
    'analysis/templates/impact-matrix.md': {
        description: 'Impact matrix — event × stakeholder grid quantifying positive/negative impact on each affected EP or member-state constituency.',
    },
    'analysis/templates/implementation-feasibility.md': {
        description: 'Implementation feasibility template — assesses whether proposed EP policies can realistically be delivered, covering legal, budgetary and operational constraints.',
    },
    'analysis/templates/intelligence-assessment.md': {
        description: 'Full intelligence assessment template — judgements, confidence levels, knowledge gaps and dissenting views for each analyzed event.',
    },
    'analysis/templates/legislative-disruption.md': {
        description: 'Legislative disruption template — adversarial procedure-level threats: filibusters, amendment storms, quorum-busting and committee-chair manoeuvring.',
    },
    'analysis/templates/legislative-velocity-risk.md': {
        description: 'Legislative velocity risk — pipeline throughput and deadline exposure: stalled procedures, trilogue delays and mandate-expiry risk.',
    },
    'analysis/templates/mcp-reliability-audit.md': {
        description: 'MCP reliability audit — endpoint health and uptime report for every European Parliament MCP tool invocation during a workflow run.',
    },
    'analysis/templates/media-framing-analysis.md': {
        description: 'Media framing analysis — maps how narratives spread across outlets and languages, comparing national-media framings of EP events.',
    },
    'analysis/templates/methodology-reflection.md': {
        description: 'Methodology reflection template — the final Step 10.5 artifact capturing lessons learned, protocol gaps and continuous-improvement notes for each run.',
    },
    'analysis/templates/per-file-political-intelligence.md': {
        description: 'Per-file political intelligence template — annotates individual EP documents (reports, motions, votes) with structured intelligence findings.',
    },
    'analysis/templates/pestle-analysis.md': {
        description: 'PESTLE analysis template — Political, Economic, Social, Technological, Legal, Environmental factors shaping the analyzed EP event.',
    },
    'analysis/templates/political-capital-risk.md': {
        description: 'Political capital risk template — named-actor capital exposure: reputational, coalition, electoral and personal political capital at stake.',
    },
    'analysis/templates/political-classification.md': {
        description: 'Political event classification — applies the classification taxonomy to the current artifact with actor tags, stance scores and risk flags.',
    },
    'analysis/templates/political-threat-landscape.md': {
        description: 'Six-dimension democratic threat view — applied threat landscape for the analyzed EP event across all six threat categories.',
    },
    'analysis/templates/quantitative-swot.md': {
        description: 'Quantitative SWOT + TOWS template — numeric-weight SWOT items with derived TOWS strategy matrix (SO, ST, WO, WT).',
    },
    'analysis/templates/reference-analysis-quality.md': {
        description: 'Reference quality self-score — benchmarks each cited source against the platform’s reference-quality thresholds (primary/secondary/tertiary + IMF/WB coverage).',
    },
    'analysis/templates/risk-assessment.md': {
        description: 'Political risk assessment — enumerated risks with 5×5 Likelihood × Impact scoring, mitigations, residual risk and monitoring indicators.',
    },
    'analysis/templates/risk-matrix.md': {
        description: '5×5 Likelihood × Impact political risk grid — visual heatmap placing every enumerated risk for the analyzed EP event.',
    },
    'analysis/templates/scenario-forecast.md': {
        description: 'Scenario forecast template — 3–5 probability-weighted futures with drivers, indicators and decision points for EP policy paths.',
    },
    'analysis/templates/session-baseline.md': {
        description: 'Session baseline template — plenary calendar and adopted-texts roster capturing the starting state for an article workflow run.',
    },
    'analysis/templates/significance-classification.md': {
        description: 'Significance classification — 5-dimension rubric (institutional, policy, electoral, media, international) for ranking the analyzed event.',
    },
    'analysis/templates/significance-scoring.md': {
        description: 'Political significance scoring — numerical rank of artifacts by political and societal importance, used to prioritise article coverage.',
    },
    'analysis/templates/stakeholder-impact.md': {
        description: 'Stakeholder impact assessment — maps affected groups (citizens, industry, member states, institutions) and their expected consequences with ≥ 150-word perspectives.',
    },
    'analysis/templates/stakeholder-map.md': {
        description: 'Stakeholder map — Power × Alignment grid of actors around the analyzed EP issue, identifying supporters, opponents and swing players.',
    },
    'analysis/templates/swot-analysis.md': {
        description: 'Classic SWOT-analysis template customised for EP actors and policies — Strengths, Weaknesses, Opportunities, Threats with ≥ 80 words per quadrant item.',
    },
    'analysis/templates/synthesis-summary.md': {
        description: 'Political intelligence synthesis — consolidates every artifact in a run into a single cohesive intelligence product with bottom-line-up-front judgements.',
    },
    'analysis/templates/threat-analysis.md': {
        description: 'Political threat landscape analysis — identifies adversaries, tactics, techniques, procedures (TTPs) and political-threat surfaces with defence priorities.',
    },
    'analysis/templates/threat-model.md': {
        description: 'Threat model template — democratic and institutional threat analysis using STRIDE-style enumeration over the EP trust boundary.',
    },
    'analysis/templates/voter-segmentation.md': {
        description: 'Voter segmentation template — models EU-wide constituencies, demographics and behavioural clusters relevant to the analyzed policy area.',
    },
    'analysis/templates/voting-patterns.md': {
        description: 'Voting patterns template — EP roll-call analysis across political groups, national delegations and coalition configurations.',
    },
    'analysis/templates/wildcards-blackswans.md': {
        description: 'Wildcards & black swans — low-probability, high-impact events that could disrupt the baseline EP forecast, with early-warning indicators.',
    },
    'analysis/templates/workflow-audit.md': {
        description: 'Workflow audit — agentic-run self-assessment covering every step, tool call, artifact produced and Stage A–D completeness gate.',
    },
    // ========================================================================
    // Reference / ISMS adaptations
    // ========================================================================
    'analysis/reference/isms-classification-adaptation.md': {
        description: 'Adaptation of the Hack23 ISMS information-classification scheme (Public, Internal, Confidential, Restricted) to EU political intelligence artifacts.',
    },
    'analysis/reference/isms-risk-assessment-adaptation.md': {
        description: 'Adaptation of the Hack23 ISMS risk-assessment methodology to EU political risk — reuses the 5×5 Likelihood × Impact matrix on coalition, policy and institutional risks.',
    },
    'analysis/reference/isms-style-guide-adaptation.md': {
        description: 'Adaptation of the Hack23 ISMS documentation style guide to EU political intelligence writing — structure, tone, citation and multi-language conventions.',
    },
    'analysis/reference/isms-threat-modeling-adaptation.md': {
        description: 'Adaptation of the Hack23 ISMS threat-modelling methodology to EU political threats — STRIDE-style enumeration over EP institutional trust boundaries.',
    },
    // ========================================================================
    // IMF data pipeline
    // ========================================================================
    'analysis/imf/README.md': {
        description: 'IMF data integration overview — how EU Parliament Monitor consumes the IMF SDMX 3.0 REST API via a native TypeScript client for economic, fiscal and monetary context.',
    },
    'analysis/imf/chart-integration-guide.md': {
        description: 'IMF chart integration guide — how to render IMF indicator series as Chart.js visualisations embedded in EU Parliament Monitor articles.',
    },
    'analysis/imf/eu-country-mapping.md': {
        description: 'IMF country and aggregation codelist — maps every EU-27 member state plus EU/EA aggregates to their canonical IMF 3-letter country codes.',
    },
    'analysis/imf/indicator-catalog.md': {
        description: 'Complete IMF indicator catalog — every WEO, Fiscal Monitor, IFS, BOP, ER and PCPS series available to article workflows, keyed to article-type policies.',
    },
    'analysis/imf/use-cases.md': {
        description: 'IMF data use cases — worked examples showing how to anchor breaking, week-ahead, committee-report and proposition articles in IMF economic data.',
    },
    // ========================================================================
    // World Bank data pipeline
    // ========================================================================
    'analysis/worldbank/README.md': {
        description: 'World Bank indicator integration overview — how EU Parliament Monitor consumes the worldbank-mcp server for non-economic development indicators.',
    },
    'analysis/worldbank/chart-integration-guide.md': {
        description: 'Chart integration guide for World Bank data in EU Parliament Monitor articles — accessible Chart.js rendering with WCAG 2.1 AA contrast and SR labels.',
    },
    'analysis/worldbank/eu-country-mapping.md': {
        description: 'EU-27 → World Bank country-code mapping plus a guard for aggregate codes (EUU, EMU, ECS, OED, WLD) that the worldbank-mcp 1.0.1 server rejects.',
    },
    'analysis/worldbank/indicator-catalog.md': {
        description: 'Complete World Bank indicator reference — every non-economic indicator (health, education, social, environment, demographics, governance, innovation) keyed to article types.',
    },
    'analysis/worldbank/use-cases.md': {
        description: 'World Bank indicator use cases — worked examples showing how to weave non-economic World Bank data into EP article narratives.',
    },
};
/**
 * Curated per-language **titles** keyed by the repository-relative Markdown
 * path. This table is layered *on top* of {@link CURATED_DESCRIPTIONS} so
 * the main description table stays compact; adding a title for a file does
 * not require touching that entry's description block.
 *
 * Each entry provides a canonical English title (`en`) plus optional
 * overlays in the other 13 supported languages. When a language is missing,
 * {@link getCuratedTitle} falls back to the English entry, and when the
 * entire path is missing from this table it falls back to the H1 extracted
 * from the source Markdown by the generator.
 *
 * Titles are kept short (ideally ≤ 60 characters) and free of emoji —
 * emoji comes from `doc.icon` in the card layout, so keeping titles plain
 * improves SEO (`<title>` tag, og:title, twitter:title, JSON-LD BreadcrumbList
 * entries all consume this string).
 */
export const CURATED_TITLES = {
    // ========================================================================
    // Methodologies (17)
    // ========================================================================
    'analysis/methodologies/README.md': {
        en: 'Methodology Library Index',
        sv: 'Metodologibibliotek — index',
        da: 'Metodebibliotek — indeks',
        no: 'Metodebibliotek — indeks',
        fi: 'Metodologiakirjasto — hakemisto',
        de: 'Methodologie-Bibliothek — Index',
        fr: 'Bibliothèque des méthodologies — index',
        es: 'Biblioteca de metodologías — índice',
        nl: 'Methodologiebibliotheek — index',
        ar: 'فهرس مكتبة المنهجيات',
        he: 'אינדקס ספריית המתודולוגיות',
        ja: '方法論ライブラリ索引',
        ko: '방법론 라이브러리 색인',
        zh: '方法论库索引',
    },
    'analysis/methodologies/ai-driven-analysis-guide.md': {
        en: 'AI-Driven Analysis Guide',
        sv: 'AI-driven analysguide',
        da: 'AI-drevet analyseguide',
        no: 'AI-drevet analyseveiledning',
        fi: 'Tekoälypohjainen analyysiopas',
        de: 'KI-gesteuerter Analyseleitfaden',
        fr: 'Guide d’analyse pilotée par IA',
        es: 'Guía de análisis impulsado por IA',
        nl: 'AI-gedreven analysegids',
        ar: 'دليل التحليل المدفوع بالذكاء الاصطناعي',
        he: 'מדריך ניתוח מבוסס בינה מלאכותית',
        ja: 'AI駆動分析ガイド',
        ko: 'AI 기반 분석 가이드',
        zh: 'AI 驱动分析指南',
    },
    'analysis/methodologies/artifact-catalog.md': {
        en: 'Analysis Artifact Catalog',
        sv: 'Katalog över analysartefakter',
        da: 'Katalog over analyseartefakter',
        no: 'Katalog over analyseartefakter',
        fi: 'Analyysiartefaktien luettelo',
        de: 'Katalog der Analyse-Artefakte',
        fr: 'Catalogue des artefacts d’analyse',
        es: 'Catálogo de artefactos de análisis',
        nl: 'Catalogus van analyse-artefacten',
        ar: 'كتالوج القطع التحليلية',
        he: 'קטלוג ארטיפקטי הניתוח',
        ja: '分析成果物カタログ',
        ko: '분석 산출물 카탈로그',
        zh: '分析工件目录',
    },
    'analysis/methodologies/electoral-domain-methodology.md': {
        en: 'Electoral Domain Methodology',
        sv: 'Valdomänmetodologi',
        da: 'Valgdomænemetode',
        no: 'Valgdomenemetodikk',
        fi: 'Vaalialueen metodologia',
        de: 'Wahldomänen-Methodologie',
        fr: 'Méthodologie du domaine électoral',
        es: 'Metodología del dominio electoral',
        nl: 'Methodologie voor het kiesdomein',
        ar: 'منهجية المجال الانتخابي',
        he: 'מתודולוגיית תחום הבחירות',
        ja: '選挙領域方法論',
        ko: '선거 도메인 방법론',
        zh: '选举领域方法论',
    },
    'analysis/methodologies/imf-indicator-mapping.md': {
        en: 'IMF Indicator → Article-Type Mapping',
        sv: 'IMF-indikator → artikeltypmappning',
        da: 'IMF-indikator → artikeltypemapping',
        no: 'IMF-indikator → artikkeltypekobling',
        fi: 'IMF-indikaattori → artikkelityypin kartoitus',
        de: 'IWF-Indikator → Artikeltyp-Zuordnung',
        fr: 'Indicateur FMI → Mappage par type d’article',
        es: 'Indicador del FMI → Asignación por tipo de artículo',
        nl: 'IMF-indicator → toewijzing artikeltype',
        ar: 'مؤشر صندوق النقد الدولي → خريطة نوع المقال',
        he: 'מיפוי מדד קרן המטבע → סוג מאמר',
        ja: 'IMF指標 → 記事タイプマッピング',
        ko: 'IMF 지표 → 기사 유형 매핑',
        zh: 'IMF 指标 → 文章类型映射',
    },
    'analysis/methodologies/osint-tradecraft-standards.md': {
        en: 'OSINT Tradecraft Standards',
        sv: 'OSINT-tradecraft-standarder',
        da: 'OSINT-tradecraft-standarder',
        no: 'OSINT-håndverksstandarder',
        fi: 'OSINT-tradecraft-standardit',
        de: 'OSINT-Tradecraft-Standards',
        fr: 'Normes de savoir-faire OSINT',
        es: 'Estándares de oficio OSINT',
        nl: 'OSINT-vakstandaarden',
        ar: 'معايير حرفة الاستخبارات المفتوحة',
        he: 'תקני מלאכת מודיעין פתוח',
        ja: 'OSINT トレードクラフト標準',
        ko: 'OSINT 트레이드크래프트 표준',
        zh: 'OSINT 情报工艺标准',
    },
    'analysis/methodologies/per-artifact-methodologies.md': {
        en: 'Per-Artifact Methodologies',
        sv: 'Per-artefakt-metodologier',
        da: 'Pr.-artefakt-metoder',
        no: 'Per-artefakt-metodikker',
        fi: 'Artefaktikohtaiset metodologiat',
        de: 'Methodologien pro Artefakt',
        fr: 'Méthodologies par artefact',
        es: 'Metodologías por artefacto',
        nl: 'Methodologieën per artefact',
        ar: 'منهجيات لكل قطعة أثرية',
        he: 'מתודולוגיות לפי ארטיפקט',
        ja: '成果物別方法論',
        ko: '산출물별 방법론',
        zh: '分工件方法论',
    },
    'analysis/methodologies/per-document-methodology.md': {
        en: 'Per-Document Analysis Methodology',
        sv: 'Per-dokument-analysmetodologi',
        da: 'Pr.-dokument analysemetode',
        no: 'Per-dokument analysemetodikk',
        fi: 'Asiakirja­kohtainen analyysimetodologia',
        de: 'Dokumentspezifische Analysemethodologie',
        fr: 'Méthodologie d’analyse par document',
        es: 'Metodología de análisis por documento',
        nl: 'Analysemethodologie per document',
        ar: 'منهجية التحليل لكل وثيقة',
        he: 'מתודולוגיית ניתוח למסמך בודד',
        ja: '文書別分析方法論',
        ko: '문서별 분석 방법론',
        zh: '按文档分析方法论',
    },
    'analysis/methodologies/political-classification-guide.md': {
        en: 'Political Event Classification Guide',
        sv: 'Guide för klassificering av politiska händelser',
        da: 'Vejledning i klassifikation af politiske begivenheder',
        no: 'Veiledning for klassifisering av politiske hendelser',
        fi: 'Poliittisten tapahtumien luokitteluopas',
        de: 'Leitfaden zur Klassifizierung politischer Ereignisse',
        fr: 'Guide de classification des événements politiques',
        es: 'Guía de clasificación de eventos políticos',
        nl: 'Gids voor classificatie van politieke gebeurtenissen',
        ar: 'دليل تصنيف الأحداث السياسية',
        he: 'מדריך סיווג אירועים פוליטיים',
        ja: '政治イベント分類ガイド',
        ko: '정치 이벤트 분류 가이드',
        zh: '政治事件分类指南',
    },
    'analysis/methodologies/political-risk-methodology.md': {
        en: 'Political Risk Methodology',
        sv: 'Politisk riskmetodologi',
        da: 'Politisk risikometode',
        no: 'Politisk risikometodikk',
        fi: 'Poliittisen riskin metodologia',
        de: 'Methodologie für politische Risiken',
        fr: 'Méthodologie des risques politiques',
        es: 'Metodología de riesgos políticos',
        nl: 'Methodologie voor politieke risico’s',
        ar: 'منهجية المخاطر السياسية',
        he: 'מתודולוגיית סיכון פוליטי',
        ja: '政治リスク方法論',
        ko: '정치 리스크 방법론',
        zh: '政治风险方法论',
    },
    'analysis/methodologies/political-style-guide.md': {
        en: 'Political Style Guide',
        sv: 'Politisk stilguide',
        da: 'Politisk stilguide',
        no: 'Politisk stilguide',
        fi: 'Poliittinen tyyliopas',
        de: 'Politischer Stilleitfaden',
        fr: 'Guide de style politique',
        es: 'Guía de estilo político',
        nl: 'Politieke stijlgids',
        ar: 'دليل الأسلوب السياسي',
        he: 'מדריך סגנון פוליטי',
        ja: '政治スタイルガイド',
        ko: '정치 스타일 가이드',
        zh: '政治风格指南',
    },
    'analysis/methodologies/political-swot-framework.md': {
        en: 'Political SWOT Framework',
        sv: 'Politiskt SWOT-ramverk',
        da: 'Politisk SWOT-ramme',
        no: 'Politisk SWOT-rammeverk',
        fi: 'Poliittinen SWOT-viitekehys',
        de: 'Politisches SWOT-Rahmenwerk',
        fr: 'Cadre SWOT politique',
        es: 'Marco SWOT político',
        nl: 'Politiek SWOT-raamwerk',
        ar: 'إطار SWOT السياسي',
        he: 'מסגרת SWOT פוליטית',
        ja: '政治SWOTフレームワーク',
        ko: '정치 SWOT 프레임워크',
        zh: '政治 SWOT 框架',
    },
    'analysis/methodologies/political-threat-framework.md': {
        en: 'Political Threat Framework',
        sv: 'Politiskt hotramverk',
        da: 'Politisk trusselramme',
        no: 'Politisk trusselrammeverk',
        fi: 'Poliittinen uhkaviitekehys',
        de: 'Politisches Bedrohungsrahmenwerk',
        fr: 'Cadre des menaces politiques',
        es: 'Marco de amenazas políticas',
        nl: 'Politiek dreigingsraamwerk',
        ar: 'إطار التهديدات السياسية',
        he: 'מסגרת איומים פוליטיים',
        ja: '政治脅威フレームワーク',
        ko: '정치 위협 프레임워크',
        zh: '政治威胁框架',
    },
    'analysis/methodologies/strategic-extensions-methodology.md': {
        en: 'Strategic Extensions Methodology',
        sv: 'Metodologi för strategiska utvidgningar',
        da: 'Metode for strategiske udvidelser',
        no: 'Metodikk for strategiske utvidelser',
        fi: 'Strategisten laajennusten metodologia',
        de: 'Methodologie strategischer Erweiterungen',
        fr: 'Méthodologie des extensions stratégiques',
        es: 'Metodología de extensiones estratégicas',
        nl: 'Methodologie voor strategische uitbreidingen',
        ar: 'منهجية الامتدادات الاستراتيجية',
        he: 'מתודולוגיית הרחבות אסטרטגיות',
        ja: '戦略的拡張方法論',
        ko: '전략적 확장 방법론',
        zh: '战略扩展方法论',
    },
    'analysis/methodologies/structural-metadata-methodology.md': {
        en: 'Structural Metadata Methodology',
        sv: 'Metodologi för strukturell metadata',
        da: 'Metode for strukturel metadata',
        no: 'Metodikk for strukturell metadata',
        fi: 'Rakenteellisen metatiedon metodologia',
        de: 'Methodologie struktureller Metadaten',
        fr: 'Méthodologie des métadonnées structurelles',
        es: 'Metodología de metadatos estructurales',
        nl: 'Methodologie voor structurele metadata',
        ar: 'منهجية البيانات الوصفية الهيكلية',
        he: 'מתודולוגיית מטא-נתונים מבניים',
        ja: '構造メタデータ方法論',
        ko: '구조 메타데이터 방법론',
        zh: '结构化元数据方法论',
    },
    'analysis/methodologies/synthesis-methodology.md': {
        en: 'Synthesis Methodology',
        sv: 'Syntesmetodologi',
        da: 'Syntesemetode',
        no: 'Syntesemetodikk',
        fi: 'Synteesin metodologia',
        de: 'Synthese-Methodologie',
        fr: 'Méthodologie de synthèse',
        es: 'Metodología de síntesis',
        nl: 'Synthesemethodologie',
        ar: 'منهجية التوليف',
        he: 'מתודולוגיית סינתזה',
        ja: '総合方法論',
        ko: '종합 방법론',
        zh: '综合方法论',
    },
    'analysis/methodologies/worldbank-indicator-mapping.md': {
        en: 'World Bank Indicator → Article-Type Mapping',
        sv: 'Världsbanken-indikator → artikeltypmappning',
        da: 'Verdensbank-indikator → artikeltypemapping',
        no: 'Verdensbank-indikator → artikkeltypekobling',
        fi: 'Maailmanpankin indikaattori → artikkelityypin kartoitus',
        de: 'Weltbank-Indikator → Artikeltyp-Zuordnung',
        fr: 'Indicateur Banque mondiale → Mappage par type d’article',
        es: 'Indicador del Banco Mundial → Asignación por tipo de artículo',
        nl: 'Wereldbank-indicator → toewijzing artikeltype',
        ar: 'مؤشر البنك الدولي → خريطة نوع المقال',
        he: 'מיפוי מדד הבנק העולמי → סוג מאמר',
        ja: '世界銀行指標 → 記事タイプマッピング',
        ko: '세계은행 지표 → 기사 유형 매핑',
        zh: '世界银行指标 → 文章类型映射',
    },
    // ========================================================================
    // Reference — ISMS adaptations (4)
    // ========================================================================
    'analysis/reference/isms-classification-adaptation.md': {
        en: 'ISMS Classification Adaptation',
        sv: 'ISMS-klassificeringsanpassning',
        da: 'ISMS-klassifikationstilpasning',
        no: 'ISMS-klassifiseringstilpasning',
        fi: 'ISMS-luokittelun sovellus',
        de: 'ISMS-Klassifizierungsanpassung',
        fr: 'Adaptation de classification ISMS',
        es: 'Adaptación de clasificación ISMS',
        nl: 'ISMS-classificatieaanpassing',
        ar: 'تكييف تصنيف ISMS',
        he: 'התאמת סיווג ISMS',
        ja: 'ISMS分類適応',
        ko: 'ISMS 분류 적응',
        zh: 'ISMS 分类适配',
    },
    'analysis/reference/isms-risk-assessment-adaptation.md': {
        en: 'ISMS Risk-Assessment Adaptation',
        sv: 'ISMS-riskbedömningsanpassning',
        da: 'ISMS-risikovurderingstilpasning',
        no: 'ISMS-risikovurderingstilpasning',
        fi: 'ISMS-riskiarvioinnin sovellus',
        de: 'ISMS-Risikobewertungsanpassung',
        fr: 'Adaptation d’évaluation des risques ISMS',
        es: 'Adaptación de evaluación de riesgos ISMS',
        nl: 'ISMS-risicobeoordelingsaanpassing',
        ar: 'تكييف تقييم مخاطر ISMS',
        he: 'התאמת הערכת סיכונים ISMS',
        ja: 'ISMSリスク評価適応',
        ko: 'ISMS 리스크 평가 적응',
        zh: 'ISMS 风险评估适配',
    },
    'analysis/reference/isms-style-guide-adaptation.md': {
        en: 'ISMS Style-Guide Adaptation',
        sv: 'ISMS-stilguideanpassning',
        da: 'ISMS-stilguidetilpasning',
        no: 'ISMS-stilveiledningstilpasning',
        fi: 'ISMS-tyylioppaan sovellus',
        de: 'ISMS-Stilleitfaden-Anpassung',
        fr: 'Adaptation du guide de style ISMS',
        es: 'Adaptación de la guía de estilo ISMS',
        nl: 'ISMS-stijlgidsaanpassing',
        ar: 'تكييف دليل أسلوب ISMS',
        he: 'התאמת מדריך סגנון ISMS',
        ja: 'ISMSスタイルガイド適応',
        ko: 'ISMS 스타일 가이드 적응',
        zh: 'ISMS 风格指南适配',
    },
    'analysis/reference/isms-threat-modeling-adaptation.md': {
        en: 'ISMS Threat-Modeling Adaptation',
        sv: 'ISMS-hotmodelleringsanpassning',
        da: 'ISMS-trusselsmodelleringstilpasning',
        no: 'ISMS-trusselmodelleringstilpasning',
        fi: 'ISMS-uhkamallinnuksen sovellus',
        de: 'ISMS-Bedrohungsmodellierungsanpassung',
        fr: 'Adaptation de modélisation des menaces ISMS',
        es: 'Adaptación del modelado de amenazas ISMS',
        nl: 'ISMS-dreigingsmodelleringsaanpassing',
        ar: 'تكييف نمذجة التهديدات ISMS',
        he: 'התאמת מידול איומים ISMS',
        ja: 'ISMS脅威モデリング適応',
        ko: 'ISMS 위협 모델링 적응',
        zh: 'ISMS 威胁建模适配',
    },
    // ========================================================================
    // IMF Data (5)
    // ========================================================================
    'analysis/imf/README.md': {
        en: 'IMF Data Integration — Overview',
        sv: 'IMF-dataintegration — översikt',
        da: 'IMF-dataintegration — oversigt',
        no: 'IMF-dataintegrasjon — oversikt',
        fi: 'IMF-datan integrointi — yleiskatsaus',
        de: 'IWF-Datenintegration — Überblick',
        fr: 'Intégration des données FMI — aperçu',
        es: 'Integración de datos del FMI — visión general',
        nl: 'IMF-data-integratie — overzicht',
        ar: 'دمج بيانات صندوق النقد الدولي — نظرة عامة',
        he: 'שילוב נתוני קרן המטבע — סקירה',
        ja: 'IMFデータ統合 — 概要',
        ko: 'IMF 데이터 통합 — 개요',
        zh: 'IMF 数据集成 — 概览',
    },
    'analysis/imf/chart-integration-guide.md': {
        en: 'IMF Chart Integration Guide',
        sv: 'IMF-diagramintegrationsguide',
        da: 'IMF-diagramintegrationsvejledning',
        no: 'IMF-diagramintegrasjonsveiledning',
        fi: 'IMF-kaavioiden integrointiopas',
        de: 'IWF-Diagrammintegrationsleitfaden',
        fr: 'Guide d’intégration des graphiques FMI',
        es: 'Guía de integración de gráficos del FMI',
        nl: 'IMF-grafiekintegratiegids',
        ar: 'دليل دمج مخططات صندوق النقد الدولي',
        he: 'מדריך שילוב תרשימי קרן המטבע',
        ja: 'IMFチャート統合ガイド',
        ko: 'IMF 차트 통합 가이드',
        zh: 'IMF 图表集成指南',
    },
    'analysis/imf/eu-country-mapping.md': {
        en: 'IMF EU Country & Aggregation Codes',
        sv: 'IMF EU-land- och aggregatkoder',
        da: 'IMF EU-lande- og aggregationskoder',
        no: 'IMF EU-land- og aggregeringskoder',
        fi: 'IMF EU-maa- ja aggregaattikoodit',
        de: 'IWF EU-Länder- und Aggregationscodes',
        fr: 'Codes pays & agrégations FMI UE',
        es: 'Códigos de países y agregaciones FMI UE',
        nl: 'IMF EU-land- en aggregatiecodes',
        ar: 'رموز دول وتجميعات صندوق النقد الدولي للاتحاد الأوروبي',
        he: 'קודי מדינות ואגרגציה של קרן המטבע לאיחוד האירופי',
        ja: 'IMF EU 国・集計コード',
        ko: 'IMF EU 국가 및 집계 코드',
        zh: 'IMF 欧盟国家与聚合代码',
    },
    'analysis/imf/indicator-catalog.md': {
        en: 'IMF Indicator Catalog',
        sv: 'IMF-indikatorkatalog',
        da: 'IMF-indikatorkatalog',
        no: 'IMF-indikatorkatalog',
        fi: 'IMF-indikaattorien luettelo',
        de: 'IWF-Indikatorkatalog',
        fr: 'Catalogue des indicateurs FMI',
        es: 'Catálogo de indicadores del FMI',
        nl: 'IMF-indicatorcatalogus',
        ar: 'كتالوج مؤشرات صندوق النقد الدولي',
        he: 'קטלוג מדדי קרן המטבע',
        ja: 'IMF指標カタログ',
        ko: 'IMF 지표 카탈로그',
        zh: 'IMF 指标目录',
    },
    'analysis/imf/use-cases.md': {
        en: 'IMF Data Use Cases',
        sv: 'Användningsfall för IMF-data',
        da: 'Use cases for IMF-data',
        no: 'Brukstilfeller for IMF-data',
        fi: 'IMF-datan käyttötapaukset',
        de: 'IWF-Daten — Anwendungsfälle',
        fr: 'Cas d’utilisation des données FMI',
        es: 'Casos de uso de datos del FMI',
        nl: 'Gebruiksgevallen voor IMF-data',
        ar: 'حالات استخدام بيانات صندوق النقد الدولي',
        he: 'תרחישי שימוש בנתוני קרן המטבע',
        ja: 'IMFデータのユースケース',
        ko: 'IMF 데이터 활용 사례',
        zh: 'IMF 数据使用案例',
    },
    // ========================================================================
    // World Bank Data (5)
    // ========================================================================
    'analysis/worldbank/README.md': {
        en: 'World Bank Indicator Integration — Overview',
        sv: 'Världsbankens indikatorintegration — översikt',
        da: 'Verdensbankens indikatorintegration — oversigt',
        no: 'Verdensbankens indikatorintegrasjon — oversikt',
        fi: 'Maailmanpankin indikaattorien integrointi — yleiskatsaus',
        de: 'Weltbank-Indikatorintegration — Überblick',
        fr: 'Intégration des indicateurs Banque mondiale — aperçu',
        es: 'Integración de indicadores del Banco Mundial — visión general',
        nl: 'Wereldbank-indicatorintegratie — overzicht',
        ar: 'دمج مؤشرات البنك الدولي — نظرة عامة',
        he: 'שילוב מדדי הבנק העולמי — סקירה',
        ja: '世界銀行指標統合 — 概要',
        ko: '세계은행 지표 통합 — 개요',
        zh: '世界银行指标集成 — 概览',
    },
    'analysis/worldbank/chart-integration-guide.md': {
        en: 'World Bank Chart Integration Guide',
        sv: 'Världsbankens diagramintegrationsguide',
        da: 'Verdensbankens diagramintegrationsvejledning',
        no: 'Verdensbankens diagramintegrasjonsveiledning',
        fi: 'Maailmanpankin kaavioiden integrointiopas',
        de: 'Weltbank-Diagrammintegrationsleitfaden',
        fr: 'Guide d’intégration des graphiques Banque mondiale',
        es: 'Guía de integración de gráficos del Banco Mundial',
        nl: 'Wereldbank-grafiekintegratiegids',
        ar: 'دليل دمج مخططات البنك الدولي',
        he: 'מדריך שילוב תרשימי הבנק העולמי',
        ja: '世界銀行チャート統合ガイド',
        ko: '세계은행 차트 통합 가이드',
        zh: '世界银行图表集成指南',
    },
    'analysis/worldbank/eu-country-mapping.md': {
        en: 'EU-27 → World Bank Country-Code Mapping',
        sv: 'EU-27 → Världsbankens landskodsmappning',
        da: 'EU-27 → Verdensbankens landekodesmapping',
        no: 'EU-27 → Verdensbankens landskodekobling',
        fi: 'EU-27 → Maailmanpankin maakoodien kartoitus',
        de: 'EU-27 → Weltbank-Ländercode-Zuordnung',
        fr: 'EU-27 → Mappage des codes pays Banque mondiale',
        es: 'EU-27 → Asignación de códigos de país del Banco Mundial',
        nl: 'EU-27 → Wereldbank-landcodetoewijzing',
        ar: 'EU-27 → ربط رموز دول البنك الدولي',
        he: 'EU-27 → מיפוי קודי מדינות הבנק העולמי',
        ja: 'EU-27 → 世界銀行国コードマッピング',
        ko: 'EU-27 → 세계은행 국가 코드 매핑',
        zh: 'EU-27 → 世界银行国家代码映射',
    },
    'analysis/worldbank/indicator-catalog.md': {
        en: 'World Bank Indicator Catalog',
        sv: 'Världsbanken-indikatorkatalog',
        da: 'Verdensbank-indikatorkatalog',
        no: 'Verdensbank-indikatorkatalog',
        fi: 'Maailmanpankin indikaattorien luettelo',
        de: 'Weltbank-Indikatorkatalog',
        fr: 'Catalogue des indicateurs Banque mondiale',
        es: 'Catálogo de indicadores del Banco Mundial',
        nl: 'Wereldbank-indicatorcatalogus',
        ar: 'كتالوج مؤشرات البنك الدولي',
        he: 'קטלוג מדדי הבנק העולמי',
        ja: '世界銀行指標カタログ',
        ko: '세계은행 지표 카탈로그',
        zh: '世界银行指标目录',
    },
    'analysis/worldbank/use-cases.md': {
        en: 'World Bank Indicator Use Cases',
        sv: 'Användningsfall för Världsbanken-indikatorer',
        da: 'Use cases for Verdensbank-indikatorer',
        no: 'Brukstilfeller for Verdensbank-indikatorer',
        fi: 'Maailmanpankin indikaattorien käyttötapaukset',
        de: 'Weltbank-Indikatoren — Anwendungsfälle',
        fr: 'Cas d’utilisation des indicateurs Banque mondiale',
        es: 'Casos de uso de indicadores del Banco Mundial',
        nl: 'Gebruiksgevallen voor Wereldbank-indicatoren',
        ar: 'حالات استخدام مؤشرات البنك الدولي',
        he: 'תרחישי שימוש במדדי הבנק העולמי',
        ja: '世界銀行指標のユースケース',
        ko: '세계은행 지표 활용 사례',
        zh: '世界银行指标使用案例',
    },
    // ========================================================================
    // Templates (49) — titles localized; descriptions fall back to
    // the English canonical + localized "kind" fallback sentence.
    // ========================================================================
    'analysis/templates/README.md': {
        en: 'Analysis Template Library Index',
        sv: 'Analysmallbibliotek — index',
        da: 'Analyseskabelonbibliotek — indeks',
        no: 'Analysemalsbibliotek — indeks',
        fi: 'Analyysimallikirjasto — hakemisto',
        de: 'Analyse-Vorlagen-Bibliothek — Index',
        fr: 'Bibliothèque de modèles d’analyse — index',
        es: 'Biblioteca de plantillas de análisis — índice',
        nl: 'Analysesjabloonbibliotheek — index',
        ar: 'فهرس مكتبة قوالب التحليل',
        he: 'אינדקס ספריית תבניות הניתוח',
        ja: '分析テンプレートライブラリ索引',
        ko: '분석 템플릿 라이브러리 색인',
        zh: '分析模板库索引',
    },
    'analysis/templates/actor-mapping.md': {
        en: 'Actor Mapping',
        sv: 'Aktörskartläggning',
        da: 'Aktørmapping',
        no: 'Aktørkartlegging',
        fi: 'Toimijoiden kartoitus',
        de: 'Akteurs-Mapping',
        fr: 'Cartographie des acteurs',
        es: 'Mapeo de actores',
        nl: 'Actor-mapping',
        ar: 'رسم خرائط الفاعلين',
        he: 'מיפוי שחקנים',
        ja: 'アクターマッピング',
        ko: '행위자 매핑',
        zh: '参与者映射',
    },
    'analysis/templates/actor-threat-profiles.md': {
        en: 'Actor Threat Profiles',
        sv: 'Aktörshotprofiler',
        da: 'Aktørtrusselprofiler',
        no: 'Aktørtrusselprofiler',
        fi: 'Toimijoiden uhkaprofiilit',
        de: 'Akteurs-Bedrohungsprofile',
        fr: 'Profils de menace des acteurs',
        es: 'Perfiles de amenaza de actores',
        nl: 'Dreigingsprofielen van actoren',
        ar: 'ملفات تعريف تهديد الفاعلين',
        he: 'פרופילי איום של שחקנים',
        ja: 'アクター脅威プロファイル',
        ko: '행위자 위협 프로필',
        zh: '参与者威胁画像',
    },
    'analysis/templates/analysis-index.md': {
        en: 'Analysis Index (Run Artifact Navigator)',
        sv: 'Analysindex (artefaktnavigator för körning)',
        da: 'Analyseindeks (kørselsartefaktnavigator)',
        no: 'Analyseindeks (kjøringsartefaktnavigator)',
        fi: 'Analyysihakemisto (ajo­artefaktien navigaattori)',
        de: 'Analyseindex (Run-Artefakt-Navigator)',
        fr: 'Index d’analyse (navigateur d’artefacts d’exécution)',
        es: 'Índice de análisis (navegador de artefactos de ejecución)',
        nl: 'Analyse-index (run-artefactnavigator)',
        ar: 'فهرس التحليل (متنقل قطع التشغيل)',
        he: 'אינדקס ניתוח (ניווט ארטיפקטי ריצה)',
        ja: '分析索引(ラン成果物ナビゲータ)',
        ko: '분석 색인(실행 산출물 내비게이터)',
        zh: '分析索引（运行工件导航器）',
    },
    'analysis/templates/coalition-dynamics.md': {
        en: 'Coalition Dynamics',
        sv: 'Koalitionsdynamik',
        da: 'Koalitionsdynamik',
        no: 'Koalisjonsdynamikk',
        fi: 'Koalitiodynamiikka',
        de: 'Koalitionsdynamik',
        fr: 'Dynamique des coalitions',
        es: 'Dinámica de coaliciones',
        nl: 'Coalitiedynamiek',
        ar: 'ديناميكيات التحالف',
        he: 'דינמיקת קואליציות',
        ja: '連立ダイナミクス',
        ko: '연정 역학',
        zh: '联盟动态',
    },
    'analysis/templates/coalition-mathematics.md': {
        en: 'Coalition Mathematics',
        sv: 'Koalitionsmatematik',
        da: 'Koalitionsmatematik',
        no: 'Koalisjonsmatematikk',
        fi: 'Koalitiomatematiikka',
        de: 'Koalitionsmathematik',
        fr: 'Mathématiques des coalitions',
        es: 'Matemáticas de coaliciones',
        nl: 'Coalitiewiskunde',
        ar: 'رياضيات التحالف',
        he: 'מתמטיקה של קואליציות',
        ja: '連立数学',
        ko: '연정 수학',
        zh: '联盟数学',
    },
    'analysis/templates/comparative-international.md': {
        en: 'Comparative International Analysis',
        sv: 'Jämförande internationell analys',
        da: 'Komparativ international analyse',
        no: 'Komparativ internasjonal analyse',
        fi: 'Vertaileva kansainvälinen analyysi',
        de: 'Vergleichende internationale Analyse',
        fr: 'Analyse internationale comparative',
        es: 'Análisis internacional comparado',
        nl: 'Vergelijkende internationale analyse',
        ar: 'التحليل الدولي المقارن',
        he: 'ניתוח בינלאומי השוואתי',
        ja: '比較国際分析',
        ko: '비교 국제 분석',
        zh: '比较国际分析',
    },
    'analysis/templates/consequence-trees.md': {
        en: 'Consequence Trees',
        sv: 'Konsekvensträd',
        da: 'Konsekvenstræer',
        no: 'Konsekvenstrær',
        fi: 'Seurauspuut',
        de: 'Konsequenzbäume',
        fr: 'Arbres des conséquences',
        es: 'Árboles de consecuencias',
        nl: 'Gevolgenbomen',
        ar: 'أشجار العواقب',
        he: 'עצי השלכה',
        ja: '帰結ツリー',
        ko: '결과 트리',
        zh: '后果树',
    },
    'analysis/templates/cross-reference-map.md': {
        en: 'Cross-Reference Map',
        sv: 'Korsreferenskarta',
        da: 'Krydshenvisningskort',
        no: 'Kryssreferansekart',
        fi: 'Ristiviittauskartta',
        de: 'Querverweiskarte',
        fr: 'Carte de références croisées',
        es: 'Mapa de referencias cruzadas',
        nl: 'Kruisverwijzingskaart',
        ar: 'خريطة الإحالات المتقاطعة',
        he: 'מפת הפניות צולבות',
        ja: 'クロスリファレンスマップ',
        ko: '교차 참조 지도',
        zh: '交叉引用地图',
    },
    'analysis/templates/cross-run-diff.md': {
        en: 'Cross-Run Diff (Bayesian Delta)',
        sv: 'Diff mellan körningar (bayesiansk delta)',
        da: 'Kørselsdiff (Bayesiansk delta)',
        no: 'Kjøringsdiff (Bayesiansk delta)',
        fi: 'Ajojen välinen diff (Bayesin delta)',
        de: 'Cross-Run-Diff (Bayesianisches Delta)',
        fr: 'Diff entre exécutions (delta bayésien)',
        es: 'Diff entre ejecuciones (delta bayesiano)',
        nl: 'Cross-run-diff (Bayesiaanse delta)',
        ar: 'فرق عبر التشغيلات (دلتا بايزية)',
        he: 'דיף בין ריצות (דלתא בייסיאנית)',
        ja: 'ラン間差分(ベイジアンデルタ)',
        ko: '실행 간 차분(베이지안 델타)',
        zh: '跨运行差异（贝叶斯增量）',
    },
    'analysis/templates/cross-session-intelligence.md': {
        en: 'Cross-Session Intelligence',
        sv: 'Sessionsövergripande underrättelse',
        da: 'Sessionsovergribende efterretning',
        no: 'Sesjonsovergripende etterretning',
        fi: 'Istuntojen välinen tiedustelu',
        de: 'Sitzungsübergreifende Aufklärung',
        fr: 'Renseignement inter-sessions',
        es: 'Inteligencia entre sesiones',
        nl: 'Intersessionele inlichtingen',
        ar: 'استخبارات عبر الجلسات',
        he: 'מודיעין בין-מושבי',
        ja: 'セッション横断インテリジェンス',
        ko: '세션 간 정보',
        zh: '跨会议情报',
    },
    'analysis/templates/data-download-manifest.md': {
        en: 'Data Download Manifest',
        sv: 'Datanedladdningsmanifest',
        da: 'Datadownloadmanifest',
        no: 'Datanedlastingsmanifest',
        fi: 'Datan latausmanifesti',
        de: 'Daten-Download-Manifest',
        fr: 'Manifeste de téléchargement de données',
        es: 'Manifiesto de descarga de datos',
        nl: 'Datadownload-manifest',
        ar: 'بيان تنزيل البيانات',
        he: 'מניפסט הורדת נתונים',
        ja: 'データダウンロード・マニフェスト',
        ko: '데이터 다운로드 매니페스트',
        zh: '数据下载清单',
    },
    'analysis/templates/deep-analysis.md': {
        en: 'Deep Political Analysis (Long-Form)',
        sv: 'Djup politisk analys (långformat)',
        da: 'Dyb politisk analyse (langform)',
        no: 'Dyp politisk analyse (langform)',
        fi: 'Syvä poliittinen analyysi (pitkä muoto)',
        de: 'Tiefgehende politische Analyse (Langform)',
        fr: 'Analyse politique approfondie (format long)',
        es: 'Análisis político profundo (formato largo)',
        nl: 'Diepe politieke analyse (langvorm)',
        ar: 'تحليل سياسي معمق (شكل مطول)',
        he: 'ניתוח פוליטי מעמיק (פורמט ארוך)',
        ja: '深い政治分析(ロングフォーム)',
        ko: '심층 정치 분석(롱폼)',
        zh: '深度政治分析（长篇）',
    },
    'analysis/templates/devils-advocate-analysis.md': {
        en: 'Devil’s Advocate Analysis',
        sv: 'Djävulens advokat-analys',
        da: 'Djævlens advokat-analyse',
        no: 'Djevelens advokat-analyse',
        fi: 'Paholaisen asianajajan analyysi',
        de: 'Advocatus-Diaboli-Analyse',
        fr: 'Analyse de l’avocat du diable',
        es: 'Análisis del abogado del diablo',
        nl: 'Advocaat-van-de-duivel-analyse',
        ar: 'تحليل محامي الشيطان',
        he: 'ניתוח פרקליט השטן',
        ja: '悪魔の代弁者分析',
        ko: '악마의 대변인 분석',
        zh: '魔鬼代言人分析',
    },
    'analysis/templates/economic-context.md': {
        en: 'Economic Context (World Bank & IMF)',
        sv: 'Ekonomisk kontext (Världsbanken & IMF)',
        da: 'Økonomisk kontekst (Verdensbanken & IMF)',
        no: 'Økonomisk kontekst (Verdensbanken & IMF)',
        fi: 'Taloudellinen konteksti (Maailmanpankki & IMF)',
        de: 'Wirtschaftlicher Kontext (Weltbank & IWF)',
        fr: 'Contexte économique (Banque mondiale & FMI)',
        es: 'Contexto económico (Banco Mundial y FMI)',
        nl: 'Economische context (Wereldbank & IMF)',
        ar: 'السياق الاقتصادي (البنك الدولي وصندوق النقد)',
        he: 'הקשר כלכלי (הבנק העולמי וקרן המטבע)',
        ja: '経済コンテキスト(世界銀行・IMF)',
        ko: '경제 컨텍스트(세계은행·IMF)',
        zh: '经济背景（世界银行与 IMF）',
    },
    'analysis/templates/executive-brief.md': {
        en: 'Executive Brief',
        sv: 'Ledningsbrief',
        da: 'Lederbriefing',
        no: 'Ledelsesbrief',
        fi: 'Johdon tiivistelmä',
        de: 'Executive Brief',
        fr: 'Note exécutive',
        es: 'Informe ejecutivo',
        nl: 'Executive briefing',
        ar: 'موجز تنفيذي',
        he: 'תדריך ניהולי',
        ja: 'エグゼクティブ・ブリーフ',
        ko: '경영진 브리프',
        zh: '高管简报',
    },
    'analysis/templates/forces-analysis.md': {
        en: 'Forces Analysis (Lewin Force-Field)',
        sv: 'Kraftanalys (Lewins kraftfält)',
        da: 'Kraftanalyse (Lewins kraftfelt)',
        no: 'Kraftanalyse (Lewins kraftfelt)',
        fi: 'Voima-analyysi (Lewinin voima­kenttä)',
        de: 'Kräfteanalyse (Lewin-Kraftfeld)',
        fr: 'Analyse des forces (champ de forces de Lewin)',
        es: 'Análisis de fuerzas (campo de fuerzas de Lewin)',
        nl: 'Krachtenanalyse (Lewin-krachtenveld)',
        ar: 'تحليل القوى (حقل قوى ليفين)',
        he: 'ניתוח כוחות (שדה כוחות לוין)',
        ja: '勢力分析(レヴィン力場)',
        ko: '세력 분석(레빈 역장)',
        zh: '力场分析（勒温力场）',
    },
    'analysis/templates/forward-indicators.md': {
        en: 'Forward Indicators',
        sv: 'Framåtblickande indikatorer',
        da: 'Fremadrettede indikatorer',
        no: 'Fremoverrettede indikatorer',
        fi: 'Ennakoivat indikaattorit',
        de: 'Vorlaufindikatoren',
        fr: 'Indicateurs avancés',
        es: 'Indicadores adelantados',
        nl: 'Voorlopende indicatoren',
        ar: 'المؤشرات الاستباقية',
        he: 'מדדים צופים פני עתיד',
        ja: '先行指標',
        ko: '선행 지표',
        zh: '前瞻指标',
    },
    'analysis/templates/historical-baseline.md': {
        en: 'Historical Baseline',
        sv: 'Historisk baslinje',
        da: 'Historisk basislinje',
        no: 'Historisk grunnlinje',
        fi: 'Historiallinen lähtötaso',
        de: 'Historische Basislinie',
        fr: 'Référence historique',
        es: 'Línea base histórica',
        nl: 'Historische basislijn',
        ar: 'خط الأساس التاريخي',
        he: 'קו בסיס היסטורי',
        ja: '歴史的ベースライン',
        ko: '역사적 기준선',
        zh: '历史基线',
    },
    'analysis/templates/historical-parallels.md': {
        en: 'Historical Parallels',
        sv: 'Historiska paralleller',
        da: 'Historiske paralleller',
        no: 'Historiske paralleller',
        fi: 'Historialliset rinnakkaistapaukset',
        de: 'Historische Parallelen',
        fr: 'Parallèles historiques',
        es: 'Paralelos históricos',
        nl: 'Historische parallellen',
        ar: 'التوازيات التاريخية',
        he: 'הקבלות היסטוריות',
        ja: '歴史的類似例',
        ko: '역사적 유사 사례',
        zh: '历史类比',
    },
    'analysis/templates/impact-matrix.md': {
        en: 'Impact Matrix (Event × Stakeholder)',
        sv: 'Effektmatris (händelse × intressent)',
        da: 'Effektmatrix (begivenhed × interessent)',
        no: 'Effektmatrise (hendelse × interessent)',
        fi: 'Vaikutusmatriisi (tapahtuma × sidosryhmä)',
        de: 'Auswirkungsmatrix (Ereignis × Stakeholder)',
        fr: 'Matrice d’impact (événement × partie prenante)',
        es: 'Matriz de impacto (evento × interesado)',
        nl: 'Impactmatrix (gebeurtenis × belanghebbende)',
        ar: 'مصفوفة التأثير (حدث × أصحاب مصلحة)',
        he: 'מטריצת השפעה (אירוע × בעלי עניין)',
        ja: '影響マトリクス(事象×ステークホルダー)',
        ko: '영향 매트릭스(이벤트×이해관계자)',
        zh: '影响矩阵（事件×利益相关方）',
    },
    'analysis/templates/implementation-feasibility.md': {
        en: 'Implementation Feasibility',
        sv: 'Genomförbarhet av implementering',
        da: 'Implementeringsgennemførlighed',
        no: 'Gjennomførbarhet av implementering',
        fi: 'Toteutettavuus',
        de: 'Umsetzbarkeit der Implementierung',
        fr: 'Faisabilité de mise en œuvre',
        es: 'Viabilidad de implementación',
        nl: 'Implementeerbaarheid',
        ar: 'جدوى التنفيذ',
        he: 'היתכנות יישום',
        ja: '実装実行可能性',
        ko: '구현 실현 가능성',
        zh: '实施可行性',
    },
    'analysis/templates/intelligence-assessment.md': {
        en: 'Intelligence Assessment',
        sv: 'Underrättelsebedömning',
        da: 'Efterretningsvurdering',
        no: 'Etterretningsvurdering',
        fi: 'Tiedusteluarvio',
        de: 'Aufklärungsbewertung',
        fr: 'Évaluation du renseignement',
        es: 'Evaluación de inteligencia',
        nl: 'Inlichtingenbeoordeling',
        ar: 'تقييم استخباراتي',
        he: 'הערכה מודיעינית',
        ja: 'インテリジェンス評価',
        ko: '정보 평가',
        zh: '情报评估',
    },
    'analysis/templates/legislative-disruption.md': {
        en: 'Legislative Disruption',
        sv: 'Lagstiftningsstörning',
        da: 'Lovgivningsforstyrrelse',
        no: 'Lovgivningsforstyrrelse',
        fi: 'Lainsäädännön häiriö',
        de: 'Gesetzgebungsunterbrechung',
        fr: 'Perturbation législative',
        es: 'Disrupción legislativa',
        nl: 'Wetgevingsverstoring',
        ar: 'اضطراب تشريعي',
        he: 'שיבוש חקיקתי',
        ja: '立法撹乱',
        ko: '입법 교란',
        zh: '立法干扰',
    },
    'analysis/templates/legislative-velocity-risk.md': {
        en: 'Legislative Velocity Risk',
        sv: 'Risk för lagstiftningshastighet',
        da: 'Risiko for lovgivningshastighed',
        no: 'Risiko for lovgivningshastighet',
        fi: 'Lainsäädännön nopeuden riski',
        de: 'Risiko der Gesetzgebungsgeschwindigkeit',
        fr: 'Risque lié à la vélocité législative',
        es: 'Riesgo de velocidad legislativa',
        nl: 'Risico van wetgevingssnelheid',
        ar: 'مخاطر سرعة التشريع',
        he: 'סיכון מהירות חקיקה',
        ja: '立法速度リスク',
        ko: '입법 속도 리스크',
        zh: '立法速度风险',
    },
    'analysis/templates/mcp-reliability-audit.md': {
        en: 'MCP Reliability Audit',
        sv: 'MCP-tillförlitlighetsrevision',
        da: 'MCP-pålidelighedsrevision',
        no: 'MCP-pålitelighetsrevisjon',
        fi: 'MCP-luotettavuustarkastus',
        de: 'MCP-Zuverlässigkeitsaudit',
        fr: 'Audit de fiabilité MCP',
        es: 'Auditoría de fiabilidad MCP',
        nl: 'MCP-betrouwbaarheidsaudit',
        ar: 'تدقيق موثوقية MCP',
        he: 'ביקורת אמינות MCP',
        ja: 'MCP信頼性監査',
        ko: 'MCP 신뢰성 감사',
        zh: 'MCP 可靠性审计',
    },
    'analysis/templates/media-framing-analysis.md': {
        en: 'Media Framing Analysis',
        sv: 'Mediaframingsanalys',
        da: 'Medieindramningsanalyse',
        no: 'Medieinnramningsanalyse',
        fi: 'Median kehystysanalyysi',
        de: 'Medien-Framing-Analyse',
        fr: 'Analyse du cadrage médiatique',
        es: 'Análisis de encuadre mediático',
        nl: 'Analyse van mediaframing',
        ar: 'تحليل التأطير الإعلامي',
        he: 'ניתוח מסגור תקשורתי',
        ja: 'メディアフレーミング分析',
        ko: '미디어 프레이밍 분석',
        zh: '媒体框架分析',
    },
    'analysis/templates/methodology-reflection.md': {
        en: 'Methodology Reflection (Retrospective)',
        sv: 'Metodologireflektion (retrospektiv)',
        da: 'Metoderefleksion (retrospektiv)',
        no: 'Metoderefleksjon (retrospektiv)',
        fi: 'Metodologinen reflektio (retrospektiivi)',
        de: 'Methodologie-Reflexion (Retrospektive)',
        fr: 'Réflexion méthodologique (rétrospective)',
        es: 'Reflexión metodológica (retrospectiva)',
        nl: 'Methodologiereflectie (retrospectief)',
        ar: 'تأمل منهجي (استعادي)',
        he: 'רפלקציה מתודולוגית (רטרוספקטיבה)',
        ja: '方法論振り返り(レトロ)',
        ko: '방법론 성찰(회고)',
        zh: '方法论反思（回顾）',
    },
    'analysis/templates/per-file-political-intelligence.md': {
        en: 'Per-File Political Intelligence',
        sv: 'Per-fil politisk underrättelse',
        da: 'Pr.-fil politisk efterretning',
        no: 'Per-fil politisk etterretning',
        fi: 'Tiedosto­kohtainen poliittinen tiedustelu',
        de: 'Politische Aufklärung pro Datei',
        fr: 'Renseignement politique par fichier',
        es: 'Inteligencia política por archivo',
        nl: 'Politieke inlichtingen per bestand',
        ar: 'الاستخبارات السياسية لكل ملف',
        he: 'מודיעין פוליטי לכל קובץ',
        ja: 'ファイル別政治インテリジェンス',
        ko: '파일별 정치 정보',
        zh: '按文件政治情报',
    },
    'analysis/templates/pestle-analysis.md': {
        en: 'PESTLE Analysis (Six-Dimension Scan)',
        sv: 'PESTLE-analys (sex dimensioner)',
        da: 'PESTLE-analyse (seks dimensioner)',
        no: 'PESTLE-analyse (seks dimensjoner)',
        fi: 'PESTLE-analyysi (kuusi ulottuvuutta)',
        de: 'PESTLE-Analyse (Sechs-Dimensionen-Scan)',
        fr: 'Analyse PESTLE (scan à six dimensions)',
        es: 'Análisis PESTLE (escaneo de seis dimensiones)',
        nl: 'PESTLE-analyse (zesdimensionale scan)',
        ar: 'تحليل PESTLE (مسح سداسي الأبعاد)',
        he: 'ניתוח PESTLE (סריקה בשישה מימדים)',
        ja: 'PESTLE分析(六次元スキャン)',
        ko: 'PESTLE 분석(6차원 스캔)',
        zh: 'PESTLE 分析（六维扫描）',
    },
    'analysis/templates/political-capital-risk.md': {
        en: 'Political Capital Risk',
        sv: 'Politisk kapitalrisk',
        da: 'Politisk kapitalrisiko',
        no: 'Politisk kapitalrisiko',
        fi: 'Poliittisen pääoman riski',
        de: 'Politisches Kapitalrisiko',
        fr: 'Risque pour le capital politique',
        es: 'Riesgo de capital político',
        nl: 'Risico voor politiek kapitaal',
        ar: 'مخاطر رأس المال السياسي',
        he: 'סיכון הון פוליטי',
        ja: '政治資本リスク',
        ko: '정치 자본 리스크',
        zh: '政治资本风险',
    },
    'analysis/templates/political-classification.md': {
        en: 'Political Event Classification',
        sv: 'Klassificering av politiska händelser',
        da: 'Klassifikation af politiske begivenheder',
        no: 'Klassifisering av politiske hendelser',
        fi: 'Poliittisten tapahtumien luokittelu',
        de: 'Klassifizierung politischer Ereignisse',
        fr: 'Classification des événements politiques',
        es: 'Clasificación de eventos políticos',
        nl: 'Classificatie van politieke gebeurtenissen',
        ar: 'تصنيف الأحداث السياسية',
        he: 'סיווג אירועים פוליטיים',
        ja: '政治イベント分類',
        ko: '정치 이벤트 분류',
        zh: '政治事件分类',
    },
    'analysis/templates/political-threat-landscape.md': {
        en: 'Political Threat Landscape',
        sv: 'Politiskt hotlandskap',
        da: 'Politisk trusselslandskab',
        no: 'Politisk trussellandskap',
        fi: 'Poliittinen uhkamaisema',
        de: 'Politische Bedrohungslandschaft',
        fr: 'Paysage des menaces politiques',
        es: 'Panorama de amenazas políticas',
        nl: 'Politiek dreigingslandschap',
        ar: 'مشهد التهديدات السياسية',
        he: 'נוף איומים פוליטי',
        ja: '政治脅威ランドスケープ',
        ko: '정치 위협 환경',
        zh: '政治威胁格局',
    },
    'analysis/templates/quantitative-swot.md': {
        en: 'Quantitative SWOT (Numeric + TOWS)',
        sv: 'Kvantitativ SWOT (numerisk + TOWS)',
        da: 'Kvantitativ SWOT (numerisk + TOWS)',
        no: 'Kvantitativ SWOT (numerisk + TOWS)',
        fi: 'Kvantitatiivinen SWOT (numeerinen + TOWS)',
        de: 'Quantitative SWOT (numerisch + TOWS)',
        fr: 'SWOT quantitative (numérique + TOWS)',
        es: 'SWOT cuantitativo (numérico + TOWS)',
        nl: 'Kwantitatieve SWOT (numeriek + TOWS)',
        ar: 'SWOT الكمي (عددي + TOWS)',
        he: 'SWOT כמותי (מספרי + TOWS)',
        ja: '定量SWOT(数値+TOWS)',
        ko: '정량 SWOT(수치+TOWS)',
        zh: '定量 SWOT（数值+TOWS）',
    },
    'analysis/templates/reference-analysis-quality.md': {
        en: 'Reference Analysis Quality',
        sv: 'Kvalitet på referensanalys',
        da: 'Kvalitet af referenceanalyse',
        no: 'Kvalitet på referanseanalyse',
        fi: 'Viiteanalyysin laatu',
        de: 'Qualität der Referenzanalyse',
        fr: 'Qualité de l’analyse de référence',
        es: 'Calidad del análisis de referencia',
        nl: 'Kwaliteit van referentieanalyse',
        ar: 'جودة التحليل المرجعي',
        he: 'איכות ניתוח ייחוס',
        ja: '参照分析品質',
        ko: '참조 분석 품질',
        zh: '参考分析质量',
    },
    'analysis/templates/risk-assessment.md': {
        en: 'Political Risk Assessment',
        sv: 'Politisk riskbedömning',
        da: 'Politisk risikovurdering',
        no: 'Politisk risikovurdering',
        fi: 'Poliittinen riskiarviointi',
        de: 'Politische Risikobewertung',
        fr: 'Évaluation des risques politiques',
        es: 'Evaluación de riesgos políticos',
        nl: 'Politieke risicobeoordeling',
        ar: 'تقييم المخاطر السياسية',
        he: 'הערכת סיכונים פוליטיים',
        ja: '政治リスク評価',
        ko: '정치 리스크 평가',
        zh: '政治风险评估',
    },
    'analysis/templates/risk-matrix.md': {
        en: 'Risk Matrix (5×5 Likelihood × Impact)',
        sv: 'Riskmatris (5×5 sannolikhet × effekt)',
        da: 'Risikomatrix (5×5 sandsynlighed × effekt)',
        no: 'Risikomatrise (5×5 sannsynlighet × effekt)',
        fi: 'Riskimatriisi (5×5 todennäköisyys × vaikutus)',
        de: 'Risikomatrix (5×5 Wahrscheinlichkeit × Auswirkung)',
        fr: 'Matrice des risques (5×5 probabilité × impact)',
        es: 'Matriz de riesgos (5×5 probabilidad × impacto)',
        nl: 'Risicomatrix (5×5 waarschijnlijkheid × impact)',
        ar: 'مصفوفة المخاطر (5×5 احتمالية × تأثير)',
        he: 'מטריצת סיכונים (5×5 הסתברות × השפעה)',
        ja: 'リスクマトリクス(5×5 確率×影響)',
        ko: '리스크 매트릭스(5×5 가능성×영향)',
        zh: '风险矩阵（5×5 可能性×影响）',
    },
    'analysis/templates/scenario-forecast.md': {
        en: 'Scenario Forecast (Probability-Weighted)',
        sv: 'Scenarioprognos (sannolikhetsviktad)',
        da: 'Scenarieprognose (sandsynlighedsvægtet)',
        no: 'Scenarioprognose (sannsynlighetsvektet)',
        fi: 'Skenaarioennuste (todennäköisyys­painotettu)',
        de: 'Szenarioprognose (wahrscheinlichkeits­gewichtet)',
        fr: 'Prévision de scénarios (pondérée par probabilité)',
        es: 'Pronóstico de escenarios (ponderado por probabilidad)',
        nl: 'Scenarioprognose (kansgewogen)',
        ar: 'توقع السيناريوهات (مرجح بالاحتمالية)',
        he: 'תחזית תרחישים (ממושקלת הסתברות)',
        ja: 'シナリオ予測(確率加重)',
        ko: '시나리오 예측(확률 가중)',
        zh: '情景预测（概率加权）',
    },
    'analysis/templates/session-baseline.md': {
        en: 'Session Baseline (Plenary Calendar)',
        sv: 'Sessionsbaslinje (plenarkalender)',
        da: 'Sessionsbasislinje (plenarkalender)',
        no: 'Sesjonsgrunnlinje (plenarkalender)',
        fi: 'Istunnon lähtötaso (täysistunto­kalenteri)',
        de: 'Sitzungsbasislinie (Plenarkalender)',
        fr: 'Référence de session (calendrier plénier)',
        es: 'Línea base de sesión (calendario plenario)',
        nl: 'Sessiebasislijn (plenaire kalender)',
        ar: 'خط الأساس للجلسة (جدول الجلسة العامة)',
        he: 'בסיס מושב (לוח מליאה)',
        ja: 'セッション基準(本会議カレンダー)',
        ko: '세션 기준선(본회의 일정)',
        zh: '会议基线（全会日历）',
    },
    'analysis/templates/significance-classification.md': {
        en: 'Significance Classification (5-Dimension Rubric)',
        sv: 'Signifikansklassificering (5-dimensionell rubrik)',
        da: 'Signifikansklassifikation (5-dimensionel rubrik)',
        no: 'Signifikansklassifisering (5-dimensjonal rubrikk)',
        fi: 'Merkitys­luokitus (5-ulotteinen kriteeristö)',
        de: 'Signifikanzklassifikation (5-Dimensionen-Rubrik)',
        fr: 'Classification de la signification (grille à 5 dimensions)',
        es: 'Clasificación de significancia (rúbrica de 5 dimensiones)',
        nl: 'Significantieclassificatie (5-dimensionale rubriek)',
        ar: 'تصنيف الأهمية (جدول بخمسة أبعاد)',
        he: 'סיווג משמעות (שולחן חמישה-מימדי)',
        ja: '重要度分類(5次元ルーブリック)',
        ko: '중요도 분류(5차원 루브릭)',
        zh: '重要性分类（五维评分表）',
    },
    'analysis/templates/significance-scoring.md': {
        en: 'Political Significance Scoring',
        sv: 'Politisk signifikanspoäng',
        da: 'Politisk signifikansscoring',
        no: 'Politisk signifikansscoring',
        fi: 'Poliittisen merkityksen pisteytys',
        de: 'Politische Signifikanzbewertung',
        fr: 'Notation de la signification politique',
        es: 'Puntuación de significancia política',
        nl: 'Politieke significantiescore',
        ar: 'تسجيل الأهمية السياسية',
        he: 'דירוג משמעות פוליטית',
        ja: '政治的重要度スコアリング',
        ko: '정치적 중요도 점수화',
        zh: '政治重要性评分',
    },
    'analysis/templates/stakeholder-impact.md': {
        en: 'Stakeholder Impact Assessment',
        sv: 'Intressenteffektbedömning',
        da: 'Interessentpåvirkningsvurdering',
        no: 'Interessentpåvirkningsvurdering',
        fi: 'Sidosryhmän vaikutusarviointi',
        de: 'Stakeholder-Impact-Assessment',
        fr: 'Évaluation de l’impact sur les parties prenantes',
        es: 'Evaluación de impacto de interesados',
        nl: 'Impactbeoordeling voor belanghebbenden',
        ar: 'تقييم تأثير أصحاب المصلحة',
        he: 'הערכת השפעה על בעלי עניין',
        ja: 'ステークホルダー影響評価',
        ko: '이해관계자 영향 평가',
        zh: '利益相关方影响评估',
    },
    'analysis/templates/stakeholder-map.md': {
        en: 'Stakeholder Map (Power × Alignment)',
        sv: 'Intressentkarta (makt × linje)',
        da: 'Interessentkort (magt × linje)',
        no: 'Interessentkart (makt × linje)',
        fi: 'Sidosryhmäkartta (valta × linja)',
        de: 'Stakeholder-Map (Macht × Ausrichtung)',
        fr: 'Carte des parties prenantes (pouvoir × alignement)',
        es: 'Mapa de interesados (poder × alineación)',
        nl: 'Stakeholderkaart (macht × uitlijning)',
        ar: 'خريطة أصحاب المصلحة (قوة × توافق)',
        he: 'מפת בעלי עניין (כוח × יישור)',
        ja: 'ステークホルダー・マップ(権力×整合)',
        ko: '이해관계자 지도(권력×정렬)',
        zh: '利益相关方地图（权力×一致）',
    },
    'analysis/templates/swot-analysis.md': {
        en: 'Political SWOT Analysis',
        sv: 'Politisk SWOT-analys',
        da: 'Politisk SWOT-analyse',
        no: 'Politisk SWOT-analyse',
        fi: 'Poliittinen SWOT-analyysi',
        de: 'Politische SWOT-Analyse',
        fr: 'Analyse SWOT politique',
        es: 'Análisis SWOT político',
        nl: 'Politieke SWOT-analyse',
        ar: 'تحليل SWOT السياسي',
        he: 'ניתוח SWOT פוליטי',
        ja: '政治SWOT分析',
        ko: '정치 SWOT 분석',
        zh: '政治 SWOT 分析',
    },
    'analysis/templates/synthesis-summary.md': {
        en: 'Synthesis Summary',
        sv: 'Syntessammanfattning',
        da: 'Syntesesammenfatning',
        no: 'Syntesesammendrag',
        fi: 'Synteesiyhteenveto',
        de: 'Synthese-Zusammenfassung',
        fr: 'Résumé de synthèse',
        es: 'Resumen de síntesis',
        nl: 'Synthese-samenvatting',
        ar: 'ملخص التوليف',
        he: 'סיכום סינתזה',
        ja: '総合サマリー',
        ko: '종합 요약',
        zh: '综合摘要',
    },
    'analysis/templates/threat-analysis.md': {
        en: 'Political Threat Landscape Analysis',
        sv: 'Politisk hotlandskapsanalys',
        da: 'Politisk trusselslandskabsanalyse',
        no: 'Politisk trussellandskapsanalyse',
        fi: 'Poliittisen uhkamaiseman analyysi',
        de: 'Analyse der politischen Bedrohungslandschaft',
        fr: 'Analyse du paysage des menaces politiques',
        es: 'Análisis del panorama de amenazas políticas',
        nl: 'Analyse van het politieke dreigingslandschap',
        ar: 'تحليل مشهد التهديدات السياسية',
        he: 'ניתוח נוף האיומים הפוליטי',
        ja: '政治脅威ランドスケープ分析',
        ko: '정치 위협 환경 분석',
        zh: '政治威胁格局分析',
    },
    'analysis/templates/threat-model.md': {
        en: 'Threat Model (Democratic & Institutional)',
        sv: 'Hotmodell (demokratisk & institutionell)',
        da: 'Trusselmodel (demokratisk & institutionel)',
        no: 'Trusselmodell (demokratisk & institusjonell)',
        fi: 'Uhkamalli (demokraattinen & institutionaalinen)',
        de: 'Bedrohungsmodell (demokratisch & institutionell)',
        fr: 'Modèle de menace (démocratique & institutionnel)',
        es: 'Modelo de amenazas (democrático e institucional)',
        nl: 'Dreigingsmodel (democratisch & institutioneel)',
        ar: 'نموذج التهديد (ديمقراطي ومؤسسي)',
        he: 'מודל איומים (דמוקרטי ומוסדי)',
        ja: '脅威モデル(民主的・制度的)',
        ko: '위협 모델(민주주의 및 제도)',
        zh: '威胁模型（民主与制度）',
    },
    'analysis/templates/voter-segmentation.md': {
        en: 'Voter Segmentation',
        sv: 'Väljarsegmentering',
        da: 'Vælgersegmentering',
        no: 'Velgersegmentering',
        fi: 'Äänestäjien segmentointi',
        de: 'Wählersegmentierung',
        fr: 'Segmentation des électeurs',
        es: 'Segmentación de votantes',
        nl: 'Kiezerssegmentatie',
        ar: 'تجزئة الناخبين',
        he: 'חלוקת בוחרים',
        ja: '有権者セグメンテーション',
        ko: '유권자 세분화',
        zh: '选民细分',
    },
    'analysis/templates/voting-patterns.md': {
        en: 'Voting Patterns',
        sv: 'Röstningsmönster',
        da: 'Afstemningsmønstre',
        no: 'Stemmemønstre',
        fi: 'Äänestys­käyttäytyminen',
        de: 'Abstimmungsmuster',
        fr: 'Schémas de vote',
        es: 'Patrones de voto',
        nl: 'Stempatronen',
        ar: 'أنماط التصويت',
        he: 'דפוסי הצבעה',
        ja: '投票パターン',
        ko: '투표 패턴',
        zh: '投票模式',
    },
    'analysis/templates/wildcards-blackswans.md': {
        en: 'Wildcards & Black Swans',
        sv: 'Joker­kort & svarta svanar',
        da: 'Wildcards & sorte svaner',
        no: 'Wildcards & sorte svaner',
        fi: 'Jokerit & mustat joutsenet',
        de: 'Wildcards & Schwarze Schwäne',
        fr: 'Wildcards & cygnes noirs',
        es: 'Comodines y cisnes negros',
        nl: 'Wildcards & zwarte zwanen',
        ar: 'البطاقات البرية والبجعات السوداء',
        he: 'ג’וקרים וברבורים שחורים',
        ja: 'ワイルドカードとブラックスワン',
        ko: '와일드카드 및 블랙스완',
        zh: '万能牌与黑天鹅',
    },
    'analysis/templates/workflow-audit.md': {
        en: 'Workflow Audit (Agentic Run Self-Assessment)',
        sv: 'Arbetsflödes­revision (agentisk körnings-självbedömning)',
        da: 'Workflow-audit (agentisk kørsels-selvvurdering)',
        no: 'Arbeidsflyt-revisjon (agentisk kjørings-selvvurdering)',
        fi: 'Työnkulun auditointi (agenttisen ajon itsearvio)',
        de: 'Workflow-Audit (agentische Run-Selbstbewertung)',
        fr: 'Audit de workflow (auto-évaluation d’exécution agentique)',
        es: 'Auditoría de flujo de trabajo (autoevaluación de ejecución agéntica)',
        nl: 'Workflow-audit (agentische run-zelfbeoordeling)',
        ar: 'تدقيق سير العمل (تقييم ذاتي لتشغيل وكيلي)',
        he: 'ביקורת זרימת עבודה (הערכה עצמית של ריצה אג׳נטית)',
        ja: 'ワークフロー監査(エージェント実行自己評価)',
        ko: '워크플로 감사(에이전트 실행 자기 평가)',
        zh: '工作流审计（代理运行自评）',
    },
};
/**
 * Per-language localized generic fallback phrase for **descriptions**.
 *
 * The placeholder `{title}` is replaced with the file's curated/localized
 * title; `{kind}` is replaced with a localized kind word (methodology /
 * template / reference). When `{title}` is omitted from a given language's
 * template, the kind-only form is used (back-compat path).
 *
 * This is what readers see when a file ships without a curated per-language
 * description (e.g. a brand-new methodology added after this table was last
 * updated) — so even new files never display raw English on non-English
 * pages.
 */
const GENERIC_FALLBACK_I18N = {
    en: '{title} — reference {kind} in the EU Parliament Monitor analysis library.',
    sv: '{title} — referens­{kind} i EU Parliament Monitors analysbibliotek.',
    da: '{title} — reference­{kind} i EU Parliament Monitors analysebibliotek.',
    no: '{title} — referanse­{kind} i EU Parliament Monitors analysebibliotek.',
    fi: '{title} — viite{kind} EU Parliament Monitorin analyysikirjastossa.',
    de: '{title} — Referenz-{kind} in der EU-Parliament-Monitor-Analysebibliothek.',
    fr: '{title} — {kind} de référence dans la bibliothèque d’analyse EU Parliament Monitor.',
    es: '{title} — {kind} de referencia en la biblioteca de análisis EU Parliament Monitor.',
    nl: '{title} — referentie-{kind} in de analysebibliotheek van EU Parliament Monitor.',
    ar: '{title} — {kind} مرجعية في مكتبة تحليل EU Parliament Monitor.',
    he: '{title} — {kind} ייחוס בספריית הניתוחים של EU Parliament Monitor.',
    ja: '{title} — EU Parliament Monitor 分析ライブラリの参照{kind}。',
    ko: '{title} — EU Parliament Monitor 분석 라이브러리의 참조 {kind}.',
    zh: '{title} — EU Parliament Monitor 分析库中的参考{kind}。',
};
/** Per-language word for "methodology". */
const KIND_WORDS_METHODOLOGY = {
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
const KIND_WORDS_TEMPLATE = {
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
const KIND_WORDS_REFERENCE = {
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
 * Strip leading emojis/punctuation from a display string and return a
 * title-cased humanized tail. Used only as a last-ditch fallback when no
 * H1 title is provided to {@link getCuratedDescription}.
 *
 * @param keyOrTitle - Raw string (typically a path stem or an H1)
 * @returns Title-cased humanized string
 */
function stripEmojiAndPunct(keyOrTitle) {
    // Take only the basename (without the extension) as the seed so a raw
    // path like "analysis/templates/foo-bar.md" yields a readable "Foo Bar".
    const seed = keyOrTitle
        .split('/')
        .pop()
        ?.replace(/\.[^.]+$/, '')
        ?.replace(/[-_]+/g, ' ')
        ?.trim() ?? keyOrTitle;
    return seed.replace(/\b\w/g, (c) => c.toUpperCase());
}
/**
 * Infer a kind ("methodology" / "template" / "reference") from the
 * repository-relative path.
 *
 * @param relPath - Repository-relative Markdown path
 * @returns The inferred kind; falls back to `'reference'` when the path
 *   does not match a `/methodologies/` or `/templates/` directory
 */
function inferKind(relPath) {
    if (relPath.includes('/methodologies/'))
        return 'methodology';
    if (relPath.includes('/templates/'))
        return 'template';
    return 'reference';
}
/**
 * Resolve the localized kind word for a given path and language.
 *
 * @param relPath - Repository-relative Markdown path
 * @param lang    - Target language code
 * @returns Localized kind word (e.g. `'methodology'`, `'mall'`, `'템플릿'`)
 */
function kindWord(relPath, lang) {
    const kind = inferKind(relPath);
    if (kind === 'methodology')
        return getFromRecord(KIND_WORDS_METHODOLOGY, lang);
    if (kind === 'template')
        return getFromRecord(KIND_WORDS_TEMPLATE, lang);
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
function getFromRecord(record, lang) {
    // eslint-disable-next-line security/detect-object-injection
    return record[lang] ?? record.en;
}
/**
 * Build the localized generic fallback sentence for a file the curated
 * table does not know about (or whose curated entry has no per-language
 * description).
 *
 * @param relPath - Repo-relative path to the Markdown file
 * @param lang    - Target language
 * @param title   - Localized title of the file (already resolved via
 *                  {@link getCuratedTitle}) used to make the fallback
 *                  sentence meaningful even when no curated description
 *                  exists
 * @returns Fully localized description sentence
 */
function buildGenericFallback(relPath, lang, title) {
    // eslint-disable-next-line security/detect-object-injection
    const template = GENERIC_FALLBACK_I18N[lang] ?? GENERIC_FALLBACK_I18N.en;
    const kind = kindWord(relPath, lang);
    return template.replace('{title}', title).replace('{kind}', kind);
}
/**
 * Resolve the best description for a given methodology / template / reference
 * file and language.
 *
 * Lookup priority:
 * 1. Curated per-language description (`CURATED_DESCRIPTIONS[relPath].i18n[lang]`)
 * 2. Curated English canonical description (`CURATED_DESCRIPTIONS[relPath].description`)
 *    — **only returned for English callers**; non-English callers fall
 *      through to tier 3 so readers don't see raw English on localized
 *      pages when the curated English is non-trivial.
 * 3. Localized generic fallback sentence built from the file's localized
 *    title and a localized kind word
 *
 * @param relPath  - Repository-relative file path (e.g.
 *                   `analysis/methodologies/ai-driven-analysis-guide.md`)
 * @param lang     - Target language code
 * @param fallback - H1-extracted title from the source Markdown (always
 *                   English); used as the title seed for tier 3
 * @returns A non-empty description string
 */
export function getCuratedDescription(relPath, lang, fallback = '') {
    // Normalise path separators so Windows callers don't silently miss entries.
    const key = relPath.replace(/\\/g, '/');
    // eslint-disable-next-line security/detect-object-injection
    const entry = CURATED_DESCRIPTIONS[key];
    if (entry) {
        // eslint-disable-next-line security/detect-object-injection
        const localized = entry.i18n?.[lang];
        if (localized)
            return localized;
        // English callers get the curated English description. Non-English
        // callers skip it so the page never shows raw English next to a
        // localized title — they get the localized fallback built from the
        // file's localized title instead.
        if (lang === 'en')
            return entry.description;
    }
    // Build a meaningful localized fallback around the localized title.
    const localizedTitle = getCuratedTitle(key, lang, fallback || stripEmojiAndPunct(key));
    return buildGenericFallback(key, lang, localizedTitle);
}
/**
 * Whether the curated table has an explicit entry (curated English
 * description) for this path — used by tests and by the generator to detect
 * newly-added analysis files that still need a curated entry.
 *
 * @param relPath - Repository-relative file path
 * @returns `true` when the curated table contains the file
 */
export function hasCuratedDescription(relPath) {
    // eslint-disable-next-line security/detect-object-injection
    return Object.prototype.hasOwnProperty.call(CURATED_DESCRIPTIONS, relPath.replace(/\\/g, '/'));
}
/**
 * Whether the curated title overlay has an explicit entry for this path.
 * Used by tests to confirm every shipped methodology/template/reference has
 * a localized title.
 *
 * @param relPath - Repository-relative file path
 * @returns `true` when {@link CURATED_TITLES} contains the file
 */
export function hasCuratedTitle(relPath) {
    // eslint-disable-next-line security/detect-object-injection
    return Object.prototype.hasOwnProperty.call(CURATED_TITLES, relPath.replace(/\\/g, '/'));
}
/**
 * Resolve the best card title for a given methodology / template / reference
 * file and language.
 *
 * Lookup priority:
 * 1. Curated per-language title from {@link CURATED_TITLES} (preferred —
 *    this is where all 14-language localization is maintained)
 * 2. Curated English title from {@link CURATED_TITLES} (`.en` overlay)
 * 3. Per-entry `titleI18n[lang]` on a `CURATED_DESCRIPTIONS` entry
 *    (legacy path; retained so future entries can colocate title + desc)
 * 4. Per-entry `title` on a `CURATED_DESCRIPTIONS` entry
 * 5. `fallback` — the H1-extracted title from the source Markdown
 *
 * The generator always ships `fallback` from the Markdown H1 so this
 * function is guaranteed to return a non-empty string for every file in
 * the library, even when the curated tables have no entry yet.
 *
 * @param relPath  - Repository-relative file path
 * @param lang     - Target language code
 * @param fallback - H1-extracted title from the source Markdown (English)
 * @returns A non-empty display title
 */
export function getCuratedTitle(relPath, lang, fallback) {
    const key = relPath.replace(/\\/g, '/');
    // 1 + 2: curated title overlay
    // eslint-disable-next-line security/detect-object-injection
    const titleEntry = CURATED_TITLES[key];
    if (titleEntry) {
        // eslint-disable-next-line security/detect-object-injection
        const localized = titleEntry[lang];
        if (localized)
            return localized;
        if (titleEntry.en)
            return titleEntry.en;
    }
    // 3 + 4: legacy colocated title on CURATED_DESCRIPTIONS entry
    // eslint-disable-next-line security/detect-object-injection
    const descEntry = CURATED_DESCRIPTIONS[key];
    if (descEntry) {
        // eslint-disable-next-line security/detect-object-injection
        const localized = descEntry.titleI18n?.[lang];
        if (localized)
            return localized;
        if (descEntry.title)
            return descEntry.title;
    }
    return fallback;
}
//# sourceMappingURL=political-intelligence-descriptions.js.map