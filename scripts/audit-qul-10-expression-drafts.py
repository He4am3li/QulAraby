#!/usr/bin/env python3
"""Fail closed on malformed QUL ten-character expression ORA drafts.

This checks archive/layer integrity only, not visual quality or Live2D
readiness. Never generate or approve rig-approved.json from this audit.
"""
from __future__ import annotations
import argparse
import io
import json
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET
import numpy as np
from PIL import Image

EXPECTED = (
    "uae_male", "oman_male", "kuwait_male", "syria_male",
    "palestine_male", "algeria_female", "djibouti_female",
    "iraq_female", "oman_female", "algeria_male",
)
EXPRESSIONS = ("Blink", "A", "E", "O", "Open", "Smile")

def check_character(folder: Path, name: str):
    ora = folder / (name + "_21layer_experimental.ora")
    if not ora.exists():
        raise ValueError("missing ORA file: " + str(ora))
    with zipfile.ZipFile(ora) as archive:
        if archive.testzip() is not None:
            raise ValueError("corrupt ORA: " + name)
        entries = set(archive.namelist())
        root = ET.fromstring(archive.read("stack.xml"))
        layers = root.find("stack")
        if layers is None or len(layers) != 21:
            raise ValueError("expected exactly 21 layers: " + name)
        for layer in layers:
            if layer.attrib.get("src") not in entries:
                raise ValueError("missing layer image: " + name)
        drafts = layers[:6]
        expected_names = {"EXPERIMENT_" + s + "_UNAPPROVED" for s in EXPRESSIONS}
        if {d.get("name") for d in drafts} != expected_names:
            raise ValueError("wrong expression layer names: " + name)
        if any(d.get("visibility") != "hidden" for d in drafts):
            raise ValueError("unapproved expression was enabled: " + name)
        original = Image.open(io.BytesIO(archive.read("data/SOURCE_ORIGINAL_LOCKED.png"))).convert("RGBA")
        merged = Image.open(io.BytesIO(archive.read("mergedimage.png"))).convert("RGBA")
        if not np.array_equal(np.asarray(original), np.asarray(merged)):
            raise ValueError("neutral original pixels changed: " + name)
        changed = {}
        for state in EXPRESSIONS:
            file = folder / (name + "_" + state + ".png")
            with Image.open(file) as img:
                if img.mode != "RGBA" or img.size != original.size:
                    raise ValueError("invalid sprite canvas: " + str(file))
                alpha = np.asarray(img.getchannel("A"))
            area = int(np.count_nonzero(alpha > 0))
            if not 0 < area < 0.03 * original.width * original.height:
                raise ValueError("oversized or empty expression sprite: " + str(file))
            changed[state] = area
        return {"character": name, "size": list(original.size),
                "neutral_rgba_exact": True, "layers": len(layers),
                "unapproved_face_overlays": changed,
                "facial_art_approved": False, "live2d_ready": False}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("root", type=Path, help="Extracted artwork ZIP folder")
    args = parser.parse_args()
    results = [check_character(args.root / name, name) for name in EXPECTED]
    print(json.dumps({"count": len(results), "source_neutral_passed": len(results),
          "approved": 0, "characters": results}, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
