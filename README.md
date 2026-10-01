# Alice 二创

围绕 **Alice**（米羊 AI 助手）和 **洛小山**（狐狸吉祥物）的二创素材库与生图规范：正典参考图、提示词、成图案例，以及一套"怎样稳定画出同一个角色"的垫图方法。

![Alice 中秋赏月](outputs/2026-09-01_mid_autumn_moon_rabbit_Alice中秋赏月/alice_mid_autumn_lantern_chibi_v8.png)

![Alice 国庆开屏](outputs/2026-10-01_national_day_splash_Alice国庆开屏/alice_national_day_splash_v3.png)

![Alice 与洛小山露台共学](outputs/2026-09-30_terrace_study_Alice与洛小山露台共学/alice_luoxiaoshan_terrace_study_v1.png)

## 仓库内容

| 目录 | 内容 |
|---|---|
| `refs/alice/` | Alice 正典参考：设定表、三视图、16 套衣柜、场景立绘、Q 版设定、三坑少女设定 |
| `refs/luoxiaoshan/` | 洛小山正典形象、成品案例、道具与画风锚点、原始提示词存档 |
| `refs/alice_friends/` | Alice 的十三位虚构朋友（人设、三视图、头像、生活照） |
| `refs/logo/` | 米羊科技 Logo（仅作排版素材） |
| `outputs/` | 成图案例（中秋赏月、国庆开屏、Alice 与洛小山露台共学），按「日期 + 事项」分批归档，每张图配同名 `.prompt.json`（提示词、参考图、审计结论） |
| `docs/垫图逻辑.md` | 完整垫图规范：参考图职责、身份锁、画风与提示词写法、存档、审计 |
| `workflows/opc-character/` | 给新虚构角色做三视图 / 头像 / 生活照的工作流 |
| `scripts/gen_via_gateway.py` | 可选：通过米羊网关出 4K 图（需自备 KEY） |
| `.cursor/rules/brand-image-gen.mdc` | Cursor 规则：让 Agent 按本仓规范先问需求再生图 |

## 怎么用

1. 先读 `docs/垫图逻辑.md`，了解 Alice 的身份锁、画风锚定和提示词模板。
2. 从 `refs/alice/` 选参考图（设定表 + 衣柜里的某套穿搭），提示词里逐张声明每张参考图的职责。
3. 生图可以用 Cursor 内置 `GenerateImage` 垫图，也可以用米羊网关脚本 `scripts/gen_via_gateway.py`：复制 `.env.example` 为 `.env`，填入自己的 `MIYANG_API_KEY`（<https://miyang.cn/console/keys> 自助创建，`.env` 已在 `.gitignore`）。网关模型：`miyang/image-1`（标准档）、`miyang/image-hd`（高清 / 4K，脚本默认）。
4. 成图按 `outputs/{日期}_{slug}_{事项}/` 归档，同名 `.prompt.json` 记录提示词和审计结论。

## 几条核心经验

- **一次成图**：永远从 `refs/` 里的正典参考出发，不把生成结果当下一次的参考，否则细节会代代劣化。
- **参考图管人，提示词管画面**：关键外貌必须在提示词里写成"身份锁"，不能只靠参考图。
- **Alice 穿衣红线**：所有成图必须穿着完整、适合公开场合的服装，服装从 `refs/alice/wardrobe/` 里选。
- **成品要承载文字时，默认生图直出文字**，逐字列出文案并逐字核对。
- **被否定的版本也保留**，标记为 `superseded`，便于追溯决策过程。

## 许可

本仓库采用自定义的 [Alice 二创许可协议](LICENSE)，**不是 MIT 等通用开源协议**：

- 允许：学习研究、非商业二创、非商业分享，公开发布时注明"非官方二创"。
- 不允许：商业使用（含表情包上架、周边、变现）、恶意改编（丑化、低俗、色情、违法等）、冒充官方、注册相关商标域名。
- 违反协议、尤其是恶意改编的，权利人保留追究法律责任的权利。
- 商业合作或授权，请联系 connect@miyang.ai。
