// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * Generates color-coded mindmap HTML sections using pure CSS —
 * no JavaScript or third-party libraries required.
 *
 * Two rendering modes are provided:
 * 1. **Standard mindmap** (`buildMindmapSection`) — a flat central topic with
 *    colored branch nodes and optional leaf items. Suitable for simple
 *    topic-branch visualisations.
 * 2. **Intelligence mindmap** (`buildIntelligenceMindmapSection`) — a
 *    multi-layer policy domain intelligence map with actor-network nodes,
 *    influence-weighted nodes (via CSS `--node-influence` custom property),
 *    policy connection indicators, and stakeholder perspective overlays using
 *    `<details>/<summary>` elements (CSS-only toggle, no JavaScript).
 *
 * Both renderers produce WCAG 2.1 AA compliant HTML with appropriate ARIA
 * roles, labels, and heading levels.
 *
 * @module Generators/MindmapContent
 */
import { escapeHTML } from '../utils/file-utils.js';
// ---------------------------------------------------------------------------
// Color palette (mapped to CSS custom properties on each branch element)
// ---------------------------------------------------------------------------
const BRANCH_PALETTE = {
    cyan: { bg: '#e3f2fd', border: '#1565c0', text: '#1565c0' },
    magenta: { bg: '#fce4ec', border: '#c62828', text: '#c62828' },
    yellow: { bg: '#fff8e1', border: '#f57f17', text: '#f57f17' },
    green: { bg: '#e8f5e9', border: '#2e7d32', text: '#2e7d32' },
    purple: { bg: '#f3e5f5', border: '#7b1fa2', text: '#7b1fa2' },
    orange: { bg: '#fff3e0', border: '#e65100', text: '#e65100' },
    blue: { bg: '#e8eaf6', border: '#283593', text: '#283593' },
    red: { bg: '#ffebee', border: '#b71c1c', text: '#b71c1c' },
};
/** Color mapping for intelligence mindmap node categories. */
const CATEGORY_PALETTE = {
    policy_domain: { bg: '#e3f2fd', border: '#1565c0', text: '#1565c0' },
    sub_topic: { bg: '#f3e5f5', border: '#7b1fa2', text: '#7b1fa2' },
    actor: { bg: '#e8f5e9', border: '#2e7d32', text: '#2e7d32' },
    action: { bg: '#fff3e0', border: '#e65100', text: '#e65100' },
    outcome: { bg: '#e8eaf6', border: '#283593', text: '#283593' },
};
/** Icon/emoji mapping for actor types within intelligence mindmaps. */
const ACTOR_TYPE_LABELS = {
    mep: '👤',
    group: '🏛️',
    committee: '📋',
    external: '🌐',
};
// ---------------------------------------------------------------------------
// Section heading labels (14 languages)
// ---------------------------------------------------------------------------
const MINDMAP_HEADINGS = {
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
const INTELLIGENCE_MINDMAP_HEADINGS = {
    en: 'Intelligence Policy Map',
    sv: 'Underrättelsebaserad policykarta',
    da: 'Intelligensbaseret politikkort',
    no: 'Etterretningsbasert politikkart',
    fi: 'Tiedustelupohjainen politiikkakartta',
    de: 'Intelligenz-Politikkarte',
    fr: 'Carte de renseignement politique',
    es: 'Mapa de inteligencia política',
    nl: 'Intelligentie beleidskaart',
    ar: 'خريطة الاستخبارات السياسية',
    he: 'מפת מודיעין מדיני',
    ja: '政策インテリジェンスマップ',
    ko: '정책 인텔리전스 맵',
    zh: '政策情报图谱',
};
const STAKEHOLDER_PERSPECTIVES_LABELS = {
    en: 'Stakeholder Perspectives',
    sv: 'Intressentperspektiv',
    da: 'Interessentperspektiver',
    no: 'Interessentperspektiver',
    fi: 'Sidosryhmänäkökulmat',
    de: 'Interessengruppen-Perspektiven',
    fr: 'Perspectives des parties prenantes',
    es: 'Perspectivas de las partes interesadas',
    nl: 'Perspectieven van belanghebbenden',
    ar: 'وجهات نظر أصحاب المصلحة',
    he: 'נקודות מבט של בעלי עניין',
    ja: 'ステークホルダーの視点',
    ko: '이해관계자 관점',
    zh: '利益相关者视角',
};
const POLICY_CONNECTIONS_LABELS = {
    en: 'Policy Connections',
    sv: 'Policyförbindelser',
    da: 'Politikforbindelser',
    no: 'Politikkforbindelser',
    fi: 'Politiikkayhteydet',
    de: 'Politikverbindungen',
    fr: 'Connexions politiques',
    es: 'Conexiones políticas',
    nl: 'Beleidsverbindingen',
    ar: 'الروابط السياسية',
    he: 'קשרים מדיניים',
    ja: '政策的つながり',
    ko: '정책 연결',
    zh: '政策关联',
};
const ACTOR_NETWORK_LABELS = {
    en: 'Actor Network',
    sv: 'Aktörsnätverk',
    da: 'Aktørnetværk',
    no: 'Aktørnettverk',
    fi: 'Toimijaverkosto',
    de: 'Akteursnetzwerk',
    fr: "Réseau d'acteurs",
    es: 'Red de actores',
    nl: 'Actornetwerk',
    ar: 'شبكة الجهات الفاعلة',
    he: 'רשת גורמים',
    ja: 'アクターネットワーク',
    ko: '행위자 네트워크',
    zh: '行动者网络',
};
const POLICY_DOMAINS_LABELS = {
    en: 'Policy Domains',
    sv: 'Policyområden',
    da: 'Politikområder',
    no: 'Politikkområder',
    fi: 'Politiikan alat',
    de: 'Politikbereiche',
    fr: 'Domaines politiques',
    es: 'Ámbitos políticos',
    nl: 'Beleidsdomeinen',
    ar: 'مجالات السياسة',
    he: 'תחומי מדיניות',
    ja: '政策分野',
    ko: '정책 분야',
    zh: '政策领域',
};
const INFLUENCE_LABELS = {
    en: 'Influence',
    sv: 'Inflytande',
    da: 'Indflydelse',
    no: 'Innflytelse',
    fi: 'Vaikutusvalta',
    de: 'Einfluss',
    fr: 'Influence',
    es: 'Influencia',
    nl: 'Invloed',
    ar: 'التأثير',
    he: 'השפעה',
    ja: '影響力',
    ko: '영향력',
    zh: '影响力',
};
const PERSPECTIVE_LABELS = {
    en: 'perspective',
    sv: 'perspektiv',
    da: 'perspektiv',
    no: 'perspektiv',
    fi: 'näkökulma',
    de: 'Perspektive',
    fr: 'perspective',
    es: 'perspectiva',
    nl: 'perspectief',
    ar: 'منظور',
    he: 'נקודת מבט',
    ja: '視点',
    ko: '관점',
    zh: '视角',
};
const DETAILS_LABELS = {
    en: 'Details',
    sv: 'Detaljer',
    da: 'Detaljer',
    no: 'Detaljer',
    fi: 'Yksityiskohdat',
    de: 'Details',
    fr: 'Détails',
    es: 'Detalles',
    nl: 'Details',
    ar: 'التفاصيل',
    he: 'פרטים',
    ja: '詳細',
    ko: '세부 정보',
    zh: '详情',
};
// ---------------------------------------------------------------------------
// Rendering helpers — standard mindmap
// ---------------------------------------------------------------------------
function renderBranch(branch) {
    const palette = BRANCH_PALETTE[branch.color] ?? BRANCH_PALETTE.cyan;
    const iconPrefix = branch.icon ? `${branch.icon} ` : '';
    const labelHtml = `${escapeHTML(iconPrefix)}${escapeHTML(branch.label)}`;
    const leafItems = branch.items && branch.items.length > 0
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
// Rendering helpers — intelligence mindmap
// ---------------------------------------------------------------------------
/**
 * Recursively count all nodes in the tree, including nested children.
 *
 * @param nodes - Root-level nodes to count
 * @returns Total node count including all descendants
 */
function countNodesRecursive(nodes) {
    let count = nodes.length;
    for (const node of nodes) {
        if (node.children.length > 0) {
            count += countNodesRecursive(node.children);
        }
    }
    return count;
}
/**
 * Get color palette entry for a mindmap node.
 * Checks the node's `color` field against `BRANCH_PALETTE` first (allowing
 * builders to override category-based colors), then falls back to the
 * category palette, and finally to the default `policy_domain` palette.
 *
 * @param category - Node category string key
 * @param color - Optional semantic color key from the branch palette
 * @returns Color palette object with bg, border, and text properties
 */
function getNodePalette(category, color) {
    if (color && Object.hasOwn(BRANCH_PALETTE, color)) {
        return BRANCH_PALETTE[color];
    }
    if (Object.hasOwn(CATEGORY_PALETTE, category)) {
        const entry = CATEGORY_PALETTE[category];
        if (entry)
            return entry;
    }
    return { bg: '#e3f2fd', border: '#1565c0', text: '#1565c0' };
}
/**
 * Clamp influence value to valid 0–1 range.
 *
 * @param value - Influence value to clamp
 * @returns Clamped value between 0 and 1 inclusive
 */
function clampInfluence(value) {
    return Math.max(0, Math.min(1, value));
}
/**
 * Render a single intelligence mindmap node as HTML.
 * Recursively renders children as nested sub-nodes.
 *
 * @param node - The mindmap node to render
 * @param depth - Current depth in the hierarchy (1 = domain layer)
 * @param detailsLabel - Localized label for the child details toggle
 * @param influenceLabel - Localized label for influence meter
 * @returns HTML string for this node and its children
 */
function renderIntelligenceNode(node, depth, detailsLabel, influenceLabel) {
    const palette = getNodePalette(node.category, node.color);
    const influence = clampInfluence(node.influence);
    const influencePct = (influence * 100).toFixed(0);
    const metaCommittee = node.metadata?.committee
        ? ` data-committee="${escapeHTML(node.metadata.committee)}"`
        : '';
    const metaGroup = node.metadata?.politicalGroup
        ? ` data-group="${escapeHTML(node.metadata.politicalGroup)}"`
        : '';
    const metaDoc = node.metadata?.documentRef
        ? ` data-doc="${escapeHTML(node.metadata.documentRef)}"`
        : '';
    const childrenHtml = node.children.length > 0
        ? `\n        <details class="mindmap-actor-overlay" aria-label="${escapeHTML(detailsLabel)}: ${escapeHTML(node.label)}">\n          <summary class="mindmap-actor-toggle">${escapeHTML(detailsLabel)}</summary>\n          <ul class="mindmap-subnodes mindmap-layer-${depth + 1}" role="list">\n${node.children
            .map((child) => `            <li>${renderIntelligenceNode(child, depth + 1, detailsLabel, influenceLabel)}</li>`)
            .join('\n')}\n          </ul>\n        </details>`
        : '';
    return `<div class="mindmap-intel-node mindmap-node-${escapeHTML(node.category)}"
        data-node-id="${escapeHTML(node.id)}" data-influence="${influencePct}"
        style="--branch-bg:${palette.bg};--branch-border:${palette.border};--branch-text:${palette.text};--node-influence:${influence.toFixed(2)}"${metaCommittee}${metaGroup}${metaDoc}
        aria-label="${escapeHTML(node.label)} (${escapeHTML(influenceLabel)}: ${influencePct}%)">
        <div class="mindmap-intel-label">${escapeHTML(node.label)}</div>
        <div class="mindmap-influence-bar" role="meter" aria-valuenow="${influencePct}" aria-valuemin="0" aria-valuemax="100" aria-label="${escapeHTML(influenceLabel)}: ${influencePct}%">
          <div class="mindmap-influence-fill" style="width:${influencePct}%"></div>
        </div>${childrenHtml}
      </div>`;
}
/**
 * Render the connections section as a `<details>` overlay panel.
 * Each connection is rendered with strength and type indicators.
 * Connection endpoints may reference either layer node IDs or actorNetwork
 * IDs; when a `nodeLabels` map is provided, IDs are resolved to
 * human-readable labels for display.
 *
 * @param connections - Policy connections to render
 * @param label - Localized heading label for the toggle
 * @param nodeLabels - Optional ID → label map for resolving endpoint names
 * @returns HTML string for the connections overlay, or empty string
 */
function renderConnectionsOverlay(connections, label, nodeLabels) {
    if (connections.length === 0)
        return '';
    const resolveName = (id) => nodeLabels?.get(id) ?? id;
    const items = connections
        .map((c) => `      <li class="mindmap-connection mindmap-connection-${escapeHTML(c.strength)} mindmap-connection-type-${escapeHTML(c.type)}"
         aria-label="${escapeHTML(resolveName(c.from))} → ${escapeHTML(resolveName(c.to))}: ${escapeHTML(c.type)} (${escapeHTML(c.strength)}) — ${escapeHTML(c.evidence)}">
        <span class="connection-from">${escapeHTML(resolveName(c.from))}</span>
        <span class="connection-arrow" aria-hidden="true"> → </span>
        <span class="connection-to">${escapeHTML(resolveName(c.to))}</span>
        <span class="connection-meta">[${escapeHTML(c.type)}, ${escapeHTML(c.strength)}]</span>
        <span class="connection-evidence">${escapeHTML(c.evidence)}</span>
      </li>`)
        .join('\n');
    return `  <details class="mindmap-connections-overlay">
    <summary class="mindmap-connections-toggle">${escapeHTML(label)}</summary>
    <ul class="mindmap-connections-list" role="list">
${items}
    </ul>
  </details>`;
}
/**
 * Render the actor network section as a `<details>` overlay panel.
 *
 * @param actorNetwork - Actor nodes to render in the network panel
 * @param label - Localized heading label for the toggle
 * @param influenceLabel - Localized label for influence meter
 * @returns HTML string for the actor network overlay, or empty string
 */
function renderActorNetworkOverlay(actorNetwork, label, influenceLabel) {
    if (actorNetwork.length === 0)
        return '';
    const items = actorNetwork
        .map((actor) => {
        const typeIcon = ACTOR_TYPE_LABELS[actor.type] ?? '•';
        const influence = clampInfluence(actor.influence);
        const influencePct = (influence * 100).toFixed(0);
        return `      <li class="mindmap-actor mindmap-actor-${escapeHTML(actor.type)}"
         data-actor-id="${escapeHTML(actor.id)}"
         style="--node-influence:${influence.toFixed(2)}"
         aria-label="${escapeHTML(actor.name)} (${escapeHTML(actor.type)}, ${escapeHTML(influenceLabel)}: ${influencePct}%)">
        <span class="actor-icon" aria-hidden="true">${escapeHTML(typeIcon)}</span>
        <span class="actor-name">${escapeHTML(actor.name)}</span>
        <span class="actor-type-badge">${escapeHTML(actor.type)}</span>
        <div class="mindmap-influence-bar" role="meter" aria-valuenow="${influencePct}" aria-valuemin="0" aria-valuemax="100" aria-label="${escapeHTML(influenceLabel)}: ${influencePct}%">
          <div class="mindmap-influence-fill" style="width:${influencePct}%"></div>
        </div>
      </li>`;
    })
        .join('\n');
    return `  <details class="mindmap-actor-network-overlay">
    <summary class="mindmap-actor-network-toggle">${escapeHTML(label)}</summary>
    <ul class="mindmap-actor-network-list" role="list">
${items}
    </ul>
  </details>`;
}
/**
 * Render stakeholder perspective overlays as `<details>` panels.
 *
 * @param groups - Stakeholder group labels to render as panels
 * @param label - Localized heading label for the outer toggle
 * @param perspectiveLabel - Localized suffix for stakeholder perspective aria-label
 * @returns HTML string for the stakeholder overlay, or empty string
 */
function renderStakeholderOverlays(groups, label, perspectiveLabel) {
    if (!groups || groups.length === 0)
        return '';
    const panels = groups
        .map((g) => `      <details class="mindmap-stakeholder-panel" aria-label="${escapeHTML(g)} ${escapeHTML(perspectiveLabel)}">
        <summary>${escapeHTML(g)}</summary>
        <p class="mindmap-stakeholder-desc">${escapeHTML(g)}</p>
      </details>`)
        .join('\n');
    return `  <details class="mindmap-stakeholder-overlay">
    <summary class="mindmap-stakeholder-toggle">${escapeHTML(label)}</summary>
    <div class="mindmap-stakeholder-panels">
${panels}
    </div>
  </details>`;
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
export function buildMindmapSection(config, lang = 'en', heading) {
    if (!config || !config.branches || config.branches.length === 0) {
        return '';
    }
    const titleText = heading?.trim() || MINDMAP_HEADINGS[lang] || 'Policy Mindmap';
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
/**
 * Generate a multi-layer intelligence mindmap section as an HTML string.
 *
 * Renders a hierarchical policy domain intelligence map with:
 * - Influence-weighted nodes (CSS `--node-influence` custom property)
 * - Actor-network visualization via `<details>` child overlays
 * - Policy connection indicators in a collapsible `<details>` panel
 * - Stakeholder perspective overlays via `<details>/<summary>` (no JS)
 * - WCAG 2.1 AA accessible roles, labels, and meter elements
 *
 * Returns an empty string when `imap` is null/undefined or has no layers
 * with nodes.
 *
 * @param imap - Intelligence mindmap data.
 * @param lang - BCP 47 language code for section headings.
 * @param heading - Optional heading override.
 * @returns HTML string for the intelligence mindmap section, or empty string.
 */
export function buildIntelligenceMindmapSection(imap, lang = 'en', heading) {
    if (!imap)
        return '';
    const allNodes = imap.layers.flatMap((l) => l.nodes);
    if (allNodes.length === 0)
        return '';
    const titleText = heading?.trim() || INTELLIGENCE_MINDMAP_HEADINGS[lang] || 'Intelligence Policy Map';
    const detailsLabel = DETAILS_LABELS[lang] ?? 'Details';
    const stakeholderLabel = STAKEHOLDER_PERSPECTIVES_LABELS[lang] ?? 'Stakeholder Perspectives';
    const connectionsLabel = POLICY_CONNECTIONS_LABELS[lang] ?? 'Policy Connections';
    const actorNetworkLabel = ACTOR_NETWORK_LABELS[lang] ?? 'Actor Network';
    const policyDomainsLabel = POLICY_DOMAINS_LABELS[lang] ?? 'Policy Domains';
    const influenceLabel = INFLUENCE_LABELS[lang] ?? 'Influence';
    const perspectiveLabel = PERSPECTIVE_LABELS[lang] ?? 'perspective';
    const summaryBlock = imap.summary?.trim()
        ? `  <p class="mindmap-summary">${escapeHTML(imap.summary.trim())}</p>\n`
        : '';
    // Render domain layer (depth 1 nodes as primary branches); fall back to
    // allNodes when the depth-1 layer is missing *or* empty.
    const depth1Nodes = imap.layers.find((l) => l.depth === 1)?.nodes ?? [];
    const domainNodes = depth1Nodes.length > 0 ? depth1Nodes : allNodes;
    const domainItems = domainNodes
        .map((node) => `      <li>${renderIntelligenceNode(node, 1, detailsLabel, influenceLabel)}</li>`)
        .join('\n');
    // Build label lookup for connection endpoint resolution.
    // This allows connections referencing actorNetwork IDs to display
    // human-readable names instead of raw IDs.
    const nodeLabels = new Map();
    const addLabels = (nodes) => {
        for (const n of nodes) {
            nodeLabels.set(n.id, n.label);
            if (n.children.length > 0)
                addLabels(n.children);
        }
    };
    addLabels(allNodes);
    for (const actor of imap.actorNetwork) {
        nodeLabels.set(actor.id, actor.name);
    }
    const connectionsHtml = renderConnectionsOverlay(imap.connections, connectionsLabel, nodeLabels);
    const actorNetworkHtml = renderActorNetworkOverlay(imap.actorNetwork, actorNetworkLabel, influenceLabel);
    const stakeholderHtml = renderStakeholderOverlays(imap.stakeholderGroups, stakeholderLabel, perspectiveLabel);
    const totalNodes = countNodesRecursive(allNodes);
    const totalConnections = imap.connections.length;
    const totalActors = imap.actorNetwork.length;
    return `<section class="mindmap-section intelligence-mindmap" role="region" aria-label="${escapeHTML(titleText)}">
  <h2>${escapeHTML(titleText)}</h2>
${summaryBlock}  <div class="mindmap-container intelligence-map" data-branch-count="${domainNodes.length}" data-total-nodes="${totalNodes}" data-connections="${totalConnections}" data-actors="${totalActors}">
    <div class="mindmap-center" role="heading" aria-level="3">${escapeHTML(imap.centralTopic)}</div>
    <ul class="mindmap-branches mindmap-layer-1" role="list" aria-label="${escapeHTML(policyDomainsLabel)}">
${domainItems}
    </ul>
${connectionsHtml}
${actorNetworkHtml}
${stakeholderHtml}  </div>
</section>`;
}
//# sourceMappingURL=mindmap-content.js.map