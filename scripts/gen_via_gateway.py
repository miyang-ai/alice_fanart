#!/usr/bin/env python3.11
"""用米羊网关出图，主要为了拿 Cursor 内置工具给不到的 4K。

默认通道是 Cursor 内置 GenerateImage（Image 2.5 垫图），只有用户明确要 4K / 印刷级
尺寸时才走本脚本，规矩见 docs/垫图逻辑.md 第十一节。Cursor 的 GenerateImage 只能选
比例，实际落到 1280x720 这一档；参展喷绘、印刷物料需要 3840x2160 时走这里。可用模型：
miyang/image-hd（高清 / 4K，默认）与 miyang/image-1（标准档，更快更省）。

KEY 从仓库根 .env 的 MIYANG_API_KEY 读，环境变量优先。没有就照 .env.example 建一份，
KEY 在 https://miyang.cn/console/keys 自助创建。

用法：
    python3.11 scripts/gen_via_gateway.py \
        --prompt-file /tmp/prompt.txt \
        --out 'outputs/2026-10-01_national_day_splash_Alice国庆开屏/alice_national_day_splash_v4.png' \
        --ref refs/alice/ref_sheets/ref_sheet_alice.jpg \
        --ref refs/alice/wardrobe/wardrobe_smart_casual.png
"""

from __future__ import annotations

import argparse
import base64
import mimetypes
import os
import sys
from pathlib import Path

import httpx

BASE_URL = "https://miyang.cn/api/v1"
MODEL_HD = "miyang/image-hd"   # 高清 / 4K 档
MODEL_STD = "miyang/image-1"   # 标准档

REPO = Path(__file__).resolve().parent.parent
KEYS_URL = "https://miyang.cn/console/keys"


def _resolve(p: str) -> Path:
    path = Path(p)
    return path if path.is_absolute() else REPO / path


def _read_api_key() -> str:
    """环境变量优先，其次仓库根 .env。"""
    key = os.environ.get("MIYANG_API_KEY", "").strip()
    if key:
        return key

    env_file = REPO / ".env"
    if env_file.exists():
        for line in env_file.read_text("utf-8").splitlines():
            line = line.strip()
            if line.startswith("#") or "=" not in line:
                continue
            name, _, value = line.partition("=")
            if name.strip() == "MIYANG_API_KEY":
                return value.strip().strip("'\"")
    return ""


def _post(api_key: str, *, model: str, prompt: str, size: str, quality: str,
          refs: list[Path], timeout: float) -> dict:
    headers = {"Authorization": f"Bearer {api_key}"}
    data = {"model": model, "prompt": prompt, "size": size, "quality": quality, "n": "1"}

    if not refs:
        url = f"{BASE_URL}/images/generations"
        with httpx.Client(timeout=httpx.Timeout(connect=30.0, read=timeout, write=120.0, pool=30.0)) as c:
            resp = c.post(url, headers={**headers, "Content-Type": "application/json"},
                          json={**data, "n": 1})
    else:
        # 网关按字段名区分文件与文本；多图必须重复 image[]，单图用 image。
        field = "image" if len(refs) == 1 else "image[]"
        files = [
            (field, (r.name, r.read_bytes(), mimetypes.guess_type(r.name)[0] or "image/png"))
            for r in refs
        ]
        url = f"{BASE_URL}/images/edits"
        with httpx.Client(timeout=httpx.Timeout(connect=30.0, read=timeout, write=300.0, pool=30.0)) as c:
            resp = c.post(url, headers=headers, files=files, data=data)

    if resp.status_code != 200:
        sys.exit(f"网关返回 {resp.status_code}：{resp.text[:600]}")
    return resp.json()


def _fetch_bytes(item: dict, api_key: str) -> bytes:
    if item.get("b64_json"):
        return base64.b64decode(item["b64_json"])
    with httpx.Client(timeout=120.0) as c:
        # 缓存 URL 带签名，但网关也认同一把 Bearer。
        r = c.get(item["url"], headers={"Authorization": f"Bearer {api_key}"})
        r.raise_for_status()
        return r.content


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompt-file", required=True, help="提示词全文，UTF-8 纯文本")
    ap.add_argument("--out", required=True, help="输出 png 路径，相对仓库根")
    ap.add_argument("--ref", action="append", default=[], help="参考图，可重复；不给则走文生图")
    ap.add_argument("--size", default="3840x2160", help="长边 ≤3840，宽高为 16 的倍数")
    ap.add_argument("--quality", default="high")
    ap.add_argument("--model", default=MODEL_HD,
                    help=f"默认高清档 {MODEL_HD}；标准档用 {MODEL_STD}")
    ap.add_argument("--timeout", type=float, default=900.0)
    args = ap.parse_args()

    api_key = _read_api_key()
    if not api_key.startswith("miyang-"):
        sys.exit(
            "缺少可用的 MIYANG_API_KEY（miyang- 开头）。\n"
            f"1) 去 {KEYS_URL} 自助创建一把 KEY\n"
            "2) 在仓库根建 .env（可复制 .env.example），写入 MIYANG_API_KEY=miyang-...\n"
            ".env 已在 .gitignore，不会被提交。"
        )

    prompt = _resolve(args.prompt_file).read_text("utf-8").strip()
    refs = [_resolve(r) for r in args.ref]
    for r in refs:
        if not r.exists():
            sys.exit(f"参考图不存在：{r}")

    out = _resolve(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)

    print(f"模型 {args.model} | size {args.size} | 参考图 {len(refs)} 张 | 出图需 1-3 分钟…")
    payload = _post(api_key, model=args.model, prompt=prompt, size=args.size,
                    quality=args.quality, refs=refs, timeout=args.timeout)
    out.write_bytes(_fetch_bytes(payload["data"][0], api_key))

    from PIL import Image
    print(f"已保存 {out}  实际尺寸 {Image.open(out).size}")


if __name__ == "__main__":
    main()
