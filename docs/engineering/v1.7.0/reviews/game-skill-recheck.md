# 游戏策划复审：DialogueTutor 1.7.0 生成技能

评审日期：2026-09-07。范围：首轮 G1、G2、G3 及对应修订；完整读取新增 `references/engagement-and-narrative.md`，定点读取入口、交互规格、评审规则与收束/复访 API，并运行四项相关现有测试。未扩大为新的课程评审。

**裁定：游戏策划范围通过，可以开始独立生成。** G1、G2、G3 均已关闭；无未解决 Critical、Important 或 Minor。该结论覆盖本轮读取的生成规则及列明接口行为；新 CH6 HTML 的可玩路径与真实呈现仍须生成后评审，不代表真实学习者已形成持续投入或延迟保持。

本报告沿用候选分支 GitHub 链接。发布前以文件哈希识别候选，发布后应固定为实际提交 URL；本轮未验证远程链接已发布。

## Strengths：本轮实际改进

1. [入口路由](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/SKILL.md#L25-L37)现在要求章节任务读取参与动机参考，并明确区分未评分预测与提交即验证的测验，生成者不必自行补足两者时序。
2. [新的核心循环](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/references/engagement-and-narrative.md#L9-L19)要求选择影响数学对象、结果回应原判断、下一挑战增加实际要求。吸引力可以由数学发现和能力使用直接产生。
3. [反馈与挑战表](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/references/engagement-and-narrative.md#L34-L47)使辅助修正、独立结果、可诊断错误和过程未知的数值错误各有合适回应，同时没有推断学习者未留下的过程。
4. [收束配方](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/references/engagement-and-narrative.md#L55-L67)给出了可以直接实现的状态读取与真实复习入口，结尾不再依赖计数和禁用的下一项。

## Critical

没有。

## Important：原三项均关闭

### G1：预测先公布答案、发现循环不足——关闭

**原问题。** 普通 quiz 提交会显示答案，却被规范推荐用作探索之前的未揭示预测；“可见结果”也未要求回应原判断。

**实际修订。** [两种时序](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/references/engagement-and-narrative.md#L21-L32)分别规定：提交即验证用普通 quiz；探索承担验证用同一 interactive 收集未评分预测，冻结后才运行、归组或揭示。状态含阶段、原预测、时间、历史和参数，恢复重建锁定与比较；重新开始保留历史。[交互规格](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/references/interactive-html.md#L112-L115)与入口已同步。

**关闭依据。** 该配方不需要修改普通测验纠错机制，使用现有持久化状态即可实现。首屏、默认选项、图示初态和伴读不得提前泄露；原预测与结果需真实对应。手选样本明确标为枚举/演示，不混入随机频率。首轮要求的容器、时序、可见后果与恢复契约均已具备。

**生成后仍要操作的既定验收。** 从空记录核查提交前隐藏、提交后冻结、一次样本形成一个统计量点、结果比较、改变条件与恢复，以及不同题的独立提交。这是产物验收，不是未关闭的技能问题。

### G2：挑战节奏、选择后果与具体胜任反馈不足——关闭

**原问题。** 泛化的“选择—反馈—下一题”不能排除重复同一作答模式，也不能保证不同出口真的改变学习要求。

**实际修订。** 新参考 [L11–19](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/references/engagement-and-narrative.md#L11-L19)要求蓝图填写悬念、影响数学对象的选择、揭示证据、原判断回应与下一动作；[L34–47](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/references/engagement-and-narrative.md#L34-L47)给出示例、补全、独立题、改变条件的递进，以及六类真实记录的反馈配方。独立核对不自动获得过程推断；只有记录支持才说已修正哪个环节。

**关闭依据。** 这些要求能具体区分“换标题”和“增加一个判断”。[交互示例的干扰项反馈](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/references/interactive-html.md#L234-L239)也已从命名误解改为可执行的矩形面积检查。[分支契约](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/references/interactive-html.md#L94-L105)澄清 `assisted` 不等于辅助答对、`incorrect` 可含自评；因此作者不会仅从结果码编造成就。现有 choice 反馈、提示、补救、路径和自定义活动可以承担实施。

**生成后仍要操作的既定验收。** 分别走错误→局部修复→不同题、辅助→不同题、独立正确→可选条件变化、跳过→具名支持。检查反馈是否对应实际输入，下一题增加或减少的判断是否真实。

### G3：结尾与回访只靠数量/日期，导航可能伪装提取——关闭

**原问题。** 技能缺可实现的收束配方，普通 `navigate(id)` 又不会自动清除上一题答案，不能直接标成回顾重启。

**实际修订。** 新参考 [L57–61](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/references/engagement-and-narrative.md#L57-L61)让作者收束活动读取真实状态、区分证据来源、提供实际挑战和回顾任务；有真实 review item 才调用 `navigate(item.activityId,item)`。无复习记录时提供初次任务或继续工作，不伪造时间、item 或分数。已明确保留未完成草稿和待自评回答，并以“继续作答”命名。[交互规格 L107–110](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/references/interactive-html.md#L107-L110)同步此契约。

**接口核对。** 当前 [getReviews](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/assets/interactive/lesson-runtime.js#L338-L348)从既有状态返回真实活动 ID、日期、到期标志及闪卡索引；[navigate](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/assets/interactive/lesson-runtime.js#L1144-L1164)第二参数进入复习流程，完成题重试前关闭解答，未完成草稿和待自评工作保留。`getState`、挂载/恢复/导航事件和公共导出均存在，作者侧收束不需要额外通用 schema。

**实际验证。** 下列现有测试全部通过，四项通过、零项失败：

| 测试位置 | 本轮运行的行为 |
| --- | --- |
| [studio.test.cjs](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/tests/studio.test.cjs) | 到期入口进入正确场景、答案关闭、未完成输入保留；当前位置与自定义状态刷新/导入恢复 |
| [lesson-dom.test.cjs](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/tests/lesson-dom.test.cjs) | 到期正确推进而即时重试不推进；开放题草稿和待自评回答跨刷新保留 |

测试采用受控时间验证现有程序行为，未模拟真实学习收益。本轮没有新增测试文件或修改运行组件。

## Minor

没有。叙事命名、图示响应、操作愉悦感和真实结尾文本在实际生成的 CH6 中按既定路径检查，当前不增加新的门槛。

## 独立生成后的评审范围

[expert-review.md](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/references/expert-review.md#L20-L27)已要求保存核心问题线的预测一致、不一致、辅助修正、跳过、输入输出及活动 ID。游戏策划评委同意本轮技能进入独立生成。最后的运行库修订若仅涉及已报告的闪卡辅助与色彩事件边界，定点核对其是否改变上述接口或行为即可，不重新展开已关闭意见。

## 本轮读取附近的文件 SHA-256

| 文件 | SHA-256 |
| --- | --- |
| SKILL.md | `212bc64529fb8f7e67d4c5f171ac0c182034257009606d9b0ce011dd7f5409ac` |
| references/engagement-and-narrative.md | `b1e437c840f74e42be7c67f9232f39215704a52cc5fb6b095251d53ee5d4ffe5` |
| references/interactive-html.md | `6344be385dc1068b81ca60c964220785784dc3cdcd16ea95f0307c66774a9aa6` |
| references/expert-review.md | `a1b6645a8d8aabfb21ade3a6d96c0ac0129545afb73ed046f6546cce9cbd37be` |
| assets/interactive/lesson-runtime.js | `ea31e6eccd704a54a5f86dbf22a0304e98036bc1520003071b42aa0d7939f313` |

最终包定点裁定（2026-09-07）：已核对闪卡关联全解在首次翻面前记录辅助、复习时关闭全解，以及原事件端点/阴影交集的渲染修复；它们没有破坏已审导航、状态或预测接口，文档也已准确说明推荐数组与未完成工作由作者入口如实命名，游戏策划通过结论保持（运行组件 SHA-256：`49b17f35fc35fda0e0ba432743313031b71fcc33f8c4b787ccccf2115c5563bb`）。
