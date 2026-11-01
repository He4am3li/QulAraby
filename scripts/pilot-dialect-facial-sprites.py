#!/usr/bin/env python3
"""Pilot independent eyelid and viseme sprites for existing original portraits.
Source photos remain unchanged. All overlays are transparent.
"""
from pathlib import Path
import json
import math
import cv2
import mediapipe as mp
import numpy as np
from PIL import Image, ImageDraw

BASE=Path("public/avatars/original-rigs")
PROBE=Path("public/avatars/rig-probe")
SAMPLES=["uae/male","uae/female","saudi/female","egypt/male","morocco/female","syria/male","qatar/male","lebanon/female"]
COVERED={"uae/female","saudi/female"}
mesh=mp.solutions.face_mesh.FaceMesh(static_image_mode=True,max_num_faces=1,min_detection_confidence=0.4,refine_landmarks=True)
PROBE.mkdir(parents=True,exist_ok=True)

def landmarks(image):
    rgba=np.asarray(image.convert("RGBA"))
    alpha=rgba[:,:,3:4]/255.
    comp=(rgba[:,:,:3]*alpha+np.ones_like(rgba[:,:,:3])*239*(1-alpha)).astype(np.uint8)
    h,w=comp.shape[:2]
    upper=comp[:round(h*.5)]
    big=cv2.resize(upper,(upper.shape[1]*2,upper.shape[0]*2),interpolation=cv2.INTER_CUBIC)
    result=mesh.process(big)
    if not result.multi_face_landmarks:return None
    pts=result.multi_face_landmarks[0].landmark
    return np.asarray([(p.x*w,p.y*upper.shape[0]) for p in pts],np.float32)

def blend_overlay(src, colored, alpha):
    a=(np.clip(alpha,0,1)*255).astype(np.uint8)
    a=np.minimum(a,src[:,:,3])
    arr=np.zeros_like(src)
    arr[:,:,:3]=colored[:,:,:3]
    arr[:,:,3]=a
    return Image.fromarray(arr,"RGBA")

def ellipse_alpha(h,w,cx,cy,rx,ry):
    matte=np.zeros((h,w),np.uint8)
    cv2.ellipse(matte,(round(cx),round(cy)),(max(3,round(rx)),max(2,round(ry))),0,0,360,255,-1,lineType=cv2.LINE_AA)
    return cv2.GaussianBlur(matte.astype(np.float32)/255,(5,5),0.8)

def save_overlay(dest,overlay):
    overlay.save(dest,"WEBP",quality=94,method=5)
    return dest.stat().st_size

report={}
for ident in SAMPLES:
    source=BASE/ident/"cutout.webp"
    im=Image.open(source).convert("RGBA")
    pts=landmarks(im)
    if pts is None:
        report[ident]={"status":"no_face"}
        continue
    rgba=np.array(im)
    h,w=rgba.shape[:2]
    rgb=rgba[:,:,:3].copy()
    overlay=np.zeros_like(rgba)
    overlay[:,:,:3]=rgb
    eyeMask=np.zeros((h,w),np.uint8)
    infos=[]
    for ids in [[33,133,159,145,153,144,160,158],[362,263,386,374,380,373,387,385]]:
        data=pts[ids]
        cx,cy=np.mean(data,axis=0)
        rx=max(5,abs(pts[ids[0],0]-pts[ids[1],0])*.69)
        ry=max(4,rx*.53)
        cv2.ellipse(eyeMask,(round(cx),round(cy)),(round(rx),round(ry)),0,0,360,255,-1)
        infos.append((cx,cy,rx,ry))
    skin=cv2.inpaint(rgb,eyeMask,4,cv2.INPAINT_TELEA)
    blinkAlpha=np.zeros((h,w),np.float32)
    for cx,cy,rx,ry in infos:
        matte=ellipse_alpha(h,w,cx,cy,rx+2,ry+1.7)
        blinkAlpha=np.maximum(blinkAlpha,matte)
        # A quiet eyelid seam uses surrounding dark eyelash color, not a cartoon.
        x1,y1=round(cx-rx*.72),round(cy)
        x2,y2=round(cx+rx*.72),round(cy)
        cv2.line(skin,(x1,y1),(x2,y2),(88,57,52),1,lineType=cv2.LINE_AA)
    eyeOverlay=blend_overlay(rgba,skin,blinkAlpha)
    blinkPath=PROBE/(ident.replace("/","_")+"_blink.webp")
    save_overlay(blinkPath,eyeOverlay)
    width=abs(pts[61,0]-pts[291,0])
    cx=(pts[61,0]+pts[291,0])/2
    cy=(pts[13,1]+pts[14,1])/2
    masked=ident in COVERED
    bytesByShape={}
    if not masked and 7<width<80:
        rx=max(5,width*.7);ry=max(4,width*.49)
        msk=np.zeros((h,w),np.uint8)
        cv2.ellipse(msk,(round(cx),round(cy)),(round(rx),round(ry)),0,0,360,255,-1)
        healed=cv2.inpaint(rgb,msk,4,cv2.INPAINT_TELEA)
        mouthAlpha=ellipse_alpha(h,w,cx,cy,rx+2,ry+2)
        for variant in ("A","E","O"):
            variantRGBA=healed.copy()
            ex=(width*({"A":.26,"E":.39,"O":.23}[variant]))
            ey=(width*({"A":.28,"E":.10,"O":.27}[variant]))
            center=(round(cx),round(cy))
            cv2.ellipse(variantRGBA,center,(max(2,round(ex)),max(1,round(ey))),0,0,360,(86,40,55),-1,lineType=cv2.LINE_AA)
            cv2.ellipse(variantRGBA,center,(max(2,round(ex)),max(1,round(ey))),0,0,360,(123,65,75),1,lineType=cv2.LINE_AA)
            dst=PROBE/(ident.replace("/","_")+"_mouth_"+variant+".webp")
            bytesByShape[variant]=save_overlay(dst,blend_overlay(rgba,variantRGBA,mouthAlpha))
    # Composite a talking A and closed eyes on the untouched image to check quality.
    preview=im.copy()
    preview.alpha_composite(eyeOverlay)
    if bytesByShape:
        preview.alpha_composite(Image.open(PROBE/(ident.replace("/","_")+"_mouth_A.webp")).convert("RGBA"))
    prevCanvas=Image.new("RGBA",im.size,(243,248,244,255))
    prevCanvas.alpha_composite(preview)
    prevCanvas.convert("RGB").save(PROBE/(ident.replace("/","_")+"_expression.jpg"),quality=94)
    # Face enlargement for meaningful inspection.
    bx1=max(0,int(min(pts[33,0],pts[362,0],pts[61,0])-35))
    bx2=min(w,int(max(pts[133,0],pts[263,0],pts[291,0])+35))
    by1=max(0,int(min(pts[10,1],pts[33,1])-12))
    by2=min(h,int(pts[152,1]+24))
    preview.crop((bx1,by1,bx2,by2)).resize(((bx2-bx1)*4,(by2-by1)*4)).save(PROBE/(ident.replace("/","_")+"_face.png"))
    report[ident]={"status":"ok","dimensions":[w,h],"eyes":infos,"mouth":[float(cx),float(cy),float(width)],"mouthCovered":masked,"mouthShapes":bytesByShape}

(PROBE/"facial-pilot.json").write_text(json.dumps(report,indent=2),encoding="utf-8")
mesh.close()
print(json.dumps({k:{"status":v["status"],"mouthCovered":v.get("mouthCovered")} for k,v in report.items()},indent=2))
