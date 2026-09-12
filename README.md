# Dialogue Tutor · 简易对话

生成面向外行的交互式教学 HTML。**可视化交互 > 可视化模型 > 文字**，每一步解释当前操作为什么承接上一项结果，保留完整解题与 Socratic 引导。

[交互示例：操作天平理解方程](https://jinshanbaihai.github.io/dialogue-tutor/interactive-first.html) · [技能入口](plugins/dialogue-tutor/skills/dialogue-tutor/SKILL.md) · [完整技能包](dist/dialogue-tutor-2.0.0.zip)

## 2.0.0 的生成方式

旧入口把大量历史条款与长篇正文规格集中在同一文件。新版将共享要求放在短入口，模式、推导、视觉设计、交互调研、TTS 和评审按需读取。核心任务是让读者实际操作、观察关系、解释依据，再尝试变式。

| 组成 | 读者获得什么 |
| --- | --- |
| 交互学习 | 四选一、概念卡、参数预测、分类配对与情境任务按目标选用；明确提交后反馈，保留提示与主动查看过程 |
| 可视化模型 | 图形、公式和数值共享状态；二维适合一般关系，空间关系采用三维，连续预渲染演示可用 Manim |
| 逐行解释 | 每次变换分别说明已有结果、当前操作、合法依据和结果；前置解释就地展开，完整过程随时可查 |
| 模块读题 | 播放、暂停/继续、停止、重播，默认 1.5×；优先系统实际提供的 Xiaoxiao，声音列表显示真实名称 |
| 设计与语言 | 中性黑白灰与蓝色强调，系统字体与匹配暗色；English terms 首次附中文含义，其余中文为主，重点换色加粗 |

[交互调研目录](plugins/dialogue-tutor/skills/dialogue-tutor/references/interaction-patterns.md)引用 DeepTutor、Brilliant、Amplify Classroom、Duolingo、PhET 和 Manim 的官方材料，并区分原产品行为与本项目改编。分类配对、情境任务、三维等通过 `interactive` 扩展；本包内置的专用概率 `explore` 只有两种，不能套用于其他主题。

浏览器语音取决于设备声音清单；优先选择 Xiaoxiao 不代表所有设备都已安装该声音。需要跨设备固定音色时，按 [TTS 参考](plugins/dialogue-tutor/skills/dialogue-tutor/references/narration-tts.md)使用已配置服务预合成音频。普通读题与 `plustts` 的两条伴读文字轨分别提供。

## 原有教学范围与记录继续保留

| 模式 | 范围 |
| --- | --- |
| `bgct` | 按概念对象覆盖七个教学环节、独立示例与完整原题求解；环节可通过交互和模型表达 |
| `bbct` | 按板书顺序与考纲解释，补齐作业需要但板书缺少的内容 |
| `olct` / `onct` | 只提供必要定义、公式与完整解题，不加入背景章节 |
| `plustts` | 在相应 HTML 之外追加首次作答伴读、参考答案伴读与分段 JSON |

独立作答、自评、提示后作答与探索分别保存；一次即时答对不显示为长期掌握。页面保留笔记、书签、复习、导出导入与内容版本隔离。预备解释是事先编写的问答，当前聊天与网页记录分别保存。

[既有 S2 兼容样章](https://jinshanbaihai.github.io/dialogue-tutor/)保留旧课程正文，用于验证六个原题小问、十五处活动及学习记录。新版生成形状以天平交互示例为准。

## 装法

### Claude Code 插件

```
/plugin marketplace add jinshanbaihai/dialogue-tutor
/plugin install dialogue-tutor@dialogue-tutor
```

装完如果提示 `Run /reload-plugins to activate.`，跑一下 `/reload-plugins`。
技能带命名空间，形如 `dialogue-tutor:dialogue-tutor`，
不过它是**模型自动触发**的（靠 frontmatter 里的 `description`），
命名空间只影响手动 `/` 调用时的写法。

触发词：「这道题怎么做」「讲一下这个」「带我过一遍」「考我」
「我们对话学」「简易对话」「讲清楚原理」「为什么会这样」。

本地试的时候不必先安装：

```bash
claude --plugin-dir ./plugins/dialogue-tutor
claude plugin validate ./plugins/dialogue-tutor --strict
```

### claude.ai 网页版

将完整技能 ZIP 上传到账号的技能导入入口。包的顶层目录为 `dialogue-tutor/`，
对应 `SKILL.md` 里的 `name`。2.0.0 同时依赖包内的 `references/`、`scripts/`、`assets/`、
`examples/` 和 `agents/`，只上传 `SKILL.md` 会缺少实际生成组件。

### ChatGPT 与其他支持技能导入的工作环境

导入完整目录 `plugins/dialogue-tutor/skills/dialogue-tutor/`，或使用
[dialogue-tutor-2.0.0.zip](dist/dialogue-tutor-2.0.0.zip)。ZIP 保留与源码相同的目录结构，
包含活动运行组件与 Python 组装器。支持读取技能并运行脚本的环境可以按技能入口生成 HTML。
具体导入方式取决于宿主提供的技能入口；下载或上传文件本身不代表技能已经在账号中安装。

需要自行打包时，在仓库根目录执行：

```bash
python3 scripts/package_skill.py
```

脚本生成 `dist/dialogue-tutor-2.0.0.zip`，并输出文件数量与 SHA-256。

### 构建与验证

在仓库根目录重新生成同一份 S2 演示页：

```bash
python3 scripts/build_demo.py
```

源内容来自 `examples/s2-source.html` 与 `examples/s2-interactive.json`。
制作其他课程时，按 [活动 schema](plugins/dialogue-tutor/skills/dialogue-tutor/references/interactive-html.md)
编排课程 JSON，然后调用通用组装器：

```bash
python3 plugins/dialogue-tutor/skills/dialogue-tutor/scripts/build_lesson.py --lesson lesson.json --output lesson.html
```

保留已有正文时附加 `--base-html existing.html`。生成器使用 Python 标准库，学习者打开生成 HTML
即可使用内联活动，不需要安装 Node.js。以下 Node.js 依赖只用于开发验证：

```bash
python3 -m unittest discover -s tests -p 'test_*.py'
npm ci
npm test
```

检查涉及生成约束、题卡行为、状态记录、复习与恢复。自动检查之后还需在浏览器实际操作生成结果，
检验数学排版、窄屏、键盘和页面上的具体反馈；测试通过不等同于已经证明个人学习收益。

---

## 开发与来源

新示例数据位于 `plugins/dialogue-tutor/skills/dialogue-tutor/examples/interactive-first.json`，既有 S2 数据与源 HTML 继续用作兼容验证。`scripts/build_demo.py` 同时生成两份示例。技能运行组件使用 Python 标准库与原生 JavaScript；Node 依赖仅用于测试。

[本次改动与评审记录](docs/engineering/interactive-first-redesign.md)记载需求、实际发现、修改和验证证据。[原 DeepTutor 来源记录](plugins/dialogue-tutor/skills/dialogue-tutor/references/deeptutor-provenance.md)保留固定源码快照及历史验证边界。

许可证：[MIT](LICENSE)。
