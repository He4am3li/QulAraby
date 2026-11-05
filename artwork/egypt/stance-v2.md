# Egyptian tutors, relaxed inward-facing stance

Ahmed's body turns toward image left and Fatima's toward image right. Their heads remain frontal for student eye contact. Weight, shoulders, arms and feet are asymmetric rather than posed in a rigid frontal stance. The generated artwork retains the established faces, costumes and colors.

The Egyptian stage keeps Ahmed on the right and Fatima on the left in both interface languages. Eye attention uses this same placement. Other country stages retain their previous language-dependent order.

The v1 authored expressions are registered to the v2 faces rather than discarded. Measured neutral feature correlation is above 0.97 for both faces. Calibration adjusts Ahmed's horizontal eye and mouth registration and Fatima's eye and mouth heights; closed-mouth and resting brow pixels come from the new source. Authored overlay skin tones match the new neutral boundary.

Runtime source and manifest URLs are versioned together so a browser cannot combine cached v1 coordinates with v2 artwork. Both original v1 packages remain available. The v2 body files use lossless WebP with transparency; facial sprites remain PNG.

Rebuild the registered files from the two generated source PNGs with:

```sh
node scripts/register-egypt-stance.cjs AHMED_EDIT.png FATIMA_EDIT.png
```

The normal prebuild lip-sync checks validate the new source hashes and sprite dimensions. Browser review must cover both languages, complete silhouettes, eye attention, blinks, listening, speaking, stop and reduced motion.
