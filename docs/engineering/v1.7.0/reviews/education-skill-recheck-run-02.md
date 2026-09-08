# 教育学专家定点复审：run-02 技能修订

复审日期：2026-09-08。复审范围限于 `reviews/education-html-run-01.md` 的既有 E1、E2、M1 以及 `reviews/run-02-skill-patch.diff` 对应的技能修订；未重做 run-01 全量课程调研，未修改技能、HTML 或生成物，也不把本报告当作下一份 HTML 的通过结论。

**裁定：C0 / I0 / M0。批准修订技能进入下一次从空白生成。** 该批准只覆盖本次读到的技能文本及其生成契约；run-01 HTML 仍按原报告退回，下一份 HTML 必须由独立生成者从空白生成后复审。

## 核对对象与证据

实际阅读：

- `reviews/education-html-run-01.md`：确认 E1“导入旧状态丢失参考接触”、E2“仅揭示却声称本人映射/归组”、M1“相等时仍要求寻找差异”三个旧阻断。
- `reviews/run-02-skill-patch.diff`：核对技能和三份指定参考的实际新增条款；补丁同时包含 `visual-design.md` 的颜色措辞修订，本次不把它扩展成新的教育阻断。
- `repo/plugins/dialogue-tutor/skills/dialogue-tutor/SKILL.md`
- `repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/interactive-html.md`
- `repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/engagement-and-narrative.md`
- `repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/expert-review.md`
- `repo/plugins/dialogue-tutor/skills/dialogue-tutor/assets/interactive/lesson-runtime.js`：必要的真实 API 核对。

运行时核对结果：

- `getState()` 是挂载实例方法，返回完整运行状态的副本；技能示例通过 `DialogueTutor.instance.getState().activities[id]` 读取活动级 `exposure`，调用方式与实际 API 一致。
- `prepareSession(lesson, savedState, now, sessionId, previousState)` 在导入旧记录时，会在同一打开会话中保留 `previousState` 的同会话活动接触；因此旧导入对象不能覆盖当前已发生的活动级参考接触。
- 运行时 `notifyCustomRestore()` 的 `dt:restore.detail` 只含 `{activityId, state: exploration}`。补丁已明确不能把运行时接触事实误当成该事件传入的自定义探索字段，必须在恢复后主动从实例状态读取。
- 运行时不会自动替自定义 `interactive` 保存“结果接触的条件身份”；补丁已将该责任明确放在自定义组件的探索历史/接触记录中，而没有声称公共运行时已经完成这项工作。

## Strengths

1. **E1 的修复已形成可执行路径。** `interactive-html.md` L193–218 要求把自定义字段、公共活动 `exposure`、当前关联全解是否展开统一核对；在新预测提交时才冻结 `predictionHadReference`，并明确恢复、普通导航不新增学习动作。它直接覆盖了“未看参考导出→看全解→导入旧记录→提交新预测”旧反例的状态冲突。
2. **冻结快照和后续接触已分开。** `engagement-and-narrative.md` L34、L57、L73 及 `interactive-html.md` L212–218 要求保存提交时辅助快照，并保持已提交预测的原时点身份；提交后查看全解不能倒改原预测。新一轮预测须追加历史，不把旧判断改写为未接触。
3. **E2 的“展示≠本人推理”已写成生成契约。** `engagement-and-narrative.md` L63–75 按实际事件限定动词：仅揭示只可说查看了对应关系；主动选路径、运行抽样、提交计算/归组/解释各自有单独证据要求；没有事件时只能给下一项任务。它同时要求收束按“句子→支撑字段→触发条件”实现，足以阻止旧句式由 `revealedAt` 单字段冒充学习者完成过程。
4. **M1 的相等关系已由固定文案改为计算关系。** `engagement-and-narrative.md` L57 要求比较反馈至少覆盖小于、等于、大于；相等时解释为何相等，且按当前计算结果和真实阶段决定时态，不再把“找出差异”套到等概率结果。
5. **同条件结果接触和参数变更边界已补入。** `interactive-html.md` L220 附近新增要求为揭示结果保存题目/条件身份、揭示时间和来源，身份至少覆盖影响答案的总体、机制、参数与目标事件；导入和刷新合并已发生接触而不新增模拟、作答或揭示。对改变条件只在既有参考实际覆盖新条件时连带标记，全解只覆盖部分条件时要求明确覆盖判断或拆分活动。这正面回应了旧报告补充的“同条件再判断仍被称未接触”边界。
6. **复审入口已把旧反例列为固定检查。** `expert-review.md` L27–33 要求实际检查仅揭示入结尾、先看全解后直接观察、旧导入/刷新、同条件新轮次、改变条件及相等参数；这使下一轮不能只走完整成功路径。

## Critical

无。此次没有发现新 Critical，也没有发现旧报告中未被修订契约覆盖的 Critical。

## Important

无未解决 Important。

- **E1：已关闭（技能层面）。** 修订同时规定导入前接触的运行时合并、当前全解展开检查、结果接触的条件身份和提交时冻结快照。它没有把 `dt:restore` 的探索字段当作唯一事实来源，也没有把同一活动的所有历史结果不加条件地宣称为当前新轮次的参考。
- **E2：已关闭（技能层面）。** 收束文案已逐类绑定揭示、选路径、抽样和实际提交事件，并禁止由默认参数、页面位置或揭示时间推导“本人计算/归组”。
- **M1：已关闭（技能层面）。** 相等关系已有明确的计算分支和复审条件，不再只按预测对错套固定“差异”结语。

这些是技能契约已具备的关闭条件，不是对尚未生成的 HTML 的行为认证。下一轮若没有按这些条件保存结果身份、逐句绑定事件或冻结 per-prediction 快照，仍应在产物复审中退回。

## 进入下一次空白生成的必要核查

下一轮实际 HTML 仍须至少复测：

1. 未看参考导出→看全解→导入旧记录→提交新预测；还要覆盖全解先关后导入、刷新恢复和打开全解后立即提交。
2. 直接揭示→同条件新轮次，以及揭示后改变影响答案的参数；核对“已见结果后的再判断”和无关条件不连带标记。
3. 仅揭示→结尾、仅选路径、仅模拟、实际提交计算/归组、辅助后提交和自评，逐句检查收束是否超出事件证据。
4. 使比较概率相等的首轮与重新开始，核对图、数值和“为何相等”的文字。

## 哈希记录

以下为本次实际读取文件的 SHA-256：

| 文件 | SHA-256 |
| --- | --- |
| `reviews/education-html-run-01.md` | `1e417978df62a540bd1061f014504789601b8ef816a4b61f98dfb55051c6360a` |
| `reviews/run-02-skill-patch.diff` | `83741ba91d80ebd6178327a8fff106dadb8f1f7c16d4b582fdc8f85e6ce944a0` |
| `repo/plugins/dialogue-tutor/skills/dialogue-tutor/SKILL.md` | `61af8371b3cf41be3ca9cbf179a045b3a56de9ab24328d4f9721d73a3fbc0052` |
| `repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/interactive-html.md` | `3121adeef97f11b85eeddff53eb8c44f65ec7d3696e37fe07cc305b4bee34785` |
| `repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/engagement-and-narrative.md` | `38b27dfb2994df6534d970acbc9ab25edcbbac2c86b693576e2a7ac7eadd8ce1` |
| `repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/expert-review.md` | `66779f7c7d1a0b5edb391b39d93d707e46cec0eefbec78d89952a9d14c2d483f` |
| `repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/visual-design.md` | `ff6c2cdc10e6e09d3e45bc3bd1d2b65cfd43024ae0dfd7445e7e9df108d34652` |
| `repo/plugins/dialogue-tutor/skills/dialogue-tutor/assets/interactive/lesson-runtime.js` | `49b17f35fc35fda0e0ba432743313031b71fcc33f8c4b787ccccf2115c5563bb` |
