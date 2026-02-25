// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Test fixtures for EU Parliament data
 * Mock data for testing article generation
 */

/**
 * Sample plenary session data
 */
export const mockPlenarySession = {
  id: 'PV-2025-01-20',
  date: '2025-01-20',
  title: 'Plenary Session - January 2025',
  location: 'Strasbourg',
  agenda: [
    {
      id: 'AGENDA-001',
      title: 'Climate Policy Discussion',
      type: 'debate',
      duration: 120,
      speakers: [
        { name: 'Maria Silva', group: 'S&D', country: 'PT' },
        { name: 'Hans Schmidt', group: 'EPP', country: 'DE' },
      ],
    },
    {
      id: 'AGENDA-002',
      title: 'Digital Services Act Amendment',
      type: 'vote',
      duration: 45,
      expectedResult: 'passage',
    },
  ],
};

/**
 * Sample parliamentary questions
 */
export const mockParliamentaryQuestions = {
  questions: [
    {
      id: 'E-000123/2025',
      type: 'written',
      author: 'Sophie Dubois',
      country: 'FR',
      group: 'Renew',
      subject: 'AI Regulation Implementation',
      date: '2025-01-10',
      text: 'What measures is the Commission taking to ensure proper implementation of the AI Act?',
    },
    {
      id: 'O-000456/2025',
      type: 'oral',
      author: 'Marco Rossi',
      country: 'IT',
      group: 'EPP',
      subject: 'Migration Policy',
      date: '2025-01-12',
      text: 'How will the new migration pact address border security concerns?',
    },
  ],
};

/**
 * Sample legislative documents
 */
export const mockDocuments = {
  documents: [
    {
      id: 'COM(2025)001',
      type: 'proposal',
      title: 'Proposal for a Regulation on Sustainable Finance',
      date: '2025-01-08',
      status: 'under_review',
      committee: 'ECON',
      rapporteur: 'Anna Kowalski',
    },
    {
      id: 'A9-0001/2025',
      type: 'report',
      title: 'Report on Digital Euro',
      date: '2025-01-10',
      status: 'voted',
      committee: 'ECON',
      rapporteur: 'Lars Andersen',
    },
  ],
};

/**
 * Sample MEPs data
 */
export const mockMEPs = [
  {
    id: 'MEP-001',
    name: 'Maria Silva',
    country: 'PT',
    group: 'S&D',
    committees: ['ENVI', 'ITRE'],
    email: 'maria.silva@europarl.europa.eu',
  },
  {
    id: 'MEP-002',
    name: 'Hans Schmidt',
    country: 'DE',
    group: 'EPP',
    committees: ['ECON', 'BUDG'],
    email: 'hans.schmidt@europarl.europa.eu',
  },
];

/**
 * Sample committee meeting data
 */
export const mockCommitteeMeeting = {
  id: 'ENVI-2025-01-18',
  committee: 'ENVI',
  committeeName: 'Environment, Public Health and Food Safety',
  date: '2025-01-18',
  time: '09:00',
  location: 'Brussels',
  agenda: [
    {
      item: 1,
      title: 'Emissions Trading System Reform',
      type: 'discussion',
      documents: ['COM(2024)999'],
    },
    {
      item: 2,
      title: 'Plastic Waste Reduction',
      type: 'vote',
      documents: ['A9-0099/2024'],
    },
  ],
};

/**
 * Sample article metadata
 */
export const mockArticleMetadata = {
  slug: 'week-ahead-january-2025',
  title: 'European Parliament Week Ahead: January 20-24, 2025',
  subtitle: 'Key debates on climate policy and digital services regulation',
  date: '2025-01-15',
  category: 'week-ahead',
  readTime: 5,
  lang: 'en',
  keywords: ['plenary', 'climate', 'digital services', 'legislation'],
};

/**
 * Sample article content (HTML)
 */
export const mockArticleContent = `
<section class="article-content">
  <h2>This Week in the European Parliament</h2>
  <p>The European Parliament convenes this week for a pivotal plenary session in Strasbourg, with climate policy and digital regulation taking center stage.</p>
  
  <h3>Climate Policy Debate</h3>
  <p>MEPs will engage in a comprehensive debate on the future of EU climate policy, focusing on the implementation of the European Green Deal and carbon pricing mechanisms.</p>
  
  <h3>Digital Services Act</h3>
  <p>A crucial vote on amendments to the Digital Services Act is expected, with implications for online platform regulation across the EU.</p>
</section>
`;

/**
 * Sample sources
 */
export const mockSources = [
  {
    title: 'European Parliament Official Agenda',
    url: 'https://www.europarl.europa.eu/plenary/en/agendas.html',
  },
  {
    title: 'Committee on Environment, Public Health and Food Safety',
    url: 'https://www.europarl.europa.eu/committees/en/envi/home',
  },
];

// ─── Article strategy fixtures ────────────────────────────────────────────────

const STRATEGY_DATE = '2025-01-15';

/** Minimal WeekAheadArticleData fixture */
export const weekAheadData = {
  date: STRATEGY_DATE,
  dateRange: { start: '2025-01-16', end: '2025-01-23' },
  weekData: {
    events: [{ date: '2025-01-16', title: 'Plenary Session', type: 'Plenary', description: '' }],
    committees: [],
    documents: [],
    pipeline: [],
    questions: [],
  },
  keywords: ['European Parliament', 'plenary'],
};

/** WeekAheadArticleData fixture with a bottlenecked pipeline procedure */
export const weekAheadDataWithPipeline = {
  ...weekAheadData,
  weekData: {
    ...weekAheadData.weekData,
    pipeline: [{ title: 'Climate Regulation', stage: 'committee', bottleneck: true }],
  },
};

/** Minimal BreakingNewsArticleData fixture */
export const breakingNewsData = {
  date: STRATEGY_DATE,
  anomalyRaw: 'EPP defection detected',
  coalitionRaw: 'Coalition stress rising',
  reportRaw: 'High abstention rate',
};

/** Minimal CommitteeReportsArticleData fixture */
export const committeeReportsData = {
  date: STRATEGY_DATE,
  committeeDataList: [
    {
      name: 'Environment Committee',
      abbreviation: 'ENVI',
      chair: 'Jane Doe',
      members: 42,
      documents: [{ title: 'Draft Report', type: 'REPORT', date: '2025-01-10' }],
      effectiveness: '85 / Rank 2',
    },
  ],
};

/** Minimal PropositionsArticleData fixture */
export const propositionsData = {
  date: STRATEGY_DATE,
  proposalsHtml: '<div class="proposal-card"><h3>Green Deal Directive</h3></div>',
  pipelineData: { healthScore: 0.85, throughput: 12, procRowsHtml: '' },
  procedureHtml: '',
};

/** Minimal MotionsArticleData fixture */
export const motionsData = {
  date: STRATEGY_DATE,
  dateFromStr: '2024-12-16',
  votingRecords: [
    {
      title: 'Budget 2025',
      date: STRATEGY_DATE,
      result: 'Adopted',
      votes: { for: 400, against: 100, abstain: 50 },
    },
  ],
  votingPatterns: [{ group: 'EPP', cohesion: 0.9, participation: 0.95 }],
  anomalies: [{ type: 'Defection', description: 'EPP defection', severity: 'HIGH' }],
  questions: [
    { author: 'MEP Smith', topic: 'Energy policy', date: STRATEGY_DATE, status: 'PENDING' },
  ],
};
