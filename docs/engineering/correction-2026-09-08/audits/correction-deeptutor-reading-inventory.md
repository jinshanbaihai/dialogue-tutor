# DeepTutor 实际精读清单

固定版本：`42fab3cf429a1fbf36b257ab8d116a3814964202`（已通过 git rev-parse HEAD 核对）。

仓库根：`/workspace/scratch/b4c4b2db70f4/research/DeepTutor`。本清单列出本分工实际显示并逐段语义阅读的源码、prompt、测试与文档：共 97 个文件，92 个全文、5 个局部，连续去重覆盖 17584 行。哈希仅验证所读版本；不把哈希、下载、文件名索引视作语义阅读。初次拼接输出有截断的文件已重新分块覆盖，最终以下列连续范围为准。

原始逐次读取账本：`deeptutor-read-ledger.jsonl`；本表合并重复与相邻范围。没有运行全部仓库、没有完整阅读全部仓库；未覆盖范围见审计报告末尾。

| 相对路径 | 实读连续行范围 | 总行数 | 覆盖 | SHA-256 |
|---|---|---:|---|---|
| `AGENTS.md` | 1–138 | 138 | 全文 | `2907232e2388469937a79898205da4fba634d1eb2c0ae6a6ae8592aab898afe3` |
| `README.md` | 1–1074 | 1074 | 全文 | `8f0fc0c27b112bde96e708fbf9633dd94de20aa7356bf7c82f6e2c977db575c0` |
| `deeptutor/agents/math_animator/agents/code_generator_agent.py` | 1–199 | 199 | 全文 | `2aab8f3a654d65f45610097d97daa6d42ddf72ef01bca22b4749dbacfe7704a9` |
| `deeptutor/agents/math_animator/agents/concept_analysis_agent.py` | 1–88 | 88 | 全文 | `e14a55f07348d5e8b4884747e5f23d71edb7037d76012e99dfe0c59fa3a8000b` |
| `deeptutor/agents/math_animator/agents/concept_design_agent.py` | 1–67 | 67 | 全文 | `a2d3cd81274445bc6670c34927eec71626a9aea91ec1802e29ad0ede799b8162` |
| `deeptutor/agents/math_animator/agents/summary_agent.py` | 1–69 | 69 | 全文 | `39c1d66c5dda08ff4cb1ffc8353365034d154596263ea6d6a49ee4ef30b54635` |
| `deeptutor/agents/math_animator/agents/visual_review_agent.py` | 1–100 | 100 | 全文 | `c0a9028a14fa0fe715b646aaa25939b4015ee785e0367d3680135d1ee7c44638` |
| `deeptutor/agents/math_animator/capability.py` | 1–320 | 320 | 全文 | `7d2f2f858be3f2ed38ee08fb39a4cb3f85f3205f3144aed8acb93e3b70352cd4` |
| `deeptutor/agents/math_animator/duration_utils.py` | 1–36 | 36 | 全文 | `fa74109f280b077ac25dee3bba4b730580625cdd6ab1d9186f252bc4252bbbb0` |
| `deeptutor/agents/math_animator/models.py` | 1–97 | 97 | 全文 | `1b4b310524d757d31ecff00767db7813e1645c75f1af259ca5b2f3441aa60d24` |
| `deeptutor/agents/math_animator/pipeline.py` | 1–326 | 326 | 全文 | `d60245b8239611c5768ab9b19d53e044af9ce1ee6feeb5204e0bee87719c3f66` |
| `deeptutor/agents/math_animator/prompts/en/code_generator_agent.yaml` | 1–95 | 95 | 全文 | `4340fd2e3b35492bacb268262d6f37a36856b07a331b91ed5fe08c5cbe8ffe8b` |
| `deeptutor/agents/math_animator/prompts/en/concept_analysis_agent.yaml` | 1–26 | 26 | 全文 | `27f8bf104b5b68e11b8788fb94bb10477b7f813e22198eb4589165fd9e2a8408` |
| `deeptutor/agents/math_animator/prompts/en/concept_design_agent.yaml` | 1–47 | 47 | 全文 | `3c3a53c8037a9274f9539a94ac107966fca01b8e494481887354c63679824b34` |
| `deeptutor/agents/math_animator/prompts/en/math_animator.yaml` | 1–7 | 7 | 全文 | `b66484250526f214acdafa9a15378dd73f5b3a5afc55afe8581c97e4a995458e` |
| `deeptutor/agents/math_animator/prompts/en/summary_agent.yaml` | 1–27 | 27 | 全文 | `c32e22468a4ddeed8a225fc0dfe4b882d38fbf68609e526b46aa6d90510b7be7` |
| `deeptutor/agents/math_animator/prompts/en/visual_review_agent.yaml` | 1–31 | 31 | 全文 | `f2450c04aeb8a343cf980f775f21a184aa5a7c79e13e3f2a9f0cc50ce8cb1e2c` |
| `deeptutor/agents/math_animator/prompts/zh/code_generator_agent.yaml` | 1–96 | 96 | 全文 | `912c6883e826d90ac486b9d210e638d733b5e73e17382ef2a91f5790c80f6d96` |
| `deeptutor/agents/math_animator/prompts/zh/concept_analysis_agent.yaml` | 1–26 | 26 | 全文 | `6b9eb4b31ada707cf6e7351f5a5230bf74bbc6d9fa00ac22cf3c57eabc56577c` |
| `deeptutor/agents/math_animator/prompts/zh/concept_design_agent.yaml` | 1–48 | 48 | 全文 | `a7f6770a269ad327cd20084404dfdbdf6b8aeaf09e8b2cbc639974b4084079c8` |
| `deeptutor/agents/math_animator/prompts/zh/math_animator.yaml` | 1–7 | 7 | 全文 | `dcce6f7b6115a26ff522cff13502a3baaecdbe8f3b37bc70bbef7d8e3c983f66` |
| `deeptutor/agents/math_animator/prompts/zh/summary_agent.yaml` | 1–27 | 27 | 全文 | `8b3d3d535ec6824c500c741c6692e20de9e28a256ae8a63ade4e855f847a1d9e` |
| `deeptutor/agents/math_animator/prompts/zh/visual_review_agent.yaml` | 1–31 | 31 | 全文 | `004bd576639b901049ca090a1a5e5548f39982d782b9961a10cdd8298e025581` |
| `deeptutor/agents/math_animator/renderer.py` | 1–271 | 271 | 全文 | `3fd9d7490bc0857f78b380f34ed7b90a10b76b812d1dc8ae34ec7cb853524f59` |
| `deeptutor/agents/math_animator/request_config.py` | 1–38 | 38 | 全文 | `50f3afc5f0489892049d019c75d81045861763f548a53fa7591effa3e42201ea` |
| `deeptutor/agents/math_animator/retry_manager.py` | 1–160 | 160 | 全文 | `b3eac69fda695242aa19d8163c5152f798e33a077945d3773e651fb0a809750b` |
| `deeptutor/agents/math_animator/utils.py` | 1–53 | 53 | 全文 | `ef8d3842c25de876b6c6c9fa27ceb321a87d87e7353e6cedf4693a65a9cebeab` |
| `deeptutor/agents/math_animator/visual_review.py` | 1–154 | 154 | 全文 | `f28a53aec09abcfe3737b78bfd24a86173a1d4339c0b14f2c10708e999896888` |
| `deeptutor/agents/question/pipeline.py` | 1–2219 | 2219 | 全文 | `0fab40635ba525ea297373bf4dd9c94d9511323a549ed25199a3670b5b88b82a` |
| `deeptutor/agents/question/prompts/en/pipeline.yaml` | 1–353 | 353 | 全文 | `3fe275a4e8272a57f3fba0179b7b42ff7dd4cd72b9f5e218e2c0cd2dcf5750f8` |
| `deeptutor/agents/question/prompts/zh/pipeline.yaml` | 1–333 | 333 | 全文 | `2e431d54c7edcec083258f312d32da4728a9f0a2412e5802cf515f552e42d464` |
| `deeptutor/agents/visualize/capability.py` | 1–561 | 561 | 全文 | `b9dc21ba5717c6e3e940761de0eebeecee9e8a761ca9699fe60221266a317836` |
| `deeptutor/agents/visualize/pipeline.py` | 1–91 | 91 | 全文 | `e9ae617b7f7a49f843d9f428902bac9239049bf6d62587122faad20b9d1f7d13` |
| `deeptutor/agents/visualize/utils.py` | 1–191 | 191 | 全文 | `61be9d94830c7875a01e0c7afa78863e76dc92449e1f37598de4c37e7e0602f4` |
| `deeptutor/api/routers/book.py` | 1045–1175, 1260–1310 | 1745 | 局部 | `63802072747d321148bc7a2f3f896cafea71785485409f8eaf9179e496a85072` |
| `deeptutor/book/agents/page_planner.py` | 1–429 | 429 | 全文 | `d708f611bbbd96ffb130454f32ea76379eac839887ffabb65386f67b335e25e6` |
| `deeptutor/book/agents/source_explorer.py` | 1–729 | 729 | 全文 | `6249fbd114269584792f61f0e831c282c4f5e679d7fa747df2b34747c16632a4` |
| `deeptutor/book/agents/spine_agent.py` | 1–189 | 189 | 全文 | `ae4ef2fe5097fd4eb92b3af79f442c5901e1a10c0fad322ad432ac5cd089d70a` |
| `deeptutor/book/agents/spine_synthesizer.py` | 1–795 | 795 | 全文 | `7bd0996c71ec921205dd9e407926dbfbec2a269df6d7fb5a3cafce685211c7fd` |
| `deeptutor/book/blocks/_llm_writer.py` | 1–189 | 189 | 全文 | `791aa611577e417385e6675ac0207670d58a15e181be4b69dafed510206b077c` |
| `deeptutor/book/blocks/_prompts.py` | 1–67 | 67 | 全文 | `7e4abfb5b5557be02ef920be871f76813b2aebd3b3fab1388b96504d1ad45b9e` |
| `deeptutor/book/blocks/animation.py` | 1–133 | 133 | 全文 | `6c99cfd0ae77a10f44fb33b593bc989a15d041b68411fd311817a5ca955d85b4` |
| `deeptutor/book/blocks/base.py` | 1–232 | 232 | 全文 | `7670de6c6157fbb6af1d7e87c2ca298f3a2596b04e6cbccce622702bc2bb3557` |
| `deeptutor/book/blocks/callout.py` | 1–61 | 61 | 全文 | `bbeccb49b995d40a28a69b8392d8d879647b288b1240b60611bbffd6a7dc13c0` |
| `deeptutor/book/blocks/flash_cards.py` | 1–73 | 73 | 全文 | `946b8311249f94d07f1f9e6387ab7d6a800f29ca04579edd68b0d948996a24e9` |
| `deeptutor/book/blocks/interactive.py` | 1–113 | 113 | 全文 | `3c41f17e3de6ba57648587164f3614ea5753891bbc9b4a065ed23977a3669bf3` |
| `deeptutor/book/blocks/quiz.py` | 1–121 | 121 | 全文 | `ce16447f37039d81e5a169741c9d6b8398ae4cf78436a8ee9f5b443d683b655b` |
| `deeptutor/book/blocks/section.py` | 1–365 | 365 | 全文 | `aa1c423984f6f07a170c9cd6e709dcacb897a450d73feabd70e1338773c814ff` |
| `deeptutor/book/blocks/text.py` | 1–113 | 113 | 全文 | `5e766923421f00ed1a306550e2cbd0a8d14c02abd45838e5aeaa2238e3df9bfb` |
| `deeptutor/book/compiler.py` | 1–474 | 474 | 全文 | `5c3dfe108f51b717f4b73d69a6f1f36cf959bfc29a4978493d6c4f1d03717899` |
| `deeptutor/book/engine.py` | 538–672, 2010–2133 | 2133 | 局部 | `5a86c25e6746754abc923fbc80fe41fbc7e8e46542185ed81f45d5ebff580246` |
| `deeptutor/book/models.py` | 1–577 | 577 | 全文 | `5a78d3dab7596d93142e9049c211c23f696d8390ae51928269f0509cc7977bcf` |
| `deeptutor/book/progress.py` | 1–136 | 136 | 全文 | `f261ab7a8fc33afa59eea46783b8b6764cf4bab55f76219ceddff53591bf4e6c` |
| `deeptutor/book/prompts/en/animation.yaml` | 1–10 | 10 | 全文 | `962e0af3a9b328fffdb68a4855d72a17455295181bfb61e00d2892f33356c8ad` |
| `deeptutor/book/prompts/en/flash_cards.yaml` | 1–12 | 12 | 全文 | `cf4858086ce48224584ef73c229cf23e1b6ee3b3199406c6975854ea6fc7275e` |
| `deeptutor/book/prompts/en/interactive.yaml` | 1–10 | 10 | 全文 | `e93c0b6e235aed24323cc084a968cd2b6c8a180518dcf02dd081f9170937e035` |
| `deeptutor/book/prompts/en/page_planner.yaml` | 1–57 | 57 | 全文 | `0d3efcb7bfaa544b33d41c93792cc053db78490e0b1faf58c5dd4911cb89362a` |
| `deeptutor/book/prompts/en/section.yaml` | 1–44 | 44 | 全文 | `aa189e027662186f77548fd1d098e0d3e537ab56764dd1b820989df6dc3f6f49` |
| `deeptutor/book/prompts/en/source_explorer.yaml` | 1–74 | 74 | 全文 | `1997720aed1058fb54f71951deba14466d60d5f7d90ad687112a6eb3a1d3bb60` |
| `deeptutor/book/prompts/en/spine_agent.yaml` | 1–43 | 43 | 全文 | `07db259d375a5eaf3c62da9cb1f1c2390f8fbc9a8b7c7db08f831b192d9e8533` |
| `deeptutor/book/prompts/en/spine_synthesizer.yaml` | 1–126 | 126 | 全文 | `d84cff6066ccfac601341d1bf77f60a5d1bd7e45de68c85309211da072835ae1` |
| `deeptutor/book/prompts/zh/animation.yaml` | 1–10 | 10 | 全文 | `e4c82cad1c419800c37dd29b31ea836909e5ed2a4699a7b9eac4a6e012d4c3fd` |
| `deeptutor/book/prompts/zh/flash_cards.yaml` | 1–11 | 11 | 全文 | `1bd67e4d04302580b5d8e3fabbaee083a822dc1d3fa39aab1b3b389429e6736d` |
| `deeptutor/book/prompts/zh/interactive.yaml` | 1–10 | 10 | 全文 | `0d7b0a0116d5063ffc4dc1c38b904cc68bc695157b183a8c059bb1e02b778e56` |
| `deeptutor/book/prompts/zh/page_planner.yaml` | 1–52 | 52 | 全文 | `c27ffc58e330734e1c5888fc0df23d8b0b5ccb649a86ac2251b75c8e7d962fff` |
| `deeptutor/book/prompts/zh/section.yaml` | 1–41 | 41 | 全文 | `40aa131997b3e7012d01cbb2279ef8a6ef194538341a1c30c7cabb645dca157e` |
| `deeptutor/book/prompts/zh/source_explorer.yaml` | 1–67 | 67 | 全文 | `dce929108e4769a9602b5fa549a646789d35c6cf4b45b10eef4839ca547cb680` |
| `deeptutor/book/prompts/zh/spine_agent.yaml` | 1–41 | 41 | 全文 | `fd8847c8027c874b12aa3384eb8066d7b4d5b74fdb4970c1c7f6d1ce493eb45a` |
| `deeptutor/book/prompts/zh/spine_synthesizer.yaml` | 1–118 | 118 | 全文 | `8dad605855af672fde2108c27e990234e436ca88a248f546b4ab8164f4a30baf` |
| `deeptutor/learning/grading.py` | 1–64 | 64 | 全文 | `7f35f9d4dbf6169aa32139a7808eed20be19d41a939d585237b3566d0f8f3c1c` |
| `deeptutor/learning/mastery.py` | 1–40 | 40 | 全文 | `318e1001a9cfeea744742bbb5d232d54bc72b3f915c7ef93f82683f038a66fd6` |
| `deeptutor/learning/scheduler.py` | 1–101 | 101 | 全文 | `fc39fd6735010d343ec3454aed0feef60d00984864de42fd0bdf07ad8c7bb398` |
| `deeptutor/learning/service.py` | 175–320 | 1147 | 局部 | `3e883a51c65127f4a077f2a5fff0d4a3e3bd22601ef0b82954162a717f1f9a06` |
| `tests/agents/math_animator/test_code_generator_agent.py` | 1–81 | 81 | 全文 | `ab1447ff5f2dd5f2eb297ab39a95da46f187babf2bd77f02d7b715d84f668423` |
| `tests/agents/math_animator/test_retry_manager.py` | 1–185 | 185 | 全文 | `15b84a7596bbfe2b5747d7a93c3dba6c2175c56e763a9cfaeef442f3110bc162` |
| `tests/api/test_book_quiz_attempt_notebook.py` | 1–125 | 125 | 全文 | `007c9b879a0dda1655789ec1210e3a2cc03e865e85a34e3111ea1c442bf56df4` |
| `tests/book/test_progress.py` | 1–133 | 133 | 全文 | `3e58983120d0e02f87c205906c9749f94e670e2af4306d011c03b3ce41020e59` |
| `tests/book/test_quiz_extraction.py` | 1–153 | 153 | 全文 | `7afb3d6754d64de90449e66338ff93d97359c5700daf934748bba72ac473ec29` |
| `tests/book/test_visual_block_prompts.py` | 1–63 | 63 | 全文 | `822d5977b1e635fb12fbcbaeb667c286f41d2476419b453f8f1eb744e9c1e7ed` |
| `tests/core/test_math_animator_capability.py` | 1–121 | 121 | 全文 | `6be239ca3db5bf56b3e79708fd0e39514cecc35b5240220f88183a97674afb56` |
| `web/app/(workspace)/books/BooksRoute.tsx` | 807–888 | 1181 | 局部 | `c964fac0ab4584fcb41467661d2b1b2b5b5b00bef9c948485775b85e718e2bf2` |
| `web/app/(workspace)/books/components/blocks/AnimationBlock.tsx` | 1–106 | 106 | 全文 | `82ac080e62d6c38b28b5105917e57ade9556e751760678c2616c931b3fed5ae1` |
| `web/app/(workspace)/books/components/blocks/BlockRenderer.tsx` | 1–367 | 367 | 全文 | `2355f3752caa2b96e629016bf5b1808fd21a56118619867897c774aaa328ad8e` |
| `web/app/(workspace)/books/components/blocks/FlashCardsBlock.tsx` | 1–82 | 82 | 全文 | `65c7db4397ecd8c75273526c8d7c0436ea4dd3c4035c31a8a7adf0bedb4bff53` |
| `web/app/(workspace)/books/components/blocks/InteractiveBlock.tsx` | 1–81 | 81 | 全文 | `50057d611175259cb29f5a866615be2070688d4cd8c793fd4ac15b4fcfbb67e8` |
| `web/app/(workspace)/books/components/blocks/QuizBlock.tsx` | 1–376 | 376 | 全文 | `ccf14e5a8199d085a6aff53b741842d1b6abc9589e9945f99407ccc15c7def18` |
| `web/app/(workspace)/books/components/blocks/SectionBlock.tsx` | 1–66 | 66 | 全文 | `97482bf42d66b65c128fb0329fd98775829f862a46ce87b0045ea42c6bac30f5` |
| `web/components/math-animator/MathAnimatorViewer.tsx` | 1–205 | 205 | 全文 | `2436dacc36ed0da52951b4ce32ee0c6d9f57042e9fbbbdc76688d665898fb535` |
| `web/components/visualize/VisualizationViewer.tsx` | 1–677 | 677 | 全文 | `b4c7401915afabe3a610f6c4920c4d84d0011dcfcbd7f2c30639b367a9570844` |
| `web/lib/book-api.ts` | 348–386 | 496 | 局部 | `ac72a8aaf0fca2622ed7c3e6f8b3395a7b83eada6c835accbed69635adc6c1e2` |
| `web/lib/book-types.ts` | 1–289 | 289 | 全文 | `2eecc2e9debb31432cacc983a280c39610b656e59753f9b9f0e8225ecb96bae3` |
| `web/lib/iframe-html.ts` | 1–189 | 189 | 全文 | `cbe444d6f9b8d76ddc2651830e03b8728395b67330ac671fb62acd7ca94e17dd` |
| `web/lib/math-animator-types.ts` | 1–101 | 101 | 全文 | `61df86cee26b6abcad999660f0d7440e985d369d07471093006c2c2e52f85b64` |
| `web/lib/quiz-question-type.ts` | 1–113 | 113 | 全文 | `27fb40aba840650cc6af5835a586b67a47612c33ca8ae85b07c5a50162231358` |
| `web/tests/math-animator-types.test.ts` | 1–37 | 37 | 全文 | `e861920a5a1fa466579658bb5f6e8ba02ffe4cb8edbb22454f9f02eb30f80ec1` |
| `web/tests/quiz-option-latex.test.ts` | 1–87 | 87 | 全文 | `7f9a40cc862f88bf8120217b3369134740e685f843db787fd1bae04c2e3b0b32` |
| `web/tests/quiz-question-type.test.ts` | 1–106 | 106 | 全文 | `d9fc5f46fed1e4997aa01ae97be32e7162c2e38962caa35a7408488c1f04352e` |
