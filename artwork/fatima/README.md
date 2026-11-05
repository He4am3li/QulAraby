# Fatima Egyptian facial animation, prepared assets awaiting upload

The approved source package is `Fatima_ArtPrep_Complete.zip` (from the owner's ChatGPT Library). The original Work run prepared a 1024x1536 full-body Egyptian female portrait, eleven independent PNG facial layers, an editable PSD, preview, and tests.

The source image has SHA-256 `7df96c425276afb3bdad6b6c02c1b75496b17a1a0d5b1b5edf4244028be25d6d`. The rendering engine preserves the original clothing, veil, hands and feet, and changes only facial expression patches. The spoken mouth follows the actual audio clock via existing SpeechLipSync, with approximate vowel classification rather than phoneme timestamps.

## Required runtime files not yet uploaded

- `public/avatars/fatima-original.png` : `Fatima_Full_Body.png`
- `public/avatars/fatima-layers/` : all 11 `layers/*.png` sprites from the archive.
- `public/avatars/fatima-layered.html` : interactive QA preview (requires its supporting review bundle).
- The optional offline authoring files `Fatima_Editable_Facial_Layers.psd` and `Expression_Source.png` may be retained in the art-preparation archive instead of shipping to the website.

**Do not merge or deploy this branch before the binary runtime assets are uploaded.** An incomplete deploy would replace Fatima with a renderer whose original artwork URL returns 404.

After assets are present, enable `tests/fatima-facial-rig.test.mjs` in the `test:lip-sync` command, run the existing build, verify the actual Egypt female portrait and output-audio lip synchronization, then merge and deploy.
