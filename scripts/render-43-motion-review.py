#!/usr/bin/env python3
"""Render visual quality-control proofs of draft motion for the 43 QUL characters.

These are REJECTION/REVIEW previews, never production sprites.
Do not treat original-pixel neutral pose fidelity as motion quality.
"""
from __future__ import annotations
import argparse
import io
import json
import zipfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

PARTS = ["torso", "arm_left", "arm_right", "head", "mouth", "eye_left", "eye_right"]


def load_layer(z, name):
    return Image.open(io.BytesIO(z.read("data/" + name + ".png"))).convert("RGBA")


def move_piece(layer, angle, pivot):
    # Rotate around an explicitly chosen original-canvas hinge, no resampling
    # to another image size. This demonstrates where draft masks will open.
    return layer.rotate(angle, Image.Resampling.BICUBIC, center=pivot)


def draw_preview(layers, move=False):
    w, h = layers["torso"].size
    canvas = Image.new("RGBA", (w, h))
    if move:
        # A visible DRAFT seam filler makes missing underpainting obvious:
        # unapproved inpaint may contain invented anatomy.
        canvas.alpha_composite(layers["underpainting"])
    canvas.alpha_composite(layers["torso"])
    for part, sign in (("arm_left", 1), ("arm_right", -1)):
        image = layers[part]
        if move:
            bb = image.getbbox()
            if bb:
                pivot = ((bb[0] + bb[2]) / 2, bb[1] + (bb[3] - bb[1]) * .12)
                image = move_piece(image, 6 * sign, pivot)
        canvas.alpha_composite(image)
    head = Image.new("RGBA", (w, h))
    for part in ("head", "mouth", "eye_left", "eye_right"):
        head.alpha_composite(layers[part])
    if move:
        bb = head.getbbox()
        if bb:
            pivot = ((bb[0] + bb[2]) / 2, bb[1] + (bb[3] - bb[1]) * .87)
            head = move_piece(head, 6, pivot)
    canvas.alpha_composite(head)
    return canvas


def panel(image, width=400, height=720, label=""):
    display = Image.new("RGB", (width, height), (232, 235, 239))
    image = image.copy()
    image.thumbnail((width - 24, height - 64), Image.Resampling.LANCZOS)
    background = Image.new("RGBA", image.size, (246, 247, 249, 255))
    background.alpha_composite(image)
    x = (width - image.width) // 2
    y = 24 + (height - 60 - image.height) // 2
    display.paste(background.convert("RGB"), (x, y))
    draw = ImageDraw.Draw(display)
    draw.text((12, 6), label, fill=(35, 42, 58))
    return display


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--ora", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--expected", type=int, default=43)
    args = parser.parse_args()
    archives = sorted(Path(args.ora).glob("*.ora"))
    if len(archives) != args.expected:
        raise RuntimeError(f"Expected {args.expected} source archives; found {len(archives)}")
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    thumbs = []
    for i, ora in enumerate(archives, 1):
        with zipfile.ZipFile(ora) as z:
            layers = {part: load_layer(z, part) for part in PARTS}
            layers["underpainting"] = load_layer(z, "hidden-underpainting")
            source = Image.open(io.BytesIO(z.read("data/original.png"))).convert("RGBA")
        neutral = draw_preview(layers, move=False)
        # Use original pixels rather than resynthesizing to protect the source.
        shifted = draw_preview(layers, move=True)
        if neutral.size != source.size:
            raise RuntimeError(ora.stem + ": neutral canvas mismatch")
        # The image is a review diagram, not production output.
        sheet = Image.new("RGB", (800, 720), (245, 245, 247))
        sheet.paste(panel(source, label="APPROVED ORIGINAL PIXELS"), (0, 0))
        sheet.paste(panel(shifted, label="DRAFT: head + arms rotated, inspect exposed gaps"), (400, 0))
        ImageDraw.Draw(sheet).text((8, 695),
             ora.stem + " | NOT APPROVED | motion gaps and source resolution require manual review",
             fill=(140, 40, 38))
        sheet.save(output / (ora.stem + "_quality-review.jpg"), "JPEG", quality=90, optimize=True)
        mini = sheet.copy()
        mini.thumbnail((320, 288))
        thumbs.append((ora.stem, mini))
        print(f"{i}/{len(archives)} review sheet: {ora.stem}", flush=True)
    cols, rows = 5, (len(thumbs)+4)//5
    montage = Image.new("RGB", (cols*326, rows*318), (255,255,255))
    for i, (label, image) in enumerate(thumbs):
        x, y = (i%cols)*326, (i//cols)*318
        montage.paste(image, (x, y))
        ImageDraw.Draw(montage).text((x+5,y+290),label,fill=(30,30,30))
    montage.save(output / "QUL-43-motion-artifact-review-contact-sheet.jpg",quality=91,optimize=True)
    (output/"README.txt").write_text(
        "These are motion-defect review proofs, NOT approved Live2D rigs. The original image remains "
        "the source of truth. Rotations deliberately expose missing hair, neck and arm underpainting. "
        "Do not publish these poses to students.",encoding="utf-8")


if __name__ == "__main__":
    main()
