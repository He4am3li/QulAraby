# QUL first ten, continuous source-pixel motion QA (2026-11-02)

## Executed

The assistant independently processed the first 10 existing 21-layer ORA portraits from the *already prepared* batch archive, without invoking Work. It produced:

- **20 actual motion pose PNGs**, left and right for each character, using a continuous feathered deformation field instead of rotating hard-cut head/arm sprites.
- **10 original neutral source PNGs**, copied without any regeneration or raster edits.
- **10 comparison images**, showing neutral, left, and right in each row, and a two-column batch contact sheet.
- An **offline HTML review app** with Arabic labels, a character selector, left/neutral/right controls, and playback (three-pose prototype, not smooth production animation).
- JSON reports and two Python scripts used to make and pack the previews.

The deliverable is `QUL_Batch10_Continuous_Original_Motion_QA.zip`, supplied as a downloadable attachment in the ChatGPT conversation; binary assets are **not committed to GitHub**.

## Technical test results

- 10/10 sources preserved as unmodified RGBA originals in the neutral state.
- 20/20 rendered motion previews kept the original source's solid interior covered by pixels, with no source-core transparent holes after a fallback **that reuses original pixels**.
- 9/10 sources use recovered high-resolution assets; `palestine_male` remains at repository cutout resolution.
- Run the repository QA with `python scripts/audit-qul-ten-continuity.py path/to/unzipped/motion_qa`.

## Important interpretation

**Transparent-hole coverage is not the same as high-quality art.** The source-pixel fallback can hide missing alpha but can also cause doubling near the original silhouette, rigid/crowded joints, warped hair, and incorrect fabric folds. The face is NOT independently modelled in this method. Source expressions remain preliminary, not phoneme-correct or Salman-equivalent. The standalone app shows only three reference poses and should never be treated as a Cubism rig.

**Artist approved:** 0/10. **Production approved:** 0/10.

Salman's existing layered renderer and all production student portraits were left untouched. This is a reproducible review artifact to guide detailed manual correction and future real independent rigs.
