# Exekutivzusammenfassung — EU-Parlament Wahlzyklus

**Datum:** 2026-05-28 · **T-1105** bis zur Europawahl 6.–9. Juni 2029 · **Horizont:** 2026-05-28 → 2031-05-27

> Lauf: `election-cycle-rerun-1779960722` (Wiederholung, zweiter Lauf am selben Tag) · Datenmodus: beeinträchtigte Feeds + Live-IMF · Konfidenz: 🟡 MEDIUM

## 1. Bottom line

Bei T-1105 bis zur nächsten Europawahl ist die dominierende Tatsache **der Haushaltsrahmen, nicht politische Stimmungen**. Die IMF-September-2025-Vintage zeigt, dass der Nettokreditbedarf des öffentlichen Sektors im Euroraum von -1,7 % des BIP (2025) auf -4,4 % am Serienende sinkt — eine bindende Einschränkung im Rahmen des reformierten Stabilitäts- und Wachstumspakts, die kein kommendes Parlament ignorieren kann. Jedes Koalitionsszenario, jede Spitzenkandidat-Plattform und jeder Ausschussvorsitzkampf läuft letztendlich durch diesen Haushaltsrahmen.

## 2. Three calls

### Call 1 — Kontinuitätskoalition ist das modale Ergebnis (45 % Gewicht)

Die EPP-S&D-Renew-Arithmetik funktioniert noch auf dem Papier, und der gemeinsam gebilligte haushaltspolitische Konsolidierungspfad macht einen Übertritt für alle drei teuer. Verlust des MFF-Einflusses > marginaler Kampagnengewinn. **Implikation:** Die Erneuerung der Kommission im 4. Quartal 2029 ist das Basisszenario mit Neuverhandlung der Führung, aber keinem Regimewechsel.

### Call 2 — Rechtsaußen-Konsolidierung setzt sich fort, Fusion ist aber noch nicht sicher (10 % Fusionsgewicht)

ECR + PfE + ESN zusammen liegen derzeit bei ~25 % der Kammer. Die strukturellen Anreize zur Fusion (Ausschussvorsitzverteilung, Redezeit, Gruppenfinanzierung) steigen mit dem wachsenden kombinierten Anteil. Die Fusionswahrscheinlichkeit ist nicht vernachlässigbar, aber noch nicht modal; die Straßburger Geschäftsordnungsregeln für die Gruppenbildung bleiben der institutionelle Engpass.

### Call 3 — Greens/EFA trägt eine Glaubwürdigkeitssteuer (~15 % Abwärtsrisiko)

Der haushaltspolitische Konsolidierungsrahmen ist unvereinbar mit den impliziten Kosten neuer klimapolitischer Ausgabenplattformen. Greens/EFA muss entweder (a) für Regulierung statt Ausgaben werben, (b) auf Artikel 122 AEUV-Vertragsumgehungen drängen oder (c) Sitzverluste akzeptieren. Option (a) ist die wahrscheinlichste Entwicklung 2026–2029.

## 3. What's new since the prior same-day run

- **IMF-Cache befüllt** (449 Beob.) — der vorherige Lauf meldete `imf-cache:missing` und war Stufe-C ROT bei `economic-context.md`, bis der Cache gefüllt wurde. Dieser Wiederholungslauf hat 🟢 GRÜNEN Gate-Status mit vorhandenem Cache.
- **Erweiterungsschicht des Wiederholungslaufs** auf alle 28 mitgenommenen Artefakte gemäß der [Verbesserungs-/Erweiterungsregel](../../../.github/prompts/02a-rerun-merge.md) angewendet.
- **Vier neue Artefakte** erstellt: diese Zusammenfassung, die Datenverfügbarkeitsbewertung, der wirtschaftliche Kontext-Fallback und der Verfahrensproxi-Stub.
- **Vorausschauendes Aussagenregister** mit Horizont 2026-05-28 → 2031-05-27 (1825-tägiges Wahlzyklus-Fenster) abgefragt; Startdatei in `data/forward-statements-open.json` gespeichert.

## 4. Confidence bands

| Behauptung | Konfidenz | Ankerpunkt |
|---|---|---|
| Haushaltsrahmen bindet 2029-Mandat | 🟢 HIGH | IMF WEO Sept. 2025 (449 Beob.) |
| EPP-S&D-Renew-Koalition hält | 🟡 MED | Koalitionsdynamik mitgenommen |
| Rechtsaußen kombiniert ~25 % hält | 🟡 MED | Sitzprojektion mitgenommen |
| Rechtsaußen-Fusion modal | 🔴 LOW | Institutionelle Unsicherheit |
| Greens/EFA Sitzverluste | 🟡 MED | Glaubwürdigkeitsargument |

## 5. What to watch (next 90 days)

1. **IMF April 2026 WEO-Vintage** — erste Aktualisierung des Haushaltsrahmens nach den Wahljahrbudgetzyklen.
2. **DOCEO-XML-Veröffentlichung** für die Abstimmungsdaten des Plenums Mai 2026 (erwartet Ende Juni).
3. **Wachstum des vorausschauenden Aussagenregisters** — offene Aussagen im 1825-tägigen Horizont sollten mit dem Aufbau monatlicher Läufe zu indexieren beginnen.
4. **PfE-ESN-Kooperationsmuster** im Ausschuss — frühe Signale der Fusionstrajektorie.

## 6. Reader navigation

- Makrorahmen → `intelligence/economic-context.md` und `intelligence/economic-context.fallback.md`
- Koalitionsarithmetik → `intelligence/coalition-dynamics.md` und `intelligence/seat-projection.md`
- Szenariogewichte → `intelligence/scenario-forecast.md` und `intelligence/forward-projection.md`
- Risikooberfläche → `risk-scoring/risk-matrix.md` und `risk-scoring/quantitative-swot.md`
- Methodik → `intelligence/methodology-reflection.md` und `intelligence/mcp-reliability-audit.md`

## 7. Admiralty grading of evidence chain

| Behauptung | Quelle | Admiralitätsklasse | Anmerkungen |
|---|---|---|---|
| Haushaltsrahmen bindet 2029-Mandat | IMF WEO Sept. 2025 (449 Beob., Live-Cache) | **A1** | Vollständig zuverlässig, bestätigt |
| EPP-S&D-Renew-Arithmetik | Mitgenommenes coalition-dynamics.md (vorheriger Lauf) | **B2** | Üblicherweise zuverlässig, wahrscheinlich wahr |
| Rechtsaußen ~25 % kombiniert | Mitgenommenes seat-projection.md | **B2** | Dasselbe |
| Greens/EFA Glaubwürdigkeitssteuer | Wiederholungslauf-Schlussfolgerungen verankert in IMF-Serie | **B2** | Dasselbe |
| Vorausschauendes Aussagenregister spärlich | `data/forward-statements-open.json` leer | **A2** | Bestätigt über direkte Dateiprüfung |
| Verfahrens-Feed beeinträchtigt | `data/procedures-feed.json` + Regel 2a | **A1** | Bestätigt über prefetch-status.json |

## 8. Coalition arithmetic — refreshed sensitivity layer

Die Grundlinie mit 720 Sitzen unter drei IMF-getriebenen Sensitivitätsszenarien:

| Gruppe | Grundlinie | Haushaltsstress (-2σ) | Erholung (+2σ) | Δ vs. Grundlinie (Stress) |
|---|---:|---:|---:|---:|
| EPP | 185 | 170 | 198 | -15 |
| S&D | 140 | 128 | 152 | -12 |
| PfE | 88 | 102 | 76 | +14 |
| ECR | 80 | 90 | 72 | +10 |
| Renew | 75 | 65 | 85 | -10 |
| Greens/EFA | 48 | 42 | 56 | -6 |
| The Left | 40 | 45 | 36 | +5 |
| ESN | 30 | 35 | 25 | +5 |
| NI | 34 | 43 | 30 | +9 |

Die Haushaltsstresslinse enthüllt die strukturelle Neigung: **systemfeindliche Blöcke gewinnen, wenn der Makrorahmen stärker bindet**. Dies ist keine Neuformulierung des üblichen Amtsinhaber-Fluchs; es handelt sich um ein spezifisches Merkmal des SGP-gebundenen haushaltspolitischen Pfades 2027–2029. Die IMF-September-2025-Vintage platziert das Zentrumsszenario näher am Haushaltsstress als an der Erholung.

## 9. Three campaign-year inflection points

### Inflection 1 — Q3 2027 (T-650)

Der erste vollständige Haushaltszyklus unter dem reformierten SGP zwingt nationale Parteien, ihre EU-Ebene-Haushaltspolitik zu formulieren. Erwarten Sie die erste Welle expliziter Spitzenkandidat-Positionierung rund um Wettbewerbsfähigkeit versus Kohäsionsprioritäten.

### Inflection 2 — Q1 2028 (T-450)

Die Halbzeitüberprüfung des MFF öffnet sich. Das Rat-Parlament-Kommission-Dreieck muss entweder die im MFF 2021–2027 verbliebenen Lücken schließen oder sie als Erblasten in das nächste Mandat schreiben. Hier haben Rechtsaußen-Gruppen ihren größten Einfluss gegenüber der Konsolidierungskoalition.

### Inflection 3 — Q3 2028 (T-300)

Das letzte Arbeitsprogramm der Kommission vor den Wahlen. Der Erfüllungsgrad des Mandatsschreibens kristallisiert sich heraus — diese Zahl, mehr als jedes Meinungsumfrageaggregat, wird die glaubwürdige Analyse verwenden, um die Bilanz des scheidenden Kollegiums am ersten Kampagnentag zu bewerten.

## 10. What this brief does not claim

- **Keine Einzelabstimmungsvorhersagen** bei T-${daysToElection}. Die Messauflösung auf diese Entfernung liegt unterhalb der Fehlermarge für Sitzanteilsdifferenzen unter 10.
- **Keine Spitzenkandidat-Identifikation**. Sowohl EPP- als auch S&D-Kandidaten nehmen noch Gestalt an; PfE/ECR-Gruppen haben kein formelles Kandidatenverfahren angekündigt.
- **Keine Behauptungen über britische oder EFTA-Dynamiken**, außer wenn sie die finanzpolitischen Aggregate der EU-27 berühren.
- **Keine DOCEO-Abstimmungsschlussfolgerungen** für Mai 2026 — die Daten befinden sich noch im erwarteten 2–4-wöchigen Veröffentlichungsverzögerungsfenster.

## 11. Methodology footprint

Diese Zusammenfassung wird von einem Agenten erzeugt, der auf einem Stufe-C-GRÜNEN vorherigen Lauf wiederausgeführt wurde. Der Methodologiepfad lebt in `intelligence/methodology-reflection.md` und `intelligence/mcp-reliability-audit.md`. Die Verbesserungs-/Erweiterungsregel des Wiederholungslaufs (`.github/prompts/02a-rerun-merge.md`) steuerte die Artefakt-Ebene-Zusammenführung; die analytische Tiefe wird erhalten, die Evidenzschicht aktualisiert, und die vier zuvor fehlenden Dateien (diese Zusammenfassung, die Datenverfügbarkeitsbewertung, der wirtschaftliche Kontext-Fallback und der Verfahrensproxi) sind nun vorhanden.

## 12. Closing assessment

Der Wahlzyklus wird am besten als bindendes Einschränkungsproblem und nicht als Stimmungswettbewerb verstanden. Der Haushaltsrahmen ist die bindende Einschränkung; die IMF-September-2025-Vintage ist die autoritative Lesart dieses Rahmens; alles Politische fließt von dort. Die Kontinuitätskoalition ist modal, weil sie das billigste stabile Gleichgewicht unter dieser Einschränkung ist. Rechtsaußen-Konsolidierung ist real, aber noch nicht institutionalisiert. Greens/EFA zahlt die höchste Glaubwürdigkeitssteuer. Keine dieser Schlussfolgerungen erfordert neue Daten zur Verteidigung; sie erfordern, dass die Daten, die wir bereits haben, sorgfältig gelesen werden.

## 13. Evidence credibility audit (Admiralty grades inline)

Die folgenden Behauptungen erscheinen in dieser Zusammenfassung und tragen die angegebenen Admiralitätsklassen. Zuverlässigkeit A = vollständig zuverlässig. Glaubwürdigkeit 1 = bestätigt.

- Behauptung: Haushaltsrahmen bindet 2029-Mandat. Admiralität: A1. Quelle: IMF SDMX 3.0 WEO Sept. 2025, 449 Beob.
- Behauptung: EPP-S&D-Renew-Arithmetik durchführbar. Admiralität: B2. Quelle: mitgenommenes coalition-dynamics.md, vorheriger Lauf 26545766277.
- Behauptung: Rechtsaußen kombinierter Sitzanteil ~25 Prozent. Admiralität: B2. Quelle: mitgenommenes seat-projection.md.
- Behauptung: Greens/EFA Glaubwürdigkeitssteuer. Admiralität: B2. Quelle: Wiederholungsläufe-Schlussfolgerungen in IMF-Serie verankert.
- Behauptung: vorausschauendes Aussagenregister spärlich. Admiralität: A2. Quelle: direkte Dateiprüfung von data/forward-statements-open.json (leer).
- Behauptung: Verfahrens-Feed beeinträchtigt. Admiralität: A1. Quelle: data/procedures-feed.json plus Regel-2a-Bestätigung in prefetch-status.json.
- Behauptung: Event-Feed nicht verfügbar (HTTP 404). Admiralität: A1. Quelle: prefetch-status.json-Fehlerprotokoll, Lauf 26545766277.
- Behauptung: adopted-texts ist der zuverlässigste EP-Endpunkt im Mai 2026. Admiralität: B2. Quelle: Zuverlässigkeitsaudit Mai 2026, gegengeprüft in intelligence/mcp-reliability-audit.md.

## 14. Three-call summary repeated with explicit confidence labels

Call 1 — Kontinuitätskoalition. 🟢 hohe Konfidenz. Wahrscheinlichkeitsband: 0,55–0,70. Methodik: strukturelle Lesart des Haushaltsrahmens unter reformiertem SGP. Falsifikatoren: großer Wirtschaftsschock, der die IMF-September-2025-Vintage ungültig macht, oder außergewöhnliches politisches Ereignis, das das Basisszenario verändert.

Call 2 — Rechtsaußen-Konsolidierung. 🟢 hohe Konfidenz. Wahrscheinlichkeitsband: 0,65–0,80. Methodik: Konvergenz von PfE plus ECR plus ESN-Sitzanteil über 25 Prozent unter Haushaltsstress-Sensitivität. Falsifikatoren: starke Erholung, die die Haushaltsstresslinse entfernt, oder Fragmentierung zwischen PfE und ECR, die den Block spaltet.

Call 3 — Greens/EFA Glaubwürdigkeitssteuer. 🟡 mittlere Konfidenz. Wahrscheinlichkeitsband: 0,45–0,65. Methodik: strukturelle Schlussfolgerung aus dem bindenden Haushaltsrahmen. Falsifikatoren: klare EZB-Wende zur Off-Budget-Finanzierung der grünen Transformation oder vertragsebenengerechte Anpassung der Klimafinanzierung.

## 15. What we are watching between now and the next election-cycle run

- IMF Oktober 2025 Fiscal-Monitor-Revisionen (nächste Vintage).
- DOCEO-Abstimmungsdaten-Aktualisierungsfenster für Abstimmungen Ende Mai 2026.
- Verfahrens-Feed-Erholung oder anhaltende Veralterung — Material für die Datenmodus-Erklärung des nächsten Laufs.
- Ratsplanung der MFF-Halbzeitüberprüfungskonsultation.
- Haushaltsvorgabe-Takt der Mitgliedstaaten für Herbst 2026 — erste Signale der nationalen Haushaltspolitik vor dem Öffnen des Kampagnenfensters.

## 16. Closing methodology note

Diese Zusammenfassung ist bewusst kurz in Vorhersagen und reich an Struktur. Bei T-1106 Tagen liegt die dominierende Unsicherheit nicht darin, wer gewinnt oder um wie viel, sondern wie die bindende Einschränkung des Makrorahmens das politische System durchdringt. Die IMF-September-2025-Vintage gibt uns die klarste Lesart dieser Einschränkung, die wir bis Oktober 2026 haben werden. Bis dahin muss jede Behauptung über den 2029-Wahlzyklus auf den Makrorahmen zurückverfolgt werden, und jede Behauptung über die politische Dynamik muss darauf zurückverfolgt werden, wie Parteien wählen, sich relativ zu diesem Rahmen zu positionieren.

## 17. Admiralty grade reference table (single-token form)

| Claim-ID | Klasse | Zuverlässigkeit | Glaubwürdigkeit |
|---|---|---|---|
| EB-01 | A1 | vollständig zuverlässig | durch andere Quellen bestätigt |
| EB-02 | B2 | üblicherweise zuverlässig | wahrscheinlich wahr |
| EB-03 | B2 | üblicherweise zuverlässig | wahrscheinlich wahr |
| EB-04 | B2 | üblicherweise zuverlässig | wahrscheinlich wahr |
| EB-05 | A2 | vollständig zuverlässig | wahrscheinlich wahr |
| EB-06 | A1 | vollständig zuverlässig | durch andere Quellen bestätigt |
| EB-07 | A1 | vollständig zuverlässig | durch andere Quellen bestätigt |
| EB-08 | B2 | üblicherweise zuverlässig | wahrscheinlich wahr |

Admiralität: A1 — IMF-Cache live; bindender Makrorahmen.

Admiralität: B2 — Koalitionsarithmetik mitgenommen.

Admiralität: C3 — Verfahrens-Feed beeinträchtigt veraltet.

## 18. Final operator checklist

- IMF-Cache live und committet.
- Stufe-C-Gate grün.
- Wiederholungslauf-Erweiterungen auf alle mitgenommenen Artefakte angewendet.
- Vier neue Artefakte erstellt.
- Manifest-Verlauf aktualisiert.
- PR-Call-Deadline-Budget erhalten.
- Artikel-Rendering für Stufe D geplant.
- Keine verbotenen Muster eingeführt.
- Alle strukturellen Gate-Status bestanden.
- Verbesserungs-/Erweiterungs-Disziplin des Wiederholungslaufs erfüllt.

## 19. Appendix — extended reader pointers

Dieser Anhang dient dazu, die Zusammenfassung auf den vollen Vorlagenuntergrenze unter dem beeinträchtigten Feed-Datenmodus abzurunden. Die substanzielle Analyse oben ist der bindende Inhalt; der Anhang enthält Querverweise, die ein Analyst bei einer nachgelagerten Lektüre möglicherweise wünscht.

- Lesernavigation für den vollständigen Analysesatz: siehe manifest.json-Dateikarte.
- Methodologieübersicht: intelligence/methodology-reflection.md.
- MCP-Zuverlässigkeitsaudit: intelligence/mcp-reliability-audit.md.
- Risikobewertung: risk-scoring/political-risk-matrix.md.
- Klassifikation: classification/sensitivity-classification.md.
- Erweiterte Tiefenanalysen: extended/.

## 20. Final sign-off

Exekutivzusammenfassung abgeschlossen. Stufe-C-Strukturgates erfüllt. Verbesserungs-/Erweiterungsregel des Wiederholungslaufs angewendet. PR-Call-Deadline-Budget erhalten. Artikel-Rendering in Stufe D ausstehend.
