# 恢复接口叙事一致性复审

复审日期：2026-09-08。范围仅限新增恢复接口及其叙事契约：interactive-html.md 的“恢复合并的持久化接口”段、expert-review.md 的对应恢复验收、interactive/lesson-runtime.js 的同名方法，并核对既有 engagement-and-narrative.md 与 SKILL.md 未被本次叙事规则改动。未检查教育或游戏行为、课程成品、截图和视觉通过性。

## 结论

**可以进入新的空白生成阶段。** 新增接口与已批准的 I1/I2/M1 叙事规则一致，且已形成可执行的恢复、失败回退和验收触发合同。本裁定只覆盖技能与公共 runtime 接口；不表示任何新生成课件或视觉结果通过。

## 证据与裁定

| 检查项 | 证据定位 | 复审结果 |
| --- | --- | --- |
| 恢复只同步持久化合并快照 | interactive-html.md:193-200 规定 restoreExploration 接收完整 interactive exploration，校验后同步深拷贝写入；恢复过程中不改作答、参考接触、复习、探索次数、参与标志、上次操作时间或当前位置。组件负责先合并真实接触、条件身份和不可变旧预测，再写回。 | 与 I1/M1 一致：恢复保存的是已经合并的事实快照，不把恢复动作叙述为学习者新操作，也不会凭持久化调用制造本人推理证据。 |
| 不生成参与、不派恢复/探索事件 | interactive-html.md:197-199、:203-205 明确不派事件；runtime:611-631 校验并写入 state.activities[activityId].exploration，随后仅调用 save，未调用 transition、dt:exploration 或恢复事件派发。公开实例方法见 runtime:1316-1321。 | 一致。I1 的“只凭揭示不能说本人完成”边界没有被恢复 API 绕开；恢复也不会新增探索次数、上次操作或叙事可称述动作。 |
| 旧预测快照与接触合并由作者负责 | interactive-html.md:199、:213-222 继续要求组件合并运行时接触、结果身份和全解接触，并由组件保存提交预测时快照；:220-222 明确同条件再判断标为已见结果，改变条件不误带无关参考。 | 一致。公共 API 不替作者决定预测是否独立，也不倒改旧预测时点；这保持 I2 当前条件关系和 M1 已见参考/结果时态的来源边界。 |
| 存储失败的可见回退 | interactive-html.md:207 规定返回 exploration 与 persisted；persisted 为 false 时完整快照仍在当前页面内存和公共导出，提示不能承诺刷新恢复。runtime:628-630 使用 save 返回值，失败时 renderPanel，并返回 persisted:false；runtime:1318-1319 的 exportState 从当前 state 导出。 | 一致。失败不会伪造“已保存”或丢掉当前页可导出的证据；叙述应依据 persisted 状态，不承诺刷新后仍可恢复。 |
| 恢复验收触发 | expert-review.md:32 要求“恢复合并后立即导出、再重新打开”：接触进入公共记录、恢复不增加操作次数、多组件依次写回不互相覆盖，存储失败如实提示。interactive-html.md:207、:220-222 同步写入同一触发及同条件已见结果要求。 | 已形成实际验收触发，覆盖 I1/M1 的记录边界与持久化时序；不替代后续真实课程的运行验收。 |

## Critical

无未解决 Critical。runtime 方法的实际路径与文档契约相符：未知或非 interactive 活动、循环引用、函数、undefined、非有限数和超出 100000 字符的快照均在写入前抛错（interactive-html.md:197；runtime:611-625）。

## Important

无新增或未解决 Important。新增接口没有把恢复合并包装成学习者参与、作答、揭示或掌握；因此不破坏 I1 的证据边界，也不改变 I2/M1 已批准的结果关系和时态规则。

## Minor

无新增 Minor。存储失败的行为已明确为 persisted:false、保留内存与导出，并要求如实提示；是否在后续生成课件中正确接入仍由新的空白生成和恢复验收确认。

## 文件哈希

| 文件 | SHA-256 |
| --- | --- |
| repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/interactive-html.md | d85e93a23d1baaa6b1ec69b87bf6d214c7a9bf981c81cb2047ee2440f5754605 |
| repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/expert-review.md | 28e504ca0a9d123539215e81624b1620b602aeadd147e8d06a7198bbabeb6cd1 |
| repo/plugins/dialogue-tutor/skills/dialogue-tutor/assets/interactive/lesson-runtime.js | db7b07aa2feb4b0e2a9c938a504117639e441d2ac5db2212b293e21332708b8d |
| repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/engagement-and-narrative.md（核对未变） | 38b27dfb2994df6534d970acbc9ab25edcbbac2c86b693576e2a7ac7eadd8ce1 |
| repo/plugins/dialogue-tutor/skills/dialogue-tutor/SKILL.md（核对未变） | 61af8371b3cf41be3ca9cbf179a045b3a56de9ab24328d4f9721d73a3fbc0052 |

