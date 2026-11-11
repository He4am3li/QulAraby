#!/usr/bin/env python3
"""Report ALL editable PSDs, including partially detected art, without false approvals.

PSD formats can change RGB in semitransparent pixels; never claim pixel-perfect
PSD rendering unless it is measured. The neutral OpenRaster source retains its
original pixel-exact reference.
"""
from pathlib import Path
from zipfile import ZipFile
import argparse
import io
import json
import numpy as np
from PIL import Image
from psd_tools import PSDImage

REQUIRED = [
    "torso", "arm_left", "arm_right", "head", "mouth",
    "eye_left", "eye_right", "DRAFT_underpainting_NOT_APPROVED",
    "Original_Pixel_Reference_LOCKED",
]

def compare(a, b):
    aa = np.asarray(a.convert("RGBA"), dtype=np.int16)
    bb = np.asarray(b.convert("RGBA"), dtype=np.int16)
    if aa.shape != bb.shape:
        raise ValueError(f"Canvas dimensions mismatch: {aa.shape} vs {bb.shape}")
    alpha = aa[:, :, 3]
    rgbdiff = np.max(np.abs(aa[:, :, :3] - bb[:, :, :3]), axis=2)
    return {
        "alpha_changed": int(np.count_nonzero(alpha != bb[:, :, 3])),
        "opaque_rgb_changed": int(np.count_nonzero((alpha == 255) & (rgbdiff != 0))),
        "edge_rgb_changed": int(np.count_nonzero((alpha > 0) & (alpha < 255) & (rgbdiff != 0))),
        "edge_pixels": int(np.count_nonzero((alpha > 0) & (alpha < 255))),
        "visible_max_rgb_error": int(rgbdiff[alpha > 0].max()) if (alpha > 0).any() else 0,
    }


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--ora", required=True)
    p.add_argument("--psd", required=True)
    p.add_argument("--expected", type=int, default=43)
    args = p.parse_args()
    ora_dir, psd_dir = Path(args.ora), Path(args.psd)
    inputs = sorted(ora_dir.glob("*.ora"))
    if len(inputs) != args.expected:
        raise RuntimeError(f"Expected {args.expected} ORA masters, found {len(inputs)}")
    reports = []
    for index, ora in enumerate(inputs, 1):
        psd_path = psd_dir / (ora.stem + ".psd")
        if not psd_path.exists():
            reports.append({"id": ora.stem, "status": "missing_psd"})
            continue
        with ZipFile(ora) as z:
            reference = Image.open(io.BytesIO(z.read("data/original.png"))).convert("RGBA")
            original_merge = Image.open(io.BytesIO(z.read("mergedimage.png"))).convert("RGBA")
            if np.any(np.asarray(reference) != np.asarray(original_merge)):
                raise RuntimeError(f"ORA source pixel mismatch: {ora.name}")
        psd = PSDImage.open(psd_path)
        layers = list(psd)
        names = [layer.name.rstrip("\x00") for layer in layers]
        missing = sorted(set(REQUIRED) - set(names))
        visible = psd.composite()
        if visible is None or visible.size != reference.size:
            reports.append({"id": ora.stem, "status": "invalid_composite", "missing_layers": missing})
            continue
        checks = compare(reference, visible)
        original_layer = next((layer for layer in layers
                               if layer.name.rstrip("\x00") == "Original_Pixel_Reference_LOCKED"), None)
        original_layer_decoded = bool(original_layer is not None and original_layer.topil() is not None)
        # Missing or zero-pixel feature layers are NOT silently labelled complete.
        status = ("editable_psd_draft_for_artist_review"
                  if not missing and checks["alpha_changed"] == 0
                  and checks["opaque_rgb_changed"] == 0
                  else "artwork_needs_manual_repair")
        row = {
            "id": ora.stem, "layers": len(layers), "missing_layers": missing,
            "reference_layer_decodable": original_layer_decoded,
            "neutral_display": checks, "status": status,
            "live2d_ready": False, "facial_animation_approved": False
        }
        reports.append(row)
        print(f"{index}/{len(inputs)} {ora.stem}: {len(layers)} layers, "
              f"missing={missing}, alpha bad={checks['alpha_changed']}, "
              f"opaque RGB bad={checks['opaque_rgb_changed']}", flush=True)
    approved_as_drafts = sum(x["status"] == "editable_psd_draft_for_artist_review" for x in reports)
    summary = {
        "expected": len(inputs), "full_layered_editable_drafts": approved_as_drafts,
        "manual_repair_required": len(inputs) - approved_as_drafts,
        "neutral_ora_original_pixel_exact": len(inputs),
        "live2d_ready": 0,
        "note": "Source pixels guaranteed in ORA. PSD antialiased-edge RGB may be converted by Krita. No PSD is certified for facial animation until human artwork review.",
        "characters": reports,
    }
    (psd_dir / "psd-verification.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({k:v for k,v in summary.items() if k!="characters"},indent=2))
    if approved_as_drafts != len(inputs):
        raise SystemExit(f"PSD preparation incomplete: {approved_as_drafts}/{len(inputs)} need no missing parts; "
                         "review PSD report and manually repair excluded images.")


if __name__ == "__main__":
    main()
