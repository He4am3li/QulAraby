#!/usr/bin/env python3
"""Prepare QUL penalty-cinematic media from the unmodified, verified source PPTX.

The downloaded PPTX must hash-identically match the original file provided by the
project owner. This script never distributes the PowerPoint file itself.
"""
from __future__ import annotations

import hashlib
import io
from pathlib import Path
import shutil
import subprocess
import tempfile
from urllib.parse import quote
from urllib.request import Request, urlopen
from zipfile import ZipFile

EXPECTED_SHA256 = "af9abfa3d19f198e34acd5c893e5e70b0d97628b0bbcc224fc163619a658990b"
SOURCE = "https://d2foykt2o508ve.cloudfront.net/Download/" + quote(
    "العاب+تعليمية/لعبة+تحدي+الاهداف+-موقع+انجز.pptx", safe="/+"
)
OUTPUT = Path(__file__).resolve().parent.parent / "public" / "penalty-cinematic"

def run(*args: str) -> None:
    subprocess.run(args, check=True, stdout=subprocess.DEVNULL)

def main() -> None:
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise SystemExit("ffmpeg must be installed in the build environment")
    print("Fetching original educational template (verification is mandatory)")
    req = Request(SOURCE, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=90) as response:
        payload = response.read()
    actual = hashlib.sha256(payload).hexdigest()
    if actual != EXPECTED_SHA256:
        raise SystemExit("Source PowerPoint SHA-256 differs from uploaded reference")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="qul-penalty-") as t:
        root = Path(t)
        with ZipFile(io.BytesIO(payload)) as zf:
            for name in ("media3.mp4", "media5.mp4"):
                (root / name).write_bytes(zf.read("ppt/media/" + name))

        # Both clips include the original gray-uniform striker and goalkeeper,
        # net, ball and stadium. Do not overlay synthetic duplicate characters.
        run(ffmpeg, "-hide_banner", "-loglevel", "error", "-y",
            "-ss", "0.08", "-i", str(root / "media3.mp4"),
            "-frames:v", "1", "-vf", "scale=1280:-2",
            "-c:v", "libwebp", "-quality", "73", str(OUTPUT / "ready.webp"))

        for source_name, destination in (
            ("media3.mp4", "goal.webm"), ("media5.mp4", "save.webm")
        ):
            run(ffmpeg, "-hide_banner", "-loglevel", "error", "-y",
                "-i", str(root / source_name),
                "-vf", "scale=960:-2,fps=20", "-an",
                "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "43",
                "-deadline", "realtime", "-cpu-used", "6",
                str(OUTPUT / destination))

    for media in ("ready.webp", "goal.webm", "save.webm"):
        size = (OUTPUT / media).stat().st_size
        assert size > 1000, f"Generated asset is too small: {media}"
        print(f"Created {media}: {size:,} bytes")

if __name__ == "__main__":
    main()
