# Run 03 有界交付核查

结论：**交付核查批准；C0 / I0 / M0。** 安装、打包、归档与审计身份通过；课程终审批准仍对应同一 bcd536 冻结稿，本轮不重跑已通过的课程矩阵。README 清单位置小文案已澄清，M1 关闭。

独立脚本 `correction-code-delivery-run-03-probe.py` 实际完成 **29/29** 核查；逐项结果在 `correction-code-delivery-run-03-results.json`。

| 交付对象 | 独立结果 |
| --- | --- |
| `repo/docs/s2-ch6.html` | 与冻结 HTML / approval 同 SHA：`bcd536d3884afbcbfc328da8b467410286ef53a3e0661abb042a8d9ed1501de3` |
| `repo/docs/lessons/s2-ch6.json` | 与冻结 JSON / approval 同 SHA：`33b41f47356499201bdcfb3a4dd6044f7fae17fd43bcc95f570af73afde8cceb` |
| 1.7.1 ZIP | 恰好 20 项：19 个批准源码逐字节和 SHA 对应，另一个 LICENSE 与 repo/LICENSE 一致；ZIP CRC 通过；整体 SHA `bc86956cfd04cb95d81812ec679e97426da11ac1a1457aec6d39f480c231b903` |
| 新维护测试 | `tests/s2-ch6-current.test.cjs` 与本席已审的两条测试精确一致，仅 jsdom 依赖和已安装 HTML 路径改变；只排除 `.dt-note` 可选笔记，其他断言不变 |
| 五席审批 | approval.json 的五份具体报告路径均存在、报告 SHA 均一致、结论均批准且 C/I/M 为 0；skillApproval 相对路径与冻结清单身份正确 |
| 关键导航 | 仓库 README、纠偏 README、run-03 README 的相对 Markdown 链接均命中实际文件，包括 repository-validation.json；归档内 README 说明将源码放回 `generation/correction-run-03`，并配套同工作区 repo 与依赖 |

两组分卷都按 transportPieces 顺序读取，**逐卷验证大小和 SHA，再拼接验证整个原 archive**；没有仅信任分卷清单。实际解压到内存读取每个成员，验证源成员/评审成员清单，未改写或覆盖原文件。

| 档案 | 拼接 SHA-256 | 实际成员校验 |
| --- | --- | --- |
| source，3 卷 | `de2d32c0720fcd7ec6d8e13517e00fddf580abbeceb3117a9701d68b609a9377` | 197 个作者冻结清单成员 + FREEZE.json + final-hashes.json = 199，全部大小/hash 一致 |
| review-data，3 卷 | `811d1c8bf0983344326b3be0ce028beaf6b9038ea1c1925b298f4163b90b2be3` | 459 个成员逐个实际读取/hash 一致；其中 67 个无损硬链接，仍逐个按逻辑成员验证 |

source 归档前缀为 `correction-run-03/`，review-data 为 `reviews/`；成员路径无绝对路径或 `..`。分卷拼接得到原档案，不改变任何冻结课程、媒体或技能字节。GitHub API 的实际上传/远端 CI 不属于本次本地核查证据。

`scripts/build_demo.py` 已读取：旧首页使用批准 builder、批准 `examples/s2-interactive.json` 与 `examples/s2-source.html`；新课使用已安装 JSON。针对旧首页变动另独立重建到 reviews 临时文件，与 `repo/docs/index.html` **逐字节一致**，两者 SHA 均为 `2c6f9f4599ef3ec226362b7aca0af724c4bbac2c24979aadf3010713d3fe0786`。见 `correction-code-delivery-run-03-legacy-results.json`。这是旧兼容产物随批准运行库的必要同步，不把它作为新课程范本或新生成验收。

## 验证记录与审计范围

已读取 repository-validation.json 及其两份实际日志。Node 日志终态为 tests 91 / pass 91 / fail 0 / cancelled 0 / skipped 0；Python 为 Ran 20 / OK。本席没有重跑这 111 项，记录归属根维护回归。Node JSON 明确标明会话轮询工具后来失败，不伪造 process exit code；日志证明 node:test 已输出完整终态，不能扩称远端 CI 通过。两条新课维护回归与旧兼容回归也已分开描述，不拿数量代替五席课程终审。

README / approval 正确披露 jsdom、Image/矩形/时钟 fixture、真实 PNG 阅读与真实浏览器未测边界；没有声称真人学习效果或跨模型新课稳定性。根与色彩席原图阅读范围已在外部文档纠正，冻结作者原文保留。

审计档案包含 12 个早期同名 run-03 历史文件；清单 `historicalSameNamedRun03Files` 所列 12 项均实际存在于 archive entries。外部 README 已明确这些不构成本次批准，只采用 approval 绑定最终 bcd536 的五份 `correction-*-course-run-03-review.md`。最后交付核查与仓库回归在归档后另存，不回写原证据档案，这一范围说明准确。

## M1：源码成员清单位置文案

读取时 run-03 README 写“每卷与每个原始成员的大小和hash见两个同名JSON清单”。实际 source.json 只有 archive 与三卷级信息，197 个 source 成员的明细在旁边的 final-hashes.json，另加 FREEZE.json 和 manifest 本身；review-data.json 则确实含 459 entries。内容及所有 bytes 都已验证正确，但说明应准确指向实际明细。已直接反馈根，仅需修外部 README，不需改冻结档案或课程。

根修改后定点复核：现明确各卷见两个同名 JSON、source 的 197 成员见 final-hashes.json、另两文件身份分别由冻结记录和正式报告核定、review 的 459 成员见 entries。与实际数据结构相符，**M1 关闭**。复核后的外部 README SHA-256 为 `990f90c934f7047c85919e13bf310ffb13528e626d5e31b92d5eba389aacd83a`。该澄清不改归档或冻结课程，无需重跑课程矩阵。
