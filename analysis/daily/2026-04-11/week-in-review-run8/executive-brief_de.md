<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Führungskräfte-Kurzübersicht — EP Wochenbericht: 4.–11. April 2026 (Osterrezesspause Woche 3) | 2026-04-11

**Einstufung:** OSINT — Öffentliche parlamentarische Aufzeichnung
**Vertrauensgrad:** 🟡 MEDIUM (keine Live-Feeddaten; Risikotrajektorie aus vorab berechneten Statistiken + 14 Vorläufen abgeleitet; **0 / 13 EP-API-Feeds am 10. April in Betrieb**)
**Lauf:** `analysis/daily/2026-04-11/week-in-review-run8/`
**Abdeckung:** 2026-04-04 → 2026-04-11 (Recesswoche 3, Tage 9–16 einer 18-tägigen Osterpause)
**Erstellt:** 2026-05-16 (retrospektives Briefing, keine neuen MCP-Aufrufe)
**Primärquellen:** EP-MCP-vorberechnete Statistiken (140 K Zeichen), coalition-dynamics (11,6 K Zeichen); 14 frühere Workflow-Analyseläufe.

---

## 🎯 BLUF

**Das Parlament befand sich die gesamte Woche in der Pause — dennoch stieg die zusammengesetzte politische Risikobewertung in drei Tagen um 31 % (10,10 → 13,17 am 9.–11. April).** Diese kontraintuitive Eskalation während legislativer Stille ist der wichtigste Einzelbefund des Briefings. Sie wird von **drei konvergierenden externen Drücken angetrieben, auf die der Gesetzgeber bis zur Ausschusswiederaufnahme am 14. April nicht reagieren kann**: (1) **US-Zollkrise nähert sich dem Stichtag 15. April** (Geopolitisches Bestandsrisiko **20/25 KRITISCH**); (2) **Zollkrisenrisiko 16/25 KRITISCH** — INTA-Notmaßnahmen erforderlich an Tag 1 der Ausschusswiederaufnahme; (3) **Legislativer Rückstaurisiko 13/25 HOCH** — 18-tägige Pause auf 4-tägige Ausschusswoche komprimiert. Der EP-API-Fehlermodus ist selbst ein Geheimdienstsignal: **Alle 13 Endpunkte wurden schrittweise abgebaut und erreichten am 10. April vollständige Nichtverfügbarkeit**, was die operative Überwachung zum falschen Zeitpunkt einschränkt. Der strukturelle Befund der Woche: **Die Große Koalition (EPP+S&D+Renew = 396 Sitze, 55 %) weist ein −5,5 %-Überschuss-Defizit auf** — sie erreicht nicht die Arbeitsmehrheit, die für eine konsequente Regierungsführung erforderlich ist, was bedeutet, dass **EPP ad-hoc-Mehrheiten pro Dossier aufbauen muss**. **Renew-ECR-Kohäsion bei 0,95 in Wettbewerbsfähigkeit/Handel** ist die folgenreichste neue Ausrichtung der Recessphase — *in Post-Recess-Abstimmungen unerprobt*, aber wenn sie hält, entsteht eine 340-Sitze-EPP+Renew+ECR-Wettbewerbsfähigkeitskoalition, die **sich der Mehrheit nähert, sie aber nicht erreicht (361 benötigt)**, was die Post-Recess-Koalitionsgeometrie definiert.

---

## 🧭 3 Entscheidungen, die dieses Briefing unterstützt

| # | Entscheidung | Wer entscheidet | Frist | Belege |
|:-:|--------------|-----------------|:-----:|--------|
| 1 | **Priorisierung der Ausschusswiederaufnahme am 14. April** — INTA muss die Zollantwort vorziehen; das ECON-INTA-Doppelengpass bedeutet, dass ein drittes Ausschuss nicht ebenfalls auf dem kritischen Pfad sein kann | Konferenz der Ausschussvorsitzenden | **14. April (T-3 bei Lauf)** | §Risikotrajektorienbeschleunigung; legislativer Rückstau 13/25 HOCH |
| 2 | **EP-API-Notfallplan** — 0 / 13 Feeds in Betrieb; das operative Bild für die Ausschusswiederaufnahme hängt von vorab berechneten Statistiken + Querverweise auf frühere Läufe ab statt von Live-Feeds | EP-Sekretariat; Datenpipeline-Team | laufend | §Parlamentsstatus; Begleitdokument `existing/api-outage-diagnostic.md` |
| 3 | **Lies das Renew-ECR-0,95-Kohäsionssignal als Post-Recess-Koalitionstest** — wenn es in der ersten Post-Recess-Handelsabstimmung hält, schwenkt die EP10-Koalitionsgeometrie vom Standard der Großen Koalition zum Ad-hoc-Pivot-Standard | EPP/Renew/ECR-Gruppenführungen | erste Post-Recess-Handelsabstimmung | §Dreipoliger Koalitionsstruktur |

---

## 📰 60-Sekunden-Lektüre

- 🔴 **Zusammengesetztes Risiko +31 % in 3 Tagen** (10,10 → 13,17) in einer *legislativen Stille*-Woche — das Signal liegt in der Trajektorie, nicht im absoluten Niveau.
- 🟠 **Geopolitisches Bestandsrisiko 20/25 KRITISCH** (US-Zoll 15. April Frist); Zollkrisenrisiko 16/25 KRITISCH.
- 🟢 **Rekordlegislationstempo YTD:** +46,2 % YoY (114 Rechtsakte annualisiert gegenüber 78 im Jahr 2025).
- 🟡 **Durchführbarkeit der Großen Koalition:** **NICHT TRAGFÄHIG** strukturell — EPP+S&D = 44,5 % (benötigen 50,1 %); **EPP+S&D+Renew = 55 %, aber mit −5,5 % Überschuss-Defizit**.
- 🔵 **Fragmentierungsindex 6,59** — höchste in der EP-Geschichte; Mindest-3-Gruppen-Koalition erforderlich.
- 🟣 **Renew-ECR-Kohäsion 0,95** in Wettbewerbsfähigkeit/Handel — die folgenreichste Ausrichtung der Recessphase.
- 🩷 **Struktureller Vorteil des rechten Blocks:** EPP+ECR+PfE = **348 Sitze (48,3 %)** — dominierend in Verteidigung, Deregulierung, Migration; 13 unter der Mehrheit.
- ⚪ **EP-API:** 0 / 13 Feeds am 10. April in Betrieb — INTERNAL_ERROR über alle Endpunkte; vorberechnete Statistiken sind die einzige Signalquelle.

---

## 🏛️ Dreipolige Koalitionskristallisierung

| Pol | Zusammensetzung | Sitze | Anteil | Wo er gewinnt |
|-----|-----------------|:-----:|:------:|---------------|
| **Konservativ-Rechts** | EPP 185 + ECR 79 + PfE 84 | 348 | 48,3 % | Verteidigung, Deregulierung, Migration |
| **Zentrum-Liberal-Pivot** | Renew 76 | 76 | 10,6 % | **Königsmacher bei jeder Flagship-Abstimmung** |
| **Progressiv-Links** | S&D 135 + Greens/EFA 53 + GUE/NGL 46 | 234 | 32,5 % | Green Deal, Sozialpolitik, bürgerliche Freiheiten |

Der strukturelle Befund ist, dass **Renew der Drehpunkt jeder Abstimmung ist** — kein Block erreicht ohne ihn die Mehrheit, und die Recessperioden-0,95-Kohäsion mit ECR in Wettbewerbsfähigkeit signalisiert, in welche Richtung Renew umworben wird.

---

## ⚠️ Zusammenfassung der Risikoindikatoren (vom Lauf-Dashboard)

| Indikator | Wert | Trend | Vertrauensgrad |
|-----------|------|:-----:|:--------------:|
| Zusammengesetztes Risiko | **13,17/25 (HOCH)** | ↑ +31 % in 3 Tagen | 🟡 |
| EP-API-Verfügbarkeit | 0 / 13 Feeds | Verschlechtert | 🟢 (bestätigt) |
| Legislationstempo | +46,2 % YoY | Rekord | 🟢 |
| Fragmentierungsindex | 6,59 | Stabil | 🟢 |
| Tragfähigkeit der Großen Koalition | NICHT TRAGFÄHIG | Strukturell | 🟢 |
| Renew-ECR-Kohäsion | 0,95 | Stabil hoch | 🟡 (post-Recess unerprobt) |
| Dominanz des rechten Blocks | 52,3 % Sitze | Stabil | 🟢 |
| **Zollkrise** | **16/25 KRITISCH** | Frist nähert sich | 🟢 |

---

## 🔮 Top zukünftige Auslöser (nächste 7 Tage)

1. **14. April (T-3 vom Lauf) — Ausschusswiederaufnahme.** Die INTA-Tag-1-Notfall-Zollsitzung ist der binäre Auslöser dafür, ob die parlamentarische Reaktion rechtzeitig oder symbolisch ist.
2. **15. April — US-Zollimplementierungsfrist.** Aktiviert TA-10-2026-0096-Gegenmaßnahmen; das ECR-Abstimmungsverhalten wird der erste Post-Recess-Bruchtest sein.
3. **Erste Post-Recess-Abstimmung mit Renew zu einer Handelsdatei** — Falsifikator für das Renew-ECR-0,95-Kohäsionssignal.
4. **27.–30. April Straßburger Plenarsitzung** — Q2-Agenda-Setting; die Begleit-Monatsvorschau-Briefings decken dies im Detail ab.

---

## 🧭 ACH — Die "Ruhig aber geladen"-Lesart

- **H1 — "Routine-Recess + externer Lärm."** Risikotrajektorie ist Artefakt konvergierender externer Ereignisse, die der Gesetzgeber nicht verursacht hat; Ausschusswiederaufnahme am 14. April absorbiert die Last planmäßig. *Begünstigt durch* Rekordtempo YTD, strukturelle Stabilitätsbewertung (84/100 aus Begleitläufen).
- **H2 — "Vorbruch-Belastung."** Renew-ECR-0,95-Kohäsion ist der Vorläufer eines Wettbewerbsfähigkeits-Koalitionsschwenks; das −5,5 %-Überschuss-Defizit der Großen Koalition ist die zugrundeliegende Schwäche, nicht die externen Drücke. *Begünstigt durch* frühere Lauf-Risikotrajektorie + Fragmentierung 6,59 + strukturell NICHT-TRAGFÄHIG-Befund zur Großen Koalition.

Das Briefing liest H1 als Planungsbasislinie und H2 als den operativ relevanten Stressfall — *die erste Post-Recess-Handelsabstimmung* ist der Falsifikator zwischen beiden.

---

## 🛡️ Bewertung der Quellqualität

- **Keine Live-Feeddaten in dieser Woche — 0 / 13 EP-API-Feeds am 10. April in Betrieb.** Jeder Indikator ist vorberechnete Statistik oder aus früheren Läufen abgeleitet; dies ist der wichtigste Vorbehalt des Briefings.
- **MCP-Server-Gesundheitsbericht** (im Lauf bestätigt) gibt 🟢 HOHE Konfidenz zum API-Ausfall selbst.
- **Risikotrajektorie** verwendet 7 frühere tägliche Läufe (Läufe 3, 4, 5, 6, 12, 157, 158); Konvergenz über unabhängige Läufe ist der primäre kompensierende Beweis.
- **Nettokonfidenz:** 🟡 MEDIUM für Synthese; 🟢 HOCH für Zollrisiko (externe Veröffentlichungsaufzeichnung); 🟡 MEDIUM für Renew-ECR-Ausrichtung (Kohäsionsdaten sind strukturell, Verhalten nach Recess unerprobt).

---

## 📎 Lauf-Artefakte (Lesen-vor-Entscheidung)

| Schicht | Artefakt | Warum |
|---------|----------|-------|
| Artikel | `article.md` | Öffentliche Recesswochenerzählung |
| Synthese | `existing/synthesis-summary.md` | 8 Indikatoren + 3-Pol-Struktur (autoritativ) |
| Bedeutung | `classification/significance-scoring.md` | Ereignisinventur (Recess, Zoll, Renew-ECR) |
| Risiko | `risk-scoring/risk-assessment.md` | Zusammengesetzt 13,17/25, 7-Quellen-Trajektorie |
| Bedrohung | `threat-assessment/threat-analysis.md` | Externe Druck-Bedrohungsfläche |
| Stakeholder | `existing/stakeholder-impact.md` | INTA, EU-Industrie, EPP-Wirtschaftsflügel |
| API-Ausfall | `existing/api-outage-diagnostic.md` | 0 / 13 Feeds — Konfidenzuntergrenze |
| SWOT | `existing/swot-analysis.md` | Stärken/Schwächen während der Recess |
| Begleiter | `analysis/daily/2026-04-13/month-ahead-run4/` | Zukunftsorientiertes Paar zu diesem Retrospektiv |

---

**Dokumentenkontrolle**
- **Vorlagenreferenz:** `analysis/templates/executive-brief.md`
- **Artefaktpfad:** `analysis/daily/2026-04-11/week-in-review-run8/executive-brief.md`
- **Einstufung:** Öffentlich
- **Retrospektiv:** Briefing geschrieben 2026-05-16 aus den gespeicherten Artefakten des Laufs; **Es wurden keine neuen MCP-Aufrufe gemacht**. Der 🟡 MEDIUM-Vertrauensgrad für Synthese wird beibehalten, nicht hochgestuft, weil der zugrundeliegende API-Ausfall im Laufzeitraum eine permanente Einschränkung für die Datenqualität dieser Woche ist.
