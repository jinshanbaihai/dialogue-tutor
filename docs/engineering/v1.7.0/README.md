# DialogueTutor 1.7.0 改造与评审记录

本轮修改对象是用户提供的 1.6.0 技能本身。附件14份文件与仓库基线一致；没有把旧调研计划中的访问陈述当作本轮重新读取了所有 DeepTutor 源码。新增设计以学习动作、真实证据、统一配色和主动继续学习的任务组织为中心。

## 主要改动

- 主入口从长篇固定布局改为任务路由。交互＞可视化＞文字，完整原理与解答仍可查。
- 新增教学蓝图、模式与解答、视觉、参与与叙事、专家复审五份按需参考。
- studio 一次呈现一项主要活动；表现分支给出具名补救、支持或挑战。
- 预测先冻结再揭示，选择要有数学后果；反馈提供修复动作，结尾读取真实记录。
- 明暗主题使用冷白/深墨蓝/铜橙和稳定的图形语义；区域轮廓区分原始端点与截取边界。
- 修复关联全解后的闪卡辅助遗漏，保持翻面前证据、自评来源和真实复习条件。

逐条原规则与新落点见 [规则迁移表](rule-migration.md)。研究和工程假定见 [技能证据台账](../../../plugins/dialogue-tutor/skills/dialogue-tutor/references/learning-evidence.md)。旧版 DeepTutor 对应表仍保留，不把本轮新增机制全部归为 DeepTutor 的原有能力。

## 技能审核

| 模型专家角色 | 首轮主要批评 | 修订后裁定 |
| --- | --- | --- |
| 教育学 | 长文先行、证据目标脱节；发现共享全解后的闪卡辅助漏记、推荐契约和旧例题理由问题 | [全包复审通过](reviews/education-package-recheck.md) |
| 色彩、美术与摄影 | 旧色彩分散、视觉重心；事件填色缺少可辨边界 | [技能包审核通过](reviews/color-package-review.md) |
| 游戏策划 | 预测先泄露、挑战递进与具体反馈不足、收束和回访缺少内容理由 | [技能复审通过](reviews/game-skill-recheck.md) |
| 叙事与艺术创作 | 行动与结果呼应不足，错误反馈和揭示时序冲突 | [技能复审通过](reviews/narrative-skill-recheck.md) |

评审者是独立模型代理承担的专业角色。原始退回意见、修订依据、反例和复审报告均保留；文件哈希识别各轮实际审查对象。复制到本目录的两份教育探针仅调整了仓库根目录的相对路径，测试内容未变。

## 从空白生成的检查

四位专家准入之后，新建无上下文继承的生成者，只提供技能路径、[真实请求和官方章节范围](official-scope.md)及空白输出目录。未提供现成课件或评委示例答案。输入与验收方案在生成前固定，见 [验收方案](validation-plan.md)与 [run-01 技能文件清单](run-01-skill-manifest.json)。

本次只生成 S2 第六章的一个任务案例；不宣称它已经证明全部模式或跨模型的生成稳定性。真实浏览器预览基础设施目前不可用，H5 没有通过；具体限制见 [预览状态](preview-status.md)。所有可完成的课程审查仍按原要求进行，不能用源码审阅或自动化检查替代真实视觉结论。

| 轮次 | 实际结果 | 后续 |
| --- | --- | --- |
| run-01 | 形成独立HTML；教育、游戏、叙事退回，色彩等待真实视觉证据 | [逐项裁定并先修技能](run-01-decisions.md)，再取得四项技能定点复审 |
| run-02 | 生成中发现恢复写回的API缺口，保留草稿和最小复现；未形成HTML | [先补公共接口与技能契约](run-02-decisions.md)，11项studio与66项完整Node回归通过，四位专家再次准许生成 |
| run-03 | 从空白形成3目标、9活动的实际HTML；教育2/3、游戏2/3、叙事定点3/3通过；色彩源码范围无新增缺陷，真实视觉仍待验收 | [逐项裁定与整合](run-03-decisions.md)、[第三轮技能清单](run-03-skill-manifest.json)、[真实生成条件](runs/run-03/generation-config.json) |

上述“一个任务案例”指同一章节的生成验收范围，包含失败后的迭代；不是把多次迭代写成多个独立学科案例。API修复的实际执行输出见 [Node记录](node-runtime-gate.txt) 与 [Python记录](python-builder-gate.txt)。[GitHub PR #14](https://github.com/jinshanbaihai/dialogue-tutor/pull/14) 已直接创建，当前保持草稿。

## 当前可审阅产物

[S2 第六章 HTML](../../s2-ch6.html) 与 [课程 JSON](../../lessons/s2-ch6.json) 和 run-03 冻结文件逐字节相同。四位对最后一次技能变动的准入记录分别为 [教育](reviews/restore-api-education-recheck.md)、[色彩](reviews/restore-api-color-recheck.md)、[游戏](reviews/restore-api-game-recheck.md)、[叙事](reviews/restore-api-narrative-recheck.md)。整合没有修改这18份技能文件或完整ZIP。

| 实际成品评委 | 结论与证据范围 |
| --- | --- |
| [教育](reviews/education-html-run-03.md) | 2/3；独立精确数学、实际DOM8组38条观察；无Critical/Important，3项Minor接受并保留 |
| [游戏](reviews/game-html-run-03.md) | 2/3；16组实际操作与路径；无Critical/Important，2项Minor与教育意见重合 |
| [叙事](reviews/narrative-html-run-03.md) | 定点3/3；11条实际路径，先前退回问题关闭 |
| [色彩](reviews/color-html-run-03.md) | 实际自定义图源码无新增缺陷；没有真实视觉评分，H5仍待验收 |

当前工程复跑入口是仓库根目录的 `python3 scripts/build_demo.py`、`node --test tests/s2-ch6.test.cjs`、`npm test`、`python3 -m unittest discover -s tests -p 'test_*.py' -v` 和 `python3 scripts/package_skill.py`。新增4项课程回归抽取独立评审已验证的真实路径，覆盖数学图表、恢复写回、四种推荐以及真实回顾；执行记录见 [课程整合检查](run-03-integration-gate.txt)。原作者和评委探针保留当时的路径及输入输出，作为历史证据；不把归档路径搬动写成原脚本已经在新路径复跑。

整合检查首跑发现测试直接比较两个JavaScript执行域的数组原型而失败；仅将预期对象规范化后复跑4/4通过，课件、技能和数学预期均未改变。这项测试适配与 run-01 的真实课件退回是不同事件。

[当前验证状态](final-verification.json)把已完成工程条件与待完成视觉条件分开记录。H5缺失也意味着实际课件的四领域总准入尚未完成；PR没有被标成最终通过。

实际真人延迟保持、迁移和持续参与收益尚未测量；同题重试、模拟时间、模型专家批准不能代替这些数据。
