<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📎 Citation Pattern — Admiralty + Kent/WEP + EP MCP

> **Canonical citation grammar used across all analytical templates.**
> See [`osint-tradecraft-standards.md`](../../methodologies/osint-tradecraft-standards.md)
> for the underlying tradecraft contract.

## Pattern

Every external claim cites one of three source classes:

```text
(Admiralty grade) Source short-name — locator
```

| Class | Grade | Examples |
|---|---|---|
| **EP primary** | A1 | `(A1) EP plenary record — Vote 2026-04-15 §12.3` |
| **EU institutional** | A2–B2 | `(B2) Council conclusions 2026-03-21 §4` |
| **Trusted press** | C2–C3 | `(C3) Politico — 2026-04-12 "Trilogue collapse"` |
| **Industry / NGO** | D3–E4 | `(D4) Bruegel commentary 2026-03-09` |
| **Unverified** | F6 | `(F6) Anonymous Twitter — 2026-04-10` |

## Estimative phrasing

Headline judgements pair an **Admiralty grade** with a **WEP band** and an
explicit **time horizon**:

```text
> Highly Likely (75–85%) within Q3 2026 — (A1) EP voting record;
> (A2) Council compromise text 2026-04-08.
```

Forbidden: bare adjectives ("possibly", "likely") with no probability range,
no horizon, and no source.

## Confidence vs. probability

WEP probability tracks **what may happen**. Confidence (🟢 HIGH / 🟡 MEDIUM /
🔴 LOW) tracks **how much we trust the evidence behind the probability**.
Never collapse them. A Highly Likely outcome with 🔴 LOW confidence is a
real, common state and must be reported as such.

## EP MCP citation form

When the evidence comes from a tool call, cite the tool + parameters:

```text
(A1) EP MCP `get_voting_records(sessionId=PV-2026-04-15)` — record #347
(A2) EP MCP `get_meps(group=EPP)` — count 188
```

The validator at `scripts/validate-analysis-completeness.js` accepts any of
these forms.
