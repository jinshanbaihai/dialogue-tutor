# run-02候选技能：游戏策划定向复审

2026-09-08。**游戏scope：PASS；Critical 0、Important 0、Minor 0。** 本席批准这一候选生成规格进入独立空白生成；实际开工仍需主作者汇总其余技能评审与公共runtime评审通过。该结论不批准新HTML，也不撤销run-01退回。

本次没有改动技能、引用文件、runtime或课件，只创建本报告。没有运行新课程或把条款存在当成行为已实现。

## 阅读范围与版本

对照上次批准基线commit `2684c61d9651da4f3b117358e0e508900e09d827`，完整读取SKILL和四份相关reference的差异。新`generation-checks.md` 1–51全文读取；`engagement-and-narrative.md` 1–115、`teaching-design.md` 1–61、`expert-review.md` 1–43全文读取。`interactive-html.md`读受影响导入/导出边界、组依赖、具体反馈、媒体和恢复合同及其上下文；旧无改动部分承接此前全文审读，不称这次又完整重读484行。SKILL本轮仅定向读取新增§0.5入口及§1.9实际运算条款，不冒称本轮重新通读2293行。

实际19文件SHA逐个对照 `reviews/correction-run-02-skill-candidate-hashes.json`，全部一致。哈希校验仅说明版本身份，不代表阅读或认证其余19文件的全部实现。

| 实际文件（技能目录内） | 当前行数 | SHA-256 |
| --- | --- | --- |
| `SKILL.md` | 2293 | `e189f73e9415e6b29903cd6e946caea7ee9718a479b8ec021bcc0c6a130f63a5` |
| `references/generation-checks.md` | 51 | `86661c5c58a6fb3f0b74d8080f31783b518d54b5427d81f64bbd31ac4d30a8e2` |
| `references/engagement-and-narrative.md` | 115 | `5cc41f6c99f3e02f91c6ec2d610d0be7f270302a77aa4c5aad1fd03528bb9cd2` |
| `references/teaching-design.md` | 61 | `310b8893ca85dcaa4b066739989026feb5f079bb3312c88b69e0c0ac5d387ff9` |
| `references/interactive-html.md` | 488 | `30fc6bf77c3d59f82724647cca78d20f547c000a95da37d712fa2f0e7a7717fc` |
| `references/expert-review.md` | 43 | `940674723145616418ca77a92abec5ad93fdb4a8c996ef81d03cf596dba17d2f` |

## 原游戏C/I/M逐项复审

| 原失败 | 已落实的具体生成指令 | 裁定 |
| --- | --- | --- |
| C1 后组固定正确路径集合泄露前组 | interactive-html 285及teaching-design 53要求先列组依赖；映射行严格来自本人草稿并保留误选，或全部候选可答且有不允许项；不提示标准数量、不自动补齐。generation-checks第2项在零/漏/误/同时漏多草稿检查全部可见组。提交后遗漏正确路径仍计缺项 | 已解决生成规格缺口 |
| I1 回忆/到期入口仍旧卡背或错卡index | engagement 101–105区分浏览、继续草稿、提前练习、到期；真实item完整传navigate，含正确cardIndex；非到期item可启动真实原生重试但不假造到期。generation-checks第10项固定第一卡已完成而当前第二卡背面打开的重现 | 已解决生成规格缺口 |
| I2 结尾计数替代开场回应，正确/辅助/跳过无具名下一步 | engagement 97明确openingQuestionId/conditionKey/target/resultSource/lineIds/displayPredicate/evidenceFields/nextAction表；显示、作答、结果、辅助分别保存，六种实际场景预写期望事实。99规定四类后续的具体任务，锁定已完成卷只能回看；generation-checks第8/9项实际点击与改条件断言 | 已解决生成规格缺口 |
| I3 原像多选只给答案键，无精确差异 | interactive-html 287与teaching-design 53要求missing/extra/matched，逐身份的真实值、机制资格/权重、代入行和归组行；不允许路径先说明条件，不套有效权重；单选补讲不能代替多选检查。generation-checks第8项一漏/一多/同时漏多/正确实测 | 已解决生成规格缺口 |
| M1 重试草稿旁旧反馈仍称本次 | interactive-html 287要求当前draft与历史submission分区，上次核对准确标名，冻结原答与辅助快照不变；generation-checks第8项实际重试查标签，不洗已见接触 | 已解决生成规格缺口 |

现在的构造配方不会把“只检查用户显示的行”误当全部正确：285明确遗漏的正确路径仍须判缺项。反馈也区分不属于目标事件的有效路径与根本不允许的路径，避免误给后者套合法概率。这两点把首答保护与反馈完整性接起来，不能只隐藏正确答案后漏掉完整性核对。

## 六种收束情景与四类后续没有被错误合并

六项是测试情景：未作答未揭示、只观察、无辅助正确、辅助正确、不一致、跳过。实际数据独立保存是否显示、是否作答、结果、辅助；因此辅助且错误可以同时保留，跳过之后观察也不会被“跳过”抹掉真实揭示。文档明确没有预测活动便不编原预测，避免为了叙事完整虚构用户动作。

nextAction职责现已具体：正确后的新增判断、辅助后的未揭示新条件、错误后的差异局部检查、跳过后的具名支持／任务，且要求真实点击目标。已见结果由当前精确数据回答开场，未见结果只给检查入口；计数继续作为记录，不取代数学结论。这满足本席提出的生成表与行为断言需求，无须再次增加抽象“有闭环”条款。

## 原设计优点继续保留

三条有内容的数学操作链仍在：身份路径→统计量映射、同输出原像→概率、条件改变→重新构造。依旧要求全解可自由查、错答可继续、每个真实变换完整给依据；没有每个等号强制点击，没有为参与增加打字，没有将心答闪卡或组件选择认证为自由书写能力。仅换数值准确叫同构练习，改变统计量/抽法也需指出实际新增判断，不从一次答对推断广泛迁移。

阶段表还修复了映射已完成却说下一步代入的问题；教学阶段与图片加载分别记录，请求／失败不称已看到图。新的gen-checks要求作者在正式交审前把合同实际运行，专家仍独立复现；没有让作者自测代替最终审查。

## 接触与runtime的边界

本席读到interactive-html 212–238的共同同步边界：提交冻结前及导入／导出前采集真实可见接触，公开与原生文件入口均适用；按source/condition分发，非当前焦点猜测；坏记录拒绝仍保可信接触；恢复具体可见范围且不新增动作。gen-checks第4/5项明确原生summary同队列提交／即时旧导入／立即导出／新窗口，不能只测全局展开。它对应程序席已发现竞态，没有沿用本席run-01较窄顺序的通过作为所有入口证据。

本次**不认证beforeImport/beforeExport运行实现或签名兑现**，该项由独立程序席实测。19文件快照中的runtime SHA为`b16a6f702fbf8217b60ccba6a9782c011a92e017726416b01c2597e24c02fa45`。若其接口签名变化并影响作者合同，需按主作者通知定向重读受影响条款后更新此批准版本；无需凭未发生的假设改动制造新阻断。

## Critical / Important / Minor

- Critical：无未解决的游戏生成规格项。
- Important：无未解决的游戏生成规格项。
- Minor：无未解决项；原M1已有具体标签与测试要求。

## 独立生成与实物门槛

从游戏席看，当前文本足以进入下一份独立空目录生成，不需再堆同义规则。所有其余门槛通过后，新作者仍应先交本课generation-contract实际对象表，再完成真正HTML、Manim及作者风险测试；正式冻结后本席亲自执行新控件。至少复现跨组草稿保护、精确missing/extra、draft/history、六收束情景和四后续、真实多卡回访，不能拿这份SKILL PASS代替新实物。

DOM、人工load/error分支fixture、实际PNG、真实浏览器、真人学习证据继续分开。当前没有新HTML、浏览器或真人体验通过结论。

## 教育I helper定点修正后的游戏批准

2026-09-08。按根通知定向读取interactive-html中`hasReferenceContact`及相邻解释的实际修改：现在调用`collectVisibleExposureFor(id, conditionKey)`与`trustedExposureFor(id, conditionKey)`，不再用裸panel.open或未分条件的activity布尔直接判本题接触。正文明确检查源及全部祖先的hidden、关闭details、有效display/visibility；隐藏容器内open详情不算展示；真实历史不会因现在关闭而消失，跨条件仅沿用实际coverage覆盖的来源。两个helper明确是作者须实现的示意接口，不声称runtime已经提供。

该修正使“辅助事实”和“尚未看到当前结果”更准确，不削弱自由全解、首答冻结、六场景收束、missing/extra或回忆入口的游戏合同。**游戏scope维持PASS，C0/I0/M0。** 本次无需重审其余游戏项；未运行新HTML或认证helper实现。

最终interactive-html SHA-256：`8829005b923cab403f9aa98399d077f57a36b1c23bb55133ee920de453a7614b`。该值取代本报告先前候选文件哈希；其他18份文件逐个对候选快照核对无变化。技能主文件仍为`e189f73e9415e6b29903cd6e946caea7ee9718a479b8ec021bcc0c6a130f63a5`。实际独立生成仍依主作者汇总全部评审门槛，不把本游戏签字当作新课通过。
