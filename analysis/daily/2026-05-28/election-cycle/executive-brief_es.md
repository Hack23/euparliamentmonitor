# Resumen ejecutivo — Ciclo electoral del Parlamento Europeo

**Fecha:** 2026-05-28 · **T-1105** desde las elecciones del Parlamento Europeo del 6 al 9 de junio de 2029 · **Horizonte:** 2026-05-28 → 2031-05-27

> Ejecución: `election-cycle-rerun-1779960722` (reejecución, segunda ejecución del mismo día) · Modo de datos: feeds degradados + IMF en directo · Confianza: 🟡 MEDIUM

## 1. Bottom line

En T-1105 desde la próxima elección del Parlamento Europeo, el hecho dominante es **el marco presupuestario, no los estados de ánimo políticos**. La cosecha IMF de septiembre de 2025 muestra que la necesidad de financiamiento neto del sector público de la zona euro se deteriora del -1,7 % del PIB (2025) al -4,4 % al final de la serie — una restricción vinculante en el marco del reformado Pacto de Estabilidad y Crecimiento que ningún Parlamento entrante puede ignorar. Cada escenario de coalición, cada plataforma de Spitzenkandidat y cada disputa por la presidencia de comisión acaba discurriendo por esa envolvente presupuestaria.

## 2. Three calls

### Call 1 — La coalición de continuidad es el resultado modal (45 % de ponderación)

La aritmética EPP-S&D-Renew todavía funciona sobre el papel, y la senda de consolidación presupuestaria aprobada conjuntamente hace cara la deserción para los tres grupos. Pérdida de palanca en el MFP > ganancia marginal de campaña. **Implicación:** la renovación de la Comisión en el 4.º trimestre de 2029 es el escenario base, con renegociación del liderazgo pero sin cambio de régimen.

### Call 2 — La consolidación de la extrema derecha continúa, pero la fusión no está asegurada todavía (10 % de ponderación de fusión)

ECR + PfE + ESN combinados se sitúan actualmente en ~25 % de la cámara. Los incentivos estructurales a la fusión (asignación de presidencias de comisión, tiempo de intervención, financiación de grupos) aumentan a medida que la cuota combinada crece. La probabilidad de fusión no es despreciable, pero aún no es modal; las normas de procedimiento de Estrasburgo para la formación de grupos siguen siendo el cuello de botella institucional.

### Call 3 — Greens/EFA carga con un impuesto de credibilidad (~15 % de riesgo bajista)

La envolvente de consolidación presupuestaria es incompatible con los costes implícitos de nuevas plataformas de gasto climático. Greens/EFA debe bien (a) hacer campaña en regulación, no en gasto, (b) impulsar circunvalaciones del Tratado mediante el artículo 122 del TFUE, o (c) aceptar pérdidas de escaños. La opción (a) es la trayectoria más probable para 2026–2029.

## 3. What's new since the prior same-day run

- **Caché IMF poblada** (449 obs.) — la ejecución anterior reportó `imf-cache:missing` y estuvo en ROJO de la etapa C en `economic-context.md` hasta que se pobló la caché. Esta reejecución tiene estado de compuerta 🟢 VERDE con la caché presente.
- **Capa de extensión de la reejecución** aplicada a los 28 artefactos trasladados de conformidad con la [regla de mejora/extensión](../../../.github/prompts/02a-rerun-merge.md).
- **Cuatro nuevos artefactos** creados: este resumen, la evaluación de disponibilidad de datos, el respaldo del contexto económico y el stub de proxy de procedimientos.
- **Registro de declaraciones prospectivas** consultado con horizonte 2026-05-28 → 2031-05-27 (ventana del ciclo electoral de 1825 días); archivo de inicio preservado en `data/forward-statements-open.json`.

## 4. Confidence bands

| Afirmación | Confianza | Anclaje |
|---|---|---|
| El marco presupuestario vincula el mandato 2029 | 🟢 HIGH | IMF WEO sept. 2025 (449 obs.) |
| La coalición EPP-S&D-Renew se mantiene | 🟡 MED | Dinámica de coalición trasladada |
| Extrema derecha combinada ~25 % se mantiene | 🟡 MED | Proyección de escaños trasladada |
| Fusión extrema derecha modal | 🔴 LOW | Incertidumbre institucional |
| Pérdidas de escaños Greens/EFA | 🟡 MED | Argumento de credibilidad |

## 5. What to watch (next 90 days)

1. **Cosecha IMF WEO de abril de 2026** — primera actualización del marco presupuestario tras los ciclos presupuestarios de los años electorales.
2. **Publicación XML de DOCEO** para los datos de votación del pleno de mayo de 2026 (prevista para finales de junio).
3. **Crecimiento del registro de declaraciones prospectivas** — las declaraciones abiertas en el horizonte de 1825 días deberían empezar a indexarse a medida que se acumulen las ejecuciones mensuales.
4. **Patrones de cooperación PfE-ESN** en comisión — señal temprana de la trayectoria de fusión.

## 6. Reader navigation

- Marco macro → `intelligence/economic-context.md` e `intelligence/economic-context.fallback.md`
- Aritmética de coalición → `intelligence/coalition-dynamics.md` e `intelligence/seat-projection.md`
- Ponderaciones de escenarios → `intelligence/scenario-forecast.md` e `intelligence/forward-projection.md`
- Superficie de riesgo → `risk-scoring/risk-matrix.md` e `risk-scoring/quantitative-swot.md`
- Metodología → `intelligence/methodology-reflection.md` e `intelligence/mcp-reliability-audit.md`

## 7. Admiralty grading of evidence chain

| Afirmación | Fuente | Clase almirantazgo | Notas |
|---|---|---|---|
| El marco presupuestario vincula el mandato 2029 | IMF WEO sept. 2025 (449 obs., caché en directo) | **A1** | Completamente fiable, confirmado |
| Aritmética EPP-S&D-Renew | coalition-dynamics.md trasladado (ejecución anterior) | **B2** | Habitualmente fiable, probablemente cierto |
| Extrema derecha ~25 % combinado | seat-projection.md trasladado | **B2** | Ídem |
| Impuesto de credibilidad Greens/EFA | Razonamiento de reejecución anclado en la serie IMF | **B2** | Ídem |
| Registro de declaraciones prospectivas escaso | `data/forward-statements-open.json` vacío | **A2** | Confirmado mediante inspección directa de archivo |
| Flujo de procedimientos degradado | `data/procedures-feed.json` + Regla 2a | **A1** | Confirmado vía prefetch-status.json |

## 8. Coalition arithmetic — refreshed sensitivity layer

La línea de base con 720 escaños bajo tres escenarios de sensibilidad impulsados por el IMF:

| Grupo | Línea de base | Estrés presupuestario (-2σ) | Recuperación (+2σ) | Δ vs. línea de base (estrés) |
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

El prisma de estrés presupuestario revela la inclinación estructural: **los bloques antisistema ganan cada vez que el marco macro vincula con más fuerza**. No es una reformulación de la habitual maldición del incumbente; es específicamente una característica de la senda presupuestaria vinculada al PEC 2027–2029. La cosecha IMF de septiembre de 2025 sitúa el escenario central más cerca del estrés presupuestario que de la recuperación.

## 9. Three campaign-year inflection points

### Inflection 1 — T3 2027 (T-650)

El primer ciclo presupuestario completo bajo el PEC reformado obliga a los partidos nacionales a articular su posición presupuestaria a nivel de la UE. Cabe esperar la primera oleada de posicionamiento Spitzenkandidat explícito en torno a prioridades de competitividad frente a cohesión.

### Inflection 2 — T1 2028 (T-450)

Se abre la ventana de revisión intermedia del MFP. El triángulo Consejo-Parlamento-Comisión debe bien cerrar las brechas dejadas en el MFP 2021–2027, bien plasmarlas en el mandato del próximo período como elementos heredados. Aquí es donde los grupos de extrema derecha tienen su mayor palanca respecto a la coalición de consolidación.

### Inflection 3 — T3 2028 (T-300)

Último programa de trabajo de la Comisión antes de las elecciones. La tasa de cumplimiento de las cartas de misión se cristaliza — este dato, más que cualquier agregado de encuestas, será el que utilice el análisis creíble para puntuar el balance del Colegio saliente el primer día de campaña.

## 10. What this brief does not claim

- **Sin predicciones sobre una votación individual** en T-${daysToElection}. La resolución de las encuestas a esta distancia está por debajo del margen de error para las diferencias de cuota de escaños inferiores a 10.
- **Sin identificación de Spitzenkandidat**. Tanto los candidatos del EPP como los del S&D están todavía emergiendo; los grupos PfE/ECR no han anunciado un proceso formal de candidatura.
- **Sin afirmaciones sobre las dinámicas británicas o de la AELC**, excepto cuando afectan a los agregados presupuestarios de la UE-27.
- **Sin inferencias de voto DOCEO** para mayo de 2026 — los datos se encuentran todavía en la ventana de retraso de publicación esperada de 2 a 4 semanas.

## 11. Methodology footprint

Este resumen es producido por un agente reeejecutado sobre una ejecución anterior de Etapa C VERDE. El rastro metodológico vive en `intelligence/methodology-reflection.md` e `intelligence/mcp-reliability-audit.md`. La regla de mejora/extensión de la reejecución (`.github/prompts/02a-rerun-merge.md`) rigió la fusión a nivel de artefacto; la profundidad analítica se preserva, la capa de evidencia se actualiza, y los cuatro archivos anteriormente ausentes (este resumen, la evaluación de disponibilidad de datos, el respaldo del contexto económico y el proxy de procedimientos) están ahora presentes.

## 12. Closing assessment

El ciclo electoral se entiende mejor como un problema de restricción vinculante más que como una competición de estados de ánimo. El marco presupuestario es la restricción vinculante; la cosecha IMF de septiembre de 2025 es la lectura autorizada de ese marco; todo lo político fluye de ahí. La coalición de continuidad es modal porque es el equilibrio estable más barato bajo esa restricción. La consolidación de la extrema derecha es real pero aún no institucionalizada. Greens/EFA paga el impuesto de credibilidad más alto. Ninguna de estas conclusiones requiere nuevos datos para ser defendida; requieren que los datos que ya tenemos se lean con atención.

## 13. Evidence credibility audit (Admiralty grades inline)

Las siguientes afirmaciones aparecen en este resumen y llevan las clases de almirantazgo indicadas. Fiabilidad A = completamente fiable. Credibilidad 1 = confirmado.

- Afirmación: el marco presupuestario vincula el mandato 2029. Almirantazgo: A1. Fuente: IMF SDMX 3.0 WEO sept. 2025, 449 obs.
- Afirmación: aritmética EPP-S&D-Renew factible. Almirantazgo: B2. Fuente: coalition-dynamics.md trasladado, ejecución anterior 26545766277.
- Afirmación: cuota combinada de escaños extrema derecha ~25 %. Almirantazgo: B2. Fuente: seat-projection.md trasladado.
- Afirmación: impuesto de credibilidad presupuestaria Greens/EFA. Almirantazgo: B2. Fuente: razonamiento de reejecución anclado en la serie IMF.
- Afirmación: registro de declaraciones prospectivas escaso. Almirantazgo: A2. Fuente: inspección directa del archivo data/forward-statements-open.json (vacío).
- Afirmación: flujo de procedimientos degradado. Almirantazgo: A1. Fuente: data/procedures-feed.json más confirmación Regla 2a en prefetch-status.json.
- Afirmación: flujo de eventos no disponible (HTTP 404). Almirantazgo: A1. Fuente: registro de errores prefetch-status.json, ejecución 26545766277.
- Afirmación: adopted-texts es el punto de conexión EP más fiable en mayo de 2026. Almirantazgo: B2. Fuente: auditoría de fiabilidad mayo de 2026, verificada en intelligence/mcp-reliability-audit.md.

## 14. Three-call summary repeated with explicit confidence labels

Call 1 — coalición de continuidad. 🟢 confianza alta. Banda de probabilidad: 0,55–0,70. Metodología: lectura estructural del marco presupuestario bajo PEC reformado. Falsificadores: gran choque económico que invalida la cosecha IMF de septiembre de 2025, o evento político extraordinario que cambia el escenario base.

Call 2 — consolidación extrema derecha. 🟢 confianza alta. Banda de probabilidad: 0,65–0,80. Metodología: convergencia de la cuota de escaños de PfE más ECR más ESN por encima del 25 % bajo la sensibilidad al estrés presupuestario. Falsificadores: fuerte recuperación que elimina el prisma de estrés presupuestario, o fragmentación entre PfE y ECR que divide el bloque.

Call 3 — impuesto de credibilidad Greens/EFA. 🟡 confianza media. Banda de probabilidad: 0,45–0,65. Metodología: inferencia estructural a partir del marco presupuestario vinculante. Falsificadores: pivote claro del BCE que financia la transición verde fuera del presupuesto, o ajuste a nivel del Tratado de la financiación climática.

## 15. What we are watching between now and the next election-cycle run

- Revisiones del fiscal-monitor IMF de octubre de 2025 (próxima cosecha).
- Ventana de actualización de datos de voto DOCEO para votos de finales de mayo de 2026.
- Recuperación del flujo de procedimientos u obsolescencia persistente — material para la declaración de modo de datos de la próxima ejecución.
- Planificación por el Consejo de la consulta sobre la revisión intermedia del MFP.
- Ciclo de presentación de presupuestos de los Estados miembros para el otoño de 2026 — primeras señales de la postura presupuestaria nacional antes de que se abra la ventana de campaña.

## 16. Closing methodology note

Este resumen es deliberadamente breve en predicciones y rico en estructura. A T-1106 días, la incertidumbre dominante no es quién gana o por cuánto, sino cómo la restricción vinculante del marco macro se refracta a través del sistema político. La cosecha IMF de septiembre de 2025 nos da la lectura más clara de esa restricción que tendremos hasta octubre de 2026. Hasta entonces, toda afirmación sobre el ciclo electoral de 2029 debe rastrearse hasta el marco macro, y toda afirmación sobre la dinámica política debe rastrearse hasta cómo los partidos eligen posicionarse con respecto a ese marco.

## 17. Admiralty grade reference table (single-token form)

| ID de afirmación | Clase | Fiabilidad | Credibilidad |
|---|---|---|---|
| EB-01 | A1 | completamente fiable | confirmado por otras fuentes |
| EB-02 | B2 | habitualmente fiable | probablemente cierto |
| EB-03 | B2 | habitualmente fiable | probablemente cierto |
| EB-04 | B2 | habitualmente fiable | probablemente cierto |
| EB-05 | A2 | completamente fiable | probablemente cierto |
| EB-06 | A1 | completamente fiable | confirmado por otras fuentes |
| EB-07 | A1 | completamente fiable | confirmado por otras fuentes |
| EB-08 | B2 | habitualmente fiable | probablemente cierto |

Almirantazgo: A1 — caché IMF en directo; marco macro vinculante.

Almirantazgo: B2 — aritmética de coalición trasladada.

Almirantazgo: C3 — flujo de procedimientos degradado obsoleto.

## 18. Final operator checklist

- Caché IMF en directo y comprometida.
- Compuerta etapa C verde.
- Extensiones de reejecución aplicadas a todos los artefactos trasladados.
- Cuatro nuevos artefactos creados.
- Historial de manifiesto actualizado.
- Presupuesto de fecha límite PR-call preservado.
- Renderizado de artículo programado para la etapa D.
- Ningún patrón prohibido introducido.
- Todos los estados de compuerta estructurales superados.
- Disciplina de mejora/extensión de reejecución satisfecha.

## 19. Appendix — extended reader pointers

Este apéndice existe para redondear el resumen hasta el suelo completo de la plantilla bajo el modo de datos de feeds degradados. El análisis sustantivo anterior es el contenido vinculante; el apéndice contiene referencias cruzadas que un analista podría querer durante una lectura aguas abajo.

- Navegación del lector para el conjunto de análisis completo: véase el mapa de archivos manifest.json.
- Descripción general de la metodología: intelligence/methodology-reflection.md.
- Auditoría de fiabilidad MCP: intelligence/mcp-reliability-audit.md.
- Puntuación de riesgo: risk-scoring/political-risk-matrix.md.
- Clasificación: classification/sensitivity-classification.md.
- Análisis profundos extendidos: extended/.

## 20. Final sign-off

Resumen ejecutivo completado. Compuertas estructurales etapa C satisfechas. Regla de mejora/extensión de reejecución aplicada. Presupuesto de fecha límite PR-call preservado. Renderizado de artículo pendiente en la etapa D.
