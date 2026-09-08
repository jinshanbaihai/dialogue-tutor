# run-02 蓝图程序预实施定点复核

2026-09-08。已完整读取 `generation/correction-run-02/generation-contract.md`，本次读取SHA-256 `5978fd520b527fdc946ba12f7ab581617d72803bafbda7020815e06865c47923`。**方案在已批准runtime接口上可实施；尚未发现需要改变架构的C/I/M缺陷。** 本文是编写前的接口与遗漏核查，不是HTML/媒体实物通过，也没有读取未完成代码后给出测试结论。

已直接把下述两项顺序澄清发给 `correction_author_02`。它们是既有合同的具体落实要求，不另加课程功能或学习效果阈值；作者须在实现与实际测试中兑现。

## 两项必须明确的实现语义

### 1. summary默认行为与同步采集的真实时点

不能仅在summary的click捕获/冒泡处理器读取 `details.open`，就声称取得了这次打开后的状态：原生默认切换可能发生在监听之后。保留原生summary语义时，toggle/微任务可补充采集，但同队列的submit/import/export必须在各自共同边界再次读取当刻真实DOM。这些边界能读到summary默认行为完成后的open状态，才是已批准API保证的时点。

如果作者选择接管summary点击并同步改open，必须保留原生键盘/语义与关闭行为，明确代码顺序，不通过预记“打算打开”替代真实展示；本评委不要求为此改造原生控件。祖先hidden/closed details/display/visibility检查应在任何入口都先成立，再检查“矩形相交或明确定位”，不能让明确定位分支绕过祖先不可见条件。

编写后仍实测两个组件各自的原生summary→同队列submit、summary→old import→立即export/存储→新窗口submit，包含公开与原生文件入口。不能只证明一个自定义“全解”按钮的同步代码。

### 2. build-sample两机制的草稿与锁定不能串状态

main-map已经明确预测冻结conditionKey、另一条件不借用旧预测。build-sample同样需要定义：WR/WO各自未完成草稿、当前锁定答卷、历史提交和重试的关系；切回时恢复哪一份。可以按条件保存，也可用明确的切换策略；不指定必须使用何种字段结构。

最低判据是：切机制不改写旧submission的conditionKey/答案/辅助快照，不使另一个未答条件因旧锁定而无法构造，不把旧正确选项无声填成新条件的首次选择。若有意沿用草稿作比较，界面须明确这份草稿来源，接触身份按覆盖保留。实际测试WR提交→WO未答→WO合法错答/重试→回WR，以及两条件半份草稿的导入/重开；只核课程已经承诺的两个条件。

## 其余关键合同核对

| 合同 | 程序判断与后续实测点 |
| --- | --- |
| main-map位于答案前 | 能保留真实未揭示入口；静态主链持续公开并不等于初始化时全部已呈现。首次页面source扫描不得仅因节点存在就把所有条件都标辅助 |
| 静态presented | 祖先实际可见后，当前rect与viewport相交或明确导航定位才记来源；无停留时长阈值符合本轮约定。observer只是补充，每个submit/import/export共同边界重新采集。字段称presented而非已读/理解 |
| presented与恢复展开 | 历史presented contacts单调保留；visibleSolutionIds/line范围恢复UI；当前viewport测量属于此时事实，不能把全部历史presented行当作当前都在viewport，也不能恢复滚动/展开时新增探索次数。无需强求所有历史行同时入屏 |
| 两目标结果覆盖 | 静态bar-5与bar-1必须都实际呈现才回答两概率；一个目标不够。整分布bars帧可以覆盖二者；paths/mapping只给相应事实。targets必须带conditionKey，WR两行不能和WO的一行混凑完整结果 |
| 预测冻结与收束 | 预测绑定提交时的条件、选择及辅助，之后看到bars不倒改首答。切条件只取匹配的预测，无预测时不得把WR历史当WO新判断；结果与作答/正确/辅助/跳过分别保存，蓝图已明确 |
| 动态帧接触 | collect读取实际显示且当前祖先可见的committed/displayed状态，不能按requestedFrame或仅onload发生过就记当前新条件结果。切换隐藏旧图式时，旧历史保留而新请求不算已看 |
| requested/displayed与失败回退 | 请求前更新当前caption/href/回退文字并隐藏旧组，当前成功才原子显示图式；失败保留当前请求语义，恢复使旧回调失效。不会要求所有合法加载中态的requested=displayed |
| 入站拒绝 | beforeImport先采集可信当页、静默保存，再纯验组件身份/dataHash/合法枚举；坏候选不改hash、不替换旧草稿/提交，刚发生的接触保留。初始localStorage恢复在mounted单独校验，不能只注册import guard |
| 已揭示范围恢复 | 提交可信并集和具体visibleSolutionIds后再展开，按语义来源幂等处理迟到toggle；同一共享全解按source覆盖表分配，不能依当前焦点。瞬时isRestoring布尔不足以保证无新动作 |
| 完整构造 | mapping由学习者草稿产生且保留误选，distribution候选不泄露合法路径全集；空集可明确提交，评分仍检查missing。只是允许提交空集不等于空草稿被自动当作有意空集，作者应保留明确提交行为。条件错误资格与数值映射反馈分清 |
| 资源与测试证据 | 有限帧清单可验证，实际DOM请求字节/清单、行与角色对应仍待实物。rect fixture与人工load/error只验JS分支；真实滚屏/图片解码/浏览器未测须继续明示 |

本次没有新增viewport相交比例、停留秒数、用户动机分数、额外条件或不存在的组件API。不是只有祖先可见就等于读过，也不把无浏览器情况下的jsdom矩形当真实屏幕证据。

## 下一步

作者按以上顺序完成具体函数、状态和coverage表；蓝图已要求最终真实内联JS风险检查，正式冻结后本评委仍需亲自执行。预实施沟通可修正实现偏差；一旦整课正式提交并退回，仍遵守先修skill、复审、独立空目录重生成。本文没有批准未提交的新HTML。
