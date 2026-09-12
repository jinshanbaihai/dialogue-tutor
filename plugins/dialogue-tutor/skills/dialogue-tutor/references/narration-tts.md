# 模块读题与完整伴读

旧组件只有伴读文字导出，页面没有播放按钮；连续文字在问题后面直接接答案，空行并不会成为可靠的等待操作。本版把模块读题、伴读文字和指定音色音频分别实现与记录。

## 模块读题：每份交互 HTML 都提供

本包运行时通过 Web Speech API 给活动增加播放、暂停/继续、停止和重播；默认速率为 **1.5×**。声音清单来自浏览器，优先匹配实际可用的 `zh-CN-XiaoxiaoNeural` / `Xiaoxiao`，随后选择实际可用的中文声音，界面显示真实名称并允许调整。声音异步加载时刷新清单。没有浏览器语音接口或声音时显示具体状态，保留题目文字；交付记录列明该环境的语音结果。

| 活动 | 自动读出的内容 | 可选口语字段 |
| --- | --- | --- |
| `quiz` | 题目与全部选项；始终排除答案、解释、评分依据 | `activity.speechText` 覆盖 prompt；`choices[].speechText` 覆盖各自选项 |
| `flashcards` | 当前卡片正面；翻面后读题仍不读取背面 | `cards[].speechText` 覆盖正面 |
| `steps` | 当前可见推导阶段；主动查看完整过程后可读完整可见过程 | `steps[].speechText` 覆盖步骤正文 |
| `explore` / `interactive` | 活动题面；复杂图形用口语交代变量与观察任务 | `activity.speechText` 覆盖 prompt |

字段为非空纯文本；写入专业术语与公式口语读法，不放 HTML、LaTeX 或隐藏答案。默认文字只能提供基本读法，复杂公式与中英混读都填写口语字段并试听。推导读题描述当前步骤实际内容，不能用读完整隐藏解法的方式提前揭示后续答案。

播放由读者操作开始。切换卡片、推导步骤、活动播放对象或重置时停止旧段落；重播从当前内容开始。修改速度只应用一次。长内容拆成可重播的短段，不建立多个同时发声的播放器。自动读题不代替原题条件核实，尤其保留随机、放回、至少、恰好、单位与精度。

同一个学习目标的练习尚待作答时，先展示的模型、步骤与读题只包含已经建立的前提。练习解法关联到该题参考区域，提交或主动揭示后开放。单靠播放器过滤 `answer` 字段不能防止作者将答案误写进题目。

## plustts：额外的完整伴读文字

HTML 与课程数据作为同一底稿，逐块覆盖题面、模型、定义、每项推导、表格关系、得分依据和附录。按页面阅读顺序与可见阶段编写，每块记录“内容位置、活动 ID、可见阶段、对应段落”。公式读出完整操作和依据；表格解释每行对应关系，避免反复播报行号、表头、左右栏和重复英文题面。

术语保留英文，中文解释含义。数字、单位和关键限定完整保留，公式转换为可听懂的读法。听觉说明可以比屏幕更细，不能将六步推导压成“积分得到结果”。对于复杂图形，交代变量、形状、变化和对应关系；带路语言对应当前实际画面，不沿用旧主题的固定颜色。

| 片段 kind | 放入内容 | 导出轨道 |
| --- | --- | --- |
| `narration` | 当前已经显示的概念与解释 | `lesson-listening.txt` |
| `activity` | 题目、操作提示、到此暂停的明确提醒，引用 activityId | `lesson-listening.txt` |
| `feedback` | 答案、完整解法、卡片背面、自评依据，引用 activityId | `lesson-answers.txt` |

完整 schema 见 `interactive-html.md`。组装器同时导出 `lesson-tts.json`；文件名前缀跟随 HTML。两条轨道合计覆盖整个课程，包括运行时由 JSON 挂载的内容。字符数可帮助发现漏项，不能替代覆盖核实，也不以固定倍数驱动扩写。

文字导出依靠读者暂停与选择轨道，本身没有自动页面同步能力。浏览器模块读题有实际播放控制，不能将两者混称。用户请求预习版时讲机制与先修概念；请求完整答案连续朗读时将整轨明确标为参考答案伴读，首次作答轨继续独立保留。

## 指定 Xiaoxiao 音频时

Microsoft 官方声音清单包含 `zh-CN-XiaoxiaoNeural`。Web Speech API 只能枚举当前浏览器提供的声音，给 `utterance.voice` 随意写一个字符串不会安装该音色。用户明确要求每台设备都播放同一种 Xiaoxiao 时，使用已配置的 Azure Speech 服务预合成短音频，或调用项目已有的语音服务，再通过 HTML audio 播放；服务凭据位于服务端或生成环境，不写入交付 HTML。

SSML 可采用以下结构；实际内容来自对应课程片段：

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-CN">
  <voice name="zh-CN-XiaoxiaoNeural">
    <prosody rate="1.5">两边同时减去三个单位，所以剩余数量仍然相等。</prosody>
  </voice>
</speak>
```

可以合成 1.0× 原始音频并设置播放器 `playbackRate=1.5`，或合成 1.5× 并保持播放器 1.0×；两者不能叠加成 2.25×。选择并记录实际采用的方式。预合成文件与课程片段保持稳定对应；题目音频与答案音频分离，先打开网页再实际播放、暂停、重播验证。

资料：[Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)、[声音清单](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support)、[SSML voice / prosody](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-voice)。核实日期：2026-09-12。
