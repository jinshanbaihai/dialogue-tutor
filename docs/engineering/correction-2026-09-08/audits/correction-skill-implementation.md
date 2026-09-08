# DialogueTutor 1.7.1 技能修正实施记录

2026-09-08。实施者只编辑 SKILL.md 与 references；未编辑运行程序、assets、tests、课程/演示、版本元数据，也未 commit/push。核心文件已交根代理冻结做独立专家审查。**以下是实施及作者检查记录，不是专家通过、课程通过或学习效果认证。**

## 原文恢复方式

从 baseline/dialogue-tutor/SKILL.md 的完整2230行恢复，随后定点替换已定位冲突。保留两元件、知识前提链、短回合/原理模式、三种命令及后缀、bgct按对象七幕/两半、bbct板书和考纲补齐、olct前置块、下半全量小问六项、题干三层保真、纵横检查、独立断点审读、伴读详细度与走位单、具名外部路由和历史记录。没有从退回版77行摘要逐条补猜，也没有把原技能缩成检查表。

## 已改契约

1. 交互 > 可视化 > 文字明确是完整理解内部的参与优先级及用户偏好。新课 document/no-typing/light，静态正文含定义、稳定lineId、activity mount与solutionId；原studio折叠只保留旧兼容。已揭示主行回退不丢，当前未答解法局部关闭；错答/跳过/直接全解均能继续。
2. 保留每个变换一行与具体依据，拒绝“主要变换”。修原§1.6连等号、§1.7密度例题连等号及漏不定积分常数、§1.9八行串等号正例，后者展开30行，明确变量绑定不机械当推导。8.1/8.2补讲同标准；计数是漏项提示不是语义通过。
3. 定义/条件优先DeepTutor心答翻卡→翻面→自评，辨析优先choice，证明/计算用选步骤/依据或整份构造；主流程无typing，笔记可选；保留numeric/open旧schema而非删除。show that 保留原题和全解，免打字动作不冒称完整独立书面证明。
4. 一个interactive四组路径集合/统计量映射/概率依据/分布，统一提交前无逐格判分；冻结整份答卷与assistanceAtSubmit，双击去重，修改显式新尝试。自定义submissions的确定核对标“构造选择核对”，公共runtime仍探索，无伪造统一客观评分/复习。
5. 所有数学统计图经原manim具名路由实际Manim Community渲染静帧/可选视频；MathTex/Tex或原技能支持的MathTypst合法。保留全部原教程/API/voiceover路径、读取/产出/失败契约，移除“只有连续动画才Manim”分流。失败保留源码/日志/分镜并明确未完成，不将未渲染声明为通过。
6. 同源约分有理数JSON生成路径、均值、概率、柱、正文、Scene和核对数据。manifest列dataHash、sceneSourceHash、实际命令/版本、frameId/conditionKey/stageId/lineIds/pathIds/barIds、objectId/role/label/token/精确值、文件hash，视频另真实时间/帧索引。有限完整状态集、快速切帧防迟到、缺帧诊断、最终目录资源检查、静帧完成同任务。
7. conditionKey涵盖数据/机制/次数/统计量/版本；referenceCoverage覆盖提示/全解/表/静帧/视频结果。统一接触函数及提交同步检查，首答不倒改，重试/回退/旧导入不洗接触。stateVersion/dataHash校验，恢复草稿与接触并集、冻结提交去重，restoreExploration同步保存后重绘，恢复不增尝试/事件。
8. 三个主闭环是路径→均值、同均值路径→概率、无放回→删除对角及重新赋1/6。漏反向、误认均值等可能、无放回仍用旧规则分别有具体小步补讲及新题。前提链补明等可能/有序/平均/互斥/条件概率等；故事不虚构数学失效、历史或学习者内心，概率相等时不套“下降”结语。
9. 新明亮色表与程序实际接口对齐，X₁蓝圆、X₂紫方、统计量青菱身份稳定，正误只框/图标。手机专用构图、360/390宽、真实字号/对比、静帧/减少动态契约；旧深主题不冒称新Manim已支持。
10. plustts保留原双轨、每个等号/依据/数值听觉覆盖、顺序走位单、字符地板和1.2漏项提醒，明确偏好非科学阈值；纠正退回版“原版混读”叙述。模型断点审读按正文前提复算，研究不证明IQ/焦虑角色。外部文风/obra/emi根及适用正文完整读取，当前权限和用户要求优先；用户要求至通过时五轮为重新诊断，不是自动停止/交付。

## 参考同步

modes-and-explanations、teaching-design重写为保留原规格的生成配方；interactive-html保留当前有效接口和旧类型文档，定点更改默认并加入作者组件契约；visual-design换成采纳的明亮色表/对象和真实帧/手机要求；engagement-and-narrative保留真实事件/路径/回访接口，补三个数学循环及完整证明；provenance历史15活动明确仅兼容，Books written无文本框和本地原创适配分清；learning-evidence保留E/A/B证据层级并纠正取消字符地板；expert-review恢复普通断点审读与新实物要求；数学的冲突读法保留检索线索和原短幕职责。考纲与术语原有相关职责保留，本次未篡改当期考试事实。

## 完整阅读覆盖

baseline SKILL 按1–300、301–600、601–900、901–1200、1201–1500、1501–1800、1801–2050、2051–2230连续读完；六份原参考全部读完。设计报告的第一次批量输出含截断，随后original-skill-audit重新按1–100及101–124完整读取；其余设计报告无遗漏。interactive两版均连续分块读取。current modes/teaching/visual/engagement/expert/learning/math比较全文读完，provenance同原版全文。未声称本agent读取全部外部原技能/论文/DeepTutor源码，根代理另持这些审计。已完整读取两份skill-creator；本任务明确在用户Git项目修plugin，未执行个人技能安装路由，根负责最终Git同步。

| 输入 | 实读范围 | SHA-256 |
|---|---|---|
| `baseline/dialogue-tutor/SKILL.md` | 1–2230 | `3a4b7b2f1ea2ccf786931191a94cf45d32a5e625a9557583038f2275b4cd3f83` |
| `baseline/dialogue-tutor/references/deeptutor-provenance.md` | 1–142 | `353abdabb033d2848d8511feaa66366365e7383eb7514f4462b3397967af5dcf` |
| `baseline/dialogue-tutor/references/interactive-html.md` | 1–299 | `6373683da508983830f21c70334695d16432c39b05ae125642d49e0805284b6e` |
| `baseline/dialogue-tutor/references/learning-evidence.md` | 1–89 | `2bde7890ef84c39feed48ae2394a3e77336c396ec9f1de14bb3eb5027dd34ea0` |
| `baseline/dialogue-tutor/references/数学的冲突读法.md` | 1–129 | `b3476521c431911fe7df1b8f848eeec325d437341a6a8faa924f064e3eb95d7e` |
| `baseline/dialogue-tutor/references/统计术语中英对照.md` | 1–41 | `fa7bcec2d1b8f816a4de010a1bca1c5e6e79ff181a6229040103c85c8edc1ec8` |
| `baseline/dialogue-tutor/references/考纲与考试局.md` | 1–189 | `8c7aa306380f2938652a1d724072cdda863696f07a363acf6b0df48bd18b5c47` |
| `reviews/correction-design-brief.md` | 1–53 | `e75eef177794d4cc6f2da5b58ff48b7347477a0b79c38ad5c7b8e479559529ae` |
| `reviews/correction-original-skill-audit.md` | 1–124 | `2f14f119303574134957e90991f81a9c78cd970393ea3a8a8d33a1979e457fb6` |
| `reviews/correction-program-design.md` | 1–116 | `54aab3a32e532e1d46d2a748dae78aab6ae9045b9bd15bbe612f5c1f0bb8cdf8` |
| `reviews/correction-education-design.md` | 1–92 | `ba0d632ead60b96c32e20e0b8ae0c1e94d66fe6df6c4c79749d8975de6eb1a75` |
| `reviews/correction-color-design.md` | 1–133 | `0c413ee4ba055d56a353ec74d90e0409dbd497f81103952bc5c10debd78a4721` |
| `reviews/correction-game-design.md` | 1–94 | `79cb903b572af6aba35dc3ae1358aba6386f63a99a0b2096799918d77ece0364` |
| `reviews/correction-narrative-design.md` | 1–114 | `089be4bb8e8f1e5b35af693489c46758e21016644fe71a4f19cd9d219e2d5d41` |
| `reviews/correction-program-implementation.md` | 1–72 | `a77d42470753c7b3714147b3cef2621c08290d00e4cfd939606c6253f3b2786f` |

## 冻结文件身份

| 文件 | 行数 | SHA-256 |
|---|---|---|
| `repo/plugins/dialogue-tutor/skills/dialogue-tutor/SKILL.md` | 1–2278 | `27a31cfccb82663ad5c3df203fe75322394f09daa71e66901028e7404bfef0ba` |
| `repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/modes-and-explanations.md` | 1–26 | `5fe1ffd1a0dfae205cdfd532108fb2b3a55ba43ee39ee91df4d0b50922d23fa3` |
| `repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/teaching-design.md` | 1–51 | `98cb7c7cc02bc28e33c8c016fed1af5fb317539a166d017d2f80b6c9c9f1873e` |
| `repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/interactive-html.md` | 1–442 | `725399c9c1f10875fb797a4d644981e9462f083798e310ba16d2131cce1721ec` |
| `repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/visual-design.md` | 1–54 | `ad5f9c1665c918bc87986f3c18c1bcfe9bb8e1a83a2ddd30149ef6a223ddac69` |
| `repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/engagement-and-narrative.md` | 1–105 | `55e6684686e01be7e0deca729da04a2008329197595277665ddd73a96291b2b7` |
| `repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/deeptutor-provenance.md` | 1–150 | `695e62cb74fdba9c0cc026a3d00a018247a844620c6bfabcbc7bb6b074ee1f23` |
| `repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/learning-evidence.md` | 1–101 | `d6e77c4d91439580f16bdd577c7ecf1c83e56828e911193c2930299a82ec1a65` |
| `repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/expert-review.md` | 1–41 | `b5d2faebfbf97f84bf43492431f8d7e1c5ba9c451b009aad34472052f36037fb` |
| `repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/数学的冲突读法.md` | 1–123 | `c6d7d865543b1308d74aec7819f779ea01e236f84728eb01ebe1d98cd51af984` |

## 作者检查与剩余范围

已运行git diff --check，无空白错误；对新增默认、逐行/Manim、旧类型/主路径和伴读矛盾作定点文本检查。该检查不作为内容专家通过；未运行本agent课程生成、浏览器、Manim、TTS或真实学习测试。程序agent的实际no-typing/light/fragment接口已读其实施记录并在文档同步，程序单测结果不在这里冒领。

仍需独立专家审技能，再由独立作者生成完整新样章，实测全部主链/补讲、免打字/四组构造、Manim行帧数据对应、360/390可读性、接触时序和恢复。原文件含历史使用记录及待核史实，保持现行/历史分界；本次未对未采用的每个历史线索重新研究，不得据此称所有历史已核实。新作品不应照搬历史错误或用过往通过替代本轮证据。
