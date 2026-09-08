# Run 02 图像部件 M1 / M2 独立复验

审查人 correction_color，2026-09-08。**本轮图像部件批准：M1、M2 均关闭，C=0、I=0、未解决 M=0。批准范围为这套冻结的 51 张 PNG 及 manifest 的帧身份合同，可供整课组装；不批准完整 HTML、页面布局或浏览器视觉。**

## 本次输入

| 文件 | 实际 SHA-256 |
|---|---|
| sampling_scene.py | eac5c2937766884f0874b356bdcf8d5a5962578f902a4aa9d65ba002ff64f744 |
| media-manifest.json | 1a5f49abe96909c1b1f769cee2e54416ebcd1966bd4827c6a902ee276346b53d |
| media/frame-contract.json | c2d6851ff548fb23e0c71f52664713aef7da9d17b39869ee2c5ab38ef3d40935 |
| manim-render-report.md | 58d485eb8d9716d9f7e5ee7eae26186404fa184f6ef7cdb9ffcb07a05d64c411 |
| exact-data.json | 9695b34b11bbe735fb06a6ce73e335533beeef067cd6b4311b3026feb2f1ceaa |

独立读取实际文件后，与作者 `media/revision-m1-m2/final-hashes.json` 全部匹配。任务消息中 render report 的摘要少了 `9ff`；以上以实际文件和冻结清单为准，没有沿用消息笔误。51 张 PNG 的实际 SHA、尺寸、manifest hash/sha256 及 sceneSourceHash 均通过核对。旧报告与旧冻结输入未修改；本次完整副本另存 `reviews/frame-probes-run-02-recheck/frozen-inputs/`。

## 独立操作及结果

自写脚本 `reviews/frame-probes-run-02-recheck/probe.py`；执行：`python reviews/frame-probes-run-02-recheck/probe.py`。结构化结果 `independent-recheck.json`，运行记录 `probe-run.log`。脚本不调用作者审核函数。

1. 连续阅读 Scene 差异和修后渲染记录。实际 Scene 变化只有：读取 frame-contract；mapping 从合同显式写入 selectedPathId 并核 condition/stage/path；WO paths 末行 y 从 −5.52 调为 −5.43。没有修改字体大小、数学算法、角色色或共用绘图尺度。
2. 独立核对全部 51 张实际 PNG。44 张与此前独立通过的图像字节完全一致；改变的恰为 WO 的 overview/AB/AC/BA/BC/CA/CB 七张 paths。
3. 以 frame-contract 给出的 `(conditionKey, selectedPathId, stageId)` 建立实际过滤请求；9 张 WR 和 6 张 WO mapping 各恰好返回一帧，frameId、pathIds 与合同一致。对应 PNG、objects、labels 均与修前相同。没有使用文件名补键，没有通过 pathIds 推测缺失的 selectedPathId。**M1 关闭：此前会导致组装 lookup 失败的缺字段已消除。** 这里验证的是 manifest 请求数据接口，尚未声称运行过未来 HTML 的请求代码。
4. 对七张变图作全像素比较：1120 行以前与旧图逐像素相同；新图 `[1120:1220]` 与旧图 `[1129:1229]` 逐像素相同，即末行原字形精确上移 9 源像素，没有缩放或改写。差异仅落在 x=117…882、y=1127…1217 的末行区域；上方网格、数值、角色及当前高亮完全保留。
5. 独立深色墨迹扫描：最后两行分别 y=1061…1116、1127…1208；中间有 10 源 px 空行，底部 41 源 px。七帧完全一致。按 326 px 图内宽度，底部为 13.366 CSS px，行间墨迹空隙为 3.26 CSS px。**M2 关闭：满足此前约 12 CSS px 留白建议，且未以缩字实现。**

实际目视：打开 `sheet-1.png` 和 `sheet-2.png`，七个子图各保持 326×408，逐一检查末行、前行间隙、排除语义和当前高亮。另打开 overview 的原尺寸 footer 裁切（1000×230）。两行仍分离，内容“按行、列读有序对”“斜线格：不允许重复”完整，无触碰与底部裁切。其余 44 张依靠相同 SHA 复用上一报告的逐帧 326 px 目视及独立数学/线宽/字形证据，不冒称本轮重新打开了这 44 张。

## 批准边界

本次修复没有引入新的数值或绘图，因此此前 49 路径精算、86 柱/零标记、角色字形及线类的独立结果仍适用于未变像素；七张末行平移已单独实物复验。未借本次修复新增阈值。

仍按预计最终图内宽度至少 326 px 批准本批图像；HTML 实际有效宽度、嵌套 padding、原生 MathML、正文角色、条件切换与 requested/displayed 加载失败回退，须完整课件交审后另核。浏览器不可用，本轮均为真实 PNG 的离线检查，没有浏览器截图或布局认证。
