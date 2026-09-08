# Run 03 活动蓝图（先于课件实现保存）

范围：Pearson Edexcel IAL S2 第六章 Sampling and sampling distributions；中文 bgct，官方定位只依据本轮 official-scope.md。原创情境为社区维修站的调查与工时卡抽样，不复刻教材题目。设计采用 DialogueTutor 原创组合，公共 quiz/steps 组件的实现来源按技能参考标识。

## 最小课程结构与目标—动作—证据

| 位置／活动 ID | 明确待测失败 | 目标能力与先备支持 | 学习者动作与可观察证据 | 可视化关系／必要解释 | 学习身份、反馈和下一步 | 全解位置、适用条件 |
|---|---|---|---|---|---|---|
| survey-plan | 把抽样框等同总体；声称普查无任何误差 | 指认 population、sample、sampling unit、sampling frame，按破坏性检验约束评价 census/sample survey；题面给短定义 | 保存五项开放回答与自评；不把自评称客观通过 | 文字先提供对象与约束，参考用“全体→登记册→抽中对象”说明遗漏 | independent 概念应用；未达要点先查本题对象映射，辅助后进入新统计量判断，跳过可先看例题 | dt-explanation-survey；维修站本月120个替换灯罩，名单仅108个，从中抽24个做破坏性抗压试验 |
| statistic-check | 把含未知 μ 的式子当统计量，或将固定参数当随机统计量 | 按“仅样本＋已知常数”判定 statistic；给 X₁、X₂ 与未知 μ 含义 | 选择后提交；保存选项与客观判断；后续新题开放写理由 | 正式公式用 MathML；对照样本均值与含未知参数表达式 | concept；incorrect 进入完整例题，assisted 进入补全，correct 进入无放回迁移 | dt-explanation-statistic |
| sample-lab | 把等可能样本误认为统计量各值等可能；忽视机制改变 | 区分一次样本与 sampling distribution，跟踪有序等可能路径；提供均值小例子 | 冻结未评分预测→揭示精确枚举→选择查看某路径；动作和接触分别保存，不评分 | 三张工时卡 2、4、8 分钟，n=1/2，有／无放回，事件均值≥5/6/8；显示路径→均值→合并概率与柱图 | exploration；一致/不一致/未预测/已参考分别回应；可改变机制或进入步骤补全 | dt-explanation-lab：覆盖全部允许条件，身份含总体、机制、n、阈值及统计量 |
| worked-distribution | 不知道先列样本再合并的程序 | 完整示例，两张卡 1、7，放回抽2次，统计量为样本均值 | 只查看步骤，不称独立推导 | 4条有序路径合并为3个均值，概率总和为1 | example；为补全提供方法 | dt-explanation-worked |
| distribution-completion | 已知路径仍漏合并相同均值 | 在新题补关键概率；卡0、3、6，放回抽2次 | 提交 P(均值=3) 数值，精确核对；提示可选 | 全解给3×3对应表，题面不预给所求频数 | completion；错误回完整例题；辅助进入独立题；正确进入改变条件题 | dt-explanation-completion；9个有序基本结果等可能 |
| distribution-independent | 只会照均值例题，无法自行构造另一统计量的分布 | 新题独立组织样本空间与最大值 M 的分布；卡1、4、9，放回抽2次 | 开放提交完整表与依据、自评；独立证据来源明确自评 | 参考列 M=1/4/9 的累计路径合并，区分总体值分布与 M 分布 | independent（统计量变为最大值，结构迁移）；未达要点回例题 | dt-explanation-independent |
| distribution-probability | 开放自評无客观数值验证 | 再换卡2、5、10及统计量范围 R=max−min，独立核对 P(R≥5) | numeric 真实提交，独立／辅助正确分开 | 参考枚举所有差值，解释两个方向都计入 | transfer；incorrect 回例题，assisted 到无放回，correct 到收束 | dt-explanation-probability |
| without-replacement | 误沿用放回的分母，或忽视抽取不独立 | 改为卡3、6、12无放回抽2，自行写均值分布、样本概率依据，判断均值是否统计量，解释抽样前随机变量与抽样后观测值 | 保存开放原答和自评；覆盖统计量理由、随机性与非独立抽样 | 六条有序路径合并三值；解释P(第二张=第一张)=0 | transfer；错误回完整例题，可自由返回 | dt-explanation-without |
| evidence-close | 仅看结果被称亲自推导；进入结尾被称全章掌握 | 识别已有证据与待做任务，建立回访入口 | 读取真实 API 状态；具名按钮进入无放回挑战和独立数值回顾 | 当前实验条件、已显示理论值、原判断身份与题卡证据并列 | 收束；不以参与量推断掌握。回顾读 getReviews，真实 item 传 navigate；未有记录去初次任务 | dt-explanation-close，说明证据来源与边界 |

## 渐隐路径与表现分支

完整例题 worked-distribution → 新题补全 distribution-completion → 新题 distribution-independent / distribution-probability → 改机制 without-replacement。三个题组的数据、统计量或机制不同。steps 只显示完整例题，补全与独立题由 quiz 接收真实提交。

pathways 使用运行时真实 incorrect、assisted、correct、skipped；错误去具名示例修复，辅助去不同题练习，客观正确去改变条件或收束。开放题正向自评不触发客观正确路径。分支不封锁导航，不用 assisted 条件声称已经答对。

## 预测与状态计划

sample-lab 保存 phase、parameters、predictionDraft、prediction、predictionAt、predictionHadReference、predictionHadResult、revealedAt、history、resultContacts、referenceViewed、selectedPath 与 pathSelections。结果身份涵盖总体 [2,4,8]、样本量、放回条件、均值统计量、阈值。默认参数与恢复不计主动选择。

初始化和 dt:restore 同一入口：恢复参数/历史，合并本页已发生的全解与结果接触（以及本页已冻结预测历史），通过 restoreExploration 同步写回，再绘制。不得以 dt:exploration 代替恢复。真实改变、提交、揭示、选择路径及新一轮使用 dt:exploration。冻结预测时同步检查关联全解 open 与 runtime exposure，不能等待 toggle。

已提交预测快照不被后看的参考倒改；导入旧记录保留本页已有接触及真实已提交历史。立即导出和刷新检查合并已持久化，且探索次数、参与、作答数不增加。新一轮有相同结果接触时显示“已见同条件结果后的检查”；全解覆盖全部实验条件，因此全解接触影响所有条件，新条件若只见另一实验结果则不继承结果接触。

## 收束句 → 字段 → 触发

| 收束句含义 | 支撑字段 | 触发条件 |
|---|---|---|
| 当前轮仍待验证，并给“返回工时卡实验” | lab.phase、parameters | phase 不是 revealed |
| 当前条件下已查看 P(均值≥阈值) 与单卡概率的比较 | parameters、revealedAt，按同一枚举计算 | phase=revealed；小于、等于、大于分别措辞 |
| 原预测与本轮结果一致／不一致 | prediction、predictionAt、同一结果 | 有提交冻结预测；“未预测”独立口径 |
| 原判断属于参考后／同条件结果后检查 | predictionHadReference、predictionHadResult | 只读取提交快照，不重写 |
| 本次揭示前已经查看实验全解 | revealHadReference | 只在真实揭示动作冻结，不依据之后的阅读倒写；自查后加入这条明确收束 |
| 选择查看过路径 | pathSelections | 必须存在真实选择事件；默认项不满足 |
| 数值题独立客观正确／辅助尝试／结果待修正 | attempts 最后记录 source、assisted、correct | 按实际提交分开，数字正确不称过程已证明 |
| 开放原答已保存、自评如何 | open quiz attempts、source | 明确自评，未评不称通过 |
| 改变条件挑战／下次回忆 | without-replacement、distribution-probability | 按 getReviews 真实记录标日期或初次任务；无伪造 due item |

## 检查与限制

独立 Python 枚举核算全部题目及12组实验条件，另用 jsdom 对真实组装 HTML 操作。检查首次状态、预测冻结、参数变化、直接观察、参考→观察、先参考→导旧档→立即导出→刷新、结果接触合并、同条件再预测、改变身份、题卡错误/提示/正确/重复提交/重试/跳过、分支与回顾。

本轮正式受管预览设施缺失，不启动浏览器、webserver或替代预览，不声称截图与视觉通过；DOM/静态 CSS 检查与真实视觉验收明确区分。所有修改仅限 run-03，作者源重建 JSON 后用原技能组装器生成 HTML，绝不修改已组装 HTML。

## 生成后的蓝图核对

最终仍为3个目标、9个活动；revision 为 run03-v2。调查情境落实为替换灯罩的破坏性抗压试验。统计量随机性的解释检查纳入原无放回迁移题，没有新增活动。独立数学核算的默认实验结果为P(均值≥5)=5/9、P(X≥5)=1/3；完整结果见 records/math-check.json。
