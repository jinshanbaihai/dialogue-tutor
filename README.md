# Dialogue Tutor · 简易对话

当前技能内容采用 2026-09-13 提供的第十二版，插件版本为 2.0.1。

[技能入口](plugins/dialogue-tutor/skills/dialogue-tutor/SKILL.md) · [原始技能包](dist/dialogue-tutor.skill) · [ZIP 技能包](dist/dialogue-tutor-2.0.1.zip)

## 使用范围

交互式学习教练，涵盖 TMUA 数学、Edexcel IAL Statistics S2 与 CIE 9708 Economics。支持 `bgct`、`bbct`、`olct` / `onct`、`plustts`。

这一版以可视化图像、可视化交互和逐行推导组成教学页面。交互朗读采用 Xiaoxiao，默认 1.75 倍速。完整要求以技能入口和三份参考文件为准。

## 导入 ChatGPT

在技能页面选择「创建 → 从电脑上传」，上传 `dialogue-tutor.skill` 或 ZIP 技能包。

## Claude Code 插件

```text
/plugin marketplace add jinshanbaihai/dialogue-tutor
/plugin install dialogue-tutor@dialogue-tutor
```

## 文件与验证

技能包包含 `SKILL.md` 和 `references/` 下的三份参考文件，与提供的原始包逐文件一致。使用 `python3 scripts/package_skill.py` 重新生成 ZIP。

仓库中的课程生成脚本、运行组件、测试与 `docs/` 演示保留为此前版本的工程材料；它们不属于本次四文件技能包。演示与既有测试结果对应此前版本，当前教学要求以第十二版技能包为准。
