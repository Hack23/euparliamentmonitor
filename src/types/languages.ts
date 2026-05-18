// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/Languages
 * @description Language codes and language-keyed map types used across all
 * bounded contexts (article generation, localization, translation pipeline).
 */

/** Supported language codes */
export type LanguageCode =
  | 'en'
  | 'sv'
  | 'da'
  | 'no'
  | 'fi'
  | 'de'
  | 'fr'
  | 'es'
  | 'nl'
  | 'ar'
  | 'he'
  | 'ja'
  | 'ko'
  | 'zh';

/** RTL language codes */
export type RTLLanguageCode = 'ar' | 'he';

/** All possible language codes (including RTL) */
export type AnyLanguageCode = LanguageCode;

/** Language preset names */
export type LanguagePreset = 'all' | 'eu-core' | 'nordic';

/** Map from language code to translated string */
export type LanguageMap<T = string> = Record<LanguageCode, T>;
