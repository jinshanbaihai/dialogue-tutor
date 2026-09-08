# 程序修正实施记录与作者接口

2026-09-08。已按根裁定完成最小程序修正，未 commit/push，未修改 SKILL 或 references。只修改组装器、运行时 CSS/JS、构建测试并新增 DOM 合同测试。**代码回归通过，不代表最终抽样样章或 Manim/手机视觉已验收。**

## 实际新增接口

新课 JSON 顶层明确填写：

```json
{
  "schemaVersion": 1,
  "presentation": "document",
  "generationPolicy": "no-typing",
  "theme": "light"
}
```

`presentation` 省略时原本就默认 document；本次未重写正文组装。`generationPolicy` 只有省略/null（旧兼容）或 `no-typing` 合法；`theme` 只有省略/null（保留旧自动浅深）或 `light` 合法，其他值明确报错。

`generationPolicy:"no-typing"` 拒绝 quiz/open、quiz/numeric；仍允许 choice、flashcards、steps、explore、interactive。组装器检查静态正文及 interactive.bodyHtml、steps[].bodyHtml、remediation.bodyHtml：可编辑 textarea、文本/数值等输入、启用的 contenteditable 均报错；原生 radio、checkbox、range、select 和按钮保留；只读复制文字可用。作者笔记使用现成可选 runtime 笔记，不在学习主流程新造输入框。运行时也拒绝 no-typing 的非 choice quiz，避免手动替换 JSON 绕过该格式约束。

**静态策略的边界：**组装器不执行任意作者 JavaScript，不能证明脚本稍后没有创建输入框或偷偷揭示答案。最终浏览器中必须从头到尾只用按钮/选择完成新课；检查实际生成节点，不能拿 policy 字段冒称已经完成免打字贯通。

`theme:"light"` 在生成 HTML 根节点写 `data-dt-theme="light"`，runtime.mount 同步支持该属性。对应 CSS 使用较高优先级并明确 `color-scheme:light`，不受旧 dark media query 影响。采用色彩报告的浅色 canvas/surface/ink/muted/line/action/focus/math-x1/math-x2/math-stat/success/error/hint tokens；辅助状态底色统一 surface2；按钮16px/最小44px，正文17px/1.8，MathML20px。数学身份供作者使用 `--dt-math-x1`、`--dt-math-x2`、`--dt-math-stat`，框/标签另表达正误；作者还须将相同色值用于真正 Manim 源数据，CSS 不会替其修改 PNG。未用滤镜伪造深色图。旧无 theme 课程样式未改。

学习记录面板本来就是默认关闭的 details，故**未新增 studyPanel 字段**。新 document 保留现成关闭面板。

## HTML 挂载与锚点的实际合同

- 活动 `data-dt-activity`、推导 `lineId`、前提锚点和 quiz/interactive 引用的 `solutionId` 均放在静态 `sections.bodyHtml`。每个活动仍由 `section.activityIds` 指派，内嵌挂载恰好一次。static solutionId 必须是关闭的 details。
- 新增跨静态/动态片段的 ID 冲突检查；动态 interactive、steps、remediation 内不得再嵌活动挂载；静态活动容器也不得嵌另一活动容器。冲突直接构建失败，不尝试动态发现晚来的节点。
- dynamic fragment 的 ID 使用活动前缀、全课唯一。即使某些步骤不会同时显示，也不要复用同一 ID；此处采用保守唯一规则。旧测试集所有现成示例均仍通过，但未审遍用户所有外部旧课程。
- 已揭示完整推导留在静态正文；前后按钮控制作者图帧与当前高亮，不调用旧 steps 来隐去此前主链。主推导持续可查、revealedThrough/conditionKey/帧manifest 是作者组件责任，本次没有增加泛化步骤平台。

## 自定义完整构造题使用现成接口

一个 interactive 中放多组原生选择，提交前不分别判对，一个“提交完整构造”冻结答卷；界面称“构造选择核对”。通用 runtime 仍只记录探索，不能把组件核对结果冒充统一独立成绩或复习调度。

```javascript
// 脚本先在document注册；过滤实际活动ID。
document.addEventListener('dt:activity-mounted', event => {
  if (event.detail.activityId !== activityId) return;
  // 此时节点已存在，DialogueTutor.instance 已可用；绑定一次。
  // 验证/恢复探索快照，画同源帧，恢复本组件控件。
});

// 每次真实选择、统一提交、主动揭示或前后步保存完整快照。
document.dispatchEvent(new CustomEvent('dt:exploration', {
  detail: {activityId, state: snapshot}
}));

document.addEventListener('dt:restore', event => {
  if (event.detail.activityId !== activityId) return;
  // 校验stateVersion/dataHash/conditionKey/合法状态；
  // 导入参数与本页已发生接触合并，不重写已冻结提交时点的辅助。
  const result = DialogueTutor.instance.restoreExploration(activityId, mergedSnapshot);
  // 同步写回后重绘；不重复绑定，不发dt:exploration。
  // result.persisted=false时不能承诺刷新恢复，但导出仍可取内存快照。
});
```

以上代码只说明调用位置，不是完整作者组件。作者必须实现条件身份、接触覆盖、完整答卷冻结与字段验证；不能复制注释当作已经实现。推荐快照字段为 `stateVersion/dataHash/conditionKey/stageId/currentFrameId/revealedThrough/draft/submissions/contacts`，限制100000字符，保存 ID/数据而非图像字节。每个答案入口（全解、最终帧、视频结果、提示）合并实际条件接触；提交前同步检查当前可见入口，避免异步 toggle/媒体事件竞态；导入旧草稿不能抹接触。源数据/媒体不应放进浏览器进度历史。

## 已执行的检验

执行 `python -m unittest discover -s tests -p 'test_builder.py'`：19项全部通过（保留15项，新增4组实际风险断言）。覆盖旧studio/document、旧numeric/open、no-typing拒绝、静态和三类动态片段输入、跨片段/静态ID冲突、嵌套挂载、静态solution锚点、明确浅色属性。

执行 `node --test tests/*.test.cjs`：72项全部通过（保留70项，新增2项）。新 DOM 场景实际调用组装器生成 HTML 后在 jsdom 加载：静态前提旁挂载→选路径→刷新组件面板→导出/导入→恢复同一选择→再选路径。确认组件节点/监听不重复、restore不计新探索、公共记录仍无伪造评分、面板保持关闭。另核 no-typing格式拒绝与旧numeric支持。`git diff --check` 通过。

一次 `npm test` 启动后等待工具报告“network approval was cancelled before a decision was returned”；随后直接执行其同一底层 Node 命令，得到上面的完整72项成功结果。没有将未收尾调用写成通过。

未执行真实浏览器、360/390宽截图、最终颜色 computedStyle、真实 Manim渲染、最终章数学重算、无放回删对角/重赋权、各错项补讲与新题保护、作者自定义接触合并实物。它们仍按程序设计报告与教育/色彩验收场景交给最终独立审查，测试数量不能代替这些教学证据。

## 独立代码复验 I1 修复

独立评委实测指出 Python `dict(attrs)` 对重复属性保留最后值，而浏览器保留首值，故 `<input type="text" type="radio">` 原先会绕过免打字检查，重复 id 也会造成校验与真实 DOM 不一致。已采纳：统一 Node 入口在 dict 转换前按属性名小写判重，任何重复属性直接构建失败，覆盖普通/自闭合标签及静态和动态片段；不猜测哪一个属性才是作者意图。

新增风险回归覆盖 type、混合大小写 TYPE、自闭合输入、重复 id、contenteditable，以及合法不重复的混合大小写 HTML 保真。修复后 Python **20/20**、Node **72/72** 全部通过，`git diff --check` 通过；已通知独立代码评委定点复验。合法旧测试仍通过；含重复属性的旧 HTML 必须消除歧义后重组装。
