# QUL, first ten facial-expression artwork experiment, 2026-11-02

## What was produced in the assistant's working container

Starting with the already delivered **10 high-resolution original-pixel 15-layer ORA/PSD files**, we created and tested:

- Ten **21-layer OpenRaster** files: 15 original layers plus six individually hidden expression **draft** overlays
- 60 transparent PNG expression experiments, named `Blink`, `A`, `E`, `O`, `Open`, and `Smile`
- Ten side-by-side original/experimental facial comparison contact strips
- A self-contained, extract-and-open **HTML review app**, with choice of ten people, face/full zoom, split before/after, and short expression animation
- Quality reports and the Python source used to prepare the prototypes

The user has a downloadable ZIP named `QUL_Batch10_21_Layers_Expression_Drafts.zip` in the ChatGPT conversation. **Binary files are NOT committed to this GitHub PR**, and this branch does not change the student application.

## Technical QA

- **10/10** ORA archives structurally valid, with exactly 21 layer entries
- **10/10** neutral merged RGBA pixels match original sources
- **60/60** expression overlay sprites are non-empty, canvas-aligned, and localized to the face
- All six expression layers are **hidden**, by design
- Auditing script: `python scripts/audit-qul-10-expression-drafts.py <extracted-zip-directory>` (requires Pillow and numpy)

## Critical artistic limitations

These are **experimental expressions**, not natural artist-authored vocal phoneme shapes. The mouth overlays currently deform the original lip pixels slightly, without reconstructing the interior for open speech. Blink reconstruction is preliminary. No face, mouth, eye or arm animation is accepted as equal to Salman's original high-quality 42-layer rig.

The original 15-layer Photoshop PSD masters remain in `QUL_Batch10_PSD_ORA_Editable.zip`; the extended 21-layer files are **ORA**, not yet independently re-exported to PSD.

Salman remains untouched, no per-character `rig-approved.json` was added, and nothing was deployed.

## Required next steps for artistic sign-off

1. Replace preliminary eyelids with manually corrected upper/lower lid contours and underpainted eye whites, matching exact original eyelash styling.
2. Author true A/E/O/Open lip geometry and interiors with preserved moustache and skin geometry.
3. Correct head/arm seams, garment folds, fabric texture and hidden hair at 4x detail.
4. Compare animated facial articulation against original Salman.
5. Only then export final PSD and update each approved rig manifest.

**Visual approval count is intentionally zero, despite technical checks passing.**
