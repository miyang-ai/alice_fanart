/* 白艾莉 · 冒险岛纸娃娃风高清像素小人（SVG）
 *
 * 画法：先用矢量曲线在 96×128 的画布上画出人物（抗锯齿产生过渡色），
 * 再逐像素吸附成像素图、加选择性描边，眼睛和嘴用手点像素覆盖，最后合并成 SVG path。
 * 只在浏览器里运行（依赖 canvas）。
 *
 * 外貌依据：alice_fanart/refs/alice/persona.json 与 chibi front.webp
 *   黑色自然微卷长发、中分；淡金色细发带、星星吊坠必戴；两耳无饰；
 *   米白圆领针织 #FBF1E4，鼠尾草绿开衫 #A39A6E，卡其高腰直筒裤 #D6C3A5，深棕乐福鞋 #6A4630，瞳色 #7A4E36。
 */
(function () {
  const W = 96, H = 128;

  /* ── 颜色工具 ── */
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const toHex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const x = hex(a), y = hex(b); return toHex(x.map((v, i) => v + (y[i] - v) * t)); };
  const shade = (c, t) => mix(c, '#000000', t);
  const light = (c, t) => mix(c, '#FFFFFF', t);

  const ALICE = {
    id: 'alice', name: '白艾莉',
    skin: '#FBEDE5', skinSh: '#F0D3CA', blush: '#F49AA6',
    hair: '#221D1E', hairDeep: '#141112', hairMid: '#3A3436', hairLight: '#5F5867', ring: '#8E8798',
    top: '#FBF1E4', outer: '#A39A6E', pants: '#D6C3A5', shoes: '#6A4630',
    gold: '#C9A96E', goldLight: '#EED9A6', goldDark: '#9C7F48',
    iris: '#7A4E36',
  };

  /* ── 矢量部件 ── */
  function path(ctx, fn, fill) { ctx.beginPath(); fn(ctx); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } }
  function mirrorX(ctx, fn) { ctx.save(); ctx.translate(W, 0); ctx.scale(-1, 1); fn(); ctx.restore(); }
  function stroke(ctx, pts, color, width, cap = 'round') {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i += 3) ctx.bezierCurveTo(...pts[i], ...pts[i + 1], ...pts[i + 2]);
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = cap; ctx.stroke();
  }

  const backHair = c => c
    .moveTo(48, 5)
    || c.bezierCurveTo(27, 4, 13, 18, 15, 40)
    || c.bezierCurveTo(15, 52, 11, 62, 13, 72)
    || c.bezierCurveTo(15, 82, 11, 88, 15, 95)
    || c.bezierCurveTo(17, 99, 22, 100, 26, 97)
    || c.bezierCurveTo(30, 99, 34, 99, 37, 96)
    || c.lineTo(59, 96)
    || c.bezierCurveTo(62, 99, 66, 99, 70, 97)
    || c.bezierCurveTo(74, 100, 79, 99, 81, 95)
    || c.bezierCurveTo(85, 88, 81, 82, 83, 72)
    || c.bezierCurveTo(85, 62, 81, 52, 81, 40)
    || c.bezierCurveTo(83, 18, 69, 4, 48, 5);

  const face = c => c
    .moveTo(24, 38)
    || c.bezierCurveTo(24, 57, 35, 67.5, 48, 68)
    || c.bezierCurveTo(61, 67.5, 72, 57, 72, 38)
    || c.bezierCurveTo(72, 24, 62, 17, 48, 17)
    || c.bezierCurveTo(34, 17, 24, 24, 24, 38);

  // 左侧鬓发：贴着脸颊垂到胸前，内侧边不越过 x27，避开外眼角
  const sideLock = c => c
    .moveTo(29, 30)
    || c.bezierCurveTo(19, 40, 22, 52, 18, 62)
    || c.bezierCurveTo(14, 71, 20, 79, 16, 87)
    || c.bezierCurveTo(14, 92, 18, 96, 22, 93)
    || c.bezierCurveTo(27, 86, 23, 78, 27, 70)
    || c.bezierCurveTo(30, 62, 26, 54, 26.5, 46)
    || c.bezierCurveTo(26.5, 40, 27, 35, 30, 32);

  // 左侧刘海：从发缝扫向太阳穴，三缕发梢，中间留出一道窄 V 形额头
  const bang = c => c
    .moveTo(48.4, 9)
    || c.bezierCurveTo(46.5, 17, 45.6, 23, 46.4, 30)
    || c.bezierCurveTo(44, 27, 42.5, 24, 41.5, 21)
    || c.bezierCurveTo(40.5, 28, 37.5, 34, 34, 38)
    || c.bezierCurveTo(34, 34, 33.6, 31, 33, 28.5)
    || c.bezierCurveTo(31, 34, 28.5, 39, 25.5, 43)
    || c.bezierCurveTo(23, 37, 21.5, 31, 21.5, 26)
    || c.bezierCurveTo(23.5, 15, 34, 9, 48.4, 9);

  const torso = c => c
    .moveTo(37, 69)
    || c.bezierCurveTo(33, 69, 31, 71.5, 31, 76)
    || c.lineTo(30, 100) || c.lineTo(66, 100) || c.lineTo(65, 76)
    || c.bezierCurveTo(65, 71.5, 63, 69, 59, 69);
  const cardiganL = c => c
    .moveTo(37, 69)
    || c.bezierCurveTo(33, 69, 31, 71.5, 31, 76)
    || c.lineTo(30, 100) || c.lineTo(45, 100) || c.lineTo(43.5, 70);

  /* ── 整个人的矢量绘制 ── */
  function drawBody(ctx, ch, pose) {
    const upL = pose === 'cheer', upR = pose === 'cheer' || pose === 'wave';

    path(ctx, backHair, ch.hairDeep);
    // 后层发丝：几道略亮的弧线，避免一整块死黑
    [[[20, 46], [16, 62], [19, 78], [15, 96]], [[76, 46], [80, 62], [77, 78], [81, 96]]].forEach(p => stroke(ctx, p, ch.hair, 3));

    // 腿与鞋
    ctx.fillStyle = ch.pants;
    path(ctx, c => { c.moveTo(32, 98); c.lineTo(47.5, 98); c.lineTo(47.5, 115); c.lineTo(33, 115); });
    ctx.fill();
    path(ctx, c => { c.moveTo(48.5, 98); c.lineTo(64, 98); c.lineTo(63, 115); c.lineTo(48.5, 115); });
    ctx.fill();
    ctx.fillStyle = shade(ch.pants, 0.12); ctx.fillRect(47, 101, 2, 14); ctx.fillRect(32, 98, 32, 2);
    ctx.fillStyle = ch.shoes;
    [[31, 113], [49, 113]].forEach(([x, y]) => { ctx.beginPath(); ctx.roundRect(x, y, 16, 8, [4, 4, 3, 3]); ctx.fill(); });
    ctx.fillStyle = light(ch.shoes, 0.22); ctx.fillRect(33, 114, 11, 1); ctx.fillRect(51, 114, 11, 1);

    // 躯干：米白内搭 + 开衫
    path(ctx, torso, ch.top);
    path(ctx, cardiganL, ch.outer);
    mirrorX(ctx, () => path(ctx, cardiganL, ch.outer));
    ctx.fillStyle = shade(ch.outer, 0.12);
    for (let y = 73; y < 97; y += 3) for (let x = 31; x < 66; x += 3) {
      const xx = x + ((y / 3) % 2 ? 1 : 0);
      if (xx < 44 || xx > 52) ctx.fillRect(xx, y, 1, 1);
    }
    ctx.fillRect(30, 96, 15, 4); ctx.fillRect(51, 96, 15, 4);
    ctx.fillStyle = shade(ch.outer, 0.28); ctx.fillRect(43.5, 70, 1, 30); ctx.fillRect(51.5, 70, 1, 30);
    ctx.fillStyle = shade(ch.top, 0.1);
    ctx.beginPath(); ctx.ellipse(48, 69.5, 6, 2.6, 0, 0, Math.PI); ctx.fill();

    // 下垂的手臂
    const armDown = side => {
      const s = side < 0 ? 1 : -1, x0 = side < 0 ? 34 : 62, x1 = side < 0 ? 29.5 : 66.5;
      stroke(ctx, [[x0, 75], [x0 - 2 * s, 82], [x1 + s, 89], [x1, 94]], ch.outer, 9);
      stroke(ctx, [[x1 - 4, 93.5], [x1 - 2, 94], [x1 + 2, 94], [x1 + 4, 93.5]], shade(ch.outer, 0.16), 2, 'butt');
      ctx.fillStyle = ch.skin; ctx.beginPath(); ctx.arc(x1, 98, 3.8, 0, Math.PI * 2); ctx.fill();
    };
    if (!upL) armDown(-1);
    if (!upR) armDown(1);

    // 吊坠：金链 + 星星
    stroke(ctx, [[43.5, 70], [45, 73], [46.5, 76], [48, 78]], ch.gold, 1);
    stroke(ctx, [[52.5, 70], [51, 73], [49.5, 76], [48, 78]], ch.gold, 1);
    ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 1.6 : 3.8; ctx.lineTo(48 + Math.cos(a) * r, 82 + Math.sin(a) * r); }
    ctx.closePath(); ctx.fillStyle = '#D6B46A'; ctx.fill();

    // 脖子与脸
    ctx.fillStyle = ch.skinSh; ctx.fillRect(43, 62, 10, 9);
    path(ctx, face, ch.skin);
    // 腮红：大片晕开的粉，冒险岛纸娃娃的标志
    [[34, 56], [62, 56]].forEach(([x, y]) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, 8.5);
      g.addColorStop(0, ch.blush + 'B0'); g.addColorStop(0.55, ch.blush + '55'); g.addColorStop(1, ch.blush + '00');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
    });
    // 刘海在额头上投下的阴影
    ctx.save(); path(ctx, face); ctx.clip();
    ctx.translate(0, 2.2); path(ctx, bang, ch.skinSh); mirrorX(ctx, () => path(ctx, bang, ch.skinSh));
    ctx.restore();

    // 前层头发
    path(ctx, sideLock, ch.hair); mirrorX(ctx, () => path(ctx, sideLock, ch.hair));
    path(ctx, bang, ch.hair); mirrorX(ctx, () => path(ctx, bang, ch.hair));
    const strands = () => {
      stroke(ctx, [[47.5, 11], [46, 17], [45.5, 22], [46, 28]], ch.hairMid, 1);
      stroke(ctx, [[44, 12], [42, 20], [39, 28], [35, 35]], ch.hairMid, 1);
      stroke(ctx, [[38, 12], [33, 19], [29, 30], [26, 40]], ch.hairMid, 1);
      stroke(ctx, [[27, 34], [21, 46], [24, 58], [20, 68]], ch.hairMid, 1);
      stroke(ctx, [[22, 68], [18, 76], [22, 82], [19, 90]], ch.hairLight, 1);
      stroke(ctx, [[25, 40], [23, 47], [24, 54], [22, 60]], ch.hairLight, 1);
    };
    strands(); mirrorX(ctx, strands);
    // 天使环：发顶一圈断续的冷色高光
    ctx.lineCap = 'butt'; ctx.strokeStyle = ch.ring; ctx.lineWidth = 1.6;
    [[1.17, 1.3], [1.34, 1.46], [1.54, 1.66], [1.7, 1.83]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(48, 46, 25, a * Math.PI, b * Math.PI); ctx.stroke(); });
    ctx.strokeStyle = ch.hairLight; ctx.lineWidth = 1;
    [[1.2, 1.44], [1.56, 1.8]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(48, 46, 23, a * Math.PI, b * Math.PI); ctx.stroke(); });

    // 淡金色发带：压在头发上，出镜必戴
    ctx.lineCap = 'round';
    ctx.strokeStyle = ch.goldDark; ctx.lineWidth = 4.6; ctx.beginPath(); ctx.arc(48, 45.5, 30, 1.1 * Math.PI, 1.9 * Math.PI); ctx.stroke();
    ctx.strokeStyle = ch.gold; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.arc(48, 45, 30, 1.1 * Math.PI, 1.9 * Math.PI); ctx.stroke();
    ctx.strokeStyle = ch.goldLight; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.arc(48, 44.4, 30.5, 1.24 * Math.PI, 1.48 * Math.PI); ctx.stroke();

    // 举起的手臂（画在头发之上）
    const armUp = side => {
      const s = side < 0 ? -1 : 1, x0 = side < 0 ? 34 : 62;
      stroke(ctx, [[x0, 75], [x0 + 5 * s, 70], [x0 + 10 * s, 65], [x0 + 14 * s, 60]], ch.outer, 9);
      stroke(ctx, [[x0 + 11 * s, 58], [x0 + 13 * s, 59.5], [x0 + 15 * s, 61], [x0 + 17 * s, 62.5]], shade(ch.outer, 0.16), 2, 'butt');
      ctx.fillStyle = ch.skin; ctx.beginPath(); ctx.arc(x0 + 16 * s, 56, 3.8, 0, Math.PI * 2); ctx.fill();
    };
    if (upL) armUp(-1);
    if (upR) armUp(1);
  }

  /* ── 手点像素：眼睛、眉、嘴 ─────────────────────────
   * 左眼 18×12，第 0 列是外眼角，右眼镜像。逐像素按公式生成：
   * 上眼睑是中间高的弧，外眼角带一点下垂的眼尾；虹膜是椭圆，上深下浅，中间压一颗瞳仁；
   * 左上一大一小两颗高光，右下一颗小反光；下眼睑一道粉。 */
  const EYE_X = 27, EYE_Y = 43, EW = 18;
  function eyeCells(ch) {
    const K = '#2E1F25', k = '#5B3F49', e = '#EDC6CE', Wt = '#F8F0F0', p = '#EDA6B1';
    const U = shade(ch.iris, 0.5), I = ch.iris, J = light(ch.iris, 0.32), Jl = mix(light(ch.iris, 0.5), '#F2C890', 0.35), P = shade(ch.iris, 0.72);
    const cells = [];
    for (let i = 0; i < EW; i++) {
      const t = (i + 0.5) / EW, arch = Math.sin(Math.PI * t);
      const top = Math.round(3.4 - 2.6 * arch + (t < 0.18 ? 1.2 : 0));
      const bot = Math.round(10.6 - 1.6 * (1 - arch) ** 1.6);
      if (i >= 4 && i <= 13) cells.push([i, top - 1, e]);
      cells.push([i, top, i === 0 || i === EW - 1 ? k : K]);
      if (i <= EW - 3) cells.push([i, top + 1, K]);
      for (let j = top + 2; j <= bot; j++) {
        const dx = (i - 9) / 6.2, dy = (j - 6.6) / 5.2;
        let c = Wt;
        if (dx * dx + dy * dy <= 1) {
          c = j <= 5 ? U : j <= 7 ? I : j <= 8 ? J : Jl;
          const px = (i - 9) / 2.3, py = (j - 6.2) / 2.6;
          if (px * px + py * py <= 1) c = P;
        }
        cells.push([i, j, c]);
      }
      if (i >= 3 && i <= EW - 3) cells.push([i, bot + 1, p]);
    }
    // 外眼尾
    cells.push([-1, 4, K], [-1, 3, k]);
    // 高光
    [[5, 4], [6, 4], [5, 5], [6, 5], [7, 4], [6, 6]].forEach(([i, j]) => cells.push([i, j, '#FFFFFF']));
    cells.push([11, 9, '#FFF3EC'], [12, 9, '#FFF3EC'], [10, 4, '#F4E6EA']);
    return cells.map(([i, j, c]) => [EYE_X + i, EYE_Y + j, c]);
  }
  function faceOverlay(ch, kind) {
    const out = [];
    const put = (x, y, c) => { out.push([x, y, c]); out.push([W - 1 - x, y, c]); };
    if (kind === 'smile' || kind === 'sing') eyeCells(ch).forEach(([x, y, c]) => put(x, y, c));
    // 细眉：只画在露出皮肤的地方，被刘海挡住的部分不画
    [[31, 39], [32, 38], [33, 38], [34, 37], [35, 37], [36, 37], [37, 37], [38, 37], [39, 38], [40, 38]].forEach(([x, y]) => put(x, y, 'BROW'));
    const lid = '#2E1F25', soft = '#5B3F49';
    if (kind === 'happy') {
      // 笑眯眼：向上弯的弧，两像素粗
      [[1, 8], [2, 7], [3, 6], [4, 5], [5, 5], [6, 4], [7, 4], [8, 4], [9, 4], [10, 4], [11, 4], [12, 5], [13, 5], [14, 6], [15, 7], [16, 8]].forEach(([i, j]) => { put(EYE_X + i, EYE_Y + j, lid); put(EYE_X + i, EYE_Y + j + 1, j < 8 ? soft : lid); });
    }
    if (kind === 'blink') {
      // 闭眼：向下弯的弧，带一点睫毛
      [[0, 5], [1, 6], [2, 7], [3, 7], [4, 8], [5, 8], [6, 8], [7, 8], [8, 8], [9, 8], [10, 8], [11, 8], [12, 8], [13, 7], [14, 7], [15, 6], [16, 5]].forEach(([i, j]) => put(EYE_X + i, EYE_Y + j, lid));
      [[1, 7], [3, 8], [5, 9], [15, 7]].forEach(([i, j]) => put(EYE_X + i, EYE_Y + j, soft));
    }
    // 鼻尖一点粉
    out.push([47, 56, '#EFA8AF'], [48, 56, '#EFA8AF']);
    const M = '#C9606E', T = '#F08C98', D = '#8E3946';
    if (kind === 'smile' || kind === 'blink') out.push([46, 60, M], [47, 61, M], [48, 61, M], [49, 60, M]);
    if (kind === 'happy') { [[45, 59], [50, 59], [46, 60], [47, 60], [48, 60], [49, 60]].forEach(([x, y]) => out.push([x, y, D])); [[46, 61], [47, 61], [48, 61], [49, 61]].forEach(([x, y]) => out.push([x, y, T])); [[47, 62], [48, 62]].forEach(([x, y]) => out.push([x, y, M])); }
    if (kind === 'sing') {
      [[46, 59], [47, 59], [48, 59], [49, 59], [45, 60], [50, 60], [45, 61], [50, 61], [46, 63], [47, 63], [48, 63], [49, 63], [45, 62], [50, 62]].forEach(([x, y]) => out.push([x, y, M]));
      [[46, 60], [47, 60], [48, 60], [49, 60], [46, 61], [49, 61]].forEach(([x, y]) => out.push([x, y, D]));
      [[47, 61], [48, 61], [46, 62], [47, 62], [48, 62], [49, 62]].forEach(([x, y]) => out.push([x, y, T]));
    }
    return out;
  }

  /* ── 像素化与描边 ── */
  const q = v => Math.min(255, Math.round(v / 6) * 6);
  function rasterize(ch, pose, kind) {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    drawBody(ctx, ch, pose);
    const d = ctx.getImageData(0, 0, W, H).data;
    const px = Array.from({ length: H }, () => new Array(W).fill(null));
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (d[i + 3] >= 120) px[y][x] = toHex([q(d[i]), q(d[i + 1]), q(d[i + 2])]);
    }
    const skinLike = c => { const [r, g, b] = hex(c); return r > 200 && g > 170 && b > 160; };
    faceOverlay(ch, kind).forEach(([x, y, c]) => {
      if (c === 'BROW') { if (px[y][x] && skinLike(px[y][x])) px[y][x] = '#7A6563'; return; }
      px[y][x] = c;
    });
    // 选择性描边：轮廓取相邻颜色压暗；优先取下方颜色，头顶跟随头发、脚底跟随鞋子
    const out = px.map(r => r.slice());
    const at = (x, y) => (x >= 0 && x < W && y >= 0 && y < H ? px[y][x] : null);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (px[y][x]) continue;
      const nb = at(x, y + 1) || at(x + 1, y) || at(x - 1, y) || at(x, y - 1);
      if (nb) out[y][x] = mix(shade(nb, 0.55), '#1B1416', 0.35);
    }
    return out;
  }

  function toSvgBody(cells) {
    const by = new Map();
    for (let y = 0; y < H; y++) {
      let x = 0;
      while (x < W) {
        const v = cells[y][x];
        if (!v) { x++; continue; }
        let e = x; while (e + 1 < W && cells[y][e + 1] === v) e++;
        by.set(v, (by.get(v) || '') + `M${x} ${y}h${e - x + 1}v1h${-(e - x + 1)}z`);
        x = e + 1;
      }
    }
    let s = '';
    by.forEach((d, c) => { s += `<path fill="${c}" d="${d}"/>`; });
    return s;
  }

  const CAST = [ALICE];
  const byId = Object.fromEntries(CAST.map(c => [c.id, c]));
  const cache = new Map();
  function svgFor(id, pose, face) {
    const k = `${id}/${pose}/${face}`;
    if (!cache.has(k)) cache.set(k, toSvgBody(rasterize(byId[id], pose, face)));
    return cache.get(k);
  }
  function figure(id, height = 400) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('shape-rendering', 'crispEdges');
    svg.setAttribute('width', Math.round(height * W / H));
    svg.setAttribute('height', height);
    svg.set = (pose = 'stand', face = 'smile') => { svg.innerHTML = svgFor(id, pose, face); return svg; };
    return svg.set();
  }
  window.MAPLE = { CAST, byId, figure, svgFor, W, H };
})();
