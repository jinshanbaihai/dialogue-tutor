# Run 03 冻结完整课件：独立程序终审

**裁定：批准；C0 / I0 / M0。** 结合已经完整读取的实现、前置增量复验与本轮最终 HTML 的独立实际执行，未发现未关闭的程序合同缺陷。此为程序席对冻结完整课件的正式批准，不替代其他专业席，也不是实际浏览器视觉、触屏或学习成效验收。

## 冻结身份与复现

| 项目 | 独立核对值 |
| --- | --- |
| 最终 HTML SHA-256 | `bcd536d3884afbcbfc328da8b467410286ef53a3e0661abb042a8d9ed1501de3` |
| 最终 JSON SHA-256 | `33b41f47356499201bdcfb3a4dd6044f7fae17fd43bcc95f570af73afde8cceb` |
| components.js SHA-256 | `9c116351afac4b77ab310460f699177b13935acdaa5a762678018010cbaa90a5` |
| FREEZE.json SHA-256 | `3ffc817e2b926d882cdafd2443ded1e8f294d211e817a804b068a115f1b55e6d` |
| final-hashes.json SHA-256 | `1ea901b8d9ea18201f905d71ec2d84e2ee0578385b546b24463bf6f4a42d6481` |
| 完整 exact-data.json SHA-256 | `95f8b0e67f268c062f2291dad55ecdb6c0dc877495541e242c74deafd120f95a` |
| 原创 Manim Scene SHA-256 | `3e5f13dd57a4176ed723dd13000ac5356661f02612ad979ca80fe0ce318753f1` |

先复制实际输入至 `correction-code-course-run-03-snapshot/`，随后只执行该快照的最终 HTML 内嵌 JS。独立遍历冻结清单 **197 个文件**，大小与 SHA 全部一致；批准技能 **19 个源码**全部一致。没有把依赖缓存当作技能输入。

使用已批准的通用 builder 从最终 lesson.json 重建到 reviews 临时文件，输出 HTML 与最终冻结稿**逐字节相等**。未运行会改写作者目录的生成脚本，未修改冻结文件。

## 最终哈希上的新执行

自写及复用本席此前独立 harness，未使用作者 judge、测试 helper 或自测结果作为预期。最终 HTML 新运行 **7 个窗口场景、80 项断言，80 通过；7 个场景均无 jsdomError**。

| 最终实际场景 | 输入及已确认行为 |
| --- | --- |
| ready、完整错答、空集、双条件 | 空白、只选 RR、缺最后一个分布格均保持草稿、不冻结，并具名列出待填组。RR 映射完成、权重已选、分布填 1 与 1 后可作为完整错答冻结，给出 missing:RS / distribution:1 等实际差异；双击只有一份。明确空集且其余组完成可冻结为错误，不把数学正确性塞入 ready。 |
| repair 与同题重试 | 实际错误按钮进入绑定原 owner / condition / submission 的 repair；切到 WOR 再点击旧 WR 返回仍回 WR 原答卷。原行按钮定位实际 `max-wr-complete`。重开正确答案仍有辅助身份，首答冻结字段不改。WOR 加 RR 给出 extra:RR；有辅助的空集错误仍首推 repair。 |
| 比较预测与覆盖 | 屏外无证据时保存原判断并 pending，不泄露结果；非零 viewport fixture 但 hidden 的来源不计覆盖。仅目标 6 仍 pending，目标 4 也呈现后才核对。原判断的 draft / judge / assisted / id / at 不倒改。WOR summary.click 与 submit 在同队列执行，错误首答被同步标辅助并进入 repair；正确重试对错与辅助分开保存，另一组件不被污染。 |
| 入站拒绝、接触联合及文件边界 | 同时打开 max WR / mean WOR 参考后立即导入外来 owner：拒绝，同时保留当前草稿和两组件各自可信接触。版本、数据身份 key、伪来源、篡改 targets、半份冻结答卷、坏 envelope 均拒绝。合法同源时间取更早值。旧合法导入不洗掉接触，且不污染未接触的组件条件。原生 file 读取等待期间打开参考，读取完成时采集；原生下载包含联合后的当前来源。 |
| 持久化重开 | 即时导出并取实际 localStorage，新窗口重开后 max WR / max WOR / mean WOR 三处实际 details 保持展开；即时再导出保留来源，探索次数与 attempts 不增加。 |
| 实际来源及媒体状态 | 实际请求 WR overview、AC path-focus、AC bar-focus、AB bar-focus；Image.src 字节各对真实 Manim manifest。书面 proof 请求即存在并记其独立来源，displayed 仍为空。overview/path 不产生比较 targets；一个 bar 目标仍 pending，两个书面目标已足够呈现核对，无需假等图片。失败保留当前 proof；当前成功后旧请求的成功/失败回调均不能覆盖；旧状态 requested=null 导入清空 DOM 并使旧回调失效，同时保留已发生参考历史。新窗口 API 恢复 WOR 请求后 displayed 为空；重试成功才记录 displayed，返回定位真实当前 distribution 原行。 |
| 存储不可用 | Storage.getItem / setItem 均抛 SecurityError 时，仍可用真实控件完成正确首次构造，冻结结果与未辅助身份正确，并能导出。 |

在初始、重试后、实际 render 的 repair、比较反馈和媒体返回等状态重新查询实际 DOM：主作答路径没有 text/number/textarea/contenteditable 输入（只排除 `.dt-note` 可选笔记）；实际渲染出的本地 href 都有真实目标。组件控件采用原生 button / fieldset / legend；本轮没有用 jsdom 冒称已完成实际键盘焦点环或浏览器 Tab 验收。

## 与前置证据的关系

本轮不是简单重跑作者测试。早前 run 02 的未填冻结、辅助吞错、repair 缺原行等阻断，在新生成课件的上述真实路径上已经直接关闭。run 03 组件阶段的展开范围丢失、反馈后重试无辅助、接触最早时间，以及媒体阶段 15 个 path-focus 元数据问题也均已关闭，详情保留原失败与修复报告。

- `correction-code-components-run-03.md`：早期试件问题、修复及独立交叉矩阵。其旧哈希 87 项不计入本轮 80 项。
- `correction-code-media-increment-run-03.md`：36 个实际媒体请求、每份当前书面证明对完整原行、迟到/失败/恢复、原生导入导出证据。报告当时唯一 M1 后续关闭，不把旧哈希的 36 帧执行说成最终哈希执行。本轮最终哈希实际请求及字节比对的是上表四帧，另走真实 WOR bars 恢复/重试。
- `correction-code-last-delta-run-03.md`：15 个 proofLineIds、20 个原生 choice 的错误→必要原行→本题返回、公式反馈、结尾与真实 review item 路由、两处分数原像锚点。严格差异证明 dcf 与 15cd 仅新增 capture 微任务刷新；最终 bcd 与 dcf 全份 JSON 仅两原像 ID 前缀及其子行变化、JS 字节相同。此前 dcf 的结尾 14 项及 CI 2 项不重复记成本轮最终哈希运行。bcd 静态 8 项已经核过实际锚点及 shelf 内嵌 PNG bytes。

前置报告中的首版 CI 将可选 note textarea 错计作主输入、以及本席首次 recall harness 懒初始化读取错误，均保留失败原证据并注明为测试缺陷，不作为课件问题，也不伪称该次完整通过。

## 可复查执行文件

```sh
node reviews/correction-code-course-run-03-probes.cjs
python repo/plugins/dialogue-tutor/skills/dialogue-tutor/scripts/build_lesson.py --lesson generation/correction-run-03/lesson.json --output reviews/correction-code-course-run-03-rebuilt.html
```

- `correction-code-course-run-03-results.json`：最终 HTML 的逐项输入/输出与 80/80 汇总。
- `correction-code-course-run-03-log.txt`：7 个场景实际执行日志。
- `correction-code-course-run-03-freeze-results.json`：197 文件 / 19 源码核对结果。
- `correction-code-course-run-03-rebuild-results.json`：重建命令、双 SHA 与 byteEqual=true。
- `correction-code-course-run-03-snapshot/`：本轮实际输入快照。

证据边界：运行环境为 jsdom，显隐和 viewport 使用明确矩形 fixture，scrollIntoView 记录目标，Image.onload / onerror 人工驱动，文件读取、下载与存储失效也有明确 fixture。本报告证明实际内嵌程序分支和数据合同，不证明真实 PNG 解码、MathML 字形、触屏、200% 缩放、视觉排版或人类学习结果。作者自测数字以及其他席的图像阅读均没有冒充本席独立证据。
