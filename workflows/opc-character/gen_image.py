#!/usr/bin/env python3
"""用米羊网关出图（文生图 / 垫图），可一次并发出多张候选。

KEY 不在仓库里：从环境变量 MIYANG_API_KEY 读，其次读本目录或仓库根的 .env；
都没有就报错并告诉你怎么拿。自助创建：https://miyang.cn/console/keys
不想用米羊网关？看 README「换一个生图工具」，用 build_prompts.py 生成的 .txt 喂给任意生图工具即可。

用法：
    # 三视图：只用文本，1536x1024
    python3 gen_image.py --prompt sheet.txt --size 1536x1024 --out sheet_v1.png

    # 头像：只垫选定的那一张三视图，一次出 2 张候选（avatar_v1a.png、avatar_v1b.png）
    python3 gen_image.py --prompt avatar.txt --size 1024x1024 --ref sheet_v1.png --count 2 --out avatar_v1.png

    # 生活照
    python3 gen_image.py --prompt life.txt --size 1024x1536 --ref sheet_v1.png --out life_v1.png

只依赖 httpx（pip install httpx）。
"""
from __future__ import annotations

import argparse
import base64
import mimetypes
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

try:
    import httpx
except ImportError:  # pragma: no cover
    sys.exit("缺少依赖：pip install httpx")

HERE = Path(__file__).resolve().parent
KEYS_URL = "https://miyang.cn/console/keys"
BASE_URL = os.environ.get("MIYANG_BASE_URL", "https://miyang.cn/api/v1")
MODEL = os.environ.get("MIYANG_IMAGE_MODEL", "miyang/image-1")
MAX_PARALLEL = 3  # 网关对同一把 KEY 约 3 路并发，再多会 429


def read_key() -> str:
    key = os.environ.get("MIYANG_API_KEY", "").strip()
    if key:
        return key
    for env_file in (HERE / ".env", HERE.parent.parent / ".env"):
        if not env_file.exists():
            continue
        for line in env_file.read_text("utf-8").splitlines():
            line = line.strip()
            if line.startswith("#") or "=" not in line:
                continue
            name, _, value = line.partition("=")
            if name.strip() == "MIYANG_API_KEY" and value.strip().strip("'\""):
                return value.strip().strip("'\"")
    return ""


def one_call(key: str, prompt: str, size: str, refs: list[Path], timeout: float) -> bytes:
    headers = {"Authorization": f"Bearer {key}"}
    with httpx.Client(timeout=httpx.Timeout(connect=30, read=timeout, write=300, pool=30)) as c:
        if not refs:
            r = c.post(f"{BASE_URL}/images/generations", headers=headers,
                       json={"model": MODEL, "prompt": prompt, "n": 1, "size": size})
        else:
            # 多图重复 image[]；个别部署只认单个 image，400/422 时退回只带第一张。
            def files(field: str, items: list[Path]):
                return [(field, (p.name, p.read_bytes(), mimetypes.guess_type(p.name)[0] or "image/png")) for p in items]
            data = {"model": MODEL, "prompt": prompt, "size": size}
            r = c.post(f"{BASE_URL}/images/edits", headers=headers, files=files("image[]", refs), data=data)
            if r.status_code in (400, 422):
                r = c.post(f"{BASE_URL}/images/edits", headers=headers, files=files("image", refs[:1]), data=data)
        if r.status_code != 200:
            raise RuntimeError(f"HTTP {r.status_code}：{r.text[:300]}")
        item = r.json()["data"][0]
        if item.get("b64_json"):
            return base64.b64decode(item["b64_json"])
        img = c.get(item["url"], headers=headers, timeout=120)
        img.raise_for_status()
        return img.content


def job(key: str, prompt: str, size: str, refs: list[Path], out: Path, retries: int, timeout: float) -> str:
    if out.exists():
        return f"跳过（已存在） {out.name}"
    for attempt in range(1, retries + 1):
        try:
            out.write_bytes(one_call(key, prompt, size, refs, timeout))
            return f"完成 {out.name}"
        except Exception as e:  # noqa: BLE001
            msg = str(e)
            if "HTTP 4" in msg and "HTTP 429" not in msg:
                return f"失败 {out.name}：{msg}"  # 4xx（除限流）重试没有意义
            time.sleep(15 * attempt)
    return f"失败 {out.name}：重试 {retries} 次仍未成功"


def main() -> None:
    ap = argparse.ArgumentParser(description="米羊网关出图")
    ap.add_argument("--prompt", required=True, help="提示词文件（build_prompts.py 的输出）")
    ap.add_argument("--out", required=True, help="输出 png；--count>1 时依次加后缀 a、b、c")
    ap.add_argument("--size", default="1024x1024", help="三视图 1536x1024 / 头像 1024x1024 / 生活照 1024x1536")
    ap.add_argument("--ref", action="append", default=[], help="参考图，可重复；不给就是文生图")
    ap.add_argument("--count", type=int, default=1, help="一次出几张候选")
    ap.add_argument("--retries", type=int, default=4)
    ap.add_argument("--timeout", type=float, default=240.0)
    args = ap.parse_args()

    key = read_key()
    if not key:
        sys.exit(
            "没有找到 MIYANG_API_KEY。\n"
            f"1) 去 {KEYS_URL} 自助创建一把 KEY\n"
            "2) 复制 .env.example 为 .env，填入 MIYANG_API_KEY=...（或 export MIYANG_API_KEY=...）\n"
            "不想用米羊网关，可以改用 Codex / Cursor 自带生图工具，见 README「换一个生图工具」。"
        )
    prompt = Path(args.prompt).read_text("utf-8").strip()
    refs = [Path(r) for r in args.ref]
    for r in refs:
        if not r.exists():
            sys.exit(f"参考图不存在：{r}")
    out = Path(args.out)
    outs = [out] if args.count == 1 else [out.with_name(f"{out.stem}{chr(97 + i)}{out.suffix}") for i in range(args.count)]
    print(f"模型 {MODEL} | {args.size} | 参考图 {len(refs)} 张 | 共 {len(outs)} 张，单张约 1 到 3 分钟…")
    with ThreadPoolExecutor(min(MAX_PARALLEL, len(outs))) as ex:
        futs = [ex.submit(job, key, prompt, args.size, refs, o, args.retries, args.timeout) for o in outs]
        results = [f.result() for f in futs]
    print("\n".join(results))
    if any(x.startswith("失败") for x in results):
        sys.exit(1)


if __name__ == "__main__":
    main()
