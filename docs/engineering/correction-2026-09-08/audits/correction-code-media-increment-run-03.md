# run03 冻结前书面媒体来源增量：程序独立预审

**C0 / I0 / M1；没有发现本次媒体行为阻断，M1为来源元数据需修正。** 本次仅作者自检阶段的有界媒体增量预审，不是完整课件终审。没有修改作者或skill文件。

## 固定输入及执行范围

最初4c7e5c…草稿已另存snapshot但未用于本次完整测试；作者交稳定06fc2c…后再次独立复制至`reviews/correction-code-media-increment-run-03-final-snapshot/`，全部结论仅对后者：

|文件|SHA-256|
|---|---|
|lesson.html|06fc2c97a1252fcb119e1b4cd81700ec6d49a9047778fcb2e99f71ada3660ea2|
|lesson.json|e77f2327ceb6a3f6f658c5f1b4ae4e652760bca648eef7643ff771112455c5ee|
|components.js|3a352829dac1d939a8835b25335afe0bda42b1c5523590916bd34913b984ff76|
|build_lesson.py|3ee01eac2b4abd6db64193f774051021a9c531cad974733ba66b686f7a2f4373|
|exact-data.json|95f8b0e67f268c062f2291dad55ecdb6c0dc877495541e242c74deafd120f95a|
|manifest.json|838b3f8290bdd073543e2b0570e4a663d2511cf0aa1b24fb805bc880915770a1|

读取components实际delta及build_lesson.py的proof生成段。独立脚本`reviews/correction-code-media-increment-run-03-probes.cjs`执行完整固定HTML内嵌JS，6个新窗口场景208条检查；193通过，15失败全为同一M1。结果及日志分别在同名前缀`-results.json`、`-log.txt`。所有场景未捕获异常检查通过。

没有改写作者控制器、引用作者judge或另造媒体manifest。36个动态frame均通过页面实际控件请求，Image使用真实DOM img节点、成功/失败人工回调；viewport明确矩形fixture；原生file的text读取用延迟Promise、实际下载Blob用FileReader读回。不能据此认证真实浏览器解码/排版或完整教学内容。

## 实际通过的媒体合同

1. **当前书面证明真实且同源。** 每次请求后的`frameId-written-proof.innerHTML`，均与独立按当前条件/阶段从正文DOM克隆并仅剥离身份属性的完整原行逐字一致。overview包含全部路径与首有效路径的完整权重计算；path-focus包含完整该路径节点；bar-focus对应其完整group；bars对应完整表及目标归并。没有用实现的formulaHtml同时充当期望。
2. **书面来源和图片来源分开。** 36次主动请求即记录独立written-proof reference及该帧实际targets，图片displayed仍null、没有虚构图片frame接触。每次图片失败后当前proof仍逐字保留、displayed仍null，当前完整原行入口存在。实际Image.src解码所得PNG字节SHA均匹配manifest；其exactDataSha256等于整个固定数据文件SHA。
3. **两目标核对不提前也不等待无关图片。** 先冻结WR的eq预测；overview及path-focus没有比较targets；AC bar-focus书面证明只贡献6，仍pending。再请求AB bar-focus，4/6均已呈现，图片尚未成功已可核对原错误。首答choice/assisted不倒改。WOR的bars书面证明同样在displayed为null时给出本机制两边1/3相等的实际结论。
4. **异步仍写当前状态。** 请求A后编辑预测并scroll触发模型同步，A成功正确提交当前displayed；B之后请求C，C成功后旧B成功/失败都不改变C的图与proof。导入requested=null会清空当前媒体DOM并使旧回调失效，已经发生的书面接触仍在历史并集。
5. **恢复不伪造已看。** 实际pending请求导出/存储、新窗口恢复：重新出现当前proof，displayed等待本窗口自己的成功回调，接触原时间及学习计数保留。另导入合法requested=bars但无历史接触的状态，屏外矩形时不新增proof来源/目标/学习次数；令当前proof矩形相交后立即export，共同同步边界才记录该来源及两个目标。
6. **真实转移入口。** 原生file读取期间发出bars请求，读取完成后应用旧记录，刚发生的written-proof接触保留；原生下载同队列取得WOR书面来源，displayed仍null。伪造proof targets、conditionKey或未知proof源均被拒绝。实际frame-return点击将焦点定位到当前条件的真实returnLineId。

这些结果专门区分“请求失败但书面证明已呈现”和“图片成功”；没有沿用旧组件的等图片pending预期，也没有把旧hash的通过移至新版本。

## M1：15个path-focus的proofLineIds没有记录实际克隆来源

实际`mean-wr-AC-path-focus`复制的proof是整个`mean-wr-AC-path`节点（完整映射及路径权重），这部分显示正确；但F中`proofLineIds`仍为`["mean-wr-AC-map","mean-wr-AC-weight"]`。WR九条、WOR六条均同样偏差。

原因是build_lesson.py先`e['proofLineIds']=proof_ids`，下一行才针对path-focus把局部变量proof_ids改为完整path容器。该字段当前未驱动判分或显示，因此不升级为I；但它是新增书面来源证据，应该忠实反映实际复制范围。把赋值移到stage分支之后即可。已带例子直接通知作者。修正后只需核此字段及对应hash/delta，不必重跑未变行为全部矩阵。

完整38 PNG的视觉/数学角色、静态range/shelf图及正文教学质量不在这次增量行为裁定范围；后续正式完整HTML仍须独立终审。
