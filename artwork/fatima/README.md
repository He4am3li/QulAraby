# Fatima Egyptian facial animation

The reviewed 1024x1536 source portrait and all eleven independent PNG facial overlays from `Fatima_ArtPrep_Complete.zip` are included in `public/avatars/`.

The source SHA-256 is `7df96c425276afb3bdad6b6c02c1b75496b17a1a0d5b1b5edf4244028be25d6d`. The renderer preserves the original clothing, veil, hands and feet, and overlays only registered facial patches for blinking, gaze, thinking and smiling.

The spoken mouth reads the shared SpeechLipSync output-audio clock and returns to the original face when playback stops. Vowel classification is approximate, not phoneme timestamp alignment.

Runtime assets:
- `public/avatars/fatima-original.png`
- `public/avatars/fatima-facial-v1.json`
- all 11 PNG overlays in `public/avatars/fatima-layers/`

The editable PSD and offline interactive preview remain available in the original art-preparation archive. They are not required by the runtime renderer.

`npm run test:lip-sync` includes the Fatima asset-integrity, manifest-validation, expression and playback-stop regression tests. It runs as part of prebuild.
