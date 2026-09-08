# run03 技能候选程序独立复审

**C=0 / I=0 / M=0。程序席批准将此技能候选交给独立新作者，从空目录生成。** 本批准只针对生成合同及现有API的兼容与可实现性；run02完整课件仍按`correction-code-final-run-02.md`退回，不因此变成通过。

## 实际阅读及身份

已全文阅读四份实际候选：interactive-html.md（491行）、generation-checks.md（51行）、engagement-and-narrative.md（123行）、visual-design.md（64行）。读取`reviews/correction-run-03-skill-candidate-hashes.json`并实际计算其19个源码文件SHA，全部匹配；与run02候选19源码快照逐项比较，仅以下四refs变化：

|文件|实际SHA-256|
|---|---|
|interactive-html.md|c92a2e2b73c15c95c68f34448a47e82de1ed486d19259d3b5a039055bc91394e|
|generation-checks.md|27f2e4473555e1951bb168df9499ae37aa53a9506ab13d033500b8c40ef391e1|
|engagement-and-narrative.md|91d826a3b98016e06b085dd0b068e7003783704080c67022e8a8c1b76d9e1a6b|
|visual-design.md|6ced8ed4fbf566abccc55c14cacb0c5fbe4e33afcbcacbcf3c706c8fd7eb0c9e|

runtime保持`b16a6f702fbf8217b60ccba6a9782c011a92e017726416b01c2597e24c02fa45`，未改代码，不重复跑其已经独立核验的通用测试。另定点读取真实`pathwayOutcome/getRecommendations/navigate/getState`实现核对新增文句，没有仅根据文档假定存在API。

## 逐项裁定

1. **完整度与判分分离，覆盖本次真实缺陷。** interactive明确未答标记、合法候选、必填条件；ready不检查数学正确路径、不要求概率和为1。默认零勾选与主动空集分开；主动空集仍完成其余必填组，完整错答交judge。未完成不冻结、不计错、不锁输入、不显示标准答案。顺序明确为同步采集参考→ready→judge→冻结→反馈。因此ready失败仍保留真实接触，且独立全解/跳过不受完整度门阻挡。
2. **恢复不会绕开ready，也不误拒绝合法半草稿。** 两处恢复条款已统一：未提交round草稿允许半份和错误候选；入站冻结submission必须同一ready且核对一致。身份/版本/hash与冻结冲突验证继续先于接受，可信接触先采集，恢复静默保存并集。没有把ready提升为公共runtime现有API。
3. **错误与辅助不互相覆盖。** engagement及generation-checks明确两个组件、各支持机制、有/无辅助×正/误交叉，结果未呈现的预测继续待核对，防止修复入口提前泄露；结果已呈现的实际错误优先推荐具名repair但允许跳过。现有普通quiz的`pathwayOutcome`本来就是先判断`attempt.correct===false`再assisted，自定义构造只须从自己的冻结状态计算相同事实，不需伪造公共attempts。新条款与现有pathways语义兼容。
4. **修复已成为真实可达动作，而非名称。** 文本要求当前差异的必要完整小步，或一触可开的当前完整原行；明确均值等可能断点的互斥加权及必要约分；主预测/构造分别实际render并点击原行和返回/再试。保留原冻结历史与接触，不强制新增题。generation-checks不再允许静态ID存在或评委手工navigate替代页面入口，可针对run02动态repair空缺给出直接失败证据。
5. **多处CTA更新使用真实API。** `instance.getState()`真实返回当前快照；`dt:navigate`确实在navigate保存当前活动并完成视图更新后派发；新增文本允许课件自身返回事件并要求点击前再次重算，不凭创建时旧JSON路由，不虚构不存在的state-change事件。单参navigate仍不重试，review仍须真实完整item，语义无冲突。
6. **视觉验收限定实际控件族，没有扩大到装饰线。** 新文要求有效层叠、祖先背景及透明合成；正文与白底activity分族，同样式同背景可合并。必要识别边界沿用既有阈值，明确装饰线不新增控件门槛；未把静态token或jsdom当成浏览器视觉通过。程序能够列实际控件样式/背景组合，具体视觉裁定仍由视觉席负责。

## 新作者蓝图中的实现落点（不是新增门槛）

为避免再次只写函数名，蓝图应按本候选已有要求列出实际字段：例如路径回答意图`unanswered/selected/explicit-empty`与paths如何一致，勾路径后撤销empty、重试如何回未答；每个必填select的空值；哪类source真正覆盖当前条件。静态公开答案的displayPredicate仍需区分仅在DOM中存在与已经呈现，和summary主动打开、已成功图帧分别落到可测条件。

repair控件应携带当前owner/condition/冻结ID，在点击时核当前状态；返回只定位，明确再试才开启该条件的新草稿。新作者可用既有公开API和自己的集中render函数完成，不需要另写大型通用runtime。最终仍须用实际新HTML实走ready失败、显式空集完整错误、辅助错误、动态repair、旧导入及CTA完成后返回这些交叉，并保存具体状态和DOM。

本席没有修改技能或课件，也没有声称run03尚不存在的HTML、真实浏览器、PNG解码或学习效果已通过。

## 最终一句澄清定点复核

第8项现在允许“直接读取本处完整小步，或点击真实原行读取当前差异所需的完整小步”，随后仍通过补讲自身控件返回/再试。已直接读取实际句子；它与engagement的就地呈现/一触原行两种合法实现一致，不再强制已经完整呈现的补讲多点一次原行。

最终generation-checks.md SHA为`724e7db76e739f80757771dcecfe225c870bc850b1756c43c4c8383b5cb2b781`，替代上表原候选hash。将这一句精确逆替换后SHA恢复为`27f2e4473555e1951bb168df9499ae37aa53a9506ab13d033500b8c40ef391e1`；与此前批准的19源码基线相比，只有此文件变化，其余18不变；更新后的19文件清单全部与实际SHA匹配。

最终裁定仍为 **C0/I0/M0，批准此最终技能候选交独立新作者生成**。本次仅句子及hash范围定点复核，没有重复全文阅读、运行未变代码或声称新课通过。
