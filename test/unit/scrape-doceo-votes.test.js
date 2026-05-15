// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for scripts/scrape-doceo-votes.js
 *
 * Mocks `fetch` via the `fetchImpl` injection option so the tests are
 * network-free and deterministic. Covers:
 * - URL construction (buildDoceoUrl)
 * - XML parsing (parseDoceoXml)
 * - Retry behavior (fetchWithRetry)
 * - Publication-lag detection (404 → publicationLag=true)
 * - Full scrapeDoceoVotes flow (success, 404, network error)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  buildDoceoUrl,
  parseDoceoXml,
  fetchWithRetry,
  scrapeDoceoVotes,
} from '../../scripts/scrape-doceo-votes.js';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

/** Minimal DOCEO RCV XML with one vote block. */
const MINIMAL_RCV_XML = `<?xml version="1.0" encoding="UTF-8"?>
<RollCallVote.Results>
  <RollCallVote.Result Identifier="P10-RCV-2026-05-14-001" Method="Roll" Date="2026-05-14">
    <RollCallVote.Description.Text>Proposal on the Digital Markets Act</RollCallVote.Description.Text>
    <Result.For Total="423">
      <PoliticalGroup.Vote Identifier="EPP">
        <politicalGroup identifier="EPP">
          <Member.Name FontSize="7" Id="124810">Weber Manfred</Member.Name>
          <Member.Name FontSize="7" Id="124811">Hohlmeier Monika</Member.Name>
        </politicalGroup>
      </PoliticalGroup.Vote>
    </Result.For>
    <Result.Against Total="180">
      <PoliticalGroup.Vote Identifier="ID">
        <politicalGroup identifier="ID">
          <Member.Name FontSize="7" Id="987654">Le Pen Marine</Member.Name>
        </politicalGroup>
      </PoliticalGroup.Vote>
    </Result.Against>
    <Result.Abstention Total="25">
    </Result.Abstention>
  </RollCallVote.Result>
  <RollCallVote.Result Identifier="P10-RCV-2026-05-14-002" Method="Roll" Date="2026-05-14">
    <RollCallVote.Description.Text>Amendment 47 to the AI Act</RollCallVote.Description.Text>
    <Result.For Total="300">
    </Result.For>
    <Result.Against Total="200">
    </Result.Against>
    <Result.Abstention Total="50">
    </Result.Abstention>
  </RollCallVote.Result>
</RollCallVote.Results>`;

/** Build a mock fetch function that returns the given status and body. */
function mockFetch(body, status = 200) {
  return async () => ({
    ok: status >= 200 && status < 300,
    status,
    async text() {
      return body;
    },
  });
}

/** Build a mock fetch that fails on the first N attempts then succeeds. */
function mockFetchWithInitialFailures(successBody, failCount) {
  let callCount = 0;
  return async () => {
    callCount += 1;
    if (callCount <= failCount) {
      throw new Error('Network error (simulated)');
    }
    return {
      ok: true,
      status: 200,
      async text() {
        return successBody;
      },
    };
  };
}

// ---------------------------------------------------------------------------
// buildDoceoUrl
// ---------------------------------------------------------------------------

describe('buildDoceoUrl', () => {
  it('builds the correct URL for term 10 (default)', () => {
    const url = buildDoceoUrl('2026-05-14');
    expect(url).toBe(
      'https://www.europarl.europa.eu/doceo/document/PV-10-2026-05-14-RCV_EN.xml',
    );
  });

  it('builds the correct URL for an explicit term', () => {
    const url = buildDoceoUrl('2022-03-15', 9);
    expect(url).toBe(
      'https://www.europarl.europa.eu/doceo/document/PV-9-2022-03-15-RCV_EN.xml',
    );
  });
});

// ---------------------------------------------------------------------------
// parseDoceoXml
// ---------------------------------------------------------------------------

describe('parseDoceoXml', () => {
  it('parses two vote blocks from minimal XML', () => {
    const result = parseDoceoXml(MINIMAL_RCV_XML);
    expect(result.voteCount).toBe(2);
    expect(result.votes).toHaveLength(2);
    expect(result.parsedAt).toBeTruthy();
  });

  it('extracts vote description correctly', () => {
    const result = parseDoceoXml(MINIMAL_RCV_XML);
    expect(result.votes[0].description).toBe('Proposal on the Digital Markets Act');
  });

  it('extracts vote id from Identifier attribute', () => {
    const result = parseDoceoXml(MINIMAL_RCV_XML);
    expect(result.votes[0].id).toBe('P10-RCV-2026-05-14-001');
  });

  it('extracts For/Against/Abstention totals', () => {
    const result = parseDoceoXml(MINIMAL_RCV_XML);
    const vote = result.votes[0];
    expect(vote.for).toBe(423);
    expect(vote.against).toBe(180);
    expect(vote.abstention).toBe(25);
  });

  it('extracts MEP names from For section', () => {
    const result = parseDoceoXml(MINIMAL_RCV_XML);
    expect(result.votes[0].membersFor).toContain('Weber Manfred');
    expect(result.votes[0].membersFor).toContain('Hohlmeier Monika');
  });

  it('extracts MEP names from Against section', () => {
    const result = parseDoceoXml(MINIMAL_RCV_XML);
    expect(result.votes[0].membersAgainst).toContain('Le Pen Marine');
  });

  it('returns voteCount:0 for empty XML', () => {
    const result = parseDoceoXml('');
    expect(result.voteCount).toBe(0);
    expect(result.votes).toHaveLength(0);
  });

  it('handles XML with no members in Abstention gracefully', () => {
    const result = parseDoceoXml(MINIMAL_RCV_XML);
    expect(result.votes[0].membersAbstention).toEqual([]);
  });

  it('extracts date and method attributes', () => {
    const result = parseDoceoXml(MINIMAL_RCV_XML);
    expect(result.votes[0].date).toBe('2026-05-14');
    expect(result.votes[0].method).toBe('Roll');
  });

  it('tolerates whitespace (newline) after the RollCallVote.Result tag name', () => {
    // Valid XML can split attributes across lines.
    const xml = `<?xml version="1.0"?>
<RollCallVote.Results>
  <RollCallVote.Result
    Identifier="P10-RCV-2026-05-14-099"
    Method="Roll"
    Date="2026-05-14">
    <RollCallVote.Description.Text>Multi-line opening tag</RollCallVote.Description.Text>
    <Result.For Total="100"></Result.For>
    <Result.Against Total="50"></Result.Against>
    <Result.Abstention Total="10"></Result.Abstention>
  </RollCallVote.Result>
</RollCallVote.Results>`;
    const result = parseDoceoXml(xml);
    expect(result.voteCount).toBe(1);
    expect(result.votes[0].id).toBe('P10-RCV-2026-05-14-099');
    expect(result.votes[0].for).toBe(100);
  });

  it('accepts both single- and double-quoted XML attributes', () => {
    const xml = `<?xml version="1.0"?>
<RollCallVote.Results>
  <RollCallVote.Result Identifier='P10-SQ-001' Method='Roll' Date='2026-05-14'>
    <RollCallVote.Description.Text>Single-quoted attrs</RollCallVote.Description.Text>
    <Result.For Total='42'></Result.For>
    <Result.Against Total="17"></Result.Against>
    <Result.Abstention Total='3'></Result.Abstention>
  </RollCallVote.Result>
</RollCallVote.Results>`;
    const result = parseDoceoXml(xml);
    expect(result.voteCount).toBe(1);
    expect(result.votes[0].id).toBe('P10-SQ-001');
    expect(result.votes[0].method).toBe('Roll');
    expect(result.votes[0].for).toBe(42);
    expect(result.votes[0].against).toBe(17);
    expect(result.votes[0].abstention).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// fetchWithRetry
// ---------------------------------------------------------------------------

describe('fetchWithRetry', () => {
  it('returns ok result on first attempt', async () => {
    const result = await fetchWithRetry('https://example.com/test.xml', {
      fetchImpl: mockFetch(MINIMAL_RCV_XML, 200),
      maxRetries: 3,
      baseDelayMs: 0,
    });
    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
    expect(result.text).toBe(MINIMAL_RCV_XML);
    expect(result.publicationLag).toBe(false);
  });

  it('returns publicationLag=true on 404 without retry', async () => {
    const result = await fetchWithRetry('https://example.com/missing.xml', {
      fetchImpl: mockFetch('', 404),
      maxRetries: 3,
      baseDelayMs: 0,
    });
    expect(result.ok).toBe(false);
    expect(result.publicationLag).toBe(true);
    expect(result.status).toBe(404);
  });

  it('retries on network error and succeeds on third attempt', async () => {
    const result = await fetchWithRetry('https://example.com/test.xml', {
      fetchImpl: mockFetchWithInitialFailures(MINIMAL_RCV_XML, 2),
      maxRetries: 3,
      baseDelayMs: 0,
    });
    expect(result.ok).toBe(true);
    expect(result.publicationLag).toBe(false);
  });

  it('throws after maxRetries exhausted', async () => {
    const alwaysFails = async () => {
      throw new Error('Always fails');
    };
    await expect(
      fetchWithRetry('https://example.com/test.xml', {
        fetchImpl: alwaysFails,
        maxRetries: 2,
        baseDelayMs: 0,
      }),
    ).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// scrapeDoceoVotes — integration
// ---------------------------------------------------------------------------

describe('scrapeDoceoVotes', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scrape-doceo-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writes roll-call-votes.json on success', async () => {
    const result = await scrapeDoceoVotes({
      date: '2026-05-14',
      outputDir: tmpDir,
      fetchImpl: mockFetch(MINIMAL_RCV_XML, 200),
      rateLimitMs: 0,
    });

    expect(result.success).toBe(true);
    expect(result.publicationLag).toBe(false);
    expect(result.voteCount).toBe(2);
    expect(result.outputFile).toBeTruthy();

    const written = JSON.parse(fs.readFileSync(result.outputFile, 'utf8'));
    expect(written.voteCount).toBe(2);
    expect(written.votes).toHaveLength(2);
    expect(written.publicationLag).toBe(false);
    expect(written.date).toBe('2026-05-14');
  });

  it('returns publicationLag=true on 404 without creating file', async () => {
    const result = await scrapeDoceoVotes({
      date: '2026-05-15',
      outputDir: tmpDir,
      fetchImpl: mockFetch('', 404),
      rateLimitMs: 0,
    });

    expect(result.success).toBe(false);
    expect(result.publicationLag).toBe(true);
    expect(result.voteCount).toBe(0);
    expect(result.outputFile).toBeNull();
  });

  it('returns error on network failure', async () => {
    const result = await scrapeDoceoVotes({
      date: '2026-05-14',
      outputDir: tmpDir,
      fetchImpl: async () => {
        throw new Error('DNS failure');
      },
      rateLimitMs: 0,
      retryBaseDelayMs: 0,
    });

    expect(result.success).toBe(false);
    expect(result.publicationLag).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('dry-run does not write file but returns correct voteCount', async () => {
    const result = await scrapeDoceoVotes({
      date: '2026-05-14',
      outputDir: tmpDir,
      fetchImpl: mockFetch(MINIMAL_RCV_XML, 200),
      dryRun: true,
      rateLimitMs: 0,
    });

    expect(result.success).toBe(true);
    expect(result.outputFile).toBeNull();
    expect(result.voteCount).toBe(2);

    const files = fs.readdirSync(tmpDir);
    expect(files).not.toContain('roll-call-votes.json');
  });

  it('creates outputDir when it does not exist', async () => {
    const nestedDir = path.join(tmpDir, 'deep', 'nested', 'dir');
    const result = await scrapeDoceoVotes({
      date: '2026-05-14',
      outputDir: nestedDir,
      fetchImpl: mockFetch(MINIMAL_RCV_XML, 200),
      rateLimitMs: 0,
    });

    expect(result.success).toBe(true);
    expect(fs.existsSync(nestedDir)).toBe(true);
  });

  it('uses default term 10 in URL', async () => {
    let capturedUrl = '';
    const capturingFetch = async (url) => {
      capturedUrl = url;
      return { ok: true, status: 200, async text() { return MINIMAL_RCV_XML; } };
    };

    await scrapeDoceoVotes({
      date: '2026-05-14',
      outputDir: tmpDir,
      fetchImpl: capturingFetch,
      rateLimitMs: 0,
    });

    expect(capturedUrl).toContain('PV-10-2026-05-14-RCV_EN.xml');
  });
});

// ---------------------------------------------------------------------------
// parseDoceoXml — additional edge cases
// ---------------------------------------------------------------------------

describe('parseDoceoXml (edge cases)', () => {
  it('skips self-closing tags inside XML', () => {
    const xmlWithSelfClosing = `<?xml version="1.0"?>
<RollCallVote.Results>
  <RollCallVote.Result Identifier="V001" Method="Roll" Date="2026-05-14">
    <RollCallVote.Description.Text>Test vote</RollCallVote.Description.Text>
    <SubItem Identifier="sub-1"/>
    <Result.For Total="100">
    </Result.For>
    <Result.Against Total="50">
    </Result.Against>
    <Result.Abstention Total="10">
    </Result.Abstention>
  </RollCallVote.Result>
</RollCallVote.Results>`;
    const result = parseDoceoXml(xmlWithSelfClosing);
    expect(result.voteCount).toBe(1);
    expect(result.votes[0].for).toBe(100);
  });

  it('handles XML where a tag has no closing counterpart (truncated XML)', () => {
    // Truncated XML — should gracefully return 0 votes
    const truncated = `<RollCallVote.Results>
  <RollCallVote.Result Identifier="V001" Method="Roll" Date="2026-05-14">
    <RollCallVote.Description.Text>Truncated`;
    const result = parseDoceoXml(truncated);
    // Incomplete block — no </RollCallVote.Result> found
    expect(result.voteCount).toBe(0);
  });

  it('handles zero-total votes correctly', () => {
    const zeroVotes = `<?xml version="1.0"?>
<RollCallVote.Results>
  <RollCallVote.Result Identifier="V001" Method="Secret" Date="2026-05-14">
    <RollCallVote.Description.Text>Secret vote</RollCallVote.Description.Text>
    <Result.For Total="0">
    </Result.For>
    <Result.Against Total="0">
    </Result.Against>
    <Result.Abstention Total="0">
    </Result.Abstention>
  </RollCallVote.Result>
</RollCallVote.Results>`;
    const result = parseDoceoXml(zeroVotes);
    expect(result.votes[0].for).toBe(0);
    expect(result.votes[0].against).toBe(0);
    expect(result.votes[0].abstention).toBe(0);
  });

  it('decodes XML entities in descriptions and member names', () => {
    const xmlWithEntities = `<?xml version="1.0"?>
<RollCallVote.Results>
  <RollCallVote.Result Identifier="V001" Method="Roll" Date="2026-05-14">
    <RollCallVote.Description.Text>Motion on &amp; regulation &lt;2026&gt;</RollCallVote.Description.Text>
    <Result.For Total="100">
      <PoliticalGroup.Vote Identifier="EPP">
        <politicalGroup identifier="EPP">
          <Member.Name FontSize="7" Id="1">M&#252;ller Hans</Member.Name>
          <Member.Name FontSize="7" Id="2">O&apos;Brien Patrick</Member.Name>
        </politicalGroup>
      </PoliticalGroup.Vote>
    </Result.For>
    <Result.Against Total="50">
    </Result.Against>
    <Result.Abstention Total="10">
    </Result.Abstention>
  </RollCallVote.Result>
</RollCallVote.Results>`;
    const result = parseDoceoXml(xmlWithEntities);
    expect(result.votes[0].description).toBe('Motion on & regulation <2026>');
    expect(result.votes[0].membersFor).toContain('Müller Hans');
    expect(result.votes[0].membersFor).toContain("O'Brien Patrick");
  });
});
