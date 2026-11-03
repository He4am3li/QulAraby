# QUL: first 10 continuous animated motion-review rig, 2026-11-02

## Delivered, actual binaries

`QUL10_Interactive_Motion_Review_v3.zip` is provided in the ChatGPT conversation as a downloadable file. It contains a fully **self-contained** `QUL10_Live_Motion_Review.html`, a short animated UAE preview GIF, desktop/mobile screenshots, source builder, quality report, and a headless browser test report.

Opening the HTML file in Chrome or Edge works offline, without a server or Work quota. All ten original source PNGs, three smooth-motion weight masks per character, and six compact **unapproved** facial overlay textures are embedded in the HTML.

## Concrete functionality

- Select 10 original QUL characters.
- Adjust head angle continuously within ±6°.
- Adjust both arms continuously within ±5°.
- Test source-derived eyelid closure, A/E/O/Open/Smile overlays, and a speech-like expression cycle.
- Return to exact source neutral settings, pause/start, and export a PNG of the current frame.
- WebGL path operates at source texture resolution on supported browsers. A real-time Canvas2D fallback runs at reduced preview resolution on devices without WebGL.

## Verification

- Source image RGBA is exactly preserved in the underlying 21-layer OpenRaster for **10/10** characters.
- Automated headless Chromium Canvas2D tests exercised **10/10** characters with genuinely changed motion and genuinely changed mouth pixels, with **zero browser page errors**.
- Mobile page layout and avatar switching tested.
- Builder and generated runtime JavaScript syntax checks passed.
- The actual GPU shader path could not be exercised in the test environment because its container browser disables WebGL. Do NOT describe GPU operation as browser-verified.
- Palestine male still has only its original small image, not an artificially upscaled replacement.

## Important limitations

These remain QA prototypes. Surface-pixel feathered deformation is not independent bones and is not fully painted hidden anatomy. The preliminary blink / lip expressions remain inadequately authored for Salman's standard. The demo does NOT perform phoneme timing from speech audio or Live2D Cubism rigging. **Artwork approvals: 0/10**. `rig-approved.json` manifests are not modified. Salman and production student avatars remain unchanged.

## Rebuild without ChatGPT Work

After obtaining the 21-layer OpenRaster prototype ZIP from the ChatGPT conversation:

```bash
python -m pip install pillow numpy opencv-python-headless
python scripts/build-qul10-live-review.py \
  --archive path/to/QUL_Batch10_21_Layers_Expression_Drafts.zip \
  --template scripts/qul10-live-motion-template.html \
  --output artifacts/qul-ten-live-review
```

The resulting standalone HTML is an inspection/testing tool, not a deployable student tutor component. Do not merge this draft into production to replace Salman's working rig.
