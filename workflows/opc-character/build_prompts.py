#!/usr/bin/env python3
"""从 spec.json 生成一个虚构角色的三份提示词：sheet（三视图）/ avatar（头像）/ life（生活照）。

提示词结构：画风段（style_anchor.zh-CN.txt，一字不改）→ 画面描述 → 【本张必须使用的人物动作：…】
→ 参考图说明（只定脸型体型）→ 解剖硬约束。

用法：
    python3 build_prompts.py <角色目录>        # 目录内要有 spec.json，输出 sheet.txt / avatar.txt / life.txt
    python3 build_prompts.py examples          # 直接试跑示例（examples/spec.example.json）

只依赖标准库。
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ANCHOR_TEMPLATE = (HERE / "style_anchor.zh-CN.txt").read_text(encoding="utf-8").strip()

# 画风段里原有的一句视线要求，是为「朋友圈场景照」写的：眼神与场景互动、不要直视镜头。
# 头像不能照搬，否则模型把「不要直视镜头」当成「不许看镜头」，整排人会一起看向右上角。
# 头像只替换这一句，其余一字不改；生活照保留原句。
GAZE_SENTENCE = "{{NAME}} 的眼神应该生动自然、与场景互动（看朋友、看食物、望远方等），不要空洞地直视镜头。"

# 头像里手和手臂的规则：胸像构图，手最多在画面下缘露出；不托下巴、不摸脸（会被模仿三视图里的思考表情）；
# 不要为了做动作硬在人物前方加栏杆之类的前景物体（提示词里也不要出现「栏杆」二字，写出来反而会诱导模型去画）。
HANDS = "肩膀、上臂入画，手若入画只在画面下缘，不托下巴、不摸脸、不做思考手势，动作符合场景、画面前方不要出现多余的前景物体"

GAZE_TEXT = {
    "front": {
        "anchor": "{n}的视线直视镜头，眼神自然有神，像在和看到这张头像的人打招呼，不要看向画面外。",
        "ref": "{n}正对镜头，视线直视镜头，眼神自然有神，头部端正。",
        "action": "【本张必须使用的人物动作：脸与身体正对镜头，视线直视镜头；" + HANDS + "；头部端正不歪头不仰头",
    },
    "left": {
        "anchor": "{n}的视线平视，看向画面左侧远处的景物，眼神自然有神，不要看镜头，不要向上看。",
        "ref": "{n}的头部与肩膀转向画面左侧，视线平视看向左侧远处，不看镜头，不向上看、不仰头。",
        "action": "【本张必须使用的人物动作：头部与肩膀向画面左侧转约 30 度（三分之四侧脸），视线与眼睛同高、平视看向画面左侧远处的景物，不看镜头、不向上看、不仰头；人物站在画面偏右的位置，左侧留出背景景物；" + HANDS,
    },
    "right": {
        "anchor": "{n}的视线平视，看向画面右侧远处的景物，眼神自然有神，不要看镜头，不要向上看。",
        "ref": "{n}的头部与肩膀转向画面右侧，视线平视看向右侧远处，不看镜头，不向上看、不仰头。",
        "action": "【本张必须使用的人物动作：头部与肩膀向画面右侧转约 30 度（三分之四侧脸），视线与眼睛同高、平视看向画面右侧远处的景物，不看镜头、不向上看、不仰头；人物站在画面偏左的位置，右侧留出背景景物；" + HANDS,
    },
}

ANAT = (
    "成品发布质量硬约束：人物解剖结构必须自然连贯。每个人最多两只手、两条手臂和两条腿；"
    "可见手指数量与连接关系合理；禁止多手、多臂、多腿、缺失肢体、身体复制、人物粘连、"
    "关节反折、手指融合、严重脸部畸变、乱码文字或水印。"
)

REQUIRED = [
    "name", "gaze", "sheet_person", "skin_hair",
    "avatar_person", "avatar_expression", "avatar_pose", "avatar_scene", "avatar_color",
    "life_person", "life_scene", "life_action", "life_action_text", "life_light",
]


def build(spec: dict) -> dict[str, str]:
    missing = [k for k in REQUIRED if not str(spec.get(k, "")).strip()]
    if missing:
        raise SystemExit("spec.json 缺少字段：" + "、".join(missing))
    gaze = spec["gaze"]
    if gaze not in GAZE_TEXT:
        raise SystemExit(f"gaze 只能是 front / left / right，当前是 {gaze!r}")
    n = spec["name"]

    anchor = ANCHOR_TEMPLATE.replace("{{NAME}}", n)
    life_ref = (
        "参考图仅用于确定脸型和体型，不要照搬参考图中的姿势、视线方向或面部表情。"
        f"{n}的眼神应该生动自然、与场景互动，不要空洞地直视镜头。"
        "使用参考图中的画风，但穿着 prompt 里描述的服装，不要穿参考图里的衣服。"
    )

    sheet = "\n".join([
        anchor,
        "画面描述：角色设定参考图（三视图加表情），纯白背景。上排为同一个人的三个全身视角（正面、四分之三侧面、背面），"
        "自然站立，双臂放松垂于身侧，三个视角脸型、发型、体型完全一致；下排为同一个人的六个头肩表情习作"
        "（浅浅微笑、惊讶、平静认真、微微皱眉、开怀大笑、挥手打招呼；六个表情视线都朝向镜头，不要手托下巴的思考姿势）。"
        "人物只穿最简基础服装：合身的纯白圆领T恤、深灰色长裤、白色运动鞋，没有外套、没有饰品、没有道具，方便以后换任何服装。"
        "背景纯白，没有文字和标签。",
        "人物：" + spec["sheet_person"],
        ANAT,
    ])

    gz = GAZE_TEXT[gaze]
    portrait_anchor_src = ANCHOR_TEMPLATE.replace(GAZE_SENTENCE, "{{GAZE}}")
    if portrait_anchor_src == ANCHOR_TEMPLATE:
        raise SystemExit("style_anchor 里找不到那句视线要求，头像视线替换失效，请同步更新 GAZE_SENTENCE")
    portrait_anchor = portrait_anchor_src.replace("{{GAZE}}", gz["anchor"].format(n=n)).replace("{{NAME}}", n)
    avatar_ref = (
        "参考图仅用于确定脸型和体型，不要照搬参考图中的姿势、视线方向或面部表情。"
        + gz["ref"].format(n=n)
        + "使用参考图中的画风，但穿着 prompt 里描述的服装，不要穿参考图里的衣服。"
    )
    avatar = "\n".join([
        portrait_anchor,
        "画面描述：方形胸像头像构图（从头顶到胸口以下），人物位于画面前景，脸部大而清晰、占画面约一半高度，"
        "肩膀和上臂入画，手最多在画面下缘露出一部分。"
        + spec["avatar_person"] + spec["skin_hair"] + spec["avatar_expression"]
        + "身体动作：" + spec["avatar_pose"] + "。" + spec["avatar_scene"] + spec["avatar_color"],
        gz["action"] + "；身体动作：" + spec["avatar_pose"] + "】",
        avatar_ref,
        ANAT,
    ])

    life = "\n".join([
        anchor,
        "画面描述：" + spec["life_scene"] + spec["life_person"] + spec["skin_hair"] + spec["life_light"],
        f"【本张必须使用的人物动作：{spec['life_action']}】" + spec["life_action_text"],
        life_ref,
        ANAT,
    ])
    return {"sheet": sheet, "avatar": avatar, "life": life}


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    target = Path(sys.argv[1]).resolve()
    if target.name == "examples":
        spec_path, out_dir = target / "spec.example.json", target
    else:
        spec_path, out_dir = target / "spec.json", target
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    for kind, text in build(spec).items():
        (out_dir / f"{kind}.txt").write_text(text, encoding="utf-8")
        print(f"{kind}.txt  {len(text)} 字  →  {out_dir}")


if __name__ == "__main__":
    main()
