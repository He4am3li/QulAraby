#!/usr/bin/env python3
"""Probe facial landmarks in original QUL cutouts. Does not modify source images."""
from pathlib import Path
from PIL import Image, ImageDraw
import json
import numpy as np
import cv2
import mediapipe as mp

INPUT = Path("public/avatars/original-rigs")
OUTPUT = Path("public/avatars/rig-probe")
SAMPLES = ["uae/male", "uae/female", "saudi/female", "egypt/male", "morocco/female", "syria/male", "qatar/male", "lebanon/female"]
OUTPUT.mkdir(parents=True, exist_ok=True)
mesh = mp.solutions.face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1, min_detection_confidence=0.36, refine_landmarks=True)
features = {"leftEye": [33, 133, 159, 145], "rightEye": [362, 263, 386, 374], "mouth": [61, 291, 13, 14], "nose": [1], "chin": [152], "forehead": [10]}
summary = {}
for id in SAMPLES:
    path = INPUT / id / "cutout.webp"
    src = Image.open(path).convert("RGBA")
    original = np.array(src)
    rgb = original[:,:,:3]
    alpha = original[:,:,3].astype(np.float32) / 255.
    bg = np.ones_like(rgb, np.float32) * 239
    flat = (rgb * alpha[..., None] + bg * (1-alpha[...,None])).astype(np.uint8)
    h,w = flat.shape[:2]
    # Face occupies the upper part of these full-length figures.
    upper = flat[:min(h, int(h*0.48))]
    scale=2 if w<500 else 1
    enlarged = cv2.resize(upper, (upper.shape[1]*scale, upper.shape[0]*scale), interpolation=cv2.INTER_CUBIC)
    result = mesh.process(enlarged)
    record={"image":str(path),"width":w,"height":h,"detected":bool(result.multi_face_landmarks)}
    preview=Image.fromarray(flat)
    drawer=ImageDraw.Draw(preview)
    if result.multi_face_landmarks:
        lm=result.multi_face_landmarks[0].landmark
        points={k:[[(lm[i].x*enlarged.shape[1])/scale, (lm[i].y*enlarged.shape[0])/scale] for i in indices] for k,indices in features.items()}
        record["points"]=points
        eyeY=np.mean([points["leftEye"][0][1],points["rightEye"][0][1]])
        mouthY=np.mean([p[1] for p in points["mouth"]])
        record["valid_geometry"]=bool(eyeY<mouthY<min(h*.37,eyeY+w*.32))
        for key,pts in points.items():
            color={"leftEye":"red","rightEye":"red","mouth":"green","nose":"blue","chin":"orange","forehead":"orange"}[key]
            for x,y in pts: drawer.ellipse((x-3,y-3,x+3,y+3),fill=color)
        for left,right in [(33,133),(362,263),(61,291)]:
            p1=(lm[left].x*enlarged.shape[1]/scale,lm[left].y*enlarged.shape[0]/scale)
            p2=(lm[right].x*enlarged.shape[1]/scale,lm[right].y*enlarged.shape[0]/scale)
            drawer.line((p1,p2), fill="#2abd7d",width=2)
    name=id.replace("/","_")
    preview.save(OUTPUT/(name+".webp"),"WEBP",quality=93)
    summary[name]=record
    print(name,record["detected"],record.get("valid_geometry"),flush=True)
(OUTPUT/"probe.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2))
mesh.close()
