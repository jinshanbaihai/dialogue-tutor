# Run 02 完整课件色彩 / 图形正式终审

审查人：correction_color；2026-09-08。

**结论：退回本次冻结的完整 HTML。C=0，I=1，M=0。** 已批准的 51 张 Manim 图像部件继续有效；本轮新检验的逐位置 MathML 角色、图文状态与失败回退未发现未解决问题。正文插入操作按钮的必要边界没有满足已批准的 3:1 对比合同，不能签整课通过。冻结产物未修改；后续按 root 已确定的“先修 skill，再空白新生成”流程处理。

## 输入与证据范围

| 文件 | 实际 SHA-256 |
|---|---|
| lesson.html | 7941f152c7f7eeedad7ca002dbd5602047ec9ba11f96ee16b6d7d2e127fe76d7 |
| lesson.json | 42627f4a3df54ccddfcfef28abf3a873a3a1807b955f7fd9315d3613a4f5dc90 |
| delivery-manifest.json | 3bd8e42e61e8387ff4632abecf90366f3e3b9ded06f83d0e12a019252e8ecae2 |
| media-manifest.json | 1a5f49abe96909c1b1f769cee2e54416ebcd1966bd4827c6a902ee276346b53d |

本轮读取实际 HTML 的三段完整 CSS、正文 DOM、课程自定义交互脚本与其媒体状态/角色/返回分支；对静态与挂载后 DOM 自写探针。没有将作者旧哈希上的 73+18 检查或最终仅六导航检查当成本轮执行证据。

证据目录：`reviews/color-final-run-02-probes/`。核心文件：

- `probe.cjs`：实际加载上述最终 HTML 的独立 jsdom 操作脚本。
- `results.json`、`static-results.json`、`extra-results.json`：实际执行记录；`final-check-ledger.json` 汇总 14 项成功检查与 15 项独立目标概率核对。
- `css-probe.cjs` / `css-ancestors.json`：实际 DOM 祖先及匹配 CSS 声明，含六个受影响按钮与四张静态图。
- `contrast.py` / `contrast-results.json`：独立 sRGB 线性亮度计算，不先四舍五入再判过。
- `independent-target-probabilities.json`：从 A=1、B=5、C=9 的有序路径独立枚举均值概率，再对实际目标 DOM 文本核对。

首次探针有两项脚本错误：jsdom 的 MathML 节点不提供脚本所访问的 `dataset`。改用 `getAttribute` 后仅重跑这两项，均通过；原结果保留，汇总明确标注。这不是产品错误，也没有用脚本错误掩盖产品失败。

## I1 — 正文插入按钮边界对比不足

准确位置：最终 HTML 的 `style#course-style` 中全局 `button` 规则；正文三个 `aside.proof-pause` 下的六个 `[data-action="inspect-path"]` 按钮：

| 容器 | 按钮 |
|---|---|
| `#pause-weight` | 选择AB的映射图；改成反向BA |
| `#pause-preimage` | 从AC查看归并；从BB查看归并 |
| `#pause-mechanism` | AB：有放回；AB：改为无放回 |

这些按钮实际命中 `border:1px solid #7997B6; background:#EDF4FA; color:#183A61`。祖先为正文的透明 aside/section/div，最终 body 背景由后置规则设为 `#F7F9FB`，没有 `.dt-activity` 白底，也没有其他按钮样式提高边界对比。

| 边界与邻色 | 精确计算结果 | 原合同 |
|---|---:|---:|
| #7997B6 对页面底 #F7F9FB | 2.877481757197224 | ≥3 |
| #7997B6 对按钮填充 #EDF4FA | 2.736268288025091 | ≥3 |

按钮文字对填充为 10.415520187275863，文字合格不能替代所要求的必要控件边界。这里没有把图框、表格装饰线或 disabled 元素统一当必要控件误判；也没有把主活动白底混入本问题。相同边界对白色为 3.036826805370855，可通过，所以“检查一份白底 palette 样板”恰好会漏掉正文六按钮。

依据是此前已批准 `references/visual-design.md` 的“普通文字≥4.5:1，必要图形/控件≥3:1，不四舍五入判过”，没有添加新阈值。证据是静态层叠匹配和不透明色精算；不冒称浏览器 computedStyle 或截图实测。

根因：课程另写了冷灰页面、浅蓝按钮及任意边界 hex，脱离批准的语义 token；验收也必须区分正文背景与 activity 白底，而不能只测组件模板。

最小修正规划评议：root 提出的“新增控件复用现有语义 token，按最终匹配 CSS/实际祖先底色逐类核边界”足够处理根因。无需改变主题架构或重渲染数学图。现有 `--dt-control-line:#7B8792` 对当前页面底为 3.476961682314664，对当前按钮填充为 3.306328516662042，已有可用值。

建议将 skill 合同收束为：新控件复用 runtime 控件样式/已批准 token；生成检查枚举实际使用的“控件样式 × 祖先背景”组合，分别记录边界、填充、外侧底色与状态覆盖后的有效声明，按原门槛计算。同样式同背景可以合并验一族；正文与 activity 必须分族。只禁止任意 hex 仍不充分，因为变量也可能在祖先处被重定义。已有透明度时按合成色计算；仍明确静态与浏览器证据不同。数学蓝/紫/青、现有 Manim 与数学角色不需要改动。

## 已实际通过的检查

### 媒体一致性、宽度与图像证据复用

HTML 自定义组件配置中的全部 51 个 base64 PNG 解码后 hash，与我在 M1/M2 独立复验批准的逐帧 hash 完全相同，也与当前媒体文件一致。四个正文静态 img（E3、Q3 两机制、Q4）亦逐个解码匹配批准帧。没有把图名或 manifest 自述当作像素一致证明。

复用 `correction-color-frames-run-02.md` 与 `correction-color-frames-run-02-recheck.md` 中 51 帧的 326 px 目视、真实字形、14 类线、比例、零标记及七张 footer 修订证据；本轮没有谎称重新目视全部 51 张。关键旧证据仍为必要轴约 1.976/2.047 CSS px、主轮廓 2.969、当前强调 3.270/3.288、最小混排关键主体 56 源 px（约 18.256 CSS px），修后 WO 底留白 41 源 px。

实际 DOM 与 CSS 静态预算：360 px 视口，body margin=0，main 左右 padding 各16；静态图祖先没有额外横向 padding；动态图的 `.dt-activity` 横边框被归零，`.dt-activity-body`、`.dt-authored.dt-custom`、`[data-course-component]`、`[data-media]`、`[data-displayed-group]` 的横 padding/margin 由 `!important` 归零。图 border-box 宽328，左右图边框各1，实际图内容预算 **326 px**。390 px 对应356 px；不需将图缩得比先前批准宽度更小。该结论是 CSS/DOM 推导，不是渲染后的几何测量。

### 数学角色与字体层叠

独立按题设枚举 43 条有效路径的静态代入/结果：主例及 D/E/F 的 WR/WO、E3 和 Q4。每条首位蓝、次位紫、结果青绿；D→E、E→D 虽都写2，仍按出现位置保留不同角色。DF/FD 同时核对了2与8对调。样本量分母2保持中性，统计量结果中的2与它有不同角色；中间和值不被错误全局染色。

402 个静态 MathML role 节点逐一核 token、objectId 与唯一 occurrence；没有只有 T 字母着色而结果失色的旧问题。动态反馈在 WR/WO 各检查 DE/ED/DF/FD，共8条：蓝紫实例与当前条件、路径链接相符，错误反馈未把全式染为正误色。原生选择字段是自然语言/数值纯文本，没有把 HTML 字符串塞入纯文本选择接口。

有效字体层叠：`:root[data-dt-theme="light"] math` 的 specificity 高于前后两个 `math` 选择器，因此 **CSS 指定值为20px**，不是后置 `1.16em`；正文17px，依据 `.95rem`（默认根字号下15.2px），原生活动选择/按钮16px，课程按钮继承正文或活动16px并有44px最小高度。分子、脚标的原生 MathML 实际墨迹大小仍未测，不把 CSS20px 宣称为分母字形20px。

数学对象色对白底的此前检验继续有效；当前正文底上的蓝/紫/青对比为5.7264/5.8541/5.5424，正文墨色13.4377、依据7.3037，均高于原4.5。错误与正确语义不覆盖对象角色；状态还有文本、选中边宽或标签信息。

### 主图状态与失败回退

在最终 HTML 上通过实际 condition/path/stage 控件遍历 **15 路径×3阶段=45状态**。每次先检查 loading 下无旧图/旧公式/旧目标，再人工调用 Image callback fixture 的 success：requested、displayed、实际嵌入 PNG hash、公式两观测、结果T、目标值与当前书面推导 href 均相符。paths 阶段不提前出现已算出的目标；mapping/bars 阶段的公式角色保持一致。15个 bars 目标概率另从有序路径独立计数，与实际目标 DOM 文本一致。

实际执行的失败/恢复矩阵包括：首次请求失败；A成功后同条件B失败；跨条件失败；B尚未完成时C成功后B迟到成功/失败；跨条件的旧回调成功/失败；失败后重试；loading状态导入后的旧回调隔离；failed状态导入后重新请求并恢复。失败和等待时当前说明/链接已先更新，旧 displayed 字段可以留作历史，但其图/式/目标组保持隐藏。导入后的新请求令旧 callback 失效，恢复成功后才显示一致的新组。

这些是人工 Image callback 的**分支模拟**，不是图像真实解码、网络失败或浏览器绘制检查。没有伪造 getBoundingClientRect 的页面尺寸来签布局通过。

### 完整推导与正文往返

静态数学行保留“表达式在上、依据在下”的 DOM 结构，代入、算和、除样本量、路径权重乘法、原像相加与归一化都留在完整讲解中；动态紧邻摘要通过当前路径/概率归并锚点回到这些行。长公式在 `.expression` 内可横向滚动，没有据此声称原生 MathML 已在手机逐行合适换行。

六个正文 inspect-path 操作实际请求正确帧，并把“返回刚才的推导位置”指向各自 pause；点击返回后焦点到原始节点，必要 details 打开。另通过“全部完整讲解”实际打开17个 reference details，检查没有 hidden 祖先阻止这些讲解。该结论是可达 DOM 与打开状态，不是实际滚动位置或可视曝光认证。

## REPRODUCE 控件地图

| 目标 | 实际入口 | 应核结果 |
|---|---|---|
| 切换主例机制 | `#main-map [data-action=condition][data-condition=…]` | 当前条件及其请求/草稿隔离 |
| 选路径 | `#main-map [data-action=path][data-path=AB]` 等 | 当前路径，paths 请求 |
| 路径→映射→分布 | `#main-map [data-action=stage][data-stage=paths|mapping|bars]` | 45种图/式/目标/href一致 |
| 当前书面推导 | `[data-current-link]` | 指向当前路径 sub 或当前输出 bar 行 |
| 图片失败重试 | `[data-action=retry-image]` | 新请求，成功后显示当前组 |
| 构造及同值反馈 | `#build-sample` 的 condition、四组原生控件、`submit-construction` / `retry-construction` | 当前机制的 DE/ED/DF/FD 角色、权重与链接 |
| 正文查看图并返回 | 六个 `[data-action=inspect-path]`；`[data-proof-return] a` | 请求帧正确、回原 pause |
| 打开完整讲解 | `[data-lesson-action=all-solutions]` 与各 `details.reference > summary` | 17个讲解可打开，无隐藏祖先 |
| 加载态/失败态恢复 | 实际 runtime `exportState()` / `importState()` | 新请求恢复；旧 callback 不可覆盖 |

全量实际控件清单保存在结果文件 `controls`（审查后 DOM 共208个按钮、输入、选择、summary及内部锚点），本表只将同类入口合并，不意味着遍历了每项原生测验所有选项。

## 未测边界

没有真实浏览器，未执行360×800/390×844/1280×900页面截图、200%文字缩放、真实键盘焦点外观、原生 MathML 墨迹/布局、UA select 展开外观、设备像素比和图片解码。没有声称无横向溢出、全部触控目标实际可点或首屏布局视觉通过。图像部件证据、静态 specificity/对比计算及 jsdom事件证据分别成立，不能合成为完整浏览器QA。

I1 解决及新版本复验前，维持完整 HTML 退回；本报告不授权就地修改冻结产物。
