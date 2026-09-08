# run-02 候选公共runtime与技能合同独立程序复审

2026-09-08。**Critical 0，Important 0，Minor 0。批准本次公共runtime及受影响程序生成合同，可交新的独立作者从空白生成run-02。** 这不是run-01通过，也不预先批准尚未生成的run-02课件。未修改失败课件、作者文件、技能或runtime实现。

## 实际读取与版本

已读候选runtime全部diff、原validateImport/prepareSession调用/save/restoreExploration/原生上传下载/恢复通知相关上下文；已全文读 `reviews/correction-runtime-02-api-candidate.md` 和新增 `tests/transfer-boundary.test.cjs`。没有把实现者自测当独立结论。

技能侧已读SKILL实际新diff、`generation-checks.md`全文、`interactive-html.md`同步边界/辅助接触/构造/媒体/恢复合同及示例，并审阅teaching-design、engagement-and-narrative、visual-design、expert-review的本轮实际diff。此为受影响条款复审，不冒称本轮重读未变的2300行教学主文。

| 对象 | SHA-256 |
| --- | --- |
| `assets/interactive/lesson-runtime.js` | `b16a6f702fbf8217b60ccba6a9782c011a92e017726416b01c2597e24c02fa45` |
| `SKILL.md` | `e189f73e9415e6b29903cd6e946caea7ee9718a479b8ec021bcc0c6a130f63a5` |
| `references/interactive-html.md` | `8829005b923cab403f9aa98399d077f57a36b1c23bb55133ee920de453a7614b` |
| `references/generation-checks.md` | `86661c5c58a6fb3f0b74d8080f31783b518d54b5427d81f64bbd31ac4d30a8e2` |

最初逐项核 `reviews/correction-run-02-skill-candidate-hashes.json` 的20条记录（19个源文件及1个pyc缓存），全部hash匹配。根随后将缓存移入 `excluded_generated_cache`；本评委再次确认最终 `files` 仅19个源文件、hash无变化且全部匹配。缓存不属于技能输入或已审教学内容。

## 独立实际执行

1. 亲自执行 `node --test tests/runtime.test.cjs tests/lesson-dom.test.cjs tests/studio.test.cjs tests/transfer-boundary.test.cjs`：**83/83通过，退出0**。原始独立日志为 `reviews/correction-runtime-02-independent-regression.txt`。
2. 另写且实际执行 `node reviews/correction-runtime-02-independent-probes.cjs`：**16个独立边界探针通过，退出0**。该脚本不导入作者测试helper，直接把候选runtime源字节内联进独立小型HTML fixture，由其真实UMD初始化/DOM事件/原生上传下载处理器执行。结果为 `reviews/correction-runtime-02-independent-probes.json`。
3. `git diff --check`通过。没有为了本次复验改run-01或把新runtime注入那份失败课件。

| 自写探针的具体操作 | 实际观察与结论 |
| --- | --- |
| 原生file change开始读取，File.text保持pending；之后才打开共享summary，再resolve文件内容 | 读取完成前guard未提前执行；应用前alpha/beta均取得新可见参考，证明采集点在实际替换前，而非仅file change开头 |
| 同一参考覆盖alpha/beta，另一参考只覆盖alpha；另有祖先hidden但open的参考 | 独立fixture采集器按映射分发，共享来源各一份，alpha独占来源不进beta，隐藏参考不采集。runtime允许按顺序静默保存后续组件，不按焦点猜归属；可见性算法是作者责任，不声称runtime自带 |
| 打开原生summary后立即点原生导出按钮 | 实际Blob由FileReader读取，导出内容含两组件共享接触及alpha独占接触；不是只查getState或调用公开API替代下载处理器 |
| 旧记录导入后恢复原details，再等待真实异步toggle | 先静默写合并ledger再展开，details保持打开；collector写入次数没有因迟到toggle增加，冻结submission不变、explorationCount仍0。这是独立示例对技能顺序可行性的证据，不是下一课组件已实现 |
| alpha候选dataHash外来且beta候选草稿不可信，打开共享全解后导入 | alpha拒绝后beta仍采集；旧草稿和冻结内容保留，新接触写入存储；新窗口立即读到两组件接触 |
| 顶层坏envelope / 文件读取Promise拒绝 | incomingState为null，所有采集器仍运行；core拒绝，当前已见参考保存在两个组件，不因没有可验证候选而跳过采集 |
| 原生导出中间guard取消，后面另有组件collector | 不创建Blob，不下载；后一个collector仍把可信接触保存。错误拒绝不等于撤销真实已发生接触 |
| guard修改context两份副本；执行时注销后一个guard并注册新guard | 候选/可信state未被副本修改；本轮仍执行起始注册快照中的后一个guard，新guard到下一轮才运行 |
| storage不可用时立即公开导出 | 接触仍进内存envelope，探索次数不变；没有承诺不可用存储可跨重开持久化 |
| 未注册新回调的旧fixture | 公开导入及原生下载保留旧能力；题目草稿经实际下载Blob返回 |

新增作者测试由本人重跑，另覆盖上述独立fixture未重复的due details关闭前后次序、false/throw、非法/Promise返回、重复注册单独注销、递归转移/导航/刷新拒绝、过大文件、公开与原生两入口错误面板等。独立自写探针和这些回归分别列明，未把总数充作数学/学习QA。

自写证据hash：

| 文件 | SHA-256 |
| --- | --- |
| `reviews/correction-runtime-02-independent-probes.cjs` | `dd9b61b62e9da538274bd3d090a9818f9540f320f1466cf7b045b42bda3fa5b3` |
| `reviews/correction-runtime-02-independent-probes.json` | `8fe2142f39628de6d284338d6d42ab8e91d110700d2ee3d58348f3346a2d4987` |

测试环境只给jsdom缺少的File.text提供可控读内容能力、观测下载URL/anchor并读取真实Blob；没有替换runtime的import/export方法。延迟File.text是有意模拟读取期间发生新的参考接触。未用媒体load或浏览器排版stub。

## 公共API与文档一致性结论

- `beforeImport`/`beforeExport`确为直接同步回调注册，返回本次注册的注销函数。context深拷贝、source标记、null候选/validationError与文档吻合；undefined/true允许，false、throw、其它值与Promise拒绝。
- 所有guard使用注册列表快照按序执行；首组件拒绝不阻断后续采集。后一个guard读取此前 `restoreExploration` 静默保存后的current副本。
- 通用校验失败仍运行collector；全部guard之后才应用候选、关闭due details、保存/重绘及派发restore。拒绝保留旧草稿/attempt，而允许刚采集到的可信接触增补；这项例外在代码、测试、文档三处一致。
- 原生文件上传和公开import使用同一内部边界；原生下载和公开export在取envelope/Blob前使用同一边界。没有遗留“只包装公开API”的缺口。
- 接触采集可在guard中调用已有静默restoreExploration；学习transition、导航、刷新与递归转移被禁止。注册API是合作组件合同，不声称能隔离任意恶意作者JS或撤销已启动的异步副作用；文档明确要求回调无异步副作用。
- 初次localStorage装载不会运行新导入guard，文档准确要求作者在mounted另外验证组件身份。`dt:restore`仍是后置通知，文档未冒充pre-import或通用组件验证器。

## 技能配方对run-01失败的回应

**C1/C2接触竞态：**提交前、实际导入前、实际导出前调用同一同步采集器；无候选/拒绝也保留可信接触。后置restore只做合法草稿与接触/冻结提交并集、静默保存和绘制。生成检查要求所有自定义组件、公开及文件两入口、即时新窗口恢复都实测，不再只测“全部展开”按钮。

**I1入站身份：**组件版本/dataHash/componentId及条件/路径/选择/帧组合在接受前校验；明确禁止fresh后复制未知selection再改写hash。合法半份草稿、错误但合法选项与requested/displayed不同的加载中态保留；完整度只在提交要求。候选非法拒绝不丢当前可信草稿/提交/接触。

**I2恢复可见范围：**contacts与visibleSolutionIds/lineIds分开；先提交可信并集与范围，再展开DOM；异步toggle以语义来源去重，不只用短暂isRestoring。独立fixture验证这套顺序可以恢复已展开details而不新增动作，实际run-02仍须落实。

教育席修后的 `collectVisibleExposureFor(id,conditionKey)` / `trustedExposureFor` 示例已经去掉裸open及无条件activity级exposure判断，并明确检查祖先显隐、按coverage限制条件。历史接触不因现在关闭而撤销。示例被标为作者须实现的函数，未伪装为现成runtime函数。

构造组间依赖、missing/extra、语义角色节点、请求与已显示媒体身份、失败后的当前回退链接、真实review item/卡片定位等新增条款和现有接口不冲突。generation-checks要求作者把这些条款落实到本课有限数据/DOM断言，并区分源码、实际事件、人工load/error分支、真实PNG与真实浏览器证据；没有要求未采用的课程能力凭空实现。

## 最终边界

本次程序与受影响技能条款无未解决C/I/M，可允许独立新作者从空目录生成。公共runtime只提供可靠转移时点及回调拒绝机制，**不自动实现课程自己的可见性采集、条件覆盖、数据校验、完整构造评分、恢复行帧或Manim**。这些函数在新产物里必须真实实现，并重跑正式课程实物验收；不能把本报告当下一课通过。

未进行真实浏览器布局/触摸/Tab/屏幕阅读器、图片解码显示或真人学习效果测试；本次也不重审run-01失败是否已在那份HTML修好。run-01保持退回冻结，下一步按根裁定新生成。
