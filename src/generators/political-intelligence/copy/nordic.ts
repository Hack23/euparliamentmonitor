// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/PoliticalIntelligence/Copy/Nordic
 * @description Nordic-language overrides for the Political Intelligence
 * landing-page copy (sv, da, no, fi). Split out of `copy.ts` (Refactor 8/8)
 * so Nordic translators can edit one bounded file. Strings preserved
 * byte-for-byte from the original monolithic IIFE — inlined constants
 * (`SV_METHODOLOGIES`, `NO_METHODOLOGIES`, `ARTEFAKTER_COUNT`,
 * `ARTEFAKT_SINGULAR`) are expanded literally here so the rendered HTML
 * is byte-equal.
 */

import type { PICopy } from './types.js';

/** Shared "artefakter" count labels reused across the closely-related Scandinavian copies (sv/da/no). */
const ARTEFAKTER_COUNT = '{count} artefakter';
const ARTEFAKT_SINGULAR = '1 artefakt';

export const SV_COPY: Partial<PICopy> = {
  title: 'Politisk underrättelse',
  intro:
    'Varje politisk analys som publiceras på denna webbplats stöds av en transparent kedja av metodologier, artefaktmallar och analysdata på körningsnivå. Denna sida ger dig ett enda, fullt länkat index till all tradecraft som används för att producera nyheterna. Alla källor öppnas i GitHub så att du kan granska analysen bakom texten.',
  heroSubtitle: 'Metodologier, mallar och daglig analysöppenhet',
  home: 'Hem',
  breadcrumbCurrent: 'Politisk underrättelse',
  breadcrumbLabel: 'Brödsmulor',
  methodologiesHeading: 'Metodologier',
  methodologiesDescription:
    'Auktoritativa tradecraft-guider — riskramverk, stilstandarder och det 10-stegs AI-drivna analysprotokollet som varje artikel följer.',
  templatesHeading: 'Analysmallar',
  templatesDescription:
    'Katalogen över artefaktmallar som produceras i varje daglig analyskörning — SWOT, PESTLE, hotmatriser, koalitionsdynamik, konsekvensträd med mera.',
  referenceHeading: 'Referenser och datakällor',
  referenceDescription:
    'ISMS-referensanpassningar, indikatorkataloger, EU-landkartläggningar och diagramguider bakom varje IMF- och Världsbanken-källa.',
  statReferenceLabel: 'Referenser',
  dailyHeading: 'Dagliga analyskörningar',
  dailyDescription:
    'Varje publicerad analyskörning, grupperad efter datum och ordnad med nyaste först. Varje körning länkar till hela GitHub-trädet så att du kan granska varje artefaktfil som matade motsvarande artikel.',
  statMethodologiesLabel: 'Metodologier',
  statTemplatesLabel: 'Mallar',
  statRunsLabel: 'Analyskörningar',
  statArtifactsLabel: 'Artefakter',
  viewOnGitHub: 'Visa på GitHub',
  artifactCountLabel: ARTEFAKTER_COUNT,
  artifactCountLabelSingular: ARTEFAKT_SINGULAR,
  runsCountLabel: '{count} körningar',
  runsCountLabelSingular: '1 körning',
  artifactsToggleLabel: 'Visa alla {count} artefaktfiler',
  artifactsToggleLabelSingular: 'Visa 1 artefaktfil',
  sourceInEnglishNote:
    'Källmaterialet (metodologier, mallar och dagliga analysartefakter) publiceras på engelska. Titlar och filvägar är därför på engelska — endast sidans navigation och beskrivningar är översatta.',
  seoKeywords:
    'Europaparlamentet, politisk underrättelse, OSINT, SWOT-analys, PESTLE-analys, metodologi, artefaktmallar, koalitionsmatematik, riskbedömning, hotmodell, öppenhet, EU',
};

export const DA_COPY: Partial<PICopy> = {
  title: 'Politisk efterretning',
  intro:
    'Hver politisk analyse, der udgives på denne side, understøttes af en gennemsigtig kæde af metoder, artefaktskabeloner og kørselsspecifikke analysedata. Denne side giver dig et enkelt, fuldt linket indeks til hele det håndværk, der bruges til at producere nyhederne.',
  heroSubtitle: 'Metoder, skabeloner og daglig analyseåbenhed',
  home: 'Hjem',
  breadcrumbCurrent: 'Politisk efterretning',
  breadcrumbLabel: 'Brødkrummer',
  methodologiesHeading: 'Metoder',
  methodologiesDescription:
    'Autoritative tradecraft-guider — risikorammer, stilstandarder og den 10-trins AI-drevne analyseprotokol, som hver artikel følger.',
  templatesHeading: 'Analyseskabeloner',
  templatesDescription:
    'Kataloget over artefaktskabeloner, der produceres i hver daglig analysekørsel — SWOT, PESTLE, trusselsmatricer, koalitionsdynamikker, konsekvenstræer med mere.',
  referenceHeading: 'Referencer og datakilder',
  referenceDescription:
    'ISMS-referencetilpasninger, indikatorkataloger, EU-landkortlægninger og diagramguider bag hver IMF- og Verdensbanken-kilde.',
  statReferenceLabel: 'Referencer',
  dailyHeading: 'Daglige analysekørsler',
  dailyDescription:
    'Hver udgivet analysekørsel, grupperet efter dato og ordnet nyeste først. Hver kørsel linker til hele GitHub-træet.',
  statMethodologiesLabel: 'Metoder',
  statTemplatesLabel: 'Skabeloner',
  statRunsLabel: 'Analysekørsler',
  statArtifactsLabel: 'Artefakter',
  viewOnGitHub: 'Vis på GitHub',
  artifactCountLabel: ARTEFAKTER_COUNT,
  artifactCountLabelSingular: ARTEFAKT_SINGULAR,
  runsCountLabel: '{count} kørsler',
  runsCountLabelSingular: '1 kørsel',
  artifactsToggleLabel: 'Vis alle {count} artefaktfiler',
  artifactsToggleLabelSingular: 'Vis 1 artefaktfil',
  sourceInEnglishNote:
    'Kildematerialet (metoder, skabeloner og daglige analyseartefakter) udgives på engelsk. Titler og filstier er derfor på engelsk — kun sidens navigation og beskrivelser er oversat.',
  seoKeywords:
    'Europa-Parlamentet, politisk efterretning, OSINT, SWOT-analyse, PESTLE-analyse, metode, artefaktskabeloner, koalitionsmatematik, risikovurdering, trusselmodel, åbenhed, EU',
};

export const NO_COPY: Partial<PICopy> = {
  title: 'Politisk etterretning',
  intro:
    'Hver politiske analyse som publiseres på dette nettstedet støttes av en transparent kjede av metodologier, artefaktmaler og kjøringsnivå-analysedata. Denne siden gir deg en enkelt, fullt lenket indeks til alt håndverket som brukes for å produsere nyhetene.',
  heroSubtitle: 'Metodologier, maler og daglig analyseåpenhet',
  home: 'Hjem',
  breadcrumbCurrent: 'Politisk etterretning',
  breadcrumbLabel: 'Brødsmuler',
  methodologiesHeading: 'Metodologier',
  methodologiesDescription:
    'Autoritative tradecraft-guider — risikorammer, stilstandarder og den 10-stegs AI-drevne analyseprotokollen som hver artikkel følger.',
  templatesHeading: 'Analysemaler',
  templatesDescription:
    'Katalogen over artefaktmaler som produseres i hver daglige analysekjøring — SWOT, PESTLE, trusselmatriser, koalisjonsdynamikk, konsekvenstrær og mer.',
  referenceHeading: 'Referanser og datakilder',
  referenceDescription:
    'ISMS-referansetilpasninger, indikatorkataloger, EU-landkartlegginger og diagramveiledere bak hver IMF- og Verdensbanken-kilde.',
  statReferenceLabel: 'Referanser',
  dailyHeading: 'Daglige analysekjøringer',
  dailyDescription:
    'Hver publiserte analysekjøring, gruppert etter dato og sortert nyeste først. Hver kjøring lenker til hele GitHub-treet.',
  statMethodologiesLabel: 'Metodologier',
  statTemplatesLabel: 'Maler',
  statRunsLabel: 'Analysekjøringer',
  statArtifactsLabel: 'Artefakter',
  viewOnGitHub: 'Vis på GitHub',
  artifactCountLabel: ARTEFAKTER_COUNT,
  artifactCountLabelSingular: ARTEFAKT_SINGULAR,
  runsCountLabel: '{count} kjøringer',
  runsCountLabelSingular: '1 kjøring',
  artifactsToggleLabel: 'Vis alle {count} artefaktfiler',
  artifactsToggleLabelSingular: 'Vis 1 artefaktfil',
  sourceInEnglishNote:
    'Kildematerialet (metodologier, maler og daglige analyseartefakter) publiseres på engelsk. Titler og filstier er derfor på engelsk — bare sidens navigasjon og beskrivelser er oversatt.',
  seoKeywords:
    'Europaparlamentet, politisk etterretning, OSINT, SWOT-analyse, PESTLE-analyse, metodologi, artefaktmaler, koalisjonsmatematikk, risikovurdering, trusselmodell, åpenhet, EU',
};

export const FI_COPY: Partial<PICopy> = {
  title: 'Poliittinen tiedustelu',
  intro:
    'Jokainen sivustolla julkaistava poliittinen analyysi perustuu läpinäkyvään metodologioiden, artefaktipohjien ja ajokohtaisten analyysidataiden ketjuun. Tämä sivu tarjoaa yhden, täysin linkitetyn indeksin kaikkeen uutisten tuottamisessa käytettyyn käsityötaitoon.',
  heroSubtitle: 'Metodologiat, mallit ja päivittäinen analyysin läpinäkyvyys',
  home: 'Etusivu',
  breadcrumbCurrent: 'Poliittinen tiedustelu',
  breadcrumbLabel: 'Navigointipolku',
  methodologiesHeading: 'Metodologiat',
  methodologiesDescription:
    'Arvovaltaiset tradecraft-oppaat — riskinarviointikehykset, tyylistandardit ja 10-vaiheinen tekoälypohjainen analyysiprotokolla.',
  templatesHeading: 'Analyysipohjat',
  templatesDescription:
    'Jokaisessa päivittäisessä analyysiajossa tuotettujen artefaktipohjien luettelo — SWOT, PESTLE, uhkamatriisit, koalitiodynamiikka ja konsekvenssipuut.',
  referenceHeading: 'Viitteet ja tietolähteet',
  referenceDescription:
    'ISMS-viiteadaptaatiot, indikaattoriluettelot, EU-maakartoitukset ja kaavio-integraatio-oppaat jokaisen IMF- ja Maailmanpankki-lähteen takana.',
  statReferenceLabel: 'Viitteet',
  dailyHeading: 'Päivittäiset analyysiajot',
  dailyDescription:
    'Jokainen julkaistu analyysiajo, ryhmiteltynä päivämäärän mukaan uusimmasta vanhimpaan. Jokainen ajo linkitetään GitHub-puuhun.',
  statMethodologiesLabel: 'Metodologiat',
  statTemplatesLabel: 'Pohjat',
  statRunsLabel: 'Analyysiajot',
  statArtifactsLabel: 'Artefaktit',
  viewOnGitHub: 'Näytä GitHubissa',
  artifactCountLabel: '{count} artefaktia',
  artifactCountLabelSingular: '1 artefakti',
  runsCountLabel: '{count} ajoa',
  runsCountLabelSingular: '1 ajo',
  artifactsToggleLabel: 'Näytä kaikki {count} artefaktitiedostoa',
  artifactsToggleLabelSingular: 'Näytä 1 artefaktitiedosto',
  sourceInEnglishNote:
    'Lähdemateriaali (metodologiat, pohjat ja päivittäiset analyysiartefaktit) julkaistaan englanniksi. Otsikot ja tiedostopolut ovat siksi englanniksi — vain sivun navigointi ja kuvaukset on käännetty.',
  seoKeywords:
    'Euroopan parlamentti, poliittinen tiedustelu, OSINT, SWOT-analyysi, PESTLE-analyysi, metodologia, artefaktipohjat, koalitiomatematiikka, riskiarviointi, uhkamalli, avoimuus, EU',
};
