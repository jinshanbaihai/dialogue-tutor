# 教学交互参考与采用依据

核查日期：2026-09-12。目的为选择真实产品使用的机制，并将机制落实成独立 HTML 的学习行为。下表“官方机制”为来源事实，“本项目采用”为设计推断；产品描述不作为学习效果实验。后续课程复用本表，只在需要新机制或来源变化时追加核查。

| 来源 | 官方机制 | 本项目采用与边界 |
| --- | --- | --- |
| [HKUDS DeepTutor v1.2.0](https://github.com/HKUDS/DeepTutor/releases/tag/v1.2.0) | Book Engine 将页面组织成 quiz、flash cards、interactive 等内容块；Visualize 对交互、状态变化与图文混合采用单文件 HTML | 统一内容目标、活动与图形状态，解释就在活动附近。保留原有闪卡、题卡、追问、笔记与复习；实现出处另见 `deeptutor-provenance.md`。本包不移植整套后端 |
| [Brilliant differentiation guide](https://brilliant.org/help/schools-and-educators/differentiation-guide/) | 实时错误反馈、分步解释与 Skills Check，针对薄弱技能继续练习 | 预测→提交→针对误区反馈→重试→换情境。四选一只是适合辨析的常用形状，不是所有目标的固定题型 |
| [Desmos sliders and movable points](https://help.desmos.com/hc/en-us/articles/202529069-Sliders-and-Movable-Points-in-a-Graph) | 变量 slider、参数范围与步长、movable point、播放控制 | 先预测再操纵，图形/数值/公式共享变量；让读者找到满足条件的位置或反例，避免无目标拖动 |
| [Duolingo Max](https://blog.duolingo.com/duolingo-max/) | Roleplay 提供课程相关情境，响应随回答变化，并在结束后反馈 | 将迁移目标做成情境任务或预生成决策分支；本地分支标明预备内容，不冒充远程 AI 对话 |
| [3b1b Manim](https://github.com/3b1b/manim) 与 [Manim Community](https://docs.manim.community/en/stable/) | 数学动画框架；Community 与原始项目是不同代码库 | 连续追踪同一对象、用颜色对齐图形和符号。参数实验采用可操作 HTML，时间过程可预渲染；框架本身不是教学效果证据 |

排序、找错、条件切换、预测后揭示等组件是本项目对这些机制的组合，不把每种组合声称为某一产品已经提供的原样功能。活动来源采用可核查 URL 与机制说明；本项目自己的具体改动在编排蓝图写明。

## 设计来源

用户指定私有技能仓库 `Claude-skills-private` 的 `emilkowalski-skills`。本次读取 `emil-design-eng`、`apple-design`、`animate` 及合并包路由，采用即时反馈、直接操纵、可中断过渡、克制材料与字体层级。公开包仅保存本项目的设计配方与实现，不复制私有 skill 正文。`experience-design.md` 中的配色数值是本项目选择，不宣称 Apple 官方配色。

## 声音实现依据

- [Microsoft 支持语音](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts)：列有 `zh-CN-XiaoxiaoNeural`。
- [Microsoft SSML voice 与 prosody](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-voice)：可以选择 voice 并将 `prosody rate` 设置为 `+50%`。这条路径用于已有服务的生成端音频，不能在公开 HTML 中放服务密钥。
- [Web Speech getVoices](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices) 与 [voiceschanged](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event)：页面只可选择设备实际提供的 voice，并处理列表异步更新。
- [Web Speech rate](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/rate)：浏览器朗读可设置 `rate=1.5`，实际表现取决于语音引擎。播放控件不能保证设备提供晓晓，也不能虚报音色。

默认采用浏览器 TTS 以保持单文件交付；活动题干/选项与答案分开处理。需要跨设备一致的晓晓音频时，使用已配置服务预合成。合成与播放只进行一次加速，已经按 +50% 合成的音频使用正常播放速率。

## 学习效果与参与的区分

模型操作、停留、翻卡与播放只说明参与。理解通过说明依据、辨析、解决新题与延迟提取观察。提取、反馈和间隔的研究及适用条件沿用 `learning-evidence.md`，不把品牌口号、产品采用或模拟学生报告当作因果证据。
