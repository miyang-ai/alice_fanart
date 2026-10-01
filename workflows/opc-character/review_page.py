#!/usr/bin/env python3
"""把一个目录里的候选图排成一页，方便并排挑选（纯静态 HTML，双击即可打开）。

用法：
    python3 review_page.py <图片目录> [输出.html]
    例：python3 review_page.py my_character  →  my_character/review.html

目录里所有 png / jpg / webp 会按文件名排列，每张图下面一个单选框；选择存在浏览器本地，
点底部「导出选择」得到 JSON，可以直接发给协作者或喂回给 AI。
"""
from __future__ import annotations

import html
import sys
from pathlib import Path

EXTS = {".png", ".jpg", ".jpeg", ".webp"}


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    folder = Path(sys.argv[1]).resolve()
    out = Path(sys.argv[2]).resolve() if len(sys.argv) > 2 else folder / "review.html"
    imgs = sorted(p for p in folder.iterdir() if p.suffix.lower() in EXTS)
    if not imgs:
        raise SystemExit("目录里没有图片")
    groups: dict[str, list[Path]] = {}
    for p in imgs:  # avatar_v1a / avatar_v1b / life_v1 → 按前缀 avatar / life / sheet 分组
        groups.setdefault(p.stem.split("_")[0], []).append(p)
    rel = lambda p: p.relative_to(out.parent).as_posix() if out.parent in p.parents else p.as_uri()
    sections = []
    for kind, items in groups.items():
        cards = "".join(
            f'<label><input type="radio" name="{html.escape(kind)}" value="{html.escape(p.name)}">'
            f'<img loading="lazy" src="{html.escape(rel(p))}"><span>{html.escape(p.name)}</span></label>'
            for p in items
        )
        sections.append(f'<section><h3>{html.escape(kind)}</h3><div class="row">{cards}</div></section>')
    out.write_text(
        """<!doctype html><meta charset=utf-8><title>候选图挑选</title><style>
body{font-family:-apple-system,sans-serif;margin:24px;background:#faf7f2}.row{display:flex;gap:12px;flex-wrap:wrap}
label{display:block;text-align:center;font-size:13px;cursor:pointer}img{height:340px;border-radius:12px;display:block;border:3px solid transparent}
input:checked+img{border-color:#d9663c}section{margin-bottom:28px}button{padding:10px 20px;font-size:15px}pre{background:#fff;padding:12px}</style>
<h2>候选图挑选</h2>""" + "".join(sections) + """<button onclick="exp()">导出选择</button><pre id=o></pre>
<script>const K='review:'+location.pathname;const s=JSON.parse(localStorage[K]||'{}');
document.querySelectorAll('input').forEach(i=>{if(s[i.name]==i.value)i.checked=true;i.onchange=()=>{s[i.name]=i.value;localStorage[K]=JSON.stringify(s)}});
function exp(){o.textContent=JSON.stringify(s,null,1)}</script>""",
        encoding="utf-8",
    )
    print("已生成", out)


if __name__ == "__main__":
    main()
