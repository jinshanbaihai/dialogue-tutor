# Run03 最终生成合同

本文件合并实际执行规则；预实施版本及评议修订保留在generation-contract-history.md。当前为最终作者自检候选，正式冻结以FREEZE.json的时间和hash为准。模型temperature/seed未暴露。skill/runtime只读，未修改；未读取、复制run01、run02或旧S2成课。所有课程正文、题目、组件和Scene由本次作者及具名Manim助手独立编写。

## 范围与教学职责

Edexcel IAL Statistics2 Chapter6，bgct/document/light/no-typing。三个对象population/sample、statistic、sampling distribution，各7项职责，ID为pop/stat/dist-act1…7；15个原创小问，各6项完整职责。范围依据Pearson2018课程规范Issue3（2019）S2 4.1/4.2与2018样书目录6.1/6.2/6.3；全章正文未提供，不声称读过全章。历史仅使用Neyman1934 pp558–561及Fisher1922 §§1–3 pp309–316已读范围；现代statistic only/no unknown parameters依据2013 SAMS WST02 Q1(b)，印刷371/PDF373。2023WST02封面23May2023，未由文件名猜日期。详细来源、读法与实际读取范围在source-ledger/reading-log/manim-reading-log。

|对象|③完整首次建立|④原创例题|下半对应|
|---|---|---|---|
|population/sample|目标→单位→frame→sample，普查/抽样比较、名单遗漏与非响应|E1a破坏性测试12灯至少留8；E1b完整名单抽4|Q1a医院600人/240网上名单/样本30；Q1b资源与遗漏|
|statistic|only定义逐词，已知常数/未知μ，规则与实现值|E2a三规则判别；E2b样本3,7,11算17与7|Q2a已知c=2/未知μ；Q2b4,8,12,16算H=10|
|sampling distribution|A2 B6 C10、n2，WR独立与WOR逐次均匀全部路径→权重→mean→原像→概率与总质量|E3a D0 E3 F9的range分布；E3bP(range≥6)|Q3a,b R1 S1 T5 maximum两机制；Q3c比较；Q4a J2 K5 L9无放回mean≥7；Q4b两组明确独立|

Q4英中明确两组独立与组间放回；放回本身不被当作独立证明。R/S/T为身份，maximum统计量称M，避免身份T混同统计量。所有题干英中与条件在每小问完整引用；作者评价要点不冒充官方分值。20个原生choice、2个原创interactive、1个含2卡的原生flashcards，总23活动。原生正确位置生成时确定性轮换，保存实际顺序和正确文本；不使用运行时随机，不据位置解释答案。

dist③首次路径概率之前公开事件E/F、P、∩/∪、条件竖线和等可能计数；11行推导在P(E)>0下从条件定义同乘、约去、交换得到乘法，再代入独立，最后用互斥计数→个数比→拆分得到加法。常数统计量明确可视作取值固定的随机变量。

逐行内容包含真实代入、分子/分母各自运算、同分母合并分子再计算、实际公因子约分、比较通分与总质量核查。line-ledger每行给before/operation/after/reason及对象、条件、路径；actual-dom-role-ledger记录实际渲染数学角色，Manim另记录图中每位置角色。

## 有限答卷与核对

mean-lab两条件各三选gt/eq/lt。未选仅提示；提交冻结判断，比较概率未实际呈现时标pending，不泄露对错或repair。WR正确gt，WOR正确eq。四个错选只忠实回显选择并使用完整概率比较，不由选项推断“等可能误解”或“沿用旧权重”。

max-board两条件分别保存四组：路径集合、本人所选路径的maximum映射、路径概率依据、输出1/5的概率。候选路径始终为RR RS RT SR SS ST TR TS TT，包含WOR错误候选；映射候选1/5；权重候选WR(1/3)(1/3)、WOR(1/3)(1/2)、错误1/2；概率候选0,1/9,2/9,1/3,4/9,1/2,5/9,2/3,1。

路径意图只允许(false,null)或(true,array)。专用空集按钮与取消最后选项都产生(true,[])，控件前明确告知；“撤销本组回答”返回(false,null)，保留映射缓存和其他组。删除路径保留合法缓存，重选恢复。ready仅校验完整合法，错误集合/错误权重/概率和不为1仍可提交；空集仍要填写权重及两概率。缺任何项仅提示缺项，保持草稿，不冻结/计错/揭示/耗用首答。入站合法半草稿允许；冻结submission同样须ready且judge一致，condition/owner/key/draft校验一致。

冻结记录包含owner、conditionKey、submissionId、draft、judge、assisted-at-submit、presented、time。correctness/assistance/presented/skipped分开；首答辅助标识不被后来的呈现倒改。已显示核对本身记录本条件feedback辅助来源；重新作答保留历史与接触。已可核对错误无论辅助与否都首推当前repair，仍有全解与自由导航。

## 来源、呈现与媒体

|来源|实际呈现判据|mean比较覆盖|
|---|---|---|
|主文完整group4或group6|全部祖先可见，非零矩形且viewport相交；或用户明确定位该真实group|对应一个目标|
|主动reference details|真实open，祖先可见；submit/import/export同步采集|该详情包含的4与6|
|主文路径/主动complete或feedback|路径按实际视口；complete/feedback为明确操作来源|只记辅助，targets=[]|
|image frame|仅当前请求成功后原子提交displayed|bars两目标；bar-focus只自身4或6；其他无目标|
|frame-written-proof|主动点图立即展示完整当前书面证明；恢复后仅实际viewport相交新增采集|按书面真实内容：bars两目标，group对应单目标，path/overview无目标|

只见一个目标时只引导核看另一个；两个目标都有实际来源后才核对预测。静态屏幕外DOM不算已见。complete只定位大包装时不伪造两目标覆盖。每source绑定真实DOM/frame白名单、owner、condition和targets；未知source或伪造coverage入站拒绝。contacts并集保留最早at；openSources保存实际已展开参考，导入与新窗口恢复真实details；历史接触不伪造当前视口。

38张真实Manim PNG：mean34（WR/WOR各overview/bars，15条有效路径各path-focus/bar-focus）、range1、maximum WR/WOR2、shelf1。CE0.21、Typst0.15、Pango实际执行，未假称MathTex。每帧绑定exact-data/Scene/源码hash/行ID/条件/path/stage/PNGhash及角色位置。源码使用可配置字体或相对字体副本；字体/OFL随源保存。

每图只一个主要面板。mean柱图和焦点图同基线、真实x=2/4/6/8/10、同y=0…1/3；WOR输出2/10零环+0。maximum两图同y=0…2/3。shelf的7/2、11/2、7按真实数值间距，概率各1/3，只突出≥7的7柱。bar-focus持续caption交代横轴均值、纵轴概率；WOR×释义持续可见。

图请求先更新当前condition/path/stage/caption/完整书面证明并清旧图。图片displayed只由匹配请求成功更新；迟到回调按序号隔离，回调重取当前models，避免sync复制后写旧对象。初始化和空requested导入都失效旧序号、清旧DOM。失败保留当前完整书面证明与重试；书面已经给出答案时如实记呈现，和图片状态独立。

批准builder默认360宽：main左右20、activity左右12.8、边框各1，图没有额外padding/border，内容宽292.4。图片以280px保守校验：普通文字≥16、关键≥18 CSSpx；轴≥1.5、对象≥2.5、强调≥3、网格≥1。全部38原PNG/280图由Manim作者助手实际检查；父作者另看代表图。该像素检查不是浏览器布局保证。

## 修复、返回与下一步

custom repair固定owner+condition+submissionId，回显实际选择与具名差异。mean重查两目标完整原像/权重/求和/比较；max重查缺失或多选路径、本人映射、实际权重选择、概率归并。每处一触对应完整原行，原行提供页面自己的返回本条件按钮；repair自身也有返回草稿与明确重开。返回只导航；重开才清本条件draft/active，保留历史/参考。切另一条件后旧repair仍回原条件答卷。

20原生choice错误时，稳定帮助区依据真实getState首推本题具名必要原行；实际展开祖先details，原行末尾返回当前原生活动。返回不重开，原生retry才重新作答。辅助/正误仍由批准运行库维护。

nextAction使用前重新getState，dt:navigate与自身返回刷新。pending先补缺少的4/6；错误优先repair；未提交返回当前草稿。正确无辅助可去尚未作的另一条件；正确辅助保留本处支持并有另一个条件、maximum或Q4可选入口。目标独立检查history与contacts：未見未作称开始，已见未作称带参考继续，已冻结称回看。全部已完成时不称新挑战。

recall-core卡0 statistic、卡1 sampling distribution。卡1背面未自评时“继续当前回忆”保留卡1草稿；浏览卡0用原生上一张/下一张，不重开。提前/到期复习从真实getReviews匹配cardIndex取得原item，并调用真实navigate(id,item)；无review的卡不伪造项目。所有操作免打字。

末尾第7节closing位于来源之后，按当前mean条件真实状态收束：空/半coverage只给尚需核看目标，不泄露比较；双目标已呈现才显示精确概率；本人原判断、冻结辅助身份、观察未作/重开未作与跳过分别陈述。错误首推当前submission repair；具名另一条件、maximum或Q4入口按真实接触与历史命名。末尾回访优先保留当前卡已翻面未自评工作，其后真实到期item、初次卡与明确提前item。原生控件在capture阶段排入微任务刷新，避免按钮被runtime移除后失去祖先；点击前重新获取状态，不依赖scroll。document模式custom运行库没有原生skip按钮，入站合法skipped状态仍如实保留；自由导航无通关锁。

## 验证与冻结

程序、教育、游戏完成独立组件早审后整合；作者自检不等同五席终审。媒体完整书面回退与原生repair的最后有界增量在正式冻结前交程序席实测。完整HTML实走每种缺项/空集、两组件×两机制×有无参考×对错、实际details同步、API/文件导入导出与新窗口、repair完整来回、全部36动态图与2静态图、迟到失败恢复、20原生choice和2张卡真实review。

允许环境只有jsdom与真实PNG检查。Image/rect/clock fixtures只证分支，不证真实浏览器布局、MathML字形、触控、Tab、200%缩放、浏览器解码或真人学习效果；未尝试被禁止的loopback/手工服务器/Playwright/CDP。全部已知缺陷关闭且作者自检完成后才记录FREEZE.json；完整正式候选五席送审后不修改。完整终审退回由root先修skill，再新作者独立重做。
