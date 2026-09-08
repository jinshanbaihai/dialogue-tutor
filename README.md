# DialogueTutor · 简易对话

DialogueTutor 以完整、逐行有依据的讲解为主线，把选择、翻卡和数学图形操作穿插在关键步骤。**交互＞可视化＞文字**用于选择怎样帮助理解；每一行推导及其理由仍完整可查。学习者不用键入答案，也不必答对才能继续阅读。

1.7.1 从用户提供的1.6.0全文恢复教学结构，修正1.7.0候选版压缩推导、整体折叠正文、主流程输入作答及遗漏具名外部技能的问题。bgct保留上半七幕的教学职责与下半逐题六项讲解；局部追问补在实际断点。

[完整技能包](dist/dialogue-tutor-1.7.1.zip) · [S2第6章完整交互课](docs/s2-ch6.html) · [技能入口](plugins/dialogue-tutor/skills/dialogue-tutor/SKILL.md) · [本轮纠偏与验收](docs/engineering/correction-2026-09-08/README.md)

## 学习过程

先把抽样条件与必要前提讲清，在推导中点选路径、核对依据、归并概率；图形和当前算式对应。已揭示的推导保留在正文，完整讲解随时可读。选择题提交后解释，闪卡心答后翻面自评，整份构造可以通过多组选项统一核对。

数学及统计图通过具名 Manim 技能真实渲染，保留源码、精确数据及帧对应关系。明亮主题用暖灰底、深墨正文；第一次观测、第二次观测和统计量有固定颜色与形状，正误反馈不改变数学对象身份。

学习记录区分客观点选核对、组件构造核对、自评、提示和答案接触。查看解释不会被冒称独立掌握；推荐不会封锁其他内容。本地记录可以导出、导入，保存不可用时仍能继续学习。复习间隔是公开工程默认值，未经个人学习效果验证。

## 模式范围

| 指令 | 内容 |
| --- | --- |
| bgct | 上半原理七幕、独立完整例题；下半每个小问逐项六职责与逐行推导 |
| bbct | 保留板书顺序、记号和考纲边界，补齐作业所需前提及未覆盖题目 |
| olct / onct | 公式定义前置块、全部题目及完整逐行解答 |
| plustts | 在上述模式上增加前行与完整参考两条伴读轨，作答前暂停且答案按状态揭示 |

## 使用与构建

将 ZIP 内的 `dialogue-tutor/` 作为完整技能目录导入；保留 `SKILL.md`、`references/`、`assets/`、`scripts/` 与 `agents/`。仅复制入口文件不会带入组装器。

Claude Code 插件安装：

```text
/plugin marketplace add jinshanbaihai/dialogue-tutor
/plugin install dialogue-tutor@dialogue-tutor
```

生成课程时，从技能目录运行：

```bash
python3 scripts/build_lesson.py --lesson lesson.json --output lesson.html
```

新课程的数据接口见 [interactive-html.md](plugins/dialogue-tutor/skills/dialogue-tutor/references/interactive-html.md)。新课使用 `presentation: "document"`、`generationPolicy: "no-typing"` 与 `theme: "light"`；正文内静态挂载活动。旧 studio / numeric / open 仍能运行。原 `s2-source.html` 与 `s2-interactive.json` 仅用于兼容性回归，不作为新布局范本。

新课件的可编辑课程数据在 [docs/lessons/s2-ch6.json](docs/lessons/s2-ch6.json)，由同一组装器生成。`scripts/build_demo.py` 同时重建新课件与旧兼容演示；CI 核对生成文件与提交内容一致。新课例放在仓库文档中，包含23项活动和38张实际Manim图。五席已对冻结整课正式批准；[实际检查及未测边界](docs/engineering/correction-2026-09-08/run-03/README.md)逐项记录，DOM和PNG检查不冒称浏览器或真人学习效果验证。

仓库验证与打包：

```bash
npm ci --ignore-scripts
python3 -m unittest discover -s tests -p 'test_*.py' -v
npm test
python3 scripts/build_demo.py
python3 scripts/package_skill.py
```

## 来源与评审

点选题、心答后揭示和翻卡借鉴 [HKUDS/DeepTutor](https://github.com/HKUDS/DeepTutor) Book 的真实操作。实际 Manim 分析、分镜、代码、渲染和失败修复链亦有源码对应；逐行推导与图帧同步是本项目新增合同。详见 [实现来源](plugins/dialogue-tutor/skills/dialogue-tutor/references/deeptutor-provenance.md)。

[学习证据](plugins/dialogue-tutor/skills/dialogue-tutor/references/learning-evidence.md) 区分研究结论、用户偏好与工程选择。专家评审只对实际读取和验证的版本及行为负责；不替代真实学习者的保持和迁移测量。旧1.7.0候选的评审保留作历史，不作为本轮通过依据。

本项目采用 [MIT License](LICENSE)。
