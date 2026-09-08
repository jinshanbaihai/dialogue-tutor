# DeepTutor 教学交互与数学可视化：实现溯源纠偏

审计版本：`42fab3cf429a1fbf36b257ab8d116a3814964202`，已用 `git rev-parse HEAD` 核对。仓库根：`/workspace/scratch/b4c4b2db70f4/research/DeepTutor`。下文路径均相对此根；行号对应此版本。

本分工实际精读 97 个文件，其中 92 个全文、5 个局部，去重覆盖 17,584 行；包含 AGENTS.md、README 全文、Book 规划/讲解/选择题/闪卡/交互/动画的实际入口、前端、相关双语 prompts、Manim 全生成渲染链与相关测试。逐文件连续范围、完整 SHA-256 见 `correction-deeptutor-reading-inventory.md`，机器可读版同名 `.json`，逐次读取记录为 `deeptutor-read-ledger.jsonl`。下载或枚举仓库不计为阅读。

本报告没有读取或修改目标技能，因此“上一版如何失真”只针对主任务转述的用户反馈，不冒充已逐行审过上一版。下面严格区分源项目已实现、prompt 期望、适合迁移的机制和需要新增的机制。

## 值得直接学习的优点

1. **讲解是主体，练习是穿插的独立块。** Book 真正生成路径是 SourceExplorer → SpineSynthesizer → SectionArchitect → 各 BlockGenerator。SectionGenerator 先列讲解结构，再写分段 Markdown；Quiz、FlashCards、Interactive、Animation 各有独立 payload 和 UI。不是把一串“请你解释”当作教学正文。默认 derivation 编排包括问题设置、动画推导、正式证明、代码验证、洞见、解释与测验（`book/agents/page_planner.py:96–117`）。这套默认编排是来源中可直接迁移的教学结构，不能因名称只摘“苏格拉底提问”。
2. **Book 已有免打字练习。** 选择题可以点选选项、Reveal、看正误和解释；非选择题可以在心里作答后 Reveal，再点 Got it right / Missed it。FlashCards 点击翻面并前后切换，完全不要求输入文字。用户批评“全改成需要打字的主观题”是有源码根据的迁移缺失。
3. **Manim 是实际生成与执行链。** 概念分析 → 分镜设计 → Python 代码 → `python -m manim` → 失败修复重渲染 → 返回真实视频或图片 → 展示摘要。不是返回代码围栏就称动画。代码生成 prompt 明确要求教学节奏、分步演变、暂停与结尾停留。
4. **状态与失败被做成了产品行为。** Book 块有 pending/generating/ready/error；失败可重试。Quiz 已有 attempt 保存、最新作答聚合与可选补充练习入口。MathAnimator 有渲染重试历史、产物路径、可选视觉复核结果。这些比仅规定回答语气更可操作。
5. **输入材料先影响知识结构。** SourceExplorer 多查询收集材料，SpineSynthesizer draft → critique → revise，且进行覆盖和拓扑整理。它适合借鉴为“先确认前置知识/教材证据，再组织讲解”；不能据此声称任何一次生成已读完全部教材。

## 能力—用户操作—源码—prompt—状态—测试映射

下表 `book/` 指 `deeptutor/book/`；`math/` 指 `deeptutor/agents/math_animator/`；`question/` 指 `deeptutor/agents/question/`；`BookUI/` 指 `web/app/(workspace)/books/components/blocks/`。表中的测试是已完整阅读的测试源码，**本轮未运行通过**，见验证说明。

| 能力 | 实际用户操作与讲解行为 | 实现与 prompt 证据 | 状态/判定的实际边界 | 对应测试与缺口 |
|---|---|---|---|---|
| 讲解组织 | 阅读章节正文、例子、推导、动画与穿插练习 | `book/engine.py:538–672`；`agents/source_explorer.py:186–246,571–707`；`agents/spine_synthesizer.py:92–170,284–333`；`agents/page_planner.py:96–117,358–429`；相关 en/zh `source_explorer.yaml`,`spine_synthesizer.yaml`,`page_planner.yaml` | 真正 compiler 用 SectionArchitect；PagePlanner 是禁用 LLM 的兼容 alias。旧 SpineAgent 不是当前 engine 的主 spine 实现。生成计划有类型过滤和 section 补位，但并不强制每次都有 quiz/flash/animation | 已读 `tests/book/test_visual_block_prompts.py:1–63`；未覆盖完整规划质量与学习效果测试 |
| 讲解正文 | 直接阅读 Markdown 与数学表达，无须先回答才能得到讲解 | `book/blocks/section.py:73–170,176–317`；en/zh `section.yaml` 全文；`BookUI/SectionBlock.tsx:20–66` | outline→并行填各 subsection；每段只见章信息、intro、自己的 focus 和局部证据。没有共享的逐行推导状态。失败正文可能作为含 generation failed 的字符串返回，而非抛出块错误 | 没有在本分工运行段落正确性或逐行连续性验证 |
| 选择题 | 点 A/B/C/D → Reveal → 对错着色、正确答案和解释；不需输入 | `book/blocks/quiz.py:20–75,84–121`；`question/pipeline.py:534–610,858–976,1327–1428`；en/zh `question/prompts/*/pipeline.yaml`；`BookUI/QuizBlock.tsx:154–258,272–335` | 前端比较选择与标准选项 key；Reveal 后仍能改选；API 信任客户端 `is_correct`。既有记录初始化选项/揭晓/自评状态。不是证明级判分，也不是严格考试锁定 | `tests/book/test_quiz_extraction.py:1–153`；`web/tests/quiz-question-type.test.ts:1–106`；`quiz-option-latex.test.ts:1–87`。缺少“先看答案再选”的组件行为测试 |
| 非选择题/开放回答 | written 提示在心里作答；其他非选择类型标为 Open response；Reveal 看答案、解释，再点 Got it right/Missed it | 同上，尤其 `BookUI/QuizBlock.tsx:261–335`；`web/lib/quiz-question-type.ts:1–113` | 本 Book QuizBlock 没有答题输入框，也不把学生的自然语言交给模型判分。非选择题靠二元自评；仅 Reveal 尚未自评不会触发当前 `onAttempt` effect，尽管类型注释允许 revealed-ungraded | progress/API 测试支持 `is_correct=None` 数据，但不能证明组件已经保存“仅看答案”事件 |
| FlashCards | 看 front/可选 hint → 点击卡片或 Flip 看 back → 上一张/下一张自动回正面 | `book/blocks/flash_cards.py:20–73`；en/zh `flash_cards.yaml` 全文；`BookUI/FlashCardsBlock.tsx:20–82` | count 请求夹在3–8、默认5；只保留合法 front/back，实际不足3不补齐。状态只有本组件 idx/showBack，无评分、持久化回忆结果、排期；文本用 span，不经数学 MarkdownRenderer | 本次相关测试检索未找到/未读取 FlashCards 专属行为测试；不能把这块称已有间隔重复系统 |
| HTML 交互 | 在 iframe 中拖动/点击/改变状态；具体控件取决于生成代码 | `book/blocks/interactive.py:24–113`；en/zh `interactive.yaml`；`deeptutor/agents/visualize/pipeline.py:1–91, utils.py:1–191`；`BookUI/InteractiveBlock.tsx:1–81`；`web/components/visualize/VisualizationViewer.tsx:1–677`；`web/lib/iframe-html.ts:1–189` | Book 用旧 VisualizePipeline 分析→代码→本地校验。HTML 校验是标签启发式；没有交互功能或数学语义验收。共享 bridge 有 prompt/resize，没有课程 step 状态协议。Book 页是否消费 follow-up 事件的完整链未覆盖 | `tests/book/test_visual_block_prompts.py` 只证明提示约束；未证明产物可操作或讲解逐步同步 |
| Book 动画 | 播放、暂停、拖进度、打开/下载视频，读摘要 | `book/blocks/animation.py:24–133`；en/zh `animation.yaml`；`BookUI/AnimationBlock.tsx:1–106` | 固定输出 video；传章摘要/目标与 history；返回 video/artifacts/summary/keypoints，没有给 BookUI 一个逐行推导 steps 协议；没有下一行/上一步按钮 | visual block prompts 测试覆盖“derivation / step-by-step”等提示，不覆盖数学正确性与视频完整性 |
| 独立 MathAnimator | 请求动画或图片，查看实际视频/图片、摘要，可展开代码；图片可放大 | `math/capability.py:1–320`；`pipeline.py:1–326`；`models.py:1–97`；各 agents 与 en/zh prompts 全文；`web/components/math-animator/MathAnimatorViewer.tsx:1–205` | analyze/design/generate/render/summary 分阶段；附渲染记录。分镜是 narrative_steps/scene_outline 等软结构，没有 `before→rule→after→理由→几何对应→时间戳` 的逐行硬约束 | `tests/core/test_math_animator_capability.py:1–121`；`web/tests/math-animator-types.test.ts:1–37` |
| Manim 渲染与修复 | 用户等待渲染完成，失败时系统按错误修复代码重试 | `math/renderer.py:1–271`；`retry_manager.py:1–160`；`agents/code_generator_agent.py:1–199`；en/zh `code_generator_agent.yaml` | 最多4次 repair，即最多5次 render；通过 subprocess 运行真实 Manim。视频取产物文件，image 按生成代码约定的编号锚点渲染静帧。渲染成功只能证明可执行、有产物 | `tests/agents/math_animator/test_retry_manager.py:1–185`；`test_code_generator_agent.py:1–81`；这些用替身验证控制流，不能替代真实 Manim 回归 |
| 可选视觉复核 | 启用时取图片/视频采样帧，发现遮挡等可触发代码修复；最终也可能显示 warning | `math/pipeline.py:35–79,171–205`；`visual_review.py:1–154`；`agents/visual_review_agent.py:1–100`；en/zh `visual_review_agent.yaml` | 默认 `enable_visual_review=False`，Book/MathAnimatorCapability/Visualize 调用没有打开。常规视频采样15/50/85%，重点可读性/遮挡/布局；不是数学证明检查。无视觉模型/无图可返回 skipped/pass；重试耗尽可保留警告产物 | retry_manager 测试明确覆盖最终仍未通过 review 返回 warning；不能称每个动画已经逐帧自动审核 |
| Quiz 进度与补充练习 | 答题记录保存；答错后可主动点 Add extra practice | `book/progress.py:1–136`；`book/models.py:480–506`；`api/routers/book.py:1045–1175,1260–1310`；`BooksRoute.tsx:807–888`；`book/engine.py:2010–2133` | 按 block/question 最新记录计算分数；纠正后可清除相应错章。补充是显式点击，不是自动强迫。插入 common_pitfall callout、remediation text、2道 easy quiz；并未把所选错项传入这些生成器 | `tests/book/test_progress.py:1–133`；`tests/api/test_book_quiz_attempt_notebook.py:1–125`：仅 graded 且有真实 page chat session 才 upsert question-bank；无 session 不合成 |

## 开放回答、选择题与闪卡：不能混为一谈

QuestionPipeline 的规范题型包括 `choice / concept / fill_in_blank / short_answer / written / coding`（`question/pipeline.py:150–167`）。因此“DeepTutor 没有开放题”不准确；但“DeepTutor Book 让用户不停打字回答开放题”同样不准确。题目的语义类别与实际答题 UI 是两件事：当前 Book 中 choice 点选，所有非 choice 都是心里作答/揭晓/自评，且学习者能直接 Reveal。

`QuizGenerator` 未指定题型时传空列表，QuestionPipeline 可从全题型规划（`book/blocks/quiz.py:24–64`）。所以来源也不保证默认所有练习都是 MCQ。针对本用户应明确优先选择题和翻卡，而非复刻这个不确定默认值。选择题需要点击选项，不能把文字列表误称已有可点控件；纯对话技能必须使用实际可用交互组件，或诚实提供可直接查看的答案与讲解。

FlashCards front/back/hint 是一个轻量检索练习块。它没有“记住了/忘了”评分按钮，没有答案正确性判定，也没有下次复习时间。仓库 `learning/mastery.py`、`grading.py`、`scheduler.py` 的确分别提供最近5次加权正确率、确定性字符串/关键词判分、按知识类型的间隔排期；`learning/service.py:218–294` 将答题→掌握度→排期→保存连起来。但 Book FlashCardsBlock 没有接入这些接口。不能把另一模块存在的服务能力写成一个闪卡组件、一个 Markdown 技能已经实现了它。

## Manim：从代码到图，再到讲解的真实路径

1. **理解目标。** ConceptAnalysisAgent 从主题/历史/图像线索生成 learning_goal、math_focus、visual_targets、narrative_steps 等结构。
2. **设计可见变化。** ConceptDesignAgent 生成 scene_outline、animation_notes、image plan、constraints。双语 prompt 要求多个教学 beat、复杂度相应时长、转换后停留以及结束画面停留。这是内容规划，不是人工已经审过的讲稿。
3. **生成可执行代码。** CodeGeneratorAgent 输出 Manim 代码；空/不合法结果可重试。修复 prompt 带原目标、前次代码和真实报错，要求最小修复并保持教学节奏；代码 prompt 默认避免依赖 LaTeX 的 Tex/MathTex 等类，意味着“有 Manim”也不自动等于高质量公式逐行排版。
4. **真正渲染。** Renderer 写代码文件并调用 `sys.executable -m manim`。视频生成 mp4；图片按锚点分段生成。RetryManager 在执行失败时修复并重跑，最多初次+4次修复。
5. **可选检查画面。** VisualReview 默认关闭。打开后检查抽帧可读性/布局等，必要时再修；不是逐行代数等价性或证明严密性校验。
6. **产物解释。** SummaryAgent 被要求写2–4句总结。前端播放视频/展示图片与摘要。**这份摘要不是“每一行等式为什么可以变成下一行”的讲解。** BookUI 也没有绑定行号、公式状态或步骤时间戳。

因此，应从来源学习“讲解目标驱动的分镜 + 实际运行渲染 + 错误反馈修复”，同时为用户新增“逐行推导与对应画面同步”的契约。来源有 step-by-step 教学意图和动画基础设施，不等于已经有任意推导都可逐行点播的成品。

## C / I / M 发现与可实现修订

C = 直接违背本用户任务或造成核心能力失真；I = 影响教学质量、状态可靠性或实现真实性；M = 次要可用性与鲁棒性。这里既列迁移风险，也列来源自身边界，均标明对象。

### C1 — 把教学迁移成打字主观问答，会遗漏来源已有的免打字路径

对象：主任务所述上一版迁移方向。失败实例：用户想看“积分分部法为何成立”，系统先连续要求“请解释乘积法则”“写出下一行”，用户不输入就得不到讲解。Book 实际不要求这样；section 直接讲，quiz 可 Reveal，flash 可 Flip。

修订：默认先给完整而分段的讲解；练习只穿插在确有诊断价值的位置，优先2–4项点选、翻卡或“直接看解释/继续”。任何时候用户不答题也应能继续学。开放表达只在用户主动要练习表述、证明、编码时启用；不能以“苏格拉底”名义取代授课。

### C2 — 只有图、代码或短摘要，不能交付用户要求的行行推导

对象：迁移验收；来源也无硬性逐行协议。失败实例：给出最终动画“曲线下的面积逐渐填满”和2句总结，却没有说明从 `d(uv)=u dv+v du` 到积分式再到移项每一步的规则。即使 mp4 可播放也未完成任务。

修订：每个推导段必须有稳定 step id，以及「当前公式 → 本步操作 → 使用的规则/成立条件 → 新公式 → 图中对应变化 → 一句直白解释」。行间不得省去关键变形。用同一份 step 数据同时驱动讲稿、静帧/Manim 分镜和上一行/下一行/重播；若只有视频，至少配对应的逐行文字与时间点。该同步协议应明确标为新增设计，不能宣称直接摘自 DeepTutor。

### C3 — 不应把服务与 prompt 期望冒充技能已经执行的能力

对象：能力承诺。失败实例：只有“生成 Manim 动画”说明文案，没有运行 renderer；或声称自动视觉审核，而实际默认开关为 false；或给 flashcards 就声称已有间隔重复。

修订：区分已渲染视频、可运行代码、静态讲解帧、文字步骤；只对实际完成的产物使用对应名称。环境能跑 Manim 时执行生成/渲染/检查，失败则按报错修复；环境不能跑时交付可用的逐步可视化或静帧及代码，并说明哪部分尚未渲染。持久状态/复习计划只有接入存储与调度后才可承诺。

### I1 — 当前 Quiz 分数可反映“看过答案后选对”，不能直接解释为独立掌握

来源证据：`QuizBlock.tsx:170–189,223–258,272–290`，Reveal 不要求先选，揭晓后仍能切换选项；effect 随已揭晓的 selected 更新记录。API `book.py:1075–1103` 信任客户端结果。

失败实例（源码推演，未运行浏览器）：不选答案直接 Reveal → 看见正确项 → 点击正确项 → 保存 correct。这对学习反馈未必错误，但把它计成“无提示掌握”会失真。

修订：保留自由看答案，但分别记录 `viewed / assisted / independently_correct / self_reported_correct`。首次作答与揭晓后修正分开；错题修正可以清除待补救状态，却不能覆盖首次独立表现。此用户无需考试锁定，也不应被迫先作答。

### I2 — “补充练习”还不是针对具体错因的修复

来源证据：Book QuizGenerator 不传 QuestionPipeline 的 `quiz_history`；SourceExplorer 的文档/prompt提错题材料，但 `_collect_non_kb_chunks:571–626` 实际只收 notebook/chat，question entries 在查询设计仅计数；BooksRoute `:858–879` 只发送 block topic 或章名；engine `:2067–2113` 插入的 topic 没被 text/callout/quiz 生成逻辑作为具体错题证据消费。

失败实例：学生把“定积分负值”误解成“面积必为负”，系统只收到“积分”章名，生成又一段积分概述和简单题；没有解释有向面积与几何面积的区别。

修订：补充入口携带题干、选项、用户选择、正确项、已看解释、知识点和一个可点击错因选项；生成器显式消费这些字段，输出一段针对性讲解＋一题同概念不同表面的检查。未接通之前称“章节补充练习”，不称已识别具体错误原因。

### I3 — 题目修复后仍有 schema 问题，可以被记作成功并进入 Book

来源证据：QuestionPipeline `:898–925` 仅修一次后保留 best effort；`:1371–1428` 把校验问题放 `metadata.issues`；`:1271` 成功只排除 metadata.error；Book extraction `quiz.py:84–121` 又不保留 issues。

失败实例（源码推演）：choice 缺 D 或答案不是 A–D；修复仍错；QA pair 只有 issues 没 error，结果成功标志可为 true，Book 抽取后仍显示。正误比较或四选项呈现因此可能失常。结构检查本身也不证明数学答案正确。

修订：把不可呈现的 schema 问题升级为可见失败/重新生成，保留检查元数据；教学题另做答案正确性与选项唯一性检查。不能用“JSON 能解析”代替题目验收。

### I4 — 行行推导的数学正确性，尚未被渲染/视觉复核保障

来源证据：models 的设计字段与视觉复核 prompts；renderer 只执行；review 默认关闭且关注布局抽帧。代码 prompt 有 beat 与等待要求，但这些没有硬时长/逐行覆盖验收。

失败实例：把 `sqrt(a+b)` 直接变成 `sqrt(a)+sqrt(b)`，代码能运行、画面无重叠、摘要流畅，仍是数学错误。抽取15/50/85%的帧也可能错过中间一行一闪而过或符号缺失。

修订：在渲染之前逐步验证规则、定义域和等价/蕴含关系；渲染后对关键 step 抽帧逐项核对其公式和可读性，不只按视频百分比。正式证明与直觉图像各自标清作用。先覆盖用户当前推导题型，不必扩张成泛用形式证明系统。

### I5 — 长文块并行填充，不保证相邻推导的符号与内容连续

来源证据：`section.py:105–145,257–317` 分段并行，段落只有 opener 与自己的 focus；`compiler.py:368` 给 bridge 的 previous_summary 只是“某类块关于本章”的占位描述，而非前块实际数学内容。

失败实例：上段用 t 作积分变量，下段突然以 t 作参数且没有解释；前段省了条件，后一段把结论当已证明。书页排起来连贯并不等于数学论证连贯。

修订：推导章节共享符号表、假设表、已证明结论与 step ids；关键推导顺序生成并读取前段实际结果，最后检查相邻公式和叙述是否衔接。一般背景小节仍可并行。

### M1 — FlashCards 的数学显示、持久化和数量约束有限

来源证据：FlashCardsBlock `:43–49` 用 span；flash_cards.py `:47–65` 过滤但不补足数量。失败实例：后面存 `$\\int u\\,dv$` 会按纯文本显示；翻到第4张刷新回第1张；模型只返回1张有效卡仍可生成成功。

修订：复用数学 Markdown 渲染；卡片用稳定 id，必要时保存索引和显式自评；严格区分“翻过”与“能回忆”。对本用户，先确保公式可读与免打字即可，不必为了迁移过早引入完整排期系统。

### M2 — 兼容题型与仅揭晓状态存在边界不一致

来源证据：`web/lib/quiz-question-type.ts` 支持 multiple_choice/mcq，但不支持 single_choice；`tests/book/test_quiz_extraction.py` 的旧格式 single_choice 会被保留；非选择题仅 Reveal 不触发保存。

失败实例：导入 legacy `single_choice` 四选题却被前端归一到 short_answer，出现自评界面；仅揭晓非选择题再换页返回，揭晓状态可能丢失。当前规范生成流程用 choice，因此前一个问题主要影响旧数据/导入，不应夸大为所有选择题都坏。

修订：统一题型归一函数/契约并增加兼容 fixture；明确保存 viewed-ungraded 事件，或者移除宣称已保存这一状态的注释。

## 对本用户适用的最小教学回路

“先展示要解决的问题与图像直觉 → 逐行讲清关键推导 → 允许上一行/下一行/重播 → 可选点选一题定位理解 → 直接展示答案与针对选项的解释 → 用1张翻卡收拢规则 → 继续下一小段”。这是对来源机制和用户偏好的有依据组合，不是来源逐字已有的一套万能流程。

以分部积分为例，讲解至少明确：从乘积微分规则出发；两边积分；说明为何得到乘积项；移项；在定积分版本替换成端点项并保留积分上下限；最后选一个具体例子指定 u 与 dv。每一步都有公式、操作依据和对应画面。检查题可以点“哪一项应该积分为 v”，翻卡 front 为“分部积分的乘积项来自哪里”，back 给乘积法则到积分式的短解释。用户直接看答案也继续讲，不用打字换取讲解。

迁移验收至少看四个具体行为：选择/翻卡真的可操作；用户完全不输入也能学完；每个关键公式变形都有理由和可回看画面；声称动画时确有生成产物并经检查。高级能力如错因诊断、持久掌握度、间隔复习和逐步播放器，应根据当前工具/存储条件逐项实现，不能仅写进 prompt 即视为完成。

## 验证记录与未覆盖范围

已完成源码与 prompt 的连续精读、数据流/事件流核对、相关测试源码审查、固定提交核验。尝试运行：

```text
python -m pytest -q tests/book/test_progress.py tests/book/test_quiz_extraction.py tests/book/test_visual_block_prompts.py tests/agents/math_animator/test_retry_manager.py tests/agents/math_animator/test_code_generator_agent.py tests/core/test_math_animator_capability.py
```

结果：exit 1，当前 Python 报 `No module named pytest`。因此这里没有任何“测试通过”结论；没有运行真实 LLM、Manim、浏览器 E2E，也没有声称用户已能实际播放生成视频。失败实例明确属于源码推演，适合作为后续针对性的回归场景。

本分工未全文覆盖：BookEngine 未列入清单的其余行、API router其余内容、BooksRoute其余内容、PageReader全链；全站 QuestionCapability/QuizViewer 与其答案输入判分 UI；Learning policy/service 的其余流程、学习前端与全部测试；通用 Visualize 的插件实现与插件 prompts；底层 LLM/PromptManager/RAG/storage/auth 与其他业务模块；所有未列于读取清单的文件。尤其不能根据本报告说“全 DeepTutor 所有界面都无需打字”，或“所有学习服务已集成到 Book”。

已完整读过的相关目录文件索引只用于定位，不计入语义覆盖；AGENTS/README 的架构描述也不能凌驾当前实际入口。清单中的5个局部文件是 engine.py、api/routers/book.py、BooksRoute.tsx、book-api.ts、learning/service.py，均明确给出连续实读范围。
