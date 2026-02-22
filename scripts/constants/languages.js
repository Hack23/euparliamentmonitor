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
/** Breaking news title templates per language */
export const BREAKING_NEWS_TITLES = {
    en: (date) => ({
        title: `Breaking: Significant Parliamentary Developments — ${date}`,
        subtitle: 'Intelligence analysis of voting anomalies, coalition shifts, and key MEP activities',
    }),
    de: (date) => ({
        title: `Eilmeldung: Bedeutende Parlamentarische Entwicklungen — ${date}`,
        subtitle: 'Geheimdienstliche Analyse von Abstimmungsanomalien, Koalitionsverschiebungen und wichtigen MEP-Aktivitäten',
    }),
    fr: (date) => ({
        title: `Dernières Nouvelles: Développements Parlementaires Significatifs — ${date}`,
        subtitle: 'Analyse de renseignements sur les anomalies de vote, les évolutions des coalitions et les activités clés des eurodéputés',
    }),
    es: (date) => ({
        title: `Última Hora: Desarrollos Parlamentarios Significativos — ${date}`,
        subtitle: 'Análisis de inteligencia sobre anomalías en votaciones, cambios en coaliciones y actividades clave de eurodiputados',
    }),
    it: (date) => ({
        title: `Ultime Notizie: Sviluppi Parlamentari Significativi — ${date}`,
        subtitle: "Analisi dell'intelligence su anomalie di voto, cambiamenti nelle coalizioni e attività chiave degli eurodeputati",
    }),
    nl: (date) => ({
        title: `Laatste Nieuws: Significante Parlementaire Ontwikkelingen — ${date}`,
        subtitle: 'Inlichtingenanalyse van stemanomalieën, coalitieverschuivingen en belangrijke MEP-activiteiten',
    }),
    pl: (date) => ({
        title: `Najnowsze Wiadomości: Znaczące Wydarzenia Parlamentarne — ${date}`,
        subtitle: 'Analiza wywiadowcza anomalii głosowań, zmian koalicyjnych i kluczowych działań europosłów',
    }),
    pt: (date) => ({
        title: `Notícias de Última Hora: Desenvolvimentos Parlamentares Significativos — ${date}`,
        subtitle: 'Análise de inteligência sobre anomalias de votação, mudanças em coalizões e atividades-chave de eurodeputados',
    }),
    ro: (date) => ({
        title: `Știri de Ultimă Oră: Evoluții Parlamentare Semnificative — ${date}`,
        subtitle: 'Analiză de informații privind anomaliile de vot, schimbările de coaliție și activitățile-cheie ale eurodeputaților',
    }),
    sv: (date) => ({
        title: `Senaste Nytt: Betydande Parlamentariska Händelser — ${date}`,
        subtitle: 'Underrättelseanalys av röstningsanomalier, koalitionsförändringar och viktig MEP-aktivitet',
    }),
    da: (date) => ({
        title: `Seneste Nyt: Betydelige Parlamentariske Udviklinger — ${date}`,
        subtitle: 'Efterretningsanalyse af afstemningsanomalier, koalitionsforskydninger og centrale MEP-aktiviteter',
    }),
    fi: (date) => ({
        title: `Uusimmat Uutiset: Merkittäviä Parlamentaarisia Kehityksiä — ${date}`,
        subtitle: 'Tiedusteluanalyysi äänestyspoikkeamista, koalitiomuutoksista ja keskeisistä MEP-toimista',
    }),
    el: (date) => ({
        title: `Τελευταία Νέα: Σημαντικές Κοινοβουλευτικές Εξελίξεις — ${date}`,
        subtitle: 'Ανάλυση πληροφοριών για ψηφοφορικές ανωμαλίες, μετατοπίσεις συνασπισμών και βασικές δραστηριότητες ευρωβουλευτών',
    }),
    hu: (date) => ({
        title: `Legfrissebb Hírek: Jelentős Parlamenti Fejlemények — ${date}`,
        subtitle: 'Hírszerzési elemzés szavazási rendellenességekről, koalíciós eltolódásokról és kulcsfontosságú EP-képviselői tevékenységekről',
    }),
};
/**
 * Committee reports titles for all 14 supported languages
 * Generator function accepting committee abbreviation string
 */
export const COMMITTEE_REPORTS_TITLES = {
    en: (committee) => ({
        title: `EU Parliament Committee Activity Report: ${committee}`,
        subtitle: 'Analysis of recent legislative output, effectiveness metrics, and key committee activities',
    }),
    de: (committee) => ({
        title: `EU-Parlament Ausschussbericht: ${committee}`,
        subtitle: 'Analyse der aktuellen Gesetzgebungsleistung, Effektivitätskennzahlen und wichtiger Ausschussaktivitäten',
    }),
    fr: (committee) => ({
        title: `Rapport d'activité des commissions du Parlement européen: ${committee}`,
        subtitle: "Analyse de la production législative récente, des indicateurs d'efficacité et des activités clés des commissions",
    }),
    es: (committee) => ({
        title: `Informe de actividad de comisiones del Parlamento Europeo: ${committee}`,
        subtitle: 'Análisis de la producción legislativa reciente, métricas de efectividad y actividades clave de las comisiones',
    }),
    it: (committee) => ({
        title: `Rapporto di attività delle commissioni del Parlamento europeo: ${committee}`,
        subtitle: "Analisi della recente produzione legislativa, metriche di efficacia e attività chiave delle commissioni",
    }),
    nl: (committee) => ({
        title: `Activiteitenrapport commissies Europees Parlement: ${committee}`,
        subtitle: 'Analyse van recente wetgevingsoutput, effectiviteitsmetrieken en belangrijkste commissieactiviteiten',
    }),
    pl: (committee) => ({
        title: `Raport aktywności komisji Parlamentu Europejskiego: ${committee}`,
        subtitle: 'Analiza ostatniego dorobku legislacyjnego, wskaźników efektywności i kluczowych działań komisji',
    }),
    pt: (committee) => ({
        title: `Relatório de atividade das comissões do Parlamento Europeu: ${committee}`,
        subtitle: 'Análise da produção legislativa recente, métricas de eficácia e atividades-chave das comissões',
    }),
    ro: (committee) => ({
        title: `Raport de activitate al comisiilor Parlamentului European: ${committee}`,
        subtitle: 'Analiza producției legislative recente, a indicatorilor de eficacitate și a activităților cheie ale comisiilor',
    }),
    sv: (committee) => ({
        title: `Aktivitetsrapport för Europaparlamentets utskott: ${committee}`,
        subtitle: 'Analys av nylig lagstiftningsproduktion, effektivitetsmätningar och viktigaste utskottsaktiviteter',
    }),
    da: (committee) => ({
        title: `Aktivitetsrapport for Europa-Parlamentets udvalg: ${committee}`,
        subtitle: 'Analyse af den seneste lovgivningsproduktion, effektivitetsmålinger og vigtigste udvalgsaktiviteter',
    }),
    fi: (committee) => ({
        title: `Euroopan parlamentin valiokuntien toimintaraportti: ${committee}`,
        subtitle: 'Analyysi viimeaikaisesta lainsäädäntötuotannosta, tehokkuusmittareista ja tärkeimmistä valiokuntatoiminnoista',
    }),
    el: (committee) => ({
        title: `Έκθεση δραστηριότητας επιτροπών Ευρωπαϊκού Κοινοβουλίου: ${committee}`,
        subtitle: 'Ανάλυση πρόσφατης νομοθετικής παραγωγής, δεικτών αποτελεσματικότητας και βασικών δραστηριοτήτων επιτροπών',
    }),
    hu: (committee) => ({
        title: `Az Európai Parlament bizottságainak tevékenységi jelentése: ${committee}`,
        subtitle: 'A közelmúlt jogalkotási kibocsátásának, hatékonysági mutatóinak és a bizottságok főbb tevékenységeinek elemzése',
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