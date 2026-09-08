# 交互 HTML：活动编排、数据与生成

生成或更新 HTML 时读取本文件。只进行短回合追问时，继续使用 SKILL.md 的“教学对话”。
本文件维护活动 schema 与操作流程；DeepTutor 的逐项出处见 `deeptutor-provenance.md`，
提取、反馈、间隔与伴读的研究范围见 `learning-evidence.md`。

## 先按内容安排学习动作

旧样章有完整题目与推导，却没有接收作答的组件；给长文末尾补几个按钮也不能覆盖正文中的学习机会。
先列活动蓝图，再制作课程数据。蓝图每行填写：**内容位置、目标、类型、DeepTutor 来源、
放置理由、反馈、保存记录**。这些是作者的编排说明，不需要原样显示在学习者页面。

既有五类交互借鉴 HKUDS/DeepTutor，新增任务编排与表现分支标为 DialogueTutor 原创组合。DeepTutor 源代码快照为
`42fab3cf429a1fbf36b257ab8d116a3814964202`；科学文献用于限定采用方式。

| 内容与学习动作 | 选择的活动 | DeepTutor 实现来源 | 本课程记录 |
| --- | --- | --- | --- |
| 定义、符号、适用条件已经讲清，需要尝试回忆 | `flashcards`，正面提取，按需提示，翻面核对 | `deeptutor/book/blocks/flash_cards.py`；`web/app/(workspace)/books/components/blocks/FlashCardsBlock.tsx` | 每张卡的位置、揭示、提示与自评；自评不算客观正确 |
| 概念容易混淆，需要选择并解释区别 | `quiz` / `choice`，先选择再提交，反馈对应具体误解 | `web/app/(workspace)/books/components/blocks/QuizBlock.tsx`；`web/components/quiz/QuizViewer.tsx` | 原选项、对错、提示与揭示、尝试 |
| 计算结果有明确数值标准 | `quiz` / `numeric`，提交后核对数值和适用条件 | 同上；`deeptutor/learning/grading.py` 提供题型分流的来源 | 数值判定；不把结果正确等同于推导正确 |
| 推导、原因或论证允许不同表述 | `quiz` / `open`，保存原答，揭示参考与评价要点，再自评 | Books QuizBlock 的主观题自评；共享 QuizViewer 的作答与解析组织 | 本人原答与自评分开；不做全文相等或关键词掌握判定 |
| 参数变化决定图形与结论 | `explore` 或 `interactive`，操纵参数后观察图、公式与数值联动 | `deeptutor/book/blocks/interactive.py`；`deeptutor/agents/visualize/` | 参数与探索参与，独立题卡另收集正确性证据 |
| 推导依赖明确先后顺序 | `steps`，每步保留数学依据，可前进、回退与重置 | `deeptutor/agents/visualize/agents/code_generator_agent.py` 及 HTML 生成规则 | 当前步骤与探索记录，不产生正确分数 |
| 需要围绕当前问题继续解释 | 活动的 `followups`，以及复制上下文继续对话 | Books `BookChatPanel.tsx`、共享 QuizViewer 逐题追问、`deeptutor/services/session/_turn_runtime_shared.py` | 预备解释与对话交接；没有伪装的在线 AI 输入框 |
| 需要标注、再次定位与查看学习经历 | 共同运行组件的笔记、书签、目标和活动记录 | `deeptutor/book/progress.py`、Books 笔记组件、`web/components/space/learning/` | 内容位置、笔记、书签、客观与自评证据分别保存 |
| 学习后需要再次提取 | 共同运行组件的到期列表 | `deeptutor/learning/scheduler.py`、`policy.py` 与 `ReviewTrail.tsx` | 公开间隔规则与到期时间；该连接是本项目将 Books 与 Mastery 思路组合的实现 |

Books 的原始闪卡没有自带间隔复习；原版的 Books、共享 QuizViewer、Reading Quiz 与 Mastery
也没有同一套评分状态。本包明确连接活动记录与复习，不把组合结果宣称为 DeepTutor 原有功能。

### 模式决定范围，活动服务当前内容

- `bgct`：覆盖材料需要的原理、完整例题和全部所给小问；按任务组织，完整解释按需查阅。
- `bbct`：按板书顺序与考纲边界安排活动，板书未覆盖的作业仍按原规则补齐。
- `olct` / `onct`：保留公式定义前置块和完整做题；活动不借机引入背景章节或考纲外内容。
- 一个短问题选择足以检查该目标的活动；完整章节覆盖实际存在的不同学习环节。
  不固定每章闪卡数量，不给每段重复配置同一种题卡。复习、笔记与书签由共同组件提供。
- 所有原题小问与六项讲解仍然保留。作答入口位于该小问附近；完整解法进入对应参考区域，
  提交后或学习者主动揭示时查看。公式首次学习提供必要前提、操作或示例；完整推导保持可查。

## 制作课程 JSON

顶层结构为：

| 字段 | 内容 |
| --- | --- |
| `schemaVersion` | 固定数字 `1` |
| `lessonId` | 稳定课程 ID，例如 `probability-s2-ch1` |
| `revision` | 非空版本字符串。题目、答案或目标含义变化时更新，避免误用旧学习记录 |
| `presentation` | 新课程使用 `"studio"`；省略时保留 1.6.0 连续正文布局 |
| `pathways` | 可选表现分支数组，见下方“任务舞台与表现分支” |
| `title`、`language`、`mode` | 课程标题；语言默认为 `zh-CN`；模式为 `bgct`、`bbct`、`olct` 或 `onct` |
| `objectives` | 非空数组，元素为 `{id,title,kind}`；`kind` 为 `memory`、`concept`、`procedure`、`design` |
| `activities` | 非空活动数组，见下节 |
| `sections` | 新页面的任务结构：`{id,title,bodyHtml,activityIds,lead?,explanationTitle?}`；已有 HTML 使用 `--base-html` |
| `solutionWraps` | 可选；已有 HTML 中需要折叠的完整解答区域，见“沿用已有正文” |
| `tts` | `plustts` 的分段数据，见“伴读” |

课程、目标、活动和段落 ID 使用英文字母开头的稳定名称，例如 `q2-normalization`。
避开 `constructor`、`prototype` 等运行时保留名；正文 ID 不得与 `dt-lesson`、`dt-runtime`、
`dt-runtime-style` 或自动生成的 `dt-activity-活动ID` 冲突，页面 ID 不能重复。
不要把屏幕上的第几行当作唯一身份；旧样章的文字行号发生过漂移，稳定锚点能保持反馈与内容对应。

每个活动包含 `{id,objectiveId,type,title,prompt,source}`，再加相应 payload。
`objectiveId` 引用已有目标；每个活动只挂载一次。
`source` 可以是 `{repository:"DialogueTutor",path:"references/teaching-design.md",case:"任务编排"}` 来标记本项目设计；既有组件使用 DeepTutor 仓库内的 `deeptutor/...` 或 `web/...` 路径，也可以使用：

```json
{
  "repository": "HKUDS/DeepTutor",
  "path": "web/app/(workspace)/books/components/blocks/QuizBlock.tsx",
  "commit": "42fab3cf429a1fbf36b257ab8d116a3814964202",
  "case": "Books 正文 Quick Check"
}
```

`prompt`、卡片正反面、选项和普通标签是纯文本，使用清楚的文字与简短 Unicode 记号。
复杂公式与推导放入 `bodyHtml` 或步骤的 `bodyHtml`，新页面优先用原生 MathML，图形用内联 SVG。
默认组装器没有从网络加载数学排版库；仅写入 LaTeX 不会自动变成公式。
已有 HTML 保留原本的 MathJax 或 KaTeX 时，按原有依赖实际检查显示结果。

### 任务舞台与表现分支

`presentation: "studio"` 只用于通过 `sections` 新建页面，不与 `--base-html` 同用。
省略 presentation 或显式采用 `"document"` 时使用旧连续正文。studio 的每个目标至少关联一项活动；
教学蓝图另外核查活动是否提供该目标真正需要的解释或应用证据。

`presentation: "studio"` 时，场景一次显示一个主要活动，学习者可用任务导航与前后按钮自由浏览。
`section.lead` 承载简短场景与必要目标，`bodyHtml` 承载完整讲解，组装器将后者放入
`id="dt-explanation-场景ID"` 的关闭 `details`；`explanationTitle` 设置具名查阅标题。
活动可把 `solutionId` 指向该 ID；多个题可关联同一全解。打开含答案的说明后，关联题保留辅助接触。
闪卡活动的 `solutionId` 对整组卡片生效；只有部分卡片被该全解覆盖时拆成对应活动组。翻面前的辅助状态冻结为本次回忆依据，翻面后查看参考不倒改已经完成的回忆，但影响后续回忆和该组其他卡片。复习入口收起关联全解。
场景的完整解说不要内嵌活动挂载标记；操作图示使用活动的 `bodyHtml`，避免被收入全解。

每条 `pathways` 为 `{from,on,to,label}`，`from/to` 引用活动 ID，`label` 指明具体下一任务。
`on` 采用 `incorrect`、`assisted`、`correct` 或 `skipped`。独立客观正确才触发 `correct`；
`assisted` 表示已使用提示或参考，可在提交前出现，并不保证答对；`incorrect` 包含客观错误、开放题自评尚未达到要点和闪卡自评仍需回忆；跳过触发 `skipped`。
分支只是下一步建议，标签写具体支持任务，不凭结果码声称“辅助答对”或诊断错误成因。
开放题自评、翻卡和探索参与不触发客观正确。推荐不会封锁自由导航；补救目标确实存在，不能填空链接。
新课程覆盖实际存在的错误、辅助与正确路径，避免把四种结果全部指向同一题。

公共接口 `DialogueTutor.pathwayOutcome(activity,saved)` 返回可用结果条件；
`DialogueTutor.getRecommendations(lesson,state,activityId)` 返回推荐数组。
已挂载实例的 `navigate(activityId)` 导航至实际活动，`getRecommendations(activityId)` 返回数组，元素为
`{from,on,to,label,targetTitle}`。导航事件为 `dt:navigate`，detail 含 `activityId`、`sectionId`。
这些接口用于课程内具名选择；不能改变学习记录来伪造成功。

复习入口先用 `DialogueTutor.getReviews(lesson,state,Date.now())` 取真实记录，再调用
`instance.navigate(item.activityId,item)`。第二参数会复用现有重试流程：收起旧题答案与输入，保留历史；
有未完成草稿或待自评回答时保留工作，继续当前作答；作者入口应相应命名。普通单参数导航不会重置答案，不能称作新的提取。
完整收束与复访配方见 [engagement-and-narrative.md](engagement-and-narrative.md)。

提交即验证的题目使用普通 quiz，提交后图示用于解释已知结果。探索承担验证时，
使用自定义 interactive 先保存并冻结未评分预测，再由具名操作揭示；不使用会立即公布答案的普通 quiz。
阶段、原输入、时间、历史和参数由自定义状态保存，后续参数变化不能覆盖旧预测。自定义控件需要同时处理初始化、
`dt:restore` 以及 `dt:exploration`，恢复流程见下方。复杂自定义练习的客观评分不能冒用探索事件。

### 五种活动 payload

**`flashcards`**

`cards` 为非空数组，每项 `{front,back,hint?}`。每张卡集中提取一个定义、区别或条件。
卡片背面给完整核对内容；提示作为可选择的辅助。翻面之后才出现自评；换卡有前后导航。
正向自评指翻面之前已经实际回忆出的内容；翻面后的熟悉感不作为成功回忆。

**`quiz`**

共同字段：`format`、`explanation`，可选 `hint`、`followups`、`remediation`、`solutionId`。
`followups` 为 `[{question,answer}]`，内容是提前准备的解释分支。

| `format` | 必填内容 | 反馈与证据 |
| --- | --- | --- |
| `choice` | 至少两个 `choices:[{id,text,feedback?}]`，唯一正确的 `answer` 为选项 ID | 选择不立即揭示；明确提交后给对错与解析。干扰项对应实际误解，不用措辞陷阱 |
| `numeric` | `answer` 为有限数字或简单分数；可选非负 `tolerance`，默认绝对误差 `1e-8` | 支持小数与 `3/8` 形式的输入。题面交代单位与精度，输入不要求附单位，不接受任意代码 |
| `open` | `modelAnswer` 与非空 `rubric:[string]` | 保存本人原答，提交或主动揭示后显示参考及自评要点；自评明确标注，不冒称语义自动评分 |

每次提交只形成一次尝试，修改答案先进入重试；跳过单独记录。
在首次提交前查看提示或完整答案会留下辅助标记。
当前会话看过该题提示或参考后，重试继续保留辅助来源；正常提交后的反馈不倒改那一次原答。
答案已经由题面给出的 `show that` 题目，重点检查过程，使用开放题与评价要点。

**`steps`**

`steps` 至少两项，每项 `{title,bodyHtml}`。每步保留依据，学习者可以前进、回退、重置。
步进只控制显示的节奏，不压缩原有完整推导；“下一步”不产生答对证据。
需要步骤补全时，另设真实接收提交的 quiz/choice、quiz/numeric 或 quiz/open，不能把 steps 重命名成补全。

**`explore`**

`model` 目前有两种专用概率模型，`instructions` 说明观察任务，可附 `followups`：

- `linear-density`：函数固定为 `f(x)=2−2x`、支持区间为 `[0,1]`；改变事件端点，联动面积与 CDF 差值。
- `uniform`：调整均匀分布支持区间和事件区间，联动密度高度、期望与区间概率。

事件面积同时使用填色和不透明边界；原始事件端点 `a,b` 与支持区间裁剪后的交集端点使用不同形状并配文字。
密度图的交集面积对应原始端点的 `F(b)−F(a)`，不把裁剪端点冒名为原始端点。

这两种模型只在课程确实讨论相应对象时使用。其他学科和函数用下面的 `interactive`，
不要把默认概率滑杆套进不相干的课程。

**`interactive`**

`bodyHtml` 提供自定义组件的标记，可选 `script` 提供作者生成的 JavaScript。
沿用 DeepTutor Visualize 的原则：学习者进行具体操作，图形和数值随同一状态更新。
选择适合该内容的操作，如改变价格与数量观察图形，或切换一个推理条件观察结论；
每次都检验实际数值关系。提供具名控件、键盘操作、初始状态、重置与当前值显示。
脚本由组装器内联为脚本元素，运行时不从 JSON 动态求值。

组件把操作记录为探索：

```javascript
document.dispatchEvent(new CustomEvent('dt:exploration', {
  detail: {activityId: 'price-exploration', state: {price: 12}}
}));
```

自定义脚本以当前组件容器为范围，使用实际活动 ID，不自行写入正确性或掌握分数。
知识检查另用有明确题面与答案依据的题卡。额外库、图片或动画资源需要随文件交付或明确保留依赖，
不能把依赖外部服务的内容称作离线可用。

组件内容由运行时挂载，脚本执行时不能假定内容节点已经存在。脚本在 `document` 上监听以下事件，
只处理 `detail.activityId` 与自身相同的通知：

| 事件 | 使用方式 |
| --- | --- |
| `dt:activity-mounted` | `detail` 为 `{activityId,state}`，其中 `state` 只含该活动的 `exploration`。此时查找容器、绑定控件并恢复参数；空状态使用课程定义的初始值 |
| `dt:restore` | 每个已挂载的 interactive 分别收到 `{activityId,state}`，`state` 同样只含该活动的 `exploration`。更新现有控件、图形和数值，不重复绑定事件处理器 |
| `dt:exploration` | 学习者改变参数后，由组件向 `document` 派发 `{activityId,state}`；`state` 是可序列化的普通对象 |

恢复参数与计算图形共用同一条更新逻辑。恢复本身不制造新的参与动作；重置后同时更新控件、
图形、数值和保存状态。脚本使用独立作用域，避免多个自定义活动重复声明同名变量。

### 恢复合并的持久化接口

独立生成时发现：仅在 `dt:restore` 中合并闭包变量，紧接着导出或刷新会丢掉新增接触；改发 `dt:exploration` 又会把恢复计为新操作。因此恢复与真实操作使用不同写入方式。

`DialogueTutor.instance.restoreExploration(activityId, mergedState)` 接收已知 `interactive` 活动的完整探索状态，先校验 JSON 普通对象及100000字符上限，再同步深拷贝保存到该活动的 `exploration`。它不改作答、参考接触、复习、探索次数、参与标志、上次操作时间或当前位置，也不派发任何恢复／探索事件。顶层 `updatedAt` 可以作为保存元数据更新。未知活动、其他活动类型、循环引用、函数、undefined、非有限数或非法对象会在写入前抛错。

组件在 `dt:activity-mounted` 和 `dt:restore` 的同步处理过程中，先合并本页与导入的真实接触，再调用该接口，最后自行重绘。不要等下次真实操作才保存，也不要借 `importState()` 递归写回。运行库只负责保存快照，条件身份合并与原预测不可变性由组件明确实现；不得用该接口伪造历史或绕开真实操作计数。

```javascript
// local 已包含本组件的参数、原预测与合并后的真实接触。
const result = DialogueTutor.instance.restoreExploration(id, local);
// 然后用 local 重绘现有控件；不派发 dt:exploration。
```

返回 `{exploration, persisted}`，前者是已接受快照的副本。存储不可用时 `persisted` 为 false：完整快照仍在当前页面内存和公共导出中，运行库显示保存失败提示；此时不能承诺刷新恢复。真实学习者改变参数、提交预测、揭示或模拟仍通过 `dt:exploration` 记录动作。恢复后的立即导出、多组件依次合并及重新打开，都检查已合并记录仍在且没有新增参与。

### 自定义预测中的参考接触

首版探索只从 `dt:restore.detail.state` 恢复自己的 `referenceViewed`，导致“导出未看答案记录→查看全解→导入旧记录”抹掉辅助标识，尽管运行时仍保留该次参考接触。自定义字段不能覆盖运行时已经保留的事实。

恢复时区分三类数据：参数与历史由 `exploration` 恢复；运行时辅助接触从 `DialogueTutor.instance.getState().activities[id].exposure` 读取；已提交预测的辅助快照保持提交时的值。`exposure.reference` 表示曾有参考接触，不自行宣称新的预测属于客观独立作答。

对本页的新预测，冻结前同步检查关联全解当前是否展开，并合并运行时参考接触与组件已经观察到的接触。不能只等待异步 `toggle` 事件。可采用以下组件内函数；`id`、`solutionId`、`local` 使用本活动的实际变量：

```javascript
function hasReferenceContact() {
  const saved = DialogueTutor.instance.getState().activities[id];
  const panel = document.getElementById(solutionId);
  return Boolean(local.referenceViewed ||
    (saved.exposure && saved.exposure.reference) || (panel && panel.open));
}
function mergeReferenceAfterRestore() {
  // 先恢复参数与历史再调用；恢复不新增操作记录。
  local.referenceViewed = hasReferenceContact();
}
function freezeNewPredictionReference() {
  // 仅由新预测的提交动作调用，不能在恢复或普通渲染时调用。
  local.predictionHadReference = hasReferenceContact();
}
```

组件有多个含答案入口时逐个关联并检查。界面分别描述“提交预测前是否看过参考”和“目前是否已查看参考”，避免提交后查阅倒改原预测，也避免导入旧参数抹掉本页已经发生的接触。

实验结果本身也是接触来源。首版“直接观察→同条件新一轮”保存了历史，却没有在新判断中说明已见过相同结果。组件为已经揭示的结果保存题目与条件身份、揭示时间和来源；身份包括影响答案的总体、机制、参数及目标事件。恢复前保留本页已发生的结果接触，与导入记录合并，再判断新一轮的条件是否已见。参数、草稿可以回到旧状态，已经发生的接触不会随之撤销；刷新从已保存的接触记录恢复。该合并不新增模拟次数、作答或重新揭示事件。

提交新预测时同时核对相关全解接触和该结果身份；同条件再判断明确标为已见结果后的检查。改变条件后，只有先前参考实际覆盖新条件时才连带标记。上面的函数示例适用于 `solutionId` 全解覆盖当前题目的情况；全解只覆盖部分条件时，作者需给出覆盖判断或拆分活动。结果接触与全解接触可分别显示，不把它们冒称提示按钮使用，也不倒改旧预测时点的快照。

## 组装新页面

从技能目录执行；输入和输出也可使用绝对路径：

```bash
python3 scripts/build_lesson.py --lesson lesson.json --output lesson.html
```

新课程的 `sections` 按任务关系排列，使用 `presentation: "studio"`；每节活动由 `activityIds` 指定。
`lead` 只放必要场景，题目全文与条件进入活动 `prompt`，完整解释放入 `bodyHtml`。
场景全解由组装器自动生成关闭入口；`solutionId` 绑定其中确实给出答案的题目。
下面只演示一项任务的可运行结构，完整章节仍需目标蓝图及表现分支：

```json
{
  "schemaVersion": 1,
  "lessonId": "probability-density-check",
  "presentation": "studio",
  "revision": "1",
  "title": "密度与概率的区别",
  "language": "zh-CN",
  "mode": "olct",
  "objectives": [
    {"id": "density-meaning", "title": "区分密度高度与区间概率", "kind": "concept"}
  ],
  "sections": [
    {
      "id": "density-definition",
      "title": "辨认密度与概率",
      "lead": "模型在一个位置的密度为 1.5。请根据概率条件作出判断。",
      "explanationTitle": "查看密度条件与完整理由",
      "bodyHtml": "<p>概率密度的高度描述概率在附近的集中程度。某段区间的概率对应这段曲线下方的面积；单个位置的高度与整段面积是不同的量。</p>",
      "activityIds": ["density-quick-check"]
    }
  ],
  "activities": [
    {
      "id": "density-quick-check",
      "solutionId": "dt-explanation-density-definition",
      "objectiveId": "density-meaning",
      "type": "quiz",
      "format": "choice",
      "title": "核对一个区别",
      "prompt": "概率密度在某个位置大于一，是否足以判定这个分布不合法？",
      "source": "web/app/(workspace)/books/components/blocks/QuizBlock.tsx",
      "choices": [
        {"id": "height", "text": "足够，因为密度高度就是概率。", "feedback": "这个选项用单点高度判断合法性。先比较高度 2、宽度 0.5 的矩形：面积等于多少，再判断概率条件约束哪个量。"},
        {"id": "area", "text": "不足够，还需检查密度非负与总面积等于一。", "feedback": "密度的高度可以超过一，概率条件约束的是区间面积。"}
      ],
      "answer": "area",
      "explanation": "概率密度非负且全体支持区间的面积为一。仅凭某处高度超过一，不能判定分布不合法。"
    }
  ]
}
```

组装器将运行 CSS、JavaScript 和课程 JSON 内联，自动挂载学习记录面板。
交付实际生成的 HTML。课程 JSON 可以作为可维护源文件一并保留；只提供 JSON 不算 HTML 交付。

## 兼容旧连续正文

以下流程用于明确要求沿用 1.6.0 正文的任务。旧布局省略 `presentation`；`sections.bodyHtml`
按阅读顺序排布，也可预置 `<div data-dt-activity="活动ID"></div>`，剩余活动追加至节尾。
这些内嵌挂载方式不用于新 `studio` 场景，避免活动被折叠进完整解答。

## 沿用已有正文

```bash
python3 scripts/build_lesson.py --lesson lesson.json --output lesson.html --base-html existing.html
```

为每个活动填写 `placement:{selector,position}`，`position` 为 `before`、`after` 或 `append`。
优先使用唯一的 `#id`；也支持标签、类名、后代、直接子级 `>`、相邻元素 `+` 和 `:nth-of-type(n)`。
组装时每个选择器需要准确命中一个元素；遗漏或多重命中时修正锚点后重新生成。

某个小问的解法已在原 HTML 全部展开时，用 `solutionWraps` 保护首次作答顺序：

```json
{
  "solutionWraps": [
    {"id": "q1-solution", "startSelector": "#q1", "endSelector": "#q2"}
  ]
}
```

组装器保留 `#q1` 标题，把标题之后、下一边界之前的完整内容放入关闭的 `details`。
对应活动填写 `solutionId:"q1-solution"`，并放在 `#q1` 之后。
原题、条件、推导和得分位置仍需逐项核对；有助于首次作答的题面写入活动的 `prompt`，
不能只留在折叠的解答里。旧连续正文可以在 `bodyHtml` 里创建关闭的同名 `details`；studio 使用自动生成的场景全解入口。
主动展开完整解答会被记录为辅助，完整解答不在首次打开时自动出现。

从原正文与课程 JSON 重新组装，不在已经内联运行组件的旧生成结果上再注入一次。

## 学习记录与复习标签

共同组件以 `lessonId + revision` 隔离记录，保存目标、活动、草稿、尝试、提示与揭示、
本人原答、自评、探索状态、笔记、书签、当前位置和到期时间。旧版本记录不静默套用到新版本。
浏览器存储不可用时，当次活动继续运行，使用导出保留记录；导入只接收身份与版本匹配的数据。

展示四类事实：参与了哪些活动、哪些题独立作答通过、哪些内容已经自评、哪些项目到期。
开放题自评与翻卡自评始终保留来源标签；提示后答对不改名为独立答对。
阅读位置、滑杆移动、翻面次数和推导步进均不转换成掌握百分比。

复习采用本项目公开的工程规则：**1、3、7、14、30 天**。来源是 DeepTutor Mastery 的固定间隔思路，
这组数字没有声称是个人最优间隔或拟合出的遗忘曲线。到期后成功且未预先揭示答案的复习才延长间隔；
同次会话立即重试不推进间隔。错误、查看提示或预先揭示答案回到次日；查看和跳过不制造错误作答。
独立回顾还需距离最近提示或参考接触至少 24 小时；这也是公开的工程规则，刷新页面不会清除近期辅助。
翻卡与开放题的回顾仍然属于自评来源，不能在到期后改写为客观评分。
到期项目恢复时先呈现提取问题，收起上次答案与输入；历史尝试保留在记录中，避免先看答案再复习。
尚未提交的草稿和等待自评的已提交回答继续保留；后者核对的是提交时冻结的原答条件。
到期列表在页面打开时可供选择；本文件不创建通知、后台服务或跨设备账号。

## plustts：作答提示与参考讲解分轨

普通 TTS 会连续朗读空白之后的文字，所以“题目后留空白再写答案”不能保护首次作答。
使用以下结构，所有文本都按原页面的内容顺序和详细度撰写：

```json
{
  "tts": {
    "segments": [
      {"id": "tts-definition", "kind": "narration", "text": "这一节先区分概率密度的高度和区间概率。"},
      {"id": "tts-check", "kind": "activity", "activityId": "density-quick-check", "text": "请先判断：某个位置的密度大于一，是否足以判定分布不合法？"},
      {"id": "tts-check-feedback", "kind": "feedback", "activityId": "density-quick-check", "text": "核对参考：单独一个位置的密度高度不足以判定分布不合法，还需要检查密度非负与总面积等于一。"}
    ]
  }
}
```

`activity` 和 `feedback` 引用真实活动 ID；每个片段的 `id` 唯一。
`narration` 放当时已经可以阅读的讲解，`activity` 放题目和操作提示，`feedback` 放参考答案、
完整解法、翻卡背面与自评依据。原 HTML 里的解法同样进入对应反馈，不能又复制进首次作答轨。

存在 `tts` 时，脚本自动生成：

- `lesson-listening.txt`：讲解、活动提示与明确暂停提醒；不包含 `feedback`。
- `lesson-answers.txt`：按活动 ID 对应的完整参考讲解，供作答或主动揭示后播放。
- `lesson-tts.json`：保留全部片段与对应关系。

这套交付是文字伴读，不附带自动播放、自动暂停或网页语音同步。
学习者在活动处手动暂停，核对时打开参考轨对应片段。用户明确要求完整答案连续朗读时，
可以另交标明“参考答案伴读”的整轨；首次作答轨仍独立保留。

## 交付前的实际检查

先运行组装命令；缺少目标、重复 ID、错误题型、没有答案、丢失锚点等错误修正后重新组装。
再打开生成页面，操作本页真实采用的类型：

1. 翻卡的翻面、前后导航、提示与自评；题卡的错误和正确提交、开放原答、参考揭示、重试与跳过。
2. 图形参数改变后，图、公式和数字对应；步进前进、回退与重置；预备解释与上下文复制有实际结果。
3. 笔记和书签、刷新恢复、导出再导入；题目版本变化不继续显示旧版表现。
4. 已看答案后再提交保留辅助标记；重复提交不新增尝试；同次重试不提前推进复习。
5. 数学与 SVG 显示正确，手机窄屏与键盘可以操作，主要控件没有空操作。
6. `plustts` 逐项对照活动数据，题面、暂停提醒、完整解法分别进入正确轨道。

只把实际执行的检查写入交付记录。页面动作通过只能证明实现行为，学习收益另看独立作答、
新题与延迟表现；预先整理的解释和模拟审读不当作真实学习者数据。
