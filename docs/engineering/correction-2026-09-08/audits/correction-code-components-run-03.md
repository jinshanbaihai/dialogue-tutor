# run03 组件试件程序独立预审

首轮冻结快照裁定：**C0 / I2 / M1，待修后复测。** 此为可迭代组件试件，不是完整课件终审退回；允许作者修复。本席没有改作者代码或试件。

## 快照与实际测试

先复制输入至`reviews/correction-code-components-run-03-snapshot/`，随后只执行该目录HTML中的实际内嵌JS：

|文件|SHA-256|
|---|---|
|component-trial.html|338a9e12ceb3419a4767507e24a989014da994da725fb79aac2a1e4359f49285|
|component-trial.json|2fe5a1e03fbbf543527bcad6324d8c3220f50e039582ab56774a46ebaefa35d1|
|components.js|7ee49b1ae21488756edae9e62aa3d3d2da2a21a3d1e4556fc486c509267f258e|
|author_math.py|561b9e11453a391e48de5f0438dac5fb109492b463a59d67e25da0fa15c01732|
|build_trial.py|4583d8af0b4ee4c05adf030d51bc33f4092f86de0ab07e2d5b177df71afef556|

独立脚本`correction-code-components-run-03-probes.cjs`：6场景38检查，35通过、3失败断言，结果`correction-code-components-run-03-results.json`。未导入作者judge或测试helper作预期；从R1/S1/T5固定题干写正确maximum映射与概率。媒体尚未接实际PNG，故向试件已有RUN03_FRAMES对象加入明确fixture并用真正生成的frame按钮触发实际media代码，人工调用Image回调；此证据不认证真实帧或解码。viewport用明确矩形fixture，File.text用延迟Promise，原生summary使用.click默认动作。所有6场景无未捕获异常。

## I1：接触保留，但新窗口未恢复已展开参考范围

全新试件导出old，点击`#max-wr-reference > summary`，同队列import(old)，立即export/取实际localStorage，新窗口装入。`conditions.wr.contacts['max-wr-reference']`存在，但`#max-wr-reference.open===false`。首轮模型没有独立openSources/visibleSolutionIds及对应initialize恢复，实际已揭示范围丢失。不会洗掉该布尔辅助来源，但违背蓝图的已见范围恢复。

修复应保存具体已展开来源ID并校验其owner/condition/reference类型；先合并并保存，再展开DOM；异步toggle幂等，不把恢复变成学习动作。

## I2：repair真实完整原行入口之后再答仍无辅助

按WR完整填写九路径与映射、weight=wr、概率4/9和5/9，然后把输出1改成0并提交。点击实际next→repair→repair-source（焦点到`max-wr-complete`）→repair-restart→完整正确答卷提交。第二提交`assisted:false`，当前`contacts:{}`。首答错误差异与原答案保持，源定位和回返按钮本身可用，但实际修复支持没有进入后续接触。

`max-wr-complete`大包装不是coverage source；只有其内部两个group有static来源，矩形fixture零时不会自动记。修复显示的具体missing/extra/映射/概率差异、核对反馈和具名原行查阅应有可信来源。尤其应让同条件重试保留已经发生的支持，不能改写首答的assisted。

辅助接触与两个目标概率已呈现分开：不得为补此缺陷，仅定位一个很大的complete包装顶部就声称main两个比较目标都已呈现。按实际反馈/修复来源记辅助，目标仍按实际完整group/帧覆盖判定。

## M1：同来源并集用本地较晚时间覆盖导入较早时间

打开max-wor-reference，导出合法状态，令同source入站at比本地早10000ms，import后实际at仍为本地较晚值。当前`Object.assign({},incomingContacts,trustedContacts)`没有按最早时间合并。

来源/条件/目标身份相同且已通过验证时，首次at取两者最小值；来源内容冲突继续拒绝。此组件当前只用接触是否存在决定辅助，本测试未发现较晚时间导致辅助清除，所以按M记历史精度缺陷，不虚构掌握或调度影响。

## 实际已通过的主要风险

- 空白、仅路径、漏一个映射/权重/分布格均不冻结；完整但漏正确路径会冻结并报missing。明确空集加错误weight、两概率均0仍可完整核对，ready没有偷检总质量；双击不新增。
- 静态两个目标分别呈现：一个目标保持pending，第二个才核对；提交后看到结果不把首答assisted倒改。
- summary同队列旧API导入保留接触；native file读取期间打开参考，在读取完成边界采到。来源不污染另一组件/条件。
- 伪造sourceId、篡改合法源targets、外来conditionKey、无来源目标、半份冻结submission被拒绝。
- 请求后scroll触发sync替换模型，再onload仍正确写入当前模型；B迟到成功/失败不覆盖C；导入requested=null清空媒体DOM并使旧回调失效；当前失败显示其回退，重试成功。这些关闭根先前提示的旧q/空请求媒体风险。
- repair具备原行/返回/再试；切换到WOR后点击旧WR repair-return回原WR及冻结ID，不误操作当前另条件；真实原行聚焦正确。

另有两组件×两机制×辅助与否×正确与否的实际控件矩阵脚本及原生下载测试，结果另存`correction-code-components-run-03-matrix-results.json`，完成后追加。短datahash后缀本身不另设阻断；正式数据身份仍按批准合同由实际完整数据及版本决定。试件不含完整正文与真实PNG，本报告未作最终媒体、完整数学讲解、真实浏览器或学习效果通过声明。

## 作者修复后的独立复验：全部关闭

作者提交稳定修复后再次复制全部试件输入至`reviews/correction-code-components-run-03-fixed-snapshot/`；原失败快照及结果保留。实际复验身份：

|文件|SHA-256|
|---|---|
|component-trial.html|bb42f74c700b6ec21705e23e86fd7401028d2b0fac054e3be0570ea48b3b5ec2|
|component-trial.json|e1c0e92791ee71a6b5cd6a33e070e064c5392483f86a2cd0d5f82cebd955fc58|
|components.js|d5b4157d4c9198ce17e71181700bea1b92386e3cdf5e4428ae567337d8dcb8ec|
|author_math.py|154de93cdf84ecedf1ad1a23ec1760561b2e47837e634aa67a82257a64469950|
|build_trial.py|f07c5fea37d3ae5287dda352f9de5e0d73e100a8fc63d39b074d09bede8f61a5|
|exact-data.json|95f8b0e67f268c062f2291dad55ecdb6c0dc877495541e242c74deafd120f95a|

已读取实际组件修改diff，原38检查完整重跑38通过；另在此修复hash重跑两组件×两机制×有/无辅助×正确/错误及原生下载矩阵34/34，最后用当前试件真正内嵌的四帧做15/15实际请求/DOM提交/字节检查。合计**24个新窗口场景87条检查全部通过；各场景未捕获异常检查通过**。原快照矩阵另有34/34，但不混算为修复hash证据。

- I1关闭：q.openSources单独保存/合并，initialize恢复实际details；原summary→旧import→即时store→新窗口轨迹现在open为true，动作/尝试次数不增加。
- I2关闭：当前核对反馈增加显式来源，targets为空；complete主动定位也只添加辅助来源，不伪造两个比较目标。原repair→完整原行→重开→再次提交轨迹现assisted为true；旧首答draft/judge/assisted未改。交叉矩阵证明辅助错误仍首推repair，辅助正确不吞掉对错。
- M1关闭：同source合并采用最早at，入站早10000ms的真实复现现在保存该较早时间。
- 旧q回调、导入requested=null失效及清DOM、迟到成功/失败、重试、非法来源及篡改覆盖、半份冻结拒绝在修复hash继续通过。

独立可复用脚本与对应JSON：

```sh
node reviews/correction-code-components-run-03-fixed-probes.cjs
node reviews/correction-code-components-run-03-fixed-matrix.cjs
node reviews/correction-code-components-run-03-fixed-media.cjs
```

四帧检查使用该固定HTML真正提供的mean WR/WOR overview、WR AC path-focus、WR AC bar-focus，通过实际frame按钮取Image.src字节；与同步保存的manifest及四PNG文件SHA逐一相等，manifest的exactDataSha256与整个exact-data文件SHA一致。成功仍由人工Image.onload驱动，不冒称真实浏览器解码。仅bar-focus贡献target6，目标4未呈现，原预测继续pending；四帧的实际回退lineIds均存在。图内数学/视觉细节与完整35帧覆盖仍由后续媒体专家及完整课件终审核验。

**修复后剩余C0/I0/M0，程序席批准该组件试件继续整合完整课程。** 此结论只对上述修复快照及已经执行的路径有效，不代表完整正文、全部帧、浏览器布局或最终课程已通过。作者后续改动仍须在最终HTML重新实测。
