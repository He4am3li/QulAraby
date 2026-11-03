#!/usr/bin/env python3
"""Non-destructive, source-pixel QUL 43-portrait layered-artwork batch.

Outputs editable OpenRaster (ORA), lossless layer PNGs, and an audit per
character. The visible neutral pose must reconstruct the input image exactly.
No synthetic eyes, speech shapes, or unapproved Live2D rigs are advertised.
Run on a machine that has Pillow, numpy, OpenCV and mediapipe installed.
"""
from __future__ import annotations

import argparse
import io
import json
import math
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

import cv2
import numpy as np
from PIL import Image

PARTS = ("torso", "arm_left", "arm_right", "head", "mouth", "eye_left", "eye_right")
FACE_LEFT = [33, 160, 158, 133, 153, 144]
FACE_RIGHT = [362, 385, 387, 263, 373, 380]
FACE_MOUTH = [61, 40, 37, 0, 267, 270, 291, 321, 314, 17, 84, 91]


def png_bytes(image):
    out = io.BytesIO()
    image.save(out, "PNG", optimize=True)
    return out.getvalue()


def landmark_polygon(face, indices, width, height, stretch=1.20):
    points = np.array([(face[i].x * width, face[i].y * height) for i in indices], dtype=np.float32)
    center = points.mean(axis=0)
    points = center + (points - center) * stretch
    return np.round(points).astype(np.int32)


def mask_polygon(shape, points):
    result = np.zeros(shape, np.uint8)
    cv2.fillConvexPoly(result, cv2.convexHull(points), 255)
    return result


def build_masks(image, pose_estimator, face_estimator):
    width, height = image.size
    h, w = height, width
    rgb = np.asarray(image.convert("RGB"))
    pose_out = pose_estimator.process(rgb)
    face_out = face_estimator.process(rgb)
    person_alpha = np.asarray(image.getchannel("A")) > 0
    masks = {part: np.zeros((h, w), np.uint8) for part in PARTS}
    notes = []
    confidence = {"face": False, "face_method": "none", "pose": False, "arms": []}
    face = face_out.multi_face_landmarks[0].landmark if face_out.multi_face_landmarks else None

    # Small full-body portraits make the face tiny. First recover a face-only
    # high-resolution inference crop from the pose nose and shoulders.
    # Upscaling here is ONLY for landmark detection; output pixels are untouched.
    if face is None and pose_out.pose_landmarks:
        from types import SimpleNamespace
        landmarks = pose_out.pose_landmarks.landmark
        nose, ls, rs = landmarks[0], landmarks[11], landmarks[12]
        shoulders = max(38.0, math.dist((ls.x * w, ls.y * h), (rs.x * w, rs.y * h)))
        if nose.visibility >= .25:
            for multiplier in (1.0, 1.4, 1.9):
                half_w = max(38, int(shoulders * .66 * multiplier))
                half_h = max(49, int(shoulders * .89 * multiplier))
                cx = int(nose.x * w)
                cy = int(nose.y * h - .20 * half_h)
                x0, x1 = max(0, cx - half_w), min(w, cx + half_w)
                y0, y1 = max(0, cy - half_h), min(h, cy + half_h)
                if x1 - x0 < 32 or y1 - y0 < 36:
                    continue
                crop = rgb[y0:y1, x0:x1]
                upscale = min(6.0, max(1.0, 512.0 / max(crop.shape[:2])))
                scan = cv2.resize(crop, None, fx=upscale, fy=upscale, interpolation=cv2.INTER_CUBIC)
                candidate = face_estimator.process(scan)
                if candidate.multi_face_landmarks:
                    detected = candidate.multi_face_landmarks[0].landmark
                    face = [SimpleNamespace(x=(x0 + point.x * (x1 - x0)) / w,
                                            y=(y0 + point.y * (y1 - y0)) / h)
                            for point in detected]
                    confidence["face_method"] = "pose_guided_crop"
                    break

    if face is not None:
        confidence["face"] = True
        if confidence["face_method"] == "none":
            confidence["face_method"] = "full_portrait"
        xy = np.array([(p.x * w, p.y * h) for p in face], np.float32)
        xmin, ymin = xy.min(axis=0)
        xmax, ymax = xy.max(axis=0)
        face_w = max(10, xmax - xmin)
        face_h = max(12, ymax - ymin)
        cx = (xmin + xmax) / 2
        cy = (ymin + ymax) / 2
        # Conservative envelope: mouth/eyes in their original pixels, top of
        # head includes forehead/hair. Repainting of hidden hair is NOT done.
        cv2.ellipse(masks["head"], (int(cx), int(cy - .12 * face_h)),
                    (max(6, int(.82 * face_w)), max(8, int(.90 * face_h))), 0, 0, 360, 255, -1)
        for key, indices, scale in (("eye_left", FACE_LEFT, 1.22),
                                    ("eye_right", FACE_RIGHT, 1.22),
                                    ("mouth", FACE_MOUTH, 1.15)):
            poly = landmark_polygon(face, indices, w, h, scale)
            masks[key] = mask_polygon((h, w), poly)
        notes.append("Facial partitions are original-pixel crops, NOT blink or viseme drawings.")
    else:
        notes.append("Face landmarks unavailable; do not rig facial movements.")

    if pose_out.pose_landmarks:
        landmarks = pose_out.pose_landmarks.landmark
        confidence["pose"] = True
        def position(i):
            p = landmarks[i]
            return (int(p.x * w), int(p.y * h)), p.visibility
        (ls, lsc), (rs, rsc) = position(11), position(12)
        shoulder_width = max(16, math.dist(ls, rs))
        if not confidence["face"]:
            # Fallback rough head region, NEVER suitable for facial rigging.
            center = ((ls[0] + rs[0]) // 2, max(0, min(ls[1], rs[1]) - int(.11 * h)))
            cv2.ellipse(masks["head"], center,
                        (max(8, int(.46 * shoulder_width)), max(12, int(.115 * h))),
                        0, 0, 360, 255, -1)
        # Shoulder to elbow to wrist geometry is only a draft. Masking the
        # actual sleeve outline requires per-character visual verification.
        for name, trio in (("arm_left", (11, 13, 15)), ("arm_right", (12, 14, 16))):
            values = [position(i) for i in trio]
            if min(item[1] for item in values) < 0.42:
                notes.append(name + ": low landmark confidence, part not extracted.")
                continue
            points = [item[0] for item in values]
            radius = max(5, int(shoulder_width * .145))
            cv2.line(masks[name], points[0], points[1], 255, radius * 2)
            cv2.line(masks[name], points[1], points[2], 255, int(radius * 1.72))
            for p, rad in zip(points, (radius, radius, int(radius * .7))):
                cv2.circle(masks[name], p, max(3, rad), 255, -1)
            confidence["arms"].append(name)
        notes.append("Arm partitions are pose-guided proposals, NOT approved sleeve boundaries.")
    else:
        notes.append("Pose landmarks unavailable; arms remain in torso until reviewed.")

    # Resolve all overlaps into exclusive original-image pixels. Every visible
    # source pixel belongs to exactly ONE layer, preserving the neutral image.
    claimed = np.zeros((h, w), bool)
    for part in reversed(PARTS[1:]):
        target = (masks[part] > 0) & person_alpha & ~claimed
        masks[part] = (target.astype(np.uint8) * 255)
        claimed |= target
    masks["torso"] = ((person_alpha & ~claimed).astype(np.uint8) * 255)
    return masks, confidence, notes


def export_character(source, output, pose, face, preview):
    with Image.open(source) as img:
        original = img.convert("RGBA")
    w, h = original.size
    pixels = np.asarray(original).copy()
    masks, confidence, notes = build_masks(original, pose, face)
    layers = {}
    for part in PARTS:
        array = pixels.copy()
        array[:, :, 3] = np.where(masks[part] > 0, array[:, :, 3], 0)
        layers[part] = Image.fromarray(array, "RGBA")

    # Compositing original pixels on a transparent canvas MUST be exact.
    merged = Image.new("RGBA", (w, h))
    for part in PARTS:
        merged = Image.alpha_composite(merged, layers[part])
    before = np.asarray(original)
    after = np.asarray(merged)
    mismatch = (before[:, :, 3] != after[:, :, 3]) | (
        (before[:, :, 3] > 0) & np.any(before[:, :, :3] != after[:, :, :3], axis=2)
    )
    mismatch_pixels = int(mismatch.sum())
    if mismatch_pixels:
        raise ValueError(f"Source pixel fidelity FAILED: {mismatch_pixels} visible pixels changed")

    # Motion QA exposed large transparent seams behind detached arms.
    # Reconstruct BOTH covered sleeves and the head zone in a hidden draft
    # underpainting layer. This cannot replace artist-made garment patterns.
    # The original layers and pixel-exact neutral pose remain untouched.
    repair_region = np.zeros((h, w), dtype=np.uint8)
    for part in ("arm_left", "arm_right", "head", "eye_left", "eye_right", "mouth"):
        repair_region = np.maximum(repair_region, masks[part])
    repair_region = cv2.dilate(repair_region, np.ones((7, 7), np.uint8), iterations=1)
    edit_underlay = np.asarray(original.convert("RGB")).copy()
    if np.any(repair_region):
        edit_underlay = cv2.inpaint(edit_underlay, repair_region, 3, cv2.INPAINT_TELEA)
    original_alpha = np.asarray(original.getchannel("A"))
    underpaint_alpha = np.where((repair_region > 0) & (original_alpha > 0), 255, 0).astype("uint8")
    underlay = Image.fromarray(np.dstack([edit_underlay, underpaint_alpha]), "RGBA")

    output.mkdir(parents=True, exist_ok=True)
    stem = source.parent.parent.name + "_" + source.parent.name
    report = {
        "id": stem, "source": str(source), "dimensions": [w, h],
        "neutral_pixel_perfect": True, "mismatched_visible_pixels": mismatch_pixels,
        "partitions": {part: int(np.count_nonzero(masks[part])) for part in PARTS},
        "detectors": confidence, "status": "draft_not_live2d_ready",
        "original_facial_features_preserved": True,
        "facial_expressions_approved": False,
        "restored_hidden_body_approved": False,
        "draft_underpainting_pixels": int(np.count_nonzero(underpaint_alpha)),
        "notes": notes,
    }
    # A copy of the unmodified cutout is always embedded as a hidden fallback.
    # PNG preserves available source pixels without another lossy recompression.
    stack = ET.Element("image", {"w": str(w), "h": str(h), "name": stem, "version": "0.0.3"})
    layer_stack = ET.SubElement(stack, "stack")
    def add_layer(name, src, visible):
        ET.SubElement(layer_stack, "layer", {
            "name": name, "src": src, "x": "0", "y": "0",
            "visibility": "visible" if visible else "hidden",
            "opacity": "1.0", "composite-op": "svg:src-over"
        })
    # ORA stack is listed from TOP to BOTTOM.
    for part in reversed(PARTS):
        add_layer(part, "data/" + part + ".png", True)
    add_layer("DRAFT_underpainting_NOT_APPROVED", "data/hidden-underpainting.png", False)
    add_layer("Original_Pixel_Reference_LOCKED", "data/original.png", False)
    archive_path = output / (stem + ".ora")
    with zipfile.ZipFile(archive_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        z.writestr("mimetype", "image/openraster", compress_type=zipfile.ZIP_STORED)
        z.writestr("stack.xml", ET.tostring(stack, encoding="utf-8", xml_declaration=True))
        z.writestr("mergedimage.png", png_bytes(merged))
        z.writestr("data/original.png", png_bytes(original))
        z.writestr("data/hidden-underpainting.png", png_bytes(underlay))
        for name, layer in layers.items():
            z.writestr("data/" + name + ".png", png_bytes(layer))
        thumb = merged.copy()
        thumb.thumbnail((256, 256))
        z.writestr("Thumbnails/thumbnail.png", png_bytes(thumb))
    # Audit content of ORA, not just successful archive creation.
    with zipfile.ZipFile(archive_path) as z:
        out = Image.open(io.BytesIO(z.read("mergedimage.png"))).convert("RGBA")
        assert np.array_equal(np.asarray(out), np.asarray(merged))
        assert z.testzip() is None
    if preview:
        merged.thumbnail((384, 768))
        merged.save(output / (stem + "_source_pixels.png"), "PNG")
    (output / (stem + "_audit.json")).write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    return report


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="public/avatars/original-rigs")
    parser.add_argument("--output", default="artifacts/qul-43-layer-drafts")
    parser.add_argument("--expected", type=int, default=43)
    parser.add_argument("--preview", action="store_true")
    args = parser.parse_args()
    sources = sorted(Path(args.input).glob("*/*/cutout.webp"))
    if len(sources) != args.expected:
        raise SystemExit(f"Expected {args.expected} original cutouts, found {len(sources)}")
    import mediapipe as mp
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    reports = []
    with mp.solutions.pose.Pose(static_image_mode=True, model_complexity=1,
                                enable_segmentation=False, min_detection_confidence=.4) as pose, \
         mp.solutions.face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1,
                                         refine_landmarks=True, min_detection_confidence=.4) as face:
        for i, source in enumerate(sources, 1):
            report = export_character(source, output, pose, face, args.preview)
            reports.append(report)
            print(f"{i}/{len(sources)} {report['id']}: exact neutral pixels, "
                  f"face={report['detectors']['face']} pose={report['detectors']['pose']}", flush=True)
    summary = {
        "count": len(reports),
        "pixel_perfect_neutral": sum(x["neutral_pixel_perfect"] for x in reports),
        "face_detected": sum(x["detectors"]["face"] for x in reports),
        "pose_detected": sum(x["detectors"]["pose"] for x in reports),
        "live2d_ready": 0,
        "approved_expressions": 0,
        "disclaimer": "Layered ORA drafts preserve original neutral pixels. Independent motion requires corrected masks and reconstruction.",
        "characters": reports
    }
    (output / "batch-report.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({k: v for k, v in summary.items() if k != "characters"}, indent=2))


if __name__ == "__main__":
    main()
