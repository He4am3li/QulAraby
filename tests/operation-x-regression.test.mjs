import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const engine=read('components/games/SecretMissionEngine.ts');
const ui=read('components/games/ArcadeCorridor.tsx');
const gameList=read('pages/Games.tsx');
const styles=read('components/games/SecretMission.css');
const cover=read('public/operation-x-cover.svg');
for(const [name,code] of [['scene',engine],['interface',ui],['catalog',gameList]]){
  const compilation=ts.transpileModule(code,{compilerOptions:{
    jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022
  },reportDiagnostics:true,fileName:name+'.tsx'});
  assert.equal(compilation.diagnostics?.filter(d=>d.category===ts.DiagnosticCategory.Error).length??0,0,name+' must parse');
}
assert.match(gameList,/titleAr: 'العملية X', titleEn: 'Operation X'/);
assert.match(gameList,/operation-x-cover\.svg/);
assert.match(cover,/viewBox="0 0 1200 680"/);
assert.match(ui,/qul-secret-cinematic/);
assert.match(ui,/qul-secret-intro-title/);
assert.match(ui,/onOperatorStatus\(status\)/);
assert.match(ui,/disabled=\{operatorStatus!=='ready'\}/);
assert.match(engine,/heroFallback\.visible=false/);
assert.match(engine,/operatorReady=true/);
assert.match(engine,/events\.onOperatorStatus\?\.\('ready'\)/);
assert.match(engine,/if\(phase!=='intro'\|\|!operatorReady\)return/);
assert.match(engine,/if\(event\.code==='Space'\)\{event\.preventDefault\(\);fire\(\);\}/);
assert.match(engine,/controls\.has\(' '\)\|\|touchTriggerHeld/);
assert.match(engine,/if\(key==='j'&&!event\.repeat\)jump\(\)/);
assert.doesNotMatch(engine,/if\(key==='f'&&!event\.repeat\)fire\(\)/);
assert.doesNotMatch(engine,/if\(event\.code==='Space'&&!event\.repeat\)jump\(\)/);
assert.match(engine,/heroWeapon\.visible=operatorReady/);
assert.match(engine,/folderCover=poly\(pickupModel/);
assert.doesNotMatch(engine,/pickupRing=round\(pickupModel/);
assert.match(engine,/const seat=boss\?null:new THREE\.Group\(\)/);
assert.match(engine,/guard\.readiness=Math\.min\(1,guard\.readiness\+dt\*1\.6\)/);
assert.match(engine,/if\(guard\.readiness<\.95\)continue/);
assert.match(engine,/if\(Math\.random\(\)<chance\)setHealth\(hp-risk\)/);
assert.match(engine,/risk=guard\.isBoss\?24/);
assert.match(engine,/renderer\.shadowMap\.enabled=false/);
assert.match(engine,/for\(const room of rooms\)spawnGuards\(room\)/);
assert.match(styles,/OPERATION X cinematic entry/);
assert.match(ui,/المسطرة إطلاق/);
console.log('Operation X: title, cinematic UI, real model gating, Space fire, dossier loot, guard reaction, lethal damage and performance checks passed.');
