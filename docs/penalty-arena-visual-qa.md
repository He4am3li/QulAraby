# QUL Penalty Elite, stadium and player validation

## Code / deployment gates
- Run npm run test:penalty-stadium and npm run test:penalty-broadcast, then Vite production build.
- Every stadium model must preserve correct independent colors and numbers for shooter and goalkeeper.

## Visual device validation (manual, not asserted by build)
- Open Goal Challenge on a real iPhone / Android phone and desktop browser. Pick Madrid, then Barcelona as rival.
- Check the back of the kicker's jersey: name and number must be legible left to right with no mirrored glyphs.
- Let the striker run and kick. Lettering should deform with the skinned shirt, not slide separately.
- Switch to the next kicker. Name and number must change without flashing the old name.
- Camera must reveal rich green 3D turf blades near the penalty spot, not a flat green rectangle. Verify highlights don't blow out white shirts.
- Look behind the goal for actual instanced human supporter models, not capsules, polygons or a still image.
- After a correct answer, the near crowd switches to a cheering pose and bounces, then calms down. Test incorrect answers and opponent kicks, too.
- Confirm that the avatar loading curtain still hides unfinished models and that no black frame is exposed.
- Check responsive performance: default target desktop ~60fps, mobile ~30fps. Reduce near-crowd counts and lighting if frame pacing falls below target.
- If the GLB load fails, display a loading error rather than a broken mannequin.

## Artistic limitation
The spectator meshes reuse a CC0 character model already present in the project. More varied faces, photorealistic humans and motion capture need separate source assets and a professional animation pipeline. This work cannot be described as equal to a PlayStation 5 title without device-level visual tests.
