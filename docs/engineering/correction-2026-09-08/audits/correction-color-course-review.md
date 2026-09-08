# 完整 HTML 视觉与状态接入独立终审

2026-09-08。结论：**退回本冻结 HTML，存在两项 Important，不能批准整课。** 已批准的 55 帧 Manim 图像本身继续有效；本次失败发生在 HTML 的角色绑定与图像失败回退接入。没有发现需要另列的 Critical。浏览器排版、原生 MathML 像素和真实移动端画面未执行、未认证。

|冻结输入|SHA256|
|---|---|
|lesson.html|98b5e20e7ba17f01ae691f67b91050a493d3efad702020349acad50eea6e4392|
|lesson.json|92a8258b95e6a735d80261eccaf23a91cd4335a3647edd2282fd7fda4cc75259|
|已批准 PNG manifest|329a4532bd8e807822327d8ed582ed0a69446853ad277febe4322e0325b7bf6c|

## 实际审查方式与范围

完整 HTML 已解析并遍历 DOM；全文读取三个样式块（基础 4 行、runtime 442 行、压缩作者样式 3 行），核其层叠关系、移动媒体规则、light 覆盖、图像祖先容器、标题/正文/依据/公式层级。读取共享自定义组件的完整行为函数及 FORMS / FRAME_META 关联内容，并检查 runtime 的选择、反馈、参考显示相关实现；不把程序解析的大型内嵌图片/JSON 或整个通用 runtime 的所有无关功能冒称人工逐行阅读。

自写 `reviews/course-color-probes/course_check.cjs`，实际启动 jsdom 执行冻结 HTML 的脚本并派发原生 click/change/toggle。它显式模拟 Image 的 onload/onerror，所以可核状态和 DOM 原子提交，**不能证明真实浏览器完成了图片解码或排版**。脚本及结果 `course-check-results.json` 保存全部活动的控件标签/选择器、45 个路径阶段的公式/原像/链接/图片 hash、图像祖先链和展开统计。

另写 `failure_link.cjs` 独立重现失败回退，结果见 `failure-link-results.json`。图片在 326 宽补测用本席的 `pixels326.py`；原始图仍读取此前批准的独立冻结快照，无作者文件改动。55 个内嵌 PNG 解码 hash 全与批准帧一致，见 `embedded-image-hashes.json`。

## I1：图中已有的观测与结果角色在 HTML 数值处丢失

**具体触发：**在抽样探索中选“放回 · 独立均匀”→ AB →“② 均值计算”。Manim 图中的代入 2 属于 X₁、为蓝 `#2364AA`；代入 4 属于 X₂、为紫 `#7250A4`；结果 3 属于 T、为青 `#0F7074`。HTML 紧邻的同一式却是：

```html
<mi mathcolor="#0F7074">T</mi><mo>=</mo>
<mfrac><mrow><mn>2</mn><mo>+</mo><mn>4</mn></mrow>…</mfrac>
```

两项数值均无角色属性，祖先也没有蓝/紫样式，因此是默认墨色。最后的 `T=3` 只给 T 字母青色，结果 3 仍是默认墨色。静态 `#main-wr-AB-sub` / `#main-wr-AB-div` 也一样；同一 FORMS 内容在 grouping 再次使用。

这不是要求把所有数字都染色：分母的样本量 2、中间总和 6、概率分母 9 都有不同语义，可以保持墨色。缺失的是**已经被指定角色的观测代入值及统计量结果**。图中两次观测的角色色与页面对应值不一致，违反已有“图、公式、选项、状态中的同一数学对象保持稳定”的合同；无需取得浏览器截图即可从源属性与 CSS 证明。

扫描得到 56 个静态两项代入块，其分子共 112 个数值节点均没有角色颜色；包括主例、无放回、新题和修补分支。动态 15 条路径的 mapping / grouping 共 30 份公式，60 个代入值也全部缺失；结果节点另存入记录。`role-color-inspection.json` 给出每个 id 与节点属性，避免只修 AB 样例。已有大写 X₁ / X₂ 和 T 的角色颜色是正确的，不能据此推定数值实例也已绑定。

**通过条件：**先在生成合同明确角色绑定覆盖数值实例，再从同一角色数据生成 Manim、静态 HTML、动态 FORMS 和具相同数学角色的选项/反馈。验证第一观测、第二观测、统计量结果分别使用正确 token；普通常量不能按数字字面值误染。至少检查 AB 与 BA 对调、AA 同值不同角色、CC 两位数求和以及不同新条件。错误状态只改变反馈边界/标记，不重写对象角色色。

## I2：当前图像失败时，书面回退仍指向上一条路径

**REPRODUCE：**先成功选择不放回→ AC → grouping；再选择 BC，对这个新 Image 请求触发 onerror。独立脚本实际执行得到：

|字段|失败后实际值|当前选择应对应|
|---|---|---|
|selectedPath|BC|BC|
|图像|旧图已隐藏|隐藏或明确失败|
|状态|“图像未能显示。完整书面推导仍在下方链接，可直接阅读。”|应提供当前 BC 的推导|
|书面链接|`#main-nr-group-1`，AC/CA、T=4|`#main-nr-group-2`，BC/CB、T=5|
|figcaption|“AC：所有均值柱子，突出当前原像组”|当前 BC 或不显示旧说明|

原因是 `renderExplorer` 在成功 onload 内才更新链接与 caption；onerror 仅更新状态文字。图、公式、目标虽然同时隐藏，旧链接仍可操作，而且错误提示明确引导读者去使用它。这违反现有“缺图时仍保留同条件书面推导”的合同。证据是显式模拟失败回调后的真实 DOM，不冒称网络或真实浏览器曾发生失败。

**通过条件：**在开始请求新图时就绑定 current requested 的语义链接/说明，成功后再原子显示新帧、公式与目标；失败仍必须指向当前请求的条件/路径/阶段，或明确提供同条件总推导。复验至少覆盖同条件换路径、跨放回条件切换、晚到成功、失败后重试；不得保留旧 caption 或旧链接来解释新选择。

## 已通过的可执行检查

- 28 项活动挂载成功，未见 jsdom 脚本错误；控件有原生 button/input/select/summary 语义。
- 9 条有放回、6 条无放回路径各三个阶段，共 45 次实际切换。成功状态的图片 hash、conditionKey、路径、阶段、动态公式、原像组和对应书面链接匹配；无放回 AA/BB/CC 禁用。路径阶段的链接有意回到该条件的完整路径集合 `*-pathset`，这与 mapping / grouping 的逐行锚点用途不同；本席没有把最初测试脚本的过强锚点假设误列为数学缺陷。
- 逆序完成两个成功请求时，只提交最后选择；等待期间旧图、公式、目标一起隐藏。失败回退链接的 I2 是这一成功路径之外的缺口。
- 10 个静态图像使用已批准帧，全部 55 个嵌入资产 hash 一致。图的祖先链没有额外隐藏 padding 或新的缩放变换。
- Q3 四组未完成时没有生成提交；完成后一次核对四组并显示冻结原始选择；重试/跳过按钮可用。native wrong-choice 显示有文字判定的反馈及对应修补链接；颜色不承担唯一的对错信息。
- “直接读全部参考”实际展开全部 24 个 `details[data-dt-solution]`。静态文档保留 561 个 `data-line-id`，每个均有 `.reason`；基础均值和条件乘法、九条/六条路径的分步计算、逐项归组与总质量检验在 DOM 中持续存在。没有靠答对来解锁唯一推导。此项说明内容存在与可展开，不认证它们在浏览器中的像素布局。

## REPRODUCE 控件地图

完整 28 项活动的初始控件库存位于 `course-check-results.json → controls`。主要操作路径如下：

|控件位置/选择器|操作|核验结果|
|---|---|---|
|`#sampling-explorer [data-condition]`|放回 / 不放回|重置到该条件总路径图；禁用非法身份路径|
|`#sampling-explorer [data-path]`|AA…CC 原生按钮|选中路径 aria-pressed 与显示帧身份一致|
|`#sampling-explorer [data-stage]`|paths / mapping / grouping|45 组合成功状态对应；grouping 打开当前条件完整参考|
|`[data-explorer-line]`|回到对应书面推导行|成功状态对应；失败时有 I2|
|`[name=preimage-path]`、`[data-preimage-submit]` / retry|原像多选、统一核对、重选|控件库存已检查；本次不冒称重跑全部原像评分组合|
|`[name=construct-path]`、`[data-map-path]`、`[name=construct-reason]`、`[name=construct-distribution]`|四组选择后 submit|实际核完整允许路径与 2/5/7 映射，显示冻结记录|
|`[data-construct-retry]` / hint / skip|重构、提示、跳过|重构与跳过实际执行；提示按钮及事件绑定已检查|
|`[data-dt-activity=main-equal] [data-dt-control=submit]`|选 five 后提交|显示 needs-revision 文字与 branch-equal 链接|
|`[data-open-all]`、`details[data-dt-solution] > summary`|统一展开或直接阅读|全部 24 参考展开，无答对门槛|
|各活动 `data-dt-control=skip/reveal/retry`，学习工具 summary|跳过/参考/重试/工具|库存与 runtime 分支读取；未把全部工具功能算为本席逐一实操|

## 手机宽度、图像补测与数学层级

360 宽的静态 CSS 预算为：main 两侧各 16 → 可用 328；figure 内的 img 使用 border-box、1px 左右边框 → **图像像素内容 326**。作者移动规则把 `.dt-activity` 水平 padding 和左右边框归零，也把 `.dt-worked-solution` 水平 padding 归零；实际 DOM 中图片在 figure、duty 或 dt-authored 内，没有额外 card 祖先。故 326 是可由代码推导的内容宽度，而不是本席伪造的 computedLayout。

已把同 hash 原帧在 326 宽独立重测，并实际打开六帧目标宽 contact sheet：无放回总矩阵、AB 路径、AB 映射、AB 归组、无放回分布、分数横轴 repair-weight。`six-326.png` 每帧保持 326 宽，无再次缩小。原 55 帧 328 / 358 全覆盖目视证据继续可用，此次 326 未冒称又逐张看了 55 帧。

|326 宽独立像素结果|实测|既有地板|
|---|---:|---:|
|x/y 轴、刻度|2.031–2.116|1.5|
|圆/方/菱/零圈/排除叉|2.920–3.010|2.5|
|当前格框/柱框|3.589–3.591|3|
|辅助格框/概率虚线|1.450 / 1.015|1|
|分数横线|1.705|清楚可辨|
|794 个 ASCII 主体的数字最小预算|55 源 px × .326 = 17.93|16|
|关键字母最小预算|58 源 px × .326 = 18.908|18|
|全部 55 帧底部最小空白|41 源 px × .326 = 13.366|此前约 12|

图像补测通过。浅灰辅助虚线仍为辅助，不作为必要数据边界；颜色对白底的对比沿用已独立测过的同 hash 像素，不需重复算成新的页面测量。

singlelight 根属性与高 specificity token 规则覆盖了旧 dark media，因此静态 CSS 不会把白底 Manim 周边切换成另一套暗色角色。正文 17px、依据/图注 15px，按钮/选项 16px、按钮 44px；正文单列、依据另段，长表/公式有局部横向容器。按结构层级可审读，未宣称没有真实浏览器横向溢出。

**Minor M1：MathML 的作者字号声明被覆盖。** 作者样式和手机规则写 `math{font-size:24px}`，但 runtime 的 `:root[data-dt-theme="light"] math{font-size:20px}` specificity 更高，正常 CSS 层叠应取 20px。20px 本身符合已批准的 HTML 公式建议，故不以此单独打回；但不能在报告中把作者 24px 声明说成有效结果。jsdom 对 MathML 的 getComputedStyle 调用实际抛出 TypeError，本席记录限制后改为静态 specificity 核查，没有伪造 computedStyle 值。原生 MathML 的分子、下标实际字形仍需后续浏览器验证。

## 后续和批准边界

I1 / I2 是现有合同的实物缺口，不是后验加标准。按照完整 HTML 被退回的既定流程，应先修生成 skill 的角色绑定与失败回退合同，再从空白生成新课并提交冻结复验；本席未修改本版产物。已通过图像批次不等于新 HTML 自动通过。

预览基础设施不可用，本轮未启动替代浏览器或绕过限制。未执行真实 viewport 截图、原生 MathML 像素检查、系统暗色实测、200% 文本缩放、键盘焦点位置/遮挡、屏幕阅读器、实际触控或页面溢出测试。当前通过范围仅是所记录的静态 CSS/DOM 推理、实际 jsdom 事件与状态、同 hash 图片接入、326 像素派生图目视及测量；**最终整课因 I1/I2 未批准。**
