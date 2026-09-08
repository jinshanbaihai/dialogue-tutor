# 原版技能审计读取覆盖

审计日期：2026-09-08。以下范围为使用 nl -ba + sed 连续输出、在模型上下文逐段语义审阅的覆盖。哈希和总行数只标识读取对象，不作为语义审阅的替代证据。

基线 SKILL 最后一块 1971–2230 的合并输出发生截断，因此重新完整输出 2170–2230；覆盖记录按最终确认可见范围写为 1971–2169 + 2170–2230。其他以下范围均完整可见。

| 完整路径 | SHA-256 | 总行数 | 连续语义读取范围 |
|---|---|---:|---|
| `/workspace/scratch/b4c4b2db70f4/baseline/dialogue-tutor/SKILL.md` | `3a4b7b2f1ea2ccf786931191a94cf45d32a5e625a9557583038f2275b4cd3f83` | 2230 | 1–240, 241–500, 501–780, 781–1080, 1081–1380, 1381–1700, 1701–1970, 1971–2169, 2170–2230 |
| `/workspace/scratch/b4c4b2db70f4/baseline/dialogue-tutor/references/deeptutor-provenance.md` | `353abdabb033d2848d8511feaa66366365e7383eb7514f4462b3397967af5dcf` | 142 | 1–142 |
| `/workspace/scratch/b4c4b2db70f4/baseline/dialogue-tutor/references/interactive-html.md` | `6373683da508983830f21c70334695d16432c39b05ae125642d49e0805284b6e` | 299 | 1–160, 161–299 |
| `/workspace/scratch/b4c4b2db70f4/baseline/dialogue-tutor/references/learning-evidence.md` | `2bde7890ef84c39feed48ae2394a3e77336c396ec9f1de14bb3eb5027dd34ea0` | 89 | 1–89 |
| `/workspace/scratch/b4c4b2db70f4/baseline/dialogue-tutor/references/数学的冲突读法.md` | `b3476521c431911fe7df1b8f848eeec325d437341a6a8faa924f064e3eb95d7e` | 129 | 1–129 |
| `/workspace/scratch/b4c4b2db70f4/baseline/dialogue-tutor/references/统计术语中英对照.md` | `fa7bcec2d1b8f816a4de010a1bca1c5e6e79ff181a6229040103c85c8edc1ec8` | 41 | 1–41 |
| `/workspace/scratch/b4c4b2db70f4/baseline/dialogue-tutor/references/考纲与考试局.md` | `8c7aa306380f2938652a1d724072cdda863696f07a363acf6b0df48bd18b5c47` | 189 | 1–189 |
| `/workspace/scratch/b4c4b2db70f4/repo/plugins/dialogue-tutor/skills/dialogue-tutor/SKILL.md` | `61af8371b3cf41be3ca9cbf179a045b3a56de9ab24328d4f9721d73a3fbc0052` | 77 | 1–77 |
| `/workspace/scratch/b4c4b2db70f4/repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/teaching-design.md` | `1cf2d22da4db2cbd2ed979840d2505b02af015750f35f188fb914143db6b5c40` | 74 | 1–74 |
| `/workspace/scratch/b4c4b2db70f4/repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/modes-and-explanations.md` | `d8251c0f0357798bbc338130bc544ebfcd10b8bb2e10a79e04150f184c5e8f64` | 42 | 1–42 |
| `/workspace/scratch/b4c4b2db70f4/repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/visual-design.md` | `ff6c2cdc10e6e09d3e45bc3bd1d2b65cfd43024ae0dfd7445e7e9df108d34652` | 53 | 1–53 |
| `/workspace/scratch/b4c4b2db70f4/repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/engagement-and-narrative.md` | `38b27dfb2994df6534d970acbc9ab25edcbbac2c86b693576e2a7ac7eadd8ce1` | 87 | 1–87 |
| `/workspace/scratch/b4c4b2db70f4/repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/expert-review.md` | `28e504ca0a9d123539215e81624b1620b602aeadd147e8d06a7198bbabeb6cd1` | 39 | 1–39 |
| `/workspace/scratch/b4c4b2db70f4/repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/interactive-html.md` | `d85e93a23d1baaa6b1ec69b87bf6d214c7a9bf981c81cb2047ee2440f5754605` | 396 | 1–160, 161–300, 301–396 |
| `/workspace/scratch/b4c4b2db70f4/repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/learning-evidence.md` | `1dab2930fba770135c0b787e37233d13a3c5f2809e752d6124269a40a4c8bdd2` | 99 | 1–99 |
| `/workspace/scratch/b4c4b2db70f4/repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/数学的冲突读法.md` | `f5a4922de390ce6a4be7240852aa58da7e6a4bbcb2ab554b886ff77ec0425de7` | 123 | 1–123 |
| `/workspace/scratch/b4c4b2db70f4/repo/plugins/dialogue-tutor/skills/dialogue-tutor/references/统计术语中英对照.md` | `b5a57f099e81b722666d4f4fdfa4639a3ef56273579571a3e240a50a19553fff` | 41 | 1–41 |

范围限制：未审计 scripts/assets 的代码行为，未生成或运行课件；当前版本的 deeptutor-provenance 与考纲文件未再逐行阅读，前者与已完整阅读的基线哈希相同，但不将字节相同记为第二次语义审阅。基线全部 references 已读，当前任务要求的教学、模式、视觉、参与参考已全部读。

审阅取向：检查内容角色、触发条件、依赖交付契约、前提完整性、逐行推导、作答类型和证据标签；当前报告中的位置均来自这些已读段落。
