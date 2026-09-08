# run03 整课色彩、图像与图文关系终审

**结论：C0 / I0 / M0；批准当前冻结整课在本席实际审查范围内通过。** 图像部件预审的 shelf caption M1 已在最终可见说明中关闭。没有待修的重要视觉或图文同步问题。本结论覆盖最终 HTML 的静态 CSS/DOM、实际 jsdom 控件与媒体分支，以及同 hash 真实 Manim 图像；**不认证尚未实测的真实浏览器布局、原生 MathML 字形、触屏、Tab 顺序、200% 缩放或浏览器图片解码。** 没有绕过预览工具限制，也没有制作假页面截图。

## 冻结身份与已读内容

| 文件 | SHA-256 |
|---|---|
| lesson.html | `bcd536d3884afbcbfc328da8b467410286ef53a3e0661abb042a8d9ed1501de3` |
| lesson.json | `33b41f47356499201bdcfb3a4dd6044f7fae17fd43bcc95f570af73afde8cceb` |
| FREEZE.json | `3ffc817e2b926d882cdafd2443ded1e8f294d211e817a804b068a115f1b55e6d` |
| html-frame-map.json | `8cd5ddfe51c9841874541ed4ec0c65a0f5c09936c73cb3cffcf28e4432ce1e66` |
| Manim Scene | `3e5f13dd57a4176ed723dd13000ac5356661f02612ad979ca80fe0ce318753f1` |

读取 FREEZE、三段完整 CSS、最终自定义控制器、媒体映射与正文 DOM；抽取并结构检查全部 1026 个唯一原行。角色核对包括全部静态绑定节点及本轮实际生成的动态推导；按题设值独立检查各路径代入和最终统计量，不以作者答案函数证明自己。原行文本与 MathML 在证据中保留，人工重点复核顺序对调、同值不同身份、分数输出、分母常量、图像对应的完整推导及选择/反馈边界。没有声称人工重新全文逐字校对所有 1026 行数学论证。

开始和结束 hash 一致，未修改任何冻结作者文件。自写探针运行在审查副本，对最终 HTML hash 断言成立；未执行会改写作者结果文件的作者自测。

## 真实图像接入与宽度

38 张当前源 PNG 的实际 hash 均与此前全批次独立预审相同；从最终 HTML 中核到每张完整 PNG 字节。36 个动态图状态覆盖主均值 34 帧与 maximum 两帧；另有 4 处静态插图，其中 maximum 两张是重复接入，新增的独立图为极差和货架，因此总独立图片仍为 38，不混算成 40。

复用 `correction-color-batch-run-03.md` 已实际完成的全部 38 原图及 280px 联系表目视、1490 字形、133 可分离线与两个零环、34 正概率柱像素证据。本次没有冒称再看一遍全部 PNG；此次工作是确认最终接入字节及显示宽度预算未使证据失效。

动态图片的实际祖先链为 img → figure → r3-widget → dt-authored/dt-custom → dt-activity-body → dt-activity → section → main。图片 width:100%，figure padding/border 为 0，中间 div 无额外水平内边距。全局 border-box，默认 16px 根字号下：

| 视口 | main 内容宽 | activity 两侧内边距/边线 | 动态图内宽预算 | 静态图宽预算 |
|---|---:|---:|---:|---:|
| 360px | 320px | 各 12.8px / 1px | 292.4px | 320px |
| 390px | 350px | 各 16px / 1px | 316px | 350px |
| 1280px | 760px | 各 26.4px / 1px | 705.2px | 760px |

这是按实际选择器、媒体条件和祖先链计算的 CSS 预算，不是 getBoundingClientRect 实测。最窄要求宽度仍大于已审 280px，图内普通/关键字形和线宽不会因当前静态内边距预算跌破此前门槛。真实排版、字体度量导致的溢出与用户缩放仍未认证。

货架图实际 figcaption 与 alt 均补了：“下方三项之和检查全分布总概率，事件概率只取输出7的柱。”这足以区分全分布的归一化和实心柱事件，关闭 M1。所有静态图说明均有横轴/纵轴含义；36 个动态图的 caption 与实际显示图同步，其中 WOR overview 解释 ×，bar-focus 说明横轴统计量数值及纵轴概率。轴义不是仅存于清单。

## 实际 CSS 层叠、背景与控件

完整读取 base/runtime/course CSS 后，自写静态层叠探针按实际 DOM 匹配选择器，处理 specificity、后声明、局部 token 继承及媒体条件；为 hover/focus 以审查属性模拟选择器匹配，**不是浏览器 hover 截图或 computedStyle 认证**。原生选中/正误/回忆卡翻面则实际点击生成。记录 22 个“控件样式 × 祖先背景”族的 110 条状态计算，未拿作者 palette 表替代检查。

singlelight 的高优先级选择器覆盖旧 dark media tokens；在启用和禁用该 media 条件两种静态求值中，canvas 都为 `#F6F5F2`，color-scheme 都为 light。Manim 白底无需反色或 filter。

| 必要控件边界/文字 | 实际组合 | 对比度 |
|---|---|---:|
| r3 正文按钮边界 | #7B8792 / #F6F5F2 | 3.3657545957502792 |
| r3 与 runtime 白底按钮、选项边界 | #7B8792 / #FFFFFF | 3.669503867988136 |
| 回忆自评区普通按钮外侧边界 | #7B8792 / #EEEDE8 | 3.1303213564113705 |
| 正文 hover/选中边界 | #8C4A25 / #F6F5F2 | 6.171016021551187 |
| 灰底 hover/选中操作文字 | #8C4A25 / #EEEDE8 | 5.739355824518244 |
| 实心提交文字 | #FFFFFF / #8C4A25 | 6.727931736048336 |

以上按未四舍五入数值判定，必要边界 ≥3、文字 ≥4.5。焦点 token #195FC4 对页面、白底、灰底均 ≥5.1547，样式保留 3px outline 与 3px offset。没有新增任意边界 hex；实际适用值来自批准 tokens。透明 quiet/summary 控件由文字动作识别，按其真实祖先背景核文字对比，不把透明边界报成通过 3:1。原生 radio 的 UA 外形和文件选择器不冒称像素测过；其选项容器边界、选中状态和 accent token 单独可核。

回忆卡正面的浅 `--dt-line` 外线属于卡片分隔；卡内明确写“点击或按回车翻面”。不把此装饰线变成新增的必要 3:1 门槛。翻面后实际 `.dt-flashcard-back` 和灰底自评按钮已产生并检查。disabled runtime 控件的 opacity 是不可操作状态，不把非选中选项整项降低透明度；disabled 项不作为活动控件对比通过数值。自写工具保留了这些原始声明，没有把 disabled 混入最低对比合格统计。

实际 Q4 错答和重试正确均产生了反馈：正文始终 #202C39，底 #EEEDE8，边线分别 #AE3447 / #176B4B，并有“需要修正”或“核对通过”等文字。没有依靠红绿作为唯一信息，也没有把公式整体染成正误色。

## 数学角色与阅读层级

全部 **461 个初始 MathML 角色节点**的 data-role、mathcolor、有效静态 CSS 色一致；实际动态公式再核 87 次出现，合计角色账本 548 条。第一位置蓝、第二位置紫、统计量结果青；概率及一般常量中性。核对覆盖 AB/BA、AC/CA、BC/CB、BB 同值两位置，以及 maximum 的 RS/SR 同值不同身份。代入数值与字母共用角色，最终结果不是只给 T 字母着色。

货架 7/2、11/2 的最终输出使用外层 `mstyle[data-role="stat"]` 包住整个 mfrac，分子、分母均继承青色；均值定义和代入步骤的样本量 2 没有该角色，中间和保持墨色。极差的“最大值−最小值”是重排后的运算步骤，未硬充为第1/第2抽位置；最终极差结果保留统计量色。概率事件文字和纯文本自然语言概率选项不伪装成观测数值绑定。

本次脚本逐一比较 36 个动态书面区域的全部 MathML 与其 proofLineIds 指向的原文 MathML 序列，均相同。动态区域移除了重复 DOM id，但未丢数学小步；加载失败时这些完整步骤仍在当前图下，而不是只留一句“查看答案”。按回原行也会打开必要 details 祖先，未锁住正文阅读。

正文最终有效声明为 17px/1.8，原生选项/按钮 16px、最小高度 44px；r3 按钮继承正文或 activity 的字号。公式最终获胜声明是 `:root[data-dt-theme="light"] math {font-size:20px}`，优先级高于 `.r3-line math {font-size:1.25rem}`；这里两者默认根字号下同为 20px。未将声明字号称为原生分数字形实测。公式区有局部 overflow-x:auto，依据另起行；浏览器中的具体断行和是否横溢仍在未测边界。

## 实际媒体操作与失败路径

自写 `final-probe.cjs` 在最终 hash 上完成 **52/52 项检查**，没有 jsdom 运行错误。它使用真实 DOM click 和 Image callback fixture；无真实图片解码、布局 rect 或学习效果主张。

36 个动态图逐一请求并核：requested 先更新、displayed 清空、旧图移除、当前 caption/完整书面公式/返回入口先出现；调用当前 onload 后只提交当前 PNG，实际字节 hash、caption、conditionKey、targets、原行都一致。逐一点击“返回对应完整原行”核实际定位目标。

另操作了已有图 A → 请求 B → B 失败 → 返回当前原行 → 重试 B → 成功；A 的迟到 success/error 不覆盖更新请求；切换 WR/WOR 后旧回调不重插图；实际 API 导出再导入恢复后，旧 Image 回调失效，匹配恢复条件的新请求提交正常。恢复会同时建立两个组件的图片请求，探针明确按当前 frame src 选择该组件的回调，未把“全局最后一个 Image”误认为当前组件。

## REPRODUCE 控件地图与证据

| 实际节点/入口 | 本席检查 |
|---|---|
| `#mean-lab-frame-controls [data-r3-control="frame-…"]` | 34 均值状态的 caption、图、书面步骤及返回 |
| `#max-board-frame-controls [data-r3-control="frame-…"]` | 2 maximum 分布状态 |
| `#mean-lab-media` / `#max-board-media` 的 `frame-return`、失败后的 `frame-retry` | 当前条件原行、失败保留、重试提交 |
| `#mean-lab-draft` 的 `condition-wr` / `condition-wor` | 跨条件撤销旧媒体回调 |
| `#max-board-draft` 的 `path-RS` / `path-SR`、`mapping-RS-1` / `mapping-SR-1` | 同值不同身份的真实纯文本选择接口 |
| `#dt-activity-q4a` 的 radio、submit、retry | 真实选中、错误/正确反馈样式 |
| `#dt-activity-recall-core` 的 `flash-flip` | 卡背及灰底自评按钮的实际控件族 |
| `#solution-e3a`、`#solution-q3a/b`、`#solution-q4a` 的 figure | 四处静态图 caption/alt/嵌入字节 |

运行：`node reviews/color-course-run-03/final-probe.cjs`。核心结果为 `final-results.json`、`final-probe.log`、`control-results.json`、`feedback-results.json`、`role-results.json`、`frame-results.json`、`image-ancestor-css.json`、`width-budget.json` 和开始/结束 hash。`inspect.cjs` 提取全部原行与控件索引。早期探针对极差重排、动态副本 id、跨组件 Image 顺序的错误假设已在探针修正，未作为产品缺陷；保留首轮日志用于说明证据演变。

未再新增可选测试或后验阈值。上述证据支持本席对当前完整课件的色彩/图文/实际 DOM 范围批准；其他学科、教学、程序、整体学习路径及尚不可用的浏览器验收，由对应证据另行负责。
