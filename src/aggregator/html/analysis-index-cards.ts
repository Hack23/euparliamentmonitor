// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Html/AnalysisIndexCards
 * @description Upgrade the Markdown-rendered Analysis Index table into
 * a `pi-card-grid` of localised cards — one per included artifact. Each
 * card shows the artifact's curated title and description, the section
 * badge of the H2 it contributed to, and a "View artifact" CTA pointing
 * at the GitHub blob URL.
 */

import { escapeHTML } from '../../utils/file-utils.js';
import type { LanguageCode } from '../../types/index.js';
import { MANIFEST_SECTION_ID } from '../artifact-order.js';
import { getArtifactInfo } from '../../generators/political-intelligence-descriptions.js';
import { getStemIcon } from './tradecraft-cards.js';
import { getLocalizedTocTitle } from './toc.js';

/**
 * Localised "View artifact" CTA used on every Analysis Index card.
 * Tells the reader the link opens a specific committed artifact from
 * this article's analysis run on GitHub, providing audit context that
 * the older generic "View on GitHub" CTA lacked.
 *
 * @param lang - Target language code
 * @returns Localised CTA text
 */
function getViewArtifactLabel(lang: LanguageCode): string {
  const labels: Partial<Record<LanguageCode, string>> = {
    en: 'View artifact',
    sv: 'Visa artefakt',
    da: 'Se artefakt',
    no: 'Se artefakt',
    fi: 'Näytä artefakti',
    de: 'Artefakt ansehen',
    fr: 'Voir l’artefact',
    es: 'Ver artefacto',
    nl: 'Artefact bekijken',
    ar: 'عرض القطعة',
    he: 'הצג פריט',
    ja: 'アーティファクトを表示',
    ko: '아티팩트 보기',
    zh: '查看构件',
  };
  return labels[lang] ?? labels.en ?? 'View artifact';
}

/**
 * Replace the Analysis Index `<table>` with a `pi-card-grid` of cards,
 * one per included artifact. Each card renders the artifact's curated
 * localised title + description, the section it contributed to, the
 * run-relative path as inline `<code>`, and a "View on GitHub" CTA.
 *
 * Strategy: parse the rendered table's `<tbody>` rows (each row carries
 * `[sectionId, <a href="…">stem</a>, runRelPath]`) and re-render the
 * region between the table's opening wrapper and `</table>` as a card
 * grid. The wrapping `<div class="table-scroll">` is dropped because
 * the card grid handles its own responsive layout via flex/grid.
 *
 * @param bodyHtml - Article body HTML
 * @param lang - Target language code
 * @returns Body HTML with the Analysis Index upgraded to a card grid
 */
export function enhanceAnalysisIndexCards(bodyHtml: string, lang: LanguageCode): string {
  const anchorIdx = bodyHtml.indexOf(`id="${MANIFEST_SECTION_ID}"`);
  if (anchorIdx === -1) return bodyHtml;
  const tableIdx = bodyHtml.indexOf('<table>', anchorIdx);
  if (tableIdx === -1) return bodyHtml;
  const tableEnd = bodyHtml.indexOf('</table>', tableIdx);
  if (tableEnd === -1) return bodyHtml;
  const tableHtml = bodyHtml.slice(tableIdx, tableEnd + '</table>'.length);
  const rows = parseAnalysisIndexRows(tableHtml);
  if (rows.length === 0) return bodyHtml;
  const cards = rows.map((row) => renderAnalysisIndexCard(row, lang)).join('\n');
  const wrapperOpen = bodyHtml.lastIndexOf('<div class="table-scroll"', tableIdx);
  const replaceFrom = wrapperOpen !== -1 && wrapperOpen > anchorIdx ? wrapperOpen : tableIdx;
  let replaceTo = tableEnd + '</table>'.length;
  if (wrapperOpen !== -1 && wrapperOpen > anchorIdx) {
    const wrapperClose = bodyHtml.indexOf('</div>', tableEnd);
    if (wrapperClose !== -1) replaceTo = wrapperClose + '</div>'.length;
  }
  const replacement = `<ul class="pi-card-grid analysis-index-grid">\n${cards}\n        </ul>`;
  return bodyHtml.slice(0, replaceFrom) + replacement + bodyHtml.slice(replaceTo);
}

/** One parsed row from the rendered Analysis Index table. */
interface AnalysisIndexRow {
  /** Section id the artifact contributed to (e.g. `section-risk`) */
  readonly sectionId: string;
  /** Display title from the table cell (anchor text) */
  readonly anchorText: string;
  /** Absolute GitHub URL the anchor points at */
  readonly href: string;
  /** Run-relative path embedded in the third column */
  readonly runRelPath: string;
}

/**
 * Parse the `<tbody>` rows of the rendered Analysis Index table. Each
 * row has the shape `<tr><td>section-id</td><td><a href="…">stem</a>
 * </td><td><code>relPath</code></td></tr>`.
 *
 * @param tableHtml - Slice of HTML from `<table>` to `</table>`
 * @returns Parsed rows (skipping malformed ones)
 */
function parseAnalysisIndexRows(tableHtml: string): AnalysisIndexRow[] {
  const out: AnalysisIndexRow[] = [];
  let cursor = 0;
  while (cursor < tableHtml.length) {
    const trIdx = tableHtml.indexOf('<tr>', cursor);
    if (trIdx === -1) break;
    const trEnd = tableHtml.indexOf('</tr>', trIdx);
    if (trEnd === -1) break;
    const row = tableHtml.slice(trIdx, trEnd);
    cursor = trEnd + '</tr>'.length;
    if (row.indexOf('<td>') === -1) continue;
    const cells = parseRowCells(row);
    if (cells.length < 3) continue;
    const anchorMatch = parseAnchor(cells[1] ?? '');
    if (!anchorMatch) continue;
    const runRelPath = stripCodeWrapper(cells[2] ?? '');
    out.push({
      sectionId: (cells[0] ?? '').trim(),
      anchorText: anchorMatch.text,
      href: anchorMatch.href,
      runRelPath,
    });
  }
  return out;
}

/**
 * Extract the `<td>…</td>` cell contents from a single `<tr>…</tr>`
 * fragment. Uses `indexOf` to avoid backtracking.
 *
 * @param row - HTML for one row (no `</tr>` terminator required)
 * @returns Array of inner-HTML strings, one per `<td>`
 */
function parseRowCells(row: string): string[] {
  const cells: string[] = [];
  let cursor = 0;
  while (cursor < row.length) {
    const tdIdx = row.indexOf('<td>', cursor);
    if (tdIdx === -1) break;
    const tdEnd = row.indexOf('</td>', tdIdx);
    if (tdEnd === -1) break;
    cells.push(row.slice(tdIdx + '<td>'.length, tdEnd));
    cursor = tdEnd + '</td>'.length;
  }
  return cells;
}

/**
 * Parse a single `<a href="…">text</a>` token out of a cell. Returns
 * `null` when the cell does not contain an anchor (e.g. a plain string).
 *
 * @param cell - Inner-HTML of the `<td>` cell
 * @returns Parsed anchor or `null`
 */
function parseAnchor(cell: string): { href: string; text: string } | null {
  const aIdx = cell.indexOf('<a ');
  if (aIdx === -1) return null;
  const hrefIdx = cell.indexOf('href="', aIdx);
  if (hrefIdx === -1) return null;
  const urlStart = hrefIdx + 'href="'.length;
  const urlEnd = cell.indexOf('"', urlStart);
  if (urlEnd === -1) return null;
  const closeOpenTag = cell.indexOf('>', urlEnd);
  if (closeOpenTag === -1) return null;
  const closeIdx = cell.indexOf('</a>', closeOpenTag);
  if (closeIdx === -1) return null;
  return {
    href: cell.slice(urlStart, urlEnd),
    text: cell.slice(closeOpenTag + 1, closeIdx),
  };
}

/**
 * Strip the `<code>…</code>` wrapper added by the Markdown renderer
 * around the run-relative path cell.
 *
 * @param cell - Cell inner-HTML (possibly `<code>foo.md</code>`)
 * @returns Plain text without code formatting
 */
function stripCodeWrapper(cell: string): string {
  const start = cell.indexOf('<code>');
  if (start === -1) return cell.trim();
  const end = cell.indexOf('</code>', start);
  if (end === -1) return cell.trim();
  return cell.slice(start + '<code>'.length, end).trim();
}

/**
 * Render one Analysis Index card. Reuses the `pi-card` class hooks so
 * the card-grid sits naturally next to the methodology / template
 * cards in the same article.
 *
 * @param row - Parsed Analysis Index row
 * @param lang - Target language code
 * @returns HTML fragment for one `<li class="pi-card">…</li>`
 */
function renderAnalysisIndexCard(row: AnalysisIndexRow, lang: LanguageCode): string {
  const info = getArtifactInfo(row.runRelPath, lang);
  const stem = row.runRelPath.split('/').pop()?.replace(/\.md$/i, '') ?? row.runRelPath;
  const icon = getStemIcon(stem);
  const sectionLabel = getLocalizedTocTitle(row.sectionId, row.sectionId, lang);
  return [
    `          <li class="pi-card">`,
    `            <a class="pi-card__link" href="${escapeHTML(row.href)}" rel="noopener external" target="_blank">`,
    `              <span class="pi-card__icon" aria-hidden="true">${icon}</span>`,
    `              <span class="pi-card__body">`,
    `                <span class="pi-card__title">${escapeHTML(info.title)}</span>`,
    `                <span class="pi-card__desc">${escapeHTML(info.description)}</span>`,
    `                <span class="pi-card__meta"><span class="pi-card__section-badge">${escapeHTML(sectionLabel)}</span></span>`,
    `                <span class="pi-card__cta">${escapeHTML(getViewArtifactLabel(lang))} <span aria-hidden="true">↗</span></span>`,
    `              </span>`,
    `            </a>`,
    `          </li>`,
  ].join('\n');
}
