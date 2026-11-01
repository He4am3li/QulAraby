#!/usr/bin/env python3
"""Transparent derivatives of QUL original portraits. Keeps source.webp untouched."""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import cv2
import numpy as np
from PIL import Image
from rembg import new_session, remove


def prepare(source: Path, destination: Path, session) -> dict:
    rgb = Image.open(source).convert('RGB')
    width, height = rgb.size
    raw_mask = remove(rgb, session=session, only_mask=True).convert('L')
    raw = np.asarray(raw_mask, dtype=np.uint8)

    # Keep the actual person, not detached illuminated backdrop or floor glow.
    strong = (raw > 88).astype('uint8')
    n, labels, stats, _ = cv2.connectedComponentsWithStats(strong, connectivity=8)
    if n <= 1:
        return {'status': 'rejected', 'reason': 'no human silhouette'}
    primary = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    component = (labels == primary).astype('uint8')
    close_to_core = cv2.dilate(component, np.ones((11, 11), np.uint8), iterations=1)
    alpha = np.clip((raw.astype('float32') - 30.0) * (255.0 / 195.0), 0, 255)
    alpha *= close_to_core
    alpha = cv2.erode(alpha.astype('uint8'), np.ones((2, 2), np.uint8), iterations=1)
    alpha = cv2.GaussianBlur(alpha, (3, 3), 0.6)
    alpha[alpha < 9] = 0

    visible = alpha > 35
    area = float(np.count_nonzero(visible)) / (width * height)
    ys, xs = np.where(visible)
    if len(xs) == 0:
        return {'status': 'rejected', 'reason': 'empty cutout'}
    left, right, top, bottom = int(xs.min()), int(xs.max()), int(ys.min()), int(ys.max())
    if not (0.07 <= area <= 0.72 and (bottom - top) >= height * 0.59):
        return {'status': 'rejected', 'reason': 'unreliable foreground geometry',
                'area_ratio': round(area, 3), 'visible_height': round((bottom-top)/height, 3)}
    corners = [alpha[0, 0], alpha[0, -1], alpha[-1, 0], alpha[-1, -1]]
    if max(corners) >= 40:
        return {'status': 'rejected', 'reason': 'opaque background corners'}

    rgba = rgb.convert('RGBA')
    rgba.putalpha(Image.fromarray(alpha, mode='L'))
    horizontal_pad = max(10, int((right-left) * 0.045))
    top_pad = max(10, int((bottom-top) * 0.026))
    bottom_pad = max(4, int((bottom-top) * 0.01))
    rgba = rgba.crop((max(0, left-horizontal_pad), max(0, top-top_pad),
                      min(width, right+horizontal_pad+1), min(height, bottom+bottom_pad+1)))
    destination.parent.mkdir(parents=True, exist_ok=True)
    rgba.save(destination, 'WEBP', quality=94, method=5)
    with Image.open(destination) as verification:
        if verification.mode != 'RGBA' or verification.getextrema()[3][0] != 0:
            destination.unlink(missing_ok=True)
            return {'status': 'rejected', 'reason': 'saved file lacks transparency'}
    return {'status': 'ok', 'area_ratio': round(area, 3),
            'visible_height': round((bottom-top)/height, 3),
            'size': list(rgba.size), 'bytes': destination.stat().st_size}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', default='public/avatars/original-rigs')
    parser.add_argument('--expected', type=int, default=43)
    parser.add_argument('--model', default='u2net_human_seg')
    args = parser.parse_args()
    root = Path(args.root)
    items = sorted(root.glob('*/*/source.webp'))
    if len(items) != args.expected:
        raise SystemExit(f'Expected {args.expected} source portraits, found {len(items)}')
    session = new_session(args.model)
    records = {}
    for position, item in enumerate(items, 1):
        key = item.parent.parent.name + '_' + item.parent.name
        destination = item.with_name('cutout.webp')
        try:
            result = prepare(item, destination, session)
        except Exception as error:
            result = {'status': 'rejected', 'reason': str(error)[:180]}
            destination.unlink(missing_ok=True)
        records[key] = result
        print(f'{position}/{len(items)} {key}: {result}', flush=True)
    completed = sum(record['status'] == 'ok' for record in records.values())
    (root/'cutout-report.json').write_text(json.dumps({
        'model': args.model, 'total': len(items), 'transparent': completed,
        'rejected': len(items)-completed, 'characters': records,
        'note': 'Original photos retained. Rejected outputs use the existing 3D tutor.'
    }, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Generated {completed}/{len(items)} transparent cutouts', flush=True)
    if completed < 30:
        raise SystemExit('Too few acceptable masks. Refusing to publish incomplete segmentation.')


if __name__ == '__main__':
    main()
