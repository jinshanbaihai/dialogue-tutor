# 叙事技能定点复审：run-02 修订

复审日期：2026-09-08。复审范围仅为 reviews/narrative-html-run-01.md 中的 I1、I2、M1，以及 reviews/run-02-skill-patch.diff 对技能及相关参考的修订。未复审 HTML、lesson.json、blueprint 或其他不受影响范围。

## 复审依据

- 原成品问题与复查要求：reviews/narrative-html-run-01.md:20-49（I1）、:51-67（I2）、:71-77（M1）。
- 技能修订及其实际落点：references/engagement-and-narrative.md:57,63-75,87；references/interactive-html.md:193-222；references/expert-review.md:27-34；SKILL.md:57。

## 已成立的修订

| 项目 | 实际生成配方 | 验证触发 | 复审裁定 |
| --- | --- | --- | --- |
| I1 收束虚构本人完成映射/归组，且没有回答开场问题 | engagement-and-narrative.md:63-74 先列“实际证据→可称述内容”，明确只揭示、主动选路径、随机运行和实际提交各自能说到哪里；要求先做“收束句→支撑字段→触发条件”对应。:75 再规定收束按“当前轮条件→实际结果及关系→原判断身份→具名下一行动”回答开场问题。 | :87 要求同时走“仅揭示→结尾”“先全解→直接观察”“实际完成目标动作”，逐句核对动词与记录；并核查改变参数后仍使用当前轮模型。 | **已解决（技能层面）**。规则同时封住“揭示即本人推理”的越界，并补足当前轮关系的回答要求。 |
| I2 相等仍叙成差异 | engagement-and-narrative.md:57 要求结果文案由当前计算结果和阶段决定，比较反馈覆盖小于、等于、大于；相等时解释相等原因，不能只按预测正误套固定结语。 | expert-review.md:32 固定验收改变参数使比较量相等；原复查要求所需的 n=2/centre 与 n=1/equal 对照由 engagement-and-narrative.md:57 的关系规则及 :87 的参数变更验收承接。 | **已解决（技能层面）**。配方要求先从与图表相同的当前计算得到关系，再组合预测身份；相等路径有明确文案约束和触发。 |
| M1 “首次/尚未”时态与参考接触不一致 | engagement-and-narrative.md:57 将未揭示、已揭示、已接触参考分开，并要求“首次/再次”必须有动作记录。interactive-html.md:193-218 规定恢复时合并运行时 exposure.reference、当前参考面板与本地状态，并在新预测冻结时保存辅助快照；:220-222 增补已揭示结果的题目/条件身份、同条件再判断及导入/刷新合并契约。 | expert-review.md:30-33 覆盖先看全解后直接观察、揭示阶段、旧记录导入后提交新预测，以及直接观察后同条件新一轮必须标明已见结果；engagement-and-narrative.md:87 要求核查实际句子、辅助标识与记录。 | **已解决（技能层面）**。既有参考和已揭示结果接触不会由导入旧组件状态或刷新抹掉，且时态用阶段与接触状态触发。 |

## Critical

无未解决 Critical。I1、I2 原为 Important；M1 原为 Minor。本次只检查对应修订是否把失败实例转成可执行生成规则和验收触发，没有把“无 Critical”解释为后续成品通过。

## Important

无未解决 Important。

- I1 已从一般性“如实收束”具体化为证据边界表、字段/触发对应和当前轮结果呼应配方。
- I2 已从固定文案问题具体化为关系驱动（小于/等于/大于）并与预测身份组合的文案规则，同时指定相等参数验收。

## Minor

M1 已修订并有明确裁定：阶段、参考接触、预测提交前接触、提交后接触和同条件已揭示结果被拆开处理；复查触发覆盖先看参考、揭示阶段、直接观察后再判断及导入/刷新时序。没有新增本范围内的 Minor。

## 复审结论与边界

**批准修订后的技能进入“从空白重新生成”阶段。** 该裁定只覆盖上述技能文本及其生成/验收契约；后续必须按这些触发实际生成课程并重新检查 I1、I2、M1，不能把本报告当作 run-02 HTML 或任何后续课程成品通过。

## 文件身份与 SHA-256

本次改动文件（按工作区实际路径）：

| 文件 | SHA-256 |
| --- | --- |
| repo/plugins/dialogue-tutor/skills/dialogue-tutor/SKILL.md | 61af8371b3cf41be3ca9cbf179a045b3a56de9ab24328d4f9721d73a3fbc0052 |
| repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/engagement-and-narrative.md | 38b27dfb2994df6534d970acbc9ab25edcbbac2c86b693576e2a7ac7eadd8ce1 |
| repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/expert-review.md | 66779f7c7d1a0b5edb391b39d93d707e46cec0eefbec78d89952a9d14c2d483f |
| repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/interactive-html.md | 3121adeef97f11b85eeddff53eb8c44f65ec7d3696e37fe07cc305b4bee34785 |
| repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/visual-design.md | ff6c2cdc10e6e09d3e45bc3bd1d2b65cfd43024ae0dfd7445e7e9df108d34652 |

复审输入身份：reviews/run-02-skill-patch.diff SHA-256 83741ba91d80ebd6178327a8fff106dadb8f1f7c16d4b582fdc8f85e6ce944a0；原成品评审 reviews/narrative-html-run-01.md SHA-256 2a5448ba5227e3da67ce3542d6ee8a656d45eb8725129cd980e83994c43e07c1。

