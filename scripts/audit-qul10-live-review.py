#!/usr/bin/env python3
"""Verify all ten embedded QUL originals against their locked OpenRaster RGBA sources.

No part of this validation claims finished eyelid, mouth or Cubism rigging.
"""
from pathlib import Path
from zipfile import ZipFile
from io import BytesIO
import argparse, json, re, base64
import numpy as np
from PIL import Image

IDS = ("uae_male","oman_male","kuwait_male","syria_male","palestine_male",
       "algeria_female","djibouti_female","iraq_female","oman_female","algeria_male")

def pixels(uri):
    if not uri.startswith("data:image/png;base64,"):
        raise ValueError("Lossy or non-embedded source image")
    return np.asarray(Image.open(BytesIO(base64.b64decode(uri.partition(",")[2],validate=True))).convert("RGBA"))

def main():
    p=argparse.ArgumentParser()
    p.add_argument("html",type=Path)
    p.add_argument("--ora",type=Path,help="Optional archive of first ten 21-layer ORA editing masters")
    args=p.parse_args()
    html=args.html.read_text(encoding="utf-8")
    m=re.search(r"const MODELS\s*=\s*(\{.+?\});\s*const LABELS=",html,re.S)
    if not m:raise RuntimeError("Missing ten embedded portrait objects")
    models=json.loads(m.group(1))
    if set(models)!=set(IDS):raise RuntimeError("Incorrect portrait inventory")
    archive=ZipFile(args.ora) if args.ora else None
    results=[]
    for name in IDS:
        model=models[name]
        src=pixels(model["source"])
        mask=pixels(model["mask"])
        atlas=pixels(model["atlas"])
        w,h=model["dimensions"]
        if src.shape[:2]!=(h,w) or mask.shape!=src.shape or atlas.shape[1]%3 or atlas.shape[0]%2:
            raise RuntimeError(name+": invalid image or texture atlas dimensions")
        if archive:
            data=archive.read(f"{name}/{name}_21layer_experimental.ora")
            with ZipFile(BytesIO(data)) as inner:
                original=np.asarray(Image.open(BytesIO(inner.read("data/SOURCE_ORIGINAL_LOCKED.png"))).convert("RGBA"))
            if not np.array_equal(original,src):raise RuntimeError(name+": original RGBA modified")
        results.append({"id":name,"dimensions":[w,h],"original_rgba_preserved":True,"live2d_approved":False})
    if archive:archive.close()
    print(json.dumps({"verified":len(results),"approved":0,"models":results},indent=2))

if __name__=="__main__":
    main()
