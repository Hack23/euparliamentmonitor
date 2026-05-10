// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Live integration test for the IMF WEO (World Economic Outlook) dataflow.
 *
 * The WEO is published twice a year (April + October updates) but every
 * historical and forecast indicator is permanently available via
 * `https://api.imf.org/external/sdmx/3.0`. This test exercises the four
 * code paths the editorial pipeline relies on against the real endpoint:
 *
 *  1. {@link IMFMCPClient.listDatabases} — confirm WEO is advertised.
 *  2. {@link IMFMCPClient.getParameterCodes} — confirm the WEO indicator
 *     codelist is populated (≥30 codes is a conservative floor; the real
 *     list is in the hundreds).
 *  3. {@link IMFMCPClient.fetchData} with an explicit indicator subset —
 *     confirm SDMX-JSON observations come back for known WEO series.
 *  4. {@link IMFMCPClient.fetchData} **without** an `indicator` filter —
 *     confirms the client can pull *all* indicators for a single country
 *     in a single call (SDMX wildcard semantics: omitted dimension =
 *     match everything). This is the path the user explicitly asked for.
 *
 * The test is gated on `IMF_API_PRIMARY_KEY` because every request to
 * `api.imf.org` must carry the Azure-APIM `Ocp-Apim-Subscription-Key`
 * header (without it the API returns `204 No Content`). When the key is
 * unset the test skips silently — that includes default CI runs and
 * sandboxed agent environments without the secret wired in.
 *
 * To run locally:
 *
 * ```
 * IMF_API_PRIMARY_KEY=<key> npx vitest run test/integration/mcp/imf-weo-live.test.js
 * ```
 *
 * Companion guard: `test/integration/mcp/imf-mcp.test.js` is the
 * network-free URL-shape drift guard; this file complements it with a
 * real-network smoke test that catches upstream API regressions.
 */

import { describe, it, expect } from 'vitest';
import { IMFMCPClient } from '../../../scripts/mcp/imf-mcp-client.js';

const HAS_KEY =
  typeof process.env.IMF_API_PRIMARY_KEY === 'string' && process.env.IMF_API_PRIMARY_KEY.length > 0;

const TIMEOUT_MS = 60_000;

/**
 * Build a real-network IMF client. The constructor reads the Azure-APIM
 * subscription keys from `IMF_API_PRIMARY_KEY` / `IMF_API_SECONDARY_KEY`
 * and applies the documented primary→secondary rotation on 401/403.
 */
function buildLiveClient() {
  return new IMFMCPClient({
    timeoutMs: TIMEOUT_MS,
  });
}

describe('integration — IMF WEO live (gated on IMF_API_PRIMARY_KEY)', () => {
  it.skipIf(!HAS_KEY)(
    'imf-list-databases includes WEO',
    async () => {
      const client = buildLiveClient();
      const result = await client.listDatabases();
      const rows = JSON.parse(result.content[0].text);
      expect(Array.isArray(rows)).toBe(true);
      expect(rows.length).toBeGreaterThan(0);
      const weo = rows.find((r) => r.id === 'WEO');
      expect(weo).toBeDefined();
      expect(weo.name).toMatch(/world\s+economic\s+outlook/i);
      // Post-Sept-2025 IMF Data Portal exposes the publishing agency on
      // every dataflow. WEO is owned by the Research Department.
      expect(weo.agency).toBe('IMF.RES');
      expect(typeof weo.version).toBe('string');
      expect(weo.version.length).toBeGreaterThan(0);
    },
    TIMEOUT_MS
  );

  it.skipIf(!HAS_KEY)(
    'imf-get-parameter-codes returns the WEO indicator codelist',
    async () => {
      const client = buildLiveClient();
      const result = await client.getParameterCodes('WEO', 'indicator');
      const rows = JSON.parse(result.content[0].text);
      expect(Array.isArray(rows)).toBe(true);
      // The WEO indicator codelist has hundreds of entries (NGDP_RPCH,
      // PCPIPCH, GGXCNL_NGDP, BCA_NGDPD, …); 30 is a defensive floor that
      // catches the upstream regression where the codelist comes back
      // empty (the symptom we saw during the September-2025 migration).
      expect(rows.length).toBeGreaterThanOrEqual(30);
      const ids = rows.map((r) => r.id);
      // Anchor on three indicators the editorial templates rely on so a
      // silent rename upstream fails the test instead of producing empty
      // analysis artifacts.
      expect(ids).toContain('NGDP_RPCH');
      expect(ids).toContain('PCPIPCH');
      expect(ids).toContain('GGXCNL_NGDP');
    },
    TIMEOUT_MS
  );

  it.skipIf(!HAS_KEY)(
    'imf-fetch-data returns observations for an explicit indicator subset',
    async () => {
      const client = buildLiveClient();
      const result = await client.fetchData({
        databaseId: 'WEO',
        startYear: 2020,
        endYear: 2026,
        filters: { country: ['DEU'], indicator: ['NGDP_RPCH', 'PCPIPCH'] },
      });
      const text = result.content[0].text;
      expect(typeof text).toBe('string');
      expect(text.length).toBeGreaterThan(0);
      const payload = JSON.parse(text);
      // SDMX-JSON shape: data.dataSets[0].series is an object keyed by
      // dimension-index strings (e.g. "0:0:0").
      const series = payload?.data?.dataSets?.[0]?.series ?? {};
      const seriesKeys = Object.keys(series);
      // Two indicators × one country × one frequency = at least two
      // series in the response.
      expect(seriesKeys.length).toBeGreaterThanOrEqual(2);
    },
    TIMEOUT_MS
  );

  it.skipIf(!HAS_KEY)(
    'imf-fetch-data with no indicator filter pulls ALL WEO indicators for a country',
    async () => {
      const client = buildLiveClient();
      // Deliberately omit `indicator` so the SDMX key has an empty
      // position there (e.g. "A.DEU."), which IMF interprets as "match
      // every code in the indicator dimension". This is the editorial
      // hatch the user asked us to validate.
      const result = await client.fetchData({
        databaseId: 'WEO',
        startYear: 2024,
        endYear: 2024,
        filters: { country: ['DEU'] },
      });
      const text = result.content[0].text;
      expect(typeof text).toBe('string');
      expect(text.length).toBeGreaterThan(0);
      const payload = JSON.parse(text);
      const series = payload?.data?.dataSets?.[0]?.series ?? {};
      const seriesCount = Object.keys(series).length;
      // The WEO carries dozens of indicators per country; floor at 20
      // catches both an empty-payload regression and an accidental
      // single-indicator default leaking back into the client.
      expect(seriesCount).toBeGreaterThanOrEqual(20);
    },
    TIMEOUT_MS
  );
});
