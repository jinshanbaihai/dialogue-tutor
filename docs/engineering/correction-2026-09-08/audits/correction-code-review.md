# 程序修正独立代码复核

**最终状态（同日修复后复验）：I1 已关闭，未解决项 C0 / I0 / M0。最小程序改动通过代码合同复核；课程与 Manim 验收仍未进行。以下首轮结论保留为审计历史，修后证据见文末。**

2026-09-08。独立于实现者；只复核最小程序改动及对应测试，未修改实现、未 commit/push。**本轮结论：Critical 0，Important 1，Minor 0。I1 修复前不对新增静态验证合同签署通过。** 这不是课程、数学操作或 Manim 实物验收。

## 范围及实测

已读 `reviews/correction-program-design.md`、`reviews/correction-program-implementation.md`、设计 brief 中根裁定；核对实际 git diff 和相关调用上下文：`build_lesson.py`、`lesson-runtime.js`、`lesson-runtime.css`、`tests/test_builder.py`、新增 `tests/document-policy.test.cjs`。未借本轮重新审核整份 SKILL 或未生成的新课程。

独立执行：Python 构建测试 **19/19 通过**；`node --test tests/*.test.cjs` **72/72 通过**；`git diff --check` 通过。Node 包含真实组装器输出的 jsdom 挂载、选择、刷新、导出/导入、再次操作场景；没有把 jsdom 当真实浏览器，没有把旧测试计数当学习效果 QA。

## I1：重复属性使静态验证所见 DOM 与交付 HTML 所见 DOM 不同

位置：`build_lesson.py:233,263–270,365–394`。`Node` 用 `dict(attrs)` 保存属性，同一名称后值覆盖前值；输出仍使用保留所有属性的原始标签。HTML DOM 解析采用前值。新增免打字和动态 ID 检查因此可以通过本应拒绝的静态内容，不涉及作者 JavaScript 动态造节点。

独立最小复现：从 `tests/test_builder.py` 的 `small_lesson()` 创建课程，加 `generationPolicy:"no-typing"`，把活动改为 `interactive`，将下列内容分别作为 `bodyHtml`，调用实际 `assemble()`。两次均成功；用 jsdom 解析输出 JSON 内的动态片段，得到：

| 作者片段 | 构建器所见 | jsdom DOM 结果 |
| --- | --- | --- |
| `<input type="text" type="radio">` | `type=radio`，允许 | `input.type === "text"`，存在可键入答案控件 |
| `<p id="duplicate" id="path-one">one</p><p id="duplicate" id="path-two">two</p>` | 两个不同 ID，允许 | `querySelectorAll('#duplicate').length === 2` |

这是格式不规范的作者 HTML 触发的边界，不能推断现有正常样章已受影响；但它直接反驳本轮新增的“静态输入拒绝/跨片段 ID 冲突检查”合同，且存在小范围确定修复，所以列 Important。解析器旧实现早已存在；问题在新增检查信任其后值语义而交付原文。

建议最小修复：在 `handle_starttag` 和 `handle_startendtag` 共用的入口拒绝重复属性（HTMLParser 已规范属性名大小写），输出明确 LessonError。不要仅靠扫描 `type=`，也不要只修 input；`id`、`contenteditable`、挂载属性有同类问题。增加重复 `type`/`id`、大小写属性以及自闭合标签的针对性测试，修后确认合法 radio/readonly、旧 numeric/open 仍通过。无需引入浏览器或改写 runtime API。

## 已核对成立的合同

- Python 和 JS 均对 `generationPolicy` / `theme` 的未知非空值报错；省略/null 保持原兼容入口。`no-typing` 只禁止 quiz 的 numeric/open，没有删除旧格式的运行时、导入、评分实现。
- 合法 HTML 的静态正文、interactive、steps、remediation 片段进入新检查；原生 radio/checkbox/range/select 与 readonly 文本例外成立。runtime 只补 quiz 格式守卫，未声称执行任意脚本静态分析；最终作者组件仍须实际贯通免打字。
- 新 `theme:"light"` 在组装 HTML 根节点与 runtime.mount 设属性；浅色变量规则位于旧深色 media query 后，作用域覆盖 root/活动/记录/studio，具有更高 specificity，包含 `color-scheme:light`。旧无 theme 的 CSS 规则未改。这里只核查级联代码；未测真实 computedStyle、字体/图像、手机尺寸或对比度。
- 动态活动挂载禁止、静态嵌套挂载禁止、跨静态/动态 ID 集合合并、静态关闭 details 的 solutionId 检查已接入组装。正常 fixture 验证正文旁挂载一次、组件节点保留、restore 不增加探索、无伪造统一评分。
- `createActivityView` 对静态活动容器使用 append；它不会清空容器原有正文。已排除“挂载会直接删去静态解答”这一候选问题。
- “动态 ID 使用活动前缀”是作者约定；当前检查器强制全课唯一，未强制前缀。实现记录没有把前缀验证列为现成 API，故不另报缺陷。

## 兼容边界必须保留在交付说明中

跨动态片段唯一规则 **不受 no-typing 开关控制**，因此旧课也可能不能原样重新组装。已具体复现：无 policy 的旧 steps 两步分别使用 `<p id="current-line">…</p>`；HEAD 组装器接受，工作区组装器报 `answer.steps[1].bodyHtml: Duplicate or reserved DOM ID: current-line`。这些步骤原本不会同时显示。

实施报告明确采用“即使步骤不同时显示，也全课唯一”的保守规则，并披露未审遍外部旧课，本复核将其记作**有意兼容收紧**而不重复报 I。旧已生成 HTML 的执行与旧 numeric/open 数据支持，与旧源文件可无改动重新构建是两种不同兼容性；不能宣传后一种全面无损。若根裁定要求旧源完全可重建，则该规则须改为新生成 opt-in 或另行提供明确迁移。

## 审阅对象 SHA-256

| 文件 | SHA-256 |
| --- | --- |
| build_lesson.py | `4138ecd5eaf4f8d06b65ca2eac7ccaceb42eb667cdc55480d48ba27e3c0b6844` |
| lesson-runtime.js | `860b7671d276bc263e3f062ad669e761b2b45937c85bbf7e4f5a6a18b7d0ce60` |
| lesson-runtime.css | `7d99b9a3216d08d0d976549c1a9484dd2a4df0538ced785f48b7b98ce60cbee3` |
| tests/test_builder.py | `e07161a264c803d678fb1d357f9e2daa4a8fc637797fb5baa6b95567c364154e` |
| tests/document-policy.test.cjs | `ab4fa937b63605b517da477e2a0605fc89237b2ffe1f3f836f45f1605c9e5840` |

本报告未验证实际 Manim 渲染、最终媒体 hash、条件切换、逐行证明、统一构造首答保护、作者接触合并、最终窄屏或真实浏览器。它们属于待生成课程的后续独立验收；此处没有以源码回归替代。


## I1 修复后独立定点复验（最终裁定）

2026-09-08。已核对实现者把重复属性检测放在 `Node.__init__` 的 `dict` 转换前，属性名小写后判重；普通开始标签、自闭合标签都经过此入口。它同时覆盖静态、三类动态片段及旧 base HTML，不依赖 no-typing 标记，不再通过选择一个重复值猜测作者意图。

独立重跑首轮两个原始复现：重复 `type` 和重复 `id` 都由实际 `assemble()` 报 `Duplicate HTML attribute`，未生成错误 HTML。另行实际组装合法混合大小写 `TYPE="radio"`、只读 input/textarea，以及省略 policy 的旧 numeric/open，均成功。新增测试对大小写、contenteditable、自闭合及四个内容入口的覆盖已读过。

定点复验结果：Python 构建集 **20/20 通过**；`node --test tests/document-policy.test.cjs` **2/2 通过**（由修后组装器生成 HTML 后挂载、选择、刷新、导入恢复与再操作）；`git diff --check` 通过。JS、CSS、DOM 测试文件的哈希与首轮相同，故本次未重复全量 72 项；首轮全量独立结果仍记录在上文。实现者报告其修后全量 72 项通过，此句只是注明来源，不混作本评委修后独立执行结果。

**I1 关闭。最终未解决项 C0 / I0 / M0；最小程序差异通过代码合同复核。** 上述跨互斥步骤 ID 唯一性及含重复属性的旧源文件重构建限制继续生效；这不是对所有外部旧源的无损兼容保证。没有据此批准未生成的最终课程、图帧或真实浏览器教学过程。

修后最终哈希（其余三文件见上表，已确认未变）：

| 文件 | SHA-256 |
| --- | --- |
| build_lesson.py | `74957acf9cbdd8b1d8a39b0d5ce77a94e9a8219ea140d799c2506808859e25d8` |
| tests/test_builder.py | `86b0f5f60254b5dec8e76602b1ccc2c9ff5b4443e7bbc97f62ee6f6be5a1a178` |
