# run-02 候选 skill 视觉条款复审

2026-09-08。**本席批准候选 skill 的视觉与媒体失败回退生成合同，可据此开展空白新生成。** 此为分工范围内的技能条款批准，公共 runtime 的 beforeImport / beforeExport 实现另席审核；整包采用由根代理汇总裁定。本结论不批准尚未生成的 HTML，也不把 run-01 已批准 PNG 的证据转给不同 hash 的新图。

## 输入与实际阅读覆盖

已逐个计算候选快照所列 19 个文件 SHA256，全部与 `reviews/correction-run-02-skill-candidate-hashes.json` 一致。全体 hash、行数及本席阅读层级保存为 `reviews/correction-color-skill-run-02-readcoverage.json`；hash 核验不等于声称读完全部 19 文件。

本轮完整连续读取新 `generation-checks.md`（51 行）和 `visual-design.md`（62 行）；读取对已批准基线 `2684` 的全部 SKILL、interactive-html、expert-review 候选差异，并复读 SKILL §0.5 路由、interactive-html 条件身份、真实 Manim 媒体与恢复条款的受影响上下文。未重新全文复读 2293 行 SKILL，也未审查公共 runtime 新实现。

|本席签认输入|SHA256|
|---|---|
|SKILL.md|e189f73e9415e6b29903cd6e946caea7ee9718a479b8ec021bcc0c6a130f63a5|
|generation-checks.md|86661c5c58a6fb3f0b74d8080f31783b518d54b5427d81f64bbd31ac4d30a8e2|
|visual-design.md|95b4e7dd6d2457805da2b28ba0ec9eabe42b2a86d5ddd9fa4981fa6dc8a590cd|
|interactive-html.md|79f7277d9a3d5ed8c858184bf3154c0f02eed3769f2ff6931bfe8d283a0e8f71|
|expert-review.md|940674723145616418ca77a92abec5ad93fdb4a8c996ef81d03cf596dba17d2f|

## I1 角色数值绑定：合同补齐

visual-design 已要求 conditionKey/pathId/lineId/occurrenceId 与 operandPosition 定位表达节点，保存 objectId/role/精确值/token；明确变量、观测代入值和统计量结果都受角色绑定约束。两次同值仍保留不同角色，普通样本量、概率分母和中间和可保持墨色，禁止字面数字全局替换。由同一带角色记录生成 Manim、静态 MathML、动态公式及同角色的选项/反馈，不再仅凭一个青色 T 算通过。

没有凭空扩大配色对象。自然语言概率备选不被强迫成为数学角色；原生 choice 的 text 被明确识别为纯文本边界。需要角色公式时转到可承载受控 MathML 的原生选择，或在紧邻正文保存同身份公式，且仍实际核是否丢失角色。此约束尊重现有 renderer 的能力，没有要求任意 HTML 注入或给所有通用数字着色。

generation-checks 的角色合同与第 6 项强制覆盖静态和每个合法动态帧，逐位置核值与 token，包括正反路径、同值不同角色、变条件和正误状态；expert-review 明确把角色数值节点纳入独立终审。这已把 I1 从审美建议变成生成前数据设计及生成后可执行检查。

## I2 当前请求的失败回退：合同补齐

interactive-html 已清楚区分 requested / displayed；开始加载前验证条件/路径/阶段并更新当前语义链接与说明，隐藏旧图式组；当前成功回调才一起显示新图/公式/目标，失败仍指向当前请求的书面推导。旧成功、旧失败和恢复前遗留回调不能覆盖新状态。路径概览允许回到本条件完整路径集合，避免把合理概览链接误判为逐行映射错误。

六类实测已写入条款和 generation-checks 第 7 项：同条件换路径失败、跨条件失败、C 成功后旧 B 成功/失败、失败后重试、加载期间恢复。检查对象包括 image/formula/target/href/caption/status 与显隐，并明确 href 存在不等于数学语义正确。恢复条款也承认加载中 requested 与 displayed 可合法不同，未因验证规则把正常中间态排除。

## M1 层叠结果与证据边界：合同补齐

visual-design 要核真正胜出的层叠结果，特别比较 light runtime 与课程 MathML 的 specificity；不得用被覆盖的 24px 声明声称实际 24px。generation-checks 要从真实祖先 padding/边框扣出图像内容宽，不能只报外部 figure 宽。

证据明确分成静态源码、真实 DOM 事件、人工 load/error fixture、实际 PNG 目视/像素、真实浏览器。人工 fixture 不认证图片解码或排版；jsdom 不认证原生 MathML、触控、Tab 或 200% 缩放；不可用项明确未测并按当前任务约定报告。未出现把模拟改名成浏览器通过、或用声明补造 computedStyle 的放宽。

原已批准 singlelight 色表、角色形状、真实 Manim/精确同源、手机拆图不缩小数学字形、对比度与线宽地板均保留。本轮不增加阈值，也不把 20px HTML 公式本身宣布不合格。

## C / I / M 与允许范围

- **Critical：无。** 本席范围内未发现新的致命合同矛盾。
- **Important：无未解决项。** I1 / I2 对应的生成数据、显示流程和具体检验均已入文。
- **Minor：无未解决项。** M1 有效字号及证据分类已纳入。

SKILL §0.5 已在正文与组件编写之前强制读取 generation-checks 并形成当前课程的生成/验收对应表；缺项先补设计，不能最终只数按钮或行数。新表还规定独立数学期望、作者风险检查、冻结记录以及完整课件退回后修规则再由独立作者空白生成，故本席可批准这些条款用于下一轮生成。

下一轮仍须审实际蓝图、真实输出和冻结 HTML。技能通过不是未来作品视觉通过；公共 runtime 审核结论、本轮不同学科专家意见和最终是否启用候选包由根代理汇总。若上述签认文本 hash 改变，按受影响内容定向复审；本席未修改 skill 或产物。

## 定点补充签认：接触采集 helper

教育终审修补后，仅 interactive-html.md 的 SHA 从 `79f7277d9a3d5ed8c858184bf3154c0f02eed3769f2ff6931bfe8d283a0e8f71` 变为 **`8829005b923cab403f9aa98399d077f57a36b1c23bb55133ee920de453a7614b`**；本席重新核对其余 18 文件，均与上表快照一致。已定点读第 240–272 行：`collectVisibleExposureFor(id, conditionKey)` 与 `trustedExposureFor(id, conditionKey)` 取代裸 open/粗粒度布尔，明确祖先显隐、条件覆盖、当前可见与可信历史的区别。隐藏且尚未展示的参考不被计入；真实历史也不因现已关闭而撤销。

该修补与 requested/displayed、失败回退和证据边界一致，不改变角色色、数学图或有效字号合同。**本席视觉生成批准保持有效；C/I/M 无新增。最终签认 interactive-html 采用上述新 hash。** 此为定点阅读，不冒称重新全文复读所有技能文件；公共 runtime 实现仍属另席范围。
