# QUL 43 original-pixel editable artwork batch

## Working output

GitHub Actions workflow: `.github/workflows/build-43-character-artwork.yml`.

1. Checks out the 43 **already approved original cutout WEBPs** directly from the QulAraby repository, with no need for user reuploads or a ChatGPT Work session.
2. Runs a CPU-only face and body landmark detector to propose per-character head, left/right arm, left/right eye, mouth, and torso partitions.
3. Writes 43 **editable OpenRaster (.ora)** source-art files, preserving the original RGBA pixels in the exact neutral pose.
4. Uses only lossless PNGs *within* the archives. The original input is included as a hidden, untouched reference layer, separate from proposed moving layers.
5. Adds a hidden *draft* underpainting, never a published facial replacement.
6. Checks each reconstructed neutral pose pixel by pixel against the input; any visible changed pixel fails the batch.
7. Publishes the archives, previews, and per-character detector and quality reports as a GitHub Actions download artifact.

### Strict limitation

The WEBPs currently in the repo are cropped/resized assets derived from portraits (some as small as ~250 px across). The batch **preserves every available original pixel**, but cannot reconstruct resolution already lost or certify parity with Salman's larger, hand-prepared 42-layer PSD art. Exact match to the uploaded full-resolution source, if that was sharper than the repo asset, requires recovering those full-resolution originals.

The exported facial, neck and arm partitions are **editable starting layers**, not hand-cleaned outlines or approved animation sprites. Automated inpainting can create inaccuracies behind moving parts. The neutral image is pixel-identical, but movement can reveal artifacts. Independent blink and speech visemes still need artist-authored overlays and visual acceptance. Do not label or publish these drafts as PSD, completed Live2D models, or rig-approved.json assets.

### Safe usage

- Download the artifact named `QUL-43-original-pixel-editable-ORA-drafts` from the run.
- Open each .ora in Krita or GIMP, adjust the separation and reconstruct hidden art, then export PSD while keeping the source locked.
- Approve character artwork individually using a 4x face and arm-edge inspection.
- Only then export conservative transparent expression PNG/WEBP layers and `rig-approved.json`.
- Keep Salman and the published portraits untouched until each additional rig passes visual inspection.

## Verified automation outcomes (2026-11-01)

- First successful run produced 43/43 ORA editable drafts and reported **zero changed source pixels in all neutral poses**.
- Face detector improved from 17/43 to **42/43** using pose-guided face crops without altering input pixels.
- Pose landmarks were detected in **42/43**. The remaining Tunisian male requires manual landmarks.
- PSD conversion is a separate GitHub Actions job. It must pass a multilayer and original-reference fidelity audit before a PSD download is described as successful.
- This milestone does NOT imply 42 independently blinking, phoneme-matched, articulated or Live2D-certified characters.
