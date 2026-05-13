---
name: news-generation
description: Shared gh-aw agent for EU Parliament Monitor article-generating news-*.md workflows — appends the canonical analysis anchor and single-PR contract to every importing workflow prompt.
---

<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Imported Agent — News Generation

This imported body is intentionally short: it preserves the canonical gh-aw
import expected by the repo lint rules without duplicating the full workflow
contract that already lives in each `news-*.md` source file.

## Shared analysis anchor

Before Stage B, read these canonical analysis references once per run:

1. [`analysis/methodologies/ai-driven-analysis-guide.md`](../../analysis/methodologies/ai-driven-analysis-guide.md)
2. [`analysis/methodologies/artifact-catalog.md`](../../analysis/methodologies/artifact-catalog.md)
3. [`analysis/methodologies/per-artifact-methodologies.md`](../../analysis/methodologies/per-artifact-methodologies.md)
4. [`analysis/templates/README.md`](../../analysis/templates/README.md)

Use them as the authoritative source for artifact scope, quality floors, and
methodology mapping.

## Shared execution contract

- Follow the importing workflow's own Stage A → B → C → D → E instructions.
- Keep the run to a single final `safeoutputs___create_pull_request` call unless
  the importing workflow explicitly says otherwise (only `news-translate.md` is
  exempt).
- Treat this file as a runtime anchor only — do not duplicate or re-read the
  importing workflow's required-reading list unless that workflow explicitly
  instructs you to do so.
