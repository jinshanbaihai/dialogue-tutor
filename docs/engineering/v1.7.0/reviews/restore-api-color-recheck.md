# DialogueTutor 1.7.0：restore API 色彩契约复核

复核日期：2026-09-08。复核角色：美术／摄影色彩专家。

## 范围与裁定

本轮只检查新增的 `restoreExploration` 恢复接口、运行库同名方法及 `save` 返回持久化状态，是否与已批准的 M1 色彩条款冲突。`visual-design.md`、`SKILL.md` 与 `engagement-and-narrative.md` 未改；本轮不重新评审全包、不复核行为正确性、不运行浏览器。

**裁定：无色彩契约冲突，继续准许当前技能用于新的生成。** 既有 M1 条款仍要求图例和文字分别对应真实 SVG 的 `fill`、`stroke` 与标记形状，并在明暗主题中保持对象语义一致。新增恢复接口只保存 interactive 的探索快照、返回 `{exploration, persisted}` 并触发组件按恢复状态重绘；它没有新增颜色、改写颜色 token、改变 SVG 属性语义或替换明暗主题。因此不削弱也不旁路 M1。

该准许仅覆盖技能继续生成的色彩契约准入。实际生成后仍须按既有流程核对文字与真实 SVG 属性；H5 真实浏览器截图和实际 HTML 视觉验收仍待，不能据此声称课件视觉通过。

## 定点核查

- `references/interactive-html.md` 将恢复写入限定为已知 `interactive` 活动的探索状态，并要求组件先合并真实接触、再调用 `restoreExploration`，最后自行重绘。恢复写入不派发新的探索事件，不会把状态恢复误算成学习动作；这与色彩条款无语义冲突。
- `assets/interactive/lesson-runtime.js` 的同名方法仅校验 JSON 快照、深拷贝保存到对应活动的 `exploration`，调用 `save()`，并返回副本与 `persisted` 状态。代码没有写入颜色值、SVG `fill`、`stroke` 或主题变量；持久化失败也只报告保存状态，不改变图形颜色身份。
- `references/expert-review.md` 新增的恢复后立即导出／重新打开验收只检查接触记录、操作次数、多组件写回和存储失败提示；既有“图形说明所称的填色、轮廓与形状必须对应真实 SVG”仍独立存在。两者是行为持久化检查与视觉语义检查的并列要求，没有冲突。

## 生成后保留的色彩门槛

新的生成仍应使用既有语义 token。恢复状态改变参数时，组件需要使用同一绘制逻辑重绘，并保持同一对象的填充、轮廓和标记身份；不得因为恢复接口返回状态或存储失败分支而另造颜色说明。该条款属于生成后实际 HTML／截图核查范围，本轮没有正式预览设施，故不提前关闭 H5。

## 当前文件 SHA-256

| 文件 | SHA-256 |
| --- | --- |
| `repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/interactive-html.md` | `d85e93a23d1baaa6b1ec69b87bf6d214c7a9bf981c81cb2047ee2440f5754605` |
| `repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/expert-review.md` | `28e504ca0a9d123539215e81624b1620b602aeadd147e8d06a7198bbabeb6cd1` |
| `repo/plugins/dialogue-tutor/skills/dialogue-tutor/assets/interactive/lesson-runtime.js` | `db7b07aa2feb4b0e2a9c938a504117639e441d2ac5db2212b293e21332708b8d` |
| `repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/visual-design.md` | `ff6c2cdc10e6e09d3e45bc3bd1d2b65cfd43024ae0dfd7445e7e9df108d34652` |
| `repo/plugins/dialogue-tutor/skills/dialogue-tutor/SKILL.md` | `61af8371b3cf41be3ca9cbf179a045b3a56de9ab24328d4f9721d73a3fbc0052` |
| `repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/engagement-and-narrative.md` | `38b27dfb2994df6534d970acbc9ab25edcbbac2c86b693576e2a7ac7eadd8ce1` |
