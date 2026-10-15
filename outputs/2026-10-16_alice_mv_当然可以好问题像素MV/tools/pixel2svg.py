"""把生图模型画的像素画对齐到真实像素网格，输出成 SVG。

步骤：
1. 用相邻像素的色差剖面估计网格间距与起点（像素画的色块边界都落在网格线上）。
2. 每个格子取中心区域的中位色，抵消 JPG 压缩与缩放带来的边缘糊色。
3. 抠掉纯绿背景，按调色板归并颜色，同色横向连续像素合并成一条 path。

用法：python3 pixel2svg.py 输入图 输出.svg [--colors 48] [--pitch 7.5]
"""
import argparse
import json

import numpy as np
from PIL import Image


def comb_score(profile, pitch, offset):
    pos = np.arange(offset, len(profile) - 1, pitch)
    idx = np.round(pos).astype(int)
    return profile[idx].mean()


def find_grid(profile, lo, hi):
    best = (0, None, None)
    for pitch in np.arange(lo, hi, 0.02):
        for off in np.arange(0, pitch, 0.25):
            s = comb_score(profile, pitch, off)
            if s > best[0]:
                best = (s, pitch, off)
    return best[1], best[2]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src')
    ap.add_argument('out')
    ap.add_argument('--colors', type=int, default=48)
    ap.add_argument('--pitch', type=float, default=None)
    ap.add_argument('--lo', type=float, default=4)
    ap.add_argument('--hi', type=float, default=14)
    ap.add_argument('--rows', type=int, default=None, help='指定人物高度占多少行；给了就不再估计原图网格')
    ap.add_argument('--cell', type=float, default=None, help='指定格距（原图像素）；同一角色多个姿势用同一格距，切换时大小不变')
    a = ap.parse_args()

    img = np.asarray(Image.open(a.src).convert('RGB')).astype(np.float32)
    h, w, _ = img.shape
    dx = np.abs(np.diff(img, axis=1)).sum(axis=2)
    dy = np.abs(np.diff(img, axis=0)).sum(axis=2)
    # 只统计人物区域（非绿底），背景噪声会稀释网格信号
    g = img[..., 1] - np.maximum(img[..., 0], img[..., 2])
    fg = g < 40
    px = (dx * fg[:, 1:]).sum(axis=0)
    py = (dy * fg[1:, :]).sum(axis=1)
    px, py = px / px.max(), py / py.max()
    if a.pitch:
        pitch_x = pitch_y = a.pitch
        _, off_x = find_grid(px, a.pitch, a.pitch + 0.01)
        _, off_y = find_grid(py, a.pitch, a.pitch + 0.01)
    else:
        pitch_x, off_x = find_grid(px, a.lo, a.hi)
        pitch_y, off_y = find_grid(py, a.lo, a.hi)
        # 像素是正方形，两轴取平均再各自重估起点
        p = (pitch_x + pitch_y) / 2
        pitch_x = pitch_y = p
        _, off_x = find_grid(px, p, p + 0.01)
        _, off_y = find_grid(py, p, p + 0.01)

    if a.cell:
        a.rows = -1
    if a.rows:
        # 指定网格：先按前景包围盒定格子大小，每格取中心区域中位色，前景占比过半才算不透明
        ys, xs = np.where(fg)
        by0, by1, bx0, bx1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        cell = a.cell if a.cell else (by1 - by0) / a.rows
        pitch_x = pitch_y = cell
        off_y = by0 - cell
        off_x = bx0 - cell
    cols = int((w - off_x) // pitch_x)
    rows = int((h - off_y) // pitch_y)
    cells = np.zeros((rows, cols, 3), np.float32)
    for r in range(rows):
        y0 = off_y + r * pitch_y
        ya, yb = int(round(y0 + pitch_y * 0.25)), int(round(y0 + pitch_y * 0.75))
        for c in range(cols):
            x0 = off_x + c * pitch_x
            xa, xb = int(round(x0 + pitch_x * 0.25)), int(round(x0 + pitch_x * 0.75))
            block = img[ya:max(yb, ya + 1), xa:max(xb, xa + 1)].reshape(-1, 3)
            cells[r, c] = np.median(block, axis=0)

    green = cells[..., 1] - np.maximum(cells[..., 0], cells[..., 2])
    alpha = green < 38
    if a.rows:
        cov = np.zeros((rows, cols), np.float32)
        for r in range(rows):
            ya, yb = int(round(off_y + r * pitch_y)), int(round(off_y + (r + 1) * pitch_y))
            for c in range(cols):
                xa, xb = int(round(off_x + c * pitch_x)), int(round(off_x + (c + 1) * pitch_x))
                if ya < 0 or xa < 0:
                    continue
                cov[r, c] = fg[ya:yb, xa:xb].mean() if yb > ya and xb > xa else 0
        alpha = cov >= 0.5
    # 去绿溢色：贴着背景两格以内的像素，绿色通道压回不高于红蓝的较大值
    near = np.zeros_like(alpha)
    for dy in range(-2, 3):
        for dx in range(-2, 3):
            near |= np.roll(np.roll(~alpha, dy, 0), dx, 1)
    spill = near & alpha & (green > 0)
    cells[spill, 1] = np.maximum(cells[spill, 0], cells[spill, 2])

    # 裁到人物包围盒，四周留 1 格给描边
    ys, xs = np.where(alpha)
    y0, y1 = max(ys.min() - 1, 0), min(ys.max() + 2, rows)
    x0, x1 = max(xs.min() - 1, 0), min(xs.max() + 2, cols)
    cells, alpha = cells[y0:y1, x0:x1], alpha[y0:y1, x0:x1]
    R, C = alpha.shape

    # 调色板归并：只用人物像素训练
    flat = cells[alpha].astype(np.uint8).reshape(1, -1, 3)
    pal_img = Image.fromarray(flat).quantize(colors=a.colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = np.array(pal_img.getpalette()[:a.colors * 3]).reshape(-1, 3)
    idx = np.asarray(pal_img).reshape(-1)
    out = np.full((R, C), -1, int)
    out[alpha] = idx

    hexes = ['#%02X%02X%02X' % tuple(int(v) for v in c) for c in pal]
    paths = {}
    for r in range(R):
        c = 0
        while c < C:
            v = out[r, c]
            if v < 0:
                c += 1
                continue
            e = c
            while e + 1 < C and out[r, e + 1] == v:
                e += 1
            paths.setdefault(v, []).append(f'M{c} {r}h{e - c + 1}v1h{-(e - c + 1)}z')
            c = e + 1
    body = ''.join(f'<path fill="{hexes[v]}" d="{"".join(d)}"/>' for v, d in paths.items())
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {C} {R}" shape-rendering="crispEdges">{body}</svg>'
    open(a.out, 'w').write(svg)

    # 预览：按 8 倍最近邻放大
    rgba = np.zeros((R, C, 4), np.uint8)
    rgba[alpha, :3] = pal[out[alpha]]
    rgba[alpha, 3] = 255
    Image.fromarray(rgba).resize((C * 8, R * 8), Image.NEAREST).save(a.out.replace('.svg', '_x8.png'))
    # 双脚中心：最下面 6 行不透明像素的平均列号，切换姿势时按它对齐
    fy, fx = np.where(alpha[-7:])
    meta = {'w': C, 'h': R, 'foot_cx': round(float(fx.mean()), 1)}
    json.dump(meta, open(a.out.replace('.svg', '.json'), 'w'))
    print(json.dumps({'foot_cx': meta['foot_cx'], 'pitch': round(float(pitch_x), 3), 'offset': [round(float(off_x), 2), round(float(off_y), 2)],
                      'grid': [C, R], 'colors': len(paths), 'svg_bytes': len(svg)}, ensure_ascii=False))


if __name__ == '__main__':
    main()
