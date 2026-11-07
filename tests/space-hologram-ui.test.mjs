import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const ui = readFileSync(join(root,"components/games/ArabicSpaceJourney.tsx"),"utf8");
const glass = readFileSync(join(root,"components/games/SpaceLaserGlass.tsx"),"utf8");

const missionIndex = ui.indexOf('data-space-screen="laser-hologram-mission"');
const outcomeIndex = ui.indexOf('data-space-screen="laser-hologram-outcome"');
const gameHudIndex = ui.indexOf('aria-label="هدف الرحلة"');
assert(missionIndex >= 0 && outcomeIndex > missionIndex && gameHudIndex > missionIndex, "All hologram views must exist");
const mission = ui.slice(missionIndex, ui.indexOf("</SpaceLaserGlass>",missionIndex));
const outcome = ui.slice(outcomeIndex, ui.indexOf("</SpaceLaserGlass>",outcomeIndex));
const hud = ui.slice(gameHudIndex,ui.indexOf("</SpaceLaserGlass>",gameHudIndex));
for(const [name,code] of [["mission",mission],["outcome",outcome],["flight HUD",hud]]) {
  assert(code.length > 400, name + " must display working data");
  assert(!/<(?:Sparkles|Award|Flame|Zap|Rocket|Shield|Navigation)\b/.test(code), name + " must not show AI-like decorative icons");
  assert(!/[\u{1F300}-\u{1FAFF}]/u.test(code), name + " must not show emoji");
}
assert(mission.includes("typedDistressText") && mission.includes("handleStartMissionFromHologram"),
       "The original transmission and start-mission action must remain functional");
assert(hud.includes("currentChallenge?.prompt") && hud.includes("crystalsCaught"),
       "Live mission goal and crystal count must remain available");
assert(outcome.includes('screen === "victory"') && outcome.includes('screen === "gameover"') === false,
       "The shared result glass must present status-dependent copy");
assert(outcome.includes("setScreen(\"home\")") && outcome.includes("launchFlightGame(activeStage)"),
       "Return and retry buttons must work for both states");
assert(ui.includes('setScreen("victory")') && ui.includes('setScreen("gameover")'),
       "Existing mission progression and loss detection must remain untouched");
assert(ui.includes("saveGame(newSave)"),"Awarded progress must still be persisted");
assert(glass.includes('data-space-laser-glass={variant}'),"Mission and result screens must share one visual foundation");
assert(glass.includes("backdropFilter") && glass.includes("WebkitBackdropFilter"),
       "Use actual frosted Liquid Glass material, not an opaque AI-style card");
assert(glass.includes("rgba(112,221,255,.78)"),"Use the same laser-blue edge light on every game panel");
console.log("Space hologram: mission, in-flight HUD, victory and failure share responsive icon-free laser glass.");
