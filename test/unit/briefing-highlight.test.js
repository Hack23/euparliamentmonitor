// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for the briefing-highlight extractor — covers the
 * `## Strategic Intelligence Summary` and `## Reader Briefing`
 * structural patterns introduced by the May-2026 executive-brief
 * style guide.
 */

import { describe, it, expect } from 'vitest';
import {
  extractBriefingHighlight,
  extractReaderBriefingHighlight,
  extractStrategicSynthesisHighlight,
} from '../../scripts/aggregator/metadata/briefing-highlight.js';

const STRATEGIC_BRIEF = `# Executive Brief

Some intro prose.

## Strategic Intelligence Summary

### The Three-Coalition Paradox

EP10's governing coalition (EPP+S&D+Renew = 398/719) is simultaneously strong enough to pass legislation and internally divided enough to create unpredictable outcomes on key files. The strategic paradox: Renew Europe is the coalition's most centrist member but is also the most hostile to the Mercosur ECJ referral.

### Timeline Intelligence

A different sub-section that should not be picked.
`;

const READER_BRIEFING_BRIEF = `# Executive Brief

## Reader Briefing

1. **Immediate priority**: DMA enforcement — the Article 265 TFEU threat is a latent nuclear option that could reshape EP-Commission relations if activated.
2. **Strategic watch**: Mercosur ECJ timeline.

## Some Other Section

Tail content.
`;

const COMBINED_BRIEF = `${STRATEGIC_BRIEF}

${READER_BRIEFING_BRIEF}`;

const PROSE_READER_BRIEF = `# Executive Brief

## Reader Briefing (Plain Language)

The week ahead centres on the DMA enforcement procedure and the Mercosur ECJ referral. Both files test the strength of the governing coalition.

## Tail

end.
`;

describe('extractStrategicSynthesisHighlight', () => {
  it('lifts the first ### sub-heading and its paragraph as headline/summary', () => {
    const out = extractStrategicSynthesisHighlight(STRATEGIC_BRIEF);
    expect(out).not.toBeNull();
    expect(out?.headline).toBe('The Three-Coalition Paradox');
    expect(out?.summary).toContain("EP10's governing coalition");
    expect(out?.summary.length).toBeGreaterThan(80);
  });

  it('returns null when the section is absent', () => {
    expect(extractStrategicSynthesisHighlight('# Title\n\nNothing.\n')).toBeNull();
  });

  it('does not bleed prose from a later ## section', () => {
    const out = extractStrategicSynthesisHighlight(STRATEGIC_BRIEF);
    expect(out?.summary).not.toContain('Timeline Intelligence');
  });
});

describe('extractReaderBriefingHighlight', () => {
  it('extracts the first numbered list item with its bold label', () => {
    const out = extractReaderBriefingHighlight(READER_BRIEFING_BRIEF);
    expect(out).not.toBeNull();
    expect(out?.headline).toContain('Immediate priority');
    expect(out?.headline).toContain('DMA enforcement');
  });

  it('does not pick the second list item', () => {
    const out = extractReaderBriefingHighlight(READER_BRIEFING_BRIEF);
    expect(out?.headline).not.toContain('Strategic watch');
  });

  it('falls back to the prose paragraph when no numbered list is present', () => {
    const out = extractReaderBriefingHighlight(PROSE_READER_BRIEF);
    expect(out).not.toBeNull();
    expect(out?.summary).toContain('DMA enforcement procedure');
    expect(out?.headline).toContain('DMA enforcement procedure');
  });

  it('returns null when neither numbered list nor prose paragraph exists', () => {
    expect(extractReaderBriefingHighlight('# Title\n\nNo briefing.\n')).toBeNull();
  });
});

describe('extractBriefingHighlight (combined)', () => {
  it('prefers Strategic Intelligence Summary headline + paragraph', () => {
    const out = extractBriefingHighlight(COMBINED_BRIEF);
    expect(out?.headline).toBe('The Three-Coalition Paradox');
    expect(out?.summary).toContain("EP10's governing coalition");
  });

  it('falls back to Reader Briefing when Strategic Intelligence Summary is missing', () => {
    const out = extractBriefingHighlight(READER_BRIEFING_BRIEF);
    expect(out?.headline).toContain('Immediate priority');
  });

  it('returns null when neither section exists', () => {
    expect(extractBriefingHighlight('# Title\n\nNothing here.\n')).toBeNull();
  });

  it('tolerates emoji-decorated headings (`## 🧭 Strategic Intelligence Summary`)', () => {
    const decorated = STRATEGIC_BRIEF.replace(
      '## Strategic Intelligence Summary',
      '## 🧭 Strategic Intelligence Summary'
    );
    const out = extractBriefingHighlight(decorated);
    expect(out?.headline).toBe('The Three-Coalition Paradox');
  });
});

/**
 * Per-language fixtures verifying that the same 4-fallback chain
 * resolves a non-empty headline for translated briefs in all 14
 * supported languages.
 *
 * Convention A — translated body under English H2 (motions /
 * committee-reports). The extractor must match the English needle
 * (`Strategic Intelligence Summary`, `BLUF`, `Reader Briefing`) and
 * lift the first translated paragraph.
 *
 * Convention B — translated H2 (propositions / breaking). The
 * extractor must match the localised needle and lift either the
 * first translated `### sub-heading` or the first paragraph.
 *
 * Boilerplate gate — when the only paragraph under the matched
 * section opens with the localised "This executive brief
 * synthesizes…" stem, the extractor must NOT lift it as a headline
 * (it falls through to the resolver's next ladder rung).
 */
describe('extractBriefingHighlight — Convention A (English H2, translated body) per language', () => {
  const CASES = [
    ['sv', 'Det europeiska parlamentets utskottssystem inleder veckan med hög lagstiftningsefterfrågan.'],
    ['da', 'Europa-Parlamentets udvalgssystem indleder ugen med høj lovgivningsefterspørgsel.'],
    ['no', 'Europaparlamentets komitésystem innleder uken med høy lovgivningsetterspørsel.'],
    ['fi', 'Euroopan parlamentin valiokuntajärjestelmä aloittaa viikon korkealla lainsäädäntökysynnällä.'],
    ['de', 'Das Ausschusssystem des Europäischen Parlaments tritt diese Woche in eine Phase hoher Gesetzgebungsnachfrage ein.'],
    ['fr', 'Le système de commissions du Parlement européen entre cette semaine dans une période de forte demande législative.'],
    ['es', 'El sistema de comisiones del Parlamento Europeo entra esta semana en una fase de alta demanda legislativa.'],
    ['nl', 'Het commissiestelsel van het Europees Parlement treedt deze week een fase van hoge wetgevende vraag in.'],
    ['ar', 'يدخل نظام لجان البرلمان الأوروبي هذا الأسبوع في مرحلة ذات طلب تشريعي مرتفع وقيود واضحة على رؤية المراقبة.'],
    ['he', 'מערכת הוועדות של הפרלמנט האירופי נכנסת השבוע לתקופה של ביקוש חקיקתי גבוה ומגבלות נראות על המעקב.'],
    ['ja', '欧州議会の委員会システムは、可視性が限られた監視のもと、立法需要の高い状況で今週を迎えている。'],
    ['ko', '유럽의회 위원회 시스템은 가시성이 제한된 모니터링 환경 속에서 높은 입법 수요를 배경으로 이번 주를 맞이하고 있다.'],
    ['zh', '欧洲议会委员会系统在监控可见度有限的情况下，以高立法需求迎来本周。'],
  ];
  for (const [lang, leadParagraph] of CASES) {
    it(`lifts the first translated paragraph under \`## BLUF\` for ${lang}`, () => {
      const brief = `# Brief\n\n## BLUF — Bottom Line Up Front\n\n${leadParagraph}\n\n## Tail\n\nend.\n`;
      const out = extractBriefingHighlight(brief, lang);
      expect(out, `lang=${lang}`).not.toBeNull();
      expect(out?.headline.length, `lang=${lang} headline`).toBeGreaterThan(0);
      expect(out?.summary, `lang=${lang} summary`).toContain(leadParagraph.slice(0, 20));
    });
  }
});

describe('extractBriefingHighlight — Convention B (translated H2) per language', () => {
  // Each entry: [lang, translated H2 for Strategic synthesis, translated paragraph]
  const CASES = [
    ['sv', 'Strategisk kontext', 'Europaparlamentet inleder veckan med komplexa lagstiftningsdossierer som kräver koalitionshantering.'],
    ['da', 'Strategisk kontekst', 'Europa-Parlamentet indleder ugen med komplekse lovgivningsdossierer der kræver koalitionshåndtering.'],
    ['no', 'Strategisk kontekst', 'Europaparlamentet innleder uken med komplekse lovgivningsmessige dossierer som krever koalisjonshåndtering.'],
    ['fi', 'Strateginen konteksti', 'Euroopan parlamentti aloittaa viikon monimutkaisilla lainsäädäntöasiakirjoilla, jotka vaativat koalition hallintaa.'],
    ['de', 'Strategischer Kontext', 'Das Europäische Parlament tritt in eine Woche mit komplexen Gesetzgebungsdossiers ein, die ein Koalitionsmanagement erfordern.'],
    ['fr', 'Contexte stratégique', 'Le Parlement européen aborde une semaine de dossiers législatifs complexes nécessitant une gestion de coalition.'],
    ['es', 'Contexto estratégico', 'El Parlamento Europeo aborda una semana de expedientes legislativos complejos que requieren gestión de coalición.'],
    ['nl', 'Strategische context', 'Het Europees Parlement treedt een week binnen met complexe wetgevingsdossiers die coalitiebeheer vereisen.'],
    ['ar', 'السياق الاستراتيجي', 'يدخل البرلمان الأوروبي أسبوعاً ذا ملفات تشريعية معقدة تتطلب إدارة تحالفات دقيقة.'],
    ['he', 'הקשר אסטרטגי', 'הפרלמנט האירופי נכנס לשבוע של תיקי חקיקה מורכבים הדורשים ניהול קואליציוני זהיר.'],
    ['ja', '戦略的文脈', '欧州議会は、連立管理を要求する複雑な立法ドシエの週に入る。三つの同時並行する立法の流れが政治的注目を要する。'],
    ['ko', '전략적 맥락', '유럽의회는 연합 관리가 필요한 복잡한 입법 안건의 주간에 들어선다. 세 가지 동시 입법 흐름이 정치적 주의를 요구한다.'],
    ['zh', '战略背景', '欧洲议会进入一个需要联盟管理的复杂立法格局周。三条同步推进的立法轨道要求政治关注。'],
  ];
  for (const [lang, h2, paragraph] of CASES) {
    it(`matches localised H2 "${h2}" and lifts the paragraph for ${lang}`, () => {
      const brief = `# Brief\n\n## ${h2}\n\n${paragraph}\n\n## Tail\n\nend.\n`;
      const out = extractBriefingHighlight(brief, lang);
      expect(out, `lang=${lang}`).not.toBeNull();
      expect(out?.headline.length, `lang=${lang} headline`).toBeGreaterThan(0);
      expect(out?.summary, `lang=${lang} summary`).toContain(paragraph.slice(0, 20));
    });
  }
});

describe('extractBriefingHighlight — Convention B sub-heading lifting per language', () => {
  // Translated `### 1. <heading>` under translated H2; the sub-heading
  // text should be lifted verbatim as the headline.
  const CASES = [
    ['sv', 'Viktiga händelser', '1. Förordning om granskning av utländska investeringar'],
    ['da', 'Nøglebegivenheder', '1. Forordning om screening af udenlandske investeringer'],
    ['no', 'Nøkkelhendelser', '1. Forordning om screening av utenlandske investeringer'],
    ['fi', 'Keskeiset tapahtumat', '1. Ulkomaisten investointien seulontaa koskeva asetus'],
    ['de', 'Wichtige Ereignisse', '1. Verordnung über die Überprüfung ausländischer Investitionen'],
    ['fr', 'Événements clés', '1. Règlement sur le filtrage des investissements étrangers'],
    ['es', 'Eventos clave', '1. Reglamento sobre el control de las inversiones extranjeras'],
    ['nl', 'Belangrijke gebeurtenissen', '1. Verordening betreffende de screening van buitenlandse investeringen'],
    ['ar', 'الأحداث الرئيسية', '1. لائحة فحص الاستثمارات الأجنبية'],
    ['he', 'אירועי מפתח', '1. תקנת בדיקת השקעות זרות'],
    ['ja', '主要イベント', '1. 外国投資スクリーニング規則'],
    ['ko', '주요 사건', '1. 외국인 투자 심사 규정'],
    ['zh', '主要事件', '1. 外国投资审查条例'],
  ];
  for (const [lang, h2, subHeading] of CASES) {
    it(`lifts translated \`### ${subHeading}\` under "${h2}" for ${lang}`, () => {
      const brief = `# Brief\n\n## ${h2}\n\n### ${subHeading}\n\nbody paragraph that explains the regulation in detail.\n`;
      const out = extractBriefingHighlight(brief, lang);
      expect(out, `lang=${lang}`).not.toBeNull();
      expect(out?.headline, `lang=${lang}`).toContain(subHeading.replace(/^\d+\.\s*/, ''));
    });
  }
});

describe('extractBriefingHighlight — boilerplate stem rejection per language', () => {
  // When the only paragraph under the matched section is the
  // translated "This executive brief synthesizes…" stem, the
  // extractor must NOT lift it as a headline.
  const CASES = [
    ['sv', 'Denna verkställande sammanfattning syntetiserar EP-utskottsinformation för denna vecka.'],
    ['da', 'Dette udøvende resumé syntetiserer EP-udvalgsinformation for denne uge.'],
    ['no', 'Dette utøvende sammendrag syntetiserer EP-komitéinformasjon for denne uken.'],
    ['fi', 'Tämä toimeenpaneva tiivistelmä syntetisoi EP-valiokuntatietoja tälle viikolle.'],
    ['de', 'Dieser Kurzbericht für Entscheidungsträger synthetisiert das EP-Ausschuss-Geheimdienstwissen für diese Woche.'],
    ['fr', 'Ce briefing exécutif pour décideurs synthétise le renseignement des commissions du PE pour cette semaine.'],
    ['es', 'Este informe ejecutivo para responsables de decisiones sintetiza la inteligencia de las comisiones del PE.'],
    ['nl', 'Dit uitvoerend briefingdocument synthetiseert EP-commissie-inlichtingen voor deze week.'],
    ['ar', 'يُجمِّع هذا الموجز التنفيذي استخبارات لجان البرلمان الأوروبي لهذا الأسبوع.'],
    ['he', 'תקציר ניהולי זה מסכם את מודיעין ועדות הפרלמנט האירופי לשבוע זה.'],
    ['ja', '本エグゼクティブブリーフは2026年5月26日の欧州議会委員会インテリジェンスを統合する。'],
    ['ko', '이 집행 브리핑은 2026년 5월 26일의 유럽의회 위원회 정보를 통합한다.'],
    ['zh', '本执行简报综合了2026年5月26日的欧洲议会委员会情报。'],
  ];
  for (const [lang, boilerplate] of CASES) {
    it(`rejects "${boilerplate.slice(0, 40)}…" as Reader-Briefing headline for ${lang}`, () => {
      const brief = `# Brief\n\n## Reader Briefing\n\n${boilerplate}\n\n## Tail\n\nend.\n`;
      const out = extractReaderBriefingHighlight(brief, lang);
      // The boilerplate filter strips the paragraph in normalizeBriefingLine,
      // so the section yields null or an empty result.
      if (out !== null) {
        expect(out.headline, `lang=${lang} should not lift boilerplate`).not.toContain(
          boilerplate.slice(0, 20)
        );
      }
    });
  }
});
