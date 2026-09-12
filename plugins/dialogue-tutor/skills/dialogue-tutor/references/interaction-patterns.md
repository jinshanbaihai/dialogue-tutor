# 根据学习目标选择真实产品采用的交互

旧规则把全部灵感限定为 DeepTutor，读者即使需要分类、建构或情境决策，也容易收到同样的翻卡与选择题。下面扩展可选择的交互形状。调研日期：2026-09-12。依据为官方产品介绍、教学指南和公开仓库；本次没有登录商业产品实测。产品展示只证明机制存在，迁移方案是本项目设计判断。

## 交互模式目录

| 学习目标与可观察问题 | 官方产品行为与出处 | 本项目采用的教学动作 | 本包实现 |
| --- | --- | --- | --- |
| 区分概念或预测图形 | [Amplify Classroom 教程][amplify]提供选择题、媒体和按答案反馈 | 默认四选一；每项对应可说明的判断，提交后定位依据，再问图中哪处支持判断 | `quiz/choice`；图像选项需要 `interactive` 扩展或图示编号 |
| 回忆定义与适用条件 | [HKUDS/DeepTutor][deeptutor]提供 Books flashcards 和 quiz blocks | 正面提出提取问题，翻面提供定义、实例或反例；自评与客观作答分开 | `flashcards` |
| 分类、配对并解释边界 | [Amplify 教程][amplify]提供词汇、图片和公式 card sort | 将实例归类，穿插反例；分类后指出决定分组的条件 | `interactive`，另用题卡收集可判定表现 |
| 从操作建立等价关系 | [Brilliant Solving Equations][brilliant]先安排直观谜题，再拖拽水果和方程对象 | 操作天平两侧，观察相等关系保持，再命名符号操作；逐行说明每次变化 | `interactive` + `steps` |
| 发现一个变量的作用 | [PhET 活动指南][phet]建议先预测，再用模拟检查，并使用图表和语言解释 | 提交预测，调整一个变量，比较结果，再解释差异；第一次接触先给最小示范 | `quiz/choice` + `explore` 或 `interactive` |
| 连接图像、公式与数据 | [Amplify 教程][amplify]提供图表连接与输入值联动 | 共享参数同步更新图、公式、数值；同一对象使用同一颜色，指出变化与不变量 | `interactive` |
| 在情境中运用知识 | [Duolingo Adventures][adventures]允许点击对象、阅读标志和参与情境任务 | 提供一个具体目标，点击获得决策信息；选择后观察实际后果，再解释关系 | `interactive`，按需配 `quiz` |
| 主动提问与排除候选 | [Amplify 教程][amplify]列出 Polygraph 猜谜 | 对一组候选概念提出可区分特征的问题；每次选择显示被排除对象与依据 | `interactive` |
| 理解连续变化的每个阶段 | [ManimCE 图库][manim]提供图形变换、函数与相机示例 | 暂停在关键阶段预测下一步；变化对象与推导行同步强调 | Manim 预渲染片段 + `steps` / `quiz` |

四选一的固定数量、按误解分支、三层概念卡与预测位置属于本项目的编排，不能说成这些产品共同规定的教学标准。PhET 是研究型教育项目；Manim 是动画工具；不把二者称为商业大厂产品。

## 从目录得到一个学习节点

选择活动前写清目标与已建立前提。一次活动只要求一个主要思考动作。先提供必要示范，再让读者预测、分类、建构或解释；动作触发反馈，反馈指出具体关系，逐行模块解释因果，随后用变式检查。学习者保留提示、跳过与主动查看完整过程的入口。

四选一的干扰项分别来自定义域遗漏、把图形高度当总量、符号方向错误等可解释的不同判断；实际反馈只针对学习者选择的内容。不以答案长短、措辞刁钻或重复同义选项吸引注意力。完整章节根据实际目标轮换活动，不能把每段正文都改成相同题型。

“完成点击”只说明参与；自评说明本人判断；明确标准的提交才能形成该题正确性记录。需要确认迁移时改变条件或情境后再作答。已有笔记、书签和到期回顾沿用原学习记录模型。

## 来源与实现分开记录

`source` 继续记录本包组件的 DeepTutor 实现来源。设计蓝图另记“产品机制、官方 URL、采用部分、独立改编”；不能为了满足组件字段，把 Brilliant 的天平交互写成 DeepTutor 原生功能。自定义活动可用 `source` 对象记录明确的产品来源，具体结构见 `interactive-html.md`。代码仓库出处与功能行为都需要可核对，不使用虚构 commit。

DeepTutor 的既有快照逐项证据仍在 `deeptutor-provenance.md`。这是 HKUDS 的开源项目；与本包结合后的单文件运行、状态归并与复习并非原项目所有模块已经共享的功能。新目录扩展产品机制来源，不推翻原快照中的实现边界。

[amplify]: https://go.info.amplify.com/fy26_amplifyclassroom_aclessonbuildingtoolkit_national_educationalsite_ac-activities-lessons_no-form_optin
[brilliant]: https://blog.brilliant.org/solving-equations/
[phet]: https://phet.colorado.edu/files/guides/PhetGuideActivityDoc_v8-final_en.pdf
[adventures]: https://blog.duolingo.com/adventures/
[deeptutor]: https://github.com/HKUDS/DeepTutor
[manim]: https://docs.manim.community/en/stable/examples.html
