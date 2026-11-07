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
assert(game.includes('useState<"home" | "planet"'), 'Open the game directly on the planetary map');
assert(!game.includes('data-space-screen="original-toward-space-cover"'), 'Do not add a duplicate landing page');
assert(!game.includes('screen === "cover"') && !game.includes('setScreen("cover")'), 'No interstitial cover state is permitted');
assert(game.includes('{screen === "home" && ('), 'The ten-planet map is the first playable screen');
assert(game.includes('onClick={() => onBack?.()}'), 'The map back button must exit to Games');
assert(game.includes('data-space-map-poster-color-grade'), 'Transfer the TOWARD SPACE atmosphere to the actual planet map');
assert(game.includes('backgroundImage: `url(${towardSpaceOriginalCover})`'), 'The source poster must contribute its colors in the map itself');

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
assert(game.includes('saturate(1.18) contrast(1.10) brightness(1.02)'), 'Restore the vivid teal-violet cinematic color range');
assert(game.includes('radial-gradient(ellipse at 60% 38%, #18225d'), 'Retain the deep luminous-violet cosmic base');
assert(game.includes('handleLaunchToPlanetWithArcPhysics(node.id)'), 'Do not change launch interactions');
assert(game.includes('return PLANET_ATMOSPHERES'), 'Keep planet learning missions unchanged');
console.log('Space: open directly into ten planets, preserve missions, and reuse original cover color in the map.');
