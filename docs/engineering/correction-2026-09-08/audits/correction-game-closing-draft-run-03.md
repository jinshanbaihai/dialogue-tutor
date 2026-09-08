# Run03 结尾实现独立游戏复核（冻结前草稿）

评委：替补游戏/学习投入席 `correction_runtime_02`，AI 代理。本人此前实现通用 runtime 导入/导出边界，未编写 run03 课程、组件或结尾；不是原游戏席，也不是实际人类学员。此次只审结尾增量，不能据此宣称整章、浏览器视觉或学习效果通过；既往组件 211 断言不并入本次。

## 对象与方法

保留旧稿 `game-closing-draft-run-03-snapshot` 和新稿 `game-closing-draft-run-03-snapshot-v2`。实际操作新稿：

- HTML SHA-256 `dcf48266c5a6c9676673073a6381adeef18d8326bd8eba64e747ccd7b04b68fc`
- JSON SHA-256 `11bc22a9ade2864f070a26ec4c2e9ed35f73a8eb1d1b6c19425dc2d17595d206`
- JS SHA-256 `9c116351afac4b77ab310460f699177b13935acdaa5a762678018010cbaa90a5`

本人编写并执行 `correction-game-closing-draft-run-03-probe.cjs`，从该 HTML 内联脚本启动独立 jsdom 页面，原生点击 summary、比较、提交、修复、来源返回、结尾按钮和闪卡控件。没有调用作者的 Run03 判分/定位/下一步 API，没有 Image.onload 桩，没有伪造可见矩形。scrollIntoView 只记录真实目标 ID；不证明浏览器实际滚动位置。固定时间用于真实 getReviews 到期路径，公开状态只读；唯一恢复夹具为合法导出记录将活动 status 设为 skipped 再走公共 importState，明确不宣称 document 模式存在原生 skip 按钮。

## 实际核对的学习循环

| 状态/操作 | 观察与实际目标 |
|---|---|
| 未核看，只有一个目标核看 | 不提前显示比较结论；结尾依次真实定位 WR group4、group6。 |
| 双目标已观察，未提交 | 显示 WR 1/3 对 2/9，明确没有自己的判断；不新增答卷。 |
| WR/WOR × 正误 × 辅助/无辅助 | 结果分别为 WR 大于、WOR 相等；已见结果后区分本人判断与结果一致/有差异，并保留提交时辅助身份。 |
| 已提交但结果未呈现 | 只保留原判断待核对；核看后 presented 可以前进，草稿、判分、辅助与其余首答字段不改。 |
| 错误，包括辅助错误 | 主入口打开本次 repair；真实源按钮到该抽法完整推导，正文返回按钮回到原 owner/condition。 |
| 重新打开 | 明确是新草稿未提交，保留历史而不冒认新回答。 |
| 下一步 | 双 mean 已完成时，未见 maximum 称开始，见过称带参考；两 maximum 做完到 Q4；Q4 有答卷称回看。均实点到真实活动。 |
| 跳过恢复 | 说明跳过不是错误；已核看后返回同项作答，不新增答卷。 |
| 结尾初次/未自评/提前/到期回忆 | 实际卡 0 初次正面、卡 1 未自评背面继续、显式提前卡 0 的真实 item、两卡到期后最早 item 的卡 0 正面；打开回访不新增评价，卡 1 未完成状态保留。 |

所有结尾回答和回访不要求文字输入。动机来自对原预测的具体回馈和可自选的既有任务，结尾保留自由完整推导回看；没有用按钮数量、停留时长或测试数量替代学习效果。

## 保留的问题与修正验据

此前 `correction-game-draft-run-03.md` 记录完整稿没有兑现开场问题的实际结尾/回访。新增第 7 节的 `course-closing` 与 `end-recall-navigation` 已按上述真实状态覆盖该缺口，不以页中旧按钮替代结尾收束。

作者报告并修正原生闪卡事件冒泡时节点已移除导致结尾不即时刷新的缺陷。本人独立在旧 HTML `15cd0a2d867084ded7aebc05908a99ebc4b3d78c063d5758e7905482f6549f20` 执行同一场景：翻卡 1、评价卡 1、翻卡 2 后的三个结尾标签断言失败；在新稿同场景 10 断言通过。证据分别为 `correction-game-closing-draft-run-03-old-card-results.json` 与 `correction-game-closing-draft-run-03-card-results.json`。这证明实际修正，而非只采用作者自检结论。

首轮评委测试有两项假设过强，原结果 `correction-game-closing-draft-run-03-initial-probe-results.json` 保留：首答的 presented 合法从 false 变为 true，不能要求整个对象字节不变；未翻过的初始闪卡可以没有 cards[0] 对象。调整为冻结回答字段不变、初始无 revealed 后重新执行，不记为课程缺陷。

## 草稿结论

独立完整复跑 16 场景、115 断言全部通过，0 未捕获页面错误，证据 `correction-game-closing-draft-run-03-results.json`。当前所审结尾增量 C=0 / I=0 / M=0，同意进入正式冻结整课审核；此前结尾缺口已在此草稿范围闭合。作者后续 bcd536 HTML 仅变更两个静态 shelf 分数节点 ID、JS 不变，本次行为结论仍只绑定上列实际操作的 dcf482 快照。冻结后的整章终审需要本人再次实际操作最终 hash；本报告不替代该步骤。
