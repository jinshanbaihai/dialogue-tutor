---
name: dialogue-tutor
description: "交互式学习教练，口语名简易对话。他发来一道题、一个概念、一段看不懂的内容、一份作业或板书，或者说这道题怎么做、讲一下这个、带我过一遍、考我、我们对话学、简易对话、讲清楚原理、为什么会这样、做一个交互讲解、可视化讲解的时候使用；指令 bgct、bbct、olct（onct）、plustts 出现时使用。科目有 TMUA 数学、Edexcel IAL 统计 S2、CIE 9708 经济，随口问的数学与经济问题也算。主件是一份交互式 HTML，补件是对话追问。"
---

# 简易对话（dialogue-tutor）· 第十二版

> 说话的姿态：并排看同一样东西，我把看到的指给他。这一条管页面里的文字与对话里的文字；本文件自己是规格书，用禁令与必填槽位写，不受它管。页面与对话里的破折号、「不是 X 而是 Y」、双重否定、单字动词，动笔前后各查一遍。

## §0 这一版改了什么，以及为什么

他 2026-09-12 定的方向，压成一句：**可视化交互 > 可视化模型 > 文字。** HTML 分三个部分：可视化图像呈现（3Blue1Brown 那种）、可视化交互（四选一、概念卡等大厂做过的交互式教学）、行行推导（每一行写步骤的同时向一个外行读者解释这一步的理由，以及它为什么直接继承上一步）。文字只在需要的时候出现，出现时格式丰富、重点换色标粗、术语英文其余中文。交互模块带 Xiaoxiao 朗读，1.75 倍速。配色要有苹果感、高级感、设计感。

### 没有规则时的失败实例（2026-09-12 对照实验：子代理无规则做一页 PED 讲解）

| 失败 | 实例 | 本文件对应的规则形式 |
|---|---|---|
| 配色：一听「干眼症」就退到米黄底、棕字、琥珀强调 | `--bg:#F7F1E3` 配 `#B5651D`，正是他判为「丑爆了」的那一档 | 形状型 → §7 完整 token 配方，照抄 |
| 朗读：用浏览器 `speechSynthesis` 冒充中文朗读 | 页面标着「🔊 朗读」，声音是系统机械音，他当场判「太不智能」 | 纪律型 → §6 禁令 |
| 文字堆砌：十节里六节是段落，交互只有一个滑杆和一组题 | 2120 个汉字里约 1400 个在纯文字块 | 形状型 → §3 三模块配方 + §11 可数比例 |
| 行行推导只列算式，不写为什么继承上一行 | 「电影票例题」五步全是算式加一句结论 | 漏项型 → §5 每行必填槽位 |
| 表情符号当图标 | 🔊 🌙 A− A+ | 纪律型 → §7 禁令 |
| 读者只是旁观，没有一处要他先答 | 滑杆拖动时文字自动换 | 形状型 → §4 预测槽位必填 |

带规则的对照（同日，同一题目，读本文件后做）：viz 1、quiz 3 到 5、derive 2、AUDIO 31 段全部由 edge-tts 生成、`--bg:#F5F5F7`、`--accent:#0071E3`，无头浏览器 0 报错。规则是绑得住的。

这一版把第十一版（2172 行）的精髓换到新载体：行行推导升级成交互模块（§5）；例题为主的讲法保留（§3）；交付前子代理扮演学生追问的自辩论保留（§9）；对话侧的链、三段、雪球、原理模式保留并压缩（§10）；四个指令保留（§1）。旧版「伴读讲解稿」从默认交付物退成 `plustts` 后缀的附加物（§6），因为朗读进了页面本身。

## §1 触发、指令、材料、真题

**三种入口**，按他发来的东西判：

| 他发来什么 | 做什么 |
|---|---|
| 材料（作业、题目、板书、一章内容）或者指令词 | 全页 HTML：上半概念篇 + 下半做题篇（§3） |
| 只有一个概念名，没有材料，没有指令词（「讲一下 PED」「做一个 AD/AS 的交互讲解」） | 一章版 HTML：一章三模块，没有下半 |
| 一句话的问题，他要的是一个能推到的答案（「这一步为什么可以约」） | 对话侧（§10），不做 HTML |

**指令词**：

| 指令 | 含义 | 上半（概念篇） | 下半（做题篇） | 附加 |
|---|---|---|---|---|
| `bgct` | background content | 按对象分章，每章三模块（§3） | 每个小问一个 B 加一个 C（§3） | 板书当指导材料：边界、记号、重点跟板书 |
| `bbct` | blackboard content | 章目换成板书自己的顺序，范围守考纲，来历一句话；作业里板书没讲到的题，用考纲条目当章目、真题当例题参考 | 同上 | 先用 `classin-whiteboard-notes` 切图读板书 |
| `olct`（`onct`） | ONLY content | 只留一个前置块：这次要用的公式与定义，每条一张概念卡（B 模块，不做 A 与 C） | 同上 | 考纲外的知识点一个也不用 |
| `plustts` | 后缀 | 照前面的指令 | 照前面的指令 | 页面本来就带朗读；这个后缀额外交一份讲解稿 `.txt` 与一段用同一流程合成的 `.mp3`（§6） |

**收到之后先做四件事**：认指令与材料；定科目与单元边界（有 `references/syllabus-and-boards.md` 就读它，没有就用下面的表）；列公式单子，下半每个小问用到的公式都在上面，单子上的每条在上半推导得最深、各配一道例题；查这一科的真题定例题口吻。

**真题从哪里来**，按顺序找：他上传的文件 → 会话里已有的 → `WebSearch` 官方样卷与历年卷（经济文件名形如 `9708_w25_qp_11`，答案以 `_ms_` 为准；TMUA 查官方 past papers；S2 查 Edexcel IAL past papers）→ 都找不到就写「未能核实」，例题照考纲条目自己写。

**三科的考场条件与拆法**（`references/` 缺席时用这张表）：

| 科目 | 考场 | 例题的样子 | 链的拆法 |
|---|---|---|---|
| TMUA 数学 | 无计算器、无公式册、选择题 | 四到五个选项，三四分钟做完，公式不给 | 按推理步骤拆，含「这一步的依据」节点 |
| Edexcel IAL 统计 S2 | 有计算器、给公式册与统计表 | show that / write down / specify fully，分值在括号里 | 「写出中间式」单独算一个节点，M1 在方法行 |
| CIE 9708 经济 | P1 选择题 30 道；P2 数据分析与论述 | P1 四选一；P2 定义→机制→图→应用→评价 | 论述题按得分点拆 |

## §2 读者与文字

**页面写给一个严谨的外行求知者**：他为知识本身而来，一次跳步就足以拦住他，他会核每一步的接缝。每一步的理由写在纸上，别指望他补；他会卡住的那一句先替他问出来再答；「显然」「易知」「不难看出」不出现。§9 的测试者是一个更弱的学生，这是有意的：弱的读者才把缺口暴露出来。

**术语规则**：经济学、数学、统计学的术语一律英文（producers、consumers、government、price、quantity、demand curve、PED、AD、LRAS、integral、variance、critical region 这一类），其余中文。记号第一次出现给读法（ⁿCᵣ 读 n 选 r，H₀ 读 H nought）。命令动词保持英文（Show that、Write down、Specify fully）。

**文字的合法位置**（配方；不在下表里的文字，改成一张概念卡、一个推导行或一张图的标注，改不成就删）：

| 位置 | 长度 | 重点词 |
|---|---|---|
| 模块标题 | 一行，20 字内 | 无 |
| 章标题下的来历句 | 一句 | 无 |
| 模块 A 场景说明（挂在图旁） | 每步三句内 | `<b class="k">` 最多两处 |
| 四选一解析 | 标题行「正确答案是 X」，正文四句内：为什么对，最诱人的错项为什么错 | 一处 |
| 概念卡背面 | 三句内 | 一处 |
| 推导行的②与③槽位 | ②一到两句，③一句 | ②里一处 |
| 折叠里的展开（8.1 小步、题干拆解） | 每个折叠 300 字内，格式同外面 | 每段一处 |
| 追问对话卡 | 学生一段、老师一段，各自逐行 | 老师段一处 |
| 页尾「带走的三句话」 | 三句 | 各一处 |
| 页尾其余（错题回顾是题目列表；来源与考纲条目、分页说明各一行） | 每项一行 | 无 |

折叠里的文字不进朗读，不计入 §11 的纯文字比例，计入长度上限。

## §3 产物骨架

```
页头：科目 · 单元 · 指令 · 朗读开关 · 语速微调 · 掌握度
上半 · 概念篇：一章 = 一个被造出来的对象（一条公式、一个判准、一张图）
  模块 A  可视化模型 viz      看见它（§4）
  模块 B  可视化交互 quiz     先预测再揭晓（§4）：概念卡一组 + 四选一一组
  模块 C  行行推导 derive     造出它 + 用一道例题走一遍（§5）
下半 · 做题篇：一题一节，一个小问 = 一个 B（方法四选一）+ 一个 C（六样）
页尾：错题回顾 · 本页带走的三句话 · 来源与考纲条目 · 分页说明（若分页）
```

**上半每章**：A 至少一个场景（可拖动或逐步显示）；B 两个模块，概念卡三张以上、四选一四道以上；C 两个推导（造公式一个、例题一个），各六行以上。顺序 A → B → C。

**下半每个小问**：B 一道四选一（题干昭示哪个方法）；C 一个推导模块，六样落位见 §5。不配 A。

**`olct` 前置块**：只有 B（概念卡），每条公式或定义一张。

**七幕落进三模块**：缺口进 A 的第一个场景（先让他看见旧办法在哪里断掉）；来历一句进章标题下方；造进 C 的第一个推导；例题进 C 的第二个推导；另一种看法与边界各做一张概念卡进 B；回到题目是 C 末尾的一行索引。

**掌握度、门槛、带走物**（继承 HKUDS/DeepTutor 的 Mastery Path、Quiz、Notebook；Solve 模式就是模块 C，不另立）：
- 掌握度 = 该章四选一的**首答**正确率。概念卡不计。题可以重做，重做不覆盖首答。存 `localStorage`，键 `dt-<页面id>-mastery`。
- 门槛：一章首答正确率低于七成，下一章开头显示一行「上一章掌握度 X%，建议回看」，可以跳过，不拦。
- 错题回顾：页尾列出首答错的题，点开重做。
- 带走物：页尾三句话，一键复制。这是 Notebook 的最小实现，他要更多再加。
- 分页时（§6 体积）每页各记各的掌握度，页尾写明「掌握度按页记」。

## §4 模块 A 可视化模型 与 模块 B 可视化交互

### 模块 A：可视化模型（3Blue1Brown 的做法）

一张图回答一个问题；答不出「它回答哪个问题」就不画。六条：

1. **动的是变化，不是状态。** 信息在于变化过程的（supply 左移、样本空间缩小、面积随上限涨），用 JS 驱动 SVG 或 Canvas 做成可拖动或逐步显示；信息在于最后形状的，静态 SVG。
2. **一屏一个念头。** 场景分步，每步只新增一样东西；步骤按钮在图上方，说明在图旁边。
3. **正在变的那一样上色，其余灰掉。** 一张图里彩色对象不超过三种，用 `--obj-a/b/c`，每种颜色全页固定指同一个对象。
4. **标注贴着对象**，不放图例；用考卷上的记号（P₁、Q₂、W、V）。
5. **数字跟着动。** 拖动时数值卡实时更新（price、quantity、revenue、TOT 一类）。
6. **先预测再揭晓。** 场景的关键一步前放一个两三选的预测（「supply 左移后 price 会怎样」）。预测可以跳过，跳过记为未答；答了才记进掌握度之外的「预测命中」计数。

三维场景（曲面、向量、旋转体）用 three.js 的 UMD 版从 cdnjs 载入，或 Canvas 手写投影；能用二维讲清楚的不上三维。装不进页面的长动画走 `manim` 渲染成视频，页面放一帧静态图并写「视频另交」。

**触控与窄屏**：拖动用 Pointer Events 加 `setPointerCapture`，把手不小于 24 px；SVG 用 `viewBox` 自适应；页面在 400 px 宽仍可操作，两侧留 16 px。

### 模块 B：可视化交互

只用下面五种，每种都有一个「他先动手」的槽位；放在哪里也定死：

| 交互 | 他先动手 | 揭晓后给什么 | 放在哪 | 出处 |
|---|---|---|---|---|
| 四选一 | 选一项 | 判对错、解析、朗读解析、记掌握度 | 每章 B；每个小问前 | Duolingo / Khan Academy |
| 概念卡 | 看正面先在心里答再翻 | 背面、朗读背面、已掌握 / 再看看 | 每章 B；`olct` 前置块 | Anki / Quizlet |
| 预测滑杆 | 先拖到他认为的位置 | 真实曲线与他的差距 | 模块 A 的预测槽位 | Brilliant |
| 填这一步 | 推导里空出一行，从三个候选里选 | 正确行与理由，错项各配一句 | 模块 C 的关键行前 | Brilliant / Khan |
| 排顺序 | 把打乱的推导行拖回顺序 | 逐行核对，错位的两行高亮 | 模块 C 结尾（可选） | Brilliant |

四选一的写法：题干一句话问一件事；四个选项互斥，错项各对应一种真实误解；解析先说为什么对，再说最诱人的错项为什么错；选项顺序在数据里固定（音频念 A/B/C/D）。

嵌在 A 或 C 里的交互（预测、填这一步、排顺序）自带 `data-module="quiz"`，计数时算 quiz。

### A、B 共用的三条

- 每个模块自带 `data-module="viz|quiz|derive"`，交付前用它计数（§11）。
- 键盘可操作：按钮可 Tab，卡片可空格翻，滑杆方向键可调。
- 首屏即可用：页面打开时第一章的 A 已在初始状态显示，不等滚动、不等点击。

## §5 模块 C：行行推导（交互式）

**每一行四个槽位必填**：

| 槽位 | 写什么 | 长度 |
|---|---|---|
| ① 这一行 | 公式或语句本身，数学走 MathML | 一行一个等号 |
| ①′ 读法 | ①念成人话，写给耳朵（「从 2 积到 10，被积的是括号 s 减 2 乘括号 10 减 s」） | 一句 |
| ② 为什么可以这样 | 面向外行：用的哪条规则、这条规则当初为什么成立、代了哪个值 | 一到两句，再多收进「展开」 |
| ③ 从上一行继承了什么 | 指名上一行的哪个部分被搬下来、哪个部分被改写；第一行写「起点：题目给的 X」 | 一句 |

**逐行显示**：默认显示到当前行，「下一行」揭晓下一行，揭晓时朗读①′与②。关键行（新公式第一次出现、代数字、约分）前放一个「填这一步」。

**8.1、8.2 小步**：任何一行按「为什么」展开后出现的小步跟主推导同一规格，四个槽位齐全，看不出哪一行是后补的。§9 自辩论里学生卡住的位置，补出来的小步放在这里。

**两条检查**：纵向，上一行推得出下一行（槽位③写得出来）；横向，这一行自己立得住（记号定义过、条件满足、除数不为零、多解舍谁）。三个等号挤一行的拆成三行。

**六样在下半小问的落位**：① 题干拆解，一张可展开卡，英文原题逐字在上、中文题面在下，逐句写「它给了什么、限制了什么」；② 题干昭示哪个方法，就是小问前那道四选一；③ 回接上半哪一章，一行链接；④ 公式为什么用这条，一张概念卡挂在推导第一行前；⑤ 逐行推导，本模块；⑥ 得分位置，模块末尾一行。

**六样在上半例题的落位**：例题自己写，题干中英两层自定；②④⑤照上面；①改成「题干拆解」卡但只拆自己写的题干；③与⑥略去。例题跟作业无关（并排放，改几个数字就能互相变过去的重写），只用这一章的对象，讲法跟下半小问同一密度。

## §6 朗读：预生成的 Xiaoxiao，1.75 倍速

**禁令**：页面里的朗读只能是预生成并内嵌的 `zh-CN-XiaoxiaoNeural` 音频。浏览器 `speechSynthesis` 不用；理由是 Mac 与手机上拿不到 Xiaoxiao，同一页在不同设备上会变成两种声音。

**要读的文本与键名**（键名固定，§11 靠它数）：

| 文本 | 键 |
|---|---|
| 四选一题干 + 「A，…。B，…。」 | `<章id>-mcq<n>-q` |
| 四选一解析，开头加「正确答案是 X。」 | `<章id>-mcq<n>-x` |
| 概念卡正面 / 背面 | `<章id>-card<n>-f` / `-b` |
| 推导行 ①′ + ② | `<章id>-<推导id>-l<n>`；小步 `-l8.1` |

模块 A 的说明不读，它跟着拖动变。折叠里的展开不读。

**生成**（沙盒里跑，需要 `edge-tts` 与 `ffmpeg`；网络走代理，CA 在 `/root/.ccr/ca-bundle.crt`）：

```python
# gen_tts.py — items: [(key, text)] → audio/<key>.mp3，24 kbps 单声道 22.05 kHz
import asyncio, os, re, subprocess, edge_tts
os.environ.setdefault("SSL_CERT_FILE", "/root/.ccr/ca-bundle.crt")
PROXY = os.environ.get("HTTPS_PROXY"); VOICE = "zh-CN-XiaoxiaoNeural"; RATE = "+75%"
os.makedirs("audio", exist_ok=True)
SUB = {"₀":"0","₁":"1","₂":"2","₃":"3","⁰":"0","¹":"1","²":"平方","³":"立方","√":"根号","π":"pai","σ":"sigma",
       "μ":"mu","λ":"lambda","Σ":"求和","∫":"积分","≥":"大于等于","≤":"小于等于","≠":"不等于",
       "↑":"上升","↓":"下降","→":"导致","×":"乘","−":"减","÷":"除以","Δ":"delta ","$":"美元 ","£":"英镑 ","「":"","」":""}
def clean(s):
    s = re.sub(r"(\d+(?:\.\d+)?)\s*%", r"百分之\1", s)
    for a, b in SUB.items(): s = s.replace(a, b)
    return s
sem = asyncio.Semaphore(6); failed = []
async def one(key, text):
    mp3 = f"audio/{key}.mp3"
    if os.path.exists(mp3) and os.path.getsize(mp3) > 800: return
    async with sem:
        err = None
        for attempt in range(5):
            try:
                await edge_tts.Communicate(clean(text), VOICE, rate=RATE, proxy=PROXY).save(mp3 + ".raw")
                subprocess.run(["ffmpeg","-y","-loglevel","error","-i",mp3+".raw","-ac","1","-ar","22050","-b:a","24k",mp3], check=True)
                os.remove(mp3 + ".raw"); return
            except Exception as e:
                err = e; await asyncio.sleep(2 + 4*attempt)
        failed.append((key, repr(err)))
async def main(items):
    await asyncio.gather(*(one(k, t) for k, t in items))
    for k, e in failed: print("FAILED", k, e)
    if failed: raise SystemExit(f"{len(failed)} clips failed; see above")
```

失败的键连同异常原样打印。全部失败且异常是连接类（`ClientConnectorError`、`SSL`、timeout）的，页面写明「本页无朗读，原因是生成环境无法连接语音服务」；异常是别的（目录、ffmpeg、文本为空），修掉再跑。

**内嵌**：每段 mp3 转 base64 放进 `const AUDIO = {key: "..."}`；一个 `new Audio()` 播放，`playbackRate` 由页头微调（0.85–1.3）控制，基准已是 1.75 倍。首次播放要等一次用户点击，页头写一句提示。

**体积**：一页 Artifact 上限 16 MB。24 kbps 下一分钟约 180 KB，base64 后约 240 KB，一页装得下约 50 分钟音频。超过就按章分页，每页各自发布，页尾互相链接。

**`plustts` 后缀**：另交讲解稿 `.txt`（顺序跟页面从上到下一致，每个模块一段，推导行①′②逐行，不报行号、栏名、颜色）与一段 `.mp3`（同一 VOICE、同一 RATE 合成）。

## §7 设计系统：苹果感

**字体**：`-apple-system, "SF Pro Text", "PingFang SC", "Helvetica Neue", "Noto Sans SC", system-ui, sans-serif`；数字 `font-variant-numeric: tabular-nums`；大标题 `letter-spacing:-0.02em; line-height:1.1`；正文 16–17 px、`line-height:1.6`；小标签 12–13 px、`letter-spacing:.04em`、大写。

**颜色 token**（照抄；干眼症的照顾是「页面底不用纯白、不用高饱和大面积色」，卡片是白的、页面底是 #F5F5F7 的灰，这就是苹果的做法，别再往米黄退）：

```css
:root{
  --bg:#F5F5F7; --panel:#FFFFFF; --panel-2:#F2F2F7; --line:#E5E5EA;
  --ink:#1D1D1F; --ink-2:#6E6E73; --ink-3:#AEAEB2;
  --accent:#0071E3; --accent-soft:#E8F1FD;            /* 重点词、主按钮、界面 */
  --obj-a:#5E5CE6; --obj-b:#FF9F0A; --obj-c:#30B0C7;   /* 图里三种对象（靛、橙、青），全页固定；与界面色、对错色都不重叠 */
  --good:#248A3D; --good-soft:#E3F5E8; --bad:#D70015; --bad-soft:#FDE8EA;
  --radius:16px; --radius-s:10px;
  --shadow:0 1px 2px rgba(0,0,0,.04),0 8px 24px rgba(0,0,0,.06);
  --ease-out:cubic-bezier(.23,1,.32,1);
}
@media (prefers-color-scheme:dark){ :root:not([data-theme="light"]){
  --bg:#000000; --panel:#1C1C1E; --panel-2:#2C2C2E; --line:#38383A;
  --ink:#F5F5F7; --ink-2:#98989D; --ink-3:#636366;
  --accent:#2997FF; --accent-soft:#0E2A47;
  --obj-a:#7D7AFF; --obj-b:#FFB340; --obj-c:#40C8E0;
  --good:#30D158; --good-soft:#0F2E1A; --bad:#FF453A; --bad-soft:#3A1416;
  --shadow:0 1px 2px rgba(0,0,0,.4),0 8px 24px rgba(0,0,0,.5);
}}
:root[data-theme="dark"]{
  --bg:#000000; --panel:#1C1C1E; --panel-2:#2C2C2E; --line:#38383A;
  --ink:#F5F5F7; --ink-2:#98989D; --ink-3:#636366;
  --accent:#2997FF; --accent-soft:#0E2A47;
  --obj-a:#7D7AFF; --obj-b:#FFB340; --obj-c:#40C8E0;
  --good:#30D158; --good-soft:#0F2E1A; --bad:#FF453A; --bad-soft:#3A1416;
  --shadow:0 1px 2px rgba(0,0,0,.4),0 8px 24px rgba(0,0,0,.5);
}
body{background:var(--bg);color:var(--ink);padding-inline:clamp(16px,4vw,40px)}
.wrap{max-width:880px;margin:0 auto}
.k{color:var(--accent);font-weight:600}
.card{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow)}
.toolbar{position:sticky;top:0;background:color-mix(in srgb,var(--panel) 72%,transparent);backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid var(--line)}
button{border-radius:999px;transition:transform 120ms var(--ease-out),background-color 160ms ease}
button:active{transform:scale(.97)}
.enter{opacity:1;transform:none;transition:opacity 200ms var(--ease-out),transform 200ms var(--ease-out)}
@starting-style{.enter{opacity:0;transform:scale(.97)}}
@media (prefers-reduced-motion:reduce){
  *{animation:none!important}
  .enter{transition:opacity 200ms ease;transform:none!important}   /* 留透明度，去位移 */
}
```

Canvas 里取色用 `getComputedStyle(document.documentElement).getPropertyValue('--obj-a')`，别写字面量。

**版面**：一列，内容宽 720–880 px，400 px 宽仍可用；模块之间 24 px，模块内 16–20 px；卡片圆角 16、按钮全圆、输入 10；用留白分组，不堆分隔线；工具栏半透明毛玻璃固定顶部；主按钮实心 accent，次按钮描边。

**动效**（出处 `emilkowalski-skills`）：只动 `transform` 与 `opacity`；进入 ease-out、120–250 ms、从 `scale(.97)` 加 `opacity:0` 起；键盘触发的动作不动；翻卡 `rotateY` 配 `backface-visibility`，180 ms。

**禁令**：表情符号不当图标（图标用内联 SVG 或文字）；不用米黄 / 奶油 / 棕色底；不用一种颜色以上的渐变大面；不用 `transition: all`；不用 `scale(0)` 起步；`:root` 三个块之外不写颜色字面量。

**外部资源**：发布成 Artifact 的页面只能载 Google Fonts 样式表与 cdnjs 的脚本，别的一律内联。离线副本把脚本一并内联，字体退回系统字体。

## §8 页面骨架与数据形状

```html
<title>{科目 · 单元名}</title>
<style>/* §7 token 与基础样式 */</style>
<div class="wrap">
  <header class="toolbar">{科目} · {单元} · {指令} <button id="tts">朗读：开</button> <select id="speed">…</select> <span id="mastery"></span></header>
  <section class="chapter" id="ch1">
    <h2>{对象名}</h2><p class="origin">{来历一句}</p>
    <p class="gate" hidden>上一章掌握度 X%，建议回看</p>
    <div class="card" data-module="viz">   <!-- 步骤按钮 + <svg viewBox> + 数值卡 + 预测（data-module="quiz"） --> </div>
    <div class="card" data-module="quiz" data-kind="cards"></div>
    <div class="card" data-module="quiz" data-kind="mcq"></div>
    <div class="card" data-module="derive" data-id="build"></div>
    <div class="card" data-module="derive" data-id="example"></div>
  </section>
  <footer>错题回顾 · 带走的三句话 · 来源与考纲条目 · 分页说明</footer>
</div>
<script>const PAGE_ID="{科目-单元-日期}"; const DATA={…}; const AUDIO={…};</script>
<script>/* 引擎 */</script>
```

**DATA 的形状**：

```js
DATA = { chapters: [ { id:"ch1", title, origin,
  viz:   { steps:[{label, note, predict:{q, opts:[…], ans}}], draw(step, params) },
  cards: [ {id:1, front, back} ],
  mcq:   [ {id:1, q, opts:[4], ans:0, exp} ],           // opts 顺序固定
  derive:[ { id:"build", lines:[ {n:1, math:"<math>…</math>", say:"读法", why:"…", from:"…",
              fill:{opts:[3], ans:0}, sub:[ {n:"1.1", math, say, why, from} ] } ] } ]
} ] }
```

**引擎里必须有的函数**：`play(key)`（内嵌音频，处理首次点击）、`mcq(container, items, chId)`（判分、解析、首答记掌握度、错题回顾）、`cards(container, items, chId)`、`stepper(container, lines, chId)`（逐行、填这一步、展开小步、朗读）、`scene(container, viz)`（步骤按钮驱动重绘，预测槽位）、`mastery(chId)`（读写 localStorage、门槛提示）。数学用 MathML；公式里的 `<` `>` 写成 `&lt;` `&gt;`。

## §9 工序

1. **动笔前**：§1 的四件事；在回复里列一张表（章 · A 讲什么 · B 几卡几题 · C 几行），表列完再写。
2. **写第一版**：先写 DATA（题、卡、推导行、场景步骤），再写引擎，最后写样式。数据先于版面，版面先于动效。
3. **生成音频**：按 §6 的键名表从 DATA 生成 `items`，跑 `gen_tts.py`，内嵌。
4. **渲染自检**：无头浏览器打开一次；搜裸露的 `\(`、`\frac`、`<` 吞段；JS 报错为零；每个 `data-module` 操作到底（四选一答完、卡翻完、stepper 走到最后一行）。
5. **自辩论**（照 `obra-superpowers` 的 requesting / receiving code review；评审者不接收对话史）：派一个子代理扮演学术水平中等、程序会做而概念不会、不自发检查、遇到分数与负数会绊住、焦虑而必须开口的高中生；交给它的是 DATA 的 JSON 与页面正文的纯文本导出（用无头浏览器取 `innerText`），不是对话史；它逐章逐行走（`olct` 与下半走概念卡与推导行），卡住就报「我走到第 N 行，第 N+1 行推不出，我试着这样理解……走不通」；每个新公式第一次出现处至少一轮。我照六步接：完整读、复述、回产物核实、判断成不成立、回应或反驳、逐条改；卡住的行补小步进模块 C；补完交回同一个子代理判懂没懂，每处最多五轮，到顶自己裁决并写进追问记录。追问与解答做成推导行旁的折叠对话卡进页面。
6. **补音频**：新补的小步按 §6 键名生成，只补新键。
7. **交付**：发布成 Artifact（超过 16 MB 按章分页）；给一份离线 HTML；更新任务清单 HTML（一页，列本轮任务与状态，他的全局规则要求每轮同步）；回复里写清楚每章三模块各几个、音频几段几 MB、自辩论几轮补了几处。

## §10 对话侧（他读完之后接着问）

先在心里拆一条知识点链，判据是链上每个子问题都答对的人能独立做出这道题，每个节点的前提要么是更早的节点要么是他已掌握的。每条回复分回顾、讲、问三段，一次只问一个问题，提问只站在已经讲清楚的前提上，拿不准他知不知道就当作不知道。一轮追问滚雪球：回顾段按先后列已谈定的结论，他答对检验问题时这个点关闭、雪球清空。他说「讲清楚原理」时挂起主链，另拆一条从他已会之处起步的原理链，可视化在这里回归。追问回合零工具调用，原理模式除外；聊通之后要写回页面的，等这一轮对话结束再另起一步做。答案由他自己说出，他明说「直接告诉我」时照办。

每一次追问都是一处诊断：他问的那一点就是页面上哪个模块没做够，写回页面时先补那个模块。

## §11 交付前自审（可数）

| 项 | 怎么数 | 门槛 |
|---|---|---|
| 三模块齐全 | 上半每章 `data-module` 计数 | viz ≥ 1、quiz ≥ 2、derive ≥ 2；下半每小问 quiz ≥ 1、derive ≥ 1；`olct` 前置块每条公式 quiz ≥ 1 |
| 掌握度 | 答完一章四选一后 `localStorage` 里 `dt-<页面id>-mastery` 有该章记录；页头数字随之变；低于七成时下一章 `.gate` 显示 | 三样都成立 |
| 交互优先 | 全页 quiz 数、viz 数、纯文字块数（`data-module` 之外的 `<p>` `<li>`） | quiz > viz ≥ 纯文字块 |
| 文字比例 | 去掉 script、style、折叠内容后，`data-module` 之外的汉字数 ÷ 全页汉字数 | ≤ 0.2 |
| 单块长度 | 任一 `p`、`li`、`.why`、`.exp` 的汉字数 | ≤ 150；折叠内 ≤ 300 |
| 推导槽位 | 每个 derive 行 `math`、`say`、`why`、`from` 四个非空 | 缺一退回 |
| 预测槽位 | 每个 viz 场景有 predict；每个 derive 至少一个 fill | 缺一补一 |
| 朗读 | `AUDIO` 键集合 = 按 §6 键名从 DATA 生成的集合 | 差集为空；生成失败的写明原因 |
| 术语 | 用词边界搜「生产者」「消费者」「政府」「价格」「数量」「需求」「供给」「利率」「通胀」「失业」「汇率」「方差」「期望」「定积分」 | 0 命中 |
| 配色 | `:root` 三块之外搜 `#[0-9a-fA-F]{3,8}`、`rgb(`；全页搜表情符号（`[\u{1F300}-\u{1FAFF}]`）、`transition: all`、`scale(0)` | 全部 0 命中 |
| 主题 | 三个 token 块齐全，键名一致 | 逐键比对 |
| 渲染 | 无头浏览器 JS 报错；400 px 宽横向不滚动 | 0；不滚动 |
| 自辩论 | 追问记录里轮数与补出的小步数 | 上半每个新公式首现处 ≥ 1 轮；下半每道题 ≥ 1 轮；`olct` 每张公式卡 ≥ 1 轮 |
| 键盘、首屏 | 人工点：Tab 走一遍；打开页面第一章 A 已显示 | 判断项 |

四项自审照他的规则：占位符、内部矛盾、范围是否单一、有没有一句话能读成两种意思，发现即改。

## §12 别的动作归别的技能

`classin-whiteboard-notes` 切板书；`manim` 做装不进页面的长动画；`emilkowalski-skills` 的 `apple-design` 与 `emil-design-eng` 是 §7 的出处；`obra-superpowers` 的 requesting / receiving code review 是 §9 第 5 步的出处；`writing-style` 只在他明确提醒时调用（2026-09 起）。本目录 `references/` 若在，有 `syllabus-and-boards.md`、`math-conflicting-readings.md`、`stats-glossary-en-zh.md` 三份；不在时用 §1 的表。

## §13 来历（短）

2026-08-12 至 08-30 的十一版定了对话侧、两半结构、七幕、六样、伴读讲解稿、自辩论，正本在第十一版文件里。2026-09-12 第十二版按他的新方向整体换载体：三模块、交互优先、Xiaoxiao 内嵌朗读、苹果感配色；依据是 §0 的对照实验；同日一轮评审提出 5 Critical、18 Important、12 Minor，全部落进本文件（references 缺席时的替代表、①′ 读法槽位、下半与 olct 的计数口径、生成脚本的目录与报错、任务清单的定义、DATA 与键名形状、文字位置表、触发边界、真题来源、色板去重、窄屏、原理模式例外、六样在例题的落位、五种交互的位置、自辩论的输入、plustts 的去向、减动效的 CSS、可数检查补齐）。