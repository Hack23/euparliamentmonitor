// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/Articles/ExtendedHorizons
 * @description Title generators for the extended planning horizons (quarter-ahead, quarter-in-review, year-ahead, year-in-review, term-outlook, election-cycle). Consumed by `article-metadata.ts`.
 *
 * Per-language strings live together so a translator can update one language
 * for this article type without touching any other article type.
 */

import type { LanguageMap, LangTitleSubtitle } from '../../types/index.js';
export const QUARTER_AHEAD_TITLES: LanguageMap<(quarter: string) => LangTitleSubtitle> = {
  en: (quarter) => ({
    title: `Quarter Ahead: ${quarter}`,
    subtitle:
      'European Parliament 90-day strategic outlook — three plenary cycles, dossier pipeline, Council Presidency overlay and probabilistic forecasts',
  }),
  sv: (quarter) => ({
    title: `Kvartalet Framåt: ${quarter}`,
    subtitle:
      'Europaparlamentets 90-dagars strategiska utsikt — tre plenarcykler, dossierflöde, ordförandeskap och probabilistiska prognoser',
  }),
  da: (quarter) => ({
    title: `Kvartalet Fremover: ${quarter}`,
    subtitle:
      'Europa-Parlamentets 90-dages strategiske udsigt — tre plenarcyklusser, dossierpipeline, formandskabsoverlay og probabilistiske prognoser',
  }),
  no: (quarter) => ({
    title: `Kvartalet Fremover: ${quarter}`,
    subtitle:
      'Europaparlamentets 90-dagers strategiske utsikt — tre plenumssykluser, dossierløp, formannskap og probabilistiske prognoser',
  }),
  fi: (quarter) => ({
    title: `Tuleva Neljännes: ${quarter}`,
    subtitle:
      'Euroopan parlamentin 90 päivän strateginen katsaus — kolme täysistuntosykliä, asiakokonaisuuksien putki, puheenjohtajakausi ja todennäköisyyspohjaiset ennusteet',
  }),
  de: (quarter) => ({
    title: `Quartal Voraus: ${quarter}`,
    subtitle:
      'Strategischer 90-Tage-Ausblick des Europäischen Parlaments — drei Plenarzyklen, Dossier-Pipeline, Ratspräsidentschaft und probabilistische Prognosen',
  }),
  fr: (quarter) => ({
    title: `Trimestre à Venir: ${quarter}`,
    subtitle:
      'Perspectives stratégiques sur 90 jours du Parlement européen — trois cycles pléniers, pipeline de dossiers, Présidence du Conseil et prévisions probabilistes',
  }),
  es: (quarter) => ({
    title: `Trimestre Próximo: ${quarter}`,
    subtitle:
      'Perspectiva estratégica de 90 días del Parlamento Europeo — tres ciclos plenarios, cartera de expedientes, Presidencia y pronósticos probabilísticos',
  }),
  nl: (quarter) => ({
    title: `Kwartaal Vooruit: ${quarter}`,
    subtitle:
      'Strategische 90-dagen vooruitblik Europees Parlement — drie plenaire cycli, dossierpipeline, Voorzitterschap en probabilistische prognoses',
  }),
  ar: (quarter) => ({
    title: `الربع القادم: ${quarter}`,
    subtitle:
      'نظرة استراتيجية للبرلمان الأوروبي على مدى 90 يومًا — ثلاث دورات عامة، خط سير الملفات، رئاسة المجلس وتوقّعات احتمالية',
  }),
  he: (quarter) => ({
    title: `הרבעון הקרוב: ${quarter}`,
    subtitle:
      'תחזית אסטרטגית ל־90 יום של הפרלמנט האירופי — שלוש מליאות, קו תיקים, נשיאות המועצה ותחזיות הסתברותיות',
  }),
  ja: (quarter) => ({
    title: `来四半期の展望: ${quarter}`,
    subtitle:
      '欧州議会の 90 日戦略アウトルック — 3 回の本会議サイクル、法案パイプライン、理事会議長国、確率予測',
  }),
  ko: (quarter) => ({
    title: `다음 분기 전망: ${quarter}`,
    subtitle:
      '유럽 의회 90일 전략 전망 — 세 번의 본회의 주기·법안 파이프라인·이사회 의장국·확률 예측',
  }),
  zh: (quarter) => ({
    title: `下季展望: ${quarter}`,
    subtitle: '欧洲议会 90 天战略展望 — 三次全体会议周期、议题流水线、理事会主席国与概率预测',
  }),
};

/** Quarter in review title templates per language. */
export const QUARTER_IN_REVIEW_TITLES: LanguageMap<(quarter: string) => LangTitleSubtitle> = {
  en: (quarter) => ({
    title: `Quarter in Review: ${quarter}`,
    subtitle:
      'European Parliament 90-day retrospective — coalition trajectory, dossier throughput delta, anomalous votes and rolling political-risk trend',
  }),
  sv: (quarter) => ({
    title: `Kvartalet i Korthet: ${quarter}`,
    subtitle:
      'Europaparlamentets 90-dagars retrospektiv — koalitionsbana, dossierflöde, avvikande röster och rullande politisk-risk-trend',
  }),
  da: (quarter) => ({
    title: `Kvartalet i Overblik: ${quarter}`,
    subtitle:
      'Europa-Parlamentets 90-dages tilbageblik — koalitionsbane, dossiergennemløb, afvigende afstemninger og rullende politisk risikotrend',
  }),
  no: (quarter) => ({
    title: `Kvartalet i Tilbakeblikk: ${quarter}`,
    subtitle:
      'Europaparlamentets 90-dagers tilbakeblikk — koalisjonsbane, dossiergjennomstrømning, avvikende stemmer og rullende politisk risikotrend',
  }),
  fi: (quarter) => ({
    title: `Neljänneksen Katsaus: ${quarter}`,
    subtitle:
      'Euroopan parlamentin 90 päivän retrospektiivi — koalitiokehitys, asiakokonaisuuksien läpivirtaus, poikkeavat äänestykset ja rullaava poliittinen riskitrendi',
  }),
  de: (quarter) => ({
    title: `Quartal im Rückblick: ${quarter}`,
    subtitle:
      'Quartalsrückblick des Europäischen Parlaments — Koalitionstrajektorie, Dossier-Durchsatzdelta, anomale Abstimmungen und rollende Politikrisiko-Tendenz',
  }),
  fr: (quarter) => ({
    title: `Trimestre en Revue: ${quarter}`,
    subtitle:
      'Rétrospective trimestrielle du Parlement européen — trajectoire de coalition, delta de débit des dossiers, votes atypiques et tendance glissante du risque politique',
  }),
  es: (quarter) => ({
    title: `Trimestre en Revisión: ${quarter}`,
    subtitle:
      'Retrospectiva trimestral del Parlamento Europeo — trayectoria de coalición, delta de rendimiento de expedientes, votos anómalos y tendencia rodante de riesgo político',
  }),
  nl: (quarter) => ({
    title: `Kwartaal in Overzicht: ${quarter}`,
    subtitle:
      'Kwartaalterugblik Europees Parlement — coalitietraject, dossier­doorstroomdelta, afwijkende stemmingen en rolling politieke-risicotrend',
  }),
  ar: (quarter) => ({
    title: `مراجعة الربع: ${quarter}`,
    subtitle:
      'استعراض ربعي للبرلمان الأوروبي على مدى 90 يومًا — مسار التحالف، فارق إنتاجية الملفات، الأصوات الشاذّة، اتجاه مخاطر سياسية متحرك',
  }),
  he: (quarter) => ({
    title: `סקירת הרבעון: ${quarter}`,
    subtitle:
      'סיכום רבעוני של הפרלמנט האירופי — מסלול קואליציה, דלתת תפוקת תיקים, הצבעות חריגות ומגמת סיכון פוליטי מתגלגלת',
  }),
  ja: (quarter) => ({
    title: `四半期レビュー: ${quarter}`,
    subtitle:
      '欧州議会の四半期振り返り — 連立軌道、法案スループット差分、異常投票、ローリング政治リスク傾向',
  }),
  ko: (quarter) => ({
    title: `분기 리뷰: ${quarter}`,
    subtitle: '유럽 의회 분기 회고 — 연정 궤적·법안 처리량 델타·이상 표결·롤링 정치 위험 추세',
  }),
  zh: (quarter) => ({
    title: `季度回顾: ${quarter}`,
    subtitle: '欧洲议会季度回顾 — 联盟轨迹、议题吞吐量增量、异常投票与滚动政治风险趋势',
  }),
};

/** Year ahead title templates per language. `year` is a label like "2026". */
export const YEAR_AHEAD_TITLES: LanguageMap<(year: string) => LangTitleSubtitle> = {
  en: (year) => ({
    title: `Year Ahead: ${year}`,
    subtitle:
      'European Parliament annual strategic outlook — Commission Work Programme, Trio Presidency, legislative priorities and 12-month risk surfaces',
  }),
  sv: (year) => ({
    title: `Året Framåt: ${year}`,
    subtitle:
      'Europaparlamentets årliga strategiska utsikt — kommissionens arbetsprogram, trio-ordförandeskap, lagstiftningsprioriteringar och 12-månaders riskytor',
  }),
  da: (year) => ({
    title: `Året Fremover: ${year}`,
    subtitle:
      'Europa-Parlamentets årlige strategiske udsigt — Kommissionens arbejdsprogram, trio-formandskab, lovgivningsprioriteter og 12-måneders risikoflader',
  }),
  no: (year) => ({
    title: `Året Fremover: ${year}`,
    subtitle:
      'Europaparlamentets årlige strategiske utsikt — Kommisjonens arbeidsprogram, trio-formannskap, lovgivningsprioriteringer og 12-måneders risikoflater',
  }),
  fi: (year) => ({
    title: `Tuleva Vuosi: ${year}`,
    subtitle:
      'Euroopan parlamentin vuosittainen strateginen katsaus — komission työohjelma, kolmikon puheenjohtajakausi, lainsäädäntöprioriteetit ja 12 kuukauden riskipinnat',
  }),
  de: (year) => ({
    title: `Jahr Voraus: ${year}`,
    subtitle:
      'Strategischer Jahresausblick des Europäischen Parlaments — Arbeitsprogramm der Kommission, Trio-Präsidentschaft, Gesetzgebungsprioritäten und 12-Monats-Risikoflächen',
  }),
  fr: (year) => ({
    title: `Année à Venir: ${year}`,
    subtitle:
      'Perspectives stratégiques annuelles du Parlement européen — programme de travail de la Commission, Trio de présidences, priorités législatives et surfaces de risque à 12 mois',
  }),
  es: (year) => ({
    title: `Año por Delante: ${year}`,
    subtitle:
      'Perspectiva estratégica anual del Parlamento Europeo — Programa de Trabajo de la Comisión, Trío de Presidencias, prioridades legislativas y superficies de riesgo a 12 meses',
  }),
  nl: (year) => ({
    title: `Jaar Vooruit: ${year}`,
    subtitle:
      'Strategische jaarvooruitblik Europees Parlement — werkprogramma van de Commissie, Trio-Voorzitterschap, wetgevingsprioriteiten en 12-maands risicovlakken',
  }),
  ar: (year) => ({
    title: `السنة القادمة: ${year}`,
    subtitle:
      'النظرة الاستراتيجية السنوية للبرلمان الأوروبي — برنامج عمل المفوضية، رئاسة الترويكا، الأولويات التشريعية وأسطح المخاطر لـ 12 شهرًا',
  }),
  he: (year) => ({
    title: `השנה הקרובה: ${year}`,
    subtitle:
      'תחזית אסטרטגית שנתית של הפרלמנט האירופי — תוכנית עבודת הנציבות, נשיאות הטריו, סדרי עדיפויות חקיקתיים ומשטחי סיכון ל־12 חודשים',
  }),
  ja: (year) => ({
    title: `来年の展望: ${year}`,
    subtitle:
      '欧州議会の年次戦略アウトルック — 委員会作業計画、トリオ議長国、立法優先事項、12 か月の戦略リスク面',
  }),
  ko: (year) => ({
    title: `다가오는 해: ${year}`,
    subtitle:
      '유럽 의회 연간 전략 전망 — 집행위 작업 프로그램·트리오 의장국·입법 우선순위·12개월 전략 위험 표면',
  }),
  zh: (year) => ({
    title: `来年展望: ${year}`,
    subtitle: '欧洲议会年度战略展望 — 欧委会工作方案、三主席国、立法优先事项与 12 个月战略风险面',
  }),
};

/** Year in review title templates per language. */
export const YEAR_IN_REVIEW_TITLES: LanguageMap<(year: string) => LangTitleSubtitle> = {
  en: (year) => ({
    title: `Year in Review: ${year}`,
    subtitle:
      'European Parliament annual retrospective — coalition maps, dossier throughput, mandate-fulfilment scorecard and cumulative political-risk trajectory',
  }),
  sv: (year) => ({
    title: `Året i Korthet: ${year}`,
    subtitle:
      'Europaparlamentets årliga retrospektiv — koalitionskartor, dossiergenomströmning, mandatleverans och kumulativ politisk-risk-bana',
  }),
  da: (year) => ({
    title: `Året i Overblik: ${year}`,
    subtitle:
      'Europa-Parlamentets årlige tilbageblik — koalitionskort, dossiergennemløb, mandatopfyldelse og kumulativt politisk risikoforløb',
  }),
  no: (year) => ({
    title: `Året i Tilbakeblikk: ${year}`,
    subtitle:
      'Europaparlamentets årlige tilbakeblikk — koalisjonskart, dossiergjennomstrømning, mandatlevering og kumulativ politisk risikobane',
  }),
  fi: (year) => ({
    title: `Vuosikatsaus: ${year}`,
    subtitle:
      'Euroopan parlamentin vuosi­katsaus — koalitio­kartat, asiakokonaisuuksien läpivirtaus, mandaatin täyttyminen ja kumulatiivinen poliittinen riskipolku',
  }),
  de: (year) => ({
    title: `Jahr im Rückblick: ${year}`,
    subtitle:
      'Jahresrückblick des Europäischen Parlaments — Koalitionskarten, Dossier-Durchsatz, Mandatserfüllung und kumulative Politikrisiko-Trajektorie',
  }),
  fr: (year) => ({
    title: `Année en Revue: ${year}`,
    subtitle:
      'Rétrospective annuelle du Parlement européen — cartes de coalitions, débit des dossiers, livraison du mandat et trajectoire cumulative du risque politique',
  }),
  es: (year) => ({
    title: `Año en Revisión: ${year}`,
    subtitle:
      'Retrospectiva anual del Parlamento Europeo — mapas de coaliciones, rendimiento de expedientes, cumplimiento del mandato y trayectoria acumulada de riesgo político',
  }),
  nl: (year) => ({
    title: `Jaar in Overzicht: ${year}`,
    subtitle:
      'Jaaroverzicht Europees Parlement — coalitiekaarten, dossierdoorstroom, mandaatvervulling en cumulatief politiek-risicotraject',
  }),
  ar: (year) => ({
    title: `مراجعة السنة: ${year}`,
    subtitle:
      'استعراض سنوي للبرلمان الأوروبي — خرائط تحالف، إنتاجية ملفات، تنفيذ التفويض ومسار مخاطر سياسية تراكمي',
  }),
  he: (year) => ({
    title: `סקירת השנה: ${year}`,
    subtitle:
      'סיכום שנתי של הפרלמנט האירופי — מפות קואליציה, תפוקת תיקים, מימוש מנדט ומסלול סיכון פוליטי מצטבר',
  }),
  ja: (year) => ({
    title: `年間レビュー: ${year}`,
    subtitle:
      '欧州議会の年間振り返り — 連立マップ、法案スループット、公約実現スコアカード、累積政治リスク軌道',
  }),
  ko: (year) => ({
    title: `연간 리뷰: ${year}`,
    subtitle:
      '유럽 의회 연간 회고 — 연정 지도·법안 처리량·공약 이행 스코어카드·누적 정치 위험 궤적',
  }),
  zh: (year) => ({
    title: `年度回顾: ${year}`,
    subtitle: '欧洲议会年度回顾 — 联盟图谱、议题吞吐量、政纲履行计分卡与累计政治风险轨迹',
  }),
};

/** Term outlook title templates per language. `term` is a label like "EP10 to 2029". */
export const TERM_OUTLOOK_TITLES: LanguageMap<(term: string) => LangTitleSubtitle> = {
  en: (term) => ({
    title: `Term Outlook: ${term}`,
    subtitle:
      'European Parliament multi-year electoral outlook — coalition trajectory, mandate-delivery progress, Spitzenkandidaten signals and seat-projection bands',
  }),
  sv: (term) => ({
    title: `Mandatperiodens Utsikt: ${term}`,
    subtitle:
      'Europaparlamentets fleråriga valutsikt — koalitionsbana, mandatleverans, Spitzenkandidaten-signaler och mandatprognosband',
  }),
  da: (term) => ({
    title: `Valgperiodens Udsigt: ${term}`,
    subtitle:
      'Europa-Parlamentets flerårige valgudsigt — koalitionsbane, mandatleverance, Spitzenkandidaten-signaler og mandatprognose­bånd',
  }),
  no: (term) => ({
    title: `Valgperiodens Utsikt: ${term}`,
    subtitle:
      'Europaparlamentets flerårige valgutsikt — koalisjonsbane, mandatlevering, Spitzenkandidaten-signaler og mandatprognose­bånd',
  }),
  fi: (term) => ({
    title: `Vaalikauden Näkymä: ${term}`,
    subtitle:
      'Euroopan parlamentin monivuotinen vaalinäkymä — koalitiokehitys, mandaatin toteutuminen, Spitzenkandidaten-signaalit ja paikkaennustekaistat',
  }),
  de: (term) => ({
    title: `Wahlperioden-Ausblick: ${term}`,
    subtitle:
      'Mehrjähriger Wahlausblick des Europäischen Parlaments — Koalitionstrajektorie, Mandatsfortschritt, Spitzenkandidaten-Signale und Sitzprojektionsbänder',
  }),
  fr: (term) => ({
    title: `Perspective de Législature: ${term}`,
    subtitle:
      'Perspective électorale pluriannuelle du Parlement européen — trajectoire de coalition, livraison du mandat, signaux Spitzenkandidaten et fourchettes de projection de sièges',
  }),
  es: (term) => ({
    title: `Perspectiva de Legislatura: ${term}`,
    subtitle:
      'Perspectiva electoral plurianual del Parlamento Europeo — trayectoria de coalición, cumplimiento del mandato, señales Spitzenkandidaten y bandas de proyección de escaños',
  }),
  nl: (term) => ({
    title: `Zittingsperiode-Vooruitzicht: ${term}`,
    subtitle:
      'Meerjarig verkiezingsvooruitzicht Europees Parlement — coalitietraject, mandaatvoortgang, Spitzenkandidaten-signalen en zetelprojectie­banden',
  }),
  ar: (term) => ({
    title: `آفاق الدورة البرلمانية: ${term}`,
    subtitle:
      'النظرة الانتخابية متعدّدة السنوات للبرلمان الأوروبي — مسار التحالف، تقدّم تنفيذ التفويض، إشارات المرشّحين الرئيسيين، ونطاقات إسقاط المقاعد',
  }),
  he: (term) => ({
    title: `תחזית כהונה: ${term}`,
    subtitle:
      'תחזית רב־שנתית של הפרלמנט האירופי — מסלול קואליציה, מימוש מנדט, סיגנלי מועמדי־צמרת וטווחי תחזית מושבים',
  }),
  ja: (term) => ({
    title: `会期展望: ${term}`,
    subtitle:
      '欧州議会の複数年選挙アウトルック — 連立軌道、公約実現進捗、Spitzenkandidaten シグナル、議席投影帯',
  }),
  ko: (term) => ({
    title: `의회 임기 전망: ${term}`,
    subtitle:
      '유럽 의회 다년간 전망 — 연정 궤적·공약 이행 진척·Spitzenkandidaten 시그널·의석 투영 구간',
  }),
  zh: (term) => ({
    title: `议会任期展望: ${term}`,
    subtitle: '欧洲议会多年期展望 — 联盟轨迹、政纲履行进度、Spitzenkandidaten 信号与议席投射区间',
  }),
};

/** Election cycle title templates per language. `cycle` is a label like "EP10 → EP11 (2029)". */
export const ELECTION_CYCLE_TITLES: LanguageMap<(cycle: string) => LangTitleSubtitle> = {
  en: (cycle) => ({
    title: `Election Cycle: ${cycle}`,
    subtitle:
      'European Parliament dual electoral brief — term-retrospective scorecard paired with seat projections, coalition viability and Spitzenkandidaten arithmetic',
  }),
  sv: (cycle) => ({
    title: `Valcykel: ${cycle}`,
    subtitle:
      'Dubbelbrief Europaparlamentsval — retrospektiv mandatperiod med mandatprognoser, koalitionslivskraft och Spitzenkandidaten-aritmetik',
  }),
  da: (cycle) => ({
    title: `Valgcyklus: ${cycle}`,
    subtitle:
      'Dobbelt-brief om Europa-Parlamentsvalg — retrospektiv valgperiode parret med mandatprojektioner, koalitionslevedygtighed og Spitzenkandidaten-aritmetik',
  }),
  no: (cycle) => ({
    title: `Valgsyklus: ${cycle}`,
    subtitle:
      'Dobbeltbrief om Europaparlamentsvalg — retrospektiv valgperiode kombinert med mandatprojeksjoner, koalisjonslevedyktighet og Spitzenkandidaten-aritmetikk',
  }),
  fi: (cycle) => ({
    title: `Vaalisykli: ${cycle}`,
    subtitle:
      'Euroopan parlamenttivaalien kaksoisbrief — vaalikauden retrospektiivi yhdistettynä paikka­ennusteisiin, koalition elinkelpoisuuteen ja Spitzenkandidaten-aritmetiikkaan',
  }),
  de: (cycle) => ({
    title: `Wahlzyklus: ${cycle}`,
    subtitle:
      'Doppelbrief der EP-Wahl — Wahlperioden-Retrospektive gepaart mit Sitzprognosen, Koalitionstragfähigkeit und Spitzenkandidaten-Arithmetik',
  }),
  fr: (cycle) => ({
    title: `Cycle Électoral: ${cycle}`,
    subtitle:
      'Note duale d’élection européenne — rétrospective de mandature combinée aux projections de sièges, à la viabilité des coalitions et à l’arithmétique des Spitzenkandidaten',
  }),
  es: (cycle) => ({
    title: `Ciclo Electoral: ${cycle}`,
    subtitle:
      'Nota dual de elecciones europeas — retrospectiva de legislatura combinada con proyecciones de escaños, viabilidad de coaliciones y aritmética Spitzenkandidaten',
  }),
  nl: (cycle) => ({
    title: `Verkiezingscyclus: ${cycle}`,
    subtitle:
      'Dubbele EP-verkiezingsbrief — zittingsperiode-retrospectief gekoppeld aan zetelprojecties, coalitielevensvatbaarheid en Spitzenkandidaten-rekenkunde',
  }),
  ar: (cycle) => ({
    title: `الدورة الانتخابية: ${cycle}`,
    subtitle:
      'ملخّص مزدوج للانتخابات الأوروبية — استعراض رجعي للدورة مرفقًا بإسقاطات مقاعد ومصفوفة جدوى التحالفات وحساب المرشحين الرئيسيين',
  }),
  he: (cycle) => ({
    title: `מחזור בחירות: ${cycle}`,
    subtitle:
      'תקציר כפול לבחירות הפרלמנט האירופי — סיכום כהונה במשולב עם תחזיות מושבים, כדאיות קואליציה וחשבון מועמדי־צמרת',
  }),
  ja: (cycle) => ({
    title: `選挙サイクル: ${cycle}`,
    subtitle:
      '欧州議会選挙の二部構成ブリーフ — 会期の振り返りに議席投影・連立可行性・Spitzenkandidaten 算術を併記',
  }),
  ko: (cycle) => ({
    title: `선거 주기: ${cycle}`,
    subtitle:
      '유럽 의회 선거 이중 브리프 — 임기 회고에 의석 투영·연정 실현가능성·Spitzenkandidaten 산술 결합',
  }),
  zh: (cycle) => ({
    title: `选举周期: ${cycle}`,
    subtitle: '欧洲议会双重选举简报 — 任期回顾结合议席投射、联盟可行性与 Spitzenkandidaten 算术',
  }),
};

/** Motions title templates per language */
