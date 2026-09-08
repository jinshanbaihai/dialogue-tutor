# run-02 变更提案：视觉与失败回退批判审查

2026-09-08。已完整读取 `reviews/correction-run-02-change-proposal.md`。**两项方向正确；建议补齐下列可生成、可定位、可断言的合同，再审统一候选 skill。** 本文不批准尚不存在的新 HTML，不改 skill 或冻结产物。

## 1. 角色绑定：不能停留在“同一数据产生两边”

提案已指出变量、代入数值、结果和反馈，但还缺“如何识别节点”的具体配方。单纯共享数值 JSON 仍可能重现 run-01：Manim 用位置着色，HTML 只按字母 T 着色。应要求在数学表达式生成前，就把**对象角色与表达式位置**写入表达记录。

建议在蓝图阶段为每条式保存以下语义信息，字段名可以适应实现：

```text
conditionKey + pathId + lineId + operation
expression nodes:
  objectId / role / exactValue / occurrenceId / operandPosition
```

`exactValue` 表示精确有理值或题设定义的精确表达；`occurrenceId` 区分同一值在不同位置的出现。颜色由 role/token 映射产生，不能拿字符串 “2”“4”“T” 去全局替换。没有必要为了给颜色强迫新学科采用这里的三种对象；本例角色来自当前数学题设。

以主例 AB 的三步为例，逐位置合同应明确到：

|表达位置|对象角色|显示颜色|不得混入|
|---|---|---|---|
|一般式的 X₁、代入式分子第一项 2|第一次观测，sample-first|math-x1 / `#2364AA`|分母样本量 2|
|一般式的 X₂、代入式分子第二项 4|第二次观测，sample-second|math-x2 / `#7250A4`|统计量恰好取 4 的另一情境|
|T 变量、最终求得的 T 值 3|统计量，sample-stat|math-stat / `#0F7074`|普通计数 3、概率分母 3|
|中间总和 6|两观测总和 S，本例未分配独立强调角色|ink|不能冒充第二次观测或已求出的 T|
|份数/样本量 2、概率算式中的计数与分母|常量或概率运算节点|ink，除非题目另外定义角色|不能因为字面等于观测值而被染色|

由带角色节点的同一表达记录分别输出：Manim tagged segment、静态 MathML 节点、动态公式节点，以及确实展示该角色实例的选项/反馈片段。节点可用语义 class、`data-object-id` / `data-role` 和受控 mathcolor/style；重点是值与角色可查且两侧一致，不规定只能某个 API。

**分层，不把整个公式包成一个角色。** `T=(2+4)/2` 中只给 T 与两个相应观测节点着色；等号、加号、分数横线、分母保持通常墨色。`P(T=t)` 中统计量实例可按规定着色，但概率值与轴刻度并不自动变成观测实例。轴上的数值地址、单位、说明文字有自己的显示职责，不得把“稳定角色”扩写成“页面所有相同数字必须同色”。

**文本选项也要有路径。** 若选项或反馈确实重现一个已绑定角色的表达，就生成安全的结构化文本/数学片段，或受控 DOM 节点；不能让 plain `textContent` 渲染器悄悄丢掉角色信息。纯自然语言的概率答案、普通计数不必为了着色改成冗长公式。不建议允许任意 HTML 字符串来补颜色。

### 必验节点

- 静态：每个路径的 `*-sub` 第一、第二观测节点，`*-div` 的最终结果；所有一般式 X₁/X₂/T；新题与修补分支中对应节点。
- 动态：每个合法 frameId 的 mapping 和 grouping 公式；target 中的统计量实例；参考和反馈重复展示的对应表达。
- 代表对照：AB 与 BA 的值序交换；AA 中两个字面相同的数仍分别蓝/紫；CC 的中间 12 保持总和语义；不放回及改变数值后重新从当前题设绑定。
- 状态对照：未答、选中、答错、答对、辅助后重试。状态色用于容器、文字判断或标记，不让 `.error * {color:…}` 一类规则覆盖子数学角色。
- 机器断言采用 **conditionKey/pathId/lineId/occurrenceId → role/token/value** 映射，逐节点比较，不只统计页面出现了三种颜色，也不只断言存在一个青色 T。
- 实物核查仍包含 Manim 实際 PNG 与 HTML 节点接入；静态语义 token 一致不能冒充原生 MathML 像素已验。

建议落点：visual-design 写角色/位置合同与代表案例；interactive-html 写结构化表达的动态接入、反馈继承及节点断言；专家审查表增加“数值实例/变量/常量是否被区分”，避免只看 palette 表。

## 2. 失败回退：明确 requested 与 displayed 是不同状态

提案“加载前更新 requestedFrame 语义链接、条件、caption”能直接修复 I2。还应明确**两个状态的职责**，避免把旧 currentFrame 改名后继续混用：

1. 用户选择或恢复状态后，先验证条件、路径、阶段组合，并求出当前 requested 的 frameId、完整书面推导链接、说明和精确表达。
2. 同步更新当前请求的语义链接/说明；隐藏上次 displayed 的 image/formula/target 组合或明确将其移出当前显示区。当前 loading 文句指向新选择，不能留下旧路径 caption。
3. 为请求分配代次标识。成功回调只有在仍属于当前请求、组件仍有效时才能一次提交 image/formula/target；同一次提交记录 displayed 身份。
4. 当前请求失败时，仍保留本次 requested 的正确推导链接与条件说明；图组保持明确失败/隐藏。不要让错误文句引导读者进入旧 displayed 的推导。
5. 旧成功、旧失败、恢复前尚未完成的回调都不得覆盖当前语义、状态文句或已显示帧。

这里“原子显示”指同一同步提交中更新相关 DOM；不声称 JavaScript 能替代真实浏览器绘制原子性的像素验证。无需把 requested、serial 等开发字段写进学习者文案；学习者只需要知道当前条件、所选路径、画面是否可用，以及哪里有对应推导。

**链接降级必须仍有数学边界。** 若当前阶段没有唯一逐行锚点，可使用当前条件的完整推导或当前路径的推导起点，并让链接文字真实描述目的地。不能选一个“页面里存在的锚点”就算通过；href 存在性和语义对应性要分别测。路径概览阶段回到当前条件的完整路径集合是合理的，不能把这种用途误判为必须链接到均值代入行。

### 最小可执行失败/竞态矩阵

|起点与操作|必须断言|
|---|---|
|AC grouping 成功 → BC grouping error|selected/requested 为 BC；回退指 BC/CB、T=5 的行；不得留 AC caption/href|
|放回 AB grouping 成功 → 不放回 overview error|回退条件为不放回，书面权重/路径资格也属于不放回|
|请求 B → 请求 C → C 成功 → 旧 B 成功|图/式/target/link/caption/status 全保持 C|
|请求 B → 请求 C → C 成功 → 旧 B 失败|C 不被旧错误文句或隐藏动作覆盖|
|B 失败 → 重试 B 成功|链接始终属于 B；成功恢复同组图式，不带旧条件|
|请求未完成 → 合法状态恢复/重开 → 旧回调到达|恢复后的当前请求不受旧回调污染|

每个断言保存 requested 条件、路径/阶段、displayed frameId、图像 hash、公式/target、href 目的节点、caption/status 与 hidden 状态。既查成功后，也查 pending/error 时。callback fixture 的证据名称应明确为“人工 load/error 分支 fixture 下执行实际 DOM 事件”，不能简写成“图片加载已在浏览器验证”。

建议落点：interactive-html 的真实媒体状态机/错误降级合同、恢复入口合同以及终审 fixture 列表。不要只把失败说明放进作者自查文字；必须要求其生成可运行断言。

## 3. M1 与宽度证据：检查生效规则，不只检查声明

提案主表尚未明确列 MathML 字号层叠；应纳入候选规则：在 authored 与 runtime 样式并存时，给正文、公式、选项、按钮、图像各指定预期最终值和胜出 selector，核 specificity、`!important`、媒体条件、继承及顺序。比如 run-01 的普通 `math{font-size:24px}` 会输给 runtime 的 `:root[data-dt-theme="light"] math{font-size:20px}`；不能把前者当实测 24px。

建议统一声明的职责或用有意的作用域覆盖，不鼓励无差别追加 `!important`。20px 与 24px 本身要根据原合同和原生排版选择；本次指出的是“宣称值与实际胜出规则不同”，不把 20px 自动判为失败。

移动图宽继续按真实祖先链计算：viewport − main 左右 padding − 活动/参考祖先 padding 与边框 − img 自身 border。记录**图像内容宽**，而不只写 figure 外宽。若下一轮仍是 360 − 32 − 2 = 326，则可复用同 hash 图像的已批准 326 证据；若更窄、新构图或换 hash，重新测实际字形与法向线宽。不能因新样式出现 `.card` 而默认其 padding 不影响图。

有真实浏览器时核 computedStyle 和实图；本环境不可用时，只报告静态层叠推理。jsdom 对 MathML getComputedStyle 的 TypeError 不可“补一个预期值”来填通过表。仍分别列出：DOM 事件、人工媒体 callback fixture、实际 PNG、真实浏览器/原生 MathML；最后一列当前未执行。

## 对提案的裁定

视觉与失败回退修订方向可采纳；以上位置绑定、requested/displayed 职责、fixture 矩阵与有效字号/图宽规则应进入统一候选 skill 后复审。未提出新的颜色或字形阈值，没有放松数学或手机可读性目标。其余数学、学习记录、叙事条目由对应专家终审；本席不越权为未审部分签通过。
