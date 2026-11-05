import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {validateFatimaManifest,planFatimaFrame,paintFatima} from '../services/fatimaFacialRig.mjs';
import {REST_LIPS,SpeechLipSync} from '../services/speechLipSync.mjs';
const manifest=JSON.parse(fs.readFileSync(new URL('../public/avatars/fatima-facial-v1.json',import.meta.url)));
test('Fatima assets have their declared dimensions and retain the reviewed source',()=>{
 assert.ok(validateFatimaManifest(manifest));
 const original=fs.readFileSync(new URL('../public'+manifest.source,import.meta.url));
 assert.equal(crypto.createHash('sha256').update(original).digest('hex'),manifest.sourceSha256);
 for(const l of Object.values(manifest.layers)) {
  const png=fs.readFileSync(new URL('../public'+l.url,import.meta.url));
  assert.equal(png.readUInt32BE(16),l.w); assert.equal(png.readUInt32BE(20),l.h);
  assert.ok(l.y>=100&&l.y+l.h<=230,'expression must stay within face');
 }
});
test('invalid identity, unreviewed assets, traversal and mouth misregistration fail closed',()=>{
 for(const mutate of [m=>m.characterId='libya_female',m=>m.status='draft',m=>delete m.layers.Mouth_FV,
  m=>m.layers.Mouth_A.x++,m=>m.layers.Eyes_Left.url='/avatars/fatima-layers/../other.png',
  m=>m.layers.Blink_L_Closed.w=1024]){const m=structuredClone(manifest);mutate(m);assert.equal(validateFatimaManifest(m),null);}
});
test('complete blinks suppress gaze, invalid inputs remain bounded, idle preserves source',()=>{
 assert.deepEqual(planFatimaFrame(manifest),[]);
 assert.deepEqual(planFatimaFrame(manifest,{blink:NaN,gazeX:Infinity}),[]);
 const commands=planFatimaFrame(manifest,{blink:99,gazeX:-99});
 assert.deepEqual(commands.map(c=>c.name),['Blink_R_Closed','Blink_L_Closed']);
 assert.ok(commands.every(c=>c.alpha===1));
});
test('speaking without playback does not animate lips; stop returns original face',()=>{
 const calls=[];const original={};const sync=new SpeechLipSync();
 const context={drawImage:(...args)=>calls.push(args)};
 paintFatima(context,{original,manifest},{state:'speaking',lips:sync.read()});
 assert.equal(sync.read(),REST_LIPS);assert.equal(calls.length,1);assert.equal(calls[0][0],original);
});
test('Fatima smiles on success and retry without touching clothing',()=>{
 const calls=[];const layer=manifest.layers.Mouth_Smile;const smile={};
 paintFatima({drawImage:(...args)=>calls.push(args)},{original:{},manifest,images:{Mouth_Smile:smile}},{state:'retry'});
 assert.deepEqual(calls[1],[smile,layer.x,layer.y,layer.w,layer.h]);
});
