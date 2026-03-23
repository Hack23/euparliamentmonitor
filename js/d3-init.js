// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * D3.js hydration script for EU Parliament Monitor visualisations.
 *
 * Progressively enhances mindmap containers and SWOT matrices with
 * interactive D3 treemap and force-directed graph visualisations.
 *
 * Elements targeted:
 *   - `.mindmap-container` — rendered as a D3 treemap
 *   - `.intelligence-map`  — rendered as a D3 force-directed network
 *   - `.swot-matrix`       — enhanced with proportional D3 quadrant sizing
 *
 * Dependencies (loaded before this script):
 *   - D3.js UMD bundle (js/vendor/d3.min.js)
 */

(function () {
  'use strict';

  /* ── EU Parliament color palette (shared with chart-init) ────────── */

  var EU_COLORS = {
    blue: '#003399',
    gold: '#FFD700',
    red: '#E63946',
    teal: '#2A9D8F',
    purple: '#6A4C93',
    coral: '#E76F51',
    darkTeal: '#264653',
    sandy: '#F4A261',
    steel: '#457B9D',
    lightTeal: '#A8DADC',
  };

  var BRANCH_PALETTE = [
    EU_COLORS.blue,
    EU_COLORS.teal,
    EU_COLORS.coral,
    EU_COLORS.purple,
    EU_COLORS.sandy,
    EU_COLORS.steel,
    EU_COLORS.red,
    EU_COLORS.darkTeal,
  ];

  var SWOT_COLORS = {
    strengths: '#2A9D8F',
    weaknesses: '#E63946',
    opportunities: '#003399',
    threats: '#E76F51',
  };

  /* ── Utility ─────────────────────────────────────────────────────── */

  /** Safe text extraction from element */
  function textOf(el) {
    return (el && el.textContent) ? el.textContent.trim() : '';
  }

  /** Create an SVG container inside a parent element */
  function createSVGContainer(parent, width, height, className) {
    var svg = d3
      .select(parent)
      .append('svg')
      .attr('class', className)
      .attr('role', 'img')
      .attr('aria-label', textOf(parent.closest('section')?.querySelector('h2')))
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .style('max-width', '100%')
      .style('height', 'auto');
    return svg;
  }

  /* ── Mindmap → D3 Treemap ────────────────────────────────────────── */

  /**
   * Extract mindmap data from the CSS-only mindmap DOM and build a
   * hierarchical data structure suitable for d3.treemap().
   */
  function extractMindmapData(container) {
    var center = container.querySelector('.mindmap-center');
    var topic = textOf(center);
    var branches = container.querySelectorAll('.mindmap-branches > li');
    var children = [];

    for (var i = 0; i < branches.length; i++) {
      var branchNode = branches[i].querySelector('.mindmap-branch');
      var label = textOf(branchNode);
      var leafList = branches[i].querySelector('.mindmap-leaves');
      var leaves = leafList ? leafList.querySelectorAll('li') : [];
      var branchChildren = [];

      for (var j = 0; j < leaves.length; j++) {
        branchChildren.push({
          name: textOf(leaves[j]),
          value: 1,
        });
      }

      children.push({
        name: label,
        children: branchChildren.length > 0 ? branchChildren : [{ name: label, value: 1 }],
      });
    }

    return { name: topic, children: children };
  }

  /**
   * Render a D3 treemap visualisation for a mindmap container.
   */
  function renderMindmapTreemap(container) {
    var data = extractMindmapData(container);
    if (!data.children || data.children.length === 0) return;

    var width = Math.min(container.clientWidth || 600, 800);
    var height = Math.round(width * 0.6);

    // Reuse existing container to avoid duplicating content for assistive technologies
    var wrapper = container;
    while (wrapper.firstChild) {
      wrapper.removeChild(wrapper.firstChild);
    }
    if (wrapper.className.indexOf('d3-treemap-wrapper') === -1) {
      wrapper.className += (wrapper.className ? ' ' : '') + 'd3-treemap-wrapper';
    }
    wrapper.setAttribute('role', 'figure');
    wrapper.setAttribute('aria-label', data.name + ' — Treemap');

    var svg = createSVGContainer(wrapper, width, height, 'd3-treemap');

    var root = d3
      .hierarchy(data)
      .sum(function (d) { return d.value || 0; })
      .sort(function (a, b) { return (b.value || 0) - (a.value || 0); });

    d3.treemap()
      .size([width, height])
      .padding(2)
      .round(true)(root);

    var branchIndex = {};
    var idx = 0;
    root.children?.forEach(function (c) {
      branchIndex[c.data.name] = idx++;
    });

    var cell = svg
      .selectAll('g')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('transform', function (d) { return 'translate(' + d.x0 + ',' + d.y0 + ')'; });

    cell
      .append('rect')
      .attr('width', function (d) { return Math.max(0, d.x1 - d.x0); })
      .attr('height', function (d) { return Math.max(0, d.y1 - d.y0); })
      .attr('fill', function (d) {
        var parent = d.parent;
        var name = parent ? parent.data.name : d.data.name;
        var ci = branchIndex[name] !== undefined ? branchIndex[name] : 0;
        return BRANCH_PALETTE[ci % BRANCH_PALETTE.length];
      })
      .attr('fill-opacity', 0.75)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .append('title')
      .text(function (d) { return d.data.name; });

    cell
      .append('text')
      .attr('x', 4)
      .attr('y', 14)
      .attr('fill', '#fff')
      .attr('font-size', '11px')
      .attr('font-family', "'Segoe UI', system-ui, sans-serif")
      .text(function (d) {
        var w = d.x1 - d.x0;
        var name = d.data.name || '';
        var maxChars = Math.floor(w / 6.5);
        return name.length > maxChars ? name.slice(0, Math.max(0, maxChars - 1)) + '\u2026' : name;
      });
  }

  /* ── Intelligence Mindmap → D3 Force Network ─────────────────────── */

  /**
   * Extract nodes and links from the intelligence mindmap DOM for
   * a force-directed network visualisation.
   */
  function extractNetworkData(container) {
    var nodes = [];
    var links = [];
    var nodeMap = {};

    /* Central node */
    var center = container.querySelector('.mindmap-center');
    var centralId = 'center';
    var centralLabel = textOf(center);
    nodes.push({ id: centralId, label: centralLabel, group: 'center', radius: 20 });
    nodeMap[centralId] = true;

    /* Domain nodes (depth-1 branches) */
    var branchItems = container.querySelectorAll('.mindmap-layer-1 > li');
    for (var i = 0; i < branchItems.length; i++) {
      var nodeEl = branchItems[i].querySelector('.intelligence-node');
      var label = textOf(nodeEl?.querySelector('.node-label'));
      var nodeId = 'domain-' + i;
      nodes.push({ id: nodeId, label: label, group: 'domain', radius: 14 });
      nodeMap[nodeId] = true;
      links.push({ source: centralId, target: nodeId, strength: 0.8 });

      /* Sub-nodes */
      var subNodes = branchItems[i].querySelectorAll('.intelligence-children .intelligence-node');
      for (var j = 0; j < subNodes.length; j++) {
        var subLabel = textOf(subNodes[j].querySelector('.node-label'));
        var subId = nodeId + '-sub-' + j;
        nodes.push({ id: subId, label: subLabel, group: 'sub', radius: 8 });
        nodeMap[subId] = true;
        links.push({ source: nodeId, target: subId, strength: 0.5 });
      }
    }

    /* Actor network nodes */
    var actors = container.querySelectorAll('.actor-card');
    for (var k = 0; k < actors.length; k++) {
      var actorName = textOf(actors[k].querySelector('.actor-name'));
      var actorId = 'actor-' + k;
      if (!nodeMap[actorId]) {
        nodes.push({ id: actorId, label: actorName, group: 'actor', radius: 10 });
        nodeMap[actorId] = true;
        /* Connect actors to the closest domain */
        if (nodes.length > 1) {
          links.push({ source: centralId, target: actorId, strength: 0.3 });
        }
      }
    }

    return { nodes: nodes, links: links };
  }

  /**
   * Render a D3 force-directed network for an intelligence mindmap.
   */
  function renderForceNetwork(container) {
    var data = extractNetworkData(container);
    if (data.nodes.length < 2) return;

    var width = Math.min(container.clientWidth || 600, 800);
    var height = Math.round(width * 0.65);

    // Reuse existing container to avoid duplicating content for assistive technologies
    var wrapper = container;
    while (wrapper.firstChild) {
      wrapper.removeChild(wrapper.firstChild);
    }
    if (wrapper.className.indexOf('d3-network-wrapper') === -1) {
      wrapper.className += (wrapper.className ? ' ' : '') + 'd3-network-wrapper';
    }
    wrapper.setAttribute('role', 'figure');
    wrapper.setAttribute('aria-label', (data.nodes[0]?.label || 'Network') + ' — Force Network');

    var svg = createSVGContainer(wrapper, width, height, 'd3-network');

    var groupColors = {
      center: EU_COLORS.blue,
      domain: EU_COLORS.teal,
      sub: EU_COLORS.steel,
      actor: EU_COLORS.coral,
    };

    var simulation = d3
      .forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id(function (d) { return d.id; }).distance(60))
      .force('charge', d3.forceManyBody().strength(-120))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(function (d) { return d.radius + 4; }));

    var link = svg
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(data.links)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', function (d) { return Math.max(1, d.strength * 3); });

    var node = svg
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(data.nodes)
      .enter()
      .append('g');

    node
      .append('circle')
      .attr('r', function (d) { return d.radius; })
      .attr('fill', function (d) { return groupColors[d.group] || EU_COLORS.blue; })
      .attr('fill-opacity', 0.85)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

    node
      .append('text')
      .attr('dy', function (d) { return d.radius + 12; })
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-family', "'Segoe UI', system-ui, sans-serif")
      .attr('fill', '#333')
      .text(function (d) {
        var label = d.label || '';
        return label.length > 18 ? label.slice(0, 17) + '\u2026' : label;
      });

    node.append('title').text(function (d) { return d.label; });

    simulation.on('tick', function () {
      link
        .attr('x1', function (d) { return d.source.x; })
        .attr('y1', function (d) { return d.source.y; })
        .attr('x2', function (d) { return d.target.x; })
        .attr('y2', function (d) { return d.target.y; });

      node.attr('transform', function (d) {
        var x = Math.max(d.radius, Math.min(width - d.radius, d.x));
        var y = Math.max(d.radius, Math.min(height - d.radius, d.y));
        d.x = x;
        d.y = y;
        return 'translate(' + x + ',' + y + ')';
      });
    });
  }

  /* ── SWOT Matrix → D3 Proportional Quadrant ──────────────────────── */

  /**
   * Enhance a SWOT matrix with a proportional D3 bar chart showing
   * the relative number of items in each quadrant.
   */
  function renderSwotChart(matrix) {
    var quadrants = matrix.querySelectorAll('.swot-quadrant');
    var swotData = [];
    var quadrantKeys = ['strengths', 'weaknesses', 'opportunities', 'threats'];

    for (var i = 0; i < quadrants.length; i++) {
      var items = quadrants[i].querySelectorAll('.swot-list li');
      var heading = textOf(quadrants[i].querySelector('h3'));
      swotData.push({
        label: heading || quadrantKeys[i] || 'Q' + (i + 1),
        count: items.length,
        key: quadrantKeys[i] || 'unknown',
      });
    }

    if (swotData.every(function (d) { return d.count === 0; })) return;

    var section = matrix.closest('.swot-section');
    if (!section) return;

    var width = Math.min(section.clientWidth || 500, 600);
    var height = 180;
    var margin = { top: 20, right: 20, bottom: 35, left: 100 };
    var innerW = width - margin.left - margin.right;
    var innerH = height - margin.top - margin.bottom;

    // Reuse existing matrix container to avoid duplicating content for assistive technologies
    var wrapper = matrix;
    while (wrapper.firstChild) {
      wrapper.removeChild(wrapper.firstChild);
    }
    if (wrapper.className.indexOf('d3-swot-chart-wrapper') === -1) {
      wrapper.className += (wrapper.className ? ' ' : '') + 'd3-swot-chart-wrapper';
    }
    wrapper.setAttribute('role', 'figure');
    wrapper.setAttribute('aria-label', 'SWOT Analysis Distribution');

    var svg = createSVGContainer(wrapper, width, height, 'd3-swot-chart');

    var g = svg
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var y = d3
      .scaleBand()
      .domain(swotData.map(function (d) { return d.label; }))
      .range([0, innerH])
      .padding(0.3);

    var x = d3
      .scaleLinear()
      .domain([0, d3.max(swotData, function (d) { return d.count; }) || 1])
      .range([0, innerW]);

    g.selectAll('rect')
      .data(swotData)
      .enter()
      .append('rect')
      .attr('y', function (d) { return y(d.label); })
      .attr('x', 0)
      .attr('width', function (d) { return x(d.count); })
      .attr('height', y.bandwidth())
      .attr('fill', function (d) { return SWOT_COLORS[d.key] || EU_COLORS.steel; })
      .attr('fill-opacity', 0.8)
      .attr('rx', 3);

    g.selectAll('.bar-label')
      .data(swotData)
      .enter()
      .append('text')
      .attr('x', function (d) { return x(d.count) + 6; })
      .attr('y', function (d) { return y(d.label) + y.bandwidth() / 2 + 4; })
      .attr('font-size', '12px')
      .attr('font-family', "'Segoe UI', system-ui, sans-serif")
      .attr('fill', '#333')
      .text(function (d) { return d.count; });

    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y).tickSize(0).tickPadding(8))
      .select('.domain')
      .remove();

    g.selectAll('.y-axis text')
      .attr('font-size', '11px')
      .attr('fill', '#555');
  }

  /* ── Bootstrap ───────────────────────────────────────────────────── */

  function hydrateD3Visualisations() {
    if (typeof d3 === 'undefined') return;

    /* Standard mindmaps → treemap */
    var mindmaps = document.querySelectorAll(
      '.mindmap-container:not(.intelligence-map)'
    );
    for (var i = 0; i < mindmaps.length; i++) {
      try {
        renderMindmapTreemap(mindmaps[i]);
      } catch (e) {
        if (typeof console !== 'undefined' && console.warn) {
          console.warn('[d3-init] treemap error:', e);
        }
      }
    }

    /* Intelligence mindmaps → force network */
    var networks = document.querySelectorAll('.intelligence-map');
    for (var j = 0; j < networks.length; j++) {
      try {
        renderForceNetwork(networks[j]);
      } catch (e) {
        if (typeof console !== 'undefined' && console.warn) {
          console.warn('[d3-init] network error:', e);
        }
      }
    }

    /* SWOT matrices → proportional chart */
    var swots = document.querySelectorAll('.swot-matrix');
    for (var k = 0; k < swots.length; k++) {
      try {
        renderSwotChart(swots[k]);
      } catch (e) {
        if (typeof console !== 'undefined' && console.warn) {
          console.warn('[d3-init] swot chart error:', e);
        }
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrateD3Visualisations);
  } else {
    hydrateD3Visualisations();
  }
})();
