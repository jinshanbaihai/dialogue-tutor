# Run 03 最后草稿增量：独立程序复验

结论：本轮有界增量 **C0 / I0 / M0，通过，可进入作者正式冻结**。此前媒体增量报告的 M1（15 个 path-focus 的 proofLineIds 指向错误阶段）已关闭。本报告不是完整课件正式终审，未把作者测试或旧哈希测试计作新哈希执行。

## 输入与范围

独立复制三套输入，保存在同名前缀的 `-snapshot`、`-refresh-snapshot`、`-shelf-snapshot` 目录。

| 输入 | HTML SHA-256 | 实际执行范围 |
| --- | --- | --- |
| 首次最后草稿 | `15cd0a2d867084ded7aebc05908a99ebc4b3d78c063d5758e7905482f6549f20` | 内嵌 JS；15 元数据、20 原生选择题补讲与返回、公式反馈、结尾条件路由 |
| capture 刷新修订 | `dcf48266c5a6c9676673073a6381adeef18d8326bd8eba64e747ccd7b04b68fc` | 内嵌 JS；结尾及真实回忆卡路由 14 项；根 CI 草稿 2 项 |
| 分数原像锚点修订 | `bcd536d3884afbcbfc328da8b467410286ef53a3e0661abb042a8d9ed1501de3` | 静态实际 DOM / 元数据 / 图像 bytes 8 项；没有声称执行该哈希 JS |

dcf 的 JSON SHA 为 `11bc22a9ade2864f070a26ec4c2e9ed35f73a8eb1d1b6c19425dc2d17595d206`；JS SHA 为 `9c116351afac4b77ab310460f699177b13935acdaa5a762678018010cbaa90a5`。bcd 的 JSON SHA 为 `33b41f47356499201bdcfb3a4dd6044f7fae17fd43bcc95f570af73afde8cceb`，JS 与 dcf 字节相同。

已实际核差异：从 dcf JSON 移除新增 capture click → queueMicrotask(refreshAll) 一行后，与 15cd JSON 深度相等；bcd JSON 仅 section 4 两个 `shelf-wor-group-7-2` / `11-2` ID 前缀改为 `7over2` / `11over2`（含其子推导行）。反向替换后全份 JSON 精确相等。因此保留未受影响的前稿行为证据，有根据地缩小复跑范围。

## 实测结论

1. **15 个 path-focus 元数据闭环**：每个实际 frame 的 proofLineIds 均等于相应完整 path section ID。关闭前轮 M1。
2. **20 个原生选择题实际补讲**：分别选择一个非 answer 选项，经原生提交后点击真实 native-help；补讲定位真实来源，祖先 details 展开，来源自带返回到原活动的按钮。返回后实际 currentActivity 正确，原冻结 attempt 不改；再试正确后旧错误补讲入口消失。此处依据 answer 选择错误仅测试程序路由，不当作独立数学判题验证。
3. **统计量反馈**：正确项为 `(3+7+11)/3`；解释实际点名该公式和未知 μ，不依赖“第一项/第二项”。
4. **结尾按当前状态行动**：未呈现时 pending；原判断先冻结；先定位目标 4 再目标 6；双目标后才呈现 WR 的实际比较及错误；补讲绑定当前原提交，返回不改历史。切换 WOR 后结尾采用 WOR 的等概率结果。
5. **回忆卡真实路由**：初次回忆进入卡 1 正面；卡 1 自评后翻开卡 2 不自评，微任务刷新后结尾优先“继续卡 2 尚未自评”；点击继续保留卡 2 背面与未自评状态，不增 attempt。明确提前复习卡 1 使用真实 review item，进入正面且不改原 dueAt / attempts；推进测试时钟至实际 dueAt 后，结尾优先真实到期卡 1。
6. **分数原像锚点**：bcd 实际 DOM 内 `shelf-wor-group-7over2` 与 `11over2` 各唯一；各含相应两条原像路径和 7 条完整推导行；shelf manifest 的所有 lineIds / proofLineIds / returnLineId 均唯一命中。实际内嵌 shelf PNG bytes 的 SHA-256 等于清单 `819ba5978fe4d7ea961b55513ce91bce6ff4de23ed104872a49bdfd6e5cf5cb1`。

## 测试缺陷与 CI 裁定

首次独立脚本在 15cd 完成 **93 个断言，93 通过**后，自有 recall harness 直接读取尚未初始化的 `cards['0'].revealed` 抛 TypeError。这是测试对懒初始化状态的错误假设，不是页面异常。保留原结果及异常；该次不是完整脚本通过。修正为可选读取后，dcf 的 closing / recall 独立脚本 **14/14 通过，两场景无 jsdomError**。结果中的旧 scope 文案已修正为草稿完整页面，明确只改证据标签，未改断言结果；首稿检查名 `frozen-html` 只是快照期望哈希断言，不代表正式冻结。

根 CI 草稿首次原样执行得到 **1 通过 / 1 失败**：原输入扫描把 23 个可选 `.dt-note` textarea 也当作主作答输入，触发 `23 !== 0`。此前 ready / 完整错答 / repair-return 断言已通过。根只将输入集合过滤为 `!n.closest('.dt-note')`，保留其他断言；独立复跑修订草稿在 dcf 得到 **2/2 通过**，未修改课件。该过滤准确限定已授权的可选笔记，没有泛排 details。未发现这两项维护测试的具体错误，可在正式批准后移入 repo/tests。它们是两项行为回归，不替代课程学习质量审查。

## 可复用证据

- `correction-code-last-delta-run-03-probes.cjs` / `-results.json` / `-log.txt`：15cd 首轮完整已执行部分，保留 harnessError。
- `correction-code-last-delta-run-03-refresh-probes.cjs` / `-refresh-results.json` / `-refresh-log.txt`：dcf 14 项。
- `correction-code-last-delta-run-03-ci-original.cjs` / `-ci-execution.cjs` / `-ci-original-results.txt`：根原稿与执行证据。
- `correction-code-last-delta-run-03-ci-fixed-execution.cjs` / `-ci-fixed-results.txt`：修订 CI 在 dcf 的执行证据。适配仅依赖路径和 HTML 快照路径。
- `correction-code-last-delta-run-03-shelf-probe.cjs` / `-shelf-results.json`：bcd 8/8 静态检查。

实际 JS 来自各 HTML 内嵌脚本，使用 jsdom。geometry / scrollIntoView / Image / 时钟是明确 fixture；本轮没有真实浏览器布局、PNG 解码、网络 onload 或视觉可读性证据。未重跑未受此次变更影响的 36 媒体矩阵，相关旧哈希范围见前轮媒体增量报告。未修改作者、课件、媒体、技能或运行库文件。
