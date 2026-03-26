// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * Generates a Sankey (flow) chart as inline SVG — no JavaScript or
 * third-party libraries required.
 *
 * A Sankey diagram visualises quantities flowing from source nodes to target
 * nodes. Node heights and flow-path widths are proportional to the values,
 * making it easy to see dominant flows at a glance.
 *
 * Typical usage in articles:
 * - Parliamentary flow: political group → document type → legislative outcome
 * - Policy flow: policy domain → committee → outcome (adopted/rejected/pending)
 * - Budget flow: programme area → committee → spending category
 *
 * @module generators/sankey-content
 */
import { escapeHTML } from '../utils/file-utils.js';
// ---------------------------------------------------------------------------
// Color palette
// ---------------------------------------------------------------------------
const NODE_COLORS = {
  cyan: { fill: '#e3f2fd', stroke: '#1565c0', text: '#1565c0' },
  magenta: { fill: '#fce4ec', stroke: '#c62828', text: '#c62828' },
  yellow: { fill: '#fff8e1', stroke: '#f57f17', text: '#f57f17' },
  green: { fill: '#e8f5e9', stroke: '#2e7d32', text: '#2e7d32' },
  purple: { fill: '#f3e5f5', stroke: '#7b1fa2', text: '#7b1fa2' },
  orange: { fill: '#fff3e0', stroke: '#e65100', text: '#e65100' },
  blue: { fill: '#e8eaf6', stroke: '#283593', text: '#283593' },
  red: { fill: '#ffebee', stroke: '#b71c1c', text: '#b71c1c' },
};
// ---------------------------------------------------------------------------
// Section heading labels (14 languages)
// ---------------------------------------------------------------------------
const SANKEY_HEADINGS = {
  en: 'Policy Flow',
  sv: 'Politikflöde',
  da: 'Politikflow',
  no: 'Politikkflyt',
  fi: 'Politiikkavirta',
  de: 'Politikfluss',
  fr: 'Flux législatif',
  es: 'Flujo legislativo',
  nl: 'Beleidsflow',
  ar: 'تدفق السياسات',
  he: 'זרימת מדיניות',
  ja: '政策フロー',
  ko: '정책 흐름',
  zh: '政策流向图',
};
// ---------------------------------------------------------------------------
// SVG layout engine
// ---------------------------------------------------------------------------
const SVG_WIDTH = 600;
const NODE_WIDTH = 22;
const NODE_GAP = 14;
const COL_LEFT = 20;
const COL_RIGHT = SVG_WIDTH - NODE_WIDTH - 20;
/**
 * Build a cubic bezier SVG path between two columns.
 *
 * @param x1 - Start x coordinate.
 * @param y1 - Start y coordinate.
 * @param x2 - End x coordinate.
 * @param y2 - End y coordinate.
 * @param h - Height of the flow path.
 * @returns SVG path data string.
 */
function buildBezierPath(x1, y1, x2, y2, h) {
  const mx = (x1 + x2) / 2;
  return [
    `M${x1},${y1}`,
    `C${mx},${y1} ${mx},${y2} ${x2},${y2}`,
    `L${x2},${y2 + h}`,
    `C${mx},${y2 + h} ${mx},${y1 + h} ${x1},${y1 + h}`,
    'Z',
  ].join(' ');
}
/**
 * Compute SVG element strings for the Sankey diagram.
 *
 * @param nodes - Array of Sankey nodes.
 * @param flows - Array of directed flows between nodes.
 * @param svgHeight - Height of the SVG canvas in pixels.
 * @returns Array of SVG element strings.
 */
function layoutSankey(nodes, flows, svgHeight) {
  const sourceIds = new Set(flows.map((f) => f.source));
  const targetIds = new Set(flows.map((f) => f.target));
  const valuePer = {};
  for (const f of flows) {
    valuePer[f.source] = (valuePer[f.source] ?? 0) + f.value;
    valuePer[f.target] = (valuePer[f.target] ?? 0) + f.value;
  }
  const totalValue = Object.values(valuePer).reduce((a, b) => a + b, 0) || 1;
  const usableHeight = svgHeight - 40;
  const scaleFactor = usableHeight / (totalValue / 2 + (nodes.length - 1) * NODE_GAP);
  const leftNodes = nodes.filter((n) => sourceIds.has(n.id) || !targetIds.has(n.id));
  const rightNodes = nodes.filter((n) => targetIds.has(n.id) && !sourceIds.has(n.id));
  function placeNodes(nds) {
    const result = [];
    let yOffset = 20;
    for (const n of nds) {
      const total = valuePer[n.id] ?? 0;
      const height = Math.max(18, Math.round(total * scaleFactor));
      result.push({
        id: n.id,
        label: n.label,
        color: n.color,
        totalValue: total,
        y: yOffset,
        height,
        srcOffset: 0,
        tgtOffset: 0,
      });
      yOffset += height + NODE_GAP;
    }
    return result;
  }
  const leftLayout = placeNodes(leftNodes);
  const rightLayout = placeNodes(rightNodes);
  const allLayout = [...leftLayout, ...rightLayout];
  const layoutMap = new Map(allLayout.map((n) => [n.id, n]));
  const svgElements = [];
  for (const ln of allLayout) {
    const palette = NODE_COLORS[ln.color] ?? NODE_COLORS.cyan;
    const isLeft = leftLayout.some((l) => l.id === ln.id);
    const xPos = isLeft ? COL_LEFT : COL_RIGHT;
    const labelX = isLeft ? xPos + NODE_WIDTH + 6 : xPos - 6;
    const textAnchor = isLeft ? 'start' : 'end';
    svgElements.push(
      `<rect x="${xPos}" y="${ln.y}" width="${NODE_WIDTH}" height="${ln.height}" fill="${palette.fill}" stroke="${palette.stroke}" stroke-width="2" rx="3"/>`,
      `<text x="${labelX}" y="${ln.y + ln.height / 2}" text-anchor="${textAnchor}" dominant-baseline="middle" font-size="11" fill="${palette.text}" font-family="sans-serif">${escapeHTML(ln.label)}</text>`
    );
  }
  for (const flow of flows) {
    const srcNode = layoutMap.get(flow.source);
    const tgtNode = layoutMap.get(flow.target);
    if (!srcNode || !tgtNode) continue;
    const srcPalette = NODE_COLORS[srcNode.color] ?? NODE_COLORS.cyan;
    const tgtVal = valuePer[tgtNode.id] ?? 1;
    const scaledH = Math.max(
      4,
      Math.round(
        ((flow.value / Math.max(tgtVal, valuePer[srcNode.id] ?? 1)) *
          (srcNode.height + tgtNode.height)) /
          2
      )
    );
    const srcIsLeft = leftLayout.some((l) => l.id === srcNode.id);
    const x1 = srcIsLeft ? COL_LEFT + NODE_WIDTH : COL_RIGHT;
    const x2 = COL_RIGHT;
    const y1 = srcNode.y + srcNode.srcOffset;
    const y2 = tgtNode.y + tgtNode.tgtOffset;
    srcNode.srcOffset += scaledH + 2;
    tgtNode.tgtOffset += scaledH + 2;
    const pathD = buildBezierPath(x1, y1, x2, y2, scaledH);
    svgElements.push(
      `<path d="${pathD}" fill="${srcPalette.stroke}33" stroke="${srcPalette.stroke}" stroke-width="0.5" opacity="0.7"/>`
    );
    if (flow.label) {
      const midX = SVG_WIDTH / 2;
      const midY = (y1 + y2) / 2 + scaledH / 2;
      svgElements.push(
        `<text x="${midX}" y="${midY}" text-anchor="middle" dominant-baseline="middle" font-size="9" fill="#495057" font-family="sans-serif">${escapeHTML(flow.label)}</text>`
      );
    }
  }
  return svgElements;
}
// ---------------------------------------------------------------------------
// Accessible table fallback
// ---------------------------------------------------------------------------
function renderFallbackTable(nodes, flows) {
  const rows = flows
    .map((f) => {
      const srcNode = nodes.find((n) => n.id === f.source);
      const tgtNode = nodes.find((n) => n.id === f.target);
      return `      <tr>
        <td>${escapeHTML(srcNode?.label ?? f.source)}</td>
        <td>${escapeHTML(tgtNode?.label ?? f.target)}</td>
        <td>${f.value}</td>
        ${f.label ? `<td>${escapeHTML(f.label)}</td>` : '<td></td>'}
      </tr>`;
    })
    .join('\n');
  return `<noscript>
  <table class="sankey-fallback-table" aria-label="Sankey data">
    <caption>Flow data</caption>
    <thead><tr><th>Source</th><th>Target</th><th>Value</th><th>Note</th></tr></thead>
    <tbody>
${rows}
    </tbody>
  </table>
  </noscript>`;
}
// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
/**
 * Generate a Sankey flow chart section as an HTML string with inline SVG.
 *
 * Returns an empty string when `config` is null/undefined or has no flows,
 * following the same convention as `buildSwotSection` and
 * `buildDashboardSection`.
 *
 * @param config - Sankey data (nodes, flows, optional summary).
 * @param lang - BCP 47 language code for the section heading.
 * @param heading - Optional heading override.
 * @returns HTML string for the sankey section, or empty string.
 */
export function buildSankeySection(config, lang = 'en', heading) {
  if (!config || !config.flows || config.flows.length === 0) {
    return '';
  }
  const svgHeight = 340;
  const titleText = heading?.trim() || SANKEY_HEADINGS[lang] || 'Policy Flow';
  const summaryBlock = config.summary?.trim()
    ? `  <p class="sankey-summary">${escapeHTML(config.summary.trim())}</p>\n`
    : '';
  const svgElements = layoutSankey(config.nodes, config.flows, svgHeight);
  const svgContent = svgElements.join('\n    ');
  const fallbackTable = renderFallbackTable(config.nodes, config.flows);
  return `<section class="sankey-section" role="region" aria-label="${escapeHTML(titleText)}">
  <h2>${escapeHTML(titleText)}</h2>
${summaryBlock}  <div class="sankey-chart-wrapper">
    <svg viewBox="0 0 ${SVG_WIDTH} ${svgHeight}" xmlns="http://www.w3.org/2000/svg"
         role="img" aria-label="${escapeHTML(titleText)}"
         style="width:100%;height:auto;max-width:${SVG_WIDTH}px;display:block;">
      <title>${escapeHTML(titleText)}</title>
      <rect width="${SVG_WIDTH}" height="${svgHeight}" fill="var(--surface, #f8f9fa)" rx="8"/>
    ${svgContent}
    </svg>
  </div>
  ${fallbackTable}
</section>`;
}
//# sourceMappingURL=sankey-content.js.map
