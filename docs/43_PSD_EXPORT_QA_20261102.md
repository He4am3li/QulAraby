# PSD export quality audit, 43 original QUL portraits, 2026-11-02

Executed the exporter and inspected all 43 resulting Photoshop PSD files independently against their original OpenRaster PNG sources using ImageMagick/Pillow.

## Verified
- 43 actual PSD files exported, not a promised output.
- 41 PSDs contain 9 recognized layers.
- `comoros_male.psd`: 8 layers. The proposed right-eye mask has zero original pixels. Must be drawn/checked by an artist.
- `tunisia_male.psd`: 2 layers. Existing pose and face models failed, so it is NOT a segmented rig.
- 43/43 PSD flattened previews retained the same image dimensions, alpha values and fully opaque RGB values as their original ORA neutral pictures in independent testing.
- Semi-transparent RGB edge samples are *not* pixel-exact after Krita PSD export. Report this rather than misrepresent original fidelity; the original source PNG within each ORA retains pixel-exact data.
- The revised hidden underpainting reduces exposed opaque holes in a limited head/arm motion test but does not demonstrate correct garment anatomy, professional animation, facial expression timing, or equal resolution to Salman.

## Release gate

No per-character rig-approved.json may be created automatically from these PSD exports. Actual eye/eyelid motion, mouth visemes, hidden neck, arms and clothing must be restored and visually reviewed at natural and 4x face size.

Keep PR #34 draft. Do not merge unreviewed moving masks into student production. The current website continues to show the original approved portrait while reliable facial rig art is absent.
