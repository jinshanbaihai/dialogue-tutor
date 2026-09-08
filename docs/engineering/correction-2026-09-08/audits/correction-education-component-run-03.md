# Run03 组件试件教育早期评议

日期2026-09-08。首轮 **C0/I2/M0**；修正后定点结果见文末，目前两项I已关闭。 这是完整课件组装前的组件试件检查，可在本轮作者源中修正；不是已冻结完整课件正式退回。

## 本人实际执行与版本

从磁盘实际读入组件HTML启动 jsdom，以原生button click、summary、公开导入导出和真实localStorage新窗口恢复操作。主报告40项断言对应读入字节 SHA-256 `3c08d4ba081019c85af71fc4694d58838e680f8ae3df27a81564c04f8e3b77dd`；不是此前列表时看到的338a版本。脚本在开头固定读入字符串，各用例都使用这份字节，不从作者运行中变化的文件重新加载。另一次早期执行启动在338a版本，其输出不作为本表40项计数依据。

实际脚本 `correction-education-component-run-03-probe.cjs`，结果 `correction-education-component-run-03-results.json`，日志 `correction-education-component-run-03-probe.log`。40项中39通过、1失败；无未捕获jsdom异常。几何函数把指定真实节点放进视口，其余放在屏外；scrollIntoView为替身，不认证真实滚屏。试件未接PNG，本轮不认证图片或浏览器。

通过包括：默认远处原行不算已见；只核一个mean目标继续待核对，核两个才指出错误，WR不污染WOR；主预测错误→自己的repair→完整原行→自己的返回/重开，保留首答和接触；四种缺项不冻结、不锁控件、只定位待填；明确空集完成其余组后可错交；取消最后项说明与撤销未答；max两机制×有无参考×正误八格都实际点击，并核错误优先repair、原行实际目标与原条件返回。数学完整性另按下节审查，测试中的math节点存在/数量只证明目标有数学内容。

## I1：新窗口保留接触但未恢复已揭示参考

实际路径：填完max WR → 导出未查看状态 → 原生点击 `#max-wr-reference > summary` → 同队列导入旧状态 → 导出并提取实际localStorage → 新窗口。新窗口 `contacts.max-wr-reference` 存在，提交继续保留assisted=true，但 `#max-wr-reference.open` 为false。

接触并集合并已生效；缺少的是已揭示DOM范围。当前合同要求可见范围与contact分别保存、恢复对应真实DOM，不能只用辅助boolean代替。保存实际已打开的来源范围并在初始化/restore中展开对应详情，幂等不增加学习动作。继续允许学习者主动收起内容；不要因曾看过提示就打开所有答案。修复后按相同原生路径新窗口再检open及首答记录。

## I2：必要原行仍把真实运算藏在依据句

本人接着完整读 `author_math.py` 生成的主链模板，结合本次修复原行DOM文字证据；没有把旧模型的数值正确直接当成逐行推导通过。

1. `mean-*-comparison` 只显示1/3>2/9（WOR为相等），依据内写“1/3=3/9而3>2”。通分与按同分母比较这两步需要成为真实数学行；WOR相等无需人为加通分。
2. `*-group-*-reduce` 进入分支时确实需要约分，却统一写“分子与分母除以共同因子；若已互质则保留”，未指定本步实际公因子2或3。依据应写具体除数及非零性，中间式应显示分子/分母各自运算。
3. `*-weight` 从分数乘积直接落1/9或1/6，分子1×1与分母3×3或3×2只写在reason。把分数乘法的分子/分母表达式和实际计算分别摆出，不把两处运算藏到最终式旁。
4. `*-sum-numerator` 从若干1/9相加直接跳到cnt/9，operation叫“common denominator”但此处原分母已经相同。先合并为分子求和，再算整数和；将操作名改为实际发生的步骤。单项事件不增加假加法。

这四项合并为同一I：已承诺一变换一行，但实际生成配方仍压缩运算。修author_math源后让主链与参考副本同步生成，再读实际DOM中的WR/WOR、单项/多项、需约分/不需约分和mean比较，不能仅增加line count。当前是组件早审，不要求重开一位作者或追加skill禁令。

## 其余未审范围

整章21幕/15问尚未写完；本席没有认证完整教学、历史来源、真实Manim图、全路径卡片回访、所有入站非法组合或原生文件接口。程序/游戏席的结果按它们各自版本和范围记录。修复通过也只支持组件继续整合，最终冻结HTML仍须本人重新操作和全文数学审查。

## 独立定点复验：两项 Important 关闭

复验前本人把实际HTML、JSON、author_math、components与component-lines复制到 `correction-education-component-run-03-recheck-snapshot/`，一次读入字节并逐项算hash。后续测试只读该快照，作者继续编写不会改变测试输入。

| 文件 | 实际 SHA-256 |
|---|---|
| component-trial.html | 4645c34f5f00f12cc1c0fe71e3a7da64d1954002862a6ee265ae40ed5f7c57eb |
| component-trial.json | 0a8f82e994447bc39c83d0af85fcb0fd9a783c7cf263a766e997a4163685e65e |
| author_math.py | 8ea5d194fb99a9f844d7387a39147855149d4b8305fb1cf2ce9c9e7f521f049f |
| components.js | 0912c22834b99960f793d1e0c4cb385f0e5db127ed1937f22ed0f9406f3e6c84 |
| component-lines.json | a3b0b94aa163d37b8651a8aa6b4a299cab34928345e518724bb3ce36b8c3bbf7 |

本人完整读取快照author_math，执行 `correction-education-component-run-03-recheck.cjs`；最终 **116断言全部通过，0未捕获jsdom异常**。原始结果 `-recheck-results.json`、实际DOM MathML及理由 `-recheck-math.json`、日志 `-recheck.log` 均保留。初次执行因本席把参考group的 `-ref` 拼到错误位置而中止，保存 `-recheck-partial.json`；修正测试器定位后重新完整执行，不把缺错锚点列为课程失败。

**I1关闭。** 本人重新填完四组，导出未读参考状态，原生summary打开 `max-wr-reference` 后同队列导入旧记录并导出，新窗口使用实际localStorage初始化。详情真实open为true，contact与openSources保留；随后提交正确且assisted=true，只有本人一次提交，没有伪造公共attempts。不是仅检查状态里一个布尔值。

**I2关闭。** 从实际挂载DOM检主文及参考副本的全部有效路径：mean WR9/WOR6、max WR9/WOR6，两份合计60条。各条显示 `(1×1)/(3×3或2)` → `1/(3×3或2)` → `1/9或6`；逐步分子、分母运算有对应理由。各输出按本席固定题面原像计数核同分母合并分子→整数相加；单项原像没有添加假加法。所有需约分组展示实际公因子2或3及分子、分母分别计算，不需约分组没有假约分。WR比较完整显示同乘3→分子乘法→分母乘法→3>2→同除正9后的比较；WOR直接比较相同分数，不套通分模板。本人阅读相应实际理由，与当前数学变换相符，不用单纯节点数判通过。

剩余 **M1工程台账措辞**：`sum-numerator` 的 operation 仍为 `common denominator`，before仍取原分数和sub而非紧邻combined。实际显示的数学式和依据已经正确、完整，这是作者审计数据没有同步精确命名。已要求改为实际整数相加并用紧邻式作为before；无需重写数学内容，不阻塞组件整合。

当前组件教育范围裁定 **C0/I0/M1，允许整合完整正文**；M1修正后定点核元数据即可。该结论仅覆盖原I及列明路径，不替代先前40项在新版本全套复跑，也不替代最终整课教育终审或其他席位的程序/游戏/图像审核。

## 后续台账同步

整课草稿内容预审时定点读当前 author_math.py（SHA256 `35ff8b15bd352ea9fd33fd5d5f350ebc5e4fcd8afc6419c94c7fac2b9e4d9ff3`），原 M1 已将 sum-numerator before 指向 combined，并将 operation 改为 integer addition，故关闭。原组件快照与 116 项结果不改写。详情见 correction-education-run-03-preread.md。
