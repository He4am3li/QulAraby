# Independent facial rigs for original QUL dialect characters

The production character component (`components/OriginalPortraitAvatar.tsx`) displays the student's approved full-length original portrait with its original colors and costume.

The extra facial layers are **opt-in**. For each character, approved artwork is stored at:

`public/avatars/original-rigs/<country>/<male|female>/rig-approved.json`

Example:

```json
{
  "status": "approved",
  "source": "cutout.webp",
  "eyesClosed": "eyes-closed.webp",
  "mouthVisible": true,
  "mouth": {
    "A": "mouth-A.webp",
    "E": "mouth-E.webp",
    "O": "mouth-O.webp"
  }
}
```

The layer files must be **transparent full-canvas WEBP images with the same pixel dimensions and placement as `cutout.webp`**. They must contain only the changed eye or mouth region, with hidden skin reconstructed by the artist, not an entire new face or a second character.

The browser loads *all* approved sprites before activating animation. Any absent file, invalid name, draft status, or incomplete mouth set leaves the original portrait unchanged.

For characters wearing a face covering, `mouthVisible` must be `false` and the mouth fields must be omitted. Never animate a hidden mouth over a niqab, mask or other clothing.

The animated states are independent eyelid blinking and approximate speech visemes. These are not claimed to be real phoneme-timed Live2D, since actual audio phoneme timings and reviewed arm/neck reconstructions are not yet supplied.

## Quality acceptance

1. Before applying any manifest, inspect closed eyelid and all mouth variants composited with the original at natural viewing size and at 4x face closeup.
2. Refuse sprites that introduce purple circles, duplicated eyebrows, blank hollow eyes, mouth patches over veils, missing lashes, skin seams, or changed identity.
3. Make sure the open/rest state remains pixel-identical to the original portrait.
4. Do not publish unreviewed auto-generated sprites under approved filenames.
5. Keep Salman's established 42-layer hand-prepared artwork and renderer untouched.

The automatic pilot dated November 2026 confirmed facial landmark positions in eight portraits, but its expression sprites produced visibly incorrect results. They were deliberately not approved. They must not be imported into production, and the absence of facial sprites is preferable to disfiguring a cultural character.
