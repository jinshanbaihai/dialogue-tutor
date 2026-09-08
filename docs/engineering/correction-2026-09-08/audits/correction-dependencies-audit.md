# 外部依赖实际读取与 Manim 路由复核

复核日期：2026-09-08。只研究、读取和记录；本次未修改技能、未制作课件、未安装或渲染 Manim，也未继续派发代理。

比较对象是 `baseline/dialogue-tutor/SKILL.md` 的 §1.86（1182–1373 行）与 §8（1991–2010 行），以及当前 `repo/plugins/dialogue-tutor/skills/dialogue-tutor/`。当前仓库 HEAD 为 `699414fd63b1b2a2ed0d0dfb94ae5bb6dbd9f687`；检查时工作区干净。这里称“原版”的是本会话指定的 baseline，其中已经包含 2026-09-07 的交互改造，不能误称为 8 月的原始文本。

## Strengths：已经成立的部分

1. 原版把外部调用写成了进入点、读取位置、输入和返回物。它把文风、独立审读、界面动效与数学过程动画分开，因此可以指出每次调用究竟解决哪一种质量问题。它同时允许环境缺少依赖时继续工作，并要求如实记录，避免把未调用写成已调用。
2. Manim 路由提供了真正可以开始工作的材料：两份教程、可改写的 Python 场景、坐标与动画源码、文字排版、输出配置和配音接口。本次取到了这些实际文件，路径来自固定提交的目录树，不依赖同名技能的印象。
3. 当前改版保留了完整解答可查、数学条件核算、实际操作复核、`prefers-reduced-motion`、统一语义颜色和模型专家身份说明。`references/expert-review.md` 也保留先列优点、再列 Critical / Important / Minor，逐条核实意见和定向复审的骨架。这些保留具有实际价值。
4. 私有仓库访问成功。完整目录树有 1558 项，`truncated=false`；已获取的各文件与 Git tree 的 blob SHA-1 逐一一致，另记录 SHA-256。实际读取与获取覆盖分别列入 `research/dependencies/coverage-manifest.json`。

## Critical

本次读取范围没有发现可确认的数据损失或可运行代码破坏项。下面的问题影响原版要求的保存和下一步制作证据，因此列为 Important。

## Important

### I1. 当前入口没有承接五份具名依赖及其明确返回物

位置：原版 §1.86，尤其 1193–1208、1210–1369 行；当前 SKILL 第 77 行及当前技能目录全文搜索。

当前第 77 行只剩“外部板书处理、动画或写作技能仅在已提供且任务确实需要时使用”。当前目录中找不到 `writing-style`、`respectful-wording`、`obra-superpowers`、`emilkowalski-skills` 的调用路由；`manim` 只出现在 DeepTutor 截图来源文件名里。原版要求的三十三项文风检查、两份分开计数、Emil 的 Before / After / Why 表、Manim 的教程入口、动画加同源旁白、渲染失败分镜，均没有具名承接。

这不等于当前页面所有相应行为都失效。当前文件确实保留了并排讨论姿态、反馈、颜色和动效可访问性。缺失发生在生成规则：后来执行者不能从这句泛称知道去哪里读取、何时调用、要交回什么。用户若已明确替换某项要求，应记录被替换的具体项；“交互优先”本身并不决定取消外部文风或数学动画路线。

建议后续修订增加精确但简短的依赖表，并把深入路径放在专门参考中；每次作者记录填写实际读取、调用、返回物和未执行原因。复查方法是从一个空白任务只按当前技能入口行走，能否定位下面路由表中的每份文件与相应返回物。

### I2. Manim skill 文档已经到手，运行环境尚未具备

位置：`research/dependencies/environment-probe.json`。

本子任务探测时，`python3` 查不到 `manim` 和 `manimpango`，`manim` 命令也不存在；`uv`、`ffmpeg`、`latex` 可用，`dvisvgm` 未找到。读取 skill 不能替代安装 Python 引擎；当前也没有渲染日志、MP4 或帧图。因此此探测时点只能报告“依赖研究完成到列明范围”，不能据此报告“Manim 已可运行”或“动画已验证”。同轮另有 manim_runtime 子任务正在安装和实渲染；总体结论应采用该子任务后续的实际版本、日志和产物，这里保留原始探测记录。

取得的 `repos/manim/pyproject.toml` 声明 Manim `0.21.0`、Python `>=3.11`；PyPI 对应版本页面也存在。固定私有提交约束的是资料字节，尚未证明聚合源码与 PyPI 发布包完全相同。后续制作应记录实际安装版本和锁文件，先跑已有 `SquareToCircle`，再制作学科场景。公式路径还要验证 LaTeX 到 SVG 的完整链条，不能因为 `latex` 命令存在就当作公式排版可用。

### I3. “全部取回”和“全部语义读完”需要分别陈述

已取回 41 份实际文件，其中 37 份全文阅读、4 份 Manim API digest 按指定范围深入阅读。五份原版技能入口全文已读，两个 OpenAI 适配入口也全文已读。原版点名的 Manim quickstart、building_blocks、basic.py、using_text、configuration、voiceover guide / reference / quickstart 均已全文阅读。

`mobject-graphing.md`、`animation.md`、`mobject-text.md` 和补充的 `mobject-core.md` 已完整获取和校验字节，但其语义阅读只覆盖清单内行段：坐标与采样、面积及黎曼矩形、Axes 构造与坐标换算、BarChart 部分；Create / Write / FadeIn / FadeOut / Indicate / Transform 部分 / TransformMatchingTex / always_redraw；Text / MathTex / Tex 构造与子表达式；ValueTracker 部分。剩余源码没有逐行审读。符号搜索和文件哈希都不计为语义阅读。

如果验收条件是把这些大型 API 文件也一字不漏读完，本次尚未满足这一条；现有范围足以支撑本文引用的接口解释与下一步试跑设计，不能外推为整个 Manim 生态已完整研究。清单列出准确范围和所有未取路径，后续可以沿具体场景继续读取。

### I4. §8 的“每日简报三份”目前不能精确重建

原版 §8 还写“每日简报那三份是上位规格”，但该处未给三个文件名。实际取得 `plugins/ai-workspace/skills/daily-brief/SKILL.md` 后发现，它只是路由，正本指向 `$WORKSPACE/每日简报/SKILL.md` 和同目录 `00 使用说明.md`，正文在云盘。它另外点名 `references/讲师的位置.md`、`临终估算.md`、`悼词.md`，属于节目转向后的新文件；不能直接认定这三个就是 DialogueTutor §8 所指的三份。

本会话没有这些云盘正本，也不能访问其它对话的 Library 文件。该依赖目前属于“缺少具体正本”，而非“仓库连接失败”。先完成已可执行的五依赖研究，保留这一缺口；补读需要用户在当前会话提供所指正本或明确可访问的来源。

## Minor

1. **同名入口存在不同版本层。** `openai-skills/writing-style/SKILL.md` 只有薄适配规则，不含原版所引用的 §17 与 §19；完整原文在 `plugins/ai-workspace/skills/writing-style/SKILL.md`。respectful-wording 同样存在适配入口与完整原文。这是路径识别问题，后续调用记录应填写真实仓库路径，不能只写“已读 writing-style”。
2. **样例注释中的命令有误。** `repos/manim/example_scenes/basic.py` 开头写 `python --quality m manim -p example_scenes.py SquareToCircle`；`--quality` 属于 Manim 参数，不能放到 Python 自身参数位置。使用教程中的 `manim -ql 文件 Scene` 或 `python -m manim -ql 文件 Scene`。quickstart 还从 `main.py` 切换成 `scene.py`，执行时统一使用实际文件路径。
3. **Emil 的细则应保留适用面。** 原版“只动 transform 与 opacity”是教学卡片的收紧选择。实际 `animate/REFERENCE.md` 与 RECIPES 给手风琴的 height、clip-path、特定 toast 时长留了例外。它们也区分 UI 动效与解释过程；不能把 300ms 的 UI 预算套到数学动画，或把教学过程全部当成装饰而取消。
4. **OpenAI 薄适配器改变激活范围。** 它们明确说自身不是平台全局隐藏钩子；正文语气与写作作用面也有收窄。原版 DialogueTutor 的显式引用仍然是调用理由。审查应分别记录原版目标与平台适配，避免拿一个薄适配器宣称读过完整上位总纲。

## 准确路由与每次调用的作用

下面路径都相对本报告的 `research/dependencies/`；固定来源统一为 `jinshanbaihai/Claude-skills-private@fdcc83425e50f5ba5151f796795229139bc52239`。

| 依赖 | 实际入口与原版调用位置 | 为什么进入 | 交给它什么、应收到什么 | 当前改版保留与缺口 |
| --- | --- | --- | --- | --- |
| writing-style | `plugins/ai-workspace/skills/writing-style/SKILL.md`；原版 §1.85 第2关、§1.86一 | 检查依赖顺序、具体依据、新增信息、来源、语气与朗读可懂性。§17 是1–33编号并另加8b、8c；机械说成恰好33个动作会漏两项 | 完整初稿和plustts分段；逐条改动清单，搜索命中与修改数量，不能拿摘要替代全文 | 当前保留并排语气和术语说明；缺少全文入口、清单、事实/推导/猜测分级与朗读四条的具名检查 |
| respectful-wording | `plugins/ai-workspace/skills/respectful-wording/SKILL.md`，配 `scripts/单字检查.py`；原版 640、1048、1103、1132 行及 §1.86 | 把评价落在步骤和材料，避免预设学习者犯错；六类形式检查与最后一段重读 | 初稿及追问卡；六类扫描记录，单字脚本的待查项人工裁定，和writing-style分开计数 | 当前保留姿态；缺少明确外部入口、计数和脚本路线 |
| obra-superpowers | `cowork-bundles/obra-superpowers/SKILL.md` 全文，重点§0/§1；原版§1.85、§1.86二 | 用独立审读暴露作者自己补齐的前提；收到批评先核实，再修改或有依据反驳 | 章节HTML、相应讲稿、已建立前提、任务与范围、报告路径/模型；追问、裁定、修复后逐步复算与末轮清单 | 当前expert-review保留C/I/M与定向复核；普通课程的外部独立学习者审读、五轮记录、具名文件路由没有保留。是否改变触发条件应单独裁定 |
| emilkowalski-skills | `cowork-bundles/emilkowalski-skills/SKILL.md` → `skills/emil-design-eng/REFERENCE.md` → 需要新增动效时 `skills/animate/REFERENCE.md`，对应组件再读 `RECIPES.md` | 先确定动效频率与作用，再选工具、属性、速度、退出和减少动效版本；避免操作等待和视觉负担 | 实际HTML/CSS/JS与操作上下文；审核时返回Before / After / Why表，新建时返回实现、频次/用途/参数与需实际体会的检查 | 当前visual-design保留语义色与reduced-motion；缺少实际路由、频次判定、参数和三列表 |
| manim | `cowork-bundles/manim/SKILL.md` → 下列CE文档；原版§1.86四 | 让同一个数学对象的连续变化可见，并与学科说明对应。原版9月基线允许参数探索用HTML、离散推导用steps、固定形状用SVG/MathML | 数学定义、有效区间、参数轨迹、逐步依据、时长、旁白段；Python场景、渲染MP4、同源旁白；失败时逐镜分镜与“未渲染”说明 | 当前HTML互动/静图继续可用；没有命名Manim的载体选择、实际渲染或失败交付路径 |

Obra 下游准确文件（本次全部取得并全文阅读）：

- `skills/obra-requesting-code-review/REFERENCE.md` 与 `code-reviewer.md`：前者派任务，后者规定只读审查、先优点、C/I/M、建议和结论。
- `skills/obra-receiving-code-review/REFERENCE.md`：读完、复述、核实、判断、技术回应、逐项实施。
- `skills/obra-subagent-driven-development/REFERENCE.md` 与 `implementer-prompt.md`、`task-reviewer-prompt.md`、`re-review-prompt.md`：首次审核与定向复审分开；修复轮包括修复和复审；模型选择显式记录；分配的审查者不继续派发。
- `skills/obra-dispatching-parallel-agents/REFERENCE.md`：只把互不依赖的工作并行化。
- `skills/obra-verification-before-completion/REFERENCE.md`：证据先于完成宣称。

这些是本次审查的源材料，里面宣称的自主性优先级只约束它自己的包；不会增加本任务的外部写入授权，也没有据此触发安装、推送、合并或额外代理。

Manim 下游准确文件（相对 `cowork-bundles/manim/`）：

| 文件 | 实际学到的接口与限制 | 阅读状态 |
| --- | --- | --- |
| `repos/manim/docs/tutorials/quickstart.rst` | `Scene.construct`组织对象；`self.play`播放；`.animate`插值端点状态，旋转可能需要`Rotate`；`Transform`保留原对象身份，`ReplacementTransform`替换身份 | 全文 |
| `repos/manim/docs/tutorials/building_blocks.rst` | Mobject / Animation / Scene职责；`add/remove/play/wait`；默认原点在画面中央；对象加入顺序影响前后层；自定义动画需要正确应用rate_func | 全文 |
| `repos/manim/example_scenes/basic.py` | 可运行的几何/公式/网格与updater场景；可先用无公式的SquareToCircle检查安装 | 全文 |
| `repos/manim/docs/guides/using_text.rst` | 中文普通文字走Pango Text；公式走MathTex/Tex；字体需实际存在；公式片段用isolate或双大括号，精确映射再变换；新版本还提供Typst路径 | 全文 |
| `repos/manim/api/mobject-text.md` | Text的对象切片与t2c索引对空白处理不同；MathTex默认align*，Tex默认center；LaTeX会先编译SVG | 指定范围，非整份 |
| `repos/manim/api/mobject-graphing.md` | Axes的坐标要经c2p映射到画面；plot依赖等距采样和插值，视觉曲线不能充当精确数学证明；get_area返回多边形，概率值应从学科公式计算 | 指定范围，非整份 |
| `repos/manim/api/animation.md` | Create显现轮廓、Write按对象长短设时长；FadeIn可加位移；Indicate暂时缩放/变色；always_redraw每帧重建；TransformMatchingTex按tex_string匹配 | 指定范围，非整份 |
| `repos/manim/docs/guides/configuration.rst`；`repos/manim/api/config.md` | CLI / 配置文件 / Python config优先级；默认Cairo；CE自身可切OpenGL；get_dir按module_name与质量解析路径；透明输出可能改成mov/webm，dry_run不写视频；实际命令要指向真实文件和Scene | 全文 |
| `repos/manim/docs/guides/add_voiceovers.rst`；`repos/manim-voiceover/REFERENCE.md`；`repos/manim-voiceover/docs/quickstart.rst` | VoiceoverScene、speech service、with voiceover、tracker.duration、字幕和bookmarks；外部TTS服务有网络/凭据条件，文本旁白稿与已合成音频分别记录 | 全文 |

补读了 `repos/manim/docs/installation.rst`、实际扩展名为 `.md` 的 `docs/installation/uv.md`、`docs/tutorials/output_and_config.rst`、`pyproject.toml`、voiceover安装文档，以及core digest里的ValueTracker指定行段。`uv.rst` 不存在；采用Git tree证实的 `uv.md`。

§8 的其它动作仍有边界：板书长图路线是 `classin-whiteboard-notes`，本次已经取读其完整入口，得到切片、保留重叠、按次序转写的理由；它的Notion/Drive归档规则还指向未提供ID的上位协约，并非本次研究要执行的动作。收作业、转写、错题入库在原版§8没有给出精确入口路径；实际树中有homework-spec / mistake-log，但本次未宣称读过或执行。

## 3Blue1Brown 关系的官方核对

3Blue1Brown官方 About FAQ 说明 Grant Sanderson 使用自己编写并继续开发的Manim，并建议刚入门的人从更稳定、文档和测试更齐的Community Edition开始。它还强调每次移动应有目的、视觉和旁白应表达同一点。[官方About](https://www.3blue1brown.com/about/)

| 路线 | 仓库 / 安装包 | 代码特征 | 本次私有skill是否采用 |
| --- | --- | --- | --- |
| Manim Community Edition | ManimCommunity/manim；PyPI `manim` | `from manim import *`；常用`manim -ql 文件 Scene` | 是。入口明确写社区版生态，basic.py与pyproject一致 |
| ManimGL | 3b1b/manim；PyPI `manimgl` | `from manimlib import *`；`manimgl 文件 Scene`；写视频参数与CE不同 | 否。本次并未取得它的源码作为私有skill正文 |
| 历史ManimCairo | 3b1b/manim的旧cairo-backend | 常见`from manimlib.imports import *`，用于旧项目复现 | 否 |

官方依据：[CE版本FAQ](https://docs.manim.community/en/stable/faq/installation.html#why-are-there-different-versions-of-manim)、[3b1b仓库README](https://github.com/3b1b/manim)、[3Blue1Brown制作演示](https://www.3blue1brown.com/lessons/manim-demo/)。CE自身也有OpenGL渲染路线，因此“CE与GL”不能简化成“CE只用CPU、GL才用GPU”。

能够确认的是：Manim起源于Grant，CE是社区分支，Grant确实建议初学者从CE开始。私有仓库里的`manim`是作者把社区资料聚合成的技能包；本次来源没有证明Grant或ManimCommunity认证了这份skill。它也不会自动获得3Blue1Brown视频的叙事质量或原片使用权。

## 下一步实际作图需要的输入、输出和命令

输入先确定一张图解决的具体问题，给出数学定义、坐标范围、边界和单位、变化参数及合法值、颜色与符号对应、每镜开始/结束状态、每步凭据、时长和对应旁白。若是密度面积与CDF同动，两个视图共用一个参数，CDF数值来自明确积分表达式；坐标缩放后的画面面积不能直接代替概率。若参数应由学习者选择，保留HTML控件；MP4可作为观看连续过程的补充。

输出记录至少含：`scene.py`、渲染所用Manim版本/环境锁、分镜与同源旁白、MP4实际路径、渲染日志、关键帧/逐段检查结果。动画通过后再放回页面，提供暂停与重播；静态末帧不能冒充视频。plustts里的动画旁白与对应学科分段使用同一份文字。若只生成旁白文本，应明确写“文字稿”，不写成已配音。

下面为**下一步执行命令，尚未在本次运行**。先在独立项目安装与检查；Linux系统依赖按已读安装文档补齐，本子任务探测时还缺manim/manimpango及dvisvgm，后续状态以 manim_runtime 的记录为准。版本0.21.0与取回的pyproject相符，[PyPI版本页](https://pypi.org/project/manim/0.21.0/)可查。

```bash
uv init --python 3.12 manim-audit-smoke
cd manim-audit-smoke
uv add 'manim==0.21.0'
uv run manim --version
uv run manim checkhealth
uv run manim -ql /workspace/scratch/b4c4b2db70f4/research/dependencies/cowork-bundles/manim/repos/manim/example_scenes/basic.py SquareToCircle --media_dir /workspace/scratch/b4c4b2db70f4/research/manim-render-check
```

该命令成功时，标准输出布局应产生 `research/manim-render-check/videos/basic/480p15/SquareToCircle.mp4`；实际以日志和文件存在性核对。它只测试引擎及几何动画，不能验证MathTex、中文字体或旁白。随后对实际学科scene先低质量渲染，再按需用 `-qm` 或明确 `-r 1920,1080 --fps 30`；不要将未执行命令记为测试结果。voiceover额外需要选定可用语音服务并验证其网络/凭据，当前研究没有调用服务。

## Recommendations 与 Assessment

建议先让恢复方案承接具名路由和真实返回物，再决定某个学习过程用HTML探索、离散步进或Manim连续动画。原版已经给出载体选择空间，恢复调用路径与保留交互优先可以同时成立。

本次依赖研究已完成五份核心入口与列明教程/参考的实际获取和全文阅读；四份API保留准确的定向阅读范围。本报告没有覆盖全部API逐行阅读，也没有取得每日简报云盘正本；实际Manim安装和渲染由同轮 manim_runtime 子任务另行提供证据。适用API的定向阅读已经明确记录，不能将未读的其余源码称作已读。当前候选技能的外部调用承接需要修订或逐项说明替换决定，才能宣称原有依赖规范已经保留。
