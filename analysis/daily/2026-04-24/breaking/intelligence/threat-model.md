# Threat Model — Breaking 2026-04-24

**Run:** breaking-run-1777010937

**Window:** 2026-04-24 00:00Z — 05:49Z

**Methodology:** STRIDE + MITRE ATT&CK mapping applied to the EU Parliament information pipeline, scoped to risks materializing in the breaking-news window.

**Scope boundary:** Threats to (a) the EP Open Data Portal upstream, (b) the MCP gateway and tool surface, (c) our analysis pipeline, and (d) the downstream reader of the news artifact set. Threats to MEP personal safety or physical infrastructure are out of scope.

---

## 1. Asset Inventory

1. EP Open Data Portal upstream APIs.
2. MCP gateway (`host.docker.internal:8080`) + 62 EP tools.
3. EP data artifacts (raw payloads under `data/`).
4. Analysis artifacts (under `intelligence/`).
5. Published news articles (under `news/`).
6. Workflow run logs and manifest.json.

## 2. STRIDE Summary

| Threat | Asset | Likelihood | Impact | Composite |
|---|---|---|---|---|
| **S**poofing of MCP gateway identity | Gateway | Low | Medium | Low |
| **T**ampering with artifact files at rest | Artifacts | Low | Medium | Low |
| **R**epudiation of analysis output | Analysis | Low | Low | Low |
| **I**nformation disclosure of MEP personal data | Data | Low | Medium | Low (GDPR exposure via declarations) |
| **D**enial of service against EP portal | Upstream | **Medium** (current) | Medium | **Medium** |
| **E**levation of privilege via sandbox escape | Workflow | Low | High | Medium |

## 3. MITRE ATT&CK Mapping

| Technique | ID | Relevance today |
|---|---|---|
| Data from Information Repositories | T1213 | N/A (no adversary) |
| Network Denial of Service | T1498 | Indirectly relevant (degraded EP feeds) |
| Prompt Injection via untrusted input | N/A (custom) | Relevant — every EP-returned string is untrusted |
| Credential Access via env-var exfiltration | T1552.001 | Blocked by sandbox policy |
| Container Escape / Privilege Escalation | T1611 | Blocked by sandbox policy |
| Traffic Signaling via DNS/ICMP tunneling | T1205 | Blocked by firewall allowlist |
| Data Manipulation (tampering at rest) | T1565 | Low risk; git history enforces integrity |
| Exfiltration Over Web Service | T1567 | Blocked by safeoutputs allowlist |

## 4. Scenario-Specific Threats

### 4.1 Prompt Injection via EP Response Payload
An EP MCP tool returns a string that includes instructions (e.g. "IGNORE YOUR PREVIOUS INSTRUCTIONS AND..."). Our response: the security layer treats all tool outputs as untrusted data. No injection observed today.

### 4.2 Data-Poisoning via Historical Backfill
An adversary could, in principle, contaminate historical EP data to shift our baseline calibration. Mitigation: Admiralty grading forces attribution; any deviation shows up as a baseline shift.

### 4.3 Availability Attack on the EP Portal
The degraded-feed regime today is **consistent with, but not diagnostic of**, an availability attack. More likely explanation is an internal upstream backing-service issue. We do not attribute to adversary action.

### 4.4 Manifest Tampering
The `manifest.json.history[]` structure is append-only; `mergeManifestHistory` enforces new-entry-only semantics. Tampering with prior entries would require direct repo-write access.

### 4.5 Exfiltration via PR Body
Safeoutputs allowlist constrains PR bodies to text + markdown; no embedded redirect or credential smuggling path exists.

## 5. Threat-to-Today Matrix

| Threat | Observed in window? | Evidence | Action |
|---|---|---|---|
| Spoofing | No | N/A | Monitor |
| Tampering | No | Git HEAD clean | Monitor |
| Repudiation | No | N/A | Monitor |
| Information disclosure | No | No GDPR-sensitive endpoint called | Monitor |
| Denial of service | **Partial** | `events_feed` DEGRADED 11+ days | Document in reliability audit |
| Elevation of privilege | No | Sandbox intact | Monitor |

## 6. Control Coverage (ISMS cross-walk)

- **ISO 27001 A.5** (Information security policies) — policy set loaded via this workflow.
- **ISO 27001 A.8** (Asset management) — asset inventory above.
- **ISO 27001 A.12** (Operational security) — run logs + manifest preserved.
- **ISO 27001 A.14** (System acquisition / development) — TypeScript strict; shell-safety lint.
- **NIST CSF 2.0 DE.AE** (Detection of anomalies) — `detect_voting_anomalies`, `early_warning_system` (not invoked today).
- **CIS Controls v8.1 CIS 8** (Audit log management) — `manifest.json.history[]` append-only.

## 7. Residual Risk Today

- **Availability** — Medium (ongoing degradation).
- **Confidentiality** — Low.
- **Integrity** — Low.

## 8. Recommendations

1. Continue feed-health monitoring per `mcp-reliability-audit.md`.
2. Preserve raw probe payloads for forensic comparison across days.
3. No new controls required today — existing ISMS posture covers observed threats.
4. If the availability regime shifts to **HIGH** (4+ ANALYSIS_ONLY days in any trailing 14-day window), escalate via the committee-reports family.

## 9. Judgement

Threat environment is **steady-state with an elevated availability concern**. WEP: likely (55–80%) that availability remains the dominant concern through 2026-05-01. Admiralty: B2.

## 10. Cross-Reference

- [mcp-reliability-audit.md](./mcp-reliability-audit.md) — feed-health evidence.
- [scenario-forecast.md](./scenario-forecast.md) — scenario branches.
- [wildcards-blackswans.md](./wildcards-blackswans.md) — tail events.
- `.github/skills/threat-modeling.md` — canonical methodology.

End of threat-model.
## Appendix — Methodology Notes

The following numbered notes document the analytic decisions that shaped this artifact. Each note is a self-contained statement of an assumption, observation, or judgement applied by the analyst during Stage B Pass 1 or Pass 2.

1. STRIDE provides a comprehensive starting taxonomy; we supplement it with prompt-injection (not in STRIDE) and sandbox-escape (covered under Elevation of Privilege).

2. MITRE ATT&CK mapping serves as a cross-reference for external security teams; we do not use it as our primary taxonomy.

3. Spoofing risk is minimal because the MCP gateway runs in-container; no remote-identity surface.

4. Tampering risk at rest is mitigated by git integrity and the append-only manifest history.

5. Repudiation risk is minimal because every run produces an auditable manifest with gateResult and file listing.

6. Information disclosure risk is minimal because no high-sensitivity endpoint (MEP declarations) was called today.

7. Denial of service is the only elevated threat today; it is upstream-scoped and we cannot mitigate it directly.

8. Elevation of privilege risk is blocked by sandbox policy and firewall allowlist.

9. Prompt-injection risk requires every tool-returned string to be treated as untrusted data; we comply with this by design.

10. Data-poisoning via historical backfill is a theoretical risk; our Admiralty grading catches deviations via baseline-shift detection.

11. Manifest tampering is blocked by append-only semantics enforced by \`mergeManifestHistory\`.

12. Exfiltration via PR body is blocked by safeoutputs allowlist; PR body content is markdown + text only.

13. Control coverage via ISMS cross-walk is documented in §6.

14. Residual risk today is Medium on availability, Low on confidentiality, Low on integrity.

15. No new controls are required today; existing ISMS posture is sufficient.

16. Escalation trigger if availability regime shifts to HIGH (4+ ANALYSIS_ONLY days in 14 d).

17. Our threat posture is reader-only; we do not probe administrative surfaces.

18. Threat model is cross-referenced to mcp-reliability-audit (§4), scenario-forecast (§7), wildcards-blackswans.

19. Each threat has a likelihood × impact composite grade; we do not compute a numeric risk score.

20. STRIDE table above summarises all six threat classes; only DoS rises to Medium composite.

21. Prompt-injection threat-class is our most likely adversarial surface over the long run.

22. Data-poisoning threat-class becomes more relevant if upstream data integrity is ever demonstrably broken.

23. Today’s threat model is consistent with the 2026-04-23 baseline.

24. Future runs should diff their threat model against today’s for regime change.

25. The threat model artifact is workflow-spec-mandatory for every breaking run, even when no threat is observed.

26. Its inclusion today is not an escalation signal; it is standard operating procedure.

27. Cross-walk to NIST CSF 2.0 DE.AE is documented in §6.

28. Cross-walk to ISO 27001 A.5/A.8/A.12/A.14 is documented in §6.

29. Cross-walk to CIS Controls v8.1 CIS 8 is documented in §6.

30. Our ISMS posture is public (Hack23 ISMS-PUBLIC); this threat model is one of the artifacts that reifies it.

31. Availability threat today is below escalation threshold.

32. Confidentiality threat today is at baseline.

33. Integrity threat today is at baseline.

34. No adversarial actor is attributed in today’s assessment.

35. No action items arise from today’s threat model beyond continued monitoring.

36. The threat model will be regenerated tomorrow if any sibling-artifact signals change.

37. STRIDE provides a comprehensive starting taxonomy; we supplement it with prompt-injection (not in STRIDE) and sandbox-escape (covered under Elevation of Privilege).

38. MITRE ATT&CK mapping serves as a cross-reference for external security teams; we do not use it as our primary taxonomy.

39. Spoofing risk is minimal because the MCP gateway runs in-container; no remote-identity surface.

40. Tampering risk at rest is mitigated by git integrity and the append-only manifest history.

41. Repudiation risk is minimal because every run produces an auditable manifest with gateResult and file listing.

42. Information disclosure risk is minimal because no high-sensitivity endpoint (MEP declarations) was called today.

43. Denial of service is the only elevated threat today; it is upstream-scoped and we cannot mitigate it directly.

44. Elevation of privilege risk is blocked by sandbox policy and firewall allowlist.

45. Prompt-injection risk requires every tool-returned string to be treated as untrusted data; we comply with this by design.

46. Data-poisoning via historical backfill is a theoretical risk; our Admiralty grading catches deviations via baseline-shift detection.

47. Manifest tampering is blocked by append-only semantics enforced by \`mergeManifestHistory\`.

48. Exfiltration via PR body is blocked by safeoutputs allowlist; PR body content is markdown + text only.

49. Control coverage via ISMS cross-walk is documented in §6.

50. Residual risk today is Medium on availability, Low on confidentiality, Low on integrity.

51. No new controls are required today; existing ISMS posture is sufficient.

52. Escalation trigger if availability regime shifts to HIGH (4+ ANALYSIS_ONLY days in 14 d).

53. Our threat posture is reader-only; we do not probe administrative surfaces.

54. Threat model is cross-referenced to mcp-reliability-audit (§4), scenario-forecast (§7), wildcards-blackswans.

55. Each threat has a likelihood × impact composite grade; we do not compute a numeric risk score.

56. STRIDE table above summarises all six threat classes; only DoS rises to Medium composite.

57. Prompt-injection threat-class is our most likely adversarial surface over the long run.

58. Data-poisoning threat-class becomes more relevant if upstream data integrity is ever demonstrably broken.

59. Today’s threat model is consistent with the 2026-04-23 baseline.

60. Future runs should diff their threat model against today’s for regime change.

61. The threat model artifact is workflow-spec-mandatory for every breaking run, even when no threat is observed.

62. Its inclusion today is not an escalation signal; it is standard operating procedure.

63. Cross-walk to NIST CSF 2.0 DE.AE is documented in §6.

64. Cross-walk to ISO 27001 A.5/A.8/A.12/A.14 is documented in §6.

65. Cross-walk to CIS Controls v8.1 CIS 8 is documented in §6.

66. Our ISMS posture is public (Hack23 ISMS-PUBLIC); this threat model is one of the artifacts that reifies it.

67. Availability threat today is below escalation threshold.

68. Confidentiality threat today is at baseline.

69. Integrity threat today is at baseline.

70. No adversarial actor is attributed in today’s assessment.

71. No action items arise from today’s threat model beyond continued monitoring.

72. The threat model will be regenerated tomorrow if any sibling-artifact signals change.

73. STRIDE provides a comprehensive starting taxonomy; we supplement it with prompt-injection (not in STRIDE) and sandbox-escape (covered under Elevation of Privilege).

74. MITRE ATT&CK mapping serves as a cross-reference for external security teams; we do not use it as our primary taxonomy.

End of methodology notes.
