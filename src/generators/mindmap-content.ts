// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Generates a color-coded mindmap HTML section using pure CSS —
 * no JavaScript or third-party libraries required.
 *
 * The mindmap renders a central topic node surrounded by color-coded branch
 * nodes. Each branch can have child leaf items. The layout uses CSS Flexbox,
 * working at all viewport widths.
 *
 * Typical usage: inject into articles to visualise the relationship between
 * a focus topic and detected policy domains, parliamentary actors, data
 * sources, or legislative outcomes.
 *
 * @module generators/mindmap-content
 */

import { escapeHTML } from '../utils/file-utils.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Pre-defined semantic color roles for mindmap branches. */
export type MindmapBranchColor =
  | 'cyan'
  | 'magenta'
  | 'yellow'
  | 'green'
  | 'purple'
  | 'orange'
  | 'blue'
  | 'red';

/** A single branch of the mindmap, attached to the central node. */
export interface MindmapBranch {
  /** Branch label (rendered in the colored branch node). */
  readonly label: string;
  /** Semantic color for the branch node. */
  readonly color: MindmapBranchColor;
  /** Child leaf items displayed below the branch node. */
  readonly items?: readonly string[];
  /** Optional icon/emoji prefix for the branch label. */
  readonly icon?: string;
}

/** Full mindmap configuration. */
export interface MindmapConfig {
  /** Central topic text (the root of the mindmap). */
  readonly topic: string;
  /** Array of branches radiating from the central node. */
  readonly branches: readonly MindmapBranch[];
  /** Optional introductory paragraph rendered above the mindmap. */
  readonly summary?: string;
}

// ---------------------------------------------------------------------------
// Color palette (mapped to CSS custom properties on each branch element)
// ---------------------------------------------------------------------------

const BRANCH_PALETTE: Readonly<
  Record<MindmapBranchColor, { bg: string; border: string; text: string }>
> = {
  cyan: { bg: '#e3f2fd', border: '#1565c0', text: '#1565c0' },
  magenta: { bg: '#fce4ec', border: '#c62828', text: '#c62828' },
  yellow: { bg: '#fff8e1', border: '#f57f17', text: '#f57f17' },
  green: { bg: '#e8f5e9', border: '#2e7d32', text: '#2e7d32' },
  purple: { bg: '#f3e5f5', border: '#7b1fa2', text: '#7b1fa2' },
  orange: { bg: '#fff3e0', border: '#e65100', text: '#e65100' },
  blue: { bg: '#e8eaf6', border: '#283593', text: '#283593' },
  red: { bg: '#ffebee', border: '#b71c1c', text: '#b71c1c' },
};

// ---------------------------------------------------------------------------
// Section heading labels (14 languages)
// ---------------------------------------------------------------------------

const MINDMAP_HEADINGS: Readonly<Record<string, string>> = {
  en: 'Policy Mindmap',
  sv: 'Policykarta',
  da: 'Politikkort',
  no: 'Politikkart',
  fi: 'Politiikkakartta',
  de: 'Politikkarte',
  fr: 'Carte conceptuelle',
  es: 'Mapa conceptual',
  nl: 'Beleidskaart',
  ar: 'خريطة السياسات',
  he: 'מפת מדיניות',
  ja: '政策マインドマップ',
  ko: '정책 마인드맵',
  zh: '政策思维导图',
};

// ---------------------------------------------------------------------------
// Rendering helpers
// ---------------------------------------------------------------------------

function renderBranch(branch: MindmapBranch): string {
  const palette = BRANCH_PALETTE[branch.color] ?? BRANCH_PALETTE.cyan;
  const iconPrefix = branch.icon ? `${branch.icon} ` : '';
  const labelHtml = `${escapeHTML(iconPrefix)}${escapeHTML(branch.label)}`;

  const leafItems =
    branch.items && branch.items.length > 0
      ? `\n      <ul class="mindmap-leaf-list" role="list">\n${branch.items
          .map((item) => `        <li>${escapeHTML(item)}</li>`)
          .join('\n')}\n      </ul>`
      : '';

  return `    <div class="mindmap-branch" role="listitem"
      style="--branch-bg:${palette.bg};--branch-border:${palette.border};--branch-text:${palette.text}">
      <div class="mindmap-branch-label">${labelHtml}</div>${leafItems}
    </div>`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a color-coded mindmap section as an HTML string.
 *
 * Returns an empty string when `config` is null/undefined or has no branches,
 * following the same convention as `buildSwotSection` and
 * `buildDashboardSection`.
 *
 * @param config - Mindmap data (topic, branches, optional summary).
 * @param lang - BCP 47 language code for the section heading.
 * @param heading - Optional heading override.
 * @returns HTML string for the mindmap section, or empty string.
 */
export function buildMindmapSection(
  config: MindmapConfig | null | undefined,
  lang: string = 'en',
  heading?: string,
): string {
  if (!config || !config.branches || config.branches.length === 0) {
    return '';
  }

  const titleText: string =
    heading?.trim() || MINDMAP_HEADINGS[lang] || 'Policy Mindmap';
  const summaryBlock = config.summary?.trim()
    ? `  <p class="mindmap-summary">${escapeHTML(config.summary.trim())}</p>\n`
    : '';

  const branchItems = config.branches.map((b) => renderBranch(b)).join('\n');

  return `<section class="mindmap-section" role="region" aria-label="${escapeHTML(titleText)}">
  <h2>${escapeHTML(titleText)}</h2>
${summaryBlock}  <div class="mindmap-container" data-branch-count="${config.branches.length}">
    <div class="mindmap-center" role="heading" aria-level="3">${escapeHTML(config.topic)}</div>
    <div class="mindmap-branches" role="list">
${branchItems}
    </div>
  </div>
</section>`;
}
