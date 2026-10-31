#!/usr/bin/env python3
"""
QUL original-avatar asset installer.

Accepts the approved original-pixel crop preparation zip generated from
the user's source portraits. Never silently labels drafts as production-ready.
Run: python scripts/install-qul-avatar-rigs.py /path/to/QUL_43_rig_preparation.zip

Use --approved only after individually reviewing and replacing draft masks,
reconstructed hidden art, eye lids and mouth phonemes with production sprites.
"""
from __future__ import annotations
import argparse, json, re, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "public" / "avatars" / "original-rigs"
ALLOWED = re.compile(r"^(?:[a-z]+)/(?:(?:male)|(?:female))/(?:source\.webp|source\.sha256|rig\.json|[A-Za-z_]+\.png|alignment_guide\.jpg)$")

def install(archive: Path, approved: bool):
    if not archive.exists():
        raise FileNotFoundError(archive)
    importable = []
    with zipfile.ZipFile(archive) as bundle:
        for item in bundle.infolist():
            name = item.filename
            if name.endswith("/"):
                continue
            if name in ("rig_preparation_manifest.json", "README_AR.txt"):
                continue
            if not ALLOWED.fullmatch(name):
                raise ValueError("Unexpected archive path: " + name)
            if item.file_size > 8_000_000:
                raise ValueError("Oversized asset: " + name)
            destination = TARGET / name
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(bundle.read(item))
            if name.endswith("/rig.json"):
                data = json.loads(destination.read_text("utf-8"))
                if data.get("cubism_ready") is False and approved:
                    raise ValueError("A draft asset cannot be marked approved: " + name)
                importable.append(data)
    index = {
        "version": 1,
        "original_portraits_available": sorted([x["id"] for x in importable]),
        "production_ready": sorted([x["id"] for x in importable if x.get("cubism_ready") is True]),
        "note": "Source portraits / draft crop layers are NOT equivalent to verified Live2D facial rigs."
    }
    (TARGET / "manifest.json").write_text(json.dumps(index,ensure_ascii=False,indent=2),encoding="utf-8")
    print(json.dumps({"imported":len(importable),"production_ready":len(index["production_ready"]),"path":str(TARGET)},ensure_ascii=False))
    return index

if __name__ == "__main__":
    ap=argparse.ArgumentParser()
    ap.add_argument("archive",type=Path)
    ap.add_argument("--approved",action="store_true")
    args=ap.parse_args()
    install(args.archive,args.approved)
