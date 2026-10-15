# Alice 像素角色素材库

《当然可以好问题》MV 用到的全部像素角色原始素材，集中在这一个文件夹。原始位置是 `~/Movies/alice-mv/素材库/`。收进 alice_fanart 仓库时，成品 SVG 不再重复存放，对应目录是上一级的 `sprites/`。

## 目录

| 文件夹 | 内容 | 数量 |
|---|---|---|
| `01_绿幕原稿/` | 生图模型直接出的绿底原图，864×1152，按服装分文件夹，文件名就是动作名 | 4 套衣服各 13 张，黄毛 4 张，另有备选 |
| `02_垫图/` | 生图时用的外部参考图：Alice 设定图、衣橱参考、冒险岛画风参考、参考拼图 | 9 |
| `03_提示词/` | 每张图的完整提示词、垫图顺序、画幅、成品对应关系 | 62 条 |
| `04_转SVG工具/` | 绿幕图转像素 SVG 的脚本，与批量生成 `sprites.js` 的脚本 | 2 |
| `05_成品SVG/` | 转换后的 SVG、尺寸 JSON、放大预览图与 `sprites.js`。在本仓库里不重复存放，直接看上一级的 `sprites/` | 全部 |

## 01_绿幕原稿 的内容

```text
01_绿幕原稿/
  jk/ dress/ chic/ cardigan/   每套 13 个动作
      stand wave cheer jump catch present point peace heart bow think run idol
  huangmao/                    fall happy h_fall h_happy
  _备选与未采用/                 候选稿、被替换的版本、朋友圈自拍场景图
```

- `jk` 是主衣服，13 个动作是后面所有衣服的姿势来源。
- `cardigan` 的 `stand wave cheer` 最初叫 `alice_src_v1 / wave / cheer`，这里已改成统一名字。
- `_备选与未采用/` 里有黄毛横躺欢呼的两版废稿、`alice_outfit_skirt`（半裙候选）、朋友圈自拍场景图 `alice_selfie_dress_pixel`。

## 垫图怎么对应

提示词里的垫图有两类。

- 外部设计稿：在 `02_垫图/`。
- 之前出的原稿再当垫图用：直接指向 `01_绿幕原稿/` 里的文件。比如 30 张换装图，图 1 是 `jk/<动作>.jpg`，图 2 是该服装的 `stand.jpg`。

每一条提示词下面都列了垫图的库内路径，按传入顺序排列。查某张图怎么来的，打开 `03_提示词/提示词.md` 搜它的成品路径即可。

## 转成像素 SVG

```bash
# 每格像素间距 --cell 要和已有素材一致，否则换装时人物大小会跳
python3 04_转SVG工具/pixel2svg.py 01_绿幕原稿/dress/heart.jpg out.svg --cell 3.003 --colors 48
# 会同时在 out.svg 旁边写出 .json（宽高、脚的中心）和 _x8.png（放大预览）
python3 04_转SVG工具/build_sprites.py   # 重新生成 sprites.js
```

各批素材用过的参数：

| 批次 | `--cell` | `--colors` |
|---|---|---|
| cardigan 三张基础动作 | 2.988 | 128 |
| jk 13 个动作、黄毛 | 2.994 | 128 |
| dress / chic 三张基础动作 | 约 2.997 / 3.048（由站姿原稿高度除以 332 行得出） | 128 |
| 补齐的 30 张换装动作 | 3.003 | 48 |

`build_sprites.py` 与 `pixel2svg.py` 里写的是 MV 项目内的相对路径（`sprites/<服装>/`）。要运行，使用上一级的 `tools/`，它与 `sprites/` 的相对位置正确。

## 其他位置

这次没有复制的内容，仍留在原处：

- `~/Documents/GitHub/alice_fanart/refs/alice/`：Alice 的完整设定图库（`02_垫图` 里只取了生图时用到的 5 张）。
- `~/Movies/alice-mv/process/`：程序化小人、网格检测、MV 预览截图等过程文件。
- Cursor 的图片缓存目录里还有这些原稿的副本，缓存可能被清理，以这个素材库为准。

整理时间：2026-10-16。
