# 通用 runtime 转移边界候选（待独立程序评委裁定）

改动范围：`repo/plugins/dialogue-tutor/skills/dialogue-tutor/assets/interactive/lesson-runtime.js` 与 `repo/tests/transfer-boundary.test.cjs`。没有修改或重新生成 `generation/correction-run-01`。根代理负责把最终获准接口写入技能参考与保存。

## 准确接口

```js
const unsubscribeImport = instance.beforeImport(function (context) {
  // context = {
  //   incomingState: 已通过公共schema的完整入站state，或null,
  //   currentState: 当前可信state的深拷贝,
  //   source: 'api' | 'file',
  //   validationError: string | null
  // }
});
const unsubscribeExport = instance.beforeExport(function (context) {
  // context = {currentState: 当前可信state的深拷贝, source: 'api' | 'file'}
});
```

两个注册函数返回只解除本次注册的函数，可重复解除；相同handler注册两次是两个席位。`destroy()`清除注册。组件在已挂载后只注册一次，不在每次restore中重复注册。

每次转移按当时注册列表快照、注册顺序同步调用全部handler；前一个拒绝也继续后续handler，让共享参考的各组件都有采集机会。每次调用重新深拷贝入站/当前state，后一handler可读到此前静默保存的当前接触。修改context副本不会改真实state或待导入候选。

返回undefined或true允许；false取消；throw拒绝并显示原因。其它返回值和Promise拒绝，明确要求同步；runtime不会等待Promise，也不会把异步结果当成验证成功。handler自身不应启动异步副作用、修改DOM或转入学习动作。

公开`importState(value)`和原生文件输入处理共用内部实现。公共schema无效、JSON解析失败、文件超过5MB或文件读取失败仍执行采集handler，提供`incomingState:null`及`validationError`；采集之后core始终拒绝，不可能靠handler把无效候选放行。所有handler错误中取第一个报告；公共格式/读取错误优先于handler错误。

公开`exportState()`和原生导出按钮同样共用同步采集；原生导出handler通过前不创建下载Blob。API失败抛错，两个原生入口失败显示明确状态；错误会展开学习记录面板。导出失败不生成不完整下载。

## 组件顺序

导入handler先同步扫描当前真实参考入口（原生details.open、已经显示的当前结果帧、已进入组件的提示/结果接触），把增量并入**可信本地快照**，用既有`restoreExploration(id, trustedLocal)`静默保存；然后在incomingState非null时纯校验候选的componentId/stateVersion/dataHash及合法条件、草稿、帧、提交形状等。校验不可通过改写入站hash充作迁移。无候选时返回即可，core保留拒绝。

拒绝不替换旧草稿/attempt/组件提交；刚刚采集到的真实接触仍保存在当前exploration和存储中。无采集增量的拒绝保持state与存储字节不变。guard期间允许restoreExploration，阻止学习transition、navigate、refresh及递归导入/导出。该接口是合作组件边界，不是隔离任意作者JavaScript的安全沙箱。

全部guard通过之后才执行：prepareSession（读采集后的current）→替换state→closeDueSolutions→save→renderActivity→按活动派发dt:restore→面板/场景更新。`dt:restore`中组件把合法入站草稿与已持久化本页接触/冻结提交联合、去重，调用restoreExploration后重绘；不发dt:exploration，不增加操作、participated、attempt或时间，不倒改首答。

导出handler只执行同一可信接触采集与静默保存，不能校验或接受不存在的入站state。随后runtime返回/下载当前完整envelope。不要在handler中递归exportState；用context.currentState或getState读取。

初始localStorage装载仍先由公共schema恢复，再挂载组件；组件在dt:activity-mounted中负责自己的严格身份校验与显示错误。新钩子只覆盖用户导入/导出，不把挂载生命周期冒称pre-import。

## 实际自测与限度

`node --test tests/runtime.test.cjs tests/lesson-dom.test.cjs tests/studio.test.cjs tests/transfer-boundary.test.cjs`：83项通过，退出0，原始日志`reviews/correction-runtime-02-tests.txt`。这是候选作者测试，等待独立裁定。

新增17项覆盖公开API和原生file-input change、原生导出按钮、所有guard顺序、替换前同步DOM采集、due details关闭次序、拒绝/异常旧state及DOM保留、拒绝仍保存多组件接触、坏JSON/过大/读失败文件、Promise/非法返回拒绝、解除注册、重入、立即持久化与新窗口恢复、存储失败内存导出；既有legacy/studio共66项继续执行。

jsdom的File缺少text()，测试只为真实File对象提供text()；仍走实际input change listener，不包装公开importState。下载使用真实Blob并以FileReader解码核查。原生summary.click后紧接API调用，不手动派发toggle。测试验证运行顺序与状态，不认证浏览器布局、媒体解码或最终数学课程教学质量。
