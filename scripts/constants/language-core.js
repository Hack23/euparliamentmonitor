// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/** All supported language codes */
export const ALL_LANGUAGES = [
    'en',
    'sv',
    'da',
    'no',
    'fi',
    'de',
    'fr',
    'es',
    'nl',
    'ar',
    'he',
    'ja',
    'ko',
    'zh',
];
/** Language presets for quick selection */
export const LANGUAGE_PRESETS = {
    all: ALL_LANGUAGES,
    'eu-core': ['en', 'de', 'fr', 'es', 'nl'],
    nordic: ['en', 'sv', 'da', 'no', 'fi'],
};
/** Language flags for display */
export const LANGUAGE_FLAGS = {
    en: '🇬🇧',
    sv: '🇸🇪',
    da: '🇩🇰',
    no: '🇳🇴',
    fi: '🇫🇮',
    de: '🇩🇪',
    fr: '🇫🇷',
    es: '🇪🇸',
    nl: '🇳🇱',
    ar: '🇸🇦',
    he: '🇮🇱',
    ja: '🇯🇵',
    ko: '🇰🇷',
    zh: '🇨🇳',
};
/** Native language names */
export const LANGUAGE_NAMES = {
    en: 'English',
    sv: 'Svenska',
    da: 'Dansk',
    no: 'Norsk',
    fi: 'Suomi',
    de: 'Deutsch',
    fr: 'Français',
    es: 'Español',
    nl: 'Nederlands',
    ar: 'العربية',
    he: 'עברית',
    ja: '日本語',
    ko: '한국어',
    zh: '中文',
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
    // eslint-disable-next-line security/detect-object-injection -- key validated via Object.hasOwn
    return Object.hasOwn(map, code) ? (map[code] ?? map.en) : map.en;
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
//# sourceMappingURL=language-core.js.map