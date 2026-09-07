# 交互 HTML：活动编排、数据与生成

生成或更新 HTML 时读取本文件。只进行短回合追问时，继续使用 SKILL.md §1–§2。
本文件维护活动 schema 与操作流程；DeepTutor 的逐项出处见 `deeptutor-provenance.md`，
提取、反馈、间隔与伴读的研究范围见 `learning-evidence.md`。

## 先按内容安排学习动作

旧样章有完整题目与推导，却没有接收作答的组件；给长文末尾补几个按钮也不能覆盖正文中的学习机会。
先列活动蓝图，再制作课程数据。蓝图每行填写：**内容位置、目标、类型、DeepTutor 来源、
放置理由、反馈、保存记录**。这些是作者的编排说明，不需要原样显示在学习者页面。

所有新增交互的灵感来自 HKUDS/DeepTutor。源代码快照为
`42fab3cf429a1fbf36b257ab8d116a3814964202`；科学文献用于限定采用方式，不充当另一套功能来源。

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

- `bgct`：按对象保留七幕与完整例题、完整下半；在概念、图形、推导和原题附近安排活动。
- `bbct`：按板书顺序与考纲边界安排活动，板书未覆盖的作业仍按原规则补齐。
- `olct` / `onct`：保留公式定义前置块和完整做题；活动不借机引入背景章节或考纲外内容。
- 一个短问题选择足以检查该目标的活动；完整章节覆盖实际存在的不同学习环节。
  不固定每章闪卡数量，不给每段重复配置同一种题卡。复习、笔记与书签由共同组件提供。
- 所有原题小问与六项讲解仍然保留。作答入口位于该小问附近；完整解法进入对应参考区域，
  提交后或学习者主动揭示时查看。公式首次讲解仍按七幕逐步建立，不用题卡代替推导。

## 制作课程 JSON

顶层结构为：

| 字段 | 内容 |
| --- | --- |
| `schemaVersion` | 固定数字 `1` |
| `lessonId` | 稳定课程 ID，例如 `probability-s2-ch1` |
| `revision` | 非空版本字符串。题目、答案或目标含义变化时更新，避免误用旧学习记录 |
| `title`、`language`、`mode` | 课程标题；语言默认为 `zh-CN`；模式为 `bgct`、`bbct`、`olct` 或 `onct` |
| `objectives` | 非空数组，元素为 `{id,title,kind}`；`kind` 为 `memory`、`concept`、`procedure`、`design` |
| `activities` | 非空活动数组，见下节 |
| `sections` | 新页面的正文结构：`{id,title,bodyHtml,activityIds}`；已有 HTML 使用 `--base-html` |
| `solutionWraps` | 可选；已有 HTML 中需要折叠的完整解答区域，见“沿用已有正文” |
| `tts` | `plustts` 的分段数据，见“伴读” |

课程、目标、活动和段落 ID 使用英文字母开头的稳定名称，例如 `q2-normalization`。
避开 `constructor`、`prototype` 等运行时保留名；正文 ID 不得与 `dt-lesson`、`dt-runtime`、
`dt-runtime-style` 或自动生成的 `dt-activity-活动ID` 冲突，页面 ID 不能重复。
不要把屏幕上的第几行当作唯一身份；旧样章的文字行号发生过漂移，稳定锚点能保持反馈与内容对应。

每个活动包含 `{id,objectiveId,type,title,prompt,source}`，再加相应 payload。
`objectiveId` 引用已有目标；每个活动只挂载一次。
`source` 可以是 DeepTutor 仓库内的 `deeptutor/...` 或 `web/...` 路径，也可以使用：

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

**`explore`**

`model` 目前有两种专用概率模型，`instructions` 说明观察任务，可附 `followups`：

- `linear-density`：函数固定为 `f(x)=2−2x`、支持区间为 `[0,1]`；改变事件端点，联动面积与 CDF 差值。
- `uniform`：调整均匀分布支持区间和事件区间，联动密度高度、期望与区间概率。

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
| `dt:activity-mounted` | 内容节点已经建立；此时查找本活动容器，绑定控件，并用 `detail.state` 恢复上次参数。空状态使用课程定义的初始值 |
| `dt:restore` | 学习记录已经导入；使用 `detail.state` 更新现有控件、图形和数值，不重复绑定事件处理器 |
| `dt:exploration` | 学习者改变参数后，由组件向 `document` 派发 `{activityId,state}`；`state` 是可序列化的普通对象 |

恢复参数与计算图形共用同一条更新逻辑。恢复本身不制造新的参与动作；重置后同时更新控件、
图形、数值和保存状态。脚本使用独立作用域，避免多个自定义活动重复声明同名变量。

## 组装新页面

从技能目录执行；输入和输出也可使用绝对路径：

```bash
python3 scripts/build_lesson.py --lesson lesson.json --output lesson.html
```

`sections` 按阅读顺序放完整正文，每节的全部活动由 `activityIds` 指定。
可以在 `bodyHtml` 的准确位置预置 `<div data-dt-activity="活动ID"></div>`，
组装器只将尚未预置的活动追加到节尾，并检查每个 ID 恰好出现一次。
题目练习优先采用“完整题面 → 活动挂载点 → 关闭的完整解答”的顺序。
把正文划分为实际学习节点，避免整章只有一个 `bodyHtml` 且没有预置位置，导致所有活动挤在章末。
下面只演示可运行数据形状，实际课程的讲解详细度仍按对应模式写足：

```json
{
  "schemaVersion": 1,
  "lessonId": "probability-density-check",
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
      "title": "做题需要的定义",
      "bodyHtml": "<p>概率密度的高度描述概率在附近的集中程度。某段区间的概率对应这段曲线下方的面积；单个位置的高度与整段面积是不同的量。</p>",
      "activityIds": ["density-quick-check"]
    }
  ],
  "activities": [
    {
      "id": "density-quick-check",
      "objectiveId": "density-meaning",
      "type": "quiz",
      "format": "choice",
      "title": "核对一个区别",
      "prompt": "概率密度在某个位置大于一，是否足以判定这个分布不合法？",
      "source": "web/app/(workspace)/books/components/blocks/QuizBlock.tsx",
      "choices": [
        {"id": "height", "text": "足够，因为密度高度就是概率。", "feedback": "这个选项把某个位置的高度与区间面积混淆。"},
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
不能只留在折叠的解答里。新页面可在 `bodyHtml` 里直接创建关闭的同名 `details`。
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
