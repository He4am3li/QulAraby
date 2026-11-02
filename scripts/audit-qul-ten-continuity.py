#!/usr/bin/env python3
"""Safety audit of 10 source-preserving QUL motion proof exports.

Requires Pillow, numpy, OpenCV. Checks only technical shape/coverage invariants.
Never treats clean coverage as certification of eye or garment animation.
"""
from pathlib import Path
import argparse
import json
import numpy as np
import cv2
from PIL import Image

IDS = ("uae_male", "oman_male", "kuwait_male", "syria_male",
       "palestine_male", "algeria_female", "djibouti_female",
       "iraq_female", "oman_female", "algeria_male")

def audit(root):
    checks = []
    for name in IDS:
        original_path = root / name / "original.png"
        if not original_path.exists():
            raise RuntimeError(f"Missing immutable original: {original_path}")
        original = np.array(Image.open(original_path).convert("RGBA"))
        core = cv2.erode((original[:, :, 3] > 220).astype("uint8"),
                         np.ones((3, 3), np.uint8)) > 0
        for state in ("motion_left", "motion_right"):
            f = root / name / (state + ".png")
            if not f.exists():
                raise RuntimeError(f"Missing {name} {state}")
            motion = np.array(Image.open(f).convert("RGBA"))
            if original.shape != motion.shape:
                raise RuntimeError(f"Unexpected canvas change: {f}")
            holes = int(np.count_nonzero(core & (motion[:, :, 3] < 60)))
            if holes:
                raise RuntimeError(f"Source interior transparency: {f}: {holes} pixels")
            checks.append({"character": name, "pose": state,
                           "source_interior_alpha_holes": holes,
                           "artist_approved": False})
    return {"characters": len(IDS), "pose_tests": len(checks),
            "core_holes_after_original_pixel_fallback": 0,
            "approved_live2d_rigs": 0,
            "notes": "The original image is kept as neutral pose. A 0-hole result does not certify garment edge, hair, face, phoneme or real Cubism mesh quality.",
            "checks": checks}

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("root", type=Path, help="Unpacked QUL ten motion QA ZIP directory")
    args = p.parse_args()
    print(json.dumps(audit(args.root), ensure_ascii=False, indent=2))
