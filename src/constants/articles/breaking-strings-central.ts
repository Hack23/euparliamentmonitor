// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/Articles/BreakingStringsCentral
 * @description Central breaking-news strings.
 */

import type { LanguageMap, BreakingStrings } from '../../types/index.js';
import {
  BRK_WHY_ANOMALIES,
  BRK_WHY_NORMAL,
  BRK_NEUTRAL_REASON,
  BRK_LEGAL_CONSEQUENCE,
  BRK_PROC_CONSEQUENCE,
  BRK_IMPACT_ECONOMIC,
  BRK_IMPACT_SOCIAL,
  BRK_IMPACT_GEO_COALITION,
  BRK_IMPACT_GEO_NORMAL,
  BRK_MISTAKE_DESC,
  BRK_MISTAKE_ALT,
} from './_shared.js';

/** Central breaking-news strings */
export const BREAKING_STRINGS_CENTRAL: Pick<LanguageMap<BreakingStrings>, 'de' | 'fr'> = {
  de: {
    breakingBanner: '⚡ EILMELDUNG',
    votingAnomalyIntel: 'Abstimmungsanomalien — Nachrichtendienstanalyse',
    coalitionDynamics: 'Bewertung der Koalitionsdynamik',
    analyticalReport: 'Analytischer Bericht',
    keyMEPInfluence: 'Analyse des Einflusses wichtiger MdEPs',
    intelligenceBriefing: 'Nachrichtendienstbriefing',
    votingAnomalyAlert: 'Warnung vor Abstimmungsanomalien',
    coalitionDynamicsSection: 'Koalitionsdynamik',
    keyPlayers: 'Parlamentarische Schlüsselfiguren',
    placeholderNotice:
      'Dies ist Platzhalterinhalt, der generiert wurde, während der MCP-Server des EU-Parlaments nicht verfügbar ist.',
    placeholderLede:
      'Bedeutende parlamentarische Entwicklungen werden überwacht. Verbinden Sie den MCP-Server des EU-Parlaments für Echtzeit-Informationen.',
    lede: 'Die Nachrichtendienstanalyse des MCP-Servers des EU-Parlaments hat bedeutende parlamentarische Entwicklungen identifiziert, die sofortige Aufmerksamkeit erfordern',
    feedLede:
      'Die neuesten Feeds des Europäischen Parlaments beleuchten aktuelle parlamentarische Aktivitäten',
    adoptedTextsHeading: 'Kürzlich Angenommene Texte',
    recentEventsHeading: 'Aktuelle Parlamentarische Ereignisse',
    procedureUpdatesHeading: 'Aktualisierungen der Gesetzgebungsverfahren',
    mepUpdatesHeading: 'MdEP-Aktualisierungen',
    noFeedDataNotice: 'Keine neuen Feeddaten vom Europäischen Parlament verfügbar.',
    asOf: 'zum',
    breakingWhatFn: (date, adopted, events, procedures, meps) =>
      `Neueste Entwicklungen am ${date}: ${adopted} neu angenommene Texte, ${events} Ereignisse, ${procedures} Verfahrensupdates, ${meps} MdEP-Änderungen.`,
    breakingWhyAnomalies: BRK_WHY_ANOMALIES,
    breakingWhyNormal: BRK_WHY_NORMAL,
    breakingWinnerActor: 'Gesetzgebende Mehrheit',
    breakingWinnerReasonFn: (count) =>
      `${count} Gesetzestexte wurden im parlamentarischen Verfahren vorangebracht.`,
    breakingNeutralActor: 'Oppositionsgruppen',
    breakingNeutralReason: BRK_NEUTRAL_REASON,
    breakingOutlookActiveFn: (date) => `session_date=${date}`,
    breakingOutlookTransitionalFn: (date) => `session_date=${date} transitional=true`,
    breakingLegalObligationsConsequence: BRK_LEGAL_CONSEQUENCE,
    breakingProcedureConsequence: BRK_PROC_CONSEQUENCE,
    breakingImpactPoliticalAnomalies: BRK_WHY_ANOMALIES,
    breakingImpactPoliticalNormalFn: (count) => `legislative_texts=${count}`,
    breakingImpactEconomic: BRK_IMPACT_ECONOMIC,
    breakingImpactSocial: BRK_IMPACT_SOCIAL,
    breakingImpactLegalFn: (count) => `legal_instruments=${count}`,
    breakingImpactGeopoliticalCoalition: BRK_IMPACT_GEO_COALITION,
    breakingImpactGeopoliticalNormal: BRK_IMPACT_GEO_NORMAL,
    breakingMistakeActor: 'Fraktionsgeschäftsführer',
    breakingMistakeDescription: BRK_MISTAKE_DESC,
    breakingMistakeAlternative: BRK_MISTAKE_ALT,
    breakingAdoptedPrefix: 'Angenommen:',
    breakingMEPPrefix: 'MdEP:',
    anomalyUnavailable:
      'Detaillierte Analyse von Abstimmungsanomalien ist aufgrund technischer Einschränkungen der Quelldaten derzeit nicht verfügbar.',
    coalitionUnavailable:
      'Eine detaillierte Bewertung der Koalitionsdynamik kann derzeit nicht angezeigt werden, da die erforderlichen Grundlagendaten vorübergehend fehlen.',
    adoptedTextTypeLabel: 'Angenommener Text',
    adoptedTextItemLabelFn: (label) => label,
    showingXofNFn: (shown, total) => `${shown} von ${total} angezeigt`,
  },
  fr: {
    breakingBanner: '⚡ DERNIÈRES NOUVELLES',
    votingAnomalyIntel: 'Anomalies de Vote — Analyse de Renseignement',
    coalitionDynamics: 'Évaluation des Dynamiques de Coalition',
    analyticalReport: 'Rapport Analytique',
    keyMEPInfluence: "Analyse de l'Influence des Eurodéputés Clés",
    intelligenceBriefing: 'Briefing de Renseignement',
    votingAnomalyAlert: 'Alerte Anomalie de Vote',
    coalitionDynamicsSection: 'Dynamiques de Coalition',
    keyPlayers: 'Acteurs Parlementaires Clés',
    placeholderNotice:
      'Ceci est un contenu indicatif généré pendant que le serveur MCP du Parlement européen est indisponible.',
    placeholderLede:
      'Des développements parlementaires importants sont surveillés. Connectez le serveur MCP du Parlement européen pour recevoir des renseignements en temps réel.',
    lede: "L'analyse de renseignement du serveur MCP du Parlement européen a identifié des développements parlementaires significatifs nécessitant une attention immédiate",
    feedLede:
      'Les dernières données du Parlement européen mettent en lumière les activités parlementaires récentes',
    adoptedTextsHeading: 'Textes Récemment Adoptés',
    recentEventsHeading: 'Événements Parlementaires Récents',
    procedureUpdatesHeading: 'Mises à Jour des Procédures Législatives',
    mepUpdatesHeading: 'Mises à Jour des Eurodéputés',
    noFeedDataNotice: 'Aucune donnée de flux récente disponible du Parlement européen.',
    asOf: 'au',
    breakingWhatFn: (date, adopted, events, procedures, meps) =>
      `Dernières évolutions au ${date}\u00a0: ${adopted} textes nouvellement adoptés, ${events} événements, ${procedures} mises à jour procédurales, ${meps} changements de députés.`,
    breakingWhyAnomalies: BRK_WHY_ANOMALIES,
    breakingWhyNormal: BRK_WHY_NORMAL,
    breakingWinnerActor: 'Majorité législative',
    breakingWinnerReasonFn: (count) =>
      `${count} textes législatifs ont été avancés dans le cadre du processus parlementaire.`,
    breakingNeutralActor: "Groupes d'opposition",
    breakingNeutralReason: BRK_NEUTRAL_REASON,
    breakingOutlookActiveFn: (date) => `session_date=${date}`,
    breakingOutlookTransitionalFn: (date) => `session_date=${date} transitional=true`,
    breakingLegalObligationsConsequence: BRK_LEGAL_CONSEQUENCE,
    breakingProcedureConsequence: BRK_PROC_CONSEQUENCE,
    breakingImpactPoliticalAnomalies: BRK_WHY_ANOMALIES,
    breakingImpactPoliticalNormalFn: (count) => `legislative_texts=${count}`,
    breakingImpactEconomic: BRK_IMPACT_ECONOMIC,
    breakingImpactSocial: BRK_IMPACT_SOCIAL,
    breakingImpactLegalFn: (count) => `legal_instruments=${count}`,
    breakingImpactGeopoliticalCoalition: BRK_IMPACT_GEO_COALITION,
    breakingImpactGeopoliticalNormal: BRK_IMPACT_GEO_NORMAL,
    breakingMistakeActor: 'Chefs de file des groupes politiques',
    breakingMistakeDescription: BRK_MISTAKE_DESC,
    breakingMistakeAlternative: BRK_MISTAKE_ALT,
    breakingAdoptedPrefix: 'Adopté\u00a0:',
    breakingMEPPrefix: 'Député\u00a0:',
    anomalyUnavailable:
      "L'analyse détaillée des anomalies de vote n'est pas disponible pour le moment en raison de limitations techniques des données sources.",
    coalitionUnavailable:
      "L'évaluation détaillée de la dynamique de coalition ne peut pas être affichée pour le moment, car les données sous-jacentes nécessaires sont temporairement indisponibles.",
    adoptedTextTypeLabel: 'Texte adopté',
    adoptedTextItemLabelFn: (label) => label,
    showingXofNFn: (shown, total) => `Affichage de ${shown} sur ${total}`,
  },
};
