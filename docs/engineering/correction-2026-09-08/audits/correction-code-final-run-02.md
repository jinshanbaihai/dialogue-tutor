# correction-run-02 最终程序独立终审

裁定：**退回，不批准交付。C=0，I=3，M=1**。I1/I2为程序独立实际复现的完整性与分流缺陷；I3为实际动态补讲未兑现蓝图的小步职责，须与教学席合并计数。没有修改冻结课件、作者源码、媒体或skill。后续遵循先修生成规则、独立新作者从空目录生成、重新终审的流程。

## 冻结身份与证据

|文件|实际SHA-256|
|---|---|
|lesson.html|7941f152c7f7eeedad7ca002dbd5602047ec9ba11f96ee16b6d7d2e127fe76d7|
|lesson.json|42627f4a3df54ccddfcfef28abf3a873a3a1807b955f7fd9315d3613a4f5dc90|
|course.js|641cc807d10fe304f002efa20abb83aa4422b6460ec2fc7863ba612ee133c9ff|
|delivery-manifest.json|3bd8e42e61e8387ff4632abecf90366f3e3b9ded06f83d0e12a019252e8ecae2|
|exact-data.json|9695b34b11bbe735fb06a6ce73e335533beeef067cd6b4311b3026feb2f1ceaa|

已完整阅读course.js，包括校验/并集、提交、条件重绘、媒体请求、主控事件、结尾和repair逻辑；对照本轮generation-contract、实际reference-coverage、exact-data、media-manifest及已批准generation-checks/interactive-html合同。独立脚本只读上述最终HTML，以jsdom执行其真实内嵌脚本，没有导入作者的测试帮助函数或判分函数。固定数学期望从D2/E2/F8题干给定。

复用命令：

```sh
node --expose-gc reviews/correction-code-final-run-02-probes.cjs
node --expose-gc reviews/correction-code-final-run-02-targeted.cjs
node --expose-gc reviews/correction-code-final-run-02-extra.cjs
```

实际完成20个独立新窗口场景、175条检查：168通过，7个失败断言对应下述I1/I2/I3/M1（含同一缺陷重复探针）。广覆盖156条为154通过/2条I1失败；定向9条为4通过/5条缺陷证据；追加10条全部通过。所有20场景的未捕获脚本异常检查通过。

相邻`*-results.json`保存每条输入/状态/DOM/断言，`*-log.txt`保存执行输出。本轮作者旧d1cd…的73测试及其他hash的通用单测不计入本报告的最终HTML独立证据。

## I1：尚未作答完整就被冻结并揭示完整构造反馈

位置：course.js:103、142；相关校验:25–30只验证合法半草稿，没有另行完成度函数。

实际从全新页面、不选任何答案，点击`#build-sample [data-action=submit-construction]`：

```json
{"draft":{"paths":[],"mapping":{},"weight":null,"distribution":{}},
 "check":{"missing":["DD","DE","DF","ED","EE","EF","FD","FE","FF"],
          "extra":[],"matched":[],"mapping":[],"weight":true,
          "distribution":["2","5","8"],"correct":false},
 "assistance":[]}
```

`submissions.length`由0变1，`rounds[task-wr-mean-v1].activeId`成为该提交ID，权重/分布/路径输入禁用。DOM显示“本次冻结核对”，逐条揭示九路径、路径权重及mean2/5/8原像和概率4/9、4/9、1/9。双击不会产生第二份，但该首份本身不完整。点击重开、只勾DD而不选其mean/权重/分布，再提交，历史由1变2，仍冻结。

这违背generation-contract:37“完整度检用户已选行所需映射、概率依据、分布格”及generation-checks第2项。合同允许明确判断为空路径集时由judge报missing；不能据此将`weight:null,distribution:{}`判为已完成作答。这里不是用户选择自由查看全解，也不是给完整错答反馈；是提交入口把半草稿写成冻结的构造记录。原页仍可重开，不构成永久锁死，因此定I而非C。

## I2：assistance覆盖错误，两个组件都绕过对应修复

位置：course.js:83–92（mainOutcome/chooseNext）、104、121。

实际输入一：主例打开`#main-reference > summary`，选择`equal`并提交。有`assistance:["main-reference-wr"]`且错误的冻结预测，但实际下一任务为：

```json
{"label":"构造尚未呈现的有放回新数据","action":"task","conditionKey":"task-wr-mean-v1"}
```

结尾只说“你的提交前已有相关参考，这是有辅助核对”，没有指出所选equal与实际两概率的差异。实际输入二：打开`#q3a-solution`，完整填写有放回九路径/全部映射/独立权重，唯独mean2概率选0；提交的`check.correct:false,distribution:["2"]`且assistance为q3a来源，实际下一任务却是无放回新构造。

两个组件都优先把有参考的提交归为assisted。蓝图:37要求错误进入对应修复；:59明确correct/assisted/seen独立；generation-checks第9项也禁止把辅助事实变成互斥结果。原冻结草稿与数学check本身保留正确，因此是解释/行动分流错误，不是首答记录被倒改。

## I3：真实main repair没有承诺的小步推导或通往该推导的入口

位置：course.js:114–117。实际无辅助选择equal→保存→AA/bars请求→当前Image成功回调→点击结尾的repair按钮。动态`#repair-panel`内容只有：

- mean1来自AA，直接列P=1/9。
- mean5来自AC、BB、CA，直接列P=1/3。
- 一句“应先找原像，再加权”的概括。

该实际面板没有三个1/9相加得到3/9再约分为1/3的过程，没有指向相应现成逐行正文的href，也没有继续/返回/再试控件。不存在算错，但未兑现蓝图:37“三错误补讲各有真实小步”和:130的真实差异修复职责；不能用正文另处有推导作为实际补讲入口已建立的证据。本项供教学席合并裁定，不重复算成另一独立数学错误。

## M1：构造repair缺少就地返回/再试动作

实际填完WR构造但权重选old→提交→点击repair。其`#task-wr-DD-weight-sub`链接存在且目标真实；面板没有返回build-sample或重开当前条件的控件。主构造仍可通过页面导航返回，因此没有额外构造永久锁死，按M记录。下一轮将返回/再试明确写入生成配方合理。

## 已独立通过的关键边界

- 整份lesson JSON与实际`#dt-lesson`一致；内嵌CFG完整data与整个exact-data文件深相等，dataHash等于该文件完整字节SHA；提取CFG后内嵌程序与course.js模板逐字一致。
- 十活动挂载、初始ID唯一；初始不显示构造答案。只选DD时第2组仅呈现本人DD映射，不补正确路径。所有主作答路径采用原生选择控件；可选`.dt-note`笔记明确排除主答案检测，未把它们误报为打字门槛。
- 完整WR正确提交、双击只冻结一次；WO完整但同时漏FE/多DD时给出准确missing/extra与对应真实行；同条件重试保留旧首答，反馈接触加入后续assistance。两机制分别保留draft/activeId/提交；两个组件相互隔离。
- 原生summary后同调用队列submit：main及build的具体来源均进入提交快照。summary→旧API导入→立即导出/存储重开保留真实接触并集、冻结历史和已展开区域；不倒改首答、不增加explorationCount/attempt数。
- 原生file异步读取完成边界采集其间刚打开的q3b；原生下载Blob内容包含同队列刚打开的共享全解。共享task全解只覆盖task两条件，main共享全解只覆盖main两条件，无跨组件污染。
- 合法但错选的半草稿导入保持原样；同submission ID冻结内容冲突及跨条件activeId被拒绝，当前首答不改且新增可信参考保留。
- 非法组件身份、版本、hash、条件、候选及未知字段被API拒绝；坏通用envelope也拒绝。原生文件坏组件hash被拒绝。两组件刚发生的可信接触保留并可新窗口恢复。
- 主例单一目标概率被呈现不足以标记开场两项结果已见；第二目标出现后才改变。切机制不继承另一机制目标覆盖。隐藏的open details不会记参考。以上viewport结论限明确矩形fixture。
- 正常旧导入/重开恢复可见范围和历史，接触与已见历史不伪造成新学习动作。存储不可用时仍可完整作答并导出内存状态。
- 45个合法选路径×阶段通过实际按钮请求；成功fixture后实际DOM图片字节等于所匹配manifest帧。加4张静态实际DOM图片，共49个被页面使用的帧，全部在51项manifest中；两个overview帧有文件且校验匹配，但当前控件路径未请求，未声称51项全部可操作到达。
- 跨机制失败保持新机制当前回退；失败重试成功。媒体存储重开先为loading，自己的新回调显示当前帧，两个阶段都不增加学习计数。
- A成功/B失败隐藏旧图并指向B当前书面行；C成功后旧B成功/失败不覆盖C；加载中恢复等待新请求回调。六个真实inspect按钮在scroll和Image成功回调后仍保留返回href，点击后焦点到真实推导目标。
- 七个原生quiz与两张自评闪卡实走；全解后所有实际静态fragment目标存在；按钮有原生语义及名称。未把jsdom focus当作实际浏览器Tab验证。

## 环境和证据范围

这次测试是实际最终HTML内嵌JS与原生DOM事件；Image.onload/onerror、viewport矩形、scrollIntoView和File.text延迟是明确fixture。实际PNG字节与manifest一致不等于浏览器成功解码或正确排版；没有真实浏览器预览，不声称触控、Tab顺序、MathML像素、手机宽度、200%缩放或可访问性树已通过。人工视图/Manim数学角色由相应专家提供独立证据。

初版探针对可选笔记、JSON序列化空白、未使用overview帧设了过宽断言，已按真实合同校正探针并重跑；不是删除候选的真实失败。最终结果保留I1相关失败，以及定向I2/I3/M1证据。

## 对下一轮最小配方的批判建议

不需要引入新的大runtime；现有同步转移边界已满足本轮关键恢复风险。建议将以下作为具体生成配方及真实控件交叉用例，而非仅增加原则口号。

1. `validateDraftShape`负责接收合法半草稿；`ready(draft)`只检查本人是否作答完，不查询标准路径集合；`judge(draft)`仅在ready后运行。ready结果给具名未填项，如DD的mean、权重依据、mean5概率；不写submission/activeId，不锁输入，不显示正确路径或概率。空集须明确的学习者动作，其他必填组仍完成。**导入中的冻结submission也必须ready**，而未提交round草稿继续允许半份及错误选项；否则新提交门仍能被伪造冻结记录绕过。
2. 提交前仍先同步采集当前可信参考；即使ready不通过，这些真实接触也不能丢。显式查看全解保持独立开放，不能被完整度门挡住。ready失败后同题补完应首次冻结一次，双击不重复，不能把失败尝试称构造核对。
3. correctness和assistance分别计算并显示；`if submitted && incorrect → repair`优先，之后才按assistance给正确提交分配后续。未提交/跳过/已见各有独立事实，主例只有两个目标已见时才评价原预测。测试两个组件×两个机制×有/无参考×正/误，特别测反馈后同题再错与旧记录恢复再错。
4. repair从当前冻结差异及conditionKey生成真实小步或可展开的当前推导行链接，携带owner/condition/冻结ID以免切机制后引用别题。返回只导航；“重开本条件”才清当前草稿，并保留旧冻结记录/接触。只在真实render后查href、展开祖先、点击返回及再试；检动态面板，不能仅遍历静态正文。主例也须有同样的repair路径。
5. 用本报告失败输入作固定回归，另加“明确空集但权重/分布已答完”的合法错答，以及半草稿导入允许、伪造半份冻结记录拒绝这一对照。不能用正确例子通过替代这些边界，也不把辅助错误和无辅助错误合并为互斥类别。
