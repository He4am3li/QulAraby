# QUL dialect characters, practical implementation status (2026-11-01)

## Source of truth
All 43 original approved portraits are present in `public/avatars/original-rigs/<country>/<gender>/`, with `source.webp`, `cutout.webp`, and `identity.json`. Saudi male Salman remains on the existing approved 42-layer renderer (`SalmanLayeredAvatar.tsx`), unchanged.

## Implemented in this branch
- Retains every original portrait. No AI redraw, recoloring, upscaling or identity replacement.
- Gives the original whole-body artwork a very restrained breathing motion (disabled for reduced-motion users), without re-rendering the person's face.
- Accepts optional individually approved Salman-like expression overlays for smiling, thinking and listening, in addition to blinking and A/E/O visemes.
- Validates each sprite's source dimensions and conservative transparent coverage before using any expressions. All expression assets are loaded before activation. Missing or invalid approval leaves the original image intact.
- Adds `npm run audit:dialects` and a pull-request safety check to verify all 43 source image pairs, identity metadata, and any future approved facial sprites.

## Artwork still required
The current repository has no per-character `rig-approved.json` with reviewed, transparent facial sprites. Consequently, the 43 portraits currently have **safe whole-portrait animation**, but not per-character blink, mouth sync, independently articulated head/arms, or Cubism rigging.

A flat original WEBP alone cannot faithfully reconstruct eye interiors, occluded skin, hair behind the head, arms, mouth anatomy, or PSD layers. Do not manufacture fabricated visemes, duplicate faces, or mouth-over-veil effects to make them appear complete.

For each character, deliver *actual edited source layers* with eye-white, iris, lids, brows, mouth, face underpainting, neck, torso and separately movable hands/arms, then verify and approve the exported overlays. Actual Live2D Cubism modelling is an independent step.

## Approved manifest extension
```json
{
  "status": "approved",
  "source": "cutout.webp",
  "eyesClosed": "eyes-closed.webp",
  "mouthVisible": true,
  "mouth": { "A": "mouth-A.webp", "E": "mouth-E.webp", "O": "mouth-O.webp" },
  "smile": "mouth-smile.webp",
  "thinkingBrows": "brows-thinking.webp",
  "listeningBrows": "brows-listening.webp"
}
```

All sprites must have the exact same canvas dimensions as `cutout.webp`, transparent elsewhere, and must be approved at natural size and a 4x face close-up. Omit `mouth` and `smile` entirely when a face covering hides the mouth. The previous manifest without optional expressions remains supported.

## Status labels
- **Source restored:** 43 of 43.
- **Common safe motion renderer:** implemented on branch.
- **Facial rigs approved:** 0 of 43.
- **PSD/Live2D Cubism-ready character models:** 0 of 43 confirmed by this repository.
