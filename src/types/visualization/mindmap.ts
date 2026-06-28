// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/Visualization/Mindmap
 * @description Intelligence-mindmap data structures — layered policy
 * domains, actor-network nodes, policy connections, and influence-weight
 * justifications.
 */

/**
 * Category of a node within an intelligence mindmap.
 * - `policy_domain` — top-level EU policy area (e.g. ENVI, ECON, AFET)
 * - `sub_topic` — sub-issue within a policy domain
 * - `actor` — MEP, political group, committee, or external stakeholder
 * - `action` — a specific legislative act or parliamentary action
 * - `outcome` — the result or consequence of an action
 */
export type MindmapNodeCategory = 'policy_domain' | 'sub_topic' | 'actor' | 'action' | 'outcome';

/**
 * Type of connection between two nodes in an intelligence mindmap.
 * - `legislative` — formal procedural/legal link between nodes
 * - `political` — alliance, coalition, or adversarial political relationship
 * - `procedural` — committee-stage or plenary procedural link
 * - `thematic` — shared policy theme or topic overlap
 */
export type PolicyConnectionType = 'legislative' | 'political' | 'procedural' | 'thematic';

/**
 * Strength of a policy connection.
 * - `strong` — clearly evidenced, high-confidence link
 * - `moderate` — supported by indirect evidence
 * - `weak` — emerging or low-confidence relationship
 */
export type PolicyConnectionStrength = 'strong' | 'moderate' | 'weak';

/**
 * Type of actor in the actor-network.
 * - `mep` — individual Member of European Parliament
 * - `group` — political group (EPP, S&D, Renew, etc.)
 * - `committee` — EP standing committee (ENVI, ECON, etc.)
 * - `external` — non-EP stakeholder (Commission, Council, NGO, etc.)
 */
export type ActorType = 'mep' | 'group' | 'committee' | 'external';

/**
 * Pre-defined semantic color roles for mindmap branch nodes.
 * When assigned to `MindmapNode.color`, selects the corresponding branch
 * palette entry (overriding the default category-based colors).
 */
export type MindmapBranchColor =
  'cyan' | 'magenta' | 'yellow' | 'green' | 'purple' | 'orange' | 'blue' | 'red';

/**
 * A single node in the intelligence mindmap.
 * Nodes are arranged in depth layers: domain → sub-topic → actor → action → outcome.
 */
export interface MindmapNode {
  /** Unique node identifier (used for connection references). */
  readonly id: string;
  /** Human-readable label rendered inside the node. */
  readonly label: string;
  /** Node category determining visual styling. */
  readonly category: MindmapNodeCategory;
  /** Normalized influence weight 0–1 (drives `--node-influence` CSS var). */
  readonly influence: number;
  /**
   * Optional semantic color key from the 8-color branch palette.
   * When set to a valid `MindmapBranchColor` key (cyan, green, red, etc.),
   * overrides the default category-based palette for this node.
   * When omitted, the renderer falls back to the category palette.
   */
  readonly color?: MindmapBranchColor | undefined;
  /** Child nodes one layer deeper in the hierarchy. */
  readonly children: readonly MindmapNode[];
  /** Optional EP-specific metadata for hover/detail rendering. */
  readonly metadata?:
    | {
        readonly committee?: string | undefined;
        readonly politicalGroup?: string | undefined;
        readonly documentRef?: string | undefined;
      }
    | undefined;
}

/**
 * A single depth layer in the intelligence mindmap hierarchy.
 * Layer 0 is the central topic; higher depths are progressively detailed.
 */
export interface MindmapLayer {
  /** Layer depth (0 = center, 1 = domains, 2 = sub-topics, 3 = actors, 4 = actions/outcomes). */
  readonly depth: number;
  /** Nodes belonging to this layer. */
  readonly nodes: readonly MindmapNode[];
}

/**
 * A directed connection between two endpoints in the intelligence mindmap.
 * Endpoints may reference either layer node IDs or actorNetwork IDs,
 * allowing connections between rendered domain nodes and actor-network
 * entities (e.g., anomaly or pipeline procedure nodes).
 */
export interface PolicyConnection {
  /** ID of the source endpoint (layer node or actorNetwork node). */
  readonly from: string;
  /** ID of the target endpoint (layer node or actorNetwork node). */
  readonly to: string;
  /** Confidence level of the relationship. */
  readonly strength: PolicyConnectionStrength;
  /** Nature of the relationship. */
  readonly type: PolicyConnectionType;
  /** EP document reference or description serving as evidence. */
  readonly evidence: string;
}

/**
 * A parliamentary or external actor node in the network.
 * Used to represent MEPs, political groups, committees, or external stakeholders.
 */
export interface ActorNode {
  /** Unique actor identifier. */
  readonly id: string;
  /** Display name of the actor. */
  readonly name: string;
  /** Category of actor. */
  readonly type: ActorType;
  /** Normalized influence score 0–1. */
  readonly influence: number;
  /** IDs of connected nodes in the network. */
  readonly connections: readonly string[];
}

/**
 * Influence weight entry for a mindmap node.
 * Provides justification for a node's computed influence score.
 */
export interface InfluenceWeight {
  /** Node being scored. */
  readonly nodeId: string;
  /** Normalized weight 0–1. */
  readonly weight: number;
  /** Human-readable factors explaining the score. */
  readonly factors: readonly string[];
}

/**
 * Complete intelligence mindmap data structure.
 * Combines layered policy domain nodes, actor-network relationships,
 * policy connections, and optional stakeholder perspective overlays.
 *
 * @example
 * ```typescript
 * const imap: IntelligenceMindmap = {
 *   centralTopic: 'EU Climate Policy Intelligence',
 *   layers: [{ depth: 1, nodes: [{ id: 'envi', label: 'Environment', category: 'policy_domain', ... }] }],
 *   connections: [{ from: 'envi', to: 'econ', strength: 'strong', type: 'legislative', evidence: 'Green Deal' }],
 *   actorNetwork: [{ id: 'envi-cmt', name: 'ENVI Committee', type: 'committee', influence: 0.9, connections: [] }],
 *   stakeholderGroups: ['Industry', 'Civil Society', 'Member States'],
 * };
 * ```
 */
export interface IntelligenceMindmap {
  /** Central topic label for the root node. */
  readonly centralTopic: string;
  /** Ordered depth layers from domains (1) to outcomes (4). */
  readonly layers: readonly MindmapLayer[];
  /** Cross-cutting connections between nodes in different branches. */
  readonly connections: readonly PolicyConnection[];
  /** Actor-network nodes (MEPs, groups, committees, external). */
  readonly actorNetwork: readonly ActorNode[];
  /** Optional stakeholder group labels for `<details>` overlay sections. */
  readonly stakeholderGroups?: readonly string[] | undefined;
  /** Optional summary rendered above the mindmap. */
  readonly summary?: string | undefined;
}
