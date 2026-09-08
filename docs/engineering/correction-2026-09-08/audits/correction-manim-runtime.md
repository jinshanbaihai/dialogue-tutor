# 原 Manim skill 真实运行验证

日期：2026-09-08。工作根目录：`/workspace/scratch/b4c4b2db70f4`。

## 结果

真实 Manim Community CE 环境已安装并完成渲染；没有以手写 SVG 冒充 Manim，也没有修改项目 repo。

- Python：3.12.13，使用 primary runtime 创建的 scratch venv。
- Manim CE：0.21.0。
- Pycairo：1.29.1，实际本地编译。
- ManimPango：0.6.1，实际本地编译。
- Typst Python binding：0.15.0，用于 skill 明文支持的 `MathTypst` 公式。
- pkgconf：1.8.1；Cairo 开发包 1.18.0；Pango 开发包 1.52.1。
- dvisvgm：3.2.1，已真实可执行。

场景 `MeanMap` 使用 `Scene`, `Axes`, `NumberLine`, `Dot`, `Arrow`, `Text`, `MathTypst`, `Create`, `Write`, `TransformFromCopy` 等 Manim 对象与动画，展示输入坐标 `(a,b)=(2,6)` 经 `m=(a+b)/2` 映射到均值 4。

产物：

- 源码：`work/manim-runtime/mean_scene.py`
- 最后帧：`work/manim-runtime/media/images/mean_scene/MeanMap_ManimCE_v0.21.0.png`，1280×720 RGBA。
- 视频：`work/manim-runtime/media/videos/mean_scene/480p15/MeanMap.mp4`，H.264、854×480、15 fps、68 帧、4.533008 秒、62,901 字节。
- 图片经过 `view_image` 人工目视核查：坐标、刻度、点、公式和输出数轴可辨，无遮挡或裁切。
- `ffprobe` 结果：`work/manim-runtime/logs/08-video-probe.json`。

## 已完整阅读的原 skill 文档

以下均从用户提供的 `research/dependencies/cowork-bundles/manim/` 读取：

1. `SKILL.md`
2. `repos/manim/REFERENCE.md`
3. `repos/manim/docs/installation.rst`
4. `repos/manim/docs/installation/uv.md`
5. `repos/manim/docs/tutorials/quickstart.rst`
6. `repos/manim/docs/tutorials/building_blocks.rst`
7. `repos/manim/docs/tutorials/output_and_config.rst`
8. `repos/manim/docs/guides/using_text.rst`
9. `repos/manim/example_scenes/basic.py`

安装依照该技能 Linux 安装路线：隔离 Python 环境 + Cairo/Pango 开发依赖 + Python Manim 包。由于只能在 scratch 内写入，官方 Ubuntu `.deb` 通过 `dpkg-deb -x` 解包至 scratch，而不是系统 `apt install`。所有网络下载正常使用环境的既有网络配置，无提权、代理替换或访问控制绕过。

## 可直接复用

从工作根目录执行：

```bash
. work/manim-runtime/env.sh
manim -ql --media_dir work/manim-runtime/media work/manim-runtime/mean_scene.py MeanMap
manim -s -qm --media_dir work/manim-runtime/media work/manim-runtime/mean_scene.py MeanMap
```

或先 `cd work/manim-runtime` 再执行：

```bash
. ./env.sh
manim checkhealth <<<'n'
manim -ql --media_dir media mean_scene.py MeanMap
manim -s -qm --media_dir media mean_scene.py MeanMap
```

`env.sh` 设置 scratch venv、native bin/library/pkg-config 路径、`CC=gcc`、`CXX=g++`、scratch uv cache 和 scratch TMPDIR。实际 Python 依赖锁定在 `work/manim-runtime/requirements.lock`。

## 安装过程与失败记录

1. 基础检查：primary runtime Python 与普通可见 Python 是同一 Python 3.12.13，都未安装 `manim`, `cairo`, `manimpango`。系统有 Cairo/Pango 运行时库、gcc、ffmpeg、latex 可执行文件；无 pkg-config、开发头文件和 dvisvgm。
2. 创建 venv：`uv venv work/manim-runtime/.venv --python "$CODEX_PRIMARY_RUNTIME_PYTHON"`。
3. 首次 `uv pip install manim` 可下载 Python 包，但 ManimPango 构建失败：runtime Python 的默认编译器为不存在的 clang，并且 pkg-config/开发头未安装。完整失败：`logs/01-install.log`。
4. 从 `https://archive.ubuntu.com/ubuntu/` 下载 Noble main/universe 包索引与官方 `.deb`；脚本 `fetch_debs.py` 解包到 `native/`。下载总计 35 个 native 包，文件名、版本与 SHA256 在 `native-manifest.json`。无系统包安装、无系统文件写入。
5. 为 scratch 的开发库链接建立指向已有 ABI 相容系统运行库的软链接，脚本 `prepare_native.py`。pkg-config 使用 `PKG_CONFIG_SYSROOT_DIR` 指向 scratch；编译器选择 gcc。
6. 第二次构建 Pycairo 成功；ManimPango 因 `libfontconfig.so` 的解包软链接指向未解包的带版本文件，意外选择了不可用于共享库的 static `.a`，链接失败。完整失败：`logs/03-install.log`。补齐 scratch `.so` 指向系统动态库后修复。
7. `uv pip install --python work/manim-runtime/.venv/bin/python 'manim[typst]'` 成功，本地构建 ManimPango 通过。完整成功：`logs/04-install.log`。
8. dvisvgm 首次运行缺 `libwoff2enc.so.1.0.2`；同样从官方包提取 `libwoff1` 后，`dvisvgm --version` 为 3.2.1。
9. 第一次 `checkhealth` 的四项检查均通过，但默认交互预览提问遇 EOF 后显示 Aborted；随后显式传入 `n`，健康检查正常完成，见 `logs/05-health.log`。
10. `-ql` 视频与 `-s -qm` PNG 渲染均成功，见 `logs/06-render-video.log` 和 `logs/07-render-png.log`。
11. 打包原生依赖 manifest 时 `dpkg-deb -f` 因容器没有默认临时目录失败；明确设置 scratch TMPDIR 后成功生成 35 包清单。

辅助下载日志：`logs/02-native.log`, `logs/02b-native.log`, `logs/02c-native.log`。一个中途命令因为误用相对工作目录未加载 env.sh，被立即取消；未依赖该命令的结果。

## 明确验证边界

- `checkhealth` 检查的是 latex/dvisvgm 可执行程序存在；系统 TeX 文档树缺 `standalone.cls` / `amsmath.sty`，因此不能把通过健康检查解释为完整 MathTex 链路已验证。
- 本场景公式使用原 skill `using_text.rst` 明文列出的 `MathTypst`，真实走 Manim 的 Typst -> SVG -> Mobject 渲染链；Manim 生成的内部 SVG 是正常管线产物，不是手工绘图替代品。
- 这次验证覆盖 Cairo 二维 Scene、Pango 文本、Typst 数学、坐标系、动画及 PNG/MP4。未验证完整 LaTeX MathTex、OpenGL、3D、旁白插件。
