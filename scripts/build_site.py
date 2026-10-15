#!/usr/bin/env python3
"""生成仓库首页（GitHub Pages 静态页面）。

做两件事：
1. 把各处大图缩成 webp 缩略图，放进 site/thumbs/，已存在且比原图新的会跳过。
2. 读取人设、朋友名册、outputs 目录，渲染根目录 index.html。

页面里的缩略图点开后指向仓库里的原图，所以不复制大图。
只收录已被 git 跟踪的 outputs，避免首页链接到线上不存在的文件。

用法：python3 scripts/build_site.py
"""
import html
import json
import re
import subprocess
from pathlib import Path
from urllib.parse import quote

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
THUMBS = ROOT / 'site' / 'thumbs'
GITHUB = 'https://github.com/miyang-ai/alice_fanart'
MV_DIR = 'outputs/2026-10-16_alice_mv_当然可以好问题像素MV'

THUMBS.mkdir(parents=True, exist_ok=True)
tracked = set(subprocess.check_output(['git', 'ls-files', '-z'], cwd=ROOT).decode().split('\0'))


def thumb(src, name, width):
    """生成缩略图，返回相对根目录的 URL。"""
    s, d = ROOT / src, THUMBS / f'{name}.webp'
    if not d.exists() or d.stat().st_mtime < s.stat().st_mtime:
        im = Image.open(s).convert('RGB')
        if im.width > width:
            im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
        im.save(d, 'WEBP', quality=82, method=6)
    return f'site/thumbs/{name}.webp'


def url(path):
    return quote(path, safe='/')


def blob(path):
    return f'{GITHUB}/blob/main/{url(path)}'


def tree(path):
    return f'{GITHUB}/tree/main/{url(path)}'


e = html.escape


def fig(src, name, width, full, caption, sub='', ratio=None, extra=''):
    t = thumb(src, name, width)
    im = Image.open(THUMBS / f'{name}.webp')
    ar = f'{im.width} / {im.height}'
    cap = f'<figcaption><b>{e(caption)}</b>{f"<span>{e(sub)}</span>" if sub else ""}{extra}</figcaption>' if caption else ''
    return (f'<figure><a class="zoom" href="{url(full)}" aria-label="查看大图：{e(caption)}">'
            f'<img src="{t}" alt="{e(caption)}" loading="lazy" style="aspect-ratio:{ar}"></a>{cap}</figure>')


# ---------- 数据 ----------
persona = json.load(open(ROOT / 'refs/alice/persona.json', encoding='utf-8'))
friends = json.load(open(ROOT / 'refs/alice_friends/index.json', encoding='utf-8'))

WARDROBE = [
    ('smart_casual', '商务休闲'), ('cafe_work', '咖啡馆办公'), ('weekend', '周末'), ('homewear', '居家'),
    ('pajama', '睡衣'), ('early_autumn', '初秋'), ('autumn_layer', '秋日叠穿'), ('winter_warm', '冬日保暖'),
    ('summer_cool', '夏日清凉'), ('dress_linen', '亚麻连衣裙'), ('minimal_chic', '白衬衫与阔腿裤'),
    ('jk', 'JK 制服'), ('hanfu', '汉服'), ('qipao', '旗袍'), ('evening_gown', '晚礼服'), ('punk', '朋克'),
]
STYLES = [('jk', 'JK'), ('hanfu', '汉服'), ('lolita', '洛丽塔')]

# ---------- 各区块 ----------
mv_shots = [
    ('01_handover_OPC在右人物在左', 'OPC 交接'), ('02_selfie_垫图街景背景', '朋友圈自拍'),
    ('04_chorus_共创画廊像素框', '共创画廊'), ('05_bigchat_像素窗口与人物在左', '长记忆对话'),
    ('06_still_我就在人物在左', '陪伴一刻'), ('03_finale_片尾新文案', '片尾'),
]
mv_html = ''.join(
    fig(f'{MV_DIR}/预览/v10_终版检查/{f}.png', f'mv_{i}', 640, f'{MV_DIR}/预览/v10_终版检查/{f}.png', cap)
    for i, (f, cap) in enumerate(mv_shots))
MV_URL = url(f'{MV_DIR}/index.html')
outfit_links = ''.join(f'<a href="{MV_URL}?outfit={k}">{n}</a>' for k, n in
                       [('jk', 'JK 制服'), ('dress', '碎花裙'), ('chic', '白衬衫'), ('cardigan', '开衫')])

facts = [
    ('出生', '{} 年 {} 月 {} 日 · {} 岁'.format(*[int(x) for x in persona['birthday'].split('-')], persona['age'])),
    ('MBTI', persona['mbti']),
    ('现居', '上海徐汇衡复风貌区'),
    ('家乡', persona['hometown']),
    ('身份', '米羊科技的 AI 助理，用户平等的长期搭档与挚友'),
    ('标志', '淡金色细发带、细金链星星吊坠，两件饰品出镜必戴'),
]
facts_html = ''.join(f'<div><dt>{k}</dt><dd>{e(v)}</dd></div>' for k, v in facts)
traits_html = ''.join(f'<li>{e(t)}</li>' for t in persona['traits'])

scene_html = ''.join(
    fig(f'refs/alice/persona/{f}.png', f'persona_{f}', 720, f'refs/alice/persona/{f}.png', c)
    for f, c in [('persona_portrait', '肖像'), ('persona_hero_balcony', '阳台'),
                 ('persona_cafe', '咖啡馆'), ('persona_study', '书房')])

wardrobe_html = ''.join(
    fig(f'refs/alice/wardrobe/wardrobe_{k}.png', f'wardrobe_{k}', 520, f'refs/alice/wardrobe/wardrobe_{k}.png', n)
    for k, n in WARDROBE)
styles_html = ''.join(
    fig(f'refs/alice/three_styles/alice_three_styles_{k}_reference_v3.png', f'style_{k}', 760,
        f'refs/alice/three_styles/alice_three_styles_{k}_reference_v3.png', n)
    for k, n in STYLES)

friend_cards = []
for f in friends:
    d = f['dir']
    p = json.load(open(ROOT / 'refs/alice_friends' / d / 'persona.json', encoding='utf-8'))
    said = (p.get('catchphrases') or [''])[0]
    t = thumb(f'refs/alice_friends/{d}/avatar.webp', f"friend_{f['id']}", 360)
    friend_cards.append(
        f'<a class="friend" href="{tree("refs/alice_friends/" + d)}"><img src="{t}" alt="{e(f["name"])}" loading="lazy">'
        f'<b>{e(f["name"])}</b><span class="role">{e(f["title"])}</span>'
        f'<span class="meta">{e(f["city"])} · {e(f["mbti"])}</span>'
        f'<span class="say">{e(said)}</span></a>')
friend_cards.append(
    f'<a class="friend more" href="{tree("workflows/opc-character")}"><b>新建一位朋友</b>'
    f'<span class="say">按工作流写人设、画三视图，再生成头像和生活照。</span><span class="go">看工作流</span></a>')
friend_cards.append(
    f'<a class="friend more" href="{blob("refs/alice_friends/README.md")}"><b>完整名册</b>'
    f'<span class="say">十三位朋友的年龄、来历、生日、MBTI 与一句话人设。</span><span class="go">看名册</span></a>')
friends_html = ''.join(friend_cards)

out_items = []
for d in sorted((ROOT / 'outputs').iterdir(), reverse=True):
    if not d.is_dir() or f'outputs/{d.name}' == MV_DIR:
        continue
    date = d.name[:10]
    title = re.sub(r'^[\d-]+_[A-Za-z0-9_]+?_(?=Alice)', '', d.name)
    for p in sorted(d.glob('*.png')):
        rel = f'outputs/{d.name}/{p.name}'
        if rel not in tracked:
            continue
        pj = f'outputs/{d.name}/{p.stem}.prompt.json'
        link = f'<a class="plink" href="{url(pj)}">提示词</a>' if pj in tracked else ''
        m = re.search(r'_(v\d+)$', p.stem)
        sub = f'{date} · {m.group(1)}' if m else date
        out_items.append(fig(rel, f'out_{p.stem}', 960, rel, title, sub, extra=link))
outputs_html = f'<div class="grid g3 uniform">{"".join(out_items)}</div>'

lxs = [
    ('refs/luoxiaoshan/洛小山全身_白底.png', 'lxs_full', '洛小山 全身'),
    ('refs/luoxiaoshan/洛小山简笔画头像.jpg', 'lxs_head', '简笔画头像'),
    ('refs/luoxiaoshan/成品案例/官网_xueai狐狸.webp', 'lxs_fox', '官网 xueai 狐狸'),
    ('refs/luoxiaoshan/成品案例/共创插画_Alice与洛小山_分享卡底图.png', 'lxs_card', 'Alice 与洛小山 分享卡'),
    ('refs/luoxiaoshan/成品案例/七日挑战面板底图.png', 'lxs_seven', '七日挑战面板'),
    ('refs/luoxiaoshan/道具与锚点/画风锚点_poster-art.webp', 'lxs_anchor', '画风锚点'),
]
lxs_html = ''.join(fig(s, n, 600, s, c) for s, n, c in lxs if s in tracked)

docs = [
    ('垫图逻辑', '参考图职责、身份锁、画风与提示词写法、存档与审计', blob('docs/垫图逻辑.md')),
    ('新建虚构角色', '从人设到头像、生活照的完整工作流', tree('workflows/opc-character')),
    ('数码涟漪修复', '成图里电子屏、反光屏幕的修复流程', tree('workflows/ripple-fix')),
    ('生图网关脚本', '通过米羊网关调用生图模型的可选脚本', blob('scripts/gen_via_gateway.py')),
    ('像素 MV 提示词库', '62 条提示词、垫图顺序与成品对应', blob(f'{MV_DIR}/素材库/03_提示词/提示词.md')),
    ('像素 MV 素材库', '绿幕原稿、垫图与转 SVG 工具', tree(f'{MV_DIR}/素材库')),
]
docs_html = ''.join(
    f'<a class="doc" href="{h}"><b>{e(t)}</b><span>{e(s)}</span></a>' for t, s, h in docs)

cover = thumb('outputs/2026-10-01_readme_cover_Alice二创封面/alice_luoxiaoshan_readme_cover_v1.png', 'cover', 1400)
chibi2 = thumb('refs/alice/chibi/alice_chibi_wardrobe_concepts_v2.png', 'chibi_wardrobe', 1000)
sheet = thumb('refs/alice/ref_sheets/ref_sheet_alice.jpg', 'ref_sheet', 1400)
chibi = thumb('refs/alice/chibi/alice_chibi_reference_sheet_v2.png', 'chibi_sheet', 1000)
mv_main = thumb(f'{MV_DIR}/预览/mv_sheet.jpg', 'mv_sheet', 1200)

PAGE = '''<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Alice Fanart · 白艾莉与洛小山二创素材库</title>
<meta name="description" content="Alice（白艾莉）、她的朋友们与洛小山的二创素材库：人物资料、三视图、衣橱、成图案例、像素 MV。">
<meta property="og:title" content="Alice Fanart · 二创素材库">
<meta property="og:image" content="site/thumbs/cover.webp">
<link rel="icon" href="site/thumbs/friend_researcher.webp">
<link rel="stylesheet" href="site/style.css">
</head>
<body>
<header class="top">
  <a class="brand" href="#top">Alice Fanart</a>
  <nav aria-label="页面导航">
    <a href="#mv">像素 MV</a><a href="#alice">认识 Alice</a><a href="#wardrobe">衣橱</a>
    <a href="#friends">朋友们</a><a href="#gallery">成图案例</a><a href="#luoxiaoshan">洛小山</a><a href="#docs">文档</a>
  </nav>
  <a class="gh" href="__GITHUB__">GitHub</a>
</header>

<main id="top">
<section class="hero">
  <div class="hero-text">
    <p class="kicker">白艾莉 · 洛小山 二创素材库</p>
    <h1>Alice Fanart</h1>
    <p class="lead">人物资料、三视图、衣橱、垫图规范、提示词和成图案例。想画 Alice，从这里选参考图开始。</p>
    <div class="actions">
      <a class="btn primary" href="__MV_URL__">打开像素 MV</a>
      <a class="btn" href="#gallery">浏览成图案例</a>
      <a class="btn" href="#docs">读垫图逻辑</a>
    </div>
  </div>
  <img class="hero-img" src="__COVER__" alt="Alice 在窗边画水彩，身旁坐着洛小山的小狐狸" width="1400" height="788">
</section>

<section id="mv" class="block">
  <div class="head"><h2>像素 MV：当然可以好问题</h2>
    <p>44 秒的单文件 HTML 动画。像素版 Alice 带着游戏式界面，跟着歌曲卡点，四套服装、十三个动作可以切换。点播放后才有声音。</p></div>
  <div class="mv-main">
    <a href="__MV_URL__" class="mv-cover"><img src="__MV_MAIN__" alt="像素 MV 画面总览" loading="lazy"><span class="play">打开并播放</span></a>
    <div class="mv-side">
      <h3>换一套衣服看</h3>
      <div class="chips">__OUTFITS__</div>
      <h3>相关</h3>
      <ul class="links">
        <li><a href="__MV_README__">项目说明</a></li>
        <li><a href="__MV_PROMPTS__">62 条生图提示词</a></li>
        <li><a href="__MV_LIB__">绿幕原稿与垫图</a></li>
      </ul>
    </div>
  </div>
  <div class="grid g3 shots">__MV_SHOTS__</div>
</section>

<section id="alice" class="block">
  <div class="head"><h2>认识 Alice</h2><p>白艾莉，英文名 Alice Bai。完整人设在 <a href="__PERSONA__">persona.json</a>。</p></div>
  <div class="alice-cols">
    <div>
      <dl class="facts">__FACTS__</dl>
      <ul class="tags">__TRAITS__</ul>
      <p class="note">三视图提供脸型、身体结构、比例与表情；场景图提供气质与构图。</p>
    </div>
    <figure class="sheet"><a class="zoom" href="refs/alice/ref_sheets/ref_sheet_alice.jpg"><img src="__SHEET__" alt="Alice 三视图与十个表情" loading="lazy"></a><figcaption><b>官方设定表</b><span>基础内衣正面、侧面、背面与 10 个表情</span></figcaption></figure>
  </div>
  <div class="grid g4 scenes">__SCENES__</div>
  <div class="grid g2 chibi">
    <figure><a class="zoom" href="refs/alice/chibi/alice_chibi_reference_sheet_v2.png" aria-label="查看大图：Q 版设定图"><img src="__CHIBI__" alt="Alice Q 版设定图" loading="lazy"></a><figcaption><b>Q 版设定图</b><span>像素 MV 的角色依据</span></figcaption></figure>
    <figure><a class="zoom" href="refs/alice/chibi/alice_chibi_wardrobe_concepts_v2.png" aria-label="查看大图：Q 版衣橱概念"><img src="__CHIBI2__" alt="Alice Q 版衣橱概念图" loading="lazy"></a><figcaption><b>Q 版衣橱概念</b></figcaption></figure>
  </div>
</section>

<section id="wardrobe" class="block">
  <div class="head"><h2>衣橱</h2><p>十六套穿搭，每套都是一张可直接垫图的参考。默认穿搭是大地色休闲：奶油色针织上衣、鼠尾草绿开衫、卡其九分裤、深棕乐福鞋，不穿高跟鞋。</p></div>
  <div class="grid g4">__WARDROBE__</div>
  <h3 class="sub">三种风格参考</h3>
  <div class="grid g3">__STYLES__</div>
</section>

<section id="friends" class="block">
  <div class="head"><h2>她的朋友们</h2><p>十三位虚构朋友，每人有人设、三视图、头像和生活照。点卡片进入资料目录。</p></div>
  <div class="friends">__FRIENDS__</div>
</section>

<section id="gallery" class="block">
  <div class="head"><h2>成图案例</h2><p>按日期归档，每张图都带同名提示词记录。点图看大图，点「提示词」看当时用的参考图与描述。</p></div>
  __OUTPUTS__
</section>

<section id="luoxiaoshan" class="block">
  <div class="head"><h2>和洛小山一起</h2><p>洛小山的形象、成品案例、道具与画风锚点。原始提示词存档在 <a href="__LXS_PROMPTS__">这里</a>。</p></div>
  <div class="grid g3 uniform">__LXS__</div>
</section>

<section id="docs" class="block">
  <div class="head"><h2>文档与工具</h2><p>创作前先读垫图逻辑。</p></div>
  <div class="docs">__DOCS__</div>
</section>
</main>

<footer>
  <p>Alice Fanart · 米羊科技 · <a href="__GITHUB__">源码与全部素材在 GitHub</a></p>
</footer>

<div id="lb" class="lb" hidden><img alt=""><button type="button" aria-label="关闭">关闭</button></div>
<script>
(function () {
  var lb = document.getElementById('lb'), img = lb.querySelector('img');
  function close() { lb.hidden = true; img.removeAttribute('src'); document.body.classList.remove('lock'); }
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a.zoom');
    if (a && !ev.metaKey && !ev.ctrlKey && !ev.shiftKey) {
      ev.preventDefault(); img.src = a.getAttribute('href'); img.alt = a.getAttribute('aria-label') || '';
      lb.hidden = false; document.body.classList.add('lock'); return;
    }
    if (!lb.hidden && (ev.target === lb || ev.target.tagName === 'BUTTON')) close();
  });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && !lb.hidden) close(); });
})();
</script>
</body>
</html>
'''

rep = {
    '__GITHUB__': GITHUB, '__MV_URL__': MV_URL, '__COVER__': cover, '__MV_MAIN__': mv_main,
    '__OUTFITS__': outfit_links, '__MV_README__': url(f'{MV_DIR}/README.md'),
    '__MV_PROMPTS__': blob(f'{MV_DIR}/素材库/03_提示词/提示词.md'), '__MV_LIB__': tree(f'{MV_DIR}/素材库'),
    '__MV_SHOTS__': mv_html, '__PERSONA__': url('refs/alice/persona.json'), '__FACTS__': facts_html,
    '__TRAITS__': traits_html, '__SHEET__': sheet, '__SCENES__': scene_html, '__CHIBI__': chibi, '__CHIBI2__': chibi2,
    '__WARDROBE__': wardrobe_html, '__STYLES__': styles_html, '__FRIENDS__': friends_html,
    '__OUTPUTS__': outputs_html, '__LXS_PROMPTS__': blob('refs/luoxiaoshan/原始提示词存档.md'),
    '__LXS__': lxs_html, '__DOCS__': docs_html,
}
page = PAGE
for k, v in rep.items():
    page = page.replace(k, v)
(ROOT / 'index.html').write_text(page, encoding='utf-8')
(ROOT / '.nojekyll').write_text('', encoding='utf-8')
print('index.html', len(page), 'bytes;', len(list(THUMBS.glob('*.webp'))), 'thumbs')
