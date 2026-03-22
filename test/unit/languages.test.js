// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

// @ts-check

/**
 * Unit tests for constants/languages module
 * Tests consolidated language data and utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  ALL_LANGUAGES,
  LANGUAGE_PRESETS,
  LANGUAGE_NAMES,
  PAGE_TITLES,
  PAGE_DESCRIPTIONS,
  SECTION_HEADINGS,
  NO_ARTICLES_MESSAGES,
  ARTICLE_TYPE_LABELS,
  READ_TIME_LABELS,
  BACK_TO_NEWS_LABELS,
  WEEK_AHEAD_TITLES,
  MOTIONS_TITLES,
  BREAKING_NEWS_TITLES,
  COMMITTEE_REPORTS_TITLES,
  PROPOSITIONS_TITLES,
  PROPOSITIONS_STRINGS,
  EDITORIAL_STRINGS,
  HEADER_SUBTITLE_LABELS,
  FOOTER_ABOUT_HEADING_LABELS,
  FOOTER_ABOUT_TEXT_LABELS,
  FOOTER_QUICK_LINKS_LABELS,
  FOOTER_BUILT_BY_LABELS,
  FOOTER_LANGUAGES_LABELS,
  MONTHLY_REVIEW_TITLES,
  DEEP_ANALYSIS_STRINGS,
  MONTH_IN_REVIEW_STRINGS,
  ANALYSIS_QUALITY_LABELS,
  getLocalizedString,
  isSupportedLanguage,
  getTextDirection,
} from '../../scripts/constants/languages.js';

describe('constants/languages', () => {
  describe('ALL_LANGUAGES', () => {
    it('should contain exactly 14 language codes', () => {
      expect(ALL_LANGUAGES).toHaveLength(14);
    });

    it('should contain all expected Hack23 market languages', () => {
      const expected = ['en', 'sv', 'da', 'no', 'fi', 'de', 'fr', 'es', 'nl', 'ar', 'he', 'ja', 'ko', 'zh'];
      expect([...ALL_LANGUAGES]).toEqual(expected);
    });
  });

  describe('LANGUAGE_PRESETS', () => {
    it('should have all presets', () => {
      expect(LANGUAGE_PRESETS.all).toEqual(ALL_LANGUAGES);
    });

    it('should have eu-core preset with 5 languages', () => {
      expect(LANGUAGE_PRESETS['eu-core']).toHaveLength(5);
      expect(LANGUAGE_PRESETS['eu-core']).toContain('en');
      expect(LANGUAGE_PRESETS['eu-core']).toContain('de');
      expect(LANGUAGE_PRESETS['eu-core']).toContain('fr');
    });

    it('should have nordic preset with 5 languages', () => {
      expect(LANGUAGE_PRESETS.nordic).toHaveLength(5);
      expect(LANGUAGE_PRESETS.nordic).toContain('sv');
      expect(LANGUAGE_PRESETS.nordic).toContain('da');
      expect(LANGUAGE_PRESETS.nordic).toContain('no');
      expect(LANGUAGE_PRESETS.nordic).toContain('fi');
    });
  });

  describe('Language Maps', () => {
    it('should have entries for all 14 languages in LANGUAGE_NAMES', () => {
      for (const lang of ALL_LANGUAGES) {
        expect(LANGUAGE_NAMES[lang]).toBeDefined();
        expect(typeof LANGUAGE_NAMES[lang]).toBe('string');
      }
    });

    it('should have entries for all 14 languages in PAGE_TITLES', () => {
      for (const lang of ALL_LANGUAGES) {
        expect(PAGE_TITLES[lang]).toBeDefined();
      }
    });

    it('should have entries for all 14 languages in PAGE_DESCRIPTIONS', () => {
      for (const lang of ALL_LANGUAGES) {
        expect(PAGE_DESCRIPTIONS[lang]).toBeDefined();
      }
    });

    it('should have entries for all 14 languages in SECTION_HEADINGS', () => {
      for (const lang of ALL_LANGUAGES) {
        expect(SECTION_HEADINGS[lang]).toBeDefined();
      }
    });

    it('should have entries for all 14 languages in NO_ARTICLES_MESSAGES', () => {
      for (const lang of ALL_LANGUAGES) {
        expect(NO_ARTICLES_MESSAGES[lang]).toBeDefined();
      }
    });

    it('should have entries for all 14 languages in ARTICLE_TYPE_LABELS', () => {
      const expectedCategories = [
        'week-ahead', 'month-ahead', 'year-ahead',
        'week-in-review', 'month-in-review', 'year-in-review',
        'breaking', 'committee-reports', 'motions',
        'propositions', 'deep-analysis',
      ];
      for (const lang of ALL_LANGUAGES) {
        const labels = ARTICLE_TYPE_LABELS[lang];
        expect(labels).toBeDefined();
        for (const cat of expectedCategories) {
          expect(labels[cat]).toBeDefined();
        }
      }
    });

    it('should have entries for all 14 languages in READ_TIME_LABELS', () => {
      for (const lang of ALL_LANGUAGES) {
        const formatter = READ_TIME_LABELS[lang];
        expect(formatter).toBeDefined();
        expect(typeof formatter).toBe('function');
        expect(formatter(5)).toContain('5');
      }
    });

    it('should have entries for all 14 languages in BACK_TO_NEWS_LABELS', () => {
      for (const lang of ALL_LANGUAGES) {
        expect(BACK_TO_NEWS_LABELS[lang]).toBeDefined();
      }
    });

    it('should have entries for all 14 languages in WEEK_AHEAD_TITLES', () => {
      for (const lang of ALL_LANGUAGES) {
        const generator = WEEK_AHEAD_TITLES[lang];
        expect(generator).toBeDefined();
        expect(typeof generator).toBe('function');
        const result = generator('2025-01-01', '2025-01-07');
        expect(result.title).toBeDefined();
        expect(result.subtitle).toBeDefined();
      }
    });


    it('should have entries for all 14 languages in MOTIONS_TITLES', () => {
      for (const lang of ALL_LANGUAGES) {
        const generator = MOTIONS_TITLES[lang];
        expect(generator).toBeDefined();
        expect(typeof generator).toBe('function');
        const result = generator('2025-01-01');
        expect(result.title).toBeDefined();
        expect(result.subtitle).toBeDefined();
      }
    });

    it('should have entries for all 14 languages in BREAKING_NEWS_TITLES', () => {
      for (const lang of ALL_LANGUAGES) {
        const generator = BREAKING_NEWS_TITLES[lang];
        expect(generator).toBeDefined();
        expect(typeof generator).toBe('function');
        const result = generator('2025-01-01');
        expect(result.title).toBeDefined();
        expect(result.subtitle).toBeDefined();
        expect(result.title).toContain('2025-01-01');
      }
    });

    it('should have entries for all 14 languages in PROPOSITIONS_TITLES', () => {
      for (const lang of ALL_LANGUAGES) {
        const generator = PROPOSITIONS_TITLES[lang];
        expect(generator).toBeDefined();
        expect(typeof generator).toBe('function');
        const result = generator();
        expect(result.title).toBeDefined();
        expect(result.subtitle).toBeDefined();
        expect(result.title.length).toBeGreaterThan(0);
        expect(result.subtitle.length).toBeGreaterThan(0);
      }
    });

    it('should have entries for all 14 languages in PROPOSITIONS_STRINGS', () => {
      for (const lang of ALL_LANGUAGES) {
        const strings = PROPOSITIONS_STRINGS[lang];
        expect(strings).toBeDefined();
        expect(strings.lede.length).toBeGreaterThan(0);
        expect(strings.proposalsHeading.length).toBeGreaterThan(0);
        expect(strings.pipelineHeading.length).toBeGreaterThan(0);
        expect(strings.procedureHeading.length).toBeGreaterThan(0);
        expect(strings.analysisHeading.length).toBeGreaterThan(0);
        expect(strings.analysis.length).toBeGreaterThan(0);
        expect(strings.pipelineHealthLabel.length).toBeGreaterThan(0);
        expect(strings.throughputRateLabel.length).toBeGreaterThan(0);
      }
    });

    it('should have correct native language names', () => {
      expect(LANGUAGE_NAMES.en).toBe('English');
      expect(LANGUAGE_NAMES.de).toBe('Deutsch');
      expect(LANGUAGE_NAMES.fr).toBe('Français');
      expect(LANGUAGE_NAMES.ja).toBe('日本語');
      expect(LANGUAGE_NAMES.zh).toBe('中文');
    });
  });

  describe('getLocalizedString', () => {
    it('should return correct value for supported language', () => {
      expect(getLocalizedString(LANGUAGE_NAMES, 'de')).toBe('Deutsch');
    });

    it('should fall back to English for unsupported language', () => {
      expect(getLocalizedString(LANGUAGE_NAMES, 'zz')).toBe('English');
    });

    it('should work with function-valued maps', () => {
      const formatter = getLocalizedString(READ_TIME_LABELS, 'de');
      expect(formatter(3)).toBe('3 Min. Lesezeit');
    });
  });

  describe('isSupportedLanguage', () => {
    it('should return true for supported languages', () => {
      expect(isSupportedLanguage('en')).toBe(true);
      expect(isSupportedLanguage('de')).toBe(true);
      expect(isSupportedLanguage('ar')).toBe(true);
      expect(isSupportedLanguage('ja')).toBe(true);
    });

    it('should return false for unsupported languages', () => {
      expect(isSupportedLanguage('zz')).toBe(false);
      expect(isSupportedLanguage('el')).toBe(false);
      expect(isSupportedLanguage('')).toBe(false);
    });
  });

  describe('getTextDirection', () => {
    it('should return ltr for LTR languages', () => {
      const ltrLangs = ALL_LANGUAGES.filter(l => l !== 'ar' && l !== 'he');
      for (const lang of ltrLangs) {
        expect(getTextDirection(lang)).toBe('ltr');
      }
    });

    it('should return rtl for Arabic', () => {
      expect(getTextDirection('ar')).toBe('rtl');
    });

    it('should return rtl for Hebrew', () => {
      expect(getTextDirection('he')).toBe('rtl');
    });

    it('should return ltr for unknown languages', () => {
      expect(getTextDirection('zz')).toBe('ltr');
    });
  });

  describe('COMMITTEE_REPORTS_TITLES', () => {
    it('should have entries for all 14 supported languages', () => {
      expect(Object.keys(COMMITTEE_REPORTS_TITLES)).toHaveLength(14);
    });

    it('should generate non-empty title containing committee name for each language', () => {
      const committeeName = 'ENVI, ECON, AFET, LIBE, AGRI';
      for (const lang of ALL_LANGUAGES) {
        const generator = COMMITTEE_REPORTS_TITLES[lang];
        expect(generator).toBeDefined();
        const result = generator(committeeName);
        expect(result.title).toContain(committeeName);
        expect(typeof result.subtitle).toBe('string');
        expect(result.subtitle.length).toBeGreaterThan(0);
      }
    });
  });
});

describe('EDITORIAL_STRINGS', () => {
  it('should have entries for all 14 supported languages', () => {
    expect(Object.keys(EDITORIAL_STRINGS)).toHaveLength(14);
  });

  it('should contain all required editorial string fields for every language', () => {
    const requiredFields = ['whyThisMatters', 'keyTakeaway', 'parliamentaryContext', 'sourceAttribution', 'analysisNote'];
    for (const lang of ALL_LANGUAGES) {
      const strings = EDITORIAL_STRINGS[lang];
      expect(strings).toBeDefined();
      for (const field of requiredFields) {
        expect(strings[field]).toBeDefined();
        expect(typeof strings[field]).toBe('string');
        expect(strings[field].length).toBeGreaterThan(0);
      }
    }
  });

  it('should return English editorial strings via getLocalizedString fallback for unsupported language', () => {
    const strings = getLocalizedString(EDITORIAL_STRINGS, 'xx');
    expect(strings.whyThisMatters).toBe('Why This Matters');
    expect(strings.keyTakeaway).toBe('Key Finding');
    expect(strings.parliamentaryContext).toBe('Parliamentary Context');
    expect(strings.sourceAttribution).toBe('According to European Parliament data');
    expect(strings.analysisNote).toBe('Analysis Note');
  });

  it('should have non-empty whyThisMatters for all languages', () => {
    for (const lang of ALL_LANGUAGES) {
      const strings = getLocalizedString(EDITORIAL_STRINGS, lang);
      expect(strings.whyThisMatters.length).toBeGreaterThan(0);
    }
  });
});

describe('PROPOSITIONS_STRINGS whyThisMatters', () => {
  it('should have whyThisMatters field for all 14 languages', () => {
    for (const lang of ALL_LANGUAGES) {
      const strings = PROPOSITIONS_STRINGS[lang];
      expect(strings.whyThisMatters).toBeDefined();
      expect(typeof strings.whyThisMatters).toBe('string');
      expect(strings.whyThisMatters.length).toBeGreaterThan(0);
    }
  });
});

describe('Footer and header localization constants', () => {
  it('should have entries for all 14 languages in HEADER_SUBTITLE_LABELS', () => {
    for (const lang of ALL_LANGUAGES) {
      expect(HEADER_SUBTITLE_LABELS[lang]).toBeDefined();
      expect(typeof HEADER_SUBTITLE_LABELS[lang]).toBe('string');
      expect(HEADER_SUBTITLE_LABELS[lang].length).toBeGreaterThan(0);
    }
  });

  it('should have English value "European Parliament Intelligence" in HEADER_SUBTITLE_LABELS', () => {
    expect(HEADER_SUBTITLE_LABELS['en']).toBe('European Parliament Intelligence');
  });

  it('should have entries for all 14 languages in FOOTER_ABOUT_HEADING_LABELS', () => {
    for (const lang of ALL_LANGUAGES) {
      expect(FOOTER_ABOUT_HEADING_LABELS[lang]).toBeDefined();
      expect(typeof FOOTER_ABOUT_HEADING_LABELS[lang]).toBe('string');
      expect(FOOTER_ABOUT_HEADING_LABELS[lang].length).toBeGreaterThan(0);
    }
  });

  it('should have English value in FOOTER_ABOUT_HEADING_LABELS', () => {
    expect(FOOTER_ABOUT_HEADING_LABELS['en']).toBe('About EU Parliament Monitor');
  });

  it('should have entries for all 14 languages in FOOTER_ABOUT_TEXT_LABELS', () => {
    for (const lang of ALL_LANGUAGES) {
      expect(FOOTER_ABOUT_TEXT_LABELS[lang]).toBeDefined();
      expect(typeof FOOTER_ABOUT_TEXT_LABELS[lang]).toBe('string');
      expect(FOOTER_ABOUT_TEXT_LABELS[lang].length).toBeGreaterThan(0);
    }
  });

  it('should have entries for all 14 languages in FOOTER_QUICK_LINKS_LABELS', () => {
    for (const lang of ALL_LANGUAGES) {
      expect(FOOTER_QUICK_LINKS_LABELS[lang]).toBeDefined();
      expect(typeof FOOTER_QUICK_LINKS_LABELS[lang]).toBe('string');
      expect(FOOTER_QUICK_LINKS_LABELS[lang].length).toBeGreaterThan(0);
    }
  });

  it('should have English value "Quick Links" in FOOTER_QUICK_LINKS_LABELS', () => {
    expect(FOOTER_QUICK_LINKS_LABELS['en']).toBe('Quick Links');
  });

  it('should have entries for all 14 languages in FOOTER_BUILT_BY_LABELS', () => {
    for (const lang of ALL_LANGUAGES) {
      expect(FOOTER_BUILT_BY_LABELS[lang]).toBeDefined();
      expect(typeof FOOTER_BUILT_BY_LABELS[lang]).toBe('string');
      expect(FOOTER_BUILT_BY_LABELS[lang].length).toBeGreaterThan(0);
    }
  });

  it('should have English value "Built by Hack23 AB" in FOOTER_BUILT_BY_LABELS', () => {
    expect(FOOTER_BUILT_BY_LABELS['en']).toBe('Built by Hack23 AB');
  });

  it('should have entries for all 14 languages in FOOTER_LANGUAGES_LABELS', () => {
    for (const lang of ALL_LANGUAGES) {
      expect(FOOTER_LANGUAGES_LABELS[lang]).toBeDefined();
      expect(typeof FOOTER_LANGUAGES_LABELS[lang]).toBe('string');
      expect(FOOTER_LANGUAGES_LABELS[lang].length).toBeGreaterThan(0);
    }
  });

  it('should have English value "Languages" in FOOTER_LANGUAGES_LABELS', () => {
    expect(FOOTER_LANGUAGES_LABELS['en']).toBe('Languages');
  });

  it('should return fallback English value for unknown lang in HEADER_SUBTITLE_LABELS', () => {
    const value = getLocalizedString(HEADER_SUBTITLE_LABELS, 'xx');
    expect(value).toBe('European Parliament Intelligence');
  });
});

describe('MONTHLY_REVIEW_TITLES', () => {
  it('should have entries for all 14 languages', () => {
    expect(Object.keys(MONTHLY_REVIEW_TITLES)).toHaveLength(14);
  });

  it('should generate title and subtitle for each language', () => {
    for (const lang of ALL_LANGUAGES) {
      const generator = MONTHLY_REVIEW_TITLES[lang];
      expect(generator).toBeDefined();
      expect(typeof generator).toBe('function');
      const result = generator('March 2026');
      expect(result.title).toBeDefined();
      expect(result.title.length).toBeGreaterThan(0);
      expect(result.subtitle).toBeDefined();
      expect(result.subtitle.length).toBeGreaterThan(0);
    }
  });
});

describe('DEEP_ANALYSIS_STRINGS', () => {
  it('should have entries for all 14 languages', () => {
    expect(Object.keys(DEEP_ANALYSIS_STRINGS)).toHaveLength(14);
  });

  it('should have all required fields for each language', () => {
    const requiredFields = [
      'sectionHeading', 'whatHeading', 'whoHeading', 'whenHeading', 'whyHeading',
      'stakeholderHeading', 'winnerLabel', 'loserLabel', 'neutralLabel',
      'impactHeading', 'politicalLabel', 'economicLabel', 'socialLabel',
      'legalLabel', 'geopoliticalLabel', 'consequencesHeading', 'actionLabel',
      'consequenceLabel', 'severityColumnLabel', 'mistakesHeading',
      'alternativeLabel', 'outlookHeading', 'severityLow', 'severityMedium',
      'severityHigh', 'severityCritical', 'executiveSummaryHeading',
      'confidenceHigh', 'confidenceMedium', 'confidenceLow',
      'evidenceRefsHeading', 'counterArgumentsHeading',
      'conclusionLabel', 'premiseLabel', 'inferenceLabel',
      'reasoningChainsHeading', 'scenarioPlanningHeading',
      'bestCaseLabel', 'worstCaseLabel', 'mostLikelyLabel',
      'wildcardsLabel', 'probabilityLabel', 'triggersLabel',
      'impliedImpactsLabel', 'timelineLabel', 'analysisMethodologyHeading',
      'iterationCountLabel', 'evidenceStrengthLabel',
      'evidenceStrong', 'evidenceModerate', 'evidenceWeak',
      'iterationInitial', 'iterationStakeholderChallenge',
      'iterationEvidenceValidation', 'iterationSynthesis',
      'overallConfidenceLabel', 'perspectivesHeading', 'outcomeMatrixHeading',
      'confidenceLabel', 'politicalGroupsLabel', 'civilSocietyLabel',
      'industryLabel', 'nationalGovtsLabel', 'citizensLabel',
      'euInstitutionsLabel', 'positiveLabel', 'negativeLabel', 'mixedLabel',
    ];
    for (const lang of ALL_LANGUAGES) {
      const strings = DEEP_ANALYSIS_STRINGS[lang];
      expect(strings).toBeDefined();
      for (const field of requiredFields) {
        expect(strings[field]).toBeDefined();
        expect(typeof strings[field]).toBe('string');
        expect(strings[field].length).toBeGreaterThan(0);
      }
    }
  });

  it('should not have English fallbacks in non-EN enhanced analysis fields', () => {
    const enhancedFields = [
      'executiveSummaryHeading', 'confidenceHigh', 'confidenceMedium', 'confidenceLow',
      'evidenceRefsHeading', 'counterArgumentsHeading', 'conclusionLabel',
      'premiseLabel', 'inferenceLabel', 'reasoningChainsHeading',
      'scenarioPlanningHeading', 'bestCaseLabel', 'worstCaseLabel', 'mostLikelyLabel',
      'analysisMethodologyHeading', 'evidenceStrengthLabel',
      'evidenceStrong', 'evidenceModerate', 'evidenceWeak',
      'overallConfidenceLabel',
    ];
    const enStrings = DEEP_ANALYSIS_STRINGS['en'];
    for (const lang of ALL_LANGUAGES) {
      if (lang === 'en') continue;
      const strings = DEEP_ANALYSIS_STRINGS[lang];
      for (const field of enhancedFields) {
        expect(strings[field]).not.toBe(enStrings[field]);
      }
    }
  });
});

describe('MONTH_IN_REVIEW_STRINGS', () => {
  it('should have entries for all 14 languages', () => {
    expect(Object.keys(MONTH_IN_REVIEW_STRINGS)).toHaveLength(14);
  });

  it('should have all required section heading fields for each language', () => {
    const requiredFields = [
      'overview', 'keyVotes', 'legislativeProgress',
      'committeeHighlights', 'politicalDynamics', 'outlook',
    ];
    for (const lang of ALL_LANGUAGES) {
      const strings = MONTH_IN_REVIEW_STRINGS[lang];
      expect(strings).toBeDefined();
      for (const field of requiredFields) {
        expect(strings[field]).toBeDefined();
        expect(typeof strings[field]).toBe('string');
        expect(strings[field].length).toBeGreaterThan(0);
      }
    }
  });
});

describe('ANALYSIS_QUALITY_LABELS', () => {
  it('should have entries for all 14 languages', () => {
    expect(Object.keys(ANALYSIS_QUALITY_LABELS)).toHaveLength(14);
  });

  it('should have all required quality indicator fields for each language', () => {
    const requiredFields = [
      'dataCompleteness', 'sourceReliability', 'analyticalDepth',
      'timeliness', 'high', 'medium', 'low',
    ];
    for (const lang of ALL_LANGUAGES) {
      const strings = ANALYSIS_QUALITY_LABELS[lang];
      expect(strings).toBeDefined();
      for (const field of requiredFields) {
        expect(strings[field]).toBeDefined();
        expect(typeof strings[field]).toBe('string');
        expect(strings[field].length).toBeGreaterThan(0);
      }
    }
  });
});
