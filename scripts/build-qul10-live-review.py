#!/usr/bin/env python3
"""Build a self-contained offline, GPU based QUL ten-character ORIGINAL-PIXEL motion reviewer.

It does not manufacture hidden anatomy or approve character facial art. Source PNG,
expression crops and three masked smooth warp weights are packed into one local HTML.
"""
from __future__ import annotations
from pathlib import Path
from io import BytesIO
import argparse, zipfile, json, base64, math
import numpy as np
import cv2
from PIL import Image

CHARACTERS = ('uae_male','oman_male','kuwait_male','syria_male',
              'palestine_male','algeria_female','djibouti_female',
              'iraq_female','oman_female','algeria_male')
EXPRESSIONS = ('Blink','A','E','O','Open','Smile')
HEAD = ('Face_and_Head','Headwear_Upper','Eye_L','Eye_R','Brow_L','Brow_R','Mouth_Rest')

def bbox(a):
    y,x=np.where(a>16)
    if not x.size:return None
    return [int(x.min()),int(y.min()),int(x.max())+1,int(y.max())+1]

def opaque_alpha(ora,n):
    return np.asarray(Image.open(BytesIO(ora.read('data/'+n+'.png'))).convert('RGBA'))[:,:,3]

def get_image_zip(ora,n):
    return Image.open(BytesIO(ora.read('data/'+n+'.png'))).convert('RGBA')

def combine(*arrays):
    return np.maximum.reduce(arrays)

def encode_png(img):
    b=BytesIO();img.save(b,format='PNG',compress_level=1)
    return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode('ascii')

def main():
    p=argparse.ArgumentParser();p.add_argument('--archive',required=True,help='The prepared 21-layer draft archive for ten characters');p.add_argument('--output',default='artifacts/qul-ten-live-review');p.add_argument('--template',default='scripts/qul10-live-motion-template.html');args=p.parse_args()
    d=Path(args.output);d.mkdir(parents=True,exist_ok=True)
    models={}; reports=[]
    with zipfile.ZipFile(args.archive) as outer:
      for index,name in enumerate(CHARACTERS,1):
        with zipfile.ZipFile(BytesIO(outer.read(f'{name}/{name}_21layer_experimental.ora'))) as ora:
            original=get_image_zip(ora,'SOURCE_ORIGINAL_LOCKED');w,h=original.size
            a=np.asarray(original)[:,:,3]
            if not np.array_equal(np.asarray(original),np.asarray(Image.open(BytesIO(ora.read('mergedimage.png'))).convert('RGBA'))):
                raise ValueError(f'{name}: neutral reference altered')
            head=combine(*[opaque_alpha(ora,x) for x in HEAD]);bh=bbox(head)
            arms=[combine(opaque_alpha(ora,'Arm_'+x),opaque_alpha(ora,'Hand_'+x)) for x in ('L','R')]
            ba=[bbox(x) for x in arms]
            neck=bbox(opaque_alpha(ora,'Neck_and_Collar'))
            if not bh or not all(ba):raise ValueError(name+' missing parts')
            pivotHead=[(bh[0]+bh[2])/2, neck[1]+.45*(neck[3]-neck[1]) if neck else bh[3]-.05*(bh[3]-bh[1])]
            pivotsArm=[[(r[0]+r[2])/2,r[1]+.1*(r[3]-r[1])] for r in ba]
            layers=[head]+arms
            fields=[]
            for m,k,sig,factor in zip(layers,(21,27,27),(max(12,w*.017),max(13,w*.015),max(13,w*.015)),(1.08,1.05,1.05)):
                # Matches the previous CPU remapping within the limits of 8-bit masks.
                field=cv2.dilate(m,np.ones((k,k),np.uint8),iterations=1)
                field=cv2.GaussianBlur(field.astype('float32')/255,(0,0),sigmaX=sig)
                fields.append(np.clip(field*factor,0,1))
            packed=np.zeros((h,w,4),dtype=np.uint8)
            for i,f in enumerate(fields):packed[:,:,i]=np.round(f*255).astype('uint8')
            packed[:,:,3]=255
            mask=Image.fromarray(packed,'RGBA')
            overlays=[get_image_zip(ora,'EXPERIMENT_'+kind+'_UNAPPROVED') for kind in EXPRESSIONS]
            union=np.zeros((h,w),np.uint8)
            for ov in overlays:union=cv2.bitwise_or(union,np.asarray(ov)[:,:,3])
            bb=bbox(union)
            if not bb:raise ValueError(name+' no expression pixels')
            px=max(6,round((bb[2]-bb[0])*.08));py=max(6,round((bb[3]-bb[1])*.09))
            bb=[max(0,bb[0]-px),max(0,bb[1]-py),min(w,bb[2]+px),min(h,bb[3]+py)]
            tw,th=bb[2]-bb[0],bb[3]-bb[1]
            atlas=Image.new('RGBA',(3*tw,2*th))
            for i,ov in enumerate(overlays):
                atlas.alpha_composite(ov.crop(tuple(bb)),dest=((i%3)*tw,(i//3)*th))
            # Make source and transparent atlas UNCHANGED. Only the review masks are processed.
            models[name]={
                'dimensions':[w,h], 'headPivot':pivotHead, 'armPivots':pivotsArm,
                'roi':bb, 'headBounds':bh,
                'source':encode_png(original), 'mask':encode_png(mask), 'atlas':encode_png(atlas),
            }
            report={'id':name,'source_dimensions':[w,h], 'neutral_rgba_identical':True,
                    'face_roi':bb,'head_pivot':pivotHead,'arm_pivots':pivotsArm,
                    'expression_prototypes':list(EXPRESSIONS),'approved':False}
            reports.append(report)
            print(f'{index}/10 {name}: original {w}x{h}; face {tw}x{th}',flush=True)
    template=Path(args.template).read_text('utf-8')
    html=template.replace('/*__QUL_MODELS__*/',json.dumps(models,ensure_ascii=False,separators=(',',':')))
    (d/'QUL10_Live_Motion_Review.html').write_text(html,encoding='utf-8')
    (d/'quality_report.json').write_text(json.dumps({'count':10,'original_pixel_exact':10,'motion_quality_approved':0,
        'notes':'GPU original-pixel animation test: movement exposes unpainted anatomy; source-derived mouth overlays are not phonemically accurate; original Salman remains unchanged.',
        'models':reports},ensure_ascii=False,indent=2),encoding='utf-8')
    (d/'README_AR.txt').write_text('قُل، معاينة حركة حقيقية مستمرة للشخصيات العشر. افتح ملف HTML مباشرة دون إنترنت. تحريك الرأس والذراعين وإظهار الرمش والأفواه تجريبي، ولم يعتمد أي نموذج بجودة سلمان.\n',encoding='utf-8')
    print('FILE',d/'QUL10_Live_Motion_Review.html', 'SIZE MB',round((d/'QUL10_Live_Motion_Review.html').stat().st_size/1e6,1))
if __name__=='__main__':main()