# DialogueTutor 1.7.0：run-03 实际课件色彩与 M1 复核

评审日期：2026-09-08。评审角色：美术／摄影色彩专家。

## 范围与源码裁定

本轮检查已冻结的 run-03 实际产物（9 个活动、3 个目标），范围限于实际自定义图与界面源码：真实 `fill`／`stroke` 或 CSS 填充与边框、明暗 token、图中文字与窄屏策略、色彩之外的识别线索及主次视觉。没有启动浏览器、服务器或替代预览，不使用旧 runtime 图的数据为新图背书。

**源码范围裁定：M1 关闭；未发现新的 Critical、Important 或 Minor 色彩缺陷。** run-03 的自定义抽样分布不是 SVG，而是由 `result.groups` 动态生成的 `div` 横条构成；默认 `n=2` 有放回时为 6 行，`n=1` 或无放回时为 3 行。源码没有把某个填充称为铜橙色轮廓。M1 的修订契约在本成品中得到符合项：横条使用 `background: var(--dt-plot-function)`，轨道使用 `background: var(--dt-surface2)` 和 `border: 1px solid var(--dt-control-line)`，说明文字只说“横条长度表示概率”，并以左侧均值标签和右侧精确概率共同说明含义。

这只是源码准入意见。H5 真实浏览器截图和渲染验收仍未完成，不能据此给出实际视觉通过、明暗通过、390px 可用或美感通过结论。

## 已落实的优点

1. **M1 对象身份准确。** `author/lab-body.html:12–18` 的自定义图没有 SVG `fill`／`stroke`，而是明确区分轨道和横条的 CSS 背景／边框；`author/lab.js:185–190` 只按概率比例设置横条宽度。没有“铜橙色轮廓”或类似错误文案。
2. **自定义组件沿用语义 token。** 选择器、预测区域和路径区域使用 `--dt-control-line`、`--dt-surface`、`--dt-ink`、`--dt-surface2`；卡片使用 `--dt-parameter-a` 边框和 `--dt-action-soft` 背景；比较提示使用 `--dt-parameter-b` 边线；理论分布横条使用 `--dt-plot-function`（`author/lab-body.html:3–15`）。作者源没有新增硬编码颜色。
3. **明暗主题在组装产物中有完整 token 覆盖。** `lesson.html:11–32` 定义浅色语义色，`lesson.html:371–395` 对 canvas、surface、ink、muted、control-line、action、focus、success、error、hint、plot 和 parameter token 提供深色值。自定义图引用变量，因此主题切换保持对象语义，而不是另写一套颜色关系。
4. **图示不依赖颜色单一识别。** `author/lab-body.html:51–52` 明确给出“横条长度表示概率”、满宽代表概率 1、左侧为均值、右侧为精确概率；每行同时有数值标签和概率文本。卡片直接写出 2、4、8 分钟，路径选择器和路径说明提供文本线索。该图没有把可辨认关系交给色相单独承担。
5. **主次层级在源码中清晰。** `author/lab-body.html:35–39` 将“保存预测”和“揭示精确枚举”设为 `dt-button-primary`，直接观察与开始新轮次为 `dt-button-quiet`；结果区在 `#r3-results` 中初始 `hidden`，避免结果预先夺取预测任务的视觉焦点。公共按钮、焦点环和页面层级继续使用既有 token。
6. **窄屏有针对性的重排规则。** `author/lab-body.html:2` 的控制区使用 `auto-fit` 与最小列宽，`@media(max-width:480px)` 将控制区改为单列，并为横条行缩小左右标签列、保留至少 45px 轨道空间（`author/lab-body.html:18`）。主体在 `lesson.html:347–367` 也降低窄屏内边距并将公共双图上下排列。源码显示了策略；换行、裁切和实际首屏位置仍需 H5 实测。

## Critical

未发现源码范围内的 Critical 色彩或视觉结构缺陷。run-03 中没有自定义 SVG；公共 runtime 的 `.dt-graph-area` 等旧图规则（`lesson.html:238–255`）不作为本实验图证据。

## Important

未发现源码范围内新的 Important。明暗 token、正文颜色、控件边界和自定义横条均引用共享语义变量；未观察到颜色关系被自定义硬编码覆盖。对比度和窄屏实际排版仍属于截图验收，不能用源码推断已通过。

## Minor

未发现源码范围内新的 Minor。run-01 的 M1 已在本成品中关闭：实际图是 CSS 横条，文字与其“长度／均值／概率”编码一致，且没有错误的填充／轮廓描述。

## H5 最小真实截图范围

由于当前没有正式预览设施，本轮不伪造截图或实测结论。完成实际视觉验收时，最小范围应在这份哈希固定的 `lesson.html` 上覆盖：

- `1440×900` 与 `390×844`，各浅色、深色；进入 `sample-lab` 初始状态，确认当前任务、预测控件和主按钮的首屏位置；
- 同样的四种视口／主题组合，揭示 `sample-lab` 结果，至少保留默认 `n=2` 有放回条件下的 6 行横条、均值标签、精确概率、路径表和比较文案；再在至少一个 `n=1` 或无放回的 3 行条件下确认动态重排；
- 390px 下至少选择较短横条与较长横条各一次，确认标签、轨道、概率文本没有遮挡或水平溢出；
- 浅色、深色各一次键盘焦点截图，覆盖预测控件、主要按钮或路径选择器；展开 `dt-explanation-lab` 的相邻区域，确认全解没有主题断层或新套框挤压。

截图外应读取自定义横条、轨道、标签和主要控件的真实矩形；源码中的 `font-size` 和媒体查询只能作为待测依据，不能替代浏览器 bounding box。

## 输入与哈希

| 文件 | SHA-256 |
| --- | --- |
| `generation/run-03/lesson.html` | `d9624b533e838edf4b06b974f15c07b0bb3bf653f36e4ea3b5e663c5adfe7c2c` |
| `generation/run-03/lesson.json` | `ab478d575b7c3147c2ed1c997ec81ed28d44db54657aeb36374cfa2348502b91` |
| `generation/run-03/author/lab.js` | `c2b8ff85894c40587a0937a34696bcf1fd1904c00ae835c4955e0c93dc0400ba` |
| `generation/run-03/author/lab-body.html` | `56e761f2217988b32f8311a8c3fd66c70fb2078f12a5e6f71d521824fd216b49` |
| `repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/visual-design.md` | `ff6c2cdc10e6e09d3e45bc3bd1d2b65cfd43024ae0dfd7445e7e9df108d34652` |
