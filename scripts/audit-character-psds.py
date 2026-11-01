#!/usr/bin/env python3
"""Inspect actual layered PSD exports from Krita, refusing flattened impostors.

Only reports artistic preparation, never calls the result a certified Cubism
rig. The unmodified source reference is also retained in the ORA archive.
"""
from pathlib import Path
from zipfile import ZipFile
import argparse
import io
import json
import numpy as np
from PIL import Image
from psd_tools import PSDImage

REQUIRED = (
    "torso", "arm_left", "arm_right", "head",
    "mouth", "eye_left", "eye_right",
    "Original_Pixel_Reference_LOCKED",
)

def compare_pixels(source: Image.Image, candidate: Image.Image):
    x = np.asarray(source.convert("RGBA"), dtype=np.int16)
    y = np.asarray(candidate.convert("RGBA"), dtype=np.int16)
    visible = x[:, :, 3] > 0
    rgb_diff = np.max(np.abs(x[:, :, :3][visible] - y[:, :, :3][visible]), axis=1) if visible.any() else np.zeros(0)
    alpha_diff = np.abs(x[:, :, 3] - y[:, :, 3])
    return {
        "max_rgb_error": int(rgb_diff.max()) if rgb_diff.size else 0,
        "max_alpha_error": int(alpha_diff.max()),
        "changed_rgb_pixels": int((rgb_diff > 1).sum()),
        "changed_alpha_pixels": int((alpha_diff > 0).sum()),
    }

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
            source_reference = Image.open(io.BytesIO(z.read("data/original.png"))).convert("RGBA")
            ora_audit = compare_pixels(source, source_reference)
            if ora_audit["max_rgb_error"] != 0 or ora_audit["max_alpha_error"] != 0:
                raise RuntimeError(f"ORA reference mismatch: {ora.name}")
        psd = PSDImage.open(dst)
        layers = list(psd)
        names = {layer.name.rstrip('\x00') for layer in layers}
        if not set(REQUIRED).issubset(names) or len(layers) < 9:
            raise RuntimeError(f"PSD missing layers: {dst.name}, found {sorted(names)}")
        if psd.size != source.size:
            raise RuntimeError(f"PSD canvas dimensions differ: {dst.name}")
        original = next(layer for layer in layers if layer.name.rstrip("\x00") == "Original_Pixel_Reference_LOCKED")
        # psd-tools.topil() may return None for hidden layers on some Krita
        # exports. Record this separately; do not treat absence of pixels as proof
        # the reference survived export.
        ref = original.topil()
        ref_check = None
        if ref is not None and ref.size == source.size:
            ref_check = compare_pixels(source, ref)
        comp = psd.composite()
        if comp is None:
            raise RuntimeError(f"PSD has no visible composited image: {dst.name}")
        composite_check = compare_pixels(source, comp)
        report = {
            "id": ora.stem, "layers": len(layers),
            "reference_layer_name_present": True,
            "reference_layer_pixels_decodable": ref is not None,
            "reference_layer_bbox": [original.left, original.top, original.right, original.bottom],
            "reference_pixel_audit": ref_check,
            "visible_composite_audit": composite_check,
            "status": "editable_psd_draft_not_live2d_ready",
        }
        reports.append(report)
        print(f"{len(reports)}/{len(sources)} {ora.stem}: {len(layers)} layers, "
              f"reference-decoded={ref is not None}, composite={composite_check}", flush=True)
        # Fail on changes above one RGB level, or any change to alpha coverage.
        # This is intentionally strict to protect the user's original likeness.
        if composite_check["changed_rgb_pixels"] or composite_check["changed_alpha_pixels"]:
            (psd_dir / "psd-verification-debug.json").write_text(
                json.dumps(reports, ensure_ascii=False, indent=2), encoding="utf-8")
            raise RuntimeError(f"PSD composite failed original visual fidelity: {dst.name}")
        if ref_check is not None and (
            ref_check["changed_rgb_pixels"] or ref_check["changed_alpha_pixels"]
        ):
            raise RuntimeError(f"PSD reference image changed: {dst.name}")
    (psd_dir / "psd-verification.json").write_text(
        json.dumps({
            "characters": len(reports), "source_neutral_composites_verified": len(reports),
            "embedded_reference_decodable": sum(x["reference_layer_pixels_decodable"] for x in reports),
            "layered_psd_drafts": len(reports), "live2d_ready": 0, "results": reports,
        }, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
