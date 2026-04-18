# 🇪🇺 EU-27 → World Bank Country Code Mapping

> **Purpose**: Maps all 27 EU member states plus comparison country groups to World Bank codes, with EP political entity mapping for cross-referencing parliamentary data with economic indicators.

**📅 Last Updated:** 2026-04-12 | **🏷️ Classification:** Public

---

## EU-27 Member States

> **⚠️ Country Code Note**: The `worldbank-mcp` tool's `countryCode` parameter accepts **both** ISO 3166-1 alpha-2 codes (e.g., `DE`) and World Bank alpha-3 codes (e.g., `DEU`). The TypeScript utility `EU_COUNTRY_CODES` in `src/utils/world-bank-data.ts` maps ISO2 → WB alpha-3 for internal use.

| # | Country | ISO2 | WB Alpha-3 | WB Region | Income Level | EP Seats | Capital |
|---|---------|------|-----------|-----------|-------------|----------|---------|
| 1 | 🇦🇹 Austria | `AT` | `AUT` | Europe & Central Asia | High income | 20 | Vienna |
| 2 | 🇧🇪 Belgium | `BE` | `BEL` | Europe & Central Asia | High income | 22 | Brussels |
| 3 | 🇧🇬 Bulgaria | `BG` | `BGR` | Europe & Central Asia | Upper middle income | 17 | Sofia |
| 4 | 🇭🇷 Croatia | `HR` | `HRV` | Europe & Central Asia | High income | 12 | Zagreb |
| 5 | 🇨🇾 Cyprus | `CY` | `CYP` | Europe & Central Asia | High income | 6 | Nicosia |
| 6 | 🇨🇿 Czechia | `CZ` | `CZE` | Europe & Central Asia | High income | 21 | Prague |
| 7 | 🇩🇰 Denmark | `DK` | `DNK` | Europe & Central Asia | High income | 15 | Copenhagen |
| 8 | 🇪🇪 Estonia | `EE` | `EST` | Europe & Central Asia | High income | 7 | Tallinn |
| 9 | 🇫🇮 Finland | `FI` | `FIN` | Europe & Central Asia | High income | 15 | Helsinki |
| 10 | 🇫🇷 France | `FR` | `FRA` | Europe & Central Asia | High income | 81 | Paris |
| 11 | 🇩🇪 Germany | `DE` | `DEU` | Europe & Central Asia | High income | 96 | Berlin |
| 12 | 🇬🇷 Greece | `GR` | `GRC` | Europe & Central Asia | High income | 21 | Athens |
| 13 | 🇭🇺 Hungary | `HU` | `HUN` | Europe & Central Asia | High income | 21 | Budapest |
| 14 | 🇮🇪 Ireland | `IE` | `IRL` | Europe & Central Asia | High income | 14 | Dublin |
| 15 | 🇮🇹 Italy | `IT` | `ITA` | Europe & Central Asia | High income | 76 | Rome |
| 16 | 🇱🇻 Latvia | `LV` | `LVA` | Europe & Central Asia | High income | 9 | Riga |
| 17 | 🇱🇹 Lithuania | `LT` | `LTU` | Europe & Central Asia | High income | 11 | Vilnius |
| 18 | 🇱🇺 Luxembourg | `LU` | `LUX` | Europe & Central Asia | High income | 6 | Luxembourg |
| 19 | 🇲🇹 Malta | `MT` | `MLT` | Middle East & North Africa | High income | 6 | Valletta |
| 20 | 🇳🇱 Netherlands | `NL` | `NLD` | Europe & Central Asia | High income | 31 | Amsterdam |
| 21 | 🇵🇱 Poland | `PL` | `POL` | Europe & Central Asia | High income | 53 | Warsaw |
| 22 | 🇵🇹 Portugal | `PT` | `PRT` | Europe & Central Asia | High income | 21 | Lisbon |
| 23 | 🇷🇴 Romania | `RO` | `ROU` | Europe & Central Asia | High income | 33 | Bucharest |
| 24 | 🇸🇰 Slovakia | `SK` | `SVK` | Europe & Central Asia | High income | 15 | Bratislava |
| 25 | 🇸🇮 Slovenia | `SI` | `SVN` | Europe & Central Asia | High income | 9 | Ljubljana |
| 26 | 🇪🇸 Spain | `ES` | `ESP` | Europe & Central Asia | High income | 61 | Madrid |
| 27 | 🇸🇪 Sweden | `SE` | `SWE` | Europe & Central Asia | High income | 21 | Stockholm |

**Total EP seats**: 720

---

## 🌍 Comparison Country Groups

### G7 Non-EU (Global Competitiveness Benchmark)

| Country | ISO2 | WB Alpha-3 | GDP Rank | Use Case |
|---------|------|-----------|----------|----------|
| 🇺🇸 United States | `US` | `USA` | 1st | Trade, technology, defence, economic benchmark |
| 🇬🇧 United Kingdom | `GB` | `GBR` | 6th | Post-Brexit comparison; regulatory divergence |
| 🇯🇵 Japan | `JP` | `JPN` | 4th | Aging society, technology, trade partner |
| 🇨🇦 Canada | `CA` | `CAN` | 9th | Trade partner (CETA); regulatory alignment |

### BRICS+ (Geopolitical Counterweights)

| Country | ISO2 | WB Alpha-3 | GDP Rank | Use Case |
|---------|------|-----------|----------|----------|
| 🇨🇳 China | `CN` | `CHN` | 2nd | Strategic autonomy; supply chains; trade balance |
| 🇮🇳 India | `IN` | `IND` | 5th | Trade negotiations; climate; development |
| 🇧🇷 Brazil | `BR` | `BRA` | 8th | Mercosur trade; deforestation; agriculture |
| 🇷🇺 Russia | `RU` | `RUS` | 11th | Sanctions impact; energy dependency; security |
| 🇿🇦 South Africa | `ZA` | `ZAF` | 33rd | Development; trade; minerals |

### EU Candidate States (Enlargement Monitoring)

| Country | ISO2 | WB Alpha-3 | Status | Use Case |
|---------|------|-----------|--------|----------|
| 🇺🇦 Ukraine | `UA` | `UKR` | Candidate (2022) | Reconstruction; accession progress; defence |
| 🇹🇷 Türkiye | `TR` | `TUR` | Candidate (1999) | Migration; customs union; geopolitics |
| 🇷🇸 Serbia | `RS` | `SRB` | Candidate (2012) | Western Balkans; rule of law |
| 🇲🇪 Montenegro | `ME` | `MNE` | Candidate (2010) | Frontrunner accession |
| 🇦🇱 Albania | `AL` | `ALB` | Candidate (2014) | Western Balkans stability |
| 🇲🇰 North Macedonia | `MK` | `MKD` | Candidate (2005) | Bilateral issues; rule of law |
| 🇲🇩 Moldova | `MD` | `MDA` | Candidate (2022) | Eastern Partnership; security |
| 🇧🇦 Bosnia & Herzegovina | `BA` | `BIH` | Candidate (2022) | State-building; EU accession path |
| 🇬🇪 Georgia | `GE` | `GEO` | Candidate (2023) | Democracy; Eastern Partnership |

### Key Trade Partners & Neighbours

| Country | ISO2 | WB Alpha-3 | Relationship | Use Case |
|---------|------|-----------|-------------|----------|
| 🇰🇷 South Korea | `KR` | `KOR` | FTA partner | Trade; technology; IP |
| 🇦🇺 Australia | `AU` | `AUS` | FTA negotiations | Trade; minerals; climate |
| 🇳🇴 Norway | `NO` | `NOR` | EEA member | Single market; energy; fisheries |
| 🇨🇭 Switzerland | `CH` | `CHE` | Bilateral agreements | Financial services; research; Schengen |
| 🇮🇱 Israel | `IL` | `ISR` | Association agreement | Trade; technology; geopolitics |

---

## 📊 Aggregate & Regional Codes

| Code | Description | Use Case |
|------|-------------|----------|
| `EUU` | European Union aggregate | EU-wide indicators (GDP, inflation, unemployment) |
| `EMU` | Euro area | Eurozone-specific monetary indicators |
| `OED` | OECD members | High-income country benchmark |
| `WLD` | World | Global average benchmark |
| `ECS` | Europe & Central Asia (WB region) | Broader European comparison |
| `NAC` | North America | US/Canada transatlantic comparison |
| `EAS` | East Asia & Pacific | Asia-Pacific trade benchmark |
| `SSF` | Sub-Saharan Africa | Development cooperation context |

---

## 🏛️ EP Political Group → Country Presence

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
graph LR
    subgraph "Political Groups by Country Strength"
        EPP["<b>EPP</b><br/>DE 🇩🇪 PL 🇵🇱 RO 🇷🇴<br/>ES 🇪🇸 FR 🇫🇷 IT 🇮🇹"]
        SD["<b>S&D</b><br/>ES 🇪🇸 IT 🇮🇹 DE 🇩🇪<br/>RO 🇷🇴 PT 🇵🇹"]
        REN["<b>Renew</b><br/>FR 🇫🇷 DE 🇩🇪 NL 🇳🇱<br/>IE 🇮🇪"]
        ECR["<b>ECR</b><br/>PL 🇵🇱 IT 🇮🇹 CZ 🇨🇿<br/>SE 🇸🇪"]
        GREEN["<b>Greens/EFA</b><br/>DE 🇩🇪 FR 🇫🇷 NL 🇳🇱<br/>BE 🇧🇪"]
        LEFT["<b>The Left</b><br/>FR 🇫🇷 DE 🇩🇪 ES 🇪🇸<br/>GR 🇬🇷"]
        PFE["<b>PfE/ID</b><br/>FR 🇫🇷 IT 🇮🇹 AT 🇦🇹"]
    end

    style EPP fill:#003399,color:#fff
    style SD fill:#dc3545,color:#fff
    style REN fill:#ffc107,color:#000
    style ECR fill:#17a2b8,color:#fff
    style GREEN fill:#28a745,color:#fff
    style LEFT fill:#800020,color:#fff
    style PFE fill:#0d47a1,color:#fff
```

| Political Group | Strongest Countries (by seats) | Key Economic Indicators |
|----------------|-------------------------------|------------------------|
| **EPP** | DE, PL, RO, ES, FR, IT | GDP, Unemployment, Trade |
| **S&D** | ES, IT, DE, RO, PT | Unemployment, GINI, Health Expenditure |
| **Renew** | FR, DE, NL, IE | GDP Growth, FDI, R&D Expenditure |
| **ECR** | PL, IT, CZ, SE | Military Expenditure, Trade, GDP Growth |
| **Greens/EFA** | DE, FR, NL, BE | CO₂ Emissions, Renewable Energy, Forest Area |
| **The Left** | FR, DE, ES, GR | Unemployment, GINI, Health Expenditure |
| **PfE/ID** | FR, IT, AT | Military Expenditure, Net Migration, GDP |

---

## 🗺️ Economic Clusters for Analysis

### High GDP (>$1T GDP)
Germany (DE), France (FR), Italy (IT), Spain (ES), Netherlands (NL), Poland (PL)

**Best indicators**: GDP Growth, Trade, FDI, R&D Expenditure, Military Expenditure

### Convergence States (GDP per capita < EU average)
Bulgaria (BG), Romania (RO), Croatia (HR), Poland (PL), Hungary (HU), Latvia (LV), Lithuania (LT), Slovakia (SK), Greece (GR)

**Best indicators**: GDP per Capita, GDP Growth, Unemployment, Youth Unemployment, FDI

### Nordic/High-Income
Denmark (DK), Finland (FI), Sweden (SE), Luxembourg (LU), Ireland (IE), Netherlands (NL), Austria (AT)

**Best indicators**: R&D Expenditure, Renewable Energy, Education Expenditure, Internet Users

### Eurozone Core
Germany (DE), France (FR), Italy (IT), Spain (ES), Netherlands (NL), Belgium (BE), Austria (AT)

**Best indicators**: Inflation, GDP Growth, Unemployment, Government Expenditure, Tax Revenue

---

## 📊 Recommended Country Comparisons

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
graph TD
    subgraph "Comparison Patterns"
        B4["<b>Big Four</b><br/>DE, FR, IT, ES<br/>~73% EU GDP"]
        F6["<b>Founding Six</b><br/>DE, FR, IT, NL, BE, LU<br/>Historical convergence"]
        EW["<b>East vs West</b><br/>PL,RO,HU,CZ vs DE,FR,NL,AT<br/>Cohesion policy"]
        NOR["<b>Nordic</b><br/>DK, FI, SE + NO<br/>Social model"]
        MED["<b>Mediterranean</b><br/>IT, ES, GR, PT, CY, MT<br/>Fiscal governance"]
        EUUS["<b>EU vs US/CN</b><br/>EUU vs US, CN<br/>Global competitiveness"]
    end

    style B4 fill:#003399,color:#fff
    style F6 fill:#0d6efd,color:#fff
    style EW fill:#ffc107,color:#000
    style NOR fill:#28a745,color:#fff
    style MED fill:#fd7e14,color:#fff
    style EUUS fill:#6f42c1,color:#fff
```

| Comparison | Countries | Use For |
|-----------|-----------|---------|
| **Big Four** | DE, FR, IT, ES | Macro-economic articles; fiscal governance |
| **Founding Six** | DE, FR, IT, NL, BE, LU | Historical convergence; integration depth |
| **East vs West** | PL/RO/HU/CZ vs DE/FR/NL/AT | Cohesion policy; convergence debates |
| **Nordic** | DK, FI, SE + NO | Social policy; renewable energy; digital |
| **Mediterranean** | IT, ES, GR, PT, CY, MT | Tourism; agriculture; fiscal; youth jobs |
| **EU vs G7** | EUU vs US, GB, JP, CA | Global competitiveness; technology |
| **EU vs BRICS** | EUU vs CN, IN, BR, RU | Geopolitics; strategic autonomy |
| **EU vs Candidates** | EUU vs UA, TR, RS | Enlargement readiness; convergence |

---

## ⚠️ Data Notes

1. **Malta**: WB region is "Middle East & North Africa" (geographic, not political)
2. **EU aggregate (EUU)**: Not all indicators available at EU level
3. **Data lag**: Most indicators 1-2 years behind current date
4. **Comparison countries**: All work with WB MCP tools using ISO2 codes
5. **Russia (RU)**: Some indicators may have reduced availability post-2022
6. **Candidate states**: Some indicators (GINI, health) have gaps
7. **Annual data only**: All WB indicators are annual time series
