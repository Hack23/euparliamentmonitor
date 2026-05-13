---
# SPDX-FileCopyrightText: 2024-2026 Hack23 AB
# SPDX-License-Identifier: Apache-2.0
#
# Shared `safe-outputs.allowed-domains` allowlist for the 14 unified
# `news-*.md` article workflows. The list is byte-identical across all 14
# workflow sources (verified via `md5sum` over the inline allowed-domains
# block), so extracting it here is purely a deduplication step — no
# semantic change to the compiled `.lock.yml` outputs.
#
# This shared component contributes ONLY the safe-outputs.allowed-domains
# field via frontmatter merge. Importing workflows still own every other
# `safe-outputs.*` field they need (threat-detection, max-patch-size,
# create-pull-request, dispatch-workflow, steps).
#
# Imports merge nested maps in gh-aw, so this file only declares the
# domain list — the importing workflow's other safe-outputs keys are
# preserved by the merge.
#
# To add a new domain across all 14 article workflows: edit this file
# once and rerun `gh aw compile --validate`. Drift between the inline
# allowed-domains lists and this shared file is guarded by
# `test/unit/agentic-workflows-threat-detection.test.js`.
safe-outputs:
  allowed-domains:
    # ── gh-aw ecosystem identifier ────────────────────────────────────
    - github                             # github.com + api.github.com (PR creation, links)
    # ── EU Parliament & EU institutions ───────────────────────────────
    - "*.europa.eu"
    - europarl.europa.eu
    - www.europarl.europa.eu
    - data.europarl.europa.eu
    - admin.data.europarl.europa.eu
    - multimedia.europarl.europa.eu
    - oeil.secure.europarl.europa.eu
    - ec.europa.eu
    - eur-lex.europa.eu
    - iate.europa.eu
    - digital-strategy.ec.europa.eu
    - data.europa.eu
    - data.consilium.europa.eu
    - data.ecb.europa.eu
    # ── IMF ───────────────────────────────────────────────────────────
    - "*.imf.org"
    - api.imf.org
    - data.imf.org
    - www.imf.org
    - dataservices.imf.org
    - sdmx.imf.org
    # ── World Bank ────────────────────────────────────────────────────
    - "*.worldbank.org"
    - api.worldbank.org
    - data.worldbank.org
    - www.worldbank.org
    # ── Hack23-owned domains ──────────────────────────────────────────
    - "*.hack23.com"
    - hack23.com
    - www.hack23.com
    - hack23.github.io
    - "*.euparliamentmonitor.com"
    - euparliamentmonitor.com
    - www.euparliamentmonitor.com
    - api.euparliamentmonitor.com
    - "*.riksdagsmonitor.com"
    - riksdagsmonitor.com
    - www.riksdagsmonitor.com
    - blacktrigram.com
    - www.blacktrigram.com
    - ciacompliancemanager.com
    - www.ciacompliancemanager.com
---
