'use strict';
/*
 * 白艾莉与 OPC 朋友们的日漫 Q 版像素小人（SVG）。
 *
 * 每个角色在 48×74 的像素网格上画成日漫 Q 版：大圆脸小下巴，低而大的眼睛（睫毛翘尾、瞳仁、
 * 两颗高光、底部反光），腮红斜线，发顶天使环，小身体与圆手。外貌一律取自资料，不凭印象：
 *   - Alice：alice_fanart/refs/alice/persona.json 的 appearance 与 defaultOutfit，
 *     色值取自 refs/alice/chibi 正面 Q 版图（中分微卷长发、金色发带、星星吊坠、鼠尾草绿开衫、暖棕眼睛）；
 *   - 十三位朋友：alice_fanart/refs/alice_friends/<NN>/spec.json 的外貌色值与服装；
 *     识别色 accent 取自产品 PlayGround「OPC 群聊」的 BUILTIN_ACCENT；
 *   - 阿青、Mika：同一演示里的自建朋友与领养朋友示意位（没有头像，识别色按 hashPick 取备用色），
 *     外形是按需求新设计的「非主流黄毛」，不是正典角色。
 * 渲染成 <symbol>：身体按姿势分三种，脸（眉眼、嘴、腮红、眼镜）按表情分四种。
 */
(function () {
  const W = 48, H = 68;
  const OUTLINE = '#2A2421';

  /* ── 角色表 ───────────────────────────────────────── */
  const CAST = [
    {
      id: 'alice', name: '白艾莉', en: 'Alice', title: '你的 AI 助理', accent: '#C9A96E',
      line: '世界在往前赶，她在等你说话。',
      skin: '#F8E3D1', hair: '#1F1B1B', hairStyle: 'alice', top: '#FBF1E4', collar: 'crew',
      outer: '#A39A6E', knit: true, pants: '#D6C3A5', shoes: '#6A4630',
      extra: ['headband', 'star'],
      src: 'persona.json：黑色自然微卷长发，淡金色细发带与星星吊坠出镜必戴，两耳无饰；米白圆领针织 + 鼠尾草绿开衫 + 卡其高腰直筒裤 + 深棕乐福鞋',
    },
    {
      id: 'researcher', name: '陈知远', en: 'Ken Chen', title: '调研员', accent: '#34507E',
      line: '一个问题给你十个答案，然后说「我推荐第三个」。',
      skin: '#E9C29C', hair: '#22201F', hairStyle: 'sidepart', top: '#22304A', collar: 'shirt', collarColor: '#33456A', buttons: true,
      pants: '#1E1E22', shoes: '#2B2B2E', extra: ['watch'], prop: 'magnifier',
      src: 'spec.json：黑色短发利落侧分，深藏蓝衬衫 #22304A，黑色西裤，棕色皮表带手表',
    },
    {
      id: 'translator', name: '林晓雨', en: 'Sherry Lin', title: '翻译官', accent: '#8A6BB0',
      line: '好的翻译，读起来就像母语写的。',
      skin: '#F5DCCB', hair: '#1F1C1D', hairStyle: 'shoulder', top: '#FBF8F3', collar: 'crew',
      outer: '#C9B8DC', knit: true, skirt: '#F7F4EE', shoes: '#E9E2D6', extra: ['bracelet-silver'],
      src: 'spec.json：黑色齐肩直发，浅丁香紫针织开衫 #C9B8DC，白色百褶长裙 #F7F4EE，银色细手镯',
    },
    {
      id: 'writer', name: '方以南', en: 'Yinan', title: '作家', accent: '#7C7B3C',
      line: '交稿准时，催稿必回。',
      skin: '#EDCDB0', hair: '#2A2524', hairStyle: 'messy', top: '#6F7A4A', collar: 'shirt', collarColor: '#808B59', buttons: true,
      pants: '#4A4D52', shoes: '#3A3633', glasses: '#1E1E1E', extra: ['bag'],
      src: 'spec.json：黑色中长微卷略乱，黑色圆框眼镜，橄榄绿亚麻衬衫 #6F7A4A，深灰棉裤，米卡其斜挎布包 #B8A27A',
    },
    {
      id: 'voice', name: '苏墨', en: 'Mo', title: '配音', accent: '#3E7D5A',
      line: '耳朵特别灵，一句话哪里不自然都听得出。',
      skin: '#F3D4BE', hair: '#3A2A25', hairStyle: 'bob', top: '#1F1F24', collar: 'turtle',
      outer: '#3E5F4A', pants: '#2F4A40', wide: true, shoes: '#1E1E22', extra: ['earring'], prop: 'mic',
      src: 'spec.json：深棕短发齐刘海，黑色高领 #1F1F24，墨绿阔腿裤 #2F4A40，小银耳钉；头像定稿外搭墨绿夹克（README：以 avatar.webp 为准）',
    },
    {
      id: 'designer', name: '周念', en: 'Nina Zhou', title: '设计师', accent: '#B5653F',
      line: '好设计是看不见的设计。',
      skin: '#F6E0D2', hair: '#3B2B26', hairStyle: 'ponytail', top: '#F7F5F0', collar: 'crew',
      outer: '#8E9196', lapel: true, pants: '#1E1E22', shoes: '#1E1E22', extra: ['earring'], prop: 'coffee',
      src: 'spec.json：深棕微卷低马尾，烟灰修身西装 #8E9196，黑色直筒裤，银色几何耳环；头像里手拿咖啡',
    },
    {
      id: 'artist', name: '叶初', en: 'Chu', title: '画师', accent: '#C0607E',
      line: '能把简单描述画得比想象中好。',
      skin: '#F3D6C2', hair: '#2B2321', hairStyle: 'bun', top: '#F6F1E7', collar: 'crew',
      outer: '#7C9CB8', pants: '#D9C7A0', shoes: '#F2EEE6', blush: 0.8, extra: ['paint', 'beads'], prop: 'brush',
      src: 'spec.json：黑发齐刘海丸子头，大号水洗牛仔外套 #7C9CB8（袖口沾颜料），米白 T 恤，米黄工装裤，白帆布鞋，彩色串珠手链',
    },
    {
      id: 'analyst', name: '魏博', en: 'Bo Wei', title: '分析师', accent: '#B4463C',
      line: '一份表格扫一眼，就能看出异常值。',
      skin: '#F2D3BC', hair: '#1E1C1C', hairStyle: 'sidepart', top: '#A9AFB8', knit: true, collar: 'shirt', collarColor: '#FFFFFF',
      pants: '#2E2F33', shoes: '#1E1E22', glasses: '#B9BEC6', prop: 'chart',
      src: 'spec.json：黑色短发整齐侧分，细银框眼镜，浅蓝灰圆领针织 #A9AFB8 露白衬衫领，炭黑西裤',
    },
    {
      id: 'quant', name: '邢斐', en: 'Faye Xing', title: '量化分析师', accent: '#8B5E3C',
      line: '市场永远是对的，错的是你的模型。',
      skin: '#EBC9A9', hair: '#4A3026', hairStyle: 'long', top: '#F6F4EF', collar: 'crew',
      outer: '#5B3A2E', zip: true, pants: '#1F2A44', shoes: '#1E1E22', extra: ['necklace-silver'],
      src: 'spec.json：深棕披肩长发偏分，短款皮夹克 #5B3A2E，白 T 恤，深海军蓝西裤 #1F2A44，细银项链',
    },
    {
      id: 'novelist', name: '沈遥', en: 'Yao Shen', title: '小说家', accent: '#8E3B46',
      line: '把一句话梗概，长成一棵故事树。',
      skin: '#EBCBB0', hair: '#262221', hairStyle: 'messy', top: '#222226', collar: 'crew',
      outer: '#7A2E3A', cord: true, pants: '#5A4636', shoes: '#2E2622', glasses: '#1E1E1E', prop: 'pen',
      src: 'spec.json：黑发略长过耳略乱，黑色圆框眼镜，酒红灯芯绒外套 #7A2E3A，旧黑 T 恤，深棕宽松裤',
    },
    {
      id: 'developer', name: '张予', en: 'Yu Zhang', title: '开发', accent: '#2F8C9C',
      line: '不为炫技，用最简单直接的办法。',
      skin: '#EFCDB2', hair: '#1E1C1C', hairStyle: 'buzz', top: '#8A8D93', collar: 'hood',
      pants: '#1E1E22', shoes: '#F2F2F0', prop: 'laptop',
      src: 'spec.json：黑色短寸头，灰色连帽衫 #8A8D93，黑色运动裤，白色运动鞋，无配饰',
    },
    {
      id: 'docsmith', name: '陆析', en: 'Lu Xi', title: '文档工程师', accent: '#5E8FC2',
      line: '把零散资料整理成结构清楚的文档。',
      skin: '#F4DDCB', hair: '#202020', hairStyle: 'sidepart', top: '#A9C1DC', collar: 'shirt', collarColor: '#C3D5EA', buttons: true,
      pants: '#3C3F46', shoes: '#26272B', glasses: '#C9A96E', prop: 'doc',
      src: 'spec.json：黑色短发整齐侧分，细金属框眼镜（金色），浅蓝牛津衬衫 #A9C1DC，深灰熨烫西裤',
    },
    {
      id: 'critic', name: '顾辛', en: 'Xin Gu', title: '内容评论家', accent: '#B08445',
      line: '三秒内判断一篇文章值不值得读。',
      skin: '#F3DACA', hair: '#1C1A1B', hairStyle: 'shoulder', top: '#EFE6D4', collar: 'shirt', collarColor: '#FAF5EA', buttons: true,
      pants: '#1E1E22', wide: true, shoes: '#1E1E22', glasses: '#1E1E1E', extra: ['bracelet-gold'],
      src: 'spec.json：黑色锁骨直发，黑色细框眼镜，米白宽松衬衫 #EFE6D4，黑色阔腿西裤，细金手链',
    },
    {
      id: 'scholar', name: '谢清', en: 'Qing Xie', title: '论文阅读伴侣', accent: '#6E8F45',
      line: '结论必须分清，是验证过的还是假设。',
      skin: '#F5DDCC', hair: '#1F1C1D', hairStyle: 'ponytail-long', top: '#E8C9A8', knit: true, collar: 'crew',
      pants: '#EFE9DD', shoes: '#C9B9A2', glasses: '#C9A96E', prop: 'book',
      src: 'spec.json：黑色长直发松松扎低马尾，金属细框眼镜（金色），浅杏针织衫 #E8C9A8，米白直筒长裤；头像手拿绿封皮书',
    },
    {
      id: 'u_demo_tea', name: '阿青', en: 'A Qing', title: '茶艺师 · 自建朋友', accent: '#C8572E', custom: true,
      line: '水温控制在 80 度左右，先温杯。',
      skin: '#F1D2B8', hair: '#E9C64A', hairStyle: 'emo', top: '#F4F2EE', collar: 'crew',
      outer: '#25242A', zip: true, pants: '#3D4E6E', skinny: true, shoes: '#F2EEE6', extra: ['earring', 'chain'], prop: 'tea',
      src: 'PlayGround OPC 群聊的自建朋友示意位「阿青 · 茶艺师」（演示无头像，识别色 hashPick）；外形为新设计：漂黄长斜刘海遮一只眼，黑色拉链卫衣，紧身牛仔裤，白帆布鞋',
    },
    {
      id: 'u_demo_fit', name: 'Mika', en: 'Mika', title: '健身教练 · 领养朋友', accent: '#C08A1E', custom: true,
      line: '每天早上留半小时拉伸。',
      skin: '#E8C3A0', hair: '#F0CF52', roots: '#5A4632', hairStyle: 'spiky', top: '#FFFFFF', collar: 'crew',
      outer: '#C8473F', zip: true, stripe: '#FFFFFF', pants: '#1E1E22', shoes: '#F2F2F0', extra: ['earring'], prop: 'dumbbell',
      src: 'PlayGround OPC 群聊的领养朋友示意位「Mika · 健身教练」（演示无头像，识别色 hashPick）；外形为新设计：漂黄冲天炸毛带深色发根，红色运动外套，黑色运动裤',
    },
  ];

  /* 男生用略窄的眼型；眼睛颜色默认深棕，Alice 取 Q 版正典图里的暖棕 */
  const MALE = new Set(['researcher', 'writer', 'analyst', 'novelist', 'developer', 'docsmith', 'u_demo_tea', 'u_demo_fit']);
  CAST.forEach(c => { c.male = MALE.has(c.id); c.iris = c.iris || (c.id === 'alice' ? '#7A4E36' : '#4E3528'); });

  /* ── 颜色工具 ───────────────────────────────────────── */
  const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const toHex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, k) => { const A = hex(a), B = hex(b); return toHex(A.map((v, i) => v + (B[i] - v) * k)); };
  const shade = (c, k = 0.16) => mix(c, '#1A1410', k);
  const light = (c, k = 0.22) => mix(c, '#FFFFFF', k);
  const isBright = c => { const [r, g, b] = hex(c); return r * 0.3 + g * 0.59 + b * 0.11 > 128; };

  /* ── 网格与绘图原语 ─────────────────────────────────
   * 画布 48×74，坐标 y 从 -6 开始，给丸子头与冲天发留出头顶空间。 */
  const OY = 6, ROWS = H + OY;
  function grid() {
    const g = Array.from({ length: ROWS }, () => Array(W).fill(null));
    const tag = Array.from({ length: ROWS }, () => Array(W).fill(''));
    let cur = '';
    const G = {
      g, tag,
      as(t) { cur = t; },
      set(x, y, c) { x = Math.round(x); y = Math.round(y) + OY; if (x >= 0 && x < W && y >= 0 && y < ROWS) { g[y][x] = c; tag[y][x] = c ? cur : ''; } },
      get(x, y) { y += OY; return x >= 0 && x < W && y >= 0 && y < ROWS ? g[y][x] : null; },
      tagAt(x, y) { y += OY; return x >= 0 && x < W && y >= 0 && y < ROWS ? tag[y][x] : ''; },
      rect(x0, y0, x1, y1, c) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) G.set(x, y, c); },
      rrect(x0, y0, x1, y1, r, c) {
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
          const dx = x < x0 + r ? x0 + r - x : x > x1 - r ? x - (x1 - r) : 0;
          const dy = y < y0 + r ? y0 + r - y : y > y1 - r ? y - (y1 - r) : 0;
          if (dx * dx + dy * dy <= r * r + 0.6) G.set(x, y, c);
        }
      },
      /** 椭圆；clip(x, y) 返回 false 的像素跳过 */
      ellipse(cx, cy, rx, ry, c, clip) {
        for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
          const dx = (x - cx) / rx, dy = (y - cy) / ry;
          if (dx * dx + dy * dy <= 1 && (!clip || clip(x, y))) G.set(x, y, c);
        }
      },
      poly(pts, c) {
        const ys = pts.map(p => p[1]), xs = pts.map(p => p[0]);
        for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
          const px = x + 0.5, py = y + 0.5;
          let inside = false;
          for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
            const [xi, yi] = pts[i], [xj, yj] = pts[j];
            if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
          }
          if (inside) G.set(x, y, c);
        }
      },
      line(x0, y0, x1, y1, c) {
        const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
        for (let i = 0; i <= n; i++) G.set(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, c);
      },
    };
    return G;
  }
  const mirror = pts => pts.map(([x, y]) => [W - x, y]);
  const both = (G, pts, c) => { G.poly(pts, c); G.poly(mirror(pts), c); };

  /* ── 骨架：日漫 Q 版 ─────────────────────────────
   * 圆脸 x11–36、y9–39，眼睛低而大；身体 y42–54；腿 y55–66。 */
  const torsoL = y => Math.round(18 - (y - 42) * 2 / 12);
  const torsoR = y => W - 1 - torsoL(y);
  /** 头部水平收窄系数：头发坐标按画布中线向内收，脸更小、眼睛占比更大 */
  const HEAD_K = 0.88;
  const hx = x => 23.5 + (x - 23.5) * HEAD_K;
  function squeeze(G) {
    const P = Object.create(G);
    P.set = (x, y, c) => G.set(hx(x), y, c);
    P.rect = (x0, y0, x1, y1, c) => G.rect(Math.round(hx(x0)), y0, Math.round(hx(x1)), y1, c);
    P.rrect = (x0, y0, x1, y1, r, c) => G.rrect(Math.round(hx(x0)), y0, Math.round(hx(x1)), y1, r, c);
    P.ellipse = (cx, cy, rx, ry, c, clip) => G.ellipse(hx(cx), cy, rx * HEAD_K, ry, c, clip);
    P.poly = (pts, c) => G.poly(pts.map(([x, y]) => [hx(x), y]), c);
    P.line = (x0, y0, x1, y1, c) => G.line(hx(x0), y0, hx(x1), y1, c);
    return P;
  }
  /** 后层头发压暗一档，和前层刘海拉开层次 */
  const backHair = c => shade(c, isBright(c) ? 0.18 : 0.1);

  /* ── 头发：背后的一层（画在脸和身体之前） ───────────── */
  function hairBack(G0, ch) {
    const G = squeeze(G0);
    const c = backHair(ch.hair), s = ch.hairStyle;
    G.as('hair');
    if (s === 'buzz' || s === 'spiky') return;
    const small = s === 'sidepart' || s === 'messy';
    G.ellipse(23.5, 19, small ? 16.6 : 18, small ? 14.5 : 16, c);
    if (s === 'alice') for (let y = 22; y <= 56; y++) {
      const w = Math.round(Math.sin(y / 2.5) * 1.4), taper = y > 52 ? (y - 52) * 2 : 0;
      G.rect(4 + w + taper, y, W - 5 - w - taper, y, c);
    }
    if (s === 'long') for (let y = 22; y <= 53; y++) { const t = y > 50 ? (y - 50) * 2 : 0; G.rect(6 + t, y, W - 7 - t, y, c); }
    if (s === 'shoulder') G.rect(6, 22, W - 7, 44, c);
    if (s === 'bob') G.rect(6, 22, W - 7, 37, c);
    if (s === 'emo' || s === 'messy') G.rect(7, 22, W - 8, 36, c);
    if (s === 'ponytail') G.ellipse(40.5, 38, 3.6, 10, c);
    if (s === 'ponytail-long') G.ellipse(40.5, 44, 3.6, 15, c);
  }

  /** 天使环：发顶一道断续的弧形高光，日漫头发的标志 */
  function hairShine(G, ch) {
    const hl = isBright(ch.hair) ? light(ch.hair, 0.6) : mix(ch.hair, '#A7AECF', 0.5);
    for (let y = 0; y < 16; y++) for (let x = 6; x < 42; x++) {
      const d = ((x - 23.5) / (13.5 * HEAD_K)) ** 2 + ((y - 13) / 8.5) ** 2;
      const gap = Math.abs(x - 23.5) < 1.5 || (x > 30 && x < 33);
      if (d > 0.82 && d < 1 && y < 11 && !gap && G.tagAt(x, y) === 'hair') G.set(x, y, hl);
    }
  }

  /* ── 头发：脸前面的一层（刘海、鬓发） ─────────────── */
  function hairFront(G0, ch) {
    const G = squeeze(G0);
    const c = ch.hair, s = ch.hairStyle, dk = shade(c, 0.3);
    G.as('hair');
    const cap = () => G.ellipse(23.5, 16.5, 16.6, 13.8, c, (x, y) => y <= 14);
    const locks = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) { const t = y > y1 - 2 ? 1 : 0; G.rect(x0 + t, y, x1, y, c); G.rect(W - 1 - x1, y, W - 1 - x0 - t, y, c); } };
    if (s === 'buzz') {
      G.ellipse(23.5, 16, 15.6, 12, c, (x, y) => y <= 15);
      for (let y = 6; y <= 14; y += 2) for (let x = 12 + (y % 4 ? 1 : 0); x <= 35; x += 3) G.set(x, y, light(c, 0.15));
      G.rect(9, 13, 10, 21, c); G.rect(37, 13, 38, 21, c);
      hairShine(G0, ch); return;
    }
    if (s === 'spiky') {
      G.ellipse(23.5, 16, 16.5, 12, c, (x, y) => y <= 15);
      G.poly([[7, 16], [2, 2], [11, 7], [10, -5], [18, 4], [23.5, -6], [29, 4], [37, -5], [36, 7], [45, 2], [40, 16]], c);
      G.rect(11, 15, 36, 15, ch.roots);
      G.poly([[9, 14], [38, 14], [35.5, 21], [31, 16.5], [26.5, 21.5], [21, 16.5], [16.5, 21.5], [12.5, 16.5], [9, 21]], c);
      G.rect(8, 15, 10, 25, c); G.rect(37, 15, 39, 25, c);
      G.line(10, -3, 13, 8, light(c, 0.45)); G.line(23, -4, 23, 6, light(c, 0.45)); G.line(36, -3, 33, 8, light(c, 0.45));
      return;
    }
    cap();
    if (s === 'alice') {
      // 中分：两侧刘海从发缝弯到太阳穴，中间露出一点额头；两缕微卷鬓发垂到胸前
      G.line(23.5, 2, 23.5, 10, dk);
      both(G, [[24.3, 3], [24.3, 11], [23.8, 16], [22.2, 19.5], [20.5, 20.5], [17.5, 21.5], [15, 26], [13.4, 23.5], [11.6, 29], [9.2, 26], [7.5, 13], [13, 4]], c);
      both(G, [[22.6, 10], [21, 21], [19.4, 17.5]], c);
      both(G, [[19.6, 10], [16.8, 23], [16, 17.5]], c);
      for (let y = 20; y <= 54; y++) {
        const w = Math.round(Math.sin(y / 2.5) * 1.4), taper = y > 49 ? (y - 49) : 0;
        G.rect(5 + w + taper, y, 10 + w, y, c); G.rect(W - 11 - w, y, W - 6 - w - taper, y, c);
      }
      G.line(8, 27, 8, 48, dk); G.line(39, 27, 39, 48, dk);
      G.line(16, 6, 12, 20, dk); G.line(31, 6, 35, 20, dk);
    }
    if (s === 'long' || s === 'shoulder' || s === 'ponytail' || s === 'ponytail-long') {
      // 偏分斜刘海
      G.poly([[7.5, 10], [39.5, 10], [39, 16], [34.5, 17.5], [29, 19.5], [23.5, 21.5], [19, 23.5], [15.5, 27], [13.5, 24], [10.5, 28], [8, 22]], c);
      G.line(17, 3, 14, 11, dk); G.line(29, 11, 21, 21, dk);
      locks(6, 10, 18, s === 'long' ? 50 : s === 'shoulder' ? 43 : 32);
    }
    if (s === 'bob' || s === 'bun') {
      // 齐刘海
      G.rect(8, 10, 39, 19, c);
      for (let x = 9; x <= 38; x += 3) G.set(x, 20, c);
      G.line(16, 11, 15, 19, dk); G.line(23.5, 11, 23.5, 19, dk); G.line(31, 11, 32, 19, dk);
      if (s === 'bob') locks(7, 10, 20, 36);
      else { G.ellipse(23.5, 0, 6.5, 4.5, c); G.line(20, -3, 22, 2, dk); G.line(9, 20, 9, 31, c); G.line(38, 20, 38, 31, c); }
    }
    if (s === 'sidepart' || s === 'messy') {
      // 男生短发：尖尖的碎刘海
      G.poly([[7.5, 9], [39.5, 9], [39, 18], [35.5, 16], [31.5, 20], [27.5, 16.5], [23.5, 21], [19.5, 16.5], [15.5, 20.5], [11.5, 16], [8.5, 19]], c);
      G.line(16, 3, 14, 10, dk);
      locks(8, 10, 16, s === 'messy' ? 33 : 24);
      if (s === 'messy') { G.poly([[15, 4], [16.5, 0], [21, 3.5]], c); G.poly([[27, 3.5], [31, 0.5], [32.5, 5]], c); }
    }
    if (s === 'emo') {
      // 非主流长斜刘海：从右上扫下来盖住左眼，发梢一缕缕参差
      G.poly([[41, 10], [40.5, 18], [35, 19], [29.5, 22], [25, 28], [23, 35], [21, 31], [18.5, 36], [16, 31], [13, 34], [9.5, 30], [7.5, 13]], c);
      G.poly([[9, 8], [3, 6], [12, 4]], c); G.poly([[34, 4], [44, 5], [39, 9]], c); G.poly([[18, 3.5], [24, 0], [29, 3.5]], c);
      for (let y = 18; y <= 37; y++) { const j = y > 33 ? y % 2 : 0; G.rect(6 + j, y, 10, y, c); G.rect(W - 11, y, W - 7 - j, y, c); }
      G.line(35, 10, 24, 28, shade(c, 0.2)); G.line(29, 11, 19, 31, shade(c, 0.2)); G.line(22, 11, 13, 29, shade(c, 0.2));
      G.line(37, 9, 29, 18, light(c, 0.45));
    }
    hairShine(G0, ch);
  }

  /* ── 手臂与手 ───────────────────────────────────── */
  function armDown(G, side, ch, sleeve) {
    G.as('arm');
    let cx = 0;
    for (let y = 43; y <= 52; y++) {
      const r = torsoL(y) - 2, l = r - 3 - (y > 47 ? 1 : 0);
      const c = y >= 51 ? shade(sleeve, 0.1) : sleeve;
      if (side < 0) G.rect(l, y, r, y, c); else G.rect(W - 1 - r, y, W - 1 - l, y, c);
      if (ch.stripe && y < 50) G.set(side < 0 ? l : W - 1 - l, y, ch.stripe);
      cx = (l + r) / 2;
    }
    G.as('hand');
    G.ellipse(side < 0 ? cx : W - 1 - cx, 54.5, 2.4, 2.2, ch.skin);
  }
  function armUp(G, side, ch, sleeve) {
    G.as('arm');
    let cx = 0;
    for (let y = 33; y <= 45; y++) {
      const l = 29 + Math.round((45 - y) * 1.0), r = l + 3;
      const c = y <= 34 ? shade(sleeve, 0.1) : sleeve;
      if (side > 0) G.rect(l, y, r, y, c); else G.rect(W - 1 - r, y, W - 1 - l, y, c);
      if (ch.stripe && y > 36) G.set(side > 0 ? r : W - 1 - r, y, ch.stripe);
      if (y === 33) cx = (l + r) / 2;
    }
    G.as('hand');
    G.ellipse(side > 0 ? cx : W - 1 - cx, 30.6, 2.4, 2.4, ch.skin);
  }

  /* ── 身体 ─────────────────────────────────────────── */
  function body(ch, pose) {
    const G = grid();
    const skin = ch.skin, skinSh = shade(skin, 0.12);
    const upL = pose === 'cheer', upR = pose === 'cheer' || pose === 'wave';
    const sleeve = ch.outer || ch.top;
    hairBack(G, ch);

    // 躯干
    G.as('torso');
    for (let y = 42; y <= 54; y++) for (let x = torsoL(y); x <= torsoR(y); x++) {
      const center = x >= 20 && x <= 27;
      let c = ch.outer && !center ? ch.outer : ch.top;
      if (ch.outer && !center && ch.cord && x % 2 === 0) c = shade(ch.outer, 0.1);
      if (ch.outer && !center && ch.knit && (x + Math.floor(y / 2)) % 4 === 0) c = shade(ch.outer, 0.07);
      if (!ch.outer && ch.knit && (x + Math.floor(y / 2)) % 4 === 0 && y > 45) c = shade(ch.top, 0.05);
      G.set(x, y, c);
    }
    if (ch.outer) {
      for (let y = 42; y <= 54; y++) { G.set(19, y, shade(ch.outer, 0.25)); G.set(28, y, shade(ch.outer, 0.25)); }
      if (ch.lapel) { G.poly([[19, 42], [22, 42], [20, 48]], light(ch.outer, 0.12)); G.poly([[25, 42], [28, 42], [27, 48]], light(ch.outer, 0.12)); }
      if (ch.zip) { G.rect(19, 42, 19, 54, '#B9BEC6'); G.rect(28, 42, 28, 54, '#B9BEC6'); }
      if (ch.stripe) { G.rect(torsoL(49), 49, 18, 50, ch.stripe); G.rect(29, 49, torsoR(49), 50, ch.stripe); }
    }
    G.rect(torsoL(54), 53, torsoR(54), 54, shade(ch.outer || ch.top, 0.1));
    if (ch.collar === 'crew') G.rect(20, 42, 27, 42, shade(ch.top, 0.12));
    if (ch.collar === 'turtle') { G.rect(20, 39, 27, 42, ch.top); G.rect(20, 41, 27, 41, light(ch.top, 0.12)); }
    if (ch.collar === 'shirt') {
      const cc = ch.collarColor;
      G.poly([[17, 42], [23, 42], [21, 46]], cc); G.poly([[24, 42], [31, 42], [26, 46]], cc);
      G.rect(22, 42, 25, 42, skinSh);
      if (ch.buttons) [48, 52].forEach(y => G.rect(23, y, 24, y, shade(ch.top, 0.28)));
    }
    if (ch.collar === 'hood') {
      G.rrect(15, 39, 32, 44, 3, shade(ch.top, 0.12)); G.rect(20, 40, 27, 42, skinSh);
      G.rect(21, 44, 21, 49, '#ECECE8'); G.rect(26, 44, 26, 49, '#ECECE8');
      G.rrect(18, 49, 29, 53, 2, shade(ch.top, 0.1));
    }

    if (!upL) armDown(G, -1, ch, sleeve);
    if (!upR) armDown(G, 1, ch, sleeve);

    // 下装
    G.as('legs');
    if (ch.skirt) {
      const k = ch.skirt;
      for (let y = 55; y <= 62; y++) {
        const spread = Math.floor((y - 55) / 3), a = 15 - spread, b = 32 + spread;
        for (let x = a; x <= b; x++) G.set(x, y, (x - a) % 4 === 3 ? shade(k, 0.1) : k);
      }
      G.rect(18, 63, 21, 63, skin); G.rect(26, 63, 29, 63, skin);
      G.rrect(17, 64, 22, 66, 1, ch.shoes); G.rrect(25, 64, 30, 66, 1, ch.shoes);
    } else {
      const p = ch.pants;
      G.rect(16, 55, 31, 57, p); G.rect(16, 55, 31, 55, shade(p, 0.16));
      const la = ch.wide ? 15 : ch.skinny ? 18 : 17, rb = W - 1 - la;
      for (let y = 58; y <= 63; y++) { const f = ch.wide && y > 60 ? 1 : 0; G.rect(la - f, y, 22, y, p); G.rect(25, y, rb + f, y, p); }
      G.rect(23, 58, 24, 63, null);
      const sa = ch.wide ? 14 : la - 1;
      G.rrect(sa, 63, 22, 66, 1, ch.shoes); G.rrect(25, 63, W - 1 - sa, 66, 1, ch.shoes);
      if (isBright(ch.shoes)) { G.rect(sa, 66, 22, 66, '#C9C4BA'); G.rect(25, 66, W - 1 - sa, 66, '#C9C4BA'); }
      else { G.rect(sa + 1, 63, 21, 63, light(ch.shoes, 0.2)); G.rect(26, 63, W - 2 - sa, 63, light(ch.shoes, 0.2)); }
    }

    // 配饰
    G.as('acc');
    const ex = ch.extra || [];
    const wrist = (c, multi) => { const r = torsoL(51) - 2, l = r - 4; for (let x = l; x <= r; x++) G.set(x, 51, multi ? multi[x % multi.length] : c); };
    if (!upL && ex.includes('watch')) { wrist('#7A5233'); G.rect(torsoL(51) - 5, 50, torsoL(51) - 3, 52, '#D9DDE2'); }
    if (!upL && ex.includes('bracelet-silver')) wrist('#DDE1E6');
    if (!upL && ex.includes('bracelet-gold')) wrist('#D6B46E');
    if (!upL && ex.includes('beads')) wrist(null, ['#D9675B', '#E8B84A', '#7FAE8C']);
    if (ex.includes('paint')) { G.set(16, 52, '#D9675B'); G.set(30, 46, '#E8B84A'); G.set(31, 51, '#7FAE8C'); }
    if (ex.includes('chain')) { G.line(17, 56, 21, 59, '#C9CDD3'); G.line(21, 59, 23, 56, '#C9CDD3'); }
    if (ex.includes('necklace-silver')) { G.line(20, 43, 23, 46, '#DDE1E6'); G.line(27, 43, 24, 46, '#DDE1E6'); }
    if (ex.includes('star')) {
      const gd = '#D2AE62', gl = '#F1D590';
      G.line(20, 43, 23, 47, gd); G.line(27, 43, 24, 47, gd);
      const st = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 1.4 : 3.3; st.push([24 + Math.cos(a) * r, 50.2 + Math.sin(a) * r]); }
      G.poly(st, gd); G.set(23, 49, gl); G.set(24, 49, gl);
    }
    if (ex.includes('bag')) {
      G.line(30, 43, 17, 54, '#B8A27A'); G.line(31, 43, 18, 54, '#A8925F');
      G.rrect(9, 53, 17, 60, 1, '#B8A27A'); G.rect(9, 53, 17, 55, shade('#B8A27A', 0.14));
    }

    // 脸：大圆脸、小下巴
    G.as('skin');
    if (ch.male || ['buzz', 'spiky', 'sidepart', 'messy'].includes(ch.hairStyle)) { G.ellipse(10.4, 27.5, 1.8, 2.8, skin); G.ellipse(36.6, 27.5, 1.8, 2.8, skin); }
    G.rrect(11, 9, 36, 32, 10, skin);
    G.poly([[11.4, 27], [36.6, 27], [34, 34], [29.5, 37.8], [26.3, 39.4], [21.7, 39.4], [18.5, 37.8], [14, 34]], skin);
    G.rect(21, 39, 26, 41, skinSh);
    if (ex.includes('earring')) { G.rect(10, 30, 10, 31, '#E2E5EA'); G.rect(37, 30, 37, 31, '#E2E5EA'); }

    hairFront(G, ch);
    if (ex.includes('headband')) {
      // 淡金色细发带：贴着头型的一道弧，压在头发上面，出镜必戴
      G.as('acc');
      for (let x = 8; x <= 39; x++) {
        const t = (x - 23.5) / 15, y = Math.round(4.6 + t * t * 9.5);
        G.set(x, y, '#C9A96E'); G.set(x, y + 1, '#C9A96E'); G.set(x, y + 2, '#A98B50');
        if (x >= 13 && x <= 21) G.set(x, y, '#EED9A6');
      }
    }
    if (upL) armUp(G, -1, ch, sleeve);
    if (upR) armUp(G, 1, ch, sleeve);
    if (!upR) prop(G, ch.prop);
    return G;
  }

  /** 右手拿的标志物：都来自头像定稿里出现的东西，或职业本身 */
  function prop(G, p) {
    if (!p) return;
    G.as('prop');
    const dk = '#33302C', o = 36;
    if (p === 'coffee') { G.rrect(o, 46, o + 5, 54, 1, '#FBF8F2'); G.rect(o, 48, o + 5, 51, '#B07A4E'); G.rect(o - 1, 44, o + 6, 45, '#3A2C24'); }
    if (p === 'book') { G.rect(o - 1, 45, o + 7, 56, '#5E7D45'); G.rect(o, 46, o + 5, 55, '#6E8F55'); G.rect(o + 7, 46, o + 7, 56, '#F4EEDC'); G.rect(o + 1, 48, o + 4, 49, '#C9D8B5'); }
    if (p === 'mic') { G.rrect(o + 1, 47, o + 2, 57, 1, dk); G.ellipse(o + 1.5, 43.5, 3, 3, '#B9BEC6'); for (let y = 42; y <= 45; y += 2) for (let x = o; x <= o + 3; x += 2) G.set(x, y, '#8E939B'); }
    if (p === 'brush') { G.rect(o + 2, 40, o + 2, 57, '#8B6A4A'); G.rect(o + 2, 38, o + 2, 39, '#C9CDD3'); G.poly([[o + 0.5, 38], [o + 4.5, 38], [o + 2.5, 33]], '#D9675B'); }
    if (p === 'pen') { G.rect(o + 2, 44, o + 2, 57, dk); G.rect(o + 2, 42, o + 2, 43, '#C9A96E'); }
    if (p === 'magnifier') { G.line(o + 2, 48, o + 5, 57, '#7A5233'); G.ellipse(o + 1, 43.5, 4.4, 4.4, '#B9BEC6'); G.ellipse(o + 1, 43.5, 3, 3, '#DCEBF5'); G.set(o, 42, '#FFFFFF'); }
    if (p === 'chart') { G.rect(o - 3, 43, o + 8, 56, '#FFFFFF'); [[o - 1, 53], [o + 1, 51], [o + 3, 52], [o + 5, 48], [o + 6, 46]].reduce((a, b) => { G.line(a[0], a[1], b[0], b[1], '#B4463C'); return b; }); G.rect(o - 1, 45, o + 2, 45, '#C9CDD3'); }
    if (p === 'laptop') { G.rect(o - 5, 45, o + 8, 54, '#C9CDD3'); G.rect(o - 4, 46, o + 7, 53, '#2F8C9C'); G.rect(o - 2, 48, o + 3, 48, '#9FE0E8'); G.rect(o - 2, 50, o + 5, 50, '#9FE0E8'); G.rect(o - 7, 55, o + 10, 56, '#B0B4BA'); }
    if (p === 'doc') { G.rect(o - 2, 42, o + 7, 56, '#FFFFFF'); G.rect(o, 44, o + 3, 45, '#5E8FC2'); [48, 51, 54].forEach(y => G.rect(o, y, o + 5, y, '#9DB3CC')); }
    if (p === 'tea') { G.rrect(o - 1, 49, o + 5, 53, 2, '#9FC2A8'); G.rect(o, 50, o + 4, 50, '#C9E0CF'); G.rect(o - 3, 54, o + 7, 55, '#E8E2D4'); G.set(o + 1, 46, '#D6D2C8'); G.set(o + 2, 45, '#D6D2C8'); G.set(o + 3, 47, '#D6D2C8'); }
    if (p === 'dumbbell') { G.rect(o - 3, 53, o + 7, 54, '#55585E'); G.rrect(o - 5, 49, o - 2, 58, 1, '#2A2C30'); G.rrect(o + 6, 49, o + 9, 58, 1, '#2A2C30'); }
  }

  /* ── 描边与明暗 ─────────────────────────────────────
   * 冒险岛式选择性描边：轮廓取相邻颜色压暗，皮肤是暖棕、头发是深发色，不用统一黑边。 */
  const lineOf = c => mix(shade(c, 0.58), OUTLINE, 0.3);
  function finish(G) {
    const src = G.g, out = src.map(r => r.slice());
    const edge = src.map(r => r.map(() => false));
    const at = (x, y) => (x >= 0 && x < W && y >= 0 && y < ROWS ? src[y][x] : null);
    // 优先取下方、两侧、上方的颜色：头顶的边跟随头发，脚底的边跟随鞋子
    const order = [[0, -1], [1, 0], [-1, 0], [0, 1]];
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < W; x++) {
      if (src[y][x] !== null) continue;
      const hit = order.find(([dx, dy]) => at(x + dx, y + dy) !== null);
      if (hit) { out[y][x] = lineOf(at(x + hit[0], y + hit[1])); edge[y][x] = true; }
    }
    const res = out.map(r => r.slice());
    const empty = (x, y) => x < 0 || x >= W || out[y][x] === null || edge[y][x];
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < W; x++) {
      const v = out[y][x];
      if (empty(x, y)) continue;
      let c = v;
      if (empty(x + 1, y)) c = shade(v, 0.14); else if (empty(x + 2, y)) c = shade(v, 0.06); else if (empty(x - 1, y)) c = light(v, 0.14);
      const t = G.tag[y][x];
      if (t === 'skin' && y > 0 && G.tag[y - 1][x] === 'hair') c = mix(shade(c, 0.1), '#E8A7A0', 0.12);
      if (t === 'hair' && y + 1 < ROWS && G.tag[y + 1][x] === 'skin') c = shade(c, 0.12);
      res[y][x] = c;
    }
    return res;
  }

  /** 同色像素合并成一条 path */
  function toPaths(cells) {
    const by = new Map();
    for (let y = 0; y < cells.length; y++) {
      let x = 0;
      while (x < W) {
        const v = cells[y][x];
        if (!v) { x++; continue; }
        let e = x; while (e + 1 < W && cells[y][e + 1] === v) e++;
        const c = v;
        by.set(c, (by.get(c) || '') + `M${x} ${y - OY}h${e - x + 1}v1h${-(e - x + 1)}z`);
        x = e + 1;
      }
    }
    let s = '';
    by.forEach((d, c) => { s += `<path fill="${c}" d="${d}"/>`; });
    return s;
  }

  /* ── 脸：日漫大眼、眉、嘴、腮红、眼镜 ─────────────
   * 坐标对左眼给出（第 0 列是外眼角），右眼按画布中线镜像。
   * K 睫毛、D 瞳孔外圈、P 瞳仁、I 虹膜、L 下半亮色、G 底部反光、W 大高光、w 小高光、k 下睫毛 */
  const EYE_F = ['..KKKKK..', 'KKKKKKKKK', '.KDDDDDKK', '.DWWDDDD.', '.DWWWPDD.', '.DWWPPPD.', '.DIPPPID.', '.IIIIIII.', '.IILLLwI.', '.ILLLLLI.', '..GGGGG..', '...kkk...'];
  const EYE_M = ['.KKKKKK.', '.KDDDDK.', '.DWWDDD.', '.DWPPDD.', '.IIPPII.', '.ILLLwI.', '..GGGG..'];
  const MOUTH = '#8A4A44', TONGUE = '#E9868A';
  const px = (list, c, op) => list.map(([x, y]) => `<rect x="${x}" y="${y}" width="1" height="1" fill="${c}"${op !== undefined ? ` opacity="${op}"` : ''}/>`).join('');
  const box = (x0, y0, x1, y1) => { const a = []; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) a.push([x, y]); return a; };
  const mx = list => list.map(([x, y]) => [W - 1 - x, y]);
  function eyeCells(ch) {
    const rows = ch.male ? EYE_M : EYE_F, y0 = ch.male ? 22 : 19, x0 = ch.male ? 13 : 12, cells = {};
    const pal = { K: mix(shade(ch.iris, 0.7), '#2A1F1F', 0.5), D: shade(ch.iris, 0.42), P: shade(ch.iris, 0.62), I: ch.iris, L: light(ch.iris, 0.32), G: mix(light(ch.iris, 0.4), '#F3C77E', 0.45), W: '#FFFFFF', w: '#FFFFFF', k: mix(ch.iris, '#E59A9E', 0.45) };
    rows.forEach((r, j) => [...r].forEach((k, i) => { if (k !== '.') (cells[pal[k]] = cells[pal[k]] || []).push([x0 + i, y0 + j]); }));
    if (!ch.male) (cells[pal.K] = cells[pal.K]).push([11, 19], [10, 18]);
    return cells;
  }
  function faceSvg(ch, kind) {
    const hideL = ch.hairStyle === 'emo';
    const noBrow = ['bob', 'bun', 'emo'].includes(ch.hairStyle);
    const pair = list => { const l = list.map(([x, y]) => [x + 1, y]); return hideL ? mx(l) : l.concat(mx(l)); };
    let s = '';
    if (!noBrow) s += px(pair(ch.male ? [[13, 19], [14, 18], [15, 18], [16, 18], [17, 18], [18, 18], [19, 19]] : [[14, 17], [15, 16], [16, 16], [17, 16], [18, 17]]), ch.male ? shade(ch.hair, 0.2) : mix(ch.hair, ch.skin, 0.3), ch.male ? undefined : 0.85);
    if (kind === 'smile' || kind === 'sing') Object.entries(eyeCells(ch)).forEach(([c, list]) => { s += px(pair(list), c); });
    if (kind === 'happy') s += px(pair([[12, 27], [13, 26], [14, 25], [15, 24], [16, 24], [17, 24], [18, 25], [19, 26], [20, 27], [13, 27], [19, 27]]), '#2A1F1F');
    if (kind === 'blink') s += px(pair([[11, 25], [12, 26], [13, 27], [14, 27], [15, 27], [16, 27], [17, 27], [18, 27], [19, 27], [20, 26]]), '#2A1F1F');
    if (kind === 'sing') s += px(box(22, 33, 25, 35), MOUTH) + px(box(23, 35, 24, 35), TONGUE);
    else if (kind === 'happy') s += px([[22, 33], [25, 33]].concat(box(22, 34, 25, 34), box(23, 35, 24, 35)), MOUTH) + px([[23, 34], [24, 34]], TONGUE);
    else s += px([[22, 34], [25, 34], [23, 35], [24, 35]], MOUTH);
    // 腮红：冒险岛式柔和粉团，中心深、边缘浅
    const bl = ch.blush ?? 0.55;
    const cheek = (x0, y0) => box(x0, y0, x0 + 4, y0 + 1).concat([[x0 + 1, y0 + 2], [x0 + 2, y0 + 2], [x0 + 3, y0 + 2], [x0 + 1, y0 - 1], [x0 + 2, y0 - 1], [x0 + 3, y0 - 1]]);
    s += px(cheek(12, 31).concat(cheek(31, 31)), '#F4A3A6', bl * 0.42);
    s += px(box(13, 31, 15, 32).concat(box(32, 31, 34, 32)), '#EE8E95', bl * 0.4);
    if (ch.glasses) {
      const fr = [];
      [[12, 22], [25, 35]].forEach(([a, b]) => {
        for (let x = a + 1; x <= b - 1; x++) fr.push([x, 19], [x, 31]);
        for (let y = 20; y <= 30; y++) fr.push([a, y], [b, y]);
      });
      fr.push([23, 23], [24, 23]);
      s += px(box(13, 20, 21, 30).concat(box(26, 20, 34, 30)), '#FFFFFF', 0.14) + px(fr, ch.glasses);
    }
    return s;
  }

  /* ── 输出 ─────────────────────────────────────────── */
  const VB = `0 ${-OY} ${W} ${H + OY}`;
  const POSES = ['stand', 'wave', 'cheer'], FACES = ['smile', 'happy', 'blink', 'sing'];
  function buildSprite() {
    let defs = '';
    CAST.forEach(ch => {
      POSES.forEach(p => { defs += `<symbol id="mf-${ch.id}-${p}" viewBox="${VB}">${toPaths(finish(body(ch, p)))}</symbol>`; });
      FACES.forEach(f => { defs += `<symbol id="mf-${ch.id}-face-${f}" viewBox="${VB}">${faceSvg(ch, f)}</symbol>`; });
    });
    const holder = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    holder.setAttribute('aria-hidden', 'true');
    holder.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    holder.innerHTML = defs;
    document.body.prepend(holder);
  }

  /** 生成一个小人实例；返回的元素带 set(pose, face) 用于逐帧切换 */
  function figure(id, height = 370) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', VB);
    svg.setAttribute('shape-rendering', 'crispEdges');
    svg.setAttribute('width', String(Math.round(height * W / (H + OY))));
    svg.setAttribute('height', String(height));
    svg.style.overflow = 'visible';
    const b = document.createElementNS(ns, 'use'), f = document.createElementNS(ns, 'use');
    [b, f].forEach(u => { u.setAttribute('x', '0'); u.setAttribute('y', String(-OY)); u.setAttribute('width', String(W)); u.setAttribute('height', String(H + OY)); });
    svg.append(b, f);
    let last = '';
    svg.set = (pose = 'stand', face = 'smile') => {
      const k = pose + face;
      if (k !== last) { last = k; b.setAttribute('href', `#mf-${id}-${pose}`); f.setAttribute('href', `#mf-${id}-face-${face}`); }
      return svg;
    };
    svg.set();
    return svg;
  }

  window.MINIFIG = { CAST, byId: Object.fromEntries(CAST.map(c => [c.id, c])), buildSprite, figure, W, H: H + OY };
})();
