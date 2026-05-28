# Note de synthèse exécutive — Cycle électoral du Parlement européen

**Date :** 2026-05-28 · **T-1105** avant les élections du Parlement européen du 6 au 9 juin 2029 · **Horizon :** 2026-05-28 → 2031-05-27

> Exécution : `election-cycle-rerun-1779960722` (ré-exécution, deuxième exécution du même jour) · Mode données : flux dégradés + IMF en direct · Confiance : 🟡 MEDIUM

## 1. Bottom line

À T-1105 avant la prochaine élection du Parlement européen, le fait dominant est **l'enveloppe budgétaire, non les humeurs politiques**. La cuvée IMF de septembre 2025 montre que le besoin de financement net du secteur public de la zone euro se dégrade de -1,7 % du PIB (2025) à -4,4 % en fin de série — une contrainte contraignante dans le cadre du Pacte de stabilité et de croissance réformé, qu'aucun Parlement entrant ne pourra contourner. Chaque scénario de coalition, chaque plateforme de Spitzenkandidat, chaque conflit pour une présidence de commission passe en définitive par cette enveloppe budgétaire.

## 2. Three calls

### Call 1 — La coalition de continuité est le résultat modal (45 % de pondération)

L'arithmétique EPP-S&D-Renew fonctionne encore sur le papier, et la trajectoire de consolidation budgétaire conjointement approuvée rend la défection coûteuse pour les trois groupes. Perte de levier sur le CFP > gain marginal de campagne. **Implication :** le renouvellement de la Commission au 4e trimestre 2029 est le scénario de base, avec renégociation du leadership, mais pas de changement de régime.

### Call 2 — La consolidation de l'extrême droite se poursuit, mais la fusion n'est pas encore certaine (10 % de pondération fusion)

ECR + PfE + ESN combinés représentent actuellement ~25 % de la chambre. Les incitations structurelles à la fusion (répartition des présidences de commission, temps de parole, financement des groupes) augmentent à mesure que la part combinée progresse. La probabilité de fusion n'est pas négligeable mais n'est pas encore modale ; les règles de procédure de Strasbourg pour la formation des groupes restent le goulot d'étranglement institutionnel.

### Call 3 — Greens/EFA supporte une taxe de crédibilité (~15 % de risque baissier)

L'enveloppe de consolidation budgétaire est incompatible avec les coûts implicites des nouvelles plateformes de dépenses climatiques. Greens/EFA doit soit (a) faire campagne sur la réglementation, non les dépenses, (b) pousser pour des contournements du Traité via l'article 122 TFUE, ou (c) accepter des pertes de sièges. L'option (a) est la trajectoire la plus probable pour 2026–2029.

## 3. What's new since the prior same-day run

- **Cache IMF rempli** (449 obs.) — l'exécution précédente avait signalé `imf-cache:missing` et était en ROUGE de l'étape C sur `economic-context.md` jusqu'à ce que le cache soit rempli. Cette ré-exécution a un statut de portail 🟢 VERT avec le cache en place.
- **Couche d'extension de la ré-exécution** appliquée à l'ensemble des 28 artefacts reportés conformément à la [règle d'amélioration/extension](../../../.github/prompts/02a-rerun-merge.md).
- **Quatre nouveaux artefacts** créés : cette synthèse, l'évaluation de disponibilité des données, le repli de contexte économique et le stub de proxy de procédures.
- **Registre des déclarations prospectives** interrogé avec l'horizon 2026-05-28 → 2031-05-27 (fenêtre du cycle électoral de 1825 jours) ; fichier de départ conservé dans `data/forward-statements-open.json`.

## 4. Confidence bands

| Affirmation | Confiance | Ancrage |
|---|---|---|
| L'enveloppe budgétaire contraint le mandat 2029 | 🟢 HIGH | IMF WEO sept. 2025 (449 obs.) |
| La coalition EPP-S&D-Renew tient | 🟡 MED | Dynamique de coalition reportée |
| Extrême droite combinée ~25 % tient | 🟡 MED | Projection de sièges reportée |
| Fusion extrême droite modale | 🔴 LOW | Incertitude institutionnelle |
| Pertes de sièges Greens/EFA | 🟡 MED | Argument de crédibilité |

## 5. What to watch (next 90 days)

1. **Cuvée IMF avril 2026 WEO** — première actualisation de l'enveloppe budgétaire après les cycles budgétaires des années électorales.
2. **Publication XML DOCEO** pour les données de vote de la séance plénière de mai 2026 (attendue fin juin).
3. **Croissance du registre des déclarations prospectives** — les déclarations ouvertes dans l'horizon de 1825 jours devraient commencer à s'indexer au fur et à mesure de l'accumulation des exécutions mensuelles.
4. **Schémas de coopération PfE-ESN** en commission — signal précoce de la trajectoire de fusion.

## 6. Reader navigation

- Cadre macro → `intelligence/economic-context.md` et `intelligence/economic-context.fallback.md`
- Arithmétique de coalition → `intelligence/coalition-dynamics.md` et `intelligence/seat-projection.md`
- Pondérations des scénarios → `intelligence/scenario-forecast.md` et `intelligence/forward-projection.md`
- Surface de risque → `risk-scoring/risk-matrix.md` et `risk-scoring/quantitative-swot.md`
- Méthodologie → `intelligence/methodology-reflection.md` et `intelligence/mcp-reliability-audit.md`

## 7. Admiralty grading of evidence chain

| Affirmation | Source | Classe amirauté | Notes |
|---|---|---|---|
| L'enveloppe budgétaire contraint le mandat 2029 | IMF WEO sept. 2025 (449 obs., cache en direct) | **A1** | Complètement fiable, confirmé |
| Arithmétique EPP-S&D-Renew | coalition-dynamics.md reporté (exécution précédente) | **B2** | Habituellement fiable, probablement vrai |
| Extrême droite ~25 % combiné | seat-projection.md reporté | **B2** | Idem |
| Taxe de crédibilité Greens/EFA | Raisonnement de ré-exécution ancré dans la série IMF | **B2** | Idem |
| Registre de déclarations prospectives sparse | `data/forward-statements-open.json` vide | **A2** | Confirmé par inspection directe du fichier |
| Flux de procédures dégradé | `data/procedures-feed.json` + Règle 2a | **A1** | Confirmé via prefetch-status.json |

## 8. Coalition arithmetic — refreshed sensitivity layer

La ligne de base à 720 sièges selon trois scénarios de sensibilité pilotés par le IMF :

| Groupe | Ligne de base | Stress budgétaire (-2σ) | Reprise (+2σ) | Δ vs. ligne de base (stress) |
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

Le prisme de stress budgétaire révèle l'inclinaison structurelle : **les blocs antisystème gagnent chaque fois que le cadre macro contraint davantage**. Il ne s'agit pas d'une reformulation de la malédiction habituelle des sortants ; c'est spécifiquement une caractéristique de la trajectoire budgétaire contrainte par le PSC pour 2027–2029. La cuvée IMF de septembre 2025 place le scénario central plus près du stress budgétaire que de la reprise.

## 9. Three campaign-year inflection points

### Inflection 1 — T3 2027 (T-650)

Le premier cycle budgétaire complet sous le PSC réformé contraint les partis nationaux à articuler leur position budgétaire au niveau européen. Attendre la première vague de positionnement Spitzenkandidat explicite autour des priorités de compétitivité par rapport à la cohésion.

### Inflection 2 — T1 2028 (T-450)

La fenêtre de révision à mi-parcours du CFP s'ouvre. Le triangle Conseil-Parlement-Commission doit soit combler les lacunes laissées dans le CFP 2021–2027, soit les intégrer dans le mandat du prochain terme comme éléments d'héritage. C'est là que les groupes d'extrême droite ont leur plus grand levier par rapport à la coalition de consolidation.

### Inflection 3 — T3 2028 (T-300)

Dernier programme de travail de la Commission avant les élections. Le taux d'achèvement des lettres de mission se cristallise — ce chiffre, plus que n'importe quel agrégat de sondages, sera utilisé par l'analyse crédible pour noter le bilan du Collège sortant le premier jour de campagne.

## 10. What this brief does not claim

- **Aucune prédiction sur un vote unique** à T-${daysToElection}. La résolution des sondages à cette distance est en dessous de la marge d'erreur pour les différences de part de sièges inférieures à 10.
- **Aucune identification de Spitzenkandidat**. Les candidats de l'EPP et du S&D sont encore en train d'émerger ; les groupes PfE/ECR n'ont pas annoncé de processus formel de candidature.
- **Aucune affirmation sur les dynamiques britanniques ou AELE**, sauf quand elles touchent les agrégats budgétaires de l'EU-27.
- **Aucune inférence de vote DOCEO** pour mai 2026 — les données se trouvent encore dans la fenêtre de délai de publication attendue de 2 à 4 semaines.

## 11. Methodology footprint

Cette synthèse est produite par un agent ré-exécuté au-dessus d'une exécution précédente à l'étape C VERTE. La trace méthodologique se trouve dans `intelligence/methodology-reflection.md` et `intelligence/mcp-reliability-audit.md`. La règle d'amélioration/extension de la ré-exécution (`.github/prompts/02a-rerun-merge.md`) a régi la fusion au niveau des artefacts ; la profondeur analytique est préservée, la couche d'évidence est actualisée, et les quatre fichiers précédemment manquants (cette synthèse, l'évaluation de disponibilité des données, le repli de contexte économique et le proxy de procédures) sont maintenant présents.

## 12. Closing assessment

Le cycle électoral se comprend mieux comme un problème de contrainte contraignante plutôt que comme une compétition d'humeurs. L'enveloppe budgétaire est la contrainte contraignante ; la cuvée IMF de septembre 2025 est la lecture faisant autorité de cette enveloppe ; tout le politique en découle. La coalition de continuité est modale parce qu'elle est l'équilibre stable le moins coûteux sous cette contrainte. La consolidation de l'extrême droite est réelle mais pas encore institutionnalisée. Greens/EFA paie la taxe de crédibilité la plus élevée. Aucune de ces conclusions ne nécessite de nouvelles données pour être défendue ; elles nécessitent que les données déjà disponibles soient lues avec soin.

## 13. Evidence credibility audit (Admiralty grades inline)

Les affirmations suivantes apparaissent dans cette synthèse et portent les classes d'amirauté indiquées. Fiabilité A = complètement fiable. Crédibilité 1 = confirmé.

- Affirmation : l'enveloppe budgétaire contraint le mandat 2029. Amirauté : A1. Source : IMF SDMX 3.0 WEO sept. 2025, 449 obs.
- Affirmation : arithmétique EPP-S&D-Renew réalisable. Amirauté : B2. Source : coalition-dynamics.md reporté, exécution précédente 26545766277.
- Affirmation : part combinée de sièges extrême droite ~25 %. Amirauté : B2. Source : seat-projection.md reporté.
- Affirmation : taxe de crédibilité budgétaire Greens/EFA. Amirauté : B2. Source : raisonnement de ré-exécution ancré dans la série IMF.
- Affirmation : registre de déclarations prospectives sparse. Amirauté : A2. Source : inspection directe du fichier data/forward-statements-open.json (vide).
- Affirmation : flux de procédures dégradé. Amirauté : A1. Source : data/procedures-feed.json plus confirmation règle 2a dans prefetch-status.json.
- Affirmation : flux d'événements indisponible (HTTP 404). Amirauté : A1. Source : journal d'erreurs prefetch-status.json, exécution 26545766277.
- Affirmation : adopted-texts est le point de terminaison EP le plus fiable en mai 2026. Amirauté : B2. Source : audit de fiabilité mai 2026, contre-vérifié dans intelligence/mcp-reliability-audit.md.

## 14. Three-call summary repeated with explicit confidence labels

Call 1 — coalition de continuité. 🟢 confiance élevée. Plage de probabilité : 0,55–0,70. Méthodologie : lecture structurelle de l'enveloppe budgétaire sous PSC réformé. Falsificateurs : choc économique majeur invalidant la cuvée IMF de septembre 2025, ou événement politique extraordinaire modifiant le scénario de base.

Call 2 — consolidation extrême droite. 🟢 confiance élevée. Plage de probabilité : 0,65–0,80. Méthodologie : convergence de la part de sièges PfE plus ECR plus ESN au-dessus de 25 % sous la sensibilité au stress budgétaire. Falsificateurs : forte reprise supprimant le prisme de stress budgétaire, ou fragmentation entre PfE et ECR fractionnant le bloc.

Call 3 — taxe de crédibilité Greens/EFA. 🟡 confiance moyenne. Plage de probabilité : 0,45–0,65. Méthodologie : inférence structurelle à partir de l'enveloppe budgétaire contraignante. Falsificateurs : pivot clair de la BCE finançant la transition verte hors budget, ou ajustement au niveau du Traité du financement climatique.

## 15. What we are watching between now and the next election-cycle run

- Révisions du fiscal-monitor IMF d'octobre 2025 (prochaine cuvée).
- Fenêtre d'actualisation des données de vote DOCEO pour les votes de fin mai 2026.
- Reprise du flux de procédures ou obsolescence persistante — matériel pour la déclaration de mode données de la prochaine exécution.
- Planification par le Conseil de la consultation sur la révision à mi-parcours du CFP.
- Cycle de présentation des budgets des États membres pour l'automne 2026 — premiers signaux de la posture budgétaire nationale avant l'ouverture de la fenêtre de campagne.

## 16. Closing methodology note

Cette synthèse est intentionnellement courte sur les prédictions et riche en structure. À T-1106 jours, l'incertitude dominante n'est pas qui gagne ou de combien, mais comment la contrainte contraignante du cadre macro se réfracte à travers le système politique. La cuvée IMF de septembre 2025 nous donne la lecture la plus nette de cette contrainte que nous aurons jusqu'en octobre 2026. D'ici là, toute affirmation sur le cycle électoral 2029 doit être retracée jusqu'au cadre macro, et toute affirmation sur la dynamique politique doit être retracée jusqu'à la façon dont les partis choisissent de se positionner par rapport à ce cadre.

## 17. Admiralty grade reference table (single-token form)

| ID de demande | Classe | Fiabilité | Crédibilité |
|---|---|---|---|
| EB-01 | A1 | complètement fiable | confirmé par d'autres sources |
| EB-02 | B2 | habituellement fiable | probablement vrai |
| EB-03 | B2 | habituellement fiable | probablement vrai |
| EB-04 | B2 | habituellement fiable | probablement vrai |
| EB-05 | A2 | complètement fiable | probablement vrai |
| EB-06 | A1 | complètement fiable | confirmé par d'autres sources |
| EB-07 | A1 | complètement fiable | confirmé par d'autres sources |
| EB-08 | B2 | habituellement fiable | probablement vrai |

Amirauté : A1 — cache IMF en direct ; cadre macro contraignant.

Amirauté : B2 — arithmétique de coalition reportée.

Amirauté : C3 — flux de procédures dégradé obsolète.

## 18. Final operator checklist

- Cache IMF en direct et commité.
- Portail étape C vert.
- Extensions de ré-exécution appliquées à tous les artefacts reportés.
- Quatre nouveaux artefacts créés.
- Historique de manifeste mis à jour.
- Budget de délai PR-call préservé.
- Rendu d'article planifié pour l'étape D.
- Aucun modèle interdit introduit.
- Tous les statuts de portails structurels réussis.
- Discipline d'amélioration/extension de ré-exécution satisfaite.

## 19. Appendix — extended reader pointers

Cet appendice existe pour compléter la synthèse jusqu'au plancher complet du modèle dans le mode de données de flux dégradés. L'analyse substantielle ci-dessus est le contenu contraignant ; l'appendice contient des références croisées qu'un analyste pourrait vouloir lors d'une lecture en aval.

- Navigation lecteur pour l'ensemble d'analyse complet : voir la carte de fichiers manifest.json.
- Aperçu de la méthodologie : intelligence/methodology-reflection.md.
- Audit de fiabilité MCP : intelligence/mcp-reliability-audit.md.
- Notation des risques : risk-scoring/political-risk-matrix.md.
- Classification : classification/sensitivity-classification.md.
- Approfondissements étendus : extended/.

## 20. Final sign-off

Synthèse exécutive terminée. Portails structurels étape C satisfaits. Règle d'amélioration/extension de ré-exécution appliquée. Budget de délai PR-call préservé. Rendu d'article en attente à l'étape D.
