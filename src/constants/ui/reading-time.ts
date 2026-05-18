// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/UI/ReadingTime
 * @description Per-language read-time pluralization formatters (consumed by article generators).
 */

import type { LanguageMap } from '../../types/index.js';
export const READ_TIME_LABELS: LanguageMap<(time: number) => string> = {
  en: (time: number) => `${time} min read`,
  sv: (time: number) => `${time} min läsning`,
  da: (time: number) => `${time} min læsetid`,
  no: (time: number) => `${time} min lesetid`,
  fi: (time: number) => `${time} min lukuaika`,
  de: (time: number) => `${time} Min. Lesezeit`,
  fr: (time: number) => `${time} min de lecture`,
  es: (time: number) => `${time} min de lectura`,
  nl: (time: number) => `${time} min leestijd`,
  ar: (time: number) => `${time} دقائق قراءة`,
  he: (time: number) => `${time} דקות קריאה`,
  ja: (time: number) => `${time}分で読了`,
  ko: (time: number) => `${time}분 읽기`,
  zh: (time: number) => `${time}分钟阅读`,
};

/** Back to news link labels per language */
