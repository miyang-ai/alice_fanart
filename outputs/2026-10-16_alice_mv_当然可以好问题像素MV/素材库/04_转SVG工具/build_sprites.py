"""汇总 sprites/<衣服>/alice_<姿势>.svg 的尺寸、脚底位置与外形轮廓，写成 sprites/sprites.js。

为什么是 JS：index.html 要能直接双击用 file:// 打开，浏览器不允许 fetch 本地文件、也不允许 CSS mask 引用本地图片，
<script src> 是唯一能把数据带进来的方式。外形轮廓用来画彩色残影与错位投影，任意颜色都行。

轮廓格式：每行一段 "列,长度 列,长度"，行之间用 | 分隔，页面加载时还原成 SVG path，比直接存 path 小一个数量级。

用法：python3 tools/build_sprites.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / 'sprites'
OUTFITS = ['jk', 'dress', 'chic', 'cardigan']
# 奔跑、起跳时最底下几行只有一只脚，按脚算出来的中心偏得厉害，改用身体中线
CENTER_POSES = {'run', 'jump'}
RUN = re.compile(r'M(\d+) (\d+)h(\d+)')


def silhouette(svg_text, rows):
    cells = [set() for _ in range(rows)]
    for c, r, n in RUN.findall(svg_text):
        c, r, n = int(c), int(r), int(n)
        cells[r].update(range(c, c + n))
    out = []
    for cols in cells:
        runs, start, prev = [], None, None
        for c in sorted(cols):
            if start is None:
                start = prev = c
            elif c == prev + 1:
                prev = c
            else:
                runs.append(f'{start},{prev - start + 1}')
                start = prev = c
        if start is not None:
            runs.append(f'{start},{prev - start + 1}')
        out.append(' '.join(runs))
    return '|'.join(out)


def main():
    meta = {}
    for o in OUTFITS:
        meta[o] = {}
        for js in sorted((ROOT / o).glob('alice_*.json')):
            pose = js.stem[len('alice_'):]
            m = json.loads(js.read_text())
            svg = (ROOT / o / f'alice_{pose}.svg').read_text()
            f = round(m['w'] / 2, 1) if pose in CENTER_POSES else m['foot_cx']
            meta[o][pose] = {'w': m['w'], 'h': m['h'], 'f': f, 'sil': silhouette(svg, m['h'])}
    body = json.dumps(meta, ensure_ascii=False, separators=(',', ':'))
    (ROOT / 'sprites.js').write_text('/* 由 tools/build_sprites.py 生成，不要手改 */\nwindow.SPRITE_META=' + body + ';\n')
    for o in OUTFITS:
        print(o, sorted(meta[o]))
    print('bytes', len(body))


if __name__ == '__main__':
    main()
