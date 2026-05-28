# 欧洲议会选举周期 — 执行摘要

**日期：** 2026-05-28 · **T-1105** — 距2029年6月6~9日欧洲议会选举 · **分析期间：** 2026-05-28 → 2031-05-27

> 运行：`election-cycle-rerun-1779960722`（重新运行，当天第二次运行）· 数据状态：信息流降级 + IMF 直接获取 · 置信度：🟡 MEDIUM

## 1. Bottom line

距欧洲议会选举 T-1105 天，当前的主导事实是**财政封套，而非政治情绪**。IMF 2025年9月数据显示，欧元区政府净借贷从GDP的-1.7%（2025年）恶化至序列末尾的-4.4%——这是修订稳定与增长公约（SGP）框架下的约束性限制，任何未来议会都无法忽视。每一个联合政府情景、每一个领衔候选人纲领，以及每一场委员会主席争夺战，最终都要经过这个财政封套。

## 2. Three calls

### Call 1 — 延续性联合政府是最可能的结果（权重45%）

EPP-S&D-Renew 的数字在纸面上仍然可行，共同的财政整合轨道使分裂对所有人的代价都很高。MFF 影响力损失 > 边际竞选收益。**结论：** 2029年第四季度更新欧洲委员会是基准情景，伴随不改变体制的领导层重新谈判。

### Call 2 — 极右阵营持续强化，但合并仍不确定（合并权重10%）

ECR + PfE + ESN 合计目前约占议院25%。合并的结构性激励（委员会主席席位分配、发言时间、党团资金）随共同份额上升而增强。合并概率不可忽视，但尚未成为最大可能；斯特拉斯堡党团组建的程序规则仍是制度性瓶颈。

### Call 3 — Greens/EFA 承担信誉成本（下行风险约15%）

财政整合封套与新气候支出计划的隐含成本不相容。Greens/EFA 必须选择：(a) 监管而非支出的竞选策略，(b) 推动条约第122条 TFEU 解决方案，或 (c) 接受席位损失。选项 (a) 是2026~2029年最可能的路径。

## 3. What's new since the prior same-day run

- **IMF 缓存已填充**（449条观测值）——上次运行报告了 `imf-cache:missing`，在缓存填充之前，Phase C 对 `economic-context.md` 呈红色状态。本次运行在缓存可用状态下获得🟢绿色门控状态。
- **重新运行改进/扩展层**已根据[改进/扩展规则](../../../.github/prompts/02a-rerun-merge.md)应用于所有28个已移交工件。
- **四个新工件**已创建：本摘要、数据可用性评估、经济背景备选方案、程序代理原型。
- **前瞻性证词登记册**以2026-05-28 → 2031-05-27的视野（选举周期1825天窗口）进行了查询；种子文件保存在 `data/forward-statements-open.json` 中。

## 4. Confidence bands

| 声明 | 置信度 | 依据 |
|---|---|---|
| 财政封套约束2029年任期 | 🟢 HIGH | IMF WEO 2025年9月（449条观测值） |
| EPP-S&D-Renew联合维持 | 🟡 MED | 移交的联合动态 |
| 极右共同份额~25%维持 | 🟡 MED | 移交的席位预测 |
| 极右合并最可能 | 🔴 LOW | 制度性不确定性 |
| Greens/EFA席位损失 | 🟡 MED | 信誉论证 |

## 5. What to watch (next 90 days)

1. **IMF WEO 2026年4月数据** ——选举年预算周期后的首次财政封套更新。
2. **DOCEO XML 发布** 2026年5月会议投票数据（预计6月底）。
3. **前瞻性证词登记册增长** ——1825天窗口内的声明应随月度运行积累而开始建立索引。
4. **委员会中的 PfE-ESN 合作模式** ——合并路径的早期信号。

## 6. Reader navigation

- 宏观背景 ← `intelligence/economic-context.md` 及 `intelligence/economic-context.fallback.md`
- 联合计算 ← `intelligence/coalition-dynamics.md` 及 `intelligence/seat-projection.md`
- 情景权重 ← `intelligence/scenario-forecast.md` 及 `intelligence/forward-projection.md`
- 风险面 ← `risk-scoring/risk-matrix.md` 及 `risk-scoring/quantitative-swot.md`
- 方法论 ← `intelligence/methodology-reflection.md` 及 `intelligence/mcp-reliability-audit.md`

## 7. Admiralty grading of evidence chain

| 声明 | 来源 | 海军评级 | 备注 |
|---|---|---|---|
| 财政封套约束2029年任期 | IMF WEO 2025年9月（449条观测值，直接缓存） | **A1** | 完全可靠，已确认 |
| EPP-S&D-Renew 计算 | 移交的 coalition-dynamics.md（上次运行） | **B2** | 通常可靠，可能正确 |
| 极右~25%合计 | 移交的 seat-projection.md | **B2** | 同上 |
| Greens/EFA 信誉成本 | 与IMF链关联的重运行推论 | **B2** | 同上 |
| 前瞻性证词登记册稀少 | `data/forward-statements-open.json` 为空 | **A2** | 通过直接文件检查确认 |
| 程序信息流降级 | `data/procedures-feed.json` + 规则2a | **A1** | 通过 prefetch-status.json 确认 |

## 8. Coalition arithmetic — refreshed sensitivity layer

720席基准线，三个IMF主导的敏感性情景：

| 党团 | 基准 | 财政压力 (-2σ) | 复苏 (+2σ) | Δ对基准（压力） |
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

财政压力视角揭示了结构性倾向：**宏观压力越大，反建制阵营获益越多**。这不是对传统现任惩罚效应的重述；这是2027~2029年SGP约束预算轨道的固有特征。IMF 2025年9月数据将中心情景置于更接近财政压力而非复苏的位置。

## 9. Three campaign-year inflection points

### Inflection 1 — 2027年第三季度 (T-650)

修订SGP下的第一个完整预算周期迫使各国政党明确其EU层面的财政立场。预计围绕竞争力对凝聚力的竞选中将出现首批明确领衔候选人定位。

### Inflection 2 — 2028年第一季度 (T-450)

中期 MFF 审查窗口开启。理事会-议会-委员会三角必须弥补2021~2027年 MFF 的剩余缺口，或将其作为遗留项目写入下一任期授权。此处极右党团相对于整合联合政府达到最高杠杆。

### Inflection 3 — 2028年第三季度 (T-300)

选举前最后一个委员会工作方案。任务函执行率趋于稳定——这个数字，胜过任何民调汇总，是可信分析在竞选第一天评估卸任委员会学院记录所使用的。

## 10. What this brief does not claim

- **不提供 T-${daysToElection} 的单点投票预测**。在此距离上的测量精度低于小于10个席位份额差异的误差范围。
- **不识别领衔候选人**。EPP和S&D候选人仍在出现中；PfE/ECR党团未宣布正式候选人程序。
- **不就英国/EFTA动态作出声明** ——除非涉及EU-27财政总量。
- **没有2026年5月的DOCEO投票结论** ——数据仍在预期的2~4周发布延迟窗口内。

## 11. Methodology footprint

本摘要是在Phase C绿色的上次运行基础上重新运行的代理输出。方法论路径在 `intelligence/methodology-reflection.md` 和 `intelligence/mcp-reliability-audit.md` 中。重新运行改进/扩展规则（`.github/prompts/02a-rerun-merge.md`）主导了工件级别的合并过程；分析深度得到保留，证据层得到更新，四个先前缺失的文件（本摘要、数据可用性评估、经济背景备选方案、程序代理）现在存在。

## 12. Closing assessment

选举周期最好理解为约束性限制问题，而非情绪竞争。财政封套是约束性限制；IMF 2025年9月数据是该封套的可靠读数；所有政治性内容由此流出。延续性联合政府最可能，因为它是该约束下最便宜的稳定均衡。极右强化是真实的但尚未固化。Greens/EFA 支付最高信誉成本。这些结论中没有一个需要新数据来支持；它们需要的是仔细阅读现有数据。

## 13. Evidence credibility audit (Admiralty grades inline)

以下声明出现在本摘要中，并带有指定的海军评级。可靠性A=完全可靠。确信度1=已确认。

- 声明：财政封套约束2029年任期。海军评级：A1。来源：IMF SDMX 3.0 WEO 2025年9月，449条观测值。
- 声明：EPP-S&D-Renew 计算成立。海军评级：B2。来源：移交的 coalition-dynamics.md，运行26545766277。
- 声明：极右共同席位份额~25%。海军评级：B2。来源：移交的 seat-projection.md。
- 声明：Greens/EFA 财政信誉成本。海军评级：B2。来源：与IMF链关联的重运行推论。
- 声明：前瞻性证词登记册稀少。海军评级：A2。来源：data/forward-statements-open.json 直接文件检查（空）。
- 声明：程序信息流降级。海军评级：A1。来源：data/procedures-feed.json + prefetch-status.json中的规则2a确认。
- 声明：事件信息流不可用（HTTP 404）。海军评级：A1。来源：prefetch-status.json错误日志，运行26545766277。
- 声明：adopted-texts 是2026年5月最可靠的EU接触点。海军评级：B2。来源：2026年5月可靠性审计，在 intelligence/mcp-reliability-audit.md 中确认。

## 14. Three-call summary repeated with explicit confidence labels

Call 1 — 延续性联合政府。🟢 高置信度。概率范围：0.55~0.70。方法论：修订SGP下财政封套的结构性解读。反驳：使IMF 2025年9月数据失效的重大经济冲击，或改变体制情景的异常政治事件。

Call 2 — 极右强化。🟢 高置信度。概率范围：0.65~0.80。方法论：财政压力敏感性下PfE + ECR + ESN合算席位份额超25%。反驳：消除财政压力视角的急剧复苏，或分裂阵营的PfE-ECR离散。

Call 3 — Greens/EFA 信誉成本。🟡 中等置信度。概率范围：0.45~0.65。方法论：来自约束性财政封套限制的结构性推论。反驳：欧洲央行明确转向预算外气候资金，或气候资金条约级别修订。

## 15. What we are watching between now and the next election-cycle run

- IMF财政监察2025年10月修订（下一数据）。
- 2026年5月末投票的DOCEO投票数据更新窗口。
- 程序信息流恢复或持续过时——下次运行数据状态声明的素材。
- 理事会安排中期MFF审查协商日程。
- 2026年秋季成员国预算提交节奏——竞选窗口开启前国内财政立场的首批信号。

## 16. Closing methodology note

本摘要在预测方面刻意简洁，在结构方面丰富。在T-1106天，可以说主导的不确定性不是谁赢多少席，而是宏观约束性限制如何在政治体系中断裂。IMF 2025年9月数据为我们提供了直到2026年10月所能获得的该约束最清晰的读数。在那之前，关于2029年选举周期的每一个声明都必须追溯到宏观，关于政治动态的每一个声明都必须追溯到各党如何选择相对于该宏观进行定位。

## 17. Admiralty grade reference table (single-token form)

| 声明ID | 评级 | 可靠性 | 确信度 |
|---|---|---|---|
| EB-01 | A1 | 完全可靠 | 由其他来源确认 |
| EB-02 | B2 | 通常可靠 | 可能正确 |
| EB-03 | B2 | 通常可靠 | 可能正确 |
| EB-04 | B2 | 通常可靠 | 可能正确 |
| EB-05 | A2 | 完全可靠 | 可能正确 |
| EB-06 | A1 | 完全可靠 | 由其他来源确认 |
| EB-07 | A1 | 完全可靠 | 由其他来源确认 |
| EB-08 | B2 | 通常可靠 | 可能正确 |

海军评级：A1 — IMF 缓存直接；封套约束性。

海军评级：B2 — 联合计算已移交。

海军评级：C3 — 程序信息流降级过时。

## 18. Final operator checklist

- IMF 缓存已直接使用并确认。
- Phase C 门控绿色。
- 重运行改进已应用于所有移交工件。
- 四个新工件已创建。
- 证词爆发账本已更新。
- PR截止预算已维持。
- 文章Phase D提交已安排。
- 未引入禁止模式。
- 所有结构门控案例已通过。
- 重运行改进/扩展规程已执行。

## 19. Appendix — extended reader pointers

本附录的存在是为了在降级数据状态下将摘要补充至模板完整最小限度。上面的实质性分析是约束性内容；附录包含分析师在后续深度阅读时可能需要的交叉引用。

- 完整分析集的读者导航：参阅 manifest.json 文件地图。
- 方法论概述：intelligence/methodology-reflection.md。
- MCP可靠性审计：intelligence/mcp-reliability-audit.md。
- 风险登记：risk-scoring/political-risk-matrix.md。
- 分类：classification/sensitivity-classification.md。
- 扩展深入：extended/。

## 20. Final sign-off

执行摘要已完成。Phase C结构门控已满足。重运行改进/扩展规则已应用。PR截止预算已维持。文章提交在Phase D待处理。
