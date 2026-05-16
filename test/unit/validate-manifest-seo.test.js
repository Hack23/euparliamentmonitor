// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for `scripts/validate-manifest-seo.js` — the manifest SEO
 * metadata drift-guard validator.
 *
 * Mirrors the structure of `test/unit/validate-brief-translations.test.js`
 * so future contributors find both validators following the same shape.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  FORBIDDEN_PREFIXES,
  SUPPORTED_LANGS,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
  detectForbiddenPrefix,
  effectiveTextLength,
  findAllManifests,
  parseArgs,
  parseManifestLocation,
  validateManifest,
} from '../../scripts/validate-manifest-seo.js';
import { ALL_LANGUAGES } from '../../scripts/constants/language-core.js';

const ALL_LANGS = [...ALL_LANGUAGES];

const LOCALIZED_TITLES = {
  en: 'Banking Union Deal Tests EPP–S&D Discipline',
  sv: 'Bankunionsuppgörelse prövar EPP–S&D-disciplin',
  da: 'Bankunionsaftale tester EPP–S&D-disciplin',
  no: 'Bankunion-avtale tester EPP–S&D-disiplin',
  fi: 'Pankkiunionisopu testaa EPP–S&D-kuria',
  de: 'Bankenunion-Deal prüft EPP–S&D-Disziplin',
  fr: "L'accord sur l'union bancaire teste EPP–S&D",
  es: 'El pacto de unión bancaria prueba al EPP–S&D',
  nl: 'Bankunieakkoord test EPP–S&D-discipline',
  ar: 'اتفاق الاتحاد المصرفي يختبر انضباط EPP وS&D',
  he: 'עסקת איחוד הבנקים בוחנת משמעת EPP–S&D',
  ja: '銀行同盟合意がEPP・S&D規律を試す',
  ko: '은행동맹 합의가 EPP–S&D 규율을 시험',
  zh: '银行联盟协议考验EPP与S&D纪律',
};

const LOCALIZED_DESCRIPTIONS = {
  en: "Parliament's banking-union compromise narrows supervision deadlines while exposing fresh coalition pressure on EPP, S&D and Renew before the next plenary vote.",
  sv: 'Parlamentets bankunionskompromiss skärper tillsynsfrister och visar tydligt koalitionstryck på EPP, S&D och Renew inför nästa plenarröstning där allt avgörs.',
  da: 'Parlamentets bankunionskompromis skærper tilsynsfrister og viser tydeligt koalitionstryk på EPP, S&D og Renew før næste plenaraftemning der afgør alt.',
  no: 'Parlamentets bankunion-kompromiss skjerper tilsynsfrister og viser tydelig koalisjonspress på EPP, S&D og Renew før neste plenaravstemning som avgjør alt.',
  fi: 'Parlamentin pankkiunionikompromissi kiristää valvontamääräaikoja ja paljastaa selkeästi EPP:n, S&D:n ja Renew\u2019n koalitiopaineen ennen seuraavaa ratkaisevaa äänestystä.',
  de: 'Der Bankenunion-Kompromiss verschärft Aufsichtsfristen und zeigt klaren Koalitionsdruck auf EPP, S&D und Renew vor der nächsten entscheidenden Plenarabstimmung sehr deutlich.',
  fr: "Le compromis sur l'union bancaire resserre nettement les délais de supervision et expose la pression sur EPP, S&D et Renew avant le prochain vote décisif en plénière.",
  es: 'El compromiso sobre unión bancaria estrecha plazos de supervisión y expone presión sobre EPP, S&D y Renew antes del próximo voto plenario decisivo que define todo.',
  nl: 'Het bankuniecompromis verkort toezichtstermijnen aanzienlijk en toont coalitiedruk op EPP, S&D en Renew vóór de volgende beslissende plenaire stemming over alles.',
  ar: 'يضيق حلّ الاتحاد المصرفي بوضوح مهل الرقابة ويكشف ضغط الائتلاف على EPP وS&D وRenew قبل التصويت العام المقبل الحاسم لكل ما يتعلق بالاتحاد المصرفي.',
  he: 'פשרת איחוד הבנקים מצמצמת באופן ניכר מועדי פיקוח וחושפת לחץ קואליציוני ברור על EPP, S&D ו-Renew לפני ההצבעה הבאה במליאה אשר תכריע הכול.',
  ja: '銀行同盟の妥協は監督期限を明確に絞り、次回本会議投票前のEPP、S&D、Renewへの連立圧力をはっきりと示すと同時に欧州議会全体の力学を浮き彫りにする。',
  ko: '은행동맹 절충안은 감독 기한을 분명히 좁히고 다음 본회의 표결 전 EPP, S&D, Renew의 연정 압박을 명확히 드러내며 유럽의회 전체 역학을 뚜렷이 보여준다.',
  zh: '银行联盟折中方案明显压缩监管期限，并在下次决定性的全会投票前清晰暴露EPP、S&D和Renew之间的联盟压力，揭示欧洲议会全局走向。',
};

function makeManifest(overrides = {}) {
  return {
    articleType: 'breaking',
    date: '2026-05-16',
    title: { ...LOCALIZED_TITLES },
    description: { ...LOCALIZED_DESCRIPTIONS },
    ...overrides,
  };
}

function fullMap(value) {
  const out = {};
  for (const lang of ALL_LANGS) out[lang] = value;
  return out;
}

describe('SUPPORTED_LANGS', () => {
  it('matches the canonical 14-language set', () => {
    expect(SUPPORTED_LANGS.size).toBe(14);
    for (const lang of ALL_LANGS) {
      expect(SUPPORTED_LANGS.has(lang)).toBe(true);
    }
  });
});

describe('constants', () => {
  it('description bounds are sensible', () => {
    expect(DESCRIPTION_MIN_LENGTH).toBeLessThan(DESCRIPTION_MAX_LENGTH);
    expect(DESCRIPTION_MIN_LENGTH).toBeGreaterThan(40);
    expect(DESCRIPTION_MAX_LENGTH).toBeLessThanOrEqual(220);
  });
  it('title max matches article-metadata.ts', () => {
    expect(TITLE_MAX_LENGTH).toBe(140);
  });
  it('title min is a defense-in-depth floor below editorial target', () => {
    expect(TITLE_MIN_LENGTH).toBeGreaterThanOrEqual(15);
    expect(TITLE_MIN_LENGTH).toBeLessThan(70);
  });
  it('forbidden-prefix list covers Stage-B preamble labels', () => {
    expect(FORBIDDEN_PREFIXES).toContain('run:');
    expect(FORBIDDEN_PREFIXES).toContain('purpose:');
    expect(FORBIDDEN_PREFIXES).toContain('bluf:');
    expect(FORBIDDEN_PREFIXES).toContain('classification:');
  });
});

describe('detectForbiddenPrefix', () => {
  it('flags a leading "Run:" prefix', () => {
    expect(detectForbiddenPrefix('Run: 04 — breaking 2026-05-16')).toBe('run:');
  });
  it('is case-insensitive', () => {
    expect(detectForbiddenPrefix('PURPOSE: deliver the brief')).toBe('purpose:');
  });
  it('returns null for editorial prose', () => {
    expect(detectForbiddenPrefix('Banking union pact narrows ECON deadlines')).toBeNull();
  });
  it('tolerates non-string input', () => {
    expect(detectForbiddenPrefix(null)).toBeNull();
    expect(detectForbiddenPrefix(42)).toBeNull();
  });
});

describe('effectiveTextLength', () => {
  it('counts Latin characters as 1 each', () => {
    expect(effectiveTextLength('Banking union deal')).toBe(18);
  });
  it('weights CJK characters as 2', () => {
    // '银行联盟协议考验EPP与S&D纪律' — 11 CJK chars + 6 ASCII = 11*2 + 6 = 28.
    const value = '银行联盟协议考验EPP与S&D纪律';
    // Self-document the underlying character count assumption.
    expect([...value].length).toBe(17);
    expect(effectiveTextLength(value)).toBe(28);
  });
  it('weights Hiragana/Katakana/Hangul as 2', () => {
    expect(effectiveTextLength('銀行同盟')).toBe(8); // 4 CJK ideographs
    expect(effectiveTextLength('은행동맹')).toBe(8); // 4 Hangul syllables
    expect(effectiveTextLength('カタカナ')).toBe(8); // 4 Katakana
  });
  it('trims surrounding whitespace before counting', () => {
    expect(effectiveTextLength('   hello   ')).toBe(5);
  });
  it('returns 0 for non-strings', () => {
    expect(effectiveTextLength(null)).toBe(0);
    expect(effectiveTextLength(undefined)).toBe(0);
    expect(effectiveTextLength(42)).toBe(0);
  });
});

describe('parseManifestLocation', () => {
  it('parses date + slug from an analysis/daily manifest path', () => {
    expect(parseManifestLocation('analysis/daily/2026-05-16/breaking/manifest.json')).toEqual({
      date: '2026-05-16',
      slug: 'breaking',
    });
  });
  it('handles Windows-style separators', () => {
    expect(
      parseManifestLocation('analysis\\daily\\2026-05-16\\week-ahead\\manifest.json')
    ).toEqual({ date: '2026-05-16', slug: 'week-ahead' });
  });
  it('returns null for a non-canonical path', () => {
    expect(parseManifestLocation('news/some-article.html')).toBeNull();
  });
});

describe('parseArgs', () => {
  it('accumulates positional --paths arguments', () => {
    const opts = parseArgs(['--paths', 'a.json', 'b.json', '--quiet']);
    expect(opts.paths).toEqual(['a.json', 'b.json']);
    expect(opts.quiet).toBe(true);
  });
  it('supports the conventional `--` sentinel as end-of-positional', () => {
    const opts = parseArgs(['--paths', 'a.json', 'b.json', '--', '--quiet']);
    expect(opts.paths).toEqual(['a.json', 'b.json']);
    expect(opts.quiet).toBe(true);
  });
  it('toggles --no-fail', () => {
    expect(parseArgs(['--no-fail']).fail).toBe(false);
    expect(parseArgs([]).fail).toBe(true);
  });
  it('throws on unknown flags', () => {
    expect(() => parseArgs(['--wat'])).toThrow(/Unknown flag/);
  });
});

describe('validateManifest', () => {
  let tmp;
  let manifestPath;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-manifest-seo-'));
    const runDir = path.join(tmp, 'analysis', 'daily', '2026-05-16', 'breaking');
    fs.mkdirSync(runDir, { recursive: true });
    manifestPath = path.join(runDir, 'manifest.json');
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  function write(manifest) {
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  }

  it('returns no violations for a well-formed manifest', () => {
    write(makeManifest());
    expect(validateManifest(manifestPath, tmp)).toEqual([]);
  });

  it('flags missing manifest.json', () => {
    const v = validateManifest(path.join(tmp, 'missing.json'), tmp);
    expect(v).toHaveLength(1);
    expect(v[0].gate).toBe('parse');
  });

  it('flags invalid JSON', () => {
    fs.writeFileSync(manifestPath, '{ broken ');
    const v = validateManifest(manifestPath, tmp);
    expect(v.some((entry) => entry.gate === 'parse')).toBe(true);
  });

  it('emits an advisory violation when title is a single string', () => {
    write(makeManifest({ title: 'Single string title' }));
    const v = validateManifest(manifestPath, tmp);
    const shape = v.filter((entry) => entry.gate === 'title-shape');
    expect(shape).toHaveLength(1);
    expect(shape[0].message).toMatch(/advisory/);
  });

  it('flags unsupported language keys', () => {
    const t = fullMap('Banking union pact narrows ECON deadlines');
    t.xx = 'Bogus language';
    write(makeManifest({ title: t }));
    const v = validateManifest(manifestPath, tmp);
    expect(
      v.some((entry) => entry.gate === 'title-shape' && entry.lang === 'xx')
    ).toBe(true);
  });

  it('flags titles longer than TITLE_MAX_LENGTH', () => {
    const longTitle = 'A'.repeat(TITLE_MAX_LENGTH + 5);
    const t = fullMap('OK editorial title for length test');
    t.fr = longTitle;
    write(makeManifest({ title: t }));
    const v = validateManifest(manifestPath, tmp);
    expect(
      v.some((entry) => entry.gate === 'title-length' && entry.lang === 'fr')
    ).toBe(true);
  });

  it('flags titles shorter than TITLE_MIN_LENGTH', () => {
    const t = fullMap('Acceptable editorial banking-union headline');
    t.de = 'Too short';
    write(makeManifest({ title: t }));
    const v = validateManifest(manifestPath, tmp);
    expect(
      v.some((entry) => entry.gate === 'title-length' && entry.lang === 'de')
    ).toBe(true);
  });

  it('flags descriptions below the minimum length', () => {
    const d = fullMap('A'.repeat(DESCRIPTION_MIN_LENGTH + 5));
    d.de = 'too short';
    write(makeManifest({ description: d }));
    const v = validateManifest(manifestPath, tmp);
    expect(
      v.some((entry) => entry.gate === 'description-length' && entry.lang === 'de')
    ).toBe(true);
  });

  it('flags descriptions above the maximum length', () => {
    const d = fullMap('A'.repeat(DESCRIPTION_MIN_LENGTH + 5));
    d.es = 'B'.repeat(DESCRIPTION_MAX_LENGTH + 50);
    write(makeManifest({ description: d }));
    const v = validateManifest(manifestPath, tmp);
    expect(
      v.some((entry) => entry.gate === 'description-length' && entry.lang === 'es')
    ).toBe(true);
  });

  it('flags forbidden Stage-B preamble prefixes', () => {
    const t = fullMap('OK editorial banking-union headline');
    t.de = 'Run: 04 — breaking 2026-05-16';
    write(makeManifest({ title: t }));
    const v = validateManifest(manifestPath, tmp);
    expect(
      v.some((entry) => entry.gate === 'forbidden-prefix' && entry.lang === 'de')
    ).toBe(true);
  });

  it('collapses english fallthrough into a single per-(manifest, kind) entry', () => {
    const t = fullMap('English banking-union headline');
    write(makeManifest({ title: t }));
    const v = validateManifest(manifestPath, tmp);
    const fallthroughs = v.filter((entry) => entry.gate === 'english-fallthrough');
    // 13 non-English locales duplicate the English title → one collapsed entry.
    expect(fallthroughs).toHaveLength(1);
    const [entry] = fallthroughs;
    expect(entry.lang).toBe('*');
    expect(entry.affectedLangs).toHaveLength(13);
    expect(entry.affectedLangs).not.toContain('en');
    expect(entry.message).toMatch(/13 locales/);
  });

  it('reports english fallthrough for title and description independently', () => {
    write(
      makeManifest({
        title: fullMap('English banking-union headline'),
        description: fullMap(
          'Parliament narrows banking-union supervision deadlines while exposing fresh coalition pressure on EPP, S&D and Renew before the next plenary vote.'
        ),
      })
    );
    const v = validateManifest(manifestPath, tmp);
    const fallthroughs = v.filter((entry) => entry.gate === 'english-fallthrough');
    // One collapsed entry per kind (title, description).
    expect(fallthroughs).toHaveLength(2);
    const messages = fallthroughs.map((e) => e.message).join('|');
    expect(messages).toMatch(/title/);
    expect(messages).toMatch(/description/);
  });

  it('uses the single lang code when only one locale duplicates English', () => {
    const t = { ...LOCALIZED_TITLES };
    // Force a single-locale duplicate of the English value.
    t.de = t.en;
    write(makeManifest({ title: t }));
    const v = validateManifest(manifestPath, tmp);
    const fallthroughs = v.filter((entry) => entry.gate === 'english-fallthrough');
    expect(fallthroughs).toHaveLength(1);
    expect(fallthroughs[0].lang).toBe('de');
    expect(fallthroughs[0].affectedLangs).toEqual(['de']);
  });

  it('accepts english fallthrough when metadataFallback declares it', () => {
    const t = fullMap('English banking-union headline');
    const declared = {};
    for (const lang of ALL_LANGS) {
      if (lang !== 'en') declared[lang] = 'en';
    }
    write(
      makeManifest({
        title: t,
        description: fullMap(
          'Parliament narrows banking-union supervision deadlines while exposing fresh coalition pressure on EPP, S&D and Renew before the next plenary vote.'
        ),
        metadataFallback: declared,
      })
    );
    const v = validateManifest(manifestPath, tmp);
    expect(v.filter((entry) => entry.gate === 'english-fallthrough')).toHaveLength(0);
  });

  it('accepts a manifest with no title/description block', () => {
    write({ articleType: 'breaking', date: '2026-05-16' });
    expect(validateManifest(manifestPath, tmp)).toEqual([]);
  });
});

describe('findAllManifests', () => {
  it('returns an empty list when analysis/daily is missing', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-manifest-seo-empty-'));
    try {
      expect(findAllManifests(tmp)).toEqual([]);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
  it('walks analysis/daily/<date>/<slug>/manifest.json', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-manifest-seo-walk-'));
    try {
      const runDir = path.join(tmp, 'analysis', 'daily', '2026-05-16', 'breaking');
      fs.mkdirSync(runDir, { recursive: true });
      const expected = path.join(runDir, 'manifest.json');
      fs.writeFileSync(expected, '{}');
      expect(findAllManifests(tmp)).toEqual([expected]);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
