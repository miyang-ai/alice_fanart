# alice_fanart

Alice（白艾莉）与洛小山的二创素材库：官方参考图、垫图规范、提示词和成图案例。

<p align="center">
  <img src="outputs/2026-10-01_readme_cover_Alice二创封面/alice_luoxiaoshan_readme_cover_v1.png" alt="Alice Fanart · 白艾莉 · 洛小山 二创素材库" />
</p>

## 她的朋友们

Alice 有十三位虚构朋友，参考图都在 [`refs/alice_friends/`](refs/alice_friends/)，可以和她同框创作。

<p align="center">
  <img src="docs/images/alice_friends_roster.jpg" width="70%" alt="Alice 的十三位朋友" />
</p>

## 和洛小山一起

<p align="center">
  <img src="outputs/2026-09-30_terrace_study_Alice与洛小山露台共学/alice_luoxiaoshan_terrace_study_v1.png" width="60%" alt="Alice 与洛小山露台共学" />
</p>

## 目录

```
refs/
  alice/          Alice 参考图：设定表、三视图、16 套衣柜、场景立绘、Q 版与迷你少女设定
  luoxiaoshan/    洛小山形象、成品案例、道具与画风锚点、原始提示词存档
  alice_friends/  Alice 的十三位虚构朋友
  logo/           米羊科技 Logo
outputs/          成图案例，按「日期_事项」分目录，每张图带同名 .prompt.json
docs/垫图逻辑.md   垫图规范：参考图职责、身份锁、画风与提示词写法、存档与审计
workflows/        新建虚构角色、数码涟漪修复等工作流
scripts/          可选的生图网关脚本
```

## 使用

1. 阅读 [`docs/垫图逻辑.md`](docs/垫图逻辑.md)，了解 Alice 的身份锁、画风锚定和提示词写法。
2. 从 `refs/alice/` 选参考图（设定表加一套衣柜穿搭），在提示词里逐张说明每张参考图的用途。
3. 用你习惯的生图工具垫图生成，例如 Cursor 内置的 `GenerateImage`，或使用 `scripts/gen_via_gateway.py` 调用米羊网关：

   ```bash
   cp .env.example .env     # 填入 MIYANG_API_KEY，可在 https://miyang.cn/console/keys 创建
   python3 scripts/gen_via_gateway.py \
     --prompt-file prompt.txt \
     --ref refs/alice/ref_sheets/ref_sheet_alice.jpg \
     --ref refs/alice/wardrobe/wardrobe_smart_casual.png \
     --out outputs/2026-10-01_demo/alice_demo_v1.png
   ```

   模型：`miyang/image-1`（标准）、`miyang/image-hd`（高清 / 4K，默认）。

4. 成图放进 `outputs/{日期}_{事项}/`，并写同名 `.prompt.json` 记录提示词与参考图。

## 要点

- 每次都从 `refs/` 的参考图出发，不把生成结果当作下一次的参考。
- 关键外貌写进提示词作为身份锁，参考图只负责脸和体型。
- Alice 须穿着完整得体的服装，衣物从 `refs/alice/wardrobe/` 选择。

## 许可

见 [LICENSE](LICENSE)。简要说明：可以用于学习研究和非商业二创，公开发布时请注明"非官方二创"；商业使用需要事先授权，不得恶意改编或冒充官方，违反者将被追究责任。商业合作请联系 connect@miyang.ai。
