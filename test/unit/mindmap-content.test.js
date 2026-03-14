// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import {
  buildMindmapSection,
  buildIntelligenceMindmapSection,
} from '../../scripts/generators/mindmap-content.js';
import {
  buildVotingMindmap,
  buildProspectiveMindmap,
  buildBreakingMindmap,
  buildPropositionsMindmap,
  buildCommitteeMindmap,
} from '../../scripts/generators/analysis-builders.js';

describe('mindmap-content', () => {
  describe('buildMindmapSection', () => {
    it('should return empty string for null config', () => {
      expect(buildMindmapSection(null)).toBe('');
    });

    it('should return empty string for undefined config', () => {
      expect(buildMindmapSection(undefined)).toBe('');
    });

    it('should return empty string for config with no branches', () => {
      expect(buildMindmapSection({ topic: 'Test', branches: [] })).toBe('');
    });

    it('should render a mindmap with a central topic and branches', () => {
      const html = buildMindmapSection({
        topic: 'EU Digital Policy',
        branches: [
          { label: 'Key Actors', color: 'cyan', items: ['European Commission', 'ITRE Committee'] },
          { label: 'Risks', color: 'magenta', items: ['Fragmented regulation'] },
          { label: 'Opportunities', color: 'green' },
        ],
      });

      expect(html).toContain('<section class="mindmap-section"');
      expect(html).toContain('EU Digital Policy');
      expect(html).toContain('Key Actors');
      expect(html).toContain('European Commission');
      expect(html).toContain('ITRE Committee');
      expect(html).toContain('Risks');
      expect(html).toContain('Fragmented regulation');
      expect(html).toContain('Opportunities');
      expect(html).toContain('mindmap-center');
      expect(html).toContain('mindmap-branch');
      expect(html).toContain('role="list"');
      expect(html).toContain('role="region"');
    });

    it('should use English heading by default', () => {
      const html = buildMindmapSection({
        topic: 'Test',
        branches: [{ label: 'A', color: 'cyan' }],
      });

      expect(html).toContain('Policy Mindmap');
    });

    it('should use localized headings for supported languages', () => {
      const html = buildMindmapSection(
        { topic: 'Test', branches: [{ label: 'A', color: 'cyan' }] },
        'sv',
      );
      expect(html).toContain('Policykarta');
    });

    it('should allow heading override', () => {
      const html = buildMindmapSection(
        { topic: 'Test', branches: [{ label: 'A', color: 'cyan' }] },
        'en',
        'Custom Heading',
      );
      expect(html).toContain('Custom Heading');
      expect(html).not.toContain('Policy Mindmap');
    });

    it('should render optional summary paragraph', () => {
      const html = buildMindmapSection({
        topic: 'Test',
        branches: [{ label: 'A', color: 'cyan' }],
        summary: 'This is an overview of the topic.',
      });
      expect(html).toContain('<p class="mindmap-summary">');
      expect(html).toContain('This is an overview of the topic.');
    });

    it('should render branch icons when provided', () => {
      const html = buildMindmapSection({
        topic: 'Test',
        branches: [{ label: 'Actors', color: 'cyan', icon: '👥' }],
      });
      expect(html).toContain('👥');
    });

    it('should escape HTML in topic, labels, and items', () => {
      const html = buildMindmapSection({
        topic: '<script>alert("xss")</script>',
        branches: [
          { label: '<b>Bold</b>', color: 'red', items: ['Item & "more"'] },
        ],
      });
      expect(html).toContain('&lt;script&gt;');
      expect(html).toContain('&lt;b&gt;Bold&lt;/b&gt;');
      expect(html).toContain('Item &amp; &quot;more&quot;');
      expect(html).not.toContain('<script>');
    });

    it('should set CSS custom properties on branch elements', () => {
      const html = buildMindmapSection({
        topic: 'Test',
        branches: [{ label: 'A', color: 'green' }],
      });
      expect(html).toContain('--branch-bg:');
      expect(html).toContain('--branch-border:');
      expect(html).toContain('--branch-text:');
    });

    it('should include data-branch-count attribute', () => {
      const html = buildMindmapSection({
        topic: 'Test',
        branches: [
          { label: 'A', color: 'cyan' },
          { label: 'B', color: 'magenta' },
          { label: 'C', color: 'green' },
        ],
      });
      expect(html).toContain('data-branch-count="3"');
    });

    it('should support all 8 branch colors', () => {
      const colors = ['cyan', 'magenta', 'yellow', 'green', 'purple', 'orange', 'blue', 'red'];
      for (const color of colors) {
        const html = buildMindmapSection({
          topic: 'Test',
          branches: [{ label: `Color ${color}`, color }],
        });
        expect(html).toContain(`Color ${color}`);
        expect(html).toContain('mindmap-branch');
      }
    });
  });

  // ---------------------------------------------------------------------------
  // buildIntelligenceMindmapSection
  // ---------------------------------------------------------------------------

  describe('buildIntelligenceMindmapSection', () => {
    it('should return empty string for null input', () => {
      expect(buildIntelligenceMindmapSection(null)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(buildIntelligenceMindmapSection(undefined)).toBe('');
    });

    it('should return empty string when all layers have no nodes', () => {
      expect(
        buildIntelligenceMindmapSection({
          centralTopic: 'Test',
          layers: [],
          connections: [],
          actorNetwork: [],
        }),
      ).toBe('');
    });

    it('should render a full intelligence mindmap with nodes', () => {
      const imap = {
        centralTopic: 'EU Climate Policy Intelligence',
        layers: [
          {
            depth: 1,
            nodes: [
              {
                id: 'envi',
                label: 'Environment',
                category: 'policy_domain',
                influence: 0.9,
                color: 'green',
                children: [
                  {
                    id: 'green-deal',
                    label: 'Green Deal',
                    category: 'sub_topic',
                    influence: 0.8,
                    color: 'green',
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
        connections: [
          {
            from: 'envi',
            to: 'econ',
            strength: 'strong',
            type: 'legislative',
            evidence: 'EU Green Deal',
          },
        ],
        actorNetwork: [
          {
            id: 'envi-cmt',
            name: 'ENVI Committee',
            type: 'committee',
            influence: 0.95,
            connections: ['envi'],
          },
        ],
        stakeholderGroups: ['Industry', 'Civil Society', 'Member States'],
        summary: 'Climate policy intelligence overview.',
      };

      const html = buildIntelligenceMindmapSection(imap);

      expect(html).toContain('<section class="mindmap-section intelligence-mindmap"');
      expect(html).toContain('Intelligence Policy Map');
      expect(html).toContain('EU Climate Policy Intelligence');
      expect(html).toContain('Environment');
      expect(html).toContain('Green Deal');
      expect(html).toContain('ENVI Committee');
      expect(html).toContain('Industry');
      expect(html).toContain('Civil Society');
      expect(html).toContain('EU Green Deal');
      expect(html).toContain('role="region"');
      expect(html).toContain('role="list"');
      expect(html).toContain('mindmap-intel-node');
      expect(html).toContain('--node-influence:');
    });

    it('should render influence bar with WCAG meter attributes', () => {
      const html = buildIntelligenceMindmapSection({
        centralTopic: 'Test',
        layers: [
          {
            depth: 1,
            nodes: [
              {
                id: 'n1',
                label: 'Node',
                category: 'policy_domain',
                influence: 0.75,
                color: 'cyan',
                children: [],
              },
            ],
          },
        ],
        connections: [],
        actorNetwork: [],
      });

      expect(html).toContain('role="meter"');
      expect(html).toContain('aria-valuenow="75"');
      expect(html).toContain('aria-valuemin="0"');
      expect(html).toContain('aria-valuemax="100"');
      expect(html).toContain('mindmap-influence-bar');
      expect(html).toContain('mindmap-influence-fill');
    });

    it('should clamp influence values to 0-1 range', () => {
      const html = buildIntelligenceMindmapSection({
        centralTopic: 'Test',
        layers: [
          {
            depth: 1,
            nodes: [
              {
                id: 'n1',
                label: 'Overloaded',
                category: 'actor',
                influence: 1.5,
                color: 'purple',
                children: [],
              },
              {
                id: 'n2',
                label: 'Negative',
                category: 'actor',
                influence: -0.5,
                color: 'red',
                children: [],
              },
            ],
          },
        ],
        connections: [],
        actorNetwork: [],
      });

      expect(html).toContain('aria-valuenow="100"');
      expect(html).toContain('aria-valuenow="0"');
    });

    it('should render connections overlay when connections are present', () => {
      const html = buildIntelligenceMindmapSection({
        centralTopic: 'Test',
        layers: [
          {
            depth: 1,
            nodes: [
              {
                id: 'n1',
                label: 'Node 1',
                category: 'policy_domain',
                influence: 0.5,
                color: 'cyan',
                children: [],
              },
            ],
          },
        ],
        connections: [
          {
            from: 'n1',
            to: 'n2',
            strength: 'moderate',
            type: 'thematic',
            evidence: 'Shared climate policy theme',
          },
        ],
        actorNetwork: [],
      });

      expect(html).toContain('mindmap-connections-overlay');
      expect(html).toContain('mindmap-connections-toggle');
      expect(html).toContain('Policy Connections');
      expect(html).toContain('Shared climate policy theme');
      expect(html).toContain('mindmap-connection-moderate');
      expect(html).toContain('mindmap-connection-type-thematic');
      // Connections aria-label includes direction, type and strength for accessibility
      expect(html).toContain('aria-label="n1 → n2: thematic (moderate) — Shared climate policy theme"');
    });

    it('should render actor network overlay', () => {
      const html = buildIntelligenceMindmapSection({
        centralTopic: 'Test',
        layers: [
          {
            depth: 1,
            nodes: [
              {
                id: 'n1',
                label: 'Domain',
                category: 'policy_domain',
                influence: 0.5,
                color: 'cyan',
                children: [],
              },
            ],
          },
        ],
        connections: [],
        actorNetwork: [
          { id: 'a1', name: 'EPP Group', type: 'group', influence: 0.85, connections: [] },
          { id: 'a2', name: 'ENVI Committee', type: 'committee', influence: 0.9, connections: ['n1'] },
        ],
      });

      expect(html).toContain('mindmap-actor-network-overlay');
      expect(html).toContain('Actor Network');
      expect(html).toContain('EPP Group');
      expect(html).toContain('ENVI Committee');
      expect(html).toContain('mindmap-actor-group');
      expect(html).toContain('mindmap-actor-committee');
    });

    it('should render stakeholder perspective overlays via details elements', () => {
      const html = buildIntelligenceMindmapSection({
        centralTopic: 'Test',
        layers: [
          {
            depth: 1,
            nodes: [
              {
                id: 'n1',
                label: 'Domain',
                category: 'policy_domain',
                influence: 0.5,
                color: 'cyan',
                children: [],
              },
            ],
          },
        ],
        connections: [],
        actorNetwork: [],
        stakeholderGroups: ['Industry', 'Civil Society'],
      });

      expect(html).toContain('mindmap-stakeholder-overlay');
      expect(html).toContain('Stakeholder Perspectives');
      expect(html).toContain('mindmap-stakeholder-panel');
      expect(html).toContain('Industry');
      expect(html).toContain('Civil Society');
    });

    it('should render optional summary paragraph', () => {
      const html = buildIntelligenceMindmapSection({
        centralTopic: 'Test',
        layers: [
          {
            depth: 1,
            nodes: [
              {
                id: 'n1',
                label: 'Node',
                category: 'policy_domain',
                influence: 0.5,
                color: 'green',
                children: [],
              },
            ],
          },
        ],
        connections: [],
        actorNetwork: [],
        summary: 'Summary text here.',
      });

      expect(html).toContain('<p class="mindmap-summary">');
      expect(html).toContain('Summary text here.');
    });

    it('should use localized heading for supported languages', () => {
      const imap = {
        centralTopic: 'Test',
        layers: [
          {
            depth: 1,
            nodes: [
              {
                id: 'n1',
                label: 'Node',
                category: 'policy_domain',
                influence: 0.5,
                color: 'green',
                children: [],
              },
            ],
          },
        ],
        connections: [],
        actorNetwork: [],
      };

      expect(buildIntelligenceMindmapSection(imap, 'de')).toContain('Intelligenz-Politikkarte');
      expect(buildIntelligenceMindmapSection(imap, 'fr')).toContain('Carte de renseignement politique');
    });

    it('should allow custom heading override', () => {
      const html = buildIntelligenceMindmapSection(
        {
          centralTopic: 'Test',
          layers: [
            {
              depth: 1,
              nodes: [
                {
                  id: 'n1',
                  label: 'Node',
                  category: 'policy_domain',
                  influence: 0.5,
                  color: 'green',
                  children: [],
                },
              ],
            },
          ],
          connections: [],
          actorNetwork: [],
        },
        'en',
        'Custom Intelligence Heading',
      );

      expect(html).toContain('Custom Intelligence Heading');
      expect(html).not.toContain('Intelligence Policy Map');
    });

    it('should escape HTML in all node labels and evidence strings', () => {
      const html = buildIntelligenceMindmapSection({
        centralTopic: '<b>Central</b>',
        layers: [
          {
            depth: 1,
            nodes: [
              {
                id: 'n1',
                label: '<script>xss()</script>',
                category: 'policy_domain',
                influence: 0.5,
                color: 'cyan',
                children: [],
              },
            ],
          },
        ],
        connections: [
          {
            from: 'n1',
            to: 'n2',
            strength: 'strong',
            type: 'legislative',
            evidence: '<img src=x onerror=alert(1)>',
          },
        ],
        actorNetwork: [
          { id: 'a1', name: '<evil>actor</evil>', type: 'mep', influence: 0.5, connections: [] },
        ],
      });

      expect(html).toContain('&lt;b&gt;Central&lt;/b&gt;');
      expect(html).toContain('&lt;script&gt;');
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;img src=x');
      expect(html).toContain('&lt;evil&gt;');
    });

    it('should include data-total-nodes, data-connections, data-actors attributes', () => {
      const html = buildIntelligenceMindmapSection({
        centralTopic: 'Test',
        layers: [
          {
            depth: 1,
            nodes: [
              { id: 'n1', label: 'A', category: 'policy_domain', influence: 0.5, color: 'cyan', children: [] },
              { id: 'n2', label: 'B', category: 'policy_domain', influence: 0.6, color: 'green', children: [] },
            ],
          },
        ],
        connections: [
          { from: 'n1', to: 'n2', strength: 'weak', type: 'thematic', evidence: 'test' },
        ],
        actorNetwork: [
          { id: 'a1', name: 'Actor 1', type: 'group', influence: 0.7, connections: [] },
        ],
      });

      expect(html).toContain('data-total-nodes="2"');
      expect(html).toContain('data-connections="1"');
      expect(html).toContain('data-actors="1"');
    });

    it('should count nested children in data-total-nodes recursively', () => {
      const html = buildIntelligenceMindmapSection({
        centralTopic: 'Test',
        layers: [
          {
            depth: 1,
            nodes: [
              {
                id: 'domain1',
                label: 'Domain',
                category: 'policy_domain',
                influence: 0.8,
                color: 'cyan',
                children: [
                  { id: 'child1', label: 'Child 1', category: 'sub_topic', influence: 0.5, color: 'green', children: [] },
                  { id: 'child2', label: 'Child 2', category: 'sub_topic', influence: 0.5, color: 'green', children: [
                    { id: 'grandchild1', label: 'Grandchild', category: 'actor', influence: 0.3, color: 'purple', children: [] },
                  ] },
                ],
              },
            ],
          },
        ],
        connections: [],
        actorNetwork: [],
      });

      // 1 domain + 2 children + 1 grandchild = 4
      expect(html).toContain('data-total-nodes="4"');
    });

    it('should use localized Policy Domains aria-label', () => {
      const imap = {
        centralTopic: 'Test',
        layers: [
          {
            depth: 1,
            nodes: [
              { id: 'n1', label: 'Node', category: 'policy_domain', influence: 0.5, color: 'cyan', children: [] },
            ],
          },
        ],
        connections: [],
        actorNetwork: [],
      };

      expect(buildIntelligenceMindmapSection(imap, 'de')).toContain('aria-label="Politikbereiche"');
      expect(buildIntelligenceMindmapSection(imap, 'fr')).toContain('aria-label="Domaines politiques"');
      expect(buildIntelligenceMindmapSection(imap, 'en')).toContain('aria-label="Policy Domains"');
    });

    it('should render child nodes as nested actor overlays using details/summary', () => {
      const html = buildIntelligenceMindmapSection({
        centralTopic: 'Test',
        layers: [
          {
            depth: 1,
            nodes: [
              {
                id: 'domain1',
                label: 'Policy Domain',
                category: 'policy_domain',
                influence: 0.8,
                color: 'cyan',
                children: [
                  {
                    id: 'subtopic1',
                    label: 'Sub-Topic A',
                    category: 'sub_topic',
                    influence: 0.6,
                    color: 'green',
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
        connections: [],
        actorNetwork: [],
      });

      expect(html).toContain('mindmap-actor-overlay');
      expect(html).toContain('Sub-Topic A');
      expect(html).toContain('<details');
      expect(html).toContain('<summary');
    });

    it('should not render connections section when connections array is empty', () => {
      const html = buildIntelligenceMindmapSection({
        centralTopic: 'Test',
        layers: [
          {
            depth: 1,
            nodes: [
              { id: 'n1', label: 'Node', category: 'policy_domain', influence: 0.5, color: 'cyan', children: [] },
            ],
          },
        ],
        connections: [],
        actorNetwork: [],
      });

      expect(html).not.toContain('mindmap-connections-overlay');
    });

    it('should not render actor network section when actorNetwork array is empty', () => {
      const html = buildIntelligenceMindmapSection({
        centralTopic: 'Test',
        layers: [
          {
            depth: 1,
            nodes: [
              { id: 'n1', label: 'Node', category: 'policy_domain', influence: 0.5, color: 'cyan', children: [] },
            ],
          },
        ],
        connections: [],
        actorNetwork: [],
      });

      expect(html).not.toContain('mindmap-actor-network-overlay');
    });

    it('should use localized influence label in meter aria-label', () => {
      const imap = {
        centralTopic: 'Test',
        layers: [
          {
            depth: 1,
            nodes: [
              { id: 'n1', label: 'Node', category: 'policy_domain', influence: 0.7, color: 'cyan', children: [] },
            ],
          },
        ],
        connections: [],
        actorNetwork: [],
      };

      const htmlDe = buildIntelligenceMindmapSection(imap, 'de');
      expect(htmlDe).toContain('aria-label="Einfluss: 70%"');

      const htmlFr = buildIntelligenceMindmapSection(imap, 'fr');
      expect(htmlFr).toContain('aria-label="Influence: 70%"');

      const htmlEn = buildIntelligenceMindmapSection(imap, 'en');
      expect(htmlEn).toContain('aria-label="Influence: 70%"');
    });

    it('should not include emoji in actor network aria-label', () => {
      const html = buildIntelligenceMindmapSection({
        centralTopic: 'Test',
        layers: [
          {
            depth: 1,
            nodes: [
              { id: 'n1', label: 'Node', category: 'policy_domain', influence: 0.5, color: 'cyan', children: [] },
            ],
          },
        ],
        connections: [],
        actorNetwork: [
          { id: 'a1', name: 'ENVI Committee', type: 'committee', influence: 0.9, connections: [] },
        ],
      });

      // aria-label should NOT contain the emoji, only the actor name and type
      expect(html).toContain('aria-label="ENVI Committee (committee');
      // The emoji should only appear in the aria-hidden icon span
      expect(html).toContain('aria-hidden="true">📋</span>');
    });

    it('should localize influence label in actor network overlay', () => {
      const html = buildIntelligenceMindmapSection(
        {
          centralTopic: 'Test',
          layers: [
            {
              depth: 1,
              nodes: [
                { id: 'n1', label: 'Node', category: 'policy_domain', influence: 0.5, color: 'cyan', children: [] },
              ],
            },
          ],
          connections: [],
          actorNetwork: [
            { id: 'a1', name: 'EPP', type: 'group', influence: 0.8, connections: [] },
          ],
        },
        'sv'
      );

      expect(html).toContain('Inflytande: 80%');
    });

    it('should not include role="listitem" on inner node divs (li wrapper provides it)', () => {
      const html = buildIntelligenceMindmapSection({
        centralTopic: 'Test',
        layers: [
          {
            depth: 1,
            nodes: [
              {
                id: 'n1',
                label: 'Node',
                category: 'policy_domain',
                influence: 0.5,
                color: 'cyan',
                children: [
                  { id: 'n2', label: 'Child', category: 'sub_topic', influence: 0.3, color: 'green', children: [] },
                ],
              },
            ],
          },
        ],
        connections: [],
        actorNetwork: [],
      });

      // The <div class="mindmap-intel-node"> should NOT have role="listitem"
      expect(html).not.toMatch(/mindmap-intel-node[^"]*" role="listitem"/);
      // Domain items should be wrapped in <li> elements for proper list semantics
      expect(html).toMatch(/<li>\s*<div class="mindmap-intel-node/);
    });

    it('should use "Details" instead of "Key Actors" for child toggle label', () => {
      const html = buildIntelligenceMindmapSection({
        centralTopic: 'Test',
        layers: [
          {
            depth: 1,
            nodes: [
              {
                id: 'n1',
                label: 'Node',
                category: 'policy_domain',
                influence: 0.5,
                color: 'cyan',
                children: [
                  { id: 'n2', label: 'Sub', category: 'sub_topic', influence: 0.3, color: 'green', children: [] },
                ],
              },
            ],
          },
        ],
        connections: [],
        actorNetwork: [],
      });

      expect(html).toContain('>Details</summary>');
      expect(html).not.toContain('>Key Actors</summary>');
    });

    it('should localize stakeholder panel aria-label "perspective" suffix', () => {
      const html = buildIntelligenceMindmapSection(
        {
          centralTopic: 'Test',
          layers: [
            {
              depth: 1,
              nodes: [
                { id: 'n1', label: 'Node', category: 'policy_domain', influence: 0.5, color: 'cyan', children: [] },
              ],
            },
          ],
          connections: [],
          actorNetwork: [],
          stakeholderGroups: ['Industry'],
        },
        'de'
      );

      expect(html).toContain('Industry Perspektive');
      expect(html).not.toContain('Industry perspective');
    });

    it('should fall back to allNodes when depth-1 layer has zero nodes', () => {
      const html = buildIntelligenceMindmapSection({
        centralTopic: 'Test',
        layers: [
          { depth: 1, nodes: [] },
          {
            depth: 2,
            nodes: [
              { id: 'n1', label: 'Fallback Node', category: 'sub_topic', influence: 0.5, color: 'green', children: [] },
            ],
          },
        ],
        connections: [],
        actorNetwork: [],
      });

      expect(html).toContain('Fallback Node');
      expect(html).not.toBe('');
    });
  });

  // ---------------------------------------------------------------------------
  // Mindmap builders from analysis-builders
  // ---------------------------------------------------------------------------

  describe('buildVotingMindmap', () => {
    it('should return null when all data is placeholder', () => {
      expect(buildVotingMindmap([], [], [])).toBeNull();
    });

    it('should return null when records and patterns are all placeholder', () => {
      const result = buildVotingMindmap(
        [{ title: 'DATA_UNAVAILABLE (placeholder)', result: 'DATA_UNAVAILABLE (placeholder)', votes: { for: 0, against: 0, abstain: 0 } }],
        [{ group: 'placeholder_group', cohesion: 0, participation: 0 }],
        [],
      );
      expect(result).toBeNull();
    });

    it('should return null when patterns are empty but records exist', () => {
      const result = buildVotingMindmap(
        [{ title: 'Digital Markets Act', result: 'Adopted', votes: { for: 450, against: 100, abstain: 50 } }],
        [],
        [],
      );
      expect(result).toBeNull();
    });

    it('should build a mindmap from voting data', () => {
      const votingRecords = [
        { title: 'Digital Markets Act', result: 'Adopted', votes: { for: 450, against: 100, abstain: 50 } },
        { title: 'AI Act', result: 'Rejected', votes: { for: 200, against: 400, abstain: 100 } },
      ];
      const votingPatterns = [
        { group: 'EPP', cohesion: 0.85, participation: 0.9 },
        { group: 'S&D', cohesion: 0.45, participation: 0.8 },
      ];
      const anomalies = [
        { type: 'Low cohesion', severity: 'HIGH', group: 'S&D' },
      ];

      const imap = buildVotingMindmap(votingRecords, votingPatterns, anomalies);

      expect(imap).not.toBeNull();
      expect(imap.centralTopic).toBe('Voting Intelligence Analysis');
      expect(imap.layers).toHaveLength(1);
      expect(imap.layers[0].depth).toBe(1);
      expect(imap.layers[0].nodes.length).toBeGreaterThan(0);
      expect(imap.actorNetwork.length).toBeGreaterThan(0);
      expect(imap.summary).toContain('2 votes');
    });

    it('should mark high-cohesion groups with green color', () => {
      const votingPatterns = [
        { group: 'EPP', cohesion: 0.9, participation: 0.9 },
      ];
      const imap = buildVotingMindmap(
        [{ title: 'Test Vote', result: 'Adopted', votes: { for: 400, against: 50, abstain: 10 } }],
        votingPatterns,
        [],
      );

      expect(imap).not.toBeNull();
      const eppNode = imap.layers[0].nodes.find((n) => n.label === 'EPP');
      expect(eppNode?.color).toBe('green');
    });

    it('should mark low-cohesion groups with red color', () => {
      const votingPatterns = [
        { group: 'ECR', cohesion: 0.3, participation: 0.6 },
      ];
      const imap = buildVotingMindmap(
        [{ title: 'Test Vote', result: 'Adopted', votes: { for: 400, against: 50, abstain: 10 } }],
        votingPatterns,
        [],
      );

      expect(imap).not.toBeNull();
      const ecrNode = imap.layers[0].nodes.find((n) => n.label === 'ECR');
      expect(ecrNode?.color).toBe('red');
    });

    it('should not produce connection targets exceeding anomaly actor IDs', () => {
      const votingRecords = [
        { title: 'Vote 1', result: 'Adopted', votes: { for: 400, against: 50, abstain: 10 } },
      ];
      const votingPatterns = [
        { group: 'EPP', cohesion: 0.85, participation: 0.9 },
        { group: 'S&D', cohesion: 0.75, participation: 0.8 },
      ];
      // Provide more than 3 anomalies to verify connections are capped at 3
      const anomalies = [
        { type: 'Anomaly A', severity: 'HIGH', group: 'EPP' },
        { type: 'Anomaly B', severity: 'LOW', group: 'S&D' },
        { type: 'Anomaly C', severity: 'HIGH', group: 'EPP' },
        { type: 'Anomaly D', severity: 'LOW', group: 'S&D' },
        { type: 'Anomaly E', severity: 'HIGH', group: 'EPP' },
      ];

      const imap = buildVotingMindmap(votingRecords, votingPatterns, anomalies);
      expect(imap).not.toBeNull();

      const actorIds = new Set(imap.actorNetwork.map((a) => a.id));
      // Connections go from anomaly → group (anomaly IDs in `from`)
      for (const conn of imap.connections) {
        expect(actorIds.has(conn.from) || conn.from.startsWith('group-')).toBe(true);
        expect(conn.to.startsWith('group-')).toBe(true);
      }
      // Connections should reference at most anomaly-0, anomaly-1, anomaly-2
      const anomalySources = imap.connections.map((c) => c.from).filter((t) => t.startsWith('anomaly-'));
      for (const source of anomalySources) {
        const idx = parseInt(source.replace('anomaly-', ''), 10);
        expect(idx).toBeLessThanOrEqual(2);
      }
    });
  });

  describe('buildProspectiveMindmap', () => {
    it('should build a mindmap from week-ahead data', () => {
      const weekData = {
        events: [
          { title: 'Plenary Session', date: '2026-03-15', location: 'Strasbourg' },
          { title: 'ENVI Committee', date: '2026-03-16', location: 'Brussels' },
        ],
        pipeline: [
          { title: 'AI Act implementation', bottleneck: true },
          { title: 'Digital Services Act', bottleneck: false },
        ],
        dateRange: { from: '2026-03-15', to: '2026-03-19' },
        committees: [],
        documents: [],
        questions: [],
      };

      const imap = buildProspectiveMindmap(weekData);

      expect(imap).not.toBeNull();
      expect(imap.centralTopic).toBe('Week Ahead: Parliamentary Priorities');
      expect(imap.layers[0].nodes.length).toBeGreaterThan(0);
      expect(imap.actorNetwork.length).toBeGreaterThan(0);
      expect(imap.stakeholderGroups).toContain('Parliament');
      expect(imap.summary).toContain('2 events');
    });

    it('should include bottleneck count in summary', () => {
      const weekData = {
        events: [],
        pipeline: [
          { title: 'Blocked procedure', bottleneck: true },
          { title: 'Another bottleneck', bottleneck: true },
        ],
        dateRange: { from: '2026-03-15', to: '2026-03-19' },
        committees: [],
        documents: [],
        questions: [],
      };

      const imap = buildProspectiveMindmap(weekData);
      expect(imap.summary).toContain('2 legislative bottlenecks');
    });

    it('should always return a non-null result', () => {
      const weekData = {
        events: [],
        pipeline: [],
        dateRange: { from: '2026-03-15', to: '2026-03-19' },
        committees: [],
        documents: [],
        questions: [],
      };
      expect(buildProspectiveMindmap(weekData)).not.toBeNull();
    });
  });

  describe('buildBreakingMindmap', () => {
    it('should handle undefined feed data', () => {
      const imap = buildBreakingMindmap(undefined);
      expect(imap).not.toBeNull();
      expect(imap.centralTopic).toBe('Breaking News Intelligence');
    });

    it('should build a mindmap from breaking news feed data', () => {
      const feedData = {
        adoptedTexts: [
          { title: 'Resolution on Climate', date: '2026-03-12', url: 'https://ep.eu/1' },
        ],
        events: [
          { title: 'Plenary vote', date: '2026-03-12', url: 'https://ep.eu/2' },
        ],
        procedures: [
          { title: 'Digital Infrastructure Act', date: '2026-03-12', url: 'https://ep.eu/3' },
        ],
        mepUpdates: [
          { id: '1', name: 'Alice Muster', date: '2026-03-12' },
        ],
      };

      const imap = buildBreakingMindmap(feedData);

      expect(imap.centralTopic).toBe('Breaking News Intelligence');
      expect(imap.layers[0].nodes.length).toBeGreaterThan(0);
      expect(imap.actorNetwork.length).toBeGreaterThan(0);
      expect(imap.summary).toContain('feed items');
    });

    it('should include connections between related categories', () => {
      const feedData = {
        adoptedTexts: [{ title: 'Act 1', date: '2026-03-12', url: 'https://ep.eu/1' }],
        events: [],
        procedures: [{ title: 'Proc 1', date: '2026-03-12', url: 'https://ep.eu/2' }],
        mepUpdates: [],
      };

      const imap = buildBreakingMindmap(feedData);
      expect(imap.connections.length).toBeGreaterThan(0);
    });
  });

  describe('buildPropositionsMindmap', () => {
    it('should handle null pipeline data', () => {
      const imap = buildPropositionsMindmap(null);
      expect(imap).not.toBeNull();
      expect(imap.centralTopic).toBe('Legislative Pipeline Intelligence');
      expect(imap.summary).toContain('0%');
    });

    it('should build a mindmap with pipeline stage nodes', () => {
      const imap = buildPropositionsMindmap({ healthScore: 0.75, throughput: 8 });

      expect(imap.centralTopic).toBe('Legislative Pipeline Intelligence');
      expect(imap.layers[0].nodes.length).toBe(5);
      expect(imap.connections.length).toBe(4);
      expect(imap.actorNetwork.length).toBe(3);
      expect(imap.summary).toContain('75%');
    });

    it('should mark plenary node green for high health score', () => {
      const imap = buildPropositionsMindmap({ healthScore: 0.8, throughput: 10 });
      const plenaryNode = imap.layers[0].nodes.find((n) => n.id === 'plenary');
      expect(plenaryNode?.color).toBe('green');
    });

    it('should mark plenary node red for low health score', () => {
      const imap = buildPropositionsMindmap({ healthScore: 0.2, throughput: 2 });
      const plenaryNode = imap.layers[0].nodes.find((n) => n.id === 'plenary');
      expect(plenaryNode?.color).toBe('red');
    });

    it('should include all 5 pipeline stage nodes', () => {
      const imap = buildPropositionsMindmap({ healthScore: 0.6, throughput: 5 });
      const nodeIds = imap.layers[0].nodes.map((n) => n.id);
      expect(nodeIds).toContain('proposal');
      expect(nodeIds).toContain('committee');
      expect(nodeIds).toContain('plenary');
      expect(nodeIds).toContain('trilogue');
      expect(nodeIds).toContain('adoption');
    });
  });

  describe('buildCommitteeMindmap', () => {
    it('should return null when all data is placeholder', () => {
      // Placeholder data per committee-helpers
      const result = buildCommitteeMindmap([]);
      expect(result).toBeNull();
    });

    it('should return null when no committees are active', () => {
      const result = buildCommitteeMindmap([
        { abbreviation: 'ENVI', name: 'Environment', documents: [] },
        { abbreviation: 'ECON', name: 'Economy', documents: [] },
      ]);
      expect(result).toBeNull();
    });

    it('should build a mindmap from committee data', () => {
      const committees = [
        {
          abbreviation: 'ENVI',
          name: 'Committee on the Environment',
          documents: [
            { title: 'Climate report', date: '2026-03-10', url: 'https://ep.eu/doc1' },
            { title: 'Biodiversity study', date: '2026-03-11', url: 'https://ep.eu/doc2' },
          ],
        },
        {
          abbreviation: 'ECON',
          name: 'Committee on Economic Affairs',
          documents: [
            { title: 'Banking regulation', date: '2026-03-10', url: 'https://ep.eu/doc3' },
          ],
        },
      ];

      const imap = buildCommitteeMindmap(committees);

      expect(imap).not.toBeNull();
      expect(imap.centralTopic).toBe('Committee Intelligence Network');
      expect(imap.layers[0].nodes.length).toBe(2);
      expect(imap.summary).toContain('2 active committees');
      expect(imap.summary).toContain('3 documents');
      expect(imap.actorNetwork.length).toBeGreaterThan(0);
    });

    it('should include inter-committee connections', () => {
      const committees = [
        {
          abbreviation: 'ENVI',
          name: 'Environment',
          documents: [{ title: 'Doc 1', date: '2026-03-10', url: 'https://ep.eu/1' }],
        },
        {
          abbreviation: 'AGRI',
          name: 'Agriculture',
          documents: [{ title: 'Doc 2', date: '2026-03-10', url: 'https://ep.eu/2' }],
        },
        {
          abbreviation: 'ITRE',
          name: 'Industry',
          documents: [{ title: 'Doc 3', date: '2026-03-10', url: 'https://ep.eu/3' }],
        },
      ];

      const imap = buildCommitteeMindmap(committees);
      expect(imap).not.toBeNull();
      expect(imap.connections.length).toBeGreaterThan(0);
    });
  });
});

