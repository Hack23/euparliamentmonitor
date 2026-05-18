// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

 

/**
 * @module Constants/UI/AIContent
 * @description Per-language AI methodology disclosure section (`AISection`) shown on every article page.
 */

import type { LanguageMap } from '../../types/index.js';
export interface AISection {
  heading: string;
  quote: string;
  description: string;
  featureAgents: string;
  featureAgentsDesc: string;
  featureSchedule: string;
  featureScheduleDesc: string;
  featureHuman: string;
  featureHumanDesc: string;
  featureData: string;
  featureDataDesc: string;
}

/** AI section localized content for all 14 languages */
export const AI_SECTION_CONTENT: LanguageMap<AISection> = {
  en: {
    heading: 'AI-Disrupted News Generation & Agentic Intelligence',
    quote:
      'While traditional newsrooms debate whether AI will replace journalists, EU Parliament Monitor quietly deployed 8 autonomous AI agents that generate investigative political intelligence in 14 languages before most reporters have finished their morning coffee. The future of parliamentary journalism didn\u2019t send a memo \u2014 it opened a pull request.',
    description:
      'EU Parliament Monitor doesn\u2019t just report on European Parliament activity \u2014 it autonomously generates deep political intelligence at machine speed, with editorial quality that would make legacy news desks nervous.',
    featureAgents: '8 Autonomous Agents',
    featureAgentsDesc: 'News, data, frontend, quality, security, docs, DevOps, product',
    featureSchedule: 'Comprehensive Coverage',
    featureScheduleDesc: 'Weekly Ahead · Committee Reports · Legislative Tracker · Monthly Reviews',
    featureHuman: 'Human-in-the-Loop',
    featureHumanDesc: 'Agents open publication-ready PRs; humans review and merge',
    featureData: 'Live Parliament Data',
    featureDataDesc: '46 MCP tools \u00b7 Real-time European Parliament Open Data',
  },
  sv: {
    heading: 'AI-disruptad nyhetsgenerering & agentisk intelligens',
    quote:
      'Medan traditionella redaktioner debatterar om AI ska ers\u00e4tta journalister, har EU Parliament Monitor tyst distribuerat 8 autonoma AI-agenter som genererar politisk underr\u00e4ttelseanalys p\u00e5 14 spr\u00e5k innan de flesta reportrar har druckit sitt morgonkaffe.',
    description:
      'EU Parliament Monitor rapporterar inte bara om Europaparlamentets verksamhet \u2014 den genererar autonomt djup politisk intelligens i maskinhastighet.',
    featureAgents: '8 autonoma agenter',
    featureAgentsDesc:
      'Nyheter, data, frontend, kvalitet, s\u00e4kerhet, dokumentation, DevOps, produkt',
    featureSchedule: 'Omfattande bevakning',
    featureScheduleDesc:
      'Veckans agenda · Utskottsrapporter · Lagstiftningsträcker · Månadsöversikter',
    featureHuman: 'M\u00e4nniska i loopen',
    featureHumanDesc:
      'Agenter \u00f6ppnar publiceringsf\u00e4rdiga PR; m\u00e4nniskor granskar och mergar',
    featureData: 'Parlamentsdata i realtid',
    featureDataDesc: '46 MCP-verktyg \u00b7 Europaparlamentets \u00f6ppna data',
  },
  da: {
    heading: 'AI-disrupteret nyhedsgenerering & agentisk intelligens',
    quote:
      'Mens traditionelle redaktioner debatterer, om AI vil erstatte journalister, har EU Parliament Monitor stille implementeret 8 autonome AI-agenter, der genererer politisk efterretningsanalyse p\u00e5 14 sprog, f\u00f8r de fleste journalister har drukket deres morgenkaffe.',
    description:
      'EU Parliament Monitor rapporterer ikke bare om Europa-Parlamentets aktiviteter \u2014 den genererer autonomt dyb politisk intelligens med maskinhastighed.',
    featureAgents: '8 autonome agenter',
    featureAgentsDesc:
      'Nyheder, data, frontend, kvalitet, sikkerhed, dokumentation, DevOps, produkt',
    featureSchedule: 'Omfattende dækning',
    featureScheduleDesc: 'Ugens agenda · Udvalgsrapporter · Lovgivningstracker · Månedsoversigter',
    featureHuman: 'Menneske i kredsl\u00f8bet',
    featureHumanDesc: 'Agenter \u00e5bner publiceringsklar PR; mennesker gennemg\u00e5r og merger',
    featureData: 'Parlamentsdata i realtid',
    featureDataDesc: '46 MCP-v\u00e6rkt\u00f8jer \u00b7 Europa-Parlamentets \u00e5bne data',
  },
  no: {
    heading: 'AI-disruptert nyhetsgenerering & agentisk intelligens',
    quote:
      'Mens tradisjonelle redaksjoner debatterer om AI vil erstatte journalister, har EU Parliament Monitor stille implementert 8 autonome AI-agenter som genererer politisk etterretningsanalyse p\u00e5 14 spr\u00e5k f\u00f8r de fleste reportere har drukket morgenkaffen.',
    description:
      'EU Parliament Monitor rapporterer ikke bare om Europaparlamentets aktiviteter \u2014 den genererer autonomt dyp politisk intelligens i maskinhastighet.',
    featureAgents: '8 autonome agenter',
    featureAgentsDesc:
      'Nyheter, data, frontend, kvalitet, sikkerhet, dokumentasjon, DevOps, produkt',
    featureSchedule: 'Omfattende dekning',
    featureScheduleDesc: 'Ukens agenda · Komitérapporter · Lovgivningstracker · Månedsoversikter',
    featureHuman: 'Menneske i loopen',
    featureHumanDesc:
      'Agenter \u00e5pner publiseringsklare PR; mennesker gjennomg\u00e5r og merger',
    featureData: 'Parlamentsdata i sanntid',
    featureDataDesc: '46 MCP-verkt\u00f8y \u00b7 Europaparlamentets \u00e5pne data',
  },
  fi: {
    heading: 'Teko\u00e4lyn disruptoima uutistuotanto & agenttitiedustelu',
    quote:
      'Kun perinteiset toimitukset v\u00e4ittelev\u00e4t korvataanko toimittajat teko\u00e4lyll\u00e4, EU Parliament Monitor on hiljaa ottanut k\u00e4ytt\u00f6\u00f6n 8 autonomista AI-agenttia, jotka tuottavat tutkivaa poliittista tiedustelua 14 kielell\u00e4.',
    description:
      'EU Parliament Monitor ei vain raportoi Euroopan parlamentin toiminnasta \u2014 se tuottaa autonomisesti syv\u00e4llist\u00e4 poliittista tiedustelua konenopeudella.',
    featureAgents: '8 autonomista agenttia',
    featureAgentsDesc: 'Uutiset, data, frontend, laatu, turvallisuus, dokumentaatio, DevOps, tuote',
    featureSchedule: 'Kattava seuranta',
    featureScheduleDesc:
      'Viikkonäkymä · Valiokunnan raportit · Lainsäädäntöseuranta · Kuukausikatsaukset',
    featureHuman: 'Ihminen mukana',
    featureHumanDesc: 'Agentit avaavat julkaisuvalmiit PR:t; ihmiset tarkistavat ja mergaavat',
    featureData: 'Reaaliaikainen data',
    featureDataDesc: '46 MCP-ty\u00f6kalua \u00b7 Euroopan parlamentin avoin data',
  },
  de: {
    heading: 'KI-disruptierte Nachrichtenerzeugung & agentische Intelligenz',
    quote:
      'W\u00e4hrend traditionelle Redaktionen debattieren, ob KI Journalisten ersetzen wird, hat EU Parliament Monitor leise 8 autonome KI-Agenten eingesetzt, die investigative politische Aufkl\u00e4rung in 14 Sprachen generieren, bevor die meisten Reporter ihren Morgenkaffee getrunken haben.',
    description:
      'EU Parliament Monitor berichtet nicht nur \u00fcber das Europ\u00e4ische Parlament \u2014 es generiert autonom tiefgreifende politische Intelligenz in Maschinengeschwindigkeit.',
    featureAgents: '8 autonome Agenten',
    featureAgentsDesc:
      'Nachrichten, Daten, Frontend, Qualit\u00e4t, Sicherheit, Dokumentation, DevOps, Produkt',
    featureSchedule: 'Umfassende Berichterstattung',
    featureScheduleDesc:
      'Wochenvorschau · Ausschussberichte · Gesetzgebungstracker · Monatsrückblicke',
    featureHuman: 'Mensch in der Schleife',
    featureHumanDesc: 'Agenten erstellen publikationsreife PRs; Menschen pr\u00fcfen und mergen',
    featureData: 'Echtzeit-Parlamentsdaten',
    featureDataDesc: '46 MCP-Werkzeuge \u00b7 Offene Daten des Europ\u00e4ischen Parlaments',
  },
  fr: {
    heading:
      "G\u00e9n\u00e9ration d'actualit\u00e9s disrupt\u00e9e par l'IA & intelligence agentique",
    quote:
      "Alors que les r\u00e9dactions traditionnelles d\u00e9battent pour savoir si l'IA remplacera les journalistes, EU Parliament Monitor a d\u00e9ploy\u00e9 discr\u00e8tement 8 agents IA autonomes qui g\u00e9n\u00e8rent du renseignement politique d'investigation en 14 langues.",
    description:
      'EU Parliament Monitor ne se contente pas de couvrir le Parlement europ\u00e9en \u2014 il g\u00e9n\u00e8re de mani\u00e8re autonome du renseignement politique profond \u00e0 la vitesse machine.',
    featureAgents: '8 agents autonomes',
    featureAgentsDesc:
      'Actualit\u00e9s, donn\u00e9es, frontend, qualit\u00e9, s\u00e9curit\u00e9, documentation, DevOps, produit',
    featureSchedule: 'Couverture complète',
    featureScheduleDesc:
      'Semaine à venir · Rapports de commission · Suivi législatif · Bilans mensuels',
    featureHuman: 'Humain dans la boucle',
    featureHumanDesc:
      'Les agents ouvrent des PR pr\u00eates \u00e0 publier ; les humains r\u00e9visent et mergent',
    featureData: 'Donn\u00e9es en direct',
    featureDataDesc: '46 outils MCP \u00b7 Donn\u00e9es ouvertes du Parlement europ\u00e9en',
  },
  es: {
    heading: 'Generaci\u00f3n de noticias disruptada por IA e inteligencia ag\u00e9ntica',
    quote:
      'Mientras las redacciones tradicionales debaten si la IA reemplazar\u00e1 a los periodistas, EU Parliament Monitor despleg\u00f3 silenciosamente 8 agentes de IA aut\u00f3nomos que generan inteligencia pol\u00edtica investigativa en 14 idiomas.',
    description:
      'EU Parliament Monitor no solo informa sobre el Parlamento Europeo \u2014 genera aut\u00f3nomamente inteligencia pol\u00edtica profunda a velocidad de m\u00e1quina.',
    featureAgents: '8 agentes aut\u00f3nomos',
    featureAgentsDesc:
      'Noticias, datos, frontend, calidad, seguridad, documentaci\u00f3n, DevOps, producto',
    featureSchedule: 'Cobertura integral',
    featureScheduleDesc:
      'Semana entrante · Informes de comité · Seguimiento legislativo · Revisión mensual',
    featureHuman: 'Humano en el proceso',
    featureHumanDesc: 'Los agentes crean PRs listas para publicar; los humanos revisan y fusionan',
    featureData: 'Datos en vivo',
    featureDataDesc: '46 herramientas MCP \u00b7 Datos abiertos del Parlamento Europeo',
  },
  nl: {
    heading: 'AI-gedisrupteerde nieuwsgeneratie & agentische intelligentie',
    quote:
      'Terwijl traditionele redacties debatteren of AI journalisten zal vervangen, heeft EU Parliament Monitor stilletjes 8 autonome AI-agenten ingezet die onderzoeksjournalistieke politieke analyses genereren in 14 talen.',
    description:
      'EU Parliament Monitor doet meer dan alleen verslag doen van het Europees Parlement \u2014 het genereert autonoom diepgaande politieke intelligence op machinesnelheid.',
    featureAgents: '8 autonome agenten',
    featureAgentsDesc:
      'Nieuws, data, frontend, kwaliteit, beveiliging, documentatie, DevOps, product',
    featureSchedule: 'Uitgebreide dekking',
    featureScheduleDesc:
      'Weekoverzicht · Commissierapporten · Wetgevingstracker · Maandoverzichten',
    featureHuman: 'Mens in de kring',
    featureHumanDesc: "Agenten openen publicatieklare PR's; mensen beoordelen en mergen",
    featureData: 'Live data',
    featureDataDesc: '46 MCP-tools \u00b7 Open data Europees Parlement',
  },
  ar: {
    heading:
      '\u0625\u0646\u062a\u0627\u062c \u0623\u062e\u0628\u0627\u0631 \u0645\u064f\u0632\u0639\u0632\u0639 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a \u0648\u0630\u0643\u0627\u0621 \u0648\u0643\u064a\u0644\u064a',
    quote:
      '\u0628\u064a\u0646\u0645\u0627 \u062a\u0646\u0627\u0642\u0634 \u063a\u0631\u0641 \u0627\u0644\u0623\u062e\u0628\u0627\u0631 \u0627\u0644\u062a\u0642\u0644\u064a\u062f\u064a\u0629 \u0645\u0627 \u0625\u0630\u0627 \u0643\u0627\u0646 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a \u0633\u064a\u062d\u0644 \u0645\u062d\u0644 \u0627\u0644\u0635\u062d\u0641\u064a\u064a\u0646\u060c \u0646\u0634\u0631 EU Parliament Monitor \u0628\u0647\u062f\u0648\u0621 8 \u0648\u0643\u0644\u0627\u0621 \u0630\u0643\u0627\u0621 \u0627\u0635\u0637\u0646\u0627\u0639\u064a \u0645\u0633\u062a\u0642\u0644\u064a\u0646 \u064a\u0648\u0644\u062f\u0648\u0646 \u062a\u062d\u0644\u064a\u0644\u0627\u062a \u0633\u064a\u0627\u0633\u064a\u0629 \u0627\u0633\u062a\u0642\u0635\u0627\u0626\u064a\u0629 \u0628\u0640 14 \u0644\u063a\u0629.',
    description:
      '\u0644\u0627 \u064a\u0642\u062a\u0635\u0631 EU Parliament Monitor \u0639\u0644\u0649 \u0627\u0644\u062a\u0642\u0631\u064a\u0631 \u0639\u0646 \u0627\u0644\u0628\u0631\u0644\u0645\u0627\u0646 \u0627\u0644\u0623\u0648\u0631\u0648\u0628\u064a \u2014 \u0628\u0644 \u064a\u0648\u0644\u062f \u0628\u0634\u0643\u0644 \u0645\u0633\u062a\u0642\u0644 \u062a\u062d\u0644\u064a\u0644\u0627\u062a \u0633\u064a\u0627\u0633\u064a\u0629 \u0639\u0645\u064a\u0642\u0629 \u0628\u0633\u0631\u0639\u0629 \u0627\u0644\u0622\u0644\u0629.',
    featureAgents: '8 \u0648\u0643\u0644\u0627\u0621 \u0645\u0633\u062a\u0642\u0644\u064a\u0646',
    featureAgentsDesc:
      '\u0623\u062e\u0628\u0627\u0631\u060c \u0628\u064a\u0627\u0646\u0627\u062a\u060c \u0648\u0627\u062c\u0647\u0629 \u0623\u0645\u0627\u0645\u064a\u0629\u060c \u062c\u0648\u062f\u0629\u060c \u0623\u0645\u0627\u0646\u060c \u062a\u0648\u062b\u064a\u0642\u060c DevOps\u060c \u0645\u0646\u062a\u062c',
    featureSchedule: 'تغطية شاملة',
    featureScheduleDesc: 'أجندة الأسبوع · تقارير اللجان · متابعة التشريعات · مراجعات شهرية',
    featureHuman:
      '\u0627\u0644\u0625\u0646\u0633\u0627\u0646 \u0641\u064a \u0627\u0644\u062d\u0644\u0642\u0629',
    featureHumanDesc:
      '\u0627\u0644\u0648\u0643\u0644\u0627\u0621 \u064a\u0641\u062a\u062d\u0648\u0646 \u0637\u0644\u0628\u0627\u062a \u0633\u062d\u0628 \u062c\u0627\u0647\u0632\u0629 \u0644\u0644\u0646\u0634\u0631\u061b \u0627\u0644\u0628\u0634\u0631 \u064a\u0631\u0627\u062c\u0639\u0648\u0646 \u0648\u064a\u062f\u0645\u062c\u0648\u0646',
    featureData: '\u0628\u064a\u0627\u0646\u0627\u062a \u0645\u0628\u0627\u0634\u0631\u0629',
    featureDataDesc:
      '46 \u0623\u062f\u0627\u0629 MCP \u00b7 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0645\u0641\u062a\u0648\u062d\u0629 \u0644\u0644\u0628\u0631\u0644\u0645\u0627\u0646 \u0627\u0644\u0623\u0648\u0631\u0648\u0628\u064a',
  },
  he: {
    heading:
      '\u05d9\u05d9\u05e6\u05d5\u05e8 \u05d7\u05d3\u05e9\u05d5\u05ea \u05de\u05e9\u05d5\u05d1\u05e9 \u05d1\u05d9\u05e0\u05d4 \u05de\u05dc\u05d0\u05db\u05d5\u05ea\u05d9\u05ea \u05d5\u05de\u05d5\u05d3\u05d9\u05e2\u05d9\u05df \u05e1\u05d5\u05db\u05e0\u05d9\u05dd',
    quote:
      '\u05d1\u05e2\u05d5\u05d3 \u05e9\u05de\u05e2\u05e8\u05db\u05d5\u05ea \u05d7\u05d3\u05e9\u05d5\u05ea \u05de\u05e1\u05d5\u05e8\u05ea\u05d9\u05d5\u05ea \u05de\u05ea\u05d5\u05d5\u05db\u05d7\u05d5\u05ea \u05d4\u05d0\u05dd AI \u05d9\u05d7\u05dc\u05d9\u05e3 \u05e2\u05d9\u05ea\u05d5\u05e0\u05d0\u05d9\u05dd, EU Parliament Monitor \u05e4\u05e8\u05e1 \u05d1\u05e9\u05e7\u05d8 8 \u05e1\u05d5\u05db\u05e0\u05d9 AI \u05d0\u05d5\u05d8\u05d5\u05e0\u05d5\u05de\u05d9\u05d9\u05dd \u05e9\u05de\u05d9\u05d9\u05e6\u05e8\u05d9\u05dd \u05de\u05d5\u05d3\u05d9\u05e2\u05d9\u05df \u05e4\u05d5\u05dc\u05d9\u05d8\u05d9 \u05d7\u05e7\u05d9\u05e8\u05d0\u05ea\u05d9 \u05d1-14 \u05e9\u05e4\u05d5\u05ea.',
    description:
      'EU Parliament Monitor \u05dc\u05d0 \u05e8\u05e7 \u05de\u05d3\u05d5\u05d5\u05d7 \u05e2\u05dc \u05d4\u05e4\u05e8\u05dc\u05de\u05e0\u05d8 \u05d4\u05d0\u05d9\u05e8\u05d5\u05e4\u05d9 \u2014 \u05d4\u05d5\u05d0 \u05de\u05d9\u05d9\u05e6\u05e8 \u05d1\u05d0\u05d5\u05e4\u05df \u05d0\u05d5\u05d8\u05d5\u05e0\u05d5\u05de\u05d9 \u05de\u05d5\u05d3\u05d9\u05e2\u05d9\u05df \u05e4\u05d5\u05dc\u05d9\u05d8\u05d9 \u05de\u05e2\u05de\u05d9\u05e7 \u05d1\u05de\u05d4\u05d9\u05e8\u05d5\u05ea \u05de\u05db\u05d5\u05e0\u05d4.',
    featureAgents:
      '8 \u05e1\u05d5\u05db\u05e0\u05d9\u05dd \u05d0\u05d5\u05d8\u05d5\u05e0\u05d5\u05de\u05d9\u05d9\u05dd',
    featureAgentsDesc:
      '\u05d7\u05d3\u05e9\u05d5\u05ea, \u05e0\u05ea\u05d5\u05e0\u05d9\u05dd, \u05de\u05de\u05e9\u05e7, \u05d0\u05d9\u05db\u05d5\u05ea, \u05d0\u05d1\u05d8\u05d7\u05d4, \u05ea\u05d9\u05e2\u05d5\u05d3, DevOps, \u05de\u05d5\u05e6\u05e8',
    featureSchedule: 'כיסוי מקיף',
    featureScheduleDesc: 'מבט שבועי · דוחות ועדות · מעקב חקיקה · סקירות חודשיות',
    featureHuman: '\u05d0\u05d3\u05dd \u05d1\u05dc\u05d5\u05dc\u05d0\u05d4',
    featureHumanDesc:
      '\u05e1\u05d5\u05db\u05e0\u05d9\u05dd \u05e4\u05d5\u05ea\u05d7\u05d9\u05dd PR \u05de\u05d5\u05db\u05e0\u05d9\u05dd \u05dc\u05e4\u05e8\u05e1\u05d5\u05dd; \u05d1\u05e0\u05d9 \u05d0\u05d3\u05dd \u05d1\u05d5\u05d3\u05e7\u05d9\u05dd \u05d5\u05de\u05de\u05d6\u05d2\u05d9\u05dd',
    featureData: '\u05e0\u05ea\u05d5\u05e0\u05d9\u05dd \u05d1\u05d6\u05de\u05df \u05d0\u05de\u05ea',
    featureDataDesc:
      '46 \u05db\u05dc\u05d9 MCP \u00b7 \u05e0\u05ea\u05d5\u05e0\u05d9\u05dd \u05e4\u05ea\u05d5\u05d7\u05d9\u05dd \u05e9\u05dc \u05d4\u05e4\u05e8\u05dc\u05de\u05e0\u05d8 \u05d4\u05d0\u05d9\u05e8\u05d5\u05e4\u05d9',
  },
  ja: {
    heading:
      'AI\u304c\u5207\u308a\u62d3\u304f\u30cb\u30e5\u30fc\u30b9\u751f\u6210 & \u30a8\u30fc\u30b8\u30a7\u30f3\u30c8\u30a4\u30f3\u30c6\u30ea\u30b8\u30a7\u30f3\u30b9',
    quote:
      '\u5f93\u6765\u306e\u30cb\u30e5\u30fc\u30b9\u30eb\u30fc\u30e0\u304cAI\u304c\u8a18\u8005\u3092\u7f6e\u304d\u63db\u3048\u308b\u304b\u8b70\u8ad6\u3057\u3066\u3044\u308b\u9593\u306b\u3001EU Parliament Monitor\u306f8\u3064\u306e\u81ea\u5f8b\u578bAI\u30a8\u30fc\u30b8\u30a7\u30f3\u30c8\u3092\u9759\u304b\u306b\u5c55\u958b\u3057\u300114\u8a00\u8a9e\u3067\u8abf\u67fb\u5831\u9053\u30ec\u30d9\u30eb\u306e\u653f\u6cbb\u5206\u6790\u3092\u751f\u6210\u3057\u3066\u3044\u307e\u3059\u3002',
    description:
      'EU Parliament Monitor\u306f\u6b27\u5dde\u8b70\u4f1a\u306e\u5831\u9053\u306b\u7559\u307e\u3089\u305a\u2014\u6a5f\u68b0\u901f\u5ea6\u3067\u6df1\u3044\u653f\u6cbb\u30a4\u30f3\u30c6\u30ea\u30b8\u30a7\u30f3\u30b9\u3092\u81ea\u5f8b\u7684\u306b\u751f\u6210\u3057\u307e\u3059\u3002',
    featureAgents: '8\u3064\u306e\u81ea\u5f8b\u578b\u30a8\u30fc\u30b8\u30a7\u30f3\u30c8',
    featureAgentsDesc:
      '\u30cb\u30e5\u30fc\u30b9\u3001\u30c7\u30fc\u30bf\u3001\u30d5\u30ed\u30f3\u30c8\u30a8\u30f3\u30c9\u3001\u54c1\u8cea\u3001\u30bb\u30ad\u30e5\u30ea\u30c6\u30a3\u3001\u30c9\u30ad\u30e5\u30e1\u30f3\u30c8\u3001DevOps\u3001\u30d7\u30ed\u30c0\u30af\u30c8',
    featureSchedule: '包括的なカバレッジ',
    featureScheduleDesc: '週間展望 · 委員会報告 · 立法トラッカー · 月次レビュー',
    featureHuman:
      '\u30d2\u30e5\u30fc\u30de\u30f3\u30fb\u30a4\u30f3\u30fb\u30b6\u30fb\u30eb\u30fc\u30d7',
    featureHumanDesc:
      '\u30a8\u30fc\u30b8\u30a7\u30f3\u30c8\u304c\u516c\u958b\u6e96\u5099\u6e08\u307fPR\u3092\u4f5c\u6210\u3001\u4eba\u9593\u304c\u30ec\u30d3\u30e5\u30fc\u3057\u3066\u30de\u30fc\u30b8',
    featureData: '\u30ea\u30a2\u30eb\u30bf\u30a4\u30e0\u30c7\u30fc\u30bf',
    featureDataDesc:
      '46\u306eMCP\u30c4\u30fc\u30eb \u00b7 \u6b27\u5dde\u8b70\u4f1a\u30aa\u30fc\u30d7\u30f3\u30c7\u30fc\u30bf',
  },
  ko: {
    heading:
      'AI\uac00 \ud601\uc2e0\ud558\ub294 \ub274\uc2a4 \uc0dd\uc131 & \uc5d0\uc774\uc804\ud2b8 \uc778\ud154\ub9ac\uc804\uc2a4',
    quote:
      '\uc804\ud1b5\uc801\uc778 \ub274\uc2a4\ub8f8\uc774 AI\uac00 \uae30\uc790\ub97c \ub300\uccb4\ud560\uc9c0 \ud1a0\ub860\ud558\ub294 \ub3d9\uc548, EU Parliament Monitor\ub294 \uc870\uc6a9\ud788 8\uac1c\uc758 \uc790\uc728 AI \uc5d0\uc774\uc804\ud2b8\ub97c \ubc30\uce58\ud558\uc5ec 14\uac1c \uc5b8\uc5b4\ub85c \ud0d0\uc0ac \ubcf4\ub3c4 \uc218\uc900\uc758 \uc815\uce58 \ubd84\uc11d\uc744 \uc0dd\uc131\ud558\uace0 \uc788\uc2b5\ub2c8\ub2e4.',
    description:
      'EU Parliament Monitor\ub294 \uc720\ub7fd \uc758\ud68c\ub97c \ub2e8\uc21c\ud788 \ubcf4\ub3c4\ud558\ub294 \uac83\uc774 \uc544\ub2c8\ub77c\u2014\uae30\uacc4 \uc18d\ub3c4\ub85c \uc2ec\uce35 \uc815\uce58 \uc778\ud154\ub9ac\uc804\uc2a4\ub97c \uc790\uc728\uc801\uc73c\ub85c \uc0dd\uc131\ud569\ub2c8\ub2e4.',
    featureAgents: '8\uac1c \uc790\uc728 \uc5d0\uc774\uc804\ud2b8',
    featureAgentsDesc:
      '\ub274\uc2a4, \ub370\uc774\ud130, \ud504\ub860\ud2b8\uc5d4\ub4dc, \ud488\uc9c8, \ubcf4\uc548, \ubb38\uc11c, DevOps, \uc81c\ud488',
    featureSchedule: '포괄적 보도',
    featureScheduleDesc: '주간 전망 · 위원회 보고서 · 입법 추적 · 월간 리뷰',
    featureHuman: '\ud734\uba3c \uc778 \ub354 \ub8e8\ud504',
    featureHumanDesc:
      '\uc5d0\uc774\uc804\ud2b8\uac00 \ubc1c\ud589 \uc900\ube44\ub41c PR\uc744 \uc5f4\uace0, \uc0ac\ub78c\uc774 \uac80\ud1a0 \ud6c4 \uba38\uc9c0',
    featureData: '\uc2e4\uc2dc\uac04 \ub370\uc774\ud130',
    featureDataDesc:
      '46\uac1c MCP \ub3c4\uad6c \u00b7 \uc720\ub7fd \uc758\ud68c \uc624\ud508 \ub370\uc774\ud130',
  },
  zh: {
    heading: 'AI\u98a0\u8986\u65b0\u95fb\u751f\u6210 & \u667a\u80fd\u4f53\u60c5\u62a5',
    quote:
      '\u5f53\u4f20\u7edf\u65b0\u95fb\u7f16\u8f91\u5ba4\u8fd8\u5728\u8ba8\u8bbaAI\u662f\u5426\u4f1a\u53d6\u4ee3\u8bb0\u8005\u65f6\uff0cEU Parliament Monitor\u5df2\u60c4\u7136\u90e8\u7f728\u4e2a\u81ea\u4e3bAI\u4ee3\u7406\uff0c\u4ee514\u79cd\u8bed\u8a00\u751f\u6210\u8c03\u67e5\u6027\u653f\u6cbb\u60c5\u62a5\u5206\u6790\u3002',
    description:
      'EU Parliament Monitor\u4e0d\u4ec5\u4ec5\u62a5\u9053\u6b27\u6d32\u8bae\u4f1a\u2014\u2014\u5b83\u4ee5\u673a\u5668\u901f\u5ea6\u81ea\u4e3b\u751f\u6210\u6df1\u5ea6\u653f\u6cbb\u60c5\u62a5\u3002',
    featureAgents: '8\u4e2a\u81ea\u4e3b\u4ee3\u7406',
    featureAgentsDesc:
      '\u65b0\u95fb\u3001\u6570\u636e\u3001\u524d\u7aef\u3001\u8d28\u91cf\u3001\u5b89\u5168\u3001\u6587\u6863\u3001DevOps\u3001\u4ea7\u54c1',
    featureSchedule: '全面报道',
    featureScheduleDesc: '周前瞻 · 委员会报告 · 立法追踪 · 月度回顾',
    featureHuman: '\u4eba\u673a\u534f\u540c',
    featureHumanDesc: '\u4ee3\u7406\u521b\u5efaPR\uff0c\u4eba\u5de5\u5ba1\u6838\u53d1\u5e03',
    featureData: '\u5b9e\u65f6\u6570\u636e',
    featureDataDesc:
      '46\u4e2aMCP\u5de5\u5177 \u00b7 \u6b27\u6d32\u8bae\u4f1a\u5f00\u653e\u6570\u636e',
  },
};

/* ─── Filter UI Localized Strings ────────────────────────────────── */

/** Filter toolbar labels per language */
