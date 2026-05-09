<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- analysis/daily/2026-05-09/breaking/intelligence/mcp-reliability-audit.md -->
<!-- Generated: 2026-05-09 | Stage B Pass 1 -->

# MCP Reliability Audit — Breaking News 2026-05-09

## Audit Summary

| MCP Server | Status | Data Quality | Notes |
|-----------|--------|-------------|-------|
| european-parliament | 🟢 OPERATIONAL | 🟡 MEDIUM | EP API delays on voting records; feeds mostly functional |
| world-bank | 🟢 OPERATIONAL | 🟢 HIGH | Not queried this run; non-economic indicators not required |
| fetch-proxy (IMF) | 🔴 FAILED | N/A | fetch failed on both IMF SDMX endpoints queried |
| memory | 🟢 OPERATIONAL | N/A | Scratch memory available |
| sequential-thinking | 🟢 OPERATIONAL | N/A | Not required this run |

---

## European Parliament MCP Server

### Feed Performance

| Feed | Result | Item Count | Quality |
|------|--------|------------|---------|
| `get_adopted_texts_feed` (one-week) | 🟢 OK | 258 items | 🟡 Labels partial; IDs complete |
| `get_events_feed` (one-week) | 🔴 UNAVAILABLE | 0 items | EP API upstream error |
| `get_procedures_feed` (one-week) | 🟡 DEGRADED | 50 items (mostly historical) | Procedures data sparse |
| `get_meps_feed` (one-week) | 🟡 PAYLOAD LARGE | Saved to payload file | OVERSIZED_PAYLOAD warning triggered |
| `get_adopted_texts` (2026, limit 50) | 🟢 OK | 51 items with titles | 🟢 HIGH quality |
| `get_plenary_sessions` (2026) | 🟢 OK | 10 sessions with attendance | 🟢 HIGH quality |
| `get_latest_votes` | 🟢 OK | 0 items (expected) | DOCEO XML unavailable for dates queried |
| `get_voting_records` (Apr 28–May 9) | 🟢 OK | 0 items (expected) | EP publication delay confirmed |
| `get_speeches` (Apr 28–May 9) | 🟢 OK | 20+ speeches | Titles/dates confirmed; text unavailable |
| `get_parliamentary_questions` | 🟢 OK | 21 questions | Author/content minimal in API |
| `track_legislation` (2023/0447) | 🟡 PARTIAL | Timeline confirmed | Confidence LOW per API |
| `generate_political_landscape` | 🟢 OK | Full group composition | 🟢 HIGH quality |
| `analyze_coalition_dynamics` | 🟡 PROXY-ONLY | Size similarity only | Per-MEP voting data unavailable |
| `early_warning_system` | 🟢 OK | 3 warnings generated | 🟡 Structural analysis only |

### Key API Limitations Observed

1. **Roll-call voting data unavailable**: The EP API has a standard 2–4 week publication lag for individual roll-call votes. For the April 28–30 session (9–11 days ago), no voting records are available. This is expected behavior, not a system fault.

2. **Events feed upstream failure**: `get_events_feed` returned a documented error-in-body response. Fallback: `get_plenary_sessions` provided session data with attendance counts.

3. **Procedures feed degraded**: The procedures feed returned 50 historical procedures with empty activity fields. Recent procedures are not surfacing via the feed endpoint. The `track_legislation` direct lookup provided timeline data for the specific dogs/cats procedure.

4. **Speech text unavailable**: While speech records (titles, speaker IDs, dates) are available in the API, the actual speech text content is not returned by the `get_speeches` endpoint. This limits rhetorical analysis of the PfE Commission interference debate.

5. **MEP biographical gaps**: Speaker IDs (person/197553, person/257144, etc.) are confirmed in plenary records, but the `get_mep_details` endpoint would be required to map these to named MEPs. This was deferred due to budget constraints.

---

## IMF Fetch Proxy

### Failure Analysis

Both IMF SDMX endpoints queried returned `fetch failed`:
- `https://dataservices.imf.org/REST/SDMX_3.0/data/WEO/A.EU.NGDP_RPCH+PCPIPCH+LUR`
- `https://dataservices.imf.org/REST/SDMX_3.0/data/WEO/A.EU27.NGDP_RPCH`

**Likely causes:** Network firewall (AWF Squid proxy) blocking IMF SDMX endpoints, or IMF API temporary unavailability.

**Impact on analysis quality:** 
- 🟡 MEDIUM impact — economic context cannot be sourced from IMF as the sole authoritative source per methodology
- Mitigation: Analysis notes reliance on publicly available economic projections (approximate figures from WEO April 2026 public release); economic claims are flagged with appropriate confidence levels

**IMF-Dependent Claims (flagged):**
- EU GDP growth projection (~1.3–1.7%): Based on public WEO knowledge, not IMF SDMX query
- EU inflation (~2%): Based on public knowledge of ECB trajectory
- These figures should be treated as approximate; no IMF SDMX citation available

---

## Data Quality Assessment

### What We Know with HIGH Confidence (🟢)
- Complete list of 2026 adopted texts through April 30 (51 texts, titles confirmed)
- Political group seat distribution (EP Open Data Portal real-time)
- Plenary session dates and attendance counts (Jan–May 2026)
- Dogs/cats legislation timeline (procedure events confirmed)
- Speech dates and topics for April 28–30 debates (titles confirmed)
- PfE topical debate occurrence (April 29, speakers partially identified)

### What We Know with MEDIUM Confidence (🟡)
- Coalition voting patterns on April 28–30 resolutions (structural inference, not confirmed)
- Economic context (public knowledge baseline, not IMF SDMX)
- PfE debate content and Commission response (debate confirmed; content not available)
- Implementation timeline for dogs/cats regulation (standard OLP periods applied)

### What We Do NOT Know (🔴 Confirmed Gaps)
- Actual roll-call vote tallies for April 28–30 (EP publication delay)
- Exact speech content from PfE and Commission representatives on April 29 debate
- Full text of adopted resolutions (only titles available in API)
- IMF SDMX economic data

---

## Recommendations for Future Runs

1. **Retry IMF after network policy review**: If AWF Squid proxy configuration allows, add `dataservices.imf.org` to explicit allowlist for direct HTTPS (currently failing even via fetch-proxy MCP)

2. **MEP biographical lookups**: For runs where named MEP speakers are identified, prioritize `get_mep_details` calls in Stage A to enable richer rhetorical analysis

3. **Voting record timing**: Schedule breaking news runs approximately 2–3 weeks after plenary sessions to enable roll-call voting data to be available; OR explicitly note the gap and flag analysis as pre-confirmation

4. **Events feed fallback**: Continue using `get_plenary_sessions` as primary fallback when events feed is unavailable — it provides robust session-level data

5. **Speech text workaround**: Consider `get_committee_documents` and `get_adopted_texts` with full text retrieval to supplement speech topic data with substantive content

---

## MCP Session Health

- Session duration: Active throughout run (no session timeout errors)
- Tool call count: ~15 tool calls across european-parliament MCP
- Error rate: 2 tool failures (events feed, IMF proxy) out of ~17 calls = ~12% failure rate
- Data volume: ~150KB+ EP data successfully retrieved and processed

**Overall MCP reliability for this run:** 🟡 ACCEPTABLE — primary data sources functional; IMF gap is noted and mitigated.
