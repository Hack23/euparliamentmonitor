// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/Articles/DeepAnalysis
 * @description Deep-analysis strings assembled from all 14 per-language modules.
 */

import type { LanguageMap, DeepAnalysisStrings } from '../../../types/index.js';
import { DEEP_ANALYSIS_STRINGS_EN } from './en.js';
import { DEEP_ANALYSIS_STRINGS_SV } from './sv.js';
import { DEEP_ANALYSIS_STRINGS_DA } from './da.js';
import { DEEP_ANALYSIS_STRINGS_NO } from './no.js';
import { DEEP_ANALYSIS_STRINGS_FI } from './fi.js';
import { DEEP_ANALYSIS_STRINGS_DE } from './de.js';
import { DEEP_ANALYSIS_STRINGS_FR } from './fr.js';
import { DEEP_ANALYSIS_STRINGS_ES } from './es.js';
import { DEEP_ANALYSIS_STRINGS_NL } from './nl.js';
import { DEEP_ANALYSIS_STRINGS_AR } from './ar.js';
import { DEEP_ANALYSIS_STRINGS_HE } from './he.js';
import { DEEP_ANALYSIS_STRINGS_JA } from './ja.js';
import { DEEP_ANALYSIS_STRINGS_KO } from './ko.js';
import { DEEP_ANALYSIS_STRINGS_ZH } from './zh.js';

export const DEEP_ANALYSIS_STRINGS: LanguageMap<DeepAnalysisStrings> = {
  en: DEEP_ANALYSIS_STRINGS_EN,
  sv: DEEP_ANALYSIS_STRINGS_SV,
  da: DEEP_ANALYSIS_STRINGS_DA,
  no: DEEP_ANALYSIS_STRINGS_NO,
  fi: DEEP_ANALYSIS_STRINGS_FI,
  de: DEEP_ANALYSIS_STRINGS_DE,
  fr: DEEP_ANALYSIS_STRINGS_FR,
  es: DEEP_ANALYSIS_STRINGS_ES,
  nl: DEEP_ANALYSIS_STRINGS_NL,
  ar: DEEP_ANALYSIS_STRINGS_AR,
  he: DEEP_ANALYSIS_STRINGS_HE,
  ja: DEEP_ANALYSIS_STRINGS_JA,
  ko: DEEP_ANALYSIS_STRINGS_KO,
  zh: DEEP_ANALYSIS_STRINGS_ZH,
};
