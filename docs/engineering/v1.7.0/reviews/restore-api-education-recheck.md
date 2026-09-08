# 教育学定点复审：restoreExploration API 与恢复契约

复审日期：2026-09-08。范围仅为 run-02 新增的恢复写回接口、对应技能契约和行为测试；未修改任何文件，未运行或评价新的课程 HTML，不把本报告当作 HTML 通过。

**裁定：C0 / I0 / M0。当前技能可以再次交给独立生成者从空白生成。** 这表示旧持久化阻断在工程层已有可验证的写回路径，不表示接口实现或下一份 HTML 获得最终交付通过。

## 实际核对

阅读了：

- `repo/plugins/dialogue-tutor/skills/dialogue-tutor/assets/interactive/lesson-runtime.js`
- `repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/interactive-html.md`
- `repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/expert-review.md`
- `repo/tests/studio.test.cjs`

独立执行：

- `node --test tests/*.test.cjs`（在 `repo/` 内）：**66/66 通过**，包括新增的 3 个 studio 恢复测试。
- 新增测试覆盖了快照复制与立即导出/重开、两个 interactive 依次合并与无递归/无额外参与、非法输入原子拒绝及存储失败返回 `persisted:false`。

## 旧持久化缺口是否已关闭

**E1 的工程缺口已关闭。**

`lesson-runtime.js:611–630` 的 `restoreExploration`：

- 只接受已知 `interactive` 活动和顶层 JSON 普通对象；
- 在写入前递归拒绝循环引用、函数、`undefined`、非有限数、非法对象和符号属性，并执行 100000 字符上限；
- 先完成验证及 JSON 深拷贝，再替换该活动的 `exploration`；
- 通过现有 `save()` 进入公共 state、浏览器存储和 `exportState()`，而不是停留在组件闭包。

`lesson-runtime.js:334–345` 仍明确把 `dt:exploration` 视为真实探索：它递增 `explorationCount`、设置 `participated` 并更新时间。因此恢复写回没有复用该事件是必要且正确的边界。

`interactive-html.md:193–207` 已明确要求组件在 `dt:activity-mounted` / `dt:restore` 的同步路径中合并本页与导入的真实接触，再调用 `restoreExploration`；真实参数改变仍须走 `dt:exploration`。这让“立即导出/刷新不丢失”和“恢复不新增参与”成为两个可分开测试的动作。

## 逐项行为核对

### C：无 Critical

没有发现会导致状态伪造、数据泄漏到错误活动或整个恢复路径不可执行的 Critical。

### I：无未解决 Important

- **旧导入后保留接触：通过。** 新测试在旧文件导入后通过 `dt:restore` 合并当前 contact，再立即导出；导出的公共 state 和重新打开后的 state 均含合并接触。
- **冻结快照不倒改：通过。** 两组件测试保留 prediction 对象（包含其时间和 `hadReference`）的逐字段相等；后来 contact 合并只追加 contact，不重写已提交 prediction。
- **恢复不新增学习动作：通过。** 新测试确认恢复前后 `attempts`、`exposure`、`review`、`explorationCount`、`participated`、`lastInteractionAt`、`currentActivity` 不变；监听器确认没有递归 `dt:restore` 或额外 `dt:exploration`。
- **多组件不互相覆盖：通过。** 两个 interactive 按顺序处理 restore 后，立即导出和重新打开均保留各自 contact；之后只对一个组件发真实 `dt:exploration`，仅该组件计数增加。
- **存储失败口径：通过。** `save()` 返回 false，`restoreExploration` 返回 `{persisted:false}`；新快照仍在内存和公共导出中，面板显示 storage unavailable 提示。技能文档明确不能承诺刷新恢复。接口没有把失败说成已持久化。
- **输入原子性：通过。** 新测试对 null、数组、Infinity、NaN、函数、undefined、Date、循环及超限输入，以及未知/非 interactive ID 均确认抛错；state 与原存储值保持不变。源码先校验再触碰活动记录。

### M：无未解决 Minor

未发现与旧 Important 相关的新 Minor。顶层 `updatedAt` 随 `save()` 更新已在技能文档明确为保存元数据例外；活动级学习证据字段不变。测试与 `expert-review.md:32` 的新增验收要求相符。

## 实现边界与后续产物复审条件

公共 runtime 只负责把完整 exploration 快照安全写回；条件身份合并和每个 prediction 的不可变性仍由生成的自定义组件负责。该分工已在 `interactive-html.md:197–207` 写明，并由测试用 frozen prediction 与 contact 追加覆盖。下一份 HTML 仍必须实际证明组件没有用 `restoreExploration` 改写历史预测，且在同条件、变更条件、只揭示和收束文案路径中保持旧教育契约。

## 哈希记录

| 实际读取文件 | SHA-256 |
| --- | --- |
| `repo/plugins/dialogue-tutor/skills/dialogue-tutor/SKILL.md` | `61af8371b3cf41be3ca9cbf179a045b3a56de9ab24328d4f9721d73a3fbc0052` |
| `repo/plugins/dialogue-tutor/skills/dialogue-tutor/assets/interactive/lesson-runtime.js` | `db7b07aa2feb4b0e2a9c938a504117639e441d2ac5db2212b293e21332708b8d` |
| `repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/interactive-html.md` | `d85e93a23d1baaa6b1ec69b87bf6d214c7a9bf981c81cb2047ee2440f5754605` |
| `repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/expert-review.md` | `28e504ca0a9d123539215e81624b1620b602aeadd147e8d06a7198bbabeb6cd1` |
| `repo/tests/studio.test.cjs` | `5ce78297db5898513a60ea9db4fe16974115ef0279f7e5b418f937df9472ebf9` |

