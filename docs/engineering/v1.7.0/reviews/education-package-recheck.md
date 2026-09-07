# 教育学专家定点复审：1.7.0 候选全包

复审日期：2026-09-07。对象：`repo/plugins/dialogue-tutor/skills/dialogue-tutor/`。

**我的裁定：全包通过教育准入，可以独立生成正式课程。** 首轮 [education-package-review.md](education-package-review.md) 的 P1–P4 已关闭，新增参与/叙事参考与补充研究的边界通过。当前没有未解决的 Critical、Important 或 Minor。本结论批准进入生成阶段，尚未批准未来的 Edexcel IAL S2 CH6 HTML，也不代表已经测得真实学习效果。

本轮只复查首轮四项、相关代码和文档、新增参考、真实返回 API 与新增 B1–B3 研究段落；没有开展历史全量研究，也没有生成正式课程。

## Strengths

1. **修订覆盖了真正控制生成和运行的位置。** 预测时序同时进入入口与活动参考；闪卡问题改了公共运行组件与关联语义；分支实际含义与教学文件同步。并非仅在评审回复中承诺修复。
2. **辅助记录现在尊重作答时序。** 提前读全解会约束关联卡片；翻面后才查参考不会倒改此前发生的自报回忆。原答来源仍为自评，未来尝试仍保留参考接触。
3. **继续学习有了具体动作和边界。** 新参考要求问题、可见证据、回应、修复、新题和收束相互对应，同时保留跳过、全解与未完成作答。游戏循环服务数学能力，未把点击、积分或停留时间当作教育证据。
4. **研究采用的范围明确。** ICAP 不等于鼠标交互，渐隐不保证远迁移，阶段性模拟研究不当成随机因果比较；旧研究核查台账与本轮定点阅读已经分开。

## Critical

没有未解决 Critical。首轮没有要求重建的核心结构，本轮也没有发现推翻该结构的证据。

## Important：逐项关闭记录

| 首轮项目 | 实际修改及复查证据 | 裁定 |
| --- | --- | --- |
| P1 预测 quiz 提前给出探索结论 | `SKILL.md` 生成流程第 2 步、`interactive-html.md`“任务舞台与表现分支”和 `engagement-and-narrative.md` L21–32 区分两种时序：普通 quiz 提交即核对；探索验证则在同一 interactive 内保存未评分预测、冻结、操作揭示并比较。字段及恢复/历史要求具体可实现。普通 quiz 仍即时反馈，后续图示须称为解释已知结果 | 关闭；未来生成物还须实际检验预测控件 |
| P2 关联全解的闪卡辅助遗漏 | runtime 在翻面与重试时合并活动级和卡片级接触；`captureFlashSolution` 同步捕捉已打开全解并处理 native toggle 时序；到期导航收起关联全解。原 DOM 探针现在得到 `source:self, assisted:true`。新增测试覆盖提前/之后查看、持续打开换卡、到期、导入与再次打开。文档明确 `solutionId` 对整组卡生效，部分覆盖须拆组 | 关闭 |
| P3 分支文档比实际行为窄 | 交互参考明确 assisted 可以发生于提交前，不保证正确；incorrect 包含客观错误、开放题未达到要点和闪卡仍需回忆。标签不得据此虚称辅助答对。教学参考同步改为真实作答/求助/跳过事件并注明来源。原探针中的行为与新契约一致，没有把自评升级为客观通过 | 关闭 |
| P4 兼容正文两处理由 | `s2-source.html` 下限依据改为题面规定区间外密度为零；`write down` 段承认对称性直接给出结果、积分合法核对，删除没有数据的耗时断言。此前 CDF 理由、公式行号及期望存在条件修复均保留，与 JSON 对应 | 关闭 |

P1 和 P3 是生成契约修复，不要求改变普通 quiz 的即时纠正或有帮助的求助推荐。保留的反例探针故意含旧式 Prediction quiz 与不成立的路线标签，用于显示旧配方的问题；它不是新课程范例。

## Minor

本轮没有新增 Minor。没有把模型评委的通过解释为真人参与或学习成绩。

## 本轮实际验证

我执行了以下检查，未重复无关的研究或测试。

| 命令或操作 | 结果 |
| --- | --- |
| `node reviews/education-api-probe.cjs` | 原闪卡反例已修复：活动记录参考接触，本次卡片自评 `assisted:true`、`source:self`；提示前置建议、负自评建议和普通 quiz 反馈仍如实展示 |
| `node reviews/education-review-navigation-probe.cjs` | 全部断言通过：普通导航保留原答案；真实 due item 加第二参数进入问题状态；数值草稿、待自评开放原答与历史均保留 |
| `PYTHONDONTWRITEBYTECODE=1 node --test --test-reporter=spec --test-name-pattern='flashcard\|same-card\|shared full explanation\|import preparation\|due-review' tests/*.test.cjs` | 12 项通过，0 失败；包括新增四项、原闪卡/共享全解、到期返回和来源区分 |

首轮我已实际运行 Python 15 项与 Node 58 项并全部通过。本轮 12 项是对应修复风险的定点复验，不能写成我又完整运行了新增后的所有测试。两个独立探针使用内存 DOM、受控时间和专用课程 ID，不是学习者记录。

## 新增参与与叙事参考的教育核对

我确认 `engagement-and-narrative.md` 中以下要求与通过的教育结构相容：

- 未评分预测在同一组件冻结；重开一轮保留原历史；未预测者不被虚构为预测错误；主动看全解者不被虚构为仍未见参考。
- 一份样本形成一个统计量点；手选枚举与随机抽样频率分开；样本量、重复次数和抽样条件分别标明。
- 正确反馈回应所见证据；数值错误且过程未知时不臆测错误原因；辅助正确认可具体修正，但保留辅助来源，再引向不同的新题。
- 收束读取当前真实记录，不因进入最后活动就宣称全章掌握。改变条件的挑战与下次回顾各有真实目标 ID。
- 复访使用 `DialogueTutor.getReviews(lesson,state,Date.now())` 的真实 item，再调用 `instance.navigate(item.activityId,item)`；不伪造到期记录。未完成草稿或待自评回答入口称为继续作答，不称新的独立回忆。

这些约束已经有可用的运行 API。未来实际课程仍须逐一检查它的题目、字段、状态恢复、显示文字与按钮去向。

## B1–B3 的证据边界复核

`learning-evidence.md` 的 B1–B3 与本轮已经读取的原始研究相符：B1 是框架与研究综合；B2 分开 35 人课堂准实验与 54 人概率随机实验、近迁移与远迁移；B3 分开 89、141、55 人的阶段，未冒称阶段差异是随机因果效应。旧 E/A 明确承接 1.6.0 的访问层级，未冒称本轮全量重读。

本次仅对同一 B2 追加了出版年份的书目信息核对：[大学存档含封面 PDF](https://escholarship.org/content/qt81b9j9hs/qt81b9j9hs.pdf) 的元数据页明确列出 2000 年。其余原始 URL 与研究采用边界见 [education-baseline.md](education-baseline.md) 和当前学习证据参考，不增加新的效果主张。

## 本次准入的文件快照

下列 SHA-256 记录复审完成时文件状态，后续内容变更须对应新的检查范围。

| 文件 | SHA-256 |
| --- | --- |
| SKILL.md | 212bc64529fb8f7e67d4c5f171ac0c182034257009606d9b0ce011dd7f5409ac |
| references/teaching-design.md | 1cf2d22da4db2cbd2ed979840d2505b02af015750f35f188fb914143db6b5c40 |
| references/interactive-html.md | c637d2a16c4c81d0eb072d13ae762b0b1cd92b831e4a62bc10b810f92ebc62e1 |
| references/engagement-and-narrative.md | b1e437c840f74e42be7c67f9232f39215704a52cc5fb6b095251d53ee5d4ffe5 |
| references/learning-evidence.md | 1dab2930fba770135c0b787e37233d13a3c5f2809e752d6124269a40a4c8bdd2 |
| assets/interactive/lesson-runtime.js | 49b17f35fc35fda0e0ba432743313031b71fcc33f8c4b787ccccf2115c5563bb |
| scripts/build_lesson.py | b98d444160ac3656a9e3a842410eedc0153b7cd7b9839d96df366261516b04a0 |
| examples/s2-source.html | 7fa0e4118214a57a46c0ebce3248df87ab9bc51c1db0bb361b9917f48ed82e48 |

教育评审准许进入独立生成。生成者仍须从新技能与正式任务形成 CH6 目标蓝图、操作、可查全解与实际课程；若 HTML 退回，先把失败映射回技能，再重新生成。
