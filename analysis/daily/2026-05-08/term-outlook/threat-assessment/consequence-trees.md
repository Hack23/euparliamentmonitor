# EP10 Term Outlook — Consequence Trees
**Date:** 2026-05-08 | **Article Type:** term-outlook | **Confidence:** MEDIUM

---

## 🔍 Reader Briefing

**For citizens:** Consequence trees trace what happens AFTER a key legislative or political event. When EP10 makes a major decision — or fails to — this tool maps the cascading effects across European politics, economy, and governance. This helps citizens understand the stakes of seemingly abstract parliamentary votes.

---

## 1. Consequence Tree 1 — Clean Industrial Deal Failure/Dilution

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","lineColor":"#90CAF9"}}}%%
flowchart TD
    TRIGGER["TRIGGER: CID green provisions\nremoved in trilogue\n(EPP-ECR majority votes out\nclimate conditionality)"]

    TRIGGER --> EU_CLIMATE["EU 2030 NDC −55% GHG\nbecomes technically\nunachievable without CID"]
    TRIGGER --> INDUSTRIAL["Industrial subsidies\nredirected to incumbent\nfossil-intensive industries"]
    TRIGGER --> CREDIBILITY["EU COP credibility\ncollapse — 2027 global\nclimate negotiations impacted"]

    EU_CLIMATE --> LEGAL["Commission faces CJEU\nchallenge on NDC\ncommitment compliance"]
    INDUSTRIAL --> LOCK_IN["Carbon lock-in: EU\nindustrial base modernisation\ndelayed 5-7 years"]
    CREDIBILITY --> GLOBAL["Global Green Deal\neffect reversed — other\njurisdictions ease ambition"]

    LEGAL --> EP_RESPONSE["EP forces emergency\ncompensatory legislation\n(likely inadequate)"]
    LOCK_IN --> JOBS["EU manufacturing\ndeclines faster;\njobs lost 2028-2032"]
    GLOBAL --> TEMP["Temperature trajectory:\n+0.1-0.2°C by 2040"]

    style TRIGGER fill:#8B0000,color:#fff
    style EU_CLIMATE fill:#CC4400,color:#fff
    style INDUSTRIAL fill:#CC4400,color:#fff
    style CREDIBILITY fill:#CC4400,color:#fff
    style JOBS fill:#886600,color:#fff
```

**Assessment:** This consequence tree describes the LIKELY outcome (WEP B3 — 60% probability that CID green provisions are partially diluted). The terminal nodes are 10-year consequences. The JOBS outcome is the most politically visible and the most likely to create backlash — but by the time it's visible (2028–2032), the EP10 legislators who made the decision will have moved on.

---

## 2. Consequence Tree 2 — Coalition Collapse

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","lineColor":"#90CAF9"}}}%%
flowchart TD
    TRIGGER2["TRIGGER: S&D exits\ngrand coalition after\nmajor EPP-ECR deal on\nmigration/rule of law"]

    TRIGGER2 --> MATH["EPP seeks alternative\nmajority: EPP 185+ECR 81+\nPfE 85+ESN 27 = 378\n(need 361)"]
    TRIGGER2 --> OPPOSITION["Progressive opposition\ncoalition: S&D+Renew+Greens+Left\n= 311 (minority)"]

    MATH --> NI_SEARCH["EPP needs 3+ NI or\ndissident S&D votes\nfor majority"]
    MATH --> INSTABILITY["Coalition instability:\nEPP-right deals\ncase-by-case"]

    NI_SEARCH --> FAR_RIGHT_GOVERNANCE["Far-right de facto\nco-governance of EU\nlegislation 2027-2029"]
    INSTABILITY --> PRODUCTIVITY["Legislative productivity\nfalls 40-50%; EP10\ndefined by what it\nfailed to pass"]

    OPPOSITION --> COUNTER["S&D leads high-profile\nopposition campaign;\nbuilds EP11 narrative"]
    COUNTER --> ELECTION["2029 EP elections\nbecome explicit\ndemocracy vs. far-right\nplebiscite"]

    style TRIGGER2 fill:#8B0000,color:#fff
    style FAR_RIGHT_GOVERNANCE fill:#8B0000,color:#fff
    style ELECTION fill:#0066CC,color:#fff
```

**Assessment:** Probability 30% (WEP C2). The terminal node ELECTION (if coalition collapses) could actually be POSITIVE for EU democracy — a clear democratic choice in 2029 is healthier than a murky centre-right accommodation. But the FAR_RIGHT_GOVERNANCE path (2027–2029) is the near-term negative consequence.

---

## 3. Consequence Tree 3 — AI Act Implementation Success

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","lineColor":"#90CAF9"}}}%%
flowchart TD
    TRIGGER3["TRIGGER: AI Act fully\nimplemented by 2027\n(all 47 delegated acts;\nAI Office operational)"]

    TRIGGER3 --> STANDARD["EU AI governance\nbecomes global standard\n(Brussels effect — 43+\njurisdictions referencing it)"]
    TRIGGER3 --> TRUST["Citizen AI trust\nincreases: biometric\nbanning in public spaces;\nworkplace AI transparency"]
    TRIGGER3 --> INDUSTRY["EU AI industry scales\nwithin regulatory framework;\nSMEs get proportionate compliance"]

    STANDARD --> GEOPOLITICAL["EU gains geopolitical\nleverage with US and\nChina on AI standards\nnegotiations"]
    TRUST --> PARTICIPATION["Digital citizen participation\nin EU democracy increases;\nAI-misinformation risk reduced"]
    INDUSTRY --> INNOVATION["European AI champions\nemerge in healthcare,\nfintech, climate"]

    GEOPOLITICAL --> STRATEGIC["Strategic autonomy:\nEU defines terms of\nglobal AI governance\nnot Big Tech"]
    INNOVATION --> JOBS2["100,000+ AI sector\njobs in EU by 2029\n(scenario dependent)"]

    style TRIGGER3 fill:#006600,color:#fff
    style STRATEGIC fill:#006600,color:#fff
    style JOBS2 fill:#006600,color:#fff
```

**Assessment:** Probability 45% (WEP C2 for FULL success; partial success more likely at 65%). This positive consequence tree shows the upside of the AI Act — and why implementation quality matters enormously. A botched implementation where key provisions are de facto unenforceable would NOT produce these consequences.

---

## 4. Summary Consequence Assessment

| Event | Probability | Key Consequence | Reversibility |
|-------|------------|-----------------|---------------|
| CID dilution | 60% (WEP B3) | Carbon lock-in 5-7 years | LOW — industrial investment cycles are 10+ years |
| Coalition collapse | 30% (WEP C2) | Far-right co-governance 2027-2029 | MEDIUM — 2029 elections provide correction path |
| AI Act success | 45% (WEP C2) | EU AI governance standard | HIGH — global standards can be iterated |
| Ukraine policy reversal | 25% (WEP D2) | Existential EU credibility crisis | LOW — trust once broken is hard to rebuild |

---
*Sources: EP legislative pipeline; EP adopted texts analysis; consequence tree methodology per ai-driven-analysis-guide.md.*
*WEP grades applied: A=Almost Certainly / B=Likely / C=Possible / D=Unlikely / E=Remote.*
*Confidence: MEDIUM — consequence mapping is inherently speculative beyond immediate first-order effects.*
