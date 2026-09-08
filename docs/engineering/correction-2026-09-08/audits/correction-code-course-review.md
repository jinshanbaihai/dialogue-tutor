# correction-run-01 最终课件程序独立实测

2026-09-08。**退回：Critical 2，Important 2，Minor 0。** 接触记录在即时提交及即时旧导入/重开两条路径丢失。程序层已足够触发冻结规范的硬失败；不能用其它通过项抵消。本评委未修改 skill、作者文件、HTML 或媒体，没有现场补丁。

本次亲自执行最终 HTML 的实际内联 JS，与作者自测独立。浏览器基础设施不可用；使用无 Image.onload stub 的 jsdom。这里给出的是实际 DOM/JS、状态和媒体字节证据，**不是浏览器布局、图片解码/显示或学习成效通过**。

## 正式对象与可复现证据

| 对象 | SHA-256 |
| --- | --- |
| `generation/correction-run-01/lesson.html` | `98b5e20e7ba17f01ae691f67b91050a493d3efad702020349acad50eea6e4392` |
| `generation/correction-run-01/lesson.json` | `92a8258b95e6a735d80261eccaf23a91cd4335a3647edd2282fd7fda4cc75259` |
| `generation/correction-run-01/delivery-manifest.json` | `ad6390cf8d51f1de8c08ee47318f1fade5417c6ffc3a692e1b3017af653f8c81` |
| 实际内联 runtime | `860b7671d276bc263e3f062ad669e761b2b45937c85bbf7e4f5a6a18b7d0ce60` |
| 实际内联自定义主脚本，`data-dt-widget="preimage-four"` | `067a8124d3147fee80f1ebfad041426a913e8652f20e989441fb17a36d0754b4` |
| 本人执行脚本 `reviews/correction-code-course-tests.cjs` | `8f2ef90ed5470c79581f2a5767bbd5d0d18713f352fc10fbec4fc431ebe590ff` |
| 原始结果 `reviews/correction-code-course-results.json` | `05f499c056a8cd06baf33d60d0686788127e3a0f763dd2b836b91b20284146c0` |

执行：`node --expose-gc reviews/correction-code-course-tests.cjs`，退出0；11个隔离/恢复窗口，146个记录性断言，140个原始通过、6个原始失败。脚本退出0表示执行和日志完成，不表示验收通过。原始6项中有1项是测试把未加载占位img误算成媒体字节，已单独更正判读，保留原始记录；其余5个失败断言对应下列4项实际缺陷。数量只是日志索引，结论按具体操作作出。

执行 `python reviews/correction-code-course-result-classification.py`，输出 `reviews/correction-code-course-classification.json`，区分占位与真实媒体，不覆盖原始结果。

另独立执行批准 builder，以正式 JSON 输出至 `reviews/correction-code-rebuilt.html`。输出 SHA 与正式 HTML **字节一致**，可重建性在这份最终对象上成立。没有运行会改写作者产物的 author.py。

测试只通过真实按钮/summary/原生选择控件、公开 import/export API 操作。存储恢复窗口使用实际保存的 localStorage 字符串；存储不可用场景只在环境层使读取 localStorage 抛错。图像 src setter 仅记录实际设置的 data URL 字节并转交原 setter，**不合成load/error/metadata/seek事件**。各场景具体selector、控制值、异常与请求记录在原始结果中。

## C1：原像题先打开全解再即时提交，冻结为未接触

实际条件：`main-wr:v1:A=2,B=4,C=6:n=2:independent-uniform-with-replacement:mean`。对应题要求选出均值4的来路。

最小实际操作（`reference-same-task`）：

1. 新窗口勾选 `[name="preimage-path"]` 的 AC、BB、CA。
2. 点击 `#main-wr-distribution-solution>summary`，原生 details 当刻 `open===true`。
3. 同一任务队列中点击 `[data-preimage-submit]`，不手工派发 toggle。
4. 读取 `CourseInspect.getState('preimage-four').submissions[0]`。

结果：`componentChecks.paths=true`，但 `assistedAtSubmit=false`，`assistanceSnapshot.reference=false`，`referenceCoverage=[]`，`revealedThrough=0`。完整参考已经打开。稍后真实 toggle 到达不会回改冻结的这次提交；本脚本也确认首答保持不变，因此错误身份已经固定，而非暂时显示问题。

源码对应最终内联脚本的 `initPreimage`：提交只复制 `s.contacts[k]`，未同步读取已打开的答案入口；答案接触只依赖 document 的异步 toggle 监听。对照实测：Q3 的 `initConstruction` 在提交前同步扫描其四个 details，同一操作队列下正确记录了 `q3-a-solution`。不能因 Q3 路径通过而外推所有组件。

这是冻结计划明确要求的即时入口检查，属于接触身份洗白硬失败。界面使用“提交前未记录参考”的谨慎措辞，仍不能免除把真实参考接触记下来的合同。

## C2：全解打开后立即导入旧草稿，立即重开可永久丢失接触

实际条件：`construct:v1:A=0,B=4,C=10:n=2:uniform-without-replacement:mean`。

最小实际操作（`reference-immediate-import` → `reopen-immediate-reference`）：

1. 新窗口导出未接触的空白记录。
2. 点击 `#q3-d-solution>summary`，details 已 `open===true`。
3. 同一队列调用公开 `DialogueTutor.instance.importState(blank)`，立即 `exportState()`，并捕获此时实际 localStorage。
4. 在全新窗口加载步骤3的存储；通过六条路径、六行均值、remaining、thirds 选择控件完成 Q3，点击统一提交。

步骤3实际导出为 `reference=false / feedback=false / hint=false / referenceCoverage=[] / revealedThrough=0`，尽管全解正在打开。新窗口第一次 Q3 提交仍为 `assistedAtSubmit=false`，快照所有接触为空。旧窗口之后收到 toggle 并更新自己，并不能修正已经导出或用作重开的旧记录。

源码对应 `restore()`：先 normalize 入站快照，再合并已存 `previous.contacts`；尚未送达的 DOM toggle 不在这两份状态里，恢复入口也没有先同步采集当前可见参考。因此“本页旧接触并集”只对已写入contacts的事件成立。

**对照通过项：**当反馈/全解接触已进入 state 后，再导入旧半份草稿，组件确实保留两个冻结提交及接触并集；立即导出与新窗口恢复也保留并集，且未新增探索或尝试。这证明失败集中在尚未同步捕获的真实可见入口，不能把对照成功写成全时序通过。

## I1：入站组件身份/数据版本未校验，非法选择被换成当前hash接受

在正常公开导出的 envelope 中只改 `construction-four.exploration`：

- `dataHash="different-data"`；`schemaVersion=999`；`componentId="other-component"`。
- `selection={paths:["AA"],mapping:{AB:"999"},probabilityReason:"invalid",distribution:"invalid"}`。

保留课程顶层 lessonId/revision，走实际公开 import API。这是入站记录验证探针，不冒充学习者做了这些选择。

实际：未抛出拒绝，非法 selection 原样保留；返回状态的dataHash却已变成当前 `9ef3d790…`。因此既没有拒绝，也没有清空为明确有效初始草稿，而是把外来/坏版本数据静默标成当前数据。`normalize()`先创建fresh，再无条件复制selection；未检查入站schemaVersion/dataHash/componentId。部分submission有条件形状检查，不能替代整个组件快照的身份与草稿校验。

这违反已冻结的 stateVersion/dataHash/合法状态恢复合同。建议生成规则明确：身份验证先于接受数据；拒绝/显式迁移边界可诊断，不通过改写hash伪装验证。此处未要求新增任意参数能力或防用户自行伪造所有客户端成绩。

## I2：已展开范围记录恢复，但真实解答重新关闭

独立正常流程（不依赖竞态）：点击 `#q3-a-solution>summary`，等待原生toggle完成，导出并捕获实际存储；新窗口重开。

实际：Q3接触的 `reference=true`，`revealedThrough=3` 恢复成功，但 `#q3-a-solution.open===false`。也就是说，已揭示范围只在记录中存在，没有恢复到此前可见的原生details状态。这个结果与C2不同：**接触没丢，阅读场景丢了**。

正文仍可手动重新打开，所以不列Critical；但不满足冻结的“草稿、行帧、已揭示范围/先前推导持续可查”恢复目标。修复规则应把保存的具体参考覆盖与可见范围恢复关联起来，且恢复展开不得创造新的学习动作或把首答快照重新计算。本轮未修改作者产物。

## P01–P12 实际覆盖与限制

| 范围 | 本人实际结果 |
| --- | --- |
| P01最终加载 | 正式HTML内联JSON与lesson JSON语义完全一致；28/28活动挂载，静态/动态ID无重复，记录面板关闭。11窗口均无捕获到的课程未处理异常。公共面板和后续控件实际运行 |
| P02免打字 | 初始、所有quiz提交反馈、两种主条件、完整构造、三类主错项及补救活动、恢复、全解、存储失败后枚举控件，主流程未发现可编辑文本/数值/contenteditable；笔记作为独立例外。22个quiz逐一用真实radio提交；3个闪卡活动的5张卡逐一翻面自评 |
| P03构造提交 | 不完整提交不给记录；四组填齐前结果区空；一次正确提交冻结完整答卷，紧接再点不新增提交；显式重试可提交。首次快照后续不倒改。这里只验证程序冻结，不据此批准题目本身未泄露答案 |
| P04条件/路径 | 有放回9路径、无放回6路径按钮集合正确；AA切无放回清除排除路径；两条件×每条路径×三个stage均实际操作。Q3状态未被图式切换覆盖。实际图式可见提交分支因无真实load未测 |
| P05接触/重试 | Q3同步提交入口与首答不可倒改通过；同题第二次提交保留辅助。原像同步入口失败见C1 |
| P06导入/立即导出/重开 | 已记录接触的并集、两次冻结提交、半份草稿恢复及不新增操作通过；尚待toggle的真实参考在即时导入/重开失败见C2 |
| P07恢复 | 草稿和已入状态接触恢复有实际成功证据；身份/版本接受与可见展开恢复失败见I1/I2。未把未完成图片加载的currentFrame当作已显示图帧恢复通过 |
| P08存储失败 | localStorage环境读失败时，Q3能选择、提交、跳过、展开全解，并从内存公开导出取得提交。未承诺这种环境能跨重开持久化；jsdom图式显示本身仍未测 |
| P09媒体 | 10个实际含src静态img字节、47种真实预载src请求对应frameId，合并覆盖55/55清单帧；55份交付PNG实际hash匹配，manifest引用lineIds存在，data/Scene/frame-contract hash一致。没有以文件名代替DOM引用字节 |
| P10异步媒体 | 原生jsdom无load完成，当前图/公式保持隐藏等待，未伪造load。源码requestSerial及同时隐藏旧图/公式仅代码核查，不认证实际晚到加载竞态、错误回退或显示完成。未新增视频要求 |
| P11语义/链接 | 控件为原生button/选择，按钮都有可读名称；focus调用到真实原生按钮成功。全解展开后501条本地锚点均真实存在并激活，无死目标；收束四按钮实际激活。该全展开测试不额外证明每个关闭祖先的导航恢复路径，也不认证真实Tab/屏幕朗读 |
| P12证据标签 | 五次闪卡记录source:self；Q3组件不生成公共attempts；公共报告区分客观选择、自评、辅助、组件核对、探索。没有以这些身份清晰的成功项豁免C1/C2 |

### 媒体断言的测试自身更正

原始 `P09/static-images-match` 对 `document.images` 全体取src字节，将无src、hidden的动态explorer占位也算进来，得到空字节hash而失败。这不是缺失PNG：正式脚本只有在真实预载完成后才给该img设src。单独分类保留1个“未加载占位”，其余10个实际静态src均匹配；47种真实Image.src请求均匹配，联合正好55种，无多余/遗漏或真实字节不一致。原始日志没有删除该失败，也没有为了通过派发load。

### 首次构造可见内容观察，交教育/游戏独立裁定

初始Q3第2组已经列出AB、AC、BA、BC、CA、CB六条“允许路径”，第1组正要求选择完整允许路径全集。DOM确有这段内容；它可能直接给出第1组答案。程序断言“未自动逐格判分/结果区未出现”不能证明没有这种结构性泄露。本评委已向根提出，教育/游戏评委据真实数学任务独立定级；这里不重复加一个仅凭程序状态的教学通过或失败数。

## 后续生成规则与未测清单

按根裁定，先修skill，再复审受影响条款并由独立作者空目录新生成，不现场修这份HTML。程序生成约束至少需要：所有真实答案入口用统一同步接触采集；submit与restore/import入口在冻结或normalize前采集当前可见参考；入站身份/数据校验不能静默换hash；恢复真实已揭示范围且不新增学习动作或倒改首答。下一轮沿用本脚本中的最短失败序列，在新正式产物绑定控件后复验。

未进行真实浏览器排版/颜色computedStyle、手机触摸与Tab遍历、屏幕阅读器、实际图像解码和加载显示/竞态、视频播放、真人学习成效。本评委未逐份目视55帧，也未重新运行Manim；真实帧内容与实际渲染身份须结合独立画面评委、Scene/渲染记录核验。正文全量数学/七幕/逐行密度由教育评委独立审核，未借本程序日志代替。
