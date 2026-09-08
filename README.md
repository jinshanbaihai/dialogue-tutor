# DialogueTutor · 简易对话

DialogueTutor 将数学、统计与经济材料组织成可以操作的学习课程。1.7.0 的呈现顺序是 **交互＞可视化＞文字**：学习者先进行预测、分类、计算或探索，再查看所需解释，随后处理独立新题。完整推导和全部原题解答持续可查。

本版本重建了技能入口和教学生成流程，取消固定七幕及字数地板。技能读取按职责拆分的教学、模式、色彩与运行参考，内置组装器生成单文件 HTML。

[下载完整技能包](dist/dialogue-tutor-1.7.0.zip) · [技能入口](plugins/dialogue-tutor/skills/dialogue-tutor/SKILL.md) · [本轮改造与评审](docs/engineering/v1.7.0/README.md)

[S2 第六章新课件](docs/s2-ch6.html)由独立代理按照本技能从空白生成，包含3个目标和9项活动。教育与游戏评审各2/3通过，叙事定点复审3/3通过；真实浏览器视觉验收仍待完成，因此本次PR保留草稿。[实际评审与已知问题](docs/engineering/v1.7.0/run-03-decisions.md)对应同一冻结文件。

## 课程如何运行

新课程使用任务舞台，一次呈现一个主要活动。页面保留前后导航、具名完整解释以及折叠学习工具。选择题与数值题保存首次作答；开放题保存原答与自评，探索记录参数及参与。

错误、借助提示的正确、独立正确和跳过，可以推荐不同的下一项任务。推荐依据实际记录产生，学习者仍可以选择其他任务。翻卡、自评和按钮点击不产生独立客观通过。

学习记录保存在当前浏览器，支持导出与导入同一课程版本。课程内容改变时更新 revision，旧记录不被静默套用到新题。复习继续使用公开的 1、3、7、14、30 天工程默认间隔；这些参数没有个人最优性证明。

## 模式范围

| 指令 | 内容 |
| --- | --- |
| bgct | 当前材料需要的原理、条件、完整例题与全部小问 |
| bbct | 板书内容、记号和考纲边界；补齐作业所需前提 |
| olct / onct | 所给题目、必要公式与完整解答 |
| plustts | 在前置模式上增加题目前行轨、参考讲解轨及分段 JSON |

短回合追问仍围绕当前断点展开。新符号和前提获得必要支持，关键术语中英对应；用户要求完整解答时直接提供。

## 视觉与持续参与

配色统一为冷白、深墨蓝和铜橙，并提供语义对应的明暗主题。图形使用相同变量定义，图区宽度与文字宽度分别处理；收藏、笔记和实现来源不争夺主任务的位置。

课程用有后果的判断、可见的发现、具体修复和下一项挑战推动继续学习。叙事解释当前问题为何值得解决，紧接学习者的操作与结果。学习效果另由实际保持和迁移记录检验。

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

新课程的数据接口见 [interactive-html.md](plugins/dialogue-tutor/skills/dialogue-tutor/references/interactive-html.md)。`presentation: "studio"` 启用任务舞台；省略该字段时继续支持 1.6.0 连续正文课程。原 `s2-source.html` 与 `s2-interactive.json` 仅用于兼容性回归，不作为新布局范本。

新课件的可编辑课程数据在 [docs/lessons/s2-ch6.json](docs/lessons/s2-ch6.json)，由同一组装器生成。`scripts/build_demo.py` 同时重建新课件与旧兼容演示；CI 核对生成文件与提交内容一致。新课例放在仓库文档中，技能包保持四位评委审核过的内容。

仓库验证与打包：

```bash
npm ci --ignore-scripts
python3 -m unittest discover -s tests -p 'test_*.py' -v
npm test
python3 scripts/build_demo.py
python3 scripts/package_skill.py
```

## 来源与评审

既有闪卡、自测、探索、步进及学习记录设计借鉴 [HKUDS/DeepTutor](https://github.com/HKUDS/DeepTutor)；固定源码对应见 [deeptutor-provenance.md](plugins/dialogue-tutor/skills/dialogue-tutor/references/deeptutor-provenance.md)。本项目新增的任务编排和表现分支明确标为 DialogueTutor 的组合实现。

[learning-evidence.md](plugins/dialogue-tutor/skills/dialogue-tutor/references/learning-evidence.md) 区分研究结果、适用范围和工程选择。教育学、色彩、游戏策划和叙事评审记录针对具体技能版本与真实生成产物；模型评审不替代真实学习效果数据。

本项目采用 [MIT License](LICENSE)。历史版本、旧布局和完整变更记录保留在 Git 历史中。
