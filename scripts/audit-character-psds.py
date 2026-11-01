#!/usr/bin/env python3
"""Audit actual layered PSD exports from Krita. Refuse flattened PSD impostors."""
from pathlib import Path
from zipfile import ZipFile
import argparse
import io
import json
import numpy as np
from PIL import Image
from psd_tools import PSDImage


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--ora", required=True)
    parser.add_argument("--psd", required=True)
    parser.add_argument("--expected", type=int, default=43)
    args = parser.parse_args()
    ora_dir, psd_dir = Path(args.ora), Path(args.psd)
    sources = sorted(ora_dir.glob("*.ora"))
    if len(sources) != args.expected:
        raise RuntimeError(f"Expected {args.expected} ORA files, found {len(sources)}")
    reports = []
    for ora in sources:
        dst = psd_dir / (ora.stem + ".psd")
        if not dst.is_file():
            raise RuntimeError(f"Missing PSD export: {dst.name}")
        with ZipFile(ora) as z:
            source = Image.open(io.BytesIO(z.read("mergedimage.png"))).convert("RGBA")
        psd = PSDImage.open(dst)
        if len(list(psd)) < 8:
            raise RuntimeError(f"PSD is flattened/missing layers: {dst.name}")
        if psd.size != source.size:
            raise RuntimeError(f"PSD canvas dimensions differ: {dst.name}")
        original = next((layer for layer in psd if "Original_Pixel_Reference" in layer.name), None)
        if original is None:
            raise RuntimeError(f"PSD lost original reference: {dst.name}")
        # Verify that the original reference pixels survived ORA -> PSD.
        ref = original.topil()
        if ref is None or ref.size != source.size:
            raise RuntimeError(f"PSD original reference cannot be decoded: {dst.name}")
        a = np.asarray(source, dtype=np.int16)
        b = np.asarray(ref.convert("RGBA"), dtype=np.int16)
        visible = a[:, :, 3] > 0
        max_rgb_error = int(np.max(np.abs(a[:, :, :3][visible] - b[:, :, :3][visible]))) if visible.any() else 0
        alpha_error = int(np.max(np.abs(a[:, :, 3] - b[:, :, 3])))
        if max_rgb_error > 1 or alpha_error != 0:
            raise RuntimeError(f"PSD changed original pixels: {dst.name}, RGB max error {max_rgb_error}, alpha {alpha_error}")
        reports.append({"id": ora.stem, "layers": len(list(psd)),
                        "original_rgb_max_error": max_rgb_error,
                        "original_alpha_max_error": alpha_error,
                        "status": "editable_psd_draft_not_live2d_ready"})
        print(f"{len(reports)}/{len(sources)} {ora.stem}: preserved source, {len(list(psd))} PSD layers", flush=True)
    (psd_dir / "psd-verification.json").write_text(
        json.dumps({"characters": len(reports), "source_pixels_verified": len(reports),
                    "live2d_ready": 0, "results": reports}, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
