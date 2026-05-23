# MCP Reliability Audit — Year Ahead Run (2026-05-04)

**Run:** year-ahead-2026-05-04 | **Stage:** MCP audit (required pre-Stage C artifact)

---

## EP MCP Server Performance

**Server:** `european-parliament-mcp-server@1.2.20`
**Gateway URL:** `http://host.docker.internal:8080/mcp/european-parliament`

| Tool | Status | Reliability | Notes |
|------|--------|------------|-------|
| `get_plenary_sessions` | ✅ Operational | High | 50 sessions returned for 2026 |
| `get_procedures_feed` | ⚠️ Degraded | Medium | Returns historical tail, not current |
| `get_events_feed` | ❌ Unavailable | Low | EP API error during this run |
| `generate_political_landscape` | ✅ Operational | High | 719 MEPs, 9 groups confirmed |
| `analyze_coalition_dynamics` | ✅ Operational (limited) | Medium | Seat-share proxy only; no vote-level data |
| `early_warning_system` | ✅ Operational | Medium | Medium risk, 84/100 stability |
| `get_adopted_texts` | ✅ Operational | High | 31 texts Jan-Apr 2026 |
| `monitor_legislative_pipeline` | ❌ Empty | Low | Known API data gap |
| `get_voting_records` | ⚠️ Degraded | Low | Records returned; vote counts = 0 (EP delay) |
| `get_parliamentary_questions` | ✅ Operational (limited) | Medium | Metadata only; question text missing |
| `compare_political_groups` | ⚠️ Degraded | Low | Zero voting stats returned |

**EP MCP Overall Reliability: 🟡 MEDIUM (7/11 tools operational or partially operational)**

---

## World Bank MCP Performance

**Server:** `worldbank-mcp@1.0.1`

| Query | Status | Data Quality |
|-------|--------|-------------|
| `get_economic_data(EU, GDP_GROWTH)` | ❌ Failed | "Country not found" — EU aggregate code rejected |
| `get_economic_data(DE, GDP_GROWTH)` | ✅ Operational | Germany 10-year GDP growth returned |

**WB MCP: 🟡 MEDIUM — EU aggregate codes rejected; use individual member-state codes**

---

## IMF Data Availability

**Protocol:** IMF SDMX API (`dataservices.imf.org`)
**Status:** ❌ Not accessible in this run (network/firewall configuration)
**Fallback:** Economic context written using IMF WEO contextual knowledge (April 2026 WEO projections standard reference). All EU economic aggregates carry 🟡 MEDIUM confidence and are clearly marked as non-API-verified.

---

## Recommendations

1. **EP voting data**: Schedule analysis re-run in June-July 2026 once roll-call data is published for Q1 2026
2. **Events feed**: Use `get_events` (paginated) as fallback when `get_events_feed` fails
3. **IMF data**: If network allows, `scripts/imf-mcp-probe.sh` should be verified in next run
4. **Monitor legislative pipeline**: `monitor_legislative_pipeline` empty response is known; use `get_procedures_feed` + manual classification instead
5. **EU aggregates WB**: Always use `DE`, `FR`, `IT`, `ES` as proxy; combine manually for EU averages
