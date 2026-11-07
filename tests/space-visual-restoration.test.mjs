import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const game = readFileSync(join(root,'components/games/ArabicSpaceJourney.tsx'),'utf8');
const hero = 'src/assets/images/toward_space_hero_1790510722610.jpg';
const gameMenu = readFileSync(join(root,'pages/Games.tsx'),'utf8');
assert(gameMenu.includes('cover: towardSpaceOriginalCover') && gameMenu.includes('hero: towardSpaceOriginalCover'), 'The Games catalog must show the same original Toward Space poster');
assert(existsSync(join(root,hero)), 'Restore the original TOWARD SPACE artwork, not a replacement');
assert(game.includes('from "/'+hero+'"'), 'The approved TOWARD SPACE artwork must be imported');
assert(game.includes('data-space-screen="original-toward-space-cover"'), 'The original cover screen is missing');
assert(game.includes('type="button"') && game.includes('انطلق إلى الكواكب'), 'Cover must have an actionable launch button');
assert(game.includes('audio.select(); setScreen("home")'), 'Launch must open the working map directly');
assert(game.includes('setScreen("cover")'), 'Planet map must return to the approved cover');
assert(game.includes('useState<"cover" | "home" | "planet"'), 'New visitors must see original cover');
assert(game.includes('{screen === "home" && ('), 'The planet map must be retained');

const nodesMatch = game.match(/const MAP_NODES: MapPlanetNode\[\] = \[([\s\S]*?)\n\];/);
assert(nodesMatch, 'Planet data must be retained');
assert.equal((nodesMatch[1].match(/^\s+id: "/gm)||[]).length,10,'Keep all ten planets');
const profile = game.match(/const PLANET_DISPLAY_GRADES: Record<string, string> = \{([\s\S]*?)\n\};/);
assert(profile,'Distinct planet color-grade profiles are required');
for(const id of ['sentence','letters','hamza','styles','meanings','morphology','word','syntax','structures','spelling']) {
 assert(profile[1].includes(id + ':'),'Missing color grade for planet ' + id);
}
assert(game.includes('PLANET_DISPLAY_GRADES[node.id]'), 'Apply art direction to visible planet images');
assert(game.includes('cosmicColorBreath'), 'Deep-space grade should include slow atmospheric movement');
assert(game.includes('saturate(.90) contrast(1.09) brightness(.88)'), 'Background should not be overexposed or oversaturated');
assert(game.includes('backgroundColor: "#030714"'), 'Retain the natural deep-midnight color base');
assert(game.includes('handleLaunchToPlanetWithArcPhysics(node.id)'), 'Do not change launch interactions');
assert(game.includes('return PLANET_ATMOSPHERES'), 'Keep planet learning missions unchanged');
console.log('Space: original TOWARD SPACE hero restored, ten planets retained, controlled color grading verified.');
