# 简易对话 · DialogueTutor 2.0

生成面向外行的交互式教学 HTML：**可视化交互 > 可视化模型 > 文字**。学习者通过预测、作答和操纵模型建立理解，每个推导步骤解释如何继承上一步；必要文字采用英文术语、中文说明和换色加粗的重点。

[技能入口](plugins/dialogue-tutor/skills/dialogue-tutor/SKILL.md) · [教学与设计规则](plugins/dialogue-tutor/skills/dialogue-tutor/references/experience-design.md) · [教学产品调研](plugins/dialogue-tutor/skills/dialogue-tutor/references/interaction-research.md)

## 2.0 的重点

主入口从 162,264 字节缩减为约 7 KB。模式、概念讲解、原题保真、完整伴读和对话细则按任务读取，避免每次加载全部历史规则。

| 能力 | 生成要求与实际支持 |
| --- | --- |
| 教学交互 | 新写概念辨析优先四选一，按目标采用概念卡、预测后探索、找错或情境迁移；保留原题题型。五类内置活动加自定义交互入口 |
| 二维 / 三维模型 | 图形、数字和公式共享状态；内置二维概率探索，其他模型通过 `interactive` 实现。三维按内容生成，不宣称内置通用三维引擎 |
| 行行推导 | 每步交代前一步、本次动作、成立理由与结果；完整内容按步骤和就地展开呈现。保留完整题解与苏格拉底引导 |
| TTS 读题 | 每个活动自带读题、暂停、继续、停止与调速；默认 1.5×，优先设备实际提供的 Xiaoxiao。没有晓晓时显示实际音色，语音 API 缺席时显示状态 |
| 视觉设计 | 中性灰白 / 石墨主题、蓝色强调、清晰字体层级、留白、即时反馈与 reduced motion；重点同时换色和加粗 |
| 学习记录 | 草稿、原答、提示、揭示、重试、跳过、自评、探索、笔记、书签和复习；支持刷新恢复、导出和导入 |

浏览器 TTS 只能使用系统实际提供的音色；控制逻辑测试不代表真实设备已经发声。需要跨设备固定晓晓时，生成端可使用已配置的语音服务预合成，公开 HTML 不包含服务密钥。

## 内容范围保持完整

| 指令 | 课程范围 |
| --- | --- |
| `bgct` | 按概念覆盖七幕，重点放在建立概念与独立例题；原题按小问完整讲解 |
| `bbct` | 按板书顺序与考纲讲解；板书缺口或没有板书时依据考纲与真题补齐 |
| `olct` / `onct` | 只保留所需公式定义前置块与完整做题，不扩展背景章节 |
| `plustts` 后缀 | 另交完整讲师伴读：首次作答轨、参考答案轨与分段 JSON；所有页面仍自带活动读题 |

七幕与六项题解是内容覆盖要求，通过交互、模型、步骤和展开说明实现，不要求默认展示长文。每个原题小问保留题干拆解、方法判断、知识回接、公式选择、逐行依据与答案得分位置。术语首次配中文释义，原卷英文与对应中文题面完整保留。

## 来源与示例

DeepTutor 提供已有分块教学、闪卡、自测、探索与学习记录的参考；Brilliant、Desmos 与 Duolingo 的官方资料扩展反馈、参数操纵与情境迁移的选择。具体事实、设计推断与学习效果证据分开记录。

[长方形交互范例](docs/interactive-first.html)用于检验新版生成规则。[S2 完整历史课程](docs/index.html)保留两章、六个原题小问与15处活动，运行组件和主题同步更新；该长课程与旧截图展示历史内容，不作为2.0默认布局模板。

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

## 维护

技能目录包含短入口、按需 `references/`、HTML 组装器、CSS/JavaScript 运行组件与可重建示例。生成资源与源码一起发布，避免只更新规则而继续使用旧运行组件。

独立审读与验证记录见 [2.0 修改记录](docs/engineering/interactive-first-review.md)。阅读、翻卡、播放或即时答对不转换成掌握率；理解需要解释、新题与延迟表现支持。

## 许可证

[MIT](LICENSE)。
