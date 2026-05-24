// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module FixMermaidDiagrams
 * @description
 * Idempotent auto-fixer for the mechanical mermaid failure modes
 * surfaced by `validate-mermaid-diagrams.js`. Only edits blocks that
 * currently fail to parse — passing blocks are left untouched. Every
 * candidate fix is re-parsed against the real mermaid v11 parser before
 * it is committed; if it does not validate, the original body is kept
 * and the block is reported as `stillBroken`.
 *
 * Fix recipes (each scoped to the detected diagram type):
 *
 *  - quadrantChart        → apply `sanitizeMermaidQuadrantChart`
 *                           (auto-quotes labels with colons / special
 *                           chars); clamp `[x.0, y.0]` coordinates to
 *                           `[0, 1]` integer or `0.99` decimal (the v11
 *                           parser rejects values >= 1.0 written in
 *                           decimal form).
 *  - xyChart-beta         → rename keyword to `xychart-beta` (lower-case)
 *  - xychart-beta         → quote `title …` lines containing special chars;
 *                           quote each element of `x-axis [...]`; strip
 *                           leading non-numeric label tokens from
 *                           `line [Series, v1, v2, …]` and
 *                           `bar [Series, v1, v2, …]` arrays.
 *  - bar                  → rename to `xychart-beta`; convert simple
 *                           `"Label": N` rows to a single shared
 *                           `x-axis [...]` + `bar [...]`, and convert
 *                           `"Label": [v1, v2, …]` array-format rows
 *                           into per-row `bar [v1, v2, …]` lines.
 *  - radar                → rename to `radar-beta`; convert multi-word
 *                           `axis A, B, C, …` to quoted-ID form
 *                           `axis a1["A"], a2["B"], …`; convert each
 *                           `"Label" : v1, v2, …` row to
 *                           `curve cN["Label"]{v1, v2, …}`.
 *  - timeline             → replace `—`/`–` em/en-dashes with `-` in
 *                           `title …` lines; strip parens AND colons
 *                           from `section …` lines (the parser uses `:`
 *                           as the event separator).
 *  - sankey-beta          → convert both verbose forms
 *                           (`A [n] TO B [m]` and `A -> B : N`) to CSV
 *                           (`A,B,N`).
 *  - graph / flowchart    → replace `<--` with `-->`; rewrite inner `"`
 *                           inside `["…"]` labels to `&quot;` (handles
 *                           RTL labels with embedded English quotes);
 *                           wrap node labels in `["…"]` brackets that
 *                           contain `{`, `}`, `(`, `)`, `:`, or `;` in
 *                           double quotes (Mermaid rejects those tokens
 *                           when the label is unquoted).
 *
 * Run with `--write` to persist; default is dry-run.
 *
 *   node scripts/fix-mermaid-diagrams.js                # dry-run, default roots
 *   node scripts/fix-mermaid-diagrams.js analysis foo   # custom roots
 *   node scripts/fix-mermaid-diagrams.js --write        # persist changes
 *   node scripts/fix-mermaid-diagrams.js --quiet        # only summary
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import {
  extractMermaidBlocks,
  detectDiagramType,
  validateBlock,
} from './validate-mermaid-diagrams.js';
import { sanitizeMermaidQuadrantChart } from './aggregator/markdown-renderer.js';

const FENCE_OPEN = /^(\s*)(`{3,}|~{3,})\s*mermaid\s*$/i;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Locate the first content line (skipping `%%` comments and `%%{ … }%%`
 * init directives) and return its `{ index, indent }`. The returned
 * index is into the `lines` array; `null` if no content line exists.
 *
 * @param {string[]} lines
 * @returns {{ index: number, indent: string } | null}
 */
function firstContentLine(lines) {
  let inInit = false;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i] ?? '';
    const trimmed = raw.trim();
    if (trimmed === '') continue;
    if (inInit) {
      if (trimmed.endsWith('}}%%')) inInit = false;
      continue;
    }
    if (trimmed.startsWith('%%{')) {
      if (!trimmed.endsWith('}}%%')) inInit = true;
      continue;
    }
    if (trimmed.startsWith('%%')) continue;
    const indent = raw.slice(0, raw.length - raw.trimStart().length);
    return { index: i, indent };
  }
  return null;
}

/**
 * Split a comma-separated argument list while honouring double-quoted
 * strings. Used to safely re-quote `x-axis [a, b, c]` and to split
 * `"Label" : [v1, v2, v3]` array contents.
 *
 * @param {string} inner Contents of `[ … ]` (without the brackets)
 * @returns {string[]}
 */
function splitArrayItems(inner) {
  const out = [];
  let buf = '';
  let inQuote = false;
  for (const ch of inner) {
    if (ch === '"') { inQuote = !inQuote; buf += ch; continue; }
    if (ch === ',' && !inQuote) { out.push(buf.trim()); buf = ''; continue; }
    buf += ch;
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

// ---------------------------------------------------------------------------
// Per-diagram-type fixers
// ---------------------------------------------------------------------------

/**
 * Clamp `[x, y]` coordinates inside quadrantChart point rows: the v11
 * parser rejects decimal values `>= 1.0` (`1.0`, `1.00`, `2.0`, …).
 * Integer `1` is fine, so we rewrite each such token to either `1`
 * (when value === 1) or `0.99` (when value > 1). Applied as a
 * line-by-line transform on `"Label": [x, y]` rows only.
 *
 * @param {string} body
 * @returns {string}
 */
function clampQuadrantCoords(body) {
  return body.split('\n').map((line) => {
    const m = line.match(/^(\s*)(.*?)(:\s*)\[\s*([^\]]+)\s*\]\s*$/);
    if (!m) return line;
    const parts = m[4].split(',').map((s) => s.trim());
    if (parts.length !== 2) return line;
    const fixed = parts.map((v) => {
      const n = Number.parseFloat(v);
      if (!Number.isFinite(n)) return v;
      // Integer 0 or 1 is accepted by the v11 lexer; otherwise normalise.
      if (/^-?\d+$/.test(v) && (n === 0 || n === 1)) return v;
      // Out-of-range value — divide by 100 when on a 0-100 scale, else clamp.
      let scaled = n;
      if (Math.abs(n) > 1) scaled = n / 100;
      if (scaled >= 1) scaled = 0.99;
      if (scaled < 0) scaled = 0;
      // Keep 2 decimals; mermaid accepts arbitrary precision.
      return scaled.toFixed(2).replace(/\.?0+$/, '') || '0';
    });
    return `${m[1]}${m[2]}${m[3]}[${fixed.join(', ')}]`;
  }).join('\n');
}

/**
 * Escape literal `"` characters that appear *inside* an already-quoted
 * label on a `"Label": [x, y]` row. The v11 lexer treats every `"` as a
 * string boundary, so e.g. `"תעריפי ארה"ב"` (a Hebrew label that contains
 * a literal quote) is parsed as `"תעריפי ארה"` + lex error on `ב"`.
 * We rewrite each row so that any `"` between the opening `"` and the
 * closing `":` becomes `&quot;`.
 *
 * @param {string} body
 * @returns {string}
 */
function escapeQuadrantInnerQuotes(body) {
  return body.split('\n').map((line) => {
    // Match a row that looks like `[indent]"<label-with-quotes>":[ws][x,y]`
    // where the label spans up to the LAST `":` on the line.
    const m = line.match(/^(\s*)"(.+)"\s*:\s*(\[[^\]]+\])\s*$/);
    if (!m) return line;
    const inner = m[2];
    if (!inner.includes('"')) return line;
    return `${m[1]}"${inner.replace(/"/g, '&quot;')}": ${m[3]}`;
  }).join('\n');
}

/**
 * Apply the existing render-time sanitiser to the source so the fix is
 * persisted on disk (not just at render time), then clamp `1.0`+
 * coordinates that crash the v11 lexer.
 *
 * @param {string} body
 * @returns {string}
 */
function fixQuadrantChart(body) {
  return clampQuadrantCoords(escapeQuadrantInnerQuotes(sanitizeMermaidQuadrantChart(body)));
}

/**
 * Rename the `xyChart-beta` keyword (mixed case) to the canonical
 * lower-case `xychart-beta`.
 *
 * @param {string} body
 * @returns {string}
 */
function fixXyChartBetaCase(body) {
  const lines = body.split('\n');
  const first = firstContentLine(lines);
  if (!first) return body;
  lines[first.index] = lines[first.index].replace(/\bxyChart-beta\b/, 'xychart-beta');
  return lines.join('\n');
}

/**
 * Quote `title …` lines that contain characters Mermaid's xychart-beta
 * lexer rejects when unquoted (parens, colons, commas, hyphens followed
 * by digits, square brackets, ampersands). Quote each unquoted element
 * of `x-axis [...]` arrays. Strip a leading non-numeric label token
 * from `line [Series, v1, v2, …]` and `bar [Series, v1, v2, …]` so the
 * array only contains numeric data values.
 *
 * @param {string} body
 * @returns {string}
 */
function fixXychartBeta(body) {
  const lines = body.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // title  →  title "…"
    const t = line.match(/^(\s*)title\s+(.+?)\s*$/);
    if (t) {
      const text = t[2];
      if (!text.startsWith('"')) {
        lines[i] = `${t[1]}title "${text.replace(/"/g, '\\"')}"`;
      }
      continue;
    }

    // x-axis [a, b, c]  →  x-axis ["a", "b", "c"]  (when items unquoted)
    const x = line.match(/^(\s*)x-axis\s*\[\s*(.+?)\s*\]\s*$/);
    if (x) {
      const items = splitArrayItems(x[2]);
      const allQuoted = items.length > 0 && items.every((it) => /^".*"$/.test(it));
      if (!allQuoted) {
        const requoted = items.map((it) => {
          if (/^".*"$/.test(it)) return it;
          return `"${it.replace(/"/g, '\\"')}"`;
        }).join(', ');
        lines[i] = `${x[1]}x-axis [${requoted}]`;
      }
      continue;
    }

    // line / bar arrays:  line [Series, v1, v2, …]  →  line [v1, v2, …]
    // If the first item is not a number, strip it (the parser rejects
    // string labels inside the data array).
    const series = line.match(/^(\s*)(line|bar)\s*\[\s*(.+?)\s*\]\s*$/);
    if (series) {
      const items = splitArrayItems(series[3]);
      if (items.length > 0 && !/^-?\d+(?:\.\d+)?$/.test(items[0])) {
        const stripped = items.slice(1);
        if (stripped.length > 0 && stripped.every((it) => /^-?\d+(?:\.\d+)?$/.test(it))) {
          lines[i] = `${series[1]}${series[2]} [${stripped.join(', ')}]`;
        }
      }
      continue;
    }

    // line / bar with leading label:  bar "Series": [v1, v2, …]  →  bar [v1, v2, …]
    const labeled = line.match(/^(\s*)(line|bar)\s+"[^"]*"\s*:\s*\[\s*(.+?)\s*\]\s*$/);
    if (labeled) {
      const items = splitArrayItems(labeled[3])
        .filter((s) => /^-?\d+(?:\.\d+)?$/.test(s));
      if (items.length > 0) {
        lines[i] = `${labeled[1]}${labeled[2]} [${items.join(', ')}]`;
      }
      continue;
    }

    // scatter [...] is not supported by xychart-beta. Drop the line.
    // It's been seen in articles as a forecast helper but the parser
    // rejects it outright.
    if (/^\s*scatter\s*\[/.test(line)) {
      lines[i] = `${line.match(/^(\s*)/)[1]}%% removed unsupported scatter series`;
      continue;
    }
  }
  return lines.join('\n');
}

/**
 * Convert a `bar` diagram (not a valid Mermaid type) into an
 * `xychart-beta`. Handles three shapes:
 *
 *   1. Already xychart-shaped (`x-axis [...]` + `bar [...]` present) —
 *      just rename the opening keyword and run `fixXychartBeta`.
 *   2. Simple `"Label": value` rows — rebuild as
 *      `x-axis ["Label", …]` + `y-axis 0 --> max` + `bar [val, …]`.
 *   3. Array rows (`"Label": [v1, v2, …]`) with an existing
 *      `x-axis [...]` — convert each row to a `bar [v1, v2, …]` line
 *      and add an inferred `y-axis 0 --> max` if missing.
 *
 * @param {string} body
 * @returns {string}
 */
function fixBarDiagram(body) {
  const lines = body.split('\n');
  const first = firstContentLine(lines);
  if (!first) return body;
  lines[first.index] = lines[first.index].replace(/\bbar\b/, 'xychart-beta');

  const hasXAxis = lines.some((l) => /^\s*x-axis\s*\[/.test(l));
  const hasBarArray = lines.some((l) => /^\s*bar\s*\[/.test(l));
  const hasYAxis = lines.some((l) => /^\s*y-axis\s+/.test(l));

  if (hasXAxis && hasBarArray) {
    return fixXychartBeta(lines.join('\n'));
  }

  const indent = first.indent;

  // Shape 3 — `"Label": [v,v,v]` array rows with existing x-axis.
  if (hasXAxis) {
    const out = [];
    const allValues = [];
    let yInserted = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const arr = line.match(/^(\s*)"([^"]+)"\s*:\s*\[\s*(.+?)\s*\]\s*$/);
      if (arr) {
        const items = splitArrayItems(arr[3])
          .filter((s) => /^-?\d+(?:\.\d+)?$/.test(s));
        if (items.length > 0) {
          allValues.push(...items.map(Number));
          if (!hasYAxis && !yInserted) {
            const max = Math.max(...allValues);
            const ceil = Math.max(1, Math.ceil(max * 1.05));
            out.push(`${indent}y-axis "Value" 0 --> ${ceil}`);
            yInserted = true;
          }
          out.push(`${arr[1]}bar [${items.join(', ')}]`);
          continue;
        }
      }
      out.push(line);
    }
    // If we deferred y-axis but never inserted (no rows matched), emit now.
    return fixXychartBeta(out.join('\n'));
  }

  // Shape 2 — `"Label": N` scalar rows — rebuild from scratch.
  const labels = [];
  const values = [];
  let titleLine = null;
  const preserved = [];
  for (let i = 0; i < lines.length; i++) {
    if (i === first.index) { preserved.push(lines[i]); continue; }
    const line = lines[i];
    const t = line.match(/^(\s*)title\s+(.+?)\s*$/);
    if (t) { titleLine = `${indent}title "${t[2].replace(/^"|"$/g, '').replace(/"/g, '\\"')}"`; continue; }
    // Quoted form: `"Label": N`
    const row = line.match(/^\s*"([^"]+)"\s*:\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (row) { labels.push(row[1]); values.push(row[2]); continue; }
    // Unquoted form: `LABEL: N` (e.g. `ECON: 5`, `MFF-2027: 3.5`)
    const bare = line.match(/^\s*([A-Za-z][\w .&/+-]*?)\s*:\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (bare) { labels.push(bare[1].trim()); values.push(bare[2]); continue; }
    if (line.trim() === '' || line.trim().startsWith('%%')) preserved.push(line);
  }
  if (labels.length === 0) return lines.join('\n');
  const max = Math.max(...values.map(Number));
  const ceil = Math.max(1, Math.ceil(max * 1.05));
  const out = [...preserved];
  if (titleLine) out.push(titleLine);
  out.push(`${indent}x-axis [${labels.map((l) => `"${l.replace(/"/g, '\\"')}"`).join(', ')}]`);
  out.push(`${indent}y-axis "Value" 0 --> ${ceil}`);
  out.push(`${indent}bar [${values.join(', ')}]`);
  return out.join('\n');
}

/**
 * Convert a legacy `radar` diagram into the parser-supported
 * `radar-beta` syntax. Handles:
 *
 *   1. Rename the opening keyword `radar` → `radar-beta`.
 *   2. Convert multi-word `axis A, B, C, D` lines to quoted-ID form
 *      `axis a1["A"], a2["B"], a3["C"], a4["D"]` (single-word axes
 *      are left unchanged).
 *   3. Convert each `"Label" : v1, v2, …` row to
 *      `curve cN["Label"]{v1, v2, …}`.
 *
 * @param {string} body
 * @returns {string}
 */
function fixRadar(body) {
  const rawLines = body.split('\n');
  const first = firstContentLine(rawLines);
  if (!first) return body;

  // Preserve leading init / comment / empty lines verbatim.
  const preserved = rawLines.slice(0, first.index);
  const indent = first.indent;
  const bodyLines = rawLines.slice(first.index + 1);

  // Collect title, axis labels, curves. Tolerant of every legacy form
  // observed in the corpus (see `fix-mermaid-diagrams.js` doc-comments
  // and `test/unit/fix-mermaid-diagrams.test.js` for the catalogue).
  let title = null;
  const axisLabels = []; // ordered, deduplicated
  const curves = []; // { label, values: number[] }
  const seenAxis = new Set();
  const addAxis = (label) => {
    const clean = String(label).trim().replace(/^"|"$/g, '').trim();
    if (!clean) return;
    if (seenAxis.has(clean)) return;
    seenAxis.add(clean);
    axisLabels.push(clean);
  };

  for (const line of bodyLines) {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('%%')) continue;
    // Stripped of the keyword-only `dataset` / `series` markers.
    if (/^(dataset|series)\s*$/i.test(trimmed)) continue;

    // title
    const t = trimmed.match(/^title\s+(.+)$/i);
    if (t) { title = t[1].replace(/^"|"$/g, ''); continue; }

    // axis A, B, C  OR  axis a1["A"], a2["B"], …
    const axisLine = trimmed.match(/^axis\s+(.+)$/i);
    if (axisLine) {
      const inner = axisLine[1];
      // If items are already in `aN["Label"]` form just extract the labels.
      const idForm = [...inner.matchAll(/[A-Za-z_]\w*\["([^"]+)"\]/g)].map((m) => m[1]);
      if (idForm.length > 0) idForm.forEach(addAxis);
      else splitArrayItems(inner).forEach((it) => addAxis(it));
      continue;
    }

    // x-axis ["a", "b", …]  OR  x-axis a, b, c   (legacy form)
    const xAxisArr = trimmed.match(/^x-axis\s*\[\s*(.+?)\s*\]\s*$/i);
    if (xAxisArr) { splitArrayItems(xAxisArr[1]).forEach(addAxis); continue; }
    const xAxisBare = trimmed.match(/^x-axis\s+(.+)$/i);
    if (xAxisBare) {
      const tokens = xAxisBare[1].split(/\s*,\s*/).filter(Boolean);
      tokens.forEach(addAxis);
      continue;
    }
    // y-axis is meaningless on a radar — drop silently.
    if (/^y-axis\b/i.test(trimmed)) continue;
    // `max N` — re-emit verbatim later via passthrough? radar-beta supports
    // it but it has no semantic equivalent in many of these blocks; skip.
    if (/^max\s+/i.test(trimmed)) continue;

    // ID ["Label"] : v1, v2, …    or    ID [Label] : v1, v2, …
    const idBracketRow = trimmed.match(/^([A-Za-z_]\w*)\s*\[\s*"?([^"\]]+?)"?\s*\]\s*:\s*(.+)$/);
    if (idBracketRow) {
      const label = idBracketRow[2].trim();
      const nums = idBracketRow[3].split(/[,\s]+/).filter(Boolean)
        .filter((s) => /^-?\d+(?:\.\d+)?$/.test(s)).map(Number);
      if (nums.length > 0) { curves.push({ label, values: nums }); continue; }
    }

    // "Label" [v1, v2, …]   (brackets used in place of `:`/`{…}`)
    const labelArr = trimmed.match(/^"([^"]+)"\s*\[\s*(.+?)\s*\]\s*$/);
    if (labelArr) {
      const nums = splitArrayItems(labelArr[2])
        .filter((s) => /^-?\d+(?:\.\d+)?$/.test(s)).map(Number);
      if (nums.length > 0) { curves.push({ label: labelArr[1], values: nums }); continue; }
    }

    // "Label" : v1, v2, …   OR   "Label": [v1, v2, …]
    const labelColon = trimmed.match(/^"([^"]+)"\s*:\s*\[?\s*(.+?)\s*\]?\s*$/);
    if (labelColon) {
      const nums = labelColon[2].split(/[,\s]+/).filter(Boolean)
        .filter((s) => /^-?\d+(?:\.\d+)?$/.test(s)).map(Number);
      if (nums.length > 0) { curves.push({ label: labelColon[1], values: nums }); continue; }
    }

    // ID [v1, v2, …]   (lowercase identifier + values bracketed — Pass-1/Pass-2)
    const idArr = trimmed.match(/^([A-Za-z_][\w -]*?)\s*\[\s*(.+?)\s*\]\s*$/);
    if (idArr && !/^x-axis|y-axis|axis$/i.test(idArr[1])) {
      const nums = splitArrayItems(idArr[2])
        .filter((s) => /^-?\d+(?:\.\d+)?$/.test(s)).map(Number);
      if (nums.length > 0) { curves.push({ label: idArr[1].trim(), values: nums }); continue; }
    }

    // Unquoted `Label: value` — single-value per row OR axis-with-score.
    // Used in form 3 (`Political: 4`) and pseudo-bar radars.
    const bareColon = trimmed.match(/^([^:[\]{}"]+?)\s*:\s*\[?\s*(.+?)\s*\]?\s*$/);
    if (bareColon) {
      const nums = bareColon[2].split(/[,\s]+/).filter(Boolean)
        .filter((s) => /^-?\d+(?:\.\d+)?$/.test(s)).map(Number);
      if (nums.length > 0) { curves.push({ label: bareColon[1].trim(), values: nums }); continue; }
    }

    // Plain numeric-only line — pairs with previous bare label line
    // (form: `Strengths\n72\nWeaknesses\n58\n…`). Append onto the most
    // recent zero-value curve if any; otherwise drop.
    if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
      if (curves.length > 0 && curves[curves.length - 1].values.length === 0) {
        curves[curves.length - 1].values.push(Number(trimmed));
      }
      continue;
    }

    // Bare bracketed values on their own line. Two sub-shapes:
    //   form 5 — `series` block where each row spans 2 lines:
    //            `"Label"\n  [v1, v2, …]`. Latch onto the most recent
    //            placeholder curve.
    //   form 6 — bare-label-only axes followed by a single combined
    //            value vector matching the placeholder count. Collapse
    //            all placeholders into a single curve with these values.
    const bareValuesArr = trimmed.match(/^\[\s*(.+?)\s*\]\s*$/);
    if (bareValuesArr) {
      const nums = splitArrayItems(bareValuesArr[1])
        .filter((s) => /^-?\d+(?:\.\d+)?$/.test(s)).map(Number);
      if (nums.length > 0) {
        const placeholderCurves = curves.filter((c) => c.values.length === 0);
        if (placeholderCurves.length === nums.length && placeholderCurves.length >= 2
            && placeholderCurves.length === curves.length) {
          // Form 6 collapse — keep the axes (already addAxis'd), replace
          // every placeholder curve with one combined curve.
          const label = title || 'Score';
          curves.length = 0;
          curves.push({ label, values: nums });
        } else if (curves.length > 0 && curves[curves.length - 1].values.length === 0) {
          curves[curves.length - 1].values = nums;
        } else {
          curves.push({ label: `Curve ${curves.length + 1}`, values: nums });
        }
        continue;
      }
    }

    // Plain unquoted label line — could be an axis label declaration
    // (forms 5, 6 — `Political\nEconomic\n…`) OR a curve label awaiting
    // a numeric value on the next line (interleaved bar-radar form).
    // We greedily classify as axis when the line is short and alpha;
    // and add a zero-value placeholder curve so a subsequent numeric line
    // can latch onto it.
    if (/^[A-Za-zÀ-ÿ][\w\s&/().+-]*$/.test(trimmed) && trimmed.length <= 80) {
      addAxis(trimmed);
      curves.push({ label: trimmed, values: [] });
      continue;
    }
  }

  // Synthesise axis labels from curve labels if none were declared. This
  // is form 3 (`"Axis": single_value`) and form 6 (label-only).
  if (axisLabels.length === 0 && curves.length > 0) {
    // If every curve has exactly one value, treat curve labels as axis
    // names and collapse all single-value curves into one combined curve.
    const allSingle = curves.length >= 2 && curves.every((c) => c.values.length === 1);
    if (allSingle) {
      curves.forEach((c) => addAxis(c.label));
      const merged = { label: title || 'Score', values: curves.map((c) => c.values[0]) };
      curves.length = 0;
      curves.push(merged);
    } else {
      // Take the longest curve and seed axis labels A1…AN.
      const maxLen = curves.reduce((m, c) => Math.max(m, c.values.length), 0);
      for (let i = 1; i <= maxLen; i++) addAxis(`A${i}`);
    }
  }

  // Drop placeholder zero-value curves that never received a value.
  const realCurves = curves.filter((c) => c.values.length > 0);
  if (realCurves.length === 0) return body; // give up — original will surface upstream

  // Pad/truncate each curve to match axis count when known.
  if (axisLabels.length > 0) {
    for (const c of realCurves) {
      if (c.values.length < axisLabels.length) {
        while (c.values.length < axisLabels.length) c.values.push(0);
      } else if (c.values.length > axisLabels.length) {
        c.values.length = axisLabels.length;
      }
    }
  }

  // Emit canonical radar-beta.
  const out = [...preserved, `${indent}radar-beta`];
  if (title) out.push(`${indent}    title ${title}`);
  if (axisLabels.length > 0) {
    const axisExpr = axisLabels
      .map((l, i) => `a${i + 1}["${String(l).replace(/"/g, '\\"')}"]`)
      .join(', ');
    out.push(`${indent}    axis ${axisExpr}`);
  }
  realCurves.forEach((c, i) => {
    out.push(`${indent}    curve c${i + 1}["${String(c.label).replace(/"/g, '\\"')}"]{${c.values.join(', ')}}`);
  });
  return out.join('\n');
}

/**
 * Timeline fixer:
 *   - Replace em-dash `—` / en-dash `–` with ASCII `-` inside `title`
 *     lines (the lexer accepts these in event text but not in titles).
 *   - Strip parens AND colons from `section …` lines — the timeline
 *     parser uses `:` as the event separator, so a colon in the section
 *     name makes it greedily consume the next event row.
 *
 * @param {string} body
 * @returns {string}
 */
function fixTimeline(body) {
  return body.split('\n').map((line) => {
    const titleM = line.match(/^(\s*title\s+)(.+?)\s*$/);
    if (titleM) {
      const cleaned = titleM[2].replace(/[—–]/g, '-');
      return `${titleM[1]}${cleaned}`;
    }
    const sec = line.match(/^(\s*section\s+)(.+?)\s*$/);
    if (sec) {
      const stripped = sec[2]
        .replace(/[()]/g, ' ')
        .replace(/:/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
      return `${sec[1]}${stripped}`;
    }
    // Event row: `<period> : <event>` — strip parens AND any colon
    // inside parens from the period (the parser uses `:` as event
    // separator, so a colon inside `(00:00 UTC)` makes the period text
    // greedy and breaks the row). Continuation rows (whitespace + `:`)
    // are left untouched.
    const evt = line.match(/^(\s*)([^:\n]+?)\s*:\s*(.*?)\s*$/);
    if (evt && evt[2].trim() !== '' && /[()]/.test(evt[2])) {
      const period = evt[2]
        .replace(/\([^)]*\)/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
      return `${evt[1]}${period} : ${evt[3]}`;
    }
    return line;
  }).join('\n');
}

/**
 * Convert both verbose sankey forms to CSV:
 *
 *   `A [n1] TO B [n2]`  →  `A,B,n2`
 *   `A -> B : N`        →  `A,B,N`
 *
 * Both arrow and TO conversions strip surrounding whitespace and
 * preserve only the numeric weight at the right-hand side.
 *
 * @param {string} body
 * @returns {string}
 */
function fixSankey(body) {
  return body.split('\n').map((line) => {
    const to = line.match(/^\s*([^,[\]]+?)\s*\[\s*-?\d+(?:\.\d+)?\s*\]\s+TO\s+([^,[\]]+?)\s*\[\s*(-?\d+(?:\.\d+)?)\s*\]\s*$/);
    if (to) return `${to[1].trim()},${to[2].trim()},${to[3]}`;
    const arrow = line.match(/^\s*([^,:\s][^,:]*?)\s*->\s*([^,:\s][^,:]*?)\s*:\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (arrow) return `${arrow[1].trim()},${arrow[2].trim()},${arrow[3]}`;
    return line;
  }).join('\n');
}

const FLOWCHART_SPECIAL_CHARS = /[{}():;,]/;

/**
 * Wrap unquoted `WORD[…]` node labels in double quotes when the inner
 * text contains characters that break the Mermaid flowchart lexer
 * (`{`, `}`, `(`, `)`, `:`, `;`, `,`). Quoting is the documented escape
 * hatch. Edge labels (`|…|` between arrows) are NOT touched.
 *
 * @param {string} line
 * @returns {string}
 */
function quoteSpecialLabels(line) {
  // Match `WORD[…]` where the inner text is not already a quoted string.
  // Lazy match so we don't span the whole line on labels that hold `]`.
  return line.replace(/(\b[A-Za-z_][\w-]*)\[([^\[\]\n]+?)\]/g, (whole, id, inner) => {
    const text = inner.trim();
    // Already quoted — leave alone.
    if (/^".*"$/.test(text)) return whole;
    // Inner is a sub-shape introducer (e.g. `Start([Text])` — we'll
    // match that pattern recursively on the inner). Skip when it looks
    // like another shape: leading `(`, `/`, `\`, `[`.
    if (/^[([/\\]/.test(text)) return whole;
    if (!FLOWCHART_SPECIAL_CHARS.test(text)) return whole;
    return `${id}["${text.replace(/"/g, '&quot;')}"]`;
  });
}

/**
 * Apply graph/flowchart fixes:
 *
 *   - Replace `<--` edges with `-->` (Mermaid has no reverse-only edge).
 *   - Rewrite inner literal `"` inside `["…"]` labels with `&quot;`
 *     (uses a lazy non-`"]` regex so embedded RTL/English-quote
 *     content matches in full).
 *   - Wrap unquoted `WORD[…]` labels containing `{}():;,` in `"…"`.
 *
 * @param {string} body
 * @returns {string}
 */
function fixGraphFlowchart(body) {
  // First pass: discover unquoted multi-word `subgraph` declarations and
  // build a name→id map. Replace declarations AND any later references.
  const rawLines = body.split('\n');
  const subgraphRenames = new Map(); // originalName → id
  let renameCounter = 0;
  for (const line of rawLines) {
    const m = line.match(/^\s*subgraph\s+(.+?)\s*$/);
    if (!m) continue;
    const rest = m[1];
    // Already in a valid form: `subgraph id ["Label"]`, `subgraph id[Label]`,
    // `subgraph "Label"`, or single-word id `subgraph SG1`.
    if (/^[A-Za-z_]\w*\s*\[/.test(rest)) continue; // id[...]
    if (/^"/.test(rest)) continue; // quoted label
    if (/^[A-Za-z_]\w*\s*$/.test(rest)) continue; // single word id
    // Multi-word unquoted — rename.
    const original = rest.replace(/^"|"$/g, '').trim();
    if (subgraphRenames.has(original)) continue;
    renameCounter++;
    subgraphRenames.set(original, `sg_${renameCounter}`);
  }

  return rawLines.map((line) => {
    let out = line;
    // Unicode arrow `→` between two identifiers is a common typo for `-->`.
    out = out.replace(/(\s)→(\s)/g, '$1-->$2');
    out = out.replace(/(\s)<--(\s)/g, '$1-->$2');

    // Rewrite multi-word subgraph declarations.
    const sg = out.match(/^(\s*)subgraph\s+(.+?)\s*$/);
    if (sg && !/^[A-Za-z_]\w*\s*(?:\[|$)/.test(sg[2]) && !/^"/.test(sg[2])) {
      const original = sg[2].replace(/^"|"$/g, '').trim();
      const id = subgraphRenames.get(original);
      if (id) {
        out = `${sg[1]}subgraph ${id} ["${original.replace(/"/g, '&quot;')}"]`;
        return out;
      }
    }

    // Rewrite bare references to renamed subgraphs in edges. Match the
    // original name surrounded by edge syntax or whitespace boundaries.
    for (const [original, id] of subgraphRenames) {
      // Edge LHS: `<original> -->` or `<original> ---`
      const escOrig = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      out = out.replace(new RegExp(`(^|\\s)${escOrig}(\\s*(?:--|==|\\.\\.))`, 'g'),
        (_, pre, post) => `${pre}${id}${post}`);
      // Edge RHS: `--> <original>` or `--- <original>` at end-of-line
      out = out.replace(new RegExp(`((?:--|==|\\.\\.)\\s*(?:>\\s*)?)${escOrig}(\\s|$)`, 'g'),
        (_, pre, post) => `${pre}${id}${post}`);
    }

    // Escape inner double quotes in [" … "] labels.
    out = out.replace(/\["((?:(?!"\])[\s\S])*?)"\]/g, (_, inner) => {
      if (!inner.includes('"')) return `["${inner}"]`;
      return `["${inner.replace(/"/g, '&quot;')}"]`;
    });

    // Unquoted `[Foo | Bar | Baz]` labels — the pipe character is a
    // shape modifier and must be inside quotes. Detect bracket content
    // with any of `|`, `&`, `,`, `(`, `:` and quote it.
    out = out.replace(/\[([^"\[\]]*[|&,():][^"\[\]]*)\]/g, (whole, inner) => {
      // Skip if this is actually a shape modifier like `[(`, `[/`, `[\`.
      if (/^[(/\\>]/.test(inner)) return whole;
      const clean = inner.trim();
      return `["${clean.replace(/"/g, '&quot;')}"]`;
    });

    out = quoteSpecialLabels(out);
    return out;
  }).join('\n');
}

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------

const FIXERS = {
  quadrantChart: fixQuadrantChart,
  'xyChart-beta': fixXyChartBetaCase,
  'xychart-beta': fixXychartBeta,
  bar: fixBarDiagram,
  radar: fixRadar,
  timeline: fixTimeline,
  'sankey-beta': fixSankey,
  graph: fixGraphFlowchart,
  flowchart: fixGraphFlowchart,
};

/**
 * Apply the type-appropriate fixer to a single block body. Returns the
 * candidate fixed body — caller is responsible for re-validating to
 * confirm the fix actually works.
 *
 * @param {string} body
 * @returns {string}
 */
export function fixBlock(body) {
  const type = detectDiagramType(body);
  const f = FIXERS[type];
  if (!f) return body;
  try {
    return f(body);
  } catch {
    return body;
  }
}

/**
 * Rebuild a markdown document by replacing every failed mermaid block
 * with its fixer-produced version (only when the fixer's output
 * actually parses cleanly).
 *
 * @param {string} text Original markdown
 * @param {import('mermaid').default} mermaid Pre-loaded parser instance
 * @returns {Promise<{
 *   text: string,
 *   fixed: number,
 *   skipped: number,
 *   stillBroken: Array<{ startLine: number, diagramType: string, error: string }>
 * }>}
 */
export async function fixDocument(text, mermaid) {
  const blocks = extractMermaidBlocks(text);
  const lines = text.split('\n');
  let fixed = 0;
  let skipped = 0;
  const stillBroken = [];

  const sorted = [...blocks].sort((a, b) => b.startLine - a.startLine);
  for (const block of sorted) {
    const before = await validateBlock(block.body, mermaid);
    if (before.ok) continue;

    const candidate = fixBlock(block.body);
    if (candidate === block.body) {
      skipped++;
      stillBroken.push({ startLine: block.startLine, diagramType: before.diagramType, error: before.error });
      continue;
    }
    const after = await validateBlock(candidate, mermaid);
    if (!after.ok) {
      skipped++;
      stillBroken.push({ startLine: block.startLine, diagramType: after.diagramType, error: after.error });
      continue;
    }
    const fenceLineIdx = block.startLine - 1;
    const fence = (lines[fenceLineIdx] ?? '').match(FENCE_OPEN);
    if (!fence) { skipped++; continue; }
    const char = fence[2][0];
    const minLen = fence[2].length;
    const closeRe = new RegExp(`^\\s*${char === '`' ? '`' : '~'}{${minLen},}\\s*$`);
    let end = fenceLineIdx + 1;
    while (end < lines.length && !closeRe.test(lines[end] ?? '')) end++;
    const bodyLineCount = end - (fenceLineIdx + 1);
    lines.splice(fenceLineIdx + 1, bodyLineCount, ...candidate.split('\n'));
    fixed++;
  }
  return { text: lines.join('\n'), fixed, skipped, stillBroken };
}

/**
 * @internal CLI entry-point — runs the fixer across the given roots
 * (or `analysis/` by default) and prints a per-file summary.
 *
 * @returns {Promise<void>}
 */
/* istanbul ignore next */
async function mainCli() {
  const args = process.argv.slice(2);
  const write = args.includes('--write');
  const quiet = args.includes('--quiet');
  const roots = args.filter((a) => !a.startsWith('--'));

  const { Window } = await import('happy-dom');
  const win = new Window();
  if (typeof globalThis.window === 'undefined') globalThis.window = win;
  if (typeof globalThis.document === 'undefined') globalThis.document = win.document;
  if (typeof globalThis.DOMParser === 'undefined') globalThis.DOMParser = win.DOMParser;
  if (typeof globalThis.XMLSerializer === 'undefined') globalThis.XMLSerializer = win.XMLSerializer;
  if (typeof globalThis.HTMLElement === 'undefined') globalThis.HTMLElement = win.HTMLElement;
  if (typeof globalThis.SVGElement === 'undefined') globalThis.SVGElement = win.SVGElement;
  const mermaid = (await import('mermaid')).default;
  mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', suppressErrorRendering: true });

  async function walk(dir, out) {
    let entries;
    try { entries = await fs.readdir(dir, { withFileTypes: true }); }
    catch (e) { if (e.code === 'ENOENT') return out; throw e; }
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
        await walk(p, out);
      } else if (e.isFile() && p.endsWith('.md')) out.push(p);
    }
    return out;
  }

  const files = [];
  for (const r of roots.length ? roots : ['analysis']) await walk(r, files);
  let totalFixed = 0;
  let totalStillBroken = 0;
  let filesChanged = 0;
  for (const file of files) {
    const text = await fs.readFile(file, 'utf8');
    if (!text.includes('```mermaid') && !text.includes('~~~mermaid')) continue;
    const result = await fixDocument(text, mermaid);
    if (result.fixed > 0) {
      filesChanged++;
      totalFixed += result.fixed;
      if (write) await fs.writeFile(file, result.text, 'utf8');
      if (!quiet) {
        process.stdout.write(`${write ? 'fixed' : 'would fix'} ${result.fixed} block(s) in ${path.relative(process.cwd(), file)}\n`);
      }
    }
    totalStillBroken += result.stillBroken.length;
  }
  process.stdout.write(`\nSummary: ${write ? 'fixed' : 'would fix'} ${totalFixed} block(s) across ${filesChanged} file(s); ${totalStillBroken} block(s) still broken after auto-fix.\n`);
}

const isMain = (() => {
  try { return import.meta.url === `file://${process.argv[1]}` || import.meta.url === fileURLToPath(process.argv[1]); }
  catch { return false; }
})();
if (isMain) {
  mainCli().catch((e) => { console.error(e); process.exit(2); });
}
