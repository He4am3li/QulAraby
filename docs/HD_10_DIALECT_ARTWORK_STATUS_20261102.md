# QUL, first 10 original-pixel editable characters, 2026-11-02

This branch records **actual completed local art preparation and independent file checks**, but does NOT change the student application or claim finished Live2D character rigs.

## Characters worked on
`uae_male`, `oman_male`, `kuwait_male`, `syria_male`, `palestine_male`, `algeria_female`, `djibouti_female`, `iraq_female`, `oman_female`, `algeria_male`.

## Source fidelity improvement
- Recovered nine matching high-resolution originals from the user's image Library, mostly **1024 x 1536** (Iraqi female **999 x 1575**).
- Geometrically verified matches to the original repository silhouettes through SIFT and RANSAC before reusing the existing shape masks on full-resolution pixels.
- No matching high-resolution original for `palestine_male` was found in the available Library search; the existing **276 x 762** cutout is retained without artificial enlargement.
- All original reference PNGs are stored intact as locked, hidden reference layers in the source files.

## Actual generated deliverables
- **10 genuine layered PSD files** with **15 editable raster layers** each, verified by external ImageMagick PSD decoding.
- **10 OpenRaster (.ora)** equivalents, each with 15 layers and source PNG reference.
- **10 visual layer previews** plus per-character audit JSON.
- 10/10 neutral OpenRaster original pixel compositing checks passed with **zero changed visible pixels and zero changed alpha pixels**.
- Independently parsed the Photoshop files' compressed layer channels, verified their source reference and all 15 source layers' RGBA pixels match the corresponding ORA images **exactly**.
- ImageMagick compositing of the PSDs preserves source alpha, but renders some semi-transparent RGB edge pixels differently; PSD rendered previews are not advertised as fully pixel identical.

## Important quality limitations

These are **real editing masters, not ten finished Live2D rigs**. The head, arms, hand, brows, and eyes have preliminary source-preserving masks. Head/arm hidden underpaint is a **hidden, unapproved draft**. Natural motion still requires artist corrections of neck, garment, hair and concealed anatomy. There are no approved blinking eyelids, phoneme-matched A/E/O/Open mouth shapes, or expressive live runtime movement for these ten. Salman's 42-layer rig is preserved and unchanged.

The actual binary art packages were generated and made available as **two downloadable ZIP archives attached in the user conversation**, not uploaded to this GitHub repository; do not claim this branch contains the PSD binaries or deployed art. The production application must not load these drafts.

## Next art approval gates
1. Visually correct head and arm boundaries against the high-resolution source.
2. Repaint hidden hair, skin, neck, sleeves and garments under movement.
3. Create source-identity-preserving eyelids and speech visemes.
4. Test facial motion and limbs against Salman at native size and at 400% zoom.
5. Approve and import each complete rig only after a successful motion QA.
