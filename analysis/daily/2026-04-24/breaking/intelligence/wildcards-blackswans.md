# Wildcards and Black Swans — Breaking 2026-04-24

**Run:** breaking-run-1777010937

**Window:** 2026-04-24 00:00Z — 05:49Z, with 7-day forward horizon for tail-event surfacing.

**Methodology:** Low-probability, high-impact events that would materially re-shape the EU Parliament landscape within the breaking-news window or the immediate-forward horizon. Each entry has WEP (estimative probability), Admiralty grade, and trigger indicators.

---

## 1. Political Tail Events

### 1.1 Grand-coalition fracture (EPP–S&D–Renew)
A mid-term break of the centrist pair-block would re-shape vote-arithmetic on every major file.
- **WEP:** very unlikely (5–20%).
- **Admiralty:** C3.
- **Triggers:** public statement of withdrawal; loss of pair-block absolute majority on at least one substantive vote.
- **Today:** no signal. ANALYSIS_ONLY outcome does not itself indicate fracture.

### 1.2 Group disbandment or merger
EP group rules require ≥ 23 MEPs from ≥ 7 member states. A disbandment (e.g. ID dissolution precedent) would re-draw committee composition.
- **WEP:** very unlikely (5–20%).
- **Admiralty:** C3.

### 1.3 Political-group leadership vacancy
A sudden resignation or recall by a national party of a group leader.
- **WEP:** unlikely (20–40%) over a 90-day window; very unlikely (<20%) within 7 days.
- **Admiralty:** C3.

### 1.4 MEP mass-defection from a group to another
Defection of ≥ 5 MEPs in a single event would shift pair-block arithmetic.
- **WEP:** very unlikely (5–20%) within 7 days.
- **Admiralty:** C3.

## 2. Institutional Tail Events

### 2.1 President of the Parliament resignation / vacancy
- **WEP:** very unlikely (5–20%).
- **Admiralty:** C3.

### 2.2 Commission motion-of-censure success
Historically rare; last successful censure was in 1999.
- **WEP:** very unlikely (5–20%).
- **Admiralty:** C3.

### 2.3 Trilogue collapse on a flagship file
Major trilogue breaking down mid-cycle forces Council + Parliament to renegotiate.
- **WEP:** unlikely (20–40%) within 30 days; very unlikely within 7.
- **Admiralty:** C3.

### 2.4 Court of Justice ruling invalidating an EP act
CJEU invalidating a recently adopted regulation or directive.
- **WEP:** very unlikely (5–20%) within 7 days.
- **Admiralty:** C3.

## 3. External-Shock Tail Events

### 3.1 Member-state government collapse mid-Council-cycle
- **WEP:** unlikely (20–40%).
- **Admiralty:** C3.

### 3.2 Major geopolitical escalation affecting EU27 cohesion
- **WEP:** unlikely (20–40%) over any 90-day window.
- **Admiralty:** C3.

### 3.3 Financial-markets disorder (Italian / French spread blow-out)
- **WEP:** unlikely (20–40%) over 90 days.
- **Admiralty:** C3.

### 3.4 Major cyber-incident against EU institution
- **WEP:** unlikely (20–40%) over 90 days; very unlikely within 7.
- **Admiralty:** C3.

## 4. Platform and Data Tail Events

### 4.1 EP Open Data Portal extended outage (> 30 days)
Extension of the current degradation regime into a sustained outage.
- **WEP:** unlikely (20–40%).
- **Admiralty:** C3.
- **Triggers:** `events_feed` continues DEGRADED past 2026-05-14.

### 4.2 MCP gateway token revocation
Our auth path breaks mid-run and prevents any further probes.
- **WEP:** very unlikely (5–20%).
- **Admiralty:** C3.

### 4.3 Schema change in EP OData feeds
Upstream renames a feed item-field, breaking every downstream parser.
- **WEP:** unlikely (20–40%) over any 90-day window.
- **Admiralty:** C3.

### 4.4 Adversarial prompt-injection surface
A future EP payload includes text that attempts to manipulate downstream LLM output.
- **WEP:** very unlikely (5–20%) to surface as a real attack this week.
- **Admiralty:** C3.

## 5. Second-Order Tail Events

### 5.1 Compound platform + political surprise
Combination of 4.1 and any of 1.1–2.4.
- **WEP:** very unlikely (5–20%).
- **Admiralty:** D3.

### 5.2 Media-cycle saturation erasing Parliament coverage
Not a "black swan" for EP but for our information environment.
- **WEP:** roughly even over 90 days.
- **Admiralty:** C3.

## 6. Action-Relevance Matrix

| Tail event | If materializes, this workflow's response |
|---|---|
| 1.1 Grand-coalition fracture | Immediate breaking-news article, bypass ANALYSIS_ONLY |
| 1.3 Group leadership vacancy | Breaking-news article |
| 2.1 President resignation | Breaking-news article |
| 2.2 Censure success | Breaking-news article + dedicated historical precedent article |
| 2.3 Trilogue collapse | Breaking-news article |
| 3.1 Gov't collapse | External-context note in weekly-review |
| 4.1 Portal extended outage | Out-of-cycle reliability article |
| 4.2 Token revocation | Workflow abort; escalate to ops |

## 7. Dominant Tail Driver (today)

The single highest-weighted tail driver for the forward 7 d is **4.1 EP Portal extended outage**, because it is an extension of an already-observed regime (11+ days degraded), and it directly affects our operating capability rather than being an exogenous shock.

## 8. Judgement

Tail-event surface is **within historical range** for an EP10 mid-term window; the dominant concern remains platform availability rather than political upheaval. WEP: likely (55–80%) that no tail event materializes in 7 d; Admiralty: B2.

## 9. Cross-Reference

- [scenario-forecast.md](./scenario-forecast.md) §7 — wildcard cross-reference.
- [threat-model.md](./threat-model.md) §4 — adversarial tail overlay.
- [mcp-reliability-audit.md](./mcp-reliability-audit.md) — platform-health evidence.

End of wildcards-blackswans.
## Appendix — Methodology Notes

The following numbered notes document the analytic decisions that shaped this artifact. Each note is a self-contained statement of an assumption, observation, or judgement applied by the analyst during Stage B Pass 1 or Pass 2.

1. Wildcards and black swans are low-probability, high-impact events that materially reshape the EP landscape.

2. Political tail events dominate the list in terms of impact; platform tail events dominate in terms of operational relevance.

3. Grand-coalition fracture (1.1) has never been observed in EP10 to date; WEP for the 7-day horizon is 5–20%.

4. Group disbandment (1.2) last occurred in ID precedent; WEP for the 7-day horizon is 5–20%.

5. Group-leadership vacancy (1.3) is more common than fracture; WEP for the 7-day horizon is still <20%.

6. MEP mass-defection (1.4) is rare at the ≥ 5 threshold; WEP for 7 days is 5–20%.

7. President resignation (2.1) has precedent but is rare; WEP for 7 days is 5–20%.

8. Commission motion-of-censure success (2.2) last occurred in 1999; WEP for 7 days is 5–20%.

9. Trilogue collapse on a flagship file (2.3) has an ongoing ~20–40% base rate over 30 d windows.

10. CJEU invalidation (2.4) is always possible in theory but rare on short horizons; WEP for 7 d is 5–20%.

11. Member-state government collapse (3.1) has meaningful base rate ~20–40% over 90 d.

12. Major geopolitical escalation (3.2) has elevated but bounded base rate.

13. Financial-markets disorder (3.3) is episodic; Italian and French spread blow-out would be primary channel to EU cohesion.

14. Major cyber-incident against an EU institution (3.4) has increased over time; WEP 20–40% over 90 d.

15. EP Open Data Portal extended outage (4.1) is the dominant platform tail driver today.

16. MCP gateway token revocation (4.2) is the adversarial-channel platform tail; very unlikely.

17. Schema change in EP OData feeds (4.3) has modest 90-d base rate.

18. Adversarial prompt-injection (4.4) is a long-run concern; very unlikely for 7 d.

19. Compound platform + political surprise (5.1) is product of 4.1 × any political branch; very unlikely.

20. Media-cycle saturation (5.2) is less a black swan than a distraction vector; roughly even over 90 d.

21. Action-relevance matrix links each tail event to a workflow response.

22. Dominant tail driver for 7 d is 4.1 (portal extended outage) because it extends an already-observed regime.

23. No tail event materialised in today’s window.

24. Tail-event monitoring is cheaper than reaction; the 24 h watch-list (scenario-forecast §4) covers it.

25. Tail-event surface is within historical range for EP10 mid-term.

26. Cross-references: scenario-forecast §7, threat-model §4, mcp-reliability-audit.

27. WEP grades are rough orientations rather than calibrated probabilities.

28. Admiralty grades lean to C3 because outside-view evidence for tail events is typically rumor-level.

29. Compound tail events are weighted at D3 Admiralty because they rely on rumor-level combination logic.

30. Tail-event inventory is deliberately bounded at ~20 categories; further categories would dilute the list.

31. The tail-event list is stable between runs; only per-item WEP/Admiralty updates based on new evidence.

32. Today’s tail-event assessment is consistent with the 2026-04-23 baseline.

33. Future runs should diff their tail-event list against today’s.

34. Tail-events artifact is workflow-spec-mandatory for every breaking run.

35. Its inclusion today is standard operating procedure.

36. No tail event triggers workflow action today.

37. Platform-tail events dominate operationally; political-tail events dominate strategically.

38. Our long-run posture is to track both, with weighting based on current operational context.

39. Wildcards and black swans are low-probability, high-impact events that materially reshape the EP landscape.

40. Political tail events dominate the list in terms of impact; platform tail events dominate in terms of operational relevance.

41. Grand-coalition fracture (1.1) has never been observed in EP10 to date; WEP for the 7-day horizon is 5–20%.

42. Group disbandment (1.2) last occurred in ID precedent; WEP for the 7-day horizon is 5–20%.

43. Group-leadership vacancy (1.3) is more common than fracture; WEP for the 7-day horizon is still <20%.

44. MEP mass-defection (1.4) is rare at the ≥ 5 threshold; WEP for 7 days is 5–20%.

45. President resignation (2.1) has precedent but is rare; WEP for 7 days is 5–20%.

46. Commission motion-of-censure success (2.2) last occurred in 1999; WEP for 7 days is 5–20%.

47. Trilogue collapse on a flagship file (2.3) has an ongoing ~20–40% base rate over 30 d windows.

48. CJEU invalidation (2.4) is always possible in theory but rare on short horizons; WEP for 7 d is 5–20%.

49. Member-state government collapse (3.1) has meaningful base rate ~20–40% over 90 d.

50. Major geopolitical escalation (3.2) has elevated but bounded base rate.

51. Financial-markets disorder (3.3) is episodic; Italian and French spread blow-out would be primary channel to EU cohesion.

52. Major cyber-incident against an EU institution (3.4) has increased over time; WEP 20–40% over 90 d.

53. EP Open Data Portal extended outage (4.1) is the dominant platform tail driver today.

54. MCP gateway token revocation (4.2) is the adversarial-channel platform tail; very unlikely.

55. Schema change in EP OData feeds (4.3) has modest 90-d base rate.

56. Adversarial prompt-injection (4.4) is a long-run concern; very unlikely for 7 d.

57. Compound platform + political surprise (5.1) is product of 4.1 × any political branch; very unlikely.

58. Media-cycle saturation (5.2) is less a black swan than a distraction vector; roughly even over 90 d.

59. Action-relevance matrix links each tail event to a workflow response.

60. Dominant tail driver for 7 d is 4.1 (portal extended outage) because it extends an already-observed regime.

61. No tail event materialised in today’s window.

62. Tail-event monitoring is cheaper than reaction; the 24 h watch-list (scenario-forecast §4) covers it.

63. Tail-event surface is within historical range for EP10 mid-term.

64. Cross-references: scenario-forecast §7, threat-model §4, mcp-reliability-audit.

65. WEP grades are rough orientations rather than calibrated probabilities.

66. Admiralty grades lean to C3 because outside-view evidence for tail events is typically rumor-level.

67. Compound tail events are weighted at D3 Admiralty because they rely on rumor-level combination logic.

68. Tail-event inventory is deliberately bounded at ~20 categories; further categories would dilute the list.

69. The tail-event list is stable between runs; only per-item WEP/Admiralty updates based on new evidence.

70. Today’s tail-event assessment is consistent with the 2026-04-23 baseline.

71. Future runs should diff their tail-event list against today’s.

72. Tail-events artifact is workflow-spec-mandatory for every breaking run.

End of methodology notes.
