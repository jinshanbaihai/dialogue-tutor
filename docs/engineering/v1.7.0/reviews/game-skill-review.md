# 游戏策划专家评审：DialogueTutor 1.7.0 候选技能

评审日期：2026-09-07。评审范围：技能生成规则，以及解释这些规则能否落地所必需的组装器与运行组件控制流。尚未取得从空白生成的新 CH6 HTML，因此下文严格区分已读到的实现现象与明确待测情形。

**当前裁定：退回修订生成指令。** 无 Critical；三项 Important 尚待关闭。底层方向已经正确，剩余问题是如何稳定生成愿意继续玩的学习任务。这里的吸引力指学习者愿意主动预测、试验、修正、再试新题；本评审不宣称真实学习者已经持续参与，也不把点击数、耗时或模型评委意见当成学习效果。

下文 GitHub URL 使用候选分支 `feat/1.7.0-interaction-first`。这些是发布后可直接阅读的位置；本轮审阅的是尚在工作的本地候选，链接是否已经可访问未作验证。主作者发布后应把链接固定到实际提交。行号对应本轮读取，另附文件哈希以识别版本。

## Strengths：值得保留的设计

1. [入口的目标与优先级](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/SKILL.md#L8-L12)把理解、独立应用与延迟保持放在操作数量之前。这为“学习动作本身有趣”提供了正确约束，不需要另外覆盖一套积分玩法。
2. [任务流程](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/SKILL.md#L31-L37)保留挑战、可见结果、解释和新题，同时允许看例题、全解、跳过和返回。学习者可以调整挑战，不需要用重复失败换取帮助。
3. [渐隐路径的实际配方](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/references/teaching-design.md#L36-L50)已经把“看懂一题”和“自己完成另一题”分开。这可以成为胜任感的实质来源：下一次承担更多数学判断，而非领取更多奖励。
4. [表现分支](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/references/interactive-html.md#L82-L98)采用具名后续活动，导航可自由选择，探索和自评不冒充独立客观正确。其基础已足够承载修复、巩固和挑战选择。
5. [模式和完整解释](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/references/modes-and-explanations.md#L24-L30)把当前任务和完整解释分开，而保留答案依据；这使主动发现可以先发生，回查依然方便。
6. [专家循环](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/references/expert-review.md#L18-L29)要求产物退回先修技能、再重新生成，适合检查吸引力是否来自可复用规则，而非一个手工精修样例。

## Critical

本轮没有 Critical。无需推翻现有教学目标、证据模型和单文件组件架构。

## Important

### G1：预测配方可能先公布答案，且“可见结果”没有要求回应学习者的判断

**位置与已观察现象。** [interactive-html.md 的预测配方](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/references/interactive-html.md#L96-L98)允许“先出现的预测 quiz……再由具名操作揭示结果”。但是 [quiz 提交控制流](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/assets/interactive/lesson-runtime.js#L261-L271)把 `answerRevealed` 置为真；[quizReference](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/assets/interactive/lesson-runtime.js#L646-L670)在 studio 中展开参考。依照当前文字使用普通预测测验，提交后即可在探索之前看到理论答案。这是从实际控制流确定的配方冲突，尚未在新课程中运行复现。

**影响与待测情形。** 例如先问“平均数 1 和 3 是否等可能”，提交后直接给出“不等可能”，随后再播放抽样动画；学习者的操作不再解决开头的不确定性。另一个当前规则仍可能放行的情形是：滑杆使图形改变，但旧预测不可同屏比较，反馈也没有指出这次操作说明了什么。

**建议写入技能的生成配方。**

> 每个核心探索任务组先写出一个可以被本次操作回答的问题，以及学习者哪项选择将改变哪个数学对象。需要保留预测后的发现过程时，在同一个 `interactive` 内完成“提交预测并冻结→运行或改变条件→显出结果→并置原预测与结果→指出值得解释的差异”。普通 quiz 提交会给出答案，不作为延后揭示的预测容器。预测是个人判断与参与记录，独立应用另用不同题的 quiz 收集。

> 未知前提可先进入短示例；不凭空让学习者猜术语。图形的变化必须回应刚才的问题。仅把标题写成悬念、随后展示无关动画，不构成这个循环。

建议放入 `teaching-design.md` 的任务配方，并同步替换 `interactive-html.md` 的预测句。无需改变普通测验的即时纠正反馈。

**最小运行契约。** 现有 `interactive`、`dt:activity-mounted`、`dt:restore`、`dt:exploration` 足够。作者状态可使用 `{phase, prediction, predictionAt, history, parameters}`；重新预测追加历史，不能覆盖原预测；参数恢复与图形恢复共用更新函数。预测不写入客观正确计数。图示首次揭示及后续比较由作者组件实现。

**实际验收。** 从空记录进入：看不到待预测的分布或答案；提交后原预测固定；首次样本怎样变成一个统计量点可追踪；批量操作后可以对照原预测；参数改变、刷新与导入仍保留预测身份；随后的独立题没有复用这一次答案。预测错了也能完成解释和继续路径。

### G2：挑战节奏和胜任反馈仍是原则，缺少可执行的内容配方

**位置。** [SKILL.md 的五段流程](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/SKILL.md#L31-L37)、[teaching-design.md 的支架与独立活动](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/references/teaching-design.md#L25-L34)已经规定教学环节；[pathways](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/references/interactive-html.md#L90-L94)要求不同结果继续到具名任务。当前规定尚不能区分“换了一道题”与“下一轮承担了新的判断”。

**明确待测情形。** 生成者完全遵守“挑战—反馈—下一题”，却连续安排同样的四选一；正确时只有“独立核对通过”，辅助正确主要显示辅助记录说明，错误后统一打开长解析。即使所有跳转目标 ID 不同，学习者仍只经历重复判题。这里未声称尚不存在的新课程已经出现此问题。

**建议写入技能的生成配方。**

> 核心任务组的蓝图同时写“开头要解开的疑问、关键选择与数学后果、本轮能看见的变化、下一轮新增的判断、可以收束的条件”。这些是作者说明，不额外变成学习者要填的表。节奏根据能力要求推进：辨认关系、借助示例完成一处关键判断、独立组织方法，再选择是否改变一个条件。任务长短和切换位置由数学断点决定，不规定按钮数、分钟数或固定关卡数。

> 给选择时，标签说清后果，例如“先看一个样本怎样形成一个均值点”“不看九格表，自己合并概率”“改变放回条件，再预测”。选择改变帮助程度、数学条件或下一项问题；只改变颜色、故事名字或按钮文字不算有意义后果。

> 反馈先回应本次具体判断与结果，再给可达的修复或新挑战。数值核对只能肯定数值一致；选项同时包含理由时可肯定该理由；开放解释只据自评要点陈述。辅助后答对也回应刚完成的数学工作，证据来源保留准确标签。错误后的修复要让学习者修正一处可见关系，修复之后再去另一题；不能仅让学习者重读全文、重输已经公开的答案。

**可以落地的反馈例子。** 在“每种均值是否等可能”题中，错误反馈可以写：“你把五个均值各算了一次。请在九个等可能的有序样本中找出哪些落在均值 3：同一个均值可能接住几个样本？”对应补救活动实际显示九格表并允许分组。正确选项如果已包含理由，反馈可写：“你把同一均值对应的样本概率加在一起了。现在把总体换掉，试试不用现成表。”辅助正确可写：“借助九格表，这次概率已经核对一致。下一题给另一组总体，你来决定怎样分组。”

**最小运行契约。** 优先使用现有 `choices[].feedback`、`hint`、`remediation`、`followups`、`pathways` 和真实 quiz。没有必要新增积分、等级或通用游戏引擎。numeric 的共同解析只陈述可核对的数学关系，不冒认学习者采用了某条推导。若一个错误出口含多种误解，补救活动需提供相应可见修复，或先作一次能区分误解的小判断；不需要为了分支而引入模糊自动理解。

**实际验收。** 评委分别走首次错误→修复→不同题，提示→辅助正确→不同题，独立正确→可选条件变化，以及跳过→可达铺垫。每条路径都能回答“我的上一项选择具体改变了什么”“这次反馈对应哪条数学关系”“下一题比上一题新增/减少什么判断”。主路径不能只是在不同标题下重复同一种作答动作；如果内容确实需要重复同构练习，蓝图说明用途，并提供明确停点。

### G3：复习日程已存在，但结尾和再次进入还缺少内容上的理由

**位置与已观察现象。** [teaching-design.md](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/references/teaching-design.md#L16-L16)要求“当前变化、具名后续行动及清晰收束”；[回顾条款](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/references/teaching-design.md#L32-L32)要求证据与回顾入口。当前 [renderStudio](https://github.com/jinshanbaihai/dialogue-tutor/blob/feat/1.7.0-interaction-first/plugins/dialogue-tutor/skills/dialogue-tutor/assets/interactive/lesson-runtime.js#L1093-L1109)显示活动统计、到期入口和“已到最后一项”。它提供了导航，但没有替作者完成内容收束。运行组件正在实现，不能据此宣布最终产物不合格；技能仍应给出生成者可直接照做的结尾配方。

**明确待测情形。** 完成最后一道独立题后只剩禁用的下一项、数量统计和日期；学习者无法知道本次留下哪项可用能力、下一次具体从哪里开始。或者无论是否作答，一进入最后场景就显示“恭喜全部掌握”。另一种失败是返回时先展示旧答案总结，然后又把同题正确当成无辅助回顾。

**建议写入技能的生成配方。**

> 完整课程用具名收束活动结束。先根据真实记录显示本次实际做过或核对过的具体任务，再指出仍可独立验证的一项能力。给一个现在可选的后续挑战，以及一个返回时先回答的具名回顾问题。学习者可以在这里暂停，暂停保留当前位置与记录。未作答或跳过时使用对应事实，不显示完成或掌握宣告。默认收束不提前展开回顾题答案。

> 回访入口说明要重新解决的问题，例如“先不看九格表：怎样给相同均值合并概率？”；进入时先显示提取任务，完整解释仍可主动查阅。到期列表提供日期与入口，不能靠“有几题欠着”代替内容动机。同题回顾与实际新条件挑战分别标明。

**最小实现选择。** 推荐作者侧最后一个 `interactive`，暂不增加 `lesson.closure`。现有 `DialogueTutor.instance.getState()` 和 `navigate(id)` 足以按实际记录列出具名活动与继续入口；在挂载、恢复及导航到收束活动时更新。收束只读证据，不自己写评分或推进复习。用既有复习状态显示日期，复访仍走能收起旧输入/答案的真实复习流程。初次来到结尾、未做题直接导航到结尾、保存后返回，分别显示符合记录的内容。若运行时尚不能让自定义入口正确启动回顾，应补一个调用既有复习导航的最小接口，并同步文档，不能把 `navigate(id)` 普通浏览冒称回顾重启。

**实际验收。** 核查三种结尾：核心题独立核对、只有辅助/自评、直接跳到结尾。摘要均对应真实记录；每个下一步都指向存在的任务；结束时可以停下。再用实际到期时间的受控状态打开同一文件：先出现回顾问题，旧答案与已完成输入保持收起，提示接触仍被保留；没有到期项目时也能继续上次未完成的具名活动。模拟时间只验证程序行为，不宣称真实延迟保持。

## Minor

没有独立的 Minor。反馈措辞、任务命名和动画节奏在真实 CH6 产物中核查；不在未见产物时增加装饰性要求。

## 可加入技能的 CH6 核心循环例子

以下是自拟的有限总体活动配方，不代替整章目标覆盖，也不是已经验证的学习效果。

| 阶段 | 学习者问题与动作 | 可见后果与吸引力 | 学习证据 |
| --- | --- | --- | --- |
| 可回答的疑问 | 总体为 `{1,3,5}`，每次等概率、独立、有放回抽两次；预测平均数 1 与 3 是否等可能 | 问题只需理解两数平均，暂不展示抽样分布 | 冻结的个人预测，尚不评分 |
| 看清一次生成 | 随机抽取一次有序样本，计算其平均数，再看它落入哪一列；手选样本则另标枚举/演示 | 抽到的两个值变成一个统计量点；“这张图上的点到底代表什么”得到直接回答 | 探索记录；手选结果不计随机频率，需要评分的计算另设 quiz |
| 主动发现 | 查看九个等可能的有序样本，把同均值样本合并；可选逐个看或批量显示 | 均值 1 接住一个样本，均值 3 接住三个，原预测与 1/9、3/9 同屏比较 | 分组或解释的原答；模拟频率不替代理论概率 |
| 借助关系完成 | 不同题给部分样本表，让学习者补一项概率及依据 | 刚发现的“合并概率”真的能用来完成一个缺口 | 真实提交，提示后保持辅助来源 |
| 独立兑现 | 再换一组总体，自行组织样本与统计量分布 | 学习者自己完成此前图示帮助完成的工作 | 不同题的客观核对及/或开放解释自评 |
| 条件改变或收束 | 可选“改为不放回会怎样”或“先在这里结束，下次从合并概率回顾” | 选择会改变基本结果、概率关系或本次停点；每次只改变明确条件 | 新增条件判断与同题延迟回顾分别记录 |

样本量 `n`、重复模拟次数、有无放回必须各自标清；“批量显示更多重复样本”不能被讲成增大单次样本量。随机结果本身不发奖励，观察到的极端样本也不能替代理论证明。动画可跳过，跳过之后保持同一数学状态。

## 与教育评委的共同检查

教育评委已明确同意上述核心循环和未评分预测容器配方，并核对 `{1,3,5}` 示例的 1/9 与 3/9。其补充已纳入：手选样本必须标为枚举/演示，不能计作随机频率；一次统计量落点帮助理解来源，概率结论仍由九个有序样本的合并给出。共同守住：先备可用、关键判断真实提交、原预测不可回写、一次样本对应一个统计量点、例题/补全/独立题身份分开、反馈修复可达、导航与查全解自由。不会借剧情改变抽样协议，也不会以长时间停留、连胜或随机奖励替代能力证据。

## 后续复审所需材料与通过条件

先提供实际修后的技能全包及三个 Important 的对应段落；只有文字原则，没有实际生成契约，不能关闭。技能通过后，从空白生成 CH6，再提供课程 JSON/蓝图、HTML、实际交互记录。产物复审重点走 G1 的发现循环、G2 的四条路径和 G3 的三种结尾及回访。产物若退回，先把具体失败转成技能修订，再重新生成；本轮没有授权直接补丁成品来替代技能修订。

## 读取时版本标识

仓库基线 HEAD：`e6c02d94d1bf1958702cead5c61dcc166f5415e2`。下表为读取附近取得的候选文件 SHA-256；运行组件仍在并行开发，本文只对列明控制流作观察，不声明完整运行库已审完。

| 文件 | SHA-256 |
| --- | --- |
| SKILL.md | `fa06d0bc17827791f0f2cd45f8caf5c3a48ec0dbb202f7ca89e01f515d04d2e8` |
| references/teaching-design.md | `27db1805d86d7717c8475130cbecb0bee86452ac849bd460f58208f1be3af83e` |
| references/interactive-html.md | `468ed0fc441cf850081e81b91894c7d01bc4532e0631175aa268f244d4475335` |
| references/expert-review.md | `becee310a71dcb1ed5c23cef9ee20e2e5b26e09e17fbc2d66064cb05f08425eb` |
| references/modes-and-explanations.md | `d8251c0f0357798bbc338130bc544ebfcd10b8bb2e10a79e04150f184c5e8f64` |
| assets/interactive/lesson-runtime.js | `ea8522488dcbb1c4ab042e85913d27903b55083bf780b76f4788b7fba34d3c96` |
| scripts/build_lesson.py | `f4ca15fe421c83dec61560ac04f9de689b6964c4548f747c6a40ce0c01ee344c` |
