# interactive 恢复契约：运行时 API 定点核查

复核日期：2026-09-08。此文件只核对现有 `lesson-runtime.js` 是否能直接承载“导入更早记录后合并本页已揭示结果接触，立即刷新/导出不丢失，恢复不新增参与”的技能契约。不修改 runtime、技能或 HTML，也不据此判断正在生成的 HTML 有错。

**结论：存在一个真实的持久化 API 缺口。** 运行时能让组件读取并在内存中合并接触，也能通过 `importState` 间接写回；但没有专门的“无参与计数 interactive 状态合并/恢复”接口。按当前公开、直观的 `dt:restore` + `getState` 用法，无法同时保证合并结果立即进入运行时状态、立即导出/刷新不丢失、且不制造探索参与。建议增加最小的无参与合并接口，或在生成契约中明确受控的写回方案。这个缺口不推翻前一份技能批准，因为它属于当前 runtime 工程契约准备，不是对下一份 HTML 的错误判定。

## 源码事实

| 位置 | 实际行为 | 对契约的含义 |
| --- | --- | --- |
| `lesson-runtime.js:334–345` | `reduceActivity(..., {type:"explore", state})` 写入 `state.exploration`，并递增 `explorationCount`；随后除 bookmark/draft/skip/retry/note 外将 `participated=true`，更新时间也被写入。 | 用 `dt:exploration` 发送合并状态可以持久化，但会把恢复合并记成一次探索参与；这违反“恢复不新增参与”。 |
| `lesson-runtime.js:610–617` | `transition` 调用上述 reducer，然后 `save()`。 | 没有区分“学习者改变参数/结果”与“恢复时合并状态”的写入路径。 |
| `lesson-runtime.js:1014–1017` | `notifyCustomRestore` 对已挂载 interactive 派发 `dt:restore`，detail 为 `{activityId, state: copy(state.activities[id].exploration)}`。 | 组件能收到当前导入后的探索副本，但直接修改该 detail 不会写回 runtime；它不是可写引用。 |
| `lesson-runtime.js:1294–1302` | 实例公开 `getState`、`exportState`、`importState`、`refresh`；`getState` 返回 `copy(state)`，没有 set/merge 方法。 | 组件可读状态但不能通过现有 getter 原地持久化合并后的探索记录。 |
| `lesson-runtime.js:1253–1259` | 文件导入先 `prepareSession`，随后 `closeDueSolutions(); save(); renderActivity(); notifyCustomRestore()`。 | 导入后的保存发生在 `dt:restore` 之前；组件在 restore 回调里刚合并的结果接触还不在这次保存或随后的 runtime 导出状态中。 |
| `lesson-runtime.js:464–465`、`1241–1247` | 导出封装直接复制 runtime `state`；面板导出也直接调用内部 `exportEnvelope(lesson,state,...)`。 | 组件只保存在自己的闭包或自行写另一份存储，不能让公共导出立即包含合并接触。 |
| `lesson-runtime.js:577` | 首次挂载从存储读取后调用 `prepareSession`，但没有 custom merge 回调。 | 如果合并只留在上次页面的闭包，刷新时无法恢复；必须已经写进公共 state 或另有明确导出/存储协议。 |

独立 Node 定点试验也观察到：对 interactive 调用 reducer 的 `explore` 事件，`explorationCount` 从 0 变 1，`participated` 从 false 变 true；实例 `getState` 的语义由源码中的 `copy(state)` 确定为副本读取。实际 runtime 文件 SHA-256 为：

`49b17f35fc35fda0e0ba432743313031b71fcc33f8c4b787ccccf2115c5563bb`

## 哪些部分现有 API 已能实现

1. **读取本页事实可以实现。** `getState().activities[id].exposure` 能读取公共活动级参考接触；自定义 `exploration` 可保存结果条件身份、来源和时间。现有 `prepareSession(..., previousState)` 在同一会话中也会保留先前活动级 exposure，故旧导入不能直接抹掉这部分事实。
2. **合并算法本身可以由组件实现。** 在 `dt:restore` 中把导入探索历史与组件在本页缓存的结果接触按活动/条件身份去重，且不增加模拟次数或作答记录，逻辑上可行。
3. **下一次真实探索事件可带上合并结果。** 组件可以等到学习者下一次真正改变参数时，将完整合并后的 exploration 发出；此时增加一次参与是合理的，因为确实有学习者探索动作。但这不满足“立即刷新/导出”这一更强契约。
4. **`instance.importState` 有一个技术性绕路。** 组件可以构造带合并 exploration 的合法 envelope，再调用 `importState`；该方法走 `prepareSession` 和 `save`，本身不调用 `reduceActivity({type:"explore"})`，所以不会由 runtime 增加 explorationCount。然而它会再次触发 `dt:restore`（L1298），容易产生递归；组件必须加恢复哨兵并处理多个 interactive 同时合并的顺序。这是可行的临时实现技巧，不是清晰的专用契约，也不应让每个课程作者自行复制。

## 最小工程建议

增加一个实例级、仅用于恢复/合并的公开方法，例如：

`mergeInteractiveState(activityId, exploration, {reason: "restore"})`

最低行为应是：

- 校验活动确为 `interactive`，复制并写入该活动的 `exploration`；保留现有导入前与导入后结果接触的去重/合并责任在组件或明确的 runtime helper。
- 调用保存和必要的重绘，但不经过 `reduceActivity`，不增加 `explorationCount`，不设置 `participated`，不更新 `lastInteractionAt`，不移动 `currentActivity`。
- 不把此次合并再发成学习者 `dt:exploration`；如需通知，使用单独的内部恢复通知，避免 `dt:restore` 递归。
- 公共导出从更新后的 runtime state 读取；刷新/重新挂载能从该 state 恢复。
- 对 activity ID、普通可序列化对象和大小限制沿用现有校验边界；建议为合并写回补一个针对“计数、参与标志、导出、刷新”的 runtime 单测。

在该接口存在前，最小合法替代是由 runtime 明确承认“受保护的 `importState` 写回”方案，并提供防递归示例；仅写技能中的 `mergeReferenceAfterRestore()` 局部变量不足以满足立即导出/刷新。不要把 `dt:exploration` 当作恢复写回接口，因为源码明确会制造参与计数。

## 复审裁定

- **真实缺口：** 没有无参与计数的 interactive 状态恢复/合并写接口；`dt:restore` 是只读副本事件，导入保存先于它，公共导出无法自动包含回调内的新合并。
- **可行实现：** 读取、条件身份合并、下一次真实探索时携带合并状态均可实现；用受保护的 `importState` envelope 也能技术性写回，但属于绕路，需防递归和并发顺序问题。
- **未据此新增 HTML 缺陷：** 本核查未运行或评价正在生成的 HTML；缺口只说明工程层应在生成前提供专用 API，或把临时写回协议写成可验证契约。



## 对 `instance.restoreExploration` 拟议方案的实施前批判

该接口方向可实施，并比用 `dt:exploration` 冒充恢复更合适；但必须把以下条件写入实现和行为测试。此处仍不代表接口已经实现或通过。

### 方案中应保留的边界

- 仅接受已知且类型为 `interactive` 的活动 ID；未知 ID、`explore`、quiz 等活动必须拒绝。
- 先完整校验，再替换 `state.activities[id].exploration`；输入须是 JSON 普通对象，拒绝数组、`null`、循环引用、函数、`undefined`、非有限数等不能稳定 JSON 往返的值。序列化后的字符数上限应与现有 `dt:exploration` 的 100000 限制一致。
- 复制后的替换必须是原子操作。校验失败或保存失败时不能留下半个 exploration 或部分活动状态。
- 只能持久化该 interactive 的 `exploration` 和必要的存储元数据（例如顶层 `updatedAt`）；不得改变 `attempts`、`exposure`、`review`、`explorationCount`、`participated`、`lastInteractionAt` 或 `currentActivity`。
- 不派发 `dt:exploration` 或再次派发 `dt:restore`，也不调用会再触发自定义恢复的路径，避免递归。组件在接口返回后自行重绘。
- 调用必须发生在 `dt:activity-mounted` 或 `dt:restore` 的同步处理路径中；不能等异步回调，否则用户在导出或刷新前可能看到尚未写回的闭包状态。
- 组件传入的是“合并后的完整 exploration”，而不是让 runtime 猜测条件身份。组件必须保留每个已提交预测的原始辅助快照和结果接触身份；`restoreExploration` 不能被用来改写旧 prediction history。这个语义仍需技能和产物测试约束，通用 runtime 无法理解每个课程自定义字段的冻结含义。

### 尚需避免的误读

“只保存 exploration”不应被理解为完全不改变任何时间字段：现有 `save()` 会更新顶层 `state.updatedAt`，这是持久化元数据，不是学习者参与。接口应明确该例外，同时保持上列活动级学习字段不变。存储不可用时应沿用现有“当前页面可继续、可导出”的错误语义，不能宣称已经完成持久化。

### 最小行为测试

1. 用已知 interactive ID 调用接口，确认 exploration 进入 `getState()`、`exportState()` 和 mock storage；再刷新/重新挂载，确认接触仍在。
2. 调用前后逐字段比较：`attempts`、`exposure`、`review`、`explorationCount`、`participated`、`lastInteractionAt`、`currentActivity` 均不变；仅允许顶层 `updatedAt` 变化。
3. 监听 `dt:exploration`、`dt:restore`，确认接口调用不派发任一事件；组件自行重绘一次且不递归。
4. 先在当前页保存结果接触 A，再导入不含 A 的更早文件，收到 `dt:restore` 后同步合并并调用接口；在 `importState` 返回后立即调用 `exportState()`，确认 A 已进入导出，且 explorationCount/participated 未增加。
5. 关闭页面或重新挂载后重复第 4 项，确认合并接触从公共 state 恢复；再改变参数触发真实 `dt:exploration`，确认这一次、且只有这一次增加探索计数。
6. 先有预测 P 的冻结辅助快照，再恢复合并结果接触；确认 P 的条件、原判断、提交时间和 `predictionHadReference` 不变，新轮次才获得“已见结果后”的标识。
7. 对未知活动、非 interactive 活动、数组/null/超限/循环或不可 JSON 往返值调用，确认拒绝且整个 state 与 storage 均不变。
8. 构造两个 interactive 同时恢复的页面，确认一个组件的写回不会丢掉另一个组件刚合并的字段；至少验证顺序写入和导出结果。

**实施前裁定：** 该接口设计可作为最小工程修复继续实施；必须满足上述“无参与写回、同步持久化、不可递归和快照不倒改”条件后，再做行为复审。当前报告不预判实现通过，也不预判生成 HTML 有错。

