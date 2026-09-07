# DeepTutor 交互来源与案例追溯

维护日期：2026-09-07。本次新增学习交互以 [HKUDS/DeepTutor 固定快照](https://github.com/HKUDS/DeepTutor/tree/42fab3cf429a1fbf36b257ab8d116a3814964202) 为来源：`42fab3cf429a1fbf36b257ab8d116a3814964202`（该快照README发行记录为v1.6.5）。以下所有源码链接固定到这个提交，不代表上游今后的状态。学习科学校准见[学习证据](learning-evidence.md)，实现契约见[交互规格](interactive-html.md)。

## 证据级别

| 级别 | 本次实际证据 | 能证明的范围 |
|---|---|---|
| 源码阅读 | Books、交互HTML生成/渲染、共享Quiz、Mastery学习/状态及调用入口 | 控件、数据和调用关系；静态问题仍需与运行结果区分 |
| 官方展现 | 逐张观看下表11张官方图片，并读对应Books/Mastery/Reading案例页 | 可见布局和已呈现状态；截图不能证明点击后的变化 |
| 原组件DOM实测 | 固定快照的FlashCardsBlock、QuizBlock在隔离React/jsdom环境运行，11项通过 | 原事件处理、DOM变化和回调；不包含浏览器视觉、服务端保存或在线账户操作 |
| DialogueTutor基线 | 实际打开原线上样章、点击六个小问并核对DOM | 原页有18个内链、15张表，无答题/翻面/状态保存控件；这属于改造前观察 |

没有把自制概率题当作DeepTutor官方教学案例。DOM环境使用本项目提供的三张概率卡及两道题驱动原组件，测试的是操作；没有启动完整DeepTutor服务或操作公开账户。

## H1—H9 的完整来源链

| 增强 | 固定源码 | 案例与级别 | 本项目采用及边界 |
|---|---|---|---|
| H1 活动编排 | [SectionArchitect][planner]、[编排提示][planner-prompt]、[BlockRenderer][blocks] | B1/B3/B6（截图）；源码 | 按目标把讲解、翻卡、自测、探索和步骤穿插；本章15处是编排结果，不是每章定额。 |
| H2 翻卡 | [FlashCardsBlock][flash]、[生成器][flash-gen] | B6仅类型菜单；原组件DOM①—③ | 保留翻面/前后导航；新增答前辅助记录和自评连接。间隔复习另接H9，上游闪卡没有自带。 |
| H3 就地作答 | [Books QuizBlock][quiz]、[共享QuizViewer][quiz-viewer] | B1（截图）；Books原组件DOM④—⑪；共享组件仅源码 | 明确提交、反馈、重试；数值/分数核对为本地确定性适配，开放题保存原答及评价要点，不照抄字符串评分。 |
| H4 参数图形 | [InteractiveGenerator][interactive-gen]→[Visualize][visualize]→[InteractiveBlock][interactive-view]、[iframe桥][iframe] | B3采样频率滑杆（截图）＋源码 | 迁移参数—图形—读数联动到概率模型；没有声称拖过官方在线滑杆。数学关系在本地实现核对。 |
| H5 步骤控制 | [HTML生成规则][html-rules]；[AnimationBlock][animation]提供过程媒体先例 | stepper仅源码；B2为动画截图 | 采用阶段面板和前后步；不把B2静图说成stepper动态案例，不声称播放了原动画。 |
| H6 深入解释/追问 | [DeepDiveBlock][deepdive]、[Page Chat][book-chat]、[逐题上下文][quiz-followup]、[运行器][followup-runtime] | B4/R1（截图）＋源码 | 提供预生成局部解释与当前活动上下文；自由提问转到聊天。不把单文件有限分支称实时导师服务。 |
| H7 笔记/书签/定位 | [UserNoteBlock][note]、[BookSidebar][book-sidebar]、[Books进度][book-progress] | B4/R0/R1仅相邻阅读情境；动作由源码支持 | 记录稳定活动位置、笔记、书签；本地存储和记录导入导出是便携化手段，不称上游同名导出功能。 |
| H8 目标/证据/继续 | [StudyOutline][outline]、[ObjectiveDetail][objective]、[题卡][question-card]、[service][learning-service]、[storage][learning-storage] | M0/M1仅初始路线和工作区（截图）＋源码 | 目标关联真实尝试；阅读/探索/客观/自评分开，重复提交去重，按课程版本恢复；没有上游服务端实测。 |
| H9 复习入口 | [scheduler][scheduler]、[policy][policy]、[ReviewTrail][review] | 源码；M1未展示复习队列 | 连接H2/H3的本地记录，公开1/3/7/14/30天工程默认；不移植个人遗忘曲线文案。 |

## 11 张已观看的官方展现

[Books案例](https://docs.deeptutor.info/zh-cn/explore/book/)；[Mastery Path案例](https://docs.deeptutor.info/zh-cn/explore/mastery-path/)；[Reading案例](https://docs.deeptutor.info/zh-cn/explore/reading/)。图片链接是官方展现资源，URL本身未按Git提交固定；显示版本与源码版本分别记录。

| 图 | 实际看到的内容 | 图中版本及未证明事项 |
|---|---|---|
| [B0](https://docs.deeptutor.info/screenshots/guide/book/00-book-overview.png) | 傅里叶变换书卡，3章/3页 | v1.6.1；书库入口，不含学习动作 |
| [B1](https://docs.deeptutor.info/screenshots/guide/book/01-book-demo-quiz-card.png) | 正文关键提示后接四选一Quick Check和揭示按钮 | v1.6.1；未见提交后的动态反馈 |
| [B2](https://docs.deeptutor.info/screenshots/guide/book/02-book-demo-manim-video.png) | 信号分解说明与动画块同页 | v1.6.1；静图，未播放动画 |
| [B3](https://docs.deeptutor.info/screenshots/guide/book/03-book-demo-interactive-module.png) | 20Hz信号、100Hz采样、5×读数、滑杆及后续Nyquist检查 | v1.6.1；未在线拖动滑杆 |
| [B4](https://docs.deeptutor.info/screenshots/guide/book/04-book-demo-side-chat-mermaid.png) | 采样/加窗/FFT Mermaid图与Page Chat并列 | v1.6.1；未发送Page Chat消息 |
| [B5](https://docs.deeptutor.info/screenshots/guide/book/05-book-add-customize-block-for-chapter.png) | 章节内插入内容块菜单 | v1.6.1；插入菜单部分遮挡 |
| [B6](https://docs.deeptutor.info/screenshots/guide/book/06-book-switch-the-block-type.png) | 移动、重生成及包含闪卡/测验/互动的类型菜单 | v1.6.1；闪卡仅菜单项，未见正反面 |
| [M0](https://docs.deeptutor.info/screenshots/guide/mastery-path/00-overview.png) | Fourier Transform Foundations的3个模块、0/6目标 | v1.6.1；尚无目标完成证据 |
| [M1](https://docs.deeptutor.info/screenshots/guide/mastery-path/01-study-workspace.png) | 知识点路线、初始学习区、quick check/teach me和Activity抽屉 | v1.6.1；未见已评分题卡或复习队列 |
| [R0](https://docs.deeptutor.info/screenshots/guide/reading/01-open-a-document.png) | 阅读合集与材料库 | v1.6.1；材料库入口 |
| [R1](https://docs.deeptutor.info/screenshots/guide/reading/00-overview.png) | Transformer材料、目录、正文与阅读助手 | v1.6.4；未执行阅读助手追问 |

## 原始组件的 11 项 DOM 实测

2026-09-07在Node 24.19.0、React 19.2.3、jsdom 26.1.0中运行编译后的原组件，通过DOM点击事件检查输出；11项通过、0项失败、无运行时错误。执行bundle的SHA-256为`4de1fba3eb749ee44ac8272167dfd0da74fcba19569ea9be255f116781218d10`。

原JSX、事件、状态与评分条件保持不变。[FlashCardsBlock][flash]、[QuizBlock][quiz]、[quiz-question-type][quiz-type]、[book-types][book-types]四份原文件均与固定提交逐字节相等。国际化用键名、Markdown用纯文本显示适配；外围布局、测试题和回调日志由隔离页提供。

| 编号 | 实际触发与读取的结果 |
|---|---|
| 1 | 初始闪卡在第1张，Prev禁用、Next可用，显示正面提示。 |
| 2 | 点击卡片和Flip均切换正反面；背面隐藏提示。 |
| 3 | Next/Prev改变索引且恢复正面，两端按钮禁用。 |
| 4 | 选择B但未揭示时，不触发尝试回调，解析不可见。 |
| 5 | 揭示错误选择后回调B/false，显示解析、反馈样式类和补充练习入口。 |
| 6 | 答案已可见时再选A/B，分别新增true/false回调。 |
| 7 | 开放题揭示参考和自评入口，回调不增加，组件没有作答文本框。 |
| 8 | 开放题两个自评分别回调self:correct/true和self:incorrect/false。 |
| 9 | 保留父组件内存尝试并重挂载，恢复选择、揭示和错误自评，没有重复回调。 |
| 10 | 补充练习按钮调用onRequestSupplement；仅记录回调，没有生成新题。 |
| 11 | 未选答案便直接揭示时，答案出现但不产生尝试回调。 |

这些断言不检查视觉颜色、字体、布局或动画；重挂载的历史来自父组件内存，不代表刷新后持久化。共享QuizViewer、Mastery题卡、参数探索和stepper没有计入这11项原组件实测。

## 当前样章的 15 处活动

以[实际活动配置](../examples/s2-interactive.json)为准：4组翻卡、2处探索、2处步骤、1处概念短测、6个原题作答。Q2(c)遵守原题write down，采用数值核对；Q2(a)/(b)保留开放推导。

| 活动ID | 放置与目标 | 形式 | 固定源码及案例层级 |
|---|---|---|
| `cdf-recall` | CDF定义与区间差值首次讲解后 | 翻卡 | [FlashCardsBlock][flash]；B6菜单＋DOM①—③ |
| `cdf-density-steps` | CDF与密度关系的原推导后 | 步骤 | [HTML规则][html-rules]；仅源码规则 |
| `density-recall` | 密度性质、单点与区间区别后 | 翻卡 | [FlashCardsBlock][flash]；B6菜单＋DOM①—③ |
| `density-concept-check` | 首章PDF/CDF图后；高度超过1的辨析 | 单选 | [QuizBlock][quiz]＋[QuizViewer][quiz-viewer]；B1截图；Books揭示/自评有DOM实测 |
| `linear-density-explore` | 机器空转例图后；面积与CDF差值 | 参数探索 | [InteractiveGenerator][interactive-gen]；B3截图＋源码适配 |
| `normalization-recall` | 机器例题末；非负与归一化 | 翻卡 | [FlashCardsBlock][flash]；B6菜单＋DOM①—③ |
| `uniform-density-steps` | 均匀密度首张推导表后 | 步骤 | [HTML规则][html-rules]；仅源码规则 |
| `uniform-parameters-recall` | 完整密度写法后、期望推导前 | 翻卡 | [FlashCardsBlock][flash]；B6菜单＋DOM①—③ |
| `uniform-explore` | 均匀分布图后；支持/事件区间 | 参数探索 | [InteractiveGenerator][interactive-gen]；B3截图＋源码适配 |
| `q1a-answer` | Q1(a)题面后；完整密度写法 | 单选 | [QuizBlock][quiz]＋[QuizViewer][quiz-viewer]；B1截图；Books揭示/自评有DOM实测 |
| `q1b-answer` | Q1(b)题面后；平均偏差 | 数值 | [QuizBlock][quiz]＋[QuizViewer][quiz-viewer]；B1截图；Books揭示/自评有DOM实测 |
| `q1c-answer` | Q1(c)题面后；超过3分钟的概率 | 数值 | [QuizBlock][quiz]＋[QuizViewer][quiz-viewer]；B1截图；Books揭示/自评有DOM实测 |
| `q2a-answer` | Q2(a)题面后；归一化证明 | 开放推导 | [QuizBlock][quiz]＋[QuizViewer][quiz-viewer]；B1截图；Books揭示/自评有DOM实测 |
| `q2b-answer` | Q2(b)题面后；积分求区间概率 | 开放推导 | [QuizBlock][quiz]＋[QuizViewer][quiz-viewer]；B1截图；Books揭示/自评有DOM实测 |
| `q2c-answer` | Q2(c)题面后；对称性下的期望 | 数值 | [QuizBlock][quiz]＋[QuizViewer][quiz-viewer]；B1截图；Books揭示/自评有DOM实测 |

每个活动的精确CSS插入位置、目标ID、主来源、相关路径与迁移理由保存在配置的`placement`、`objectiveId`和`source`中；H6—H9为这些活动提供共同能力。数值容差、分数识别、本地记录导入导出和单文件组装属于适配实现，不能写成DeepTutor原版已经提供的同等能力。

## 已知不足与没有照搬的部分

| 原实现证据 | 本项目的处理 |
|---|---|
| Books闪卡正面直接显示hint，没有自评回调、持久化或间隔调度；源码及DOM①—③ | 提示改为主动查看；自评与原答来源明确，复习另借H9连接 |
| Books测验揭示后可改选；DOM⑥确认，且[progress][book-progress]按最近记录汇总 | 首次提交保留，重试单列，答前辅助可追溯 |
| [QuizViewer][quiz-viewer]开放题界面中性但保存仍可能使用字符串比较；[Mastery评分][grading]使用有限字符串/关键词规则。仅源码调用链结论 | 开放推导不自动判语义正确，保留原答、参考和自评要点 |
| [mastery][mastery]由近期布尔对错计算门槛；[ReviewTrail][review]提个人遗忘曲线而[scheduler][scheduler]是固定间隔。源码结论 | 展示真实行为和公开调度，不显示概率化掌握认证 |
| [Mastery工具][mastery-tools]把导师反馈传为证据，[service][learning-service]保存后[ObjectiveDetail][objective]可标为本人解释。源码调用链结论 | 本人原答、反馈与自评分字段，不能代写学习者证据 |
| [iframe桥][iframe]仅提供prompt/高度事件，没有学习评分协议；Books接收追问的完整连接未获证实 | 本地活动显式连接记录；预生成追问与复制上下文入口说明自身范围 |
| [整书导出][book-export]为Markdown，闪卡正反面并列、互动HTML为代码块 | DialogueTutor独立组装可运行HTML，不把原导出当作交互成品 |
| 原动画块是视频播放；stepper来自生成规则；Books代码块仅展示代码 | 本章使用明确的步骤控件，不冒称复现原版动画或代码执行 |

这些迁移决定修正的是已经定位的接口或判断边界。源码发现、隔离DOM结果和官方截图各自保留级别；它们均不构成新HTML学习效果的实验验证。

[planner]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/deeptutor/book/agents/page_planner.py
[planner-prompt]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/deeptutor/book/prompts/zh/page_planner.yaml
[blocks]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/web/app/%28workspace%29/books/components/blocks/BlockRenderer.tsx
[flash]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/web/app/%28workspace%29/books/components/blocks/FlashCardsBlock.tsx
[flash-gen]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/deeptutor/book/blocks/flash_cards.py
[quiz]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/web/app/%28workspace%29/books/components/blocks/QuizBlock.tsx
[quiz-viewer]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/web/components/quiz/QuizViewer.tsx
[quiz-followup]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/web/components/quiz/QuizFollowupTabBody.tsx
[interactive-gen]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/deeptutor/book/blocks/interactive.py
[interactive-view]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/web/app/%28workspace%29/books/components/blocks/InteractiveBlock.tsx
[visualize]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/deeptutor/agents/visualize/pipeline.py
[html-rules]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/deeptutor/agents/visualize/prompts/zh/code_generator_agent.yaml
[iframe]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/web/lib/iframe-html.ts
[animation]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/web/app/%28workspace%29/books/components/blocks/AnimationBlock.tsx
[deepdive]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/web/app/%28workspace%29/books/components/blocks/DeepDiveBlock.tsx
[book-chat]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/web/app/%28workspace%29/books/components/BookChatPanel.tsx
[followup-runtime]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/deeptutor/services/session/_turn_runtime_shared.py
[note]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/web/app/%28workspace%29/books/components/blocks/UserNoteBlock.tsx
[book-progress]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/deeptutor/book/progress.py
[book-sidebar]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/web/app/%28workspace%29/books/components/BookSidebar.tsx
[outline]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/web/components/space/learning/StudyOutline.tsx
[objective]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/web/components/space/learning/ObjectiveDetail.tsx
[question-card]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/web/components/chat/home/MasteryQuestionCard.tsx
[learning-service]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/deeptutor/learning/service.py
[learning-storage]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/deeptutor/learning/storage.py
[scheduler]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/deeptutor/learning/scheduler.py
[policy]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/deeptutor/learning/policy.py
[mastery]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/deeptutor/learning/mastery.py
[review]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/web/components/space/learning/ReviewTrail.tsx
[grading]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/deeptutor/learning/grading.py
[mastery-tools]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/deeptutor/capabilities/mastery/tools.py
[book-export]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/deeptutor/book/export.py
[quiz-type]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/web/lib/quiz-question-type.ts
[book-types]: https://github.com/HKUDS/DeepTutor/blob/42fab3cf429a1fbf36b257ab8d116a3814964202/web/lib/book-types.ts
