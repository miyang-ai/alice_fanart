'use strict';
/*
 * 白艾莉与 OPC 朋友们的乐高像素小人（SVG）。
 *
 * 每个角色在 48×76 的像素网格上按「乐高人仔」结构拼出：头顶凸点、圆柱头、梯形躯干、
 * 独立的手臂与 C 形手、胯部和两条腿。外貌一律取自资料，不凭印象：
 *   - Alice：alice_fanart/refs/alice/persona.json 的 appearance 与 defaultOutfit，
 *     色值取自 refs/alice/chibi 正面 Q 版图（中分微卷长发、金色发箍、星星吊坠、鼠尾草绿开衫）；
 *   - 十三位朋友：alice_fanart/refs/alice_friends/<NN>/spec.json 的外貌色值与服装；
 *     识别色 accent 取自产品 PlayGround「OPC 群聊」的 BUILTIN_ACCENT；
 *   - 阿青、Mika：同一演示里的自建朋友与领养朋友示意位（没有头像，识别色按 hashPick 取备用色），
 *     外形是按需求新设计的「非主流黄毛」，不是正典角色。
 * 渲染成 <symbol>：身体按姿势分三种，脸（眉眼、嘴、腮红、眼镜）按表情分四种。
 */
(function () {
  const W = 48, H = 76;
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

  /* ── 颜色工具 ───────────────────────────────────────── */
  const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const toHex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, k) => { const A = hex(a), B = hex(b); return toHex(A.map((v, i) => v + (B[i] - v) * k)); };
  const shade = (c, k = 0.16) => mix(c, '#1A1410', k);
  const light = (c, k = 0.22) => mix(c, '#FFFFFF', k);

  /* ── 网格与绘图原语 ───────────────────────────────── */
  function grid() {
    const g = Array.from({ length: H }, () => Array(W).fill(null));
    const tag = Array.from({ length: H }, () => Array(W).fill(''));
    let cur = '';
    const G = {
      g, tag,
      as(t) { cur = t; return G; },
      set(x, y, c) { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < W && y >= 0 && y < H) { g[y][x] = c; tag[y][x] = c ? cur : ''; } },
      get(x, y) { return x >= 0 && x < W && y >= 0 && y < H ? g[y][x] : null; },
      rect(x0, y0, x1, y1, c) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) G.set(x, y, c); },
      /** 圆角矩形，r 为圆角半径 */
      rrect(x0, y0, x1, y1, r, c) {
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
          const dx = x < x0 + r ? x0 + r - x : x > x1 - r ? x - (x1 - r) : 0;
          const dy = y < y0 + r ? y0 + r - y : y > y1 - r ? y - (y1 - r) : 0;
          if (dx * dx + dy * dy <= r * r + 0.6) G.set(x, y, c);
        }
      },
      ellipse(cx, cy, rx, ry, c) {
        for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
          const dx = (x + 0.5 - cx - 0.5) / rx, dy = (y + 0.5 - cy - 0.5) / ry;
          if (dx * dx + dy * dy <= 1) G.set(x, y, c);
        }
      },
      /** 多边形：按像素中心做点在多边形内判定 */
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

  /* ── 骨架尺寸 ───────────────────────────────────── */
  const torsoL = y => Math.round(16 - (y - 34) * 3 / 20);
  const torsoR = y => W - 1 - torsoL(y);

  /* ── 头发 ─────────────────────────────────────────── */
  function hairBack(G, ch) {
    const c = ch.hair, s = ch.hairStyle;
    G.as('hair');
    if (s === 'alice') for (let y = 14; y <= 52; y++) { const w = Math.round(Math.sin(y / 2.6) * 1.3); G.rect(8 + w, y, W - 9 - w, y, c); }
    if (s === 'long') for (let y = 14; y <= 48; y++) G.rect(9, y, W - 10, y, c);
    if (s === 'shoulder') G.rect(10, 14, W - 11, 38, c);
    if (s === 'ponytail') { G.ellipse(36, 34, 3.4, 9, c); }
    if (s === 'ponytail-long') { G.ellipse(36, 40, 3.2, 14, c); G.rect(35, 30, 37, 31, shade(c, 0.3)); }
    if (s === 'emo') for (let y = 14; y <= 34; y++) G.rect(10, y, W - 11, y, c);
  }

  function hairShine(G, ch, cx = 19, cy = 9) {
    const [r, g, b] = hex(ch.hair), bright = (r * 0.3 + g * 0.59 + b * 0.11) > 128;
    const hl = light(ch.hair, bright ? 0.55 : 0.2);
    // 乐高塑料发片的一道弧形反光：只取椭圆环上的一段
    for (let y = 2; y < 14; y++) for (let x = 10; x < 26; x++) {
      const d = ((x - cx) / 7) ** 2 + ((y - cy) / 5) ** 2;
      if (d > 0.72 && d < 1 && x < cx + 2 && y < cy && G.tag[y][x] === 'hair') G.set(x, y, hl);
    }
  }

  function hairFront(G, ch) {
    const c = ch.hair, s = ch.hairStyle, dk = shade(c, 0.28);
    G.as('hair');
    if (s === 'buzz') {
      G.rrect(13, 3, 34, 14, 7, c);
      for (let y = 5; y <= 13; y += 2) for (let x = 15 + (y % 4 ? 1 : 0); x <= 32; x += 3) G.set(x, y, light(c, 0.16));
      G.rect(13, 14, 14, 17, c); G.rect(33, 14, 34, 17, c);
      hairShine(G, ch);
      return;
    }
    if (s === 'spiky') {
      // 冲天炸毛：一排尖刺，发根深色
      const spikes = [[10, 15], [8, 4], [15, 8], [14, -3], [20, 6], [23, -6], [26, 6], [32, -3], [32, 8], [39, 3], [37, 15]];
      G.rrect(11, 6, 36, 16, 6, c);
      G.poly(spikes.concat([[36, 16], [11, 16]]), c);
      G.rect(14, 15, 33, 15, ch.roots);
      for (let x = 14; x <= 33; x += 3) G.set(x, 16, c);
      G.rect(11, 15, 13, 22, c); G.rect(34, 15, 36, 22, c);
      G.line(14, 0, 16, 8, light(c, 0.45)); G.line(23, -2, 23, 6, light(c, 0.45)); G.line(31, 0, 29, 8, light(c, 0.45));
      return;
    }
    // 乐高发片：比头宽两格，盖住凸点
    G.rrect(11, 2, 36, 15, 8, c);
    if (s === 'alice') {
      G.rect(23, 3, 24, 9, dk);
      G.as('skin'); G.poly([[21.5, 10], [26.5, 10], [33, 15.5], [33, 17], [15, 17], [15, 15.5]], ch.skin); G.as('hair');
      G.poly([[23.5, 9], [23, 12], [18, 15], [15, 19], [13, 25], [10, 25], [10, 12]], c);
      G.poly(mirror([[23.5, 9], [23, 12], [18, 15], [15, 19], [13, 25], [10, 25], [10, 12]]), c);
      for (let y = 14; y <= 47; y++) {
        const w = Math.round(Math.sin(y / 2.6) * 1.3), bottom = y > 44 ? (y - 44) : 0;
        G.rect(8 + w + bottom, y, 13 + w, y, c); G.rect(W - 14 - w, y, W - 9 - w - bottom, y, c);
      }
      G.line(11, 18, 11, 40, dk); G.line(36, 18, 36, 40, dk);
    }
    if (s === 'long') {
      G.poly([[11, 12], [33, 12], [27, 15], [19, 17], [14, 21], [11, 22]], c);
      for (let y = 14; y <= 44; y++) { G.rect(9, y, 13, y, c); G.rect(W - 14, y, W - 10, y, c); }
      G.line(20, 3, 18, 10, dk);
    }
    if (s === 'shoulder') {
      G.poly([[11, 12], [31, 12], [25, 15], [18, 17], [13, 19], [11, 19]], c);
      for (let y = 14; y <= 38; y++) { G.rect(9, y, 13, y, c); G.rect(W - 14, y, W - 10, y, c); }
      G.line(19, 3, 17, 10, dk);
    }
    if (s === 'bob') {
      G.rect(12, 13, 35, 17, c);
      for (let x = 14; x <= 33; x += 4) G.set(x, 17, dk);
      for (let y = 14; y <= 31; y++) { G.rect(9, y, 14, y, c); G.rect(W - 15, y, W - 10, y, c); }
      G.rect(10, 32, 13, 32, c); G.rect(W - 14, 32, W - 11, 32, c);
    }
    if (s === 'bun') {
      G.ellipse(23.5, 1.5, 6, 3.6, c);
      G.rect(12, 13, 35, 16, c); G.set(20, 16, null); G.set(27, 16, null);
      G.line(12, 16, 12, 27, c); G.line(13, 16, 13, 24, c); G.line(35, 16, 35, 27, c); G.line(34, 16, 34, 24, c);
    }
    if (s === 'sidepart') {
      G.poly([[11, 11], [36, 11], [30, 14], [21, 16], [15, 18], [12, 20], [11, 20]], c);
      G.rect(11, 15, 13, 23, c); G.rect(34, 15, 36, 21, c);
      G.line(17, 3, 16, 10, dk);
    }
    if (s === 'messy') {
      G.poly([[11, 12], [36, 12], [36, 16], [33, 19], [31, 15], [28, 18], [25, 14], [22, 18], [19, 14], [16, 19], [13, 15], [11, 17]], c);
      G.poly([[18, 3], [21, -1], [22, 3]], c); G.poly([[25, 3], [28, 0], [29, 4]], c);
      for (let y = 14; y <= 28; y++) { G.rect(10, y, 13, y, c); G.rect(W - 14, y, W - 11, y, c); }
      G.set(9, 26, c); G.set(38, 25, c);
    }
    if (s === 'ponytail' || s === 'ponytail-long') {
      G.poly([[11, 12], [32, 12], [26, 15], [19, 16], [13, 19], [11, 19]], c);
      for (let y = 14; y <= 26; y++) { G.rect(10, y, 13, y, c); G.rect(W - 14, y, W - 11, y, c); }
      G.line(19, 3, 17, 10, dk);
    }
    if (s === 'emo') {
      // 非主流长斜刘海：从右上扫下来盖住左眼，发梢一缕缕参差
      G.poly([[36, 9], [36, 15], [31, 15], [27, 17], [24, 22], [22, 27], [20, 24], [18, 28], [16, 24], [13, 27], [11, 22], [11, 10]], c);
      G.poly([[14, 3], [10, 0], [17, 4]], c); G.poly([[30, 3], [36, -1], [33, 5]], c); G.poly([[22, 2], [24, -2], [26, 2]], c);
      for (let y = 14; y <= 33; y++) { const j = y > 29 ? (y % 2) : 0; G.rect(9 + j, y, 13, y, c); G.rect(W - 14, y, W - 10 - j, y, c); }
      G.line(30, 9, 23, 22, shade(c, 0.18)); G.line(26, 10, 19, 24, shade(c, 0.18)); G.line(21, 10, 15, 22, shade(c, 0.18));
      G.line(33, 8, 27, 15, light(c, 0.4));
    }
    hairShine(G, ch);
  }

  /* ── 手臂与手 ───────────────────────────────────── */
  function armDown(G, side, ch, sleeve) {
    G.as('arm');
    for (let y = 35; y <= 50; y++) {
      let r = torsoL(y) - 2, l = r - 5;
      if (y === 35) { l += 1; }
      const cuff = y >= 49 && !ch.noCuff;
      const c = cuff ? shade(sleeve, 0.08) : sleeve;
      if (side < 0) G.rect(l, y, r, y, c); else G.rect(W - 1 - r, y, W - 1 - l, y, c);
    }
    const cx = (torsoL(50) - 2 + torsoL(50) - 7) / 2;
    hand(G, side < 0 ? cx : W - 1 - cx, 53.5, false, ch.skin);
    if (ch.stripe) for (let y = 36; y <= 48; y++) { const r = torsoL(y) - 2; G.set(side < 0 ? r - 1 : W - r, y, ch.stripe); }
  }
  function armUp(G, side, ch, sleeve) {
    G.as('arm');
    for (let y = 16; y <= 36; y++) {
      const off = Math.round((36 - y) * 2 / 20);
      const l = 36 + off, r = l + 5;
      const c = y <= 17 ? shade(sleeve, 0.08) : sleeve;
      if (side > 0) G.rect(l, y, r, y, c); else G.rect(W - 1 - r, y, W - 1 - l, y, c);
      if (ch.stripe && y > 18) G.set(side > 0 ? l + 1 : W - 2 - l, y, ch.stripe);
    }
    const cx = 36 + 2 + 2.5;
    hand(G, side > 0 ? cx : W - 1 - cx, 12.5, true, ch.skin);
  }
  /** 乐高 C 形手：一个圆环，开口朝下（举手时朝上） */
  function hand(G, cx, cy, up, skin) {
    G.as('hand');
    G.ellipse(cx - 0.5, cy - 0.5, 3.4, 3.4, skin);
    G.rect(Math.round(cx - 1), Math.round(cy + (up ? -2 : 0)), Math.round(cx), Math.round(cy + (up ? -1 : 1)), 'K');
    if (up) G.rect(Math.round(cx - 1), Math.round(cy - 4), Math.round(cx), Math.round(cy - 2.6), null);
    else G.rect(Math.round(cx - 1), Math.round(cy + 2.4), Math.round(cx), Math.round(cy + 3.4), null);
  }

  /* ── 身体 ─────────────────────────────────────────── */
  function body(ch, pose) {
    const G = grid();
    const skin = ch.skin, skinSh = shade(skin, 0.12);
    const upL = pose === 'cheer', upR = pose === 'cheer' || pose === 'wave';
    const sleeve = ch.outer || ch.top;
    hairBack(G, ch);

    // 头顶凸点、圆柱头、脖子
    G.as('skin');
    G.rrect(18, 3, 29, 8, 2, skin); G.rect(19, 3, 28, 3, light(skin, 0.25));
    G.rrect(13, 7, 34, 31, 5, skin);
    G.rect(19, 32, 28, 33, skinSh);

    // 躯干
    G.as('torso');
    for (let y = 34; y <= 54; y++) for (let x = torsoL(y); x <= torsoR(y); x++) {
      const center = x >= 20 && x <= 27;
      let c = ch.outer && !center ? ch.outer : ch.top;
      if (ch.outer && !center && ch.cord && x % 2 === 0) c = shade(ch.outer, 0.1);
      if (ch.outer && !center && ch.knit && (x + Math.floor(y / 2)) % 4 === 0) c = shade(ch.outer, 0.08);
      if (!ch.outer && ch.knit && (x + Math.floor(y / 2)) % 4 === 0 && y > 37) c = shade(ch.top, 0.06);
      G.set(x, y, c);
    }
    if (ch.outer) {
      for (let y = 34; y <= 54; y++) { G.set(19, y, shade(ch.outer, 0.25)); G.set(28, y, shade(ch.outer, 0.25)); }
      if (ch.lapel) { G.poly([[19, 34], [22, 34], [20, 42]], light(ch.outer, 0.12)); G.poly(mirror([[19, 34], [22, 34], [20, 42]]).map(([x, y]) => [x - 1, y]), light(ch.outer, 0.12)); }
      if (ch.zip) { G.rect(19, 34, 19, 54, '#B9BEC6'); G.rect(28, 34, 28, 54, '#B9BEC6'); }
      if (ch.stripe) { G.rect(torsoL(44), 44, 18, 45, ch.stripe); G.rect(29, 44, torsoR(44), 45, ch.stripe); }
    }
    G.rect(torsoL(54), 53, torsoR(54), 54, shade(ch.outer || ch.top, 0.1));
    if (ch.collar === 'crew') { G.rect(20, 34, 27, 34, shade(ch.top, 0.14)); G.rect(21, 35, 26, 35, shade(ch.top, 0.06)); }
    if (ch.collar === 'turtle') { G.rect(19, 31, 28, 34, ch.top); G.rect(19, 33, 28, 33, light(ch.top, 0.12)); }
    if (ch.collar === 'shirt') {
      const cc = ch.collarColor;
      G.poly([[17, 34], [23, 34], [21, 39]], cc); G.poly([[24, 34], [31, 34], [26, 39]], cc);
      G.line(17, 34, 21, 39, shade(cc, 0.2)); G.line(30, 34, 26, 39, shade(cc, 0.2));
      G.rect(22, 34, 25, 35, skinSh);
      if (ch.buttons) [41, 45, 49].forEach(y => G.rect(23, y, 24, y, shade(ch.top, 0.28)));
    }
    if (ch.collar === 'hood') {
      G.rrect(14, 31, 33, 37, 3, shade(ch.top, 0.12)); G.rect(19, 32, 28, 34, skinSh);
      G.rect(21, 37, 21, 43, '#ECECE8'); G.rect(26, 37, 26, 43, '#ECECE8');
      G.rrect(17, 46, 30, 52, 2, shade(ch.top, 0.1));
    }

    if (!upL) armDown(G, -1, ch, sleeve);
    if (!upR) armDown(G, 1, ch, sleeve);

    // 下装
    G.as('legs');
    if (ch.skirt) {
      const k = ch.skirt;
      for (let y = 55; y <= 70; y++) {
        const spread = Math.floor((y - 55) / 4), a = 14 - spread, b = 33 + spread;
        for (let x = a; x <= b; x++) G.set(x, y, (x - a) % 4 === 3 ? shade(k, 0.1) : k);
      }
      G.rect(16, 71, 21, 73, ch.shoes); G.rect(26, 71, 31, 73, ch.shoes);
    } else {
      const p = ch.pants;
      G.rect(14, 55, 33, 59, p); G.rect(14, 55, 33, 56, shade(p, 0.16)); G.rect(22, 57, 25, 59, shade(p, 0.08));
      const la = ch.wide ? 12 : ch.skinny ? 15 : 14, rb = W - 1 - la;
      for (let y = 60; y <= 70; y++) {
        const flare = ch.wide && y > 64 ? 1 : 0;
        G.rect(la - flare, y, 22, y, p); G.rect(25, y, rb + flare, y, p);
      }
      G.rect(23, 58, 24, 72, 'K');
      const sa = ch.wide ? 11 : la;
      G.rrect(sa, 70, 22, 73, 1, ch.shoes); G.rrect(25, 70, W - 1 - sa, 73, 1, ch.shoes);
      if (ch.shoes === '#F2F2F0' || ch.shoes === '#F2EEE6') { G.rect(sa, 73, 22, 73, '#C9C4BA'); G.rect(25, 73, W - 1 - sa, 73, '#C9C4BA'); }
      else { G.rect(sa + 1, 70, 21, 70, light(ch.shoes, 0.18)); G.rect(26, 70, W - 2 - sa, 70, light(ch.shoes, 0.18)); }
    }

    // 配饰
    G.as('acc');
    const ex = ch.extra || [];
    const wrist = (c, multi) => { for (let x = torsoL(49) - 7; x <= torsoL(49) - 2; x++) G.set(x, 48, multi ? multi[x % multi.length] : c); };
    if (!upL && ex.includes('watch')) { wrist('#7A5233'); G.rect(torsoL(49) - 6, 47, torsoL(49) - 4, 49, '#D9DDE2'); }
    if (!upL && ex.includes('bracelet-silver')) wrist('#DDE1E6');
    if (!upL && ex.includes('bracelet-gold')) wrist('#D6B46E');
    if (!upL && ex.includes('beads')) wrist(null, ['#D9675B', '#E8B84A', '#7FAE8C']);
    if (ex.includes('paint')) { G.set(torsoL(46) - 4, 46, '#D9675B'); G.set(torsoL(42) - 3, 42, '#E8B84A'); G.set(16, 50, '#7FAE8C'); G.set(31, 39, '#D9675B'); }
    if (ex.includes('earring')) { G.rect(12, 25, 12, 26, '#E2E5EA'); G.rect(35, 25, 35, 26, '#E2E5EA'); }
    if (ex.includes('chain')) { G.line(15, 56, 20, 60, '#C9CDD3'); G.line(20, 60, 22, 56, '#C9CDD3'); }
    if (ex.includes('necklace-silver')) { G.line(20, 35, 23, 39, '#DDE1E6'); G.line(27, 35, 24, 39, '#DDE1E6'); }
    if (ex.includes('star')) {
      const gd = '#D2AE62', gl = '#F1D590';
      G.line(19, 35, 23, 40, gd); G.line(28, 35, 24, 40, gd);
      const st = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 1.5 : 3.6; st.push([24 + Math.cos(a) * r, 43.6 + Math.sin(a) * r]); }
      G.poly(st, gd); G.set(23, 42, gl); G.set(24, 42, gl); G.set(23, 43, gl);
    }
    if (ex.includes('bag')) {
      G.line(30, 35, 16, 54, '#B8A27A'); G.line(31, 35, 17, 54, '#A8925F');
      G.rrect(8, 52, 17, 61, 1, '#B8A27A'); G.rect(8, 52, 17, 55, shade('#B8A27A', 0.14));
    }

    hairFront(G, ch);
    if (ex.includes('headband')) {
      // 淡金色细发带：贴着头型的一道弧，压在头发上面，出镜必戴
      G.as('acc');
      for (let x = 12; x <= 35; x++) {
        const t = (x - 23.5) / 12, y = Math.round(5.6 + t * t * 6.2);
        G.set(x, y, '#C9A96E'); G.set(x, y + 1, '#C9A96E'); G.set(x, y + 2, '#A98B50');
        if (x >= 15 && x <= 22) G.set(x, y, '#EED9A6');
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
    const dk = '#33302C';
    if (p === 'coffee') { G.rrect(35, 41, 41, 51, 1, '#FBF8F2'); G.rect(35, 44, 41, 47, '#B07A4E'); G.rect(34, 39, 42, 40, '#3A2C24'); }
    if (p === 'book') { G.rect(33, 40, 43, 53, '#5E7D45'); G.rect(34, 41, 41, 52, '#6E8F55'); G.rect(43, 41, 43, 53, '#F4EEDC'); G.rect(35, 44, 40, 45, '#C9D8B5'); }
    if (p === 'mic') { G.rrect(37, 42, 39, 55, 1, dk); G.ellipse(38, 38, 3.4, 3.4, '#B9BEC6'); for (let y = 36; y <= 40; y += 2) for (let x = 36; x <= 40; x += 2) G.set(x, y, '#8E939B'); }
    if (p === 'brush') { G.rect(38, 33, 39, 55, '#8B6A4A'); G.rect(38, 30, 39, 32, '#C9CDD3'); G.poly([[37, 30], [41, 30], [39, 24]], '#D9675B'); }
    if (p === 'pen') { G.rect(38, 38, 39, 55, dk); G.rect(38, 36, 39, 37, '#C9A96E'); G.set(38, 56, '#C9A96E'); }
    if (p === 'magnifier') { G.line(38, 45, 41, 56, '#7A5233'); G.line(39, 45, 42, 56, '#7A5233'); G.ellipse(37, 39, 5, 5, '#B9BEC6'); G.ellipse(37, 39, 3.4, 3.4, '#DCEBF5'); G.set(35, 37, '#FFFFFF'); }
    if (p === 'chart') { G.rect(31, 38, 44, 53, '#FFFFFF'); [[33, 50], [35, 48], [37, 49], [39, 45], [41, 43]].reduce((a, b) => { G.line(a[0], a[1], b[0], b[1], '#B4463C'); return b; }); G.rect(33, 40, 37, 40, '#C9CDD3'); G.rect(41, 46, 42, 51, '#E3B8B3'); }
    if (p === 'laptop') { G.rect(30, 40, 44, 51, '#C9CDD3'); G.rect(31, 41, 43, 50, '#2F8C9C'); G.rect(33, 43, 38, 43, '#9FE0E8'); G.rect(33, 45, 41, 45, '#9FE0E8'); G.rect(33, 47, 36, 47, '#9FE0E8'); G.rect(28, 52, 46, 53, '#B0B4BA'); }
    if (p === 'doc') { G.rect(32, 37, 43, 53, '#FFFFFF'); G.rect(34, 39, 38, 40, '#5E8FC2'); [43, 46, 49].forEach(y => G.rect(34, y, 41, y, '#9DB3CC')); G.poly([[40, 37], [43, 37], [43, 40]], '#DCE5F0'); }
    if (p === 'tea') { G.rrect(34, 45, 41, 50, 2, '#9FC2A8'); G.rect(35, 46, 40, 46, '#C9E0CF'); G.rect(32, 51, 43, 52, '#E8E2D4'); G.set(36, 41, '#D6D2C8'); G.set(37, 40, '#D6D2C8'); G.set(39, 42, '#D6D2C8'); G.set(40, 41, '#D6D2C8'); }
    if (p === 'dumbbell') { G.rect(32, 52, 43, 53, '#55585E'); G.rrect(30, 48, 33, 57, 1, '#2A2C30'); G.rrect(42, 48, 45, 57, 1, '#2A2C30'); }
  }

  /* ── 描边与明暗 ───────────────────────────────────── */
  function finish(G) {
    const out = G.g.map(r => r.slice());
    const empty = v => v === null || v === 'K';
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (G.g[y][x] !== null) continue;
      if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => G.get(x + dx, y + dy) !== null && G.get(x + dx, y + dy) !== 'K')) out[y][x] = 'K';
    }
    const res = out.map(r => r.slice());
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const v = out[y][x];
      if (empty(v)) continue;
      const r1 = x + 1 < W ? out[y][x + 1] : null, r2 = x + 2 < W ? out[y][x + 2] : null, l1 = x > 0 ? out[y][x - 1] : null;
      let c = v;
      if (empty(r1)) c = shade(v, 0.2); else if (empty(r2)) c = shade(v, 0.1); else if (empty(l1)) c = light(v, 0.14);
      // 头发在脸上的投影
      if (G.tag[y][x] === 'skin' && y > 0 && (G.tag[y - 1][x] === 'hair' || G.tag[y - 1][x] === 'acc')) c = shade(c, 0.12);
      res[y][x] = c;
    }
    return res;
  }

  /** 同色像素合并成一条 path，元素数量从几千降到几十 */
  function toRects(cells) {
    const by = new Map();
    for (let y = 0; y < cells.length; y++) {
      let x = 0;
      while (x < W) {
        const v = cells[y][x];
        if (!v) { x++; continue; }
        let e = x; while (e + 1 < W && cells[y][e + 1] === v) e++;
        const c = v === 'K' ? OUTLINE : v;
        by.set(c, (by.get(c) || '') + `M${x} ${y}h${e - x + 1}v1h${-(e - x + 1)}z`);
        x = e + 1;
      }
    }
    let s = '';
    by.forEach((d, c) => { s += `<path fill="${c}" d="${d}"/>`; });
    return s;
  }

  /* ── 脸（眉、眼、嘴、腮红、眼镜） ─────────────────── */
  const EYE = '#2A2421', MOUTH = '#8A4A44';
  function px(list, c, op) { return list.map(([x, y]) => `<rect x="${x}" y="${y}" width="1" height="1" fill="${c}"${op ? ` opacity="${op}"` : ''}/>`).join(''); }
  const box = (x0, y0, x1, y1) => { const a = []; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) a.push([x, y]); return a; };
  const mx = list => list.map(([x, y]) => [W - 1 - x, y]);
  function faceSvg(ch, kind) {
    const hideL = ch.hairStyle === 'emo', noBrow = ch.hairStyle === 'bob' || ch.hairStyle === 'bun' || ch.hairStyle === 'emo';
    const side = (list, c, op) => px(hideL ? mx(list) : list.concat(mx(list)), c, op);
    let s = '';
    const brow = shade(ch.hair, 0.35);
    if (!noBrow) s += side([[17, 16], [18, 15], [19, 15], [20, 15]], brow);
    else if (hideL) s += px(mx([[17, 16], [18, 15], [19, 15], [20, 15]]), brow);
    if (kind === 'smile' || kind === 'sing') { s += side(box(18, 19, 19, 21), EYE); s += side([[18, 19]], '#FFFFFF', 0.85); }
    if (kind === 'happy') s += side([[17, 21], [18, 20], [19, 20], [20, 21]], EYE);
    if (kind === 'blink') s += side([[17, 21], [18, 21], [19, 21], [20, 21]], EYE);
    if (kind === 'sing') s += px(box(21, 25, 26, 28), MOUTH) + px(box(22, 27, 25, 28), '#D9787A');
    else if (kind === 'happy') s += px([[20, 24], [27, 24], [21, 25], [26, 25]].concat(box(22, 26, 25, 26)), MOUTH) + px(box(22, 25, 25, 25), '#D9787A');
    else s += px([[21, 25], [26, 25]].concat(box(22, 26, 25, 26)), MOUTH);
    s += px(box(15, 24, 17, 25).concat(box(30, 24, 32, 25)), '#E58C8C', ch.blush ?? 0.45);
    if (ch.glasses) {
      const fr = [];
      [16, 26].forEach(x0 => { for (let x = x0; x <= x0 + 5; x++) fr.push([x, 17], [x, 23]); for (let y = 18; y <= 22; y++) fr.push([x0, y], [x0 + 5, y]); });
      fr.push([22, 19], [23, 19], [24, 19], [25, 19]);
      s += px(box(17, 18, 20, 22).concat(box(27, 18, 30, 22)), '#FFFFFF', 0.18) + px(fr, ch.glasses);
    }
    return s;
  }

  /* ── 输出 ─────────────────────────────────────────── */
  const POSES = ['stand', 'wave', 'cheer'], FACES = ['smile', 'happy', 'blink', 'sing'];
  function buildSprite() {
    let defs = '';
    CAST.forEach(ch => {
      POSES.forEach(p => { defs += `<symbol id="mf-${ch.id}-${p}" viewBox="0 0 ${W} ${H}">${toRects(finish(body(ch, p)))}</symbol>`; });
      FACES.forEach(f => { defs += `<symbol id="mf-${ch.id}-face-${f}" viewBox="0 0 ${W} ${H}">${faceSvg(ch, f)}</symbol>`; });
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
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('shape-rendering', 'crispEdges');
    svg.setAttribute('width', String(Math.round(height * W / H)));
    svg.setAttribute('height', String(height));
    svg.style.overflow = 'visible';
    const b = document.createElementNS(ns, 'use'), f = document.createElementNS(ns, 'use');
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

  window.MINIFIG = { CAST, byId: Object.fromEntries(CAST.map(c => [c.id, c])), buildSprite, figure, W, H };
})();
