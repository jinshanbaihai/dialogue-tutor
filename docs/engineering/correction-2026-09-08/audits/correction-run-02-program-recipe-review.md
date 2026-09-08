# run-02 程序配方批判与可复用顺序

2026-09-08。已全文阅读 `reviews/correction-run-02-change-proposal.md`，并核对现runtime真实导入调用顺序。方向成立，但需要补齐下面的入口时点与幂等规则才能写成可执行合同。只写本评议，不改skill/runtime/作者产物。

## 1. “恢复入口先扫DOM”必须指实际替换状态之前

现 `lesson-runtime.js` 的公开 `importState` 与文件上传change处理器是两条实现：均先替换runtime state、`closeDueSolutions()`、保存与render，之后才 `notifyCustomRestore()`。因此仅在 `dt:restore` 扫描，可能已错过原DOM；只包装公开 `importState` 又漏掉文件上传UI。原生导出按钮也直接读取内部state，不经过公开 `exportState`。

**配方应改成：**所有实际导入入口在应用入站记录、关闭details、替换控件之前，进入同一个同步采集/验证边界。涉及异步读文件时，应在文件已读完、即将应用记录的时点再次采集；仅在file change最初采集不够。即时公开导出和原生导出按钮也应在取快照前同步采集，以覆盖“summary→立即导出→重开”而不只修import。

这需要明确真实接口实现位置。当前 `dt:restore` 并非pre-import钩子，不能用接口伪代码声称已经具备。若根选择给runtime增加最小共同入口/钩子，需单独程序实现、独立复核和兼容回归。若维持runtime不动而只做组件局部拒绝，应明确是在接受runtime envelope之后恢复本组件可信状态，不能宣传整份导入原子拒绝；还须解决原DOM被改动前的采集责任。不要用替换文件上传UI或随意猴子补丁藏起合同缺口。

## 2. 一张共享覆盖表，采集是纯函数，并集按语义键去重

固定 `sourceId → [{componentId, conditionKey, kind, revealedLineIds/range}]` 表，记录同一全解到底覆盖哪些题。DOM开闭状态由一个采集器读一次，按覆盖表分发给所有相关组件；不把“当前组件/当前条件”当作答案归属。一个共享全解若确实覆盖A/B，应同时记录；只覆盖A的参考不能污染B。

采集只读当前实际可见正文/提示/已提交显示的结果，不把请求中的frame、尚未load的图片、隐藏源码或仅存在JSON中的答案算已看。`details.open`还要考虑祖先是否隐藏/关闭。接触项按 `(conditionKey, sourceId, kind)` 幂等合并；不因重复扫描增加次数、刷新首次时点或改旧提交。已知真实首次时点保留；导入缺少时点时标来源/未知，不能伪造现在发生了一次新揭示。

`referenceCoverage`的“曾接触”与UI的“已展开行/详情”分别保存：提示接触不等于应该展开全部答案；`revealedThrough=3`也不应在另一条件下随意展开第3阶段。恢复使用经过验证的具体条件与揭示集合。

## 3. 可复用顺序（合同伪代码，不冒充现成API）

```text
collectVisibleExposure(DOM, committedFrameState, coverageMap)
    -> per-component per-condition delta       # 只读；不emit、不绘制

synchronizeTrustedExposure():
    delta = collectVisibleExposure(...)
    trusted = unionTrustedContacts(trusted, delta)
    persistTrustedSilently(trusted)            # 先写内存；存储失败仍可导出
    return trusted

submit(component):
    synchronizeTrustedExposure()              # 必须在冻结前
    if locked or not completeValidDraft: return
    frozen = copy(validDraft, conditionKey, trustedContactSnapshot)
    appendImmutableSubmission(frozen)         # 去重/锁定先完成
    lockCurrentAttempt()
    recordOneActualSubmissionAction()
    renderFeedback()                          # 事后接触只影响以后；不重算frozen

importAtActualPreCommitBoundary(rawEnvelope):
    current = synchronizeTrustedExposure()    # 保住当前真实事实，即便入站随后拒绝
    candidate = validatePure(rawEnvelope)      # 不改current，不绘制，不静默换hash
    if invalid:
        keepCurrentDraftsFramesSubmissionsAndContacts(current)
        reportRejected(reason)
        return
    merged = mergeValidatedIncomingWithCurrent(candidate, current)
    commitMemoryAndSilentPersistence(merged)  # 接触并集+冻结提交+恢复UI范围
    renderRestoredScene(merged)               # 再展开原details/行；不emit探索/提交
    return snapshot(merged)

exportAtActualSnapshotBoundary():
    synchronizeTrustedExposure()
    return snapshot(trusted)
```

如果整份入站拒绝，当前可信草稿、提交与场景都不被覆盖；同步采集刚看到的参考仍要保留，不能为“回滚”把真实接触撤销。验证失败不得进入 `fresh + copyIncomingSelection + overwriteCurrentHash` 路径。

允许明确的迁移函数，但必须识别来源版本、验证迁移后状态、保留接触来源，并对无法可靠迁移的证据降为未知/辅助或拒绝；不能把未知历史变成首次独立。

## 4. 最小数据拒绝清单

- envelope身份/内容revision与组件stateVersion、dataHash、componentId各自匹配；迁移必须单独声明，不能覆盖字段后当验证成功。
- conditionKey确属该组件支持集合；path、stage、requested/committed frame、line IDs及其组合属于该条件。加载中requestedFrame与上次committedFrame可不同，不能用“必须相同”误杀合法中间态。
- draft的组ID/候选ID/数值字符串合法，形状及大小有界；**完整性只在submit要求**，恢复合法半份草稿不能被当非法。错误但合法的选项必须能恢复，不得按正确答案过滤。
- submissions逐项结构与条件有效；相同submissionId不能被入站记录改写本页已冻结内容。冲突明确拒绝或保留本页可信原件并告知；合并接触时不重算过去 `assistedAtSubmit`。
- contacts/source/coverage/revealed ranges只接受已定义语义；共享全解的覆盖需一致，不能让A组件接受外来B的键后污染所有题。未知旧字段走明确迁移，不默认清零已有接触。

这是当前实际活动所需的有限枚举/形状校验，不要求通用防作弊服务、任意模型验证或重算全部客户端记录。

## 5. 恢复展开不能创造新动作

先把已验证的接触并集及可见范围提交/静默持久化，再恢复对应details、行和帧。`renderRestoredScene`只绘制，不派发 `dt:exploration`，不追加submission，不更新时间为“新揭示”。异步toggle到来时采集同一语义来源，delta为空，所以不再次写探索或增加计数。

**不能只靠短暂 `isRestoring=true; details.open=true; isRestoring=false`。** 原生toggle异步执行，此时布尔标志可能早已复位。应靠先写可信ledger+幂等语义键消除重复；必要的异步恢复事务标识只能作补充。共享全解恢复展开要依据同一覆盖表恢复所有确受覆盖组件的历史接触，不依赖组件监听顺序；不覆盖的组件没有变化。若导入可见范围本身与覆盖记录矛盾，应拒绝/显式迁移，不能绘制后再让另一个组件“突然发现新学习动作”。

## 6. 配方最终复验应补的最短对照

1. 每个组件：summary→同队列submit；summary→旧import→立即export→新窗口submit。
2. **公开API和原生文件UI都测**；还测summary→立即原生/公开export。上传读文件完成后才发生状态替换的边界不能漏。
3. 正常已展开全解→重开：具体details/行可见，历史接触不丢、操作计数不增、首次提交深比较不变。
4. 外来坏版本记录拒绝时，当前草稿/提交不变，刚打开的参考已进入可导出可信并集。
5. 一个共享全解覆盖两个组件；再打开只覆盖A的参考。分别检查A/B账本，不靠当前焦点归属。
6. 合法半份草稿、合法错选、加载中requested/committed不同组合能恢复；非法身份/候选/条件帧明确拒绝。

其余媒体失败回退链接、组间泄露、结尾与回忆入口方案可由各专项按实际接口继续审查。本次没有批准尚未形成的候选skill或下一轮课件。
