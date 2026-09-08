# 色彩与数学可视化 SKILL 终审

日期：2026-09-08。审查对象是冻结的生成技能合同，判断它是否可以交给独立生成者从空白制作；**不判断尚未看到的新 HTML 或 Manim 图已经视觉通过**。本轮未修改技能或 repo，未创建子代理。

## 阅读覆盖与版本

SKILL.md 按1–400、401–800、801–1200、1201–1600、1601–2000、2001–2278连续阅读。最后一批聚合输出出现一处截断，已再读2160–2278补齐；未以检索命中替代全文。interactive-html.md按1–190、191–330、331–442完整读取；其余三份ref完整读取。

|文件（相对技能根目录）|完整读取行数|SHA256|
|---|---:|---|
|SKILL.md|2278|27a31cfccb82663ad5c3df203fe75322394f09daa71e66901028e7404bfef0ba|
|references/visual-design.md|54|ad5f9c1665c918bc87986f3c18c1bcfe9bb8e1a83a2ddd30149ef6a223ddac69|
|references/interactive-html.md|442|725399c9c1f10875fb797a4d644981e9462f083798e310ba16d2131cce1721ec|
|references/modes-and-explanations.md|26|5fe1ffd1a0dfae205cdfd532108fb2b3a55ba43ee39ee91df4d0b50922d23fa3|
|references/expert-review.md|41|b5d2faebfbf97f84bf43492431f8d7e1c5ba9c451b009aad34472052f36037fb|

额外核验：阅读 reviews/correction-manim-runtime.md（他人运行记录，不称自己重跑）；读取原依赖 using_text.rst 第301–347行，确认它明文支持 MathTypst、manim[typst]、Typst编译至SVG再导入Mobject，含数学子式按label上色范例。这一局部技术核验不冒称本轮完整重读原manim依赖。

## 优点与裁决

**批准上述哈希的技能进入从空白独立生成。** 在本席负责的视觉生成合同范围内，没有未解决的Critical/Important。七项此前条件已从愿望转成角色表、状态规则、画布/字形尺寸、同源数据与验收要求；它们仍需逐项在生成实物上执行。

- 新生成明确document/no-typing/light（SKILL 86；interactive 46–48附近；modes 20），避免把旧studio或暗色自动模式带入新样章。
- 真实Manim CE要求在SKILL 1339–1378与interactive 267–277具有可核验资源合同，内置组装器的能力边界也直说了，未把“写了Scene”当“已经渲染”。
- 图和推导共用有理数事实源、稳定对象ID，前后帧与已揭示范围分开保存；既减少数学漂移，也防止点击回退把依据再次藏起来。
- 原正文的逐行推导、补8.1/8.2、两半及六项仍完整存在；视觉精简没有变成削掉数学。

## 先前 Critical / Important 逐项终审

|原项|合同落点|裁决与生成后证据|
|---|---|---|
|C1 对象身份不可被状态覆盖|visual 7–28；SKILL 1351–1355；interactive 269–273|已纳入。共享token和objectId/role/label/精确值；X₁蓝圆、X₂紫方、统计量青菱；不把九路径染九色；正误只改外侧图标/文字/边框。后验需比对真实帧、HTML公式与对象选项。|
|C2 手机不能缩桌面全景|visual 36–40、50；interactive 271|已纳入。手机3×3矩阵、计算在HTML、柱图分帧/分面；指定328目标宽与实际字形测量，字体不足拆图改构图。后验须量最终源图并看缩放图。|
|I1 图像真实主题适配|visual 3、30；SKILL 86|已纳入。首版仅明亮，color-scheme:light；暗版另渲染且另验，不用filter/invert。首版未做暗图不是本轮欠项；不能宣称双主题。|
|I2 主次与持续可读|visual 11–26、34、46|已纳入。暖灰/白/深墨，主体三色，装饰line与必要control-line分开；已揭示行正常对比度，非选中不降整项opacity。|
|I3 数学比例真实|visual 42；interactive 269–273|已纳入。两机制共用纵轴与真数值间距，零概率明确标记，无放回排除对角后重赋1/6。不是只删路径而保留1/9。|
|I4 控件/正文/公式可读|visual 36、40、50–52|已纳入。按钮16px/44px，正文手机≥16px，公式18–20px，手机公式与依据上下排，必要线宽及对比度阈值明确。|
|I5 图帧与原生交互分工|visual 38、46；SKILL 1339–1355；interactive 249、273–277|已纳入。HTML原生控件，真实帧同步lineId，视频可选，减少动态同源静帧；快切请求序号防旧图覆盖新条件。|

MathTypst被合法列为原技能支持的真实Manim数学排版路线（SKILL1364、1759）。其内部SVG属于正常Mobject管线，和手写SVG替代Manim是不同事实。此结论只是路线符合合同；新课是否真正调用并成功输出，仍由Scene、命令日志、CE版本及文件hash证明。本席本轮没有重跑CE或查看新课产物。

## Minor 与实施提醒

1. SKILL伴读段落仍留有“一张深色的卡，卡头橙色”的历史示例；它前面的现行规则已明确按当前实际明亮主题、真实颜色和形状定位，故不判合同冲突。生成者不得照搬示例口令；plustts后验比对真实页面标题、图形与对象角色。
2. interactive第79行规定通用quiz choices为纯文本，这一API不接受任意MathML。需要分数、上下标及逐对象上色的选项，应放到已支持的自定义interactive原生选择与bodyHtml中；普通quiz宜用文字依据。不要给text字段塞HTML后以为渲染了。本条是现有“复杂数学进bodyHtml”和完整构造interactive规则的实际用法，不要求为此扩大公共schema。
3. 画布分辨率是起点，不能只检查文件恰好1000×1250便签字。图内关键数字的源字形高度、最终显示比例、线宽与留白才决定可读。

以上Minor均已给出本轮裁定，不影响开始生成；实物若实际沿用深色口令、复杂选项显示裸源码、图像小字，应按出现的具体缺陷退回。

## 当前环境可执行的图像审查与证据边界

根代理已明确预览基础设施不可用；本席不以替代服务器、绕过预览路由来制造浏览器证据，也不把DOM事件测试称为真实浏览器视觉测试。该环境限制不降低数学与可读性目标，允许继续生成并独立完成以下**图像审查**，浏览器部分留待可运行时补验。

### A. 真实源PNG与328/358像素派生审图

1. 每个实际frameId从最终交付PNG取源宽W、高H，记录sha256及对应conditionKey/lineIds。至少覆盖初始、有放回全路径、单路径映射、合并柱、无放回排除/重赋权、零概率状态；高亮状态集合逐帧核对，不只看一个好看的封面。
2. 从该PNG以保留宽高比的Lanczos缩放生成宽328与358的独立审图文件，用于近似360/390屏幕各减左右16后的图像像素预算；不重新绘制文字、不另叠字、不调色。图片查看器按原尺寸检查，另存未缩放源图供细节核查。派生图另记hash，并明确标“目标像素宽图像审查，非浏览器截图”。
3. 如成品CSS存在额外父容器padding/border，328/358可能高估真实图宽。先沿外层main→section→activity→figure逐层核算box-sizing与内边距，计算实际可用宽度；若更窄，再按实际宽度生成审图，不能用较宽样本签字。
4. 每个关键数值标签保留来源PNG的字形包围盒或可核查crop。实际显示高度 h_display=h_source×W_target/W_source；目标数值≥16px、关键符号≥18px。1000宽源图在328宽显示时分别至少48.781/54.879源像素，即整数包围盒至少49/55。358宽时至少45/51。优先按更窄宽度设计。Manim font_size不作为测量结果；包括分数的数字及线条须实看，不用整个分式高度掩盖小分子小分母。
5. 必要轴、主对象、当前强调按相同缩放量核算≥1.5/2.5/3px；数值标签不得压线、截边，真实横轴间距与柱高比例不变。数字不达目标就拆图或重新排Scene再渲染，不以把缩小图放大看清代替。
6. 核验RGB与实际背景的对比度、接触对象的间隔/描边，灰度下仍能靠标签和形状区分。用真实源色计算4.5/3门槛，不四舍五入后通过；缩放/抗锯齿后还需目视线字是否虚细。此步骤只能证明图像内的对比与辨识。

可用Pillow实现步骤2，输出目录为临时审查证据；这属于精确缩放QA，不是AI图像编辑或绘图替代：

```python
from PIL import Image
from pathlib import Path
import hashlib
source=Path('FINAL_FRAME.png')
image=Image.open(source).convert('RGB')
for width in (328,358):
    height=round(image.height*width/image.width)
    out=Path(f'review-{source.stem}-{width}px.png')
    image.resize((width,height),Image.Resampling.LANCZOS).save(out)
    print(out, width, height, hashlib.sha256(out.read_bytes()).hexdigest())
```

### B. HTML/CSS静态核对与DOM事件证据

静态读取HTML最终媒体引用、picture/srcset或JS手机资源选择、width:100%/height:auto、intrinsic尺寸、父容器padding、媒体断点、字体值、按钮min-height、颜色token覆盖、light标记、无filter。检查bodyHtml/原生选择实际使用共享对象class/token。DOM事件可证明记录了哪个frameId、是否同步lineId、已揭示范围是否回藏、正误是否改错对象class；它不证明浏览器真的排成预期尺寸或图已在屏幕中绘完。

### C. 必须明确保留“未执行”的项目

360×800/390×844/1280×900真实浏览器截图、computedStyle实测、200%文字缩放、实际字体回退与MathML排版、页面横向溢出、焦点环可见性/遮挡、滚动后图文邻近、触控与键盘完整操作的真实视觉结果，均不能由A/B推定通过。工具恢复后按visual第50–54行补齐；在此之前只可写“技能终审通过；图像审查与DOM行为按各自证据报告；完整浏览器视觉QA未执行”。

## 最终范围

本次批准的是2278行SKILL及表列refs的**生成合同**。可以从空白开始独立生成，随后以实际数学、交互、图像与浏览器各层证据分别审查。没有见到的帧和没有运行的页面不签视觉通过，环境未完成项不被调色板数值或组件单测抹掉。

## 定向复审附记：2291行候选

已读取 reviews/apply_skill_review_fixes.py 并核验实际落盘内容：四份ref开头的样例范围、visual首屏、interactive完整构造与conditionKey条款、SKILL两处叙事改文及§7完整替换段。本次采用定向复审，未声称重新全文读取2291行。

裁决：**继续批准以下最终哈希的技能从空白独立生成。** 新增限定把9/6/1/6、身份对角和四组选择明确收回到三个不同单位、均匀两抽的S2示例；不同值相同的单位仍以身份区分，泛学科目标按其对象和条件设计。visual首屏改为当前学科必要条件，原有C1/C2及I1–I5合同未削减。

§7现在只声称已证明正有理数指数的严格单调，通分比较完整列出；它明确保留实数定义/延拓及严格单调证明为尚需展开的前提，不再把图像升势或“整数、分数成立”当任意实数证明。两处叙事修改也撤除了未经测量的“信息摄入0”和对读者困惑的预判。没有新增视觉Critical/Important。

|文件|最终行数|本次核验SHA256|
|---|---:|---|
|SKILL.md|2291|fcb2e738515d8be8f2ba5c1abcf6ee31533c655100a5f3e1f3accf4e152c3966|
|references/visual-design.md|56|b240d159007a9f5e8465a700db63958e40555caad4590a6647c8e3b64a701e2e|
|references/interactive-html.md|444|3abad86097774c6d61bf4857fb307cdeb4741e56d2b6734a8f36a1679a7d989f|
|references/modes-and-explanations.md|26|5fe1ffd1a0dfae205cdfd532108fb2b3a55ba43ee39ee91df4d0b50922d23fa3|
|references/expert-review.md|41|b5d2faebfbf97f84bf43492431f8d7e1c5ba9c451b009aad34472052f36037fb|
|references/teaching-design.md|53|5bd790ad8443908776503f14e4b96b32b5b404a5736dc5af5eba1b597b3492b6|
|references/engagement-and-narrative.md|107|ae82bfa4022f99a77cbb138a92bf0c0ada1244ed467ac5bb858c0a1eb45edb33|

后两份本席仅核本次受影响条款，不追加其全文已读声明。前文的实物证据边界不变：环境已有CE渲染能力并不等于未来课程已经渲染或视觉通过；正式HTML尚未开始，本次不签任何课程帧、页面或浏览器QA通过。
