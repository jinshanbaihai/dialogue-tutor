# run-02 候选技能：教育学定向复审

2026-09-08。审阅者 `correction_education`。**修后最终裁定：C0 / I0 / M0，教育条款批准启动从空白生成。** 初审唯一I已经定点修复，具体最终hash和范围见文末。下文保留初审发现作为修订证据，不是当前未解决项。这里没有新HTML，没有新课件通过，也不代签公共runtime实现；启动仍需根汇总程序及其他席的实际结论。

## 阅读与版本

已完整读取根裁定 `reviews/correction-run-01-decisions.md`，以根合并级别和采纳范围为准，包括采纳叙事席第五幕职责错位意见。已读候选19文件hash快照并实际重算，全部匹配；代码实现与未变文档的hash一致不代表本席代审它们全文。

实际文本阅读：

- SKILL相对上一获批版本的全部实际diff；当前45–92（§0/0.5）、689–790（§1.7七幕/两半）、1392–1538（§1.9六项及完整真实变换示例）连续阅读。
- 新 `generation-checks.md` 1–51全文。
- `teaching-design.md` 1–61、`engagement-and-narrative.md` 1–115、`visual-design.md` 1–62、`expert-review.md` 1–43全文（聚合输出省略的engagement 82–95另补读）。
- `interactive-html.md` 1–484全文，分1–190、191–345、346–484读取。
- 全部上述受影响refs实际git diff，既核新增句子，也核上下文现行范例。

| 文件 | 当前SHA-256 |
|---|---|
| SKILL.md | `e189f73e9415e6b29903cd6e946caea7ee9718a479b8ec021bcc0c6a130f63a5` |
| generation-checks.md | `86661c5c58a6fb3f0b74d8080f31783b518d54b5427d81f64bbd31ac4d30a8e2` |
| teaching-design.md | `310b8893ca85dcaa4b066739989026feb5f079bb3312c88b69e0c0ac5d387ff9` |
| interactive-html.md | `79f7277d9a3d5ed8c858184bf3154c0f02eed3769f2ff6931bfe8d283a0e8f71` |
| engagement-and-narrative.md | `5cc41f6c99f3e02f91c6ec2d610d0be7f270302a77aa4c5aad1fd03528bb9cd2` |
| visual-design.md | `95b4e7dd6d2457805da2b28ba0ec9eabe42b2a86d5ddd9fa4981fa6dc8a590cd` |
| expert-review.md | `940674723145616418ca77a92abec5ad93fdb4a8c996ef81d03cf596dba17d2f` |

## 已闭合的条款

| 根采纳/教育目标 | 实际现行规则与判断 |
|---|---|
| I1真实运算，非模板行数 | SKILL§1.9先before/实际operation/after/reason；单项概率直接取，已最简可作明确检查，禁止无加法却称整数相加，maximum不套mean。teaching要求记录objectId并列所有相邻同式判定；generation-checks要求独立题面重算与理由逐条审，不机械删除同式。与旧“每个变换一行”相容，保留真正小步。通过 |
| I7第五幕归位 | teaching的蓝图先分配首次建立位置；长的条件变化构造归③/④，⑤只对已建关系提供短具体另一方向，明确不能压缩/藏补讲使其变短。SKILL原⑤一两句及③④主体仍保留。不是以原run01总体覆盖结论推翻根具体裁定。通过 |
| C1组间泄露 | teaching/interactive明确后组行名、禁用、数量、提示均不得由标准答案提前回答前组；提供“来自用户草稿且误选保留”或“全候选含不允许”两种可执行方案。完成度不泄露标准条数，统一冻结后仍判遗漏。零草稿/漏/多/同时漏多进入作者实际检查。通过 |
| I6具体差异反馈 | 明确missing/extra/matched、每项资格/值/权重和真实行；不允许路径先解释非法，不给它套有效权重；不以三类quiz补讲代替多选差异。新草稿/历史核对分区，原答与辅助快照保持。通过 |
| M1同构与迁移 | 比较数据身份、条件、目标、呈现、必须判断；只换数称同构或新数据；换统计量/抽法也须写新增判断才称挑战/迁移任务。活动、反馈、结尾、记录一致，设计类型不等于已证迁移能力。通过 |
| C2/C3提交与状态转移前采集 | 新同步边界要求提交前、公开/文件导入导出前采集；coverage按来源/组件/条件/行分发，保留首次时间并集，拒绝坏记录仍保可信接触；同队列summary路径、真实存储新窗口、共享参考及单题不污染均明确必测。正面旧helper尚有下述I1；除该示范冲突，合同本身完整 |
| I2收束与四类后续 | 编码前开场目标/条件/精确结果/显示谓词/独立事实字段/nextAction表；六种真实场景，辅助不能被互斥枚举覆盖；计数不能替代当前数学答案。正确/辅助/错/跳过均具名真实任务，锁定答卷只能回看。通过 |
| I3真回忆 | 明确浏览、草稿、提前、到期；真实review item和卡index，已完成第一卡、当前第二卡背面实测，提前不推进间隔；没有item给初次任务不伪造。文本通过，runtime行为由程序席审 |
| I4恢复语义 | 验证身份/版本/hash再接字段，保留合法半草稿/错误合法选项；接触历史与实际已揭示范围分开，先持久化再恢复DOM，提示不自动变全解，不靠短暂isRestoring吞异步事件。通过教育证据合同 |
| I5媒体与角色 | 角色按出现位置，不按数字字符串；同值不同身份和不同运算角色保留；requested/displayed及当前语义回退分开、迟到回调隔离，错误不留旧推导链接。MathML/PNG/fixture/browser证据层级独立。通过教育可解释性合同，视觉实现另审 |

七幕、两半、每小问六项、未知前提先讲透、完整静态推导、免打字选择/flashcard、自由参考、错答不锁、组件证据不冒充独立完整证明均未被本轮修法削减。原§1.9积分例虽仍有必要长链，但示例具有真实展开、代值、幂、乘法、整数合并、分数运算，对比空操作的解释不要求把这些真正运算删掉。

新generation-checks已经从“须有”转为“本课对应表+具体风险输入/预期+正式前实操”。它适用实际采用的功能，允许有理由的不适用，不强迫所有学科照抄N3/n2四组构造；明确独立期望不能由作者同一评分函数产生。退回后先修skill、独立作者空目录新生成，未改成旧HTML补丁流程。

## 唯一Important：旧正面代码仍把open等同真实可见

位置：`interactive-html.md`当前246–263行，明确写“可采用以下组件内函数”。其中：

```javascript
return Boolean(local.referenceViewed ||
  (saved.exposure && saved.exposure.reference) || (panel && panel.open));
```

本文件236行新增规则要求检查祖先hidden/关闭details，未实际显示的不记已见。上述现行范例却允许`<div hidden><details open id="solution">…</details></div>`触发参考。它是可供作者直接复制的正面范例，不能只用新原则已写清而放过。

本席以jsdom做纯文档示例复核（没有生成新课）：local与runtime接触均false，上述隐藏祖先中的details.open=true；helper结果true，而ancestorHidden=true。这个结果只证明示例谓词过宽，不冒称新课真实用户见过参考。错误会把从未显示的答案记作辅助，并在幂等并集后持续保存。

**最小修法：** 此示例复用前节的统一同步采集/实际可见判据；不要独立使用裸`panel.open`作为新接触证据。可让`hasReferenceContact()`先调用作者的`synchronizeTrustedExposure()`，再只读该函数已按coverage/实际可见判据合并的可信本地/运行时历史；说明这一示例仅适用于全解覆盖当前整题的范围。若保留局部predicate，应明确遍历祖先hidden、关闭details等，并与所有入口共享同一函数，不能再有第二套宽松规则。

定点复审要求：读修改后实际范例和相邻scope说明；隐藏祖先或关闭祖先的open子details不新增reference，真正可见且open的参考同步入账，已有真实历史关闭后仍保留。无需以此改新课件，也不需要本席代测runtime的beforeImport/Export实现。

## 生成许可边界

当前先修这一个具体文本示范冲突，复审无C/I后，本席可批准新作者从空白生成；公共runtime及其他席的门槛仍由各自审核完成。后续HTML必须重新进行独立题面Fraction核算、全文所有推导/反馈审读、三误解/全解先看/完整构造/参考竞态/回访操作和实际图像审核，任何run01通过项不能沿用。


## 修后定点复审：唯一I关闭

2026-09-08。按根通知，实际连续读取修后 `interactive-html.md` 236–275行及更新候选hash快照；没有重复全文审查或修改技能文件。该文件最终SHA-256为 `8829005b923cab403f9aa98399d077f57a36b1c23bb55133ee920de453a7614b`，与根通知和快照一致。SKILL仍为 `e189f73e9415e6b29903cd6e946caea7ee9718a479b8ec021bcc0c6a130f63a5`。

实际范例已删除裸 `panel.open` 和未分条件activity布尔的直接判定，改为 `collectVisibleExposureFor(id, conditionKey)` 与 `trustedExposureFor(id, conditionKey)` 的参考并集。相邻说明明确：统一采集器由作者实现；源按coverage适用于当前condition；核源及全部祖先hidden、关闭details、有效display/visibility；过去真实历史不因关闭/隐藏撤销；activity级记录只有确实覆盖当前条件才沿用，多条件组件不得粗粒度污染。

三项原定验收在文本合同中均得到明确结果：隐藏/关闭祖先下的open详情不新增接触；真正显示时同一来源同步采集；曾真实展示后关闭仍从可信历史保留。代码变量和末尾范围说明同步改为活动+条件，不再遗留solutionId整题布尔范例。此处验证的是作者生成契约及正面范例一致性；采集器并非runtime自动实现，未伪造函数运行或新课DOM通过。

**I关闭，教育scope最终C0 / I0 / M0，通过。** 允许新的独立作者据本版技能从空白生成；公共beforeImport/Export实现由程序席继续独立把关，下一轮完整HTML仍须全文数学/教学、组间泄露、原生参考即时提交与转移、具体补讲和真实回忆实物验收。
