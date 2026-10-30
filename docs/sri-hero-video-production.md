# QUL, Sri Tech reference implementation, video first

Source: `Sri_Tech_Interactive_Portfolio_Hero_Guide.pdf`, pages 1 to 3.

## Production safety

Do not mount `SriFrameHero` on the public landing until the **real single continuous video** exists, its frames have been extracted and reviewed, and the original landing page is verified unchanged. No SVG stand-in, static render or sprite approximation is acceptable for this feature. The current live landing remains the original.

## Film, one continuous take

Create a 12 second, single-shot, photorealistic cinematic portrait video of ONE friendly professional woman, approximately mid 20s to early 30s, seated at a laptop. Elegant neutral smart casual clothes and a full over-ear headset. Front-facing medium-wide camera, composition fixed for the entire shot. The complete laptop must stay in frame, the full head must remain visible and the upper part of the frame must leave room for website navigation. Same identity, clothes, hair, laptop, lighting, position, surroundings and camera angle throughout. Smooth coherent natural body and facial movements, hands with anatomically correct fingers.

Timeline:
- 0.00 to 1.50, comfortably working on the laptop, gaze down at screen, neutral expression.
- 1.50 to 3.20, notices activity toward screen-left, looks LEFT, settles briefly. No cut.
- 3.20 to 4.90, looks RIGHT, notices a visitor there, settles briefly. No cut.
- 4.90 to 6.00, looks directly into the lens as she notices the visitor in the CENTER, visibly delighted.
- 6.00 to 8.20, with BOTH hands take off the complete headset, lift it over her head and put it around her neck. Headset remains complete and anatomically correct.
- 8.20 to 10.00, warmly waves hello toward the viewer with a natural arm gesture.
- 10.00 to 12.00, points clearly DOWN toward the website section below the hero, smiles and holds the gesture.

NO camera movements, NO zoom, NO cuts, NO scene changes, NO additional person, NO extra hands or fingers, NO disappearing headset, NO camera-follow, NO generated words or logos in the footage. Lighting soft, photographic and consistent. Export 16:9 or slightly tall, high quality, at least 1080p. Use an original character, not a copied real person's identity.

This prompt follows the character action sequence and locked-camera requirement in the uploaded guide. The visual identity around the footage remains QUL-branded.

## Extract frames

Run:
```sh
node scripts/extract-sri-hero-frames.mjs /path/to/one-continuous-video.mp4 scripts/sri-hero-timing.json
```

The extractor creates `public/sri-hero/frame_00001.webp` and successive optimized frames and generates `public/sri-hero/manifest.json`. It never produces synthetic or replacement frames. Verify all frames, especially the headset removal, BEFORE merging.

For a different video duration, adjust the seconds in `sri-hero-timing.json` to actual movement boundaries from the source. Do not guess scene timings. Aim for 12 fps at 900 pixels width, tune if performance requires.

## Browser interaction, exact guide behavior

- Split desktop hero into physical left, center, right thirds.
- Left / right zones select the corresponding video frame sequence, hold for ~2.5 seconds, then return to the working state.
- Center starts the complete greeting sequence (direct gaze, excitement, headset placed on neck, wave, downward indication).
- Do not continuously follow individual pointer positions; the pointer only chooses a zone.
- Animate using `requestAnimationFrame`, updating `HTMLImageElement.src` without per-frame React re-rendering.
- Keep character and complete laptop visually dominant, leave navigation headroom.
- White central glow with maroon / dusty rose edges from reference, while preserving the QUL header, logo, floating Arabic letters, bilingual accessibility and typography.
- Use concise changing small messages, without emojis, plus subtle cursor cue.
- Mobile: central experience only, character centered and large, no horizontal scrolling, original proportions maintained.
- `prefers-reduced-motion`: allow the static work frame and explicit greeting controls without autoplay.

## Integration

1. Generate and inspect the source footage, commit extracted frame folder and `manifest.json` or upload through the reviewed asset pipeline.
2. Import `SriFrameHero` into the original `pages/Landing.tsx`, not a replacement landing. Load the manifest from `/sri-hero/manifest.json` and mount in the top hero section. Keep existing QUL sections, login overlay and authentication unchanged.
3. Wire `onExplore` to scroll down to the original next section.
4. Validate desktop pointer, tablet, mobile and keyboard; check language AR and EN.
5. Check image transfer size, memory usage, frame pacing and no shifted/split character parts in both Chrome and Safari.

Do not merge this unfinished asset-engineering branch before the actual clip exists.
