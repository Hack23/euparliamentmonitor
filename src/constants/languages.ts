// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/Languages
 * @description Consolidated language data for all 14 EU languages.
 * Single source of truth for language names, translations, and presets.
 */

import type {
  LanguageCode,
  LanguageMap,
  LanguagePreset,
  ArticleTypeLabels,
  LangTitleSubtitle,
  PropositionsStrings,
} from '../types/index.js';

/** All supported language codes */
export const ALL_LANGUAGES: readonly LanguageCode[] = [
  'en',
  'de',
  'fr',
  'es',
  'it',
  'nl',
  'pl',
  'pt',
  'ro',
  'sv',
  'da',
  'fi',
  'el',
  'hu',
] as const;

/** Language presets for quick selection */
export const LANGUAGE_PRESETS: Record<LanguagePreset, readonly LanguageCode[]> = {
  all: ALL_LANGUAGES,
  'eu-core': ['en', 'de', 'fr', 'es', 'it', 'nl'],
  nordic: ['en', 'sv', 'da', 'fi'],
};

/** Native language names */
export const LANGUAGE_NAMES: LanguageMap = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
  nl: 'Nederlands',
  pl: 'Polski',
  pt: 'Português',
  ro: 'Română',
  sv: 'Svenska',
  da: 'Dansk',
  fi: 'Suomi',
  el: 'Ελληνικά',
  hu: 'Magyar',
};

/** Page titles per language */
export const PAGE_TITLES: LanguageMap = {
  en: 'EU Parliament Monitor - News',
  de: 'EU-Parlamentsmonitor - Nachrichten',
  fr: 'Moniteur du Parlement UE - Actualités',
  es: 'Monitor del Parlamento UE - Noticias',
  it: 'Monitor del Parlamento UE - Notizie',
  nl: 'EU Parlementsmonitor - Nieuws',
  pl: 'Monitor Parlamentu UE - Wiadomości',
  pt: 'Monitor do Parlamento UE - Notícias',
  ro: 'Monitor al Parlamentului UE - Știri',
  sv: 'EU-parlamentsmonitor - Nyheter',
  da: 'EU-parlamentsmonitor - Nyheder',
  fi: 'EU-parlamentin seuranta - Uutiset',
  el: 'Παρακολούθηση Κοινοβουλίου ΕΕ - Νέα',
  hu: 'EU Parlamenti Figyelő - Hírek',
};

/** Page descriptions per language */
export const PAGE_DESCRIPTIONS: LanguageMap = {
  en: 'Latest news and analysis about European Parliament activities',
  de: 'Neueste Nachrichten und Analysen zu den Aktivitäten des Europäischen Parlaments',
  fr: 'Dernières nouvelles et analyses sur les activités du Parlement européen',
  es: 'Últimas noticias y análisis sobre las actividades del Parlamento Europeo',
  it: 'Ultime notizie e analisi sulle attività del Parlamento europeo',
  nl: 'Laatste nieuws en analyses over activiteiten van het Europees Parlement',
  pl: 'Najnowsze wiadomości i analizy dotyczące działań Parlamentu Europejskiego',
  pt: 'Últimas notícias e análises sobre as atividades do Parlamento Europeu',
  ro: 'Ultimele știri și analize despre activitățile Parlamentului European',
  sv: 'Senaste nyheterna och analyser om Europaparlamentets verksamhet',
  da: 'Seneste nyheder og analyser om Europa-Parlamentets aktiviteter',
  fi: 'Viimeisimmät uutiset ja analyysit Euroopan parlamentin toiminnasta',
  el: 'Τελευταία νέα και αναλύσεις για τις δραστηριότητες του Ευρωπαϊκού Κοινοβουλίου',
  hu: 'Legfrissebb hírek és elemzések az Európai Parlament tevékenységeiről',
};

/** Section headings per language */
export const SECTION_HEADINGS: LanguageMap = {
  en: 'Latest News',
  de: 'Neueste Nachrichten',
  fr: 'Dernières Actualités',
  es: 'Últimas Noticias',
  it: 'Ultime Notizie',
  nl: 'Laatste Nieuws',
  pl: 'Najnowsze Wiadomości',
  pt: 'Últimas Notícias',
  ro: 'Ultimele Știri',
  sv: 'Senaste Nyheterna',
  da: 'Seneste Nyheder',
  fi: 'Viimeisimmät Uutiset',
  el: 'Τελευταία Νέα',
  hu: 'Legfrissebb Hírek',
};

/** "No articles" messages per language */
export const NO_ARTICLES_MESSAGES: LanguageMap = {
  en: 'No articles available yet.',
  de: 'Noch keine Artikel verfügbar.',
  fr: 'Aucun article disponible pour le moment.',
  es: 'Aún no hay artículos disponibles.',
  it: 'Nessun articolo disponibile al momento.',
  nl: 'Nog geen artikelen beschikbaar.',
  pl: 'Nie ma jeszcze dostępnych artykułów.',
  pt: 'Ainda não há artigos disponíveis.',
  ro: 'Nu sunt încă articole disponibile.',
  sv: 'Inga artiklar tillgängliga ännu.',
  da: 'Ingen artikler tilgængelige endnu.',
  fi: 'Ei vielä saatavilla olevia artikkeleita.',
  el: 'Δεν υπάρχουν ακόμα διαθέσιμα άρθρα.',
  hu: 'Még nincsenek elérhető cikkek.',
};

/** Article type labels per language */
export const ARTICLE_TYPE_LABELS: LanguageMap<ArticleTypeLabels> = {
  en: { prospective: 'Week Ahead', retrospective: 'Analysis', breaking: 'Breaking News' },
  de: { prospective: 'Woche Voraus', retrospective: 'Analyse', breaking: 'Eilmeldung' },
  fr: { prospective: 'Semaine à Venir', retrospective: 'Analyse', breaking: 'Dernières Nouvelles' },
  es: {
    prospective: 'Semana Próxima',
    retrospective: 'Análisis',
    breaking: 'Noticias de Última Hora',
  },
  it: { prospective: 'Settimana Prossima', retrospective: 'Analisi', breaking: 'Ultime Notizie' },
  nl: { prospective: 'Week Vooruit', retrospective: 'Analyse', breaking: 'Laatste Nieuws' },
  pl: {
    prospective: 'Nadchodzący Tydzień',
    retrospective: 'Analiza',
    breaking: 'Najnowsze Wiadomości',
  },
  pt: {
    prospective: 'Semana Próxima',
    retrospective: 'Análise',
    breaking: 'Notícias de Última Hora',
  },
  ro: {
    prospective: 'Săptămâna Viitoare',
    retrospective: 'Analiză',
    breaking: 'Știri de Ultimă Oră',
  },
  sv: { prospective: 'Vecka Framåt', retrospective: 'Analys', breaking: 'Senaste Nytt' },
  da: { prospective: 'Ugen Fremover', retrospective: 'Analyse', breaking: 'Seneste Nyt' },
  fi: { prospective: 'Tuleva Viikko', retrospective: 'Analyysi', breaking: 'Uusimmat Uutiset' },
  el: { prospective: 'Επόμενη Εβδομάδα', retrospective: 'Ανάλυση', breaking: 'Τελευταία Νέα' },
  hu: { prospective: 'Következő Hét', retrospective: 'Elemzés', breaking: 'Legfrissebb Hírek' },
};

/** Read time label formatters per language */
export const READ_TIME_LABELS: LanguageMap<(time: number) => string> = {
  en: (time: number) => `${time} min read`,
  de: (time: number) => `${time} Min. Lesezeit`,
  fr: (time: number) => `${time} min de lecture`,
  es: (time: number) => `${time} min de lectura`,
  it: (time: number) => `${time} min di lettura`,
  nl: (time: number) => `${time} min leestijd`,
  pl: (time: number) => `${time} min czytania`,
  pt: (time: number) => `${time} min de leitura`,
  ro: (time: number) => `${time} min de citit`,
  sv: (time: number) => `${time} min läsning`,
  da: (time: number) => `${time} min læsetid`,
  fi: (time: number) => `${time} min lukuaika`,
  el: (time: number) => `${time} λεπτά ανάγνωσης`,
  hu: (time: number) => `${time} perc olvasás`,
};

/** Back to news link labels per language */
export const BACK_TO_NEWS_LABELS: LanguageMap = {
  en: '← Back to News',
  de: '← Zurück zu Nachrichten',
  fr: '← Retour aux Actualités',
  es: '← Volver a Noticias',
  it: '← Torna alle Notizie',
  nl: '← Terug naar Nieuws',
  pl: '← Powrót do Wiadomości',
  pt: '← Voltar às Notícias',
  ro: '← Înapoi la Știri',
  sv: '← Tillbaka till Nyheter',
  da: '← Tilbage til Nyheder',
  fi: '← Takaisin Uutisiin',
  el: '← Πίσω στα Νέα',
  hu: '← Vissza a Hírekhez',
};

/** Week ahead title templates per language */
export const WEEK_AHEAD_TITLES: LanguageMap<(start: string, end: string) => LangTitleSubtitle> = {
  en: (start, end) => ({
    title: `Week Ahead: ${start} to ${end}`,
    subtitle:
      'European Parliament calendar, committee meetings, and plenary debates for the coming week',
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
  it: (start, end) => ({
    title: `Settimana Prossima: ${start} a ${end}`,
    subtitle:
      'Calendario del Parlamento europeo, riunioni di commissione e dibattiti plenari per la prossima settimana',
  }),
  nl: (start, end) => ({
    title: `Week Vooruit: ${start} tot ${end}`,
    subtitle:
      'Europees Parlement kalender, commissievergaderingen en plenaire debatten voor de komende week',
  }),
  pl: (start, end) => ({
    title: `Nadchodzący Tydzień: ${start} do ${end}`,
    subtitle:
      'Kalendarz Parlamentu Europejskiego, posiedzenia komisji i debaty plenarne na nadchodzący tydzień',
  }),
  pt: (start, end) => ({
    title: `Semana Próxima: ${start} a ${end}`,
    subtitle:
      'Calendário do Parlamento Europeu, reuniões de comissão e debates plenários para a próxima semana',
  }),
  ro: (start, end) => ({
    title: `Săptămâna Viitoare: ${start} până ${end}`,
    subtitle:
      'Calendarul Parlamentului European, întâlniri ale comisiilor și dezbateri plenare pentru săptămâna viitoare',
  }),
  sv: (start, end) => ({
    title: `Vecka Framåt: ${start} till ${end}`,
    subtitle: 'Europaparlamentets kalender, utskottsmöten och plenardebatter för kommande vecka',
  }),
  da: (start, end) => ({
    title: `Ugen Fremover: ${start} til ${end}`,
    subtitle: 'Europa-Parlamentets kalender, udvalgsmøder og plenardebatter for den kommende uge',
  }),
  fi: (start, end) => ({
    title: `Tuleva Viikko: ${start} - ${end}`,
    subtitle:
      'Euroopan parlamentin kalenteri, valiokuntien kokoukset ja täysistuntokeskustelut tulevalle viikolle',
  }),
  el: (start, end) => ({
    title: `Επόμενη Εβδομάδα: ${start} έως ${end}`,
    subtitle:
      'Ημερολόγιο Ευρωπαϊκού Κοινοβουλίου, συνεδριάσεις επιτροπών και ολομέλειες για την επόμενη εβδομάδα',
  }),
  hu: (start, end) => ({
    title: `Következő Hét: ${start} - ${end}`,
    subtitle: 'Európai Parlament naptár, bizottsági ülések és plenáris viták a jövő hétre',
  }),
};

/** Breaking news title templates per language */
export const BREAKING_NEWS_TITLES: LanguageMap<(date: string) => LangTitleSubtitle> = {
  en: (date) => ({
    title: `Breaking: Significant Parliamentary Developments — ${date}`,
    subtitle: 'Intelligence analysis of voting anomalies, coalition shifts, and key MEP activities',
  }),
  de: (date) => ({
    title: `Eilmeldung: Bedeutende Parlamentarische Entwicklungen — ${date}`,
    subtitle:
      'Geheimdienstliche Analyse von Abstimmungsanomalien, Koalitionsverschiebungen und wichtigen MEP-Aktivitäten',
  }),
  fr: (date) => ({
    title: `Dernières Nouvelles: Développements Parlementaires Significatifs — ${date}`,
    subtitle:
      'Analyse de renseignements sur les anomalies de vote, les évolutions des coalitions et les activités clés des eurodéputés',
  }),
  es: (date) => ({
    title: `Última Hora: Desarrollos Parlamentarios Significativos — ${date}`,
    subtitle:
      'Análisis de inteligencia sobre anomalías en votaciones, cambios en coaliciones y actividades clave de eurodiputados',
  }),
  it: (date) => ({
    title: `Ultime Notizie: Sviluppi Parlamentari Significativi — ${date}`,
    subtitle:
      "Analisi dell'intelligence su anomalie di voto, cambiamenti nelle coalizioni e attività chiave degli eurodeputati",
  }),
  nl: (date) => ({
    title: `Laatste Nieuws: Significante Parlementaire Ontwikkelingen — ${date}`,
    subtitle:
      'Inlichtingenanalyse van stemanomalieën, coalitieverschuivingen en belangrijke MEP-activiteiten',
  }),
  pl: (date) => ({
    title: `Najnowsze Wiadomości: Znaczące Wydarzenia Parlamentarne — ${date}`,
    subtitle:
      'Analiza wywiadowcza anomalii głosowań, zmian koalicyjnych i kluczowych działań europosłów',
  }),
  pt: (date) => ({
    title: `Notícias de Última Hora: Desenvolvimentos Parlamentares Significativos — ${date}`,
    subtitle:
      'Análise de inteligência sobre anomalias de votação, mudanças em coalizões e atividades-chave de eurodeputados',
  }),
  ro: (date) => ({
    title: `Știri de Ultimă Oră: Evoluții Parlamentare Semnificative — ${date}`,
    subtitle:
      'Analiză de informații privind anomaliile de vot, schimbările de coaliție și activitățile-cheie ale eurodeputaților',
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
  fi: (date) => ({
    title: `Uusimmat Uutiset: Merkittäviä Parlamentaarisia Kehityksiä — ${date}`,
    subtitle:
      'Tiedusteluanalyysi äänestyspoikkeamista, koalitiomuutoksista ja keskeisistä MEP-toimista',
  }),
  el: (date) => ({
    title: `Τελευταία Νέα: Σημαντικές Κοινοβουλευτικές Εξελίξεις — ${date}`,
    subtitle:
      'Ανάλυση πληροφοριών για ψηφοφορικές ανωμαλίες, μετατοπίσεις συνασπισμών και βασικές δραστηριότητες ευρωβουλευτών',
  }),
  hu: (date) => ({
    title: `Legfrissebb Hírek: Jelentős Parlamenti Fejlemények — ${date}`,
    subtitle:
      'Hírszerzési elemzés szavazási rendellenességekről, koalíciós eltolódásokról és kulcsfontosságú EP-képviselői tevékenységekről',
  }),
};

/** Propositions article title templates per language */
export const PROPOSITIONS_TITLES: LanguageMap<() => LangTitleSubtitle> = {
  en: () => ({
    title: 'Legislative Proposals: European Parliament Monitor',
    subtitle:
      'Recent legislative proposals, procedure tracking, and pipeline status in the European Parliament',
  }),
  de: () => ({
    title: 'Gesetzgebungsvorschläge: Europäisches Parlament Monitor',
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
  it: () => ({
    title: 'Proposte Legislative: Monitor del Parlamento Europeo',
    subtitle:
      'Proposte legislative recenti, monitoraggio delle procedure e stato della pipeline nel Parlamento europeo',
  }),
  nl: () => ({
    title: 'Wetgevingsvoorstellen: EU Parlementsmonitor',
    subtitle:
      'Recente wetgevingsvoorstellen, procedurebewaking en pipeline-status in het Europees Parlement',
  }),
  pl: () => ({
    title: 'Propozycje Legislacyjne: Monitor Parlamentu Europejskiego',
    subtitle:
      'Ostatnie propozycje legislacyjne, śledzenie procedur i status pipeline w Parlamencie Europejskim',
  }),
  pt: () => ({
    title: 'Propostas Legislativas: Monitor do Parlamento Europeu',
    subtitle:
      'Propostas legislativas recentes, acompanhamento de procedimentos e estado do pipeline no Parlamento Europeu',
  }),
  ro: () => ({
    title: 'Propuneri Legislative: Monitor al Parlamentului European',
    subtitle:
      'Propuneri legislative recente, urmărirea procedurilor și starea pipeline-ului în Parlamentul European',
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
  fi: () => ({
    title: 'Lainsäädäntöehdotukset: EU-parlamentin seuranta',
    subtitle:
      'Viimeisimmät lainsäädäntöehdotukset, menettelyseuranta ja pipeline-tila Euroopan parlamentissa',
  }),
  el: () => ({
    title: 'Νομοθετικές Προτάσεις: Παρακολούθηση Ευρωπαϊκού Κοινοβουλίου',
    subtitle:
      'Πρόσφατες νομοθετικές προτάσεις, παρακολούθηση διαδικασιών και κατάσταση αγωγού στο Ευρωπαϊκό Κοινοβούλιο',
  }),
  hu: () => ({
    title: 'Jogalkotási Javaslatok: EU Parlamenti Figyelő',
    subtitle:
      'Legfrissebb jogalkotási javaslatok, eljáráskövetés és csővezeték-állapot az Európai Parlamentben',
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
  },
  de: {
    lede: 'Das Europäische Parlament bearbeitet aktiv mehrere Gesetzgebungsvorschläge in wichtigen Politikbereichen. Dieser Bericht verfolgt aktuelle Vorschläge, ihren Verfahrensstatus und die gesamte Gesetzgebungspipeline.',
    proposalsHeading: 'Aktuelle Gesetzgebungsvorschläge',
    pipelineHeading: 'Überblick über die Gesetzgebungspipeline',
    procedureHeading: 'Verfahrensstatus',
    analysisHeading: 'Folgenabschätzung',
    analysis:
      'Die aktuelle Gesetzgebungstätigkeit spiegelt die Prioritäten des Parlaments in nachhaltiger Finanzierung, digitaler Governance und Umweltpolitik wider. Die Verfolgung dieser Vorschläge hilft Bürgern und Interessengruppen, den Gesetzgebungspfad der EU zu verstehen.',
  },
  fr: {
    lede: "Le Parlement européen traite activement de multiples propositions législatives dans des domaines politiques clés. Ce rapport suit les propositions actuelles, leur statut procédural et l'état global du pipeline législatif.",
    proposalsHeading: 'Propositions Législatives Récentes',
    pipelineHeading: "Vue d'ensemble du Pipeline Législatif",
    procedureHeading: 'Statut de la Procédure',
    analysisHeading: "Évaluation de l'Impact",
    analysis:
      "L'activité législative actuelle reflète les priorités du Parlement en matière de finance durable, de gouvernance numérique et de politique environnementale. Le suivi de ces propositions aide les citoyens et les parties prenantes à comprendre la trajectoire législative de l'UE.",
  },
  es: {
    lede: 'El Parlamento Europeo está procesando activamente múltiples propuestas legislativas en áreas clave de política. Este informe rastrea las propuestas actuales, su estado de procedimiento y el estado general del pipeline legislativo.',
    proposalsHeading: 'Propuestas Legislativas Recientes',
    pipelineHeading: 'Descripción General del Pipeline Legislativo',
    procedureHeading: 'Estado del Procedimiento',
    analysisHeading: 'Evaluación de Impacto',
    analysis:
      'La actividad legislativa actual refleja las prioridades del Parlamento en finanzas sostenibles, gobernanza digital y política ambiental. Rastrear estas propuestas ayuda a los ciudadanos y partes interesadas a comprender la trayectoria legislativa de la UE.',
  },
  it: {
    lede: 'Il Parlamento europeo sta elaborando attivamente molteplici proposte legislative in settori politici chiave. Questo rapporto traccia le proposte attuali, il loro stato procedurale e lo stato complessivo della pipeline legislativa.',
    proposalsHeading: 'Proposte Legislative Recenti',
    pipelineHeading: 'Panoramica della Pipeline Legislativa',
    procedureHeading: 'Stato della Procedura',
    analysisHeading: "Valutazione d'Impatto",
    analysis:
      "L'attività legislativa attuale riflette le priorità del Parlamento in materia di finanza sostenibile, governance digitale e politica ambientale. Tracciare queste proposte aiuta cittadini e parti interessate a comprendere la traiettoria legislativa dell'UE.",
  },
  nl: {
    lede: 'Het Europees Parlement behandelt actief meerdere wetgevende voorstellen op belangrijke beleidsterreinen. Dit rapport volgt huidige voorstellen, hun procedurestatus en de algehele wetgevende pipeline.',
    proposalsHeading: 'Recente Wetgevingsvoorstellen',
    pipelineHeading: 'Overzicht van de Wetgevende Pipeline',
    procedureHeading: 'Procedurestatus',
    analysisHeading: 'Impactbeoordeling',
    analysis:
      'De huidige wetgevende activiteit weerspiegelt de prioriteiten van het Parlement op het gebied van duurzame financiering, digitaal bestuur en milieubeleid. Het volgen van deze voorstellen helpt burgers en belanghebbenden de wetgevende koers van de EU te begrijpen.',
  },
  pl: {
    lede: 'Parlament Europejski aktywnie przetwarza wiele propozycji legislacyjnych w kluczowych obszarach politycznych. Niniejszy raport śledzi aktualne propozycje, ich status proceduralny i ogólny stan pipeline legislacyjnego.',
    proposalsHeading: 'Ostatnie Propozycje Legislacyjne',
    pipelineHeading: 'Przegląd Pipeline Legislacyjnego',
    procedureHeading: 'Status Procedury',
    analysisHeading: 'Ocena Wpływu',
    analysis:
      'Obecna działalność legislacyjna odzwierciedla priorytety Parlamentu w zakresie zrównoważonych finansów, zarządzania cyfrowego i polityki środowiskowej. Śledzenie tych propozycji pomaga obywatelom i zainteresowanym stronom zrozumieć kierunek legislacyjny UE.',
  },
  pt: {
    lede: 'O Parlamento Europeu está processando ativamente múltiplas propostas legislativas em áreas políticas importantes. Este relatório acompanha as propostas atuais, seu status de procedimento e o estado geral do pipeline legislativo.',
    proposalsHeading: 'Propostas Legislativas Recentes',
    pipelineHeading: 'Visão Geral do Pipeline Legislativo',
    procedureHeading: 'Status do Procedimento',
    analysisHeading: 'Avaliação de Impacto',
    analysis:
      'A atividade legislativa atual reflete as prioridades do Parlamento em finanças sustentáveis, governança digital e política ambiental. Acompanhar estas propostas ajuda cidadãos e partes interessadas a compreender a trajetória legislativa da UE.',
  },
  ro: {
    lede: 'Parlamentul European procesează activ multiple propuneri legislative în domenii politice cheie. Acest raport urmărește propunerile actuale, statusul lor procedural și starea generală a pipeline-ului legislativ.',
    proposalsHeading: 'Propuneri Legislative Recente',
    pipelineHeading: 'Prezentare Generală a Pipeline-ului Legislativ',
    procedureHeading: 'Starea Procedurii',
    analysisHeading: 'Evaluarea Impactului',
    analysis:
      'Activitatea legislativă actuală reflectă prioritățile Parlamentului în finanțe durabile, guvernanță digitală și politică de mediu. Urmărirea acestor propuneri ajută cetățenii și părțile interesate să înțeleagă traiectoria legislativă a UE.',
  },
  sv: {
    lede: 'Europaparlamentet bearbetar aktivt flera lagstiftningsförslag inom viktiga politikområden. Denna rapport spårar aktuella förslag, deras procedurstatus och det övergripande lagstiftningspipeline-läget.',
    proposalsHeading: 'Senaste Lagstiftningsförslag',
    pipelineHeading: 'Översikt av Lagstiftnings-Pipeline',
    procedureHeading: 'Procedurstatus',
    analysisHeading: 'Konsekvensbedömning',
    analysis:
      'Den nuvarande lagstiftningsverksamheten speglar parlamentets prioriteringar inom hållbar finansiering, digital styrning och miljöpolitik. Att spåra dessa förslag hjälper medborgare och intressenter att förstå EU:s lagstiftningsinriktning.',
  },
  da: {
    lede: 'Europa-Parlamentet behandler aktivt adskillige lovgivningsforslag inden for vigtige politikområder. Denne rapport sporer aktuelle forslag, deres procedurestatus og den overordnede lovgivningspipeline-tilstand.',
    proposalsHeading: 'Seneste Lovgivningsforslag',
    pipelineHeading: 'Oversigt over Lovgivningspipeline',
    procedureHeading: 'Procedurestatus',
    analysisHeading: 'Konsekvensvurdering',
    analysis:
      'Den aktuelle lovgivningsaktivitet afspejler Parlamentets prioriteter inden for bæredygtig finansiering, digital forvaltning og miljøpolitik. Sporing af disse forslag hjælper borgere og interessenter med at forstå EU\'s lovgivningstrajektorie.',
  },
  fi: {
    lede: 'Euroopan parlamentti käsittelee aktiivisesti useita lainsäädäntöehdotuksia keskeisillä politiikka-alueilla. Tämä raportti seuraa ajankohtaisia ehdotuksia, niiden menettelytilaa ja yleistä lainsäädäntöputken tilaa.',
    proposalsHeading: 'Viimeisimmät Lainsäädäntöehdotukset',
    pipelineHeading: 'Lainsäädäntöputken Yleiskatsaus',
    procedureHeading: 'Menettelyn Tila',
    analysisHeading: 'Vaikutustenarviointi',
    analysis:
      'Nykyinen lainsäädäntötoiminta heijastaa parlamentin prioriteetteja kestävässä rahoituksessa, digitaalisessa hallinnossa ja ympäristöpolitiikassa. Näiden ehdotusten seuraaminen auttaa kansalaisia ja sidosryhmiä ymmärtämään EU:n lainsäädäntösuuntaa.',
  },
  el: {
    lede: 'Το Ευρωπαϊκό Κοινοβούλιο επεξεργάζεται ενεργά πολλαπλές νομοθετικές προτάσεις σε βασικούς τομείς πολιτικής. Αυτή η αναφορά παρακολουθεί τις τρέχουσες προτάσεις, την κατάσταση της διαδικασίας τους και τη συνολική κατάσταση του νομοθετικού αγωγού.',
    proposalsHeading: 'Πρόσφατες Νομοθετικές Προτάσεις',
    pipelineHeading: 'Επισκόπηση Νομοθετικού Αγωγού',
    procedureHeading: 'Κατάσταση Διαδικασίας',
    analysisHeading: 'Αξιολόγηση Αντίκτυπου',
    analysis:
      'Η τρέχουσα νομοθετική δραστηριότητα αντικατοπτρίζει τις προτεραιότητες του Κοινοβουλίου στη βιώσιμη χρηματοδότηση, την ψηφιακή διακυβέρνηση και την περιβαλλοντική πολιτική. Η παρακολούθηση αυτών των προτάσεων βοηθά τους πολίτες και τα ενδιαφερόμενα μέρη να κατανοήσουν τη νομοθετική πορεία της ΕΕ.',
  },
  hu: {
    lede: 'Az Európai Parlament aktívan dolgoz fel több jogalkotási javaslatot a főbb szakpolitikai területeken. Ez a jelentés nyomon követi az aktuális javaslatokat, eljárási státuszukat és a jogalkotási csővezeték általános állapotát.',
    proposalsHeading: 'Legfrissebb Jogalkotási Javaslatok',
    pipelineHeading: 'Jogalkotási Csővezeték Áttekintése',
    procedureHeading: 'Eljárás Állapota',
    analysisHeading: 'Hatáselemzés',
    analysis:
      'A jelenlegi jogalkotási tevékenység tükrözi a Parlament prioritásait a fenntartható pénzügyek, a digitális irányítás és a környezetpolitika terén. E javaslatok nyomon követése segít az állampolgároknak és az érdekelt feleknek megérteni az EU jogalkotási irányát.',
  },
};

/**
 * Get a language-specific string with English fallback
 *
 * @param map - Language map to look up
 * @param lang - Language code
 * @returns The language-specific value or English fallback
 */
export function getLocalizedString<T>(map: LanguageMap<T>, lang: string): T {
  const code = lang as LanguageCode;
  return map[code] ?? map.en;
}

/**
 * Check if a language code is supported
 *
 * @param lang - Language code to check
 * @returns True if the language is supported
 */
export function isSupportedLanguage(lang: string): lang is LanguageCode {
  return ALL_LANGUAGES.includes(lang as LanguageCode);
}

/**
 * Determine text direction for a language
 *
 * @param lang - Language code
 * @returns 'rtl' for Arabic/Hebrew, 'ltr' otherwise
 */
export function getTextDirection(lang: string): 'ltr' | 'rtl' {
  return lang === 'ar' || lang === 'he' ? 'rtl' : 'ltr';
}
