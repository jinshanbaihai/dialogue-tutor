# 1.6.0 验证记录

日期：2026-09-07。范围是生成的交互 HTML、技能生成流程、原内容保全与导入包。

| 检查 | 实际结果 |
| --- | --- |
| Python 组装器 | 10/10，含锚点、原 SVG 大小写、活动完整性、JSON 转义、TTS 分轨及保留 ID 拒绝 |
| JavaScript 状态与数学函数 | 30/30，含提示接触、跨会话、草稿、待自评、导入和到期边界 |
| 完整生成 S2 的 DOM 事件 | 20/20，含原题作答、翻卡、图形与数值、步进、笔记、导入导出、恢复及 MathML 分数 |
| DeepTutor 原始 React 组件 | 11/11；原源码保持不变，使用隔离显示适配；不代表完整后端运行 |
| 新 bbct 数学课程 | 22/22 DOM 检查，7 个活动及三个完整作业小问 |
| 新 onct plustts 经济课程 | 12/12 DOM 检查，6 个活动、三个完整解答、21 个伴读段 |
| 独立重要项复验 | 6 条 DOM 与5条生成器路径通过，原问题关闭；详见[审查与裁定](review.md) |
| 技能格式 | 官方 quick_validate.py 返回 Skill is valid |
| 导入 ZIP | 14 文件；解压后逐文件匹配；从该目录实际生成样章，与仓库 HTML 逐字节相同 |

项目维护命令：

```bash
npm ci --ignore-scripts
python3 -m unittest discover -s tests -p 'test_*.py' -v
python3 scripts/build_demo.py
node --test tests/*.test.cjs
python3 scripts/package_skill.py
git diff --exit-code -- docs/index.html dist/dialogue-tutor-1.6.0.zip
```

自动验证工作流采用相同生成与测试路径，同时确认已提交样章和 ZIP 可复现。
本地核查环境：Python 3.12.13、Node 24.19.0、jsdom 26.1.0；CI 指定 Python 3.12、Node 22。

原始源码与展现证据见技能的 [DeepTutor 来源说明](../../plugins/dialogue-tutor/skills/dialogue-tutor/references/deeptutor-provenance.md)，
研究依据及解释限制见 [学习证据](../../plugins/dialogue-tutor/skills/dialogue-tutor/references/learning-evidence.md)。

ZIP SHA-256：`7df20b0973b175014540a96eac9c8fee29ad0181629206c6c46142d2d01132a7`。
最终文件校验清单与独立复验的机器结果放在 [evidence](evidence/)。这些结果证明实现行为，
不构成对个人学习效果、记忆保持或迁移收益的实验验证。
