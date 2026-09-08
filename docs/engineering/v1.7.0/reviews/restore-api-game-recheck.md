# `restoreExploration` 实施后复审：真实记录与继续动机

日期：2026-09-08。评审角色：游戏策划／持续学习动机模型专家。

复核范围固定为当前 `lesson-runtime.js` 的 `restoreExploration`、`interactive-html.md` 的恢复接口契约、`expert-review.md` 的新增验收项，以及 `tests/studio.test.cjs` 新增的三个行为测试。只复核此前 API 缺口及其对真实记录和继续动机的影响，不重做全包调研，不修改源码、技能或已有报告。

## 裁定

**批准当前修改进入下一轮从空白生成。**

`Critical`：无。

`Important`：无。此前缺口要求“导入恢复后立即进入公共记录／导出／刷新，同时不制造探索参与”，当前实现已满足；没有遗留会阻挡新生成的记录一致性问题。

`Minor`：无。存储不可用时的内存／导出边界已显式返回并提示，属于如实的持久化失败状态；不构成虚构学习证据。

该批准覆盖 runtime API、恢复契约和相关测试，不代表下一轮尚未生成的 HTML 已通过，也不代表真实学习者的持续投入或延迟保持已被证明。

## 实施核对

### API 边界与原子写回

`lesson-runtime.js:611–630` 的 `restoreExploration` 只接受定义中类型为 `interactive` 的活动，并在写入前递归检查 JSON 值、循环引用、符号、非有限数和 100000 字符上限；随后用序列化再解析得到独立快照。校验失败不会触碰现有活动状态或 storage。返回的 `exploration` 也是副本，调用方修改输入或返回值不会反向修改 runtime。

方法通过实例在 `lesson-runtime.js:1316–1325` 暴露，未知 ID、非 interactive 类型和测试覆盖的非法输入均拒绝。实现没有把 `explore`、quiz 或其他评分活动当成恢复目标，符合此前“只允许已知 interactive”的条件。

### 真实学习记录不变量

实现直接替换目标活动的 `exploration`，没有调用 `reduceActivity`／`transition`，也没有派发 `dt:exploration` 或 `dt:restore`。这保留了真实用户操作与恢复动作的身份边界：真实参数改变仍由 `dt:exploration` 记录，恢复合并不会新增模拟、作答或结果事件。

三个新增测试检查并通过了活动的 `attempts`、`exposure`、`review`、`explorationCount`、`participated`、`lastInteractionAt`，以及 `currentActivity` 不因恢复改变；只允许保存元数据 `updatedAt` 更新。存储失败时 API 返回 `persisted:false`，完整快照仍可从当前内存状态和公共 `exportState()` 读到，并显示现有保存失败提示；实现没有把这类状态包装成刷新后必然可恢复。

### 导入、导出、刷新与多活动顺序

当前 `importState` 在派发 `dt:restore` 前先保存导入状态；新增契约要求组件在 `dt:restore` 的同步处理内合并当前页和导入的真实接触，再调用 API，随后自行重绘。测试“两个 interactive 依次合并”通过：立即导出包含两项接触，没有恢复递归或额外 `dt:exploration`，重新挂载后两项仍在。

这也解决了此前只在组件闭包中合并而导致的导出／刷新丢失。API 每次从目标当前活动写入自己的快照，不会用旧的整体状态覆盖另一组件的刚写回数据。

## 对继续动机的影响

修复保留了有意义的继续路径：结果接触可以作为探索记录的一部分随导入和刷新保留，组件可以据条件身份显示“已见结果后的再判断”，并将下一次真正改变参数的行为继续记为一次探索。恢复本身不增加参与数量，避免结尾把页面恢复误报为新的学习行动。

`interactive-html.md:193–207` 已明确要求作者先合并真实接触、调用 API、再自行重绘；条件身份合并、原预测不可变性和“同条件／改变条件”的解释仍由组件负责。`expert-review.md:27–35` 将立即导出、重新打开、多组件顺序、存储失败提示和无额外操作次数列为固定验收项。API 因而成为可靠的记录桥接，不会替代实际选择、预测或新条件挑战。

仍需保持的产物边界是：下一轮 HTML 必须实际显示与合并记录一致的辅助／结果接触措辞，且真实参数操作才产生新参与；本次 API 测试不能替代该 HTML 文案与可玩路径复审。

## 测试证据

已运行：

- `node --test tests/studio.test.cjs`：11/11 通过。
- `node --test --test-name-pattern='restor|custom restorers|invalid exploration' tests/studio.test.cjs`：3/3 通过。
- `git diff --check`：通过。

测试使用 JSDOM、受控时间和 mock storage，证明的是 runtime 的状态与事件行为；不证明真实浏览器视觉或真实学习收益。

## 当前实际文件 SHA-256

| 文件 | SHA-256 |
| --- | --- |
| `plugins/dialogue-tutor/skills/dialogue-tutor/assets/interactive/lesson-runtime.js` | `db7b07aa2feb4b0e2a9c938a504117639e441d2ac5db2212b293e21332708b8d` |
| `plugins/dialogue-tutor/skills/dialogue-tutor/references/interactive-html.md` | `d85e93a23d1baaa6b1ec69b87bf6d214c7a9bf981c81cb2047ee2440f5754605` |
| `plugins/dialogue-tutor/skills/dialogue-tutor/references/expert-review.md` | `28e504ca0a9d123539215e81624b1620b602aeadd147e8d06a7198bbabeb6cd1` |
| `tests/studio.test.cjs` | `5ce78297db5898513a60ea9db4fe16974115ef0279f7e5b418f937df9472ebf9` |
| `docs/index.html` | `45f668918d8affaae5d9de20e87e9274d1b5d7ba32c26f8f85b5a779e2704a42` |
