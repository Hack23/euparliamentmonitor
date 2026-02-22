// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/** All supported language codes */
export const ALL_LANGUAGES = [
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
];
/** Language presets for quick selection */
export const LANGUAGE_PRESETS = {
    all: ALL_LANGUAGES,
    'eu-core': ['en', 'de', 'fr', 'es', 'it', 'nl'],
    nordic: ['en', 'sv', 'da', 'fi'],
};
/** Native language names */
export const LANGUAGE_NAMES = {
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
export const PAGE_TITLES = {
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
export const PAGE_DESCRIPTIONS = {
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
export const SECTION_HEADINGS = {
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
export const NO_ARTICLES_MESSAGES = {
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
export const ARTICLE_TYPE_LABELS = {
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
export const READ_TIME_LABELS = {
    en: (time) => `${time} min read`,
    de: (time) => `${time} Min. Lesezeit`,
    fr: (time) => `${time} min de lecture`,
    es: (time) => `${time} min de lectura`,
    it: (time) => `${time} min di lettura`,
    nl: (time) => `${time} min leestijd`,
    pl: (time) => `${time} min czytania`,
    pt: (time) => `${time} min de leitura`,
    ro: (time) => `${time} min de citit`,
    sv: (time) => `${time} min läsning`,
    da: (time) => `${time} min læsetid`,
    fi: (time) => `${time} min lukuaika`,
    el: (time) => `${time} λεπτά ανάγνωσης`,
    hu: (time) => `${time} perc olvasás`,
};
/** Back to news link labels per language */
export const BACK_TO_NEWS_LABELS = {
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
export const WEEK_AHEAD_TITLES = {
    en: (start, end) => ({
        title: `Week Ahead: ${start} to ${end}`,
        subtitle: 'European Parliament calendar, committee meetings, and plenary debates for the coming week',
    }),
    de: (start, end) => ({
        title: `Woche Voraus: ${start} bis ${end}`,
        subtitle: 'Europäischer Parlamentskalender, Ausschusssitzungen und Plenardebatten für die kommende Woche',
    }),
    fr: (start, end) => ({
        title: `Semaine à Venir: ${start} au ${end}`,
        subtitle: 'Calendrier du Parlement européen, réunions de commission et débats pléniers pour la semaine à venir',
    }),
    es: (start, end) => ({
        title: `Semana Próxima: ${start} a ${end}`,
        subtitle: 'Calendario del Parlamento Europeo, reuniones de comisión y debates plenarios para la próxima semana',
    }),
    it: (start, end) => ({
        title: `Settimana Prossima: ${start} a ${end}`,
        subtitle: 'Calendario del Parlamento europeo, riunioni di commissione e dibattiti plenari per la prossima settimana',
    }),
    nl: (start, end) => ({
        title: `Week Vooruit: ${start} tot ${end}`,
        subtitle: 'Europees Parlement kalender, commissievergaderingen en plenaire debatten voor de komende week',
    }),
    pl: (start, end) => ({
        title: `Nadchodzący Tydzień: ${start} do ${end}`,
        subtitle: 'Kalendarz Parlamentu Europejskiego, posiedzenia komisji i debaty plenarne na nadchodzący tydzień',
    }),
    pt: (start, end) => ({
        title: `Semana Próxima: ${start} a ${end}`,
        subtitle: 'Calendário do Parlamento Europeu, reuniões de comissão e debates plenários para a próxima semana',
    }),
    ro: (start, end) => ({
        title: `Săptămâna Viitoare: ${start} până ${end}`,
        subtitle: 'Calendarul Parlamentului European, întâlniri ale comisiilor și dezbateri plenare pentru săptămâna viitoare',
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
        subtitle: 'Euroopan parlamentin kalenteri, valiokuntien kokoukset ja täysistuntokeskustelut tulevalle viikolle',
    }),
    el: (start, end) => ({
        title: `Επόμενη Εβδομάδα: ${start} έως ${end}`,
        subtitle: 'Ημερολόγιο Ευρωπαϊκού Κοινοβουλίου, συνεδριάσεις επιτροπών και ολομέλειες για την επόμενη εβδομάδα',
    }),
    hu: (start, end) => ({
        title: `Következő Hét: ${start} - ${end}`,
        subtitle: 'Európai Parlament naptár, bizottsági ülések és plenáris viták a jövő hétre',
    }),
};
/** Propositions article title templates per language */
export const PROPOSITIONS_TITLES = {
    en: () => ({
        title: 'Legislative Proposals: European Parliament Monitor',
        subtitle: 'Recent legislative proposals, procedure tracking, and pipeline status in the European Parliament',
    }),
    de: () => ({
        title: 'Gesetzgebungsvorschläge: Europäisches Parlament Monitor',
        subtitle: 'Aktuelle Gesetzgebungsvorschläge, Verfahrensverfolgung und Pipeline-Status im Europäischen Parlament',
    }),
    fr: () => ({
        title: 'Propositions Législatives: Moniteur du Parlement Européen',
        subtitle: 'Propositions législatives récentes, suivi des procédures et état du pipeline au Parlement européen',
    }),
    es: () => ({
        title: 'Propuestas Legislativas: Monitor del Parlamento Europeo',
        subtitle: 'Propuestas legislativas recientes, seguimiento de procedimientos y estado del pipeline en el Parlamento Europeo',
    }),
    it: () => ({
        title: 'Proposte Legislative: Monitor del Parlamento Europeo',
        subtitle: 'Proposte legislative recenti, monitoraggio delle procedure e stato della pipeline nel Parlamento europeo',
    }),
    nl: () => ({
        title: 'Wetgevingsvoorstellen: EU Parlementsmonitor',
        subtitle: 'Recente wetgevingsvoorstellen, procedurebewaking en pipeline-status in het Europees Parlement',
    }),
    pl: () => ({
        title: 'Propozycje Legislacyjne: Monitor Parlamentu Europejskiego',
        subtitle: 'Ostatnie propozycje legislacyjne, śledzenie procedur i status pipeline w Parlamencie Europejskim',
    }),
    pt: () => ({
        title: 'Propostas Legislativas: Monitor do Parlamento Europeu',
        subtitle: 'Propostas legislativas recentes, acompanhamento de procedimentos e estado do pipeline no Parlamento Europeu',
    }),
    ro: () => ({
        title: 'Propuneri Legislative: Monitor al Parlamentului European',
        subtitle: 'Propuneri legislative recente, urmărirea procedurilor și starea pipeline-ului în Parlamentul European',
    }),
    sv: () => ({
        title: 'Lagstiftningsförslag: EU-parlamentsmonitor',
        subtitle: 'Senaste lagstiftningsförslag, procedurspårning och pipeline-status i Europaparlamentet',
    }),
    da: () => ({
        title: 'Lovgivningsforslag: EU-parlamentsmonitor',
        subtitle: 'Seneste lovgivningsforslag, proceduresporing og pipeline-status i Europa-Parlamentet',
    }),
    fi: () => ({
        title: 'Lainsäädäntöehdotukset: EU-parlamentin seuranta',
        subtitle: 'Viimeisimmät lainsäädäntöehdotukset, menettelyseuranta ja pipeline-tila Euroopan parlamentissa',
    }),
    el: () => ({
        title: 'Νομοθετικές Προτάσεις: Παρακολούθηση Ευρωπαϊκού Κοινοβουλίου',
        subtitle: 'Πρόσφατες νομοθετικές προτάσεις, παρακολούθηση διαδικασιών και κατάσταση αγωγού στο Ευρωπαϊκό Κοινοβούλιο',
    }),
    hu: () => ({
        title: 'Jogalkotási Javaslatok: EU Parlamenti Figyelő',
        subtitle: 'Legfrissebb jogalkotási javaslatok, eljáráskövetés és csővezeték-állapot az Európai Parlamentben',
    }),
};
/**
 * Get a language-specific string with English fallback
 *
 * @param map - Language map to look up
 * @param lang - Language code
 * @returns The language-specific value or English fallback
 */
export function getLocalizedString(map, lang) {
    const code = lang;
    return map[code] ?? map.en;
}
/**
 * Check if a language code is supported
 *
 * @param lang - Language code to check
 * @returns True if the language is supported
 */
export function isSupportedLanguage(lang) {
    return ALL_LANGUAGES.includes(lang);
}
/**
 * Determine text direction for a language
 *
 * @param lang - Language code
 * @returns 'rtl' for Arabic/Hebrew, 'ltr' otherwise
 */
export function getTextDirection(lang) {
    return lang === 'ar' || lang === 'he' ? 'rtl' : 'ltr';
}
//# sourceMappingURL=languages.js.map