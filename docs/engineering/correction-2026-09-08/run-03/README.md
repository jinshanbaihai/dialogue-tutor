# Run03 冻结课件与验证

本目录保存本轮独立作者从空白生成的完整课程、真实 Manim 源与 PNG、数据和台账，以及五席正式终审的具体证据。此前两份完整候选的退回记录继续保留；不对失败 HTML 打补丁后冒称重新生成。

课程按三个对象的七项教学职责展开，十五个小问各保留六项完整讲解。二十个选择活动、一个含两张卡的翻卡活动、两个有限选项构造活动，共二十三个活动。完整逐行推导及理由与这些活动相互对应，主流程无需输入答案。三十八张图由真实 Manim 执行生成，包含抽样路径、统计量归并及有真实数值坐标的概率分布。

`correction-run-03-source.tar.xz` 按作者的197文件清单保存全部文件，并加入冻结文件和清单自身，共199文件；包含实际字体副本与 OFL。完整 HTML 和可编辑 JSON 另在仓库 `docs/s2-ch6.html` 与 `docs/lessons/s2-ch6.json`。复现课程应在新副本进行，不能覆盖已冻结评审原件。

独立检查使用 jsdom 原生 DOM 事件和明确标记的 Image、矩形、时钟 fixture，另有实际 PNG 检查。真实浏览器排版、MathML 字形、触控、键盘 Tab、200% 缩放、浏览器图像解码与真人学习效果尚未验证。未声称不同模型和不同指令都经过新课生成稳定性实验。审计脚本保留当时实际路径与失败记录；可移植维护回归用仓库的 `npm test` 和 Python unittest 执行。

作者不可变记录中有一处阅读范围表述过宽：根查看了全部38张280px图及代表原图，全部38张原尺寸图由色彩评委独立查看；不把两者范围混为根的完整原图阅读。外部纠正记录与作者原文同时保留。

## 正式结论与实际验证

五席对同一冻结 HTML 正式批准，均为 C0 / I0 / M0。根已全文阅读五份报告；精确身份与范围见 [approval.json](approval.json)。作者的 FREEZE 文件仍保留“当时等待终审”的原始状态，正式批准以外部审批记录为准。

|评委|本次实际验证|报告|
|---|---|---|
|教育学|385条断言；全文与差异阅读、20题逐项闭环、两卡回访、完整中间式、六张分布原图|[教育终审](../audits/correction-education-course-run-03-review.md)|
|游戏策划|48场景、520条断言；有限构造、完整原生题路径、状态收束与真实复习项|[游戏终审](../audits/correction-game-course-run-03-review.md)|
|程序|7新窗口、80条断言；输入边界、状态转移、参考保存、图像回调、存储失败及精确重建|[程序终审](../audits/correction-code-course-run-03-review.md)|
|色彩与图像|52项最终检查、36动态接入、38PNG逐一对字节；此前38原图与280px全批次检查|[色彩终审](../audits/correction-color-course-run-03-review.md)|
|叙事|20场景；完整文字与最终差异、正误反馈、补讲、实际条件收束和自主导航|[叙事终审](../audits/correction-narrative-course-run-03-review.md)|

不同席位有交叉覆盖，测试数字不可相加作学习效果或学习者人数。游戏席是替补评委，此前参与通用运行库边界实现，但未编写本次独立课程；该关系已在报告披露。document 自定义活动没有原生 Skip 按钮，实际提供自由导航；原生选择题的跳过与导入 skipped 兼容分支均分别记录，没有伪装成同一种操作。

## 归档与复现

源码档案199文件；评审与历史证据档案459文件，含最终报告、脚本、实际输入快照、图像、原失败与修正结果。相同文件在评审 tar 内使用无损硬链接去重，全部459个解出成员均按清单校验。完整审计档案分卷保存，先按文件名顺序重组：

```sh
cat correction-run-03-source.tar.xz.part-* > correction-run-03-source.tar.xz
cat correction-run-03-review-data.tar.xz.part-* > correction-run-03-review-data.tar.xz
sha256sum correction-run-03-source.tar.xz correction-run-03-review-data.tar.xz
tar -xJf correction-run-03-source.tar.xz
tar -xJf correction-run-03-review-data.tar.xz
```

重组后的SHA256：

- source：`de2d32c0720fcd7ec6d8e13517e00fddf580abbeceb3117a9701d68b609a9377`
- review-data：`811d1c8bf0983344326b3be0ce028beaf6b9038ea1c1925b298f4163b90b2be3`

各卷的大小和hash见两个同名JSON清单。源码的197个原始成员见 `final-hashes.json`；源码档案另包含该清单自身和 `FREEZE.json`，其hash分别由冻结记录与正式评审报告核定。评审档案459个成员见 `correction-run-03-review-data.json` 的 entries。源码复现所需工作区结构见归档内README；字体与OFL已随源保存。无需解包这些审计档案即可使用单文件HTML或重建课程：在仓库根运行 `python scripts/build_demo.py`。维护回归与打包记录另见 [repository-validation.json](repository-validation.json)。旧1.7.0兼容样例的测试仍保留，不冒称为新课程验收。

归档按实际文件名保留了少量早期同名run-03历史资料，详见清单的 `historicalSameNamedRun03Files`；它们不是本次冻结课件的通过证据。当前通过只采用 `approval.json` 绑定bcd536哈希的五份 `correction-*-course-run-03-review.md`。最后交付核查与仓库回归在归档后另行保存，不回写已归档原始证据。
