# `restoreExploration` 实施前批判：真实记录与继续动机

日期：2026-09-08。评审角色：游戏策划／持续学习动机模型专家。

范围固定为当前 `assets/interactive/lesson-runtime.js` 与拟议的实例 API `restoreExploration(activityId, value)`。本报告只评估实施前的工程契约风险和验收条件，不修改 runtime／技能，不重做课程全包调研，也不判断尚未生成的 HTML。

## 裁定

**方案方向可继续实施，但当前 API 尚未实现，不能称已通过。** 这是解决真实缺口的合适最小接口：它可以把自定义组件在 `dt:restore` 中合并的结果接触写回公共学习记录，同时不把恢复动作计为学习者探索。实施必须满足下列行为条件后，才可做 API 复审。

设计层面没有 Critical。若没有该接口或等价的受控写回路径，`dt:restore` 仍不足以同时满足“立即刷新、立即导出／刷新可恢复、恢复不新增参与”三项要求；这项缺口应作为实施前 Important 处理，而不是让课程作者用 `dt:exploration` 绕过。

## 当前 runtime 的事实

| 位置 | 当前行为 | 对拟议 API 的要求 |
| --- | --- | --- |
| `lesson-runtime.js:134–143` | 每项活动同时保存 `exploration`、`explorationCount`、`participated`、`lastInteractionAt`、`attempts`、`exposure` 和 `review`。 | API 必须只替换目标 interactive 的 `exploration`；不能把恢复写成活动参与或作答。 |
| `lesson-runtime.js:334–345` | `reduceActivity({type:"explore"})` 写入探索状态，递增 `explorationCount`，随后设置 `participated=true` 并更新 `lastInteractionAt`。 | `restoreExploration` 不能调用 `transition` 或该 reducer；真实用户改变参数仍继续走 `dt:exploration`。 |
| `lesson-runtime.js:605–617` | `transition` 保存并重绘，但会先走上述 reducer。 | 新 API 需有独立的直接写回路径，并明确是否只由调用方重绘。 |
| `lesson-runtime.js:1014–1017` | `dt:restore` 每个 interactive 收到 `{activityId,state}`，其中 `state` 是 `copy(...)` 的副本。 | 直接改 `detail.state` 不会写入 runtime；API 必须同步接受合并后的完整对象并保存。 |
| `lesson-runtime.js:1253–1259`、`1294–1303` | 导入先 `prepareSession`、`save`、重绘，再派发 `dt:restore`；实例目前只有 `getState`、`exportState`、`importState`、`refresh` 等接口。 | restore 回调中的合并必须在 `importState` 返回前写回，才能立即进入公共导出和后续刷新；不能依赖下一次真实探索。 |
| `lesson-runtime.js:1296` | `getState()` 返回深拷贝。 | 组件需读取当前 runtime 状态后自行合并，不能假定 getter 返回可写引用。 |

当前文件 SHA-256：`49b17f35fc35fda0e0ba432743313031b71fcc33f8c4b787ccccf2115c5563bb`。

## 对方案的游戏策划评估

### 真实记录边界是正确的

将合并后的结果接触放入公共 `exploration`，可让收束活动在同一次导入后读到“已经看过哪个条件下的结果”，也让导出／重新挂载继续保留该事实。API 不应写 `attempts`、`review` 或 `exposure`；结果接触和参考接触由组件按各自身份保存，收束再据此选择“已查看”“已见结果后的再判断”等准确措辞。

API 自身不能理解课程的条件语义，因此调用方必须传入**完整合并后的 exploration**，而不是一小段局部补丁。合并时要保留旧预测的条件、原判断、提交时间和辅助快照，以及按总体、机制、参数、目标事件区分的结果接触集合。否则导入旧记录虽没有增加参与计数，却会抹去学习者已经做过的探索证据，收束仍会产生虚构或错误的“首次”叙述。

### 不制造参与是继续动机的前提

当前 `dt:exploration` 明确代表学习者改变了有意义参数或进行了真实探索；它会增加探索计数并标记参与。把 restore 合并伪装成这一事件，会把“页面恢复了已有发现”显示为新的行动，破坏收束的可信度，也会让继续动机建立在虚假完成感上。拟议 API 绕开 reducer 的方向正确；但必须证明恢复前后活动级 `explorationCount`、`participated`、`lastInteractionAt`、`attempts`、`exposure`、`review` 和 `currentActivity` 均未因 API 调用改变。顶层 `updatedAt` 是保存元数据，可因 `save()` 更新，但应在契约中明确它不是参与事件。

真实用户下一次改变参数仍应派发 `dt:exploration`，并且只在那一次增加计数。这样“已见结果后的再判断”可以作为诚实的继续任务，而不是把恢复过程奖励成一次新探索。

### 立即重绘是用户可见正确性的前提

拟议 API 不派发 `dt:restore` 或 `dt:exploration` 来避免恢复递归，因此它不会替自定义组件调用 `update()`。技能作者在 `dt:activity-mounted`／`dt:restore` 中合并后，必须在 API 成功返回后同步重绘一次。否则公共记录已经含有结果接触，页面却仍显示未标记的预测或“首次”文案，下一次选择的动机和反馈会与记录脱节。

API 不应自行触发自定义事件；若实施者让它再次发 `dt:restore`，当前导入回调会递归。若调用方重绘失败，不能把未更新的界面写成新的学习动作；行为测试应确认一次恢复只产生一次重绘和一次保存语义。

## 必须满足的实施条件

1. **活动与输入校验。** 只接受已知且类型为 `interactive` 的 `activityId`；未知 ID、`explore`、quiz、flashcards 等必须拒绝。`value` 必须是可 JSON 往返的普通对象，拒绝 `null`、数组、原始值、函数、`undefined`、循环引用和非有限数；序列化长度沿用现有 100000 字符上限。拒绝时 state、storage 和界面不得部分改变。
2. **深拷贝与原子写回。** 先完整校验并深拷贝，再替换目标 `exploration`；不能保留调用方对象引用，也不能边校验边写字段。成功后立即调用现有保存路径。存储不可用时沿用现有警示语义，不能在文案中声称永久保存。
3. **严格的学习记录不变量。** API 调用不得经过 `reduceActivity`，不得派发任何学习或恢复事件，不得改变 `attempts`、`exposure`、`review`、`explorationCount`、`participated`、`lastInteractionAt`、`currentActivity` 或其他活动。允许改变的只有目标 interactive 的 `exploration` 和保存所需的顶层 `updatedAt`。
4. **同步生命周期。** `dt:activity-mounted` 或 `dt:restore` 的处理函数必须同步完成“读取当前 runtime → 合并本页接触 → 调用 API → 自己重绘”。API 返回／`importState` 返回后立即调用 `exportState()` 应看到合并结果；不能把写回推迟到计时器、微任务或下一次参数操作。
5. **条件身份和快照。** 组件负责传入完整合并对象。旧预测的参数、判断、时间和 `predictionHadReference` 快照不可被结果接触合并改写；同条件新判断才标记为已见结果后的检查，改变条件只在实际覆盖时标记。API 不猜测或重写这些语义。
6. **多组件顺序。** `notifyCustomRestore()` 会逐项通知多个 interactive。连续调用 API 时不能使用调用前的陈旧整体 state 覆盖另一组件刚写入的探索；应按当前 runtime state 写入目标项，并测试两个组件顺序恢复后的导出完整性。

## 最小行为验收

- **无参与写回：** 对已知 interactive 写入结果接触 A；比较调用前后活动记录，确认上述学习字段不变，只有目标 `exploration` 和允许的 `updatedAt` 改变。
- **导入立即可见：** 先保存含 A 的当前页状态，再导入不含 A 的旧 envelope；在 `dt:restore` 中合并并调用 API，`importState` 返回后立即检查 `getState()`、`exportState()` 和 mock storage，均含 A。
- **刷新可恢复：** 关闭并重新挂载后，A 仍在公共 `exploration`；页面显示已见结果身份。再改变参数，只有这次真实 `dt:exploration` 增加 `explorationCount` 并更新参与记录。
- **预测快照不倒改：** 已冻结预测 P 后合并结果接触 A，P 的条件、原判断、时间和辅助快照保持；新一轮同条件判断才显示“已见结果后的检查”。
- **条件隔离：** 在条件 C1 保存结果接触，再切换到不等价的 C2；新预测不能沿用 C1 的“已见结果”标签，除非课程明确证明参考覆盖 C2。
- **递归与重绘：** 监听 `dt:restore`、`dt:exploration`，一次导入恢复只收到 runtime 原有的一轮 restore；API 本身不再派发事件，组件更新 UI 恰好一次。
- **拒绝路径：** 未知／非 interactive ID、数组、`null`、超限和不可 JSON 往返输入均拒绝，且 state 与 storage 完整不变。
- **多 interactive：** 两个组件在同一 restore 中依次写回，最终导出不能丢掉任一方的合并结果。

## 实施前结论

`restoreExploration` 是比使用 `dt:exploration` 更清晰、更符合真实记录的最小工程方案，可以继续实施。当前 runtime 还没有该方法；在实现通过上述不变量、同步持久化、递归防护和快照测试前，不应把 API 或依赖它的生成技能称为已通过。通过后再由独立生成者从空白生成课程，并按技能新增的导入／同条件结果接触路径复审产物。
